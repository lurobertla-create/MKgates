/* ==========================================================================
   GateQuote — script.js
   No dependencies. Handles: sticky nav shadow, mobile burger menu,
   FAQ accordion, quote/contact form validation + success state,
   animated counters, and scroll-reveal animations.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initStickyNav();
  initMobileMenu();
  initAccordions();
  initForms();
  initCounters();
  initScrollReveal();
  initFooterYear();
});

/* --------------------------------------------------------------------
   Sticky navigation shadow on scroll
   -------------------------------------------------------------------- */
function initStickyNav() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;

  function update() {
    if (window.scrollY > 8) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* --------------------------------------------------------------------
   Mobile burger menu
   -------------------------------------------------------------------- */
function initMobileMenu() {
  var burger = document.querySelector('.burger');
  var panel = document.querySelector('.mobile-panel');
  if (!burger || !panel) return;

  function closeMenu() {
    burger.classList.remove('is-active');
    panel.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    var isOpen = panel.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', toggleMenu);

  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}

/* --------------------------------------------------------------------
   FAQ accordion (animated max-height)
   -------------------------------------------------------------------- */
function initAccordions() {
  var items = document.querySelectorAll('.accordion-item');

  items.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all other items in the same accordion group
      var group = item.closest('.accordion');
      if (group) {
        group.querySelectorAll('.accordion-item.is-open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            var openPanel = openItem.querySelector('.accordion-panel');
            var openTrigger = openItem.querySelector('.accordion-trigger');
            if (openPanel) openPanel.style.maxHeight = null;
            if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
          }
        });
      }

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------
   Form validation + submission (Formspree placeholder)
   -------------------------------------------------------------------- */
function initForms() {
  var forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(function (form) {
    var successBox = form.parentElement.querySelector('.form-success');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var fields = form.querySelectorAll('[required]');

      fields.forEach(function (field) {
        var wrapper = field.closest('.form-field') || field.closest('.checkbox-field');
        var errorEl = wrapper ? wrapper.querySelector('.field-error') : null;
        var fieldValid = true;

        if (field.type === 'checkbox') {
          fieldValid = field.checked;
        } else if (field.type === 'email') {
          fieldValid = field.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        } else if (field.type === 'tel') {
          fieldValid = field.value.trim().length >= 7;
        } else {
          fieldValid = field.value.trim() !== '';
        }

        if (!fieldValid) {
          valid = false;
          if (wrapper) wrapper.classList.add('has-error');
          if (errorEl) {
            errorEl.textContent = field.type === 'checkbox'
              ? 'Please confirm to continue.'
              : field.type === 'email'
                ? 'Enter a valid email address.'
                : 'This field is required.';
          }
        } else if (wrapper) {
          wrapper.classList.remove('has-error');
          if (errorEl) errorEl.textContent = '';
        }
      });

      if (!valid) {
        var firstError = form.querySelector('.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Simulate submission to the Formspree endpoint configured on the
      // <form action="..."> attribute. In production this POSTs directly
      // and Formspree redirects/returns JSON; here we show an inline
      // success state so the flow can be demoed without a live endpoint.
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      setTimeout(function () {
        form.reset();
        form.style.display = 'none';
        if (successBox) successBox.classList.add('is-visible');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Get My Free Quotes';
        }
      }, 600);
    });

    // Clear error state as the user types
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.form-field') || field.closest('.checkbox-field');
        if (wrapper) wrapper.classList.remove('has-error');
      });
    });
  });
}

/* --------------------------------------------------------------------
   Animated counters (triggered once, on scroll into view)
   -------------------------------------------------------------------- */
function initCounters() {
  var counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) { observer.observe(counter); });
}

function animateCounter(el) {
  var target = parseFloat(el.getAttribute('data-count-to'));
  var suffix = el.getAttribute('data-suffix') || '';
  var duration = 1400;
  var start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = Math.min((timestamp - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = (target * eased);
    el.textContent = (target % 1 === 0 ? Math.round(current) : current.toFixed(1)) + suffix;
    if (progress < 1) window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

/* --------------------------------------------------------------------
   Scroll-reveal (fade + slide up) for elements marked .reveal
   -------------------------------------------------------------------- */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(function (item) { observer.observe(item); });
}

/* --------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------- */
function initFooterYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
