/**
 * ALCHAPONE — Redesign Core Engine (Mobile-First High-Conversion Edition)
 * Controls all premium layout interactive components, animations, and dynamics.
 */

'use strict';

// ==============================================
// CONFIGURATION & SETUP
// ==============================================
const WA_NUMBER = "6281234567890"; // Target WhatsApp Business number (with country code, no '+')

// Device & Preference Detection
const IS_TOUCH = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const IS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Third-party API availability
const HAS_GSAP = typeof gsap !== 'undefined';
const HAS_ST = HAS_GSAP && typeof ScrollTrigger !== 'undefined';
const HAS_SPLIT = HAS_GSAP && typeof SplitText !== 'undefined';
const HAS_LENIS = typeof Lenis !== 'undefined';

// Register GSAP components per best practices
if (HAS_GSAP) {
    const plugins = [HAS_ST && ScrollTrigger, HAS_SPLIT && SplitText].filter(Boolean);
    if (plugins.length) gsap.registerPlugin(...plugins);
}

// Global UI State
const STATE = {
    selectedQty: 1,
    selectedPrice: 99000,
    selectedDesc: "1 Bundle — Rp 99.000",
    selectedSaving: 0,
    stockCount: 23
};

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    const initSafe = (name, fn) => {
        try {
            fn();
        } catch (e) {
            console.error(`Error initializing ${name}:`, e);
        }
    };

    initSafe('LenisScroll', initLenisSmoothScroll);
    initSafe('CustomCursor', initCustomCursor);
    initSafe('HeroIntro', initHeroIntroAnimations);
    initSafe('ScrollReveals', initScrollReveals);
    initSafe('InteractiveSlider', initInteractiveSlider);
    initSafe('CountdownTimer', initCountdownTimer);
    initSafe('StockDecrementer', initStockDecrementer);
    initSafe('ToasterNotifications', initToasterNotifications);
    initSafe('BottomSheetDrawer', initBottomSheetDrawer);
});

// ==============================================
// 1. LENIS SMOOTH SCROLL (Desktop / Performance)
// ==============================================
let lenis;
function initLenisSmoothScroll() {
    if (!IS_TOUCH && !IS_REDUCED && HAS_LENIS) {
        lenis = new Lenis({
            lerp: 0.08,
            smoothTouch: false
        });

        if (HAS_GSAP) {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            const lenisRaf = (t) => {
                lenis.raf(t);
                requestAnimationFrame(lenisRaf);
            };
            requestAnimationFrame(lenisRaf);
        }
    }
    
    // Wire premium smooth scroll anchor overrides
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            
            const offset = 80; // Offset for floating nav bar
            if (lenis) {
                lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
            } else {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==============================================
// 2. CUSTOM DESKTOP HOVER CURSOR
// ==============================================
function initCustomCursor() {
    const $dot = document.getElementById('cursorDot');
    const $ring = document.getElementById('cursorRing');

    if (!IS_TOUCH && $dot && $ring) {
        document.body.classList.add('custom-cursor-active');
        let mx = 0, my = 0, rx = 0, ry = 0;
        const LERP = 0.12;

        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            $dot.style.left = mx + 'px';
            $dot.style.top = my + 'px';
        });

        const animRing = () => {
            rx += (mx - rx) * LERP;
            ry += (my - ry) * LERP;
            $ring.style.left = rx + 'px';
            $ring.style.top = ry + 'px';
            requestAnimationFrame(animRing);
        };
        requestAnimationFrame(animRing);

        // Add interactive hover scale classes to various trigger selectors
        const triggers = 'a, button, select, input, textarea, .product-card, .pain-item, .bento-card, .bundle-card, .value-card, .qty-chip';
        document.querySelectorAll(triggers).forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
        });

        document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
        document.addEventListener('mouseup', () => document.body.classList.remove('cur-click'));
    }
}

