/* ==========================================================================
   LT COACH — FOOTBALL PERFORMANCE
   Interactions, validation des formulaires et mesure d'audience.

   Le site est statique (GitHub Pages) : les demandes sont envoyées depuis le
   navigateur à FormSubmit, qui les transmet par e-mail au coach. Aucun
   serveur, aucune base de données, aucun stockage côté site.
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------- */
  /* 1. Configuration                                                       */
  /* --------------------------------------------------------------------- */

  /* Envoi des formulaires : FormSubmit (https://formsubmit.co), service conçu
     pour les sites statiques. L'appel AJAX évite de quitter la page.

     Le destinataire est centralisé ici. Au premier envoi, FormSubmit adresse
     un e-mail d'activation à cette adresse : le lien active le formulaire et
     fournit un alias (suite de lettres et de chiffres). Remplacer recipient
     par cet alias évite d'exposer l'adresse en clair dans le code public. */
  var FORM_ENDPOINT = {
    recipient: "ytop2sinj@gmail.com",
    subject: "Nouvelle réponse au questionnaire – LT COACH",
    timeout: 20000
  };

  function formEndpointUrl() {
    return "https://formsubmit.co/ajax/" + encodeURIComponent(FORM_ENDPOINT.recipient);
  }

  /* Mesure d'audience : renseigner le fournisseur et l'identifiant pour
     activer le suivi. Tant que provider vaut null, aucun script tiers n'est
     chargé et le bandeau de consentement n'est pas affiché. */
  var ANALYTICS = {
    provider: null, // "plausible" | "ga4"
    id: null,       // domaine Plausible ou identifiant de mesure GA4
    storageKey: "ltcoach_consent_v1"
  };

  var root = document.documentElement;
  root.classList.add("js");

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* --------------------------------------------------------------------- */
  /* 2. Mesure d'audience et consentement                                   */
  /* --------------------------------------------------------------------- */

  function getConsent() {
    try { return window.localStorage.getItem(ANALYTICS.storageKey); }
    catch (e) { return null; }
  }

  function getSource() {
    var params = new URLSearchParams(window.location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
    var campaign = keys.map(function (key) {
      var value = params.get(key);
      return value ? key.replace("utm_", "") + ":" + value : null;
    }).filter(Boolean).join(" / ");

    return {
      referrer: document.referrer || "accès direct",
      campaign: campaign,
      page: window.location.pathname
    };
  }

  function setConsent(value) {
    try { window.localStorage.setItem(ANALYTICS.storageKey, value); }
    catch (e) { /* stockage indisponible : choix valable pour la session */ }
    currentConsent = value;
  }

  var currentConsent = getConsent();

  function analyticsAllowed() {
    return ANALYTICS.provider && ANALYTICS.id && currentConsent === "granted";
  }

  function track(eventName, params) {
    if (!analyticsAllowed()) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  function loadAnalytics() {
    if (!ANALYTICS.provider || !ANALYTICS.id) return;
    if (document.querySelector("[data-analytics-loader]")) return;

    if (ANALYTICS.provider === "plausible") {
      var s = document.createElement("script");
      s.defer = true;
      s.setAttribute("data-analytics-loader", "plausible");
      s.setAttribute("data-domain", ANALYTICS.id);
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }

    if (ANALYTICS.provider === "ga4") {
      var g = document.createElement("script");
      g.async = true;
      g.setAttribute("data-analytics-loader", "ga4");
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ANALYTICS.id);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", ANALYTICS.id, { anonymize_ip: true });
    }
  }

  function buildConsentBanner() {
    if (!ANALYTICS.provider || !ANALYTICS.id) return;
    if (document.querySelector(".consent")) return;

    var banner = document.createElement("div");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Mesure d'audience");
    banner.innerHTML =
      '<p>Ce site utilise une mesure d’audience pour comprendre quelles pages ' +
      'aident les familles et les joueurs. Vous pouvez accepter ou refuser. ' +
      '<a href="politique-confidentialite.html#cookies">En savoir plus</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn" data-consent="granted">Accepter</button>' +
      '<button type="button" class="btn btn--ghost" data-consent="denied">Refuser</button>' +
      "</div>";
    document.body.appendChild(banner);

    banner.querySelectorAll("[data-consent]").forEach(function (button) {
      button.addEventListener("click", function () {
        setConsent(button.getAttribute("data-consent"));
        banner.classList.remove("is-visible");
        if (currentConsent === "granted") loadAnalytics();
        updateCookieButton();
      });
    });

    if (currentConsent === null) {
      window.setTimeout(function () { banner.classList.add("is-visible"); }, 900);
    }
  }

  function updateCookieButton() {
    var button = document.querySelector("[data-cookie-settings]");
    if (button) button.hidden = !(ANALYTICS.provider && ANALYTICS.id);
  }

  function bindTracking() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-track]");
      if (!trigger) return;
      track(trigger.getAttribute("data-track"), {
        label: (trigger.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        page: window.location.pathname
      });
    });

    var source = getSource();
    track("page_view", {
      page: source.page,
      title: document.title,
      referrer: source.referrer,
      campaign: source.campaign || undefined
    });
  }

  /* --------------------------------------------------------------------- */
  /* 3. Navigation                                                          */
  /* --------------------------------------------------------------------- */

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initDrawer() {
    var drawer = document.getElementById("drawer");
    var openBtn = document.querySelector("[data-drawer-open]");
    var closeBtn = document.querySelector("[data-drawer-close]");
    if (!drawer || !openBtn) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      drawer.removeAttribute("inert");
      drawer.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      var first = drawer.querySelector("a, button");
      if (first) window.setTimeout(function () { first.focus(); }, 40);
    }

    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      drawer.setAttribute("inert", "");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      if (lastFocus) lastFocus.focus();
    }

    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");

    openBtn.addEventListener("click", function () {
      drawer.removeAttribute("inert");
      open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
        drawer.setAttribute("inert", "");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) close();
      if (event.key !== "Tab" || !drawer.classList.contains("is-open")) return;

      var focusable = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* Garde les citations marquées [data-fit-line] sur une seule ligne, quelle
     que soit la largeur de l'écran. */
  function initFitLines() {
    var lines = document.querySelectorAll("[data-fit-line]");
    if (!lines.length) return;

    function fit(el) {
      el.style.fontSize = "";
      var size = parseFloat(window.getComputedStyle(el).fontSize);
      var available = el.clientWidth;
      if (!size || !available) return;

      var content = el.scrollWidth;
      var guard = 0;
      while (content > available + 0.5 && guard < 5) {
        size = Math.max(7, size * (available / content) * 0.995);
        el.style.fontSize = size + "px";
        content = el.scrollWidth;
        guard += 1;
      }
    }

    function fitAll() {
      lines.forEach(fit);
    }

    fitAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAll).catch(function () { /* ignore */ });
    }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(fitAll, 120);
    }, { passive: true });
  }

  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    targets.forEach(function (el) {
      /* Décalage automatique entre frères révélés : la lecture descend en cascade. */
      var siblings = el.parentElement
        ? Array.prototype.filter.call(el.parentElement.children, function (child) {
            return child.hasAttribute("data-reveal");
          })
        : [];
      var index = siblings.indexOf(el);
      if (index > 0) {
        el.style.setProperty("--reveal-delay", Math.min(index, 6) * 70 + "ms");
      }
      observer.observe(el);
    });
  }

  /* Tracés SVG (terrain, schéma de séance) : on prépare la longueur des
     traits puis on les dessine à l'entrée dans le viewport. */
  function initDrawings() {
    var targets = document.querySelectorAll("[data-draw]");
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.querySelectorAll("path, line, circle, rect, polyline").forEach(function (shape) {
        shape.setAttribute("pathLength", "1");
      });
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-drawn"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-drawn");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* Fil de lecture doré, en haut de l'écran. */
  function initScrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* Rail de sections de l'accueil. */
  function initSectionRail() {
    var rail = document.querySelector(".section-rail");
    if (!rail || !("IntersectionObserver" in window)) return;

    var links = Array.prototype.slice.call(rail.querySelectorAll("a"));
    var sections = links
      .map(function (link) { return document.getElementById(link.getAttribute("data-rail")); })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("data-rail") === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* Halo qui suit le curseur sur les cartes de parcours (souris uniquement). */
  function initCardSpotlight() {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".gateway").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 4. Formulaires                                                         */
  /* --------------------------------------------------------------------- */

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function labelForField(form, field) {
    if (field.type === "radio") {
      var groupLabel = field.closest(".field") ? field.closest(".field").querySelector(".field-label") : null;
      if (groupLabel) return cleanText(groupLabel.textContent).replace(/\s*\*$/, "");
    }
    if (field.id) {
      var label = form.querySelector('label[for="' + field.id + '"]');
      if (label) return cleanText(label.textContent).replace(/\s*\*$/, "");
    }
    var choice = field.closest(".choice");
    if (choice) {
      var title = choice.querySelector(".choice-title");
      if (title) return cleanText(title.textContent);
    }
    var parent = field.closest("label");
    if (parent) return cleanText(parent.textContent).replace(/\s*\*$/, "");
    return field.name;
  }

  function formatValue(field) {
    if (field.tagName === "SELECT") {
      return field.options[field.selectedIndex] ? field.options[field.selectedIndex].text : "";
    }
    return field.value;
  }

  function composeMessage(form) {
    var title = form.getAttribute("data-mail-subject") || "Demande";
    var lines = [title.toUpperCase()];
    var lastLegend = null;
    var seenRadioGroups = {};

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.type === "hidden" || field.type === "submit") return;
      if (field.type === "radio") {
        if (!field.checked || seenRadioGroups[field.name]) return;
        seenRadioGroups[field.name] = true;
      }
      if (field.type === "checkbox") {
        if (!field.checked) return;
        lines.push("Consentement données : oui");
        return;
      }
      if (!field.value) return;

      var legend = field.closest("fieldset") ? field.closest("fieldset").querySelector("legend") : null;
      if (legend) {
        var legendText = cleanText(legend.textContent);
        if (legendText !== lastLegend) {
          lines.push("");
          lines.push(legendText.toUpperCase());
          lastLegend = legendText;
        }
      }

      lines.push(labelForField(form, field) + " : " + cleanText(formatValue(field)));
    });

    var source = getSource();
    lines.push("");
    lines.push("— Récapitulatif généré sur le site LT COACH" + (source.campaign ? " · " + source.campaign : ""));

    return lines.join("\n");
  }

  /* Adresse e-mail du visiteur, utilisée comme Reply-To de l'e-mail reçu. */
  function visitorEmail(form) {
    var found = "";
    form.querySelectorAll('input[type="email"]').forEach(function (field) {
      if (!found && isValidEmail(cleanText(field.value))) found = cleanText(field.value);
    });
    return found;
  }

  function formatSubmissionDate(date) {
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      }).format(date);
    } catch (e) {
      return date.toLocaleString("fr-FR");
    }
  }

  /* Toutes les réponses du questionnaire, avec la section en préfixe et
     l'intitulé exact affiché à l'écran. Aucun champ rempli n'est omis. */
  function buildPayload(form) {
    var payload = {
      _subject: FORM_ENDPOINT.subject,
      _template: "table",
      _captcha: "false",
      "Date et heure de l'envoi": formatSubmissionDate(new Date()),
      "Parcours": form.getAttribute("data-parcours-name") || "",
      "Page d'origine": window.location.pathname
    };

    var replyTo = visitorEmail(form);
    if (replyTo) payload._replyto = replyTo;

    var legend = "";
    var seenRadios = {};

    function push(label, value) {
      var key = label;
      var index = 2;
      while (Object.prototype.hasOwnProperty.call(payload, key)) {
        key = label + " (" + index + ")";
        index += 1;
      }
      payload[key] = value;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.disabled) return;
      if (field.type === "hidden" || field.type === "submit" || field.type === "button") return;

      if (field.type === "radio") {
        if (!field.checked || seenRadios[field.name]) return;
        seenRadios[field.name] = true;
      }

      if (field.type === "checkbox") {
        if (field.checked) push("Consentement", "Oui — politique de confidentialité acceptée");
        return;
      }

      var value = cleanText(formatValue(field));
      if (!value) return;

      var fieldset = field.closest("fieldset");
      if (fieldset && fieldset.querySelector("legend")) {
        legend = cleanText(fieldset.querySelector("legend").textContent);
      }

      push((legend ? legend + " — " : "") + labelForField(form, field), value);
    });

    return payload;
  }

  function selectSummary(area) {
    try {
      area.focus({ preventScroll: true });
      area.select();
      area.setSelectionRange(0, area.value.length);
    } catch (e) { /* selection indisponible : le texte reste lisible à l'écran */ }
  }

  function copySummary(panel, done) {
    var area = panel ? panel.querySelector("[data-copy-summary-text]") : null;
    if (!area || !area.value) {
      done(false);
      return;
    }

    function fallback() {
      var ok = false;
      try {
        selectSummary(area);
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      done(ok);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(area.value).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    var digits = value.replace(/[^\d+]/g, "");
    return digits.replace(/\D/g, "").length >= 9;
  }

  function setFieldError(field, message) {
    var wrapper = field.closest(".field");
    if (!wrapper) return;
    var error = wrapper.querySelector(".field-error");
    if (error) {
      error.textContent = message;
      error.classList.add("is-visible");
    }
    field.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(field) {
    var wrapper = field.closest(".field");
    if (wrapper) {
      var error = wrapper.querySelector(".field-error");
      if (error) error.classList.remove("is-visible");
    }
    field.removeAttribute("aria-invalid");
  }

  function validateField(field) {
    if (!field.required) return true;

    if (field.type === "radio") {
      var group = field.form.querySelectorAll('input[name="' + field.name + '"]');
      var checked = Array.prototype.some.call(group, function (radio) { return radio.checked; });
      if (!checked) {
        setFieldError(field, "Merci de choisir une option.");
        return false;
      }
      Array.prototype.forEach.call(group, function (radio) {
        radio.removeAttribute("aria-invalid");
      });
      clearFieldError(field);
      return true;
    }

    if (field.type === "checkbox") {
      if (!field.checked) {
        var wrap = field.closest(".check");
        var consentError = field.form.querySelector(".check-error");
        if (consentError) consentError.classList.add("is-visible");
        return false;
      }
      var consentErrorEl = field.form.querySelector(".check-error");
      if (consentErrorEl) consentErrorEl.classList.remove("is-visible");
      return true;
    }

    var value = cleanText(field.value);
    if (!value) {
      setFieldError(field, "Ce champ est nécessaire pour traiter votre demande.");
      return false;
    }
    if (field.type === "email" && !isValidEmail(value)) {
      setFieldError(field, "Indiquez une adresse e-mail valide.");
      return false;
    }
    if (field.type === "tel" && !isValidPhone(value)) {
      setFieldError(field, "Indiquez un numéro joignable (au moins 9 chiffres).");
      return false;
    }
    clearFieldError(field);
    return true;
  }

  function initForms() {
    var forms = document.querySelectorAll("form[data-lt-form]");
    if (!forms.length) return;

    forms.forEach(function (form) {
      var panel = form.closest(".form-panel");
      var success = panel ? panel.querySelector(".form-success") : null;
      var status = form.querySelector(".form-status");
      var copyButton = panel ? panel.querySelector("[data-copy-summary]") : null;
      var copyStatus = panel ? panel.querySelector(".copy-status") : null;
      var copyTimer = null;
      var started = false;

      if (copyButton) {
        copyButton.addEventListener("click", function () {
          copySummary(panel, function (ok) {
            copyButton.textContent = ok ? "Réponses copiées ✓" : "Copier les réponses";
            copyButton.classList.toggle("is-copied", ok);
            if (copyStatus) {
              copyStatus.textContent = ok
                ? "Copié. Collez maintenant le récapitulatif dans votre message au coach."
                : "Copie automatique impossible : sélectionnez le récapitulatif ci-dessus et copiez-le.";
              copyStatus.classList.toggle("is-error", !ok);
            }
            if (copyTimer) window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(function () {
              copyButton.textContent = "Copier les réponses";
              copyButton.classList.remove("is-copied");
            }, 4000);
          });
        });
      }

      var summaryField = panel ? panel.querySelector("[data-copy-summary-text]") : null;
      if (summaryField) {
        summaryField.addEventListener("click", function () { selectSummary(summaryField); });
      }

      function onEdit(event) {
        if (!started) {
          started = true;
          track("form_start", { form: form.getAttribute("data-form-name") || form.id });
        }

        var field = event.target;
        if (field.type === "checkbox") {
          if (field.checked) {
            var consentError = form.querySelector(".check-error");
            if (consentError) consentError.classList.remove("is-visible");
          }
          return;
        }
        if (field.required && field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      }

      form.addEventListener("input", onEdit);
      form.addEventListener("change", onEdit);

      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("blur", function () {
          if (field.required) validateField(field);
        });
      });

      var submitButton = form.querySelector('button[type="submit"]');
      var sending = false;

      /* Pendant l'envoi, le bouton est désactivé : impossible de valider
         deux fois la même demande. */
      function setSending(state) {
        sending = state;
        form.setAttribute("aria-busy", state ? "true" : "false");
        if (!submitButton) return;
        submitButton.disabled = state;
        if (state) {
          if (!submitButton.hasAttribute("data-label")) {
            submitButton.setAttribute("data-label", submitButton.innerHTML);
          }
          submitButton.textContent = "Envoi en cours…";
        } else if (submitButton.hasAttribute("data-label")) {
          submitButton.innerHTML = submitButton.getAttribute("data-label");
        }
      }

      function sendFailed(error) {
        setSending(false);
        if (window.console && console.warn) {
          console.warn("[LT COACH] Envoi du formulaire impossible :", error);
        }
        track("form_error", { form: form.getAttribute("data-form-name") || form.id });
        if (status) {
          status.hidden = false;
          status.textContent =
            "L'envoi n'a pas abouti. Vos réponses sont conservées : vous pouvez " +
            "réessayer dans un instant. Sinon, écrivez directement à Lucien TALON : " +
            "07 83 63 66 91 (WhatsApp) ou ltcoach.contact@gmail.com.";
        }
      }

      function sendSucceeded() {
        setSending(false);
        track("form_submit", {
          form: form.getAttribute("data-form-name") || form.id,
          parcours: form.getAttribute("data-parcours-name") || ""
        });
        form.hidden = true;
        if (success) {
          success.hidden = false;
          if (copyButton) {
            copyButton.textContent = "Copier les réponses";
            copyButton.classList.remove("is-copied");
          }
          if (copyStatus) {
            copyStatus.textContent = "";
            copyStatus.classList.remove("is-error");
          }
          success.focus({ preventScroll: true });
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (sending) return;

        var invalid = [];
        form.querySelectorAll("[required]").forEach(function (field) {
          if (!validateField(field)) invalid.push(field);
        });

        if (invalid.length) {
          if (status) {
            status.hidden = false;
            status.textContent = "Certaines informations sont manquantes ou invalides. Vérifiez les champs signalés.";
          }
          var first = invalid[0];
          first.focus({ preventScroll: true });
          first.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        if (status) status.hidden = true;

        /* Le récapitulatif est composé avant l'envoi : il sert de copie de
           secours si le réseau ou le service fait défaut. */
        var summaryArea = panel ? panel.querySelector("[data-copy-summary-text]") : null;
        if (summaryArea) summaryArea.value = composeMessage(form);

        if (typeof window.fetch !== "function") {
          sendFailed(new Error("fetch indisponible"));
          return;
        }

        var controller = typeof window.AbortController === "function" ? new AbortController() : null;
        var timer = controller
          ? window.setTimeout(function () { controller.abort(); }, FORM_ENDPOINT.timeout)
          : null;

        setSending(true);

        window.fetch(formEndpointUrl(), {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(buildPayload(form)),
          signal: controller ? controller.signal : undefined
        })
          .then(function (response) {
            return response.text().then(function (text) {
              var data = null;
              try { data = JSON.parse(text); } catch (e) { data = null; }
              if (!response.ok) {
                throw new Error((data && data.message) || "HTTP " + response.status);
              }
              /* Seul un succès explicite de FormSubmit vaut confirmation :
                 une réponse inattendue reste traitée comme un échec. */
              if (!data || typeof data !== "object" || String(data.success).toLowerCase() !== "true") {
                throw new Error((data && data.message) || "Réponse inattendue du service d'envoi");
              }
              return data;
            });
          })
          .then(function () {
            if (timer) window.clearTimeout(timer);
            sendSucceeded();
          })
          .catch(function (error) {
            if (timer) window.clearTimeout(timer);
            sendFailed(error);
          });
      });

      var reset = panel ? panel.querySelector("[data-form-reset]") : null;
      if (reset) {
        reset.addEventListener("click", function () {
          if (success) success.hidden = true;
          form.hidden = false;
          if (copyButton) {
            copyButton.textContent = "Copier les réponses";
            copyButton.classList.remove("is-copied");
          }
          if (copyStatus) {
            copyStatus.textContent = "";
            copyStatus.classList.remove("is-error");
          }
          form.querySelector("input, select, textarea").focus();
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
  }

  /* --------------------------------------------------------------------- */
  /* 5. Divers                                                              */
  /* --------------------------------------------------------------------- */

  function initMisc() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    var cookieButton = document.querySelector("[data-cookie-settings]");
    if (cookieButton) {
      cookieButton.addEventListener("click", function () {
        try { window.localStorage.removeItem(ANALYTICS.storageKey); } catch (e) { /* ignore */ }
        currentConsent = null;
        buildConsentBanner();
        var banner = document.querySelector(".consent");
        if (banner) banner.classList.add("is-visible");
      });
    }
  }

  function initAthleteRail() {
    var rail = document.querySelector("[data-athletes-rail]");
    if (!rail) return;

    var prev = document.querySelector("[data-rail-prev]");
    var next = document.querySelector("[data-rail-next]");

    function step() {
      var card = rail.querySelector(".athlete");
      if (!card) return Math.round(rail.clientWidth * 0.8);
      var gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
      return Math.round(card.getBoundingClientRect().width + gap);
    }

    function sync() {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    }

    function go(direction) {
      var left = direction * step();
      if (typeof rail.scrollBy === "function") {
        rail.scrollBy({ left: left, behavior: "smooth" });
      } else {
        rail.scrollLeft += left;
      }
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    rail.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    });

    // Glisser à la souris, sans gêner le tactile (le navigateur le fait déjà).
    var down = false;
    var startX = 0;
    var startLeft = 0;

    rail.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") return;
      down = true;
      startX = event.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add("is-dragging");
      if (rail.setPointerCapture) rail.setPointerCapture(event.pointerId);
    });

    rail.addEventListener("pointermove", function (event) {
      if (!down) return;
      rail.scrollLeft = startLeft - (event.clientX - startX);
    });

    function stopDrag(event) {
      if (!down) return;
      down = false;
      rail.classList.remove("is-dragging");
      if (event && rail.releasePointerCapture && rail.hasPointerCapture && rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }
    }

    rail.addEventListener("pointerup", stopDrag);
    rail.addEventListener("pointercancel", stopDrag);
    rail.addEventListener("pointerleave", stopDrag);

    sync();
  }

  ready(function () {
    initHeader();
    initDrawer();
    initFitLines();
    initDrawings();
    initReveal();
    initSectionRail();
    initScrollProgress();
    initCardSpotlight();
    initAthleteRail();
    initForms();
    initMisc();
    buildConsentBanner();
    updateCookieButton();
    if (currentConsent === "granted") loadAnalytics();
    bindTracking();
  });
})();
