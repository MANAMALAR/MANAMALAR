(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     INTRO LOGO REVEAL
     --------------------------------------------------------------------- */
  function runIntro() {
    var loader = document.getElementById("introLoader");
    if (!loader) return;
    document.body.classList.add("no-scroll");
    document.body.classList.add("intro-active");

    var holdTime = prefersReducedMotion ? 80 : 3430;
    var transitionTime = prefersReducedMotion ? 120 : 550;

    setTimeout(function () {
      loader.classList.add("transition");
      document.body.classList.remove("intro-active");
      document.body.classList.add("intro-complete");
      setTimeout(function () {
        loader.classList.add("hide");
        document.body.classList.remove("no-scroll");
        setTimeout(function () {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 700);
      }, transitionTime);
    }, holdTime);
  }

  /* ---------------------------------------------------------------------
     NAVBAR + MOBILE MENU
     --------------------------------------------------------------------- */
  var navbar = document.getElementById("navbar");
  function onScrollNav() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Smooth-scroll for in-page anchors (accounts for sticky navbar height) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var targetId = a.getAttribute("href");
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navH = navbar ? navbar.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ---------------------------------------------------------------------
     STICKY BOOK BAR
     --------------------------------------------------------------------- */
  var stickyBook = document.getElementById("stickyBook");
  var bookingSection = document.getElementById("booking");
  function onScrollSticky() {
    if (!stickyBook || !bookingSection) return;
    var rect = bookingSection.getBoundingClientRect();
    var pastBooking = rect.top < -200 || rect.bottom < 0;
    var beforeHero = document.getElementById("home").getBoundingClientRect().bottom > 0;
    stickyBook.classList.toggle("visible", window.scrollY > 500 && !beforeHero);
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      stickyBook.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", onScrollSticky, { passive: true });

  /* ---------------------------------------------------------------------
     REVEAL ON SCROLL
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------------------------------------------------------------------
     FAQ ACCORDION
     --------------------------------------------------------------------- */
  document.querySelectorAll(".faq-question").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------------------------------------------------------------------
     VALIDATION HELPERS
     --------------------------------------------------------------------- */
  function normalizePhone(raw) {
    var digits = String(raw || "").replace(/[^\d]/g, "");
    if (digits.length === 12 && digits.indexOf("91") === 0) digits = digits.slice(2);
    if (digits.length === 11 && digits.indexOf("0") === 0) digits = digits.slice(1);
    return digits;
  }
  function isValidIndianPhone(raw) {
    var digits = normalizePhone(raw);
    return /^[6-9]\d{9}$/.test(digits);
  }
  function isValidAge(raw) {
    var n = Number(raw);
    return Number.isFinite(n) && n >= 1 && n <= 110;
  }
  function isSunday(dateStr) {
    if (!dateStr) return false;
    var parts = dateStr.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.getDay() === 0;
  }
  function isValidAppointmentDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    var parts = dateStr.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 && date.getDate() === parts[2];
  }
  function showFieldError(input, show) {
    var wrap = input.closest(".form-group");
    if (!wrap) return;
    var err = wrap.querySelector(".field-error");
    input.classList.toggle("invalid", !!show);
    if (err) err.classList.toggle("show", !!show);
  }

  /* ---------------------------------------------------------------------
     APPOINTMENT / BOOKING FORM
     --------------------------------------------------------------------- */
  var form = document.getElementById("appointmentForm");
  if (form) {
    var statusBox = document.getElementById("formStatus");
    var submitBtn = document.getElementById("submitBtn");
    var submitLabel = document.getElementById("submitLabel");
    var submitSpinner = document.getElementById("submitSpinner");
    var successPanel = document.getElementById("successPanel");
    var whatsappBtn = document.getElementById("whatsappContinueBtn");
    var bookAnotherBtn = document.getElementById("bookAnotherBtn");
    var isSubmitting = false;

    var fields = {
      fullName: document.getElementById("fullName"),
      phone: document.getElementById("phone"),
      age: document.getElementById("age"),
      concern: document.getElementById("concern"),
      preferredDate: document.getElementById("preferredDate"),
      sessionType: document.getElementById("sessionType"),
      message: document.getElementById("message")
    };
    var sessionClosedNote = document.getElementById("sessionClosedNote");

    function updateSessionAvailability() {
      var sunday = isSunday(fields.preferredDate.value);
      fields.sessionType.disabled = sunday;
      if (sunday) fields.sessionType.value = "";
      if (sessionClosedNote) sessionClosedNote.classList.toggle("show", sunday);
      showFieldError(fields.sessionType, false);
    }

    fields.preferredDate.addEventListener("input", function () {
      showFieldError(fields.preferredDate, fields.preferredDate.value && !isValidAppointmentDate(fields.preferredDate.value));
      updateSessionAvailability();
    });
    fields.preferredDate.addEventListener("change", updateSessionAvailability);
    fields.sessionType.addEventListener("change", function () {
      showFieldError(fields.sessionType, false);
    });
    updateSessionAvailability();

    function setStatus(type, message) {
      if (!statusBox) return;
      statusBox.className = "form-status show " + type;
      statusBox.innerHTML =
        (type === "success"
          ? '<i class="fas fa-circle-check"></i>'
          : '<i class="fas fa-triangle-exclamation"></i>') +
        "<span>" + message + "</span>";
    }
    function clearStatus() {
      if (!statusBox) return;
      statusBox.className = "form-status";
      statusBox.innerHTML = "";
    }

    function validateForm() {
      var valid = true;

      if (!fields.fullName.value.trim()) { showFieldError(fields.fullName, true); valid = false; }
      else showFieldError(fields.fullName, false);

      if (!isValidIndianPhone(fields.phone.value)) { showFieldError(fields.phone, true); valid = false; }
      else showFieldError(fields.phone, false);

      if (!isValidAge(fields.age.value)) { showFieldError(fields.age, true); valid = false; }
      else showFieldError(fields.age, false);

      if (!isValidAppointmentDate(fields.preferredDate.value)) {
        showFieldError(fields.preferredDate, true);
        valid = false;
      } else {
        showFieldError(fields.preferredDate, false);
      }

      if (!isSunday(fields.preferredDate.value) && !fields.sessionType.value) {
        showFieldError(fields.sessionType, true);
        valid = false;
      } else {
        showFieldError(fields.sessionType, false);
      }

      return valid;
    }

    function setLoading(loading) {
      isSubmitting = loading;
      submitBtn.disabled = loading;
      submitLabel.style.display = loading ? "none" : "inline-flex";
      submitSpinner.classList.toggle("show", loading);
      if (submitLabel) submitLabel.innerHTML = loading ? "" : '<i class="fas fa-calendar-check"></i> Book Appointment';
    }

    function buildWhatsappMessage(data) {
      var text =
        "\ud83d\udcc5 New Appointment Request\n\n" +
        "\ud83d\udc64 Name: " + data.fullName + "\n" +
        "\ud83d\udcde Phone: " + data.phone + "\n" +
        "\ud83c\udf82 Age: " + data.age + "\n" +
        "\ud83e\ude7a Concern: " + (data.concern || "Not specified") + "\n" +
        "\ud83d\udcc5 Preferred Date: " + data.preferredDate + "\n" +
        "\ud83c\udfdb Session Type: " + (data.sessionType || "Clinic closed - no session") + "\n" +
        "\ud83d\udcdd Message: " + (data.message || "None");
      return text;
    }

    function openWhatsapp(url) {
      var win = null;
      try {
        win = window.open(url, "_blank", "noopener");
      } catch (e) {
        win = null;
      }
      return win;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSubmitting) return;
      clearStatus();

      if (!validateForm()) {
        setStatus("error", "Please correct the highlighted fields above before submitting.");
        return;
      }

      var data = {
        fullName: fields.fullName.value.trim(),
        phone: fields.phone.value.trim(),
        age: fields.age.value.trim(),
        concern: fields.concern.value,
        preferredDate: fields.preferredDate.value,
        sessionType: fields.sessionType.value,
        message: fields.message.value.trim()
      };

      var appsScriptUrl = (typeof CONFIG !== "undefined" && CONFIG.APPS_SCRIPT_URL) || "";
      var whatsappNumber = (typeof CONFIG !== "undefined" && CONFIG.WHATSAPP_NUMBER) || "919487413221";
      var whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(buildWhatsappMessage(data));

      if (!appsScriptUrl || appsScriptUrl.indexOf("PASTE_YOUR") === 0) {
        // Not configured yet — fail clearly instead of pretending to succeed.
        setStatus(
          "error",
          "Online booking isn't fully set up yet. Please call " +
            ((typeof CONFIG !== "undefined" && CONFIG.CLINIC_PHONE_1) || "9940879221") +
            " or message us on WhatsApp to book your appointment."
        );
        return;
      }

      setLoading(true);

      fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json(); })
        .catch(function () { return { success: false }; })
        .then(function (result) {
          setLoading(false);
          if (result && result.success) {
            form.style.display = "none";
            clearStatus();
            successPanel.classList.add("show");
            whatsappBtn.setAttribute("href", whatsappUrl);
            var popup = openWhatsapp(whatsappUrl);
            if (!popup) {
              whatsappBtn.textContent = "";
              whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Open WhatsApp';
            }
          } else {
            setStatus(
              "error",
              "Something went wrong while submitting your appointment. Please try again, or contact us directly at 9940879221 / WhatsApp 9487413221."
            );
          }
        });
    });

    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener("click", function () {
        successPanel.classList.remove("show");
        form.reset();
        form.style.display = "block";
        clearStatus();
        Object.keys(fields).forEach(function (k) { showFieldError(fields[k], false); });
        updateSessionAvailability();
      });
    }
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    runIntro();
    onScrollNav();
    onScrollSticky();
  });
})();