// ==============================================
// 3. GSAP SIGNATURE HERO INTRO ANIMATION
// ==============================================
function initHeroIntroAnimations() {
    const $heroH = document.getElementById('heroH');
    const $heroEyebrow = document.getElementById('heroEyebrow');
    const $heroMeta = document.getElementById('heroMeta');
    const $heroSub = document.getElementById('heroSub');
    const $heroActions = document.getElementById('heroActions');
    const $heroProof = document.getElementById('heroProof');
    const $scrollArrow = document.getElementById('scrollArrow');

    if (!IS_REDUCED && HAS_GSAP) {
        // If SplitText is available, run premium line masked reveals
        if (HAS_SPLIT) {
            const heroSplit = SplitText.create($heroH, {
                type: 'lines',
                mask: 'lines',
                autoSplit: true,
                onSplit(self) {
                    return gsap.from(self.lines, {
                        yPercent: 110,
                        duration: 1.2,
                        ease: 'expo.out',
                        stagger: 0.08,
                        delay: 0.3
                    });
                }
            });

            const heroTl = gsap.timeline({ delay: 0.45 });
            heroTl
                .to($heroEyebrow, { opacity: 1, x: 0, duration: 0.85, ease: 'expo.out' })
                .to($heroMeta,    { opacity: 1, y: 0, duration: 0.7,  ease: 'expo.out' }, '-=0.55')
                .to($heroSub,     { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out' }, '-=0.5')
                .to($heroActions, { opacity: 1, y: 0, duration: 0.65, ease: 'expo.out' }, '-=0.45')
                .to($heroProof,   { opacity: 1, y: 0, duration: 0.6,  ease: 'expo.out' }, '-=0.35')
                .to($scrollArrow, { opacity: 1,       duration: 0.6,  ease: 'expo.out' }, '-=0.2');
        } else {
            // GSAP default fade & slide reveals
            const heroTl = gsap.timeline({ delay: 0.25 });
            heroTl
                .from($heroH,      { opacity: 0, y: 30, duration: 1.1, ease: 'expo.out' })
                .to($heroEyebrow,  { opacity: 1, x: 0, duration: 0.85, ease: 'expo.out' }, '-=0.7')
                .to($heroMeta,     { opacity: 1, y: 0, duration: 0.7,  ease: 'expo.out' }, '-=0.55')
                .to($heroSub,      { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out' }, '-=0.5')
                .to($heroActions,  { opacity: 1, y: 0, duration: 0.65, ease: 'expo.out' }, '-=0.45')
                .to($heroProof,    { opacity: 1, y: 0, duration: 0.6,  ease: 'expo.out' }, '-=0.35')
                .to($scrollArrow,  { opacity: 1,       duration: 0.6,  ease: 'expo.out' }, '-=0.2');
        }
        
        // Setup magnetic button movement mechanisms on hover
        if (!IS_TOUCH) {
            document.querySelectorAll('.magnetic').forEach(btn => {
                btn.addEventListener('mousemove', e => {
                    const r = btn.getBoundingClientRect();
                    const dx = e.clientX - (r.left + r.width / 2);
                    const dy = e.clientY - (r.top + r.height / 2);
                    gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.4, ease: 'power2.out' });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.48)' });
                });
            });
        }
    } else {
        // Fast instant fallback (reduced-motion, low spec)
        [$heroH, $heroEyebrow, $heroMeta, $heroSub, $heroActions, $heroProof, $scrollArrow].forEach(el => {
            if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
        });
    }
}

// ==============================================
// 4. SCROLLTRIGGER & INTERSECTION OBSERVER REVEALS
// ==============================================
function initScrollReveals() {
    const revEls = document.querySelectorAll('.rev, .rev-l, .rev-s');

    if (!IS_REDUCED && HAS_ST) {
        revEls.forEach(el => {
            const isRevL = el.classList.contains('rev-l');
            const isRevS = el.classList.contains('rev-s');
            
            const fromVars = isRevL 
                ? { opacity: 0, x: -25 } 
                : isRevS 
                    ? { opacity: 0, y: 16, scale: 0.98 } 
                    : { opacity: 0, y: 30 };

            const delayStr = el.style.transitionDelay || '0s';
            const delay = parseFloat(delayStr) || 0;

            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        ...fromVars,
                        opacity: 1,
                        x: 0, y: 0,
                        scale: 1,
                        duration: 0.85,
                        delay: delay,
                        ease: 'expo.out'
                    });
                }
            });
        });

        // Floating Nav Scroll State Class
        const $nav = document.getElementById('mainNav');
        ScrollTrigger.create({
            start: '60px top',
            onEnter: () => $nav.classList.add('scrolled'),
            onLeaveBack: () => $nav.classList.remove('scrolled'),
            onUpdate: self => {
                if (self.scroll() <= 60) $nav.classList.remove('scrolled');
            }
        });

        // Sticky CTA Floating Bar Trigger
        const $stickyCta = document.getElementById('stickyCta');
        ScrollTrigger.create({
            start: '35% top',
            end: '95% bottom',
            onEnter: () => $stickyCta.classList.add('visible'),
            onLeave: () => $stickyCta.classList.remove('visible'),
            onEnterBack: () => $stickyCta.classList.add('visible'),
            onLeaveBack: () => $stickyCta.classList.remove('visible')
        });

        // SplitText reveal for Benefits Section Header
        if (HAS_SPLIT) {
            ScrollTrigger.create({
                trigger: '.why-left',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    const $whyH = document.querySelector('.why-left .section-headline');
                    if ($whyH) {
                        SplitText.create($whyH, {
                            type: 'lines',
                            mask: 'lines',
                            onSplit(self) {
                                return gsap.from(self.lines, {
                                    yPercent: 110,
                                    duration: 0.95,
                                    stagger: 0.08,
                                    ease: 'expo.out',
                                    delay: 0.05
                                });
                            }
                        });
                    }
                }
            });
        }
    } else {
        // Fallback to standard intersection observer for low performance
        const handleScroll = () => {
            const scrolled = window.scrollY > 60;
            const $nav = document.getElementById('mainNav');
            const $stickyCta = document.getElementById('stickyCta');
            
            if ($nav) $nav.classList.toggle('scrolled', scrolled);
            
            if ($stickyCta) {
                const show = window.scrollY > window.innerHeight * 0.35
                          && window.scrollY < document.body.scrollHeight - window.innerHeight - 200;
                $stickyCta.classList.toggle('visible', show);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('done');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        
        revEls.forEach(el => io.observe(el));
    }
}

// ==============================================
// 5. TOUCH CAROUSEL CARDS REDESIGN WITH PAGINATION
// ==============================================
function initInteractiveSlider() {
    const $carousel = document.getElementById('productCarousel');
    const $dots = document.querySelectorAll('#carouselDots .slider-dot');
    const $cards = document.querySelectorAll('#productCarousel .product-card');

    if (!$carousel || $dots.length === 0 || $cards.length === 0) return;

    let activeIdx = 0;

    // Detect center active item in mobile snapping carousels
    const updateActiveDot = () => {
        const carouselRect = $carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;

        let closestIdx = 0;
        let minDiff = Infinity;

        $cards.forEach((card, idx) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const diff = Math.abs(carouselCenter - cardCenter);

            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
            }
        });

        if (closestIdx !== activeIdx) {
            activeIdx = closestIdx;
            
            $dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIdx);
            });

            $cards.forEach((card, idx) => {
                card.classList.toggle('active-snap', idx === activeIdx);
            });
        }
    };

    // Listen to touch swipe scrolls
    $carousel.addEventListener('scroll', () => {
        // Debounce / throttle calculations in animation frame
        requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    // Initial load sync check
    updateActiveDot();

    // Bind indicator clicks
    $dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const card = $cards[index];
            if (!card) return;

            const carouselLeft = $carousel.getBoundingClientRect().left;
            const cardLeft = card.getBoundingClientRect().left;
            const targetScroll = $carousel.scrollLeft + (cardLeft - carouselLeft) - ($carousel.clientWidth - card.clientWidth) / 2;

            $carousel.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        });
    });
}

