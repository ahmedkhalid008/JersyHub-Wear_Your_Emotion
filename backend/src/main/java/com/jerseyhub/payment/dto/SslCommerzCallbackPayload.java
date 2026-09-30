package com.jerseyhub.payment.dto;

public record SslCommerzCallbackPayload(
    String status,
    String tran_id,
    String val_id,
    String amount,
    String currency,
    String store_amount,
    String card_type,
    String bank_tran_id,
    String tran_date,
    String error
) {}
