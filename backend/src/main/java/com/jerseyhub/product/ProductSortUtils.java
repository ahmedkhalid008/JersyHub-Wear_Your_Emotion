package com.jerseyhub.product;

import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

public class ProductSortUtils {

    public static Sort resolveSort(String sortKey) {
        if (!StringUtils.hasText(sortKey)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sortKey.trim().toLowerCase()) {
            case "priceasc", "price_asc" -> Sort.by(Sort.Direction.ASC, "basePrice");
            case "pricedesc", "price_desc" -> Sort.by(Sort.Direction.DESC, "basePrice");
            case "nameasc", "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "namedesc", "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
