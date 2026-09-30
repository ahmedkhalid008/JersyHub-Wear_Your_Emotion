package com.jerseyhub.order;

import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OrderPdfService {

    private static final Logger log = LoggerFactory.getLogger(OrderPdfService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault());

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public OrderPdfService(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public byte[] generateOrderInvoicePdf(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(order.getId());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Color Palette
            Color darkColor = new Color(26, 32, 44);
            Color accentColor = new Color(43, 108, 176);
            Color textColor = new Color(45, 55, 72);
            Color tableHeaderBg = new Color(237, 242, 247);

            // Fonts
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, darkColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, accentColor);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, darkColor);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, textColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textColor);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, darkColor);

            // 1. Header Section
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(PdfPCell.NO_BORDER);
            brandCell.addElement(new Paragraph("JERSEYHUB", brandFont));
            brandCell.addElement(new Paragraph("Official Order Invoice & Receipt", subtitleFont));
            headerTable.addCell(brandCell);

            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(PdfPCell.NO_BORDER);
            metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(new Paragraph("Invoice No: " + order.getOrderNumber(), boldFont));
            metaCell.addElement(new Paragraph("Date: " + (order.getCreatedAt() != null ? DATE_FORMATTER.format(order.getCreatedAt()) : "N/A"), normalFont));
            metaCell.addElement(new Paragraph("Status: " + order.getStatus().name(), boldFont));
            headerTable.addCell(metaCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // 2. Customer & Shipping Address Section
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell customerCell = new PdfPCell();
            customerCell.setBorder(PdfPCell.BOX);
            customerCell.setPadding(8);
            customerCell.addElement(new Paragraph("Customer Information", sectionTitleFont));
            customerCell.addElement(new Paragraph("Name: " + (order.getUser() != null ? order.getUser().getName() : "N/A"), normalFont));
            customerCell.addElement(new Paragraph("Email: " + (order.getUser() != null ? order.getUser().getEmail() : "N/A"), normalFont));
            infoTable.addCell(customerCell);

            PdfPCell shippingCell = new PdfPCell();
            shippingCell.setBorder(PdfPCell.BOX);
            shippingCell.setPadding(8);
            shippingCell.addElement(new Paragraph("Shipping Address (Snapshot)", sectionTitleFont));
            shippingCell.addElement(new Paragraph("Recipient: " + order.getShippingRecipientName(), normalFont));
            shippingCell.addElement(new Paragraph("Phone: " + order.getShippingPhone(), normalFont));
            shippingCell.addElement(new Paragraph("Address: " + order.getShippingAddressLine(), normalFont));
            shippingCell.addElement(new Paragraph("Location: " + order.getShippingArea() + ", " + order.getShippingDistrict() + ", " + order.getShippingDivision(), normalFont));
            if (order.getShippingPostalCode() != null && !order.getShippingPostalCode().isBlank()) {
                shippingCell.addElement(new Paragraph("Postal Code: " + order.getShippingPostalCode(), normalFont));
            }
            infoTable.addCell(shippingCell);

            document.add(infoTable);
            document.add(new Paragraph("\n"));

            // 3. Order Items Table
            document.add(new Paragraph("Order Items", sectionTitleFont));
            document.add(new Paragraph(" "));

            PdfPTable itemTable = new PdfPTable(6);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{35, 18, 10, 10, 13, 14});

            String[] headers = {"Product", "SKU", "Size", "Qty", "Unit Price", "Subtotal"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, boldFont));
                cell.setBackgroundColor(tableHeaderBg);
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemTable.addCell(cell);
            }

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    itemTable.addCell(createTableCell(item.getProductName(), normalFont, Element.ALIGN_LEFT));
                    itemTable.addCell(createTableCell(item.getSku(), normalFont, Element.ALIGN_CENTER));
                    itemTable.addCell(createTableCell(item.getSize(), normalFont, Element.ALIGN_CENTER));
                    itemTable.addCell(createTableCell(String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER));
                    itemTable.addCell(createTableCell(item.getUnitPrice().toPlainString() + " BDT", normalFont, Element.ALIGN_RIGHT));
                    itemTable.addCell(createTableCell(item.getSubtotal().toPlainString() + " BDT", normalFont, Element.ALIGN_RIGHT));
                }
            }
            document.add(itemTable);
            document.add(new Paragraph("\n"));

            // 4. Totals & Payment Details
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55, 45});

            // Payment Details
            PdfPCell paymentCell = new PdfPCell();
            paymentCell.setBorder(PdfPCell.BOX);
            paymentCell.setPadding(8);
            paymentCell.addElement(new Paragraph("Payment Information", sectionTitleFont));
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                paymentCell.addElement(new Paragraph("Gateway: " + payment.getGateway().name(), normalFont));
                paymentCell.addElement(new Paragraph("Transaction ID: " + payment.getTransactionId(), normalFont));
                paymentCell.addElement(new Paragraph("Status: " + payment.getStatus().name(), boldFont));
                if (payment.getPaidAt() != null) {
                    paymentCell.addElement(new Paragraph("Paid At: " + DATE_FORMATTER.format(payment.getPaidAt()), normalFont));
                }
            } else {
                paymentCell.addElement(new Paragraph("Status: PENDING_PAYMENT", boldFont));
                paymentCell.addElement(new Paragraph("No online payment recorded yet.", normalFont));
            }
            summaryTable.addCell(paymentCell);

            // Totals
            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorder(PdfPCell.BOX);
            totalsCell.setPadding(8);
            totalsCell.addElement(new Paragraph("Subtotal: " + order.getSubtotal().toPlainString() + " BDT", normalFont));
            totalsCell.addElement(new Paragraph("Shipping: " + order.getShippingAmount().toPlainString() + " BDT", normalFont));
            if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                totalsCell.addElement(new Paragraph("Discount: -" + order.getDiscountAmount().toPlainString() + " BDT", normalFont));
            }
            totalsCell.addElement(new Paragraph("Grand Total: " + order.getTotalAmount().toPlainString() + " BDT", totalFont));
            summaryTable.addCell(totalsCell);

            document.add(summaryTable);
            document.add(new Paragraph("\n\n"));

            // 5. Footer
            Paragraph footer = new Paragraph("Thank you for your purchase with JerseyHub!\nSupport: support@jerseyhub.com | www.jerseyhub.com", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            log.info("Successfully generated PDF invoice for order: {}", order.getOrderNumber());
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF invoice for order ID: {}", orderId, e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    private PdfPCell createTableCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }
}
