/* ==========================================================================
   Boulangerie Murciano — interactions
   Aucune dépendance. Les contenus modifiables sont dans config.js et i18n.js.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG;
  var I18N = window.I18N;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "fr";

  function ui(key) { return I18N.ui[lang][key]; }
  function fmtTime(t) { return lang === "fr" ? t.replace(":", "h") : t; }

  /* ---------- Heure de Paris (le visiteur peut être dans un autre fuseau) ---------- */
  function parisNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var get = function (type) { return parts.filter(function (p) { return p.type === type; })[0].value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, minutes: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
  }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }

  /* ---------- Horaires : tableau, footer et badge Ouvert / Fermé ---------- */
  function renderHours() {
    var now = parisNow();
    var order = [1, 2, 3, 4, 5, 6, 0]; // lundi → dimanche
    var rows = order.map(function (d) {
      var slots = CFG.hours[d] || [];
      var txt = slots.length
        ? slots.map(function (s) { return fmtTime(s[0]) + " – " + fmtTime(s[1]); }).join(", ")
        : ui("closed");
      return { d: d, label: ui("days")[d], txt: txt };
    });

    var tbody = $("#hoursTable tbody");
    if (tbody) {
      tbody.innerHTML = rows.map(function (r) {
        return '<tr' + (r.d === now.day ? ' class="is-today"' : "") + '><th scope="row">' + r.label + "</th><td>" + r.txt + "</td></tr>";
      }).join("");
    }
    var foot = $("#footerHours");
    if (foot) {
      foot.innerHTML = rows.map(function (r) {
        return "<li><span>" + r.label + "</span><span>" + r.txt + "</span></li>";
      }).join("");
    }

    // Statut en temps réel
    var status, open = false;
    (CFG.hours[now.day] || []).forEach(function (s) {
      if (now.minutes >= toMin(s[0]) && now.minutes < toMin(s[1])) { open = true; status = ui("openNow").replace("{t}", fmtTime(s[1])); }
    });
    if (!open) {
      status = ui("closedNow");
      for (var i = 0; i < 8; i++) {
        var d = (now.day + i) % 7;
        var next = (CFG.hours[d] || []).filter(function (s) { return i > 0 || toMin(s[0]) > now.minutes; })[0];
        if (next) {
          var dayLabel = i === 0 ? ui("today") : ui("days")[d].toLowerCase();
          if (lang === "en" && i > 0) dayLabel = ui("days")[d];
          status = ui("opensAt").replace("{d}", dayLabel).replace("{t}", fmtTime(next[0]));
          break;
        }
      }
    }
    $$("[data-open-status]").forEach(function (el) {
      el.textContent = status;
      el.classList.toggle("is-closed", !open);
    });
  }

  /* ---------- Prix des produits ---------- */
  function renderPrices() {
    $$(".card__price").forEach(function (el) {
      var price = el.getAttribute("data-price");
      el.textContent = price ? (el.hasAttribute("data-price-prefix") ? ui("from") + " " : "") + price : ui("priceShop");
    });
  }

  /* ---------- Langue FR / EN ---------- */
  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    var dict = I18N.en;

    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
      el.innerHTML = next === "en" && dict[key] ? dict[key] : el.dataset.fr;
    });
    [["data-i18n-aria", "aria-label"], ["data-i18n-title", "title"], ["data-i18n-placeholder", "placeholder"]].forEach(function (pair) {
      $$("[" + pair[0] + "]").forEach(function (el) {
        var key = el.getAttribute(pair[0]);
        var store = "fr" + pair[1].replace(/[^a-z]/g, "");
        if (el.dataset[store] === undefined) el.dataset[store] = el.getAttribute(pair[1]) || "";
        el.setAttribute(pair[1], next === "en" && dict[key] ? dict[key] : el.dataset[store]);
      });
    });

    $$("[data-lang-opt]").forEach(function (el) { el.classList.toggle("is-current", el.getAttribute("data-lang-opt") === next); });
    $$(".hero__dot").forEach(function (dot, i) { dot.setAttribute("aria-label", ui("slide") + " " + (i + 1)); });
    try { localStorage.setItem("murciano-lang", next); } catch (e) { /* stockage indisponible */ }

    renderHours();
    renderPrices();
    document.dispatchEvent(new Event("langchange"));
  }

  function initLang() {
    var param = new URLSearchParams(location.search).get("lang");
    var saved = null;
    try { saved = localStorage.getItem("murciano-lang"); } catch (e) { /* stockage indisponible */ }
    applyLang(param === "en" || param === "fr" ? param : saved === "en" ? "en" : "fr");
    $("#langBtn").addEventListener("click", function () { applyLang(lang === "fr" ? "en" : "fr"); });
  }

  /* ---------- Header compact + barre mobile ---------- */
  function initScroll() {
    var header = $("#header");
    var bar = $(".mobile-bar");
    var ticking = false;
    function update() {
      var y = window.scrollY;
      header.classList.toggle("is-compact", y > 40);
      bar.classList.toggle("is-visible", y > 260);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Menu latéral ---------- */
  function initMenu() {
    var menu = $("#menu");
    var btn = $("#menuBtn");
    var panel = $(".menu__panel", menu);

    function open() {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
      btn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      $(".menu__close", menu).focus();
    }
    function close(focusBtn) {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(function () { menu.hidden = true; }, reduceMotion ? 0 : 450);
      if (focusBtn) btn.focus();
    }
    btn.addEventListener("click", open);
    $$("[data-close]", menu).forEach(function (el) { el.addEventListener("click", function () { close(true); }); });
    $$(".menu__links a", menu).forEach(function (a) { a.addEventListener("click", function () { close(false); }); });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close(true);
      if (e.key === "Tab") { // garde le focus dans le panneau
        var f = $$("a, button", panel);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------- Carrousel du hero ---------- */
  function initHero() {
    var slides = $$("[data-slide]");
    var dots = $$(".hero__dot");
    var hero = $(".hero");
    var pauseBtn = $("#heroPause");
    var current = 0, timer = null, paused = reduceMotion, DELAY = 6500;

    function go(i) {
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      dots[current].classList.remove("is-active");
      dots[current].removeAttribute("aria-current");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      slides[current].removeAttribute("aria-hidden");
      dots[current].classList.add("is-active");
      dots[current].setAttribute("aria-current", "true");
    }
    function play() { if (!paused) { stop(); timer = setInterval(function () { go(current + 1); }, DELAY); } }
    function stop() { clearInterval(timer); }
    function syncPause() {
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.setAttribute("aria-label", ui(paused ? "play" : "pause"));
    }
    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      syncPause();
      paused ? stop() : play();
    });
    document.addEventListener("langchange", syncPause);
    syncPause();

    dots.forEach(function (dot, i) { dot.addEventListener("click", function () { go(i); play(); }); });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });

    // Balayage tactile
    var x0 = null;
    hero.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); play(); }
      x0 = null;
    });
    play();
  }

  /* ---------- Filtres produits ---------- */
  function initFilters() {
    var buttons = $$(".filter");
    var cards = $$("#productGrid .card");
    function apply(cat) {
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-filter") === cat;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cards.forEach(function (c) {
        c.hidden = cat !== "all" && c.getAttribute("data-cat").split(" ").indexOf(cat) === -1;
      });
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); }); });
    $$("[data-filter-link]").forEach(function (a) {
      a.addEventListener("click", function () { apply(a.getAttribute("data-filter-link")); });
    });
  }

  /* ---------- Formulaire de commande ---------- */
  function initForm() {
    var form = $("#orderForm");
    var status = $(".form__status", form);
    var date = $("#f-date");
    var min = new Date(); min.setDate(min.getDate() + 1);
    date.min = min.toISOString().slice(0, 10);

    function validate() {
      var ok = true;
      $$("[required]", form).forEach(function (input) {
        var valid = input.checkValidity() && input.value.trim() !== "";
        input.closest(".field").classList.toggle("has-error", !valid);
        input.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid && ok) { input.focus(); ok = false; }
      });
      return ok;
    }
    $$("[required]", form).forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error") && input.checkValidity()) {
          input.closest(".field").classList.remove("has-error");
          input.setAttribute("aria-invalid", "false");
        }
      });
    });

    function done(msgKey, cls) {
      status.textContent = ui(msgKey);
      status.className = "form__status " + cls;
      if (cls === "is-success") form.classList.add("is-sent");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form._gotcha && form._gotcha.value) return;
      if (!validate()) return;
      var data = new FormData(form);
      var btn = $("button[type=submit]", form);

      // 1) Formspree configuré
      if (CFG.formspreeEndpoint) {
        btn.disabled = true;
        status.textContent = ui("sending");
        status.className = "form__status";
        fetch(CFG.formspreeEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done("sent", "is-success"); })
          .catch(function () { done("error", "is-error"); })
          .then(function () { btn.disabled = false; });
        return;
      }
      // 2) Sinon, e-mail via le logiciel de messagerie du visiteur
      if (CFG.email) {
        var body = ["nom", "telephone", "date", "type", "message"].map(function (k) { return k + " : " + (data.get(k) || ""); }).join("\n");
        location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(ui("mailSubject")) + "&body=" + encodeURIComponent(body);
        done("sent", "is-success");
        return;
      }
      // 3) Démo : rien n'est envoyé, on le dit clairement
      done("demo", "is-success");
    });
  }

  /* ---------- Vidéo YouTube chargée au clic ---------- */
  function initVideo() {
    $$("[data-yt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + btn.getAttribute("data-yt") + "?autoplay=1&rel=0";
        iframe.title = btn.getAttribute("aria-label");
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        btn.replaceWith(iframe);
      });
    });
  }

  /* ---------- Apparition au scroll ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Téléphone depuis la config ---------- */
  function initPhone() {
    $$("[data-tel]").forEach(function (a) { a.href = "tel:" + CFG.phone; });
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  initPhone();
  initLang();
  initScroll();
  initMenu();
  initHero();
  initFilters();
  initForm();
  initVideo();
  initReveal();
  setInterval(renderHours, 60000);
})();
