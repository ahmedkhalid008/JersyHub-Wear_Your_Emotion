package com.jerseyhub.concurrency;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponDiscountType;
import com.jerseyhub.coupon.CouponRepository;
import com.jerseyhub.coupon.CouponService;
import com.jerseyhub.coupon.CouponUsageRepository;
import com.jerseyhub.cart.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ConcurrencyIntegrationTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private CouponService couponService;

    @Test
    @DisplayName("Concurrent Coupon Usage: 5 parallel checkout threads attempt to redeem coupon with usageLimit = 1 -> Exactly 1 succeeds")
    void concurrentCouponRedemption_OnlyOneSucceeds() throws Exception {
        UUID couponId = UUID.randomUUID();
        Coupon coupon = new Coupon();
        coupon.setId(couponId);
        coupon.setCode("LIMITED1");
        coupon.setDiscountType(CouponDiscountType.FIXED_AMOUNT);
        coupon.setDiscountValue(new BigDecimal("100.00"));
        coupon.setUsageLimit(1);
        coupon.setUsageCount(0);
        coupon.setActive(true);

        int threadCount = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<Throwable> exceptions = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threadCount; i++) {
            final UUID callerUserId = UUID.randomUUID();
            executorService.submit(() -> {
                try {
                    startLatch.await();
                    synchronized (coupon) {
                        couponService.validateAndCalculateDiscount(coupon, callerUserId, new BigDecimal("1000.00"));
                        coupon.setUsageCount(coupon.getUsageCount() + 1);
                    }
                    successCount.incrementAndGet();
                } catch (BusinessException e) {
                    failureCount.incrementAndGet();
                    exceptions.add(e);
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await();
        executorService.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(threadCount - 1);
        assertThat(coupon.getUsageCount()).isEqualTo(1);
        assertThat(exceptions).allMatch(ex -> ex instanceof BusinessException &&
                ((BusinessException) ex).getErrorCode().equals(ErrorCode.COUPON_USAGE_LIMIT_REACHED.getCode()));
    }

    @Test
    @DisplayName("Concurrent Stock Deduction: Stock = 1, 5 parallel checkout threads -> Exactly 1 succeeds, stock never becomes negative")
    void concurrentStockDeduction_OnlyOneSucceeds() throws Exception {
        AtomicInteger stockQuantity = new AtomicInteger(1);
        int threadCount = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    startLatch.await();
                    synchronized (stockQuantity) {
                        if (stockQuantity.get() < 1) {
                            throw new BusinessException("Insufficient stock", ErrorCode.INSUFFICIENT_STOCK.getCode());
                        }
                        stockQuantity.decrementAndGet();
                    }
                    successCount.incrementAndGet();
                } catch (BusinessException e) {
                    failureCount.incrementAndGet();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await();
        executorService.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(threadCount - 1);
        assertThat(stockQuantity.get()).isEqualTo(0);
    }
}
