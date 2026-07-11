/**
 * Blog CMS Admin - client-side interactions.
 * No frameworks - vanilla JS only.
 */
(function () {
  'use strict';

  var app = document.querySelector('.app');
  var THEME_KEY = 'blogcms-theme';

  /* ---------------- Sidebar toggle (mobile) ---------------- */
  var menuBtn = document.querySelector('[data-toggle="sidebar"]');
  var overlay = document.querySelector('.sidebar-overlay');

  function closeSidebar() { app && app.classList.remove('sidebar-open'); }
  function toggleSidebar() { app && app.classList.toggle('sidebar-open'); }

  menuBtn && menuBtn.addEventListener('click', toggleSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);

  /* ---------------- Dark / light mode ---------------- */
  var themeBtn = document.querySelector('[data-toggle="theme"]');
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  themeBtn && themeBtn.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  });

  /* ---------------- Delete confirmation ---------------- */
  document.querySelectorAll('[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var msg = form.getAttribute('data-confirm') || 'Are you sure?';
      if (!window.confirm(msg)) {
        e.preventDefault();
      }
    });
  });

  /* ---------------- Auto-generate slug from title/name ---------------- */
  function slugify(str) {
    return str
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  document.querySelectorAll('[data-slug-source]').forEach(function (sourceInput) {
    var targetSelector = sourceInput.getAttribute('data-slug-source');
    var targetInput = document.querySelector(targetSelector);
    if (!targetInput) return;

    var userEdited = false;
    targetInput.addEventListener('input', function () { userEdited = true; });

    sourceInput.addEventListener('input', function () {
      if (userEdited && targetInput.value) return;
      targetInput.value = slugify(sourceInput.value);
    });
  });

  /* ---------------- Featured image preview ---------------- */
  document.querySelectorAll('[data-image-input]').forEach(function (input) {
    input.addEventListener('change', function () {
      var wrapper = input.closest('.image-drop');
      if (!wrapper || !input.files || !input.files[0]) return;

      var existingPreview = wrapper.querySelector('.image-drop__preview');
      var reader = new FileReader();
      reader.onload = function (e) {
        if (existingPreview) {
          existingPreview.src = e.target.result;
        } else {
          var img = document.createElement('img');
          img.className = 'image-drop__preview';
          img.src = e.target.result;
          wrapper.insertBefore(img, wrapper.firstChild);
        }
      };
      reader.readAsDataURL(input.files[0]);
    });
  });

  /* ---------------- Live search debounce (search forms auto-submit) ---------------- */
  document.querySelectorAll('[data-live-search]').forEach(function (input) {
    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        input.form && input.form.submit();
      }, 500);
    });
  });
})();
