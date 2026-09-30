package com.jerseyhub.common;

import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.service.AuthService;
import com.jerseyhub.category.controller.CategoryAdminController;
import com.jerseyhub.category.controller.CategoryPublicController;
import com.jerseyhub.category.dto.CategoryResponse;
import com.jerseyhub.category.service.CategoryService;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.inventory.controller.InventoryAdminController;
import com.jerseyhub.inventory.service.InventoryService;
import com.jerseyhub.product.controller.ProductAdminController;
import com.jerseyhub.product.controller.ProductPublicController;
import com.jerseyhub.product.service.ProductImageService;
import com.jerseyhub.product.service.ProductService;
import com.jerseyhub.product.service.ProductVariantService;
import com.jerseyhub.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        CategoryPublicController.class,
        CategoryAdminController.class,
        ProductPublicController.class,
        ProductAdminController.class,
        InventoryAdminController.class
})
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class})
class Phase4SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private ProductVariantService variantService;

    @MockitoBean
    private ProductImageService imageService;

    @MockitoBean
    private InventoryService inventoryService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("GET /api/v1/categories - Should be accessible by anonymous users")
    void getCategories_Anonymous_Allowed() throws Exception {
        given(categoryService.getActiveCategoryTree()).willReturn(List.of());

        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/v1/admin/categories - Should reject unauthenticated anonymous requests with 401")
    void adminCategory_Anonymous_Returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/admin/categories - Should reject CUSTOMER user with 403 Forbidden")
    @WithMockUser(roles = "CUSTOMER")
    void adminCategory_CustomerUser_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/admin/products - Should reject CUSTOMER user with 403 Forbidden")
    @WithMockUser(roles = "CUSTOMER")
    void adminProduct_CustomerUser_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}
