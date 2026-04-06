
  (function () {
    function initReviews(section) {
      const track = section.querySelector('.reviews-track');
      const viewport = section.querySelector('.reviews-viewport');
      const slides = section.querySelectorAll('.review-slide');
      const dots = section.querySelectorAll('.review-dot');
      const prevBtn = section.querySelector('.reviews-prev');
      const nextBtn = section.querySelector('.reviews-next');

      if (!track || slides.length === 0) return;

      let current = 0;
      const total = slides.length;

      // Force each slide to exactly 100% of the viewport width
      function setSlideSizes() {
        const w = viewport.offsetWidth;
        slides.forEach((slide) => {
          slide.style.width = w + 'px';
          slide.style.minWidth = w + 'px';
          slide.style.maxWidth = w + 'px';
        });
        // Re-apply current position without animation
        track.style.transition = 'none';
        track.style.transform = `translateX(-${current * viewport.offsetWidth}px)`;
        requestAnimationFrame(() => {
          track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
        });
      }

      function goTo(index) {
        current = ((index % total) + total) % total;
        track.style.transform = `translateX(-${current * viewport.offsetWidth}px)`;
        dots.forEach((d, i) => {
          d.classList.toggle('bg-gray-900', i === current);
          d.classList.toggle('bg-gray-300', i !== current);
        });
      }

      setSlideSizes();
      window.addEventListener('resize', setSlideSizes);

      if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
      dots.forEach((dot) => dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index))));

      // ── Drag (mouse) + Swipe (touch) ──
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let dragDist = 0;
      const THRESHOLD = 50;

      // Cursor style
      viewport.style.cursor = 'grab';

      // ── Mouse drag ──
      viewport.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        dragDist = 0;
        viewport.style.cursor = 'grabbing';
        viewport.style.userSelect = 'none';
        track.style.transition = 'none';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        dragDist = e.clientX - startX;
        track.style.transform = `translateX(${-current * viewport.offsetWidth + dragDist}px)`;
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        viewport.style.cursor = 'grab';
        viewport.style.userSelect = '';
        track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
        if (Math.abs(dragDist) > THRESHOLD) {
          goTo(dragDist < 0 ? current + 1 : current - 1);
        } else {
          // Snap back
          track.style.transform = `translateX(-${current * viewport.offsetWidth}px)`;
        }
        dragDist = 0;
      });

      // Prevent ghost image on drag
      viewport.addEventListener('dragstart', (e) => e.preventDefault());

      // ── Touch swipe ──
      viewport.addEventListener(
        'touchstart',
        (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isDragging = true;
          dragDist = 0;
          track.style.transition = 'none';
        },
        { passive: true }
      );

      viewport.addEventListener(
        'touchmove',
        (e) => {
          if (!isDragging) return;
          const dx = Math.abs(e.touches[0].clientX - startX);
          const dy = Math.abs(e.touches[0].clientY - startY);
          if (dx > dy) {
            e.preventDefault();
            dragDist = e.touches[0].clientX - startX;
            track.style.transform = `translateX(${-current * viewport.offsetWidth + dragDist}px)`;
          }
        },
        { passive: false }
      );

      viewport.addEventListener(
        'touchend',
        (e) => {
          if (!isDragging) return;
          isDragging = false;
          track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
          dragDist = e.changedTouches[0].clientX - startX;
          if (Math.abs(dragDist) > THRESHOLD) {
            goTo(dragDist < 0 ? current + 1 : current - 1);
          } else {
            track.style.transform = `translateX(-${current * viewport.offsetWidth}px)`;
          }
          dragDist = 0;
        },
        { passive: true }
      );
    }

    // Init on DOMContentLoaded
    document.querySelectorAll('[data-reviews-section]').forEach(initReviews);

    // Shopify theme editor live reload
    document.addEventListener('shopify:section:load', (e) => {
      const s = e.target.querySelector('[data-reviews-section]');
      if (s) initReviews(s);
    });
  })();
