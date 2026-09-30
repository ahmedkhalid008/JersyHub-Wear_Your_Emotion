package com.jerseyhub.product.service;

import com.jerseyhub.category.Category;
import com.jerseyhub.category.CategoryRepository;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.product.ProductSortUtils;
import com.jerseyhub.product.ProductSpecification;
import com.jerseyhub.product.dto.ProductCreateRequest;
import com.jerseyhub.product.dto.ProductDetailResponse;
import com.jerseyhub.product.dto.ProductSummaryResponse;
import com.jerseyhub.product.dto.ProductUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ProductDetailResponse createProduct(ProductCreateRequest request) {
        String normalizedSlug = normalizeSlug(request.slug());

        if (productRepository.existsBySlug(normalizedSlug)) {
            throw new BusinessException("Product slug already exists", ErrorCode.DUPLICATE_SLUG.getCode());
        }

        Product product = new Product();
        product.setName(request.name().trim());
        product.setSlug(normalizedSlug);
        product.setDescription(request.description());
        product.setBrand(request.brand());
        product.setTeam(request.team());
        product.setLeague(request.league());
        product.setCountry(request.country());
        product.setSeason(request.season());
        product.setJerseyType(request.jerseyType());
        product.setAuthenticity(request.authenticity());
        product.setMaterial(request.material());
        product.setBasePrice(request.basePrice());
        product.setActive(true); // Default to active
        product.setFeatured(Boolean.TRUE.equals(request.featured()));

        if (request.categoryIds() != null && !request.categoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(request.categoryIds());
            product.setCategories(new HashSet<>(categories));
        }

        Product savedProduct = productRepository.save(product);
        return ProductDetailResponse.from(savedProduct);
    }

    @Transactional
    public ProductDetailResponse updateProduct(UUID id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String normalizedSlug = normalizeSlug(request.slug());

        if (!product.getSlug().equalsIgnoreCase(normalizedSlug) && productRepository.existsBySlug(normalizedSlug)) {
            throw new BusinessException("Product slug already exists", ErrorCode.DUPLICATE_SLUG.getCode());
        }

        product.setName(request.name().trim());
        product.setSlug(normalizedSlug);
        product.setDescription(request.description());
        product.setBrand(request.brand());
        product.setTeam(request.team());
        product.setLeague(request.league());
        product.setCountry(request.country());
        product.setSeason(request.season());
        product.setJerseyType(request.jerseyType());
        product.setAuthenticity(request.authenticity());
        product.setMaterial(request.material());
        product.setBasePrice(request.basePrice());
        product.setFeatured(Boolean.TRUE.equals(request.featured()));

        if (request.categoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.categoryIds());
            product.setCategories(new HashSet<>(categories));
        }

        Product updatedProduct = productRepository.save(product);
        return ProductDetailResponse.from(updatedProduct);
    }

    @Transactional
    public ProductDetailResponse updateProductStatus(UUID id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setActive(active);
        Product savedProduct = productRepository.save(product);
        return ProductDetailResponse.from(savedProduct);
    }

    @Transactional
    public ProductDetailResponse updateProductCategories(UUID id, Set<UUID> categoryIds) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Category> categories = categoryRepository.findAllById(categoryIds);
        product.setCategories(new HashSet<>(categories));

        Product savedProduct = productRepository.save(product);
        return ProductDetailResponse.from(savedProduct);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getPublicProducts(
            String search,
            String categorySlug,
            String brand,
            String team,
            String league,
            String season,
            JerseyType jerseyType,
            JerseyAuthenticity authenticity,
            Boolean featured,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortKey,
            int page,
            int size
    ) {
        // Enforce max page size limit
        int boundedSize = Math.min(Math.max(size, 1), 100);
        Sort sort = ProductSortUtils.resolveSort(sortKey);
        Pageable pageable = PageRequest.of(Math.max(page, 0), boundedSize, sort);

        Specification<Product> spec = ProductSpecification.filterProducts(
                true, search, categorySlug, brand, team, league, season, jerseyType, authenticity, featured, minPrice, maxPrice
        );

        Page<ProductSummaryResponse> productPage = productRepository.findAll(spec, pageable)
                .map(ProductSummaryResponse::from);

        return PageResponse.from(productPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getAdminProducts(
            Boolean active,
            String search,
            String categorySlug,
            String brand,
            String team,
            String league,
            String season,
            JerseyType jerseyType,
            JerseyAuthenticity authenticity,
            Boolean featured,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortKey,
            int page,
            int size
    ) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        Sort sort = ProductSortUtils.resolveSort(sortKey);
        Pageable pageable = PageRequest.of(Math.max(page, 0), boundedSize, sort);

        Specification<Product> spec = ProductSpecification.filterProducts(
                active, search, categorySlug, brand, team, league, season, jerseyType, authenticity, featured, minPrice, maxPrice
        );

        Page<ProductSummaryResponse> productPage = productRepository.findAll(spec, pageable)
                .map(ProductSummaryResponse::from);

        return PageResponse.from(productPage);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(UUID id, boolean publicOnly) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (publicOnly && !product.isActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        return ProductDetailResponse.from(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlug(String slug, boolean publicOnly) {
        String normalizedSlug = normalizeSlug(slug);
        Product product = productRepository.findBySlug(normalizedSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (publicOnly && !product.isActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        return ProductDetailResponse.from(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    private String normalizeSlug(String slug) {
        return slug != null ? slug.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-") : "";
    }
}
