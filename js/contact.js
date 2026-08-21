document.querySelectorAll('.myTextarea').forEach(input => {
    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('has-content');
      } else {
        this.classList.remove('has-content');
      }
    });
  });

// ============================================================
// Contact form submission
//
// The form's plain action="https://formsubmit.co/..." + method="POST"
// is left in place as a no-JS fallback, but a normal submit to
// FormSubmit navigates the whole page away to FormSubmit's own
// hosted page (it only honors the _next redirect once the account's
// one-time email confirmation has gone through — see the note below).
// Posting to FormSubmit's /ajax/ endpoint with fetch instead means
// the page never leaves derekiniguez.com at all: we get a JSON result
// back and redirect to thankyou.html ourselves on success.
//
// IMPORTANT — one-time setup FormSubmit requires, not a code issue:
// the *first* submission to a brand-new FormSubmit address triggers a
// confirmation email to that address ("Confirm your submission on
// FormSubmit.co — click to activate"). Until that link is clicked,
// FormSubmit won't actually deliver any messages, which is almost
// certainly why no email arrived. Check derekini.dev@gmail.com
// (including spam/promotions) for that confirmation email and click
// it once — after that, every future submission should arrive
// normally with no further action needed.
// ============================================================
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const endpoint = 'https://formsubmit.co/ajax/derekini.dev@gmail.com';

  function setStatus(message, tone) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status' + (tone ? ' is-' + tone : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', '');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    })
      .then(res => res.json().catch(() => ({})).then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data && (data.success === 'true' || data.success === true)) {
          window.location.href = 'thankyou.html';
          return;
        }
        throw new Error((data && data.message) || 'FormSubmit did not confirm the message was sent.');
      })
      .catch(() => {
        setStatus(
          "Something went wrong sending that. Please email me directly at derekini.dev@gmail.com instead — sorry about that!",
          'error'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      });
  });
})();

// ============================================================
// Contact panel titlebar dots — close / minimize / fullscreen.
// Mirrors the hero code window's own win-dot pattern (see
// js/hero-window.js) so the same macOS-style dots do something real
// here too, not just decorative color.
// ============================================================
(function () {
  const panel = document.getElementById('contactPanel');
  if (!panel) return;

  const closeBtn = document.getElementById('contactCloseBtn');
  const minBtn = document.getElementById('contactMinBtn');
  const maxBtn = document.getElementById('contactMaxBtn');
  const restoreBtn = document.getElementById('contactRestoreBtn');

  // role="button" spans don't get a native Enter/Space activation the
  // way a real <button> would — wire that up so keyboard users can
  // reach these too, not just mouse/touch.
  function onActivate(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  }

  onActivate(closeBtn, () => {
    panel.classList.add('is-closed');
    panel.classList.remove('is-maximized');
    if (restoreBtn) restoreBtn.hidden = false;
  });

  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      panel.classList.remove('is-closed');
      restoreBtn.hidden = true;
    });
  }

  onActivate(minBtn, () => {
    panel.classList.toggle('is-minimized');
    panel.classList.remove('is-maximized'); // don't allow both at once
  });

  onActivate(maxBtn, () => {
    panel.classList.toggle('is-maximized');
    panel.classList.remove('is-minimized'); // don't allow both at once
  });

  // Escape backs out of fullscreen, same as a real window manager.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-maximized')) {
      panel.classList.remove('is-maximized');
    }
  });
})();