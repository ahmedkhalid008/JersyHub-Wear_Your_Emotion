package com.jerseyhub.product;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            Boolean activeOnly,
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
            BigDecimal maxPrice
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Boolean.TRUE.equals(activeOnly)) {
                predicates.add(cb.equal(root.get("active"), true));
            }

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate teamMatch = cb.like(cb.lower(root.get("team")), searchPattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate leagueMatch = cb.like(cb.lower(root.get("league")), searchPattern);

                predicates.add(cb.or(nameMatch, teamMatch, brandMatch, leagueMatch));
            }

            if (StringUtils.hasText(categorySlug)) {
                Join<Object, Object> categoriesJoin = root.join("categories", JoinType.INNER);
                predicates.add(cb.equal(cb.lower(categoriesJoin.get("slug")), categorySlug.trim().toLowerCase()));
            }

            if (StringUtils.hasText(brand)) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }

            if (StringUtils.hasText(team)) {
                predicates.add(cb.equal(cb.lower(root.get("team")), team.trim().toLowerCase()));
            }

            if (StringUtils.hasText(league)) {
                predicates.add(cb.equal(cb.lower(root.get("league")), league.trim().toLowerCase()));
            }

            if (StringUtils.hasText(season)) {
                predicates.add(cb.equal(cb.lower(root.get("season")), season.trim().toLowerCase()));
            }

            if (jerseyType != null) {
                predicates.add(cb.equal(root.get("jerseyType"), jerseyType));
            }

            if (authenticity != null) {
                predicates.add(cb.equal(root.get("authenticity"), authenticity));
            }

            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