// ==============================================
// 6. PERSISTENT COUNTDOWN TIMER
// ==============================================
function initCountdownTimer() {
    const PERSIST_KEY = 'alchapone_drop_countdown';
    let endTime = localStorage.getItem(PERSIST_KEY);

    if (!endTime) {
        // First visit set to 48 Hours
        endTime = Date.now() + (48 * 3600 * 1000);
        localStorage.setItem(PERSIST_KEY, endTime);
    } else {
        endTime = parseInt(endTime, 10);
        // If countdown expired previously, trigger a fresh 6-hour urgency block
        if (endTime < Date.now()) {
            endTime = Date.now() + (6 * 3600 * 1000);
            localStorage.setItem(PERSIST_KEY, endTime);
        }
    }

    const $h = document.getElementById('cd-h');
    const $m = document.getElementById('cd-m');
    const $s = document.getElementById('cd-s');

    const updateTimer = () => {
        const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;

        if ($h) $h.textContent = String(h).padStart(2, '0');
        if ($m) $m.textContent = String(m).padStart(2, '0');
        if ($s) $s.textContent = String(s).padStart(2, '0');

        if (diff <= 0) {
            // Reset automatically to drive continuous action
            endTime = Date.now() + (4 * 3600 * 1000);
            localStorage.setItem(PERSIST_KEY, endTime);
        }
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// ==============================================
// 7. INTERACTIVE DYNAMIC STOCK COUNTER
// ==============================================
function initStockDecrementer() {
    const STORAGE_STOCK_KEY = 'alchapone_stock_cache';
    let currentStock = localStorage.getItem(STORAGE_STOCK_KEY);

    if (!currentStock) {
        currentStock = 23; // Starting cache
        localStorage.setItem(STORAGE_STOCK_KEY, currentStock);
    } else {
        currentStock = parseInt(currentStock, 10);
        // Reset if it drops too low (preventing out of stock blocks)
        if (currentStock <= 3) {
            currentStock = 23;
            localStorage.setItem(STORAGE_STOCK_KEY, currentStock);
        }
    }

    STATE.stockCount = currentStock;

    // Apply values to UI nodes
    const syncStockUI = () => {
        document.querySelectorAll('.stockVal').forEach(el => {
            el.textContent = STATE.stockCount;
        });

        document.querySelectorAll('.purchaserVal').forEach(el => {
            el.textContent = 100 - STATE.stockCount;
        });

        // Set visual progress bar widths
        const $fill = document.getElementById('stockBarFill');
        if ($fill) {
            $fill.style.width = STATE.stockCount + '%';
        }
    };

    syncStockUI();

    // Trigger slow randomized stock drop interval to create excitement
    const decreaseInterval = () => {
        if (STATE.stockCount > 4) {
            const drops = Math.random() > 0.75 ? 2 : 1;
            STATE.stockCount = Math.max(4, STATE.stockCount - drops);
            localStorage.setItem(STORAGE_STOCK_KEY, STATE.stockCount);
            
            syncStockUI();
        }
        
        // Queue next decrement dynamically between 40 to 90 seconds
        const nextTime = (Math.random() * 50 + 40) * 1000;
        setTimeout(decreaseInterval, nextTime);
    };

    // Queue first decrease
    setTimeout(decreaseInterval, 45000);
}

// ==============================================
// 8. SIMULATED TOAST PURCHASER ALERTS
// ==============================================
function initToasterNotifications() {
    const NAMES = ["Rizal", "Dika", "Faisal", "Kevin", "Rian", "Aditya", "Bayu", "Farhan", "Budi", "Fikri", "Bayu", "Yusuf", "Dimas", "Hendra", "Dani"];
    const CITIES = ["Bandung", "Jakarta", "Surabaya", "Yogyakarta", "Semarang", "Malang", "Tangerang", "Bekasi", "Depok", "Solo", "Medan", "Makassar"];
    const TIMES = ["baru saja", "1m yang lalu", "2m yang lalu", "30s yang lalu", "10s yang lalu"];

    const $toaster = document.getElementById('toasterStack');
    if (!$toaster) return;

    const createPurchaseToast = () => {
        // Prevent toast storms, max 1 active toast at a time on mobile viewport
        if ($toaster.children.length > 0) return;

        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const time = TIMES[Math.floor(Math.random() * TIMES.length)];
        const qty = Math.random() > 0.82 ? 2 : 1;

        // Custom short initial characters for avatar blocks
        const initial = name.substring(0, 2).toUpperCase();

        const toast = document.createElement('div');
        toast.className = 'purchaser-toast';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-avatar" aria-hidden="true">${initial}</div>
            <div class="toast-details">
                <span class="toast-message"><strong>${name}</strong> (${city}) secure <strong>${qty} Bundle</strong>! 🔥</span>
                <span class="toast-time">${time}</span>
            </div>
        `;

        $toaster.appendChild(toast);

        // Slide In
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Slide Out & Dispose after display
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 6000);
    };

    // Cycle purchaser toasts randomly every 20-35 seconds
    const queueNextToast = () => {
        createPurchaseToast();
        const nextInterval = (Math.random() * 15 + 20) * 1000;
        setTimeout(queueNextToast, nextInterval);
    };

    // Trigger initial notification delay
    setTimeout(queueNextToast, 12000);
}

// ==============================================
// 9. NATIVE BOTTOM SHEET DRAWER & CALCULATOR
// ==============================================
function initBottomSheetDrawer() {
    const $overlay = document.getElementById('sheetOverlay');
    const $sheet = document.getElementById('checkoutSheet');
    const $closeBtn = document.getElementById('sheetCloseBtn');
    
    if (!$overlay || !$sheet || !$closeBtn) return;

    // Toggle drawer mechanisms
    const openSheet = () => {
        $overlay.classList.add('active');
        $sheet.classList.add('open');
        document.body.style.overflow = 'hidden'; // Stop body parsing scroll leakage
        
        // Auto focus customer details on load
        setTimeout(() => {
            const $nameInput = document.getElementById('sheet-name');
            if ($nameInput) $nameInput.focus();
        }, 350);
    };

    const closeSheet = () => {
        $overlay.classList.remove('active');
        $sheet.classList.remove('open');
        document.body.style.overflow = ''; // Resume scrolling
    };

    // Bind triggers to all elements with class .open-checkout-btn
    document.querySelectorAll('.open-checkout-btn').forEach(btn => {
        btn.addEventListener('click', openSheet);
    });

    // Close Actions
    $closeBtn.addEventListener('click', closeSheet);
    $overlay.addEventListener('click', closeSheet);

    // Dynamic Swipe Down Gesture to close sheet
    let startY = 0;
    let currentY = 0;
    
    $sheet.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    $sheet.addEventListener('touchmove', e => {
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;

        // Pull down threshold
        if (diffY > 0 && $sheet.scrollTop <= 0) {
            $sheet.style.transform = `translate(-50%, ${diffY}px)`;
        }
    }, { passive: true });

    $sheet.addEventListener('touchend', e => {
        const diffY = currentY - startY;
        $sheet.style.transform = ''; // Clear inline translate shifts

        if (diffY > 150 && $sheet.scrollTop <= 0) {
            closeSheet();
        }
        startY = 0;
        currentY = 0;
    });

    // Quantity selector chip listeners inside sheet drawer
    const $chips = document.querySelectorAll('#qtyChips .qty-chip');
    
    $chips.forEach(chip => {
        chip.addEventListener('click', () => {
            $chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Gather attributes
            STATE.selectedQty = parseInt(chip.getAttribute('data-qty'), 10);
            STATE.selectedPrice = parseInt(chip.getAttribute('data-price'), 10);
            STATE.selectedSaving = parseInt(chip.getAttribute('data-saving'), 10);
            STATE.selectedDesc = chip.getAttribute('data-desc');

            updateCheckoutTotals();
        });
    });
}

// Live price updates inside checkout sheet
function updateCheckoutTotals() {
    const $qtyText = document.getElementById('summaryQtyText');
    const $savingRow = document.getElementById('summarySavingRow');
    const $savingText = document.getElementById('summarySavingText');
    const $totalPrice = document.getElementById('summaryTotalPrice');
    const $origPrice = document.getElementById('summaryOrigPrice');

    if ($qtyText) $qtyText.textContent = `${STATE.selectedQty} Bundle`;
    
    if ($totalPrice) {
        $totalPrice.textContent = 'Rp ' + STATE.selectedPrice.toLocaleString('id-ID');
    }

    if ($origPrice) {
        const basePrice = 299000 * STATE.selectedQty;
        $origPrice.textContent = 'Rp ' + basePrice.toLocaleString('id-ID');
    }

    if ($savingRow && $savingText) {
        if (STATE.selectedSaving > 0) {
            $savingText.textContent = 'Hemat Rp ' + STATE.selectedSaving.toLocaleString('id-ID');
            $savingRow.style.display = 'flex';
        } else {
            $savingRow.style.display = 'none';
        }
    }
}

// ==============================================
// 10. FORM SUBMISSION & WHATSAPP REDIRECTS
// ==============================================

// Helper: Custom high-fidelity client input validator
function validateCheckoutInputs(elements) {
    let isValid = true;

    elements.forEach(el => {
        const group = document.getElementById(`group-${el.id}`) || el.parentElement;
        
        if (!el.value.trim()) {
            if (group) group.classList.add('has-error');
            isValid = false;
        } else {
            if (group) group.classList.remove('has-error');
        }
    });

    return isValid;
}

// Submit Sheet Form Drawer Order
function submitSheetOrder(e) {
    e.preventDefault();

    const $name = document.getElementById('sheet-name');
    const $wa = document.getElementById('sheet-wa');
    const $addr = document.getElementById('sheet-addr');
    const pay = document.getElementById('sheet-pay').value;

    const validated = validateCheckoutInputs([$name, $wa, $addr]);

    if (!validated) {
        alert('Mohon lengkapi semua isian alamat dan kontak kamu.');
        return;
    }

    const name = $name.value.trim();
    const wa = $wa.value.trim();
    const addr = $addr.value.trim();

    const $btn = document.getElementById('sheetSubmitBtn');
    if ($btn) {
        $btn.textContent = 'Membuka WhatsApp…';
        $btn.disabled = true;
    }

    const payload = [
        '🔥 Halo Alchapone! Kami ingin melakukan pemesanan.',
        '',
        '🧢 Produk: ALCHAPONE NIGHTFALL BUNDLE (System Drop Batch 01)',
        `👤 Nama        : ${name}`,
        `📱 No. WA      : ${wa}`,
        `📦 Jumlah      : ${STATE.selectedDesc}`,
        `📍 Alamat Kirim: ${addr}`,
        `💳 Pembayaran  : ${pay}`,
        '',
        'Mohon konfirmasi ketersediaan stok. Terima kasih!'
    ].join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(payload)}`, '_blank');

    setTimeout(() => {
        if ($btn) {
            $btn.textContent = 'Kirim Order via WhatsApp →';
            $btn.disabled = false;
        }
    }, 3000);
}

// Submit page bottom fallback form
function submitFallbackOrder(e) {
    e.preventDefault();

    const $name = document.getElementById('inp-name');
    const $wa = document.getElementById('inp-wa');
    const $addr = document.getElementById('inp-addr');
    const qty = document.getElementById('inp-qty').value;
    const pay = document.getElementById('inp-pay').value;

    const validated = validateCheckoutInputs([$name, $wa, $addr]);

    if (!validated) {
        alert('Mohon lengkapi semua isian checkout kamu.');
        return;
    }

    const name = $name.value.trim();
    const wa = $wa.value.trim();
    const addr = $addr.value.trim();

    const $btn = document.getElementById('formSubmitBtn');
    if ($btn) {
        $btn.textContent = 'Membuka WhatsApp…';
        $btn.disabled = true;
    }

    const payload = [
        '🔥 Halo Alchapone! Kami ingin melakukan pemesanan.',
        '',
        '🧢 Produk: ALCHAPONE NIGHTFALL BUNDLE (System Drop Batch 01)',
        `👤 Nama        : ${name}`,
        `📱 No. WA      : ${wa}`,
        `📦 Jumlah      : ${qty}`,
        `📍 Alamat Kirim: ${addr}`,
        `💳 Pembayaran  : ${pay}`,
        '',
        'Mohon konfirmasi ketersediaan stok. Terima kasih!'
    ].join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(payload)}`, '_blank');

    setTimeout(() => {
        if ($btn) {
            $btn.textContent = 'Kirim Order via WhatsApp →';
            $btn.disabled = false;
        }
    }, 3000);
}
