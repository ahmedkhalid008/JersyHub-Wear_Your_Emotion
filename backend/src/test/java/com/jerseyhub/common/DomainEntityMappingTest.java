package com.jerseyhub.common;

import com.jerseyhub.category.Category;
import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponDiscountType;
import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DomainEntityMappingTest {

    @Test
    void testUserEntityInstantiation() {
        User user = new User("John Doe", "john.doe@example.com", "hashed_password", UserRole.CUSTOMER);
        assertThat(user.getName()).isEqualTo("John Doe");
        assertThat(user.getEmail()).isEqualTo("john.doe@example.com");
        assertThat(user.getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    void testCategoryEntityInstantiation() {
        Category category = new Category("Club Jerseys", "club-jerseys");
        assertThat(category.getName()).isEqualTo("Club Jerseys");
        assertThat(category.getSlug()).isEqualTo("club-jerseys");
        assertThat(category.isActive()).isTrue();
    }

    @Test
    void testProductAndVariantEntitiesInstantiation() {
        Product product = new Product();
        product.setName("Real Madrid Home Jersey 2024/25");
        product.setSlug("real-madrid-home-2024-25");
        product.setJerseyType(JerseyType.HOME);
        product.setAuthenticity(JerseyAuthenticity.AUTHENTIC);
        product.setBasePrice(new BigDecimal("120.00"));

        ProductVariant variant = new ProductVariant(product, "RM-HM-24-M", JerseySize.M, new BigDecimal("120.00"), 50);

        assertThat(product.getName()).contains("Real Madrid");
        assertThat(variant.getSku()).isEqualTo("RM-HM-24-M");
        assertThat(variant.getSize()).isEqualTo(JerseySize.M);
    }

    @Test
    void testCouponEntityInstantiation() {
        Coupon coupon = new Coupon();
        coupon.setCode("WELCOME10");
        coupon.setDiscountType(CouponDiscountType.PERCENTAGE);
        coupon.setDiscountValue(new BigDecimal("10.00"));

        assertThat(coupon.getCode()).isEqualTo("WELCOME10");
        assertThat(coupon.getDiscountType()).isEqualTo(CouponDiscountType.PERCENTAGE);
    }
}
