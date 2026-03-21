/* ===================================================
   RodCards — Premium Script
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Toast Helper ─────────────────────────────── */
  const toastEl = document.getElementById('toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    setTimeout(() => toastEl.classList.remove('visible'), 2800);
  }

  /* ── Scroll-Triggered Animations ─────────────── */
  const animEls = document.querySelectorAll('.animate-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger sibling elements slightly
          const delay = i * 30;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animEls.forEach(el => observer.observe(el));
  } else {
    animEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Link Row Ripple Effect ───────────────────── */
  document.querySelectorAll('.link-row a, .link-row .share-btn').forEach(el => {
    el.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ── Banking Details Toggle ───────────────────── */
  const bankingBtn = document.getElementById('bankingBtn');
  const bankDetails = document.getElementById('bankDetails');
  const bankChevron = document.getElementById('bankChevron');

  if (bankingBtn && bankDetails) {
    bankingBtn.addEventListener('click', () => {
      const isOpen = bankDetails.classList.toggle('show');
      if (bankChevron) bankChevron.classList.toggle('open', isOpen);
    });
  }

  /* ── Copy to Clipboard ────────────────────────── */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied';
        showToast('Account number copied!');
        setTimeout(() => btn.textContent = 'Copy', 2000);
      } catch {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        btn.textContent = '✓ Copied';
        showToast('Account number copied!');
        setTimeout(() => btn.textContent = 'Copy', 2000);
      }
    });
  });

  /* ── Photo Modals ─────────────────────────────── */
  function setupModal(triggerId, modalId, imgId, closeBtnId, srcFn) {
    const trigger = triggerId ? document.getElementById(triggerId) : null;
    const modal = document.getElementById(modalId);
    const modalImg = document.getElementById(imgId);
    const closeBtn = document.getElementById(closeBtnId);
    if (!modal || !modalImg || !closeBtn) return;

    if (trigger && srcFn) {
      trigger.addEventListener('click', (e) => {
        const src = srcFn(trigger);
        if (!src) return;
        modalImg.src = src;
        modal.style.display = 'flex';
      });
    }

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });
  }

  setupModal('coverPhoto', 'coverModal', 'coverModalImg', 'closeCover',
    el => el.querySelector('img:first-child')?.src);

  setupModal('profilePhoto', 'profileModal', 'profileModalImg', 'closeProfile',
    el => el.getAttribute('data-img'));

  setupModal(null, 'portfolioModal', 'portfolioModalImg', 'closePortfolio', null);

  // Prevent profile click from bubbling to cover
  const profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto) {
    profilePhoto.addEventListener('click', e => e.stopPropagation());
  }

  /* ── Share Contact ────────────────────────────── */
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.dataset.name;
      const phone = btn.dataset.phone;
      const website = btn.dataset.website;
      const shareData = {
        title: `${name}'s Contact`,
        text: `Name: ${name}\nPhone: ${phone}`,
        url: website,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(`Name: ${name}\nPhone: ${phone}\nWebsite: ${website}`);
          showToast('Contact info copied to clipboard!');
        }
      } catch (err) {
        console.error('Share failed:', err);
      }
    });
  });

  /* ── Premium Carousel ─────────────────────────── */
  const carouselTrack = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');

  if (carouselTrack) {
    const originalImages = Array.from(carouselTrack.querySelectorAll('img'));
    const slideCount = originalImages.length;
    let currentIndex = 0;
    let autoSlideTimer = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragDelta = 0;

    // Build track: [clone-last, ...originals, clone-first] for infinite loop
    const cloneLast = originalImages[slideCount - 1].cloneNode(true);
    const cloneFirst = originalImages[0].cloneNode(true);
    carouselTrack.insertBefore(cloneLast, carouselTrack.firstChild);
    carouselTrack.appendChild(cloneFirst);

    // Update track width based on actual slide count including clones
    const total = slideCount + 2;
    carouselTrack.style.width = `${total * 100}%`;
    Array.from(carouselTrack.children).forEach(img => { img.style.width = `${100 / total}%`; });

    // Start at index 1 (after the clone-last)
    currentIndex = 1;

    // Build dots
    if (dotsContainer) {
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i + 1));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      // currentIndex is 1-based (1 = first real slide)
      dots.forEach((d, i) => d.classList.toggle('active', i === (currentIndex - 1 + slideCount) % slideCount));
    }

    function goTo(index, animated = true) {
      carouselTrack.style.transition = animated ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      carouselTrack.style.transform = `translateX(-${index * (100 / total)}%)`;
      currentIndex = index;
      updateDots();
    }

    // Handle infinite jump after clone transition
    carouselTrack.addEventListener('transitionend', () => {
      if (currentIndex === 0) {
        goTo(slideCount, false);
      } else if (currentIndex === slideCount + 1) {
        goTo(1, false);
      }
    });

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prev();
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        next();
        startAuto();
      });
    }

    function startAuto() {
      stopAuto();
      autoSlideTimer = setInterval(next, 4500);
    }
    function stopAuto() {
      if (autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; }
    }

    startAuto();

    // Pause on hover
    const carouselEl = document.querySelector('.carousel-container');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAuto);
      carouselEl.addEventListener('mouseleave', startAuto);
    }

    // Touch / drag swipe support
    const carousel = document.getElementById('clickableCarousel');
    if (carousel) {
      carousel.addEventListener('pointerdown', e => {
        isDragging = true;
        dragStartX = e.clientX;
        dragDelta = 0;
        stopAuto();
        carousel.setPointerCapture(e.pointerId);
      });

      carousel.addEventListener('pointermove', e => {
        if (!isDragging) return;
        dragDelta = e.clientX - dragStartX;
        const trackW = carousel.offsetWidth;
        const nudge = (dragDelta / trackW) * (100 / total);
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(calc(-${currentIndex * (100 / total)}% + ${dragDelta}px))`;
      });

      carousel.addEventListener('pointerup', e => {
        if (!isDragging) return;
        isDragging = false;
        if (dragDelta < -50) next();
        else if (dragDelta > 50) prev();
        else goTo(currentIndex);
        startAuto();
      });

      // Click to open image in modal (only if not a swipe)
      carousel.addEventListener('click', (e) => {
        if (Math.abs(dragDelta) > 10) return; // was a swipe, ignore

        // Grab the currently active image from the track
        const activeImg = carouselTrack.children[currentIndex];
        if (activeImg) {
          const portfolioModal = document.getElementById('portfolioModal');
          const portfolioModalImg = document.getElementById('portfolioModalImg');
          if (portfolioModal && portfolioModalImg) {
            portfolioModalImg.src = activeImg.src;
            portfolioModal.style.display = 'flex';
          }
        }
      });
    }

    // Initial position
    goTo(1, false);
  }

});
