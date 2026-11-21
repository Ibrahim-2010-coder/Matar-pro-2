/* ═══════════════════════════════════════════════════════════════════════════
   مَطَر برو — app.js
   المحرك التطبيقي الأساسي: الطقس والبيانات والترجمة والحسابات والصوت والواجهات
   ─────────────────────────────────────────────────────────────────────────
   المحتويات (بالترتيب):
     1) حماية الشعار الاحتياطية الذكية (img.mlogo-img ← الشعار المتجهي v59)
        [كانت سكربتًا داخليًا في <head> — مستمع التقاط + فحص استدراكي عند DOMContentLoaded]
     2) سنة الحقوق التلقائية في التذييل (#foot-year)
        [كانت الجزء الأول من سكربت <head> الرابع — الجزء الثاني (محمّل Leaflet
         الاحتياطي window.matarLeafletReady) انتقل إلى map.js §2]
     3) السكربت الرئيسي كاملًا (كان كتلة index.html الخامسة الكبرى) عدا المقاطع
        الخريطية الست المنقولة حرفيًا إلى map.js وقواميس الترجمة الخمسة المنقولة
        حرفيًا إلى i18n.js (LOCALES · I18N_KEYS · I18N · DEMO_NOTICE · I18N_EXTRA):
          · بنية الأساسات (BASE_PROVIDERS … addWindyBase)        → map.js §3
          · الخريطة المصغرة داخل Dashboard                        → map.js §4
          · وحدة Nowcast — الرادار اللحظي                          → map.js §5
          · وحدة MX — الخريطة التفاعلية الكبرى + window.MX         → map.js §6
          · وحدة Roads — طقس الطرق والسفر (مسارات + زحمة + استراحات) → map.js §7
          · كتلة الإقلاع boot()                                    → map.js §12
        مع ثلاث نقاط تكييف موثقة في المتن تحافظ على السلوك 100٪:
          أ) تصريحات miniMap/miniMarker/miniRadar صارت داخل غلاف
             window.__matarMiniMapWidget في map.js (نفس الأسطر حرفيًا)
          ب) Dashboard ← ensureMiniMap(place) صار window.__matarMiniMapWidget.ensure(place)
          ج) Dashboard ← miniMap.invalidateSize() صار window.__matarMiniMapWidget.invalidate(80)
     4) جسر القراءة window.__matarBridge لسكربتات v المرفقة
        [كان داخل boot — يُنشأ هنا قبل تقييم سكربتات v تمامًا كالأصل]
     5) سكربتات الإصدارات التطبيقية بترتيبها الأصلي:
          v29 (حزمة الميزات الذكية) · v47 (ترقية التوقعات والأنشطة) ·
          v48b (محرك النطق الموحد) · v48 (الطقس البصري والسمعي) ·
          v49 (منظّم تسريع الأداء) · v51 (المركز الموسمي + جوّك اليوم) ·
          v52 (طقس المزارعين + الشعار) · v53/v54 (الصوت بلا تداخل) ·
          v62 (نافذة السيرة الذاتية للمطوّر)
        [أما v46 وv55 وv66 وv67 الخريطية فكلها داخل map.js §§8-11]

   ترتيب التحميل الإلزامي داخل index.html (نهاية <body>):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" …></script>
     <script src="./i18n.js"></script>  ← أولًا: قواميس الترجمة الخمسة مركّبة على window
     <script src="./app.js"></script>   ← ثانيًا: هذا الملف (المحرك + دوال tr/tf/tx)
     <script src="./map.js"></script>   ← ثالثًا: الخرائط والطبقات ثم boot() أخيرًا

   ما يبقى داخل index.html عمدًا (سكربتات موضعية حرجة لا تُنقل):
     • سكربت <head> الأول (7 أسطر): ضبط data-theme من localStorage قبل أول رسم —
       نقله إلى ملف خارجي يعني وميض ثيم خاطئ عند كل فتح، وهو نمط قياسي متعمد.
     • ترويسة CSP و<link> الخاصة بـ style.css وleaflet.css كما هي.

   ملاحظات النشر (مهمة):
     • v69 (منجز): قواميس الترجمة الخمسة (LOCALES · I18N_KEYS · I18N · DEMO_NOTICE ·
       I18N_EXTRA) انتقلت حرفيًا إلى ملف ./i18n.js المستقل وتُركّب على window —
       كل مراجعها هنا تعمل بلا أي تغيير عبر النطاق العام (i18n.js يُحمَّل قبل هذا
       الملف)، وكتل Object.assign(I18N_EXTRA, …) في سكربتات v تمدّد الكائن نفسه.
     • v70 (منجز — إصلاحات مراجعة الجودة):
         C-01 توحيد وصف السحب: wmoDesc تقبل cloud_cover وأي رمز 0/1/2 مع
             تغطية ≥ 85٪ يوصَف «غائمًا» (cloudFixCode) — البطل والخلاصة وبطاقة
             14 يومًا (متوسط ساعات اليوم) والشريط الساعي والودجت والنشرة
             الصوتية وبطاقات المشاركة وحقائق LLM.
         C-02 خصم السحب من مؤشر تجفيف الملابس (laundryCloudPenalty) في بطاقة
             النشاط وفي laundryScore بجوّك اليوم — لا 100٪ مع سحب 100٪.
         C-03 قطع نصوص المستشار الذكي عند آخر ترقيم كامل عبر smartCut بدل
             القطع الثابت — لا كلمة مبتورة أبدًا (الخلاصة + النطق + المشاركة).
         C-04 شارة مقارنة الأمس تعرض «نفس حرارة أمس» عند فرق < 0.5° بدل
             «أدفأ من أمس بـ 0°» (الشارة + النشرة الصوتية + بطاقة القصة).
         C-05 خلية «الآن» في الشريط الساعي تعرض current.temperature_2m نفسها
             المعروضة في البطل بالضبط.
         H-01 منع تكرار اسم المدينة في المستشار الزراعي عبر placeLine
             (وتصلح placeLabel تلقائيًا أيضًا).
         H-03 معايرة مؤشر الأنشطة: منحنى راحة غاوسي لكل نشاط بقيم مثالية
             مختلفة + عوامل رطوبة/رياح/سحب/UV متمايزة — لا 6 أنشطة بنسبة 100٪.
         M-03 «آخر تحديث» من طابع المزوّد (current.time بتوقيت المدينة) أو
             لحظة آخر جلب ناجح بمنطقة المدينة — لا فرق دقائق غير منطقي.
     • v70: وضع تسريع الأجهزة الاقتصادية (Low-End Auto-Optimization) — صنف
       "low-end" تلقائيًا على <html> عند navigator.deviceMemory ≤ 4 أو
       navigator.hardwareConcurrency ≤ 4 (مثل Samsung A03s)، مع علم
       window.__matarLowEnd وقواعد حركات مخففة مدمجة، ويُقرأ من style.css
       لأي تحسينات إضافية عبر html.low-end. للنشر: ارفع إصدار sw.js
       (مثل matar-pro-v70) بعد اعتماد هذا الملف.
     • المعرفات العامة الجديدة في v70 (متاحة أيضًا لسكربتات v عبر
       __matarBridge): cloudFixCode · dailyCloudAvg · laundryCloudPenalty ·
       placeLine · smartCut · window.__matarLowEnd

     • v68 (منجز): أيقونات الإشعارات صارت "/Matar-pro-2/icons/icon-192.png" بلا لاحقة
       ?v=24 كي يطابق الطلب مفتاح الكاش في APP_SHELL ويعمل الإشعار أوفلاين 100٪،
       وفحص CSS الذاتي (?selftest=1) صار يقرأ document.styleSheets (المضمّنة
       والخارجية معًا) بدل عناصر <style> حصرًا — لأن الـ CSS انتقل إلى ./style.css.
     • CSP: أضف 'self' إلى script-src (بصمات SHA-256 للسكربتات المنقولة لم تعد
       مطلوبة — يمكن الإبقاء عليها بلا ضرر أو حذفها لتنظيف الترويسة).
     • sw.js: أضف "./i18n.js" و"./app.js" و"./map.js" و"./style.css" إلى APP_SHELL
       وارفع الإصدار (منجز في v69: matar-pro-v69 مع الأيقونات الخمس القياسية).
     • المعرفات العامة التي يقرأها map.js من هذا الملف (ولا يعيد تعريفها):
       $ · $$ · clamp · HOUR · SELFTEST · state · Eco · tr · tf · tx · isAr ·
       localNum · escapeHtml · tempText · clockText · wmoDesc · wmoSvg ·
       windDirName · iconSvg · weatherTime · placeDateFormatter · placeClock ·
       hourIndexFor · hourIndexAtPlace · pairWeatherList · palestineFixText ·
       activeLocale · currentLanguage · setNavH · showPage · PAGES ·
       searchEgyptPlaces · searchRoadAddresses · nominatimGate · placeLabel ·
       getJson · applyTheme · applyUnitUI · applyLanguage · loadSavedPlace ·
       updateLocChips · loadMainData · runSelfTestSuite · Notif · Dashboard
     • وهذا الملف بدوره يصل (وقت التشغيل فقط، بعد تحميل map.js) إلى:
       MX · Nowcast · Roads · window.MX · window.__matarMiniMapWidget ·
       window.MatarV67 · window.matarCountryLabels · window.__matarVeh
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/* ═══════════════════ 0) v70 — تسريع الأجهزة الاقتصادية تلقائيًا ═══════════════════ */

      /* ══ v70: وضع تسريع الأجهزة الاقتصادية (Low-End Auto-Optimization) ══
         أول ما ينفَّذ في الملف قبل أي شيء آخر: الأجهزة محدودة الموارد (مثل
         Samsung A03s — ذاكرة ≤ 4GB أو أنوية ≤ 4) تحصل على صنف "low-end"
         على <html> فورًا، فتُخفَّض الحركات والانتقالات عبر CSS قبل أول رسم.
         الفحص آمن تمامًا في كل المتصفحات: navigator.deviceMemory متاح في
         كروم فقط ويعود undefined في غيره (فتسقط المقارنة بلا أي خطأ)، بينما
         navigator.hardwareConcurrency مدعوم على نطاق واسع.
         تُضاف معه قواعد تسريع احتياطية مدمجة تعمل فورًا حتى قبل تحديث
         style.css، ولا تتعارض مع أي قواعد html.low-end أغنى تُضاف لاحقًا. */
      (function () {
        try {
          var mem = navigator.deviceMemory;          // بالجيجابايت — undefined خارج كروم
          var cores = navigator.hardwareConcurrency; // عدد أنوية المعالج
          var lowEnd = (typeof mem === "number" && mem <= 4) || (typeof cores === "number" && cores <= 4);
          try { window.__matarLowEnd = !!lowEnd; } catch (e2) {} // علم عام لسكربتات v وmap.js
          if (lowEnd) {
            document.documentElement.classList.add("low-end");
            var st = document.createElement("style");
            st.textContent = "html.low-end *,html.low-end *::before,html.low-end *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important;scroll-behavior:auto!important}"
              + "html.low-end .ai-caret{animation:none!important;opacity:1}";
            document.head.appendChild(st);
          }
        } catch (e) { /* فحص المعدات اختياري — لا يعطّل الإقلاع أبدًا */ }
      })();


/* ═══════════════════ 1) حماية الشعار الاحتياطية ═══════════════════ */

      /* ══ v60: الحماية الاحتياطية الذكية لشعار ./icons/logo.png ══
         إن تعذّر تحميل الصورة الرسمية لأي سبب (ملف غائب أو انقطاع شبكة بلا كاش)
         يُعرض الشعار المتجهي الأنيق (هوية v59 الرياحية) تلقائيًا في مكانها في
         الهيدر والسبلاش والقائمة الجانبية — ولا يظهر أي رمز صورة مكسورة أبدًا.
         التفعيل عبر addEventListener فقط اتساقًا مع CSP (بلا معالجات سطرية):
         ① مستمع التقاط على مستوى المستند يلتقط فشل أي img.mlogo-img فور حدوثه
            (يشمل الصور التي تُضاف ديناميكيًا لاحقًا).
         ② فحص استدراكي عند جاهزية DOM للصور التي فشلت قبل تسجيل المستمع
            (img.complete و naturalWidth = 0). */
      (function () {
        function showVector(img) {
          try {
            if (img && img.parentElement) img.parentElement.classList.add("mlogo-fb");
          } catch (e) { /* الزينة لا تكسر شيئًا أبدًا */ }
        }
        function guard(img) {
          if (!img) return;
          if (img.complete && img.naturalWidth === 0) return showVector(img);
          img.addEventListener("error", function () { showVector(img); }, { once: true });
        }
        document.addEventListener("error", function (event) {
          var target = event && event.target;
          if (target && target.tagName === "IMG" && target.classList && target.classList.contains("mlogo-img")) {
            showVector(target);
          }
        }, true);
        window.addEventListener("DOMContentLoaded", function () {
          try {
            var imgs = document.querySelectorAll("img.mlogo-img");
            for (var i = 0; i < imgs.length; i += 1) guard(imgs[i]);
          } catch (e) {}
        });
      })();
    

/* ═══════════════════ 2) سنة الحقوق في التذييل ═══════════════════ */

      /* المرحلة 10: سنة الحقوق التلقائية في التذييل — عنصر #foot-year موجود أعلاه مباشرة
         فتنفَّذ العبارة فورًا دون انتظار أي حدث */
      try {
        const footYear = document.getElementById("foot-year");
        if (footYear) footYear.textContent = String(new Date().getFullYear());
      } catch (e) {}

/* ═══════════════════ 3) السكربت الرئيسي التطبيقي ═══════════════════
   (كان الكتلة الخامسة داخل index.html — هنا بعد حذف المقاطع الخريطية الست
    المنقولة إلى map.js؛ علامات ┌…┘ في المتن تحدد مواضع النقل بدقة) ═══════════════════ */


      "use strict";

      /* ============================================================
         مَطَر برو — تطبيق الطقس المتكامل في ملف واحد
         البيانات: Open-Meteo (توقعات + جودة هواء) · الرادار: RainViewer
         الخرائط: Leaflet + Esri · المسارات: OSRM + بدائل · الجيوكود: Photon/Nominatim
         ============================================================ */

      /* ---------------- مساعدات عامة ---------------- */
      const $ = (sel, root = document) => root.querySelector(sel);
      const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const HOUR = 3600e3;

            /* v64: حُذف مفتاح «لوحات ألوان متقدمة» مع حذف لوحات الألوان كلها —
         لوحة Universal Blue القياسية (أزرق سماوي ← أخضر ← أصفر ← أحمر) ثابتة */

/* المرحلة 6: وضع الاختبار الذاتي — يُفعّل فقط عند فتح التطبيق بـ ?selftest=1
         ثابت منطقي يُحسب مرة واحدة: صفر أثر على الإقلاع الطبيعي */
      const SELFTEST = (() => {
        try { return new URLSearchParams(location.search).has("selftest"); } catch (e) { return false; }
      })();

      function escapeHtml(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      /* ══ v70 — C-03: قطع نص ذكي عند حد أقصى دون بتر أي كلمة ══
         بديل القطع الثابت (substring/slice) في نصوص المستشار الذكي:
         ① يقف عند آخر علامة ترقيم منتهية (نقطة . أو ! أو ؟ أو …) قبل الحد
            الأقصى ما دامت في الشطر المعقول (≥ 45٪ من الحد) — جملة كاملة.
         ② بلا ترقيم مفيد يقف عند آخر مسافة قبل الحد — حدود كلمة سليمة.
         ③ النص الأقصر من الحد يمر كما هو تمامًا. */
      function smartCut(text, maxLen) {
        const s = String(text ?? "");
        if (!Number.isFinite(maxLen) || maxLen <= 0 || s.length <= maxLen) return s;
        const cut = s.slice(0, maxLen);
        const m = cut.match(/[\s\S]*[.!؟?…]/); /* آخر ترقيم منتهٍ داخل الحد */
        if (m && m[0].length >= Math.max(12, Math.floor(maxLen * 0.45))) return m[0].trim();
        const sp = cut.lastIndexOf(" ");
        if (sp >= Math.max(8, Math.floor(maxLen * 0.3))) return cut.slice(0, sp).trim();
        return cut.trim();
      }


      function number(value, digits = 0) {
        return new Intl.NumberFormat(activeLocale(), { maximumFractionDigits: digits }).format(value);
      }

      const UNITS_KEY = "matar:unit";
      let tempUnit = "celsius";
      try { tempUnit = localStorage.getItem(UNITS_KEY) === "fahrenheit" ? "fahrenheit" : "celsius"; } catch (e) {}

      function tempC(celsius) {
        return tempUnit === "fahrenheit" ? celsius * 9 / 5 + 32 : celsius;
      }

      function tempText(celsius, withUnit = true) {
        if (celsius == null || Number.isNaN(celsius)) return "—";
        return `${number(Math.round(tempC(celsius)))}°${withUnit ? tr(tempUnit === "celsius" ? "م" : "ف") : ""}`;
      }

      function localNum(value, digits = 0) {
        if (value == null || Number.isNaN(value)) return "—";
        return number(value, digits);
      }

      function placeClock(iso) {
        // تنسيق ساعة من نص ISO محلي للموقع نفسه دون تحويل مناطق زمنية
        const match = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!match) return "—";
        const [, year, month, day, hour, minute] = match;
        const wallClock = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute));
        return new Intl.DateTimeFormat(activeLocale(), {
          hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
        }).format(wallClock);
      }

      function clockText(date) {
        return placeDateFormatter({ hour: "numeric", minute: "2-digit", hour12: true }).format(date);
      }

      function dateDayText(date) {
        return placeDateFormatter({ weekday: "long", day: "numeric", month: "long" }).format(date);
      }

      function placeDateFormatter(options) {
        const zone = state?.wx?.timezone || state?.place?.timezone;
        if (zone) {
          try {
            return new Intl.DateTimeFormat(activeLocale(), { ...options, timeZone: zone });
          } catch (e) { /* منطقة زمنية غير صالحة: نستخدم منطقة الجهاز */ }
        }
        return new Intl.DateTimeFormat(activeLocale(), options);
      }

      const WEATHER_DESC = {
        0: "سماء صافية", 1: "صحو غالباً", 2: "غائم جزئياً", 3: "غائم",
        45: "ضباب", 48: "ضباب جليدي",
        51: "رذاذ خفيف", 53: "رذاذ", 55: "رذاذ كثيف", 56: "رذاذ متجمّد", 57: "رذاذ متجمّد كثيف",
        61: "أمطار خفيفة", 63: "أمطار متوسطة", 65: "أمطار غزيرة", 66: "مطر متجمّد", 67: "مطر متجمّد كثيف",
        71: "ثلوج خفيفة", 73: "تساقط الثلوج", 75: "ثلوج كثيفة", 77: "حبّات ثلج",
        80: "زخات مطر خفيفة", 81: "زخات مطر", 82: "زخات مطر غزيرة",
        85: "زخات ثلجية", 86: "زخات ثلجية كثيفة",
        95: "عواصف رعدية", 96: "عواصف رعدية وبَرَد", 99: "عواصف رعدية وبَرَد كثيف",
      };

      /* ══ v70 — C-01: توحيد وصف حالة السحب في كل الواجهة ══
         wmoDesc تقبل الآن وسيطًا ثانيًا اختياريًا: نسبة الغطاء السحابي (٪).
         أي رمز صافٍ/صحو/غائم جزئيًا (0/1/2) مع تغطية ≥ 85٪ يوصَف «غائمًا» —
         فلا يظهر «غائم جزئياً» أبدًا والسماء مغلقة تمامًا. كل الاستدعاءات
         القديمة بوسيط واحد تعمل بلا أي تغيير، وهذه صارت المصدر الموحّد
         للوصف: البطل والخلاصة وبطاقة 14 يومًا والشريط الساعي والودجت
         والنشرة الصوتية وبطاقات المشاركة وحقائق LLM — عبر cloudFixCode. */
      function cloudFixCode(code, cloudCover) {
        if (code == null) return code;
        if (cloudCover == null || !Number.isFinite(cloudCover)) return code;
        if (cloudCover >= 85 && (code === 0 || code === 1 || code === 2)) return 3;
        return code;
      }
      function wmoDesc(code, cloudCover) { return tr(WEATHER_DESC[cloudFixCode(code, cloudCover)] ?? "حالة جوية متغيرة"); }

      /* v70 — C-01: متوسط الغطاء السحابي ليومٍ من مصفوفة الساعات — يغذي بطاقة
         14 يومًا والمقارنات اليومية (يعود null عند غياب البيانات فلا يتغير الوصف) */
      function dailyCloudAvg(wx, dayIndex) {
        try {
          const h = wx?.hourly, day = wx?.daily?.time?.[dayIndex];
          if (!h?.time?.length || !day) return null;
          let sum = 0, n = 0;
          for (let i = 0; i < h.time.length; i += 1) {
            if (String(h.time[i]).slice(0, 10) !== day) continue;
            const v = h.cloud_cover?.[i];
            if (v != null) { sum += v; n += 1; }
          }
          return n ? sum / n : null;
        } catch (e) { return null; }
      }

      /* v70 — C-02: خصم السحب من مؤشر تجفيف الملابس — الغطاء السحابي يحجب
         الشمس ويبطئ التبخر: خصم تدريجي يبدأ من تغطية 30٪ ويبلغ 45 نقطة عند
         100٪ (أي أن أقصى درجة مع سماء مغلقة تمامًا 55٪) — وبغياب البيانات
         تحفّظ معتدل 0.85. تستخدمها بطاقة نشاط التجفيف وlaundryScore معًا. */
      function laundryCloudPenalty(cloudCover) {
        if (cloudCover == null || !Number.isFinite(cloudCover)) return 0.85;
        const c = clamp(cloudCover, 0, 100);
        if (c <= 30) return 1;
        return clamp(1 - ((c - 30) / 70) * 0.45, 0.55, 1);
      }

      /* المرحلة 4 — G-05: أيقونة SVG موحّدة بدل الإيموجي لكل أكواد الطقس (حادّة على أي دقة شاشة ومتنسقة مع لغة التطبيق البصرية) */
      function wmoSvg(code, isDay = 1, size = 20) {
        return iconSvg(iconForCode(code, isDay), size);
      }

      function iconSvg(kind, size = 30) {
        const icons = {
          sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
          cloud: '<path d="M20 16.2A4.8 4.8 0 0 0 18.3 7a6.4 6.4 0 0 0-12.1 1.9A4.6 4.6 0 0 0 7 18h11.3"/>',
          rain: '<path d="M20 15.3A4.8 4.8 0 0 0 18.3 6a6.4 6.4 0 0 0-12.1 1.9A4.6 4.6 0 0 0 7 17h11.3M8 20l-1 2m6-2-1 2m6-2-1 2"/>',
          snow: '<path d="M12 2v20m8.66-15-17.32 10m0-10 17.32 10M12 2l2 2m-2-2-2 2m10 3-3 .3m3-.3-1.2-2.7m-15.8 11 3-.3m-3 .3 1.2 2.7m14.8-2.7-1.2 2.7m1.2-2.7-3-.3M3.34 7l1.2-2.7m-1.2 2.7 3 .3"/>',
          storm: '<path d="M20 15.5A4.8 4.8 0 0 0 18.3 6a6.4 6.4 0 0 0-12.1 1.9A4.6 4.6 0 0 0 7 17h5l-2 5 7-8h-5l2-4"/>',
          fog: '<path d="M4 10h16M2 14h20M5 18h14M7 6h10"/>',
          moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
          pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
          water: '<path d="M12 3s7 7.1 7 12a7 7 0 1 1-14 0c0-4.9 7-12 7-12Z"/><path d="M9 17a3 3 0 0 0 3 2"/>',
          wind: '<path d="M3 8h13a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h7a3 3 0 1 1-3 3"/>',
          gauge: '<path d="M12 14l4-4"/><path d="M20.2 15a9 9 0 1 0-16.4 0"/><path d="M12 14h.01"/>',
          thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 11v6"/>',
          sunrise: '<path d="M12 2v7m0 0 3-3m-3 3-3-3M3 18h18M5 14a7 7 0 0 1 14 0m-17 8h20"/>',
          sunset: '<path d="M12 17V4m0 0 3 3m-3-3L9 7M3 18h18M5 14a7 7 0 0 1 14 0m-17 8h20"/>',
          eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
          partly: '<circle cx="17.2" cy="5.2" r="2.1"/><path d="M17.2 1.6v1M20.8 5.2h1M19.7 2.7l.7-.7M14.7 2.7l-.7-.7"/><path d="M20 16.2A4.8 4.8 0 0 0 18.3 7a6.4 6.4 0 0 0-12.1 1.9A4.6 4.6 0 0 0 7 18h11.3"/>',
          sprout: '<path d="M12 21v-8"/><path d="M12 13C12 9.5 9.4 7 5.5 7c0 3.5 2.5 6 6.5 6Z"/><path d="M12 11c0-3 2.3-5.2 6-5.2 0 3.4-2.3 5.2-6 5.2Z"/>',
          humid: '<path d="M8 4s4 4.4 4 7a4 4 0 1 1-8 0c0-2.6 4-7 4-7Z"/><path d="M16.5 12s3 3.3 3 5.2a3 3 0 1 1-6 0c0-1.9 3-5.2 3-5.2Z"/>',
          frost: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M12 3l-1.8 1.8M12 3l1.8 1.8M12 21l-1.8-1.8M12 21l1.8-1.8"/>',
          stock: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M7 14c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0"/>',
          fire: '<path d="M12 21c-3.3 0-5.5-2.2-5.5-5.2 0-2.4 1.6-4 2.9-5.7C10.6 8.5 11.2 6.6 11 4.5c3.2 1.7 5 4.3 4.5 7.3.9-.4 1.6-1.1 2-2.1 1.3 1.6 2 3.4 2 5.1 0 3.6-2.5 6.2-7.5 6.2Z"/><path d="M12 21c-1.8 0-3-1.2-3-2.9 0-1.5 1.1-2.5 2-3.8.4.9 1.1 1.4 2 1.7 1.2.5 2 1.3 2 2.4 0 1.6-1.2 2.6-3 2.6Z"/>',
          fungus: '<path d="M4 11a8 8 0 0 1 16 0Z"/><path d="M9.5 11c-.2 2.5-.8 5-2 7h9c-1.2-2-1.8-4.5-2-7"/><path d="M12 18v3"/>',
          target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
          dust: '<path d="M3 8h9a2.5 2.5 0 1 0-2.4-3.2"/><path d="M3 12h13a2.8 2.8 0 1 1-2.7 3.5"/><path d="M3 16h6"/><path d="M16.5 8.5h.01M20 12.5h.01M18.5 16.5h.01"/>',
          ok: '<circle cx="12" cy="12" r="9"/><path d="m8.2 12.4 2.6 2.6 5-5.6"/>',
          warn: '<path d="M12 3.5 21 19.5H3Z"/><path d="M12 9.5v4.5"/><path d="M12 17h.01"/>',
          run: '<circle cx="15" cy="4.3" r="1.7"/><path d="m9.5 20.5 2.6-3.4-2.4-2.7 3-3.9 2.5 2.8 3.3.4"/><path d="m12.7 10.5-3.2-1.6L6 10.6"/><path d="m9.7 14.4-3.5.6"/>',
          cycle: '<circle cx="5.8" cy="16.8" r="3.3"/><circle cx="18.2" cy="16.8" r="3.3"/><path d="M5.8 16.8 9.3 9h4.4l4.5 7.8"/><path d="m9.3 9 3.4 7.8h5.5"/><path d="M8 9h3"/>',
          swim: '<circle cx="16.5" cy="6.5" r="1.8"/><path d="M3 15c1.8-1.3 3.6-1.3 5.4 0s3.6 1.3 5.4 0 3.6-1.3 5.4 0"/><path d="m7 12 8-4.5"/>',
          car: '<rect x="3.5" y="13" width="17" height="5" rx="1.6"/><path d="M5.5 13 7 8.6A2 2 0 0 1 8.9 7h6.2a2 2 0 0 1 1.9 1.6L18.5 13"/><path d="M7 18v1.5M17 18v1.5M7.5 15.5h.01M16.5 15.5h.01"/>',
          ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2 16 10l-1.5 4.6h-5L8 10Z"/><path d="M12 3v4.2M3.3 9.8l4.7.2M6.9 20l2.6-4.4M17.1 20l-2.6-4.4M20.7 9.8l-4.7.2"/>',
          basket: '<path d="M4.5 9.5h15L18 20a1.6 1.6 0 0 1-1.6 1.3H7.6A1.6 1.6 0 0 1 6 20Z"/><path d="M8 9.5 11 3.8M16 9.5 13 3.8"/><path d="M9.5 13v4.5M14.5 13v4.5M12 13v4.5"/>',
          telescope: '<path d="m10.2 8.3 8.5-4.6 2 3.8-8.5 4.5Z"/><path d="m10.2 8.3 2 3.8 3.5-1.9"/><path d="m9 11.6-3.8 7"/><path d="m5.2 18.6 7.6 1.2"/><path d="m8.5 12.2-2-3.8 3.7-2"/>',
          chair: '<path d="M6.5 3.5V13"/><path d="M6.5 13h11v3.2"/><path d="M6.5 13v7.5"/><path d="M17.5 16.2v4.3"/>',
          /* إصدار 17: أيقونات مؤشر الملابس الذكي + محطات الاستراحة */
          coat: '<path d="M8.6 3.4 12 5.8l3.4-2.4 5 3.4-2.1 3.4-1.3-.9V21H7V9.3l-1.3.9L3.6 6.8Z"/><path d="M12 5.8V21"/><path d="M9.6 3.6a2.4 2.4 0 0 0 4.8 0"/>',
          jacket: '<path d="M8 3.6 11 6l1-1.6L13 6l3-2.4 4.4 3.2-2 3.2-1.4-.8V20H7V9.2l-1.4.8-2-3.2Z"/><path d="M12 4.4V20"/>',
          tshirt: '<path d="M7.5 4 11 5.6a1.6 1.6 0 0 0 2.9 0L17.5 4l3.6 3-2.1 2.7-1.5-.8V20H7.5V8.9l-1.5.8L3.9 7Z"/>',
          fuel: '<path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M3 21h12"/><path d="M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V9.8a2 2 0 0 0-.6-1.4L18.5 6.5"/><path d="M6 8h6v4H6Z"/>',
          crosshair: '<circle cx="12" cy="12" r="8"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
          /* إصدار 27: أيقونات المشاركة والإشعار والمفضلة */
          bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
          share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 10.7 7.2-4.2M8.4 13.3l7.2 4.2"/>',
          star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9L6.6 19.6l1.1-6L3.2 9.4l6.1-.8Z"/>',
          x: '<path d="M18 6 6 18M6 6l12 12"/>',
        };
        return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind] ?? icons.cloud}</svg>`;
      }

      function iconForCode(code, isDay = 1) {
        if (code === 0 || code === 1) return isDay ? "sun" : "moon";
        if (code === 2) return isDay ? "partly" : "cloud";
        if (code === 3) return "cloud";
        if (code === 45 || code === 48) return "fog";
        if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
        if ([95, 96, 99].includes(code)) return "storm";
        if (code >= 51) return "rain";
        return "cloud";
      }

      /* المرحلة 4 — G-05: أيقونات الأنشطة اليومية (SVG بخط التطبيق الموحد بدل الإيموجي) */
      const ACT_ICON_KINDS = { run: "run", cycle: "cycle", swim: "swim", drive: "car", football: "ball", laundry: "basket", stars: "telescope", sit: "chair" };

      function actIcon(key, size = 20) {
        return iconSvg(ACT_ICON_KINDS[key] ?? "sun", size);
      }

      const WIND_DIRS = [
        [11.25, "شمالية"], [33.75, "شمالية شرقية"], [56.25, "شمالية شرقية"], [78.75, "شرقية شمالية"],
        [101.25, "شرقية"], [123.75, "شرقية جنوبية"], [146.25, "جنوبية شرقية"], [168.75, "جنوبية شرقية"],
        [191.25, "جنوبية"], [213.75, "جنوبية غربية"], [236.25, "جنوبية غربية"], [258.75, "غربية جنوبية"],
        [281.25, "غربية"], [303.75, "غربية شمالية"], [326.25, "شمالية غربية"], [348.75, "شمالية غربية"],
      ];

      function windDirName(deg) {
        if (deg == null || Number.isNaN(deg)) return "—";
        const idx = Math.floor(((deg % 360) + 11.25) / 22.5) % 16;
        const raw = WIND_DIRS[idx]?.[1];
        return raw ? tr(raw) : "—";
      }

      function windArrow(deg) {
        if (deg == null || Number.isNaN(deg)) return "◎";
        const idx = Math.floor(((deg % 360) + 11.25) / 22.5) % 16;
        const raw = WIND_DIRS[idx]?.[1] ?? "";
        const labels = { شمالية: "↓", جنوبية: "↑", شرقية: "←", غربية: "→" };
        return labels[raw] || "◎";
      }

      function uvLabel(uv) {
        if (uv == null) return "—";
        if (uv < 3) return tr("منخفضة");
        if (uv < 6) return tr("متوسطة");
        if (uv < 8) return tr("مرتفعة");
        if (uv < 11) return tr("مرتفعة جدًا");
        return tr("متطرفة");
      }

      function aqiLabel(aqi) {
        if (aqi == null || Number.isNaN(aqi)) return null;
        if (aqi <= 50) return tr("جيدة");
        if (aqi <= 100) return tr("مقبولة");
        if (aqi <= 150) return tr("ضارة للحساسين");
        if (aqi <= 200) return tr("غير صحية");
        if (aqi <= 300) return tr("غير صحية جدًا");
        return tr("خطرة");
      }

      function weatherTime(value) {
        if (!value) return null;
        const normalized = value.endsWith("Z") ? value : `${value}:00Z`;
        const ts = Date.parse(normalized);
        return Number.isFinite(ts) ? ts : null;
      }

      /* ═══ إصلاح حرارة الطرق (أ) — فهرس ساعة الوصول بمطابقة نصية حتمية ═══
         كانت المعادلة السابقة ((p.eta + off − t0) / ساعة) صحيحة رياضيًا لكنها هشّة:
         أي خلل وحيد في أحد مدخلاتها الثلاثة (لحظة eta، أو إزاحة utc_offset_seconds،
         أو تحليل نص أول ساعة t0) — كما في نسخة مخبأة قديمة أو استجابة غير متوقعة —
         يُزيح الفهرس ساعات كاملة بصمت فتظهر حرارة فجرٍ بدل الظهيرة.
         الآن نبني «طابع الساعة المحلية» لنقطة الوصول بإطار UTC ثابت (نفس إطار نصوص
         h.time من Open-Meteo مع timezone=auto) ونبحث عنه نصيًا داخل المصفوفة نفسها —
         بلا أي حسابات تفاضلية تتراكم أخطاؤها. وإن فشلت المطابقة النصية نرجع لأقرب
         حساب تقريبي فقط كاحتياط أخير. */
      function hourIndexFor(h, eta, offMs) {
        if (!h?.time?.length) return 0;
        const d = new Date((eta ?? Date.now()) + (offMs ?? 0));
        const pad = (n) => String(n).padStart(2, "0");
        const stamp = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:00`;
        const exact = h.time.indexOf(stamp);
        if (exact >= 0) return exact;
        // المطابقة النصية فشلت (مصفوفة قديمة/متفرقة) — أقرب ساعة بالحساب التقريبي
        const t0 = weatherTime(h.time[0]);
        if (t0 == null) return 0;
        return clamp(Math.floor(((eta ?? Date.now()) + (offMs ?? 0) - t0) / HOUR), 0, h.time.length - 1);
      }

      /* ═══ إصلاح حرارة الطرق (ب) — إقران استجابات المواقع بالنقاط بالإحداثيات ═══
         طلب المواقع المتعددة يعيد مصفوفة بنفس ترتيب الإحداثيات المرسلة، لكن أي إعادة
         ترتيب من المزوّد كانت ستخلط حرارة كل نقطة مع جارتها بصمت. نتحقق من الإحداثيات
         ونعيد الإقران بالأقرب إن اختل الترتيب. */
      function pairWeatherList(list, pts) {
        const used = new Set();
        return pts.map((p) => {
          let best = -1, bd = Infinity;
          list.forEach((d, i) => {
            if (used.has(i)) return;
            const dist = Math.abs(d.latitude - p.lat) + Math.abs(d.longitude - p.lon);
            if (dist < bd) { bd = dist; best = i; }
          });
          if (best >= 0) used.add(best);
          return best >= 0 ? list[best] : null;
        });
      }

      async function getJson(url, signal) {
        const r = await fetch(url, { signal });
        if (!r.ok) { const err = new Error(`http ${r.status}`); err.status = r.status; throw err; }
        const data = await r.json();
        // المرحلة 13 — إصلاح جوهري: Open-Meteo قد يعيد HTTP 200 مع {error:true, reason:...}
        // عند فشل الطلب (معاملات أو حدود). نعامله كخطأ حقيقي كي يعمل مسار
        // الكاش/بيانات العرض بدل عرض شاشة محطمة بقيم ناقصة.
        if (data && typeof data === "object" && data.error === true) {
          const err = new Error(`api: ${data.reason || "unknown"}`);
          err.apiReason = data.reason;
          throw err;
        }
        return data;
      }
      /* ┌────────────────────────────────────────────────────────────────────┐
         │ بنية الأساسات الخريطية (BASE_PROVIDERS · ESRI_REF · ESRI_HILL_FAR · │
         │ basemapRegistry · themeBasemapWord · buildBasemapLayer · addBaseLayer │
         │ swapBasemap · refreshBasemapsTheme · WINDY_BASE · addWindyBase)       │
         │ انتقلت حرفيًا إلى map.js §3 — انظر ملف map.js                       │
         └────────────────────────────────────────────────────────────────────┘ */


      /* v70 — H-01: سطر موضع بلا تكرار — إن تطابق الاسمان (كالقاهرة، القاهرة)
         يُعرض الاسم مرة واحدة فقط، مع تجاهل فروق التشكيل والتطويل والمسافات
         وحالة الأحرف. sep يسمح بفاصل مختلف (مثل « · » في بطاقات المشاركة). */
      function placeLine(parts, sep = "، ") {
        const norm = (s) => String(s).toLowerCase()
          .replace(/[\u064B-\u0652\u0670]/g, "") /* التشكيل */
          .replace(/\u0640/g, "")                 /* التطويل */
          .replace(/\s+/g, " ").trim();
        const out = [];
        (Array.isArray(parts) ? parts : []).forEach((p) => {
          const v = String(p ?? "").trim();
          if (!v) return;
          if (out.some((o) => norm(o) === norm(v))) return;
          out.push(v);
        });
        return out.join(sep);
      }

      function placeLabel(place) {
        return placeLine([place?.name, place?.admin1, place?.country]);
      }

      /* ---------------- الحالة العامة ---------------- */
      const LS_PLACE = "matar:place";
      const state = {
        place: null,
        page: "dashboard",
        wx: null,        // بيانات التوقعات الرئيسية
        air: null,       // بيانات جودة الهواء
        wxKey: "",
        loadingWx: false,
        isDemoData: false,
        isCachedData: false,  // الأوفلاين: هل نعرض قراءة محفوظة؟
        cachedAt: 0,          // طابع زمني لآخر قراءة ناجحة
        lastUpdatedAt: 0,     // v70 — M-03: لحظة آخر جلب مباشر ناجح (لصياغة «آخر تحديث»)
      };

      const LANG_KEY = "matar:language";

      /* ─── v69: قواميس الترجمة الخمسة (LOCALES · I18N_KEYS · I18N · DEMO_NOTICE ·
         I18N_EXTRA) انتقلت حرفيًا إلى ملف ./i18n.js المستقل وتُركّب على window —
         وكل المراجع أدناه (في tr/tf/tx وactiveLocale وapplyLanguage وسكربتات v)
         تعمل بلا أي تغيير عبر النطاق العام، وكتل Object.assign(I18N_EXTRA, …)
         تمدّد الكائن نفسه فتظهر إضافاتها في كل اللغات فورًا. ─── */

      let currentLanguage = "ar";
      try {
        const savedLanguage = localStorage.getItem(LANG_KEY);
        if (LOCALES[savedLanguage]) currentLanguage = savedLanguage;
      } catch (e) {}
      function activeLocale() { return LOCALES[currentLanguage] || LOCALES.ar; }
      function tr(text) {
        const index = I18N_KEYS.indexOf(String(text));
        return I18N_EXTRA[String(text)]?.[currentLanguage]
          || (index >= 0 ? (I18N[currentLanguage]?.[index] || String(text)) : String(text));
      }
      // tf: ترجمة نص ديناميكي يحمل placeholders مثل {v} ثم تعويض القيم
      function tf(template, params = {}) {
        const tpl = tr(template);
        return tpl.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
      }
      // إصدار 15 — tx: نص ثنائي المصدر (عربي/إنجليزي) يمر عبر القاموس كي تحصل
      // اللغات الست كلها على ترجمة حقيقية بدل الإنجليزية الافتراضية.
      // يُستخدم بدل نمط «ar ? نص-عربي : نص-إنجليزي»: العربية تعطي النص الأصلي،
      // وأي لغة أخرى تبحث أولًا في I18N_EXTRA ثم تسقط إلى النص الإنجليزي.
      function tx(arText, enText) {
        if (isAr()) return arText;
        return I18N_EXTRA[String(arText)]?.[currentLanguage] || enText;
      }
      // تنسيق "منذ ..." بكل اللغات عبر Intl الرسمي
      function agoText(ts) {
        if (!ts) return "";
        try {
          const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
          const rtf = new Intl.RelativeTimeFormat(activeLocale(), { numeric: "auto" });
          if (mins < 60) return rtf.format(-mins, "minute");
          const hours = Math.round(mins / 60);
          if (hours < 36) return rtf.format(-hours, "hour");
          return rtf.format(-Math.round(hours / 24), "day");
        } catch (e) { return ""; }
      }
      // المرحلة 12: هل لغة الواجهة عربية؟ — دالة عامة تستخدمها الوحدات الجديدة كلها
      function isAr() { return currentLanguage === "ar"; }
      const originalText = new WeakMap(), originalAttrs = new WeakMap();
      function translateNode(node) {
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
        const raw = originalText.get(node), trimmed = raw.trim();
        if (!trimmed) return;
        node.nodeValue = raw.replace(trimmed, tr(trimmed));
      }
      function translateTree(root) {
        if (root.nodeType === Node.TEXT_NODE) { translateNode(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) translateNode(node);
        const elements = root.querySelectorAll ? [root, ...root.querySelectorAll("*")] : [root];
        elements.forEach((el) => ["placeholder", "title", "aria-label"].forEach((attr) => {
          if (!el.hasAttribute?.(attr)) return;
          let originals = originalAttrs.get(el);
          if (!originals) { originals = {}; originalAttrs.set(el, originals); }
          if (!(attr in originals)) originals[attr] = el.getAttribute(attr);
          el.setAttribute(attr, tr(originals[attr]));
        }));
      }
      function applyLanguage(language) {
        currentLanguage = LOCALES[language] ? language : "ar";
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
        // إصلاح الترجمة: عنوان التبويب خارج document.body فلا تلمسه translateTree — نترجمه هنا صراحةً
        const titleEl = document.querySelector("title");
        if (titleEl) titleEl.textContent = tr("مَطَر برو — تطبيق الطقس المتكامل");
        const picker = $("#language-select");
        if (picker) picker.value = currentLanguage;
        try { localStorage.setItem(LANG_KEY, currentLanguage); } catch (e) {}
        translateTree(document.body);
        document.dispatchEvent(new CustomEvent("matar:language"));
        if (state.wx && typeof Dashboard !== "undefined") Dashboard.render();
        // إصلاح 13: إعادة رسم صفحة المزارعين عند تغيير اللغة (حتى لو كانت مغلقة)
        if (state.wx && typeof Agri !== "undefined") Agri.render();
        // إعادة رسم نتيجة الطريق المخزنة بلغة الواجهة الجديدة
        if (typeof Roads !== "undefined" && Roads.rerender) Roads.rerender();
      }
      /* المرحلة 2 — علاج مراقب الترجمة (كان F-05): كان يعيد ترجمة كل عقدة مضافة على مستوى body
         بالكامل حتى والعربية هي اللغة المصدر. الآن: تخطٍ فوري في العربية + تجميع الدفعات
         في إطار رسم واحد (rAF) مع تجاهل العقد التي أُزيلت قبل جهوزية الإطار. */
      const pendingTranslate = [];
      let translateQueued = false;
      const languageObserver = new MutationObserver((records) => {
        if (currentLanguage === "ar") return; // العربية هي اللغة المصدر — لا عمل مطلوب إطلاقًا
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) pendingTranslate.push(node);
          }
        }
        if (translateQueued || !pendingTranslate.length) return;
        translateQueued = true;
        requestAnimationFrame(() => {
          translateQueued = false;
          const batch = pendingTranslate.splice(0);
          batch.forEach((node) => { if (node.isConnected) translateTree(node); });
        });
      });
      languageObserver.observe(document.body, { childList: true, subtree: true });

      function savePlace(place) {
        try { localStorage.setItem(LS_PLACE, JSON.stringify(place)); } catch (e) {}
      }

      function loadSavedPlace() {
        try {
          const raw = localStorage.getItem(LS_PLACE);
          if (!raw) return null;
          const p = JSON.parse(raw);
          if (p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) return p;
        } catch (e) {}
        return null;
      }

      /* ---------------- الوضع الداكن ووحدة الحرارة ---------------- */
      const themeBtn = $("#theme-toggle");
      function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        themeBtn.innerHTML = iconSvg(theme === "dark" ? "sun" : "moon", 16); // المرحلة 5: SVG بدل الإيموجي
        themeBtn.title = theme === "dark" ? tr("الوضع الفاتح") : tr("الوضع الداكن");
        // إصلاح 10: تحديث لون شريط المتصفح (theme-color) مع تبديل الوضع الداكن/الفاتح
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) themeColorMeta.setAttribute("content", theme === "dark" ? "#1c1b17" : "#f7f5ef");
        try { localStorage.setItem("matar:theme", theme); } catch (e) {}
        document.dispatchEvent(new CustomEvent("matar:theme"));
        refreshBasemapsTheme();
      }
      themeBtn.addEventListener("click", () => {
        applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
      });

      const unitBtn = $("#unit-toggle");
      function applyUnitUI() {
        unitBtn.textContent = tempUnit === "celsius" ? tr("°م") : tr("°ف");
        $$("[data-unit-setting]").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.unitSetting === tempUnit));
        });
      }
      function setTempUnit(unit) {
        tempUnit = unit === "fahrenheit" ? "fahrenheit" : "celsius";
        try { localStorage.setItem(UNITS_KEY, tempUnit); } catch (e) {}
        applyUnitUI();
        document.dispatchEvent(new CustomEvent("matar:unit"));
      }
      unitBtn.addEventListener("click", () => {
        setTempUnit(tempUnit === "celsius" ? "fahrenheit" : "celsius");
      });
      $$("[data-unit-setting]").forEach((button) => button.addEventListener("click", () => setTempUnit(button.dataset.unitSetting)));
      $("#language-select")?.addEventListener("change", (event) => applyLanguage(event.target.value));

      /* ---------------- التنقل بين الصفحات (المرحلة 12: عبر القائمة الجانبية) ---------------- */
      const PAGES = ["dashboard", "map", "agri", "roads", "monthly", "joq", "settings"];

      function showPage(page) {
        if (!PAGES.includes(page)) return;
        state.page = page;
        document.body.dataset.page = page; // لإخفاء الزر العائم فوق صفحة الخريطة عبر CSS
        $$(".view").forEach((v) => { v.hidden = v.id !== `page-${page}`; });
        $$(".drawer-link").forEach((t) => {
          const active = t.dataset.page === page;
          if (active) t.setAttribute("aria-current", "page");
          else t.removeAttribute("aria-current");
        });
        // إصلاح 2: الفحص القديم ("instant" in window) كان دائمًا false — استُبدل بسلوك صحيح ومباشر
        window.scrollTo({ top: 0, behavior: "auto" });
        Drawer.close(true); // أي تنقل يغلق القائمة الجانبية تلقائيًا
        if (page === "map") MX.show();
        else if (typeof MX !== "undefined" && MX.stop) MX.stop(); // إيقاف محرك الخريطة كليًا عند مغادرة الصفحة
        if (page === "agri") Agri.ensure();
        if (page === "roads") Roads.onShow();
        if (page === "dashboard") Dashboard.onShow();
        if (page === "monthly") Monthly.onShow();
        if (page === "joq") Joq.onShow(); // إصدار 19: لوحة جوّك اليوم
        Offline.update();
      }

      /* ارتفاع شريط التنقل كمتغير CSS كي تملاً صفحة الخريطة الشاشة بدقة دون تمرير */
      function setNavH() {
        const nav = $(".topnav");
        if (nav) document.documentElement.style.setProperty("--nav-h", `${Math.round(nav.offsetHeight)}px`);
      }
      window.addEventListener("resize", setNavH);
      window.addEventListener("orientationchange", setNavH);

      /* ============================================================
         المرحلة 12 — القائمة الجانبية المنسدلة (Sidebar Drawer)
         زر همبرغر ← انزلاق من جهة اليمين (RTL) مع طبقة تعتيم، إغلاق بـ X
         أو بالنقر خارجها أو بـ Escape، وحصر التركيز داخلها (Focus Trap)
         ============================================================ */
      const Drawer = (() => {
        const burger = $("#nav-burger");
        const drawer = $("#drawer");
        const overlay = $("#drawer-overlay");
        const closeBtn = $("#drawer-close");
        let lastFocus = null;

        const isOpen = () => drawer.classList.contains("open");

        function open() {
          lastFocus = document.activeElement;
          drawer.classList.add("open");
          drawer.setAttribute("aria-hidden", "false");
          overlay.classList.add("open");
          burger.setAttribute("aria-expanded", "true");
          burger.setAttribute("aria-label", tr("إغلاق القائمة"));
          document.documentElement.classList.add("drawer-lock");
          setTimeout(() => { ($(".drawer-link[aria-current='page']", drawer) || $(".drawer-link", drawer))?.focus(); }, 120);
        }

        function close(silent = false) {
          if (!isOpen()) return;
          drawer.classList.remove("open");
          drawer.setAttribute("aria-hidden", "true");
          overlay.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", tr("فتح القائمة"));
          document.documentElement.classList.remove("drawer-lock");
          if (!silent && lastFocus?.isConnected) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
        }

        burger?.addEventListener("click", () => (isOpen() ? close() : open()));
        closeBtn?.addEventListener("click", () => close());
        overlay?.addEventListener("click", () => close());
        // الضغط على أي رابط صفحة ينقل ويغلق القائمة تلقائيًا (showPage يستدعي close أيضًا)
        $$(".drawer-link").forEach((link) => link.addEventListener("click", () => showPage(link.dataset.page)));
        document.addEventListener("keydown", (e) => {
          if (!isOpen()) return;
          if (e.key === "Escape") { e.preventDefault(); close(); return; }
          if (e.key !== "Tab") return;
          // حصر التركيز (Focus Trap) داخل القائمة أثناء انفتاحها
          const focusables = $$("button, [href], input, select, [tabindex]:not([tabindex='-1'])", drawer)
            .filter((el) => !el.disabled && el.offsetParent !== null);
          if (!focusables.length) return;
          const first = focusables[0], last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });

        return { open, close, isOpen };
      })();

      /* ============================================================
         المرحلة 12 — شريط الأوفلاين البرتقالي + زر إعادة المحاولة العائم
         يظهر عند انقطاع الاتصال أو عند عرض قراءة محفوظة، ويكتب عمر
         آخر تحديث بصيغة «منذ ساعتين» ويوفر إعادة محاولة فورية جذابة
         ============================================================ */
      const Offline = (() => {
        const bar = $("#net-offline-bar");
        const barText = $("#net-offline-text");
        const floatBtn = $("#float-retry");
        let spinning = false;

        function setSpin(on) {
          spinning = on;
          [bar, floatBtn].forEach((root) => root?.querySelectorAll("svg").forEach((svg) => svg.setAttribute("data-spin", on ? "true" : "false")));
        }

        function update() {
          const offline = !navigator.onLine;
          const cached = state.isCachedData || state.isDemoData;
          const show = offline || cached;
          if (!bar || !floatBtn) return;
          bar.classList.toggle("hidden", !show);
          floatBtn.classList.toggle("hidden", !show);
          /* إصدار 34: قياس ارتفاع الشريط الظاهر وتغذيته كمتغير --off-h-meas
             كي ترتفع صفحة الخريطة المثبتة (fixed) بمقداره بدل أن تُدسّ
             نهايتها السفلية أسفل الشاشة — وينعدم المتغير في وضع Zen */
          try {
            const bh = show && !document.documentElement.classList.contains("wx-zen")
              ? (Math.round(bar.getBoundingClientRect().height) || 0) : 0;
            document.documentElement.style.setProperty("--off-h-meas", `${bh}px`);
            document.documentElement.classList.toggle("off-bar-open", !!(show && bh > 0));
          } catch (e) { /* القياس اختياري — الوضع القديم يبقى سليمًا */ }
          if (!show) return;
          const when = state.cachedAt ? agoText(state.cachedAt) : "";
          if (offline) {
            barText.textContent = tf("أنت غير متصل بالإنترنت — تُعرض آخر قراءة محفوظة ({when}).", { when: when || tr("الآن") });
          } else {
            barText.textContent = tf("أنت تتصفح طقسًا غير مباشر — آخر تحديث {when}.", { when: when || tr("الآن") });
          }
        }

        async function retry() {
          if (spinning) return;
          setSpin(true);
          try {
            await loadMainData(true);
          } finally {
            setTimeout(() => { setSpin(false); update(); }, 650);
          }
        }

        $("#bar-retry")?.addEventListener("click", retry);
        floatBtn?.addEventListener("click", retry);
        window.addEventListener("online", () => { update(); });
        window.addEventListener("offline", () => { update(); });
        document.addEventListener("matar:data", update);
        document.addEventListener("matar:offline", update);
        document.addEventListener("matar:language", () => setTimeout(update, 60));
        // تحديث دوري لنص «منذ ...» كل دقيقة كي لا يجمَد العمر المعروض
        setInterval(update, 60_000);
        return { update, retry };
      })();

      $$(".drawer-link").forEach((link) => { /* الاحتياط: أي رابط مستقبلي يُربط هنا */ });

      /* ---------------- البحث الذكي ---------------- */
      const searchForm = $("#search-form");
      const searchInput = $("#search-input");
      const searchGo = $("#search-go");
      const searchResults = $("#search-results");
      const geoBtn = $("#geo-btn");
      let searchController = null;
      let activeOption = -1; // إصلاح N-04: فهرس الخيار النشط في قائمة نتائج البحث
      const searchCache = new Map();
      let lastNominatimAt = 0;
      let nominatimQueue = Promise.resolve();

      function mergePlaces(places) {
        const seen = new Set();
        return places.filter((p) => {
          const key = `${Number(p.latitude).toFixed(3)}:${Number(p.longitude).toFixed(3)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      /* ══ v55 — تخصيص النتائج الجغرافية (Geocoding Naming Policy) ══
         أي ذكر لـ «إسرائيل / Israel» في نتائج البحث والتحديد العكسي يُستبدل
         تلقائيًا بعبارة «فلسطين المحتلة / Occupied Palestine» بكل لغات الواجهة
         السبع — مطبق على مزودي البحث الثلاثة (Open-Meteo وPhoton وNominatim)
         وعلى أسماء النقاط المحددة من الخريطة وGPS */
      function palestineLabel() {
        const l2 = (document.documentElement.lang || "ar").slice(0, 2).toLowerCase();
        return ({
          ar: "فلسطين المحتلة", en: "Occupied Palestine", fr: "Palestine occupée",
          de: "Besetztes Palästina", es: "Palestina Ocupada", pt: "Palestina Ocupada", it: "Palestina Occupata",
        })[l2] || "Occupied Palestine";
      }
      function palestineFixText(s) {
        const str = String(s ?? "");
        if (!str) return str;
        const lbl = palestineLabel();
        return str
          .replace(/إسرائيل|اسرائيل|ישראל/g, lbl)
          .replace(/\bisra[éeë]le?\b/gi, lbl);
      }
      function palestineFixPlace(p) {
        if (!p || typeof p !== "object") return p;
        return {
          ...p,
          name: palestineFixText(p.name),
          admin1: palestineFixText(p.admin1),
          country: palestineFixText(p.country),
        };
      }
      function fixGeoList(places) { return Array.isArray(places) ? places.map(palestineFixPlace) : places; }

      async function searchOpenMeteo(query, signal) {
        const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
        // إصلاح 4: نتائج البحث الجيوكودي تتبع لغة الواجهة بدل العربية الإجبارية
        url.search = new URLSearchParams({ name: query, count: "8", language: currentLanguage, format: "json" });
        const data = await getJson(url, signal);
        return fixGeoList((data.results ?? []).map((p) => ({ ...p, id: `om-${p.id}` })));
      }

      async function searchPhoton(query, signal) {
        const photonLang = ["de", "en", "fr"].includes(currentLanguage) ? currentLanguage : "default";
        const url = new URL("https://photon.komoot.io/api/");
        url.search = new URLSearchParams({ q: query, limit: "8", lang: photonLang });
        const data = await getJson(url, signal);
        return fixGeoList((data.features ?? []).flatMap((f) => {
          const pr = f.properties, co = f.geometry?.coordinates;
          if (!co) return [];
          const street = [pr.housenumber, pr.street].filter(Boolean).join(" ");
          const name = [street, pr.name && pr.name !== pr.street ? pr.name : ""].filter(Boolean).join(" · ") || pr.name;
          if (!name) return [];
          return [{
            id: `ph-${pr.osm_type ?? "p"}-${pr.osm_id ?? co.join("-")}`,
            name,
            admin1: [pr.city, pr.district, pr.state ?? pr.county].filter(Boolean).join("، "),
            country: pr.country,
            latitude: co[1],
            longitude: co[0],
          }];
        }));
      }

      async function nominatimGate(signal) {
        // بوابة احترام حد Nominatim (طلب واحد/ثانية) مشتركة بين البحث والتحديد العكسي
        const prev = nominatimQueue;
        let release;
        nominatimQueue = new Promise((res) => { release = res; });
        await prev;
        try {
          const wait = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
          if (wait) await new Promise((res) => setTimeout(res, wait));
          if (signal?.aborted) throw new DOMException("تم الإلغاء", "AbortError");
          lastNominatimAt = Date.now();
        } finally { release(); }
      }

      function mapNominatimItems(data) {
        return fixGeoList((Array.isArray(data) ? data : []).flatMap((item) => {
          const a = item.address ?? {};
          const street = [a.house_number, a.road].filter(Boolean).join(" ");
          const name = street || item.name || a.village || a.town || a.city || a.hamlet || (item.display_name ?? "").split(",")[0];
          const latitude = Number(item.lat), longitude = Number(item.lon);
          if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
          return [{
            id: `nom-${item.place_id}`, name,
            admin1: [a.neighbourhood, a.suburb, a.city ?? a.town, a.state].filter(Boolean).join("، "), country: a.country,
            latitude, longitude,
          }];
        }));
      }

      async function searchNominatim(query, signal) {
        await nominatimGate(signal);
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "8", "accept-language": "ar,en" });
        const data = await getJson(url, signal);
        return mapNominatimItems(data);
      }

      /* المرحلة 12: البحث في طرق الطرق أصبح عالميًا — OpenMeteo + Photon بالتوازي ثم Nominatim
         عالميًا كاحتياط (بلا قيود دولة). دقة مصر تبقى ممتازة لأن Nominatim يفهرس شوارعها جيدًا،
         والمستخدم يستطيع الآن الوصول لأي مدينة أو معلم في العالم بأول حروف. */
      async function searchEgyptPlaces(query, signal) {
        // اسم قديم محفوظ للتوافق الداخلي — البحث نفسه عالمي بالكامل
        return searchPlaces(query, signal);
      }

      /* إصلاح التوجيه الخاطئ: «فايد» في مصر كانت تسبقها «فايدة» في العراق فيتراجع
         المسار لمكان خاطئ. التطبيق موجَّه للمستخدم المصري أولًا، فنُقدّم نتائج مصر
         إلى الصدارة دائمًا (ترتيب مستقر يحفظ جودة الترتيب الأصلي داخل كل مجموعة). */
      function isEgyptPlace(p) {
        return p?.country_code === "EG" || /^(مصر|Egypt)$/i.test(String(p?.country ?? ""));
      }
      function boostEgyptPlaces(places) {
        if (!Array.isArray(places)) return places;
        const eg = places.filter(isEgyptPlace), rest = places.filter((p) => !isEgyptPlace(p));
        return eg.length && rest.length ? [...eg, ...rest] : places;
      }

      async function searchPlaces(query, signal) {
        const key = query.trim().toLowerCase();
        if (searchCache.has(key)) return searchCache.get(key);
        const settled = await Promise.allSettled([searchOpenMeteo(query, signal), searchPhoton(query, signal)]);
        let places = mergePlaces(
          settled.filter((s) => s.status === "fulfilled").flatMap((s) => s.value),
        );
        places = boostEgyptPlaces(places);
        if (places.length) { searchCache.set(key, places); return places; }
        if (signal?.aborted) throw new DOMException("تم الإلغاء", "AbortError");
        const villages = boostEgyptPlaces(mergePlaces(await searchNominatim(query, signal)));
        searchCache.set(key, villages);
        return villages;
      }

      async function searchRoadAddresses(query, signal) {
        try {
          const addresses = await searchPhoton(query, signal);
          if (addresses.length) return mergePlaces(addresses).slice(0, 8);
        } catch (error) {
          if (error.name === "AbortError") throw error;
        }
        return mergePlaces(await searchNominatim(query, signal)).slice(0, 8);
      }

      function renderSearchResults(places) {
        searchResults.replaceChildren();
        clearActiveOption();
        // إصلاح 8: ضبط aria-expanded عند فتح قائمة النتائج (كان يُضبط في رسائل الحالة فقط)
        searchInput.setAttribute("aria-expanded", "true");
        if (!places.length) {
          const noResult = tr("لم نعثر على مكان بهذا الاسم. جرّب كتابته بلغة أخرى أو أضف اسم البلد.");
          searchResults.innerHTML = `<div class="message">${noResult}</div>`;
          announceSearch(noResult); // المرحلة 5: إعلان عدم العثور لقارئات الشاشة
          return;
        }
        places.forEach((place, index) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "result-button";
          btn.setAttribute("role", "option");
          btn.id = `matar-opt-${index}`; // إصلاح N-04: معرّف لكل خيار لربطه بـ aria-activedescendant
          btn.setAttribute("aria-selected", "false");
          btn.innerHTML = `
            <span class="result-pin">${iconSvg("pin", 18)}</span>
            <span style="min-width:0;flex:1">
              <span class="result-name">${escapeHtml(place.name)}</span>
              <span class="result-context">${escapeHtml([place.admin1, place.country].filter(Boolean).join("، ") || place.timezone || "")}</span>
            </span>`;
          btn.addEventListener("click", () => {
            searchResults.classList.add("hidden");
            searchInput.setAttribute("aria-expanded", "false");
            clearActiveOption();
            selectPlace(place);
          });
          searchResults.append(btn);
        });
        announceSearch(tf("{n} نتيجة بحث", { n: places.length })); // المرحلة 5: إعلان عدد النتائج
      }

      /* المرحلة 5 — معلن حالة البحث: منطقة حية مخفية تعلن لقارئات الشاشة عدد النتائج أو الرسائل */
      const searchStatus = $("#search-status");
      function announceSearch(text) {
        if (searchStatus) searchStatus.textContent = text;
      }

      function setSearchMessage(message) {
        searchResults.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
        searchResults.classList.remove("hidden");
        searchInput.setAttribute("aria-expanded", "true");
        clearActiveOption();
        announceSearch(message); // المرحلة 5
      }

      /* إصلاح N-04: إدارة الخيار النشط بـ aria-activedescendant — البؤرة تبقى على حقل البحث */
      function resultOptions() {
        return $$('#search-results [role="option"]');
      }
      function setActiveOption(index) {
        const options = resultOptions();
        if (!options.length) return;
        activeOption = (index + options.length) % options.length;
        options.forEach((opt, i) => {
          opt.classList.toggle("active", i === activeOption);
          opt.setAttribute("aria-selected", String(i === activeOption));
        });
        searchInput.setAttribute("aria-activedescendant", options[activeOption].id);
        options[activeOption].scrollIntoView({ block: "nearest" });
      }
      function clearActiveOption() {
        activeOption = -1;
        searchInput.removeAttribute("aria-activedescendant");
        $$('#search-results [role="option"]').forEach((opt) => {
          opt.classList.remove("active");
          opt.setAttribute("aria-selected", "false");
        });
      }

      searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (!query) { setSearchMessage(tr("اكتب اسم مدينة أو بلد أو قرية للبحث.")); return; }
        searchController?.abort();
        searchController = new AbortController();
        const controller = searchController;
        searchGo.disabled = true;
        searchGo.textContent = "…";
        setSearchMessage(tr("نبحث في الأماكن حول العالم…"));
        try {
          const places = await searchPlaces(query, controller.signal);
          if (controller.signal.aborted) return;
          renderSearchResults(places);
          searchResults.classList.remove("hidden");
        } catch (error) {
          if (error.name !== "AbortError" && !controller.signal.aborted) {
            setSearchMessage(error.message || tr("حدث خطأ أثناء البحث. حاول مرة أخرى."));
          }
        } finally {
          if (!controller.signal.aborted) { searchGo.disabled = false; searchGo.textContent = "ابحث"; }
        }
      });

      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim();
        if (q.length < 2) { searchResults.classList.add("hidden"); clearActiveOption(); return; }
        clearTimeout(searchInput._t);
        searchInput._t = setTimeout(async () => {
          searchController?.abort();
          searchController = new AbortController();
          const c = searchController;
          try {
            const places = await searchPlaces(q, c.signal);
            if (c.signal.aborted) return;
            renderSearchResults(places);
            searchResults.classList.remove("hidden");
          } catch (e) { if (e.name !== "AbortError") searchResults.classList.add("hidden"); }
        }, 350);
      });

      document.addEventListener("click", (event) => {
        if (!event.target.closest(".search-wrap")) {
          searchResults.classList.add("hidden");
          searchInput.setAttribute("aria-expanded", "false");
          clearActiveOption();
        }
      });

      searchInput.addEventListener("keydown", (event) => { // إصلاح N-04: أسهم + Enter + Escape + Home/End لقائمة النتائج
        const options = resultOptions();
        const open = !searchResults.classList.contains("hidden");
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!open || !options.length) {
            if (options.length) { // إعادة فتح القائمة المخفية بنفس النتائج
              searchResults.classList.remove("hidden");
              searchInput.setAttribute("aria-expanded", "true");
              setActiveOption(0);
            }
            return;
          }
          setActiveOption(activeOption < 0 ? 0 : activeOption + 1); // ↓ التالي مع التدوير
        } else if (event.key === "ArrowUp") {
          if (!open || !options.length) return;
          event.preventDefault();
          setActiveOption(activeOption < 0 ? options.length - 1 : activeOption - 1); // ↑ السابق مع التدوير
        } else if (event.key === "Home" && open && options.length) {
          event.preventDefault();
          setActiveOption(0);
        } else if (event.key === "End" && open && options.length) {
          event.preventDefault();
          setActiveOption(options.length - 1);
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (open && activeOption >= 0 && options[activeOption]) options[activeOption].click();
          else searchForm.requestSubmit();
        } else if (event.key === "Escape" && open) {
          searchResults.classList.add("hidden");
          searchInput.setAttribute("aria-expanded", "false");
          clearActiveOption();
        }
      });

      geoBtn.addEventListener("click", () => {
        if (!navigator.geolocation) { setSearchMessage(tr("متصفحك لا يدعم تحديد الموقع.")); return; }
        setSearchMessage(tr("نحدد موقعك الحالي…"));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            searchResults.classList.add("hidden");
            clearActiveOption();
            selectPlace({
              name: tr("موقعي الحالي"),
              admin1: "",
              country: "",
              latitude: +pos.coords.latitude.toFixed(4),
              longitude: +pos.coords.longitude.toFixed(4),
            });
          },
          () => setSearchMessage(tr("تعذّر الوصول لموقعك. تأكد من منح الإذن ثم أعد المحاولة.")),
          { enableHighAccuracy: false, timeout: 9000, maximumAge: 5 * 60e3 },
        );
      });

      /* ---------------- اختيار الموقع وتحديث كل الصفحات ---------------- */
      function selectPlace(place) {
        state.place = place;
        savePlace(place);
        updateLocChips();
        loadMainData(true);
        MX.setPlace(place);
        if (typeof Agri !== "undefined") Agri.onPlaceChange();
        if (typeof Joq !== "undefined") Joq.onPlaceChange(); // إصدار 19: تفريغ كاش جوّك اليوم
        if (typeof TimeMachine !== "undefined") TimeMachine.onPlaceChange(); // إصدار 19: تفريغ كاش آلة الزمن
        /* إصدار 27: تحديث شريط المواقع المفضلة (الشريحة النشطة وزر الحفظ) */
        try { if (typeof Favs !== "undefined") Favs.render(); } catch (e) {}
        const fromInput = $("#trip-from");
        if (fromInput && !fromInput.value.trim()) fromInput.value = place.name || "";
      }

      function updateLocChips() {
        const label = state.place ? state.place.name : "—";
        const ctx = state.place ? [state.place.admin1, state.place.country].filter(Boolean).join("، ") : "";
        ["dash-loc-chip", "map-loc-chip", "agri-loc-chip"].forEach((id) => {
          const chip = $(`#${id}`);
          if (chip) chip.innerHTML = `${iconSvg("pin", 14)} <span>${escapeHtml(label)}${ctx ? ` · ${escapeHtml(ctx)}` : ""}</span>`;
        });
        /* إصدار 16: تحديث إحداثيات بديل الخريطة النصي في الوضع الاقتصادي */
        try { Eco.apply(); } catch (e) {}
      }
      /* ============================================================
         جلب البيانات الرئيسية (التوقعات + جودة الهواء)
         ============================================================ */
      const HOURLY_VARS = [
        "temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature",
        "precipitation_probability", "precipitation", "weather_code", "pressure_msl", "cloud_cover",
        "visibility", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "uv_index", "is_day",
        "cape",
        "soil_temperature_0cm", "soil_temperature_6cm", "soil_temperature_18cm", "soil_temperature_54cm",
        "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm", "soil_moisture_3_to_9cm", "soil_moisture_9_to_27cm",
        "evapotranspiration",
      ].join(",");

      const DAILY_VARS = [
        "weather_code", "temperature_2m_max", "temperature_2m_min", "temperature_2m_mean", "apparent_temperature_max",
        "precipitation_sum", "precipitation_probability_max", "wind_speed_10m_max", "wind_gusts_10m_max",
        "wind_direction_10m_dominant", "uv_index_max", "sunrise", "sunset", "et0_fao_evapotranspiration",
      ].join(",");

      const CURRENT_VARS = [
        "temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation",
        "weather_code", "cloud_cover", "pressure_msl", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
      ].join(",");

      /* ============================================================
         إصدار 30 — مبدّل نماذج الطقس (Model Switcher): ICON ↔ ECMWF
         ------------------------------------------------------------
         يحل مشكلة عدم دقة رصد الأمطار اللحظية والسحب المحلية في مصر
         والدول العربية بالسماح بالتبديل بين نموذجين:
           ① icon  → models=icon_seamless (دمج ICON-EU الإقليمي دقة ~6كم
                      مع ICON-Global مجانًا — الأدق للأمطار المحلية قصيرة المدى)
           ② ecmwf → models=ecmwf_ifs04  (النموذج العالمي ECMWF — الأدق
                      للأمطار والسحب متوسطة المدى)
         ويُفعَّل التصغير عالي الدقة وتصحيح الارتفاع التلقائي عبر
         &downscaling=true مع cell_selection=land المفعّل أصلًا.
         - المتغير العام activeModel يُقرأ من localStorage تلقائيًا
           (المفتاح matar_active_model) والقيمة الافتراضية 'ecmwf'
           (إصدار 34: النموذج الأوروبي هو الافتراضي بطلب المستخدم).
         - switchWeatherModel(modelName) تحدّث المتغير وتحفظ الخيار ثم
           تستدعي جلب الطقس من جديد (loadMainData(true)) — وهي مكشوفة
           على window كي تصلح للاستدعاء من أي مكان أو من وحدة التحكم.
         - سلسلة احتياط ذكية: إن رفض المزود طلب النموذج المختار (بعض
           متغيرات الطلب غير متاحة في ecmwf_ifs04) نعيد المحاولة دون
           بارامتر النموذج ثم دون downscaling — لا تنكسر الواجهة أبدًا.
         ============================================================ */
      const MATAR_MODELS = {
        icon: { param: "icon_seamless", stateText: "النموذج النشط الآن: ICON Seamless — دمج ICON-EU وICON-Global، الأدق للأمطار المحلية قصيرة المدى." },
        ecmwf: { param: "ecmwf_ifs04", stateText: "النموذج النشط الآن: النموذج الأوروبي ECMWF IFS04 — الأدق عالميًا للتوقعات متوسطة المدى حتى 14 يومًا." },
      };
      const MATAR_MODEL_KEY = "matar_active_model";
      /* إصدار 34 (بطلب المستخدم): النموذج الأوروبي ECMWF هو المحرك الافتراضي —
         أعلى دقة إحصائية للتوقعات متوسطة المدى، والجلب المتوازي التكميلي
         (best_match) يبقى مفعلًا لملء أيام 11–14 واحتمالات المطر بلا فراغات */
      let activeModel = "ecmwf";
      try {
        const savedModel = localStorage.getItem(MATAR_MODEL_KEY);
        if (savedModel === "ecmwf" || savedModel === "icon") activeModel = savedModel;
      } catch (e) {}

      function activeModelParam() {
        return (MATAR_MODELS[activeModel] || MATAR_MODELS.ecmwf).param;
      }

      /* تحديث إضاءة الأزرار في الإعدادات + نص الحالة تحت الأزرار */
      function applyModelUI() {
        $$("[data-model-btn]").forEach((btn) => {
          btn.setAttribute("aria-pressed", String(btn.dataset.modelBtn === activeModel));
        });
        const stateEl = $("#model-state");
        if (stateEl) stateEl.textContent = tr((MATAR_MODELS[activeModel] || MATAR_MODELS.ecmwf).stateText);
      }

      function switchWeatherModel(modelName) {
        activeModel = modelName === "ecmwf" ? "ecmwf" : "icon";
        try { localStorage.setItem(MATAR_MODEL_KEY, activeModel); } catch (e) {}
        applyModelUI();
        /* إعادة جلب الطقس تلقائيًا بالنموذج الجديد (تجاوز الكاش عمدًا) */
        try { loadMainData(true); } catch (e) {}
        return activeModel;
      }
      /* مكشوفة عالميًا كما هو مطلوب — وتُمرَّر أيضًا عبر جسر __matarBridge */
      try { window.switchWeatherModel = switchWeatherModel; } catch (e) {}
      $$("[data-model-btn]").forEach((btn) => btn.addEventListener("click", () => switchWeatherModel(btn.dataset.modelBtn)));
      document.addEventListener("matar:language", applyModelUI);
      applyModelUI();

      /* ============================================================
         إصدار 32 — قياس فعلي لارتفاع شريط التنقل (--nav-h)
         كان الافتراض الثابت (58/64px) يخطئ على الهواتف حيث يلتف الشريط
         إلى ثلاثة صفوف، فامتدت الخريطة تحت شريط المتصفح. الآن يُقاس
         الارتفاع الحقيقي عند الإقلاع وعند كل تغيير مقاس ويُغذّى للمتغير
         كي يصبح حساب ارتفاع الخريطة الكبرى دقيقًا على كل جهاز.
         ============================================================ */
      (() => {
        const nav = document.querySelector(".topnav");
        if (!nav) return;
        const applyNavH = () => {
          try { document.documentElement.style.setProperty("--nav-h", `${Math.round(nav.offsetHeight)}px`); } catch (e) {}
        };
        applyNavH();
        window.addEventListener("resize", applyNavH, { passive: true });
        document.addEventListener("matar:language", () => setTimeout(applyNavH, 80));
      })();

      async function fetchMainForecast(place, signal) {
        /* ============================================================
           إصلاح 31 — سبب أخطاء «التوقعات العامة» بعد إصدار 30:
           كان الطلب الواحد يفرض models=icon_seamless مع forecast_days=14،
           بينما توثيق Open-Meteo يحدد أفق النماذج: ICON ≈ 7.5 يومًا وECMWF
           IFS04 ≈ 10 أيام (فقط GFS يغطي 16 يومًا). النتيجة كانت أيام 8–14
           تُعاد بقيم null فتنهار بطاقات الأسبوعين والمستشارون كله، كما أن
           «احتمالية المطر» تُشتق من النماذج الطاقمية (Ensembles) فتعود صفرًا
           مع نموذج حتمي واحد مفروض.
           الحل — طلبان متوازيان يُدمجان دمجًا خالًٍ من الفراغات:
           ① طلب النموذج المختار (icon_seamless/ecmwf_ifs04) بمدى أمنه
              (7 أو 10 أيام) مع downscaling=true لحظة توفرها — أعلى دقة
              للأمطار والسحب والحرارة في النافذة المغطاة.
           ② طلب التعبئة best_match الشامل 14 يومًا — يغطي الذيل البعيد
              ويوفر احتمالات المطر ومسلسل minutely_15 للرادار اللحظي.
           الدمج: قيم النموذج المختار تعلو داخل نافذته متى كانت غير فارغة،
           وأي فراغ يُملأ من النموذج العالمي — لا صفوف ولا ساعات ناقصة أبدًا.
           ============================================================ */
        const MODEL_HORIZON_DAYS = { icon_seamless: 7, ecmwf_ifs04: 10 };
        const buildForecastUrl = (opts) => {
          const url = new URL("https://api.open-meteo.com/v1/forecast");
          url.search = new URLSearchParams({
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            current: CURRENT_VARS,
            hourly: HOURLY_VARS,
            daily: DAILY_VARS,
            minutely_15: "precipitation",
            timezone: "auto",
            forecast_days: String(opts.days),
            cell_selection: "land",
            wind_speed_unit: "kmh",
            precipitation_unit: "mm",
          });
          if (opts.model) url.searchParams.set("models", opts.model);
          if (opts.downscaling) url.searchParams.set("downscaling", "true");
          return url;
        };

        /* دمج خالٍ من الفراغات: النموذج المختار (sel) يعلو داخل نافذته،
           والتعبئة الشاملة (fill) مرجع المحور الزمني ومصدر أي خلية فارغة.
           لا ننقل شيئًا إن اختلفت طوابع الوقت بين الطلبين (حماية من أي
           تغيير في نافذة الاستجابة). */
        const mergeForecast = (fill, sel) => {
          const out = fill;
          const axisOK = (a, b, probe) => {
            if (!Array.isArray(a?.time) || !Array.isArray(b?.time)) return false;
            const n = Math.min(probe, a.time.length, b.time.length);
            for (let i = 0; i < n; i += 1) if (a.time[i] !== b.time[i]) return false;
            return true;
          };
          const mergeGroup = (base, over, probe) => {
            if (!axisOK(base, over, probe)) return base;
            const n = Math.min(over.time.length, base.time.length);
            const merged = { ...base };
            Object.keys(over).forEach((k) => {
              if (k === "time" || !Array.isArray(over[k])) return;
              const src = over[k], dst = Array.isArray(base[k]) ? base[k].slice() : new Array(n).fill(null);
              for (let i = 0; i < Math.min(n, src.length); i += 1) {
                if (src[i] != null) dst[i] = src[i];
                else if (dst[i] === undefined) dst[i] = null;
              }
              merged[k] = dst;
            });
            return merged;
          };
          if (sel?.hourly?.time?.length) {
            out.hourly = mergeGroup(fill.hourly, sel.hourly, 48);
            /* ============================================================
               إصدار 32 — التنعيم الخطي عند نقطة التقاء النموذجين (Linear Blending)
               فرق دورات التحديث (Run cycles) بين النموذج المختار ونموذج التعبئة
               كان يصنع قفزة حرارية/ريحية غير فيزيائية عند لحظة وصل المصفوفتين.
               المعادلة: نحسب الفارق delta عند الوصل ثم نطرحه من قيم التعبئة
               تدرّجيًا على 12 ساعة: adjusted[i] = raw[i] − delta × (1 − (s+1)/12)
               فتصبح السلسلة متصلة عند الوصل وتن relax تدريجيًا إلى النموذج البعيد
               دون مسّ الاتجاه العام ولا قيم المطر/الأكواد المتقطعة.
               ============================================================ */
            try {
              const LINEAR_KEYS = [
                "temperature_2m", "apparent_temperature", "dew_point_2m",
                "relative_humidity_2m", "wind_speed_10m", "wind_gusts_10m",
                "pressure_msl", "cloud_cover",
              ];
              const BLEND_HOURS = 12; /* نافذة التنعيم 6–12 ساعة وفق خطة الدقة */
              const j0 = Math.min(sel.hourly.time.length, out.hourly.time.length - 1);
              if (j0 > 0 && out.hourly.time.length > j0 + 1) {
                LINEAR_KEYS.forEach((k) => {
                  const a = out.hourly[k];
                  if (!Array.isArray(a)) return;
                  const prev = a[j0 - 1], nxt = a[j0];
                  if (prev == null || nxt == null) return;
                  const delta = Number(nxt) - Number(prev);
                  /* عتبات بدء التنعيم: لا داعي للعمل إن كان الانتقال سلسًا أصلًا */
                  const minStep = k === "pressure_msl" ? 0.8
                    : (k === "relative_humidity_2m" || k === "cloud_cover") ? 3
                    : k === "wind_speed_10m" || k === "wind_gusts_10m" ? 2
                    : 0.6;
                  if (!Number.isFinite(delta) || Math.abs(delta) < minStep) return;
                  for (let s = 0; s < BLEND_HOURS; s += 1) {
                    const i = j0 + s;
                    if (i >= a.length) break;
                    const v = a[i];
                    if (v == null) continue;
                    a[i] = +(v - delta * (1 - (s + 1) / BLEND_HOURS)).toFixed(1);
                  }
                });
              }
            } catch (e) { /* التنعيم تجميلي — أي فشل لا يمس البيانات */ }
            /* current: قيم النموذج المختار تعلو فقط للخلايا غير الفارغة */
            if (sel.current) {
              const cur = { ...(fill.current ?? {}) };
              Object.keys(sel.current).forEach((k) => {
                if (sel.current[k] != null) cur[k] = sel.current[k];
              });
              out.current = cur;
            }
          }
          if (sel?.daily?.time?.length) out.daily = mergeGroup(fill.daily, sel.daily, 5);
          return out;
        };

        const modelParam = activeModelParam();
        const modelDays = Math.min(14, MODEL_HORIZON_DAYS[modelParam] ?? 14);
        const needsFill = modelDays < 14; /* النموذجان الحاليان يحتاجان تعبئة الذيل دائمًا */

        const selPromise = getJson(buildForecastUrl({ days: modelDays, model: modelParam, downscaling: true }), signal);
        const fillPromise = needsFill
          ? getJson(buildForecastUrl({ days: 14 }), signal)
          : Promise.resolve(null);

        const [selRes, fillRes] = await Promise.allSettled([selPromise, fillPromise]);
        if (signal?.aborted) throw new DOMException("aborted", "AbortError");

        const sel = selRes.status === "fulfilled" ? selRes.value : null;
        const fill = fillRes.status === "fulfilled" ? fillRes.value : null;
        if (sel && fill) {
          const merged = mergeForecast(fill, sel);
          merged.model = modelParam;
          merged.model_fill_note = "النافذة القريبة بالنموذج المختار · الأيام البعيدة بنموذج عالمي مكمِّل";
          return merged;
        }
        if (sel && !fill) return { ...sel, model: modelParam };
        if (!sel && fill) return { ...fill, model: null, model_fill_note: "النموذج المختار غير متاح الآن — البيانات من النموذج العالمي الشامل" };
        /* كلا الطلبين فشلا → خطأ حقيقي يذهب لمسار الكاش/بيانات العرض المعتاد */
        throw (selRes.status === "rejected" ? selRes.reason : fillRes.reason);
      }

      /* ============================================================
         إصدار 30 — معادلة دمج السحب والرطوبة اللحظية
         (Satellite & Humidity Hybrid Calibration)
         ------------------------------------------------------------
         المشكلة: النموذج قد يقرأ «صفر مطر» بينما السماء فعلًا مغطاة
         بالسحب منخفضة الرطوبة المشبعة فوق مصر والوطن العربي (رذاذ
         محلي لا تلتقطه شبكات النموذج).
         المعادلة: بعد جلب الاستجابة، إذا كانت قراءة المطر الحالية
         current.precipitation === 0 نفحص عنصر الساعة الحالية في
         مصفوفة الساعات:
           cloud_cover > 85  &&  relative_humidity_2m > 85
         → نعدّل كائن البيانات قسريًا: current.weather_code = 51
           (رذاذ ومطر خفيف محلي) مع شارة داخلية
           current.is_corrected_locally = true تظهر كشارة في البطل.
         تعمل أيضًا بعد مزج النماذج عالية الدقة (Accuracy.enhance)
         كي يبقى التصحيح متسقًا مع آخر قيم ساعية.
         ============================================================ */
      function applyLocalHybridCalibration(wx) {
        try {
          const cur = wx?.current;
          if (!cur || typeof cur !== "object") return false;
          /* النموذج يرصد مطرًا فعلًا (أو القراءة غير موجودة) → لا تدخل */
          if (cur.precipitation !== 0) return false;
          const h = wx?.hourly;
          if (!h || !Array.isArray(h.time) || !h.time.length) return false;
          /* الساعة الحالية: أول عنصر فعّال في مصفوفة الساعات من منظور الموقع */
          let idx = 0;
          try { idx = clamp(hourIndexAtPlace(wx), 0, h.time.length - 1); } catch (e) { idx = 0; }
          const cc = h.cloud_cover?.[idx];
          const rh = h.relative_humidity_2m?.[idx];
          if (cc == null || rh == null) return false;
          if (Number(cc) > 85 && Number(rh) > 85) {
            cur.weather_code = 51; /* رذاذ ومطر خفيف محلي (WMO 51) */
            cur.is_corrected_locally = true;
            /* إصلاح 31 — اتساق العرض: كانت البطل تقول «رذاذ محلي» بينما خانة
               «الآن» في الشريط الساعي تبقى صافية لأنها تقرأ hourly.weather_code.
               نوحّد الساعة الحالية في المصفوفة نفسها (فقط إن كانت جافة) كي يعرض
               الشريط والبطل والمستشارون حالة واحدة متسقة. */
            try {
              if (Array.isArray(h.weather_code) && h.weather_code[idx] != null && Number(h.weather_code[idx]) < 51) {
                h.weather_code[idx] = 51;
              }
            } catch (e2) {}
            return true;
          }
          return false;
        } catch (e) { return false; }
      }

      function buildMockForecast(place) {
        let timezone = place?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const formatter = () => new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        });
        let fmt;
        try { fmt = formatter(); fmt.format(new Date()); } catch (e) { timezone = "UTC"; fmt = formatter(); }
        const partsAt = (stamp) => Object.fromEntries(fmt.formatToParts(new Date(stamp)).map((p) => [p.type, p.value]));
        const stampText = (p) => `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
        const dayText = (p) => `${p.year}-${p.month}-${p.day}`;
        const now = Date.now(), start = Math.floor(now / HOUR) * HOUR, pNow = partsAt(now);
        const pStart = partsAt(start);
        const offset = Math.round((Date.UTC(+pStart.year, +pStart.month - 1, +pStart.day, +pStart.hour) - start) / 1000);
        const hourly = { time: [] };
        const hourlyKeys = [
          "temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature",
          "precipitation_probability", "precipitation", "weather_code", "pressure_msl", "cloud_cover",
          "visibility", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "uv_index", "is_day",
          "cape", "soil_temperature_0cm", "soil_temperature_6cm", "soil_temperature_18cm", "soil_temperature_54cm",
          "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm", "soil_moisture_3_to_9cm", "soil_moisture_9_to_27cm",
          "evapotranspiration",
        ];
        hourlyKeys.forEach((key) => { hourly[key] = []; });
        const mockHour = (epoch, index) => {
          const p = partsAt(epoch), h = Number(p.hour), day = Math.floor(index / 24);
          const daylight = h >= 6 && h < 19;
          const temp = 23 + 7 * Math.sin(((h - 9) / 24) * Math.PI * 2) + 1.4 * Math.sin(day * 0.55);
          const rain = (day + h) % 41 >= 37 ? 0.7 + ((h % 3) * 0.5) : 0;
          const cloud = rain ? 75 : Math.round(18 + 38 * (0.5 + 0.5 * Math.sin(index * 0.16)));
          return {
            time: `${p.year}-${p.month}-${p.day}T${p.hour}:00`,
            temperature_2m: +temp.toFixed(1), relative_humidity_2m: Math.round(46 + 28 * (0.5 + 0.5 * Math.cos(index * 0.08))),
            dew_point_2m: +(temp - 7).toFixed(1), apparent_temperature: +(temp + 0.5).toFixed(1),
            precipitation_probability: rain ? 55 : Math.round(8 + 15 * (0.5 + 0.5 * Math.sin(index * 0.12))),
            precipitation: rain, weather_code: rain ? 61 : cloud > 65 ? 3 : cloud > 35 ? 2 : daylight ? 1 : 0,
            pressure_msl: Math.round(1012 + 5 * Math.sin(index * 0.04)), cloud_cover: cloud, visibility: rain ? 9000 : 24000,
            wind_speed_10m: Math.round(9 + 8 * (0.5 + 0.5 * Math.sin(index * 0.11))),
            wind_direction_10m: (155 + index * 9) % 360, wind_gusts_10m: Math.round(18 + 16 * (0.5 + 0.5 * Math.cos(index * 0.17))),
            uv_index: daylight ? +(5 * Math.max(0, Math.sin(((h - 6) / 13) * Math.PI))).toFixed(1) : 0,
            is_day: daylight ? 1 : 0, cape: rain ? 280 : 30,
            soil_temperature_0cm: +(temp + 1).toFixed(1), soil_temperature_6cm: +(temp - 0.5).toFixed(1),
            soil_temperature_18cm: +(temp - 1.5).toFixed(1), soil_temperature_54cm: +(temp - 2.5).toFixed(1),
            soil_moisture_0_to_1cm: +(0.18 + 0.04 * Math.sin(index * 0.08)).toFixed(3),
            soil_moisture_1_to_3cm: +(0.21 + 0.03 * Math.sin(index * 0.07)).toFixed(3),
            soil_moisture_3_to_9cm: +(0.24 + 0.025 * Math.sin(index * 0.06)).toFixed(3),
            soil_moisture_9_to_27cm: +(0.27 + 0.02 * Math.sin(index * 0.05)).toFixed(3),
            evapotranspiration: +(daylight ? 0.12 : 0.02).toFixed(2),
          };
        };
        const hourlyCount = 24 * 15;
        for (let i = 0; i < hourlyCount; i += 1) {
          const values = mockHour(start + i * HOUR, i);
          hourly.time.push(values.time);
          hourlyKeys.forEach((key) => hourly[key].push(values[key]));
        }
        const daily = {
          time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [],
          apparent_temperature_max: [], precipitation_sum: [], precipitation_probability_max: [],
          wind_speed_10m_max: [], wind_gusts_10m_max: [], wind_direction_10m_dominant: [],
          uv_index_max: [], sunrise: [], sunset: [], et0_fao_evapotranspiration: [],
        };
        for (let i = 0; i < 14; i += 1) {
          const p = partsAt(start + i * 24 * HOUR), base = 28 + 2 * Math.sin(i * 0.5);
          const wet = i % 5 === 2;
          daily.time.push(dayText(p)); daily.weather_code.push(wet ? 61 : i % 3 ? 2 : 1);
          daily.temperature_2m_max.push(+(base + 5).toFixed(1)); daily.temperature_2m_min.push(+(base - 6).toFixed(1));
          daily.apparent_temperature_max.push(+(base + 5.5).toFixed(1)); daily.precipitation_sum.push(wet ? 2.4 : 0);
          daily.precipitation_probability_max.push(wet ? 65 : 12 + (i % 4) * 5);
          daily.wind_speed_10m_max.push(12 + (i % 4) * 3); daily.wind_gusts_10m_max.push(24 + (i % 5) * 4);
          daily.wind_direction_10m_dominant.push((160 + i * 17) % 360); daily.uv_index_max.push(5 + (i % 4));
          daily.sunrise.push(`${dayText(p)}T06:15`); daily.sunset.push(`${dayText(p)}T18:05`);
          daily.et0_fao_evapotranspiration.push(+(4.2 + (i % 3) * 0.3).toFixed(1));
        }
        const nowValue = mockHour(start, 0);
        const current = {
          time: stampText(pNow), interval: 900, temperature_2m: nowValue.temperature_2m,
          relative_humidity_2m: nowValue.relative_humidity_2m, apparent_temperature: nowValue.apparent_temperature,
          is_day: nowValue.is_day, precipitation: nowValue.precipitation, weather_code: nowValue.weather_code,
          cloud_cover: nowValue.cloud_cover, pressure_msl: nowValue.pressure_msl,
          wind_speed_10m: nowValue.wind_speed_10m, wind_direction_10m: nowValue.wind_direction_10m,
          wind_gusts_10m: nowValue.wind_gusts_10m,
        };
        return {
          timezone, timezone_abbreviation: timezone, utc_offset_seconds: offset,
          current, hourly, daily,
        };
      }

      async function fetchAirQuality(place, signal) {
        const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
        url.search = new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          current: "us_aqi,pm10,pm2_5,dust",
          hourly: "dust,us_aqi",
          timezone: "auto",
          forecast_days: "3",
        });
        return getJson(url, signal);
      }

      /* ============================================================
         إصدار 28 — وحدة الدقة (Accuracy): نماذج محلية عالية الدقة + تصحيح الارتفاع
         ------------------------------------------------------------
         الهدف: تقليل الخطأ في الحرارة والأمطار خلال أول 48 ساعة (النافذة الحرجة):
         ① مزج النماذج الإقليمية عالية الدقة (1.5–7 كم) مع النموذج العالمي:
            تُختار تلقائيًا حسب إحداثيات المستخدم بدون أي إعداد:
              فرنسا      → MeteoFrance AROME  (دقة 1.5 كم)
              أوروبا     → DWD ICON-EU        (دقة ~6.5 كم)
              أمريكا     → NOAA HRRR          (دقة 3 كم)
              اليابان    → JMA MSM            (دقة 5 كم)
            تُمزج قيم الحرارة/المطر/احتمال المطر/السحب/الطقس/الرياح والهبّات
            في الجدول الساعي القائم بمطابقة نصية حتمية لطوابع الوقت، ثم تظهر
            شارة «دقة عالية · ICON-EU» فوق البطل. أي فشل شبكي يسقط بهدوء
            إلى النموذج العالمي (best_match) بلا أي كسر في الواجهة.
         ② تصحيح انحياز الارتفاع (Elevation Bias Correction):
            النموذج العالمي يمثل الموقع بخلية شبكة قد يكون ارتفاعها مختلفًا
            عن الارتفاع الحقيقي بمئات الأمتار، فتنحاز الحرارة 2–3°م. نجلب
            الارتفاع الحقيقي من واجهة Open-Meteo Elevation (DEM دقيق) ونقارنه
            بارتفاع خلية النموذج المعاد مع الاستجابة (wx.elevation)، وإن اختلفا
            ≥ 60 م صحّحنا الحرارة بمعدل السقوط الحراري 6.5°م/كم ( capped ±4°).
         كلاهما يعمل خلف الكواليس بعد أول رسم، ثم يعيد إعلان matar:data كي
         تتحدّث كل البطاقات والمستشارون بالقراءة المحسّنة.
         ============================================================ */
      const Accuracy = (() => {
        const ELEV_KEY = "matar:elev:v1";
        /* قواعد اختيار النموذج الإقليمي — الترتيب مهم (الأكثر تحديدًا أولًا) */
        const HIGHRES_RULES = [
          { test: (la, lo) => la >= 40.5 && la <= 51.5 && lo >= -5.8 && lo <= 10.2, models: "meteofrance_arome_france", label: "AROME 1.5km" },
          { test: (la, lo) => la >= 33 && la <= 70 && lo >= -11 && lo <= 40, models: "dwd_icon_eu", label: "ICON-EU" },
          { test: (la, lo) => la >= 20 && la <= 50 && lo >= -125 && lo <= -60, models: "gfs_hrrr", label: "HRRR 3km" },
          { test: (la, lo) => la >= 30 && la <= 46 && lo >= 122 && lo <= 146, models: "jma_msm", label: "JMA-MSM" },
        ];
        const BLEND_KEYS = ["temperature_2m", "precipitation", "precipitation_probability", "cloud_cover", "weather_code", "wind_speed_10m", "wind_gusts_10m"];
        const BLEND_TTL = 3 * HOUR; // لا نكرر الطلب قبل 3 ساعات لنفس الموقع

        function cacheGet(key, ttl) {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || Date.now() - obj.at > ttl) return null;
            return obj;
          } catch (e) { return null; }
        }
        function cacheSet(key, value) {
          try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), v: value })); } catch (e) {}
        }

        async function blendHighRes(place, wx, signal) {
          const la = Number(place.latitude), lo = Number(place.longitude);
          const rule = HIGHRES_RULES.find((r) => r.test(la, lo));
          if (!rule) return false;
          const cached = cacheGet(`${ELEV_KEY}:hr:${rule.models}:${la.toFixed(2)},${lo.toFixed(2)}`, BLEND_TTL);
          const u = new URL("https://api.open-meteo.com/v1/forecast");
          u.search = new URLSearchParams({
            latitude: String(la), longitude: String(lo),
            hourly: BLEND_KEYS.join(","),
            models: rule.models,
            forecast_hours: "48",
            timezone: "auto",
            wind_speed_unit: "kmh",
            precipitation_unit: "mm",
          });
          const d = cached ? cached.v : await getJson(u, signal);
          const hh = d?.hourly;
          if (!hh?.time?.length) return false;
          if (!cached) cacheSet(`${ELEV_KEY}:hr:${rule.models}:${la.toFixed(2)},${lo.toFixed(2)}`, d);
          /* مطابقة نصية حتمية لطوابع الوقت كي لا تنزاح أي ساعة */
          const idx = new Map(hh.time.map((t, i) => [t, i]));
          const H = wx.hourly;
          let n = 0;
          if (H?.time?.length) {
            H.time.forEach((t, i) => {
              const j = idx.get(t);
              if (j == null) return;
              BLEND_KEYS.forEach((k) => {
                const v = hh[k]?.[j];
                if (v != null && !Number.isNaN(v) && Array.isArray(H[k])) { H[k][i] = v; n += 1; }
              });
            });
          }
          if (n > 0) {
            const hrElev = Number(d?.elevation?.[0]);
            wx.hr = { model: rule.models, label: rule.label };
            if (Number.isFinite(hrElev)) wx.hrElev = hrElev;
            return true;
          }
          return false;
        }

        async function trueElevation(place, signal) {
          const la = Number(place.latitude), lo = Number(place.longitude);
          const key = `${ELEV_KEY}:${la.toFixed(2)},${lo.toFixed(2)}`;
          const cached = cacheGet(key, 30 * 24 * HOUR); // الارتفاع لا يتغير — تخزين 30 يومًا
          if (cached?.v != null) return cached.v;
          const u = new URL("https://api.open-meteo.com/v1/elevation");
          u.search = new URLSearchParams({ latitude: String(la), longitude: String(lo) });
          const d = await getJson(u, signal);
          const e = Number(d?.elevation?.[0]);
          if (!Number.isFinite(e)) return null;
          cacheSet(key, e);
          return e;
        }

        function applyTempBias(wx, deltaT) {
          const adj = (v) => (v == null || Number.isNaN(v) ? v : +(v + deltaT).toFixed(1));
          ["temperature_2m", "apparent_temperature", "dew_point_2m"].forEach((k) => {
            if (Array.isArray(wx.hourly?.[k])) wx.hourly[k] = wx.hourly[k].map(adj);
          });
          if (wx.current) {
            ["temperature_2m", "apparent_temperature"].forEach((k) => {
              if (wx.current[k] != null) wx.current[k] = adj(wx.current[k]);
            });
          }
          const d = wx.daily;
          if (d) ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean", "apparent_temperature_max"].forEach((k) => {
            if (Array.isArray(d[k])) d[k] = d[k].map(adj);
          });
        }

        async function applyElevationBias(place, wx, gridElev, signal) {
          const realEl = await trueElevation(place, signal);
          const grid = Number.isFinite(gridElev) ? gridElev : Number(wx.elevation);
          if (!Number.isFinite(realEl) || !Number.isFinite(grid)) return false;
          const dh = realEl - grid; // موجب: الموقع أعلى من خلية النموذج → أبرد
          if (Math.abs(dh) < 60) return false;
          /* ============================================================
             إصدار 32 — معامل السقوط الديناميكي (Dynamic Lapse Rate)
             المعامل الثابت 6.5°م/كم يفترض هواءً جافًا متوسطًا. في الحالات
             الرطبة المشبعة (ضباب/شبورة/انعكاس حراري ليلي) تتحرر حرارة كامنة
             ويخف التدرج الحراري الفعلي إلى ~4.5°م/كم. نفحص الرطوبة النسبية
             السطحية الحالية: RH > 80٪ → معامل رطب 4.5°م/كم (فيزياء رطبة
             أدق لحساب خطر الصقيع للمزارعين)، وإلا المعامل القياسي 6.5°م/كم.
             ============================================================ */
          let lapsePerM = 0.0065;
          try {
            const hh = wx.hourly;
            const rhNow = Number(wx.current?.relative_humidity_2m
              ?? hh?.relative_humidity_2m?.[hh?.time ? hourIndexAtPlace(wx) : 0]);
            if (Number.isFinite(rhNow) && rhNow > 80) lapsePerM = 0.0045;
          } catch (e) { /* الرطوبة غير متاحة → المعامل القياسي */ }
          const deltaT = clamp(-lapsePerM * dh, -4, 4); // بحد أمان ±4°
          applyTempBias(wx, deltaT);
          wx.bias = { grid, real: realEl, dh: Math.round(dh), deltaT: +deltaT.toFixed(1), lapsePerKm: +(lapsePerM * 1000).toFixed(1) };
          return true;
        }

        async function enhance(place, wx, signal) {
          if (!place || !wx || wx.__enhanced || wx.__demo || state.isDemoData || state.isCachedData) return;
          wx.__enhanced = true;
          let changed = false;
          let gridElev = Number(wx.elevation);
          try {
            if (navigator.onLine) {
              const blended = await blendHighRes(place, wx, signal);
              if (blended) { changed = true; if (Number.isFinite(wx.hrElev)) gridElev = wx.hrElev; }
            }
          } catch (e) { /* النموذج الإقليمي اختياري — نكمل بالنموذج العالمي */ }
          try {
            if (navigator.onLine) {
              const biased = await applyElevationBias(place, wx, gridElev, signal);
              if (biased) changed = true;
            }
          } catch (e) { /* التصحيح اختياري كذلك */ }
          /* إصدار 30: إعادة فحص معادلة السحب والرطوبة بعد مزج النموذج الإقليمي
             عالي الدقة — كي يبقى كود الطقس الحالي متسقًا مع آخر القيم الساعية */
          try { if (applyLocalHybridCalibration(wx)) changed = true; } catch (e) {}
          if (changed) {
            try {
              Dashboard.render();
              Agri.onData();
              document.dispatchEvent(new CustomEvent("matar:data"));
            } catch (e) { /* إعادة الرسم اختيارية */ }
          }
        }

        return { enhance };
      })();

      /* ============================================================
         إصدار 32 — نماذج التجميع للأسبوع الثاني (Ensemble Tail Ranges)
         ------------------------------------------------------------
         في الأيام 8–14 تنعدم دقة القيم الفردية فيزيائيًا لأي نموذج حتمي
         مفرد، فالعرض الصحيح «نطاقات احتمالية عريضة» لا ساعات قطعية:
         ① نجلب أعضاء التجميع ECMWF IFS 0.25° (51 عضوًا) من
            ensemble-api.open-meteo.com — طلب واحد مُخزَّن 6 ساعات لكل
            موقع — ونحسب لكل يوم: نطاق العظمى p10–p90، نطاق الصغرى
            p10–p90، ونسبة الأعضاء الرطبة (≥ 0.2 ملم) كاحتمال مطر ±12٪.
         ② عند فشل الجلب (أوفلاين/وضع اقتصادي/حد المزود) نسقط إلى
            نموذج انتشار أخطاء NWP قياسي حول القيم الحتمية:
            ±1.1° عند اليوم 8 يتنامى إلى ±4.1° عند اليوم 14.
         النتيجة في wx.ensemble وتقرأها بطاقات الأيام فتعرض «29–32°»
         مع شارة مصدر فوق الشبكة (طاقمية / تقديرية).
         ============================================================ */
      const Ensemble = (() => {
        const ENS_KEY = "matar:ensemble:v1";
        const ENS_TTL = 6 * HOUR;      /* دورة تحديث التجميعات ~6 ساعات */
        const TAIL = 7;                /* فهرس اليوم الثامن (بداية الذيل البعيد) */

        /* مئين p من مصفوفة مرتبة (استيفاء خطي) */
        function pct(sorted, p) {
          if (!sorted.length) return null;
          const pos = clamp((p / 100) * (sorted.length - 1), 0, sorted.length - 1);
          const lo = Math.floor(pos), hi = Math.ceil(pos);
          return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
        }
        function cacheGet(key) {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || Date.now() - obj.at > ENS_TTL) return null;
            return obj.v;
          } catch (e) { return null; }
        }
        function cacheSet(key, v) {
          try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), v })); } catch (e) {}
        }

        /* تجميع أعضاء التجميع إلى نطاقات يومية p10–p90 */
        function buildFromMembers(d) {
          const hh = d?.hourly;
          if (!hh || !Array.isArray(hh.time) || hh.time.length < 24) return null;
          const tempKeys = Object.keys(hh).filter((k) => /^temperature_2m_member\d+$/.test(k));
          if (tempKeys.length < 8) return null; /* لا يوجد طاقم حقيقي في الاستجابة */
          const days = new Map();
          hh.time.forEach((t, i) => {
            const date = String(t).slice(0, 10);
            let rec = days.get(date);
            if (!rec) { rec = { maxs: [], mins: [], wet: 0, n: 0 }; days.set(date, rec); }
            let tmax = -Infinity, tmin = Infinity, pr = 0, ok = false;
            tempKeys.forEach((k) => {
              const v = hh[k]?.[i];
              if (v == null || Number.isNaN(v)) return;
              ok = true;
              if (v > tmax) tmax = v;
              if (v < tmin) tmin = v;
              const pv = hh[`precipitation${k.slice("temperature_2m".length)}`]?.[i];
              if (pv != null && !Number.isNaN(pv)) pr += pv;
            });
            if (!ok) return;
            rec.maxs.push(Math.round(tmax * 10) / 10);
            rec.mins.push(Math.round(tmin * 10) / 10);
            rec.n += 1;
            if (pr >= 0.2) rec.wet += 1;
          });
          const dates = [...days.keys()].sort();
          if (dates.length <= TAIL) return null;
          const ens = { source: "ecmwf_ifs025", label: "ECMWF-ENS", time: [], tMaxLo: [], tMaxHi: [], tMinLo: [], tMinHi: [], pLo: [], pHi: [] };
          for (let i = TAIL; i < dates.length; i += 1) {
            const rec = days.get(dates[i]);
            if (!rec.n) continue;
            rec.maxs.sort((a, b) => a - b);
            rec.mins.sort((a, b) => a - b);
            const p = Math.round((rec.wet / rec.n) * 100);
            ens.time.push(dates[i]);
            ens.tMaxLo.push(+pct(rec.maxs, 10).toFixed(1));
            ens.tMaxHi.push(+pct(rec.maxs, 90).toFixed(1));
            ens.tMinLo.push(+pct(rec.mins, 10).toFixed(1));
            ens.tMinHi.push(+pct(rec.mins, 90).toFixed(1));
            ens.pLo.push(Math.max(0, p - 12));
            ens.pHi.push(Math.min(95, p + 12));
          }
          return ens.time.length ? ens : null;
        }

        /* الاحتياط: نطاقات تقديرية تتنامى مع بعد اليوم (انتشار أخطاء النماذج الحتمية) */
        function spreadFallback(d) {
          const ens = { source: "spread", label: null, time: [], tMaxLo: [], tMaxHi: [], tMinLo: [], tMinHi: [], pLo: [], pHi: [] };
          const n = Math.min(14, d?.time?.length ?? 0);
          for (let i = TAIL; i < n; i += 1) {
            const hi = d.temperature_2m_max?.[i], lo = d.temperature_2m_min?.[i];
            if (hi == null || lo == null) continue;
            const w = 1.1 + 0.5 * (i - TAIL);
            ens.time.push(d.time[i]);
            ens.tMaxLo.push(+(hi - w).toFixed(1));
            ens.tMaxHi.push(+(hi + w).toFixed(1));
            ens.tMinLo.push(+(lo - w).toFixed(1));
            ens.tMinHi.push(+(lo + w).toFixed(1));
            const p = Number(d.precipitation_probability_max?.[i] ?? 0);
            ens.pLo.push(Math.max(0, Math.round(p - 12 - (i - TAIL))));
            ens.pHi.push(Math.min(95, Math.round(p + 15 + (i - TAIL) * 2)));
          }
          return ens.time.length ? ens : null;
        }

        async function fetchMembers(place, signal) {
          const u = new URL("https://ensemble-api.open-meteo.com/v1/ensemble");
          u.search = new URLSearchParams({
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            hourly: "temperature_2m,precipitation",
            models: "ecmwf_ifs025",
            forecast_days: "14",
            timezone: "auto",
          });
          return getJson(u, signal);
        }

        async function enhance(place, wx, signal) {
          if (!place || !wx || wx.__ensemble || wx.__demo || state.isDemoData || state.isCachedData) return;
          wx.__ensemble = true;
          const key = `${ENS_KEY}:${Number(place.latitude).toFixed(2)},${Number(place.longitude).toFixed(2)}`;
          let ens = null;
          try {
            if (navigator.onLine && !Eco.isEco()) {
              const cached = cacheGet(key);
              const d = cached ?? (await fetchMembers(place, signal));
              if (d) {
                if (!cached) cacheSet(key, d);
                ens = buildFromMembers(d);
              }
            }
          } catch (e) { /* الطاقم اختياري — نسقط للنطاقات التقديرية بهدوء */ }
          if (!ens) ens = spreadFallback(wx.daily);
          if (ens) {
            wx.ensemble = ens;
            /* الأيام البعيدة تُعرض فورًا كنطاقات — إعادة رسم شبكة الأيام فقط */
            try { Dashboard.refreshDays(); } catch (e) {}
          }
        }

        return { enhance };
      })();

      function hourIndexAtPlace(wx) {
        // استخدم وقت الموقع نفسه من الاستجابة لتفادي فرق ساعة الجهاز والمنطقة الزمنية.
        const times = wx?.hourly?.time;
        if (!times?.length) return 0;
        const currentTime = wx.current?.time;
        if (currentTime) {
          const currentHour = currentTime.slice(0, 13);
          let localIndex = -1;
          for (let i = 0; i < times.length; i += 1) {
            if (times[i].slice(0, 13) <= currentHour) localIndex = i;
            else break;
          }
          if (localIndex >= 0) return localIndex;
        }
        const now = Date.now();
        const offset = (wx.utc_offset_seconds ?? 0) * 1000;
        const t0 = weatherTime(times[0]);
        if (t0 == null) return 0;
        const idx = clamp(Math.floor((now + offset - t0) / HOUR), 0, times.length - 1);
        // حماية إضافية: لو الساعة المفهرسة غير موجودة فعلًا في الجدول نرجع أول فهرس صالح
        return times[idx] ? idx : 0;
      }

      /* ============================================================
         ذاكرة التخزين المؤقت للأوفلاين (Offline Graceful Degradation)
         نحفظ آخر قراءة ناجحة محليًا في localStorage، وعند فشل الجلب نعرض
         القراءة المحفوظة بدل شاشة فارغة أو بيانات وهمية، ثم نجدد تلقائيًا.
         ============================================================ */
      const CACHE_KEY = "matar:cache:v1";
      const CACHE_TTL = 24 * HOUR; // أقصى عمر للاستخدام: يوم كامل
      function cacheSave(place, wx, air) {
        try {
          const payload = { ts: Date.now(), place: { latitude: place.latitude, longitude: place.longitude, name: place.name, admin1: place.admin1, country: place.country, timezone: place.timezone }, wx, air };
          localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch (e) { /* التخزين ممتلئ أو محظور — نتجاهل بهدوء */ }
      }
      function cacheLoad(place) {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (!raw) return null;
          const p = JSON.parse(raw);
          if (!p?.wx?.hourly || !p?.place) return null;
          if (Date.now() - p.ts > CACHE_TTL) return null;
          if (place && Number.isFinite(place.latitude)) {
            const dLat = Math.abs(Number(p.place.latitude) - Number(place.latitude));
            const dLon = Math.abs(Number(p.place.longitude) - Number(place.longitude));
            if (dLat > 0.35 || dLon > 0.35) return null; // ذاكرة لموقع مختلف بعيدًا
          }
          return p;
        } catch (e) { return null; }
      }

      async function loadMainData(force = false) {
        const place = state.place;
        if (!place) return;
        const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
        if (!force && state.wxKey === key && state.wx) { Dashboard.render(); Agri.onData(); return; }
        state.wxKey = key;
        state.loadingWx = true;
        Dashboard.showLoading();
        const controller = new AbortController();
        state.wxAbort?.abort();
        state.wxAbort = controller;
        try {
          /* إصدار 16: الوضع الاقتصادي — نتخطّى طلب جودة الهواء لتقليل الجلب في الخلفية */
          if (Eco.isEco()) { try { window.__matarEcoBite?.(14, "جودة الهواء"); } catch (e) {} }
          const [wx, air] = await Promise.allSettled([
            fetchMainForecast(place, controller.signal),
            Eco.isEco() ? Promise.resolve(null) : fetchAirQuality(place, controller.signal),
          ]);
          if (controller.signal.aborted) return;
          if (wx.status === "rejected") throw wx.reason;
          state.wx = wx.value;
          state.air = air.status === "fulfilled" ? air.value : null;
          state.isDemoData = false;
          state.isCachedData = false;
          state.lastUpdatedAt = Date.now(); /* v70 — M-03: طابع آخر جلب حي فعلي */
          /* إصدار 30: معادلة دمج السحب والرطوبة اللحظية — تُحقن مباشرة بعد Fetch Response
             قبل أول رسم: إن قرأ النموذج صفر مطر بينما الغطاء السحابي >85٪ والرطوبة >85٪
             تُعامل القراءة كرذاذ محلي (weather_code=51) مع شارة is_corrected_locally */
          try { applyLocalHybridCalibration(state.wx); } catch (e) {}
          clearTimeout(state.wxRetryTimer);
          state.wxRetryTimer = 0;
          Dashboard.render();
          Agri.onData();
          cacheSave(place, state.wx, state.air);
          document.dispatchEvent(new CustomEvent("matar:data"));
          /* إصدار 28 (الدقة): نماذج إقليمية عالية الدقة + تصحيح انحياز الارتفاع
             خلف الكواليس — يعاد إعلان matar:data عند اكتماله كي تُحدَّث كل البطاقات */
          /* v49: التوقعات الممتدة (النماذج الإقليمية عالية الدقة + نطاقات التجميع)
             طلبات ثانوية — تُجلب 800ms بعد ظهور البطاقة الرئيسية كي يفتح التطبيق
             في أقل من ثانية، ويُلغى التأجيل إن غيّر المستخدم الموقع قبل انتهائه */
          const myWxKey49 = key;
          setTimeout(() => {
            if (state.wxKey !== myWxKey49 || !state.wx) return;
            if (!Eco.isEco()) {
              try { Accuracy.enhance(place, state.wx, controller.signal); } catch (e) { /* اختياري */ }
            }
            try { Ensemble.enhance(place, state.wx, controller.signal); } catch (e) { /* اختياري */ }
          }, 800);
        } catch (error) {
          if (error.name === "AbortError") return;
          // الأوفلاين: نحاول أولًا عرض آخر قراءة ناجحة محفوظة محليًا
          const cached = cacheLoad(place);
          if (cached) {
            state.wx = cached.wx;
            state.air = cached.air;
            state.isDemoData = false;
            state.isCachedData = true;
            state.cachedAt = cached.ts;
          } else {
            state.wx = buildMockForecast(place);
            state.air = null;
            state.isDemoData = true;
            state.isCachedData = false;
            state.cachedAt = 0;
          }
          Dashboard.render();
          Agri.onData();
          // المرحلة 13: إعلان matar:data أيضًا كي تُرسم بطاقتا المستشار الذكي في وضع
          // الكاش/العرض التجريبي (كانتا تظلان عالقتين على «يحلّل الآن…» بلا أوفلاين)
          document.dispatchEvent(new CustomEvent("matar:data"));
          // المرحلة 12: إعلان حالة العرض غير المباشر كي يتحدث شريط الأوفلاين البرتقالي فورًا
          document.dispatchEvent(new CustomEvent("matar:offline"));
          // استخدام بيانات العرض مؤقتًا مع إعادة محاولة الخدمة الحية على فترات متباعدة.
          if (!state.wxRetryTimer) {
            state.wxRetryTimer = setTimeout(() => {
              state.wxRetryTimer = 0;
              if (state.isDemoData) loadMainData(true);
            }, 60_000);
          }
        } finally {
          state.loadingWx = false;
        }
      }

      // عودة الاتصال: نجدد البيانات تلقائيًا كي لا تبقى القراءة القديمة معروضة
      window.addEventListener("online", () => {
        if (state.isCachedData || state.isDemoData) loadMainData(true);
      });

      /* ============================================================
         إصدار 16 — الوضع الاقتصادي وموفّر البيانات (Eco & Data Saver)
         ------------------------------------------------------------
         زر توفير واحد يفعل ثلاث حمايات للمزارع في الحقل والمسافر على الطريق:
         ① إيقاف تحميل خرائط Leaflet الثقيلة كليًا (الكبرى + المصغرة + خريطة
            الطرق) واستبدالها بواجهات نصية أنيقة — بلا بلاطات ولا رادار ولا
            جزيئات رياح = صفر استهلاك للرسوميات والبيانات.
         ② تقليل جلب البيانات في الخلفية: فحص جودة الهواء يُتخطى، والفحص
            الدوري للتنبيهات يتباعد ×3، وتحليل الرادار اللحظي يسقط إلى
            بيانات minutely_15 المجانية مع الطلب الرئيسي.
         ③ إيقاف كل حركات CSS عبر html.eco (شريط تحميل، توهجات، انتقالات)
            — أكبر مصدر استنزاف للبطارية بعد الشاشة.
         التفضيل محفوظ في matar:eco ويعمل فورًا عند الإقلاع.
         ============================================================ */
      const Eco = (() => {
        const KEY = "matar:eco";
        let eco = false;
        try { eco = localStorage.getItem(KEY) === "1"; } catch (e) {}

        function isEco() { return eco; }

        /* تحديث كل الواجهات المرتبطة بالوضع: الفئة العامة + المفتاح + البدائل النصية */
        function apply() {
          document.documentElement.classList.toggle("eco", eco);
          const toggle = $("#eco-toggle");
          if (toggle) toggle.checked = eco;
          const state = $("#eco-state");
          if (state) {
            state.dataset.on = String(eco);
            state.textContent = eco
              ? tr("الوضع الاقتصادي مفعّل — الخرائط الثقيلة متوقفة، الجلب مخفَّض، والحركات موقفة لتوفير البطارية.")
              : tr("الوضع العادي — كل المزايا تعمل، بما فيها الخرائط الحية والرادار.");
          }
          const mini = $("#mini-eco");
          if (mini) {
            mini.classList.toggle("hidden", !eco);
            const box = $("#mini-map");
            if (box) box.style.visibility = eco ? "hidden" : "";
            const p = state.place;
            const coords = $("#mini-eco-coords");
            if (coords && p) coords.textContent = `${p.latitude.toFixed(3)}°, ${p.longitude.toFixed(3)}° · ${p.name || ""}`;
          }
          const overlay = $("#mini-map-overlay");
          if (overlay) overlay.classList.toggle("hidden", eco);
          const mx = $("#mx-eco");
          if (mx) mx.classList.toggle("hidden", !eco);
        }

        /* تبديل الوضع من الإعدادات أو من زر الخريطة الكبرى */
        function set(on) {
          eco = !!on;
          try { localStorage.setItem(KEY, eco ? "1" : "0"); } catch (e) {}
          apply();
          document.dispatchEvent(new CustomEvent("matar:eco", { detail: { eco } }));
        }

        function toggle() { set(!eco); }

        /* إعادة تفعيل تأثيرات الترجمة على نصوص البدائل النصية عند تغيير اللغة */
        function init() {
          const toggle = $("#eco-toggle");
          if (toggle) toggle.addEventListener("change", () => set(toggle.checked));
          const mxBtn = $("#mx-eco-disable");
          if (mxBtn) mxBtn.addEventListener("click", () => { set(false); showPage("map"); });
          document.addEventListener("matar:language", apply);
          document.addEventListener("matar:place", () => {
            const p = state.place;
            const coords = $("#mini-eco-coords");
            if (coords && p) coords.textContent = `${p.latitude.toFixed(3)}°, ${p.longitude.toFixed(3)}° · ${p.name || ""}`;
          });
          apply();
          /* تلميح البطارية: إن كان الجهاز يدعم Battery API والبطارية منخفضة
             وغير شاحنة — ننصح بتفعيل الوضع الاقتصادي (خاصة في الحقول والطرق) */
          if (navigator.getBattery) {
            navigator.getBattery().then((b) => {
              const hint = $("#eco-battery-hint");
              if (!hint) return;
              const render = () => {
                const low = b.level <= 0.25 && !b.charging;
                hint.classList.toggle("hidden", !low);
                if (low) hint.textContent = tf("بطاريتك منخفضة ({v}٪) وغير شاحنة — ننصح بتفعيل الوضع الاقتصادي الآن لتدوم معك أطول.", { v: localNum(Math.round(b.level * 100)) });
              };
              render();
              b.addEventListener("levelchange", render);
              b.addEventListener("chargingchange", render);
            }).catch(() => {});
          }
        }

        return { isEco, set, toggle, init, apply };
      })();

      /* ============================================================
         الصفحة 1: لوحة القيادة
         ============================================================ */
      const Dashboard = (() => {
        const el = {
          loading: $("#dash-loading"), error: $("#dash-error"), errorMsg: $("#dash-error-msg"),
          content: $("#dash-content"), retry: $("#dash-retry"),
          demoBanner: $("#demo-banner"),
          region: $("#hero-region"), place: $("#hero-place"), time: $("#hero-time"),
          icon: $("#hero-icon"), temp: $("#hero-temp"), desc: $("#hero-desc"), feels: $("#hero-feels"),
          details: $("#hero-details"), summary: $("#hero-summary"),
          accBadges: $("#acc-badges"), /* إصدار 28: شارات دقة النموذج */
          hourly: $("#hourly-strip"), days: $("#days-grid"), actGrid: $("#act-grid"),
          actBadge: $("#act-now-badge"),
          /* إصدار 17: مؤشر الملابس الذكي */
          outfit: $("#outfit-banner"), outfitIcon: $("#outfit-icon"), outfitTitle: $("#outfit-title"),
          outfitReason: $("#outfit-reason"), outfitTips: $("#outfit-tips"),
          miniMap: $("#mini-map"), miniNote: $("#mini-map-note"), miniTime: $("#mini-radar-time"),
          offlineBanner: $("#offline-banner"),
        };

        /* ↓ الخريطة المصغرة (miniMap/miniMarker/miniRadar + ensureMiniMap/loadMiniRadar/
           refreshMiniRadarTexts) انتقلت كاملة إلى map.js §4 داخل window.__matarMiniMapWidget
           — تصريحاتها موجودة حرفيًا هناك، والاستدعاءات أدناه تمر عبر الجسر نفسه */
        let renderedKey = "";

        function showLoading() {
          el.loading.classList.remove("hidden");
          el.error.classList.add("hidden");
          el.content.classList.add("hidden");
        }

        function showError(message) {
          el.loading.classList.add("hidden");
          el.error.classList.remove("hidden");
          el.content.classList.add("hidden");
          el.errorMsg.textContent = message;
        }

        function showContent() {
          el.loading.classList.add("hidden");
          el.error.classList.add("hidden");
          el.content.classList.remove("hidden");
        }

        function heroDetails(wx, idx) {
          const h = wx.hourly;
          const at = (k) => h[k]?.[idx];
          const rows = [
            { icon: "water", label: tr("الرطوبة"), value: `${localNum(at("relative_humidity_2m"))}٪`, extra: tf("نقطة الندى {v}", { v: tempText(at("dew_point_2m")) }) },
            { icon: "wind", label: tr("الرياح"), value: `${localNum(at("wind_speed_10m"))} ${tr("كم/س")}`, extra: `${windDirName(at("wind_direction_10m"))} · ${tf("هبّات {v}", { v: localNum(at("wind_gusts_10m")) })}` },
            { icon: "gauge", label: tr("الضغط"), value: `${localNum(at("pressure_msl"))} hPa`, extra: (at("pressure_msl") ?? 1013) >= 1013 ? tr("ضغط مرتفع نسبيًا") : tr("ضغط منخفض نسبيًا") },
            { icon: "sun", label: tr("الأشعة UV"), value: localNum(at("uv_index"), 1), extra: uvLabel(at("uv_index")) },
            { icon: "eye", label: tr("مدى الرؤية"), value: at("visibility") != null ? `${localNum(at("visibility") / 1000)} ${tr("كم")}` : "—", extra: (at("visibility") ?? 9e9) < 2000 ? tr("رؤية محدودة") : tr("رؤية جيدة") },
            { icon: "cloud", label: tr("السحب"), value: `${localNum(at("cloud_cover"))}٪`, extra: tf("المطر الآن {v} مم", { v: localNum(at("precipitation"), 1) }) },
          ];
          el.details.innerHTML = rows.map((r) => `
            <div class="detail-card">
              <span class="detail-label">${iconSvg(r.icon, 14)} ${r.label}</span>
              <div class="detail-value">${r.value}</div>
              <div class="detail-extra">${r.extra}</div>
            </div>`).join("");
        }

        function renderHourly(wx) {
          const h = wx.hourly;
          if (!h?.time?.length) {
            el.hourly.innerHTML = `<li class="hour-cell">${tr("تعذّر تحميل توقعات الساعات. أعد المحاولة بعد قليل.")}</li>`;
            return;
          }
          const start = hourIndexAtPlace(wx);
          const items = [];
          for (let i = start; i < Math.min(start + 24, h.time.length); i += 1) {
            const prob = h.precipitation_probability?.[i] ?? 0;
            /* v70 — C-05: خلية «الآن» تعرض current.temperature_2m نفسها المعروضة
               في البطل بالضبط — منعًا لأي تضارب بين المصدرين */
            const cellTemp = i === start && wx.current?.temperature_2m != null
              ? wx.current.temperature_2m
              : h.temperature_2m?.[i];
            items.push(`
              <li class="hour-cell ${i === start ? "now" : ""}">
                <span class="hour-time">${i === start ? tr("الآن") : placeClock(h.time[i])}</span>
                <span class="hour-icon">${wmoSvg(cloudFixCode(h.weather_code?.[i] ?? 0, h.cloud_cover?.[i]), h.is_day?.[i] ?? 1, 20)}</span>
                <span class="hour-temp">${tempText(cellTemp)}</span>
                <span class="hour-rain"><b style="width:${prob ?? 0}%"></b></span>
                <span class="hour-prob">${iconSvg("water", 11)} ${localNum(prob)}٪</span>
                <span class="hour-wind">${windArrow(h.wind_direction_10m?.[i])} ${localNum(h.wind_speed_10m?.[i])}</span>
              </li>`);
          }
          el.hourly.innerHTML = items.join("");
        }

        /* ============================================================
           إصدار 32 — تجاوز الرادار للشريط الساعي (Nowcasting Override)
           إن أكّد رادار RainViewer مطرًا فوق الموقع الآن، أو اقتراب كتلة
           مطرية تصل خلال ≤ 30 دقيقة، يُرفع مؤشر المطر في الجدول الساعي
           للساعات الثلاث القادمة قسريًا — علاج فجوة «الرذاذ المحلي»
           التي تغفلها النماذج الحتمية البعيدة. التعديل يطال مصفوفات
           state.wx نفسها فيبقى الشريط والبطل والمستشارون متسقين.
           ============================================================ */
        function applyNowcastOverride(res) {
          try {
            if (!res || res.via !== "radar") return false;
            const wetNow = res.kind === "now";
            const wetSoon = res.kind === "soon" && res.etaMin <= 30;
            if (!wetNow && !wetSoon) return false;
            const h = state.wx?.hourly;
            if (!h?.time?.length) return false;
            const start = clamp(hourIndexAtPlace(state.wx), 0, h.time.length - 1);
            const floorProb = wetNow ? 80 : 65;
            let touched = 0;
            for (let i = start; i < Math.min(start + 3, h.time.length); i += 1) {
              if (Array.isArray(h.precipitation_probability)) {
                const cur = h.precipitation_probability[i];
                if (cur == null || cur < floorProb) { h.precipitation_probability[i] = floorProb; touched += 1; }
              }
              if (Array.isArray(h.precipitation) && h.precipitation[i] === 0) {
                h.precipitation[i] = wetNow ? 0.2 : 0.1;
              }
              if (wetNow && Array.isArray(h.weather_code) && (h.weather_code[i] ?? 0) < 51) {
                h.weather_code[i] = 51; /* رذاذ/مطر خفيف مؤكد راداريًا */
              }
            }
            if (touched) renderHourly(state.wx); /* إعادة رسم فورية للشريط */
            return touched > 0;
          } catch (e) { return false; }
        }

        /* ═════════ v50 — مؤشر الأنشطة الذكي: منطق موحّد (Unified Activity Logic) ═════════
           الوصف النصي أسفل كل بطاقة نشاط يُولَّد من نفس المتغيرات التي تُحسب منها
           النسبة المئوية (Score-Driven Dynamic Descriptions) — لا نصوص ثابتة تعتمد
           على الحرارة فقط، ولا تناقض بين الرقم والوصف في أي مدينة حول العالم:
             • أمطار أو عواصف (precipitation > 0.2mm أو weather_code >= 51): النسبة
               تُسقَط قسرًا إلى 0–15٪ (العواصف 0–8٪) مع شارة «غير مناسب الآن»،
               والوصف يتغير فورًا ليطابق الواقع (مثل: أمطار متساقطة حاليًا —
               يُنصح بالجلسات الداخلية) بدل «أجواء لطيفة لقعدة حلوة».
             • رياح قوية (أكثر من 35 كم/س) أو غبار/مؤشر جودة هواء مرتفع: الوصف
               يوضح السبب (رياح نشطة أو أتربة — يفضّل تأجيل النشاط الخارجي).
             • برودة شديدة (أقل من 10°م) أو حر شديد (أكثر من 36°م): الوصف يوضح
               سبب عدم الملاءمة بدقة — مع تخصيص السباحة عن الحرارة (تبريد مثالي).
             • «أجواء لطيفة» لا تظهر إلا إذا كانت النسبة ≥ 70٪ بلا أمطار ولا رياح
               مزعجة ولا غبار — نفس القواعد باللغات السبع عبر مدخلات القاموس. */
        const ACT_TIPS = {
          rain: {
            _: "أمطار متساقطة حاليًا — يُنصح بنشاط داخلي.",
            run: "أمطار متساقطة حاليًا — أجّل التمرين أو انتقل إلى جهاز داخلي.",
            cycle: "أمطار تجعل الطريق زلقًا — أجّل ركوب الدراجة.",
            swim: "أمطار وعواصف — السباحة غير آمنة الآن.",
            drive: "أمطار تقلل الرؤية وتجعل الطرق زلقة — خفّف السرعة وزد المسافة.",
            football: "أرض مبللة بأمطار — أجّل المباراة أو استخدم حذاءً مسننًا.",
            laundry: "أمطار — علّق الملابس داخل المنزل اليوم.",
            stars: "غيوم وأمطار تحجب السماء — لا رصد للنجوم الليلة.",
            sit: "أمطار متساقطة حاليًا — يُنصح بالجلسات الداخلية.",
          },
          good: {
            run: "أجواء مثالية للجري — ظل وماء معك في المسار.",
            cycle: "طريقك جاهز — لا تنسَ الخوذة.",
            swim: "الجو مثالي لنقطة تبريد.",
            drive: "الطرق سليمة عمومًا الآن.",
            football: "مباراتك لن تتأخر اليوم.",
            laundry: "شمس ورياح مناسبة للتجفيف.",
            stars: "سماء صافية — ليلة رصد ممتازة.",
            sit: "أجواء لطيفة لقعدة حلوة.",
          },
          fair: {
            run: "أفضل وقت: صباحًا أو مساءً مع ظل وماء.",
            cycle: "الظروف مقبولة — اختر مسارًا بظل وتفادَ ساعات الهبّات.",
            swim: "انتظر جوًا أكثر دفئًا أو اختر مسبحًا مغطى.",
            drive: "الطرق مقبولة — انتبه للهبّات العالية وقت القيادة.",
            football: "الظروف مقبولة — افحص أرض الملعب وخطّط توقيت المباراة.",
            laundry: "الرطوبة قد تؤخر الجفاف — اختر ساعات الذروة المشمسة.",
            stars: "السحب ستحجب معظم النجوم.",
            sit: "اختر مكانًا مظللًا واشرب ماءً بين الحين والآخر.",
          },
          storm: "عواصف رعدية الآن — أجّل النشاط الخارجي فورًا وابقَ في مكان آمن.",
          snow: "تساقط ثلجي — الطرق زلقة والجو غير مناسب للأنشطة الخارجية.",
          fog: "ضباب يقلل الرؤية — خفّف السرعة وتوخَّ الحذر في التنقل.",
          dust: "أتربة وجودة هواء متدنية — يفضّل البقاء في الداخل وإغلاق النوافذ.",
          wind: "رياح نشطة أو هبّات قوية — يفضّل تأجيل النشاط الخارجي.",
          windLaundry: "رياح قوية — ثبّت حبال الغسيل جيدًا أو انتظر هبوبًا أخف.",
          hot: "حر شديد (أكثر من 36 درجة) — تجنّب المجهود وقت الذروة واشرب ماءً باستمرار.",
          hotSwim: "حرارة مرتفعة — السباحة أفضل وقت للتبريد مع حماية من الشمس.",
          cold: "برودة شديدة (أقل من 10 درجات) — الملابس الدافئة ضرورية أو اختر نشاطًا داخليًا.",
          coldSwim: "الماء بارد — انتظر جوًا أكثر دفئًا أو اختر مسبحًا مغطى.",
        };
        /* تسجيل نصوص v50 في القاموس الممتد — اللغات السبع كاملة كي لا يحدث
           أي تناقض بين الرقم والوصف في أي لغة أو مدينة حول العالم */
        try {
          Object.assign(I18N_EXTRA, {
            "أمطار متساقطة حاليًا — يُنصح بنشاط داخلي.": { en: "Rain falling right now — an indoor activity is advised.", fr: "Pluie en cours — privilégiez une activité en intérieur.", de: "Regen fällt gerade — eine Aktivität im Innenbereich ist ratsam.", es: "Lluvia en este momento — se recomienda una actividad bajo techo.", pt: "Chuva neste momento — recomenda-se atividade em ambiente fechado.", it: "Pioggia in questo momento — consigliata un’attività al coperto." },
            "أمطار متساقطة حاليًا — أجّل التمرين أو انتقل إلى جهاز داخلي.": { en: "Rain falling right now — postpone the workout or move to an indoor machine.", fr: "Pluie en cours — reportez l’entraînement ou passez à une machine en intérieur.", de: "Regen fällt gerade — verschiebe das Training oder nutze ein Gerät drinnen.", es: "Lluvia en este momento — posponga el entrenamiento o pase a una máquina interior.", pt: "Chuva neste momento — adie o treino ou mude para um equipamento indoor.", it: "Pioggia in questo momento — rimanda l’allenamento o passa a una macchina al coperto." },
            "أمطار تجعل الطريق زلقًا — أجّل ركوب الدراجة.": { en: "Rain makes the road slippery — postpone the bike ride.", fr: "La pluie rend la route glissante — reportez la sortie à vélo.", de: "Regen macht die Straße rutschig — verschiebe die Radfahrt.", es: "La lluvia vuelve resbaladizo el camino — posponga el paseo en bicicleta.", pt: "A chuva deixa a estrada escorregadia — adie o passeio de bicicleta.", it: "La pioggia rende la strada scivolosa — rimanda il giro in bici." },
            "أمطار وعواصف — السباحة غير آمنة الآن.": { en: "Rain and storms — swimming is unsafe right now.", fr: "Pluie et orages — la baignade est dangereuse pour l’instant.", de: "Regen und Stürme — Schwimmen ist jetzt unsicher.", es: "Lluvia y tormentas — nadar no es seguro ahora.", pt: "Chuva e tempestades — nadar não é seguro agora.", it: "Pioggia e temporali — nuotare non è sicuro adesso." },
            "أمطار تقلل الرؤية وتجعل الطرق زلقة — خفّف السرعة وزد المسافة.": { en: "Rain reduces visibility and makes roads slippery — slow down and keep more distance.", fr: "La pluie réduit la visibilité et rend les routes glissantes — ralentissez et augmentez la distance.", de: "Regen mindert die Sicht und macht Straßen rutschig — langsamer fahren und mehr Abstand halten.", es: "La lluvia reduce la visibilidad y vuelve resbaladizas las carreteras — reduzca la velocidad y aumente la distancia.", pt: "A chuva reduz a visibilidade e torna as estradas escorregadias — reduza a velocidade e aumente a distância.", it: "La pioggia riduce la visibilità e rende le strade scivolose — rallenta e aumenta la distanza." },
            "أرض مبللة بأمطار — أجّل المباراة أو استخدم حذاءً مسننًا.": { en: "Pitch soaked with rain — postpone the match or wear studs.", fr: "Terrain détrempé par la pluie — reportez le match ou portez des crampons.", de: "Platz vom Regen durchnässt — verschiebe das Spiel oder benutze Stollenschuhe.", es: "Campo empapado por la lluvia — posponga el partido o use tacos.", pt: "Campo encharcado pela chuva — adie o jogo ou use chuteiras com cravos.", it: "Campo inzuppato di pioggia — rimanda la partita o usa scarpe tacchette." },
            "أمطار — علّق الملابس داخل المنزل اليوم.": { en: "Rain — hang the laundry indoors today.", fr: "Pluie — étendez le linge à l’intérieur aujourd’hui.", de: "Regen — Wäsche heute drinnen aufhängen.", es: "Lluvia — tienda la ropa dentro de casa hoy.", pt: "Chuva — estenda a roupa dentro de casa hoje.", it: "Pioggia — stendi il bucato in casa oggi." },
            "غيوم وأمطار تحجب السماء — لا رصد للنجوم الليلة.": { en: "Clouds and rain hide the sky — no stargazing tonight.", fr: "Nuages et pluie masquent le ciel — pas d’observation ce soir.", de: "Wolken und Regen verdecken den Himmel — heute keine Sternbeobachtung.", es: "Nubes y lluvia cubren el cielo — sin observación esta noche.", pt: "Nuvens e chuva encobrem o céu — sem observação esta noite.", it: "Nuvole e pioggia coprono il cielo — niente osservazione stasera." },
            "أمطار متساقطة حاليًا — يُنصح بالجلسات الداخلية.": { en: "Rain falling right now — indoor seating is advised.", fr: "Pluie en cours — installez-vous à l’intérieur.", de: "Regen fällt gerade — Sitzplätze im Inneren empfohlen.", es: "Lluvia en este momento — se recomienda quedarse bajo techo.", pt: "Chuva neste momento — recomenda-se ficar em ambiente fechado.", it: "Pioggia in questo momento — consigliato restare al coperto." },
            "عواصف رعدية الآن — أجّل النشاط الخارجي فورًا وابقَ في مكان آمن.": { en: "Thunderstorms now — postpone any outdoor activity immediately and stay in a safe place.", fr: "Orages en cours — reportez immédiatement toute activité extérieure et restez en lieu sûr.", de: "Gewitter jetzt — Aktivitäten im Freien sofort verschieben und an einem sicheren Ort bleiben.", es: "Tormentas eléctricas ahora — posponga de inmediato cualquier actividad al aire libre y quédese en un lugar seguro.", pt: "Tempestades elétricas agora — adie imediatamente qualquer atividade ao ar livre e fique num lugar seguro.", it: "Temporali in corso — rimanda subito ogni attività all’aperto e resta in un luogo sicuro." },
            "تساقط ثلجي — الطرق زلقة والجو غير مناسب للأنشطة الخارجية.": { en: "Snowfall — roads are slippery and the weather isn’t fit for outdoor activities.", fr: "Chutes de neige — routes glissantes et temps peu propice aux activités extérieures.", de: "Schneefall — Straßen sind rutschig, das Wetter taugt nicht für Draußen-Aktivitäten.", es: "Nevadas — carreteras resbaladizas y tiempo poco apto para actividades al aire libre.", pt: "Neve — estradas escorregadias e tempo pouco adequado para atividades ao ar livre.", it: "Nevicate — strade scivolose e tempo poco adatto alle attività all’aperto." },
            "ضباب يقلل الرؤية — خفّف السرعة وتوخَّ الحذر في التنقل.": { en: "Fog reduces visibility — slow down and move around with caution.", fr: "Le brouillard réduit la visibilité — ralentissez et déplacez-vous avec prudence.", de: "Nebel mindert die Sicht — langsamer fahren und vorsichtig bewegen.", es: "La niebla reduce la visibilidad — reduzca la velocidad y muévase con precaución.", pt: "A névoa reduz a visibilidade — reduza a velocidade e desloque-se com cuidado.", it: "La nebbia riduce la visibilità — rallenta e muoviti con prudenza." },
            "أتربة وجودة هواء متدنية — يفضّل البقاء في الداخل وإغلاق النوافذ.": { en: "Dust and poor air quality — staying indoors with windows closed is better.", fr: "Poussière et mauvaise qualité de l’air — mieux vaut rester à l’intérieur fenêtres fermées.", de: "Staub und schlechte Luftqualität — besser drinnen bleiben und Fenster schließen.", es: "Polvo y mala calidad del aire — mejor quedarse dentro con las ventanas cerradas.", pt: "Poeira e má qualidade do ar — melhor ficar dentro de casa com as janelas fechadas.", it: "Polvere e scarsa qualità dell’aria — meglio restare al chiuso con le finestre chiuse." },
            "رياح نشطة أو هبّات قوية — يفضّل تأجيل النشاط الخارجي.": { en: "Active winds or strong gusts — postponing the outdoor activity is better.", fr: "Vents actifs ou rafales fortes — mieux vaut reporter l’activité extérieure.", de: "Aktiver Wind oder starke Böen — besser die Aktivität draußen verschieben.", es: "Viento activo o rachas fuertes — mejor posponer la actividad al aire libre.", pt: "Vento ativo ou rajadas fortes — melhor adiar a atividade ao ar livre.", it: "Vento vivace o raffiche forti — meglio rimandare l’attività all’aperto." },
            "رياح قوية — ثبّت حبال الغسيل جيدًا أو انتظر هبوبًا أخف.": { en: "Strong wind — secure the clothesline well or wait for calmer winds.", fr: "Vent fort — bien attacher le fil à linge ou attendre un vent plus calme.", de: "Starker Wind — Wäscheleine gut sichern oder auf schwächeren Wind warten.", es: "Viento fuerte — asegure bien la cuerda de ropa o espere un viento más suave.", pt: "Vento forte — fixe bem o varal ou espere um vento mais calmo.", it: "Vento forte — fissa bene il filo del bucato o aspetta un vento più calmo." },
            "حر شديد (أكثر من 36 درجة) — تجنّب المجهود وقت الذروة واشرب ماءً باستمرار.": { en: "Severe heat (above 36 degrees) — avoid exertion at peak hours and drink water constantly.", fr: "Chaleur extrême (plus de 36 degrés) — évitez l’effort aux heures de pointe et buvez de l’eau constamment.", de: "Extreme Hitze (über 36 Grad) — Anstrengung zur Spitzenzeit vermeiden und ständig Wasser trinken.", es: "Calor intenso (más de 36 grados) — evite el esfuerzo en las horas pico y beba agua constantemente.", pt: "Calor intenso (acima de 36 graus) — evite esforço nas horas de pico e beba água constantemente.", it: "Caldo intenso (oltre 36 gradi) — evita lo sforzo nelle ore di punta e bevi acqua costantemente." },
            "حرارة مرتفعة — السباحة أفضل وقت للتبريد مع حماية من الشمس.": { en: "High temperature — swimming is the best cooling break, with sun protection.", fr: "Température élevée — la baignade est la meilleure pause fraîcheur, avec protection solaire.", de: "Hohe Temperatur — Schwimmen ist die beste Abkühlung, mit Sonnenschutz.", es: "Temperatura alta — nadar es la mejor pausa de refrigeración, con protección solar.", pt: "Temperatura alta — nadar é a melhor pausa para se refrescar, com proteção solar.", it: "Temperatura alta — nuotare è la migliore pausa rinfrescante, con protezione solare." },
            "برودة شديدة (أقل من 10 درجات) — الملابس الدافئة ضرورية أو اختر نشاطًا داخليًا.": { en: "Severe cold (below 10 degrees) — warm clothing is essential or pick an indoor activity.", fr: "Froid intense (moins de 10 degrés) — des vêtements chauds sont essentiels ou choisissez une activité en intérieur.", de: "Strenge Kälte (unter 10 Grad) — warme Kleidung ist Pflicht oder wähle eine Indoor-Aktivität.", es: "Frío intenso (menos de 10 grados) — la ropa abrigada es esencial o elija una actividad bajo techo.", pt: "Frio intenso (abaixo de 10 graus) — roupa quente é essencial ou escolha atividade em ambiente fechado.", it: "Freddo intenso (sotto i 10 gradi) — abiti caldi indispensabili oppure scegli un’attività al coperto." },
            "الماء بارد — انتظر جوًا أكثر دفئًا أو اختر مسبحًا مغطى.": { en: "Cold water — wait for warmer weather or pick a covered pool.", fr: "Eau froide — attendez un temps plus chaud ou choisissez une piscine couverte.", de: "Kaltes Wasser — warte auf wärmeres Wetter oder wähle ein überdachtes Becken.", es: "Agua fría — espere un clima más cálido o elija una piscina cubierta.", pt: "Água fria — espere tempo mais quente ou escolha uma piscina coberta.", it: "Acqua fredda — aspetta un clima più caldo o scegli una piscina coperta." },
            "أجواء مثالية للجري — ظل وماء معك في المسار.": { en: "Perfect running weather — keep shade and water on your route.", fr: "Météo parfaite pour courir — gardez ombre et eau sur votre parcours.", de: "Perfektes Laufwetter — Schatten und Wasser einpacken.", es: "Clima perfecto para correr — lleve sombra y agua en su ruta.", pt: "Tempo perfeito para correr — leve sombra e água no percurso.", it: "Meteo perfetto per correre — porta con te ombra e acqua nel percorso." },
            "الظروف مقبولة — اختر مسارًا بظل وتفادَ ساعات الهبّات.": { en: "Conditions are fair — pick a shaded route and avoid gusty hours.", fr: "Conditions correctes — choisissez un parcours ombragé et évitez les heures de rafales.", de: "Bedingungen passen — wähle eine schattige Strecke und meide Böen-Zeiten.", es: "Condiciones aceptables — elija una ruta con sombra y evite las horas de rachas.", pt: "Condições aceitáveis — escolha um percurso com sombra e evite as horas de rajadas.", it: "Condizioni accettabili — scegli un percorso ombreggiato ed evita le ore di raffiche." },
            "الطرق مقبولة — انتبه للهبّات العالية وقت القيادة.": { en: "Roads are fair — watch out for strong gusts while driving.", fr: "Routes correctes — attention aux rafales fortes en conduisant.", de: "Straßen in Ordnung — achte beim Fahren auf starke Böen.", es: "Carreteras aceptables — atención a las rachas fuertes al conducir.", pt: "Estradas aceitáveis — atenção às rajadas fortes ao conduzir.", it: "Strade accettabili — attenzione alle raffiche forti alla guida." },
            "الظروف مقبولة — افحص أرض الملعب وخطّط توقيت المباراة.": { en: "Conditions are fair — check the pitch and plan the match timing.", fr: "Conditions correctes — vérifiez le terrain et planifiez l’horaire du match.", de: "Bedingungen passen — prüfe den Platz und plane die Spielzeit.", es: "Condiciones aceptables — revise el campo y planifique el horario del partido.", pt: "Condições aceitáveis — verifique o campo e planeie o horário do jogo.", it: "Condizioni accettabili — controlla il campo e pianifica l’orario della partita." },
            "الرطوبة قد تؤخر الجفاف — اختر ساعات الذروة المشمسة.": { en: "Humidity may slow drying — pick the sunniest peak hours.", fr: "L’humidité peut retarder le séchage — choisissez les heures les plus ensoleillées.", de: "Feuchte kann das Trocknen verzögern — wähle die sonnigsten Stunden.", es: "La humedad puede retrasar el secado — elija las horas más soleadas.", pt: "A humidade pode atrasar a secagem — escolha as horas mais soalheiras.", it: "L’umidità può rallentare l’asciugatura — scegli le ore più soleggiate." },
            "اختر مكانًا مظللًا واشرب ماءً بين الحين والآخر.": { en: "Pick a shaded spot and sip water now and then.", fr: "Choisissez un endroit ombragé et buvez de l’eau de temps en temps.", de: "Wähle einen schattigen Platz und trink zwischendurch Wasser.", es: "Elija un lugar con sombra y beba agua de vez en cuando.", pt: "Escolha um lugar com sombra e beba água de vez em quando.", it: "Scegli un posto all’ombra e bevi acqua ogni tanto." },
          });
        } catch (e) { /* القاموس غير متاح في بيئة اختبار — لا يعطل الواجهة */ }
        /* الوصف من نفس دالة الحساب: الأولوية للعواصف والثلج والأمطار ثم الضباب
           والغبار والرياح ثم الحرارة القصمة ثم الوصف اللطيف حصرًا عند ≥ 70٪ */
        function unifiedActivityTip(ctx, key, pct) {
          if (ctx.storm) return tr(ACT_TIPS.storm);
          if (ctx.snow) return tr(ACT_TIPS.snow);
          if (ctx.rainy) return tr(ACT_TIPS.rain[key] || ACT_TIPS.rain._);
          if (ctx.fog) return tr(ACT_TIPS.fog);
          if (ctx.dusty) return tr(ACT_TIPS.dust);
          if (ctx.gusty) return tr(key === "laundry" ? ACT_TIPS.windLaundry : ACT_TIPS.wind);
          if (pct < 70 && ctx.hot) return tr(key === "swim" ? ACT_TIPS.hotSwim : ACT_TIPS.hot);
          if (pct < 70 && ctx.cold) return tr(key === "swim" ? ACT_TIPS.coldSwim : ACT_TIPS.cold);
          if (key === "stars" && ctx.isDay) return tr("افلتهم السماء بعد المغرب ونرَ الحالة.");
          if (pct >= 70) return tr(ACT_TIPS.good[key]);
          return tr(ACT_TIPS.fair[key]);
        }

        /* ------- مؤشر الأنشطة الذكي ------- */
        function scoreActivities(wx, air) {
          const h = wx.hourly;
          const s = hourIndexAtPlace(wx);
          const avg = (arr, from, n) => {
            if (!arr) return null;
            let sum = 0, count = 0;
            for (let i = from; i < Math.min(from + n, arr.length); i += 1) {
              if (arr[i] != null && !Number.isNaN(arr[i])) { sum += arr[i]; count += 1; }
            }
            return count ? sum / count : null;
          };
          const N = 4;
          const temp = avg(h.temperature_2m, s, N);
          const rain = avg(h.precipitation, s, N) ?? 0;
          const prob = avg(h.precipitation_probability, s, N) ?? 0;
          const wind = avg(h.wind_speed_10m, s, N) ?? 0;
          const gust = avg(h.wind_gusts_10m, s, N) ?? 0;
          const rh = avg(h.relative_humidity_2m, s, N) ?? 50;
          const cloud = avg(h.cloud_cover, s, N) ?? 0;
          const vis = (h.visibility ? avg(h.visibility, s, N) : 10000) ?? 10000;
          const uv = h.uv_index?.[s] ?? 0;
          const codes = h.weather_code?.slice(s, s + N) ?? [0];
          const isDay = h.is_day?.[s] ?? 1;
          const storm = codes.some((c) => c >= 95);
          const fog = codes.some((c) => c === 45 || c === 48) || vis < 1500;
          const snow = codes.some((c) => (c >= 71 && c <= 77) || c === 85 || c === 86);
          /* رموز المطر: رذاذ/أمطار متجمدة/أمطار/زخات (51–67 و80–82) + عواصف (95+) */
          const wetCode = codes.some((c) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95);
          const aqi = air?.current?.us_aqi;
          /* v50: التصنيفات الموحدة — مشتقة من نفس القياسات التي تُحسب منها النسب
             كي يولد الوصف والنسبة من مصدر واحد بلا تناقض */
          const ctx = {
            storm, snow, fog, isDay,
            rainy: rain > 0.2 || wetCode,
            gusty: wind > 35 || gust > 45,
            dusty: aqi != null && aqi > 150,
            hot: temp != null && temp > 36,
            cold: temp != null && temp < 10,
          };

          const band = (v, lo, hi) => {
            if (v == null) return 0.7;
            if (v >= lo && v <= hi) return 1;
            if (v < lo) return clamp(1 - (lo - v) / Math.max(lo, 1), 0.15, 1);
            return clamp(1 - (v - hi) / Math.max(hi * 0.7, 1), 0.1, 1);
          };

          const base = 1 - (prob / 100) * 0.9 - (rain > 0.1 ? 0.3 : 0) - (storm ? 0.9 : 0);
          const clamp01 = (x) => clamp(x, 0, 1);

          /* ══ v70 — H-03: معايرة مؤشر الأنشطة بأوزان متمايزة واقعية ══
             منحنى راحة غاوسي لكل نشاط (gauss) يجعل «الحرارة المثالية» مختلفة:
             جري 13° · دراجات 19° · كرة 22° · جلسات 25° · سباحة 31° — فبلوغ 100٪
             يتطلب وقوف الحرارة عند مثالية نشاط واحد بعينه، ولا تجتمع ست أنشطة
             عند 100٪ في اللحظة نفسها أبدًا. مع عوامل متمايزة إضافية:
             رطوبة أعلى أثرًا على الجري والكرة (تبخر العرق)، حساسية رياح أكبر
             للدراجات منها للجري، خصم سحب للتجفيف (C-02) ورطوبة/غبار للنجوم
             والجلسات، وأشعة UV على الجري والجلوس والسباحة، وسقف 95٪ للقيادة
             (لا يوم قيادة مثالي تمامًا). */
          const gauss = (v, ideal, sigma) => {
            if (v == null) return 0.8;
            return Math.exp(-((v - ideal) ** 2) / (2 * sigma * sigma));
          };
          const rhPenalty = (v, lo, hi) => {
            if (v == null) return 0.9;
            if (v >= lo && v <= hi) return 1;
            if (v < lo) return clamp(1 - ((lo - v) / Math.max(lo, 1)) * 0.5, 0.5, 1);
            return clamp(1 - ((v - hi) / Math.max(100 - hi, 1)) * 0.6, 0.4, 1);
          };

          const defs = [
            { key: "run", emoji: "🏃", name: tr("الجري والتمرين"), score: clamp01(base * gauss(temp, 13, 8) * band(wind, 0, 18) * band(gust, 0, 30) * rhPenalty(rh, 30, 65) * (uv >= 8 ? 0.9 : 1) * (snow ? 0.5 : 1)) },
            { key: "cycle", emoji: "🚴", name: tr("ركوب الدراجة"), score: clamp01(base * gauss(temp, 19, 9) * band(wind, 0, 14) * band(gust, 0, 24) * rhPenalty(rh, 30, 70)) },
            { key: "swim", emoji: "🏊", name: tr("السباحة"), score: clamp01(gauss(temp, 31, 5) * (1 - prob / 130) * (storm ? 0.1 : 1) * band(gust, 0, 35) * (uv >= 11 ? 0.7 : 1)) },
            { key: "drive", emoji: "🚗", name: tr("القيادة"), score: clamp01(0.95 * (fog ? 0.35 : 1) * (storm ? 0.3 : 1) * band(gust, 0, 45) * band(vis / 1000, 4, 50)) },
            { key: "football", emoji: "⚽", name: tr("رياضة خارجية"), score: clamp01(base * gauss(temp, 22, 8) * band(gust, 0, 28) * rhPenalty(rh, 25, 70)) },
            { key: "laundry", emoji: "🧺", name: tr("تجفيف الملابس"), score: clamp01((1 - prob / 110) * band(rh, 25, 60) * band(wind, 4, 35) * laundryCloudPenalty(cloud) * (temp == null ? 0.85 : clamp((temp + 5) / 35, 0.15, 1)) * (isDay ? 1 : 0.4)) },
            { key: "stars", emoji: "🔭", name: tr("مراقبة النجوم"), score: clamp01((isDay ? 0.25 : 1) * (1 - cloud / 100) * (1 - prob / 120) * band(wind, 0, 16) * band(rh, 0, 80)) },
            { key: "sit", emoji: "🪑", name: tr("جلسة خارجية"), score: clamp01(base * gauss(temp, 25, 7) * band(gust, 0, 26) * (uv >= 8 ? 0.85 : uv >= 6 ? 0.92 : 1) * rhPenalty(rh, 30, 75) * (aqi && aqi > 150 ? 0.55 : 1)) },
          ];

          return defs.map((d) => {
            /* v50: الأمطار/العواصف/الثلج تُسقط النسبة قسرًا إلى 0–15٪ (العواصف 0–8٪)
               فتظهر شارة «غير مناسب الآن» والوصف يطابق الواقع فورًا */
            let sc = d.score;
            if (ctx.rainy || ctx.snow) sc = Math.min(sc, ctx.storm ? 0.08 : 0.15);
            /* v50: الحر الشديد (> 36°م) والبرودة الشديدة (< 10°م) تخفض الأنشطة
               الحساسة للحرارة إلى «مناسب بحذر» ويوضح النص السبب بدقة — كي لا يظهر
               «أجواء لطيفة» مع 38°م. السباحة مستثناة من الحر (تبريد مثالي)،
               والتجفيف/القيادة/النجوم محايدة حراريًا (شمس مساعدة/مكيف/ملابس دافئة) */
            const tempNeutral = d.key === "swim" || d.key === "laundry" || d.key === "drive" || d.key === "stars";
            if (!tempNeutral) {
              if (ctx.hot) sc = Math.min(sc, 0.55);
              if (ctx.cold) sc = Math.min(sc, 0.55);
            }
            const pct = Math.round(clamp01(sc) * 100);
            const verdict = pct >= 70 ? "good" : pct >= 40 ? "fair" : "poor";
            const text = pct >= 70 ? tr("الطقس مناسب") : pct >= 40 ? tr("مناسب بحذر") : tr("غير مناسب الآن");
            /* الوصف النصي يولد من نفس سياق الحساب أعلاه — لا نص ثابت */
            const tip = unifiedActivityTip(ctx, d.key, pct);
            return { ...d, score: sc, pct, verdict, text, tip };
          });
        }

        function renderActivities(wx, air) {
          const acts = scoreActivities(wx, air);
          el.actGrid.innerHTML = acts.map((a) => `
            <div class="act-card">
              <div class="act-top">
                <span class="act-emoji" aria-hidden="true">${actIcon(a.key, 20)}</span>
                <div>
                  <div class="act-name">${a.name}</div>
                  <div class="act-verdict" data-v="${a.verdict}">${a.text}</div>
                </div>
              </div>
              <div class="act-bar"><b data-v="${a.verdict}" style="width:${a.pct}%"></b></div>
              <div class="act-score">${tf("مؤشر الملاءمة: {v}٪", { v: number(a.pct) })}</div>
              <p class="act-tip">${a.tip}</p>
            </div>`).join("");
          const now = wx.current;
          el.actBadge.innerHTML = `${wmoSvg(cloudFixCode(now?.weather_code ?? 0, now?.cloud_cover), now?.is_day ?? 1, 14)}<span>${tf("الآن: {d} · {t}", { d: wmoDesc(now?.weather_code ?? 0, now?.cloud_cover), t: tempText(now?.temperature_2m) })}</span>`;
        }

        /* ═════════════ إصدار 17 — مؤشر الملابس الذكي (Dynamic Outfits) ═════════════
           أيقونة الملابس المقترحة تُبنى من الإحساس الفعلي (RealFeel = apparent_temperature):
             أقل من 15°م  ← ملابس شتوية ثقيلة (معطف)
             15–22°م      ← سترة خفيفة
             22–25°م      ← ملابس متوسطة مريحة
             أعلى من 25°م ← ملابس صيفية خفيفة
           مع تنبيهات برمجية مباشرة: الرياح نشطة (لا مظلات)، الأشعة عالية (واقي شمس)،
           مطر محتمل (احمل مظلة)، جفاف وحرارة (قطن فاتح وماء)، ليل بارد (طبقة مسائية). */
        function outfitBand(feels) {
          if (feels == null) return null;
          if (feels < 15) return { kind: "cold", icon: "coat", title: tr("ملابس شتوية ثقيلة") };
          if (feels < 22) return { kind: "cool", icon: "jacket", title: tr("سترة خفيفة تكفي اليوم") };
          if (feels < 25) return { kind: "mild", icon: "tshirt", title: tr("ملابس متوسطة مريحة") };
          return { kind: "hot", icon: "tshirt", title: tr("ملابس صيفية خفيفة") };
        }

        function renderOutfit(wx) {
          if (!el.outfit) return;
          const cur = wx.current;
          const feels = cur?.apparent_temperature ?? cur?.temperature_2m;
          const band = outfitBand(feels);
          if (!band) { el.outfit.classList.add("hidden"); return; }
          const d = wx.daily;
          const gustNow = Math.max(cur?.wind_gusts_10m ?? 0, d.wind_gusts_10m_max?.[0] ?? 0);
          const uvToday = d.uv_index_max?.[0];
          const probToday = d.precipitation_probability_max?.[0] ?? 0;
          const rh = cur?.relative_humidity_2m;
          const tips = [];
          if (gustNow >= 38) tips.push(tr("الرياح نشطة — لا ننصح بتركيب المظلات الآن"));
          if ((uvToday ?? 0) >= 6) tips.push(tf("الأشعة فوق البنفسجية مرتفعة ({v}) — احرص على واقي الشمس والنظارة", { v: localNum(uvToday, 1) }));
          if (probToday >= 40) tips.push(tf("احتمال مطر اليوم {v}٪ — احمل معك مظلة", { v: localNum(probToday) }));
          if ((feels ?? 0) >= 33 && (rh ?? 100) <= 30) tips.push(tr("حرارة وجفاف: قطن فاتح اللون وماء بيدك دائمًا"));
          if ((d.temperature_2m_min?.[0] ?? 99) <= 10) tips.push(tr("الليل سيبرد — طبقة إضافية مساءً"));
          el.outfit.dataset.kind = band.kind;
          el.outfitIcon.innerHTML = iconSvg(band.icon, 30);
          el.outfitTitle.textContent = band.title;
          el.outfitReason.textContent = tf("بناءً على الإحساس الفعلي {v} · {d}", { v: tempText(feels), d: wmoDesc(cur?.weather_code ?? 0, cur?.cloud_cover) });
          el.outfitTips.innerHTML = tips.map((t) => `<span class="outfit-tip">${iconSvg("ok", 11)} ${escapeHtml(t)}</span>`).join("");
          el.outfit.classList.remove("hidden");
        }

        /* إصدار 17: خطاف الاختبار الذاتي — حدود نطاقات الملابس */
        if (SELFTEST) window.__matarOutfitHooks = { outfitBand };

        function renderDays(wx) {
          const d = wx.daily;
          const ens = wx.ensemble; /* إصدار 32: نطاقات الأيام 8–14 (طاقمية/تقديرية) */
          const cells = [];
          for (let i = 0; i < Math.min(14, d.time?.length ?? 0); i += 1) {
            const day = new Date(`${d.time[i]}T12:00:00Z`);
            const j = i - 7;
            const ensDay = i >= 7 && ens?.tMaxHi?.[j] != null;
            /* إصدار 32: الأيام البعيدة تعرض نطاقات p10–p90 بدل أرقام قطعية */
            const tempsHtml = ensDay
              ? `<div class="day-temps"><span class="day-high">${tempText(ens.tMaxLo[j])}–${tempText(ens.tMaxHi[j])}</span><span class="day-low">${tempText(ens.tMinLo[j])}–${tempText(ens.tMinHi[j])}</span></div>`
              : `<div class="day-temps"><span class="day-high">${tempText(d.temperature_2m_max?.[i])}</span><span class="day-low">${tempText(d.temperature_2m_min?.[i])}</span></div>`;
            const rainHtml = ensDay
              ? `<div class="day-rain">${iconSvg("water", 11)} ${localNum(ens.pLo[j])}–${localNum(ens.pHi[j])}٪</div>`
              : `<div class="day-rain">${iconSvg("water", 11)} ${localNum(d.precipitation_probability_max?.[i])}٪</div>`;
            const metaHtml = ensDay
              ? `<span>${iconSvg("rain", 11)} ${tr("نطاق 80٪ من أعضاء النموذج")}</span>`
              : `<span>${iconSvg("wind", 11)} ${localNum(d.wind_speed_10m_max?.[i])} · ${tf("هبّات {v}", { v: localNum(d.wind_gusts_10m_max?.[i]) })}</span>
                  <span>${iconSvg("sun", 11)} UV ${localNum(d.uv_index_max?.[i], 1)} · ${uvLabel(d.uv_index_max?.[i])}</span>
                  <span>${iconSvg("rain", 11)} ${localNum(d.precipitation_sum?.[i], 1)} ${tr("مم")}</span>`;
            /* v70 — C-01: وصف اليوم وأيقونته بمتوسط غطائه السحابي من مصفوفة
               الساعات — لا «غائم جزئياً» مع تغطية ≥ 85٪ (يُحسب مرة لكل بطاقة) */
            const dayCloud = dailyCloudAvg(wx, i);
            cells.push(`
              <div class="day-card ${i === 0 ? "today" : ""} ${ensDay ? "day-card-prob" : ""}">
                <div class="day-name">${i === 0 ? tr("اليوم") : placeDateFormatter({ weekday: "short" }).format(day)}</div>
                <div class="day-date">${placeDateFormatter({ day: "numeric", month: "short" }).format(day)}</div>
                <div class="day-icon">${wmoSvg(cloudFixCode(d.weather_code?.[i] ?? 0, dayCloud), 1, 24)}</div>
                <div class="day-desc">${wmoDesc(d.weather_code?.[i] ?? 0, dayCloud)}</div>
                ${tempsHtml}
                ${rainHtml}
                <div class="day-meta">${metaHtml}</div>
              </div>`);
          }
          el.days.innerHTML = cells.join("");
          /* إصدار 32: شارة مصدر النطاقات فوق شبكة الأيام — شفافية كاملة للمستخدم */
          const badge = document.getElementById("days-mode-badge");
          if (badge) {
            if (ens?.source === "ecmwf_ifs025") { badge.hidden = false; badge.textContent = tr("الأيام 8–14 نطاقات طاقمية"); }
            else if (ens?.source === "spread") { badge.hidden = false; badge.textContent = tr("الأيام 8–14 نطاقات تقديرية"); }
            else badge.hidden = true;
          }
        }

        /* إصدار 32: إعادة رسم شبكة الأيام فقط — يستدعيها موديول Ensemble بعد حساب النطاقات */
        function refreshDays() {
          if (!state.wx) return;
          try { renderDays(state.wx); } catch (e) {}
        }

        function renderSummary(wx) {
          const d = wx.daily;
          const cur = wx.current;
          const cloudNow = cur?.cloud_cover ?? wx.hourly?.cloud_cover?.[hourIndexAtPlace(wx)]; /* v70 — C-01 */
          const parts = [];
          parts.push(tf("{d} وحرارة {t}", { d: wmoDesc(cur?.weather_code ?? 0, cloudNow), t: tempText(cur?.temperature_2m) }));
          if (d.precipitation_probability_max?.[0] >= 30) {
            parts.push(tf("احتمال المطر اليوم يصل {v}٪", { v: localNum(d.precipitation_probability_max[0]) }));
          } else parts.push(tr("فرص المطر اليوم ضئيلة"));
          if (d.wind_gusts_10m_max?.[0] >= 40) parts.push(tf("انتبه لهبّات تصل {v} كم/س", { v: localNum(d.wind_gusts_10m_max[0]) }));
          // إصلاح 11: الشروق/الغروب بتنسيق ساعة المكان المتسق مع بقية الواجهة (12/24 حسب اللغة)
          const sr = d.sunrise?.[0] ? placeClock(d.sunrise[0]) : null;
          const ss = d.sunset?.[0] ? placeClock(d.sunset[0]) : null;
          if (sr && sr !== "—" && ss && ss !== "—") parts.push(tf("الشروق {a} · الغروب {b}", { a: sr, b: ss }));
          el.summary.textContent = `${parts.join(" · ")}.`;
        }
        /* ┌──────────────────────────────────────────────────────────────────┐
           │ «الخريطة المصغرة» (4701-4813 أصلًا) انتقلت حرفيًا إلى map.js §4     │
           │ داخل window.__matarMiniMapWidget بنفس أسماء الدوال الأصلية:        │
           │ ensure(place) · loadRadar(force) · refreshTexts() · invalidate(ms)  │
           └──────────────────────────────────────────────────────────────────┘ */


        function render() {
          const wx = state.wx;
          if (!wx || !state.place) return;
          const place = state.place;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}|${tempUnit}`;
          showContent();
          if (el.demoBanner) {
            el.demoBanner.classList.toggle("hidden", !state.isDemoData);
            el.demoBanner.textContent = DEMO_NOTICE[currentLanguage] || DEMO_NOTICE.ar;
          }
          // شريط وضع عدم الاتصال: نعرض آخر قراءة ناجحة محفوظة محليًا بدل شاشة فارغة
          if (el.offlineBanner) {
            el.offlineBanner.classList.toggle("hidden", !state.isCachedData);
            if (state.isCachedData) {
              el.offlineBanner.textContent = tf("تعذر الاتصال — تعرض الآن آخر قراءة ناجحة ({when})، وسيتم التحديث تلقائيًا عند عودة الإنترنت.", { when: agoText(state.cachedAt) });
            }
          }

          el.region.textContent = [place.admin1, place.country].filter(Boolean).join("، ") || place.timezone || "";
          el.place.textContent = place.name || tr("الموقع المحدد");
          const nowIdx = hourIndexAtPlace(wx);
          // إصلاح 5: حماية من غياب hourly.time حتى لا يتعطل رسم اللوحة كاملة
          const localNow = wx.hourly?.time?.[nowIdx] ? placeClock(wx.hourly.time[nowIdx]) : "—";
          /* v70 — M-03: «آخر تحديث» من طابع المزوّد نفسه (current.time مكتوب أصلًا
             بتوقيت المدينة المختارة) — وعند غيابه نسقط إلى لحظة آخر جلب ناجح
             منسّقة بمنطقة المدينة نفسها عبر placeDateFormatter، فلا يتأثر العرض
             بساعة الجهاز ولا بمنطقته ولا يظهر فرق دقائق غير منطقي */
          const updText = (() => {
            const providerStamp = wx.current?.time;
            if (providerStamp) { const t = placeClock(providerStamp); if (t && t !== "—") return t; }
            const ts = state.lastUpdatedAt || state.cachedAt;
            if (ts) { try { return placeDateFormatter({ hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ts)); } catch (e) {} }
            return clockText(new Date());
          })();
          el.time.textContent = tf("الوقت المحلي {v} · آخر تحديث {u}", { v: localNow, u: updText });

          /* إصدار 28: شارات الدقة — النموذج الإقليمي المستخدم + تصحيح الارتفاع المطبق
             إصدار 30: شارة «تصحيح محلي · رذاذ محتمل» حين تدخل معادلة السحب والرطوبة */
          if (el.accBadges) {
            const chips = [];
            if (wx.hr?.label) chips.push(`<span class="acc-chip" data-k="hr">⚡ ${escapeHtml(tr("دقة عالية"))} · ${escapeHtml(wx.hr.label)}</span>`);
            if (wx.bias?.applied !== false && wx.bias?.deltaT != null) {
              chips.push(`<span class="acc-chip" data-k="bias">${escapeHtml(tf("تصحيح الارتفاع {v}°", { v: (wx.bias.deltaT > 0 ? "+" : "") + localNum(wx.bias.deltaT, 1) }))}</span>`);
            }
            if (wx.current?.is_corrected_locally) chips.push(`<span class="acc-chip" data-k="local-cal">🛰 ${escapeHtml(tr("تصحيح محلي · رذاذ محتمل"))}</span>`);
            /* إصلاح 31: شارة شفافية — أين تنتهي نافذة النموذج المختار وأين يبدأ
               النموذج العالمي المكمِّل، والبيانات كلها كاملة 14 يومًا بلا فراغات */
            if (wx.model_fill_note) chips.push(`<span class="acc-chip" data-k="model-fill">🌍 ${escapeHtml(tr(wx.model_fill_note))}</span>`);
            el.accBadges.innerHTML = chips.join("");
            el.accBadges.hidden = !chips.length;
          }

          const cur = wx.current;
          /* v70 — C-01: وصف البطل وأيقونته بقاعدة السحب الموحدة (تغطية ≥ 85٪ = غائم) */
          const heroCloud = cur?.cloud_cover ?? wx.hourly?.cloud_cover?.[nowIdx];
          el.icon.innerHTML = iconSvg(iconForCode(cloudFixCode(cur?.weather_code ?? 0, heroCloud), cur?.is_day ?? 1), 54);
          el.temp.textContent = tempText(cur?.temperature_2m);
          el.desc.textContent = wmoDesc(cur?.weather_code ?? 0, heroCloud);
          el.feels.textContent = `${tf("الإحساس الفعلي {v}", { v: tempText(cur?.apparent_temperature) })} · ${cur?.is_day ? tr("نهار") : tr("ليل")}`;
          // عزل كل قسم: لو فشل قسم لا يمنع ظهور بقية الأقسام
          [[heroDetails, wx, nowIdx], [renderSummary, wx], [renderHourly, wx],
            [renderOutfit, wx], [renderActivities, wx, state.air], [renderDays, wx]].forEach(([fn, ...args]) => {
            try { fn(...args); } catch (error) { console.error("render section failed", error); }
          });
          /* v49: تهيئة الخريطة المصغرة (Leaflet + بلاطات الرادار) مؤجلة 800ms بعد
             ظهور البطاقة الرئيسية — فتح أسرع بلا مساس بالبطل السينمائي،
           وonShow يعيد invalidateSize تلقائيًا عند العودة للوحة */
          setTimeout(() => { try { window.__matarMiniMapWidget.ensure(place); } catch (error) { console.error(error); } }, 800);
          renderedKey = key;
        }

        document.addEventListener("matar:unit", () => { if (state.wx && !state.loadingWx) render(); });

        function onShow() {
          if (state.wx && !state.loadingWx) render();
          /* إصدار 16: بطاقة الرادار اللحظي — نعيد العرض عند العودة للوحة (المخنّق يمنع التكرار) */
          try { if (typeof Nowcast !== "undefined") Nowcast.onData(false); } catch (e) {}
          try { if (window.__matarMiniMapWidget) window.__matarMiniMapWidget.invalidate(80); } catch (e) {}
        }

        el.retry.addEventListener("click", () => loadMainData(true));

        return { render, showLoading, showError, onShow, refreshDays, applyNowcastOverride };
      })();
      /* ┌────────────────────────────────────────────────────────────────────┐
         │ وحدتا Nowcast (الرادار اللحظي بأسلوب Dark Sky) وMX (محرك الخريطة      │
         │ التفاعلية الكبرى + window.MX) انتقلتا حرفيًا إلى map.js §§5-6          │
         └────────────────────────────────────────────────────────────────────┘ */

      /* ============================================================
         أداة رسم بياني بسيطة على Canvas
         ============================================================ */
      function drawChart(canvas, series, opts = {}) {
        if (!canvas || !series.length) return;
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth || 600;
        const cssH = canvas.clientHeight || 130;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);
        const padL = 34, padR = 8, padT = 10, padB = 18;
        const W = cssW - padL - padR, H = cssH - padT - padB;
        let mn = Infinity, mx = -Infinity;
        series.forEach((s) => s.values.forEach((v) => { if (v != null && v === v) { if (v < mn) mn = v; if (v > mx) mx = v; } }));
        if (!Number.isFinite(mn) || !Number.isFinite(mx)) return;
        const span = mx - mn || 1;
        mn -= span * 0.12; mx += span * 0.12;
        const X = (i, n) => padL + (i / Math.max(n - 1, 1)) * W;
        const Y = (v) => padT + (1 - (v - mn) / (mx - mn)) * H;
        const dark = document.documentElement.dataset.theme === "dark";
        // خطوط أفقية خفيفة
        ctx.strokeStyle = dark ? "rgba(160,190,185,.14)" : "rgba(40,90,95,.12)";
        ctx.lineWidth = 1;
        for (let g = 0; g <= 3; g += 1) {
          const y = padT + (g / 3) * H;
          ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + W, y); ctx.stroke();
        }
        // قيم المحور
        ctx.fillStyle = dark ? "rgba(170,200,195,.75)" : "rgba(60,90,95,.7)";
        ctx.font = "600 9px 'Segoe UI', Tahoma, sans-serif";
        ctx.textAlign = "left";
        for (let g = 0; g <= 3; g += 1) {
          const v = mx - (g / 3) * (mx - mn);
          ctx.fillText(number(Math.round(v * 10) / 10, 1), 2, padT + (g / 3) * H + 3);
        }
        // المسارات
        series.forEach((s) => {
          const n = s.values.length;
          ctx.beginPath();
          let started = false;
          for (let i = 0; i < n; i += 1) {
            const v = s.values[i];
            if (v == null || v !== v) continue;
            const x = X(i, n), y = Y(v);
            if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.width || 2;
          if (s.dash) ctx.setLineDash(s.dash);
          ctx.stroke();
          ctx.setLineDash([]);
          if (s.fill) {
            ctx.lineTo(X(n - 1, n), padT + H);
            ctx.lineTo(X(0, n), padT + H);
            ctx.closePath();
            ctx.fillStyle = s.fillColor ?? `${s.color}22`;
            ctx.fill();
          }
        });
        // تسميات الوقت
        ctx.fillStyle = dark ? "rgba(170,200,195,.7)" : "rgba(60,90,95,.7)";
        ctx.textAlign = "center";
        const n0 = series[0].values.length;
        [0, Math.floor(n0 / 2), n0 - 1].forEach((i) => {
          const lbl = opts.timeLabels?.[i] ?? "";
          if (lbl) ctx.fillText(lbl, clamp(X(i, n0), padL + 12, padL + W - 12), cssH - 4);
        });
      }

      /* ============================================================
         الصفحة 3: طقس المزارعين
         ============================================================ */
      const Agri = (() => {
        const el = {
          loading: $("#agri-loading"), error: $("#agri-error"), errorMsg: $("#agri-error-msg"),
          content: $("#agri-content"), retry: $("#agri-retry"),
          grid: $("#agri-grid"), badge: $("#agri-now-badge"),
          advisories: $("#agri-advisories"),
          /* إصدار 17: حاسبة الري الذكية */
          irrVerdict: $("#irr-verdict"), irrEmoji: $("#irr-emoji"), irrTitle: $("#irr-title"),
          irrMsg: $("#irr-msg"), irrStats: $("#irr-stats"),
          /* إصدار 27: مؤشر خطر الآفات + سجل ميزان الري التراكمي */
          pestVerdict: $("#pest-verdict"), pestEmoji: $("#pest-emoji"), pestTitle: $("#pest-title"),
          pestMsg: $("#pest-msg"), pestStats: $("#pest-stats"),
          logChart: $("#irrlog-chart"), logVerdict: $("#irrlog-verdict"), logNote: $("#irrlog-note"),
          chartTemp: $("#chart-soil-temp"), chartMoist: $("#chart-soil-moist"),
          tableBody: $("#agri-table tbody"),
        };

        function showLoading() {
          el.loading.classList.remove("hidden");
          el.error.classList.add("hidden");
          el.content.classList.add("hidden");
        }

        function showError(message) {
          el.loading.classList.add("hidden");
          el.error.classList.remove("hidden");
          el.content.classList.add("hidden");
          el.errorMsg.textContent = message;
        }

        function depthBars(values, max = 0.45) {
          return `<div class="agri-depth">${values.map((v) => `<i><b style="width:${clamp(((v ?? 0) / max) * 100, 3, 100)}%"></b></i>`).join("")}</div>`;
        }

        function trendArrow(now, later) {
          if (now == null || later == null) return "";
          const d = later - now;
          if (d > 0.4) return ` ↗ ${number(d, 1)}+`;
          if (d < -0.4) return ` ↘ ${number(-d, 1)}−`;
          return ` → ${tr("مستقرة")}`;
        }

        function renderCards(wx) {
          const h = wx.hourly;
          const d = wx.daily;
          const s = hourIndexAtPlace(wx);
          const t0 = (k) => h[k]?.[s];
          const soilTemps = [t0("soil_temperature_0cm"), t0("soil_temperature_6cm"), t0("soil_temperature_18cm"), t0("soil_temperature_54cm")];
          const soilMoist = [t0("soil_moisture_0_to_1cm"), t0("soil_moisture_1_to_3cm"), t0("soil_moisture_3_to_9cm"), t0("soil_moisture_9_to_27cm")];
          let etNext24 = 0;
          for (let i = s; i < Math.min(s + 24, h.time.length); i += 1) etNext24 += h.evapotranspiration?.[i] ?? 0;
          // أدنى حرارة خلال الليل القادم (حتى 18 ساعة)
          let nightMin = Infinity;
          for (let i = s; i < Math.min(s + 18, h.time.length); i += 1) nightMin = Math.min(nightMin, h.temperature_2m?.[i] ?? Infinity);
          const spread = t0("temperature_2m") != null && t0("dew_point_2m") != null ? t0("temperature_2m") - t0("dew_point_2m") : null;

          /* ═══ الميزة الجديدة ① — حاسبة ساعات البرودة (Chilling Hours Counter) ═══
             العدّاد يمسح الـ 168 ساعة القادمة ويجمع كل الساعات ضمن النطاق 0–7°م.
             الساعات دون الصفر لا تُحتسب عمدًا: التجميد يوقف فعالية التبريد الفسيولوجي
             في براعم أشجار الفاكهة (الزيتون، الخوخ، التفاح، اللوز). هذا المؤشر هو
             ما يحدد وقت كسر السكون وبدء الإزهار الموحد. */
          let chillHours = 0;
          const chillWin = Math.min(168, h.time.length - s);
          for (let i = s; i < s + chillWin; i += 1) {
            const v = h.temperature_2m?.[i];
            if (v != null && v >= 0 && v < 7) chillHours += 1;
          }
          const chillTxt = chillHours <= 0 ? tr("لا برودة قريبة — السكون مستمر")
            : chillHours < 24 ? tr("برودة محدودة خلال الأسبوع")
            : chillHours < 72 ? tr("تراكم جيد يقرّب كسر السكون")
            : tr("موسم بارد نشط — ساعات تتكدس بسرعة");

          /* ═══ الميزة الجديدة ② — مستشار الري الذكي: ميزان ماء اليوم ═══
             (التبخر-النتح ET₀ لـ 24 ساعة) − (مطر 24 ساعة) = عجز مائي مباشر،
             ثم يُترجم العجز إلى مدة تشغيل عملية لشبكة التنقيط
             بمعدل تطبيق تقريبي 6 مم/ساعة قابل للتعديل حسب المضخة. */
          let rain24 = 0;
          for (let i = s; i < Math.min(s + 24, h.time.length); i += 1) rain24 += h.precipitation?.[i] ?? 0;
          const deficit24 = Math.max(0, etNext24 - rain24);
          const dripMin = Math.round(clamp((deficit24 / 6) * 60, 10, 180) / 5) * 5;
          const dripTxt = deficit24 < 0.5
            ? tf("المطر غطّى طلب الجو ({r} مم) — أجّل الري الليلة", { r: localNum(rain24, 1) })
            : tf("فقدت أرضك اليوم ~{d} مم — شغّل التنقيط {m} دقيقة الليلة", { d: localNum(deficit24, 1), m: localNum(dripMin) });

          const cards = [
            { icon: "water", label: tr("رطوبة التربة السطحية (0–1 سم)"), value: `${localNum((soilMoist[0] ?? 0) * 100, 1)}<small>${tr("٪ حجمية")}</small>`, extra: `${soilMoist[0] < 0.15 ? tr("جافة — فكّر في الري") : soilMoist[0] > 0.35 ? tr("مشبعة بالماء") : tr("مدى مريح للجذور")}${depthBars(soilMoist)}` },
            { icon: "thermo", label: tr("حرارة التربة (6 سم)"), value: `${tempText(soilTemps[1])}`, extra: tf("السطح {a} · على 18سم {b}", { a: tempText(soilTemps[0]), b: tempText(soilTemps[2]) }) },
            { icon: "sprout", label: tr("حرارة التربة العميقة (54 سم)"), value: `${tempText(soilTemps[3])}`, extra: soilTemps[3] >= 12 ? tr("دافئة كفاية لنشاط الجذور") : tr("باردة — نشاط جذري بطيء") },
            { icon: "fog", label: tr("نقطة الندى"), value: `${tempText(t0("dew_point_2m"))}`, extra: spread != null ? `${tf("فرق {v}° عن الحرارة", { v: number(spread, 1) })} ${spread < 2.5 ? tr("· تكاثف ندى وشبه مؤكد") : spread < 5 ? tr("· احتمال ندى صباحي") : ""}` : "" },
            { icon: "humid", label: tr("الرطوبة النسبية"), value: `${localNum(t0("relative_humidity_2m"))}<small>٪</small>`, extra: t0("relative_humidity_2m") >= 85 ? tr("رطوبة عالية على الأوراق") : t0("relative_humidity_2m") <= 30 ? tr("جاف — فاقد مائي مرتفع") : tr("مدى متوازن") },
            { icon: "sun", label: tr("التبخر-نتح ET₀ (24 ساعة)"), value: `${localNum(etNext24, 1)}<small> ${tr("مم")}</small>`, extra: `${tf("اليوم رسميًا {v} مم", { v: localNum(d.et0_fao_evapotranspiration?.[0], 1) })} ${etNext24 > 5 ? tr("· طلب مائي مرتفع") : etNext24 > 2.5 ? tr("· طلب مائي متوسط") : tr("· طلب مائي منخفض")}` },
            { icon: "frost", label: tr("أدنى حرارة الليلة القادمة"), value: `${tempText(nightMin === Infinity ? null : nightMin)}`, extra: nightMin <= 2 ? tr("⚠️ قرب من حد الصقيع") : tr("لا خطر صقيع قريب") },
            { icon: "stock", label: tr("مخزون الماء (9–27 سم)"), value: `${localNum((soilMoist[3] ?? 0) * 100, 1)}<small>${tr("٪ حجمية")}</small>`, extra: tf("المستوى {v}", { v: soilMoist[3] < 0.2 ? tr("منخفض للجذور العميقة") : soilMoist[3] > 0.34 ? tr("مرتفع — انتبه للنزح") : tr("جيد") }) },
            /* البطاقتان الجديدتان: ساعات البرودة + ميزان ماء الري الذكي */
            { icon: "frost", label: tr("ساعات البرودة (< 7°م) · 7 أيام"), value: `${localNum(chillHours)}<small> ${tr("ساعة")}</small>`, extra: `${chillTxt} · ${tf("الزيتون ~200–600 والخوخ ~400–800 ساعة موسميًا", {})}` },
            { icon: "water", label: tr("ميزان ماء اليوم · توصية التنقيط"), value: deficit24 > 0 ? `${localNum(dripMin)}<small> ${tr("دقيقة تشغيل")}</small>` : `0<small> ${tr("دقيقة")}</small>`, extra: `${dripTxt}${deficit24 > 0 ? ` (${tr("بمعدل 6 مم/ساعة — عدّل حسب مضختك")})` : ""}` },
          ];

          el.grid.innerHTML = cards.map((c) => `
            <div class="agri-card">
              <div class="agri-label"><span class="agri-emoji" aria-hidden="true">${iconSvg(c.icon, 16)}</span> ${c.label}</div>
              <div class="agri-value">${c.value}</div>
              <div class="agri-extra">${c.extra}</div>
            </div>`).join("");
        }

        function renderCharts(wx) {
          const h = wx.hourly;
          const s = hourIndexAtPlace(wx);
          const n = Math.min(49, h.time.length - s);
          const slice = (key) => Array.from({ length: n }, (_, i) => h[key]?.[s + i]);
          const timeLabels = [0, 24, 48].map((i) => placeClock(h.time[s + i]));
          drawChart(el.chartTemp, [
            { values: slice("soil_temperature_0cm"), color: "#d9935b", width: 2.2 },
            { values: slice("soil_temperature_6cm"), color: "#b96f3a", width: 1.8 },
            { values: slice("soil_temperature_18cm"), color: "#24636c", width: 1.8 },
            { values: slice("soil_temperature_54cm"), color: "#4a7d94", width: 1.8, dash: [5, 4] },
          ], { timeLabels });
          drawChart(el.chartMoist, [
            { values: slice("soil_moisture_0_to_1cm").map((v) => v == null ? null : v * 100), color: "#3fae70", width: 2.2, fill: true },
            { values: slice("soil_moisture_1_to_3cm").map((v) => v == null ? null : v * 100), color: "#24636c", width: 1.7 },
            { values: slice("soil_moisture_3_to_9cm").map((v) => v == null ? null : v * 100), color: "#4a7d94", width: 1.7 },
            { values: slice("soil_moisture_9_to_27cm").map((v) => v == null ? null : v * 100), color: "#7b4bc4", width: 1.7, dash: [5, 4] },
          ], { timeLabels });
        }

        function buildAdvisories(wx) {
          const h = wx.hourly;
          const d = wx.daily;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(49, h.time.length - s);
          const at = (i, k) => h[k]?.[s + i];
          const out = [];
          const whenText = (i) => placeClock(h.time[s + i]);

          /* الصقيع */
          let frostIdx = -1, frostMin = Infinity;
          for (let i = 0; i < N; i += 1) {
            const v = at(i, "temperature_2m");
            if (v != null && v < frostMin) { frostMin = v; }
            if (frostIdx < 0 && v != null && v <= 2) frostIdx = i;
          }
          if (frostIdx >= 0) {
            out.push({
              kind: "frost", sev: frostMin <= -2 ? "high" : "med", emoji: "🧊", icon: "frost",
              title: frostMin <= -2 ? "خطر صقيع شديد" : "احتمال صقيع",
              msg: tf("تنخفض الحرارة إلى {v}. غطِّ الشتلات الحساسة، اسقِ التربة قبل الغروب (يزيد تخزينها للحرارة)، وفكّر في المدخّنات الدخانية أو الأغطية القماشية للمساحات الصغيرة.", { v: tempText(frostMin) }),
              when: tf("يبدأ تقريبًا {v}", { v: whenText(frostIdx) }),
            });
          }

          /* ═══ الميزة الجديدة ① — حاسبة ساعات البرودة وكسر السكون (للبساتين) ═══
             تمسح الـ 168 ساعة القادمة وتجمع ساعات النطاق 0–7°م وتفسّرها مقابل
             احتياجات أشجار الفاكهة المعروفة (زيتون، خوخ، تفاح، لوز) لكسر السكون. */
          {
            const win = Math.min(168, h.time.length - s);
            let chill7 = 0;
            for (let i = 0; i < win; i += 1) {
              const v = at(i, "temperature_2m");
              if (v != null && v >= 0 && v < 7) chill7 += 1;
            }
            if (chill7 >= 8) {
              out.push({
                kind: "frost", sev: "low", emoji: "❄️", icon: "frost",
                title: "ساعات البرودة وكسر السكون",
                msg: tf("اجمعت بساتينك {v} ساعة تبريد فعّال (0–7°م) خلال الأسبوع القادم — والساعات تحت الصفر لا تُحتسب لأن التجميد يوقف التبريد الفسيولوجي في البراعم. للمرجعية: الزيتون يحتاج ~200–600 ساعة موسميًا، الخوخ ~400–800، والتفاح ~800–1200. اكتمال الكم يكسر السكون ويوحّد تفتح البراعم، والنقص يفتّت الإزهار ويؤخر الجني — استمر في تتبع العدّاد أسبوعيًا حتى بدء التفتح.", { v: localNum(chill7) }),
                when: "تراكم مستمر خلال 7 أيام",
              });
            }
          }

          /* الري */
          let rain48 = 0, probMax = 0;
          for (let i = 0; i < Math.min(N, 49); i += 1) {
            rain48 += at(i, "precipitation") ?? 0;
            probMax = Math.max(probMax, at(i, "precipitation_probability") ?? 0);
          }
          const mSurf = at(0, "soil_moisture_0_to_1cm");
          let et24 = 0;
          for (let i = 0; i < Math.min(N, 25); i += 1) et24 += at(i, "evapotranspiration") ?? 0;
          /* ═══ الميزة الجديدة — مستشار الري الذكي (Smart Irrigation Advisory) ═══
             دمج مباشر: (التبخر-النتح ET₀ لـ 24 ساعة) + (رطوبة التربة الحالية) → مخرج عملي:
             «فقدت أرضك اليوم X مم — شغّل التنقيط Y دقيقة الليلة» بمعدل تطبيق 6 مم/ساعة. */
          let rain24 = 0;
          for (let i = 0; i < Math.min(N, 25); i += 1) rain24 += at(i, "precipitation") ?? 0;
          const deficit24 = Math.max(0, et24 - rain24);
          const dripMin = Math.round(clamp((deficit24 / 6) * 60, 10, 180) / 5) * 5; // 6 مم/ساعة معدل تنقيط نموذجي
          const dripLine = deficit24 >= 0.5
            ? tf(" الخلاصة التشغيلية: فقدت أرضك اليوم نحو {d} مم من المياه — ننصح بتشغيل شبكة الري بالتنقيط {m} دقيقة الليلة لتعويض الفقد (بمعدل تطبيق 6 مم/ساعة؛ عدّل الزمن حسب تصريف مضختك وتباعد النقاط).", { d: localNum(deficit24, 1), m: localNum(dripMin) })
            : "";
          if (rain48 >= 8) {
            out.push({ kind: "irrigation", sev: "med", emoji: "🌧", icon: "rain", title: "أجّل الري", msg: tf("متوقع {v} مم من المطر خلال 48 ساعة. أوقف جدولة الري مؤقتًا واستفد من الماء الموفَّر، وراجع تصريف الحقل لتجنب الغرقان.", { v: localNum(rain48, 1) }), when: tr("خلال يومين") });
          } else if (mSurf != null && mSurf < 0.16 && rain48 < 2) {
            out.push({ kind: "irrigation", sev: "high", emoji: "🚿", icon: "water", title: "جدولة ري عاجلة", msg: tf("رطوبة السطح منخفضة ({p}٪ حجمية) مع طلب تبخري {e} مم/يوم ولا مطر يُذكر قريبًا. يُنصح بالري الليلة أو الفجر القادم لتقليل الفقد بالتبخر.", { p: localNum(mSurf * 100, 0), e: localNum(et24, 1) }) + dripLine, when: tf("قبل {v}", { v: whenText(12) }) });
          } else if (mSurf != null && mSurf < 0.24 && rain48 < 3 && et24 > 3) {
            out.push({ kind: "irrigation", sev: "med", emoji: "🚿", icon: "water", title: "نافذة ري مناسبة", msg: tf("الرطوبة تتراجع ({p}٪) والطلب الجوي مرتفع. خطط لدورة ري خلال يومين، ويفضّل ريّة ليلية عميقة بدل ريّات سطحية متكررة.", { p: localNum(mSurf * 100, 0) }) + dripLine, when: tr("خلال 48 ساعة") });
          } else {
            out.push({ kind: "irrigation", sev: deficit24 >= 0.5 ? "med" : "low", emoji: deficit24 >= 0.5 ? "🚿" : "✅", icon: deficit24 >= 0.5 ? "water" : "ok", title: deficit24 >= 0.5 ? "تعويض عجز ماء اليوم" : "لا حاجة للري قريبًا", msg: (deficit24 >= 0.5 ? tf("الرطوبة مريحة لكن الجو يستهلك {e} مم/يوم ومطر الـ 24 ساعة {r} مم فقط.", { e: localNum(et24, 1), r: localNum(rain24, 1) }) : tf("الرطوبة الحالية ({p}) ضمن المدى المريح مع {r}. راقب القراءات يوميًا.", { p: mSurf != null ? localNum(mSurf * 100, 0) + (isAr() ? "٪" : "%") : "—", r: rain48 >= 2 ? tf("{v} مم مطر متوقع", { v: localNum(rain48, 1) }) : tr("استقرار جوي") })) + dripLine, when: tr("الليلة القادمة") });
          }

          /* الرياح */
          let gustMax = 0, gustIdx = -1;
          for (let i = 0; i < N; i += 1) {
            const v = at(i, "wind_gusts_10m");
            if (v != null && v > gustMax) { gustMax = v; gustIdx = i; }
          }
          if (gustMax >= 45) {
            out.push({ kind: "wind", sev: gustMax >= 65 ? "high" : "med", emoji: "💨", icon: "wind", title: gustMax >= 65 ? "رياح مدمّرة للمحاصيل" : "رياح قوية على المحاصيل", msg: tf("هبّات تصل {v} كم/س. دعّم النباتات الطويلة (الذرة، الطماطم، الباذنجان)، أغلق أغطية الدفيئات جيدًا، وأجّل الرش والتعقيم الجوي.", { v: localNum(gustMax) }), when: tf("ذروتها {v}", { v: whenText(Math.max(gustIdx, 0)) }) });
          }

          /* الإجهاد الحراري */
          let heatMax = 0, rhMinAtHeat = 100;
          for (let i = 0; i < N; i += 1) {
            const v = at(i, "temperature_2m");
            if (v != null && v > heatMax) { heatMax = v; rhMinAtHeat = at(i, "relative_humidity_2m") ?? 100; }
          }
          if (heatMax >= 37) {
            out.push({ kind: "heat", sev: heatMax >= 41 ? "high" : "med", emoji: "🔥", icon: "fire", title: "إجهاد حراري للنبات", msg: tf("ذروة الحرارة {v} مع رطوبة {h}٪. زد تواتر الري الخفيف، استخدم مظلات أو شاش على البيوت المحمية، وتجنّب التقليم والتسميد الورقي وقت الظهرة.", { v: tempText(heatMax), h: localNum(rhMinAtHeat) }), when: tf("حول {v}", { v: whenText(N > 10 ? 10 : 4) }) });
          }

          /* الأمراض الفطرية — إصدار 27: النسبة تأتي الآن من حاسبة رطوبة الورقة pestRisk نفسها
             كي تتطابق بطاقة «مؤشر خطر الآفات» مع التنبيه في الشبكة أدناها */
          const pest = pestRisk(wx);
          if (pest && pest.wetH >= 6) {
            out.push({ kind: "disease", sev: pest.sev === "alert" ? "high" : "med", emoji: "🍄", icon: "fungus",
              title: pest.sev === "alert"
                ? tf("الظروف الحالية ترفع خطر الإصابة بالفطريات بنسبة {v}٪ — يُفضّل الرش الوقائي", { v: localNum(pest.pct) })
                : tf("خطر الأمراض الفطرية ({v}٪)", { v: localNum(pest.pct) }),
              msg: tf("{v} ساعة برطوبة ≥ 80٪ ودرجات ملائمة (15–28°) للبياض الدقيقي والبوتريتس{d}. حسّن التهوية، تجنّب الرش الورقي مساءً، ورش وقائي عضوي (كبريت/بيكربونات) قبل ذروة النافذة إن كانت الحالة قد تكررت سابقًا.", { v: localNum(pest.wetH, 1), d: pest.spread != null && pest.spread < 2.5 ? tr(" مع ندى ليلي شبه مؤكد") : "" }),
              when: tr("تتزايد تدريجيًا خلال 48 ساعة") });
          }

          /* نافذة الرش */
          let sprayIdx = -1;
          for (let i = 1; i < Math.min(N, 25) - 2; i += 1) {
            const w = at(i, "wind_speed_10m"), p = at(i, "precipitation_probability"), t = at(i, "temperature_2m");
            if (w != null && w < 15 && (p ?? 0) < 30 && t != null && t < 32) { sprayIdx = i; break; }
          }
          if (sprayIdx > 0) {
            out.push({ kind: "spray", sev: "low", emoji: "🎯", icon: "target", title: "نافذة رش مثالية", msg: `رياح أقل من 15 كم/س بلا أمطار متوقعة وحرارة معتدلة — أفضل نافذة قريبة للرش الورقي أو المكافحة. رشّ مع اتجاه الرياح وتجنّب الظهرة.`, when: whenText(sprayIdx) });
          }

          if (!out.length) {
            out.push({ kind: "spray", sev: "low", emoji: "👍", icon: "ok", title: "ظروف زراعية مستقرة", msg: "لا تنبيهات حرجة خلال اليومين القادمين: لا صقيع ولا رياح قوية ولا مطر غزير. وقت مناسب للعمليات الميدانية الروتينية.", when: "الـ 48 ساعة القادمة" });
          }
          return out;
        }

        function renderAdvisories(wx) {
          const list = buildAdvisories(wx);
          const sevText = { high: tr("أولوية عالية"), med: tr("أولوية متوسطة"), low: tr("للعلم فقط") };
          el.advisories.innerHTML = list.map((a) => `
            <div class="adv-card" data-kind="${a.kind}">
              <span class="adv-title">${a.icon ? iconSvg(a.icon, 14) : ""} ${a.title}<span class="adv-sev" data-sev="${a.sev}">${sevText[a.sev] ?? tr("للعلم")}</span></span>
              <p class="adv-msg">${a.msg}</p>
              <div class="adv-when">⏱ ${escapeHtml(a.when ?? "")}</div>
            </div>`).join("");
        }

        function renderTable(wx) {
          const d = wx.daily;
          const rows = [];
          for (let i = 0; i < Math.min(7, d.time?.length ?? 0); i += 1) {
            const day = new Date(`${d.time[i]}T12:00:00Z`);
            const tmin = d.temperature_2m_min?.[i];
            const frost = tmin != null && tmin <= 2;
            const et = d.et0_fao_evapotranspiration?.[i];
            const rain = d.precipitation_sum?.[i];
            const gust = d.wind_gusts_10m_max?.[i];
            const tag = frost
              ? `<span class="tag bad">${tr("صقيع محتمل")}</span>`
              : (gust ?? 0) >= 50
                ? `<span class="tag warn">${tr("رياح قوية")}</span>`
                : (rain ?? 0) >= 8
                  ? `<span class="tag warn">${tr("مطر وفير")}</span>`
                  : `<span class="tag ok">${tr("مستقر")}</span>`;
            rows.push(`
              <tr class="${i === 0 ? "today-row" : ""}">
                <td>${i === 0 ? tr("اليوم") : placeDateFormatter({ weekday: "long", day: "numeric", month: "short" }).format(day)}</td>
                <td>${tempText(d.temperature_2m_max?.[i])} / ${tempText(tmin)}</td>
                <td>${localNum(rain, 1)}</td>
                <td>${localNum(et, 1)}</td>
                <td>${localNum(d.uv_index_max?.[i], 1)}</td>
                <td>${localNum(d.wind_speed_10m_max?.[i])} · ${localNum(gust)}</td>
                <td>${tag}</td>
              </tr>`);
          }
          el.tableBody.innerHTML = rows.join("");
        }

        function render() {
          const wx = state.wx;
          if (!wx) return;
          el.content.classList.remove("hidden");
          el.loading.classList.add("hidden");
          el.error.classList.add("hidden");
          const cur = wx.current;
          el.badge.textContent = tf("الآن: {d} · {t} · رطوبة {h}٪", { d: wmoDesc(cur?.weather_code ?? 0, cur?.cloud_cover), t: tempText(cur?.temperature_2m), h: localNum(cur?.relative_humidity_2m) });
          renderCards(wx);
          renderIrrigation(wx); // إصدار 17: حاسبة الري الذكية — مطر 48 ساعة مقابل التبخر-نتح
          renderPest(wx); // إصدار 27: مؤشر خطر الآفات والأمراض
          renderIrrLog(); // إصدار 27: سجل ميزان الري التراكمي (Sparkline محلي)
          renderCharts(wx);
          renderAdvisories(wx);
          renderTable(wx);
        }

        /* ═══════════════ إصدار 17 — حاسبة الري الذكية (Smart Irrigation Advisory) ═══════════════
           ميزان مائي مباشر لنافذة الـ 48 ساعة القادمة:
             مجموع الأمطار المتوقعة (مم)  مقابل  مجموع التبخر-نتح المرجعي ET₀ (مم)
           القرار ملوّن مباشر بثلاث حالات:
             save  (أخضر): الأمطار تكفي الحقل — «لا داعي للري اليوم»
             watch (ذهبي): توازن دقيق — ريّة خفيفة حسب المحصول
             alert (أحمر): عجز مائي مرتفع — «زد فترات الري» مع مدة تنقيط مقترحة
           كل الحساب محلي على جهاز المستخدم من بيانات Open-Meteo المُجلبَة أصلًا. */
        function irrigationVerdict(rain48, et48) {
          const deficit = et48 - rain48;
          if (rain48 >= et48 + 0.8) return "save";
          if (deficit <= 2.5) return "watch";
          return "alert";
        }

        /* إصدار 17: خطاف الاختبار الذاتي — حدود حكم الميزان المائي
           إصدار 27: خطاف ثانٍ برياضيات الميزات الجديدة (خطر الآفات + سجل الري) */
        if (SELFTEST) {
          window.__matarAgriV17Hooks = { irrigationVerdict };
          window.__matarAgriV27Hooks = { pestRisk, diseaseThreat, buildLogDays, irrigationLogVerdict }; /* إصدار 28: + تسمية الفطر */
        }

        function renderIrrigation(wx) {
          if (!el.irrVerdict || !el.irrTitle) return;
          const h = wx.hourly;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(48, h.time.length - s);
          if (N < 6) return;
          let rain48 = 0, et48 = 0, probMax = 0;
          for (let i = 0; i < N; i += 1) {
            rain48 += h.precipitation?.[s + i] ?? 0;
            et48 += h.evapotranspiration?.[s + i] ?? 0;
            if (i < 24) {
              probMax = Math.max(probMax, h.precipitation_probability?.[s + i] ?? 0);
            }
          }
          const verdict = irrigationVerdict(rain48, et48);
          const deficit = Math.max(0, et48 - rain48);
          const surplus = Math.max(0, rain48 - et48);
          /* مدة التنقيط المقترحة عند العجز: 6 مم/ساعة معدل تطبيق نموذجي (سقف 4 ساعات) */
          const dripMin = Math.round(clamp((deficit / 6) * 60, 0, 240) / 5) * 5;

          const head = {
            save: { icon: "ok", title: tr("وفر مياهك: الأمطار القادمة تكفي الحقل، لا داعي للري اليوم") },
            watch: { icon: "warn", title: tr("ميزان متوازن — راقب التربة وقرر حسب المحصول") },
            alert: { icon: "warn", title: tr("تنبيه: معدل الجفاف والتبخر عالٍ جدًا، يتطلب زيادة فترات الري") },
          }[verdict];

          const msg = verdict === "save"
            ? tf("مجموع المطر المتوقع خلال 48 ساعة ({r} مم) يفوق طلب التبخر-نتح ({e} مم) بفائض {s} مم. أجّل جولات الري المقررة — وخزّن الماء للأيام الجافة، وانتبه لركود المياه إن كان المطر غزيرًا ({p}٪ احتمالًا اليوم).", { r: localNum(rain48, 1), e: localNum(et48, 1), s: localNum(surplus, 1), p: localNum(probMax) })
            : verdict === "watch"
              ? tf("الأمطار القادمة ({r} مم) تقارب طلب التبخر-نتح ({e} مم) بفارق طفيف ({d} مم). ريّة إضافية خفيفة أو تأجيل 24 ساعة كافيان — افحص رطوبة السطح قبل القرار وريّ فجرًا لتقليل الفقد بالتبخر.", { r: localNum(rain48, 1), e: localNum(et48, 1), d: localNum(Math.abs(et48 - rain48), 1) })
              : tf("خلال 48 ساعة سيفقد حقلك نحو {d} مم صافية (تبخر {e} مم مقابل مطر {r} مم فقط). زد فترات الري وعمقها: شغّل التنقيط ~{m} دقيقة موزعة على جولتين ليلتين متتاليتين (بمعدل تطبيق 6 مم/ساعة — عدّله حسب مضختك)، وريّ بعد الغروب لتقليل التبخر.", { d: localNum(deficit, 1), e: localNum(et48, 1), r: localNum(rain48, 1), m: localNum(dripMin) });

          el.irrVerdict.dataset.v = verdict;
          el.irrEmoji.innerHTML = iconSvg(head.icon, 22);
          el.irrTitle.textContent = head.title;
          el.irrMsg.textContent = msg;
          el.irrStats.innerHTML = [
            { label: tr("مطر 48 ساعة"), value: localNum(rain48, 1), unit: tr("مم"), tone: "rain" },
            { label: tr("تبخر-نتح ET₀"), value: localNum(et48, 1), unit: tr("مم"), tone: "sun" },
            { label: deficit > 0 ? tr("عجز مائي") : tr("فائض مطري"), value: localNum(Math.abs(deficit), 1), unit: tr("مم"), tone: deficit > 0 ? "def" : "ok" },
            { label: tr("تنقيط مقترح"), value: verdict === "alert" ? localNum(dripMin) : "0", unit: tr("دقيقة"), tone: "drip" },
          ].map((c) => `<div class="irr-stat"><span>${c.label}</span><b>${c.value}<small> ${c.unit}</small></b></div>`).join("");
        }

        /* ═══════════════ إصدار 27 — مؤشر خطر الآفات والأمراض (Pest & Disease Risk) ═══════════════
           حاسبة رطوبة الورقة: تحوّل (رطوبة جو عالية + حرارة معتدلة لساعات متتالية)
           إلى نسبة خطر بنمط المعادلات الزراعية الشهيرة للفطريات:
             • كل ساعة رطوبة ≥ 85٪ ضمن 15–28°م = ساعة تبلّل كاملة
             • كل ساعة رطوبة 80–85٪ ضمن المدى نفسه = نصف ساعة تبلّل
             • اقتراب الندى (فرق الحرارة-الندى < 2.5°) واحتمال المطر يرفعان الخطر
           النسبة = ساعات التبلّل ÷ 18 ساعة حرجة × 100 (سقف 96٪)
           — دالة نقية تُستخدم في البطاقة والتنبيهات وخطافات الفحص الذاتي معًا. */
        function pestRisk(wx) {
          const h = wx?.hourly;
          if (!h?.time?.length) return null;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(49, h.time.length - s);
          if (N < 6) return null;
          let wetH = 0, rhPeak = 0, peakIdx = -1, spreadMin = Infinity, probMax = 0, rain48 = 0;
          for (let i = 0; i < N; i += 1) {
            const rh = h.relative_humidity_2m?.[s + i], t = h.temperature_2m?.[s + i];
            const dew = h.dew_point_2m?.[s + i], prProb = h.precipitation_probability?.[s + i];
            if (rh != null && rh >= 80 && t != null && t >= 15 && t <= 28) wetH += rh >= 85 ? 1 : 0.5;
            if ((rh ?? 0) > rhPeak) { rhPeak = rh; peakIdx = s + i; }
            if (dew != null && t != null) spreadMin = Math.min(spreadMin, t - dew);
            probMax = Math.max(probMax, prProb ?? 0);
            rain48 += h.precipitation?.[s + i] ?? 0;
          }
          const dewBonus = spreadMin != null && Number.isFinite(spreadMin) && spreadMin < 2.5 ? 6 : 0;
          const rainBonus = (rain48 >= 4 || probMax >= 60) ? 8 : 0;
          const pct = Math.round(clamp((wetH / 18) * 100 + dewBonus + rainBonus, 0, 96));
          const sev = pct >= 75 ? "alert" : pct >= 45 ? "watch" : "save";
          return { pct, wetH: Math.round(wetH * 10) / 10, rhPeak, spread: Number.isFinite(spreadMin) ? spreadMin : null, probMax, rain48, sev };
        }

        /* ═══════════════ إصدار 28 — التنبؤ بأمراض النبات المحددة بالاسم ═══════════════
           معادلات مبسطة من الأبحاث الزراعية الشائعة (جدول العدوى لكل مرض):
             • البياض الدقيقي (Powdery): 20–28°م + رطوبة 45٪+ — استثناء بين الفطريات:
               لا يحتاج ماء حراً على الورقة، بل جوًا دافئًا رطبًا بلا مطر
             • البياض الزغبي (Downy): رطوبة ≥ 90٪ + 10–22°م (ساعات تبلّل)
             • بوتريتس / العفن الرمادي (Botrytis): رطوبة ≥ 90٪ + 15–25°م
             • الصدأ (Rust): رطوبة ≥ 85٪ + 15–28°م مع ندى ليلي قريب
             • اللفحة المتأخرة (Late blight): رطوبة ≥ 90٪ + 10–25°م (قاعدة 10/18°م الشهيرة)
           تُرجع أخطر مرض بالاسم + عدد ساعات توافره خلال الـ 48 ساعة القادمة
           — دالة نقية تُستخدم في بطاقة الآفات والمستشار الزراعي. */
        function diseaseThreat(wx) {
          const h = wx?.hourly;
          if (!h?.time?.length) return null;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(49, h.time.length - s);
          if (N < 6) return null;
          const DEF = [
            { key: "powdery", name: "البياض الدقيقي", icon: "fungus", need: (t, rh, spread) => t >= 20 && t <= 28 && rh >= 45 && rh <= 85 },
            { key: "downy", name: "البياض الزغبي", icon: "fungus", need: (t, rh) => t >= 10 && t <= 22 && rh >= 90 },
            { key: "botrytis", name: "بوتريتس (العفن الرمادي)", icon: "fungus", need: (t, rh) => t >= 15 && t <= 25 && rh >= 90 },
            { key: "rust", name: "الصدأ", icon: "fungus", need: (t, rh, spread) => t >= 15 && t <= 28 && rh >= 85 },
            { key: "blight", name: "اللفحة المتأخرة", icon: "fungus", need: (t, rh) => t >= 10 && t <= 25 && rh >= 90 },
          ];
          const hours = DEF.map((d) => ({ ...d, h: 0 }));
          for (let i = 0; i < N; i += 1) {
            const t = h.temperature_2m?.[s + i], rh = h.relative_humidity_2m?.[s + i], dew = h.dew_point_2m?.[s + i];
            if (t == null || rh == null) continue;
            const spread = (dew != null && t != null) ? t - dew : null;
            hours.forEach((d) => { if (d.need(t, rh, spread)) d.h += 1; });
          }
          hours.sort((a, b) => b.h - a.h);
          const top = hours[0];
          if (!top || top.h < 4) return null;
          const when = (h.time?.[s + Math.min(12, N - 1)] ?? "").slice(11, 13);
          return { key: top.key, name: top.name, hours: top.h, tonight: Number(when) >= 18 || Number(when) <= 4 };
        }

        function renderPest(wx) {
          if (!el.pestVerdict || !el.pestTitle) return;
          const r = pestRisk(wx);
          if (!r) { el.pestVerdict.hidden = true; if (el.pestStats) el.pestStats.innerHTML = ""; return; }
          /* إصدار 28: تسمية الفطر المحدد الأكثر نشاطًا بالاسم (معادلات جدول العدوى) */
          const dis = diseaseThreat(wx);
          el.pestVerdict.hidden = false;
          const disLine = dis && r.sev !== "save"
            ? (dis.tonight
              ? tf("⚠️ الأجواء الليلة مثالية لنشاط فطر {d} — يُنصح باتخاذ الإجراءات الوقائية قبل الغروب.", { d: dis.name })
              : tf("⚠️ الظروف الأقرب لنشاط فطر {d} خلال الـ 48 ساعة ({h} ساعة ملائمة) — يُنصح بالرش الوقائي قبل ذروة النافذة.", { d: dis.name, h: localNum(dis.h) }))
            : "";
          const head = {
            alert: { icon: "fungus", title: tf("الظروف ترفع خطر الإصابة بالفطريات إلى {v}٪ — يُفضّل الرش الوقائي", { v: localNum(r.pct) }) },
            watch: { icon: "warn", title: tf("خطر فطري متوسط ({v}٪) — راقب الورقة وخطط لجولة رش وقائية قريبة", { v: localNum(r.pct) }) },
            save: { icon: "ok", title: tf("خطر فطري منخفض ({v}٪) — الظروف الحالية لا تدعم العدوى", { v: localNum(r.pct) }) },
          }[r.sev];
          const msg = r.sev === "alert"
            ? tf("جمعت الـ 48 ساعة القادمة {w} ساعة تبلّل ورقي (رطوبة {h}٪ وحدود 15–28°م) {d} — الرش الوقائي بكبريت أو بيكربونات قبل ذروة النافذة أنجع من العلاج بعد ظهور البقع.", {
                w: localNum(r.wetH, 1), h: localNum(r.rhPeak),
                d: r.spread != null && r.spread < 2.5 ? tr("مع ندى ليلي شبه مؤكد") : "",
              })
            : r.sev === "watch"
              ? tf("{w} ساعة تبلّل ورقي متوقعة (ذروة رطوبة {h}٪) — حسّن التهوية بين الصفوف، تجنّب الرش الورقي مساءً، وابدأ الرش الوقائي إن تجاوز الخطر 60٪.", { w: localNum(r.wetH, 1), h: localNum(r.rhPeak) })
              : tf("ساعات التبلّل قليلة ({w}) وذروة الرطوبة {h}٪ — لا حاجة لتدخل الآن؛ أعد الفحص بعد تحديث التوقعات.", { w: localNum(r.wetH, 1), h: localNum(r.rhPeak) });
          el.pestVerdict.dataset.v = r.sev;
          el.pestEmoji.innerHTML = iconSvg(head.icon, 22);
          el.pestTitle.textContent = head.title;
          /* إصدار 28: سطر التهديد المسمى يُلحق برسالة البطاقة إن وُجد */
          el.pestMsg.textContent = disLine ? `${msg} ${disLine}` : msg;
          if (el.pestStats) {
            el.pestStats.innerHTML = [
              { label: tr("نسبة الخطر"), value: `${localNum(r.pct)}`, unit: "٪", tone: r.sev === "alert" ? "def" : r.sev === "watch" ? "sun" : "ok" },
              { label: tr("ساعات التبلّل / 48س"), value: localNum(r.wetH, 1), unit: tr("ساعة"), tone: "rain" },
              { label: dis ? tr("الفطر الأكثر نشاطًا") : tr("ذروة الرطوبة"), value: dis ? tr(dis.name) : localNum(r.rhPeak), unit: dis ? `· ${localNum(dis.h)} ${tr("ساعة")}` : "٪", tone: dis ? "def" : "rain" },
              { label: tr("مطر 48 ساعة"), value: localNum(r.rain48, 1), unit: tr("مم"), tone: "drip" },
            ].map((c) => `<div class="irr-stat"><span>${c.label}</span><b>${c.value}<small> ${c.unit}</small></b></div>`).join("");
          }
        }

        /* ═══════════════ إصدار 27 — سجل ميزان الري التراكمي (Cumulative Irrigation Log) ═══════════════
           سلسلة الأسبوع الماضي حتى اليوم (8 نقاط): رطوبة سطح التربة 0–1 سم يومًا بيوم
           مضافًا إليها أعمدة ميزان الماء (مطر − تبخر-نتح لكل يوم). السلسلة تُجلب من
           Open-Meteo (past_days=7) وتُخزّن محليًا في هذا الجهاز (localStorage) ليعمل
           الرسم دون اتصال وتتحدّث النسخة المخزنة كل 6 ساعات. */
        const LOG_KEY = "matar:irrlog";
        let logAbort = null;

        function logCacheKey(place) {
          return `${LOG_KEY}:${(place?.latitude ?? 0).toFixed(2)},${(place?.longitude ?? 0).toFixed(2)}`;
        }

        function readLogCache(place) {
          try {
            const raw = localStorage.getItem(logCacheKey(place));
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj?.days?.length || Date.now() - (obj.at ?? 0) > 6 * HOUR) return null;
            return obj;
          } catch (e) { return null; }
        }

        function writeLogCache(place, days) {
          try { localStorage.setItem(logCacheKey(place), JSON.stringify({ at: Date.now(), days })); } catch (e) {}
        }

        async function fetchLogSeries(place, signal) {
          const u = new URL("https://api.open-meteo.com/v1/forecast");
          u.search = new URLSearchParams({
            latitude: String(place.latitude), longitude: String(place.longitude),
            hourly: "soil_moisture_0_to_1cm,precipitation,evapotranspiration",
            timezone: "auto", past_days: "7", forecast_days: "1",
            wind_speed_unit: "kmh", precipitation_unit: "mm",
          });
          return getJson(u, signal);
        }

        function buildLogDays(d) {
          const h = d?.hourly;
          if (!h?.time?.length) return [];
          const byDay = {};
          h.time.forEach((t, i) => {
            const day = String(t).slice(0, 10);
            byDay[day] = byDay[day] || { day, moist: [], rain: 0, et: 0 };
            const m = h.soil_moisture_0_to_1cm?.[i];
            if (m != null) byDay[day].moist.push(m);
            byDay[day].rain += h.precipitation?.[i] ?? 0;
            byDay[day].et += h.evapotranspiration?.[i] ?? 0;
          });
          return Object.values(byDay).map((x) => ({
            day: x.day,
            moist: x.moist.length ? (x.moist.reduce((a, b) => a + b, 0) / x.moist.length) * 100 : null,
            bal: x.rain - x.et,
          })).slice(-8);
        }

        function irrigationLogVerdict(days) {
          const pts = days.filter((x) => x.moist != null);
          if (pts.length < 3) return { v: "ok", txt: tr("جارٍ بناء السجل — عد غدًا لرسم أسبوع كامل") };
          const first = pts[0].moist, last = pts[pts.length - 1].moist;
          const slope = (last - first) / (pts.length - 1);
          const bal7 = days.reduce((a, x) => a + x.bal, 0);
          if (last < 14 || (slope < -0.35 && bal7 < -6)) return { v: "dry", txt: tf("جفاف مستمر خلال الأسبوع: رطوبة السطح {a}٪ نزولًا من {b}٪ وميزان ماء سالب {s} مم — استأنف دورات الري العميقة", { a: localNum(last, 1), b: localNum(first, 1), s: localNum(Math.abs(bal7), 1) }) };
          if (last > 34 || (slope > 0.35 && bal7 > 6)) return { v: "wet", txt: tf("رطوبة زائدة على مدار الأسبوع: السطح {a}٪ (كان {b}٪) وفائض مائي {s} مم — خفف الري وراجع التصريف", { a: localNum(last, 1), b: localNum(first, 1), s: localNum(bal7, 1) }) };
          return { v: "ok", txt: tf("ميزان ماء متوازن: رطوبة السطح بين {a}٪ و{b}٪ خلال الأسبوع — استمر في خطتك الحالية", { a: localNum(Math.min(first, last), 1), b: localNum(Math.max(first, last), 1) }) };
        }

        function drawLogChart(days) {
          if (!el.logChart) return;
          const series = days.map((x) => x.moist);
          const bars = days.map((x) => x.bal);
          const labels = days.map((x) => placeDateFormatter({ day: "numeric", month: "short" }).format(new Date(`${x.day}T12:00:00Z`)));
          drawChart(el.logChart, [
            { values: series, color: "#3fae70", width: 2.4, fill: true },
            { values: bars.map((b) => b == null ? null : clamp(b, 0, 60) + 5), color: "#4a94c9", width: 1.6, dash: [4, 3] },
          ], { timeLabels: [0, days.length - 2, days.length - 1].map((i) => labels[i] ?? "") });
        }

        async function renderIrrLog() {
          if (!el.logChart || !state.place) return;
          const place = state.place;
          const cached = readLogCache(place);
          let days = cached?.days ?? null;
          if (!days) {
            try {
              logAbort?.abort();
              logAbort = new AbortController();
              const d = await fetchLogSeries(place, logAbort.signal);
              days = buildLogDays(d);
              if (days.length) writeLogCache(place, days);
            } catch (e) {
              /* فشل الشبكة: نعرض آخر سجل مخزّن حتى لو انتهت صلاحيته بدل فراغ كامل */
              try {
                const raw = localStorage.getItem(logCacheKey(place));
                if (raw) days = JSON.parse(raw)?.days ?? null;
              } catch (e2) {}
            }
          }
          if (!days?.length || el.logChart.hidden) return;
          drawLogChart(days);
          const v = irrigationLogVerdict(days);
          if (el.logVerdict) { el.logVerdict.dataset.v = v.v; el.logVerdict.textContent = v.txt; }
          if (el.logNote) el.logNote.textContent = tr("الخط الأخضر: متوسط رطوبة السطح يوميًا (٪ حجمية) · الخط الأزرق: ميزان الماء اليومي (مطر − تبخر-نتح، مم). القراءة تُحدّث كل 6 ساعات وتُخزّن على جهازك لتعمل دون اتصال.");
        }

        function onData() {
          if (state.wx) {
            if (state.page === "agri") render();
          } else if (state.place) showLoading();
        }

        function ensure() {
          if (state.wx) render();
          else if (state.place && !state.loadingWx) loadMainData();
        }

        el.retry.addEventListener("click", () => loadMainData(true));

        // إصلاح 7: صفحة المزارعين لم تكن تتحدث عند تبديل وحدة الحرارة °م/°ف
        document.addEventListener("matar:unit", () => { if (state.wx && state.page === "agri") render(); });

        return { ensure, onData, onPlaceChange: onData, render };
      })();
      /* ┌────────────────────────────────────────────────────────────────────┐
         │ وحدة Roads — صفحة «طقس الطرق والسفر» (خريطة المسار + OSRM + الزحمة +  │
         │ محطات الاستراحة + دبابيس الحرارة) انتقلت حرفيًا إلى map.js §7           │
         └────────────────────────────────────────────────────────────────────┘ */


      /* ============================================================
         إصدار 28 — التقييم المجتمعي المحلي (Crowdsourced Weather)
         ------------------------------------------------------------
         زرا (الحالة مطابقة 👍 / الطقس مختلف 👎) تحت الطقس الحالي:
         - عند «مختلف» تُعرض قائمة أسباب سريعة (ممطر، مشمس، رياح قوية، ضباب…)
         - الملاحظات تُحفظ على جهاز المستخدم فقط (localStorage، آخر 30 ملاحظة)
         - آخر ملاحظة خلال 6 ساعات لنفس الموقع تُقرأ في صياغة المستشار الذكي
           كي يعدّل نصه إن كانت الرصدات المحلية تخالف النموذج
         - بلا سيرفر وبلا رفع بيانات — خصوصية كاملة
         ============================================================ */
      const Feedback = (() => {
        const KEY = "matar:wx:reports";
        const el = {
          box: $("#wx-feedback"), ok: $("#fb-ok"), miss: $("#fb-miss"),
          chips: $("#fb-chips"), status: $("#fb-status"),
        };
        const NOTE_TXT = {
          rain: "ممطر", sunny: "مشمس", wind: "رياح قوية",
          fog: "ضباب", dust: "غبار", hot: "حر شديد", cold: "بارد شديد",
        };

        function load() {
          try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
        }
        function save(list) {
          try { localStorage.setItem(KEY, JSON.stringify(list.slice(-30))); } catch (e) {}
        }

        function record(kind, note) {
          if (!state.place) return;
          const list = load();
          const last = list[list.length - 1];
          /* مكبح تكرار: ملاحظة واحدة كل 30 دقيقة كي يبقى السجل ذا معنى */
          if (last && Date.now() - last.ts < 30 * 60e3) {
            if (el.status) el.status.textContent = tr("سجّلنا ملاحظتك من قليل — يمكنك التعديل بعد 30 دقيقة.");
            return;
          }
          list.push({
            ts: Date.now(),
            lat: +Number(state.place.latitude).toFixed(1),
            lon: +Number(state.place.longitude).toFixed(1),
            kind, note: note || null,
          });
          save(list);
          render();
        }

        /* آخر ملاحظة خلال maxAgeH ساعة لنفس الموقع (تقريب 0.3° ≈ 33 كم) */
        function recent(maxAgeH = 6) {
          const p = state.place;
          if (!p) return null;
          const lat = +Number(p.latitude).toFixed(1), lon = +Number(p.longitude).toFixed(1);
          const now = Date.now();
          const hits = load().filter((r) =>
            now - r.ts <= maxAgeH * HOUR &&
            Math.abs(r.lat - lat) < 0.3 && Math.abs(r.lon - lon) < 0.3
          );
          return hits.length ? hits[hits.length - 1] : null;
        }

        function render() {
          if (!el.box) return;
          /* البطاقة تظهر فقط مع بيانات حية (ليست تجريبية ولا كاشًا) */
          const live = !!state.wx && !state.isDemoData && !!state.place;
          el.box.hidden = !live;
          if (!live) return;
          const last = load().filter((r) => Date.now() - r.ts < 3 * HOUR).pop();
          if (el.chips) el.chips.hidden = true;
          if (el.ok) el.ok.dataset.picked = String(!!last && last.kind === "ok");
          if (el.miss) el.miss.dataset.picked = String(!!last && last.kind === "mismatch");
          if (el.status) {
            if (!last) el.status.textContent = "";
            else if (last.kind === "ok") el.status.textContent = tr("✅ شكرًا! سجلنا أن القراءة مطابقة عندك — تقييمك يعيد ضبط دقة الخلاصات محليًا.");
            else if (last.note && NOTE_TXT[last.note]) el.status.textContent = tf("🙏 شكرًا! سجلنا الجو «{n}» عندك — سيُراعى في صياغة الخلاصة القادمة.", { n: tr(NOTE_TXT[last.note]) });
            else el.status.textContent = tr("🙏 شكرًا! سجلنا أن القراءة مختلفة عندك — سيُراعى ذلك في الخلاصة القادمة.");
          }
        }

        el.ok?.addEventListener("click", () => record("ok", null));
        el.miss?.addEventListener("click", () => {
          if (!el.chips) return;
          el.chips.hidden = !el.chips.hidden;
          if (!el.chips.hidden && el.status) el.status.textContent = tr("ما الجو فعليًا عندك الآن؟ اختر الأقرب:");
        });
        el.chips?.querySelectorAll(".fb-chip").forEach((b) => {
          b.addEventListener("click", () => { record("mismatch", b.dataset.note); });
        });
        document.addEventListener("matar:data", render);
        document.addEventListener("matar:language", render);

        /* خطاف الفحص الذاتي */
        window.__matarFeedbackHooks = { record, recent, NOTE_TXT };
        return { record, recent, render };
      })();

      /* ============================================================
         المرحلة 12 — المستشار الذكي (Advisor) — إصدار 31: إطار موحّد
         ------------------------------------------------------------
         محرك تحليل لغوي يعمل بالكامل على جهاز المستخدم، وأصبح الآن
         إطارًا واحدًا مسجّلًا (Registry) تُبنى عليه كل بطاقات المستشار
         في كل الصفحات (لوحة القيادة، المزارع، الطرق، الشهور) بدل أربع
         دوال عرض مكرّرة كان سلوكها يتفاوت من صفحة لأخرى:
         ① نص محلي فوري: كل بطاقة تطبع خلاصتها المحلية في نفس إطار
            الرسم — لا انتظار 900ms ولا نقاط «يحلّل الأرقام…» معلّقة.
         ② ترقية LLM اختيارية في الخلفية: إن توفر الشبكة وخرج الوضع
            الاقتصادي تُستبدل الصياغة بهدوء عند وصولها (12 ث كحد أقصى)
            مع شارة «· LLM» الموحدة، وإلا تبقى المحلية بشارة «· محلي».
         ③ شارة مصدر موحّدة وسطر موقع موحّد على البطاقات الأربع.
         ④ إعادة صياغة ومشاركة وسلوك كتابة حي متطابق في كل الصفحات.
         البنية جاهزة لربط مزوّد LLM خارجي عبر Advisor.setProvider(fn).
         ============================================================ */
      const Advisor = (() => {
        /* سجل البطاقات: معرفات DOM + مولّد الخلاصة المحلية + سطر الموقع
           + عنوان المشاركة — إضافة بطاقة جديدة أصبحت مدخلًا واحدًا هنا */
        const CARDS = {
          daily: {
            heading: "المستشار العام الذكي",
            ids: { title: "dash-ai-title", sub: "dash-ai-sub", text: "dash-ai-text", refresh: "dash-ai-refresh", share: "dash-ai-share" },
            subLine: () => placeLine([state.place?.name, state.place?.country]), /* v70 — H-01: بلا تكرار */
            build: () => dailyBriefing(),
            shareTitle: () => tr("المستشار العام الذكي") + (state.place ? ` · ${state.place.name}` : ""),
          },
          farmer: {
            heading: "المستشار الزراعي الذكي",
            ids: { title: "agri-ai-title", sub: "agri-ai-sub", text: "agri-ai-text", refresh: "agri-ai-refresh", share: "agri-ai-share" },
            subLine: () => placeLine([state.place?.name, state.place?.admin1]), /* v70 — H-01: لا «القاهرة، القاهرة» */
            build: () => farmerBriefing(state.wx, state.air),
            shareTitle: () => tr("المستشار الزراعي الذكي") + (state.place ? ` · ${state.place.name}` : ""),
          },
          road: {
            heading: "مستشار القيادة الذكي",
            ids: { title: "road-ai-title", sub: "road-ai-sub", text: "road-ai-text", refresh: "road-ai-refresh", share: "road-ai-share" },
            subLine: () => (lastRoadCtx
              ? tf("{a} ← {b}", { a: lastRoadCtx.A?.name ?? "—", b: lastRoadCtx.B?.name ?? "—" })
              : (state.place?.name ?? "—")),
            build: () => roadBriefing(lastRoadCtx),
            shareTitle: () => tr("مستشار القيادة الذكي"),
          },
          monthly: {
            heading: "المستشار الذكي للأشهر القادمة",
            ids: { title: "monthly-ai-title", sub: "monthly-ai-sub", text: "monthly-ai-text", refresh: "monthly-ai-refresh", share: "monthly-ai-share" },
            subLine: () => placeLine([state.place?.name, state.place?.country]), /* v70 — H-01: بلا تكرار */
            build: () => monthlyBriefing(),
            shareTitle: () => tr("المستشار الذكي للأشهر القادمة"),
          },
        };

        const SEED_KEY = "matar:ai:seed";
        let seed = 0;
        try { seed = Number(localStorage.getItem(SEED_KEY)) || 0; } catch (e) {}
        let lastRoadCtx = null;
        /* إصدار 15: حقائق الشهور القادمة — تغذيها وحدة Monthly عبر حدث matar:monthly-data
           وتُستهلك من الخلاصة الشهرية المحلية ومزوّد LLM معًا */
        let lastMonthlyFacts = null;

        const pick = (arr) => arr[seed % arr.length];
        function bumpSeed() {
          seed = (seed + 1) % 977;
          try { localStorage.setItem(SEED_KEY, String(seed)); } catch (e) {}
        }

        /* تأثير الكتابة الحية: حرفًا حرفًا مع مؤشر وامض — لكل عنصر مستقله الخاص
           (WeakMap لكل عقدة) كي لا يلغي عرض بطاقة عرض بطاقة أخرى */
        const twTokens = new WeakMap();
        function typewrite(node, text) {
          const token = Symbol("tw");
          twTokens.set(node, token);
          node.textContent = "";
          const caret = document.createElement("span");
          caret.className = "ai-caret";
          node.append(caret);
          let i = 0;
          const step = () => {
            if (twTokens.get(node) !== token) return; // صياغة أحدث لنفس العنصر فقط تلغي هذا العرض
            const chunk = Math.max(2, Math.round(text.length / 90));
            i = Math.min(text.length, i + chunk);
            node.textContent = text.slice(0, i);
            node.append(caret);
            if (i < text.length) setTimeout(step, 26);
            else setTimeout(() => { if (twTokens.get(node) === token) caret.remove(); }, 1400);
          };
          step();
        }

        function thinking(node) {
          node.innerHTML = `<span class="ai-thinking"><i></i><i></i><i></i></span> ${isAr() ? "يحلّل الأرقام…" : "Crunching the numbers…"}`;
        }

        /* ---------------- توليد خلاصة المزارع ---------------- */
        function farmerBriefing(wx, air) {
          const h = wx.hourly;
          if (!h?.time?.length) return null;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(49, h.time.length - s);
          const at = (i, k) => h[k]?.[s + i];
          const avg = (k, n) => {
            let sum = 0, c = 0;
            for (let i = 0; i < Math.min(n ?? N, N); i += 1) { const v = at(i, k); if (v != null) { sum += v; c += 1; } }
            return c ? sum / c : null;
          };
          const m6 = avg("soil_moisture_3_to_9cm", 12);          // العمق ~6 سم
          const mDeep = avg("soil_moisture_9_to_27cm", 12);      // العمق الأعمق للمقارنة
          let et24 = 0, rain48 = 0, probMax = 0, gustMax = 0, frostMin = Infinity, heatMax = 0, wetHours = 0, visMin = Infinity;
          for (let i = 0; i < N; i += 1) {
            const t = at(i, "temperature_2m"), rh = at(i, "relative_humidity_2m"), pr = at(i, "precipitation");
            if (i < 25) et24 += at(i, "evapotranspiration") ?? 0;
            rain48 += pr ?? 0;
            probMax = Math.max(probMax, at(i, "precipitation_probability") ?? 0);
            gustMax = Math.max(gustMax, at(i, "wind_gusts_10m") ?? 0);
            frostMin = Math.min(frostMin, t ?? Infinity);
            heatMax = Math.max(heatMax, t ?? 0);
            if ((rh ?? 0) >= 85 && t != null && t >= 15 && t <= 28) wetHours += 1;
            visMin = Math.min(visMin, at(i, "visibility") ?? Infinity);
          }
          const aqi = air?.current?.european_aqi;
          const pct = (v) => (v == null ? "—" : `${localNum(v * 100, 0)}٪`);
          const mm = (v) => localNum(v, 1);
          const ar = isAr();
          const L = [];

          // 1) الجملة الافتتاحية — الحكم العام
          const tense = m6 != null && m6 < 0.16 ? "hard" : gustMax >= 45 || frostMin <= 2 || heatMax >= 40 ? "risk" : "calm";
          L.push(tense === "hard"
            ? pick([tr("تنبيه مباشر من حقلك: الوضع يحتاج تدخلًا خلال ساعات، لا أيام."), tr("الأرقام الحالية ترسل إشارة تحذير واضحة — التدخل العاجل أولوية الآن."), tr("حقلك يطلب انتباهك اليوم، لا غدًا.")])
            : tense === "risk"
              ? pick([tr("يوم مزدوج المشاعر: فرص جيدة لكن هناك خطر واحد يستحق التخطيط له."), tr("الوضع العام مقبول مع تحفظ واحد مهم لن أتجاهله."), tr("خلال الـ 48 ساعة القادمة هناك فرصة سانحة مع نقطة حساسة تستوجب الانتباه.")])
              : pick([tr("أخبار مريحة: حقلك في حالة استقرار خلال اليومين القادمين."), tr("الطقس في صالحك هذه الفترة — نافذة عمل ميداني مريحة."), tr("لا مصادر قلق جادة في بيانات الـ 48 ساعة القادمة.")]));

          // 2) جملة الري — على نمط المثال المطلوب (رطوبة عمق 6 سم + توصية مضمّنة)
          if (m6 != null) {
            const deepTxt = mDeep != null ? tf("، وعلى العمق الأعمق {v}", { v: pct(mDeep) }) : "";
            if (m6 < 0.12) {
              L.push(pick([
                tf("تنبيه: رطوبة التربة منخفضة جدًا على عمق 6 سم ({v} فقط) مع طلب تبخري {e} مم/يوم — نقترح زيادة الري المسائي بدءًا من الليلة، وفجرًا إن جفّ سطح التربة.", { v: pct(m6), e: mm(et24) }),
                tf("التربة عند عمق 6 سم عطشى ({v}){d}؛ ريّة غزيرة واحدة مساءً أنفع من ريّات سطحية متكررة.", { v: pct(m6), d: deepTxt }),
              ]));
            } else if (m6 < 0.20) {
              L.push(pick([
                tf("رطوبة عمق 6 سم ({v}) تتراجع تدريجيًا مع طلب جوي {e} مم/يوم — جدوِل دورة ري خلال يومين ويفضّل بعد الغروب لتقليل الفقد.", { v: pct(m6), e: mm(et24) }),
                tf("المخزون المائي قرب حد الانتباه ({v} على 6 سم)؛ ريّة ليلية عميقة خلال 48 ساعة تمنع التراجع أكثر.", { v: pct(m6) }),
              ]));
            } else {
              L.push(pick([
                tf("الرطوبة على عمق 6 سم مريحة ({v}){d} — لا حاجة لريّ إضافي قريبًا، راقب فقط قراءات الغد.", { v: pct(m6), d: deepTxt }),
                tf("مخزون الماء في الجذور بوضع جيد ({v})؛ أجّل أي جدولة ري حتى تراجع القراءات تحت 20٪.", { v: pct(m6) }),
              ]));
            }
          }

          // 3) المطر ونافذة الرش
          if (rain48 >= 6) {
            L.push(pick([
              tf("متوقع {r} مم مطر باحتمال يصل {p}٪ — أوقف الري مؤقتًا وأجّل الرش الكيميائي حتى تجف الأوراق.", { r: mm(rain48), p: localNum(probMax) }),
              tf("موجة مطر تبلغ {r} مم (ذروة الاحتمال {p}٪): فرصة لتوفير ماء الري، لكن انتبه من أمراض فطرية تصيب الأوراق حين تبقى رطبة.", { r: mm(rain48), p: localNum(probMax) }),
            ]));
          } else if (probMax >= 35) {
            L.push(tf("احتمالات مطر متوسطة ({v}٪) دون مجاميع مؤثرة — التزم بنافذة الرش المبكرة قبل احتمال الهطول.", { v: localNum(probMax) }));
          }

          // 4) الخطر الأبرز
          if (frostMin <= 2) {
            L.push(pick([
              tf("أخفض حرارة متوقعة {v} — غطِّ الشتلات الحساسة واسقِ التربة قبل الغروب لتخزين حرارة النهار.", { v: tempText(frostMin) }),
              tf("تنخفض الحرارة إلى {v} ليلًا: جهّز الأغطية القماشية للقطع الحساسة، واحمِ البقع المنخفضة من الصقيع بأي وسيلة تدفئة متاحة.", { v: tempText(frostMin) }),
            ]));
          } else if (gustMax >= 45) {
            L.push(pick([
              tf("هبّات تصل {v} كم/س: دعّم النباتات الطويلة وأغلق أغطية الدفيئات جيدًا، وأجّل الرش يوم الهبّات.", { v: localNum(gustMax) }),
              tf("رياح قوية حتى {v} كم/س — خطر انقلاب النباتات الطويلة وتمزق الأغطية؛ التثبيت قبل وصول الذروة.", { v: localNum(gustMax) }),
            ]));
          } else if (heatMax >= 37) {
            L.push(pick([
              tf("ذروة حرارة {v}: اعتمد ريّات خفيفة متكررة وقت الظهيرة، وأجّل تقليم الرؤوس ليوم أبرد.", { v: tempText(heatMax) }),
              tf("إجهاد حراري محتمل ({v}) — مظلات خفيفة على البيوت المحمية وتجنّب الرش الورقي وقت الذروة.", { v: tempText(heatMax) }),
            ]));
          } else if (wetHours >= 6) {
            L.push(tf("{v} ساعة برطوبة مرتفعة وحرارة ملائمة للفطريات — حسّن التهوية واعمل رشًّا وقائيًا إن كان المرض قد ظهر سابقًا في الحقل.", { v: localNum(wetHours) }));
          } else {
            L.push(pick([tr("لا خطر صقيع أو رياح مدمرة أو موجات حر — وقت مناسب للعمليات الروتينية من تقليم وتسميد."), tr("لا تنبيهات حرجة: استغل الاستقرار في أعمال الصيانة والمراقبة الروتينية.")]));
          }

          // 5) جودة الهواء + الخاتمة
          if (aqi != null && aqi > 60) {
            L.push(tf("جودة الهواء متوسطة إلى سيئة (مؤشر {v}) — من يتعامل مع المبيدات فليغطِ وجهه وأنفه أثناء الرش.", { v: localNum(aqi) }));
          }
          L.push(pick([tr("خلاصة التوصية: نفّذ النصيحة الأعلى خطورة أولًا، وراقب تحديث البيانات صباح الغد."), tr("عمومًا: ابدأ بالنصيحة الأعلى خطورة أعلاه، والبقية استرشادية حسب محصولك."), tr("بهذا تكون خطة اليومين القادمين واضحة — نتمنى موسمًا وفيرًا.")]));
          return L.join(" ");
        }

        /* ---------------- توليد خلاصة القيادة ---------------- */
        function roadBriefing(trip) {
          const ar = isAr();
          const L = [];
          if (trip && Array.isArray(trip.pts) && trip.pts.length) {
            const { totalKm, pts } = trip;
            const hazards = { level2: 0, level1: 0 };
            let worst = null, bestVis = Infinity, maxGust = 0, maxCross = 0, maxPr = 0;
            pts.forEach((p) => {
              if (p.info?.level === 2) hazards.level2 += 1;
              else if (p.info?.level === 1) hazards.level1 += 1;
              if (!worst || (p.info?.level ?? 0) > (worst.info?.level ?? 0)) worst = p;
              bestVis = Math.min(bestVis, p.vis ?? Infinity);
              maxGust = Math.max(maxGust, p.gust ?? 0);
              maxCross = Math.max(maxCross, p.cross ?? 0);
              maxPr = Math.max(maxPr, p.pr ?? 0);
            });
            const kmTxt = `${localNum(totalKm)} ${tx("كم", "km")}`;
            const open1 = tr(hazards.level2 ? "فيها نقطة أو أكثر تحتاج انتباهك الحقيقي." : hazards.level1 ? "هادئة في معظمها مع مقاطع تستحق تخفيف السرعة." : "سالكة عمومًا بلا مخاطر ظاهرة.");
            const open2 = tr(hazards.level2 ? "والمؤشرات الحمراء دعوة لتغيير التوقيت لا لإلغاء الرحلة." : hazards.level1 ? "والخلاصة: قُد بهدوء والتزم بالفجوة الآمنة." : "والنتيجة مطمئنة لأي مركبة سليمة.");
              L.push(pick([
                tf("قراءة سريعة لرحلتك ({k}): {o}", { k: kmTxt, o: open1 }),
                tf("فحصت {n} نقطة على طول المسار ({k}) — {o}", { n: localNum(pts.length), k: kmTxt, o: open2 }),
              ]));
            if (hazards.level2 && worst) {
              const worstRole = worst.role === "mid" ? tr("منتصف الطريق") : worst.role === "end" ? tr("الوصول") : tr("الانطلاق");
              L.push(pick([
                tf("أخطر مقطع قرب «{w}» حوالي {t}: {d} برؤية تقارب {v} كم. فكّر في تأجيل الانطلاق ساعة أو اثنتين.", { w: worstRole, t: clockText(new Date(worst.eta)), d: wmoDesc(worst.hourly?.weather_code?.[worst.k] ?? 0, worst.hourly?.cloud_cover?.[worst.k]), v: worst.vis != null ? localNum(worst.vis / 1000, 1) : "—" }),
                tf("توقيت الخطر: حوالي {t} تقع أسوأ ظروف المسار ({d}) — رحلة لاحقة بقليل قد تمر أسلم بكثير.", { t: clockText(new Date(worst.eta)), d: wmoDesc(worst.hourly?.weather_code?.[worst.k] ?? 0, worst.hourly?.cloud_cover?.[worst.k]) }),
              ]));
            }
            if (maxGust >= 45) {
              L.push(maxCross >= 0.6
                ? pick([
                  tf("هبّات جانبية قوية حتى {v} كم/س عمودية على اتجاه الطريق — أخطر ما يكون للسيارات العالية والمقطورات؛ خفف السرعة على الجسور والفضاء المفتوح.", { v: localNum(maxGust) }),
                  tf("انتبه للرياح الجانبية ({v} كم/س): تُخل بتوازن المركبات العالية خصوصًا عند الفضاءات المكشوفة والجسور.", { v: localNum(maxGust) }),
                ])
                : tf("هبّات تصل {v} كم/س باتجاه قريب من محور الطريق — مؤثرة أقل، لكن احفظ قبضة ثابتة على المقود.", { v: localNum(maxGust) }));
            }
            /* الميزة الجديدة — التنبيه الديناميكي للرياح الجانبية في خلاصة القيادة:
               نحدد القطاع الأخطر (زاوية قريبة من 90° × أعلى هبّة ≥ 40 كم/س) ونسميه بالكيلومتر */
            let xw = null;
            pts.forEach((p) => {
              const g = p.gust ?? 0, c = p.cross ?? 0;
              if (c >= 0.65 && g >= 40) {
                const score = g * c;
                if (!xw || score > xw.score) xw = { p, score, g, c };
              }
            });
            if (xw) {
              L.push(ar
                ? tf("تحديد أدق: أخطر تعرّض للرياح الجانبية عند القطاع ({v} كم من الانطلاق) حوالي {t} — هبّات {g} كم/س بزاوية ~{a}° عن مسار السيارة. تمسّك بالمقود جيدًا هناك وقلّل السرعة قبل الجسور والطرق المكشوفة.", { v: localNum(xw.p.km), t: clockText(new Date(xw.p.eta)), g: localNum(xw.g), a: localNum(Math.round(clamp(90 * xw.c, 0, 90))) })
                : `Precise spot: the worst crosswind hits the segment at ${localNum(xw.p.km)} km around ${clockText(new Date(xw.p.eta))} — gusts ${localNum(xw.g)} km/h at ~${localNum(Math.round(clamp(90 * xw.c, 0, 90)))}° to your heading. Grip the wheel firmly there and ease off before bridges.`);
            }
            if (maxPr >= 4) {
              L.push(pick([
                tf("أمطار حتى {v} مم/س في مقاطع من المسار: ماء على الأسفلت يعني مسافة توقف أطول — شغّل أضواء الخطر وقلّل السرعة.", { v: localNum(maxPr, 1) }),
                tf("وجود مطر فعلي ({v} مم/س): شغّل الأنوار وتجنب الكبح المفاجئ على الممرات المبللة.", { v: localNum(maxPr, 1) }),
              ]));
            } else if (bestVis < 1200) {
              L.push(tf("مدى الرؤية ينخفض حتى {v} كم في مقاطع ضبابية — شغّل أضواء الضباب وقلّل السرعة هناك.", { v: localNum(bestVis / 1000, 1) }));
            }
            if (ar) {
              L.push(pick([hazards.level2 ? tr("توصيتي: أجّل أو غيّر التوقيت إن استطعت، وإلا فقسّم الرحلة بمحطات راحة.") : tr("رحلة موفقة — حدّث الفحص قبل الانطلاق بساعة للتأكد من استقرار الوضع."), tr("بهذا تكون الصورة كاملة: توقيت أفضل من سرعة أكبر دائمًا.")]));
            } else {
              L.push(hazards.level2 ? "My advice: delay or retiming beats pushing through — split the trip with rest stops if you must." : "Safe travels — re-check an hour before departure for updates.");
            }
          } else if (state.wx) {
            // قبل رسم أي رحلة: خلاصة موقعك الحالي للانطلاق
            const wx = state.wx, h = wx.hourly ?? {};
            const s = hourIndexAtPlace(wx);
            const cur = wx.current ?? {};
            const vis = h.visibility?.[s], gust = h.wind_gusts_10m?.[s], pr = h.precipitation?.[s], code = cur.weather_code ?? 0;
              L.push(pick([
                tf("لم ترسم رحلة بعد، لذا هذه خلاصة انطلاقك من {p}: {d} وحرارة {t}.", { p: state.place?.name ?? tr("موقعك"), d: wmoDesc(code, cur.cloud_cover ?? h.cloud_cover?.[s]), t: tempText(cur.temperature_2m) }),
                tf("الوضع حولك الآن ({p}): {d} عند {t} — وإليك ما يعنيه ذلك على الطريق.", { p: state.place?.name ?? "—", d: wmoDesc(code, cur.cloud_cover ?? h.cloud_cover?.[s]), t: tempText(cur.temperature_2m) }),
              ]));
            const issues = [];
            if (vis != null && vis < 1200) issues.push(tf("رؤية منخفضة ({v} كم) تستدعي أضواء الضباب", { v: localNum(vis / 1000, 1) }));
            if ((gust ?? 0) >= 45) issues.push(tf("هبّات {v} كم/س تُقلق المركبات العالية", { v: localNum(gust) }));
            if ((pr ?? 0) >= 1) issues.push(tf("مطر فعلي {v} مم/س يعني أسفلت زلقًا", { v: localNum(pr, 1) }));
            if (issues.length) {
              L.push(pick([tf("انتبه إلى: {i}.", { i: issues.join(tr("، ")) }), tf("أمور تستحق انتباهك قبل الانطلاق: {i}.", { i: issues.join(tr("، ")) })]));
            } else {
              L.push(pick([tr("ظروف انطلاق مريحة: رؤية جيدة ولا هبّات مؤثرة. حدّد نقطتي البداية والنهاية أعلاه ليفحص التطبيق المسار كاملًا."), tr("الانطلاق من هنا آمن الآن — ولفحص الطريق حتى وجهتك حدد نقطتي البداية والنهاية.")]));
            }
          } else {
            return null;
          }
          return L.join(" ");
        }

        /* ═════════════ إصدار 15 + 27 ═════════════
           توليد خلاصة اليوم العامة (لوحة القيادة — التوقعات العامة):
           إصدار 27: صياغة قاعدية ذكية (Rule-based NLP) تدمج أكثر من ظاهرة معًا
           في جملة بشرية واحدة بدل سرد ثابت — مثال:
           «اليوم الأجواء دافئة ولكن احذر من هبّات الرياح المفاجئة بعد العصر،
            ننصح بتأجيل غسيل السيارات» — مع دورة صياغات متغيرة بذرة عشوائية. */
        function dailyBriefing() {
          const wx = state.wx;
          if (!wx?.hourly?.time?.length) return null;
          const cur = wx.current ?? {};
          const h = wx.hourly;
          const s = hourIndexAtPlace(wx);
          /* إصلاح 31: كانت النافذة 25 ساعة والنص يقول «24 ساعة» — صارت 24 تمامًا */
          const N = Math.min(24, h.time.length - s);
          let rain24 = 0, probMax = 0, gustMax = 0, gustIdx = -1, uvMax = 0, tmin = Infinity, tmax = -Infinity, stormH = 0, visMin = Infinity, rhSum = 0, rhN = 0;
          for (let i = 0; i < N; i += 1) {
            rain24 += h.precipitation?.[s + i] ?? 0;
            probMax = Math.max(probMax, h.precipitation_probability?.[s + i] ?? 0);
            const g = h.wind_gusts_10m?.[s + i] ?? 0;
            if (g > gustMax) { gustMax = g; gustIdx = s + i; }
            uvMax = Math.max(uvMax, h.uv_index?.[s + i] ?? 0);
            const t = h.temperature_2m?.[s + i];
            if (t != null) { tmin = Math.min(tmin, t); tmax = Math.max(tmax, t); }
            if ((h.weather_code?.[s + i] ?? 0) >= 95) stormH += 1;
            visMin = Math.min(visMin, h.visibility?.[s + i] ?? Infinity);
            const rh = h.relative_humidity_2m?.[s + i];
            if (rh != null) { rhSum += rh; rhN += 1; }
          }
          const rhAvg = rhN ? rhSum / rhN : null;
          const d = wx.daily ?? {};
          const meanT = Number.isFinite(tmin) && Number.isFinite(tmax) ? (tmin + tmax) / 2 : null;

          /* صياغة وقت الذروة بلغة بشرية من الساعة */
          const periodOf = (iso) => {
            const hh = Number(String(iso ?? "").slice(11, 13));
            if (Number.isNaN(hh)) return "";
            if (hh < 5) return tx("فجرًا", "before dawn");
            if (hh < 12) return tx("صباحًا", "in the morning");
            if (hh < 15) return tx("قرب الظهيرة", "around noon");
            if (hh < 17) return tx("بعد الظهر", "in the afternoon");
            if (hh < 19) return tx("بعد العصر", "late afternoon");
            if (hh < 21) return tx("مساءً", "in the evening");
            return tx("ليلًا", "at night");
          };
          const gustPeriod = periodOf(h.time[gustIdx]);
          const tempWord = meanT == null ? "" : meanT >= 26 ? tx("دافئة", "warm") : meanT <= 12 ? tx("باردة نسبيًا", "rather cold") : tx("معتدلة", "mild");
          const L = [];

          /* ① الجملة الافتتاحية المدمجة: طابع الحرارة + أشهر خطر + توقيته الزمني */
          const risks = [];
          if (gustMax >= 40) risks.push(tf("هبّات رياح مفاجئة تبلغ {v} كم/س {p}", { v: localNum(gustMax), p: gustPeriod }));
          else if (gustMax >= 30) risks.push(tf("رياح نشطة {p}", { p: gustPeriod }));
          if (stormH) risks.push(tx("نشاط رعدي محتمل", "possible thunderstorms"));
          if (Number.isFinite(visMin) && visMin < 1200) risks.push(tx("فترات ضباب أو غبار", "fog or dust spells"));
          if (rain24 >= 1 || probMax >= 45) risks.push(tx("فرص أمطار", "rain chances"));
          if (uvMax >= 8) risks.push(tx("أشعة فوق بنفسجية قوية", "strong UV"));
          const placeName = state.place?.name ?? "—";
          if (risks.length) {
            L.push(pick([
              tf("اليوم الأجواء {w} في {p}، ولكن احذر من {r} — رتّب خططك حولها لا ضدها.", { w: tempWord || tx("مستقرة", "settled"), p: placeName, r: risks.slice(0, 2).join(tx(" و", " and ")) }),
              tf("خلاصة {p} اليوم: {w} عمومًا، مع {r}. التوقيت هو من يحدد راحتك اليوم.", { p: placeName, w: tempWord || tx("مستقرة", "settled"), r: risks.slice(0, 2).join(tx(" و", " and ")) }),
            ]));
          } else {
            L.push(pick([
              tf("اليوم الأجواء {w} في {p} وبلا مخاطر تُذكر — نافذة سانحة لكل مهامك الخارجية.", { w: tempWord || tx("مستقرة", "settled"), p: placeName }),
              tf("يوم هادئ في {p}: {w} وسماء متعاونة — استثمره في الأنشطة الطويلة.", { p: placeName, w: tempWord || tx("مستقرة", "settled") }),
            ]));
          }

          /* ①-ب إصدار 28 — دمج الرادار مع النص الذكي (Data Blending):
             إن رصد الرادار اللحظي (أو سلاسل الدقائق) كتلة مطر تقترب بينما التوقعات
             الساعية لا تُظهر مطرًا مؤكدًا، فالرصد الحي أسبق من النموذج — يعدّل
             المستشار نصه تلقائيًا ويقول ذلك للمستخدم صراحة. */
          try {
            const nc = typeof Nowcast !== "undefined" && Nowcast?.analyze?.();
            if (nc && nc.kind === "soon" && (nc.etaMin ?? 999) <= 120) {
              if (rain24 < 1 && probMax < 45) {
                L.push(tf(tx("ملاحظة مهمة: رغم أن التوقعات الساعية لا تُظهر مطرًا مؤكدًا، الرادار يرصد كتلة ممطرة تقترب من موقعك الآن — وصولها المتوقع خلال {m} دقيقة تقريبًا، فاجعل المظلة معك احتياطًا.", "Important: although the hourly forecast shows no certain rain, the radar is picking up a rain band approaching your area — expected in about {m} minutes, so keep an umbrella handy."), { m: localNum(Math.round(nc.etaMin)) }));
              } else {
                L.push(tf(tx("والرادار يؤكد اقتراب مطر خلال {m} دقيقة — الرصد اللحظي متسق مع التوقعات اليوم، فلا تؤجل المظلة.", "The radar also confirms rain approaching within {m} minutes — live observation agrees with today's forecast, don't postpone the umbrella."), { m: localNum(Math.round(nc.etaMin)) }));
              }
            }
          } catch (e) { /* الرادار اختياري في الصياغة */ }

          /* ①-ج إصدار 28 — إدخال الملاحظات المجتمعية المحلية في الصياغة:
             إن سجّل المستخدم جوًا مختلفًا عن النموذج خلال آخر 6 ساعات يعترف
             المستشار بذلك ويمنح رصده المحلي وزنًا صريحًا. */
          try {
            const rep = typeof Feedback !== "undefined" && Feedback?.recent?.(6);
            if (rep?.note === "rain" && rain24 < 1 && probMax < 45) {
              L.push(tx("وأنت سجّلت قبل ساعات أن الجو ممطر فعليًا حولك — القياس الحي أسبق من النموذج في مثل هذه الحالات، فتعامل مع نسب المطر هنا بهامش إضافي.", "You reported actual rain a few hours ago — live observation beats the model in such cases, so treat rain percentages with an extra margin."));
            } else if (rep?.note === "sunny" && probMax >= 50) {
              L.push(tx("وأنت سجّلت قبل ساعات أن السماء صافية حولك رغم نسب المطر المتوقعة — صياغة اليوم تمنح وزنًا لرصدك المحلي مع بقاء الحذر الاحتياطي.", "You reported clear skies a few hours ago despite forecast rain chances — today's wording weighs your local report while keeping a safety margin."));
            }
          } catch (e) { /* الملاحظات المجتمعية اختيارية */ }

          /* ② المدى الحراري اليومي */
          if (d.temperature_2m_max?.[0] != null) {
            L.push(tf("الحرارة: أعلى {mx} وأدنى {mn}.{night}", {
              mx: tempText(d.temperature_2m_max[0]), mn: tempText(d.temperature_2m_min?.[0]),
              night: Number.isFinite(tmin) && tmin <= 5 ? tf(" ليلاً ستقترب من {v} — جهّز الملابس الدافئة من المساء.", { v: tempText(tmin) }) : "",
            }));
          }

          /* ③ المطر: مظلة + غسيل السيارة بنفس النفس */
          if (rain24 >= 1) {
            L.push(tf("مطر تراكمي ~{v} مم خلال 24 ساعة باحتمال يصل {p}٪ — احمل المظلة{car}.", {
              v: localNum(rain24, 1), p: localNum(probMax),
              car: rain24 >= 3 ? tx(" وأجّل غسيل السيارة — السماء ستتولى التنظيف مجانًا", " and skip the car wash — the sky will do it for free") : "",
            }));
          } else if (probMax >= 40) {
            L.push(tf("احتمال المطر يبلغ {p}٪ دون مجاميع مؤثرة — نظرة سريعة للسماء قبل الخروج تكفي، وغسيل السيارة وارد لكنه محسوم.", { p: localNum(probMax) }));
          } else {
            L.push(pick([
              tx("لا مطر متوقع خلال 24 ساعة القادمة — وقت مثالي لغسيل السيارة ونشر الغسيل والصيانة الخارجية.", "No rain expected in the next 24 hours — a perfect time to wash the car, dry laundry and do outdoor chores."),
              tx("نافذة 24 ساعة بلا أمطار — غسيل السيارة والنشر الخارجي قراران رابحان اليوم.", "A rain-free 24-hour window — washing the car and hanging laundry are winning calls today."),
            ]));
          }

          /* ④ التوصية العملية المدمجة حسب أخطر ظاهرة */
          if (stormH) L.push(tx("وقت العواصف: افصل الأجهزة الحساسة وتجنّب المناطق المكشوفة والأشجار وقت الذروة.", "Storm hours: unplug sensitive devices and avoid open areas and trees at the peak."));
          else if (gustMax >= 45) L.push(tf("مع هبّات {v} كم/س: ثبّت الأشياء السطحية وأجّل غسيل السيارة إلى ما بعد {p} كي لا يجف الماء وعلق به الغبار.", { v: localNum(gustMax), p: gustPeriod || tx("الظهيرة", "midday") }));
          else if (gustMax >= 30) L.push(tf("الرياح النشطة (حتى {v} كم/س) تقلب المظلات الخفيفة والقبعات — أمسكها جيدًا {p}.", { v: localNum(gustMax), p: gustPeriod }));
          else if (rhAvg != null && rhAvg >= 75 && Number.isFinite(visMin) && visMin >= 1200) L.push(tx("الرطوبة مرتفعة والجو ثقيل قليلًا — التهوية الجيدة وسائل بارد صديقك اليوم.", "Humidity is high and the air feels heavy — good ventilation and cold fluids are your friends today."));
          if (uvMax >= 8) L.push(tf("أشعة UV تصل {v} عند ذروتها — واقي الشمس والقبعة قبل الخروج وقت الظهيرة.", { v: localNum(uvMax, 1) }));
          if (Number.isFinite(visMin) && visMin < 1200) L.push(tx("رؤية منخفضة في فترات (ضباب أو غبار) — أضواء الضباب جاهزة وخفف السرعة على الطرق.", "Low visibility spells (fog or dust) — keep fog lights ready and ease off the throttle."));
          L.push(tx("بهذا تكون خطتك اليومية واضحة — حدّث الصفحة مساءً لمتابعة تغيّر الوضع.", "That sets up your day — refresh in the evening to track any shift."));
          return L.join(" ");
        }

        /* ═════════════ إصدار 15 ═════════════
           توليد خلاصة الأشهر القادمة (صفحة التوقعات الشهرية):
           يلخّص الشهر القادم (متوسط/انحراف/أمطار) مع توجه الأشهر السبعة،
           اعتمادًا على الحقائق التي ترسلها وحدة Monthly عبر الحدث المخصص */
        function monthlyBriefing() {
          const mf = lastMonthlyFacts;
          if (!mf?.nextMonth) return null;
          const nm = mf.nextMonth;
          const L = [];
          if (Number.isFinite(nm.mean) && Number.isFinite(nm.norm)) {
            L.push(tf("نظرة على {m}: المتوسط المتوقع {t} مقابل معيار مناخي {c} — انحراف {a}.", {
              m: nm.name, t: tempText(nm.mean), c: tempText(nm.norm),
              a: (nm.anomaly >= 0 ? "+" : "") + localNum(nm.anomaly, 1) + "°",
            }));
          } else {
            L.push(tf("نظرة على {m}: {t} متوسطًا للشهر.{tail}", { m: nm.name, t: Number.isFinite(nm.mean) ? tempText(nm.mean) : "—", tail: "" }));
          }
          if (!Number.isFinite(nm.anomaly)) { /* بلا مناخ مرجعي */ }
          else if (nm.anomaly >= 1) L.push(tx("شهر أدفأ من المعتاد: خطط لتبريد أعلى وريّات ليلية إضافية.", "A warmer-than-normal month: plan extra cooling and additional evening watering."));
          else if (nm.anomaly <= -1) L.push(tx("شهر أبرد من المعتاد: راقب نافذة أول صقيع إن كانت لديك مزروعات حساسة.", "A cooler-than-normal month: watch the first frost window if you grow sensitive crops."));
          else L.push(tx("شهر قريب من معياره المناخي — التخطيط وفق المعتاد المألوف قرار سليم.", "A month close to its climate norm — planning on familiar patterns is a sound call."));
          if (nm.rain != null) {
            const weak = nm.rainNorm != null && nm.rainNorm >= 2 && nm.rain <= nm.rainNorm * 0.7;
            const heavy = nm.rainNorm != null && nm.rainNorm >= 2 && nm.rain >= nm.rainNorm * 1.4;
            const tail = weak
              ? tx(" — موسم مطري أضعف: شدّد كفاءة الري وغطِّ التربة.", " — a weaker rain season: tighten irrigation efficiency and mulch the soil.")
              : heavy
                ? tx(" — موسم مطري أغزر: افحص التصريف وتوقّع فرص تعبئة المخزون.", " — a heavier rain season: check drainage and expect storage recharge.")
                : "";
            if (tail) L.push(tf("الأمطار المتوقعة ~{p} مم مقابل معتاد {c} مم{tail}", { p: localNum(nm.rain, 1), c: localNum(nm.rainNorm ?? 0, 1), tail }));
            else if (nm.rainNorm != null) L.push(tf("الأمطار المتوقعة ~{p} مم مقابل معتاد {c} مم — موسم مطري قريب من المعتاد.", { p: localNum(nm.rain, 1), c: localNum(nm.rainNorm, 1) }));
            else L.push(tf("مجموع الأمطار المتوقع للشهر ~{p} مم.", { p: localNum(nm.rain, 1) }));
          }
          if (mf.trend && Number.isFinite(mf.trend.avgA) && Math.abs(mf.trend.avgA) >= 0.4) {
            L.push(mf.trend.warm
              ? tf("التوجه العام للأشهر السبعة: دفء ملحوظ (+{a}° وسطيًا) بذروة في {m}.", { a: localNum(mf.trend.avgA, 1), m: mf.trend.peak })
              : tf("التوجه العام للأشهر السبعة: ميول برادية ({a}° وسطيًا) بذروة في {m}.", { a: localNum(mf.trend.avgA, 1), m: mf.trend.peak }));
          }
          if (nm.coveredDays) L.push(tf("الأيام من 1 إلى {v} مغطاة بالنموذج قصير المدى عالي الدقة، والبقية تقديرات مناخية مدعومة بـ SEAS5.", { v: localNum(nm.coveredDays) }));
          L.push(tx("استخدم الفلتر أعلى الصفحة للتنقل بين خطة الأشهر السبعة وتفاصيل الشهر القادم يوم بيوم.", "Use the filter at the top of the page to switch between the seven-month outlook and next month's day-by-day details."));
          return L.join(" ");
        }

        /* ═══════════════ إصدار 31 — دورة الحياة الموحّدة للبطاقات ═══════════════
           renderCard(kind): مسار واحد يخدم البطاقات الأربع في كل الصفحات:
           ① يطبع الخلاصة المحلية فورًا (typewrite) — الصفحة لا تنتظر أي شبكة،
              وهذا يقضي على حالة «يحلّل الأرقام…» الطويلة التي كانت تظهر حين
              يتباطأ مزوّد LLM أو يرفض الطلب.
           ② يطلق ترقية LLM في الخلفية: إن وصل نص أفضل خلال ميزانية المهلة
              يُستبدل بهدوء مع شارة «· LLM»، وإلا بقي المحلي بشارة «· محلي»،
              وبلا شبكة «· أوفلاين» — سلوك واحد متطابق في كل الصفحات. */
        let renderSeq = 0;
        const cardSeq = {};

        function setCardBadge(kind, mode) {
          const cfg = CARDS[kind];
          const node = $(`#${cfg.ids.sub}`);
          if (!node) return;
          const base = cfg.subLine() || "—";
          const tag = mode === "llm" ? " · LLM"
            : mode === "local" ? ` · ${tx("محلي", "Local")}`
            : mode === "offline" ? ` · ${tx("أوفلاين", "Offline")}`
            : "";
          node.textContent = base + tag;
        }

        function renderCard(kind, opts = {}) {
          const cfg = CARDS[kind];
          if (!cfg) return;
          const textEl = $(`#${cfg.ids.text}`);
          if (!textEl) return;
          const titleEl = $(`#${cfg.ids.title}`);
          if (titleEl) titleEl.textContent = tr(cfg.heading);
          setCardBadge(kind, "pending");
          const id = (renderSeq += 1);
          cardSeq[kind] = id;

          /* حالة الشهور القادمة قبل وصول حقائق Monthly تبقى بانتظار البيانات */
          if (kind === "monthly" && !lastMonthlyFacts) {
            textEl.innerHTML = `<span class="ai-thinking"><i></i><i></i><i></i></span> ${isAr() ? "بانتظار بيانات النموذج الشهري…" : "Waiting for the monthly model data…"}`;
            return;
          }

          /* ① النص المحلي فورًا — بلا أي انتظار شبكة */
          let local = null;
          try { local = cfg.build(); } catch (e) { local = null; }
          if (cardSeq[kind] !== id) return; /* صياغة أحدث حلّت لهذه البطاقة */
          if (local) typewrite(textEl, local);
          else thinking(textEl);
          if (!local) return;

          /* ② ترقية LLM الصامتة — تُلغى فورًا إن حلّت صياغة أحدث للبطاقة */
          setTimeout(async () => {
            const upgrade = await maybeCustom(kind, { fresh: !!opts.fresh });
            if (cardSeq[kind] !== id || !upgrade) {
              if (cardSeq[kind] === id) setCardBadge(kind, navigator.onLine ? "local" : "offline");
              return;
            }
            const title2 = $(`#${cfg.ids.title}`);
            if (title2) title2.textContent = tr(cfg.heading);
            setCardBadge(kind, "llm");
            typewrite($(`#${cfg.ids.text}`), String(upgrade));
          }, 60);
        }

        /* أسماء الدوال القديمة تبقى صالحة (توافق داخلي وخارجي) */
        function renderFarmer() { if (!state.wx) return; renderCard("farmer"); }
        function renderRoad(trip) {
          if (trip) lastRoadCtx = trip;
          renderCard("road");
        }
        function renderDaily() { if (!state.wx) return; renderCard("daily"); }
        function renderMonthly() { renderCard("monthly"); }

        // مزوّد خارجي اختياري (LLM خفيف): مرّر دالة async(ctx) => نص وستُستخدم بدل المحرك المحلي
        let customProvider = null;
        function setProvider(fn) { customProvider = typeof fn === "function" ? fn : null; }

        async function maybeCustom(kind, ctx) {
          if (!customProvider) return null;
          /* إصدار 31: بلا شبكة أو في الوضع الاقتصادي لا نلمس مزوّد LLM إطلاقًا —
             الوضع الاقتصادي يعد بعدم أي طلب شبكة، والخلاصة المحلية تغطي الحالتين */
          if (!navigator.onLine) return null;
          try { if (typeof Eco !== "undefined" && typeof Eco.isEco === "function" && Eco.isEco()) return null; } catch (e) {}
          try { return await customProvider({ kind, ctx, state: { place: state.place, wx: state.wx, air: state.air } }); } catch (e) { return null; }
        }

        /* زر «صياغة أخرى» — سلوك واحد لكل البطاقات: بذرة جديدة + خلاصة محلية
           جديدة فورية + ترقية LLM طازجة (بتجاوز الكاش) عند وصولها */
        Object.entries(CARDS).forEach(([kind, cfg]) => {
          $(`#${cfg.ids.refresh}`)?.addEventListener("click", () => {
            bumpSeed();
            const btn = $(`#${cfg.ids.refresh}`);
            btn?.querySelector("svg")?.setAttribute("data-spin", "true");
            renderCard(kind, { fresh: true });
            setTimeout(() => $(`#${cfg.ids.refresh}`)?.querySelector("svg")?.removeAttribute("data-spin"), 700);
          });
        });

        /* ═══════════════ إصدار 27 — مشاركة الخلاصة (Web Share API) ═══════════════
           زر «مشاركة» في بطاقات المستشار: يرسل نص التقرير الجوي أو نصيحة الطريق
           مباشرة كرسالة على واتساب/تلغرام/أي تطبيق مثبت بضغطة واحدة.
           المتصفحات بلا navigator.share (سفاري قديم، سطح مكتب) تسقط تلقائيًا
           إلى نسخ النص في الحافظة مع إشعار توست يوضح ذلك. */
        /* توست محلي مستقل — pwaToast محصور داخل وحدة التثبيت ولا يمكن الوصول إليها من هنا
           إصلاح 31: تموضع فيزيائي (left:50% + translateX(-50%)) يصحح مركز التوست
           في الاتجاهين RTL وLTR معًا — كان يزحف لليمين في الوضع الإنجليزي */
        function advisorToast(msg) {
          const t = document.createElement("div");
          t.setAttribute("role", "status");
          t.textContent = msg;
          t.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:9500;padding:10px 16px;border-radius:12px;background:var(--teal);color:#fffaf0;font-size:12.5px;font-weight:700;box-shadow:0 10px 26px rgb(0 0 0 / 25%);max-width:min(90vw,420px);text-align:center;transition:opacity 300ms ease";
          document.body.appendChild(t);
          setTimeout(() => { t.style.opacity = "0"; }, 2200);
          setTimeout(() => t.remove(), 2600);
        }

        async function shareCard(textNode, title) {
          const text = textNode?.textContent?.trim();
          if (!text || text.includes("يحلّل") || text.includes("يفحص") || text.includes("بانتظار")) {
            advisorToast(tr("الخلاصة لم تكتمل بعد — انتظر ثوانٍ ثم شارك."));
            return;
          }
          const full = `${title}\n\n${text}\n\n— ${tr("مَطَر برو · تطبيق الطقس المتكامل")}`;
          try {
            if (navigator.share) {
              await navigator.share({ title, text: full });
              return;
            }
            await navigator.clipboard.writeText(full);
            advisorToast(tr("نُسخت الخلاصة إلى الحافظة — الصقها في أي محادثة."));
          } catch (e) { /* ألغى المستخدم نافذة المشاركة — لا شيء مطلوب */ }
        }

        Object.values(CARDS).forEach((cfg) => {
          $(`#${cfg.ids.share}`)?.addEventListener("click", () => shareCard($(`#${cfg.ids.text}`), cfg.shareTitle()));
        });

        document.addEventListener("matar:data", () => { renderFarmer(); renderRoad(); renderDaily(); });
        document.addEventListener("matar:route", (e) => { renderRoad(e.detail); });
        /* إصدار 15: وحدة Monthly تبث حقائق الشهور بعد كل رسم ناجح — تنشيط البطاقة الشهرية */
        document.addEventListener("matar:monthly-data", (e) => {
          lastMonthlyFacts = e.detail || null;
          renderMonthly();
        });
        document.addEventListener("matar:language", () => { Object.keys(CARDS).forEach((k) => renderCard(k)); });

        return { setProvider, renderFarmer, renderRoad, renderDaily, renderMonthly, monthlyFacts: () => lastMonthlyFacts };
      })();

      /* ============================================================
         إصدار 28 — المشاركة كبطاقة صورة (Share Shot)
         ------------------------------------------------------------
         زر «كصورة» في بطاقة الخلاصة اليومية وفي جوّك اليوم: يرسم بطاقة طقس
         أنيقة 1080×1350 (مقاس الستوري) عبر Canvas 2D — تدرج سماوي حسب رمز
         الطقس، الموقع، الحرارة الكبيرة، الوصف، أعلى/أدنى، بطاقات القيم
         (رياح/رطوبة/احتمال مطر/UV)، وسطر من الخلاصة الذكية — ثم يشاركها
         عبر Web Share API كملف PNG حقيقي (ستوري إنستغرام/تويتر/واتساب)،
         مع احتياط تنزيل مباشر للمتصفحات بلا مشاركة ملفات.
         لماذا Canvas بدل مكتبات html2canvas؟ لأن CSP هنا موقّع بهاشات حصرًا،
         ولأن مُنسخ الـ DOM لا يدعم color-mix وbackdrop-filter فتخرج البطاقة
         مشوهة — أما Canvas فيرسم العربية والتدرجات بدقة 100٪ وبلا أي اعتماد خارجي.
         ============================================================ */
      const ShareShot = (() => {
        const el = { dashShot: $("#dash-ai-shot"), joqShot: $("#joq-shot") };

        function shotToast(msg) {
          const t = document.createElement("div");
          t.setAttribute("role", "status");
          t.textContent = msg;
          t.style.cssText = "position:fixed;bottom:18px;inset-inline-start:50%;transform:translateX(50%);z-index:9500;padding:10px 16px;border-radius:12px;background:var(--teal);color:#fffaf0;font-size:12.5px;font-weight:700;box-shadow:0 10px 26px rgb(0 0 0 / 25%);max-width:min(90vw,420px);text-align:center;transition:opacity 300ms ease";
          document.body.appendChild(t);
          setTimeout(() => { t.style.opacity = "0"; }, 2200);
          setTimeout(() => t.remove(), 2600);
        }

        /* تدرج السماء حسب رمز الطقس (نفس لغة مولّد الودجت) */
        function skyColors(code, day) {
          code = code ?? 0;
          if (code <= 1) return day ? ["#2f80c2", "#8ec9e8"] : ["#0f2740", "#1d4468"];
          if (code <= 3) return day ? ["#4a7fa8", "#a8c8dd"] : ["#18293b", "#2d4a63"];
          if (code >= 45 && code <= 48) return ["#8a97a3", "#c4ced6"];
          if (code >= 95) return day ? ["#4a4e80", "#8a86b8"] : ["#1a1d33", "#33305e"];
          if (code >= 71 && code <= 86) return ["#7d95ad", "#c3d4e4"];
          return day ? ["#3a6d99", "#7fb3d5"] : ["#1a2f45", "#2b5472"];
        }

        function roundRect(ctx, x, y, w, h, r) {
          const rr = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + rr, y);
          ctx.arcTo(x + w, y, x + w, y + h, rr);
          ctx.arcTo(x + w, y + h, x, y + h, rr);
          ctx.arcTo(x, y + h, x, y, rr);
          ctx.arcTo(x, y, x + w, y, rr);
          ctx.closePath();
        }

        function wrapText(ctx, text, x, y, maxW, lh, maxLines) {
          const words = String(text ?? "").split(/\s+/).filter(Boolean);
          let line = "", lines = 0;
          for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            if (ctx.measureText(test).width > maxW && line) {
              lines += 1;
              ctx.fillText(line, x, y + (lines - 1) * lh);
              line = w;
              if (lines >= (maxLines ?? 4) - 1) break;
            } else line = test;
          }
          if (line && lines < (maxLines ?? 4)) ctx.fillText(line, x, y + lines * lh);
          return y + lines * lh;
        }

        function buildCard(d) {
          const W = 1080, H = 1350;
          const canvas = document.createElement("canvas");
          canvas.width = W; canvas.height = H;
          const ctx = canvas.getContext("2d");
          const [c1, c2] = skyColors(d.code, d.isDay);
          const grad = ctx.createLinearGradient(0, 0, W * 0.7, H);
          grad.addColorStop(0, c1); grad.addColorStop(1, c2);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          /* توهجات خلفية ناعمة */
          const glow = ctx.createRadialGradient(W * 0.85, H * 0.12, 20, W * 0.85, H * 0.12, 420);
          glow.addColorStop(0, "rgba(255,246,220,0.22)");
          glow.addColorStop(1, "rgba(255,246,220,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, W, H);
          const FONT = '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif';
          ctx.direction = "rtl";
          ctx.textAlign = "right";
          ctx.textBaseline = "top";
          /* الرأس: العلامة + التاريخ */
          ctx.fillStyle = "rgba(255,250,240,0.75)";
          ctx.font = `700 30px ${FONT}`;
          ctx.fillText(`مَطَر برو · ${d.date}`, W - 64, 66);
          /* الموقع */
          ctx.fillStyle = "rgba(255,250,240,0.92)";
          ctx.font = `800 54px ${FONT}`;
          ctx.fillText(String(d.place).slice(0, 28), W - 64, 132);
          /* الحرارة الكبيرة + الوصف */
          ctx.fillStyle = "#fffaf0";
          ctx.font = `600 210px ${FONT}`;
          ctx.fillText(`${Math.round(d.temp)}°`, W - 64, 240);
          ctx.font = `700 44px ${FONT}`;
          ctx.fillStyle = "rgba(255,250,240,0.95)";
          ctx.fillText(String(d.desc).slice(0, 40), W - 64, 500);
          ctx.font = `600 34px ${FONT}`;
          ctx.fillStyle = "rgba(255,250,240,0.8)";
          ctx.fillText(`${d.hiLo}  ·  ${d.isDay ? tr("نهار") : tr("ليل")}`, W - 64, 568);
          /* بطاقات القيم 2×2 */
          const chips = [
            [tr("الرياح"), d.wind], [tr("الرطوبة"), d.rh],
            [tr("احتمال المطر"), d.prob], [tr("الأشعة UV"), d.uv],
          ];
          const cw = (W - 64 * 2 - 24) / 2, ch = 128;
          chips.forEach(([label, val], i) => {
            const col = i % 2, row = Math.floor(i / 2);
            const x = W - 64 - cw - col * (cw + 24);
            const y = 660 + row * (ch + 20);
            ctx.fillStyle = "rgba(9,42,52,0.35)";
            roundRect(ctx, x, y, cw, ch, 26);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.16)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "rgba(255,250,240,0.72)";
            ctx.font = `700 27px ${FONT}`;
            ctx.fillText(label, x + cw - 26, y + 22);
            ctx.fillStyle = "#fffaf0";
            ctx.font = `800 40px ${FONT}`;
            ctx.fillText(String(val), x + cw - 26, y + 64);
          });
          /* صندوق الخلاصة الذكية */
          if (d.line) {
            const by = 660 + 2 * (ch + 20) + 8;
            ctx.fillStyle = "rgba(9,42,52,0.42)";
            roundRect(ctx, 64, by, W - 128, 236, 28);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.14)";
            ctx.stroke();
            ctx.fillStyle = "#ffe9b8";
            ctx.font = `800 27px ${FONT}`;
            ctx.fillText(tr("✨ الخلاصة الذكية"), W - 96, by + 24);
            ctx.fillStyle = "rgba(255,252,244,0.96)";
            ctx.font = `600 31px ${FONT}`;
            wrapText(ctx, d.line, W - 96, by + 78, W - 224, 46, 3);
          }
          /* التذييل */
          ctx.fillStyle = "rgba(255,250,240,0.62)";
          ctx.font = `600 26px ${FONT}`;
          ctx.fillText(tr("مَطَر برو — تطبيق الطقس المتكامل · Open-Meteo"), W - 64, H - 84);
          return canvas;
        }

        function collectData(lineText) {
          const wx = state.wx, place = state.place;
          if (!wx || !place) return null;
          const cur = wx.current ?? {};
          const s = hourIndexAtPlace(wx);
          const h = wx.hourly ?? {};
          const N = Math.min(25, (h.time?.length ?? 0) - s);
          let probMax = 0, uvMax = 0;
          for (let i = 0; i < N; i += 1) {
            probMax = Math.max(probMax, h.precipitation_probability?.[s + i] ?? 0);
            uvMax = Math.max(uvMax, h.uv_index?.[s + i] ?? 0);
          }
          const d = wx.daily ?? {};
          const hi = d.temperature_2m_max?.[0], lo = d.temperature_2m_min?.[0];
          return {
            place: placeLine([place.name, place.admin1 ? String(place.admin1).split("،")[0] : ""], " · "), /* v70 — H-01: بلا تكرار اسم المدينة */
            temp: cur.temperature_2m,
            code: cloudFixCode(cur.weather_code ?? 0, cur.cloud_cover), /* v70 — C-01 */
            isDay: (cur.is_day ?? 1) === 1,
            desc: wmoDesc(cur.weather_code ?? 0, cur.cloud_cover), /* v70 — C-01 */
            hiLo: `${tr("أعلى")} ${tempText(hi)} · ${tr("أدنى")} ${tempText(lo)}`,
            wind: `${localNum(cur.wind_speed_10m ?? 0)} ${tr("كم/س")}`,
            rh: `${localNum(cur.relative_humidity_2m ?? 0)}٪`,
            prob: `${localNum(probMax)}٪`,
            uv: localNum(uvMax, 1),
            date: new Intl.DateTimeFormat(activeLocale(), { weekday: "long", day: "numeric", month: "long" }).format(new Date()),
            line: lineText,
          };
        }

        async function shareCanvas(canvas) {
          /* v52: ختم الشعار العالمي الرسمي في زاوية بطاقة المشاركة */
          try { window.__matarDrawLogoStamp?.(canvas.getContext("2d"), 88, canvas.height - 88, 56); } catch (e) {}
          const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.92));
          if (!blob) throw new Error("toBlob failed");
          const file = new File([blob], "matar-weather-card.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: tr("مَطَر برو — بطاقة الطقس"), text: tr("طقس موقعي الآن من مَطَر برو 🌤") });
            return "shared";
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "matar-weather-card.png";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          return "downloaded";
        }

        async function shotFromNode(nodeId, fallbackLine) {
          if (!state.wx || !state.place) { shotToast(tr("اختر موقعًا أولًا ثم أعد المحاولة.")); return; }
          const node = $(nodeId);
          let line = node?.textContent?.trim() ?? "";
          if (!line || line.includes("يحلّل") || line.includes("يفحص")) line = fallbackLine || "";
          /* سطر واحد مركّز: أول جملتين فقط من الخلاصة — v70/C-03: قطع ذكي يقف
             عند آخر علامة ترقيم كاملة قبل الحد فلا تُبتر أي كلمة من المنتصف */
          line = smartCut(line.split(/(?<=[.،!؟…])\s/).slice(0, 2).join(" "), 190);
          const d = collectData(line);
          if (!d || d.temp == null) { shotToast(tr("بيانات الطقس غير جاهزة بعد — ثوانٍ ثم أعد المحاولة.")); return; }
          try {
            const canvas = buildCard(d);
            const how = await shareCanvas(canvas);
            shotToast(how === "shared" ? tr("تم فتح نافذة المشاركة — اختر ستوري أو واتساب أو تلغرام 🎉") : tr("البطاقة جاهزة ونزلت كصورة PNG — شاركها على ستوري 🎉"));
          } catch (e) { /* المستخدم ألغى المشاركة — لا شيء مطلوب */ }
        }

        el.dashShot?.addEventListener("click", () => shotFromNode("#dash-ai-text"));
        el.joqShot?.addEventListener("click", () => shotFromNode("#joq-sport-verdict"));
        return { shotFromNode };
      })();

      /* ============================================================
         المرحلة 13 — مزوّد LLM خفيف بلا مفاتيح (Pollinations · Mistral)
         يحوّل أرقام الطقس والتربة والمسار إلى فقرة نصيحة بشرية واحدة
         بأسلوب خبير ودود، وبكل لغات الواجهة السبع. يفشل بهدوء إلى المحرك
         المحلي عند أي عطل أو انقطاع، ويخزّن النتائج 30 دقيقة كي لا يثقل
         المزوّد المجاني، وزر «صياغة أخرى» يتجاوز الكاش عمدًا لصياغة جديدة.
         ============================================================ */
      const llmCache = new Map(); // "kind|place|lang" → { ts, text }
      const LLM_TTL = 30 * 60 * 1000;
      let llmSeq = 0;

      function llmFarmerFacts(wx, air) {
        try {
          const h = wx?.hourly;
          if (!h?.time?.length) return null;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(49, h.time.length - s);
          const at = (i, k) => h[k]?.[s + i];
          const avg = (k, n) => { let sum = 0, c = 0; for (let i = 0; i < Math.min(n ?? N, N); i += 1) { const v = at(i, k); if (v != null) { sum += v; c += 1; } } return c ? sum / c : null; };
          let rain48 = 0, probMax = 0, gustMax = 0, tMin = Infinity, tMax = -Infinity, et24 = 0, wetHours = 0;
          for (let i = 0; i < N; i += 1) {
            const t = at(i, "temperature_2m"), rh = at(i, "relative_humidity_2m"), pr = at(i, "precipitation");
            if (i < 25) et24 += at(i, "evapotranspiration") ?? 0;
            rain48 += pr ?? 0;
            probMax = Math.max(probMax, at(i, "precipitation_probability") ?? 0);
            gustMax = Math.max(gustMax, at(i, "wind_gusts_10m") ?? 0);
            tMin = Math.min(tMin, t ?? Infinity);
            tMax = Math.max(tMax, t ?? -Infinity);
            if ((rh ?? 0) >= 85 && t != null && t >= 15 && t <= 28) wetHours += 1;
          }
          const cur = wx.current ?? {};
          const f = (v, d = 1) => (v == null || !Number.isFinite(v)) ? null : Number(Number(v).toFixed(d));
          return {
            place: [state.place?.name, state.place?.country].filter(Boolean).join(", "),
            now_desc: wmoDesc(cur.weather_code ?? 0, cur.cloud_cover), now_temp_c: f(cur.temperature_2m),
            soil_moisture_6cm_pct: f(avg("soil_moisture_3_to_9cm", 12) * 100, 0),
            soil_moisture_27cm_pct: f(avg("soil_moisture_9_to_27cm", 12) * 100, 0),
            et0_next24h_mm: f(et24, 1), rain_next48h_mm: f(rain48, 1),
            rain_probability_max_pct: f(probMax, 0), wind_gust_max_kmh: f(gustMax, 0),
            temp_min_c: f(tMin), temp_max_c: f(tMax),
            humid_warm_hours_48h: wetHours,
            european_aqi: f(air?.current?.european_aqi, 0),
          };
        } catch (e) { return null; }
      }

      function llmRoadFacts(trip) {
        try {
          if (trip && Array.isArray(trip.pts) && trip.pts.length) {
            let worst = null, bestVis = Infinity, maxGust = 0, maxCross = 0, maxPr = 0, lv2 = 0, lv1 = 0;
            trip.pts.forEach((p) => {
              if (p.info?.level === 2) lv2 += 1; else if (p.info?.level === 1) lv1 += 1;
              if (!worst || (p.info?.level ?? 0) > (worst.info?.level ?? 0)) worst = p;
              bestVis = Math.min(bestVis, p.vis ?? Infinity);
              maxGust = Math.max(maxGust, p.gust ?? 0);
              maxCross = Math.max(maxCross, p.cross ?? 0);
              maxPr = Math.max(maxPr, p.pr ?? 0);
            });
            const f = (v, d = 1) => (v == null || !Number.isFinite(v)) ? null : Number(Number(v).toFixed(d));
            return {
              from: trip.A?.name ?? null, to: trip.B?.name ?? null,
              distance_km: f(trip.totalKm), checkpoints: trip.pts.length,
              risky_checkpoints: lv2, caution_checkpoints: lv1,
              worst_checkpoint: worst ? { around_local_time: clockText(new Date(worst.eta)), conditions: wmoDesc(worst.hourly?.weather_code?.[worst.k] ?? 0, worst.hourly?.cloud_cover?.[worst.k]), visibility_km: f(worst.vis / 1000) } : null,
              max_gust_kmh: f(maxGust, 0), strong_crosswind: maxCross >= 0.6, max_rain_mmh: f(maxPr, 1),
              min_visibility_km: Number.isFinite(bestVis) ? f(bestVis / 1000) : null,
            };
          }
          const wx = state.wx, h = wx?.hourly ?? {};
          if (!wx) return null;
          const s = hourIndexAtPlace(wx), cur = wx.current ?? {};
          const vis = h.visibility?.[s], gust = h.wind_gusts_10m?.[s], pr = h.precipitation?.[s];
          const f = (v, d = 1) => (v == null || !Number.isFinite(v)) ? null : Number(Number(v).toFixed(d));
          return {
            departure_from: state.place?.name ?? null,
            no_route_yet: true,
            now_desc: wmoDesc(cur.weather_code ?? 0, cur.cloud_cover), now_temp_c: f(cur.temperature_2m),
            visibility_km: f(vis / 1000), wind_gust_kmh: f(gust, 0), rain_mmh: f(pr, 1),
          };
        } catch (e) { return null; }
      }

      /* ═════════════ إصدار 15 ═════════════
         حقائق المستشار العام (لوحة القيادة): الطقس الآن + 24 ساعة + أسبوع
         — أرقام محسوبة محليًا حصريًا كي لا يخترع النموذج شيئًا */
      function llmDailyFacts(wx, air) {
        try {
          const h = wx?.hourly;
          if (!h?.time?.length) return null;
          const s = hourIndexAtPlace(wx);
          /* إصلاح 31: مطابقة نافذة حقائق الـ LLM مع نافذة العرض — 24 ساعة بالضبط */
          const N = Math.min(24, h.time.length - s);
          const at = (i, k) => h[k]?.[s + i];
          let rain24 = 0, probMax = 0, gustMax = 0, uvMax = 0, tMin = Infinity, tMax = -Infinity, stormH = 0, visMin = Infinity;
          for (let i = 0; i < N; i += 1) {
            rain24 += at(i, "precipitation") ?? 0;
            probMax = Math.max(probMax, at(i, "precipitation_probability") ?? 0);
            gustMax = Math.max(gustMax, at(i, "wind_gusts_10m") ?? 0);
            uvMax = Math.max(uvMax, at(i, "uv_index") ?? 0);
            const t = at(i, "temperature_2m");
            if (t != null) { tMin = Math.min(tMin, t); tMax = Math.max(tMax, t); }
            if ((at(i, "weather_code") ?? 0) >= 95) stormH += 1;
            visMin = Math.min(visMin, at(i, "visibility") ?? Infinity);
          }
          const d = wx?.daily ?? {};
          let wkMax = -Infinity, wkMin = Infinity, wkRain = 0, wkGust = 0;
          const W = Math.min(7, d.time?.length ?? 0);
          for (let i = 0; i < W; i += 1) {
            wkMax = Math.max(wkMax, d.temperature_2m_max?.[i] ?? -Infinity);
            wkMin = Math.min(wkMin, d.temperature_2m_min?.[i] ?? Infinity);
            wkRain += d.precipitation_sum?.[i] ?? 0;
            wkGust = Math.max(wkGust, d.wind_gusts_10m_max?.[i] ?? 0);
          }
          const cur = wx?.current ?? {};
          const f = (v, dec = 1) => (v == null || !Number.isFinite(v)) ? null : Number(Number(v).toFixed(dec));
          return {
            place: [state.place?.name, state.place?.country].filter(Boolean).join(", "),
            now_desc: wmoDesc(cur.weather_code ?? 0, cur.cloud_cover), now_temp_c: f(cur.temperature_2m), feels_like_c: f(cur.apparent_temperature),
            today_max_c: f(d.temperature_2m_max?.[0]), today_min_c: f(d.temperature_2m_min?.[0]),
            next24h: {
              rain_mm: f(rain24, 1), rain_probability_max_pct: f(probMax, 0), gust_max_kmh: f(gustMax, 0),
              uv_max: f(uvMax, 1), thunderstorm_hours: stormH,
              min_visibility_km: Number.isFinite(visMin) ? f(visMin / 1000) : null,
              temp_min_c: Number.isFinite(tMin) ? f(tMin) : null, temp_max_c: Number.isFinite(tMax) ? f(tMax) : null,
            },
            week7: { max_c: Number.isFinite(wkMax) ? f(wkMax) : null, min_c: Number.isFinite(wkMin) ? f(wkMin) : null, rain_mm: f(wkRain, 1), gust_max_kmh: f(wkGust, 0) },
            european_aqi: f(air?.current?.european_aqi, 0),
          };
        } catch (e) { return null; }
      }

      /* ═════════════ إصدار 15 ═════════════
         حقائق المستشار الشهري: الشهر القادم + صفوف الأشهر السبعة
         — تُبنى داخل وحدة Monthly وتبث عبر الحدث matar:monthly-data */
      function llmMonthlyFacts(mf) {
        try {
          if (!mf?.nextMonth) return null;
          const r = (v, dec = 1) => (v == null || !Number.isFinite(v)) ? null : Number(Number(v).toFixed(dec));
          return {
            place: [state.place?.name, state.place?.country].filter(Boolean).join(", "),
            next_month: {
              name: mf.nextMonth.name,
              mean_temp_c: r(mf.nextMonth.mean), climate_norm_c: r(mf.nextMonth.norm), anomaly_c: r(mf.nextMonth.anomaly),
              rain_mm: r(mf.nextMonth.rain), rain_norm_mm: r(mf.nextMonth.rainNorm), rain_days: mf.nextMonth.rainDays,
              covered_days: mf.nextMonth.coveredDays, total_days: mf.nextMonth.totalDays,
            },
            seasonal7: (mf.seasonalRows || []).slice(0, 7).map((row) => ({
              month: row.name, temp_c: r(row.temp), norm_c: r(row.norm), delta_c: r(row.delta), rain_mm: r(row.rain), rain_norm_mm: r(row.rainNorm),
            })),
            trend: mf.trend ? { avg_delta_c: r(mf.trend.avgA), peak_month: mf.trend.peak, warming: !!mf.trend.warm } : null,
          };
        } catch (e) { return null; }
      }

      function buildAdvisorPrompt(kind, facts) {
        const ar = isAr();
        const langName = ar ? "Arabic (Modern Standard, clear and simple)" : ({ en: "English", fr: "French", de: "German", es: "Spanish", pt: "Portuguese", it: "Italian" }[currentLanguage] || "English");
        const role = kind === "road"
          ? (ar ? "خبير سلامة مرور وأحوال طرق" : "a road-safety and travel-weather expert")
          : kind === "daily"
            ? (ar ? "مرشد أرصاد ودود يخاطب عامة الناس" : "a friendly household weather guide")
            : kind === "monthly"
              ? (ar ? "مخطط مناخي موسمي عملي" : "a practical seasonal climate planner")
              : (ar ? "مستشار زراعي ميداني خبير" : "an expert field agronomist");
        const ask = kind === "road"
          ? (ar ? "اكتب فقرة واحدة (60-90 كلمة) بنبرة خبير ودود تخاطب السائق مباشرة قبل انطلاقه، فيها توصية عملية واحدة واضحة حول التوقيت أو السرعة." : "Write ONE short paragraph (60-90 words) in a friendly expert tone addressing the driver before departure, with ONE clear practical recommendation about timing or speed.")
          : kind === "daily"
            ? (ar ? "اكتب فقرة واحدة (60-100 كلمة) بنبرة مرشد ودود تخاطب شخصًا يخطط يومه، فيها أبرز تنبيه لطقس اليوم والأسبوع وتوصية عملية واحدة واضحة." : "Write ONE short paragraph (60-100 words) in a friendly guide tone addressing someone planning their day, with today's headline weather and ONE clear practical recommendation.")
            : kind === "monthly"
              ? (ar ? "اكتب فقرة واحدة (70-110 كلمة) بنبرة مخطط مناخي عملي تخاطب صاحب حقل أو أسرة، تشرح توجه الأشهر السبعة وتُبرز الشهر القادم بتوصية تخطيطية واحدة واضحة." : "Write ONE short paragraph (70-110 words) in a practical climate-planner tone addressing a farmer or a family, explaining the seven-month trend and highlighting next month with ONE clear planning recommendation.")
              : (ar ? "اكتب فقرة واحدة (60-90 كلمة) بنبرة خبير ودود تخاطب المزارع مباشرة، فيها توصية عملية واحدة واضحة عن الري أو الرش أو الحماية." : "Write ONE short paragraph (60-90 words) in a friendly expert tone addressing the farmer directly, with ONE clear practical recommendation about irrigation, spraying, or protection.");
        return [
          ar ? `أنت ${role} تتحدث بثقة ومختصر. استخدم الأرقام المعطاة حرفيًا عند الحاجة.` : `You are ${role} speaking confidently and concisely. Use the given numbers literally when helpful.`,
          ask,
          ar ? "ممنوع: التحيات، المقدمات، العناوين، القوائم، الإيموجي، وعلامات الماركداون. اكتب الفقرة فقط." : "Forbidden: greetings, introductions, headings, lists, emojis, markdown. Output the paragraph only.",
          `Facts (JSON): ${JSON.stringify(facts)}`,
          `Answer language: ${langName}.`,
        ].join("\n");
      }

      async function llmAdvisorProvider({ kind, ctx }) {
        if (!navigator.onLine) return null;
        const place = state.place;
        if (!place) return null;
        const placeKey = `${Number(place.latitude).toFixed(2)},${Number(place.longitude).toFixed(2)}`;
        const cacheKey = `${kind}|${placeKey}|${currentLanguage}`;
        const wantFresh = !!(ctx && ctx.fresh); // زر «صياغة أخرى»: تجاوز الكاش عمدًا
        const hit = wantFresh ? null : llmCache.get(cacheKey);
        if (hit && Date.now() - hit.ts < LLM_TTL) return hit.text;
        /* إصدار 15: أربعة أنواع — الطرق، المزارع، اليوم (لوحة القيادة)، والشهور القادمة */
        const facts = kind === "road" ? llmRoadFacts(ctx?.trip)
          : kind === "daily" ? llmDailyFacts(state.wx, state.air)
          : kind === "monthly" ? llmMonthlyFacts(Advisor.monthlyFacts())
          : llmFarmerFacts(state.wx, state.air);
        if (!facts) return null;
        const seq = ++llmSeq; // طلب أحدث يُلغي حكم الردود الأقدم
        const controller = new AbortController();
        /* إصلاح 31: مهلة 12 ث — الترقية صارت خلفية فوق نص محلي ظاهر فورًا،
           فلا داعي لميزانية 20 ث كانت تُبقي الشارة «محلي» معلّقة طويلًا */
        const timer = setTimeout(() => controller.abort(), 12000);
        const prompt = buildAdvisorPrompt(kind, facts);
        /* إصلاح 30 — سبب تعطل «ملخص الذكاء الاصطناعي»: الاعتماد على محاولة POST واحدة
           بنموذج mistral الذي أصبح يتجاهله المزود أحيانًا (402/429/نموذج مُزاح).
           الآن سلسلة محاولات: POST بالنموذجين الأحدث ثم مسار GET الخفيف كاحتياط —
           وأي محاولة ناجحة تكفي، والفشل الكلي يسقط بهدوء للمحرك المحلي كالمعتاد. */
        const attempts = [
          () => fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: "openai", referrer: "matar-pro", private: true }),
            signal: controller.signal,
          }),
          () => fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: "mistral", referrer: "matar-pro", private: true }),
            signal: controller.signal,
          }),
          () => fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&referrer=matar-pro`, { signal: controller.signal }),
          () => fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=mistral&referrer=matar-pro`, { signal: controller.signal }),
        ];
        try {
          for (let at = 0; at < attempts.length; at += 1) {
            if (controller.signal.aborted) break;
            let res;
            try { res = await attempts[at](); } catch (e) { continue; } // مهلة/شبكة → المحاولة التالية
            if (!res || !res.ok) continue;
            let raw;
            try { raw = ((await res.text()) || "").trim(); } catch (e) { continue; }
            if (seq !== llmSeq) return null; // وصل رد لطلب تجاوزه طلب أحدث
            /* تحقق صحي مرن: نص فعلي وليس JSON أو HTML أو رسالة خطأ
               (كان شرط 60 حرفًا يرفض ردودًا عربية صحيحة موجزة ويُسقط الخلاصة كليًا) */
            if (raw.length < 40 || raw.length > 1500) continue;
            if (/^[{[<]/.test(raw)) continue;
            if (/^\s*(error|sorry|unauthorized|payment|required|rate limit)/i.test(raw)) continue;
            if (/\bas an ai\b|\bi cannot\b|\bi can't\b/i.test(raw.slice(0, 160))) continue;
            const text = raw.replace(/^["'\s]+|["'\s]+$/g, "");
            llmCache.set(cacheKey, { ts: Date.now(), text });
            try { window.__matarLLM = { ok: true, at: Date.now(), attempt: at }; } catch (e) {}
            return text;
          }
          try { window.__matarLLM = { ok: false, at: Date.now() }; } catch (e) {}
          return null;
        } catch (e) { return null; }
        finally { clearTimeout(timer); }
      }

      // المرحلة 13: تركيب المزوّد — المحرك المحلي يبقى احتياطًا تلقائيًا عند أي فشل
      Advisor.setProvider(llmAdvisorProvider);

      /* ============================================================
         المرحلة 12 — ودجت شاشة الهاتف الرئيسية (Widget Generator)
         يرسم ودجت طقسًا (مربع 4×4 وعريض 4×2) على Canvas من بيانات
         الطقس الحالية ويصدّره PNG جاهزًا للتثبيت كودجت صورة.
         ============================================================ */
      const WidgetGen = (() => {
        const sq = $("#widget-canvas-square");
        const wd = $("#widget-canvas-wide");
        const FONT = '"Segoe UI", Tahoma, Arial, sans-serif';

        function skyPalette(code, isDay) {
          const night = !isDay;
          if (code === 0 || code === 1) return night ? ["#0f2740", "#1d4468"] : ["#2f80c2", "#8ec9e8"];
          if (code === 2 || code === 3) return night ? ["#18293b", "#2d4a63"] : ["#4a7fa8", "#a8c8dd"];
          if (code >= 45 && code <= 48) return night ? ["#242c33", "#3d4a55"] : ["#8a97a3", "#c4ced6"];
          if (code >= 51 && code <= 67) return night ? ["#1a2f45", "#2b5472"] : ["#3a6d99", "#7fb3d5"];
          if (code >= 71 && code <= 77) return night ? ["#25303f", "#41556e"] : ["#6a8bab", "#c9dbe9"];
          if (code >= 80 && code <= 82) return night ? ["#152c40", "#29506e"] : ["#336d99", "#6ea6c9"];
          if (code >= 85) return night ? ["#223040", "#3c526a"] : ["#5d84a6", "#b5cfdf"];
          if (code >= 95) return night ? ["#1a1d33", "#33305e"] : ["#4a4e80", "#8a86b8"];
          return night ? ["#16283a", "#2a4a68"] : ["#2f80c2", "#8ec9e8"];
        }

        function iconFor(code, isDay) {
          return iconForCode(code, isDay, 0); // يعيد اسم الأيقونة عبر الدالة العامة
        }

        function drawWidget(cv, wide) {
          const ctx = cv.getContext("2d");
          const W = cv.width, H = cv.height;
          const wx = state.wx, place = state.place;
          const cur = wx?.current ?? {};
          const code = cloudFixCode(cur.weather_code ?? 0, cur.cloud_cover); /* v70 — C-01: اللوحة والوصف والأيقونة والهلال بقاعدة السحب */
          const isDay = (cur.is_day ?? 1) === 1;
          /* إصدار 29: نوع الودجت المختار من المستخدم (عام/مزارع/سائق) */
          const wtype = (() => { try { return localStorage.getItem("matar:widget:type") || "general"; } catch (e) { return "general"; } })();
          const [c1, c2] = skyPalette(code, isDay);
          const grad = ctx.createLinearGradient(0, 0, W * 0.7, H);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, c2);
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = grad;
          // زوايا مستديرة
          const r = Math.round(Math.min(W, H) * 0.09);
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.arcTo(W, 0, W, H, r);
          ctx.arcTo(W, H, 0, H, r);
          ctx.arcTo(0, H, 0, 0, r);
          ctx.arcTo(0, 0, W, 0, r);
          ctx.closePath();
          ctx.fill();

          const ar = isAr();
          ctx.textAlign = ar ? "right" : "left";
          const x = wide ? W * 0.09 : W / 2;
          const anchor = wide ? (ar ? "right" : "left") : "center";

          // اسم الموقع + التوصيف
          ctx.fillStyle = "rgba(255,250,240,0.86)";
          ctx.font = `700 ${Math.round(H * (wide ? 0.075 : 0.062))}px ${FONT}`;
          ctx.textBaseline = "top";
          const placeName = (place?.name ?? "—").slice(0, 26);
          if (wide) {
            ctx.fillText(placeName, ar ? W - x : x, H * 0.1);
            ctx.fillStyle = "rgba(255,250,240,0.7)";
            ctx.font = `600 ${Math.round(H * 0.055)}px ${FONT}`;
            ctx.fillText(wmoDesc(code), ar ? W - x : x, H * 0.1 + H * 0.085);
          } else {
            ctx.fillText(placeName, W / 2, H * 0.08);
          }

          // درجة الحرارة الكبيرة
          ctx.fillStyle = "#fffaf0";
          ctx.font = `600 ${Math.round(H * (wide ? 0.42 : 0.34))}px ${FONT}`;
          ctx.textBaseline = wide ? "middle" : "top";
          if (wide) {
            ctx.fillText(tempText(cur.temperature_2m), ar ? W - x : x, H * 0.56);
          } else {
            ctx.textAlign = "center";
            ctx.fillText(tempText(cur.temperature_2m), W / 2, H * 0.22);
          }

          // تفاصيل سفلية
          ctx.font = `700 ${Math.round(H * 0.062)}px ${FONT}`;
          ctx.fillStyle = "rgba(255,250,240,0.92)";
          const kNow = hourIndexAtPlace(wx);
          const wind = wx?.hourly?.wind_speed_10m?.[kNow] ?? cur.wind_speed_10m ?? 0;
          const rh = cur.relative_humidity_2m ?? 0;
          /* إصدار 29: محتوى الودجت حسب النوع — مزارع (تربة/تبخر) أو سائق (رؤية/هبّات) أو عام */
          let lines = [];
          if (wtype === "farmer") {
            const soil = wx?.hourly?.soil_moisture_0_to_1cm?.[kNow];
            const soilPct = soil != null ? Math.round(soil * 100) : null;
            const et0 = wx?.daily?.et0_fao_evapotranspiration?.[0] ?? wx?.hourly?.evapotranspiration?.[kNow] ?? null;
            const soilTxt = soilPct == null ? "—" : soilPct >= 55 ? tx("رطوبة جيدة", "moist") : soilPct >= 35 ? tx("رطوبة متوسطة", "moderate") : tx("جاف — احتياج ري", "dry");
            lines = [
              `${tx("🌾 رطوبة التربة", "🌾 Soil")}: ${soilPct != null ? localNum(soilPct) + "٪" : "—"} (${soilTxt})`,
              `${tx("💧 التبخر", "💧 Evapo.")}: ${et0 != null ? localNum(et0, 1) + tx(" ملم/يوم", " mm/day") : "—"}`,
            ];
          } else if (wtype === "driver") {
            const vis = wx?.hourly?.visibility?.[kNow];
            const gust = wx?.hourly?.wind_gusts_10m?.[kNow] ?? cur.wind_gusts_10m ?? 0;
            const fogNow = (vis != null && vis < 1000) || code === 45 || code === 48;
            lines = [
              `${tx("👁 الرؤية", "👁 Visibility")}: ${vis != null ? localNum(Math.round(vis / 100) / 10, 1) + tx(" كم", " km") : "—"}`,
              fogNow ? tx("⚠️ ضباب/شبورة على الطريق", "⚠️ Fog on the road") : `${tx("💨 هبّات", "💨 Gusts")}: ${localNum(gust)} ${tx("كم/س", "km/h")}`,
            ];
          } else {
            lines = [
              `${wmoDesc(code)}`,
              `${tx("رياح", "Wind")} ${localNum(wind)} ${tx("كم/س", "km/h")} · ${tx("رطوبة", "Humidity")} ${localNum(rh)}٪`,
            ];
          }
          /* إصدار 29: الودجت الديناميكي حسب الوقت — ليلاً يضاف طقس الصباح القادم (07:00) */
          if ((cur.is_day ?? 1) === 0) {
            let morningIdx = -1;
            try {
              const times = wx?.hourly?.time ?? [];
              const d = new Date(Date.now() + 24 * 3600e3);
              const target = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T07:00`;
              for (let i = 0; i < times.length; i += 1) if (times[i] >= target) { morningIdx = i; break; }
            } catch (e) {}
            if (morningIdx >= 0) {
              const mt = wx?.hourly?.temperature_2m?.[morningIdx];
              const mc = wx?.hourly?.weather_code?.[morningIdx] ?? 0;
              if (mt != null) lines.splice(wtype === "general" ? 1 : 0, 0, `${tx("🌤 صباح الغد", "🌤 Tomorrow AM")}: ${tempText(mt)} · ${wmoDesc(mc, wx?.hourly?.cloud_cover?.[morningIdx])}`); /* v70 — C-01 */
            }
          }
          if (wide) lines = lines.slice(0, 2);
          lines.push(`مَطَر برو · ${clockText(new Date())}`);
          ctx.textBaseline = "bottom";
          ctx.textAlign = wide ? (ar ? "right" : "left") : "center";
          if (wide) {
            const bx = ar ? W - x : x;
            lines.forEach((t, i) => {
              ctx.fillStyle = i === 0 ? "rgba(255,250,240,0.95)" : "rgba(255,250,240,0.72)";
              ctx.font = `700 ${Math.round(H * (i === 0 ? 0.085 : 0.07))}px ${FONT}`;
              ctx.fillText(t, bx, H - H * 0.07 - (lines.length - 1 - i) * H * 0.1);
            });
          } else {
            lines.forEach((t, i) => {
              ctx.fillStyle = i === 0 ? "rgba(255,250,240,0.95)" : "rgba(255,250,240,0.72)";
              ctx.font = `700 ${Math.round(H * (i === 0 ? 0.07 : 0.058))}px ${FONT}`;
              ctx.fillText(t, W / 2, H - H * 0.06 - (lines.length - 1 - i) * H * 0.085);
            });
          }

          /* إصدار 29: ودجت ليلي — هلال متوهج حين يكون الجو صافيًا ليلاً */
          if ((cur.is_day ?? 1) === 0 && code <= 1) {
            try {
              const mx = wide ? (ar ? W * 0.14 : W * 0.86) : W * 0.87;
              const my = H * 0.14, mr = Math.round(Math.min(W, H) * 0.07);
              ctx.save();
              ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255,244,214,0.94)";
              ctx.shadowColor = "rgba(255,240,190,0.9)"; ctx.shadowBlur = mr * 0.9;
              ctx.fill(); ctx.shadowBlur = 0;
              ctx.beginPath(); ctx.arc(mx - mr * 0.42, my - mr * 0.18, mr * 0.84, 0, Math.PI * 2);
              ctx.fillStyle = c1; ctx.fill();
              ctx.restore();
            } catch (e) { /* الهلال زينة — نتجاهل أي فشل */ }
          }

          // أيقونة الطقس (SVG داخلي → صورة) — iconSvg يضبط width/height بنفسه فلا نكرّرهما
          try {
            const iconSize = Math.round(Math.min(W, H) * (wide ? 0.34 : 0.26));
            const svg = iconSvg(iconForCode(code, isDay ? 1 : 0), iconSize);
            const img = new Image();
            const ix = wide ? (ar ? x - iconSize - W * 0.05 : x) : (W - iconSize) / 2;
            const iy = wide ? H * 0.18 : H * 0.55;
            img.onload = () => ctx.drawImage(img, ix, iy);
            img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          } catch (e) { /* الأيقونة زينة — نتجاهل أي فشل */ }
        }

        function draw() {
          if (sq) drawWidget(sq, false);
          if (wd) drawWidget(wd, true);
        }

        function download(cv, name) {
          if (!cv) return;
          try {
            cv.toBlob((blob) => {
              if (!blob) return;
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = name;
              document.body.append(a);
              a.click();
              setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
            }, "image/png");
          } catch (e) {}
        }

        $("#widget-dl-square")?.addEventListener("click", () => download(sq, "matar-widget-square.png"));
        $("#widget-dl-wide")?.addEventListener("click", () => download(wd, "matar-widget-wide.png"));
        document.addEventListener("matar:data", () => setTimeout(draw, 80));
        document.addEventListener("matar:unit", () => setTimeout(draw, 80));
        document.addEventListener("matar:language", () => setTimeout(draw, 120));

        /* ═══════════════ إصدار 27 — التحديث التلقائي للودجت في الخلفية ═══════════════
           Periodic Background Sync (كروم/أندرويد على PWA مثبتة): يوقظ السيرفس وركر
           كل ~3 ساعات فيولّد صورة الودجت من أحدث قراءة طقس ويخزنها في كاش مخصص،
           فيجد المستخدم الصورة محدثة عند أي فتح دون تدخل يدوي.
           المتصفحات بلا الميزة: تعرض حالة توضح أن التحديث يحدث عند فتح التطبيق. */
        const WIDGET_TS_KEY = "matar:widget:ts";
        const syncBtn = $("#widget-sync-enable");
        const syncStatus = $("#widget-sync-status");

        function agoTextWidget(ts) {
          if (!ts) return "";
          try {
            const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
            const rtf = new Intl.RelativeTimeFormat(activeLocale(), { numeric: "auto" });
            if (mins < 60) return rtf.format(-mins, "minute");
            const hours = Math.round(mins / 60);
            if (hours < 36) return rtf.format(-hours, "hour");
            return rtf.format(-Math.round(hours / 24), "day");
          } catch (e) { return ""; }
        }

        async function widgetSyncStatusText() {
          if (!syncStatus) return;
          /* أولوية لطابع الزمن من كاش الودجت (يكتبه السيرفس وركر في الخلفية) */
          let ts = 0;
          try {
            const hit = await caches?.open("matar:widget").then((c) => c.match("/__matar_widget_meta"));
            if (hit) ts = (await hit.json())?.ts ?? 0;
          } catch (e) {}
          if (!ts) { try { ts = Number(localStorage.getItem(WIDGET_TS_KEY)) || 0; } catch (e) {} }
          const enabled = (() => { try { return localStorage.getItem("matar:widget:autosync") === "1"; } catch (e) { return false; } })();
          if (!enabled && !ts) { syncStatus.textContent = tr("الوضع اليدوي: تُولّد الصورة عند فتح التطبيق. شغّل التحديث التلقائي ليعمل ذلك في الخلفية كل 3 ساعات (كروم/أندرويد بعد تثبيت التطبيق)."); return; }
          const tsTxt = ts ? tf("آخر توليد تلقائي {v}", { v: agoTextWidget(ts) }) : tr("لم يُولَّد تلقائيًا بعد — يحدث ذلك أول مرة بعد إغلاق التطبيق قليلًا");
          syncStatus.textContent = enabled
            ? tf("التحديث التلقائي مفعّل (كل 3 ساعات) — {v}.", { v: tsTxt })
            : tsTxt;
        }

        async function enableWidgetSync() {
          if (syncBtn) syncBtn.disabled = true;
          let ok = false, why = "";
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg && "periodicSync" in reg) {
              const st = await navigator.permissions.query({ name: "periodic-background-sync" });
              if (st.state === "granted") {
                await reg.periodicSync.register("matar-refresh", { minInterval: 3 * 60 * 60 * 1000 });
                ok = true;
              } else why = tr("الميزة معطلة من إعدادات المتصفح لهذا الموقع.");
            } else why = tr("متصفحك لا يدعم المزامنة الدورية في الخلفية — التحديث سيحدث عند فتح التطبيق كالمعتاد.");
          } catch (e) { why = tr("تعذّر تفعيل الميزة الآن — أعد المحاولة بعد تثبيت التطبيق."); }
          try { localStorage.setItem("matar:widget:autosync", ok ? "1" : "0"); } catch (e) {}
          if (syncBtn) syncBtn.hidden = ok;
          if (ok) { Notif.syncStateToSW?.(); } /* يخزّن الموقع الحالي في كاش الحالة ليعمل التوليد دون فتح */
          if (syncStatus && why) syncStatus.textContent = why;
          widgetSyncStatusText();
        }

        syncBtn?.addEventListener("click", enableWidgetSync);
        /* رسالة السيرفس وركر بعد مزامنة الخلفية: نعيد رسم المعاينات ونحدّث الحالة */
        navigator.serviceWorker?.addEventListener("message", (event) => {
          if (event.data?.type === "matar:periodic-refresh") {
            try { localStorage.setItem(WIDGET_TS_KEY, String(event.data.widgetTs ?? Date.now())); } catch (e) {}
            setTimeout(draw, 150);
            widgetSyncStatusText();
          }
        });
        widgetSyncStatusText();
        if ((() => { try { return localStorage.getItem("matar:widget:autosync") === "1"; } catch (e) { return false; } })() && syncBtn) syncBtn.hidden = true;

        return { draw };
      })();

      /* ============================================================
         إصدار 27 — المواقع المفضلة (Favorite Locations)
         احفظ حتى 4 مدن يتردد عليها المستخدم (المنزل، العمل، بلد العائلة…)
         والتنقل بينها بلمسة واحدة من أعلى لوحة القيادة بدل إعادة البحث أو GPS.
         - التخزين محلي على الجهاز (matar:favs) — لا خوادم ولا حسابات
         - الضغط على الشريحة ينتقل للموقع عبر selectPlace نفسها
           فيتحدّث كل شيء (اللوحة، الخريطة، المزارعون، جوّك…)
         - زر «＋» يحفظ الموقع الحالي، وعلامة ✕ داخل الشريحة تحذفه
         ============================================================ */
      const Favs = (() => {
        const LS_KEY = "matar:favs";
        const MAX = 4;
        const el = { bar: $("#fav-bar"), chips: $("#fav-chips") };

        function read() {
          try {
            const arr = JSON.parse(localStorage.getItem(LS_KEY)) || [];
            return Array.isArray(arr) ? arr.filter((p) => p && typeof p.latitude === "number" && typeof p.longitude === "number").slice(0, MAX) : [];
          } catch (e) { return []; }
        }
        function write(list) { try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {} }

        function samePlace(a, b) {
          if (!a || !b) return false;
          return Math.abs((a.latitude ?? 999) - (b.latitude ?? 998)) < 0.02
            && Math.abs((a.longitude ?? 999) - (b.longitude ?? 998)) < 0.02;
        }

        function render() {
          if (!el.bar || !el.chips) return;
          const list = read();
          const cur = state.place;
          const isCurrentSaved = list.some((p) => samePlace(p, cur));
          el.bar.hidden = false; /* يظهر دائمًا: إن لم تكن هناك مفضلة يظهر زر الإضافة وحده */
          const parts = [];
          list.forEach((p, i) => {
            const active = samePlace(p, cur);
            parts.push(`
              <span class="fav-chip${active ? " is-active" : ""}">
                <button type="button" class="fav-go" data-fav="${i}" aria-pressed="${active}" title="${escapeHtml(tf("انتقل إلى {v}", { v: p.name }))}">
                  ${iconSvg("pin", 13)} <span class="fav-name">${escapeHtml(p.name)}</span>
                </button>
                <button type="button" class="fav-del" data-del="${i}" title="${escapeHtml(tr("حذف من المفضلة"))}" aria-label="${escapeHtml(tf("حذف {v} من المفضلة", { v: p.name }))}">${iconSvg("x", 11)}</button>
              </span>`);
          });
          if (list.length < MAX) {
            parts.push(`
              <button type="button" class="fav-add" id="fav-add" ${cur && !isCurrentSaved ? "" : "disabled"} title="${escapeHtml(tr("احفظ الموقع الحالي في المفضلة"))}">
                ${iconSvg("star", 13)} <span>${escapeHtml(cur && !isCurrentSaved ? tr("احفظ الموقع الحالي") : tr("محفوظ بالفعل"))}</span>
              </button>`);
          }
          el.chips.innerHTML = parts.join("");
        }

        function wire() {
          if (!el.chips || el.chips.dataset.wired) return;
          el.chips.dataset.wired = "1";
          el.chips.addEventListener("click", (e) => {
            const go = e.target.closest("button[data-fav]");
            if (go) {
              const p = read()[Number(go.dataset.fav)];
              if (p) { selectPlace({ ...p }); render(); }
              return;
            }
            const del = e.target.closest("button[data-del]");
            if (del) {
              const list = read();
              list.splice(Number(del.dataset.del), 1);
              write(list);
              render();
              return;
            }
            if (e.target.closest("#fav-add") && state.place) {
              const list = read();
              if (list.length >= MAX || list.some((p) => samePlace(p, state.place))) return;
              list.push({
                name: state.place.name ?? "—",
                admin1: state.place.admin1 ?? "",
                country: state.place.country ?? "",
                latitude: state.place.latitude,
                longitude: state.place.longitude,
                timezone: state.place.timezone,
              });
              write(list);
              render();
            }
          });
        }

        document.addEventListener("matar:language", render);
        document.addEventListener("matar:favs", render); /* v55: تحديث الشريحة فور الحفظ من الخريطة */
        document.addEventListener("matar:data", () => { render(); wire(); });
        /* الإقلاع: رسم فوري + ربط الأحداث */
        render();
        wire();
        return { render };
      })();

      /* ============================================================
         المرحلة 12 — صفحة التوقعات الشهرية (Monthly)
         1) المصدر الأساسي: Open-Meteo Seasonal API (ECMWF SEAS5) بمتوسط
            التجميع لـ 7 أشهر قادمة مع تحديد صريح لـ start_date/end_date
            (هذا كان سبب فشل النسخ السابقة: الطلب بلا تواريخ صريحة).
         2) خط الأساس المناخي: ERA5 Archive لعشر سنوات (2016–2025)
            يُجمَّع لكل شهر تقويمي لإنتاج المعتاد المقارَن عليه.
         3) إن فشل SEAS5: تجميع شهري من توقعات الـ 16 يومًا الموجودة
            أصلًا في state.wx — فلا تُعرض صفحة فارغة أو خطأ مطلقًا.
         ============================================================ */
      const Monthly = (() => {
        const el = {
          loading: $("#monthly-loading"), error: $("#monthly-error"), errorMsg: $("#monthly-error-msg"),
          content: $("#monthly-content"), grid: $("#monthly-grid"), note: $("#monthly-src-note"),
          badge: $("#monthly-source-badge"), reading: $("#monthly-reading"),
          seasonal: $("#seasonal-advisor"), // الميزة الجديدة: المستشار الذكي الموسمي
          locChip: $("#monthly-loc-chip"), retry: $("#monthly-retry"),
          /* إصدار 15: الفلتر المنزلق + لوحتا العرض + عقد الشهر القادم
             إصدار 19: التبويب الثالث — آلة الزمن المناخي */
          seg: $("#monthly-seg"), segThumb: $("#monthly-seg-thumb"),
          segSeasonal: $("#seg-seasonal"), segNext: $("#seg-next"), segTime: $("#seg-time"),
          paneSeasonal: $("#monthly-seasonal-pane"), paneNext: $("#monthly-next-pane"), paneTime: $("#monthly-time-pane"),
          tmLoading: $("#tm-loading"), tmError: $("#tm-error"), tmErrorMsg: $("#tm-error-msg"),
          tmContent: $("#tm-content"), tmRetry: $("#tm-retry"),
          nmTitle: $("#nm-title"), nmBadge: $("#nm-badge"), nmStats: $("#nm-stats"),
          nmWeekdays: $("#nm-weekdays"), nmCalendar: $("#nm-calendar"), nmNote: $("#nm-note"),
          /* إصدار 39: شريط التبديل الزجاجي بين الشهر الحالي (المتبقي) والقادم (الكامل) */
          nmToggleCur: $("#nm-toggle-cur"), nmToggleNext: $("#nm-toggle-next"),
        };
        const cache = new Map(); // مفتاح "lat,lon" → بيانات معدة للعرض
        let lastSeasonal = null;   // إضافة 14: آخر بيانات موسمية لإعادة الرسم وتغذية المحرك المحلي
        let seasonalAIWired = false; // إضافة 14: توصيل شريط المحرك المحلي مرة واحدة
        let loading = false;
        /* إصدار 15: مناخ العقد الأخير للتقديرات اليومية + تفضيل الفلتر */
        let lastClim = null;
        const SEG_KEY = "matar:monthly:seg";
        /* ═════════ إصدار 39: الفلتر الديناميكي الذكي لقسم التوقعات الشهرية ═════════
           وضع العرض: "current" = الأيام المتبقية من الشهر التقويمي الحالي،
           "next" = المصفوفة الممتدة الكاملة (30 يومًا) المستمدة من نموذج SEAS5.
           يُحفظ الاختيار على الجهاز ويُستعاد في الزيارة التالية. */
        const NM_MODE_KEY = "matar:monthly:nmMode";
        let nmMode = (() => { try { return localStorage.getItem(NM_MODE_KEY) === "current" ? "current" : "next"; } catch (e) { return "next"; } })();
        let nmToggleWired = false;
        let nmCache = null; /* آخر بيانات مُعدّة للشهر القادم كي يعيد المبدّل الرسم لحظيًا دون جلب جديد */
        let currentSeg = "seasonal";
        try {
          const savedSeg = localStorage.getItem(SEG_KEY);
          currentSeg = savedSeg === "next" || savedSeg === "time" ? savedSeg : "seasonal";
        } catch (e) {}

        function setLoading() {
          el.loading.classList.remove("hidden");
          el.error.classList.add("hidden");
          el.content.classList.add("hidden");
        }
        function showError(msg) {
          el.loading.classList.add("hidden");
          el.content.classList.add("hidden");
          el.error.classList.remove("hidden");
          if (el.errorMsg) el.errorMsg.textContent = msg;
        }
        function showContent() {
          el.loading.classList.add("hidden");
          el.error.classList.add("hidden");
          el.content.classList.remove("hidden");
        }

        function isoDay(d) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }

        /* جلب خط أساس ERA5 لعشر سنوات — بإرجاع مناخين:
           (1) monthly: حرارة الشهر المتوسطة + مجموع مطر الشهر المعتاد (متوسط مجاميع السنوات)
           (2) doy: مناخ يوم-باليوم "MM-DD" لإنتاج معتاد عادل للشهر الجزئي الأول.
           الإصلاح الحرج: النسخة السابقة كانت تقسم مجموع المطر على عدد الأيام فتُنتج mm/day
           وتقارَن ضد مجموع شهري mm — وهذا ما ولّد نسبًا فلكية مثل +٤٧٥٥٪ */
        async function fetchClimatology(place) {
          const now = new Date();
          const end = new Date(now.getFullYear() - 1, 11, 31); // نهاية العام الماضي
          const start = new Date(end.getFullYear() - 9, 0, 1);
          const url = new URL("https://archive-api.open-meteo.com/v1/archive");
          url.search = new URLSearchParams({
            latitude: place.latitude.toFixed(4), longitude: place.longitude.toFixed(4),
            start_date: isoDay(start), end_date: isoDay(end),
            /* إصدار 15: أُضيف العظمى والصغرى لبناء عُرف يومي (أعلى/أدنى) لتقويم الشهر القادم */
            daily: "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum",
            timezone: "auto",
          });
          const data = await getJson(url);
          const t = data.daily?.temperature_2m_mean ?? [];
          const tx = data.daily?.temperature_2m_max ?? [];
          const tn = data.daily?.temperature_2m_min ?? [];
          const p = data.daily?.precipitation_sum ?? [];
          const time = data.daily?.time ?? [];
          const byMonth = {}; // "M" → { temps: [], precTotals: {ym: مجموع مطر السنة} }
          const byDoy = {};   // "MM-DD" → { temps: [], precs: [] }
          time.forEach((iso, i) => {
            const m = Number(iso.slice(5, 7));
            const ym = iso.slice(0, 7);
            const dk = iso.slice(5);
            byMonth[m] = byMonth[m] || { temps: [], tmax: [], tmin: [], precTotals: {} };
            byDoy[dk] = byDoy[dk] || { temps: [], tmax: [], tmin: [], precs: [] };
            if (t[i] != null) { byMonth[m].temps.push(t[i]); byDoy[dk].temps.push(t[i]); }
            if (tx[i] != null) { byMonth[m].tmax.push(tx[i]); byDoy[dk].tmax.push(tx[i]); }
            if (tn[i] != null) { byMonth[m].tmin.push(tn[i]); byDoy[dk].tmin.push(tn[i]); }
            if (p[i] != null) {
              byDoy[dk].precs.push(p[i]);
              byMonth[m].precTotals[ym] = (byMonth[m].precTotals[ym] || 0) + p[i];
            }
          });
          const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
          const monthly = {};
          Object.entries(byMonth).forEach(([m, v]) => {
            monthly[m] = {
              temp: mean(v.temps),
              // المعتاد الشهري للمطر = متوسط المجاميع السنوية (مم/شهر) — لا مم/يوم
              precip: mean(Object.values(v.precTotals)),
              tmax: mean(v.tmax),
              tmin: mean(v.tmin),
            };
          });
          const doy = {};
          Object.entries(byDoy).forEach(([dk, v]) => {
            doy[dk] = { temp: mean(v.temps), prec: mean(v.precs), tmax: mean(v.tmax), tmin: mean(v.tmin) };
          });
          return { monthly, doy };
        }

        /* كاش خط الأساس المناخي (طلب ثقيل لعشر سنوات) — يُجلب مرة لكل موقع للجلسة */
        const climCache = new Map();
        async function fetchClimatologyCached(place, key) {
          if (climCache.has(key)) return climCache.get(key);
          const clim = await fetchClimatology(place);
          climCache.set(key, clim);
          return clim;
        }

        /* جلب نموذج SEAS5 لـ 7 أشهر قادمة — ببداية ونهاية صريحتين (المفتاح الذي كان ناقصًا).
           الحقيقة المكتشفة بالفحص الحي: الـ endpoint يستخدم daily= (لا variable=) ويعيد
           سلسلة يومية (متوسط التجميع ensemble mean) — نجمّعها شهريًا في aggregateSeasonal() */
        async function fetchSeasonal(place) {
          const start = new Date();
          const end = new Date(start.getFullYear(), start.getMonth() + 7, 0); // آخر يوم بعد 7 أشهر
          const url = new URL("https://seasonal-api.open-meteo.com/v1/seasonal");
          url.searchParams.set("latitude", place.latitude.toFixed(4));
          url.searchParams.set("longitude", place.longitude.toFixed(4));
          url.searchParams.append("daily", "temperature_2m_mean");
          url.searchParams.append("daily", "precipitation_sum");
          url.searchParams.set("start_date", isoDay(start));
          url.searchParams.set("end_date", isoDay(end));
          url.searchParams.set("timezone", "auto"); // محاذاة أيام محلية مع مناخ ERA5 (نفس timezone=auto)
          const data = await getJson(url);
          const time = data.daily?.time ?? [];
          const temps = data.daily?.temperature_2m_mean ?? [];
          const precs = data.daily?.precipitation_sum ?? [];
          if (!time.length || !temps.length) throw new Error("لا بيانات موسمية");
          return { time, temps, precs };
        }

        /* تجميع السلسلة اليومية لـ SEAS5 في صناديق شهرية: متوسط الحرارة + مجموع المطر لكل شهر */
        function aggregateSeasonal(time, temps, precs) {
          const byMonth = {};
          time.forEach((iso, i) => {
            const key = iso.slice(0, 7);
            byMonth[key] = byMonth[key] || { temps: [], prec: 0 };
            if (temps[i] != null) byMonth[key].temps.push(temps[i]);
            if (precs?.[i] != null) byMonth[key].prec += precs[i];
          });
          return Object.keys(byMonth).sort().map((key) => ({
            key,
            temp: byMonth[key].temps.length ? byMonth[key].temps.reduce((a, b) => a + b, 0) / byMonth[key].temps.length : null,
            precip: byMonth[key].prec,
          }));
        }

        /* الخطط الاحتياطية: تجميع شهري من الـ 16 يومًا المتوفرة في حالة عامة */
        function fromDailyForecast() {
          const d = state.wx?.daily;
          if (!d?.time?.length) return [];
          const byMonth = {};
          d.time.forEach((iso, i) => {
            const key = iso.slice(0, 7);
            byMonth[key] = byMonth[key] || { temps: [], prec: [], days: 0 };
            // المتوسط قد يغيب في الكاش القديم أو بيانات العرض التجريبي — نشتقه من (الأقصى+الأدنى)/2
            let tv = d.temperature_2m_mean?.[i];
            if (tv == null) {
              const mx = d.temperature_2m_max?.[i], mn = d.temperature_2m_min?.[i];
              if (mx != null && mn != null) tv = (mx + mn) / 2;
            }
            if (tv != null) byMonth[key].temps.push(tv);
            if (d.precipitation_sum?.[i] != null) byMonth[key].prec.push(d.precipitation_sum[i]);
            byMonth[key].days += 1;
          });
          return Object.entries(byMonth).map(([key, v]) => ({
            key,
            temp: v.temps.length ? v.temps.reduce((a, b) => a + b, 0) / v.temps.length : null,
            precip: v.prec.reduce((a, b) => a + b, 0),
            climTemp: null, climPrec: null,
            covered: v.days,
            source: "daily16",
          }));
        }

        function monthLabel(key) {
          try {
            return placeDateFormatter({ month: "long", year: "numeric" }).format(new Date(`${key}-15T12:00:00Z`));
          } catch (e) { return key; }
        }

        function anomalyTemp(t, clim) {
          if (t == null || clim == null) return null;
          return t - clim;
        }
        function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

        /* المعتاد العادل لكل صندوق شهري: الشهر الكامل ← مناخ شهري، الجزئي ← مناخ أيامه نفسها
           (الأيام المتغطية هي أواخر الشهر، فنبني المعتاد من MM-DD الخاصة بها) */
        function climFor(clim, key, monthNum, full, cov) {
          if (!clim) return null;
          const m = clim.monthly?.[String(monthNum)];
          if (cov >= full || !clim.doy) return m ? { temp: m.temp, precip: m.precip } : null;
          const mStr = key.slice(5, 7);
          const startDay = full - cov + 1;
          const days = [];
          for (let day = startDay; day <= full; day++) {
            const dd = clim.doy[`${mStr}-${String(day).padStart(2, "0")}`];
            if (dd) days.push(dd);
          }
          if (!days.length) return m ? { temp: m.temp, precip: m.precip } : null;
          const temps = days.map((x) => x.temp).filter((v) => v != null);
          return {
            temp: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : (m?.temp ?? null),
            precip: days.reduce((a, b) => a + (b.precip || 0), 0),
          };
        }

        /* انحياز SEAS5 الثابت (معروف ببرودته مقابل ERA5): نقيسه بأول 6 أيام مشتركة
           مع النموذج قصير المدى عالي الدقة ثم نطرحه من كل الأشهر */
        function computeSeasBias(seasonal, wx) {
          try {
            const d = wx?.daily;
            if (!d?.time?.length || !d.temperature_2m_mean?.length) return 0;
            const map = new Map(seasonal.time.map((iso, i) => [iso, seasonal.temps[i]]));
            const diffs = [];
            d.time.slice(0, 6).forEach((iso, i) => {
              const s = map.get(iso);
              const h = d.temperature_2m_mean?.[i];
              if (s != null && h != null) diffs.push(s - h);
            });
            if (diffs.length < 3) return 0;
            const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            return Math.abs(mean) < 3 ? mean : 0; // صمام أمان أمام فروق غير منطقية
          } catch (e) { return 0; }
        }

        /* قراءة انحراف المطر: للمناخ الجاف (معتاد < 2 مم/شهر) النسبة المئوية تضخّم ضوضاء
           النموذج فنعرض فرقًا مطلقًا بالملليمتر بدل نسب فلكية مثل +٤٧٥٥٪ */
        function precipAnomalyInfo(p, clim) {
          if (p == null || clim == null || !Number.isFinite(clim)) return null;
          const diff = p - clim;
          if (clim < 2) {
            if (diff > 2) return { pct: null, diff, wet: true };
            if (diff < -2) return { pct: null, diff, wet: false };
            return { pct: null, diff, near: true };
          }
          return { pct: Math.max(-150, Math.min(150, (diff / clim) * 100)), diff };
        }

        /* الميزة الجديدة — المستشار الذكي الموسمي (Seasonal Smart Advisor):
           يقارن انحرافات نموذج SEAS5 (الحرارة والأمطار) مباشرة مع المناخ العام
           للعقد الماضي (ERA5 2016–2025) لتفسير نسب الجفاف والتحولات المناخية
           الطويلة بأسلوب بشري عملي يخدم المزارع ومخطط الموارد. */
        function renderSeasonalAdvisor(data, sourceLabel) {
          if (!el.seasonal) return;
          lastSeasonal = { data, label: sourceLabel }; // إضافة 14: حفظ لإعادة الرسم وللمحرك المحلي
          const ar = isAr();
          const valid = data.filter((m) => m.climTemp != null && m.temp != null);
          if (!valid.length || sourceLabel !== "SEAS5") {
            el.seasonal.innerHTML = `<div class="adv-card" data-kind="spray"><span class="adv-title">${iconSvg("ok", 14)} ${escapeHtml(tx("المستشار الموسمي بانتظار بيانات SEAS5", "Seasonal advisor awaiting SEAS5 data"))}</span><p class="adv-msg">${escapeHtml(tx("يُعرض هنا تحليل الانحرافات عن مناخ العقد تلقائيًا بمجرد توفّر نموذج SEAS5 لهذا الموقع — حاليًا نعرض تجميعًا شهريًا من النموذج قصير المدى فقط.", "The decade-anomaly breakdown appears here once SEAS5 covers this location — for now we show short-range monthly aggregation only."))}</p></div>`;
            return;
          }
          const anomalies = valid.map((m) => ({ m, a: anomalyTemp(m.temp, m.climTemp) })).filter((x) => x.a != null);
          const avgA = anomalies.reduce((s, x) => s + x.a, 0) / anomalies.length;
          const hottest = anomalies.reduce((a, b) => (b.a > a.a ? b : a));
          const coolest = anomalies.reduce((a, b) => (b.a < a.a ? b : a));
          const rainValid = valid.filter((m) => m.climPrec != null && Number.isFinite(m.climPrec));
          const sumP = rainValid.reduce((s2, m) => s2 + (m.precip ?? 0), 0);
          const sumC = rainValid.reduce((s2, m) => s2 + m.climPrec, 0);
          const rainPct = sumC >= 2 ? ((sumP - sumC) / sumC) * 100 : null;
          const rainDiff = sumP - sumC;
          const cards = [];

          /* ① التوجه الحراري العام للفترة */
          if (Math.abs(avgA) >= 0.4) {
            const warm = avgA > 0;
            cards.push({
              kind: warm ? "heat" : "frost", sev: Math.abs(avgA) >= 1.5 ? "high" : "med", icon: warm ? "fire" : "frost",
              title: warm ? tx("توجه حراري صاعد عبر الفصول", "Seasonal warming trend") : tx("توجه حراري هابط عبر الفصول", "Seasonal cooling trend"),
              msg: warm
                ? tf("متوسط الانحراف الحراري عبر الأشهر المعروضة +{a}° عن مناخ العقد (2016–2025)، وأبرزها {m} (+{b}°). عمليًا: فترات تبريد أطول واحتياج أكبر لمياه الري، وتأخر متوقع لمواعيد الصقيع الشتوي — راجع مواعيد الزراعة المبكرة واختر أصنافًا متحملة للحرارة.", { a: localNum(avgA, 1), m: escapeHtml(monthLabel(hottest.m.key)), b: localNum(hottest.a, 1) })
                : tf("متوسط الانحراف الحراري {a}° عن مناخ العقد، وأبرزها {m} ({b}°). عمليًا: برد واضح قد يرفع خطر الصقيع المتأخر على الأشجار المزهرة — أجّل الزراعة الحساسة قليلًا وجهّز وسائل الحماية من الصقيع.", { a: localNum(avgA, 1), m: escapeHtml(monthLabel(coolest.m.key)), b: localNum(coolest.a, 1) }),
              when: tr("مقارنة بعقد كامل"),
            });
          }

          /* ② ميزان الأمطار ونسبة الجفاف */
          if (rainValid.length && rainPct != null) {
            const dry = rainPct <= -20, wet = rainPct >= 20;
            const cat = dry ? (rainPct <= -40 ? "high" : "med") : wet ? "low" : "low";
            cards.push({
              kind: dry ? "spray" : "irrigation", sev: dry ? cat : wet ? "low" : "low", icon: dry ? "water" : "rain",
              title: dry ? tf("موسم أكثر جفافًا بنسبة {n}٪", { n: localNum(Math.abs(rainPct), 0) }) : wet ? tf("موسم أكثر رطوبة بنسبة +{n}٪", { n: localNum(rainPct, 0) }) : tx("أمطار قريبة من المعتاد", "Rainfall near normal"),
              msg: dry
                ? tf("مجموع الأمطار المتوقع {p} مم مقابل معتاد {c} مم للفترة نفسها — عجز ~{d} مم ({n}٪). هذا نمط جفاف واضح مقارنة بالعقد الماضي: خطط لموارد ري إضافية مبكرًا، اعتمد تغطية التربة (Mulch) لتقليل التبخر، وضاعف كفاءة الري بالتنقيط، وراجع تقويم زراعة المحاصيل الأقل احتياجًا للماء.", { p: localNum(sumP, 1), c: localNum(sumC, 1), d: localNum(Math.abs(rainDiff), 1), n: localNum(Math.abs(rainPct), 0) })
                : wet
                  ? tf("مجموع الأمطار المتوقع {p} مم مقابل معتاد {c} مم — فائض ~{d} مم (+{n}٪). فرصة لتعبئة الخزانات والآبار وتأجيل بعض جولات الري، لكن راجع تصريف الحقول لتفادي الغرقان وامنع ركود المياه.", { p: localNum(sumP, 1), c: localNum(sumC, 1), d: localNum(rainDiff, 1), n: localNum(rainPct, 0) })
                  : tf("مجموع الأمطار {p} مم مقابل معتاد {c} مم — انحراف محدود ({n}٪) عن المعتاد يعني موسمًا مطريًا مستقرًا مقارنة بالعقد الماضي.", { p: localNum(sumP, 1), c: localNum(sumC, 1), n: `${rainPct > 0 ? "+" : ""}${localNum(rainPct, 0)}` }),
              when: tr("مجموع 7 أشهر مقابل عقد"),
            });
          }

          /* ③ الشذوذ الأبرز: شهر استثنائي يستحق التخطيط */
          if (Math.abs(hottest.a) >= 2 || Math.abs(coolest.a) >= 2) {
            const x = Math.abs(hottest.a) >= Math.abs(coolest.a) ? hottest : coolest;
            const isWarm = x.a > 0;
            cards.push({
              kind: isWarm ? "heat" : "frost", sev: "med", icon: isWarm ? "fire" : "frost",
              title: isWarm ? tx("موجة حرارة استثنائية", "Exceptional heat wave") : tx("موجة برودة استثنائية", "Exceptional cold wave"),
              msg: isWarm
                ? tf("{m} متوقع أدفأ من معياره المناخي بـ +{a}° — من الأشهر التي تستحق خطة تشغيل خاصة: تظليل، ريّ ليلية، وفحص مضخات التبريد قبل حلوله.", { m: escapeHtml(monthLabel(x.m.key)), a: localNum(x.a, 1) })
                : tf("{m} متوقع أبرد من معياره بـ {a}° — راقب نافذة أول صقيع لهذا الشهر تحديدًا إن كانت بساتينك في مرحلة الإزهار، وجهّز المدخّنات أو الأغطية مسبقًا.", { m: escapeHtml(monthLabel(x.m.key)), a: localNum(x.a, 1) }),
              when: escapeHtml(monthLabel(x.m.key)),
            });
          }

          if (!cards.length) {
            cards.push({
              kind: "spray", sev: "low", icon: "ok",
              title: tx("لا انحرافات مناخية جادة", "No major climate anomalies"),
              msg: tx("انحرافات الحرارة والأمطار عن مناخ العقد الماضي محدودة في الأشهر المعروضة — الموسم القادم يقترب من المعتاد مناخيًا، فالتخطيط على أساس العُرف المناخي قرار سليم هذه المرة.", "Temperature and rainfall anomalies vs the past decade are limited across the displayed months — the coming season sits near climatology, so planning on the familiar norms is a safe bet this time."),
              when: tr("أشهر قادمة مستقرة"),
            });
          }

          const sevText = { high: tr("عالية"), med: tr("متوسطة"), low: tr("للعلم") };

          /* ═══ إضافة 14 — متنبئ التحول المناخي الشهري ═══
             مقارنة مباشرة لكل شهر من أشهر SEAS5 السبعة مع خط المناخ التاريخي
             (ERA5 2016–2025) المعروض في التطبيق نفسه — سطر صريح بالأرقام لكل شهر:
             «هذا الشهر يتجه ليكون أبرد بـ ٢° (-٢°م) عن المتوسط التاريخي للعقد
             الماضي؛ احذر من مخاطر صقيع مبكرة». */
          const shiftRows = valid.map((m) => {
            const a = anomalyTemp(m.temp, m.climTemp);
            if (a == null) return "";
            const pA = precipAnomalyInfo(m.precip, m.climPrec);
            let tone = "near", tempLine = "";
            if (a <= -2) {
              tone = "cool";
              tempLine = m.climTemp <= 12
                ? tf("يتجه ليكون أبرد بـ {v}° ({t} مقابل {c}°م معتادًا) عن المتوسط التاريخي للعقد الماضي؛ احذر من مخاطر صقيع مبكرة — جهّز أغطية المحاصيل وراقب أول نافذة صقيع فجرًا.", { v: localNum(Math.abs(a), 1), t: tempText(m.temp), c: localNum(m.climTemp, 1) })
                : tf("يتجه ليكون أبرد بـ {v}° ({t} مقابل {c}°م معتادًا) عن المتوسط التاريخي للعقد الماضي — برد ملحوظ يخفف ذروة الحرارة لكن توقيته قد يضرب أشجار المزهر.", { v: localNum(Math.abs(a), 1), t: tempText(m.temp), c: localNum(m.climTemp, 1) });
            } else if (a < -0.8) {
              tone = "cool";
              tempLine = tf("أبرد بدرجة ملحوظة ({v}°) عن معياره ({t} مقابل {c}°م) — ليالٍ ألطف وذروة نهارية أهدأ.", { v: localNum(Math.abs(a), 1), t: tempText(m.temp), c: localNum(m.climTemp, 1) });
            } else if (a < 0.8) {
              tone = "near";
              tempLine = tf("قريب من متوسطه التاريخي ({t} مقابل {c}°م) — لا تحول حراري يُذكر.", { t: tempText(m.temp), c: localNum(m.climTemp, 1) });
            } else if (a < 2) {
              tone = "warm";
              tempLine = tf("أدفأ بدرجة ملحوظة (+{v}°) عن معياره ({t} مقابل {c}°م) — توقع طلب تبريد وري أعلى.", { v: localNum(a, 1), t: tempText(m.temp), c: localNum(m.climTemp, 1) });
            } else {
              tone = "warm";
              tempLine = tf("يتجه ليكون أدفأ بـ +{v}° ({t} مقابل {c}°م معتادًا) عن المتوسط التاريخي للعقد الماضي — خطط لموجات حر مبكرة وريّات ليلية إضافية.", { v: localNum(a, 1), t: tempText(m.temp), c: localNum(m.climTemp, 1) });
            }
            let rainLine = "";
            if (pA) {
              if (pA.pct != null && pA.pct <= -25) {
                if (tone === "near") tone = "dry";
                rainLine = ` ${tf("الأمطار أقل بـ {v}٪ عن عُرف الشهر ({p} مم مقابل {c} مم) — مؤشر جفاف نسبي: شدّد على كفاءة الري وغطِّ التربة.", { v: localNum(Math.abs(pA.pct), 0), p: localNum(m.precip ?? 0, 1), c: localNum(m.climPrec, 1) })}`;
              } else if (pA.pct != null && pA.pct >= 25) {
                rainLine = ` ${tf("الأمطار أعلى بـ +{v}٪ عن عُرف الشهر ({p} مم مقابل {c} مم) — فرصة لتعبئة الخزانات مع متابعة تصريف الحقول.", { v: localNum(pA.pct, 0), p: localNum(m.precip ?? 0, 1), c: localNum(m.climPrec, 1) })}`;
              } else if (pA.wet === false) {
                if (tone === "near") tone = "dry";
                rainLine = ` ${tf("أمطار أقل بوضوح ({p} مم مقابل {c} مم معتادة) — موسم جفاف نسبي لهذا الشهر.", { p: localNum(m.precip ?? 0, 1), c: localNum(m.climPrec, 1) })}`;
              } else if (pA.wet === true) {
                rainLine = ` ${tf("أمطار أعلى بوضوح ({p} مم مقابل {c} مم معتادة) — احذر غرقان الحقول المنخفضة.", { p: localNum(m.precip ?? 0, 1), c: localNum(m.climPrec, 1) })}`;
              }
            }
            return `<li data-tone="${tone}"><b>${escapeHtml(monthLabel(m.key))}:</b> ${tempLine}${rainLine}</li>`;
          }).filter(Boolean).join("");

          /* إضافة 14: شريط المحرك المحلي + خلاصته + متنبئ التحول + البطاقات القاعدية */
          el.seasonal.innerHTML = LocalAI.barHTML("seasonal") + LocalAI.cardHTML("seasonal")
            + `<div class="climate-shift-box"><span class="cs-title">${iconSvg("frost", 13)} ${escapeHtml(tr("متنبئ التحول المناخي الشهري"))} — ${escapeHtml(tr("SEAS5 مقابل خط المناخ التاريخي (ERA5 · 2016–2025)"))}</span><ul class="climate-shift">${shiftRows}</ul></div>`
            + cards.map((a) => `
            <div class="adv-card" data-kind="${a.kind}">
              <span class="adv-title">${iconSvg(a.icon, 14)} ${escapeHtml(a.title)}<span class="adv-sev" data-sev="${a.sev}">${sevText[a.sev]}</span></span>
              <p class="adv-msg">${a.msg}</p>
              <div class="adv-when">⏱ ${a.when}</div>
            </div>`).join("");
          wireSeasonalAI();
        }

        /* إضافة 14: توصيل المحرك المحلي بقسم المستشار الموسمي — يُنفذ مرة واحدة عند أول رسم */
        function wireSeasonalAI() {
          if (seasonalAIWired || !el.seasonal) return;
          seasonalAIWired = true;
          LocalAI.register("seasonal", () => {
            const cur = lastSeasonal;
            if (!cur || cur.label !== "SEAS5") return null;
            const rows = cur.data.filter((m) => m.climTemp != null && m.temp != null).slice(0, 7).map((m) => {
              const a = anomalyTemp(m.temp, m.climTemp);
              const aa = a == null ? "—" : (a >= 0 ? "+" : "") + localNum(a, 1);
              const pc = m.climPrec != null ? localNum(m.climPrec, 1) : "—";
              return `- ${monthLabel(m.key)}: ${localNum(m.temp, 1)}C (norm ${localNum(m.climTemp, 1)}C, delta ${aa}) | rain ${localNum(m.precip ?? 0, 1)} mm (norm ${pc} mm)`;
            }).join("\n");
            if (!rows) return null;
            const ar = isAr();
            const sys = ar
              ? "أنت محلل مناخ في تطبيق مَطَر برو. اكتب تحليلًا عربيًا عمليًا من 4 إلى 6 جمل للتحول المناخي المتوقع، ملتزمًا حصريًا بالأرقام المرسلة بلا اختلاق، بلا مقدمات وبلا ماركداون."
              : "You are the climate analyst of Matar Pro. Write a practical 4-6 sentence climate-shift analysis, strictly from the supplied numbers — invent nothing, no markdown, no preamble.";
            const langFix = currentLanguage === "ar" ? "" : ` Write the final text in ${{ en: "English", fr: "French", de: "German", es: "Spanish", pt: "Portuguese", it: "Italian" }[currentLanguage] || "English"}.`;
            const user = ar
              ? `أشهر SEAS5 السبعة القادمة مقابل خط المناخ التاريخي (2016–2025):\n${rows}\nاكتب: أي الشهور أبرد أو أدفأ وبكم، أين يتركز خطر الصقيع المبكر، أين تظهر مؤشرات الجفاف، وماذا يفعل المزارع وصاحب الموارد المائية عمليًا.`
              : `Next 7 SEAS5 months vs the 2016-2025 climate normals:\n${rows}\nWrite: which months run cooler or warmer and by how much, where early-frost risk concentrates, where drought signals appear, and what farmers and water planners should practically do.`;
            return { system: sys + langFix, user, maxTokens: 190 };
          });
          LocalAI.on(() => { if (lastSeasonal) renderSeasonalAdvisor(lastSeasonal.data, lastSeasonal.label); });
          el.seasonal.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-ai]");
            if (btn) { e.preventDefault(); LocalAI.handleAction("seasonal"); }
          });
        }

        /* ═════════════ إصدار 15 ═════════════
           الفلتر المنزلق: تبويب «الأشهر السبعة» وتبويب «الشهر القادم»
           — إبهام متدرّج يزحف بين الزرين، مع حفظ التفضيل ودعم RTL */
        function moveThumb(btn) {
          if (!el.seg || !el.segThumb || !btn) return;
          const segRect = el.seg.getBoundingClientRect();
          const bRect = btn.getBoundingClientRect();
          const offset = bRect.left - segRect.left;
          el.segThumb.style.width = `${bRect.width}px`;
          /* inset-inline-start هو الطرف المبدئي دائمًا (يمين في RTL، يسار في LTR)
             — نحسب الإزاحة من الطرف المبدئي كي يزلق الإبهام تحت الزر النشط في الاتجاهين */
          el.segThumb.style.insetInlineEnd = "auto";
          if (document.documentElement.dir === "rtl") {
            el.segThumb.style.insetInlineStart = `${Math.max(0, segRect.width - offset - bRect.width)}px`;
          } else {
            el.segThumb.style.insetInlineStart = `${Math.max(0, offset)}px`;
          }
        }

        function applySeg() {
          const seasonal = currentSeg === "seasonal", next = currentSeg === "next", time = currentSeg === "time";
          el.segSeasonal?.setAttribute("aria-selected", seasonal ? "true" : "false");
          el.segNext?.setAttribute("aria-selected", next ? "true" : "false");
          el.segTime?.setAttribute("aria-selected", time ? "true" : "false");
          if (el.paneSeasonal) el.paneSeasonal.hidden = !seasonal;
          if (el.paneNext) el.paneNext.hidden = !next;
          if (el.paneTime) el.paneTime.hidden = !time;
          const btn = seasonal ? el.segSeasonal : next ? el.segNext : el.segTime;
          if (btn) moveThumb(btn);
        }

        function setSeg(value) {
          if (value !== "next" && value !== "seasonal" && value !== "time") return;
          currentSeg = value;
          try { localStorage.setItem(SEG_KEY, value); } catch (e) {}
          applySeg();
          // عند طلب الشهر القادم أول مرة: تأكد أن البيانات جُلبت (الكاش يجعلها فورية إن وُجدت)
          if (value === "next" && !cache.size && state.place && !loading) load();
          // إصدار 19: تبويب آلة الزمن — يجلب سجله التاريخي بنفسه عند أول طلب
          if (value === "time") { try { TimeMachine.ensure(); } catch (e) { console.error("timemachine", e); } }
        }

        function wireSeg() {
          el.segSeasonal?.addEventListener("click", () => setSeg("seasonal"));
          el.segNext?.addEventListener("click", () => setSeg("next"));
          el.segTime?.addEventListener("click", () => setSeg("time"));
          window.addEventListener("resize", () => {
            const btn = currentSeg === "next" ? el.segNext : currentSeg === "time" ? el.segTime : el.segSeasonal;
            moveThumb(btn);
          });
          document.addEventListener("matar:language", () => {
            applySeg();
          });
          applySeg();
        }

        /* ═════════════ إصدار 15 ═════════════
           الشهر القادم يوم بيوم (على طريقة AccuWeather):
           ① الأيام المغطاة بالنموذج قصير المدى (16 يومًا) ← قيم حقيقية.
           ② بقية الأيام ← عُرف ERA5 اليومي (2016–2025) مُزاح بانحراف
              SEAS5 الشهري (حرارة) وبنسبة/فرق مطر الشهر (أمطار).
           ③ ملخص شهري: متوسط مقابل العُرف، مجموع مطر، أيام ممطرة،
              أدفأ وأبرد يوم — مع وسم صادق لكل يوم (حقيقي/تقديري). */
        function nextMonthKey() {
          const n = new Date();
          const d = new Date(n.getFullYear(), n.getMonth() + 1, 1);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        }

        function estWeatherCode(tmax, pr) {
          if (tmax != null && tmax <= 1 && pr >= 0.4) return 71; // ثلج محتمل
          if (pr >= 6) return 63;
          if (pr >= 1.5) return 61;
          if (pr >= 0.3) return 51;
          if (tmax != null && tmax >= 28) return 0;
          if (tmax != null && tmax <= 8) return 3;
          return 2;
        }

        function weekStartIndex() {
          // أول أيام الأسبوع حسب اللغة: السبت للعربية، الأحد للإنجليزية، الاثنين للبقية
          if (isAr()) return 6;
          if (currentLanguage === "en") return 0;
          return 1;
        }

        function weekendSet() {
          return isAr() ? [5, 6] : [0, 6]; // الجمعة والسبت عربيًا، السبت والأحد لغيرها
        }

        function renderNextMonth(data, sourceLabel) {
          if (!el.nmCalendar) return;
          const nk = nextMonthKey();
          const [y, mmNum] = nk.split("-").map(Number);
          const N = daysInMonth(y, mmNum);
          const mEntry = data.find((m) => m.key === nk) || null;

          /* ① الأيام الحقيقية من النموذج قصير المدى */
          const realByDay = {};
          const d = state.wx?.daily;
          if (d?.time?.length) {
            d.time.forEach((iso, i) => {
              if (!iso.startsWith(nk)) return;
              const day = Number(iso.slice(8, 10));
              const mx = d.temperature_2m_max?.[i], mn = d.temperature_2m_min?.[i];
              realByDay[day] = {
                tmax: mx ?? null, tmin: mn ?? null,
                tmean: d.temperature_2m_mean?.[i] ?? (mx != null && mn != null ? (mx + mn) / 2 : null),
                pr: d.precipitation_sum?.[i] ?? 0,
                prob: d.precipitation_probability_max?.[i] ?? null,
                code: d.weather_code?.[i] ?? 0,
              };
            });
          }

          /* ② إزاحة SEAS5 الشهرية للحرارة ونسبة/فرق المطر */
          const anomaly = mEntry && mEntry.temp != null && mEntry.climTemp != null ? mEntry.temp - mEntry.climTemp : null;
          const rainRatio = mEntry && mEntry.climPrec != null && mEntry.climPrec >= 2 && mEntry.precip != null
            ? Math.max(0.25, Math.min(3, mEntry.precip / mEntry.climPrec))
            : null;
          const rainShift = mEntry && mEntry.precip != null && mEntry.climPrec != null ? mEntry.precip - mEntry.climPrec : null;

          /* ③ بناء أيام الشهر كاملة */
          const weekend = weekendSet();
          const days = [];
          for (let day = 1; day <= N; day += 1) {
            const iso = `${nk}-${String(day).padStart(2, "0")}`;
            const r = realByDay[day];
            if (r) { days.push({ day, iso, real: true, ...r }); continue; }
            const c = lastClim?.doy?.[iso.slice(5)] || null;
            if (!c) { days.push({ day, iso, real: false, empty: true }); continue; }
            const shift = anomaly ?? 0;
            const tmax = c.tmax != null ? c.tmax + shift : null;
            const tmin = c.tmin != null ? c.tmin + shift : null;
            const tmean = c.temp != null ? c.temp + shift : (tmax != null && tmin != null ? (tmax + tmin) / 2 : null);
            let pr = (c.prec ?? 0);
            if (rainRatio != null) pr = pr * rainRatio;
            else if (rainShift != null && pr > 0) pr = Math.max(0, pr + rainShift * 0.3);
            pr = Math.max(0, pr);
            days.push({ day, iso, real: false, tmax, tmin, tmean, pr, prob: null, code: estWeatherCode(tmax, pr) });
          }

          /* ④ الإحصاءات الشهرية — إصدار 39: buildNmStats دالة مشتركة على مستوى
             الوحدة تحسب شرائح الإحصاء لأي مصفوفة أيام كي تعمل لوضعَي المبدّل
             الزجاجي: الشهر الحالي (الأيام المتبقية) والشهر القادم (الكامل) */
          const coveredDays = Object.keys(realByDay).length;
          const NM = buildNmStats(days, mEntry, mmNum);
          if (el.nmStats) el.nmStats.innerHTML = NM.html;
          const { meanVal, norm, anomalyOut, rainTotal, rainNorm, rainDays } = NM;

          /* ⑤ عرض العنوان والشارة (قيم الشهر القادم الافتراضية — paintNm يعيد
             ضبطها حسب وضع المبدّل الزجاجي إن كان على الشهر الحالي) */
          const monthName = monthLabel(nk);
          if (el.nmTitle) el.nmTitle.textContent = tr("توقعات الشهر القادم") + " — " + monthName;
          if (el.nmBadge) el.nmBadge.textContent = coveredDays ? `16-DAY · ${localNum(coveredDays)}` : (mEntry ? "SEAS5" : tr("تقديري"));

          /* ⑥ رأس أيام الأسبوع */
          if (el.nmWeekdays) {
            const start = weekStartIndex();
            const fmt = placeDateFormatter({ weekday: "narrow" });
            el.nmWeekdays.innerHTML = Array.from({ length: 7 }, (_, i) => {
              const wd = (start + i) % 7; // 0=الأحد (getDay)
              const base = new Date(2024, 0, 7 + wd); // 2024-01-07 يوم أحد — إزاحة آمنة
              return `<span${weekend.includes(wd) ? ' style="color:var(--gold-deep)"' : ""}>${escapeHtml(fmt.format(base))}</span>`;
            }).join("");
          }

          /* ⑦ التقويم — إصدار 39: يُرسم عبر paintNm() حسب وضع المبدّل الزجاجي الحي
             (الأيام المتبقية من الشهر الحالي أو المصفوفة الممتدة للشهر القادم)،
             والبيانات المعدة تُخزَّن في nmCache كي يعيد المبدّل الرسم لحظيًا
             بتلاشٍ ناعم دون أي جلب شبكي جديد */
          nmCache = { days, nk, y, mmNum, mEntry, coveredDays };
          paintNm(true);

          /* ⑨ ملاحظة المصدر الصادقة */
          if (el.nmNote) {
            let note;
            if (coveredDays && anomaly != null) {
              note = tf("الأيام من 1 إلى {v} مغطاة بالنموذج قصير المدى عالي الدقة، والبقية تقديرات مناخية مدعومة بـ SEAS5.", { v: localNum(coveredDays) })
                + " " + tf("المصدر: نموذج ECMWF SEAS5 (متوسط التجميع) مقابل مناخ ERA5 لعشر سنوات (2016–2025). النموذج الموسمي يُحدَّث أسبوعيًا ويغطي 7 أشهر — اقرأه كتوجه احتمالي لا كوعد حرفي.{bias}", { bias: "" });
            } else if (coveredDays) {
              note = tf("الأيام من 1 إلى {v} مغطاة بالنموذج قصير المدى عالي الدقة، والبقية تقديرات مناخية مدعومة بـ SEAS5.", { v: localNum(coveredDays) });
            } else if (mEntry) {
              note = tf("المصدر: نموذج ECMWF SEAS5 (متوسط التجميع) مقابل مناخ ERA5 لعشر سنوات (2016–2025). النموذج الموسمي يُحدَّث أسبوعيًا ويغطي 7 أشهر — اقرأه كتوجه احتمالي لا كوعد حرفي.{bias}", { bias: "" });
            } else {
              note = tr("لا تتوفر بيانات كافية لعرض الشهر القادم بعد — افتح لوحة القيادة أولًا لجلب التوقعات ثم أعد هذه الصفحة.");
            }
            el.nmNote.textContent = note;
          }

          /* ⑩ بث الحقائق للمستشار الذكي (LLM + المحرك المحلي) */
          const trendValid = data.filter((m2) => m2.climTemp != null && m2.temp != null);
          const trendAnoms = trendValid.map((m2) => ({ m: m2, a: m2.temp - m2.climTemp }));
          const trendAvg = trendAnoms.length ? trendAnoms.reduce((s2, x) => s2 + x.a, 0) / trendAnoms.length : null;
          const trendPeak = trendAnoms.length ? trendAnoms.reduce((a, b) => (Math.abs(b.a) > Math.abs(a.a) ? b : a)) : null;
          const facts = {
            nextMonth: {
              name: monthName,
              mean: meanVal, norm, anomaly: anomalyOut,
              rain: rainTotal, rainNorm, rainDays,
              coveredDays, totalDays: N,
            },
            seasonalRows: data.slice(0, 7).map((m2) => ({
              name: monthLabel(m2.key), temp: m2.temp, norm: m2.climTemp,
              delta: m2.temp != null && m2.climTemp != null ? m2.temp - m2.climTemp : null,
              rain: m2.precip, rainNorm: m2.climPrec,
            })),
            trend: trendAvg != null ? {
              avgA: trendAvg,
              peak: trendPeak ? monthLabel(trendPeak.m.key) : "—",
              warm: trendAvg > 0,
            } : null,
            label: sourceLabel,
          };
          document.dispatchEvent(new CustomEvent("matar:monthly-data", { detail: facts }));
        }

        /* ═══════════════════ إصدار 39: الفلتر الديناميكي الذكي للشهور ═══════════════════
           شريط تبديل زجاجي فوق شبكة الأيام يقرأ تاريخ النظام تلقائيًا ويحقن اسم
           الشهر الحالي (مثل: نوفمبر) في الزر الأول واسم الشهر القادم (مثل:
           ديسمبر) في الزر الثاني — عبر Intl.DateTimeFormat('ar-EG', { month: 'long' })
           (ولغات الواجهة الأخرى عبر locale الواجهة كي يبقى التطبيق متماسكًا).
           منطق فلترة المصفوفات: زر الشهر الحالي يفلتر البيانات لتعرض الأيام
           المتبقية من الشهر التقويمي الحالي فقط (من اليوم حتى نهايته)، وزر
           الشهر القادم يرندر المصفوفة الممتدة الكاملة (30 يومًا) من SEAS5 —
           مع تلاشٍ ناعم (opacity transition) عند النقل يمنع القفزات الحادة. */
        function currentMonthKey() {
          const n = new Date();
          return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
        }
        function todayLocalIso() {
          const n = new Date();
          return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
        }
        /* التسمية التلقائية من ساعة الجهاز — العربية عبر ar-EG حرفيًا كما هي
           والبقية عبر لغة الواجهة الحية */
        function arMonthName(d) {
          try {
            return new Intl.DateTimeFormat(isAr() ? "ar-EG" : activeLocale(), { month: "long" }).format(d);
          } catch (e) {
            try { return placeDateFormatter({ month: "long" }).format(d); } catch (e2) { return ""; }
          }
        }
        /* فلترة المصفوفة الحية: أيام الشهر التقويمي الحالي المتبقية من اليوم فصاعدًا
           — كلها أيام حقيقية من النموذج قصير المدى (لا تقديرات مناخية) */
        function currentMonthDays() {
          const ck = currentMonthKey();
          const [cy, cm] = ck.split("-").map(Number);
          const tIso = todayLocalIso();
          const d = state.wx?.daily;
          const days = [];
          if (d?.time?.length) {
            d.time.forEach((iso, i) => {
              if (!iso.startsWith(ck) || iso < tIso) return;
              const mx = d.temperature_2m_max?.[i], mn = d.temperature_2m_min?.[i];
              days.push({
                day: Number(iso.slice(8, 10)), iso, real: true,
                tmax: mx ?? null, tmin: mn ?? null,
                tmean: d.temperature_2m_mean?.[i] ?? (mx != null && mn != null ? (mx + mn) / 2 : null),
                pr: d.precipitation_sum?.[i] ?? 0,
                prob: d.precipitation_probability_max?.[i] ?? null,
                code: d.weather_code?.[i] ?? 0,
              });
            });
          }
          return { y: cy, m: cm, days, label: arMonthName(new Date(cy, cm - 1, 15)) };
        }
        /* شرائح الإحصاء — إصدار 39: على مستوى الوحدة كي تخدم الشهرين معًا
           (الحالي المتبقي والقادم الكامل) بنفس الشكل والحساب تمامًا */
        const statChip = (label, value, sub, icon) => `
          <div class="nm-stat">
            <span class="nm-k">${iconSvg(icon, 13)} ${escapeHtml(label)}</span>
            <b>${value}</b>
            ${sub ? `<small>${sub}</small>` : ""}
          </div>`;
        function buildNmStats(daysArr, mEntryX, mmNumX) {
          const nums = daysArr.filter((x) => !x.empty && x.tmean != null);
          const meanVal = nums.length ? nums.reduce((s2, x) => s2 + (x.tmax != null && x.tmin != null ? (x.tmax + x.tmin) / 2 : x.tmean), 0) / nums.length : null;
          const norm = mEntryX?.climTemp ?? lastClim?.monthly?.[String(mmNumX)]?.temp ?? null;
          const anomalyOut = meanVal != null && norm != null ? meanVal - norm : null;
          const rainTotal = daysArr.reduce((s2, x) => s2 + (x.pr ?? 0), 0);
          const rainNorm = mEntryX?.climPrec ?? (lastClim?.monthly?.[String(mmNumX)]?.prec ?? null);
          const rainDays = daysArr.filter((x) => (x.pr ?? 0) >= 1).length;
          const hot = daysArr.filter((x) => x.tmax != null).sort((a, b) => b.tmax - a.tmax)[0] || null;
          const cold = daysArr.filter((x) => x.tmin != null).sort((a, b) => a.tmin - b.tmin)[0] || null;
          const anomalyBadge = anomalyOut != null
            ? (Math.abs(anomalyOut) >= 0.3
              ? `<span class="anomaly nm-anomaly" data-a="${anomalyOut >= 0 ? "warm" : "cool"}">${anomalyOut >= 0 ? "▲ +" : "▼ "}${localNum(anomalyOut, 1)}°</span>`
              : `<span class="anomaly nm-anomaly" data-a="near">≈ ${tr("قريب من المعتاد")}</span>`)
            : "";
          let html = "";
          if (meanVal != null) {
            html += statChip(tr("متوسط الحرارة"), tempText(meanVal), `${norm != null ? `${tr("المعيار المناخي")}: ${tempText(norm)}` : ""}${anomalyBadge}`, "thermo");
          }
          html += statChip(tr("مجموع الأمطار المتوقع"), `${localNum(rainTotal, 1)} ${tr("مم")}`, rainNorm != null ? `${tr("المعيار المناخي")}: ${localNum(rainNorm, 1)} ${tr("مم")}` : "", "water");
          html += statChip(tr("أيام ممطرة"), localNum(rainDays), "≥ 1 مم", "rain");
          if (hot) html += statChip(tr("أدفأ يوم"), `${localNum(hot.day)}`, `${tempText(hot.tmax)} · ${placeDateFormatter({ weekday: "long", day: "numeric" }).format(new Date(`${hot.iso}T12:00:00Z`))}`, "fire");
          if (cold) html += statChip(tr("أبرد يوم"), `${localNum(cold.day)}`, `${tempText(cold.tmin)} · ${placeDateFormatter({ weekday: "long", day: "numeric" }).format(new Date(`${cold.iso}T12:00:00Z`))}`, "frost");
          return { html, meanVal, norm, anomalyOut, rainTotal, rainNorm, rainDays };
        }
        /* رسم خلايا التقويم لأي مصفوفة أيام — التفاف أسبوع البداية يُحسب من أول
           يوم معروض فعليًا (اليوم في وضع الشهر الحالي، واليوم 1 في وضع الشهر القادم) */
        function paintNmCells(daysArr, yN, mN, firstDayNum) {
          const start = weekStartIndex();
          const weekend = weekendSet();
          const firstWd = new Date(yN, mN - 1, firstDayNum).getDay();
          let cells = "";
          for (let b = 0; b < ((firstWd - start) % 7 + 7) % 7; b += 1) cells += `<span class="nm-day nm-empty" aria-hidden="true"></span>`;
          daysArr.forEach((x) => {
            const wd = new Date(x.iso + "T12:00:00Z").getUTCDay();
            const isWknd = weekend.includes(wd);
            const cls = ["nm-day"];
            if (x.empty) cls.push("nm-empty");
            else {
              if (!x.real) cls.push("nm-est");
              if (isWknd) cls.push("nm-weekend");
              if ((x.pr ?? 0) >= 3) cls.push("nm-wet");
              if ((x.tmax ?? -Infinity) >= 38) cls.push("nm-hot");
            }
            const title = x.empty ? "" : ` title="${escapeHtml(x.real ? tr("بالنموذج قصير المدى") : tr("تقديري"))} · ${placeDateFormatter({ weekday: "long", day: "numeric", month: "long" }).format(new Date(`${x.iso}T12:00:00Z`))}"`;
            if (x.empty) { cells += `<span class="${cls.join(" ")}"></span>`; return; }
            const prTxt = x.prob != null && x.prob > 0
              ? `<span class="nm-pr">${iconSvg("water", 10)} ${localNum(x.prob)}٪</span>`
              : (x.pr ?? 0) >= 0.2
                ? `<span class="nm-pr">${iconSvg("water", 10)} ≈${localNum(x.pr, 1)}</span>`
                : `<span class="nm-pr"></span>`;
            /* v51: خلايا التقويم تحمل بياناتها الكاملة (data-attrs) كي تبني
               طبقة الترقية التفاعلية (الخريطة الحرارية + شارات المطر + بطاقة
               تفاصيل اليوم بأربعة فترات) فوقها دون لمس منطق الرسم */
            cells += `
              <span class="${cls.join(" ")}"${title} role="gridcell" data-iso="${escapeHtml(x.iso)}" data-real="${x.real ? 1 : 0}" data-tmax="${x.tmax ?? ""}" data-tmin="${x.tmin ?? ""}" data-pr="${(x.pr ?? 0).toFixed(2)}" data-prob="${x.prob ?? ""}" data-code="${x.code ?? 0}">
                <span class="nm-num">${localNum(x.day)}</span>
                <span class="nm-ico">${wmoSvg(x.code ?? 0, 1, 18)}</span>
                <span class="nm-hi">${tempText(x.tmax)}</span>
                <span class="nm-lo">${tempText(x.tmin)}</span>
                ${prTxt}
              </span>`;
          });
          return cells;
        }
        /* الرسم الحي حسب وضع المبدّل — مع تلاشٍ ناعم عند النقل بين الشهرين */
        function paintNm(instant) {
          if (!el.nmCalendar || !nmCache) return;
          const apply = () => {
            if (nmMode === "current") {
              const cur = currentMonthDays();
              if (cur.days.length) {
                const firstDay = Number(cur.days[0].iso.slice(8, 10));
                el.nmCalendar.innerHTML = paintNmCells(cur.days, cur.y, cur.m, firstDay);
                if (el.nmTitle) el.nmTitle.textContent = tr("بقية الشهر الحالي") + " — " + cur.label;
                if (el.nmBadge) el.nmBadge.textContent = `16-DAY · ${localNum(cur.days.length)}`;
                if (el.nmStats) el.nmStats.innerHTML = buildNmStats(cur.days, currentSeasEntry(cur.y, cur.m), cur.m).html;
              } else {
                /* لا توقعات حية بعد — رسالة واضحة بدل شبكة فارغة */
                el.nmCalendar.innerHTML = `<p class="src-note" style="grid-column: 1 / -1; margin: 6px 2px">${escapeHtml(tr("افتح لوحة القيادة أولًا لجلب توقعات اليوم ثم عد لعرض بقية الشهر الحالي."))}</p>`;
                if (el.nmTitle) el.nmTitle.textContent = tr("بقية الشهر الحالي") + " — " + arMonthName(new Date());
                if (el.nmBadge) el.nmBadge.textContent = tr("تقديري");
              }
            } else {
              el.nmCalendar.innerHTML = paintNmCells(nmCache.days, nmCache.y, nmCache.mmNum, 1);
              if (el.nmTitle) el.nmTitle.textContent = tr("توقعات الشهر القادم") + " — " + monthLabel(nmCache.nk);
              if (el.nmBadge) el.nmBadge.textContent = nmCache.coveredDays ? `16-DAY · ${localNum(nmCache.coveredDays)}` : (nmCache.mEntry ? "SEAS5" : tr("تقديري"));
              if (el.nmStats) el.nmStats.innerHTML = buildNmStats(nmCache.days, nmCache.mEntry, nmCache.mmNum).html;
            }
            syncNmToggle();
          };
          if (instant) { apply(); return; }
          /* التلاشي الناعم: إخفاء 0.3s ← تبديل المحتوى ← عودة تدريجية */
          el.nmCalendar.style.opacity = "0";
          el.nmWeekdays && (el.nmWeekdays.style.opacity = "0");
          setTimeout(() => {
            apply();
            el.nmCalendar.style.opacity = "1";
            if (el.nmWeekdays) el.nmWeekdays.style.opacity = "1";
          }, 200);
        }
        /* مدخل SEAS5 لأي شهر (لإحصاءات الشهر الحالي أيضًا) */
        function currentSeasEntry(y, m) {
          try {
            const key = `${y}-${String(m).padStart(2, "0")}`;
            return MonthlyData()?.find((mm) => mm.key === key) || null;
          } catch (e) { return null; }
        }
        function MonthlyData() {
          try { return cache.get(cacheKey())?.data || null; } catch (e) { return null; }
        }
        function cacheKey() {
          const p = state.place;
          return p ? `${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}` : "";
        }
        function syncNmToggle() {
          if (!el.nmToggleCur || !el.nmToggleNext) return;
          el.nmToggleCur.setAttribute("aria-selected", nmMode === "current" ? "true" : "false");
          el.nmToggleNext.setAttribute("aria-selected", nmMode === "next" ? "true" : "false");
        }
        function setNmMode(mode) {
          if ((mode !== "current" && mode !== "next") || mode === nmMode) { syncNmToggle(); return; }
          nmMode = mode;
          try { localStorage.setItem(NM_MODE_KEY, mode); } catch (e) {}
          paintNm(false); /* تلاشٍ ناعم يمنع القفزات الحادة في الشاشة */
        }
        /* حقن أسماء الشهور من ساعة الجهاز + ربط النقر — مرة واحدة */
        function wireNmToggle() {
          if (nmToggleWired || !el.nmToggleCur || !el.nmToggleNext) return;
          nmToggleWired = true;
          const now = new Date();
          const nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          el.nmToggleCur.textContent = arMonthName(now) || "—";
          el.nmToggleNext.textContent = arMonthName(nxt) || "—";
          el.nmToggleCur.addEventListener("click", () => setNmMode("current"));
          el.nmToggleNext.addEventListener("click", () => setNmMode("next"));
          document.addEventListener("matar:language", () => {
            const n2 = new Date();
            const x2 = new Date(n2.getFullYear(), n2.getMonth() + 1, 1);
            el.nmToggleCur.textContent = arMonthName(n2) || "—";
            el.nmToggleNext.textContent = arMonthName(x2) || "—";
          });
          syncNmToggle();
        }

        function render(data, sourceLabel) {
          const place = state.place;
          if (!el.grid) return;
          if (el.locChip) $("span", el.locChip).textContent = [place?.name, place?.country].filter(Boolean).join("، ") || "—";
          if (el.badge) el.badge.textContent = sourceLabel;
          const maxPrec = Math.max(...data.map((m) => m.precip ?? 0), 1);
          const ar = isAr();
          el.grid.replaceChildren();
          data.slice(0, 7).forEach((m, mi) => {
            const aT = anomalyTemp(m.temp, m.climTemp);
            const pA = precipAnomalyInfo(m.precip, m.climPrec);
            let badge = "", noteTxt = "";
            if (aT != null) {
              if (aT >= 1) badge = `<span class="anomaly" data-a="warm">▲ ${tr("أدفأ من المعتاد")} +${localNum(aT, 1)}°</span>`;
              else if (aT <= -1) badge = `<span class="anomaly" data-a="cool">▼ ${tr("أبرد من المعتاد")} ${localNum(aT, 1)}°</span>`;
              else badge = `<span class="anomaly" data-a="near">≈ ${tr("قريب من المعتاد")}</span>`;
              noteTxt = aT >= 2 ? tx("شهر أدفأ بوضوح — خطط لتبريد إضافي وأوقات ظل أطول.", "Clearly warm month — plan extra cooling and longer shade windows.")
                : aT <= -2 ? (m.climTemp != null && m.climTemp <= 12 ? tx("شهر أبرد بوضوح — انتبه لأول موجات الصقيع المحتملة.", "A clearly cool month — watch the first possible frost waves.") : tx("شهر أبرد من المعتاد بوضوح — ذروة حرارة أخف وليالٍ ألطف.", "Clearly cooler than usual — a milder daytime peak and gentler nights."))
                : tx("لا انحراف حراري يُذكر عن مناخ هذا الشهر.", "No notable temperature anomaly for this month's climate.");
            }
            // الأشهر البعيدة (٤–٧) مهارة النموذج فيها تقل — وسم استرشادي صادق
            if (mi >= 3) badge += ` <span class="anomaly" data-a="near">${tr("استرشادي")}</span>`;
            let rainExtra = "";
            if (pA) {
              if (pA.pct != null) rainExtra = ` · ${pA.pct >= 0 ? "+" : ""}${localNum(pA.pct, 0)}٪ ${tr("عن المعتاد")}`;
              else if (pA.near) rainExtra = ` · ${tr("قريب من المعتاد")}`;
              else rainExtra = ` · ${pA.wet ? "+" : "-"}${localNum(Math.abs(pA.diff), 1)} ${tr("مم عن المعتاد")}`;
            }
            const card = document.createElement("div");
            card.className = "month-card";
            /* إصلاح 35: كل بطاقة شهر تفاعلية — الضغط يفتح تفاصيل الشهر الكاملة
               (المتوسط المناخي، ميزان المطر، تفسير الانحراف) بدل شبكة صامتة */
            card.dataset.open = "false";
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-expanded", "false");
            const detRows = [];
            if (m.climTemp != null) detRows.push(tf("المتوسط المناخي المعتاد لهذا الشهر: {v} — والفرق عنه {d}.", { v: tempText(m.climTemp), d: aT == null ? "—" : `${aT > 0 ? "+" : ""}${localNum(aT, 1)}°` }));
            if (m.climPrec != null) detRows.push(tf("مطر الشهر المعتاد: {v} — المتوقع هذا العام: {p}.", { v: `${localNum(m.climPrec, 1)} ${tr("مم")}`, p: `${localNum(m.precip, 1)} ${tr("مم")}` }));
            if (m.partial) detRows.push(tr("هذه القراءة لبقية الشهر الحالي (من اليوم حتى نهايته) وليست للشهر كاملًا."));
            if (mi >= 3) detRows.push(tr("شهر بعيد المدى — النموذج الموسمي استرشادي هنا ويتحدّث أسبوعيًا."));
            const detHtml = detRows.length
              ? `<div class="mc-details">${detRows.map((r) => `<span>${r}</span>`).join("")}</div>`
              : "";
            card.innerHTML = `
              <div class="mc-month"><strong>${escapeHtml(monthLabel(m.key))}</strong>${m.partial ? `<span class="anomaly" data-a="near">${tr("بقية الشهر")}</span>` : ""}${badge}</div>
              <div class="mc-temp">${tempText(m.temp)} <small>${tr("متوسط شهري")}</small></div>
              <div class="mc-rain">☂ ${localNum(m.precip, 1)} ${tr("مم")}${rainExtra}</div>
              <div class="mc-bar"><b style="width:${Math.round(clamp((m.precip ?? 0) / maxPrec, 0.02, 1) * 100)}%"></b></div>
              ${noteTxt ? `<p class="mc-note">${escapeHtml(noteTxt)}</p>` : ""}
              ${detHtml}
              <div class="mc-more-hint">${tr("تفاصيل الشهر")}</div>`;
            const toggleCard = () => {
              const open = card.dataset.open === "true";
              card.dataset.open = open ? "false" : "true";
              card.setAttribute("aria-expanded", open ? "false" : "true");
            };
            card.addEventListener("click", toggleCard);
            card.addEventListener("keydown", (ev) => {
              if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggleCard(); }
            });
            el.grid.append(card);
          });

          // ملاحظة المصدر
          const biasNote = sourceLabel === "SEAS5" && Math.abs(data[0]?.bias || 0) >= 0.3
            ? tf(" درجات الحرارة مُصحَّحة لانحياز النموذج ({v}°) عبر مقارنة أول أيام SEAS5 بالتوقع قصير المدى.", { v: `${data[0].bias > 0 ? "+" : ""}${localNum(data[0].bias, 1)}` })
            : "";
          const src = sourceLabel === "SEAS5"
            ? tf("المصدر: نموذج ECMWF SEAS5 (متوسط التجميع) مقابل مناخ ERA5 لعشر سنوات (2016–2025). النموذج الموسمي يُحدَّث أسبوعيًا ويغطي 7 أشهر — اقرأه كتوجه احتمالي لا كوعد حرفي.{bias}", { bias: biasNote })
            : tr("المصدر: تجميع شهري من نموذج الـ 16 يومًا (Open-Meteo) — الشهران القريبان دقتهما جيدة، وبقية الأشهر تغطيتها جزئية. نموذج SEAS5 الموسمي غير متاح لهذا الموقع حاليًا وسيعاد المحاولة تلقائيًا عند فتح الصفحة لاحقًا.");
          if (el.note) el.note.textContent = src;

          // قراءة مبسّطة (بطاقتان-ثلاث)
          if (el.reading) {
            const cards = [];
            const warm = data.filter((m) => (anomalyTemp(m.temp, m.climTemp) ?? 0) >= 1.5);
            const cool = data.filter((m) => (anomalyTemp(m.temp, m.climTemp) ?? 0) <= -1.5);
            const wet = data.filter((m) => { const i = precipAnomalyInfo(m.precip, m.climPrec); return i && (i.pct != null ? i.pct >= 30 : i.wet === true); });
            const dry = data.filter((m) => { const i = precipAnomalyInfo(m.precip, m.climPrec); return i && (i.pct != null ? i.pct <= -30 : i.wet === false); });
            if (warm.length) cards.push({ kind: "heat", sev: "med", icon: "fire", title: tx("توجه حراري صاعد", "Warming trend"), msg: tf("{m}: أشهر أدفأ من معيارها المناخي بفارق ملموس — استهلاك التبريد ومياه الري سيرتفع.", { m: warm.map((m) => monthLabel(m.key)).join(ar ? "، " : ", ") }) });
            if (cool.length) cards.push({ kind: "frost", sev: "med", icon: "frost", title: tx("توجه حراري هابط", "Cooling trend"), msg: tf("{m}: أبرد من العُرف المناخي — انتبه لأول موجات الصقيع المبكرة في نهاية الخريف والشتاء.", { m: cool.map((m) => monthLabel(m.key)).join(ar ? "، " : ", ") }) });
            if (wet.length) cards.push({ kind: "irrigation", sev: "low", icon: "rain", title: tx("معدل هطول أعلى من المتوسط", "Above-average rainfall"), msg: tf("{m}: أمطار فوق المعتاد — فرصة لتعبئة المخزون وتأجيل سقي بعض المحاصيل.", { m: wet.map((m) => monthLabel(m.key)).join(ar ? "، " : ", ") }) });
            if (dry.length) cards.push({ kind: "spray", sev: "med", icon: "water", title: tx("معدل هطول أقل من المتوسط", "Below-average rainfall"), msg: tf("{m}: أمطار أقل من المعتاد — خطط لموارد الري مبكرًا واعتمد تغطية التربة لتقليل التبخر.", { m: dry.map((m) => monthLabel(m.key)).join(ar ? "، " : ", ") }) });
            if (!cards.length) cards.push({ kind: "spray", sev: "low", icon: "ok", title: tx("توجه مستقر", "Stable outlook"), msg: tx("لا انحرافات مناخية كبيرة في الأشهر المعروضة — الأشهر القادمة قريبة من معاييرها المناخية.", "No major climate anomalies in the displayed months — the months ahead sit close to their norms.") });
            const sevText = { high: tr("عالية"), med: tr("متوسطة"), low: tr("للعلم") };
            el.reading.innerHTML = cards.map((a) => `
              <div class="adv-card" data-kind="${a.kind}">
                <span class="adv-title">${iconSvg(a.icon, 14)} ${escapeHtml(a.title)}<span class="adv-sev" data-sev="${a.sev}">${sevText[a.sev]}</span></span>
                <p class="adv-msg">${escapeHtml(a.msg)}</p>
              </div>`).join("");
          }

          // الميزة الجديدة: المستشار الذكي الموسمي — انحرافات SEAS5 مقابل مناخ العقد
          try { renderSeasonalAdvisor(data, sourceLabel); } catch (err) { /* لا نعطل الصفحة إن فشل التحليل */ }
          try { renderNextMonth(data, sourceLabel); } catch (err) { /* إصدار 15: لا نعطل الصفحة إن فشل تقويم الشهر القادم */ }
          showContent();
        }

        async function load(force = false) {
          const place = state.place;
          if (!place) return;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          if (!force && cache.has(key)) { render(cache.get(key).data, cache.get(key).label); return; }
          if (loading) return;
          loading = true;
          setLoading();
          try {
            const [seasonal, climRes] = await Promise.allSettled([fetchSeasonal(place), fetchClimatologyCached(place, key)]);
            const months = [];
            if (seasonal.status === "fulfilled" && seasonal.value.time?.length) {
              const clim = climRes.status === "fulfilled" ? climRes.value : null;
              lastClim = clim; // إصدار 15: تخزين المناخ اليومي لتقديرات الشهر القادم
              const aggs = aggregateSeasonal(seasonal.value.time, seasonal.value.temps, seasonal.value.precs);
              // عدد الأيام المتغطية لكل شهر (الشهر الأول جزئي دائمًا) + انحياز SEAS5
              const covered = {};
              seasonal.value.time.forEach((iso) => { const k = iso.slice(0, 7); covered[k] = (covered[k] || 0) + 1; });
              const bias = computeSeasBias(seasonal.value, state.wx);
              aggs.forEach((m) => {
                const d = new Date(`${m.key}-15T12:00:00Z`);
                const monthNum = d.getMonth() + 1;
                const full = daysInMonth(d.getFullYear(), monthNum);
                const cov = covered[m.key] || 0;
                const c = climFor(clim, m.key, monthNum, full, cov);
                months.push({
                  key: m.key, temp: m.temp - bias, precip: m.precip,
                  climTemp: c?.temp ?? null, climPrec: c?.precip ?? null,
                  partial: cov < full, bias, source: "seas5",
                });
              });
            }
            if (months.length) {
              const out = { data: months, label: "SEAS5" };
              cache.set(key, out);
              try { render(months, "SEAS5"); } catch (err) { showError(`[render] ${err?.message || err}`); }
            } else {
              // خطة احتياطية: تجميع شهري من توقعات الـ 16 يومًا المتاحة
              const alt = fromDailyForecast();
              if (alt.length) {
                const out = { data: alt, label: "16-DAY" };
                cache.set(key, out);
                try { render(alt, "16-DAY"); } catch (err) { showError(`[render] ${err?.message || err}`); }
              } else {
                showError(tr("تعذّر جلب التوقعات الشهرية الآن — تحقق من الاتصال ثم أعد المحاولة."));
              }
            }
          } catch (e) {
            const alt = fromDailyForecast();
            if (alt.length) { try { render(alt, "16-DAY"); } catch (err) { showError(`[render] ${err?.message || err}`); } }
            else showError(tr("تعذّر جلب التوقعات الشهرية الآن — تحقق من الاتصال ثم أعد المحاولة."));
          } finally {
            loading = false;
          }
        }

        el.retry?.addEventListener("click", () => load(true));
        document.addEventListener("matar:language", () => {
          const place = state.place;
          if (!place) return;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          if (cache.has(key)) { const c = cache.get(key); render(c.data, c.label); }
        });
        document.addEventListener("matar:unit", () => {
          const place = state.place;
          if (!place) return;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          if (cache.has(key) && !$("#page-monthly").hidden) { const c = cache.get(key); render(c.data, c.label); }
        });
        // لو اعرضنا SEAS5 قبل وصول النموذج قصير المدى (انحياز = 0) — نعيد الحساب فور وصول بياناته
        // الكاش المناخي يجعل إعادة الحساب رخيصة: جلب SEAS5 فقط (كيلوبايتات قليلة)
        document.addEventListener("matar:data", () => {
          if ($("#page-monthly").hidden || loading) return;
          const place = state.place;
          if (!place) return;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          const c = cache.get(key);
          if (c && c.label === "SEAS5" && !c.data[0]?.bias) load(true);
        });

        /* إصدار 15: توصيل الفلتر المنزلق مرة واحدة + إعادة تثبيت الإبهام عند تغيّر الاتجاه/اللغة */
        wireSeg();
        /* إصدار 39: توصيل شريط التبديل الزجاجي بين الشهر الحالي والقادم —
           يحقن اسمي الشهرين من ساعة الجهاز فور التهيئة (Intl ar-EG) */
        wireNmToggle();

        function onShow() {
          load();
          // إصدار 19: لو كان فلتر آلة الزمن هو المختار، جهّز سجله التاريخي فور العرض
          if (currentSeg === "time") { try { TimeMachine.ensure(); } catch (e) { console.error("timemachine", e); } }
        }
        return { onShow, load };
      })();

      /* ============================================================
         إصدار 19 — آلة الزمن المناخي (Climate Time-Machine)
         ------------------------------------------------------------
         ① اليوم مقابل التاريخ: طقس "اليوم" بنفس هذا اليوم (MM-DD) عبر
            عشرين سنة كاملة من سجل ERA5 عبر Open-Meteo Archive API.
         ② رسم بياني للتحول: هل تصبح منطقتك أكثر حرارة أو أكثر جفافًا؟
            انحدار خطي على متوسط الحرارة السنوي ومجموع مطر السنة ونفس اليوم.

         ═══ إصلاح خطأ «http 400» الجذري ═══
         أرشيف ERA5 يسبق الحاضر بأيام (ERA5T delay) — أي end_date يتجاوز
         التغطية المتاحة يعيد HTTP 400. الحل المزدوج:
         (أ) نطاق آمن حتميًا: من أول يناير للسنة التي تجعل التغطية 20 سنة
             كاملة، إلى 31 ديسمبر للسنة الماضية — لا يمس النافذة المتأخرة.
         (ب) عند أي رفض: نستخرج الحد الأقصى المسموح من نص الخطأ نفسه
             ("out of allowed range from 1940-01-01 to 2026-10-27") ونعيد
             المحاولة مرة واحدة بنطاق مصحح بدل إظهار رسالة فاشلة.
         ============================================================ */
      const TimeMachine = (() => {
        const cache = new Map(); // "lat,lon" → بيانات مجمعة للعرض
        let loading = false;

        const el = {
          pane: $("#monthly-time-pane"), loading: $("#tm-loading"),
          error: $("#tm-error"), errorMsg: $("#tm-error-msg"),
          content: $("#tm-content"), retry: $("#tm-retry"),
        };

        const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        /* (أ) النطاق الآمن: لا يتجاوز أبدًا نهاية السنة الماضية */
        function safeRange() {
          const lastYear = new Date().getFullYear() - 1;
          return { start: `${lastYear - 19}-01-01`, end: `${lastYear}-12-31` };
        }

        /* (ب) استخراج الحد المسموح من نص رفض Open-Meteo وإصلاح النطاق به */
        function clampFromReason(reason, start, end) {
          const m = /to (\d{4}-\d{2}-\d{2})/.exec(String(reason || ""));
          if (!m) return null;
          const maxEnd = m[1];
          if (maxEnd >= end) return null; // الخطأ في شيء آخر — لا تصحيح ممكن
          return { start, end: maxEnd };
        }

        async function fetchArchive(place) {
          let range = safeRange();
          let res = null;
          for (let attempt = 0; attempt < 2; attempt += 1) {
            const u = new URL("https://archive-api.open-meteo.com/v1/archive");
            u.search = new URLSearchParams({
              latitude: place.latitude.toFixed(4), longitude: place.longitude.toFixed(4),
              start_date: range.start, end_date: range.end,
              daily: "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum",
              timezone: "auto",
            });
            const r = await fetch(u);
            if (r.ok) { res = await r.json(); break; }
            let reason = "";
            try { reason = (await r.json())?.reason || ""; } catch (e) {}
            const fixed = attempt === 0 ? clampFromReason(reason, range.start, range.end) : null;
            if (fixed) { range = fixed; continue; } // محاولة واحدة بنطاق مصحح من نص الخطأ
            throw new Error(`archive http ${r.status}${reason ? ` — ${reason}` : ""}`);
          }
          if (!res || res.error === true) throw new Error(`archive: ${res?.reason || "empty response"}`);
          return res;
        }

        /* ── رياضيات نقية (مفحوصة ذاتيًا عبر __matarTimeMachineHooks) ── */
        function linreg(xs, ys) {
          const n = Math.min(xs.length, ys.length);
          if (n < 2) return null;
          let sx = 0, sy = 0, sxy = 0, sxx = 0;
          for (let i = 0; i < n; i += 1) { sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; sxx += xs[i] * xs[i]; }
          const den = n * sxx - sx * sx;
          if (!den) return null;
          const m = (n * sxy - sx * sy) / den;
          return { m, b: (sy - m * sx) / n };
        }

        const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

        /* تجميع السجل اليومي الخام: نفس اليوم عبر السنين + سلاسل سنوية */
        function aggregateArchive(daily, mmdd) {
          const time = daily?.time ?? [];
          const tmax = daily?.temperature_2m_max ?? [];
          const tmin = daily?.temperature_2m_min ?? [];
          const tmean = daily?.temperature_2m_mean ?? [];
          const prec = daily?.precipitation_sum ?? [];
          const sameDay = [];
          const years = [], temp = [], precip = [];
          const acc = {}; // year → { t: [], p: [] }
          for (let i = 0; i < time.length; i += 1) {
            const iso = time[i], y = iso.slice(0, 4), md = iso.slice(5, 10);
            if (!acc[y]) acc[y] = { t: [], p: [] };
            if (tmean[i] != null) acc[y].t.push(tmean[i]);
            if (prec[i] != null) acc[y].p.push(prec[i]);
            // نفس اليوم: مطابقة MM-DD — مع تسامح 29 فبراير (يستبدل بـ 28 فبراير في السنوات غير الكبيسة)
            const isTarget = md === mmdd || (mmdd === "02-29" && md === "02-28");
            if (isTarget && (tmax[i] != null || tmin[i] != null)) {
              sameDay.push({
                year: Number(y),
                tmax: tmax[i] ?? null, tmin: tmin[i] ?? null,
                pr: prec[i] ?? 0,
              });
            }
          }
          Object.keys(acc).sort().forEach((y) => {
            const mt = mean(acc[y].t), mp = acc[y].p.reduce((a, b) => a + b, 0);
            /* سنة صالحة: متوسط حرارة متاح — بيانات ERA5 اليومية شبه مكتملة دائمًا */
            if (mt != null) { years.push(Number(y)); temp.push(mt); precip.push(mp); }
          });
          const xs = sameDay.map((r) => r.year), yT = sameDay.map((r) => (r.tmax != null && r.tmin != null ? (r.tmax + r.tmin) / 2 : r.tmax)).filter((v) => v != null);
          const sdTrend = yT.length >= 5 ? linreg(xs.slice(0, yT.length), yT) : null;
          const aTrend = linreg(years, temp);
          const pTrend = linreg(years, precip);
          return {
            sameDay,
            sdMean: { tmax: mean(sameDay.map((r) => r.tmax).filter((v) => v != null)), tmin: mean(sameDay.map((r) => r.tmin).filter((v) => v != null)), pr: mean(sameDay.map((r) => r.pr)) },
            annual: { years, temp, precip },
            sdTrend, aTrend, pTrend,
          };
        }

        /* مفتاح "اليوم" MM-DD بساعة الموقع نفسها (لا بساعة الجهاز) */
        function todayMMDD() {
          const cur = state.wx?.current?.time;
          if (cur && /^\d{4}-\d{2}-\d{2}/.test(cur)) return cur.slice(5, 10);
          return isoDay(new Date()).slice(5, 10);
        }

        /* اسم الشهر ب locale الواجهة — بديل محلي عن monthLabel المعرفة داخل وحدة Monthly */
        function monthNameOf(mm) {
          try {
            const fmt = new Intl.DateTimeFormat(activeLocale(), { month: "long" });
            return fmt.format(new Date(Date.UTC(2000, (Number(mm) || 1) - 1, 15)));
          } catch (e) { return String(mm); }
        }

        /* السنوات بلا فاصلة آلاف — localNum كان يعرض ٢٬٠١٦ بدل ٢٠١٦ */
        function yearText(y) {
          try { return Number(y).toLocaleString(activeLocale(), { useGrouping: false }); }
          catch (e) { return String(y); }
        }

        function todayValues() {
          const d = state.wx?.daily;
          if (!d?.time?.length) return null;
          return {
            tmax: d.temperature_2m_max?.[0] ?? null,
            tmin: d.temperature_2m_min?.[0] ?? null,
            pr: d.precipitation_sum?.[0] ?? null,
          };
        }

        /* ── عرض ── */
        function setLoading() {
          el.loading?.classList.remove("hidden");
          el.error?.classList.add("hidden");
          el.content?.classList.add("hidden");
        }
        function showError(msg) {
          el.loading?.classList.add("hidden");
          el.content?.classList.add("hidden");
          el.error?.classList.remove("hidden");
          if (el.errorMsg) el.errorMsg.textContent = msg;
        }
        function showContent() {
          el.loading?.classList.add("hidden");
          el.error?.classList.add("hidden");
          el.content?.classList.remove("hidden");
        }

        /* رسوم SVG مبسطة: خط + اتجاه انحدار متقطع */
        function svgChart(opts) {
          const W = 680, H = opts.height || 235;
          const padL = 42, padR = 14, padT = 30, padB = 28;
          const sers = opts.series.filter((s) => s.ys.some((v) => v != null));
          if (!sers.length) return "";
          const all = sers.flatMap((s) => s.ys.filter((v) => v != null));
          let min = Math.min(...all), max = Math.max(...all);
          if (opts.zeroBase) min = Math.min(0, min);
          const span = (max - min) || 1;
          min -= span * 0.14; max += span * 0.14;
          const n = opts.xs.length;
          const X = (i) => padL + (n <= 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));
          const Y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
          const dec = opts.dec ?? 0;
          const parts = [];
          for (let g = 0; g <= 3; g += 1) {
            const v = min + ((max - min) * g) / 3, y = Y(v);
            parts.push(`<line class="tm-gridline" x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}"/>`);
            parts.push(`<text class="tm-axis" x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end">${localNum(v, dec)}</text>`);
          }
          [0, Math.floor((n - 1) / 2), n - 1].forEach((i, k) => {
            if (i < 0 || i >= n || (k === 1 && n < 8)) return;
            parts.push(`<text class="tm-axis" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${opts.xs[i]}</text>`);
          });
          sers.forEach((s) => {
            if (s.bars) {
              const bw = Math.max(2, ((W - padL - padR) / n) * 0.55);
              s.ys.forEach((v, i) => {
                if (v == null) return;
                const y0 = Y(Math.max(0, min)), y1 = Y(v);
                parts.push(`<rect x="${(X(i) - bw / 2).toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y0 - y1)).toFixed(1)}" fill="${s.color}" opacity="0.55" rx="1.5"/>`);
              });
            } else {
              let d = "", pen = false;
              s.ys.forEach((v, i) => {
                if (v == null) { pen = false; return; }
                d += `${pen ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)} `;
                pen = true;
              });
              parts.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
            }
            if (s.trend) {
              const idx = s.ys.map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0);
              if (idx.length >= 2) {
                const i0 = idx[0], i1 = idx[idx.length - 1];
                parts.push(`<line x1="${X(i0).toFixed(1)}" y1="${Y(s.trend.m * opts.xs[i0] + s.trend.b).toFixed(1)}" x2="${X(i1).toFixed(1)}" y2="${Y(s.trend.m * opts.xs[i1] + s.trend.b).toFixed(1)}" stroke="${s.color}" stroke-width="1.6" stroke-dasharray="6 5" opacity="0.85"/>`);
              }
            }
          });
          let lx = padL + 4;
          sers.forEach((s) => {
            parts.push(`<rect x="${lx}" y="8" width="10" height="10" rx="3" fill="${s.color}"/>`);
            const label = escapeHtml(s.name);
            parts.push(`<text class="tm-legend" x="${lx + 15}" y="17">${label}</text>`);
            lx += 15 + label.length * 5.6 + 16;
          });
          return `<svg class="tm-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(opts.title || "chart")}">${parts.join("")}</svg>`;
        }

        function toneDeviation(delta, unitHigh, coolLow) {
          if (delta == null) return { tone: "near", txt: "—" };
          if (delta >= unitHigh) return { tone: "warm", txt: `+${localNum(delta, 1)}°` };
          if (delta <= coolLow) return { tone: "cool", txt: `${localNum(delta, 1)}°` };
          return { tone: "near", txt: `${delta >= 0 ? "+" : ""}${localNum(delta, 1)}°` };
        }

        function render(agg) {
          if (!el.content) return;
          const tv = todayValues();
          const md = todayMMDD();
          const dd = Number(md.slice(3, 5));
          const monthName = monthNameOf(Number(md.slice(0, 2)));
          const ar = isAr();
          const dateWord = tx(`${localNum(dd, 0)} ${monthName}`, `${monthName} ${dd}`);
          const yrs = agg.annual.years;
          const fromYear = agg.sameDay.length ? agg.sameDay[0].year : yrs[0];
          const toYear = yrs.length ? yrs[yrs.length - 1] : fromYear;
          const placeName = state.place?.name || tx("موقعك", "your area");
          const yearsRange = `${yearText(fromYear)} – ${yearText(toYear)}`;

          /* فروق اليوم عن المعتاد */
          const dMax = tv?.tmax != null && agg.sdMean.tmax != null ? tv.tmax - agg.sdMean.tmax : null;
          const dMin = tv?.tmin != null && agg.sdMean.tmin != null ? tv.tmin - agg.sdMean.tmin : null;
          const dPr = tv?.pr != null && agg.sdMean.pr != null ? tv.pr - agg.sdMean.pr : null;
          const toneMax = toneDeviation(dMax, 1.5, -1.5);
          const toneMin = toneDeviation(dMin, 1.5, -1.5);

          /* الخلاصة الكبيرة: جملة واحدة مفهومة تشرح اليوم بمقارنته بالمعتاد */
          let vTone = "near", vIcon = "ok", vTitle;
          if (toneMax.tone === "warm") {
            vTone = "warm"; vIcon = "fire";
            vTitle = tf2("اليوم أدفأ من المعتاد ({d})", { d: toneMax.txt });
          } else if (toneMax.tone === "cool") {
            vTone = "cool"; vIcon = "frost";
            vTitle = tf2("اليوم أبرد من المعتاد ({d})", { d: toneMax.txt });
          } else {
            vTone = "near"; vIcon = "ok";
            vTitle = tx("اليوم قريب من المعتاد", "Today is close to normal");
          }
          const vSub = tf2(ar
            ? "قارنّا طقس {d} من كل سنة بين {a} و{b} في {p} — والمعتاد هنا: أعلى {u}."
            : "We compared {d} of every year between {a} and {b} in {p} with today — the usual high here is {u}.",
            { d: dateWord, a: yearText(fromYear), b: yearText(toYear), p: placeName, u: tempText(agg.sdMean.tmax) });

          /* السجلات القياسية لنفس اليوم */
          const withT = agg.sameDay.filter((r) => r.tmax != null);
          const hot = withT.slice().sort((a, b) => b.tmax - a.tmax)[0] || null;
          const cold = withT.slice().sort((a, b) => a.tmax - b.tmax)[0] || null;
          const wet = agg.sameDay.slice().sort((a, b) => b.pr - a.pr)[0] || null;

          /* اتجاهات العشرين سنة (بكلمات بسيطة بلا مصطلحات) */
          const tSlope = agg.aTrend ? agg.aTrend.m * 10 : null; // °م لكل عقدة
          const pMean = mean(agg.annual.precip);
          const pSlopePct = agg.pTrend && pMean > 1 ? (agg.pTrend.m * 10 * 100) / pMean : null;
          const sdSlope = agg.sdTrend ? agg.sdTrend.m * 10 : null;

          /* الحقائق السريعة: ثلاث ملاحظات مباشرة */
          const fact = (icon, html) => `<span class="tm-fact">${iconSvg(icon, 15)}<span>${html}</span></span>`;
          const facts = [];
          if (tSlope == null) {
            facts.push(fact("thermo", escapeHtml(tx("السنوات المسجلة لا تكفي لاستخلاص اتجاه واضح للحرارة.", "The recorded years are too few to establish a clear temperature trend."))));
          } else if (tSlope >= 0.3) {
            facts.push(fact("fire", tf2("مناخ {p} يسخن ببطء: نحو <b>{v}°</b> كل عشر سنوات.", { p: escapeHtml(placeName), v: localNum(tSlope, 1) })));
          } else if (tSlope <= -0.3) {
            facts.push(fact("frost", tf2("مناخ {p} يبرد ببطء: نحو <b>{v}°</b> كل عشر سنوات.", { p: escapeHtml(placeName), v: localNum(Math.abs(tSlope), 1) })));
          } else {
            facts.push(fact("thermo", tf2("حرارة {p} السنوية شبه ثابتة عبر هذه السنين.", { p: escapeHtml(placeName) })));
          }
          if (pSlopePct == null) {
            facts.push(fact("water", escapeHtml(tx("بيانات المطر لا تكفي لاستخلاص اتجاه واضح.", "Rainfall data is not enough to establish a clear trend."))));
          } else if (pSlopePct <= -5) {
            facts.push(fact("dust", tf2("أمطار السنة تتراجع: نحو <b>{v}٪</b> كل عشر سنوات.", { v: localNum(Math.abs(pSlopePct), 0) })));
          } else if (pSlopePct >= 5) {
            facts.push(fact("water", tf2("أمطار السنة في زيادة: نحو <b>{v}٪</b> كل عشر سنوات.", { v: localNum(pSlopePct, 0) })));
          } else {
            facts.push(fact("water", escapeHtml(tx("مستوى الأمطار السنوي شبه مستقر خلال هذه الفترة.", "Yearly rainfall has been roughly stable in this period."))));
          }
          if (sdSlope != null && sdSlope >= 0.3) {
            facts.push(fact("thermo", tf2("هذا اليوم تحديدًا يزداد حرارة مع السنين: نحو <b>{v}°</b> كل عشر سنوات.", { v: localNum(sdSlope, 1) })));
          } else if (sdSlope != null && sdSlope <= -0.3) {
            facts.push(fact("frost", tf2("هذا اليوم تحديدًا يصبح أبرد مع السنين: نحو <b>{v}°</b> كل عشر سنوات.", { v: localNum(Math.abs(sdSlope), 1) })));
          } else {
            facts.push(fact("ok", escapeHtml(tx("لا تغيّر واضح في طقس هذا اليوم بين السنين.", "No clear change in this day's weather across the years."))));
          }
          /* سجلات هذا اليوم: أطر وأبرد وأكثر مطرًا */
          if (hot) facts.push(fact("sun", tf2("أطرف يوم كهذا: <b>{v}</b> عام {y}.", { v: tempText(hot.tmax), y: yearText(hot.year) })));
          if (cold) facts.push(fact("moon", tf2("أبرد يوم كهذا: <b>{v}</b> عام {y}.", { v: tempText(cold.tmin ?? cold.tmax), y: yearText(cold.year) })));
          if (wet) facts.push(fact("water", tf2("أكثر مطر في يوم كهذا: <b>{v} مم</b> عام {y}.", { v: localNum(wet.pr, 1), y: yearText(wet.year) })));

          /* شبكة العشرين سنة: كل مربع سنة بلون يوضح فرقها عن المعتاد */
          const kindWord = (k) => k === "hot" ? tx("أدفأ كثيرًا من المعتاد", "much hotter than usual")
            : k === "warm" ? tx("أدفأ من المعتاد", "hotter than usual")
              : k === "cool" ? tx("أبرد من المعتاد", "cooler than usual")
                : k === "cold" ? tx("أبرد كثيرًا من المعتاد", "much cooler than usual")
                  : tx("قريب من المعتاد", "near normal");
          const sdMeanMax = agg.sdMean.tmax;
          const chips = agg.sameDay.map((r, i) => {
            const dev = r.tmax != null && sdMeanMax != null ? r.tmax - sdMeanMax : null;
            const kind = dev == null ? "near" : dev >= 3 ? "hot" : dev >= 1 ? "warm" : dev <= -3 ? "cold" : dev <= -1 ? "cool" : "near";
            const label = tf2("سنة {y}: أعلى {v} — {k}", { y: yearText(r.year), v: tempText(r.tmax), k: kindWord(kind) });
            return `<button type="button" class="tm-yy" data-kind="${kind}" data-i="${i}" aria-pressed="false" aria-label="${escapeHtml(label)}">
                      <span class="tm-yyY">${yearText(r.year)}</span>
                      <span class="tm-yyT">${r.tmax != null ? tempText(r.tmax) : "—"}</span>
                    </button>`;
          }).join("");

          const html = `
          <div class="tm-hero">
            <p class="tm-kicker">${iconSvg("telescope", 13)} ${escapeHtml(tx("المناخ عبر عشرين سنة", "Climate over 20 years"))}</p>
            <h2>${escapeHtml(tf2("طقس اليوم ({d}) في مرآة 20 سنة", { d: dateWord }))}</h2>
            <p class="tm-sub">${escapeHtml(tx(
              "جمعنا طقس هذا اليوم من كل سنة في الأرشيف، وقارنّاه بطقس اليوم — بالأرقام الواضحة وبلا تعقيد.",
              "We gathered this day's weather from every year in the archive and compared it with today — clear numbers, no jargon."
            ))}</p>
            <div class="tm-verdict" data-tone="${vTone}">
              <span class="tm-vi" aria-hidden="true">${iconSvg(vIcon, 24)}</span>
              <span class="tm-vt">
                <strong>${escapeHtml(vTitle)}</strong>
                <small>${escapeHtml(vSub)}</small>
              </span>
            </div>
            <div class="tm-compare">
              <div class="tm-cell">
                <span class="tm-k">${iconSvg("thermo", 12)} ${escapeHtml(tx("أعلى درجة اليوم", "Today's high"))}</span>
                <div class="tm-v">${tempText(tv?.tmax)}</div>
                <div class="tm-d" data-tone="${toneMax.tone}">${toneMax.tone === "near" ? escapeHtml(tx("قريب من المعتاد", "near normal")) : `${toneMax.txt} ${escapeHtml(tx("عن المعتاد", "vs usual"))}`}</div>
                <small>${escapeHtml(tf2("المعتاد في مثل هذا اليوم: {v}", { v: tempText(agg.sdMean.tmax) }))}</small>
              </div>
              <div class="tm-cell">
                <span class="tm-k">${iconSvg("moon", 12)} ${escapeHtml(tx("أدنى درجة اليوم", "Today's low"))}</span>
                <div class="tm-v">${tempText(tv?.tmin)}</div>
                <div class="tm-d" data-tone="${toneMin.tone}">${toneMin.tone === "near" ? escapeHtml(tx("قريب من المعتاد", "near normal")) : `${toneMin.txt} ${escapeHtml(tx("عن المعتاد", "vs usual"))}`}</div>
                <small>${escapeHtml(tf2("المعتاد في مثل هذا اليوم: {v}", { v: tempText(agg.sdMean.tmin) }))}</small>
              </div>
              <div class="tm-cell">
                <span class="tm-k">${iconSvg("water", 12)} ${escapeHtml(tx("مطر اليوم", "Today's rain"))}</span>
                <div class="tm-v">${localNum(tv?.pr ?? 0, 1)} <small style="display:inline">${escapeHtml(tx("مم", "mm"))}</small></div>
                <div class="tm-d" data-tone="${dPr != null && dPr >= 0.2 ? "warm" : "near"}">${dPr == null ? "—" : dPr >= 0.2 ? escapeHtml(tx("أكثر من المعتاد", "wetter than usual")) : dPr <= -0.2 ? escapeHtml(tx("أقل من المعتاد", "drier than usual")) : escapeHtml(tx("قريب من المعتاد", "near normal"))}</div>
                <small>${escapeHtml(tf2("المعتاد في مثل هذا اليوم: {v} مم", { v: localNum(agg.sdMean.pr ?? 0, 1) }))}</small>
              </div>
            </div>
          </div>

          <section class="card section">
            <div class="sec-head">
              <div>
                <h2>${escapeHtml(tx("الخلاصة في نقاط سريعة", "Quick takeaways"))}</h2>
                <p class="hint">${escapeHtml(tx("ملاحظات مباشرة من بيانات عشرين سنة — بلا مصطلحات معقدة", "Straight from 20 years of data — no jargon"))}</p>
              </div>
              <span class="sec-badge">ERA5 · ${yearsRange}</span>
            </div>
            <div style="padding: 12px 16px 14px">
              <div class="tm-facts">${facts.join("")}</div>
            </div>
          </section>

          <section class="card section">
            <div class="sec-head">
              <div>
                <h2>${escapeHtml(tx("عشرون سنة في نظرة واحدة", "20 years at a glance"))}</h2>
                <p class="hint">${escapeHtml(tx("كل مربع سنة: الأحمر أدفأ من المعتاد والأزرق أبرد، والدرجة الأغمق فرق أكبر — اضغط أي مربع للتفاصيل.", "Each square is a year: red means hotter than usual, blue cooler; the deeper the shade, the bigger the gap. Tap for details."))}</p>
              </div>
              <span class="sec-badge">${yearsRange}</span>
            </div>
            <div style="padding: 12px 16px 10px">
              <div class="tm-grid" id="tm-years">${chips}</div>
              <p class="tm-year-detail" id="tm-year-detail" aria-live="polite">${escapeHtml(tx("اختر سنة لترى أرقام هذا اليوم فيها.", "Pick a year to see this day's numbers."))}</p>
            </div>
          </section>

          <section class="card section">
            <div class="sec-head">
              <div>
                <h2>${escapeHtml(tx("لمن يريد التعمق", "For those who want more"))}</h2>
                <p class="hint">${escapeHtml(tx("الرسوم البيانية الكاملة وقراءة عملية للتحول المناخي", "Full charts and a practical read of the climate shift"))}</p>
              </div>
              <span class="sec-badge">ERA5</span>
            </div>
            <details class="tm-more">
              <summary>${escapeHtml(tx("اعرض الرسوم البيانية والتحليل الكامل", "Show the full charts and analysis"))}</summary>
              <div style="padding: 4px 16px 6px">
                <div class="tm-block">
                  <p class="tm-block-title">${iconSvg("stock", 16)} ${escapeHtml(tx("نفس اليوم عبر العشرين سنة", "This same day across 20 years"))}</p>
                  <p class="tm-block-note">${escapeHtml(tf2("كل نقطة تمثل أعلى وأدنى حرارة سُجلتا في {d} خلال سنة — والخط المتقطع يوضح الاتجاه العام.", { d: dateWord }))}</p>
                  ${svgChart({
                    title: "same-day",
                    xs: agg.sameDay.map((r) => String(r.year).slice(2)),
                    series: [
                      { name: tx("العظمى", "High"), color: "#c2504a", ys: agg.sameDay.map((r) => r.tmax), trend: agg.sdTrend },
                      { name: tx("الصغرى", "Low"), color: "#336d99", ys: agg.sameDay.map((r) => r.tmin) },
                    ],
                    dec: 0,
                  })}
                  <p class="src-note">${escapeHtml(sdSlope == null
                    ? tx("السلسلة قصيرة لاستخلاص اتجاه موثوق لهذا اليوم تحديدًا.", "The series is too short for a reliable same-day trend.")
                    : (sdSlope >= 0.3
                      ? tf2("هذا اليوم يزداد حرارة بنحو {v}° كل عشر سنوات.", { v: localNum(Math.abs(sdSlope), 1) })
                      : sdSlope <= -0.3
                        ? tf2("هذا اليوم يبرد بنحو {v}° كل عشر سنوات.", { v: localNum(Math.abs(sdSlope), 1) })
                        : tx("لا اتجاه حراري واضح لهذا اليوم تحديدًا خلال العشرين سنة.", "No clear same-day trend over the 20 years.")))}</p>
                </div>
                <div class="tm-block">
                  <p class="tm-block-title">${iconSvg("fire", 16)} ${escapeHtml(tx("هل تسخن منطقتك عبر السنين؟", "Is your area warming up over the years?"))}</p>
                  <p class="tm-block-note">${escapeHtml(tx("متوسط حرارة السنة كاملة — صعود الخط المتقطع يعني احترارًا تدريجيًا.", "Full-year mean temperature — a rising dashed line means gradual warming."))}</p>
                  ${svgChart({
                    title: "annual temp",
                    xs: yrs.map((y) => String(y).slice(2)),
                    series: [{ name: tx("متوسط السنة", "Year mean"), color: "#8a4f1b", ys: agg.annual.temp, trend: agg.aTrend }],
                    dec: 1,
                  })}
                </div>
                <div class="tm-block">
                  <p class="tm-block-title">${iconSvg("water", 16)} ${escapeHtml(tx("وهل تصبح أكثر جفافًا؟", "And is it drying out?"))}</p>
                  <p class="tm-block-note">${escapeHtml(tx("مجموع مطر كل سنة بالملم — الأعمدة القصيرة تعني سنة أقل مطرًا.", "Yearly rainfall totals in mm — short bars mean a drier year."))}</p>
                  ${svgChart({
                    title: "annual rain",
                    xs: yrs.map((y) => String(y).slice(2)),
                    series: [{ name: tx("مطر السنة مم", "Year rain mm"), color: "#336d99", ys: agg.annual.precip, trend: agg.pTrend, bars: true }],
                    zeroBase: true,
                    dec: 0,
                  })}
                </div>
                <div class="advisories" style="padding: 10px 0 4px">${verdictCards(agg, { tSlope, pSlopePct, sdSlope }).join("")}</div>
              </div>
              <p class="src-note" style="padding: 0 17px 16px">${escapeHtml(tf(
                "المصدر: سجل ERA5 اليومي عبر Open-Meteo Archive ({a}–{b}) — قراءة استرشادية للاتجاهات طويلة المدى ولا تُغني عن بيانات الهيئات المناخية الرسمية.",
                { a: yearText(fromYear), b: yearText(toYear) }
              ))}</p>
            </details>
          </section>`;

          el.content.innerHTML = html;
          showContent();

          /* تفاعل شبكة السنين — تفويض أحداث واحد */
          const strip = $("#tm-years"), detail = $("#tm-year-detail");
          strip?.addEventListener("click", (e) => {
            const chip = e.target.closest(".tm-yy");
            if (!chip || !strip) return;
            $$(".tm-yy", strip).forEach((c) => c.setAttribute("aria-pressed", "false"));
            chip.setAttribute("aria-pressed", "true");
            const r = agg.sameDay[Number(chip.dataset.i) || 0];
            if (r && detail) {
              detail.textContent = tf2("في {y} كان هذا اليوم: أعلى {h} · أدنى {l} · مطر {p} مم{tail}",
                { y: yearText(r.year), h: tempText(r.tmax), l: tempText(r.tmin), p: localNum(r.pr, 1), tail: hot && r.year === hot.year ? tr(" — أطرف سنة في السجل") : "" });
            }
          });
        }


        function verdictCards(agg, tr3) {
          const ar = isAr();
          const { tSlope, pSlopePct, sdSlope } = tr3;
          const cards = [];
          const sevOf = (bad) => (bad ? "high" : "low");
          const sevTxt = { high: tx("يتطلب انتباهًا", "Needs attention"), low: tx("مستقر", "Stable") };
          if (tSlope != null) {
            const warming = tSlope >= 0.3;
            cards.push({
              icon: warming ? "fire" : "frost", sev: sevOf(warming),
              title: warming ? tx("اتجاه احترار — منطقتك تسخن", "Warming trend — your area is heating up") : warming === false && tSlope <= -0.3 ? tx("اتجاه تبريد — منطقتك تبرد", "Cooling trend — your area runs cooler") : tx("حرارة سنوية شبه مستقرة", "Near-stable annual temperature"),
              msg: warming
                ? tf2("متوسط حرارة سنتك يرتفع ~{v}° كل عشر سنوات. عمليًا: موجة حر أطول صيفًا، وطلب أعلى على مياه الري، ومواعيد زراعة شتوية أندر حرارة — فضل أصناف متحملة للحرارة وأنظمة تظليل للمواشي.", { v: localNum(tSlope, 1) })
                : tf2("التغير الحراري السنوي محدود (~{v}° لكل عقدة) — التخطيط الزراعي المعتاد يظل سليمًا مع مراقبة سنوية.", { v: localNum(Math.abs(tSlope), 1) }),
            });
          }
          if (pSlopePct != null) {
            const drying = pSlopePct <= -5, wetting = pSlopePct >= 5;
            cards.push({
              icon: drying ? "dust" : "water", sev: sevOf(drying),
              title: drying ? tx("اتجاه جفاف — مطرك يتقلص", "Drying trend — rainfall is shrinking") : wetting ? tx("اتجاه رطوبة — مطرك يزيد", "Wetting trend — rainfall is growing") : tx("مطر سنوي مستقر نسبيًا", "Relatively stable annual rain"),
              msg: drying
                ? tf2("مطر السنة يتراجع ~{v}٪ كل عقدة. عمليًا: جدد خطة تخزين مياه الأمطار، وأضف نشارة التربة لخفض البخر، ووزّع الري على فترات أقرب وأوفر.", { v: localNum(Math.abs(pSlopePct), 0) })
                : wetting
                  ? tf2("مطر السنة يتزايد ~{v}٪ كل عقدة — فرصة لتوسيع الزراعة البعلية مع تحسين مصارف المياه خوف الغرقان.", { v: localNum(pSlopePct, 0) })
                  : tx("لا تحول جوهري في مجموع المطر خلال هذه الفترة — راقب السنوات المتطرفة وحدها.", "No material shift in rainfall totals — watch the extreme years only."),
            });
          }
          if (sdSlope != null) {
            const warming = sdSlope >= 0.3;
            cards.push({
              icon: "thermo", sev: sevOf(warming),
              title: warming ? tx("هذا اليوم تحديدًا يزداد حرارة", "This very day is warming") : tx("هذا اليوم بلا اتجاه حاد", "No sharp trend for this day"),
              msg: warming
                ? tf2("نفس اليوم من كل سنة أصبح أدفأ ~{v}° لكل عقدة — كبار السن ومرضى القلب يحتاجون خطة تبريد أبكر في مثل هذا اليوم.", { v: localNum(sdSlope, 1) })
                : tx("تقلب هذا اليوم بين السنين يتصدر الاتجاه العام — انظر للسنة الأطر في الشريط أعلاه قبل الحكم.", "Year-to-year swing dominates here — check the extreme year in the strip before concluding."),
            });
          }
          return cards.map((a) => `
            <div class="adv-card" data-kind="${a.icon}">
              <span class="adv-title">${iconSvg(a.icon, 14)} ${escapeHtml(a.title)}<span class="adv-sev" data-sev="${a.sev}">${escapeHtml(sevTxt[a.sev])}</span></span>
              <p class="adv-msg">${a.msg}</p>
            </div>`);
        }

        /* tf2: قالب tx ثنائي اللغة مع تعويض placeholders يدويًا (بلا حاجة لمدخلات قاموس) */
        /* إصلاح 37: tf2 يمرّ القالب عبر القاموس tr() — فتحصل اللغات الست كلها
           على ترجمة حقيقية بدل الإنجليزية، والعربية تبقى النص الأصلي */
        function tf2(tpl, params = {}) {
          return tr(String(tpl ?? "")).replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
        }

        async function ensure() {
          const place = state.place;
          if (!place || loading) return;
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          if (cache.has(key)) { render(cache.get(key)); return; }
          setLoading();
          loading = true;
          try {
            const raw = await fetchArchive(place);
            const agg = aggregateArchive(raw.daily, todayMMDD());
            if (!agg.sameDay.length && !agg.annual.years.length) throw new Error(tx("سجل هذا الموقع غير متاح في الأرشيف.", "No archive coverage for this location."));
            const out = agg;
            cache.set(key, out);
            render(out);
          } catch (e) {
            console.error("timemachine", e);
            showError((e && e.message) || tx("تعذر جلب السجل — أعد المحاولة.", "Fetch failed — please retry."));
          } finally {
            loading = false;
          }
        }

        el.retry?.addEventListener("click", () => ensure());
        document.addEventListener("matar:language", () => {
          if (el.pane?.hidden || !cache.size) return;
          const key = `${state.place?.latitude?.toFixed(3)},${state.place?.longitude?.toFixed(3)}`;
          if (cache.has(key)) { try { render(cache.get(key)); } catch (e) {} }
        });

        function onPlaceChange() { cache.clear(); }

        /* خطافات الفحص الذاتي — رياضيات نقية فقط */
        window.__matarTimeMachineHooks = { linreg, aggregateArchive, clampFromReason, safeRange, mean };

        return { ensure, onPlaceChange };
      })();

      /* ============================================================
         إصدار 19 — صفحة «جوّك اليوم» (Joq · نشاطك وفق الجو)
         ------------------------------------------------------------
         ① الرياضيون: أفضل ساعات التمرين (حرارة+رطوبة+رياح+مطر)،
            تحذير الإجهاد الحراري بمؤشر الحرارة الحقيقي (Rothfusz NWS)،
            ومقياس رياح الدراجين (مواجهة/خلفية/جانبية باتجاه قابل للاختيار).
         ② البحار والصيد: جدول حالة البحر (ارتفاع/اتجاه/دور الموج + حرارة
            السطح)، مؤشر نشاط الأسماك من ميل الضغط 3 ساعات، وأمان السباحة.
         ③ الدرونز: رياح السطح و950hPa و850hPa + إشارة إقلاع خضراء/حمراء
            من الهبّات والسحب المنخفضة والرؤية والمطر.
         ④ الصحة: جودة الهواء PM2.5/PM10/الغبار، محفز الصداع النصفي
            من تغير الضغط، وتنبيه القفزة الحرارية اليومية لكبار السن.
         كل الطلبات صغيرة ومخبأة لكل موقع، وكل قسم ينهار بأمان إن غاب
         مصدره (بحر غير ساحلي، وضع اقتصادي…) دون إسقاط بقية الصفحة.
         ============================================================ */
      const Joq = (() => {
        const el = {
          page: () => $("#page-joq"), loading: $("#joq-loading"), error: $("#joq-error"),
          errorMsg: $("#joq-error-msg"), content: $("#joq-content"), retry: $("#joq-retry"),
          chip: $("#joq-loc-chip"),
          sportVerdict: $("#joq-sport-verdict"), hours: $("#joq-best-hours"),
          heatTitle: $("#joq-heat-title"), heatMsg: $("#joq-heat-msg"), heatWhen: $("#joq-heat-when"), heatCard: $("#joq-heat-card"),
          compass: $("#bike-compass"), choices: $("#bike-choices"), bikeResult: $("#bike-result"),
          seaTable: $("#joq-sea-table"), marineZone: $("#joq-marine-zone"), marineMissing: $("#joq-marine-missing"),
          fishTitle: $("#joq-fish-title"), fishMsg: $("#joq-fish-msg"), fishWhen: $("#joq-fish-when"), fishCard: $("#joq-fish-card"),
          swimTitle: $("#joq-swim-title"), swimMsg: $("#joq-swim-msg"), swimWhen: $("#joq-swim-when"), swimCard: $("#joq-swim-card"),
          altGrid: $("#joq-alt-grid"),
          droneTitle: $("#joq-drone-title"), droneMsg: $("#joq-drone-msg"), droneFactors: $("#joq-drone-factors"), droneCard: $("#joq-drone-card"),
          aqiTitle: $("#joq-aqi-title"), aqiMsg: $("#joq-aqi-msg"), aqiWhen: $("#joq-aqi-when"), aqiCard: $("#joq-aqi-card"),
          migTitle: $("#joq-migraine-title"), migMsg: $("#joq-migraine-msg"), migWhen: $("#joq-migraine-when"), migCard: $("#joq-migraine-card"),
          shiftTitle: $("#joq-shift-title"), shiftMsg: $("#joq-shift-msg"), shiftWhen: $("#joq-shift-when"), shiftCard: $("#joq-shift-card"),
          /* إصدار 27: حاسبة الإجهاد الحراري WBGT + مؤشر جفاف الملابس */
          wbgtCard: $("#joq-wbgt-card"), wbgtTitle: $("#joq-wbgt-title"), wbgtMsg: $("#joq-wbgt-msg"),
          wbgtWhen: $("#joq-wbgt-when"), wbgtScale: $("#joq-wbgt-scale"),
          laundryCard: $("#joq-laundry-card"), laundryTitle: $("#joq-laundry-title"), laundryMsg: $("#joq-laundry-msg"),
          laundryWhen: $("#joq-laundry-when"), laundryEta: $("#joq-laundry-eta"),
          /* إصدار 28: بطاقة غسيل السيارة */
          carwashCard: $("#joq-carwash-card"), carwashTitle: $("#joq-carwash-title"), carwashMsg: $("#joq-carwash-msg"),
          carwashWhen: $("#joq-carwash-when"), carwashEta: $("#joq-carwash-eta"),
        };

        const extraCache = new Map(); // "lat,lon" → { marine, plevels, yday }
        let rendering = false;
        let bikeHeading = 0; // اتجاه سير الدراجة بالدرجات (0 = شمال)
        const DIRS = [
          [0, "شمال"], [45, "شمال شرق"], [90, "شرق"], [135, "جنوب شرق"],
          [180, "جنوب"], [225, "جنوب غرب"], [270, "غرب"], [315, "شمال غرب"],
        ];

        /* قالب ثنائي اللغة مع تعويض {k} يدويًا — نفس أسلوب آلة الزمن */
        function tpl(str, params = {}) {
          return String(str).replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
        }

        /* ── ① رياضيات نقية (خطافات الفحص الذاتي) ── */
        /* مؤشر الحرارة الحراري Rothfusz (NWS) — يدخل مئوية ورطوبة٪ ويعيد إحساسًا حراريًا مئويًا أو null تحت 27°م */
        function heatIndexC(tC, rh) {
          if (tC == null || rh == null) return null;
          const tF = tC * 9 / 5 + 32;
          if (tF < 80) return null;
          let hi = -42.379 + 2.04901523 * tF + 10.14333127 * rh - 0.22475541 * tF * rh
            - 6.83783e-3 * tF * tF - 5.481717e-2 * rh * rh
            + 1.22874e-3 * tF * tF * rh + 8.5282e-4 * tF * rh * rh - 1.99e-6 * tF * tF * rh * rh;
          if (rh < 13 && tF >= 80 && tF <= 112) hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
          else if (rh > 85 && tF >= 80 && tF <= 87) hi += ((rh - 85) / 10) * ((87 - tF) / 5);
          return (hi - 32) * 5 / 9;
        }

        /* درجة ملاءمة الساعة للجهد العالي 0-100 */
        function exerciseScore(tC, rh, windKmh, prProb) {
          if (tC == null) return null;
          // الحرارة: مثالي 13-24°م، انحدار خطي إلى الصفر عند -4 و 40
          let tS;
          if (tC >= 13 && tC <= 24) tS = 1;
          else if (tC < 13) tS = clamp((tC + 4) / 17, 0, 1);
          else tS = clamp((40 - tC) / 16, 0, 1);
          // الرطوبة: حتى 55٪ ممتازة ثم تنخفض تدريجيًا
          const hS = rh == null ? 0.8 : (rh <= 55 ? 1 : rh >= 95 ? 0.35 : 1 - ((rh - 55) / 40) * 0.65);
          // الرياح: حتى 15 كم/س ممتازة
          const wS = windKmh == null ? 0.8 : (windKmh <= 15 ? 1 : windKmh >= 45 ? 0.45 : 1 - ((windKmh - 15) / 30) * 0.55);
          // المطر المحتمل
          const rS = prProb == null ? 0.9 : 1 - clamp(prProb, 0, 100) / 100 * 0.7;
          return Math.round(100 * (0.42 * tS + 0.26 * hS + 0.18 * wS + 0.14 * rS));
        }

        /* ── إصدار 27: حاسبة الإجهاد الحراري WBGT (Wet Bulb Globe Temperature) ──
           التقريب المعتمد لمكتب الأرصاد الأسترالي (BOM):
             e   = (RH/100) × 6.105 × exp(17.27×T / (237.7+T))   [ضغط بخار الماء hPa]
             WBGT = 0.567×T + 0.393×e + 3.94
           الفئات (مستندين ACGIH/الرياضة الخارجية):
             <25 آمن · 25–28 حذر · 28–31 خطر إجهاد حراري · ≥31 ممنوع التمرين
           دالة نقية تُستخدم في البطاقة وخطافات الفحص الذاتي. */
        function wbgtC(tC, rh) {
          if (tC == null || rh == null) return null;
          const e = (rh / 100) * 6.105 * Math.exp((17.27 * tC) / (237.7 + tC));
          return 0.567 * tC + 0.393 * e + 3.94;
        }
        function wbgtBand(w) {
          if (w == null) return "unknown";
          if (w < 25) return "safe";
          if (w < 28) return "caution";
          if (w < 31) return "stress";
          return "stop";
        }

        /* ── إصدار 27: درجة تجفيف الملابس 0–100 (Laundry Index) ──
           تُرجع الدرجات الفردية كذلك كي تعرضها البطاقة كتفاصيل:
           الرطوبة السطحية 32٪ + أشعة الشمس 26٪ + الرياح 22٪ + الحرارة 20٪
           — v70/C-02: يُخصم الغطاء السحابي من المجموع كلما زاد (cloudS)
             فلا تظهر نسبة 100٪ أبدًا مع سحب 100٪ (خصم يبلغ 45 نقطة). */
        function laundryScore(tC, rh, windKmh, uv, cloudPct) {
          if (tC == null && rh == null && windKmh == null && uv == null && cloudPct == null) return null;
          const rhS = rh == null ? 0.7 : clamp((100 - rh) / 70, 0.08, 1);      // الجفاف أفضل
          const sunS = uv == null ? 0.5 : clamp(uv / 7, 0.06, 1);              // الشمس تسرّع البخر
          const windS = windKmh == null ? 0.5 : clamp(windKmh / 18, 0.12, 1);  // النسيم يجفف
          const tS = tC == null ? 0.5 : clamp((tC + 5) / 35, 0.08, 1);         // الدفء يرفع التبخر
          const cloudS = laundryCloudPenalty(cloudPct);                        // v70 — C-02: خصم السحب
          return {
            score: Math.round(100 * (0.32 * rhS + 0.26 * sunS + 0.22 * windS + 0.2 * tS) * cloudS),
            rhS, sunS, windS, tS, cloudS,
          };
        }
        /* وقت التجفيف المتوقع بالساعات من الدرجة (معايرة عملية: 90 ≈ 3 س، 60 ≈ 4 س، 40 ≈ 6 س، 15 ≈ 16 س) */
        function laundryHours(score) {
          if (score == null) return null;
          return clamp(Math.round(240 / Math.max(score, 12)), 1, 24);
        }

        /* مكونات رياح الدراج: موجب = مواجهة، سالب = خلفية */
        function bikeWind(windFromDeg, speedKmh, headingDeg) {
          const facing = (((windFromDeg - headingDeg) % 360) + 360) % 360;
          const rad = facing * Math.PI / 180;
          return {
            facing,
            head: speedKmh * Math.cos(rad),
            cross: Math.abs(speedKmh * Math.sin(rad)),
          };
        }

        /* نشاط الأسماك من ميل الضغط خلال 3 ساعات (hPa) */
        function fishActivity(dp3) {
          if (dp3 == null) return { kind: "unknown", sev: "low" };
          if (dp3 <= -2) return { kind: "very-high", sev: "high" };
          if (dp3 <= -0.8) return { kind: "high", sev: "low" };
          if (dp3 < 0.8) return { kind: "normal", sev: "low" };
          if (dp3 < 2) return { kind: "low", sev: "low" };
          return { kind: "very-low", sev: "high" };
        }

        /* أمان السباحة: هبّات الرياح + ارتفاع الموج (م) */
        function swimSafety(gustKmh, waveM) {
          const wave = waveM == null ? 0 : waveM, gust = gustKmh == null ? 0 : gustKmh;
          if (wave >= 2.2 || gust >= 45) return "danger";
          if (wave >= 1.2 || gust >= 30) return "caution";
          return "safe";
        }

        /* إشارة إقلاع الدرون من عوامل منفصلة */
        function droneVerdict(f) {
          const factors = [];
          if (f.gust != null) factors.push({ key: "gust", v: f.gust > 38 ? "fail" : f.gust > 25 ? "warn" : "pass" });
          if (f.wind850 != null) factors.push({ key: "wind850", v: f.wind850 > 50 ? "fail" : f.wind850 > 35 ? "warn" : "pass" });
          const lowCloud = f.cloudLow != null ? f.cloudLow : (f.cloudTotal != null && f.cloudTotal > 80 ? f.cloudTotal : null);
          if (lowCloud != null) factors.push({ key: "cloud", v: lowCloud > 70 ? "fail" : lowCloud > 45 ? "warn" : "pass" });
          if (f.vis != null) factors.push({ key: "vis", v: f.vis < 4000 ? "fail" : f.vis < 8000 ? "warn" : "pass" });
          if (f.precip != null || f.code != null) {
            const wet = (f.precip ?? 0) > 0.2 || (f.code ?? 0) >= 51;
            factors.push({ key: "rain", v: wet ? "fail" : "pass" });
          }
          const fails = factors.filter((x) => x.v === "fail").length;
          const warns = factors.filter((x) => x.v === "warn").length;
          return { factors, verdict: fails ? "no" : warns >= 2 ? "caution" : "go" };
        }

        /* ميل الضغط بالساعات — قراءة الآن وقراءة بعد 3 ساعات */
        function pressureDelta(p, idx, hours = 3) {
          if (!p || idx == null || idx < hours) return null;
          const now = p[idx], before = p[idx - hours];
          if (now == null || before == null) return null;
          return now - before;
        }

        function aqiAdvice(usAqi) {
          if (usAqi == null) return null;
          if (usAqi <= 50) return { sev: "low", msg: tx("هواء نظيف — يوم مثالي للجري والأنشطة الخارجية بلا قيود حتى لمرضى الربو.", "Clean air — a great day for outdoor effort, even for asthmatics.") };
          if (usAqi <= 100) return { sev: "low", msg: tx("مقبولة عمومًا — مرضى الربو والحساسون يقللون الجهد الشاق الطويل في الهواء الطلق.", "Acceptable — asthmatics and the sensitive should shorten hard outdoor sessions.") };
          if (usAqi <= 150) return { sev: "warn", msg: tx("ضارة للحساسين — احمل بخاخك، اختر مسارات بعيدة عن الشوارع المزدحمة، وأجّل التمارين الشاقة.", "Unhealthy for the sensitive — carry your inhaler, avoid traffic corridors, postpone hard workouts.") };
          if (usAqi <= 200) return { sev: "high", msg: tx("غير صحية — تجنب الجهد الخارجي، أغلق النوافذ وقت ذروة الغبار، وارتدِ كمامة في الأماكن المفتوحة.", "Unhealthy — skip outdoor exertion, keep windows shut at dust peaks, mask up outside.") };
          return { sev: "high", msg: tx("خطيرة — ابق داخلًا قدر الإمكان وفعّل جهاز تنقية الهواء إن وُجد.", "Hazardous — stay indoors as much as possible and run an air purifier if you have one.") };
        }

        /* ── ② الجلبات الصغيرة الخاصة بالصفحة (كل واحدة تنهار بأمان) ── */
        async function fetchMarine(place) {
          const u = new URL("https://marine-api.open-meteo.com/v1/marine");
          u.search = new URLSearchParams({
            latitude: place.latitude.toFixed(3), longitude: place.longitude.toFixed(3),
            hourly: "wave_height,wave_direction,wave_period,sea_surface_temperature",
            timezone: "auto", forecast_days: "3",
          });
          const d = await getJson(u);
          const wh = d?.hourly?.wave_height ?? [];
          return wh.some((v) => v != null) ? d : null; // موقع داخلي بلا موج ← نعتبرها لا بيانات
        }

        async function fetchPressure(place) {
          const u = new URL("https://api.open-meteo.com/v1/forecast");
          u.search = new URLSearchParams({
            latitude: String(place.latitude), longitude: String(place.longitude),
            hourly: "wind_speed_950hPa,wind_direction_950hPa,wind_speed_850hPa,wind_direction_850hPa,temperature_850hPa,cloud_cover_low,cloud_cover_mid",
            timezone: "auto", forecast_days: "2", wind_speed_unit: "kmh",
          });
          return getJson(u);
        }

        async function fetchYesterday(place) {
          const u = new URL("https://api.open-meteo.com/v1/forecast");
          u.search = new URLSearchParams({
            latitude: String(place.latitude), longitude: String(place.longitude),
            daily: "temperature_2m_max,temperature_2m_min",
            past_days: "1", forecast_days: "1", timezone: "auto",
          });
          return getJson(u);
        }

        async function fetchExtra(place) {
          const key = `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
          if (extraCache.has(key)) return extraCache.get(key);
          const [marine, plevels, yday] = await Promise.allSettled([
            fetchMarine(place),
            Eco.isEco() ? Promise.resolve(null) : fetchPressure(place),
            fetchYesterday(place),
          ]);
          const out = {
            marine: marine.status === "fulfilled" ? marine.value : null,
            plevels: plevels.status === "fulfilled" ? plevels.value : null,
            yday: yday.status === "fulfilled" ? yday.value : null,
          };
          extraCache.set(key, out);
          return out;
        }

        /* ── ③ مساعدات العرض ── */
        const cardState = (card, sev) => {
          if (!card) return;
          card.removeAttribute("data-state");
          if (sev === "high") card.setAttribute("data-state", "danger");
          else if (sev === "warn") card.setAttribute("data-state", "warn");
        };
        const setAdv = (card, t, m, w, sev) => {
          if (!card) return;
          const ids = { [card.id]: true };
          card.querySelector(".adv-title").innerHTML = t;
          card.querySelector(".adv-msg").textContent = m;
          const when = card.querySelector(".adv-when");
          if (when) when.textContent = w || "";
          card.removeAttribute("data-state");
          if (sev === "high") card.setAttribute("data-state", "danger");
          else if (sev === "warn") card.setAttribute("data-state", "warn");
        };

        function compassSVG(facing, tone) {
          const color = tone === "head" ? "var(--danger)" : tone === "tail" ? "var(--ok)" : "var(--gold-deep)";
          return `<svg viewBox="0 0 120 120" width="118" height="118" fill="none">
            <circle cx="60" cy="60" r="52" stroke="var(--line)" stroke-width="1.5"/>
            <circle cx="60" cy="60" r="44" stroke="var(--line)" stroke-width="0.8" stroke-dasharray="2 4"/>
            <text x="60" y="16" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="inherit">N</text>
            <g stroke="var(--teal)" stroke-width="3" stroke-linecap="round">
              <line x1="60" y1="104" x2="60" y2="34"/>
              <path d="M60 24l-6 12h12Z" fill="var(--teal)" stroke="none"/>
            </g>
            <text x="60" y="116" text-anchor="middle" font-size="8.5" fill="var(--teal)" font-family="inherit" font-weight="700">${escapeHtml(tx("أنت", "you"))}</text>
            <g transform="rotate(${facing.toFixed(0)} 60 60)" stroke="${color}" stroke-width="2.6" stroke-linecap="round">
              <line x1="60" y1="18" x2="60" y2="42"/>
              <path d="M60 50l-5.5-9h11Z" fill="${color}" stroke="none"/>
            </g>
          </svg>`;
        }

        function renderSport(wx, idx) {
          const h = wx.hourly;
          const N = Math.min(12, (h.time?.length ?? 0) - idx);
          const rows = [];
          for (let k = 0; k < N; k += 1) {
            const i = idx + k;
            const sc = exerciseScore(h.temperature_2m?.[i], h.relative_humidity_2m?.[i], h.wind_speed_10m?.[i], h.precipitation_probability?.[i]);
            if (sc == null) continue;
            rows.push({ i, sc, t: h.temperature_2m?.[i], rh: h.relative_humidity_2m?.[i], w: h.wind_speed_10m?.[i] });
          }
          const grade = (sc) => (sc >= 70 ? "good" : sc >= 45 ? "fair" : "poor");
          const best = rows.slice().sort((a, b) => b.sc - a.sc)[0];
          const bestSet = new Set(rows.slice().sort((a, b) => b.sc - a.sc).slice(0, 3).map((r) => r.i));
          if (el.hours) {
            el.hours.innerHTML = rows.map((r) => `
              <div class="jh-cell${bestSet.has(r.i) ? " best" : ""}" role="listitem">
                <span class="jh-time">${escapeHtml((h.time[r.i] || "").slice(11, 16) || "—")}</span>
                <div class="jh-score" data-v="${grade(r.sc)}">${localNum(r.sc)}</div>
                <div class="jh-bar"><b data-v="${grade(r.sc)}" style="width:${clamp(r.sc, 4, 100)}%"></b></div>
                <div class="jh-meta">${tempText(r.t)} · ${localNum(r.rh)}٪<br>${localNum(r.w)} ${escapeHtml(tx("كم/س", "km/h"))}</div>
              </div>`).join("") || `<p class="joq-note">${escapeHtml(tx("لا صفوف كافية لعرض الساعات.", "Not enough rows to show hourly cells."))}</p>`;
          }
          /* الخلاصة العلوية */
          const curHI = heatIndexC(h.temperature_2m?.[idx], h.relative_humidity_2m?.[idx]);
          const sportBits = [];
          if (best) sportBits.push(tpl(tx("أفضل نافذة تمرين اليوم: {h} بدرجة {s} من 100", "Best training window today: {h} scoring {s}/100"), { h: (h.time[best.i] || "").slice(11, 16), s: localNum(best.sc) }));
          sportBits.push(curHI == null
            ? tx("الإجهاد الحراري: لا خطر حاليًا — الجو يسمح بتبريد الجسم طبيعيًا.", "Heat stress: currently safe — your body can cool itself normally.")
            : tpl(tx("الإجهاد الحراري الآن: إحساس حراري {v} — انظر بطاقة التحذير.", "Heat stress now: heat index {v} — see the warning card."), { v: tempText(curHI) }));
          if (el.sportVerdict) el.sportVerdict.innerHTML = `<b>${escapeHtml(tx("خلاصة الرياضي:", "Athlete summary:"))}</b> ${escapeHtml(sportBits.join(" · "))}`;

          /* بطاقة الإجهاد الحراري: أسوأ إحساس خلال 8 ساعات */
          let worstHI = curHI, worstAt = idx;
          for (let k = 0; k < Math.min(8, N); k += 1) {
            const v = heatIndexC(h.temperature_2m?.[idx + k], h.relative_humidity_2m?.[idx + k]);
            if (v != null && (worstHI == null || v > worstHI)) { worstHI = v; worstAt = idx + k; }
          }
          if (worstHI == null) {
            setAdv(el.heatCard, `${iconSvg("ok", 14)} ${escapeHtml(tx("لا إجهاد حراري متوقع", "No heat stress expected"))}`,
              tx("الحرارة والرطوبة معًا منخفضتان بما يكفي ليبرد جسمك بالعرق بفعالية — الوقت مناسب للتمارين المكثفة.", "Temperature and humidity are low enough for effective sweat cooling — good conditions for intense training."),
              tx("فحص لآخر 8 ساعات", "checked over the next 8 hours"), "low");
          } else {
            const hiSev = worstHI >= 40.5 ? "high" : worstHI >= 32.2 ? "warn" : "low";
            const hiMsg = hiSev === "high"
              ? tx("خطر إجهاد حراري: الحرارة والرطوبة معًا يمنعان تبريد الجسم بالعرق — أجّل التمرين الشاق، أو انقل مساءً، مع ماء كل 15 دقيقة وفضل الظل.", "Dangerous heat stress: heat plus humidity block sweat cooling — postpone hard sessions or move them to the evening, hydrate every 15 minutes and favour shade.")
              : hiSev === "warn"
                ? tx("حذر: الرطوبة تضاعف إحساس الحرارة — قلّل كثافة التمرين، اختر ظلًا، واشرب ماءً إضافيًا قبل الشعور بالعطش.", "Caution: humidity multiplies the felt heat — dial intensity down, stay in shade and drink before you feel thirsty.")
                : tx("الإحساس الحراري مقبول — التمرين ممكن مع مراقبة الماء والراحة في الظل بين الفترات.", "Heat index acceptable — training is fine with water breaks and shade between sets.");
            setAdv(el.heatCard, `${iconSvg(hiSev === "low" ? "ok" : "warn", 14)} ${escapeHtml(tx("تحذير الإجهاد الحراري (Heat Index)", "Heat-stress warning (Heat Index)"))} <span class="adv-sev" data-sev="${hiSev}">${escapeHtml(tempText(worstHI))}</span>`,
              hiMsg,
              tpl(tx("الذروة المتوقعة حوالي {h}", "Peak expected around {h}"), { h: (h.time[worstAt] || "").slice(11, 16) }), hiSev);
          }

          /* مقياس الدراجين */
          const ws = h.wind_speed_10m?.[idx] ?? 0, wd = h.wind_direction_10m?.[idx] ?? 0, gu = h.wind_gusts_10m?.[idx];
          updateBike(ws, wd, gu);
        }

        function updateBike(ws, wd, gust) {
          if (!el.bikeResult) return;
          const bw = bikeWind(wd, ws, bikeHeading);
          const facingName = tr(DIRS.reduce((best2, d) => (Math.abs(d[0] - bw.facing) < Math.abs(best2[0] - bw.facing) ? d : best2), DIRS[0])[1]);
          let tone, txt;
          if (ws < 5) {
            tone = "cross";
            txt = tx("رياح هادئة — لن تؤثر إطلاقًا على رحلتك مهما كان الاتجاه.", "Calm winds — they won't affect your ride in any direction.");
          } else if (bw.head >= 2) {
            tone = "head";
            txt = tpl(tx("رياح مواجهة {v} كم/س قادمة من {d} — تُصعّب الدفع: خفف السرعة، اختر تروس أخف، ونزل من الدراجة في الهبّات فوق {g} كم/س.", "Headwind {v} km/h from {d} — it slows your push: ease the pace, gear down, and dismount in gusts above {g} km/h."), { v: localNum(bw.head, 0), d: tr(facingName), g: localNum(Math.max(gust ?? ws, ws)) });
          } else if (bw.head <= -2) {
            tone = "tail";
            txt = tpl(tx("رياح خلفية تدفعك بـ {v} كم/س — استغل الدفع المجاني مع انتباه للانحراف عند العوائد.", "Tailwind pushing you {v} km/h — enjoy the free boost but watch drift on turns."), { v: localNum(Math.abs(bw.head), 0) });
          } else {
            tone = "cross";
            txt = tpl(tx("رياح جانبية ~{v} كم/س من {d} — أمسك المقود بإحكام؛ الجانبية أخطر من المواجهة عند التقاطعات والجسور.", "Crosswind ~{v} km/h from {d} — grip firmly; crosswinds are trickier than headwinds at junctions and bridges."), { v: localNum(bw.cross, 0), d: tr(facingName) });
          }
          el.bikeResult.innerHTML = `<b data-tone="${tone}">${escapeHtml(tx({ head: "مواجهة", tail: "خلفية", cross: "جانبية" }[tone], { head: "Headwind", tail: "Tailwind", cross: "Crosswind" }[tone]))}:</b> ${escapeHtml(txt)}`;
          if (el.compass) el.compass.innerHTML = compassSVG(bw.facing, tone);
        }

        function wireBike() {
          if (!el.choices || el.choices.dataset.wired) return;
          el.choices.dataset.wired = "1";
          el.choices.innerHTML = DIRS.map(([deg, name]) => `<button type="button" data-deg="${deg}" aria-pressed="${deg === bikeHeading}">${escapeHtml(tr(name))}</button>`).join("");
          el.choices.addEventListener("click", (e) => {
            const b = e.target.closest("button[data-deg]");
            if (!b) return;
            bikeHeading = Number(b.dataset.deg) || 0;
            $$("button", el.choices).forEach((x) => x.setAttribute("aria-pressed", String(Number(x.dataset.deg) === bikeHeading)));
            const h = state.wx?.hourly, idx = state.wx ? hourIndexAtPlace(state.wx) : 0;
            if (h) updateBike(h.wind_speed_10m?.[idx] ?? 0, h.wind_direction_10m?.[idx] ?? 0, h.wind_gusts_10m?.[idx]);
          });
        }

        /* ── إصدار 27: بطاقة الإجهاد الحراري WBGT (قسم الصحة) ── */
        function renderWbgt(wx, idx) {
          if (!el.wbgtCard || !el.wbgtTitle) return;
          const h = wx.hourly;
          const cur = wbgtC(h.temperature_2m?.[idx], h.relative_humidity_2m?.[idx]);
          /* الذروة خلال 8 ساعات قادمة */
          let peak = cur, peakAt = idx;
          for (let k = 0; k < Math.min(9, (h.time?.length ?? 0) - idx); k += 1) {
            const w = wbgtC(h.temperature_2m?.[idx + k], h.relative_humidity_2m?.[idx + k]);
            if (w != null && (peak == null || w > peak)) { peak = w; peakAt = idx + k; }
          }
          const band = wbgtBand(cur);
          const peakBand = wbgtBand(peak);
          if (cur == null) {
            setAdv(el.wbgtCard, `${iconSvg("thermo", 14)} ${escapeHtml(tx("مؤشر الإجهاد الحراري WBGT", "WBGT heat-stress index"))}`,
              tx("بيانات الحرارة أو الرطوبة غير متاحة لحساب المؤشر الآن.", "Temperature or humidity data unavailable for the index right now."), "", "low");
            if (el.wbgtScale) el.wbgtScale.innerHTML = "";
            return;
          }
          const bandTxt = {
            safe: [tx("آمن — تمرين بحرية كاملة", "Safe — train freely"), tx("الجسم يبرد نفسه بكفاءة (WBGT أقل من 25°م) — التمرين الشاق والسباقات مسموحة مع شرب الماء المعتاد.", "Your body cools efficiently (WBGT below 25°C) — hard sessions and races are fine with normal hydration.")],
            caution: [tx("حذر — خفّف الشدة واشرب أكثر", "Caution — ease off and hydrate"), tx("الإجهاد يتراكم تدريجيًا (25–28°م): قلّل شدة التمرين 20–30٪، خذ استراحات في الظل كل 20 دقيقة، وراقب الدوخة أو توقف العرق.", "Strain builds up (25–28°C): cut intensity 20–30%, take shade breaks every 20 minutes, and watch for dizziness.")],
            stress: [tx("خطر إجهاد حراري — جهد خفيف فقط", "Heat-stress danger — light effort only"), tx("التبريد بالعرق يكاد يتوقف (28–31°م): ممنوع التمارين الشاقة والسباقات — جهد خفيف قصير فقط، وزميل يراقبك، وماء بارد كل 10 دقائق.", "Sweat cooling has nearly stopped (28–31°C): no hard sessions or races — short light effort only, with a buddy watching and cool water every 10 minutes.")],
            stop: [tx("ممنوع التمرين الخارجي", "Outdoor exercise forbidden"), tx("ظروف خطرة على الحياة (WBGT ≥ 31°م): أجّل أي نشاط خارجي إطلاقًا — خطر ضربة الشمس يتجاوز أي فائدة تدريبية، وابقَ في مكان مكيّف.", "Life-threatening conditions (WBGT ≥ 31°C): postpone all outdoor activity — heatstroke risk outweighs any training benefit; stay in air conditioning.")],
          }[band];
          const sev = band === "safe" ? "low" : band === "caution" ? "warn" : band === "stress" ? "warn" : "high";
          setAdv(el.wbgtCard, `${iconSvg(band === "safe" ? "ok" : band === "stop" ? "fire" : "warn", 14)} ${escapeHtml(tx("مؤشر الإجهاد الحراري (WBGT)", "Heat-stress index (WBGT)"))} <span class="adv-sev" data-sev="${sev}">${escapeHtml(tempText(cur))}</span>`,
            bandTxt[1],
            peakAt !== idx && peak != null ? tpl(tx("ذروة المؤشر {v} حوالي {h}", "Peak {v} around {h}"), { v: tempText(peak), h: (h.time[peakAt] || "").slice(11, 16) }) : tx("قراءة الظل خارج الشمس المباشرة", "shade reading, out of direct sun"),
            sev);
          if (el.wbgtScale) {
            const segs = [
              ["safe", tx("آمن", "Safe"), "<25°"],
              ["caution", tx("حذر", "Caution"), "25–28°"],
              ["stress", tx("خطر إجهاد", "Stress"), "28–31°"],
              ["stop", tx("ممنوع", "Forbidden"), "≥31°"],
            ];
            el.wbgtScale.innerHTML = segs.map(([v, name, rng]) => `<span class="wbgt-seg" data-v="${v}" data-on="${v === band || v === peakBand}"><b>${escapeHtml(rng)}</b>${escapeHtml(name)}</span>`).join("");
          }
        }

        /* ── إصدار 27: بطاقة جفاف الملابس (Laundry Index) ── */
        function renderLaundry(wx, idx) {
          if (!el.laundryCard || !el.laundryTitle) return;
          const h = wx.hourly;
          const now = laundryScore(h.temperature_2m?.[idx], h.relative_humidity_2m?.[idx], h.wind_speed_10m?.[idx], h.uv_index?.[idx], h.cloud_cover?.[idx]); /* v70 — C-02 */
          if (!now) {
            setAdv(el.laundryCard, `${iconSvg("basket", 14)} ${escapeHtml(tx("مؤشر جفاف الملابس", "Laundry-drying index"))}`,
              tx("بيانات الطقس غير كافية لحساب المؤشر الآن.", "Not enough weather data to compute the index right now."), "", "low");
            return;
          }
          /* أفضل نافذة نشر خلال 14 ساعة قادمة (نتخطى الليل بلا شمس إلا إن كانت الرياح قوية) */
          let bestI = idx, bestSc = -1;
          for (let k = 0; k < Math.min(15, (h.time?.length ?? 0) - idx); k += 1) {
            const i = idx + k;
            const sc = laundryScore(h.temperature_2m?.[i], h.relative_humidity_2m?.[i], h.wind_speed_10m?.[i], h.uv_index?.[i], h.cloud_cover?.[i])?.score ?? 0; /* v70 — C-02 */
            if (sc > bestSc) { bestSc = sc; bestI = i; }
          }
          const eta = laundryHours(now.score);
          const etaBest = laundryHours(bestSc);
          const band = now.score >= 65 ? "good" : now.score >= 40 ? "fair" : "poor";
          const heads = {
            good: [tx("يوم مثالي لتجفيف الغسيل خارجًا", "A perfect laundry-drying day"), tx("الرياح والشمس والرطوبة كلها في صالحك — علّق الغسيل في نافذة النشر المثالية وسينشف أسرع من المعتاد.", "Wind, sun and humidity all work for you — hang the laundry in the best window and it will dry faster than usual.")],
            fair: [tx("تجفيف مقبول — اختر النافذة المثالية", "Acceptable drying — pick the best window"), tx("الظروف متوسطة: علّق القطع السميكة في نافذة الشمس المثالية أفقها أدناه، واخلط الجفاف بالتهوية إن كانت الرطوبة مرتفعة.", "Moderate conditions: hang thick items in the best sun window below, and favour airflow where humidity is high.")],
            poor: [tx("يوم سيء لتجفيف الغسيل خارجًا", "A poor laundry day"), tx("الرطوبة العالية وشحّ الشمس يبطئان البخر بشدة — استخدم مجففًا داخليًا أو أجّل الغسيل لنافذة أفضل، والتعليق الخارجي قد يعني رائحة رطوبة.", "High humidity and weak sun slow evaporation hard — use an indoor dryer or postpone; outdoor hanging may mean damp smells.")],
          }[band];
          const sev = band === "good" ? "low" : band === "fair" ? "warn" : "high";
          const rainRisk = Math.max(...Array.from({ length: Math.min(6, (h.time?.length ?? 0) - idx) }, (_, k) => h.precipitation_probability?.[idx + k] ?? 0));
          setAdv(el.laundryCard, `${iconSvg("basket", 14)} ${escapeHtml(heads[0])} <span class="adv-sev" data-sev="${sev}">${escapeHtml(`${localNum(now.score)}٪`)}</span>`,
            heads[1],
            tpl(tx("أفضل نافذة: {h} بدرجة {s}٪{rain}", "Best window: {h} scoring {s}%{rain}"), {
              h: (h.time[bestI] || "").slice(11, 16), s: localNum(bestSc),
              rain: rainRisk >= 50 ? tx(" · احذر خطر رشّة مطر", " · watch for a rain shower") : "",
            }),
            sev);
          if (el.laundryEta) {
            el.laundryEta.dataset.v = band === "good" ? "good" : band === "poor" ? "bad" : "";
            el.laundryEta.innerHTML = `${iconSvg("sun", 14)} ${escapeHtml(tpl(tx("الجفاف المتوقع ≈ {h} ساعة (وفي النافذة المثالية ≈ {b} ساعة)", "Drying time ≈ {h} h (in the best window ≈ {b} h)"), { h: localNum(eta), b: localNum(etaBest) }))}`;
          }
        }

        /* ── إصدار 28: بطاقة غسيل السيارة (Car Wash Index) ──
           يفحص الـ 48 ساعة القادمة: (احتمال المطر + مجاميعه) × (نشاط الغبار من
           جودة الهواء) × (سرعة الهبّات كي لا يجف الماء ويعلق به الغبار)
           ويعطي قرارًا صريحًا: مثالي / مناسب / لا ننصح مع السبب. */
        function renderCarWash(wx, idx) {
          if (!el.carwashCard || !el.carwashTitle) return;
          const h = wx.hourly;
          const N = Math.min(49, (h.time?.length ?? 0) - idx);
          if (N < 6) {
            setAdv(el.carwashCard, `${iconSvg("car", 14)} ${escapeHtml(tx("مؤشر غسيل السيارة", "Car-wash index"))}`,
              tx("بيانات الطقس غير كافية لحساب المؤشر الآن.", "Not enough weather data to compute the index right now."), "", "low");
            return;
          }
          let rain48 = 0, probMax = 0, gustMax = 0, dryBestI = idx, dryBestScore = Infinity;
          for (let i = 0; i < N; i += 1) {
            const pr = h.precipitation?.[idx + i] ?? 0, prob = h.precipitation_probability?.[idx + i] ?? 0, g = h.wind_gusts_10m?.[idx + i] ?? 0;
            rain48 += pr;
            probMax = Math.max(probMax, prob);
            gustMax = Math.max(gustMax, g);
            /* أفضل نافذة غسيل: أقل تركيبة (مطر متوقع × احتمال × هبّات) في 48 ساعة */
            const combo = pr * 220 + prob + (g >= 35 ? (g - 34) * 1.6 : 0);
            if (combo < dryBestScore) { dryBestScore = combo; dryBestI = idx + i; }
          }
          const dust = state.air?.current?.dust ?? null;
          const pm10 = state.air?.current?.pm10 ?? null;
          const dustVal = dust ?? pm10;
          const dustBad = (dustVal ?? 0) >= 80;
          const soonRain = Array.from({ length: Math.min(12, N) }, (_, i) => h.precipitation_probability?.[idx + i] ?? 0).reduce((a, b) => Math.max(a, b), 0);
          let kind, head, body, sev;
          if (dustBad) {
            kind = "bad";
            head = tx("لا ننصح بغسيل السيارة الآن — الغبار نشط", "Skip the car wash — dust is active");
            body = tpl(tx("تركيز الغبار ~{d} ميكروغرام/م³ يعني أن السيارة ستغلف بالغبار خلال ساعات. انتظر مرور موجة الغبار ثم اغسلها.", "Dust ≈ {d} µg/m³ means the car will be coated within hours. Wait for the dust wave to pass, then wash."), { d: localNum(dustVal) });
            sev = "high";
          } else if (rain48 >= 2 || probMax >= 60) {
            kind = "bad";
            head = tx("لا ننصح بغسيل السيارة — السماء ستتولى التنظيف مجانًا", "Skip the car wash — the sky will do it for free");
            body = tf("متوقع {r} مم مطر باحتمال يصل {p}٪ خلال 48 ساعة — اترك الغسلة ووفّر الماء، والمطر الحقيقي أنظف من أي رغوة.", { r: localNum(rain48, 1), p: localNum(probMax) });
            sev = "high";
          } else if (soonRain >= 45 || gustMax >= 45) {
            kind = "warn";
            head = tx("غسلة مقبولة لكن بشرط التوقيت", "An okay wash — but timing matters");
            body = tf("أول 12 ساعة تحمل احتمال مطر {p}٪ وهبّات حتى {g} كم/س — اغسل في نافذة الأقل خطرًا أدناه، وأجّل النشار الجاف حتى بعد الهبّات.", { p: localNum(soonRain), g: localNum(gustMax) });
            sev = "warn";
          } else {
            kind = "good";
            head = tx("الوقت مثالي لغسيل السيارة 🚗✨", "Perfect time to wash the car 🚗✨");
            body = tf("48 ساعة بلا مطر مؤكد (أعلى احتمال {p}٪) وغبار هادئ وهبّات مريحة — نتائج الغسلة ستبقى نظيفة لأيام.", { p: localNum(probMax) });
            sev = "low";
          }
          const etaKind = kind === "good" ? "good" : kind === "bad" ? "bad" : "";
          setAdv(el.carwashCard, `${iconSvg("car", 14)} ${escapeHtml(head)} <span class="adv-sev" data-sev="${sev}">${escapeHtml(kind === "good" ? tx("مثالي", "ideal") : kind === "warn" ? tx("بتوقيت", "timed") : tx("لا ننصح", "skip"))}</span>`,
            body,
            tf("أفضل نافذة غسيل: {h} (تُحسب من مطر واحتمال وهبّات الـ 48 ساعة)", { h: (h.time[dryBestI] || "").slice(11, 16) }),
            sev);
          if (el.carwashEta) {
            el.carwashEta.dataset.v = etaKind;
            el.carwashEta.innerHTML = `${iconSvg("car", 14)} ${escapeHtml(kind === "good"
              ? tx("قرار الغسلة اليوم رابح — نظيفة لأيام", "Washing today is a winning call — clean for days")
              : kind === "warn"
                ? tx("اغسل في نافذة الساعات القادمة فقط", "Wash only within the near-term window")
                : tx("أجّل الغسلة — هناك سبب أوضح أدناه", "Postpone the wash — a clearer reason above"))}`;
          }
        }

        function renderSea(wx, idx, marine) {
          const h = wx.hourly;
          const hasMarine = !!(marine?.hourly?.wave_height?.some((v) => v != null));
          if (!hasMarine) {
            if (el.marineZone) el.marineZone.classList.add("hidden");
            if (el.marineMissing) {
              el.marineMissing.classList.remove("hidden");
              el.marineMissing.textContent = tx("لا تغطية بحرية لموقعك (داخلي بعيد عن الساحل) — مؤشر الصيد وأمان السباحة يعملان بالرياح والضغط فقط.", "No marine coverage for your location (inland, far from the coast) — the fishing and swim indicators run on wind and pressure only.");
            }
          } else {
            if (el.marineZone) el.marineZone.classList.remove("hidden");
            if (el.marineMissing) el.marineMissing.classList.add("hidden");
            const mh = marine.hourly;
            /* مطابقة ساعات البحر مع ساعات التوقعات عبر النص الزمني (كلاهما بتوقيت الموقع) */
            const mapT = {};
            (mh.time || []).forEach((t, i) => { mapT[t] = i; });
            const rows = [];
            for (let k = 0; k < Math.min(12, (h.time?.length ?? 0) - idx); k += 1) {
              const i = idx + k, t = h.time[i], j = mapT[t];
              if (j == null) continue;
              const wh = mh.wave_height?.[j], wd = mh.wave_direction?.[j], wp = mh.wave_period?.[j], sst = mh.sea_surface_temperature?.[j];
              rows.push({ t, wh, wd, wp, sst, ws: h.wind_speed_10m?.[i] });
            }
            if (el.seaTable) {
              /* ═ إصدار 39: بطاقات أفقية زجاجية مرنة بدل الجدول التقليدي ═
                 توزيع القراءات بأيقونات تعبيرية أنيقة: ارتفاع الموج 🌊، اتجاه الموج 🔄،
                 الدور ⏱️، حرارة البحر 🌡️، الرياح 💨 — الأرقام بلون سماوي مضيء
                 والأوصاف الفرعية خافتة، وتفاف مرن يمنع أي تداخل أو تمرير أفقي */
              const metric = (emoji, label, valueHtml) =>
                `<span class="sea-metric"><i aria-hidden="true">${emoji}</i><span class="sm-txt"><b>${valueHtml}</b><small>${escapeHtml(label)}</small></span></span>`;
              el.seaTable.innerHTML = rows.map((r) => {
                const dirTxt = r.wd == null ? "—" : `${windDirName(r.wd)}`;
                const arrow = r.wd == null ? "" : `<span class="sea-dir"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${((r.wd + 180) % 360).toFixed(0)}deg)"><path d="M12 4v13m0 0 4.5-4.5M12 17l-4.5-4.5"/></svg></span>`;
                return `<div class="sea-card" role="listitem">
                  <span class="sc-time">${escapeHtml(r.t.slice(11, 16))}</span>
                  <span class="sc-metrics">
                    ${metric("🌊", tx("ارتفاع الموج", "Wave height"), r.wh == null ? "—" : `${localNum(r.wh, 1)} ${escapeHtml(tx("م", "m"))}`)}
                    ${metric("🔄", tx("اتجاه الموج", "Wave dir."), `${arrow}<span>${escapeHtml(dirTxt)}</span>`)}
                    ${metric("⏱️", tx("الدور", "Period"), r.wp == null ? "—" : `${localNum(r.wp, 0)} ${escapeHtml(tx("ث", "s"))}`)}
                    ${metric("🌡️", tx("حرارة البحر", "Sea temp"), tempText(r.sst))}
                    ${metric("💨", tx("الرياح", "Wind"), r.ws == null ? "—" : `${localNum(r.ws, 0)} ${escapeHtml(tx("كم/س", "km/h"))}`)}
                  </span>
                </div>`;
              }).join("");
            }
          }

          /* مؤشر نشاط الأسماك من ميل الضغط — بعد منتصف الليل (idx<3) نستخدم أقرب نافذة 3 ساعات متاحة */
          const pArr = h.pressure_msl;
          const dpIdx = idx < 3 && (pArr?.length ?? 0) > 3 ? 3 : idx;
          const dp3 = pressureDelta(pArr, dpIdx, 3);
          const fa = fishActivity(dp3);
          const fishTexts = {
            "very-high": [tx("نشاط استثنائي للأسماك — الضغط يهبط بسرعة", "Exceptional fish activity — pressure is dropping fast"),
              tx("الأسماك تتهيأ قبل العاصفة فتلتهم الطُعم بكثافة — أفضل نافذة صيد خلال الساعات القادمة قبل وصول المطر.", "Fish feed aggressively ahead of the storm — your best fishing window is the next few hours before rain arrives.")],
            high: [tx("نشاط جيد — الضغط في هبوط لطيف", "Good activity — pressure easing down"),
              tx("هبوط تدريجي في الضغط يرفع شهية الأسماك — انطلق مبكرًا واعتمد على الطُعم المتحرك.", "A gentle pressure fall sharpens fish appetite — start early and favour moving lures.")],
            normal: [tx("نشاط متوسط — ضغط مستقر", "Moderate activity — steady pressure"),
              tx("الضغط شبه ثابت فتكون الفترات الأفضل فجرًا وغروبًا حيث يرتفع النشاط الطبيعي للأسماك.", "Steady pressure means dawn and dusk remain the most productive windows.")],
            low: [tx("نشاط منخفض — الضغط يرتفع", "Low activity — pressure rising"),
              tx("مع ارتفاع الضغط تهبط الأسماك للأعماق وتقل حركتها — عمّق الطُعم وأبطئ السحب.", "Rising pressure pushes fish deeper and slows them — fish deeper and retrieve slower.")],
            "very-low": [tx("نشاط ضعيف جدًا — ضغط مرتفع بسرعة", "Very low activity — pressure spiking up"),
              tx("يوم صعب: الأسماك كامنة قرب القاع — وقت مناسب لصيانة الشباك وتجهيز العدة لموجة قادمة.", "A hard day: fish hold near the bottom — a good time to service tackle ahead of the next front.")],
            unknown: [tx("نشاط غير محسوم", "Activity undetermined"), tx("بيانات الضغط غير كافية لحساب الميل الآن.", "Not enough pressure data right now.")],
          };
          const [ft, fm] = fishTexts[fa.kind];
          setAdv(el.fishCard, `${iconSvg("stock", 14)} ${escapeHtml(ft)}<span class="adv-sev" data-sev="${fa.sev}">${escapeHtml(dp3 == null ? "—" : `${dp3 >= 0 ? "+" : ""}${localNum(dp3, 1)} ${tx("hPa/3س", "hPa/3h")}`)}</span>`,
            fm, tx("قراءة ميل الضغط آخر 3 ساعات", "from the 3-hour pressure tendency"),
            fa.kind === "very-high" ? "low" : fa.kind === "very-low" ? "high" : "low");

          /* أمان السباحة */
          const gustNow = h.wind_gusts_10m?.[idx];
          const whNow = hasMarine ? marine.hourly.wave_height?.[Math.max(0, (marine.hourly.time || []).indexOf(h.time[idx]))] : null;
          const swim = swimSafety(gustNow, whNow);
          const swimTexts = {
            safe: [tx("الشاطئ آمن للسباحة", "Beach is safe for swimming"), tx("هبّات الرياح وارتفاع الموج في الحدود المريحة — التزم المنطقة المخصصة للسباحين كالعادة.", "Gusts and wave height are comfortable — still stay inside the designated swimming zone.")],
            caution: [tx("سباحة بحذر", "Swim with caution"), tx("الموج أو الهبّات أعلى من المعتاد — لا تبتعد عن الشاطئ، وابتعد عن الصخور والتيارات الجانبية.", "Waves or gusts are above usual — stay close to shore and away from rocks and side currents.")],
            danger: [tx("البحر غير آمن للسباحة اليوم", "The sea is unsafe for swimming today"), tx("هبّات قوية أو موج مرتفع يهدد السباحين — اكتف بالمشي على الرمل وحقق العودة قبل تغير الرياح.", "Strong gusts or high waves endanger swimmers — keep to the sand and head back before the wind shifts.")],
          };
          const swimSev = swim === "safe" ? "low" : swim === "caution" ? "warn" : "high";
          setAdv(el.swimCard, `${iconSvg(swim === "safe" ? "ok" : swim === "caution" ? "warn" : "storm", 14)} ${escapeHtml(swimTexts[swim][0])}<span class="adv-sev" data-sev="${swimSev}">${escapeHtml(swim === "safe" ? tx("آمن", "safe") : swim === "caution" ? tx("حذر", "caution") : tx("خطر", "danger"))}</span>`,
            swimTexts[swim][1],
            hasMarine ? tpl(tx("هبّات {g} كم/س · موج {w} م", "gusts {g} km/h · waves {w} m"), { g: localNum(gustNow, 0), w: whNow == null ? "—" : localNum(whNow, 1) }) : tpl(tx("هبّات {g} كم/س (بلا بيانات موج)", "gusts {g} km/h (no wave data)"), { g: localNum(gustNow, 0) }),
            swimSev);
        }

        function renderDrone(wx, idx, plevels) {
          const h = wx.hourly;
          /* فهرس ساعات مستويات الضغط: نفس اليوم/التوقيت — نطابق بالنص أيضًا */
          const ph = plevels?.hourly || null;
          let pj = idx;
          if (ph?.time?.length) {
            const j = ph.time.indexOf(h.time[idx]);
            pj = j >= 0 ? j : Math.min(idx, ph.time.length - 1);
          }
          const gust = h.wind_gusts_10m?.[idx];
          const w850 = ph?.wind_speed_850hPa?.[pj] ?? null;
          const w950 = ph?.wind_speed_950hPa?.[pj] ?? null;
          const d850 = ph?.wind_direction_850hPa?.[pj] ?? null;
          const d950 = ph?.wind_direction_950hPa?.[pj] ?? null;
          const t850 = ph?.temperature_850hPa?.[pj] ?? null;
          const cloudLow = ph?.cloud_cover_low?.[pj] ?? null;
          const verdict = droneVerdict({
            gust, wind850: w850, cloudLow,
            cloudTotal: h.cloud_cover?.[idx] ?? null,
            vis: h.visibility?.[idx] ?? null,
            precip: h.precipitation?.[idx] ?? null,
            code: h.weather_code?.[idx] ?? null,
          });

          /* بطاقات الارتفاعات */
          const altCard = (name, rows) => `
            <div class="alt-card">
              <span class="alt-name">${iconSvg("wind", 13)} ${escapeHtml(name)}</span>
              <div class="alt-rows">${rows.map(([k, v]) => `<div class="r"><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join("")}</div>
            </div>`;
          if (el.altGrid) {
            el.altGrid.innerHTML =
              altCard(tx("السطح · 0 م", "Surface · 0 m"), [
                [tx("الرياح", "Wind"), `${localNum(h.wind_speed_10m?.[idx], 0)} ${tx("كم/س", "km/h")}`],
                [tx("الاتجاه", "Direction"), windDirName(h.wind_direction_10m?.[idx])],
                [tx("الهبّات", "Gusts"), `${localNum(gust, 0)} ${tx("كم/س", "km/h")}`],
              ]) +
              (w950 == null ? "" : altCard(tx("950hPa · ~600 م", "950 hPa · ~600 m"), [
                [tx("الرياح", "Wind"), `${localNum(w950, 0)} ${tx("كم/س", "km/h")}`],
                [tx("الاتجاه", "Direction"), windDirName(d950)],
              ])) +
              (w850 == null ? "" : altCard(tx("850hPa · ~1500 م", "850 hPa · ~1500 m"), [
                [tx("الرياح", "Wind"), `${localNum(w850, 0)} ${tx("كم/س", "km/h")}`],
                [tx("الاتجاه", "Direction"), windDirName(d850)],
                [tx("الحرارة", "Temp"), tempText(t850)],
              ]));
          }

          /* بطاقة القرار */
          const vTxt = {
            go: [tx("نافذة إقلاع مناسبة للدرونز والطائرات المسيرة", "Good-to-fly window for your drones & UAVs"), tx("كل العوامل الحرجة ضمن الحدود — راقب الهبّات المفاجئة أثناء الطيران وكن جاهزًا لهبوط اضطراري.", "All critical factors are within limits — keep watching sudden gusts in flight and be ready for an emergency landing.")],
            caution: [tx("طيران بحذر — عامل أو اثنان على الحد", "Fly with caution — one or two factors at the edge"), tx("الظروف مقبولة لكنها قريبة من الحدود — طيران منخفض وقصير المدى، وتحقق من قواعد المنطقة قبل الإقلاع.", "Conditions are acceptable but near limits — keep it low, short and check local rules first.")],
            no: [tx("لا تطير الآن — عامل حرج خارج الحدود", "Do not fly now — a critical factor is out of bounds"), tx("أجّل الإقلاع حتى تتحسن العوامل الحمراء أدناه — الغبار والرياح العلوية القوية من أشهر أسباب فقدان الدرونز والطائرات المسيرة.", "Delay take-off until the red factors below improve — strong gusts and low visibility are the top drone-loss causes.")],
          }[verdict.verdict];
          const vSev = verdict.verdict === "go" ? "low" : verdict.verdict === "caution" ? "warn" : "high";
          const FACT_LABEL = {
            gust: [tx("هبّات السطح", "Surface gusts"), (v) => `${localNum(gust, 0)} ${tx("كم/س", "km/h")}`],
            wind850: [tx("رياح 850hPa", "850 hPa wind"), (v) => `${localNum(w850, 0)} ${tx("كم/س", "km/h")}`],
            cloud: [tx("سحب منخفضة", "Low clouds"), (v) => `${localNum(cloudLow ?? h.cloud_cover?.[idx], 0)}٪`],
            vis: [tx("الرؤية الأفقية", "Visibility"), (v) => `${localNum((h.visibility?.[idx] ?? 0) / 1000, 1)} ${tx("كم", "km")}`],
            rain: [tx("مطر/هطول", "Precipitation"), () => tx("هطول ملموس", "wet")],
          };
          if (el.droneFactors) {
            el.droneFactors.innerHTML = verdict.factors.map((f) => {
              const [lbl, val] = FACT_LABEL[f.key];
              return `<span class="df-chip" data-v="${f.v}">${escapeHtml(lbl)} · ${escapeHtml(val())}</span>`;
            }).join("");
          }
          setAdv(el.droneCard, `${iconSvg(verdict.verdict === "go" ? "ok" : verdict.verdict === "caution" ? "warn" : "storm", 14)} ${escapeHtml(vTxt[0])}<span class="adv-sev" data-sev="${vSev}">${escapeHtml(verdict.verdict === "go" ? tx("صالحة للطيران", "GO") : verdict.verdict === "caution" ? tx("بحذر", "CAUTION") : tx("ممنوعة", "NO-FLY"))}</span>`,
            vTxt[1],
            w850 == null ? tx("بيانات الارتفاعات غير متاحة — القرار من السطح وحده", "pressure-level data unavailable — surface-only decision") : tx("القرار من: هبّات + رياح 850hPa + سحب منخفضة + رؤية + مطر", "from gusts + 850hPa wind + low clouds + visibility + rain"),
            vSev);
        }

        function renderHealth(wx, idx, yday) {
          const h = wx.hourly;
          /* ① جودة الهواء */
          const air = state.air?.current;
          const usAqi = air?.us_aqi ?? null;
          if (usAqi == null) {
            setAdv(el.aqiCard, `${iconSvg("dust", 14)} ${escapeHtml(tx("جودة الهواء غير متاحة", "Air quality unavailable"))}`,
              tx("بيانات جودة الهواء معطلة الآن (الوضع الاقتصادي أو انقطاع مؤقت) — بقية مؤشرات الصحة تعمل.", "Air-quality data is off right now (eco mode or a temporary outage) — the rest of the health indicators still work."),
              "", "low");
          } else {
            const adv = aqiAdvice(usAqi);
            const band = aqiLabel(usAqi) ?? "—";
            setAdv(el.aqiCard, `${iconSvg("dust", 14)} ${escapeHtml(tx("جودة الهواء والغبار (AQI)", "Air quality & dust (AQI)"))} <span class="adv-sev" data-sev="${adv.sev}">${escapeHtml(`${localNum(usAqi, 0)} · ${band}`)}</span>`,
              adv.msg,
              tpl(tx("PM2.5: {p} · PM10: {q} · غبار: {d} ميكروغرام/م³", "PM2.5: {p} · PM10: {q} · dust: {d} µg/m³"), { p: localNum(air?.pm2_5, 1), q: localNum(air?.pm10, 1), d: localNum(air?.dust, 0) }),
              adv.sev);
          }

          /* ② الصداع النصفي من تقلب الضغط — إصدار 28: صياغة أدق تفرق بين الهبوط
             السريع (المحفز الأشهر للصداع النصفي) والارتفاع السريع، وتذكر مرضى
             الحساسية والمفاصل صراحة كما في طلبات المستخدمين */
          const migIdx = idx < 3 && (h.pressure_msl?.length ?? 0) > 3 ? 3 : idx;
          const dpPast = pressureDelta(h.pressure_msl, migIdx, 3);
          const dpNext = migIdx + 3 < (h.pressure_msl?.length ?? 0) ? pressureDelta(h.pressure_msl, migIdx + 3, 3) : null;
          const worst = [dpPast, dpNext].filter((v) => v != null).reduce((m, v) => (m == null || Math.abs(v) > Math.abs(m) ? v : m), null);
          const migSev = worst == null ? "low" : Math.abs(worst) >= 3.5 ? "high" : Math.abs(worst) >= 1.8 ? "warn" : "low";
          const migMsg = migSev === "high"
            ? (worst < 0
              ? tpl(tx("⚠️ هبوط سريع في الضغط الجوي ({v} hPa خلال 3 ساعات) — قد يحفز الصداع النصفي ويؤذي مرضى الحساسية والمفاصل: ماء كافٍ، شاشة أقل، وأدويتك في المتناول قبل الذروة.", "⚠️ Rapid pressure drop ({v} hPa over 3 hours) — may trigger migraines and bother allergy/joint patients: hydrate, cut screen time and keep medication at hand before the peak."), { v: localNum(worst, 1) })
              : tpl(tx("ارتفاع سريع في الضغط الجوي ({v} hPa خلال 3 ساعات) — قد يزعج مرضى الحساسية والصداع النصفي كذلك: تجنب الإجهاد وابقَ مرطبًا وضمن جدول دوائك.", "A fast pressure rise ({v} hPa over 3 hours) — can also bother allergy and migraine patients: avoid strain, stay hydrated and keep to your medication schedule."), { v: localNum(worst, 1) }))
            : migSev === "warn"
              ? tx("تغير ضغط محسوس قد يزعج الحساسين للصداع — خطط فترات راحة وعين داكنة إن كنت من المعرضين.", "A noticeable pressure shift may bother headache-prone users — plan breaks and dark-room rests if you're susceptible.")
              : tx("الضغط شبه مستقر — مخاطر الصداع النصفي منخفضة هذه الساعات.", "Pressure is near-stable — migraine risk stays low this window.");
          setAdv(el.migCard, `${iconSvg("gauge", 14)} ${escapeHtml(tx("مؤشر الصداع النصفي", "Migraine trigger index"))}<span class="adv-sev" data-sev="${migSev}">${escapeHtml(worst == null ? "—" : `${worst >= 0 ? "+" : ""}${localNum(worst, 1)} ${tx("hPa/3س", "hPa/3h")}`)}</span>`,
            migMsg,
            tx("تغير الضغط خلال آخر 3 ساعات + التوقع القادم", "pressure change over the last 3 hours + next 3"),
            migSev);

          /* ③ القفزة الحرارية اليومية (أمس ↔ اليوم) */
          const d = wx.daily;
          const yd = yday?.daily;
          let yMax = null, yMin = null;
          if (yd?.time?.length && yd.temperature_2m_max?.[0] != null) {
            /* past_days=1 يجعل أول يوم هو أمس */
            const iY = yd.time.length >= 2 ? 0 : 0;
            yMax = yd.temperature_2m_max[iY]; yMin = yd.temperature_2m_min?.[iY];
          }
          const tMax = d?.temperature_2m_max?.[0] ?? null, tMin = d?.temperature_2m_min?.[0] ?? null;
          if (yMax != null && tMax != null && yMin != null && tMin != null) {
            const delta = ((tMax + tMin) / 2) - ((yMax + yMin) / 2);
            const aDelta = Math.abs(delta);
            const shSev = aDelta >= 5 ? "high" : aDelta >= 3 ? "warn" : "low";
            const dir = delta >= 0 ? tx("أدفأ", "warmer") : tx("أبرد", "cooler");
            const shMsg = shSev === "high"
              ? tpl(tx("فرق {v}° عن أمس ({dir}) — قفزة مفاجئة ترهق كبار السن والأطفال: طبقات ملابس متدرجة، سوائل دافئة، وتجنب التكييف المباشر بعد الشمس.", "A {v}° swing vs yesterday ({dir}) — a sudden jump that strains the elderly and children: layered clothing, warm fluids and avoiding direct AC after sunset."), { v: localNum(aDelta, 1), dir })
              : shSev === "warn"
                ? tpl(tx("فرق {v}° عن أمس ({dir}) — تقلب لطيف لكن يستحق طبقة خفيفة إضافية صباحًا ومساءً.", "A {v}° shift vs yesterday ({dir}) — mild, but worth an extra light layer morning and evening."), { v: localNum(aDelta, 1), dir })
                : tx("الحرارة مستمرة كأمس تقريبًا — لا تنبيه خاص للفئات الحساسة.", "Today runs close to yesterday — no special alert for sensitive groups.");
            setAdv(el.shiftCard, `${iconSvg("thermo", 14)} ${escapeHtml(tx("تنبيه تقلب الحرارة المفاجئ", "Sudden temperature-swing alert"))}<span class="adv-sev" data-sev="${shSev}">${escapeHtml(`${delta >= 0 ? "+" : ""}${localNum(delta, 1)}°`)}</span>`,
              shMsg,
              tpl(tx("أمس: {a}°م ↔ اليوم: {t}°م (متوسط اليوم)", "yesterday {a}°C ↔ today {t}°C (daily mean)"), { a: localNum((yMax + yMin) / 2, 1), t: localNum((tMax + tMin) / 2, 1) }),
              shSev);
          } else {
            setAdv(el.shiftCard, `${iconSvg("thermo", 14)} ${escapeHtml(tx("تنبيه تقلب الحرارة المفاجئ", "Sudden temperature-swing alert"))}`,
              tx("لم نتمكن من جلب قراءة أمس للمقارنة — أعد المحاولة لاحقًا.", "Couldn't fetch yesterday's reading for comparison — try again later."),
              "", "low");
          }
        }

        /* ── ④ التدفق ── */
        function showLoading() {
          el.loading?.classList.remove("hidden");
          el.error?.classList.add("hidden");
          el.content?.classList.add("hidden");
        }
        function showError(msg) {
          el.loading?.classList.add("hidden");
          el.content?.classList.add("hidden");
          el.error?.classList.remove("hidden");
          if (el.errorMsg) el.errorMsg.textContent = msg;
        }
        function showContent() {
          el.loading?.classList.add("hidden");
          el.error?.classList.add("hidden");
          el.content?.classList.remove("hidden");
        }

        function updateChip() {
          if (!el.chip || !state.place) return;
          const label = state.place.name ?? "—";
          const ctx = [state.place.admin1, state.place.country].filter(Boolean).join("، ");
          el.chip.innerHTML = `${iconSvg("pin", 14)} <span>${escapeHtml(label)}${ctx ? ` · ${escapeHtml(ctx)}` : ""}</span>`;
        }

        async function ensure() {
          const place = state.place;
          if (!place) { showError(tx("اختر موقعًا من البحث أولًا.", "Pick a location first.")); return; }
          if (!state.wx) { showLoading(); return; } // وحدة matar:data ستعيد الاستدعاء
          if (rendering) return;
          rendering = true;
          try {
            showLoading();
            const extra = await fetchExtra(place);
            const wx = state.wx;
            const idx = hourIndexAtPlace(wx);
            renderSport(wx, idx);
            renderWbgt(wx, idx); // إصدار 27: الإجهاد الحراري WBGT
            renderLaundry(wx, idx); // إصدار 27: مؤشر جفاف الملابس
            renderCarWash(wx, idx); // إصدار 28: مؤشر غسيل السيارة
            renderSea(wx, idx, extra.marine);
            renderDrone(wx, idx, extra.plevels);
            renderHealth(wx, idx, extra.yday);
            updateChip();
            wireBike();
            showContent();
          } catch (e) {
            console.error("joq", e);
            showError(tx("تعذر تجهيز اللوحة — تحقق من الاتصال ثم أعد المحاولة.", "Couldn't build the board — check your connection and retry."));
          } finally {
            rendering = false;
          }
        }

        el.retry?.addEventListener("click", () => { extraCache.clear(); ensure(); });
        document.addEventListener("matar:data", () => {
          if (el.page?.()?.hidden !== false) return;
          ensure();
        });
        document.addEventListener("matar:language", () => {
          if (el.page?.()?.hidden !== false || !state.wx) return;
          wireBike(); /* يعيد بناء أزرار الاتجاهات بلغة جديدة */
          ensure();
        });
        document.addEventListener("matar:unit", () => {
          if (el.page?.()?.hidden !== false || !state.wx) return;
          ensure();
        });

        function onShow() { ensure(); }
        function onPlaceChange() { extraCache.clear(); }

        /* خطافات الفحص الذاتي — رياضيات نقية فقط
           إصدار 27: أُضيفت رياضيات WBGT والتجفيف */
        window.__matarJoqHooks = { heatIndexC, exerciseScore, bikeWind, fishActivity, swimSafety, droneVerdict, pressureDelta, aqiAdvice, DIRS, wbgtC, wbgtBand, laundryScore, laundryHours };

        return { onShow, onPlaceChange, ensure };
      })();

      /* ============================================================
         إضافة 14 — محرك الذكاء المحلي (LocalAI · WebNN / Transformers.js)
         نموذج لغوي خفيف مضغوط (Quantized ONNX) يعمل بالكامل داخل المتصفح:
         - أول تشغيل ينزّل النموذج مرة واحدة ويخزّنه في ذاكرة المتصفح (Cache API)
         - كل التوليد بعدها محلي 100%: بلا سيرفر، بلا مفتاح API، بلا تكلفة
         - سلم الأجهزة: WebNN (NPU/GPU) ← WebGPU ← WASM — أول ما يشتغل يفوز
         - يعمل داخل Web Worker مُولَّد من Blob كي لا يتجمد الواجهة أثناء الكتابة
         المحرك اختياري تمامًا: بدونه يعمل المستشاران بالنصوص القاعدية كالعادة،
         ومعه تُضاف «خلاصة الكاتب الجوي» فوق التحليل القاعدي في القسمين
         الأسبوعي والموسمي — مبنية حصريًا على أرقام محسوبة محليًا (بلا اختلاق).
         ============================================================ */
      const LocalAI = (() => {
        const PREF_KEY = "matar:localai";
        const AI_LIB_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5";
        /* النموذج الافتراضي: Qwen2.5-0.5B-Instruct مضغوط (q4f16 ≈ 350 ميغابايت) — يدعم العربية جيدًا.
           للأجهزة القوية بدّل السطر التالي إلى نموذج 1B مثل "onnx-community/Llama-3.2-1B-Instruct-q4f16" */
        const AI_MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";
        const AI_MODEL_LABEL = "Qwen2.5-0.5B · q4f16";

        /* عارض العمل: يستورد Transformers.js من jsdelivr ويجرّب الباكندات بالترتيب.
           (نص عادي بلا backticks كي يظل قابلًا للتضمين كـ Blob بلا استيفاء) */
        const AI_WORKER_SRC = [
          'import { pipeline, env } from "' + AI_LIB_URL + '";',
          'env.allowLocalModels = false;',
          'let pipe = null;',
          'self.onmessage = async (e) => {',
          '  const d = e.data || {};',
          '  if (d.type === "load") {',
          '    const backends = d.backends || ["webnn", "webgpu", "wasm"];',
          '    let lastErr = null;',
          '    for (let bi = 0; bi < backends.length; bi++) {',
          '      const b = backends[bi];',
          '      try {',
          '        self.postMessage({ type: "phase", phase: b });',
          '        pipe = await pipeline("text-generation", d.model, {',
          '          dtype: b === "wasm" ? "q4" : "q4f16",',
          '          device: b,',
          '          progress_callback: (p) => {',
          '            if (p && p.status === "progress" && p.total) self.postMessage({ type: "progress", pct: Math.max(0, Math.min(100, Math.round((p.loaded / p.total) * 100))) });',
          '          },',
          '        });',
          '        self.postMessage({ type: "loaded", device: b });',
          '        return;',
          '      } catch (err) { lastErr = err; pipe = null; }',
          '    }',
          '    self.postMessage({ type: "error", message: String(lastErr && lastErr.message || lastErr || "no-backend") });',
          '  } else if (d.type === "generate") {',
          '    if (!pipe) { self.postMessage({ type: "error", message: "not-loaded" }); return; }',
          '    try {',
          '      const out = await pipe(d.messages, { max_new_tokens: d.maxTokens || 150, do_sample: true, temperature: 0.55, top_p: 0.9, repetition_penalty: 1.15 });',
          '      const g = out && out[0] && out[0].generated_text;',
          '      const last = Array.isArray(g) ? g[g.length - 1] : g;',
          '      const text = String((last && last.content) || last || "").trim();',
          '      self.postMessage({ type: "result", id: d.id, text });',
          '    } catch (err) { self.postMessage({ type: "error", message: String(err && err.message || err) }); }',
          '  }',
          '};',
        ].join("\n");

        let status = "off"; // off | loading | ready | generating | error
        let progress = 0;
        let phase = "";
        let deviceLabel = "";
        let errMsg = "";
        let worker = null;
        let mainPipe = null;
        let genSeq = 0;
        let pendingGen = null;
        const subs = new Set();
        const texts = {};      // القسم ← آخر خلاصة { text, lang }
        const providers = {};  // القسم ← دالة تبني الموجه من البيانات المحلية

        const emit = () => subs.forEach((f) => { try { f(); } catch (e) {} });
        const enabled = () => { try { return localStorage.getItem(PREF_KEY) === "on"; } catch (e) { return false; } };
        const setEnabled = (v) => { try { localStorage.setItem(PREF_KEY, v ? "on" : "off"); } catch (e) {} };
        const on = (fn) => { subs.add(fn); return () => subs.delete(fn); };
        const textFor = (section) => {
          const t = texts[section];
          return t && t.lang === currentLanguage ? t.text : "";
        };

        function handleEngineEvent(d) {
          if (!d) return;
          if (d.type === "phase") { phase = d.phase; emit(); }
          else if (d.type === "progress") { progress = d.pct | 0; emit(); }
          else if (d.type === "loaded") { status = "ready"; progress = 100; deviceLabel = d.device; emit(); }
          else if (d.type === "result") { if (pendingGen && d.id === pendingGen.id) pendingGen.resolve(d.text || ""); }
          else if (d.type === "error") {
            if (pendingGen) pendingGen.reject(new Error(d.message || "engine-error"));
            else { status = "error"; errMsg = d.message || "engine-error"; emit(); }
          }
        }

        function startWorker() {
          try {
            const blob = new Blob([AI_WORKER_SRC], { type: "text/javascript" });
            worker = new Worker(URL.createObjectURL(blob), { type: "module" });
            worker.onmessage = (e) => handleEngineEvent(e.data);
            worker.onerror = () => { try { worker.terminate(); } catch (e) {} worker = null; };
            return true;
          } catch (e) { return false; }
        }

        async function fallbackMainThread(backends) {
          try {
            const mod = await import(AI_LIB_URL);
            mod.env.allowLocalModels = false;
            let lastErr = null;
            for (let i = 0; i < backends.length; i += 1) {
              const b = backends[i];
              try {
                phase = b; emit();
                mainPipe = await mod.pipeline("text-generation", AI_MODEL, {
                  dtype: b === "wasm" ? "q4" : "q4f16",
                  device: b,
                  progress_callback: (p) => {
                    if (p && p.status === "progress" && p.total) { progress = Math.max(0, Math.min(100, Math.round((p.loaded / p.total) * 100))); emit(); }
                  },
                });
                status = "ready"; progress = 100; deviceLabel = b + " (main)"; emit();
                return;
              } catch (err) { lastErr = err; mainPipe = null; }
            }
            throw lastErr || new Error("no-backend");
          } catch (err) {
            status = "error"; errMsg = String(err && err.message || err); emit();
          }
        }

        async function ensureLoaded() {
          if (status === "ready" || status === "loading" || status === "generating") return;
          status = "loading"; progress = 0; phase = ""; errMsg = ""; emit();
          const backends = ["webnn", "webgpu", "wasm"];
          if (startWorker()) {
            worker.postMessage({ type: "load", model: AI_MODEL, backends });
            return;
          }
          await fallbackMainThread(backends);
        }

        async function runGenerate(p) {
          const messages = [{ role: "system", content: p.system }, { role: "user", content: p.user }];
          if (worker) {
            const id = (genSeq += 1);
            return new Promise((resolve, reject) => {
              const timer = setTimeout(() => { pendingGen = null; reject(new Error("ai-timeout")); }, 120_000);
              pendingGen = {
                id,
                resolve: (t) => { clearTimeout(timer); pendingGen = null; resolve(t); },
                reject: (e2) => { clearTimeout(timer); pendingGen = null; reject(e2); },
              };
              worker.postMessage({ type: "generate", id, messages, maxTokens: p.maxTokens || 150 });
            });
          }
          if (!mainPipe) throw new Error("not-loaded");
          const out = await mainPipe(messages, { max_new_tokens: p.maxTokens || 150, do_sample: true, temperature: 0.55, top_p: 0.9, repetition_penalty: 1.15 });
          const g = out?.[0]?.generated_text;
          const last = Array.isArray(g) ? g[g.length - 1] : g;
          return String((last && last.content) || last || "").trim();
        }

        async function generate(section) {
          if (status !== "ready") { await ensureLoaded(); if (status !== "ready") return ""; }
          const build = providers[section];
          const p = build ? build() : null;
          if (!p) return "";
          status = "generating"; emit();
          try {
            const text = await runGenerate(p);
            if (text) texts[section] = { text, lang: currentLanguage };
            status = "ready"; emit();
            return text;
          } catch (err) {
            status = "ready"; /* المحرك سليم — فشل توليد فقط ويمكن إعادة المحاولة */
            emit();
            return "";
          }
        }

        async function handleAction(section) {
          if (status === "loading" || status === "generating") return;
          if (!enabled()) {
            const msg = tr("المحرك المحلي ينزّل نموذجًا مضغوطًا ~350 ميغابايت مرة واحدة (Qwen2.5-0.5B) ويخزّنه في متصفحك، وكل التوليد بعدها يعمل بلا إنترنت وبلا أي سيرفر. هل تريد المتابعة؟");
            if (!confirm(msg)) return;
            setEnabled(true);
          }
          await ensureLoaded();
          if (status === "ready") await generate(section);
        }

        function barHTML(section) {
          const on = enabled();
          const st = on ? status : "off";
          let label = "", statusTxt = "";
          if (!on) { label = tr("تشغيل المحرك المحلي"); statusTxt = tr("توليد خلاصات بشرية داخل متصفحك — بلا سيرفر"); }
          else if (st === "loading") { label = `${tr("جارٍ تنزيل النموذج…")} ${localNum(progress)}٪`; statusTxt = phase ? tf("محاولات التشغيل: {v}", { v: phase.toUpperCase() }) : tr("مرة واحدة فقط ثم يُخزَّن"); }
          else if (st === "ready") { label = textFor(section) ? tr("تحديث الخلاصة المحلية") : tr("توليد خلاصة المحرك المحلي"); statusTxt = tf("النموذج {v} جاهز على {d}", { v: AI_MODEL_LABEL, d: deviceLabel || "—" }); }
          else if (st === "generating") { label = tr("جارٍ التوليد…"); statusTxt = tr("النموذج يكتب الآن داخل جهازك"); }
          else if (st === "error") { label = tr("إعادة محاولة المحرك المحلي"); statusTxt = errMsg || tr("تعذّر تشغيل المحرك على هذا المتصفح"); }
          const busy = st === "loading" || st === "generating";
          const meter = busy ? `<span class="ai-meter"><b style="width:${st === "generating" ? 100 : progress}%"></b></span>` : "";
          return `<div class="ai-bar"><button type="button" class="ai-btn" data-state="${st}" data-ai="${section}"${busy ? " disabled" : ""} aria-pressed="${st === "ready" ? "true" : "false"}">${iconSvg("storm", 13)} ${escapeHtml(label)}</button>${meter}<span class="ai-status">${escapeHtml(statusTxt)}</span></div>`;
        }

        function cardHTML(section) {
          const t = textFor(section);
          if (!t) return "";
          return `<div class="adv-card" data-kind="ai">
            <span class="adv-title">${iconSvg("storm", 14)} ${escapeHtml(tr("خلاصة الكاتب الجوي — المحرك المحلي"))}<span class="adv-sev" data-sev="med">${escapeHtml(tr("توليد محلي 100٪ بلا سيرفر"))}</span></span>
            <p class="adv-msg">${escapeHtml(t)}</p>
            <div class="adv-when">${escapeHtml(tf("نموذج {v} يعمل داخل متصفحك", { v: AI_MODEL_LABEL }))}</div>
          </div>`;
        }

        return {
          on, barHTML, cardHTML, textFor, handleAction,
          register: (section, build) => { providers[section] = build; },
        };
      })();

      /* ============================================================
         الميزة الجديدة — المستشار الذكي الأسبوعي (WeekAdvisor)
         يقسم التوقعات الساعية القادمة إلى 7 أيام (مصفوفة 168 ساعة)
         ويفحصها تلقائيًا: موجات الحر، أمواج البرد والصقيع، الرياح
         العاصفة، الأمطار التراكمية الغزيرة، والعواصف الرعدية والثلوج —
         ثم يطبع نصائح بشرية مباشرة فوق جدول الـ 14 يومًا في لوحة القيادة.
         يعمل محليًا بالكامل ويُعاد بناؤه مع كل تحديث بيانات أو لغة أو وحدة.
         ============================================================ */
      const WeekAdvisor = (() => {
        const box = $("#week-advisor");
        let lastStats = null; // إضافة 14: إحصائيات آخر فحص لمزوّد حقائق المحرك المحلي

        function analyze(wx) {
          const h = wx?.hourly;
          lastStats = null;
          if (!h?.time?.length || !box) return null;
          const s = hourIndexAtPlace(wx);
          const N = Math.min(168, h.time.length - s);
          if (N < 24) return null;
          const at = (i, k) => h[k]?.[s + i];
          const ar = isAr();
          const days = [];
          for (let d = 0; d < 7; d += 1) {
            const from = d * 24;
            if (from >= N) break;
            const to = Math.min(from + 24, N);
            let tmax = -Infinity, tmin = Infinity, rain = 0, gust = 0, stormH = 0, snowH = 0;
            for (let i = from; i < to; i += 1) {
              const t = at(i, "temperature_2m");
              if (t != null) { tmax = Math.max(tmax, t); tmin = Math.min(tmin, t); }
              rain += at(i, "precipitation") ?? 0;
              gust = Math.max(gust, at(i, "wind_gusts_10m") ?? 0);
              const c = at(i, "weather_code") ?? 0;
              if (c >= 95) stormH += 1;
              if ([71, 73, 75, 77, 85, 86].includes(c)) snowH += 1;
            }
            if (!Number.isFinite(tmax)) continue;
            days.push({ date: new Date(`${h.time[s + from].slice(0, 10)}T12:00:00Z`), tmax, tmin, rain, gust, stormH, snowH });
          }
          if (!days.length) return null;

          const out = [];
          const dayNames = (list) => list.map((x) => placeDateFormatter({ weekday: "long" }).format(x.date)).join(ar ? "، " : ", ");
          const weekMax = Math.max(...days.map((x) => x.tmax));
          const weekMin = Math.min(...days.map((x) => x.tmin));
          const totalRain = days.reduce((a, x) => a + x.rain, 0);

          /* ① موجة الحر */
          const veryHot = days.filter((x) => x.tmax >= 41);
          const hot = days.filter((x) => x.tmax >= 37 && x.tmax < 41);
          if (veryHot.length >= 2 || (veryHot.length >= 1 && hot.length >= 2)) {
            out.push({
              kind: "heat", sev: veryHot.length >= 3 ? "high" : "med", icon: "fire",
              title: tx("موجة حر خلال الأسبوع", "Heat wave this week"),
              msg: tf("{d}: ذروة تصل إلى {t}. نظّم الأعمال الخارجية قبل العاشرة صباحًا أو بعد العصر، وجهّز التظليل والماء للعاملين والحيوانات، وتوقّع ذروة استهلاك الكهرباء وقت الظهيرة.", { d: dayNames(veryHot.length ? veryHot : hot), t: tempText(weekMax) }),
              when: tf("ذروة {v} خلال 7 أيام", { v: tempText(weekMax) }),
            });
          } else if (hot.length >= 3) {
            out.push({
              kind: "heat", sev: "low", icon: "fire",
              title: tx("أيام حارة متتالية", "Hot stretch ahead"),
              msg: tf("{d}: حرارة فوق {t} بلا موجة قاسية. ماء بارد متاح طوال اليوم وخطط المهام الشاقة لفترات الصباح الباكر.", { d: dayNames(hot), t: tempText(37) }),
              when: tr("أيام متفرقة من الأسبوع"),
            });
          }

          /* ② موجة البرد والصقيع */
          const frostDays = days.filter((x) => x.tmin <= 3);
          const coldDays = days.filter((x) => x.tmin > 3 && x.tmin <= 8);
          if (frostDays.length) {
            out.push({
              kind: "frost", sev: weekMin <= 0 ? "high" : "med", icon: "frost",
              title: tx("موجة برد وصقيع محتمل", "Cold wave with frost risk"),
              msg: tf("{d}: أدنى حرارة تصل إلى {t} — احتمال صقيع فجرًا. غطِّ المحاصيل الحساسة، واسقِ التربة قبل الغروب لتخزين حرارة النهار، وافصل خراطيم الري الليلية، وانتبه من نقاط الجليد على الجسور فجرًا إن كنت سائقًا.", { d: dayNames(frostDays), t: tempText(weekMin) }),
              when: tr("ليالي الأسبوع القادم"),
            });
          } else if (coldDays.length >= 2) {
            out.push({
              kind: "frost", sev: "low", icon: "frost",
              title: tx("ليالٍ باردة خلال الأسبوع", "Chilly nights ahead"),
              msg: tf("{d}: ليالٍ تقترب من {t} بلا صقيع مباشر. أغطية حماية للخيار والطماطم مفيدة، وملابس دافئة صباحًا تكفي أفراد الأسرة.", { d: dayNames(coldDays), t: tempText(weekMin) }),
              when: tr("خلال 7 أيام"),
            });
          }

          /* ③ الرياح العاصفة */
          const windy = days.filter((x) => x.gust >= 50);
          if (windy.length) {
            const peakGust = Math.max(...windy.map((x) => x.gust));
            out.push({
              kind: "wind", sev: peakGust >= 65 ? "high" : "med", icon: "wind",
              title: tx("رياح عاصفة خلال الأسبوع", "Stormy winds this week"),
              msg: tf("{d}: هبّات تصل {g} كم/س. ثبّت الأغطية والسقالات واللوحات الإعلانية، أجّل الرش والعمل على المرتفعات، وانتبه للرياح الجانبية على الطرق السريعة المكشوفة.", { d: dayNames(windy), g: localNum(peakGust) }),
              when: tr("ذروتها نهارًا"),
            });
          }

          /* ④ الأمطار التراكمية الغزيرة */
          const bigDays = days.filter((x) => x.rain >= 12);
          if (totalRain >= 30 || bigDays.length >= 1) {
            const heavyDay = bigDays.length ? Math.max(...bigDays.map((x) => x.rain)) : totalRain / 7;
            out.push({
              kind: "irrigation", sev: totalRain >= 60 ? "high" : "med", icon: "rain",
              title: tx("أمطار تراكمية غزيرة", "Heavy accumulated rain"),
              msg: bigDays.length
                ? tf("مجموع المطر المتوقع خلال الأسبوع ~{r} مم (أعلى يوم {d} بـ ~{h} مم). أوقف الري مؤقتًا، افحص تصريف الحقول والمزاريب قبل الذروة، وأجّل الرش الكيميائي والتسميد الورقي — والأوعية الفارغة في الحديقة تُفرَّغ وتُجمع كي لا تصير بؤرًا لتكاثر البعوض.", { r: localNum(totalRain, 1), d: dayNames(bigDays), h: localNum(heavyDay, 1) })
                : tf("مجموع المطر المتوقع خلال الأسبوع ~{r} مم. أوقف الري مؤقتًا، افحص تصريف الحقول والمزاريب قبل الذروة، وأجّل الرش الكيميائي والتسميد الورقي — والأوعية الفارغة في الحديقة تُفرَّغ وتُجمع كي لا تصير بؤرًا لتكاثر البعوض.", { r: localNum(totalRain, 1) }),
              when: tr("مجموع 7 أيام"),
            });
          }

          /* ⑤ العواصف الرعدية */
          const stormDays = days.filter((x) => x.stormH >= 1);
          if (stormDays.length) {
            out.push({
              kind: "disease", sev: "med", icon: "storm",
              title: tx("عواصف رعدية في المشهد", "Thunderstorms in the picture"),
              msg: tf("{d}: نشاط رعدي متوقع. افصل الأجهزة الحساسة وقت الذروة، لا تقف تحت الأشجار المعزولة، وأجّل السباحة والقوارب — والأمطار الرعدية قد تكون غزيرة قصيرة الأمد مع برق.", { d: dayNames(stormDays) }),
              when: tr("راجع الشريط الساعي يومها"),
            });
          }

          /* ⑥ الثلوج */
          const snowDays = days.filter((x) => x.snowH >= 1);
          if (snowDays.length) {
            out.push({
              kind: "frost", sev: "med", icon: "snow",
              title: tx("احتمال تساقط ثلوج", "Snow possible"),
              msg: tf("{d}: ثلوج محتملة — جهّز مجارف إزالة الثلج، وراجع إطارات السيارة وسلاسلها، وتوقع تعطيلًا جزئيًا للطرق الجبلية صباحًا.", { d: dayNames(snowDays) }),
              when: tr("خلال 7 أيام"),
            });
          }

          if (!out.length) {
            out.push({
              kind: "spray", sev: "low", icon: "ok",
              title: tx("أسبوع مستقر بلا أخطار", "A calm week ahead"),
              msg: tf("فحصنا الـ 168 ساعة القادمة ساعة بساعة: لا موجات حر ({mx} ذروة) ولا صقيع ({mn} قاع) ولا رياح عاصفة ولا أمطار تراكمية مؤثرة ({r} مم فقط). أسبوع مريح للخطط الطويلة والأنشطة الخارجية.", { mx: tempText(weekMax), mn: tempText(weekMin), r: localNum(totalRain, 1) }),
              when: tr("فحص 168 ساعة"),
            });
          }
          /* إضافة 14: حفظ إحصائيات الفحص كي يبني المحرك المحلي موجّعه من أرقام حقيقية */
          lastStats = {
            N, weekMax, weekMin, totalRain,
            gustPeak: Math.max(...days.map((x) => x.gust)),
            stormH: days.reduce((s2, x) => s2 + x.stormH, 0),
            snowH: days.reduce((s2, x) => s2 + x.snowH, 0),
            notes: out.map((c) => c.title).join(ar ? "، " : ", "),
          };
          return out;
        }

        function render() {
          if (!box) return;
          const cards = analyze(state.wx);
          const ar = isAr();
          const sevText = { high: ar ? "أولوية عالية" : "High priority", med: ar ? "أولوية متوسطة" : "Medium", low: ar ? "للعلم فقط" : "FYI" };
          const list = cards ? cards.slice(0, 4).map((a) => `
            <div class="adv-card" data-kind="${a.kind}">
              <span class="adv-title">${iconSvg(a.icon, 14)} ${escapeHtml(a.title)}<span class="adv-sev" data-sev="${a.sev}">${sevText[a.sev]}</span></span>
              <p class="adv-msg">${a.msg}</p>
              <div class="adv-when">⏱ ${escapeHtml(a.when)}</div>
            </div>`).join("") : "";
          /* إضافة 14: شريط المحرك المحلي + خلاصة الكاتب الجوي أعلى البطاقات القاعدية */
          box.innerHTML = LocalAI.barHTML("week") + LocalAI.cardHTML("week") + list;
          box.classList.toggle("hidden", !cards && !LocalAI.textFor("week") && !LocalAI.barHTML("week"));
        }

        /* إضافة 14: مزوّد الحقائق للمحرك المحلي — موجّه مبني من أرقام الفحص الفعلي حصريًا */
        LocalAI.register("week", () => {
          const st = lastStats;
          if (!st) return null;
          const place = state.place;
          const ar = isAr();
          const sys = ar
            ? "أنت الكاتب الجوي في تطبيق مَطَر برو. اكتب خلاصة عربية عملية ودّية من 3 إلى 5 جمل للمزارع والسائق ورب الأسرة، تعتمد حصريًا على المعطيات المرسلة بلا أي أرقام من عندك، بلا مقدمات وبلا ماركداون."
            : "You are the weather writer of Matar Pro. Write a friendly, practical 3-5 sentence summary for farmers, drivers and families, strictly from the supplied facts — invent no numbers, no markdown, no preamble.";
          const langFix = currentLanguage === "ar" ? "" : ` Write the final text in ${{ en: "English", fr: "French", de: "German", es: "Spanish", pt: "Portuguese", it: "Italian" }[currentLanguage] || "English"}.`;
          const user = ar
            ? `الموقع: ${place?.name ?? "—"}.\nفحصنا ${localNum(st.N)} ساعة قادمة ساعة بساعة: الذروة ${tempText(st.weekMax)}، القاع ${tempText(st.weekMin)}، إجمالي المطر ${localNum(st.totalRain, 1)} مم، أقوى هبّات ${localNum(st.gustPeak)} كم/س، ساعات عواصف رعدية ${localNum(st.stormH)}، ساعات ثلج ${localNum(st.snowH)}.\nملاحظات القواعد الثابتة: ${st.notes || "لا شيء يُذكر"}.\nاكتب خلاصة بشرية سلسة تقول للقارئ ماذا يفعل اليوم وماذا يؤجل ولماذا.`
            : `Place: ${place?.name ?? "—"}.\nWe scanned the next ${st.N} hours hour-by-hour: peak ${st.weekMax.toFixed(0)}C, low ${st.weekMin.toFixed(0)}C, total rain ${st.totalRain.toFixed(1)} mm, strongest gusts ${st.gustPeak.toFixed(0)} km/h, thunderstorm hours ${st.stormH}, snow hours ${st.snowH}.\nRule-based notes: ${st.notes || "none"}.\nWrite a smooth human summary telling the reader what to do today, what to defer, and why.`;
          return { system: sys + langFix, user, maxTokens: 170 };
        });
        LocalAI.on(() => render());
        if (box) box.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-ai]");
          if (btn) { e.preventDefault(); LocalAI.handleAction("week"); }
        });

        document.addEventListener("matar:data", render);
        document.addEventListener("matar:language", render);
        document.addEventListener("matar:unit", render);
        render();
        return { render };
      })();

      /* ============================================================
         تنبيهات الطقس (Push Notifications) — محرك محلي + دعم خلفي
         - فحص بعد كل تحميل ناجح للبيانات + كل 30 دقيقة أثناء الفتح
         - Periodic Background Sync في الخلفية عند تثبيت التطبيق (حسب المتصفح)
         - جاهز لاستقبال Push من خادم مستقبلي عبر Service Worker
         ============================================================ */
      const Notif = (() => {
        const PREF_KEY = "matar:notif:prefs";
        const SENT_KEY = "matar:notif:sent";
        const defaults = { frost: true, storm: true, wind: true, fog: true, shift: true, rain: true, criticalOnly: false };
        let prefs = { ...defaults };
        try { prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(PREF_KEY)) || {}) }; } catch (e) {}
        const el = {
          enable: $("#notif-enable"), test: $("#notif-test"), status: $("#notif-status"),
          frost: $("#notif-frost"), storm: $("#notif-storm"), wind: $("#notif-wind"),
          fog: $("#notif-fog"), shift: $("#notif-shift"), rain: $("#notif-rain"),
          level: $("#notif-level"), /* إصدار 28: مفتاح أولوية التنبيهات */
        };
        const supported = "Notification" in window;

        function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }

        function statusText() {
          if (!supported) return tr("متصفحك لا يدعم الإشعارات.");
          const p = Notification.permission;
          if (p === "granted") return tr("التنبيهات مفعّلة على هذا الجهاز ✓");
          if (p === "denied") return tr("الإشعارات محظورة من إعدادات المتصفح — فعّلها من إعدادات الموقع لهذا التطبيق ثم أعد المحاولة.");
          return tr("يتم فحص الطقس تلقائيًا أثناء فتح التطبيق، ودوريًا في الخلفية عند تثبيت التطبيق على الهاتف.");
        }

        function syncUI() {
          ["frost", "storm", "wind", "fog", "shift", "rain"].forEach((k) => { if (el[k]) el[k].checked = prefs[k]; });
          /* إصدار 28: انعكاس مفتاح الأولوية على الأزرار */
          el.level?.querySelectorAll("button[data-nl]").forEach((b) => {
            b.setAttribute("aria-pressed", String((b.dataset.nl === "critical") === !!prefs.criticalOnly));
          });
          if (el.status) el.status.textContent = statusText();
          if (el.enable) el.enable.hidden = !supported || Notification.permission === "granted";
        }

        // إرسال حالة الموقع والتفضيلات للـ Service Worker عبر Cache API (لفحص الخلفية)
        function syncStateToSW() {
          if (!("caches" in window) || !state.place) return;
          const payload = { place: { latitude: state.place.latitude, longitude: state.place.longitude, name: state.place.name }, prefs, lang: currentLanguage, widgetType: (() => { try { return localStorage.getItem("matar:widget:type") || "general"; } catch (e) { return "general"; } })() };
          caches.open("matar:state").then((c) => c.put("/__matar_state", new Response(JSON.stringify(payload)))).catch(() => {});
        }

        async function enable() {
          if (!supported) { syncUI(); return; }
          let p = Notification.permission;
          if (p === "default") {
            try { p = await Notification.requestPermission(); } catch (e) { p = "denied"; }
          }
          if (p === "granted") {
            // مزامنة خلفية دورية إن كانت مدعومة (PWA مثبّت على كروم/أندرويد)
            // إصدار 27: توحيد الوسم "matar-refresh" مع مستمع periodicsync في sw.js —
            // كان الوسم "matar-weather-check" لا يطابق مستمع السيرفس فلم يعمل الفحص الخلفي أبدًا
            try {
              const reg = await navigator.serviceWorker?.getRegistration();
              if (reg && "periodicSync" in reg) {
                const st = await navigator.permissions.query({ name: "periodic-background-sync" });
                if (st.state === "granted") await reg.periodicSync.register("matar-refresh", { minInterval: 6 * 60 * 60 * 1000 });
              }
            } catch (e) { /* اختياري */ }
            syncStateToSW();
          }
          syncUI();
        }

        async function showNotification(title, body, tag) {
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            /* الإصلاح: كان الرابط يشير لملف مرحلة قديم غير موجود (404 عند فتح الإشعار) —
               الآن يفتح الإشعار صفحة التطبيق نفسها في جذر الموقع
               + تفعيل renotify: يجبر الهاتف على الاهتزاز/الصوت مجددًا مع كل تنبيه جديد
               بنفس tag بعد مرور ساعات، بدل تحديث التنبيه صامتًا في درج الإشعارات
               (renotify يتطلب tag — وهو موجود دائمًا في هذا السطر) */
            const options = { body, icon: "/Matar-pro-2/icons/icon-192.png", badge: "/Matar-pro-2/icons/icon-192.png", tag: tag || "matar", renotify: true, lang: activeLocale(), dir: currentLanguage === "ar" ? "rtl" : "ltr", data: { url: "/Matar-pro-2/" } };
            if (reg) await reg.showNotification(title, options);
            else new Notification(title, { body, icon: "/Matar-pro-2/icons/icon-192.png" });
          } catch (e) { /* تجاهل */ }
        }

        function alreadySent(key) {
          try {
            const map = JSON.parse(localStorage.getItem(SENT_KEY)) || {};
            const stamp = map[key];
            if (stamp && Date.now() - stamp < 12 * HOUR) return true;
          } catch (e) {}
          return false;
        }
        function markSent(key) {
          try {
            const map = JSON.parse(localStorage.getItem(SENT_KEY)) || {};
            map[key] = Date.now();
            Object.keys(map).forEach((k) => { if (Date.now() - map[k] > 48 * HOUR) delete map[k]; });
            localStorage.setItem(SENT_KEY, JSON.stringify(map));
          } catch (e) {}
        }

        // تقييم قواعد التنبيه من بيانات التوقعات الحالية
        function evaluateAlerts(wx) {
          const h = wx?.hourly;
          if (!h?.time?.length) return [];
          const s = hourIndexAtPlace(wx);
          const out = [];
          const hourAt = (i) => placeClock(h.time[i]);

          if (prefs.frost) { // صقيع خلال 18 ساعة (للمزارعين)
            let minT = Infinity, idx = -1;
            for (let i = s; i < Math.min(s + 18, h.time.length); i += 1) {
              const v = h.temperature_2m?.[i];
              if (v != null && v < minT) { minT = v; idx = i; }
            }
            if (idx >= 0 && minT <= 2) {
              /* إصدار 28: الصقيع الشديد (≤ -2°) حرج دائمًا، والحدّي (≤ 2°) استرشادي */
              out.push({ key: `frost-${h.time[idx]?.slice(0, 10)}`, sev: minT <= -2 ? "critical" : "info", emoji: "🧊", title: minT <= -2 ? tr("خطر صقيع شديد") : tr("احتمال صقيع"), body: tf("تنخفض الحرارة إلى {v} حوالي {t} — غطِّ المحاصيل الحساسة قبل الغروب.", { v: tempText(minT), t: hourAt(idx) }) });
            }
          }
          if (prefs.storm) { // عواصف رعدية خلال 12 ساعة
            const codes = h.weather_code ?? [];
            let idx = -1;
            for (let i = s; i < Math.min(s + 12, codes.length); i += 1) { if (codes[i] >= 95) { idx = i; break; } }
            if (idx >= 0) out.push({ key: `storm-${h.time[idx]?.slice(0, 13)}`, sev: "critical", emoji: "⛈", title: tr("عواصف رعدية قريبة"), body: tf("عواصف رعدية متوقعة حوالي {t} — أجّل الأعمال الخارجية وانتظر.", { t: hourAt(idx) }) });
          }
          if (prefs.wind) { // هبّات ≥ 50 كم/س خلال 12 ساعة
            let g = 0, idx = -1;
            for (let i = s; i < Math.min(s + 12, h.time.length); i += 1) {
              const v = h.wind_gusts_10m?.[i];
              if (v != null && v > g) { g = v; idx = i; }
            }
            if (idx >= 0 && g >= 50) out.push({ key: `wind-${h.time[idx]?.slice(0, 13)}`, sev: g >= 65 ? "critical" : "info", emoji: "💨", title: tr("رياح قوية وهبّات"), body: tf("هبّات تصل {v} كم/س حوالي {t}.", { v: localNum(g), t: hourAt(idx) }) });
          }
          if (prefs.fog) { // شبورة/ضباب كثيف خلال 12 ساعة (للسائقين) — إصدار 28: < 500م حرج
            for (let i = s; i < Math.min(s + 12, h.time.length); i += 1) {
              const vis = h.visibility?.[i], code = h.weather_code?.[i];
              if ((vis != null && vis < 1000) || code === 45 || code === 48) {
                out.push({ key: `fog-${h.time[i]?.slice(0, 13)}`, sev: (vis != null && vis < 500) ? "critical" : "info", emoji: "🌫", title: tr("ضباب/شبورة كثيف على الطرق"), body: tf("رؤية أقل من {v} كم حوالي {t} — خفّف السرعة على الطرق.", { v: localNum((vis ?? 900) / 1000, 1), t: hourAt(i) }) });
                break;
              }
            }
          }
          if (prefs.shift) { // تقلب مفاجئ: فرق ≥ 6° خلال 6 ساعات قادمة
            const cur = h.temperature_2m?.[s];
            if (cur != null) {
              const later = h.temperature_2m?.[Math.min(s + 6, h.time.length - 1)];
              if (later != null && Math.abs(later - cur) >= 6) {
                const dropping = later < cur;
                out.push({ key: `shift-${new Date().toISOString().slice(0, 10)}`, sev: "info", emoji: "🌡", title: dropping ? tr("انخفاض مفاجئ في الحرارة") : tr("تقلب مفاجئ في الحرارة"), body: dropping
                  ? tf("ستنخفض الحرارة بنحو {v} خلال الساعات القادمة — جهّز الحماية للمحاصيل.", { v: `${localNum(Math.abs(Math.round(later - cur)))}°` })
                  : tf("سترتفع الحرارة بنحو {v} خلال الساعات القادمة.", { v: `${localNum(Math.abs(Math.round(later - cur)))}°` }) });
              }
            }
          }
          return out;
        }

        /* المرحلة 6: خطاف للاختبار الذاتي — مصفوفة قواعد التنبيه + مرجع التفضيلات */
        if (SELFTEST) window.__matarNotifTestHooks = { evaluateAlerts, prefs };

        function checkNow() {
          if (!supported || Notification.permission !== "granted") return;
          if (!state.wx || state.isDemoData) return;
          syncStateToSW();
          evaluateAlerts(state.wx).forEach((a) => {
            /* إصدار 28: وضع «الحرج فقط» يوقف الإشعارات الاسترشادية الخفيفة */
            if (prefs.criticalOnly && a.sev === "info") return;
            if (alreadySent(a.key)) return;
            markSent(a.key);
            showNotification(`${a.emoji} ${a.title} — ${state.place?.name ?? ""}`, a.body, a.key.split("-")[0]);
          });
        }

        el.frost?.addEventListener("change", () => { prefs.frost = el.frost.checked; savePrefs(); });
        el.storm?.addEventListener("change", () => { prefs.storm = el.storm.checked; savePrefs(); });
        el.wind?.addEventListener("change", () => { prefs.wind = el.wind.checked; savePrefs(); });
        el.fog?.addEventListener("change", () => { prefs.fog = el.fog.checked; savePrefs(); });
        el.shift?.addEventListener("change", () => { prefs.shift = el.shift.checked; savePrefs(); });
        el.rain?.addEventListener("change", () => { prefs.rain = el.rain.checked; savePrefs(); }); // إصدار 16: تنبيه مطر الرادار اللحظي
        /* إصدار 28: مفتاح أولوية التنبيهات — كل التنبيهات / الحرج فقط */
        el.level?.querySelectorAll("button[data-nl]").forEach((b) => {
          b.addEventListener("click", () => {
            prefs.criticalOnly = b.dataset.nl === "critical";
            savePrefs();
            syncUI();
          });
        });
        el.enable?.addEventListener("click", enable);
        el.test?.addEventListener("click", async () => {
          if (!supported) { syncUI(); return; }
          let p = Notification.permission;
          if (p === "default") { try { p = await Notification.requestPermission(); } catch (e) { p = "denied"; } }
          if (p === "granted") showNotification("مَطَر برو", tr("إشعار تجريبي من مَطَر برو — التنبيهات تعمل بنجاح ✓"), "test");
          syncUI();
        });

        document.addEventListener("matar:data", checkNow);
        document.addEventListener("matar:language", syncUI);
        /* إصدار 16: الوضع الاقتصادي — الفحص الدوري يتباعد ×3 (كل 90 دقيقة بدل 30) */
        let ecoTick = 0;
        setInterval(() => {
          ecoTick += 1;
          if (Eco.isEco() && ecoTick % 3 !== 0) return;
          checkNow();
        }, 30 * 60 * 1000); // فحص دوري كل 30 دقيقة أثناء الفتح
        syncUI();
        return { checkNow, syncStateToSW, showNotification, prefs, syncUI }; // إصدار 16: فتح الواجهة لبطاقة الرادار اللحظي
      })();

      /* ============================================================
         المرحلة 6 — حزمة الاختبارات الذاتية الآلية (?selftest=1)
         19 اختبارًا تغطي: الأمان (escapeHtml) · الترجمة (اكتمال 6 لغات + fallback)
         · فك polyline6 · سلسلة مزوّدي التوجيه · قواعد التنبيه · عقد DOM الحرجة
         · اتساق ملفات PWA المرافقة · إصدار 16: رياضيات الرادار اللحظي + الوضع الاقتصادي.
         لا تعمل إطلاقًا في الاستخدام العادي.
         ============================================================ */
      async function runSelfTestSuite() {
        const results = [];
        const started = performance.now();
        const assert = (cond, msg) => { if (!cond) throw new Error(msg || "assertion failed"); };
        async function test(name, fn) {
          try {
            const detail = await fn();
            results.push({ name, pass: true, detail: detail || "" });
          } catch (err) {
            results.push({ name, pass: false, detail: String((err && err.message) || err) });
          }
        }

        // 1) الأمان: escapeHtml يعطّل متجهات XSS الشائعة
        await test("security: escapeHtml XSS vectors", () => {
          assert(escapeHtml('<img src=x onerror=alert(1)>') === "&lt;img src=x onerror=alert(1)&gt;", "angle brackets leaked");
          assert(escapeHtml('">&\'') === "&quot;&gt;&amp;&#39;", "quote escaping broken");
          assert(escapeHtml(null) === "", "null should coerce to empty");
          assert(!/[<>"']/.test(escapeHtml("<div class=\"a\" data-x='b'>&</div>")), "raw char survived");
          return "4 vectors neutralized";
        });

        // 2) الترجمة الديناميكية: تعويض القيم والإبقاء على المفقود
        await test("i18n: tf placeholder substitution", () => {
          assert(tf("هبّات {v} كم/س", { v: 42 }).includes("42"), "value not substituted");
          assert(tf("هبّات {v} كم/س", {}).includes("{v}"), "missing placeholder was dropped");
          return "ok";
        });

        // 3) الترجمة الآمنة: نص بلا ترجمة يعود كما هو
        await test("i18n: tr graceful fallback", () => {
          const probe = `نص بلا ترجمة ${Date.now()}`;
          assert(tr(probe) === probe, "fallback returned something else");
          return "ok";
        });

        // 4) اكتمال القاموس الإضافي: كل مفتاح باللغات الخمس غير العربية (العربية هي المفتاح نفسه)
        await test("i18n: I18N_EXTRA complete ×6 langs", () => {
          const langs = Object.keys(LOCALES).filter((l) => l !== "ar");
          let count = 0;
          for (const [key, table] of Object.entries(I18N_EXTRA)) {
            for (const lang of langs) {
              assert(typeof table[lang] === "string" && table[lang].length > 0, `missing "${lang}" for: ${key.slice(0, 34)}`);
            }
            count += 1;
          }
          return `${count} keys × ${langs.length + 1} langs (ar = source key)`;
        });

        // 5) محاذاة جداول اللغات مع مصفوفة المفاتيح
        await test("i18n: language tables aligned", () => {
          const n = I18N_KEYS.length;
          for (const lang of Object.keys(I18N)) {
            assert(Array.isArray(I18N[lang]) && I18N[lang].length === n, `table "${lang}" length ≠ ${n}`);
          }
          return `${n} aligned keys`;
        });

        // 6) فك ترميز Valhalla polyline6 — ناقل معروف (القاهرة)
        await test("routing: decodePolyline6 known vector", () => {
          const hooks = window.__matarRoadsTestHooks;
          assert(hooks && typeof hooks.decodePolyline6 === "function", "roads test hooks missing");
          const pts = hooks.decodePolyline6("_nwhx@gfnqz@_}IwkG");
          assert(pts.length === 2, `expected 2 points, got ${pts.length}`);
          assert(Math.abs(pts[0][0] - 31.2357) < 1e-5 && Math.abs(pts[0][1] - 30.0444) < 1e-5, `pt0 = ${pts[0]}`);
          assert(Math.abs(pts[1][0] - 31.24) < 1e-5 && Math.abs(pts[1][1] - 30.05) < 1e-5, `pt1 = ${pts[1]}`);
          return "Cairo vector decoded";
        });

        // 7) تغطية أيقونات الطقس SVG لكل أكواد WMO المعروفة
        await test("icons: wmoSvg covers WMO codes", () => {
          const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
          codes.forEach((c) => {
            const day = wmoSvg(c, 1, 20), night = wmoSvg(c, 0, 20);
            assert(day.startsWith("<svg") && day.includes("</svg>"), `bad day svg for code ${c}`);
            assert(night.startsWith("<svg") && night.includes("</svg>"), `bad night svg for code ${c}`);
          });
          return `${codes.length} codes × day/night`;
        });

        // 8) سلامة سلسلة مزوّدي التوجيه الثلاثة
        await test("routing: provider chain integrity", () => {
          const hooks = window.__matarRoadsTestHooks;
          assert(hooks && Array.isArray(hooks.ROUTE_PROVIDERS) && hooks.ROUTE_PROVIDERS.length === 3, "expected 3 providers");
          const ids = hooks.ROUTE_PROVIDERS.map((p) => p.id);
          assert(new Set(ids).size === 3, `duplicate provider ids: ${ids.join(",")}`);
          hooks.ROUTE_PROVIDERS.forEach((p) => {
            assert(typeof p.parse === "function", `${p.id}: missing parse()`);
            if (p.id === "valhalla") assert(typeof p.request === "function", `${p.id}: missing request()`);
            else assert(typeof p.url === "function", `${p.id}: missing url()`);
          });
          const A = { latitude: 30.0444, longitude: 31.2357 }, B = { latitude: 31.2001, longitude: 29.9187 };
          assert(hooks.ROUTE_PROVIDERS[0].url(A, B).includes("router.project-osrm.org"), "primary URL builder broken");
          return ids.join(" → ");
        });

        // 9) «لا طريق» قرار نهائي: no_path يوقف السلسلة فورًا
        await test("routing: NoRouteError stops the chain", () => {
          const hooks = window.__matarRoadsTestHooks;
          let thrown = null;
          try { hooks.normalizeValhallaRoute({ error_code: "no_path" }); } catch (e) { thrown = e; }
          assert(thrown instanceof hooks.NoRouteError, `expected NoRouteError, got ${thrown && thrown.name}`);
          return "ok";
        });

        // 10) قواعد التنبيه: صقيع/عاصفة تُطلق، والجو الهادئ لا يُطلق شيئًا
        await test("notifications: alert rule matrix", () => {
          const hooks = window.__matarNotifTestHooks;
          assert(hooks && typeof hooks.evaluateAlerts === "function", "notif test hooks missing");
          Object.keys(hooks.prefs).forEach((k) => { hooks.prefs[k] = true; });
          const base = { time: [], weather_code: [], wind_gusts_10m: [], visibility: [], temperature_2m: [] };
          for (let i = 0; i < 24; i += 1) {
            const iso = new Date(Date.UTC(2026, 0, 15, i)).toISOString().slice(0, 16);
            base.time.push(iso);
            base.weather_code.push(0); base.wind_gusts_10m.push(10);
            base.visibility.push(20000); base.temperature_2m.push(20);
          }
          const head = { current: { time: base.time[0] }, hourly: base };
          const frostWx = { ...head, hourly: { ...base, temperature_2m: base.temperature_2m.map((v, i) => (i === 5 ? -3 : v)) } };
          assert(hooks.evaluateAlerts(frostWx).some((a) => a.key.startsWith("frost")), "frost rule silent at -3°C");
          const stormWx = { ...head, hourly: { ...base, weather_code: base.weather_code.map((v, i) => (i === 3 ? 95 : v)) } };
          assert(hooks.evaluateAlerts(stormWx).some((a) => a.key.startsWith("storm")), "storm rule silent at code 95");
          const gustWx = { ...head, hourly: { ...base, wind_gusts_10m: base.wind_gusts_10m.map((v, i) => (i === 4 ? 62 : v)) } };
          assert(hooks.evaluateAlerts(gustWx).some((a) => a.key.startsWith("wind")), "wind rule silent at 62 km/h");
          assert(hooks.evaluateAlerts(head).length === 0, "false positive on calm weather");
          return "frost + storm + wind fire, calm stays quiet";
        });

        // 11) DOM: القائمة الجانبية ↔ لوحات الصفحات (المرحلة 12: بدل التبويبات الخمسة)
        await test("nav: drawer links ↔ panels wiring", () => {
          const links = $$('.drawer-link');
          assert(links.length === 7, `expected 7 drawer links, got ${links.length}`);
          const pages = links.map((l) => l.dataset.page);
          assert(new Set(pages).size === 7, `duplicate drawer pages: ${pages.join(",")}`);
          assert(pages.includes("monthly"), "monthly page missing from drawer");
          assert(pages.includes("joq"), "joq page missing from drawer");
          links.forEach((l) => {
            const panel = document.getElementById(`page-${l.dataset.page}`);
            assert(panel && panel.getAttribute("role") === "tabpanel", `drawer link #${l.dataset.page}: panel missing`);
          });
          const burger = $("#nav-burger");
          assert(burger && burger.getAttribute("aria-controls") === "drawer", "burger ↔ drawer wiring missing");
          return `${links.length} drawer links wired`;
        });

        // 11-ب) المرحلة 12: شريط الأوفلاين + الزر العائم + بطاقتا المستشار + منشئ الودجت موجودة
        await test("phase12: offline bar + advisors + widget + monthly DOM", () => {
          assert($("#net-offline-bar") && $("#net-offline-text"), "offline bar missing"); /* v48: bar-retry حُذف عمدًا لصالح الزر العائم */
          assert($("#float-retry"), "floating retry button missing");
          assert($("#agri-ai-text") && $("#agri-ai-refresh"), "farmer advisor card missing");
          assert($("#road-ai-text") && $("#road-ai-refresh"), "road advisor card missing");
          assert($("#widget-canvas-square") && $("#widget-canvas-wide") && $("#widget-dl-square"), "widget generator missing");
          assert($("#page-monthly") && $("#monthly-grid") && $("#monthly-retry"), "monthly page missing");
          /* v65 (المرحلة الأولى): أدوات ضبط الرادار حُذفت مع كل أزرار الطبقات —
             نفحص مبدّل الأساس النظيف (🌙 داكن | 🛣 شوارع) بدلها */
          assert(document.querySelectorAll('#mxp-sec .mxp-btn[data-mxp="base"]').length === 2, "clean 2-option basemap switcher missing");
          assert(!document.querySelector('#mxp-sec .mxp-btn[data-base="sat"]'), "satellite base button must be gone in phase 1");
          const csp = $('meta[http-equiv="Content-Security-Policy"]');
          assert(/seasonal-api\.open-meteo\.com/.test(csp.getAttribute("content") || ""), "CSP lacks seasonal-api");
          assert(/archive-api\.open-meteo\.com/.test(csp.getAttribute("content") || ""), "CSP lacks archive-api");
          return "phase 12 UI nodes live";
        });

        // 11-ج) إصدار 15: بطاقتا المستشار الذكي الجديدتان + الفلتر المنزلق + تقويم الشهر القادم
        await test("v15: smart advisors + monthly segmented filter + next-month calendar DOM", () => {
          assert($("#dash-ai-text") && $("#dash-ai-refresh") && $("#dash-ai-title"), "dashboard advisor card missing");
          assert($("#monthly-ai-text") && $("#monthly-ai-refresh") && $("#monthly-ai-title"), "monthly advisor card missing");
          assert($("#monthly-seg") && $("#seg-seasonal") && $("#seg-next") && $("#monthly-seg-thumb"), "monthly segmented filter missing");
          assert($("#monthly-seasonal-pane") && $("#monthly-next-pane"), "monthly panes missing");
          // الفلتر يحفظ تفضيل المستخدم — نفحص الاتساق لا القيمة الافتراضية
          // إصدار 19: ثلاثة تبويبات الآن (موسمي / الشهر القادم / آلة الزمن) — واحد مختار حصرًا
          const selState = ["#seg-seasonal", "#seg-next", "#seg-time"].map((s) => $(s).getAttribute("aria-selected") === "true");
          assert(selState.filter(Boolean).length === 1, "exactly one of the three tabs must be selected");
          assert($("#monthly-seasonal-pane").hidden === !selState[0] && $("#monthly-next-pane").hidden === !selState[1] && $("#monthly-time-pane").hidden === !selState[2], "pane visibility mismatch with selection");
          assert($("#nm-calendar") && $("#nm-stats") && $("#nm-weekdays") && $("#nm-note") && $("#nm-badge"), "next-month calendar nodes missing");
          assert(typeof tx === "function", "tx helper missing");
          assert(I18N_EXTRA["الأشهر السبعة القادمة"]?.fr, "new i18n entries missing");
          return "v15 advisors + filter + next-month live";
        });

        // 15-ب) إصدار 19: الفلتر الثلاثي + آلة الزمن المناخي + صفحة جوّك اليوم
        await test("v19: 3-way monthly filter + climate time-machine + joq board", () => {
          assert($("#seg-time") && $("#monthly-time-pane"), "third segment/pane missing");
          assert($("#tm-loading") && $("#tm-error") && $("#tm-content") && $("#tm-retry"), "time-machine nodes missing");
          const h = window.__matarTimeMachineHooks;
          assert(h && typeof h.linreg === "function" && typeof h.aggregateArchive === "function", "time-machine hooks missing");
          /* النطاق الآمن يجب أن ينتهي بـ 31 ديسمبر لسنة ماضية — لا يلامس نافذة 400 أبدًا */
          const r = h.safeRange();
          assert(/^\d{4}-01-01$/.test(r.start) && /^\d{4}-12-31$/.test(r.end), `unsafe archive range: ${r.start}..${r.end}`);
          const yEnd = Number(r.end.slice(0, 4));
          assert(yEnd <= new Date().getFullYear() - 1, "archive end_date reaches the current year (400 risk)");
          /* إصلاح 400: نطاق يُصحّح آليًا من نص الخطأ */
          const fixed = h.clampFromReason("Parameter 'end_date' is out of allowed range from 1940-01-01 to 2026-10-27", "2006-01-01", "2026-12-31");
          assert(fixed && fixed.end === "2026-10-27", "clampFromReason broken");
          /* تجميع سجل اصطناعي: يوم 10-28 عبر سنتين + متوسط سنوي */
          const daily = { time: ["2024-10-28", "2024-12-31", "2025-10-28", "2025-12-31"], temperature_2m_max: [30, null, 33, null], temperature_2m_min: [20, null, 21, null], temperature_2m_mean: [25, 15, 27, 16], precipitation_sum: [0, 5, 2, 4] };
          const agg = h.aggregateArchive(daily, "10-28");
          assert(agg.sameDay.length === 2 && agg.sameDay[1].tmax === 33, "aggregateArchive same-day broken");
          assert(agg.annual.years.length === 2 && agg.annual.temp[1] > agg.annual.temp[0], "annual aggregation broken");
          const lr = h.linreg([1, 2, 3, 4], [2, 4, 6, 8]);
          assert(lr && Math.abs(lr.m - 2) < 1e-9, "linreg broken");
          /* جوّك اليوم: العقد والرياضيات */
          assert($("#page-joq") && $("#joq-content") && $("#joq-retry"), "joq page nodes missing");
          assert($("#joq-best-hours") && $("#bike-choices") && $("#joq-sea-table") && $("#joq-drone-factors"), "joq section nodes missing");
          const j = window.__matarJoqHooks;
          assert(j && typeof j.heatIndexC === "function", "joq hooks missing");
          /* Rothfusz: 35°م + 70٪ رطوبة ≈ إحساس 50-56°م — والحرارة المنخفضة تعيد null */
          const hi1 = j.heatIndexC(35, 70);
          assert(hi1 != null && hi1 > 45 && hi1 < 60, `heatIndexC(35,70)=${hi1} out of range`);
          assert(j.heatIndexC(20, 50) === null, "heatIndexC below 80F must be null");
          /* درجة التمرين: معتدل+هادئ أعلى من حار+رطب */
          const s1 = j.exerciseScore(20, 50, 8, 0), s2 = j.exerciseScore(36, 90, 25, 80);
          assert(s1 > s2 && s1 >= 70 && s2 < 45, `exerciseScore broken (${s1}/${s2})`);
          /* دراجة: رياح شمالية مع سير شمالي = مواجهة، ومع سير جنوبي = خلفية */
          const head = j.bikeWind(0, 20, 0), tail = j.bikeWind(0, 20, 180);
          assert(Math.abs(head.head - 20) < 1e-9 && Math.abs(tail.head + 20) < 1e-9, "bikeWind components broken");
          /* صيد وسباحة ودرون */
          assert(j.fishActivity(-3).kind === "very-high" && j.fishActivity(0).kind === "normal" && j.fishActivity(3).kind === "very-low", "fishActivity bands broken");
          assert(j.swimSafety(10, 0.6) === "safe" && j.swimSafety(32, 0.6) === "caution" && j.swimSafety(10, 2.5) === "danger", "swimSafety bands broken");
          const dv = j.droneVerdict({ gust: 10, wind850: 20, cloudLow: 20, vis: 20000, precip: 0, code: 0 });
          assert(dv.verdict === "go", "droneVerdict clear case must be go");
          const dn = j.droneVerdict({ gust: 45, wind850: 60, cloudLow: 90, vis: 2000, precip: 2, code: 95 });
          assert(dn.verdict === "no", "droneVerdict storm case must be no");
          return `range ${r.start}..${r.end} safe · HI=${hi1?.toFixed(1)}° · scores ${s1}/${s2} · drone go/no`;
        });

        // 12) DOM: رابط التخطي + المُعلن الحي للبحث
        await test("a11y: skip-link + live announcer", () => {
          const skip = $(".skip-link");
          assert(skip && (skip.getAttribute("href") || "").endsWith("#main-content"), "skip link broken");
          assert(document.getElementById("main-content"), "#main-content target missing");
          const announcer = $("#search-status");
          assert(announcer && (announcer.getAttribute("aria-live") === "polite" || announcer.getAttribute("role") === "status"), "search announcer missing");
          return "ok";
        });

        // 13) PWA: توكنز التباين AA حاضرة (حماية من الانحدار)
        await test("a11y: AA contrast tokens present", () => {
          const cs = getComputedStyle(document.documentElement);
          ["--muted", "--gold-deep", "--ok", "--danger", "--danger-solid", "--rain"].forEach((p) => {
            assert(/^#[0-9a-fA-F]{6}$/.test(cs.getPropertyValue(p).trim()), `token ${p} missing/malformed`);
          });
          return "6 tokens live";
        });

        // 14) PWA: ملفات المرافقة متسقة مع اسم هذا الملف
        await test("pwa: companions consistency", async () => {
          assert($('link[rel="manifest"]'), "manifest <link> missing");
          /* المرحلة 12: الفحص يتسامح في وضع المعاينة المحلي (file://) حيث sw.js غير مرفوق،
             ويشدّد الفحص على النشر: أي نسخة sw.js حقيقية يجب أن تخدم تطبيق مَطَر برو */
          let sw = "";
          try { sw = await fetch("./sw.js", { cache: "no-store" }).then((r) => r.text()); } catch (e) { sw = ""; }
          if (!sw || sw.trim().startsWith("<")) return "sw.js not present in local preview (checked after deploy)";
          assert(sw.includes("matar-pro"), "sw.js does not reference the Matar Pro app");
          assert(/const VERSION = "matar-pro-v\d+"/.test(sw), "sw VERSION missing");
          assert(sw.includes("periodicsync"), "sw lacks periodicsync handler");
          assert(sw.includes("SW_I18N"), "sw lacks notification i18n table");
          return "v-sw + periodicsync + i18n";
        });


        // 15) المرحلة 11: CSP موقّعة بالهاشات + صفر إيموجي في شبكة الطبقات (W-05) + اختصار التثبيت معلن (W-04)
        await test("security: CSP + layer-grid SVG icons (W-04/W-05)", async () => {
          const csp = $('meta[http-equiv="Content-Security-Policy"]');
          assert(csp, "CSP meta missing");
          const pol = csp.getAttribute("content") || "";
          assert(/script-src[^;]*'sha256-[A-Za-z0-9+/=]+'/.test(pol), "CSP lacks inline script hashes");
          /* wasm-unsafe-eval مسموح حصرًا لمحرك الذكاء المحلي (ONNX Runtime) — أما unsafe-eval العام فممنوع */
          assert(!pol.replace(/wasm-unsafe-eval/g, "").includes("unsafe-eval") && !pol.includes("unsafe-hashes"), "CSP carries permissive escape hatches");
          assert(/connect-src[^;]*api\.open-meteo\.com/.test(pol), "CSP lacks API allowlist");
          const picto = /\p{Extended_Pictographic}/u;
          /* v65 (المرحلة الأولى): صفر أزرار طبقات — لوحة نظيفة بمبدّل الأساس وحده */
          const layers = $$(".mx-layer");
          assert(layers.length === 0, `expected 0 layer buttons (phase-1 clean map), got ${layers.length}`);
          const bases = $$('#mxp-sec .mxp-btn[data-mxp="base"]');
          assert(bases.length === 2 && bases[0].dataset.base === "windy" && bases[1].dataset.base === "street", "basemap switcher must be dark|streets only");
          /* v68 (المرحلة 2 من التقسيم): الـ CSS انتقل إلى ./style.css الخارجي —
             القارئ يفحص كل أوراق الأنماط (المضمّنة والخارجية معًا) عبر CSSOM،
             ومعه احتياط fetch للنص الخام عند تعذّر قراءة القواعد (معاينة file://) */
          let css = "";
          try {
            css = Array.from(document.styleSheets).map((sh) => {
              try { return Array.from(sh.cssRules).map((r) => r.cssText).join("\n"); } catch (e) { return ""; }
            }).join("\n");
          } catch (e) {}
          if (!css.includes("data:image/svg+xml")) {
            try { css += "\n" + await fetch("./style.css", { cache: "no-store" }).then((r) => r.text()); } catch (e) {}
          }
          assert(css.includes("data:image/svg+xml"), "SVG icon backgrounds missing");
          return "CSP hashes + clean base switcher verified";
        });

        // 16) إصدار 16: محرك الرادار اللحظي — رياضيات ميركاتور والرياح والمدد
        await test("v16: nowcast math (mercator + wind vector + ETA)", () => {
          const h = window.__matarNowcastTestHooks;
          assert(h && typeof h.lonToX === "function", "nowcast test hooks missing");
          const lon = 31.2357, lat = 30.0444;
          assert(Math.abs(h.xToLon(h.lonToX(lon, 7), 7) - lon) < 1e-6, "lon roundtrip broken");
          assert(Math.abs(h.yToLat(h.latToY(lat, 7), 7) - lat) < 1e-6, "lat roundtrip broken");
          const d = h.haversine(30.0444, 31.2357, 31.2001, 29.9187); // القاهرة ← الإسكندرية
          assert(d > 150 && d < 210, `Cairo→Alexandria = ${d} km (expected ~180)`);
          const kmp = h.kmPerPx(30, 7);
          assert(kmp > 0.8 && kmp < 1.4, `kmPerPx(lat30,z7) = ${kmp}`);
          const w = h.windToVector(10, 0); // رياح شمالية 10 كم/س → تدفع جنوبًا
          assert(Math.abs(w.east) < 1e-9 && Math.abs(w.north + 10) < 1e-9, "wind vector direction wrong");
          const b = h.blendVectors({ east: 10, north: 0 }, { east: 0, north: 10 }, 0.6);
          assert(Math.abs(b.east - 6) < 1e-9 && Math.abs(b.north - 4) < 1e-9, "blend weights wrong");
          assert(h.formatDuration(60).includes(tr("نحو ساعة كاملة")), "duration wording broken");
          assert(h.HORIZON_MIN === 120, "horizon changed");
          return "mercator + haversine + wind + blend verified";
        });

        // 17) إصدار 16: الوضع الاقتصادي — التخزين والفئة وكل عقد DOM
        await test("v16: eco mode storage + class + DOM nodes", () => {
          const saved = (() => { try { return localStorage.getItem("matar:eco"); } catch (e) { return null; } })();
          const expected = saved === "1";
          assert(Eco.isEco() === expected, "Eco.isEco() disagrees with matar:eco storage");
          assert(document.documentElement.classList.contains("eco") === expected, "html.eco class out of sync");
          assert($("#eco-toggle") && $("#eco-card") && $("#eco-state"), "eco settings nodes missing");
          assert($("#mini-eco") && $("#mx-eco") && $("#mx-eco-disable"), "eco map placeholders missing");
          assert($("#nowcast-card") && $("#nowcast-title") && $("#nowcast-msg") && $("#nowcast-meta"), "nowcast card nodes missing");
          assert($("#notif-rain"), "nowcast notification checkbox missing");
          const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("");
          assert(css.includes("html.eco *"), "eco CSS animation-kill rules missing");
          assert(typeof Nowcast === "object" && typeof Nowcast.onData === "function", "Nowcast module missing");
          return `eco=${expected ? "on" : "off"} consistent + 9 DOM nodes live`;
        });

        // 18) إصدار 17: حاسبة الري الذكية — رياضيات الميزان + عقد DOM
        await test("v17: irrigation advisor math + DOM", () => {
          assert($("#irrigation-card") && $("#irr-verdict") && $("#irr-title") && $("#irr-msg") && $("#irr-stats"), "irrigation card nodes missing");
          const h = window.__matarAgriV17Hooks;
          assert(h && typeof h.irrigationVerdict === "function", "agri v17 hooks missing");
          /* مطر أعلى من التبخر بهامش ← وفر مياهك؛ توازن قريب ← راقب؛ عجز كبير ← زد فترات الري */
          assert(h.irrigationVerdict(20, 5) === "save", "rain-covered case must be 'save'");
          assert(h.irrigationVerdict(5, 6.5) === "watch", "balanced case must be 'watch'");
          assert(h.irrigationVerdict(0.5, 12) === "alert", "high deficit case must be 'alert'");
          const v = $("#irr-verdict").dataset.v;
          assert(["save", "watch", "alert"].includes(v), `unexpected irrigation verdict: ${v}`);
          return "irrigation verdict (save/watch/alert) + DOM verified";
        });

        // 19) إصدار 17: الطرق الذكية — أقرب المدن المصرية + درجة الأمان + عقد DOM
        await test("v17: roads safety index + Egypt cities + DOM", () => {
          const h = window.__matarRoadsV17Hooks;
          assert(h && Array.isArray(h.EGYPT_CITIES) && h.EGYPT_CITIES.length >= 25, "egypt cities table missing");
          assert(typeof h.nearestEgyptCity === "function" && typeof h.roadSafetyScore === "function", "roads v17 hooks missing");
          const c = h.nearestEgyptCity(30.05, 31.24);
          assert(c.ar === "القاهرة", `nearest city to Cairo coords = ${c.ar}`);
          assert(h.nearestEgyptCity(31.2, 29.92).ar === "الإسكندرية", "Alexandria mapping broken");
          assert(h.inEgypt(30.0, 31.2) && !h.inEgypt(45.0, 9.0), "inEgypt bbox broken");
          /* مسار صافٍ: كل النقاط سليمة → درجة عالية؛ مسار ضباب كثيف + هبّات جانبية → درجة منخفضة */
          const clearPt = { gust: 10, cross: 0.1, vis: 24000, pr: 0, info: { f: {} }, hourly: { weather_code: [0] }, k: 0 };
          const safe = h.roadSafetyScore([clearPt, clearPt, clearPt]);
          assert(safe.score >= 90, `clear route score = ${safe.score} (expected ≥ 90)`);
          const fogPt = { gust: 55, cross: 0.9, vis: 300, pr: 5, info: { f: { ice: false } }, hourly: { weather_code: [95] }, k: 0 };
          const risky = h.roadSafetyScore([fogPt, fogPt, fogPt]);
          assert(risky.score <= 45, `hazard route score = ${risky.score} (expected ≤ 45)`);
          assert($("#dep-row") && $("#safety-strip") && $("#rest-stops-btn") && $("#rest-status"), "roads v17 DOM nodes missing");
          const pills = $$("#dep-row .dep-pills button[data-dep]");
          assert(pills.length === 4 && pills[0].getAttribute("aria-pressed") === "true", "departure pills broken");
          return `safety ${safe.score}/${risky.score} · ${h.EGYPT_CITIES.length} cities · 4 pills`;
        });

        // 20) إصدار 17: الخريطة — سفر عبر الزمن + التصويبة المركزية
        await test("v17: map time-travel window + crosshair DOM", () => {
          const h = window.__matarMapSimHooks;
          assert(h && typeof h.nextPlayPos === "function", "map sim hooks missing");
          assert(h.PAST_H === 24 && h.TOTAL_H === 99, "timeline constants changed"); /* v63: نافذة 3 أيام */
          /* وضع المستقبل: الالتفاف داخل نافذة [الآن … +24] حصرًا */
          assert(h.nextPlayPos(h.PAST_H + 24, true) === h.PAST_H, "future window must wrap to now");
          assert(h.nextPlayPos(h.PAST_H + 23, true) === h.PAST_H + 24, "future window step broken");
          /* الوضع العادي: الالتفاف عبر الخط الزمني كله */
          assert(h.nextPlayPos(h.TOTAL_H - 1, false) === 0, "full-range wrap broken");
          assert(h.nextPlayPos(10, false) === 11, "full-range step broken");
          assert($("#mx-future24") && $("#mx-future24").getAttribute("aria-pressed") === "false", "future24 button missing");
          assert($("#mx-crosshair") && $("#mx-cross-box"), "crosshair nodes missing");
          return "sim window [now..+24] + crosshair DOM verified";
        });

        // 21) إصدار 17: مؤشر الملابس الذكي — حدود النطاقات + عقد DOM
        await test("v17: outfit indicator bands + DOM", () => {
          const h = window.__matarOutfitHooks;
          assert(h && typeof h.outfitBand === "function", "outfit hooks missing");
          assert(h.outfitBand(10).kind === "cold" && h.outfitBand(10).icon === "coat", "cold band broken");
          assert(h.outfitBand(18).kind === "cool" && h.outfitBand(18).icon === "jacket", "cool band broken");
          assert(h.outfitBand(23.5).kind === "mild", "mild band broken");
          assert(h.outfitBand(30).kind === "hot" && h.outfitBand(30).icon === "tshirt", "hot band broken");
          assert(h.outfitBand(null) === null, "null feels must return null");
          assert($("#outfit-banner") && $("#outfit-icon") && $("#outfit-title") && $("#outfit-tips"), "outfit DOM nodes missing");
          return "4 outfit bands verified";
        });


        // 22) إصدار 29: الميزات الذكية — جسر + رياضيات القمر والسولنار والرياح الجانبية + عقد DOM
        await test("v29: bridge + solunar/crosswind math + smart DOM", () => {
          const h = window.__matarV29Hooks;
          assert(h && typeof h.moonPhase === "function" && typeof h.crosswind === "function", "v29 hooks missing");
          const mp = h.moonPhase(new Date("2026-11-06T12:00:00Z"));
          assert(mp && mp.ageDays > 0 && mp.ageDays < 29.54 && mp.frac >= 0 && mp.frac < 1, `moon math broken: ${mp?.ageDays}`);
          assert(Math.abs(h.crosswind(30, 120, 30) - 30) < 1e-9, "crosswind 90° must be full speed");
          assert(Math.abs(h.crosswind(30, 30, 30)) < 1e-9, "crosswind aligned must be zero");
          const t0 = Date.now();
          const tripPts = [
            { km: 0, eta: t0 + 0.2 * 3600e3, vis: 20000, gust: 10, wind: 8, cross: 0.2, info: { level: 0, f: {} } },
            { km: 90, eta: t0 + 2.1 * 3600e3, vis: 800, gust: 12, wind: 9, cross: 0.1, info: { level: 1, f: { fog: true } } },
          ];
          const scan = h.scanLastExit(tripPts, t0);
          assert(scan && scan.kind === "fog" && scan.pt.km === 90, "last-exit scan broken");
          assert(h.scanLastExit(tripPts.map((p) => ({ ...p, vis: 20000, gust: 10, info: { level: 0, f: {} } })), t0) === null, "last-exit false positive on clear route");
          const sol = h.solunarWindows({ sunrise: "2026-11-06T06:15", sunset: "2026-11-06T17:05", frac: mp.frac, pressure: 1016, dp3h: 0.2, nowMs: t0 });
          assert(sol && sol.majors.length === 2 && sol.score >= 1 && sol.score <= 5, "solunar windows broken");
          assert(h.congestion(8, 3, 0) > h.congestion(3, 3, 0), "rush-hour congestion model broken");
          assert(!$("#v29-poi-panel"), "POI panel must be removed (v35)");
          assert($("#v29-like-card") && $("#v29-like-run"), "time-machine like-today card missing");
          assert($("#v29-solunar-card"), "solunar card missing");
          assert($("#v29-exit-card") && $("#v29-hud-btn"), "roads v29 nodes missing");
          assert($("#eco-saver-card"), "eco saver card missing");
          assert($("#v29-wtype") && $("#v29-wtype").querySelectorAll("button[data-wt]").length === 3, "widget type selector missing");
          assert($$(".v29-voice-btn").length === 0, "advisor voice buttons must be removed (v54)");
          assert(window.__matarBridge && typeof window.__matarBridge.redrawWidget === "function", "bridge missing");
          return `moon ${mp.ageDays.toFixed(1)}d · exit ${scan.kind}@90km · score ${sol.score}`;
        });

        const pass = results.filter((r) => r.pass).length;
        const ms = Math.round(performance.now() - started);
        renderSelftestOverlay(results, pass, ms);
        try { console.table(results.map(({ name, pass: p, detail }) => ({ name, pass: p, detail }))); } catch (e) {}
        return { pass, total: results.length };
      }

      function renderSelftestOverlay(results, pass, ms) {
        const allPass = pass === results.length;
        const failed = results.filter((r) => !r.pass);
        const rows = results.map((r) => `
          <div style="display:flex;gap:8px;align-items:baseline;padding:2px 0">
            <b style="flex:0 0 auto;color:${r.pass ? "#7ef0dc" : "#ff9e94"}">${r.pass ? "✓" : "✗"}</b>
            <span style="flex:1;min-width:0"><code style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px">${escapeHtml(r.name)}</code>${r.detail ? ` <span style="color:#9db8b2">— ${escapeHtml(r.detail)}</span>` : ""}</span>
          </div>`).join("");
        const panel = document.createElement("section");
        panel.id = "matar-selftest";
        panel.dir = currentLanguage === "ar" ? "rtl" : "ltr";
        panel.style.cssText = "position:fixed;bottom:12px;inset-inline-start:12px;z-index:9999;width:min(430px,94vw);max-height:56vh;overflow:auto;padding:13px 16px;border:1px solid rgb(255 255 255 / 16%);border-radius:15px;background:linear-gradient(160deg,rgb(9 26 30 / 97%),rgb(9 22 26 / 94%));color:#eaf4f0;font:12px/1.8 'Segoe UI',Tahoma,Arial,sans-serif;box-shadow:0 18px 50px rgb(0 0 0 / 45%);";
        panel.innerHTML = `
          <header style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:6px">
            <strong>${escapeHtml(tr("اختبارات ذاتية"))} · <span style="color:${allPass ? "#7ef0dc" : "#ff9e94"}">${pass}/${results.length}</span> · ${ms}ms</strong>
            <button type="button" data-selftest-close style="border:1px solid rgb(255 255 255 / 30%);border-radius:8px;background:transparent;color:#eaf4f0;cursor:pointer;padding:1px 10px;font:inherit">✕</button>
          </header>
          <p style="margin:0 0 8px;font-weight:800;color:${allPass ? "#7ef0dc" : "#ff9e94"}">${allPass ? escapeHtml(tr("جميع الاختبارات ناجحة ✓")) : `${escapeHtml(tr("اختبارات فاشلة"))}: ${escapeHtml(failed.map((f) => f.name).join(" · "))}`}</p>
          ${rows}`;
        document.body.appendChild(panel);
        panel.querySelector("[data-selftest-close]").addEventListener("click", () => panel.remove());
        // المرحلة 6: لوحة الاختبارات تتبع لغة الواجهة (إعادة رسم عند تغيير اللغة)
        document.addEventListener("matar:language", () => {
          if (panel.isConnected) { panel.remove(); renderSelftestOverlay(results, pass, ms); }
        }, { once: false });
      }

      /* ============================================================
         إصدار 20 — تثبيت التطبيق (PWA Install)
         ------------------------------------------------------------
         ① كروم/إيدج/سامسونج: نلتقط حدث beforeinstallprompt ونعرض زر
            «تثبيت» في الشريط العلوي — ضغطة واحدة تفتح نافذة التثبيت الرسمية.
         ② الآيفون (سفاري): الحدث غير مدعوم هناك — الزر يعرض خطوات
            «مشاركة ← إضافة إلى الشاشة الرئيسية» بلغة مفهومة.
         ③ بعد التثبيت (وضع standalone) يختفي الزر نهائيًا.
         المانيفست والأيقونات وملف sw.js المرافقة هي التي تجعل المتصفح
         يُطلق حدث beforeinstall_prompt أصلًا — انظر manifest.webmanifest.
         ============================================================ */
      const PwaInstall = (() => {
        let deferred = null;
        const btn = $("#install-btn");
        const isStandalone = () => (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
          || window.navigator.standalone === true;
        const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent || "")
          || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        /* رسالة عابرة أسفل الشاشة — مستقلة عن بقية الوحدات عمدًا */
        function pwaToast(msg) {
          try {
            const t = document.createElement("div");
            t.setAttribute("role", "status");
            t.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:6000;max-width:min(460px,92vw);padding:12px 18px;border-radius:14px;background:linear-gradient(160deg,rgb(9 26 30 / 96%),rgb(9 22 26 / 92%));color:#eaf4f0;font:13px/1.8 'Segoe UI',Tahoma,Arial,sans-serif;box-shadow:0 14px 38px rgb(0 0 0 / 35%);opacity:0;transition:opacity 200ms ease;";
            t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => { t.style.opacity = "1"; });
            setTimeout(() => {
              t.style.opacity = "0";
              setTimeout(() => t.remove(), 260);
            }, 5200);
          } catch (e) { console.info(msg); }
        }

        function show() { if (btn && !isStandalone()) btn.hidden = false; }

        if (btn) {
          btn.addEventListener("click", async () => {
            if (deferred) {
              const d = deferred;
              btn.disabled = true;
              try {
                d.prompt();
                /* userChoice قد يتأخر إن تأخر المستخدم في النافذة — سباق زمني يمنع تعليق الزر */
                const choice = await Promise.race([
                  d.userChoice,
                  new Promise((resolve) => setTimeout(() => resolve(null), 60000)),
                ]);
                if (choice && choice.outcome === "accepted") {
                  pwaToast(tr("تم تثبيت تطبيق مَطَر برو على جهازك."));
                }
                deferred = null;
                btn.disabled = false;
                btn.hidden = true;
              } catch (e) {
                /* فشل الاستدعاء (حدث لن يتكرر في هذه الصفحة): نُبقي الزر ظاهرًا مع الدليل البديل */
                btn.disabled = false;
                pwaToast(tr("ثبّت التطبيق من قائمة المتصفح: قائمة النقاط الثلاث ← «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."));
              }
              return;
            }
            if (isIOS()) {
              pwaToast(tr("على الآيفون: اضغط زر المشاركة في سفاري ثم اختر «إضافة إلى الشاشة الرئيسية»."));
            } else {
              pwaToast(tr("ثبّت التطبيق من قائمة المتصفح: قائمة النقاط الثلاث ← «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."));
            }
          });
        }

        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault();
          deferred = e;
          show();
        });
        window.addEventListener("appinstalled", () => {
          deferred = null;
          if (btn) btn.hidden = true;
          pwaToast(tr("تم تثبيت تطبيق مَطَر برو على جهازك."));
        });
        /* لو فات الحدث قبل تجهيز الوحدة (نادرًا): نظهر الزر بعد ثانية ونصيف
           إن لم يكن التطبيق مثبتًا — والنقر حينها يرشد لقائمة المتصفح */
        if (!isStandalone()) setTimeout(show, 1000);
        return {};
      })();

      /* ============================================================
         الإقلاع
         ============================================================ */
      /* ┌────────────────────────────────────────────────────────────────────┐
         │ كتلة الإقلاع boot() (كانت الأسطر 16552-16594) انتقلت حرفيًا إلى نهاية  │
         │ map.js §12 كي تُنفَّذ بعد اكتمال تعريفات الملفين معًا — أما جسر         │
         │ window.__matarBridge فقد بقي هنا (أدناه) ليتوفر لسكربتات v المرفقة     │
         │ في app.js قبل تقييمها، تمامًا كما كان ترتيبه في الملف الأحادي الأصلي.   │
         └────────────────────────────────────────────────────────────────────┘ */



/* ═══════════════════ 4) جسر القراءة لسكربتات v المرفقة ═══════════════════ */

        /* إصدار 29: جسر قراءة للميزات المضافة (v29) — يكشف الحد الأدنى من الحالة
           للسكربت المرفق دون كسر التغليف، وكل الاستخدامات للقراءة فقط */
        try {
          window.__matarBridge = {
            state, Eco, tr, tf, tx, isAr, localNum, escapeHtml, tempText, clockText, wmoDesc, cloudFixCode, smartCut, clamp,
            hourIndexAtPlace, showPage,
            lang: () => currentLanguage,
            /* إصدار 30: جسر مبدّل النماذج — قراءة النموذج النشط والتبديل من السكربت المرفق */
            activeModel: () => activeModel,
            switchWeatherModel,
            redrawWidget: () => { try { WidgetGen.draw(); } catch (e) {} },
          };
        } catch (e) { /* السكربت المرفق يتعامل مع غياب الجسر */ }

/* ═══════════════════ 5) سكربتات الإصدارات التطبيقية (بترتيبها الأصلي) ═══════════════════ */



/* ═══════════════════ v29 — حزمة الميزات الذكية (ودجت + استماع + زي النهاردة + وضع القيادة HUD) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 29: حزمة الميزات الذكية المضافة
   ────────────────────────────────────────────────────────────
   ① ودجت متقدم: اختيار النوع (عام/مزارع/سائق) + وضع ليلي بالقمر
      وطقس الصباح القادم (الرسم نفسه داخل سكربت التطبيق — هنا
      لوحة الاختيار وحفظ التفضيل وإعادة التوليد عبر الجسر)
   ② الخلاصة الصوتية للمستشارين (Web Speech API — بلا سيرفر)
   ③ «زي النهاردة» — مقارنة طقس اليوم بنفس اليوم عبر 20 سنة
      (Archive API — 20 طلبًا صغيرًا متوازيًا + كاش 24 ساعة)
   ④ عداد توفير الوضع الاقتصادي (ميجابايت + طلبات ممنوعة)
   ⑤ المظهر الديناميكي المرتبط بالطقس والوقت (CSS Variables)
   ⑥ مؤشر سولنار للصيد: دورة القمر + ساعات الصيد الذهبية
      والمد والجزر التقريبي (رياضيات فلكية محلية بلا حزم)
   ⑦ الطرق: الرياح الجانبية + تنبيه الفرصة الأخيرة على المسار
   ⑧ وضع القيادة الليلي HUD: شاشة معكوسة + سرعة GPS + سهم خطر
      الطريق القادم + وميض تنبيهي
   ⑨ لوحة خدمات الطريق العائمة فوق الخريطة الكبرى:
      ⛽ محطات وقود · 🏨 فنادق (Overpass 5كم، DivIcon إيموجي)
      🚦 زحمة الطريق (محاولة بث Esri الحي ثم بدائل محلية)
   كل الميزات محتكرة بوضع الوضع الاقتصادي (Eco-Mode) حيث يلزم.
   ============================================================ */
(() => {
  const B = window.__matarBridge || null;
  const $ = (s, r) => (r || document).querySelector(s);

  /* ---------- مساعدات محلية (تعمل حتى لو غاب الجسر) ---------- */
  const esc = (v) => {
    try {
      return B ? B.escapeHtml(String(v ?? "")) : String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    } catch (e) { return String(v ?? ""); }
  };
  const num = (v, d = 0) => {
    try { return B ? B.localNum(v, d) : (v == null || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(d)); } catch (e) { return "—"; }
  };
  const tr = (t) => { try { return B ? B.tr(t) : t; } catch (e) { return t; } };
  const clock = (d) => { try { return B ? B.clockText(d) : new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }); } catch (e) { return "—"; } };
  const isEco = () => { try { return B?.Eco ? B.Eco.isEco() : document.documentElement.classList.contains("eco"); } catch (e) { return false; } };
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /* ============================================================
     ④ عداد توفير الوضع الاقتصادي — __matarEcoBite(kb, label)
     ============================================================ */
  const EcoSaver = (() => {
    const KEY = "matar:v29:ecostats";
    const monthKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
    const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY)); return d && d.month === monthKey() ? d : null; } catch (e) { return null; } };
    const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
    function data() {
      let d = load();
      if (!d) d = { month: monthKey(), kb: 0, blocks: 0 };
      return d;
    }
    function bite(kb) {
      const d = data();
      d.kb += kb; d.blocks += 1;
      save(d);
      render();
    }
    window.__matarEcoBite = bite;
    function ensureCard() {
      if (!$("#eco-saver-card")) {
        const anchor = $("#eco-state");
        if (!anchor) return;
        anchor.insertAdjacentHTML("afterend", `
          <div class="v29-eco-card" id="eco-saver-card">
            <div class="v29-eco-num">
              <span><b id="eco-saver-mb">0.0</b><small>${esc(tr("ميجابايت وفّرتها لك هذا الشهر"))}</small></span>
              <span><b id="eco-saver-count">0</b><small>${esc(tr("طلبًا ثقيلًا منعناها بدلًا منك"))}</small></span>
            </div>
            <p class="v29-eco-msg" id="eco-saver-msg">—</p>
          </div>`);
      }
    }
    function render() {
      ensureCard();
      const d = data();
      const mb = d.kb / 1024;
      const mbTxt = num(mb >= 100 ? Math.round(mb) : Math.round(mb * 10) / 10, 1);
      const mbEl = $("#eco-saver-mb"), cEl = $("#eco-saver-count"), msg = $("#eco-saver-msg"), box = $("#eco-saver-card");
      if (mbEl) mbEl.textContent = mbTxt;
      if (cEl) cEl.textContent = num(d.blocks);
      if (msg) {
        msg.textContent = isEco()
          ? tr("🎉 تفعيلك للوضع الاقتصادي وفّر على باقة هاتفك {mb} ميجابايت هذا الشهر، وخفّف استهلاك البطارية بنحو 15٪ — كل خريطة أو رادار يُمنع تحميله يُحسب هنا فورًا.").replace("{mb}", mbTxt)
          : tr("شغّل الوضع الاقتصادي وسيبدأ العداد بحساب كل ميجابايت يوفّره لك التطبيق لحظة بلحظة.");
      }
      if (box) box.style.opacity = isEco() ? "1" : "0.72";
    }
    document.addEventListener("matar:eco", render);
    document.addEventListener("matar:language", render);
    render();
    return { bite, render };
  })();

  /* ============================================================
     إصدار 35: حُذفت لوحة خدمات الطريق العائمة (⛽ بنزين · 🏨 فنادق ·
     🚦 زحمة) من فوق الخريطة الكبرى كليًا بطلب المستخدم — كي تبقى
     مساحة الخريطة نظيفة وممتدة بلا عناصر POI ولا أزرار فوق البلاطات.
     يُحتفظ فقط بنموذج تقدير الزحمة المحلي (وقت الذروة) لخدمة الفحص
     الذاتي والتحليل الداخلي، بلا أي أثر واجهة على الخريطة.
     ============================================================ */
  function congestionBase(h, day) {
    let v;
    if (h <= 5) v = 0.2; else if (h === 6) v = 0.45; else if (h <= 9) v = 0.85;
    else if (h <= 11) v = 0.55; else if (h <= 13) v = 0.65; else if (h <= 16) v = 0.6;
    else if (h <= 19) v = 0.9; else if (h <= 21) v = 0.6; else v = 0.32;
    if (day === 5) v *= 0.55; else if (day === 6) v *= 0.8;
    return Math.min(1, v);
  }

  /* ============================================================
     ② الخلاصة الصوتية للمستشارين — Web Speech API
     ============================================================ */
const Voice = (() => {
    if (!("speechSynthesis" in window)) return {};
    /* v54: أُزيلت كل أزرار «استمع» من بطاقات المستشارين نهائيًا — صوت التطبيق
       كله محصور في موضعين حصرًا: «🎙 نشرة اليوم الصوتية» أعلى الرئيسية
       و«🔊 استمع لتفاصيل اليوم» في بطاقة تفاصيل اليوم بالتقويم الشهري */
    const targets = [];
    const strip = (t) => String(t || "")
      .replace(/([\p{Extended_Pictographic}\p{S}])/gu, " ")
      .replace(/([^\p{L}\p{N}\s.,:;!؟?،؛٪%\-])/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
    /* تسخين قائمة الأصوات: Chrome/Edge يعيدان [] في أول استدعاء ولا تُملأ إلا
       بعد حدث voiceschanged — نسخّن مبكرًا وأثناء أول ثوانٍ */
    let voicesWarm = false;
    const warmVoices = () => {
      try { if ((speechSynthesis.getVoices() || []).length) voicesWarm = true; } catch (e) {}
    };
    try {
      warmVoices();
      speechSynthesis.addEventListener?.("voiceschanged", warmVoices);
      if (!voicesWarm) { setTimeout(warmVoices, 350); setTimeout(warmVoices, 1200); setTimeout(warmVoices, 3000); }
    } catch (e) {}
    function pickVoice() {
      try {
        const vs = speechSynthesis.getVoices() || [];
        if (!vs.length) return null;
        const lang = (B?.lang?.() || "ar").slice(0, 2);
        if (lang === "ar") {
          /* إصلاح 38 — أولوية السعودية بطلب المستخدم: صوت «ماجد» (Maged) بالاسم
             تحديدًا أولًا، ثم أي صوت ar-SA (نائف/حامد على ويندوز وماجد على آبل)،
             ثم أي صوت عربي متاح، ثم أسماء الأصوات العربية الشهيرة على الأنظمة
             المختلفة — كي يكون النطق سعوديًا واضحًا ومفهومًا */
          const AR_NAME = /(arab|عرب|محمد|هدي|hoda|maged|majed|naayf|nayef|laila|leila|salma|zariyah|amina|amira|fahed|shakir|tarik|hamed|mariam)/i;
          const arLang = (v) => /^ar([-_]|$)/i.test(String(v.lang || ""));
          const saLang = (v) => /^ar[-_]SA$/i.test(String(v.lang || ""));
          return vs.find((v) => arLang(v) && /maged|ماجد/i.test(v.name || ""))
            || vs.find(saLang)
            || vs.find(arLang)
            || vs.find((v) => AR_NAME.test(v.name || ""))
            || null;
        }
        return vs.find((v) => v.lang?.toLowerCase().startsWith(lang))
          || null;
      } catch (e) { return null; }
    }
    /* توست خفيف يوضح سبب عدم النطق بدل الصمت التام */
    function voiceToast(msg) {
      const t = document.createElement("div");
      t.setAttribute("role", "status");
      t.textContent = msg;
      t.style.cssText = "position:fixed;bottom:18px;inset-inline-start:50%;transform:translateX(50%);z-index:9500;padding:10px 16px;border-radius:12px;background:var(--teal);color:#fffaf0;font-size:12.5px;font-weight:700;box-shadow:0 10px 26px rgb(0 0 0 / 25%);max-width:min(90vw,420px);text-align:center;transition:opacity 300ms ease";
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = "0"; }, 2200);
      setTimeout(() => t.remove(), 2600);
    }
    /* تقسيم النص الطويل لمقاطع قصيرة على حدود الجمل — بعض أصوات أندرويد
       تقطع النطق عند النص الواحد الأطول من ~200 حرف */
    function chunkText(text) {
      if (text.length <= 200) return [text];
      const parts = text.split(/(?<=[.!؟?،؛:…])\s+/);
      const chunks = [];
      let cur = "";
      const pushWordwise = (s) => {
        let piece = "";
        s.split(" ").forEach((w) => {
          if ((piece + " " + w).trim().length <= 200) piece = (piece ? piece + " " : "") + w;
          else { if (piece) chunks.push(piece); piece = w; }
        });
        return piece;
      };
      parts.forEach((s) => {
        if ((cur + " " + s).trim().length <= 200) cur = (cur ? cur + " " : "") + s;
        else {
          if (cur) chunks.push(cur);
          cur = s.length <= 200 ? s : pushWordwise(s);
        }
      });
      if (cur) chunks.push(cur);
      return chunks.length ? chunks : [text];
    }
    const isPendingText = (t) => !t
      || /^(يحلّل|يقرأ|يفحص|بانتظار|نجهّز|Crunching|Waiting|Reading|Analys)/.test(t)
      || t.length < 12;
    function speakChunks(btn, text) {
      const chunks = chunkText(text);
      const lang = (B?.lang?.() || "ar").slice(0, 2);
      const fallbackLang = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "es" ? "es-ES" : lang === "pt" ? "pt-PT" : lang === "it" ? "it-IT" : "en-US";
      /* إصلاح 37 — سلسلة محاولات متدرجة لأول مقطع: الصوت المختار ← بلا صوت مع
         ar-SA ← ar-EG ← ar ← إعدادات النظام الافتراضية. أول إعداد يبدأ النطق
         فعليًا (onstart) يُثبَّت لبقية المقاطع — فيعمل الصوت العربي حتى على
         الأجهزة التي تبتلع النطقة الأولى أو تغيب عندها قائمة الأصوات أولًا. */
      const voice = pickVoice();
      const strategies = [];
      if (voice) strategies.push({ voice, lang: String(voice.lang || "").replace("_", "-"), rate: lang === "ar" ? 0.95 : 0.97 });
      if (lang === "ar") {
        strategies.push(
          { voice: null, lang: "ar-SA", rate: 1 },
          { voice: null, lang: "ar-EG", rate: 1 },
          { voice: null, lang: "ar", rate: 1 },
          { voice: null, lang: "", rate: 1 }
        );
      } else {
        strategies.push({ voice: null, lang: fallbackLang, rate: 0.97 }, { voice: null, lang: "", rate: 1 });
      }
      let stratIdx = 0, chunkIdx = 0, watchdog = 0, started = false, lastErr = "";
      btn.dataset.speaking = "1";
      const stopAll = () => { clearTimeout(watchdog); btn.removeAttribute("data-speaking"); };
      const speakChunk = (i, strat, isRetry) => {
        if (btn.dataset.speaking !== "1" || !btn.isConnected) { stopAll(); return; }
        const u = new SpeechSynthesisUtterance(chunks[i]);
        if (strat.voice) { try { u.voice = strat.voice; } catch (e) {} }
        if (strat.lang) u.lang = strat.lang;
        u.rate = strat.rate;
        u.pitch = 1;
        u.volume = 1;
        u.onstart = () => { if (!started) { started = true; clearTimeout(watchdog); } };
        u.onend = () => {
          clearTimeout(watchdog);
          if (btn.dataset.speaking !== "1") return;
          chunkIdx = i + 1;
          if (chunkIdx >= chunks.length) { stopAll(); return; }
          setTimeout(() => speakChunk(chunkIdx, strat, false), 40);
        };
        u.onerror = (ev) => {
          clearTimeout(watchdog);
          lastErr = String(ev?.error || "");
          if (btn.dataset.speaking !== "1") return;
          if (!started && stratIdx + 1 < strategies.length) { stratIdx += 1; setTimeout(() => tryStrategy(stratIdx), 120); }
          else {
            stopAll();
            /* فشل حقيقي بعد استنفاد كل المحاولات — رسالة توضيحية (إلا رفض
               السياسة not-allowed أو الانقطاع المتعمد فيُترك صامتًا) */
            if (!["not-allowed", "interrupted", "canceled"].includes(lastErr)) {
              voiceToast(tr("لم يستطع جهازك نطق هذه الخلاصة — تأكد من تثبيت صوت لغتها من إعدادات النظام."));
            }
          }
        };
        try { speechSynthesis.speak(u); } catch (e) { stopAll(); return; }
        /* مراقب صمت دائم على كل مقطع: بعض المحركات تبتلع النطقة بلا onerror —
           إن لم يبدأ النطق خلال 1.7 ث ننتقل للإعداد التالي، وفي المحاولة الأخيرة
           نعيد المقطع نفسه مرة إضافية قبل الاستسلام برسالة واضحة */
        clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          if (btn.dataset.speaking !== "1") return;
          try { if (speechSynthesis.speaking || speechSynthesis.pending) return; } catch (e) {}
          if (!started && stratIdx + 1 < strategies.length) {
            stratIdx += 1;
            try { speechSynthesis.cancel(); } catch (e) {}
            setTimeout(() => tryStrategy(stratIdx), 90);
          } else if (!isRetry) {
            try { speechSynthesis.cancel(); } catch (e) {}
            setTimeout(() => speakChunk(i, strat, true), 90);
          } else {
            stopAll();
            voiceToast(tr("لم يستطع جهازك نطق هذه الخلاصة — تأكد من تثبيت صوت لغتها من إعدادات النظام."));
          }
        }, 1700);
      };
      const tryStrategy = (si2) => {
        if (btn.dataset.speaking !== "1") return;
        const strat = strategies[si2] || strategies[strategies.length - 1];
        chunkIdx = 0;
        speakChunk(0, strat, false);
      };
      tryStrategy(0);
    }
    function toggle(btn, sel) {
      const wasSpeaking = btn.dataset.speaking === "1";
      /* نرصد حالة المحرك قبل التفريغ كي نحفظ شرط iOS (الفاصل بعد cancel فقط) */
      const hadSpeech = (() => { try { return speechSynthesis.speaking || speechSynthesis.pending; } catch (e) { return false; } })();
      /* ═ إصلاح 39 — تفريغ الذاكرة الصوتية المعلقة (حرفيًا في أول الدالة):
         window.speechSynthesis.cancel() يفرغ قائمة النطق المتراكمة تمامًا قبل بدء
         النص الجديد فيمنع تعليق أو تجميد الصوت على الهواتف (Chrome أندرويد يملأ
         قائمته الصامتة ثم يتجمد) — وبما أن النطق الجديد يبدأ بعدها مباشرة داخل
         إيماءة اللمس نفسها (أو بعد فاصل 60مث عند وجود نطق سابق) يبقى شرط
         Autoplay Block / iOS محفوظًا بلا أي فقد للصلاحية. */
      try { window.speechSynthesis.cancel(); } catch (e) {}
      document.querySelectorAll(".v29-voice-btn[data-speaking]").forEach((b) => b.removeAttribute("data-speaking"));
      if (wasSpeaking) return;
      let text = strip($(sel)?.textContent || "");
      if (isPendingText(text)) {
        /* الخلاصة تُكتب حرفًا حرفًا بتأثير الآلة الكاتبة — بدل الرفض الصامت:
           ① نفكّ محرك الصوت داخل اللمسة نفسها بونطقة صامتة (شرط iOS للسماح
              بالنطق لاحقًا خارج إيماءة المستخدم) ② نراقب اكتمال الكتابة ونبدأ
              القراءة تلقائيًا لحظة جهوزها */
        try {
          const warm = new SpeechSynthesisUtterance(" ");
          warm.volume = 0;
          speechSynthesis.speak(warm);
        } catch (e) {}
        voiceToast(tr("نجهّز الصياغة ثم نقرأها لك فورًا…"));
        let tries = 0;
        const poll = () => {
          if (btn.dataset.speaking === "1" || !btn.isConnected) return;
          const t2 = strip($(sel)?.textContent || "");
          if (!isPendingText(t2)) { speakChunks(btn, t2); return; }
          if (++tries > 14) return;
          setTimeout(poll, 350);
        };
        setTimeout(poll, 350);
        return;
      }
      if (!text) return;
      try { speechSynthesis.resume(); } catch (e) {} /* علاج حالة Chrome المتوقفة */
      /* إصلاح 37/39: الفاصل بعد cancel() فقط (تفريغ فعلي للذاكرة) — أما النقرة
         الأولى على محرك صامت فتنطق فورًا داخل إيماءة المستخدم نفسها (شرط iOS) */
      if (hadSpeech) setTimeout(() => { if (btn.dataset.speaking !== "1") speakChunks(btn, text); }, 60);
      else speakChunks(btn, text);
    }
    const SPK = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    targets.forEach(([ref, txt]) => {
      const refEl = $(ref);
      if (!refEl || refEl.previousElementSibling?.classList?.contains("v29-voice-btn")) return;
      refEl.insertAdjacentHTML("beforebegin", `<button type="button" class="ai-fresh v29-voice-btn" data-voice="${txt}" title="${esc(tr("استمع للخلاصة صوتيًا — ممتاز أثناء القيادة أو العمل في الحقل"))}" aria-label="${esc(tr("استمع للخلاصة صوتيًا"))}">${SPK}<span>${esc(tr("استمع"))}</span></button>`);
      /* ═ إصلاح 39 — ربط صريح ومباشر للمطلب (Element.addEventListener):
         النطق يبدأ داخل إيماءة الضغط على الزر نفسه (user gesture حقيقية) فيتخطى
         حظر المتصفحات الأمني (Autoplay Block) بشكل مؤكد — بدل الاعتماد على
         التفويض العام عبر المستند الذي قد يفقد سياق الإيماءة في بعض المتصفحات.
         الإيقاف بالنقر الثاني يعمل بنفس الربط المباشر. */
      const vbtn0 = refEl.previousElementSibling;
      /* v52 ②: استبدال الزر بنسخة نظيفة (cloneNode) قبل الربط — يمسح أي مستمع
         أحداث قديم موروث من النسخ السابقة تمامًا (data-voice ينجو مع النسخة)،
         ثم يُربط مستمع واحد حصري عبر المحرك الموحد */
      let vbtn = vbtn0;
      if (vbtn0?.classList?.contains("v29-voice-btn")) {
        vbtn = vbtn0.cloneNode(true);
        vbtn0.replaceWith(vbtn);
      }
      /* v51 ①: حارس ربط أحادي (data-bound="1") — إعادة رسم الواجهة أو استدعاء
         المُهيّئ مرتين لا يربط EventListener ثانيًا على الزر نفسه فلا يتضاعف النطق */
      if (vbtn?.classList?.contains("v29-voice-btn") && vbtn.dataset.bound !== "1") {
        vbtn.dataset.bound = "1";
        vbtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(vbtn, vbtn.dataset.voice);
        });
      }
    });
    window.addEventListener("beforeunload", () => { try { speechSynthesis.cancel(); } catch (e) {} });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        try { speechSynthesis.cancel(); } catch (e) {}
        document.querySelectorAll(".v29-voice-btn[data-speaking]").forEach((b) => b.removeAttribute("data-speaking"));
      }
    });
    return {};
  })();

  /* ============================================================
     ③ «زي النهاردة» — آلة الزمن التفاعلية (20 سنة)
     ============================================================ */
  const TimeLike = (() => {
    if (!$("#monthly-time-pane") || $("#v29-like-card")) return {};
    $("#tm-content")?.insertAdjacentHTML("afterend", `
      <div class="v29-like-card" id="v29-like-card">
        <h3>🧭 ${esc(tr("زي النهاردة… لكن قبل 20 سنة"))}</h3>
        <p>${esc(tr("نقارن حرارة وهطول اليوم بنفس اليوم تحديدًا (يوم/شهر) عبر عشرين سنة من سجل الطقس الحقيقي — ويخرج لك الأمر في جمل ممتعة."))}</p>
        <button type="button" class="retry-btn" id="v29-like-run">${esc(tr("اكتشف «زي النهاردة»"))}</button>
        <div class="v29-like-out" id="v29-like-out"></div>
      </div>`);
    /* v71 — M-01: نص توضيحي أنيق داخل بطاقة «زي النهاردة» بدل الفراغ —
       يُستبدل تلقائيًا بأول تشغيل للمقارنة (out.innerHTML في run()) */
    try {
      $("#v29-like-out").innerHTML = `<div class="v29-like-line"><span class="emo">🕰</span><span>${esc(tr("رحلتك عبر عشرين سنة بانتظارك — اضغط الزر أعلاه لتبدأ المقارنة."))}</span></div>`;
    } catch (e) { /* زينة اختيارية */ }

    const KEY = (lat, lon, mmdd) => `matar:v29:timemachine:${lat.toFixed(2)},${lon.toFixed(2)}:${mmdd}`;
    async function fetchYear(place, year, mmdd) {
      const u = new URL("https://archive-api.open-meteo.com/v1/archive");
      u.search = new URLSearchParams({
        latitude: String(place.latitude), longitude: String(place.longitude),
        start_date: `${year}-${mmdd}`, end_date: `${year}-${mmdd}`,
        daily: "temperature_2m_mean,precipitation_sum", timezone: "auto",
      });
      const r = await fetch(u.toString());
      if (!r.ok) throw new Error(`http ${r.status}`);
      const d = await r.json();
      return { year, t: d?.daily?.temperature_2m_mean?.[0] ?? null, pr: d?.daily?.precipitation_sum?.[0] ?? 0 };
    }
    async function fetchAll(place, years, mmdd) {
      const out = [];
      let i = 0;
      const workers = Array.from({ length: 5 }, async () => {
        while (i < years.length) {
          const y = years[i++];
          try { out.push(await fetchYear(place, y, mmdd)); } catch (e) { /* سنة فاشلة لا تكسر البقية */ }
        }
      });
      await Promise.all(workers);
      return out.sort((a, b) => a.year - b.year);
    }
    async function run() {
      const out = $("#v29-like-out");
      const btn = $("#v29-like-run");
      const place = B?.state?.place;
      if (!out || !place) return;
      if (isEco()) {
        window.__matarEcoBite?.(55, "أرشيف عشرين سنة");
        out.innerHTML = `<div class="v29-like-line"><span class="emo">🔋</span><span>${esc(tr("هذه المقارنة تجلب سجل عشرين سنة — متاحة بعد إيقاف الوضع الاقتصادي، أو استخدم «آلة الزمن المناخي» أعلاه المحسوبة من آخر جلب."))}</span></div>`;
        return;
      }
      const wx = B?.state?.wx;
      const mmdd = wx?.current?.time ? wx.current.time.slice(5, 10) : new Date().toISOString().slice(5, 10);
      const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 20 + i);
      const key = KEY(place.latitude, place.longitude, mmdd);
      btn.disabled = true;
      out.innerHTML = `<div class="v29-like-line"><span class="emo">⏳</span><span>${esc(tr("نسافر عبر عشرين سنة من السجل…"))}</span></div>`;
      let rows = null;
      try { rows = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) {}
      if (!rows || rows.at < Date.now() - 24 * 3600e3 || rows.mmdd !== mmdd) {
        try {
          rows = { at: Date.now(), mmdd, rows: await fetchAll(place, years, mmdd) };
          try { localStorage.setItem(key, JSON.stringify(rows)); } catch (e) {}
        } catch (e) {
          out.innerHTML = `<div class="v29-like-line"><span class="emo">📡</span><span>${esc(tr("تعذر جلب الأرشيف الآن — أعد المحاولة بعد قليل."))}</span></div>`;
          btn.disabled = false;
          return;
        }
      }
      const data = rows.rows.filter((r) => r.t != null);
      const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
      const todayT = wx?.current?.temperature_2m ?? null;
      const mean20 = mean(data.map((r) => r.t));
      const mean10 = mean(data.slice(-10).map((r) => r.t));
      const maxPr = data.reduce((m, r) => (r.pr > (m?.pr ?? -1) ? r : m), null);
      const rainYears = data.filter((r) => (r.pr ?? 0) >= 1).length;
      const hotYear = data.reduce((m, r) => (r.t > (m?.t ?? -99) ? r : m), null);
      const coldYear = data.reduce((m, r) => (r.t < (m?.t ?? 99) ? r : m), null);
      const lines = [];
      const dayName = `${num(Number(mmdd.slice(0, 2)))}/${num(Number(mmdd.slice(3, 5)))}`;
      if (todayT != null && mean20 != null) {
        const diff = Math.round((todayT - mean20) * 10) / 10;
        lines.push(["🌡", diff >= 0
          ? tr("طقس اليوم أدفأ بـ {d} درجة من متوسط نفس اليوم ({day}) عبر العشرين سنة الماضية.").replace("{d}", num(Math.abs(diff), 1)).replace("{day}", dayName)
          : tr("طقس اليوم أبرد بـ {d} درجة من متوسط نفس اليوم ({day}) عبر العشرين سنة الماضية.").replace("{d}", num(Math.abs(diff), 1)).replace("{day}", dayName)]);
      }
      if (maxPr && maxPr.pr >= 1) {
        lines.push(["🌧", tr("عام {y} شهد أغزر أمطار في مثل هذا اليوم بمعدل {p} ملم.").replace("{y}", num(maxPr.year)).replace("{p}", num(maxPr.pr, 1))]);
      }
      if (data.length) {
        lines.push(["☔", rainYears
          ? tr("المطر هطل في مثل هذا اليوم في {n} من أصل {t} سنة الماضية.").replace("{n}", num(rainYears)).replace("{t}", num(data.length))
          : tr("لم يمطر إطلاقًا في مثل هذا اليوم طوال {t} سنة الماضية — يوم جاف بحق.").replace("{t}", num(data.length))]);
      }
      if (hotYear && coldYear) {
        lines.push(["🏆", tr("الأشد حرارة في مثل هذا اليوم: {y1} بـ {t1}° — والأبرد: {y2} بـ {t2}°.").replace("{y1}", num(hotYear.year)).replace("{t1}", num(hotYear.t, 1)).replace("{y2}", num(coldYear.year)).replace("{t2}", num(coldYear.t, 1))]);
      }
      if (mean10 != null && mean20 != null) {
        const drift = Math.round((mean10 - mean20) * 10) / 10;
        if (Math.abs(drift) >= 0.4) {
          lines.push(["📈", drift > 0
            ? tr("وفي آخر عشر سنوات فقط ارتفع متوسط هذا اليوم بمقدار {d} درجة — لمسة من تغيّر المناخ أمام عينيك.").replace("{d}", num(drift, 1))
            : tr("وفي آخر عشر سنوات انخفض متوسط هذا اليوم بمقدار {d} درجة عن المعدل العام.").replace("{d}", num(Math.abs(drift), 1))]);
        }
      }
      const maxPrV = maxPr?.pr ?? 0;
      const bars = data.map((r) => {
        const hPct = maxPrV > 0 ? Math.max(4, Math.round((r.pr / maxPrV) * 100)) : 4;
        return `<b style="height:${Math.min(100, hPct)}%" title="${esc(r.year)}: ${esc(num(r.pr, 1))} ${tx("ملم", "mm")}"></b>`;
      }).join("");
      out.innerHTML = lines.map(([emo, t]) => `<div class="v29-like-line"><span class="emo">${emo}</span><span>${esc(t)}</span></div>`).join("")
        + `<div class="v29-like-years" role="img" aria-label="${esc(tr("أمطار نفس اليوم عبر السنين"))}">${bars}</div>`;
      btn.disabled = false;
    }
    $("#v29-like-run")?.addEventListener("click", run);
    return {};
  })();

  /* ============================================================
     ⑤ المظهر الديناميكي — ربط ألوان الواجهة بالطقس والوقت
     ============================================================ */
  const DynSkin = (() => {
    function evaluate() {
      const wx = B?.state?.wx;
      if (!wx?.current) return;
      const cur = wx.current;
      const code = cur.weather_code ?? 0;
      const day = (cur.is_day ?? 1) === 1;
      let vis = 20000;
      try { vis = wx.hourly?.visibility?.[B.hourIndexAtPlace(wx)] ?? 20000; } catch (e) {}
      const pm10 = B?.state?.air?.current?.pm10;
      const rh = cur.relative_humidity_2m ?? 50;
      let skin = null;
      if (code >= 95) skin = "storm";
      else if ((cur.precipitation ?? 0) >= 0.5 || (code >= 51 && code <= 86)) skin = "rain";
      else if (code === 45 || code === 48 || vis < 1200) skin = "fog";
      else if ((pm10 != null && pm10 >= 150) || (vis < 4500 && rh < 42 && (cur.wind_speed_10m ?? 0) > 18)) skin = "dust";
      else if (!day) skin = "night";
      else if (code <= 1 && (cur.temperature_2m ?? 24) >= 33) skin = "heat";
      else if (code <= 1) skin = "sunny";
      const el = document.documentElement;
      if (skin) el.dataset.skin = skin; else delete el.dataset.skin;
    }
    document.addEventListener("matar:data", evaluate);
    document.addEventListener("matar:theme", evaluate);
    document.addEventListener("matar:eco", evaluate);
    setTimeout(evaluate, 900);
    setTimeout(evaluate, 4000);
    return { evaluate };
  })();

  /* ============================================================
     ⑥ مؤشر سولنار — ساعات الصيد الذهبية والمد والجزر التقريبي
     ============================================================ */
  const Solunar = (() => {
    /* رياضيات نقية — مفحوصة ذاتيًا عبر __matarV29Hooks */
    function moonPhase(nowMs) {
      const t = nowMs instanceof Date ? nowMs.getTime() : nowMs;
      const SYNODIC = 29.530588853 * 86400e3;
      const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
      let age = (t - NEW_MOON) % SYNODIC;
      if (age < 0) age += SYNODIC;
      const frac = age / SYNODIC;
      const bands = [
        [0.03, "محاق", "🌑"], [0.22, "هلال متزايد", "🌒"], [0.28, "تربيع أول", "🌓"], [0.47, "أحدب متزايد", "🌔"],
        [0.53, "بدر", "🌕"], [0.72, "أحدب متناقص", "🌖"], [0.78, "تربيع أخير", "🌗"], [0.97, "هلال متناقص", "🌘"],
      ];
      const hit = bands.find(([hi]) => frac <= hi) || [1, "هلال متناقص", "🌘"];
      return {
        ageDays: age / 86400e3, frac,
        name: hit[1], emoji: hit[2],
        illumination: Math.round((1 - Math.cos(2 * Math.PI * frac)) / 2 * 100),
      };
    }
    function solunarWindows({ sunrise, sunset, frac, pressure, dp3h, nowMs }) {
      const H = 3600e3;
      const sr = new Date(sunrise).getTime(), ss = new Date(sunset).getTime();
      if (!isFinite(sr) || !isFinite(ss)) return null;
      const now = nowMs ?? Date.now();
      const solarNoon = (sr + ss) / 2;
      const transit = solarNoon + frac * 24.84 * H;
      const underfoot = transit + 12.42 * H;
      const moonrise = transit - 6.21 * H;
      const moonset = transit + 6.21 * H;
      const norm = (t) => {
        while (t < now - 1.5 * H) t += 24.84 * H;
        while (t > now + 23 * H) t -= 24.84 * H;
        return t;
      };
      const majors = [
        { start: norm(transit - H), end: norm(transit + H), label: "عبور القمر (ذروة كبرى)" },
        { start: norm(underfoot - H), end: norm(underfoot + H), label: "تحت الأقدام (ذروة كبرى)" },
      ].sort((a, b) => a.start - b.start);
      const minors = [
        { start: norm(moonrise), end: norm(moonrise + H), label: "شروق القمر" },
        { start: norm(moonset), end: norm(moonset + H), label: "غروب القمر" },
        { start: norm(sr - 0.5 * H), end: norm(sr + 0.5 * H), label: "الفجر" },
        { start: norm(ss - 0.5 * H), end: norm(ss + 0.5 * H), label: "الغسق" },
      ].sort((a, b) => a.start - b.start);
      let score = 3;
      if (frac <= 0.08 || frac >= 0.92 || Math.abs(frac - 0.5) <= 0.08) score += 2;
      else if (Math.abs(frac - 0.25) <= 0.1 || Math.abs(frac - 0.75) <= 0.1) score += 0;
      else score += 1;
      if (pressure != null) { if (pressure >= 1015) score += 1; else if (pressure <= 1004) score -= 1; }
      if (dp3h != null && Math.abs(dp3h) >= 1.8) score += dp3h < 0 ? -1 : 1;
      score = Math.max(1, Math.min(5, score));
      const tides = [
        { t: norm(transit), kind: "high" }, { t: norm(underfoot), kind: "high" },
        { t: norm(moonrise), kind: "low" }, { t: norm(moonset), kind: "low" },
      ].sort((a, b) => a.t - b.t);
      return { majors, minors, score, tides };
    }
    function crosswind(speedKmh, windDirDeg, roadBearingDeg) {
      const rad = ((windDirDeg - roadBearingDeg) * Math.PI) / 180;
      return Math.abs(speedKmh * Math.sin(rad));
    }
    function scanLastExit(pts, nowMs) {
      let best = null;
      for (const p of pts || []) {
        const eta = p?.eta ?? 0;
        const dtH = (eta - nowMs) / 3600e3;
        if (dtH < 0.1 || dtH > 6) continue;
        const vis = p.vis;
        const gust = p.gust ?? 0;
        const fog = (vis != null && vis < 1000) || p.info?.f?.fog || p.info?.f?.dense;
        const gusty = gust > 50;
        if (!fog && !gusty) continue;
        if (!best || eta < best.pt.eta) best = { kind: fog ? (vis != null && vis < 200 ? "dense" : "fog") : "gust", pt: p, etaMs: eta };
      }
      return best;
    }

    function injectCard() {
      const seaZone = $("#joq-marine-zone");
      if (!seaZone || $("#v29-solunar-card")) return;
      const section = seaZone.closest("section");
      if (!section) return;
      const div = document.createElement("section");
      div.className = "card section v29-solunar-section";
      div.innerHTML = `
        <div class="v29-solunar-card" id="v29-solunar-card">
          <h3>🌙 ${esc(tr("مستشار الصيد والمد والجزر — سولنار"))} <span class="v29-solunar-stars" id="v29-solunar-stars">—</span></h3>
          <div class="v29-solunar-grid" id="v29-solunar-grid"></div>
          <p class="v29-solunar-note">${esc(tr("حساب فلكي محلي من موقع القمر والشمس + الضغط الجوي — أوقات المد والجزر تقريبية (دورة 12.42 ساعة) وتتأثر بالساحل المحلي."))}</p>
        </div>`;
      section.insertAdjacentElement("afterend", div);
    }
    function render() {
      injectCard();
      const grid = $("#v29-solunar-grid");
      const stars = $("#v29-solunar-stars");
      const wx = B?.state?.wx;
      if (!grid || !wx?.daily?.sunrise?.[0]) return;
      const nowMs = Date.now();
      const mp = moonPhase(nowMs);
      let dp3h = null;
      try {
        const k = B.hourIndexAtPlace(wx);
        const pr = wx.hourly?.pressure_msl;
        if (pr && pr[k + 3] != null && pr[k] != null) dp3h = pr[k + 3] - pr[k];
      } catch (e) {}
      const sol = solunarWindows({
        sunrise: wx.daily.sunrise[0], sunset: wx.daily.sunset?.[0], frac: mp.frac,
        pressure: wx.current?.pressure_msl ?? null, dp3h, nowMs,
      });
      if (!sol) return;
      if (stars) {
        stars.textContent = "★".repeat(sol.score) + "☆".repeat(5 - sol.score);
        stars.title = `${sol.score}/5`;
      }
      const fmt = (t) => clock(t);
      const cell = (title, body, golden) => `<div class="v29-solunar-item${golden ? " v29-golden" : ""}"><b>${esc(title)}</b>${esc(body)}</div>`;
      const pressureNow = wx.current?.pressure_msl;
      const rows = [
        cell(tr("طور القمر"), `${mp.emoji} ${tr(mp.name)} · ${num(mp.illumination)}٪ ${tr("إضاءة")}`),
        cell(tr("نشاط الأسماك المتوقع"), sol.score >= 4 ? tr("ممتاز — نهضة قوية") : sol.score >= 3 ? tr("جيد — فترات جيدة متقطعة") : tr("ضعيف — فضّل الراحة"), sol.score >= 4),
        cell(tr("ساعات الصيد الذهبية اليوم"), sol.majors.map((m) => `${fmt(m.start)} → ${fmt(m.end)}`).join(" · "), true),
        cell(tr("فترات ثانوية"), sol.minors.slice(0, 2).map((m) => `${fmt(m.start)} (${tr(m.label)})`).join(" · ")),
        cell(tr("المد والجزر التقريبي"), sol.tides.map((t) => `${fmt(t.t)} ${t.kind === "high" ? "⬆" : "⬇"}`).join(" · ")),
        cell(tr("الضغط الجوي"), pressureNow != null ? `${num(pressureNow)} hPa · ${dp3h == null ? "—" : (dp3h > 0.3 ? tr("صاعد — يحفّز النهضة") : dp3h < -0.3 ? tr("هابط — النشاط يخفت") : tr("مستقر"))}` : "—"),
      ];
      grid.innerHTML = rows.join("");
    }
    document.addEventListener("matar:data", () => setTimeout(render, 60));
    document.addEventListener("matar:language", () => setTimeout(render, 120));
    injectCard(); /* الحاوية تُحقن فورًا — الأرقام تتولد وصول البيانات */
    setTimeout(render, 1200);
    return { moonPhase, solunarWindows, crosswind, scanLastExit };
  })();

  /* ============================================================
     ⑦ الطرق: الرياح الجانبية + تنبيه الفرصة الأخيرة
     ⑧ وضع القيادة الليلي HUD
     ============================================================ */
  const RoadsV29 = (() => {
    let lastRoute = null;
    const fmtDur = (h) => {
      const m = Math.round(h * 60);
      if (m < 60) return tr("بعد ~{m} دقيقة").replace("{m}", num(m));
      const hh = Math.floor(m / 60), mm = m % 60;
      return mm ? tr("بعد ~{h} س و{m} د").replace("{h}", num(hh)).replace("{m}", num(mm)) : tr("بعد ~{h} ساعة").replace("{h}", num(hh));
    };
    function ensureCards() {
      if (!$("#v29-exit-card")) {
        $("#safety-strip")?.insertAdjacentHTML("afterend", `<div class="v29-exit-card hidden" id="v29-exit-card" role="status"></div>`);
      }
      if (!$("#v29-hud-btn")) {
        $("#rest-stops-btn")?.insertAdjacentHTML("afterend", `<button type="button" class="rest-btn" id="v29-hud-btn">🌙 <span>${esc(tr("وضع القيادة الليلي (HUD)"))}</span></button>`);
      }
    }
    function renderRoute() {
      ensureCards();
      const card = $("#v29-exit-card");
      const route = lastRoute;
      if (!card || !route?.pts?.length) return;
      const nowMs = Date.now();
      /* الرياح الجانبية: أقصى مكوّن جانبي على نقاط المسار */
      let worst = null;
      route.pts.forEach((p) => {
        const base = Math.max(p.wind ?? 0, (p.gust ?? 0) * 0.75);
        const cw = RoadsV29.crosswind(base, p.dir ?? 0, p.bearing ?? 0);
        if (!worst || cw > worst.cw) worst = { cw, dir: p.dir ?? 0, km: p.km ?? 0 };
      });
      /* الفرصة الأخيرة: أول خطر (ضباب/هبّات) يصل إليه السائق بين 6 دقائق و6 ساعات */
      const exit = Solunar.scanLastExit(route.pts, nowMs);
      const parts = [];
      if (exit) {
        const frac = route.totalKm ? Math.min(100, Math.round((exit.pt.km / route.totalKm) * 100)) : 50;
        const kindTxt = exit.kind === "gust" ? tr("هبّات رياح خطرة (أكثر من 50 كم/س)") : exit.kind === "dense" ? tr("ضباب كثيف/رؤية شبه معدومة") : tr("ضباب كثيف (رؤية أقل من 1 كم)");
        const emoji = exit.kind === "gust" ? "💨" : "🌫️";
        parts.push(`<div class="v29-exit-head">${emoji} ⚠️ ${esc(tr("الفرصة الأخيرة — قرر الآن"))}</div>
          <div class="v29-exit-body">${esc(tr("رصدنا {k}").replace("{k}", kindTxt))} ${esc(tr("على بعد"))} ${esc(num(exit.pt.km, 0))} ${esc(tr("كم من نقطة الانطلاق"))} — ${esc(fmtDur((exit.etaMs - nowMs) / 3600e3))} ${esc(tr("حسب سرعتك المتوقعة"))}.<br>${esc(exit.kind === "gust" ? tr("أنزل السرعة الآن وتمسك المقود بإحكام — أو أجّل العبور حتى تخف الهبّات.") : tr("اتخذ قرارك قبل بلوغها: تقدّم بأضواء الضباب وسرعة منخفضة، أو توقف في أقرب محطة/قرية حتى ينقشع."))}</div>
          <div class="v29-route-strip"><b style="inset-inline-start:${frac}%"></b><i style="inset-inline-start:0%">🅐 ${esc(route.A?.name ?? "")}</i><i style="inset-inline-start:100%;transform:translateX(-100%)">🅑 ${esc(route.B?.name ?? "")}</i></div>`);
      }
      if (worst && worst.cw >= 20) {
        const lvl = worst.cw >= 40 ? [tr("خطرة على المقطورات والحمولات العالية"), "var(--danger)"] : worst.cw >= 28 ? [tr("حذار — خاصة مع الحمولات الخفيفة"), "var(--warn)"] : [tr("ملحوظة لكن مقبولة"), "var(--ok)"];
        parts.push(`<div class="v29-crosswind-line"><span class="v29-compass"><span class="v29-needle" style="transform:translate(-50%,-100%) rotate(${Math.round(worst.dir)}deg)"></span></span><span>💨 ${esc(tr("أقصى رياح جانبية على المسار"))}: <b style="color:${lvl[1]}">${esc(num(Math.round(worst.cw)))} ${esc(tr("كم/س"))}</b> — ${esc(lvl[0])}</span></div>`);
      }
      if (!parts.length) {
        card.classList.add("hidden");
        return;
      }
      card.innerHTML = parts.join("");
      card.classList.remove("hidden");
    }

    /* ── وضع القيادة الليلي HUD — إصلاح إصدار 35 ──
       كان كل نص الشاشة يُقلب أفقيًا فتصبح العربية غير مقروءة، وزر الخروج
       نفسه معكوس، ولا شيء يمنع إطفاء الشاشة أثناء القيادة. الآن: أربعة
       أوضاع عرض تُبدّل بزر (طبيعي · انعكاس للتابلوه · انعكاس أفقي · 180°)
       محفوظة على الجهاز، مع قفل إضاءة الشاشة (Screen Wake Lock)، وسرعة
       GPS منسّقة، ومؤشر «لا إشارة» عند غياب الموقع بدل رقم 0 مضلل. */
    const Hud = (() => {
      let open = false, watchId = null, clockTimer = null, riskTimer = null, wakeLock = null, gpsSeen = false;
      let speed = 0, speedTarget = 0, lastPos = null, lastRouteData = null, gpsTimer = null;
      const MODE_KEY = "matar:v29:hudmode";
      const MODES = [
        ["normal", "طبيعي — مقروء مباشرة"],
        ["flip-y", "انعكاس للتابلوه"],
        ["flip-x", "انعكاس أفقي"],
        ["flip-both", "دوران 180 درجة"],
      ];
      let mode = (() => {
        try { const m = localStorage.getItem(MODE_KEY); return MODES.some(([k]) => k === m) ? m : "normal"; }
        catch (e) { return "normal"; }
      })();
      function ensureOverlay() {
        if ($("#v29-hud")) return;
        document.body.insertAdjacentHTML("beforeend", `
          <div id="v29-hud" role="dialog" aria-label="${esc(tr("وضع القيادة الليلي"))}" data-mode="${mode}">
            <div class="v29-hud-tools">
              <button type="button" class="v29-hud-mode" id="v29-hud-mode" title="${esc(tr("بدّل طريقة العرض: طبيعي أو انعكاس للتابلوه أو دوران كامل"))}">⟳ <span id="v29-hud-mode-txt">${esc(tr("طبيعي — مقروء مباشرة"))}</span></button>
              <button type="button" class="v29-hud-close" id="v29-hud-close">✕ ${esc(tr("خروج"))}</button>
            </div>
            <div class="v29-hud-mirror">
              <div class="v29-hud-card"><span class="v29-hud-clock" id="v29-hud-clock">--:--</span></div>
              <div>
                <div class="v29-hud-speed" id="v29-hud-speed">0</div>
                <div class="v29-hud-unit" style="text-align:center">${esc(tr("كم/ساعة"))}</div>
              </div>
              <div class="v29-hud-road"><span class="v29-hud-arrow" id="v29-hud-arrow" data-r="0">➜</span><span id="v29-hud-road-txt">${esc(tr("الطريق القادم سليم"))}</span></div>
              <div class="v29-hud-alert" id="v29-hud-alert">—</div>
              <div class="v29-hud-hint">${esc(tr("وضع الانعكاس: ضع الهاتف مسطحًا على التابلوه تحت الزجاج فتنعكس الصورة وتُقرأ صحيحة"))}</div>
            </div>
          </div>`);
        $("#v29-hud-close")?.addEventListener("click", close);
        $("#v29-hud-mode")?.addEventListener("click", cycleMode);
      }
      function modeLabel() { const hit = MODES.find(([k]) => k === mode); return hit ? hit[1] : MODES[0][1]; }
      function applyMode() {
        const hud = $("#v29-hud"), lbl = $("#v29-hud-mode-txt");
        if (hud) hud.dataset.mode = mode;
        if (lbl) lbl.textContent = tr(modeLabel());
        try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
      }
      function cycleMode() {
        const i = MODES.findIndex(([k]) => k === mode);
        mode = MODES[(i + 1) % MODES.length][0];
        applyMode();
      }
      /* قفل إضاءة الشاشة كي لا تنطفئ أثناء القيادة — مع تجاهل آمن حين لا يدعمه المتصفح */
      async function keepAwake() {
        try {
          if ("wakeLock" in navigator && navigator.wakeLock?.request) wakeLock = await navigator.wakeLock.request("screen");
        } catch (e) { /* بعض المتصفحات ترفضه خارج https أو بلا إيماءة حديثة */ }
      }
      function releaseAwake() { try { wakeLock?.release?.(); } catch (e) {} wakeLock = null; }
      function risk() {
        const route = lastRouteData;
        if (route?.pts?.length) {
          const ahead = route.pts.filter((p) => (p.km ?? 0) <= 50);
          const worst = Math.max(0, ...ahead.map((p) => p.info?.level ?? 0));
          let flash = null;
          const ex = Solunar.scanLastExit(route.pts, Date.now());
          if (ex && (ex.etaMs - Date.now()) / 3600e3 <= 0.75) flash = ex;
          return { level: worst, flash };
        }
        const wx = B?.state?.wx;
        if (wx?.hourly) {
          let worst = 0;
          try {
            const k0 = B.hourIndexAtPlace(wx);
            for (let k = k0; k < Math.min(k0 + 3, wx.hourly.time?.length ?? k0); k += 1) {
              const vis = wx.hourly.visibility?.[k] ?? 20000, g = wx.hourly.wind_gusts_10m?.[k] ?? 0;
              const c = wx.hourly.weather_code?.[k] ?? 0, pr = wx.hourly.precipitation?.[k] ?? 0;
              worst = Math.max(worst, (c >= 95 || vis < 400 || g >= 70 || pr >= 8) ? 2 : (vis < 1500 || g >= 50 || pr >= 2) ? 1 : 0);
            }
          } catch (e) {}
          return { level: worst, flash: null };
        }
        return null;
      }
      function renderRisk() {
        const arrow = $("#v29-hud-arrow"), txt = $("#v29-hud-road-txt"), hud = $("#v29-hud"), alert = $("#v29-hud-alert");
        if (!arrow || !hud) return;
        const r = risk();
        if (!r) return;
        arrow.dataset.r = String(r.level);
        arrow.textContent = r.level === 0 ? "➜" : r.level === 1 ? "⚠" : "⛔";
        if (txt) txt.textContent = r.level === 0 ? tr("الطريق القادم سليم") : r.level === 1 ? tr("حذر — طقس متقلب على الطريق القادم") : tr("خطر — ضباب/عاصفة على الطريق القادم");
        if (alert) {
          if (r.flash) {
            hud.dataset.flash = "1";
            alert.textContent = r.flash.kind === "gust" ? tr("💨 هبّات جانبية قريبة — خفّف السرعة") : tr("🌫️ ضباب كثيف أمامه — استعد الآن");
          } else {
            delete hud.dataset.flash;
          }
        }
      }
      function tick() {
        const c = $("#v29-hud-clock");
        if (c) c.textContent = clock(new Date());
        const s = $("#v29-hud-speed");
        if (s) s.textContent = gpsSeen ? String(Math.max(0, Math.round(speed))) : "—";
      }
      function onPos(pos) {
        gpsSeen = true;
        const co = pos.coords;
        if (co.speed != null && co.speed >= 0) speedTarget = co.speed * 3.6;
        else if (lastPos) {
          const dt = (performance.now() - lastPos.t) / 1000;
          if (dt > 0.8) speedTarget = (haversine(lastPos.lat, lastPos.lon, co.latitude, co.longitude) / dt) * 3600;
        }
        lastPos = { lat: co.latitude, lon: co.longitude, t: performance.now() };
        speed = speed * 0.65 + Math.min(200, speedTarget) * 0.35;
        tick();
      }
      async function openHud() {
        if (open) return;
        ensureOverlay();
        applyMode();
        open = true;
        gpsSeen = false; speed = 0; speedTarget = 0; lastPos = null;
        document.body.classList.add("v29-hud-open");
        keepAwake();
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(onPos, () => {
            const s = $("#v29-hud-speed");
            if (s) s.textContent = "—";
          }, { enableHighAccuracy: true, maximumAge: 1500, timeout: 14000 });
          /* لو لم يصل أي موقع GPS خلال 8 ثوانٍ نعرض «—» بدل رقم 0 مضلل */
          clearTimeout(gpsTimer);
          gpsTimer = setTimeout(() => { if (!gpsSeen) tick(); }, 8000);
        } else {
          gpsSeen = true; /* بلا GPS: نبقي العداد صفرًا بدل «—» */
        }
        tick();
        renderRisk();
        clockTimer = setInterval(tick, 1000);
        riskTimer = setInterval(renderRisk, 30000);
      }
      function close() {
        if (!open) return;
        open = false;
        document.body.classList.remove("v29-hud-open");
        if (watchId != null) { navigator.geolocation?.clearWatch(watchId); watchId = null; }
        clearInterval(clockTimer); clearInterval(riskTimer); clearTimeout(gpsTimer);
        releaseAwake();
      }
      document.addEventListener("visibilitychange", () => { if (!document.hidden && open) keepAwake(); });
      /* تفويض النقر: الزر يُحقن لاحقًا داخل صف الطرق — التفويض يضمن الالتقاط مهما كان التوقيت */
      document.addEventListener("click", (e) => {
        if (e.target?.closest?.("#v29-hud-btn")) openHud();
      });
      window.addEventListener("beforeunload", close);
      return { onRoute(d) { lastRouteData = d; if (open) renderRisk(); } };
    })();

    document.addEventListener("matar:route", (e) => {
      const d = e.detail || {};
      lastRoute = d;
      try { renderRoute(); } catch (err) {}
      try { Hud.onRoute(d); } catch (err) {}
    });
    document.addEventListener("matar:language", () => setTimeout(renderRoute, 150));
    ensureCards();
    return { crosswind: Solunar.crosswind };
  })();

  /* ============================================================
     ① اختيار نوع الودجت (عام / مزارع / سائق) + إعادة التوليد
     ============================================================ */
  const WidgetType = (() => {
    const previews = $(".widget-previews");
    if (!previews || $("#v29-wtype")) return {};
    const KEY = "matar:widget:type";
    const current = (() => { try { return localStorage.getItem(KEY) || "general"; } catch (e) { return "general"; } })();
    previews.insertAdjacentHTML("beforebegin", `
      <div class="v29-wtype" id="v29-wtype" role="group" aria-label="${esc(tr("نوع الودجت"))}">
        <span>${esc(tr("نوع الودجت:"))}</span>
        <button type="button" data-wt="general" aria-pressed="${current === "general"}">🌤 ${esc(tr("عام"))}</button>
        <button type="button" data-wt="farmer" aria-pressed="${current === "farmer"}">🌾 ${esc(tr("المزارع — رطوبة التربة والتبخر"))}</button>
        <button type="button" data-wt="driver" aria-pressed="${current === "driver"}">🚗 ${esc(tr("السائق — الضباب والهبّات"))}</button>
      </div>`);
    $("#v29-wtype")?.addEventListener("click", (e) => {
      const b = e.target?.closest?.("button[data-wt]");
      if (!b) return;
      try { localStorage.setItem(KEY, b.dataset.wt); } catch (e2) {}
      $("#v29-wtype").querySelectorAll("button[data-wt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      try { B?.redrawWidget?.(); } catch (e2) {}
    });
    return {};
  })();

  /* ---------- خطافات الفحص الذاتي (?selftest=1) ---------- */
  window.__matarV29Hooks = {
    moonPhase: Solunar.moonPhase,
    crosswind: Solunar.crosswind,
    scanLastExit: Solunar.scanLastExit,
    solunarWindows: Solunar.solunarWindows,
    congestion: (h, day, pen) => Math.min(1, congestionBase(h, day) + (pen || 0) * 0.6),
  };
})();
    

/* ═══════════════════ v47 — ترقية التوقعات العامة والأنشطة (النشرة الصوتية + المدن المفضلة) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 47: ترقية نوعية لصفحة «التوقعات العامة والأنشطة»
   ------------------------------------------------------------
   ① نشرة الطقس الصوتية في 15 ثانية — بجانب اسم المدينة، تُولَّد
      وتُنطق بلغة الواجهة الحالية (ar/en/fr/de/es/pt/it) عبر أفضل
      صوت متطابق: الحالة الآن + مقارنة الأمس + جاكيت/مظلة + أفضل وقت للخروج
   ② شارة «أدفأ/أبرد من أمس بـ X°» من Open-Meteo past_days=1
      + بطاقة المقارنة المزدوجة «اليوم مقابل غدًا» جنبًا إلى جنب
   ③ بطاقة «قصة الطقس اليوم» السينمائية عبر Canvas (Story 9:16 أو
      مربع 1:1) — خلفية وإضاءة ديناميكية حسب الجو والوقت، تضم اسم
      المدينة والحرارة ومقارنة الأمس ونصيحة المستشار — Web Share أو تحميل
   ④ شريط المدن المفضلة الحي: بطاقات مصغرة تظهر حرارة كل مدينة
      وأيقونتها والفرق عن موقعك — تنقل بلمسة واحدة
   ⑤ عداد المطر والغبار الفوري: وصول السحب الممطرة بالوقت/المسافة
      (الرادار + الرياح) وموجات الغبار (pm10 + اتجاه الرياح) مع
      تنبيه استباقي لإغلاق النوافذ
   التوافق: ملف index.html واحد · كل المضيفين في CSP مسبقًا
   ============================================================ */
const DashboardV47 = (() => {
  const $q = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => escapeHtml(String(s ?? ""));
  const YDAY_TTL = 30 * 60e3;
  let ydayCache = { key: "", at: 0, data: null };
  let favTimer = 0, dustTimer = 0, radarCountTimer = 0;

  const el = {
    vbBtn: $q("#voice-brief-btn"),
    yday: $q("#cmp-yday"),
    cmpTt: $q("#cmp-tt"), cmpTtBadge: $q("#cmp-tt-badge"),
    favLive: $q("#fav-live"),
    dustCount: $q("#dust-count"),
    dashShot: $q("#dash-ai-shot"),
    aiHead: $q("#dash-ai-card .ai-head"),
    aiText: $q("#dash-ai-text"),
  };

  /* ══════════ ② بيانات الأمس (past_days=1) مع كاش 30 دقيقة ══════════ */
  async function fetchYday() {
    const p = state.place;
    if (!p) return null;
    const key = `${(+p.latitude).toFixed(3)},${(+p.longitude).toFixed(3)}`;
    if (ydayCache.key === key && Date.now() - ydayCache.at < YDAY_TTL) return ydayCache.data;
    try {
      const u = new URL("https://api.open-meteo.com/v1/forecast");
      u.search = new URLSearchParams({
        latitude: String(p.latitude), longitude: String(p.longitude),
        hourly: "temperature_2m,weather_code",
        daily: "temperature_2m_max,temperature_2m_min,weather_code",
        past_days: "1", forecast_days: "1", timezone: "auto",
      });
      const d = await getJson(u);
      ydayCache = { key, at: Date.now(), data: d };
      return d;
    } catch (e) { return null; }
  }

  /* فرق الحرارة الحالية عن نفس الساعة بالأمس — مطابقة الطابع المحلي نصيًا
     بعد طرح 24 ساعة (محايدة للمنطقة الزمنية لأننا ننقل نفس الساعة الحائطية) */
  function ydayDelta(d) {
    if (!d?.hourly?.temperature_2m?.length) return null;
    const arr = d.hourly.temperature_2m;
    const times = d.hourly.time ?? [];
    if (times.length < 25) return null;
    const wx = state.wx;
    if (!wx?.hourly?.time?.length) return null;
    const s = hourIndexAtPlace(wx);
    const nowStamp = wx.hourly.time[s]?.slice(0, 13);
    if (!nowStamp || wx.hourly.temperature_2m?.[s] == null) return null;
    const m = nowStamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/);
    if (!m) return null;
    const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4]) - 24 * 3600e3);
    const yStamp = dt.toISOString().slice(0, 13);
    let idx = -1;
    for (let i = 0; i < times.length; i += 1) {
      if (times[i]?.slice(0, 13) === yStamp) { idx = i; break; }
    }
    if (idx < 0 || arr[idx] == null) return null;
    /* v70 — C-04: فرق خام بلا تقريب — قرار العرض (إخفاء/تقريب) يتخذه المستهلك
       كي لا تتحول فروق الأعشار إلى «أدفأ من أمس بـ 0°» */
    const delta = wx.hourly.temperature_2m[s] - arr[idx];
    return { delta, now: wx.hourly.temperature_2m[s], yd: arr[idx] };
  }

  function renderYdayBadge(d) {
    if (!el.yday) return;
    const yd = ydayDelta(d);
    el.yday.classList.remove("hidden");
    if (yd == null) {
      el.yday.textContent = "";
      el.yday.classList.add("hidden");
      return;
    }
    /* v70 — C-04: الفرق المطلق أقل من نصف درجة ليس «أدفأ من أمس بـ 0°» —
       نعرض «نفس حرارة أمس» محايدة بلا سهم ولا اتجاه، وأي فرق ≥ 0.5°
       يُقرَّب للعرض فقط (الفرق الخام يبقى بلا تقريب داخل ydayDelta) */
    if (Math.abs(yd.delta) < 0.5) {
      el.yday.removeAttribute("data-dir");
      el.yday.textContent = `≈ ${tr("نفس حرارة أمس")}`;
      return;
    }
    const warmer = yd.delta > 0;
    el.yday.dataset.dir = warmer ? "up" : "down";
    el.yday.innerHTML = warmer
      ? `🔺 ${esc(tf("أدفأ من أمس بـ {v}°", { v: localNum(Math.round(Math.abs(yd.delta))) }))}`
      : `🔻 ${esc(tf("أبرد من أمس بـ {v}°", { v: localNum(Math.round(Math.abs(yd.delta))) }))}`;
  }

  /* ══════════ ② اليوم مقابل غدًا ══════════ */
  function dayLabel(i) {
    return i === 0 ? tr("اليوم") : tr("غدًا");
  }

  function renderTodayTomorrow() {
    if (!el.cmpTt) return;
    const wx = state.wx;
    const d = wx?.daily;
    if (!d?.time?.length || d.time.length < 2) {
      el.cmpTt.innerHTML = `<p class="cmp-empty">${esc(tr("سنعرض المقارنة عند وصول توقعات موقعك."))}</p>`;
      return;
    }
    const cell = (i, isToday) => {
      const code = cloudFixCode(d.weather_code?.[i] ?? 0, dailyCloudAvg(wx, i)); /* v70 — C-01: وصف اليوم بمتوسط غطائه السحابي */
      const hi = d.temperature_2m_max?.[i], lo = d.temperature_2m_min?.[i];
      const wind = d.wind_speed_10m_max?.[i];
      const prob = d.precipitation_probability_max?.[i] ?? 0;
      const pr = d.precipitation_sum?.[i] ?? 0;
      return `
        <div class="cmp-card${isToday ? " is-today" : ""}">
          <div class="cmp-day">${isToday ? "📍" : "⏭"} ${esc(dayLabel(i))}</div>
          <div class="cmp-ico">${wmoSvg(code, 1, 30)}</div>
          <div class="cmp-temp">${tempText(hi)} <small>/ ${tempText(lo)}</small></div>
          <div class="cmp-desc">${esc(wmoDesc(code))}</div>
          <div class="cmp-rows">
            <span>💨 ${esc(tr("الرياح"))}: ${localNum(wind)} ${esc(tr("كم/س"))}</span>
            <span>🌧 ${esc(tr("فرص المطر"))}: ${localNum(prob)}٪ · ${localNum(pr, 1)} ${esc(tr("مم"))}</span>
          </div>
        </div>`;
    };
    const dHi = (d.temperature_2m_max?.[1] ?? 0) - (d.temperature_2m_max?.[0] ?? 0);
    const dProb = (d.precipitation_probability_max?.[1] ?? 0) - (d.precipitation_probability_max?.[0] ?? 0);
    let verdict = tr("غدًا مشابه لليوم");
    if (dHi >= 2) verdict = tf("غدًا أدفأ بـ {v}° تقريبًا", { v: localNum(Math.round(dHi)) });
    else if (dHi <= -2) verdict = tf("غدًا أبرد بـ {v}° تقريبًا", { v: localNum(Math.round(-dHi)) });
    if (dProb >= 20) verdict += ` · ${tr("ومطر أوفر")}`;
    else if (dProb <= -20) verdict += ` · ${tr("وأقل مطرًا")}`;
    if (el.cmpTtBadge) el.cmpTtBadge.textContent = verdict;
    el.cmpTt.innerHTML = `
      <div class="cmp-grid">
        ${cell(0, true)}
        <div class="cmp-vs" aria-hidden="true">VS</div>
        ${cell(1, false)}
      </div>`;
  }

  /* ══════════ ④ شريط المدن المفضلة الحي ══════════ */
  function readFavs() {
    try {
      const arr = JSON.parse(localStorage.getItem("matar:favs")) || [];
      return Array.isArray(arr) ? arr.filter((p) => p && typeof p.latitude === "number").slice(0, 4) : [];
    } catch (e) { return []; }
  }

  async function renderFavLive() {
    if (!el.favLive) return;
    const favs = readFavs();
    if (!favs.length) { el.favLive.innerHTML = ""; return; }
    const cur = state.place;
    const all = [...favs];
    if (cur) all.push(cur);
    /* طلب مجمّع واحد لكل المواقع (Open-Meteo يدعم الفصل بفواصل) */
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: all.map((p) => (+p.latitude).toFixed(3)).join(","),
      longitude: all.map((p) => (+p.longitude).toFixed(3)).join(","),
      current: "temperature_2m,weather_code,is_day",
      timezone: "auto",
    });
    let list = null;
    try { list = await getJson(url); } catch (e) { list = null; }
    if (!list) return;
    const arr = Array.isArray(list) ? list : [list];
    if (arr.length !== all.length) return;
    const curTemp = cur ? arr[arr.length - 1]?.current?.temperature_2m : null;
    const pills = favs.map((p, i) => {
      const c = arr[i]?.current ?? {};
      const isCur = cur && Math.abs((+p.latitude) - (+cur.latitude)) < 0.02 && Math.abs((+p.longitude) - (+cur.longitude)) < 0.02;
      let delta = "";
      if (curTemp != null && c.temperature_2m != null && !isCur) {
        const dv = Math.round(c.temperature_2m - curTemp);
        delta = dv === 0 ? tr("كموقعك") : dv > 0 ? `🔺 ${tf("+{v}° عن موقعك", { v: localNum(dv) })}` : `🔻 ${tf("{v}° عن موقعك", { v: localNum(dv) })}`;
      }
      return `
        <button type="button" class="fav-pill${isCur ? " is-cur" : ""}" data-favlive="${i}" title="${esc(tf("انتقل إلى {v}", { v: p.name }))}">
          <span class="fav-pill-ico">${wmoSvg(c.weather_code ?? 0, c.is_day ?? 1, 16)}</span>
          <span class="fav-pill-name">${esc(p.name)}</span>
          <span class="fav-pill-temp">${tempText(c.temperature_2m)}</span>
          ${delta ? `<span class="fav-pill-delta">${esc(delta)}</span>` : ""}
        </button>`;
    }).join("");
    el.favLive.innerHTML = pills;
    el.favLive.querySelectorAll("[data-favlive]").forEach((b) => {
      b.addEventListener("click", () => {
        const p = readFavs()[Number(b.dataset.favlive)];
        if (p && typeof selectPlace === "function") selectPlace({ ...p });
      });
    });
  }

  /* ══════════ ⑤ عداد المطر والغبار الفوري ══════════ */
  async function renderDustCount() {
    if (!el.dustCount || !state.place || Eco.isEco()) return;
    const wx = state.wx;
    const h = wx?.hourly;
    let rainHtml = "";
    /* المطر: أول ساعة قادمة بمطر فعلي — المسافة التقديرية = سرعة الرياح × الساعات */
    if (h?.time?.length) {
      const s = hourIndexAtPlace(wx);
      const wind = h.wind_speed_10m?.[s] ?? 10;
      let hit = -1;
      for (let i = s; i < Math.min(s + 7, h.time.length); i += 1) {
        if ((h.precipitation?.[i] ?? 0) >= 0.4) { hit = i; break; }
      }
      if (hit >= 0) {
        const hrs = hit - s;
        const dist = Math.max(5, Math.round(wind * hrs * 0.8));
        const hrsTxt = hrs === 0 ? tr("الآن") : tf("بعد {v} ساعة", { v: localNum(hrs) });
        rainHtml = `<div class="dc-row dc-rain"><span class="dc-ico">🌧</span><span><b>${esc(tf("السحب الممطرة: {t}", { t: hrsTxt }))}</b> · ${esc(tf("على بعد ~{v} كم مع اتجاه الرياح", { v: localNum(dist) }))}</span></div>`;
      } else {
        rainHtml = `<div class="dc-row dc-clear"><span class="dc-ico">✅</span><span>${esc(tr("لا سحب ممطرة قادمة خلال 6 ساعات حسب النموذج والرادار"))}</span></div>`;
      }
    }
    /* الغبار: pm10 الآن + ميل آخر 3 ساعات + اتجاه الرياح */
    let dustHtml = "";
    try {
      const p = state.place;
      const u = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
      u.search = new URLSearchParams({
        latitude: String(p.latitude), longitude: String(p.longitude),
        hourly: "pm10", past_hours: "6", forecast_hours: "6", timezone: "auto",
      });
      const d = await getJson(u);
      const pm = d?.hourly?.pm10 ?? [];
      const times = d?.hourly?.time ?? [];
      if (pm.length >= 7) {
        const cur = pm[pm.length - 7] ?? null; /* لحظة الآن (بعد 6 ساعات ماضية) */
        const past = pm[pm.length - 7 - 3] ?? null;
        const slope = (past != null && cur != null) ? (cur - past) / 3 : 0;
        const dirDeg = h?.wind_direction_10m?.[hourIndexAtPlace(wx)] ?? 0;
        const dirName = windDirName(dirDeg);
        if (cur != null && cur >= 80 && slope > 4) {
          const mins = Math.max(10, Math.round(((140 - cur) / Math.max(slope, 1)) * 60));
          dustHtml = `<div class="dc-row dc-dust" data-sev="high"><span class="dc-ico">🌪</span><span><b>${esc(tf("موجة غبار تقترب خلال ~{m} دقيقة من جهة {d}", { m: localNum(mins), d: dirName }))}</b> · ${esc(tf("الغبار {v} µg/m³ ومتزايد", { v: localNum(Math.round(cur)) }))}</span><b class="dc-alert">🪟 ${esc(tr("أغلق النوافذ الآن"))}</b></div>`;
        } else if (cur != null && cur >= 60 && slope >= 0) {
          dustHtml = `<div class="dc-row dc-dust" data-sev="warn"><span class="dc-ico">🌫</span><span><b>${esc(tf("غبار مرتفع من جهة {d} ({v} µg/m³)", { d: dirName, v: localNum(Math.round(cur)) }))}</b> · ${esc(tr("حساسو الصدر ينتبهون — النوافذ مغلقة أفضل"))}</span></div>`;
        } else if (cur != null && cur >= 60) {
          dustHtml = `<div class="dc-row dc-dust" data-sev="warn"><span class="dc-ico">🌬</span><span><b>${esc(tf("الغبار يتراجع ({v} µg/m³) — الجو يتحسن تدريجيًا", { v: localNum(Math.round(cur)) }))}</b></span></div>`;
        } else {
          dustHtml = `<div class="dc-row dc-clear"><span class="dc-ico">✅</span><span>${esc(tr("هواء نظيف — لا موجات غبار قادمة."))} ${esc(dirName)}</span></div>`;
        }
      }
    } catch (e) { /* جودة الهواء اختيارية */ }
    const out = rainHtml + dustHtml;
    if (out) { el.dustCount.classList.remove("hidden"); el.dustCount.innerHTML = out; }
    else el.dustCount.classList.add("hidden");
  }

  /* ══════════ ① النشرة الصوتية في 15 ثانية ══════════ */
  function bestOutingHour() {
    /* أفضل وقت للخروج اليوم: نافذة من 6ص حتى 11م بأقل احتمال مطر + حرارة مريحة */
    const wx = state.wx, h = wx?.hourly;
    if (!h?.time?.length) return null;
    const s = hourIndexAtPlace(wx);
    let best = null;
    for (let i = s; i < Math.min(s + 17, h.time.length); i += 1) {
      const hour = Number(h.time[i].slice(11, 13));
      if (hour < 6 || hour > 23) continue;
      const pr = h.precipitation?.[i] ?? 0;
      const t = h.temperature_2m?.[i] ?? 0;
      const gust = h.wind_gusts_10m?.[i] ?? 0;
      const score = pr * 12 + Math.abs(t - 24) * 1.6 + Math.max(0, gust - 30) * 0.9;
      if (!best || score < best.score) best = { score, i, hour, pr, t };
    }
    return best;
  }

  function outfitWord() {
    /* هل تحتاج جاكيت أو مظلة اليوم؟ */
    const wx = state.wx, h = wx?.hourly;
    if (!h?.time?.length) return "";
    const s = hourIndexAtPlace(wx);
    let maxPr = 0, minT = 99;
    for (let i = s; i < Math.min(s + 12, h.time.length); i += 1) {
      maxPr = Math.max(maxPr, h.precipitation?.[i] ?? 0);
      minT = Math.min(minT, h.temperature_2m?.[i] ?? 99);
    }
    const items = [];
    if (maxPr >= 0.5) items.push(tr("مظلة"));
    if (minT <= 14) items.push(tr("جاكيت"));
    if (!items.length) return tr("لا تحتاج جاكيتًا ولا مظلة اليوم");
    return tf("لا تنسَ: {v}", { v: items.join(" · ") });
  }

  /* ══ v50: مدخلات القاموس للنشرة الصوتية المهيكلة (4 جمل منطقية) — 7 لغات ══ */
  try {
    Object.assign(I18N_EXTRA, {
      "الجو الآن في {place}: {desc} والحرارة {t} درجة.": { en: "Weather now in {place}: {desc}, temperature {t} degrees.", fr: "Temps actuel à {place} : {desc}, température de {t} degrés.", de: "Wetter jetzt in {place}: {desc}, Temperatur {t} Grad.", es: "Tiempo ahora en {place}: {desc}, temperatura de {t} grados.", pt: "Tempo agora em {place}: {desc}, temperatura de {t} graus.", it: "Meteo ora a {place}: {desc}, temperatura di {t} gradi." },
      "الجو اليوم أدفأ من أمس بـ {v} درجة.": { en: "Today is warmer than yesterday by {v} degrees.", fr: "Aujourd’hui est plus chaud qu’hier de {v} degrés.", de: "Heute ist es wärmer als gestern, um {v} Grad.", es: "Hoy hace más calor que ayer por {v} grados.", pt: "Hoje está mais quente do que ontem por {v} graus.", it: "Oggi è più caldo di ieri di {v} gradi." },
      "الجو اليوم أبرد من أمس بـ {v} درجة.": { en: "Today is cooler than yesterday by {v} degrees.", fr: "Aujourd’hui est plus frais qu’hier de {v} degrés.", de: "Heute ist es kühler als gestern, um {v} Grad.", es: "Hoy hace más frío que ayer por {v} grados.", pt: "Hoje está mais fresco do que ontem por {v} graus.", it: "Oggi è più fresco di ieri di {v} gradi." },
      "لا توجد مقارنة مع أمس الآن.": { en: "No comparison with yesterday available right now.", fr: "Pas de comparaison avec hier pour l’instant.", de: "Derzeit kein Vergleich mit gestern möglich.", es: "Sin comparación con ayer por ahora.", pt: "Sem comparação com ontem por agora.", it: "Nessun confronto con ieri al momento." },
      "الرياح هادئة اليوم": { en: "Winds are calm today", fr: "Les vents sont calmes aujourd’hui", de: "Der Wind ist heute ruhig", es: "El viento está calmo hoy", pt: "O vento está calmo hoje", it: "Il vento è calmo oggi" },
      "الرياح نشطة بسرعة {v} كيلومتر في الساعة": { en: "Active winds at {v} kilometers per hour", fr: "Vents actifs à {v} kilomètres par heure", de: "Aktiver Wind bei {v} Kilometern pro Stunde", es: "Viento activo a {v} kilómetros por hora", pt: "Vento ativo a {v} quilómetros por hora", it: "Vento vivace a {v} chilometri all’ora" },
      "الرياح قوية بهبّات {v} كيلومتر في الساعة": { en: "Strong winds with gusts of {v} kilometers per hour", fr: "Vents forts avec rafales de {v} kilomètres par heure", de: "Starker Wind mit Böen von {v} Kilometern pro Stunde", es: "Viento fuerte con rachas de {v} kilómetros por hora.", pt: "Vento forte com rajadas de {v} quilómetros por hora", it: "Vento forte con raffiche di {v} chilometri all’ora" },
      "واحتمال المطر اليوم {v} بالمئة.": { en: "And today’s rain chance is {v} percent.", fr: "Et la probabilité de pluie aujourd’hui est de {v} pour cent.", de: "Und die Regenwahrscheinlichkeit heute liegt bei {v} Prozent.", es: "Y la probabilidad de lluvia hoy es del {v} por ciento.", pt: "E a probabilidade de chuva hoje é de {v} por cento.", it: "E la probabilità di pioggia oggi è del {v} per cento." },
      "والرطوبة النسبية {v} بالمئة.": { en: "And relative humidity is {v} percent.", fr: "Et l’humidité relative est de {v} pour cent.", de: "Und die relative Luftfeuchte liegt bei {v} Prozent.", es: "Y la humedad relativa es del {v} por ciento.", pt: "E a humidade relativa é de {v} por cento.", it: "E l’umidità relativa è del {v} per cento." },
      "عواصف رعدية متوقعة — ابقَ في الداخل وافصل الأجهزة الحساسة.": { en: "Thunderstorms expected — stay indoors and unplug sensitive devices.", fr: "Orages attendus — restez à l’intérieur et débranchez les appareils sensibles.", de: "Gewitter erwartet — bleib drinnen und trenne empfindliche Geräte.", es: "Tormentas eléctricas previstas — quédese dentro y desenchufe los aparatos sensibles.", pt: "Tempestades previstas — fique dentro de casa e desligue os aparelhos sensíveis.", it: "Temporali attesi — resta al chiuso e stacca i dispositivi sensibili." },
      "أمطار متوقعة اليوم — خذ مظلتك معك عند الخروج.": { en: "Rain expected today — take your umbrella when heading out.", fr: "Pluie attendue aujourd’hui — prenez votre parapluie en sortant.", de: "Regen heute erwartet — nimm beim Rausgehen den Regenschirm mit.", es: "Lluvia prevista hoy — lleve su paraguas al salir.", pt: "Chuva esperada hoje — leve o guarda-chuva ao sair.", it: "Pioggia attesa oggi — porta con te l’ombrello quando esci." },
      "ضباب محتمل — خفّف السرعة عند القيادة وتوخَّ الحذر.": { en: "Fog possible — slow down while driving and stay cautious.", fr: "Brouillard possible — ralentissez en conduisant et restez prudent.", de: "Nebel möglich — fahre langsamer und sei vorsichtig.", es: "Niebla posible — reduzca la velocidad al conducir y sea precavido.", pt: "Névoa possível — reduza a velocidade ao conduzir e seja prudente.", it: "Nebbia possibile — rallenta alla guida e stai attento." },
      "حرارة مرتفعة اليوم — تجنّب الشمس وقت الذروة واشرب ماءً كثيرًا.": { en: "High heat today — avoid the midday sun and drink plenty of water.", fr: "Forte chaleur aujourd’hui — évitez le soleil à midi et buvez beaucoup d’eau.", de: "Heute große Hitze — meide die Mittagssonne und trinke viel Wasser.", es: "Calor intenso hoy — evite el sol del mediodía y beba mucha agua.", pt: "Calor forte hoje — evite o sol do meio-dia e beba muita água.", it: "Forte caldo oggi — evita il sole di mezzogiorno e bevi tanta acqua." },
      "ليل بارد — جهّز ملابس دافئة لمساء اليوم.": { en: "Cold night — prepare warm clothes for this evening.", fr: "Nuit froide — préparez des vêtements chauds pour ce soir.", de: "Kalte Nacht — bereite warme Kleidung für den Abend vor.", es: "Noche fría — prepare ropa abrigada para esta tarde-noche.", pt: "Noite fria — prepare roupa quente para esta noite.", it: "Notte fredda — prepara abiti caldi per stasera." },
      "الأشعة فوق البنفسجية قوية — استخدم واقي الشمس.": { en: "UV is strong — use sunscreen.", fr: "Les UV sont forts — utilisez de la crème solaire.", de: "UV-Strahlung ist stark — benutze Sonnenschutz.", es: "Los rayos UV son fuertes — use protector solar.", pt: "Os raios UV estão fortes — use protetor solar.", it: "I raggi UV sono forti — usa la protezione solare." },
      "جودة الهواء سيئة — يفضّل تقليل النشاط الخارجي.": { en: "Air quality is poor — better to reduce outdoor activity.", fr: "La qualité de l’air est mauvaise — mieux vaut réduire l’activité extérieure.", de: "Die Luftqualität ist schlecht — reduziere Aktivitäten draußen.", es: "La calidad del aire es mala — mejor reducir la actividad al aire libre.", pt: "A qualidade do ar está má — melhor reduzir a atividade ao ar livre.", it: "La qualità dell’aria è scarsa — meglio ridurre le attività all’aperto." },
      "يوم مناسب للأنشطة الخارجية — لا تنسَ الماء والظل.": { en: "A good day for outdoor activities — don’t forget water and shade.", fr: "Bonne journée pour les activités extérieures — n’oubliez pas eau et ombre.", de: "Ein guter Tag für Aktivitäten draußen — Wasser und Schatten nicht vergessen.", es: "Buen día para actividades al aire libre — no olvide agua y sombra.", pt: "Bom dia para atividades ao ar livre — não esqueça água e sombra.", it: "Buona giornata per le attività all’aperto — non dimenticare acqua e ombra." },
      /* v70 — C-04: نصا «نفس حرارة الأمس» بكل اللغات السبع */
      "نفس حرارة أمس": { en: "Same temperature as yesterday", fr: "Pareil qu’hier", de: "Wie gestern", es: "Igual que ayer", pt: "Igual a ontem", it: "Come ieri" },
      "حرارة اليوم مثل أمس تقريبًا.": { en: "Today is about the same temperature as yesterday.", fr: "Aujourd’hui, pratiquement la même température qu’hier.", de: "Heute ungefähr so warm wie gestern.", es: "Hoy hace casi la misma temperatura que ayer.", pt: "Hoje faz quase a mesma temperatura de ontem.", it: "Oggi quasi la stessa temperatura di ieri." },
    });
  } catch (e) { /* القاموس اختياري */ }

  /* ══ v50 ③: نص «نشرة اليوم الصوتية» في 4 جمل قصيرة منطقية بالترتيب الثابت ══
     ① المدينة وحالة الجو الآن ودرجة الحرارة ② مقارنة الحرارة بأمس (أدفأ أم أبرد)
     ③ حالة الرياح والرطوبة أو فرص المطر ④ نصيحة عملية واحدة لليوم
     تُقرأ الجمل بالتتابع عبر المحرك الموحد (onend ← وقفة 350ms ← الجملة التالية) */
  function briefingTip(code, wx) {
    if (code >= 95) return "عواصف رعدية متوقعة — ابقَ في الداخل وافصل الأجهزة الحساسة.";
    if (code >= 51) return "أمطار متوقعة اليوم — خذ مظلتك معك عند الخروج.";
    if (code === 45 || code === 48) return "ضباب محتمل — خفّف السرعة عند القيادة وتوخَّ الحذر.";
    const tmax = wx.daily?.temperature_2m_max?.[0];
    if ((tmax ?? 0) >= 38) return "حرارة مرتفعة اليوم — تجنّب الشمس وقت الذروة واشرب ماءً كثيرًا.";
    const tmin = wx.daily?.temperature_2m_min?.[0];
    if ((tmin ?? 99) <= 8) return "ليل بارد — جهّز ملابس دافئة لمساء اليوم.";
    if ((wx.daily?.uv_index_max?.[0] ?? 0) >= 8) return "الأشعة فوق البنفسجية قوية — استخدم واقي الشمس.";
    if ((state.air?.current?.us_aqi ?? 0) > 150) return "جودة الهواء سيئة — يفضّل تقليل النشاط الخارجي.";
    return "يوم مناسب للأنشطة الخارجية — لا تنسَ الماء والظل.";
  }

  async function buildBriefingText() {
    const wx = state.wx, place = state.place;
    if (!wx || !place) return null;
    const cur = wx.current ?? {};
    const code = cur.weather_code ?? 0;
    const t = cur.temperature_2m;
    /* ① المدينة + حالة الجو الآن + الحرارة */
    const s1 = tf("الجو الآن في {place}: {desc} والحرارة {t} درجة.", { place: place.name ?? "", desc: wmoDesc(code), t: t != null ? localNum(Math.round(t)) : "—" });
    /* ② مقارنة الحرارة بأمس: أدفأ أم أبرد */
    const yd = ydayDelta(await fetchYday());
    /* v70 — C-04: فرق < 0.5° يُنطق «مثل أمس تقريبًا» بدل «أدفأ بـ 0 درجة» */
    const s2 = yd == null ? tr("لا توجد مقارنة مع أمس الآن.")
      : Math.abs(yd.delta) < 0.5 ? tr("حرارة اليوم مثل أمس تقريبًا.")
      : (yd.delta > 0
        ? tf("الجو اليوم أدفأ من أمس بـ {v} درجة.", { v: localNum(Math.round(Math.abs(yd.delta))) })
        : tf("الجو اليوم أبرد من أمس بـ {v} درجة.", { v: localNum(Math.round(Math.abs(yd.delta))) }));
    /* ③ الرياح والرطوبة أو فرص المطر */
    const wind = cur.wind_speed_10m ?? 0;
    const gust = wx.hourly?.wind_gusts_10m?.[hourIndexAtPlace(wx)] ?? 0;
    const rh = cur.relative_humidity_2m;
    const prob = wx.daily?.precipitation_probability_max?.[0];
    const p3 = [];
    /* الرياح والرطوبة/المطر في جملة واحدة (③) — الجُزء الأول بلا نقطة */
    if (gust >= 40) p3.push(tf("الرياح قوية بهبّات {v} كيلومتر في الساعة", { v: localNum(Math.round(gust)) }));
    else if (wind >= 25) p3.push(tf("الرياح نشطة بسرعة {v} كيلومتر في الساعة", { v: localNum(Math.round(wind)) }));
    else p3.push(tr("الرياح هادئة اليوم"));
    if (prob != null && prob >= 30) p3.push(tf("واحتمال المطر اليوم {v} بالمئة.", { v: localNum(Math.round(prob)) }));
    else if (rh != null) p3.push(tf("والرطوبة النسبية {v} بالمئة.", { v: localNum(rh) }));
    const s3 = p3.join(" ");
    /* ④ نصيحة عملية واحدة لليوم */
    const s4 = tr(briefingTip(code, wx));
    return [s1, s2, s3, s4].filter(Boolean).join(" ");
  }

  function pickVoiceFor(langCode) {
    try {
      const vs = speechSynthesis.getVoices() || [];
      if (!vs.length) return null;
      if (langCode === "ar") {
        const arLang = (v) => /^ar([-_]|$)/i.test(String(v.lang || ""));
        return vs.find((v) => arLang(v) && /maged|ماجد/i.test(v.name || ""))
          || vs.find((v) => /^ar[-_]SA$/i.test(String(v.lang || "")))
          || vs.find(arLang) || null;
      }
      return vs.find((v) => v.lang?.toLowerCase().startsWith(langCode)) || null;
    } catch (e) { return null; }
  }

  let speaking = false;

  async function toggleBriefing() {
    if (!("speechSynthesis" in window)) {
      try { window.__matarEcoBite?.(10, "النشرة الصوتية"); } catch (e) {}
      return;
    }
    if (speaking) {
      speaking = false;
      /* v50: الإيقاف عبر cancel المُغلَّفة ← stopAllSpeech شامل (محلي + سحابي + تسلسل) */
      try { speechSynthesis.cancel(); } catch (e) {}
      el.vbBtn?.setAttribute("aria-pressed", "false");
      return;
    }
    const text = await buildBriefingText();
    if (!text) return;
    /* v50 ①: قفل حصري — stopAllSpeech يفرغ المحركين وجلسات النطق القديمة أولًا
       (محرك واحد فقط في كل لحظة)، ثم نطق فوري داخل إيماءة المستخدم (شرط iOS) */
    try { window.stopAllSpeech?.(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {}
    const lang = (window.__matarBridge?.lang?.() || "ar").slice(0, 2);
    const fullLang = { ar: "ar-SA", en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES", pt: "pt-PT", it: "it-IT" }[lang] || "en-US";
    const u = new SpeechSynthesisUtterance(text);
    if (lang !== "ar") {
      /* اللغات اللاتينية تحتفظ باختيار صوتها المحلي */
      const v = pickVoiceFor(lang);
      if (v) { try { u.voice = v; } catch (e) {} }
      u.lang = v?.lang || fullLang;
    } else {
      /* العربية: المحرك الموحد (v48b/v50) يختار صوت الرجل العربي الواضح بنفسه
         ويضبط rate 0.85 / pitch 0.85 — لا نتعارض معه هنا */
      u.lang = fullLang;
    }
    u.volume = 1;
    speaking = true;
    el.vbBtn?.setAttribute("aria-pressed", "true");
    try { speechSynthesis.speak(u); } catch (e) {
      speaking = false;
      el.vbBtn?.setAttribute("aria-pressed", "false");
      return;
    }
    /* v50: معالجات انتهاء واعية بالجلسة — أي onend يتيم من جلسة قديمة لا
       يُطفئ زر النشرة الجارية (عداد جلسات النطق يمنع التداخل نهائيًا) */
    const mySession = window.__matarSpeechSession?.() ?? 0;
    const done = () => {
      const cur = window.__matarSpeechSession?.() ?? mySession;
      if (cur !== mySession && MatarTTS?.isSpeaking) return;
      speaking = false;
      el.vbBtn?.setAttribute("aria-pressed", "false");
    };
    u.onend = done;
    u.onerror = done;
  }

  /* ══════════ ③ بطاقة «قصة الطقس اليوم» السينمائية ══════════ */
  function skyCinematic(code, isDay, hour) {
    code = code ?? 0;
    let top, bot, accent;
    if (code >= 95) { top = "#20264d"; bot = "#4a4a7a"; accent = "#8a86b8"; }
    else if (code >= 71 && code <= 86) { top = "#5c7894"; bot = "#b9d0e2"; accent = "#e8f2fa"; }
    else if (code >= 45 && code <= 48) { top = "#6e7a85"; bot = "#b7c2cc"; accent = "#e7edf2"; }
    else if (code >= 51) { top = isDay ? "#31567c" : "#12233a"; bot = isDay ? "#6f9ec4" : "#2a4a68"; accent = "#9fd0ef"; }
    else if (code >= 2) { top = isDay ? "#3a6f9e" : "#132b44"; bot = isDay ? "#9cc3de" : "#33587a"; accent = "#dcecf7"; }
    else { top = isDay ? "#2a7ab8" : "#0e2440"; bot = isDay ? "#a4d4ef" : "#2c5170"; accent = "#ffe9b8"; }
    return { top, bot, accent, isDay };
  }

  function drawStoryCard(canvasW, canvasH, lineText) {
    const wx = state.wx, place = state.place;
    if (!wx || !place) return null;
    const cur = wx.current ?? {};
    const code = cloudFixCode(cur.weather_code ?? 0, cur.cloud_cover); /* v70 — C-01 */
    const isDay = (cur.is_day ?? 1) === 1;
    const hourNow = new Date().getHours();
    const canvas = document.createElement("canvas");
    canvas.width = canvasW; canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    const { top, bot, accent } = skyCinematic(code, isDay, hourNow);
    const grad = ctx.createLinearGradient(0, 0, canvasW * 0.6, canvasH);
    grad.addColorStop(0, top); grad.addColorStop(1, bot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
    /* إضاءة ديناميكية: شمس/قمر متوهج + طبقات الجو */
    const cx = canvasW * (isDay ? 0.78 : 0.24), cy = canvasH * 0.16;
    const glowR = Math.min(canvasW, canvasH) * 0.34;
    const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, glowR);
    glow.addColorStop(0, isDay ? "rgba(255,238,180,0.55)" : "rgba(214,226,255,0.35)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvasW, canvasH);
    if (code >= 51 && code < 95) {
      /* خيوط مطر سينمائية */
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 60; i += 1) {
        const x = Math.random() * canvasW, y = Math.random() * canvasH;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); ctx.stroke();
      }
    }
    if (code >= 45 && code <= 48) {
      const fog = ctx.createLinearGradient(0, canvasH * 0.5, 0, canvasH);
      fog.addColorStop(0, "rgba(255,255,255,0.05)");
      fog.addColorStop(1, "rgba(255,255,255,0.35)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
    if (code >= 30 && code <= 35) {
      ctx.fillStyle = "rgba(224,180,110,0.16)";
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
    const FONT = '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif';
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    const M = Math.round(canvasW * 0.075);
    /* العلامة والتاريخ */
    ctx.fillStyle = "rgba(255,250,240,0.8)";
    ctx.font = `700 ${Math.round(canvasW * 0.032)}px ${FONT}`;
    ctx.fillText(`مَطَر برو · ${new Intl.DateTimeFormat(activeLocale(), { weekday: "long", day: "numeric", month: "long" }).format(new Date())}`, canvasW - M, Math.round(canvasH * 0.05));
    /* اسم المدينة */
    ctx.fillStyle = "rgba(255,250,240,0.95)";
    ctx.font = `800 ${Math.round(canvasW * 0.062)}px ${FONT}`;
    ctx.fillText(String(place.name).slice(0, 26), canvasW - M, Math.round(canvasH * 0.095));
    /* الحرارة الضخمة + الوصف */
    ctx.fillStyle = "#fffaf0";
    ctx.font = `600 ${Math.round(canvasW * 0.19)}px ${FONT}`;
    ctx.fillText(`${Math.round(cur.temperature_2m ?? 0)}°`, canvasW - M, Math.round(canvasH * 0.17));
    ctx.font = `700 ${Math.round(canvasW * 0.043)}px ${FONT}`;
    ctx.fillStyle = "rgba(255,250,240,0.96)";
    ctx.fillText(wmoDesc(code), canvasW - M, Math.round(canvasH * 0.34));
    /* شارة مقارنة الأمس */
    const yd = lastYdayDelta;
    if (yd != null) {
      /* v70 — C-04: فرق < 0.5° = «نفس حرارة أمس» — وإصلاح خطأ قديم كان يقرأ
         yd.delta من رقم صرف فيعرض «أبرد من أمس بـ —» دائمًا في بطاقة القصة */
      const sameY = Math.abs(yd) < 0.5;
      const txt = sameY ? tr("نفس حرارة أمس")
        : yd > 0 ? tf("أدفأ من أمس بـ {v}°", { v: localNum(Math.round(Math.abs(yd))) })
        : tf("أبرد من أمس بـ {v}°", { v: localNum(Math.round(Math.abs(yd))) });
      ctx.fillStyle = "rgba(9,42,52,0.4)";
      const bw = ctx.measureText(txt).width + 56;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(canvasW - M - bw, Math.round(canvasH * 0.395), bw, 64, 20) : ctx.rect(canvasW - M - bw, Math.round(canvasH * 0.395), bw, 64);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = `800 ${Math.round(canvasW * 0.036)}px ${FONT}`;
      ctx.fillText(`${sameY ? "≈" : yd > 0 ? "🔺" : "🔻"} ${txt}`, canvasW - M - 24, Math.round(canvasH * 0.395) + 16);
    }
    /* صندوق نصيحة المستشار */
    if (lineText) {
      const by = Math.round(canvasH * (canvasW === canvasH ? 0.62 : 0.62));
      const bh = Math.round(canvasH * 0.16);
      ctx.fillStyle = "rgba(9,42,52,0.45)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(M, by, canvasW - M * 2, bh, 30) : ctx.rect(M, by, canvasW - M * 2, bh);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#ffe9b8";
      ctx.font = `800 ${Math.round(canvasW * 0.032)}px ${FONT}`;
      ctx.fillText(tr("✨ نصيحة المستشار الذكي"), canvasW - M - 28, by + 26);
      ctx.fillStyle = "rgba(255,252,244,0.97)";
      ctx.font = `600 ${Math.round(canvasW * 0.034)}px ${FONT}`;
      wrapStory(ctx, lineText, canvasW - M - 28, by + 84, canvasW - M * 2 - 64, 52, 3);
    }
    /* التذييل */
    ctx.fillStyle = "rgba(255,250,240,0.6)";
    ctx.font = `600 ${Math.round(canvasW * 0.026)}px ${FONT}`;
    ctx.fillText(tr("مَطَر برو — تطبيق الطقس المتكامل · Open-Meteo"), canvasW - M, canvasH - Math.round(canvasH * 0.045));
    return canvas;
  }

  function wrapStory(ctx, text, x, y, maxW, lh, maxLines) {
    const words = String(text ?? "").split(/\s+/).filter(Boolean);
    let line = "", lines = 0;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines += 1;
        ctx.fillText(line, x, y + (lines - 1) * lh);
        line = w;
        if (lines >= maxLines - 1) break;
      } else line = test;
    }
    if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lh);
  }

  let lastYdayDelta = null;

  async function shareStory(aspect) {
    if (!state.wx || !state.place) { toast(tr("اختر موقعًا أولًا ثم أعد المحاولة.")); return; }
    /* نص المستشار: من البطاقة إن جهزت، وإلا خلاصة محلية سريعة */
    const tip = (el.aiText?.textContent || "").trim();
    const fallback = tr("تابع توقعات مَطَر برو على مدار اليوم لتخطيط أنشطتك بثقة.");
    const line = tip && tip.length > 20 && !/^(يحلّل|يقرأ|يفحص)/.test(tip) ? tip : fallback;
    const W = aspect === "square" ? 1080 : 1080;
    const H = aspect === "square" ? 1080 : 1920;
    const canvas = drawStoryCard(W, H, line);
    if (!canvas) return;
    /* v52: ختم الشعار العالمي الرسمي في زاوية قصة الطقس */
    try { window.__matarDrawLogoStamp?.(canvas.getContext("2d"), 88, canvas.height - 88, 56); } catch (e) {}
    try {
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.92));
      if (!blob) throw new Error("toBlob");
      const file = new File([blob], "matar-story.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: tr("مَطَر برو — قصة الطقس اليوم"), text: tr("طقس موقعي الآن من مَطَر برو 🌤") });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "matar-story.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      if (e?.name !== "AbortError") toast(tr("تعذّر توليد البطاقة على هذا الجهاز."));
    }
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.setAttribute("role", "status");
    t.textContent = msg;
    t.style.cssText = "position:fixed;bottom:18px;inset-inline-start:50%;transform:translateX(50%);z-index:9500;padding:10px 16px;border-radius:12px;background:var(--teal);color:#fffaf0;font-size:12.5px;font-weight:700;box-shadow:0 10px 26px rgb(0 0 0 / 25%);max-width:min(90vw,420px);text-align:center;transition:opacity 300ms ease";
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; }, 2200);
    setTimeout(() => t.remove(), 2600);
  }

  function rewireShareButton() {
    /* استبدال زر «كصورة» الأصلي بنسخة بلا مستمعي v28 ثم ربط المولّد السينمائي،
       وإضافة زر مربع 1:1 بجانبه */
    if (!el.dashShot || el.dashShot.dataset.v47) return;
    const fresh = el.dashShot.cloneNode(true);
    fresh.dataset.v47 = "1";
    fresh.title = tr("بطاقة قصة سينمائية 9:16");
    fresh.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L7 19"/></svg><span data-i18n="قصة">قصة</span>`;
    el.dashShot.replaceWith(fresh);
    fresh.addEventListener("click", () => shareStory("story"));
    /* زر المربع 1:1 */
    const sq = document.createElement("button");
    sq.type = "button";
    sq.className = "ai-fresh ai-share";
    sq.dataset.v47 = "1";
    sq.title = tr("بطاقة مربعة 1:1");
    sq.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/></svg><span data-i18n="مربع">مربع</span>`;
    fresh.insertAdjacentElement("afterend", sq);
    sq.addEventListener("click", () => shareStory("square"));
    el.dashShot = fresh;
  }

  /* ══════════ الربط والتشغيل — v49: المفضلة الحية أولًا والأمس/الغد كطلب ثانوي متأخر ══════════ */
  async function refreshAll() {
    /* v49: بطاقات المدن المفضلة تُجلب وتُرسم أولًا (بعد 800ms من ظهور البطاقة
       الرئيسية عبر favTimer)، وطلبات «أمس/اليوم وغدًا» الثانوية تتأخر 800ms
       إضافية كي يفتح التطبيق في أقل من ثانية */
    renderFavLive();
    renderDustCount();
    setTimeout(async () => {
      try {
        const yd = await fetchYday();
        lastYdayDelta = ydayDelta(yd)?.delta ?? null;
        renderYdayBadge(yd);
        renderTodayTomorrow();
      } catch (e) {
        /* طلب ثانوي — يتجاهل بصمت. v71 — M-02: نرسم المقارنة المحلية على أي
           حال كي لا يعلق الهيكل العظمي مكان بطاقة «اليوم مقابل غدًا» */
        try { renderTodayTomorrow(); } catch (e2) {}
      }
    }, 800);
  }

  function wire() {
    /* v52: استبدال زر النشرة الصوتية بنسخة نظيفة قبل الربط — مسح أي مستمع قديم
       موروث ثم ربط مستمع واحد حصري (زر النشرة يحمل معرف #voice-brief-btn ثابتًا) */
    if (el.vbBtn) {
      const freshVb = el.vbBtn.cloneNode(true);
      el.vbBtn.replaceWith(freshVb);
      el.vbBtn = freshVb;
    }
    el.vbBtn?.addEventListener("click", toggleBriefing);

    document.addEventListener("matar:data", () => {
      clearTimeout(favTimer); clearTimeout(dustTimer);
      /* v49: المفضلة الحية بعد 800ms من ظهور البطاقة الرئيسية */
      favTimer = setTimeout(refreshAll, 800);
      dustTimer = setTimeout(renderDustCount, 2600);
    });
    document.addEventListener("matar:language", () => {
      renderTodayTomorrow();
      renderFavLive();
      renderDustCount();
      renderYdayBadge(null);
      setTimeout(refreshAll, 600);
      rewireShareButton();
    });
    /* تجديد دوري هادئ كل 10 دقائق */
    setInterval(() => { if (state.place && !document.hidden) { renderFavLive(); renderDustCount(); } }, 10 * 60e3);
    rewireShareButton();
    /* تسخين قائمة الأصوات للنطق الفوري الأول */
    try { speechSynthesis.getVoices(); } catch (e) {}
  }

  /* v53: موفّر نص النشرة الصوتية لوحدة التحكم الصوتية الموحدة (v53-script) —
     الوحدة الموحدة هي الوحيدة التي تنطق، وهنا نمدّها بنص النشرة فقط */
  try { window.__matarBriefText = () => buildBriefingText(); } catch (e) {}
  wire();
  return { refreshAll };
})();

    

/* ═══════════════════ v48ب — محرك النطق الموحد (sanitizeForSpeech + قفل isSpeaking) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 48ب: محرك النطق المحلي الموحد (v57: Local-Only TTS)
   ------------------------------------------------------------
   ① إصلاح window.speechSynthesis المحلي:
      - انتظار تحميل الأصوات عبر onvoiceschanged مع مهلة 500ms كي لا تعود
        getVoices() فارغة (Chrome/Edge يعيدان [] في الاستدعاء الأول)
      - فك القفل الفوري داخل إيماءة اللمس نفسها (cancel + نطق حرف صامت)
        قبل أي عملية async في المعالجات الأصلية
      - البحث عن أي صوت يبدأ بـ ar (ar-SA, ar-EG, ar-AE, ar) — وإلا يمرّر
        النص للصوت الافتراضي دون ضبط utterance.voice يدويًا
   ② v57 — حذف المحرك السحابي بالكامل (Cloud TTS Fully Removed):
      - أُزيل كود google.com وnew Audio() نهائيًا من التطبيق كله وأُخرجت
        نطاقاته من connect-src وmedia-src في CSP — فيستحيل تقنيًا صدور
        صوتين معًا في أي لغة: speechSynthesis المحلي هو المحرك الوحيد
   ③ المحرك الموحد لزر «استمع» في المستشار الذكي و«🎙 نشرة اليوم الصوتية»
      بجميع اللغات السبع: عبر تغليف speak/cancel ورفع إشارات speaking/pending
      وإطلاق onstart/onend على كل مقطع — فتعمل آلات الحالة القديمة (v29/v46/v47)
      كما هي دون أي مساس ببصماتها.
   ── إضافات الإصدار 49 (وضوح الصوت العربي النهائي) ──
   ④ مرشح تنظيف النصوص قبل النطق (sanitizeForSpeech(text, lang)): تحويل
      الوحدات والرموز العلمية إلى كلمات منطوقة بكل اللغات السبع، ومسح كل
      الإيموجي والرموز الرسومية، وتنقية الترقيم المربك، وتصحيح الأرقام السالبة.
   ⑤ طابور صارم (Strict Queue & Cancel): قفل isSpeaking يمنع تشغيل جملتين
      معًا، وأي نطق جديد يفرغ المحرك المحلي والمشغّل السحابي أولًا.
   ⑥ إلقاء متتابع هادئ: تقسيم النص عند النقاط والفواصل إلى جمل مستقلة،
      وبين انتهاء الجملة (onend) وبداية التي تليها مهلة صمت 350ms في العربية
      (180ms في اللغات اللاتينية)، وسرعة عربية rate 0.88 و pitch 1.0.
   ── إضافات الإصدار 50 (الإصلاح الجذري للصوت + القفل الحصري) ──
   ⑦ الإيقاف الشامل stopAllSpeech(): يُستدعى فورًا عند الضغط على أي زر صوتي
      وقبل أي نطق جديد — window.speechSynthesis.cancel() + إيقاف وتفريغ عناصر
      الصوت السحابي (pause + src="") + زيادة عداد جلسة النطق speechSessionId
      الذي يجعل كل جملة أو setTimeout متبقية من جلسة سابقة يتيمة لا تُنفَّذ
      فلا تتداخل الجمل أبدًا ولا يُسمع صوتان معًا.
   ⑧ v57 — محرك واحد مطلق (Single Engine Forever): لا مسار سحابي إطلاقًا؛
      أخطاء النطق الفعلية تُغلق الجملة بنظافة (onend) دون أي تحويل لمحرك
      موازٍ — لا صوت ثانٍ بعد ثانيتين أو في أي وقت أبدًا في كل اللغات.
   ⑨ صوت رجل عربي واضح ومفهوم: أولوية قصوى لأصوات الرجال العربية التي تحمل
      أسماء Hamed/Naayf/Tarik/Maged/Male وحامد/نايف/طارق/ماجد مع رمز لغة
      يبدأ بـ ar — وv57: نبرة هادئة pitch 0.88 وسرعة rate 0.88 لجميع
      اللغات السبع.
   ============================================================ */
const MatarTTS = (() => {
  if (typeof speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined") return {};
  /* ══ v57 — المحرك المحلي الوحيد إلى الأبد (Local-Only · Zero Cloud):
     حُذف كل كود الصوت السحابي (google.com وnew Audio) نهائيًا من التطبيق كله
     وأُخرجت نطاقاته من connect-src وmedia-src في CSP — ما دام speechSynthesis
     مدعومًا فهو المحرك الحصري الوحيد في كل اللغات السبع، ولا يوجد أي مسار
     بديل يمكنه فتح صوت ثانٍ موازٍ أبدًا. ══ */
  let gen = 0;                 /* مولّد الجلسات — أي إلغاء يبطّل المؤقتات القديمة */
  /* ── v49: قفل منع التداخل + حالة التسلسل المتتابع المحلي ── */
  let isSpeaking = false;      /* قفل صارم: لا جملتان في وقت واحد أبدًا */
  let seqActive = false;       /* تسلسل جارٍ محليًا (يُرفع في إشارة speaking) */
  let seqU = null;             /* العبارة الأم للتسلسل الحالي */
  let seqGen = 0;              /* مولّد جلسات التسلسل — الإلغاء يبطّل المؤقتات القديمة */
  let speechSessionId = 0;     /* v50 ⑦: عدّاد جلسات النطق — كل إيقاف يزيد العداد فتصبح كل الجمل والمؤقتات القديمة يتيمة */
  let flagsPatched = false;

  /* ══ ① انتظار الأصوات: onvoiceschanged + مهلة 500ms ══ */
  let voicesCache = [];
  function readVoices() { try { voicesCache = speechSynthesis.getVoices() || []; } catch (e) { voicesCache = []; } return voicesCache; }
  readVoices();
  let voicesReadyPromise = null;
  function voicesReady() {
    if (voicesCache.length) return Promise.resolve(voicesCache);
    if (voicesReadyPromise) return voicesReadyPromise;
    voicesReadyPromise = new Promise((res) => {
      let settled = false;
      const handler = () => {
        if (settled) return;
        settled = true;
        try { speechSynthesis.removeEventListener?.("voiceschanged", handler); } catch (e) {}
        try { speechSynthesis.onvoiceschanged = null; } catch (e) {}
        /* مهلة 500ms بعد الحدث كي تمتلئ القائمة كاملة قبل القراءة */
        setTimeout(() => { readVoices(); voicesReadyPromise = null; res(voicesCache); }, 500);
      };
      try { speechSynthesis.addEventListener?.("voiceschanged", handler); } catch (e) {}
      try { speechSynthesis.onvoiceschanged = handler; } catch (e) {}
      setTimeout(handler, 1600); /* سقف صعب للمتصفحات التي لا تطلق الحدث إطلاقًا */
    });
    return voicesReadyPromise;
  }
  voicesReady();

  /* بحث عن صوت للغة: بادئة ar تلتقط ar-SA/ar-EG/ar-AE/ar تلقائيًا */
  function voiceFor(l2, vs) {
    const list = vs || voicesCache;
    if (l2 === "ar") {
      const isAr = (v) => /^ar([-_]|$)/i.test(String(v.lang || ""));
      return list.find((v) => isAr(v) && /maged|ماجد|majed/i.test(v.name || ""))
        || list.find((v) => /^ar[-_]sa$/i.test(String(v.lang || "")))
        || list.find(isAr)
        || list.find((v) => /arab|عرب|naayf|nayef|hoda|hamed|laila|leila|zariyah|salma|tarik|shakir/i.test(v.name || ""))
        || null;
    }
    return list.find((v) => String(v.lang || "").toLowerCase().startsWith(l2)) || null;
  }

  /* ══ v50 ⑨ اختيار صوت رجل عربي واضح ومفهوم ══
     الأولوية القصوى لأصوات الرجال العربية بأسمائها المعروفة على الأنظمة:
     Hamed (ويندوز) · Naayf (ويندوز) · Tarik (آبل) · Maged (آبل) · Male —
     وأسماؤها العربية حامد/نايف/طارق/ماجد، ثم أي صوت ar-SA ثم أي صوت عربي.
     رمز اللغة يجب أن يبدأ بـ ar حصرًا. */
  function maleArabicVoice(vs) {
    const list = vs || voicesCache;
    const isAr = (v) => /^ar([-_]|$)/i.test(String(v.lang || ""));
    const pick = (re) => list.find((v) => isAr(v) && re.test(String(v.name || ""))) || null;
    return pick(/hamed|حامد/i)
      || pick(/naayf|nayef|نايف/i)
      || pick(/tarik|طارق/i)
      || pick(/maged|majed|ماجد/i)
      || pick(/\bmale\b|ذكر/i)
      || list.find((v) => isAr(v) && /^ar[-_]sa$/i.test(String(v.lang || "")))
      || list.find(isAr)
      || null;
  }

  /* ══ فك القفل الفوري داخل إيماءة المستخدم — محلي بالكامل (v57: بلا new Audio) ══ */
  function unlock() {
    try { speechSynthesis.cancel(); } catch (e) {}
    try {
      const w = new SpeechSynthesisUtterance(" "); /* حرف صامت — يفكّ محرك النطق بلا أي صوت مسموع */
      w.volume = 0; w.rate = 2;
      speechSynthesis.speak(w);
    } catch (e) {}
  }
  /* v56: حدث click حصرًا — حُذف مستمع pointerdown نهائيًا (كان يعمل بجانب نقرة click
     فيفتح مسارَي صوت معًا). فكّ القفل يتم الآن داخل لمسة click نفسها عبر
     window.__matarUnlock من المستمع الموحد في سكربت v56 حصريًا — بلا touchstart ولا pointerdown. */
  try { window.__matarUnlock = unlock; } catch (e) {}

  /* ══ v51 ① منع الضغطة المزدوجة والأحداث المتكررة (Debounce & Dedup) ══
     قفل زمني موحد lastSpeakClickTs على كل أزرار الصوت (النشرة الصوتية +
     أزرار «استمع» + أزرار الاستماع الجديدة v51) بمرحلة الالتقاط قبل وصول
     الحدث لأي معالج — أي استدعاء نطق جديد خلال أقل من 400ms من السابق
     يُبتلع كليًا فلا يتضاعف النطق عند إعادة رسم الواجهة أو اللمس المزدوج */
  let lastSpeakClickTs = 0;
  document.addEventListener("click", (e) => {
    try {
      const t = e.target?.closest?.("#voice-brief-btn, .v29-voice-btn, .v51-listen");
      if (!t) return;
      const now = Date.now();
      if (now - lastSpeakClickTs < 400) { e.preventDefault(); e.stopPropagation(); return; }
      lastSpeakClickTs = now;
    } catch (err) {}
  }, { capture: true });

  /* ══ v57: تنقية سريعة للفحص (stripCloud) — بلا تقسيم سحابي إطلاقًا ══ */
  function stripCloud(t) {
    return String(t || "")
      .replace(/([\p{Extended_Pictographic}\p{So}])/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function tlOf(lang) {
    const m = String(lang || "").toLowerCase().match(/^([a-z]{2})/);
    return m ? m[1] : "en";
  }

  /* ══ v49 ④ مرشح تنظيف النصوص قبل النطق — sanitizeForSpeech(text, lang) ══
     يعمل تلقائيًا على كل نص قبل وصوله لمحرك الصوت (استمع + النشرة + تنبيهات
     الطرق): وحدات ورموز علمية → كلمات منطوقة، ومسح الإيموجي كليًا، وتنقية
     الترقيم المربك إلى فواصل طبيعية، وتصحيح نطق الأرقام السالبة — بسبع لغات */
  const SPEECH_WORDS = {
    ar: { c: "درجة مئوية", f: "درجة فهرنهايت", kmh: "كيلومتر في الساعة", mps: "متر في الثانية", mph: "ميل في الساعة", pct: "بالمئة", mmh: "مليمتر في الساعة", mm: "مليمتر", cm: "سنتيمتر", km: "كيلومتر", hpa: "هيكتوباسكال", watt: "واط لكل متر مربع", aqi: "مؤشر جودة الهواء", uv: "الأشعة فوق البنفسجية", pm25: "جزيئات عالقة دقيقة بقياس 2.5 ميكرون", pm10: "جزيئات عالقة بقياس 10 ميكرون", neg: "تحت الصفر بـ", rng: "إلى" },
    en: { c: "degrees Celsius", f: "degrees Fahrenheit", kmh: "kilometers per hour", mps: "meters per second", mph: "miles per hour", pct: "percent", mmh: "millimeters per hour", mm: "millimeters", cm: "centimeters", km: "kilometers", hpa: "hectopascals", watt: "watts per square meter", aqi: "air quality index", uv: "ultraviolet", pm25: "fine particles of 2.5 microns", pm10: "coarse particles of 10 microns", neg: "minus", rng: "to" },
    fr: { c: "degrés Celsius", f: "degrés Fahrenheit", kmh: "kilomètres par heure", mps: "mètres par seconde", mph: "miles par heure", pct: "pour cent", mmh: "millimètres par heure", mm: "millimètres", cm: "centimètres", km: "kilomètres", hpa: "hectopascals", watt: "watts par mètre carré", aqi: "indice de qualité de l’air", uv: "ultraviolets", pm25: "particules fines de 2,5 microns", pm10: "particules de 10 microns", neg: "moins", rng: "à" },
    de: { c: "Grad Celsius", f: "Grad Fahrenheit", kmh: "Kilometer pro Stunde", mps: "Meter pro Sekunde", mph: "Meilen pro Stunde", pct: "Prozent", mmh: "Millimeter pro Stunde", mm: "Millimeter", cm: "Zentimeter", km: "Kilometer", hpa: "Hektopascal", watt: "Watt pro Quadratmeter", aqi: "Luftqualitätsindex", uv: "Ultraviolettstrahlung", pm25: "Feinstaub mit 2,5 Mikron", pm10: "Feinstaub mit 10 Mikron", neg: "minus", rng: "bis" },
    es: { c: "grados Celsius", f: "grados Fahrenheit", kmh: "kilómetros por hora", mps: "metros por segundo", mph: "millas por hora", pct: "por ciento", mmh: "milímetros por hora", mm: "milímetros", cm: "centímetros", km: "kilómetros", hpa: "hectopascales", watt: "vatios por metro cuadrado", aqi: "índice de calidad del aire", uv: "rayos ultravioleta", pm25: "partículas finas de 2,5 micras", pm10: "partículas de 10 micras", neg: "menos", rng: "a" },
    pt: { c: "graus Celsius", f: "graus Fahrenheit", kmh: "quilómetros por hora", mps: "metros por segundo", mph: "milhas por hora", pct: "por cento", mmh: "milímetros por hora", mm: "milímetros", cm: "centímetros", km: "quilómetros", hpa: "hectopascais", watt: "watts por metro quadrado", aqi: "índice de qualidade do ar", uv: "radiação ultravioleta", pm25: "partículas finas de 2,5 mícrons", pm10: "partículas de 10 mícrons", neg: "menos", rng: "a" },
    it: { c: "gradi Celsius", f: "gradi Fahrenheit", kmh: "chilometri all’ora", mps: "metri al secondo", mph: "miglia all’ora", pct: "per cento", mmh: "millimetri all’ora", mm: "millimetri", cm: "centimetri", km: "chilometri", hpa: "ettopascal", watt: "watt per metro quadrato", aqi: "indice di qualità dell’aria", uv: "raggi ultravioletti", pm25: "particelle fini da 2,5 micron", pm10: "particelle da 10 micron", neg: "meno", rng: "a" },
  };
  function sanitizeForSpeech(text, lang) {
    let t = String(text ?? "");
    if (!t.trim()) return "";
    const l2 = SPEECH_WORDS[tlOf(lang)] ? tlOf(lang) : "en";
    const W = SPEECH_WORDS[l2] || SPEECH_WORDS.en;
    const C = l2 === "ar" ? "،" : ",";
    /* ① الإيموجي والرموز الرسومية تُمسح تمامًا — كي لا يقرأها المحرك بأسمائها
       الإنجليزية وسط الكلام (شاملة كل مستويات الإيموجي ومحددات العرض والضم) */
    t = t.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}]/gu, " ");
    /* ② الوحدات والرموز العلمية → كلمات منطوقة — الأرقام لاتينية وعربية-هندية
       كاملة (بالعشريات) كي لا تنشطر الأرقام، والسالب أولًا قبل تحويل الدرجات */
    t = t
      /* ②-ب الأرقام السالبة: ‑3 ⬅ تحت الصفر بـ 3 (ناقص لا يسبقه رقم) */
      .replace(/(^|[\s،,؛;:(])[-−‑](?=[٠-٩\d])/gu, `$1 ${W.neg} `)
      /* مدى متلاصق: 10-15 ⬅ 10 إلى 15 (الشرطة المفصولة بمسافات تفاصلة لاحقًا) */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)-([٠-٩\d]+(?:[.,][٠-٩\d]+)?)/gu, `$1 ${W.rng} $2`)
      /* حرارة: °ف/°F ثم °م/°C ثم ° مجردة (سياق الطقس مئوي دائمًا) */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*[°º]\s*(?:F|ف)(?![\p{L}])/gu, ` $1 ${W.f}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*[°º]\s*(?:C|م|س)(?![\p{L}])/gu, ` $1 ${W.c}`)
      .replace(/[°º]\s*(?:F|ف)/gu, ` ${W.f}`)
      .replace(/[°º]\s*(?:C|م|س)/gu, ` ${W.c}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*[°º](?![\p{L}])/gu, ` $1 ${W.c}`)
      /* رياح: كم/س وكم/ساعة وkm/h وkph ثم م/ث وm/s ثم mph */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*كم\s*\/\s*(?:ساعة|س)(?![\p{L}])/gu, ` $1 ${W.kmh}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*km\s*\/\s*(?:h|hr|hour)(?![\p{L}])/giu, ` $1 ${W.kmh}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*(?:kph|kmh|kmph)(?![\p{L}])/giu, ` $1 ${W.kmh}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*م\s*\/\s*(?:ثانية|ث)(?![\p{L}])/gu, ` $1 ${W.mps}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*m\s*\/\s*s(?![\p{L}])/giu, ` $1 ${W.mps}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*(?:mps)(?![\p{L}])/giu, ` $1 ${W.mps}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*(?:mph)(?![\p{L}])/giu, ` $1 ${W.mph}`)
      /* نسب: ٪ أو % بعد رقم ثم أي نسب متفرقة */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*[٪%](?![\p{L}\d])/gu, ` $1 ${W.pct}`)
      .replace(/[٪%]/gu, ` ${W.pct}`)
      /* هطول: مم/س ثم مم ثم سم */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*مم\s*\/\s*(?:ساعة|س)(?![\p{L}])/gu, ` $1 ${W.mmh}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*mm\s*\/\s*h(?![\p{L}])/giu, ` $1 ${W.mmh}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*مم(?![\p{L}])/gu, ` $1 ${W.mm}`)
      .replace(/\bmm\b/giu, ` ${W.mm}`)
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*سم(?![\p{L}])/gu, ` $1 ${W.cm}`)
      .replace(/\bcm\b/giu, ` ${W.cm}`)
      /* مسافات: كم بعد رقم (حرفيًا كي لا تُفسد «كم الساعة؟») ثم \bkm\b */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*كم(?![\p{L}])/gu, ` $1 ${W.km}`)
      .replace(/\bkm\b/giu, ` ${W.km}`)
      /* ضغط: hPa */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*hpa(?![\p{L}])/giu, ` $1 ${W.hpa}`)
      .replace(/\bhpa\b/giu, ` ${W.hpa}`)
      /* إشعاع: W/m² */
      .replace(/([٠-٩\d]+(?:[.,][٠-٩\d]+)?)\s*w\s*\/\s*m\s*[²2](?![\p{L}])/giu, ` $1 ${W.watt}`)
      /* هواء وأشعة: PM2.5 وPM10 وAQI وUV/UVI */
      .replace(/\bPM\s*2\s*[.,]\s*5\b/giu, ` ${W.pm25}`)
      .replace(/\bPM\s*10\b/giu, ` ${W.pm10}`)
      .replace(/\bPM\b/giu, ` ${W.pm10}`)
      .replace(/\bAQI\b/giu, ` ${W.aqi}`)
      .replace(/\bUVI?\b/giu, ` ${W.uv}`);
    /* ③ الترقيم المربك → فاصلة طبيعية يأخذ عندها الصوت نفسًا قصيرًا */
    t = t
      .replace(/[←→↔⇐⇒⇔➜➤⬅⬆⬇⬈⬉]/gu, ` ${C} `)
      .replace(/[·•▪◦∙*#]/gu, ` ${C} `)
      .replace(/[—–‒―]/gu, ` ${C} `)
      .replace(/(?:\.{2,}|…|⋯)/gu, ` ${C} `)
      .replace(/[|/\\│]/gu, ` ${C} `)
      /* الأقواس المربعة والمزخرفة تُحذف ويُحتفظ بالنص بداخلها */
      .replace(/[«»\[\]{}()〈〉《》【】“”]/gu, " ")
      /* ما تبقى من رموز وعملات ومحارف تحكم يُمسح */
      .replace(/[\p{So}\p{Sm}\p{Sc}\p{Cf}]/gu, " ")
      .replace(/(?:\s*،\s*){2,}/gu, " ، ")
      .replace(/(?:\s*,\s*){2,}/gu, " , ");
    /* تنظيف المسافات النهائي */
    t = t.replace(/\s+/g, " ").trim();
    if (t.startsWith(C)) t = t.slice(1).trim();
    return t;
  }
  try { window.sanitizeForSpeech = sanitizeForSpeech; } catch (e) { /* بيئة بلا window */ }

  /* ══ v49 ⑥ تقسيم النص عند النقاط والفواصل إلى جمل مستقلة للإلقاء الهادئ ══ */
  function splitSentences(text) {
    const t = String(text || "").replace(/\s+/g, " ").trim();
    if (!t) return [];
    const parts = t.split(/(?<=[.!?؟…؛])\s+|(?<=[،,;])\s+/u).map((s) => s.trim()).filter(Boolean);
    const out = [];
    for (const p of parts) {
      /* الدمج اللطيف: الشظايا القصيرة تلتحم بجارتها كي لا يتصاحب النطق */
      if (out.length && (p.length < 12 || out[out.length - 1].length < 12)) out[out.length - 1] += " " + p;
      else out.push(p);
    }
    return out;
  }

  /* ══ v50 ⑦ + v57 الإيقاف الشامل stopAllSpeech() — يُستدعى فورًا عند الضغط
     على أي زر صوتي وقبل أي نطق جديد (محرك واحد حصرًا في كل لحظة):
       • window.speechSynthesis.cancel() للمحرك المحلي (لا يوجد غيره إطلاقًا)
       • زيادة عداد جلسة النطق speechSessionId — فتصبح كل جملة أو setTimeout
         متبقية من جلسة سابقة يتيمة يتجاهلها المحرك فلا تتداخل الجمل أبدًا
       • إيقاف صوت الجو وتصفير أقفال التسلسل وإشارات أزرار v29 */
  function stopAllSpeech() {
    speechSessionId += 1;
    gen += 1;
    seqGen += 1;
    isSpeaking = false;
    seqActive = false;
    if (seqU) {
      const su = seqU;
      seqU = null;
      su.__v49Abort = true;
      /* إغلاق العبارة المتسلسلة القديمة غير متزامن كي لا يتقدم سلسلة v29 قبل
         تنظيف حالة الزناد المتزامنة (زر الإيقاف يمسح data-speaking بعد cancel) */
      setTimeout(() => {
        if (su.__v48Done || su.__v49Closed) return;
        su.__v49Closed = true;
        fireEnd(su);
      }, 0);
    }
    try { window.__matarAmb?.stop(); } catch (e) {}
    document.querySelectorAll(".v29-voice-btn[data-speaking]").forEach((b) => b.removeAttribute("data-speaking"));
    try { origCancel(); } catch (e) {}
  }
  try { window.stopAllSpeech = stopAllSpeech; } catch (e) { /* بيئة بلا window */ }
  try { window.__matarSpeechSession = () => speechSessionId; } catch (e) { /* اختياري */ }
  /* ══ إعلان الانتهاء النظيف للعبارة (onend واحد لا اثنان) ══ */
  function fireEnd(u) {
    isSpeaking = false; /* v49: تحرير القفل الصارم عند أي إعلان انتهاء */
    try { if (typeof u.onend === "function") u.onend({ type: "end", utterance: u }); } catch (e) {}
    try { u.dispatchEvent?.(new Event("end")); } catch (e) {}
  }

  /* ══ v49 ⑥ المشغّل المتتابع المحلي: جملة ← وقف صمت ← جملة ══
     تقسيم النص إلى جمل مستقلة، وبين انتهاء كل جملة (onend) وبداية التي
     تليها مهلة 350ms في العربية (180ms في اللاتينية) — إلقاء هادئ مفهوم */
  function playSequence(u, sents, l2) {
    const myGen = ++seqGen;
    const mySession = speechSessionId; /* v50: جلسة مثبتة — الإيقاف الشامل يجعل هذا التسلسل يتيمًا */
    seqActive = true;
    seqU = u;
    isSpeaking = true;
    u.__v49Seq = true;
    let i = 0;
    let startedAny = false;
    const GAP = l2 === "ar" ? 350 : 180;
    const stopLocks = () => { if (myGen === seqGen) { seqActive = false; seqU = null; isSpeaking = false; } };
    const finish = () => {
      if (myGen !== seqGen || u.__v49Abort) return;
      stopLocks();
      if (!u.__v48Done && !u.__v49Closed) { u.__v49Closed = true; fireEnd(u); }
    };
    /* إشعار البداية فورًا (تثبت آلات الحالة القديمة) + إيقاف صوت الجو */
    try { window.__matarAmb?.stop(); } catch (e) {}
    try { if (typeof u.onstart === "function") u.onstart({ type: "start", utterance: u }); } catch (e) {}
    try { u.dispatchEvent?.(new Event("start")); } catch (e) {}
    const next = () => {
      if (myGen !== seqGen || mySession !== speechSessionId || u.__v49Abort) return;
      if (i >= sents.length) { finish(); return; }
      const s = sents[i++];
      let c;
      try { c = new SpeechSynthesisUtterance(s); } catch (e) { finish(); return; }
      c.__v49Child = true; /* مرور مباشر في التغليف بلا إعادة معالجة */
      try { if (u.voice) c.voice = u.voice; } catch (e) {}
      if (u.lang) c.lang = u.lang;
      /* v57: نبرة هادئة وسرعة 0.88 لجميع اللغات السبع */
      c.rate = u.rate ?? 0.88;
      c.pitch = u.pitch ?? 0.88;
      c.volume = u.volume ?? 1;
      c.onstart = () => { startedAny = true; };
      c.onend = () => { if (myGen !== seqGen || mySession !== speechSessionId || u.__v49Abort) return; setTimeout(next, GAP); };
      c.onerror = (ev) => {
        const err = String(ev?.error || "");
        if (myGen !== seqGen || mySession !== speechSessionId || u.__v49Abort || ["interrupted", "canceled"].includes(err)) return;
        /* v57: لا محرك سحابي إطلاقًا — الخطأ الفعلي يُنهي التسلسل بنظافة تامة */
        finish();
      };
      try { origSpeak(c); } catch (e) { setTimeout(next, GAP); }
    };
    /* v57: لا مراقب صمت ولا مسار سحابي — فشل أي جملة يعالجه onerror الخاص
       بها بإنهاء نظيف، ولا يوجد أي مؤقت يحوّل لمحرك موازٍ إطلاقًا */
    next();
  }

  /* ══ تغليف دورة حياة المقطع: onend يعلن الإتمام، وonerror يُغلق بنظافة —
     v57: لا تحويل للسحابي إطلاقًا (المحرك المحلي هو الوحيد إلى الأبد) ══ */
  function wrapLifecycle(u) {
    if (u.__v48Wrapped) return;
    u.__v48Wrapped = true;
    const origStart = u.onstart, origEnd = u.onend, origErr = u.onerror;
    u.onstart = function (ev) { u.__v48Started = true; try { if (typeof origStart === "function") origStart.call(u, ev); } catch (e) {} };
    u.onend = function (ev) { u.__v48Done = true; isSpeaking = false; try { if (typeof origEnd === "function") origEnd.call(u, ev); } catch (e) {} };
    u.onerror = function (ev) {
      u.__v48Done = true;
      isSpeaking = false;
      try { if (typeof origErr === "function") origErr.call(u, ev); } catch (e) {}
    };
  }

  /* ══ v57: لا مراقب زمني ولا محرك سحابي — الصوت الثاني مستحيل تقنيًا:
     المحرك المحلي وحده يعمل، وأي خطأ فعلي يُغلق الجملة بنظافة دون تشغيل
     أي صوت موازٍ فوقه في كل اللغات السبع. ══ */

  /* ══ ③ التغليف الموحد لـ speak — v51: تنقية ← قفل حصري ← تفريغ 60ms ← بدء ══ */
  /* v51 ② فاصل التفريغ غير المتزامن (Async Cancel Flush): بعض المتصفحات تدمج
     الجملة الجديدة مع بقايا القديمة إذا استُدعي speak() في نفس اللحظة بعد
     cancel() — لذلك ننتظر 60ms بعد التفريغ قبل بدء النطق الجديد، والبدء
     واعٍ بالجلسة (أي stopAllSpeech خلال الفاصل يجهضه فلا تتداخل الجملة أبدًا) */
  const CANCEL_FLUSH_MS = 60;
  /* v52: حُذف ثابت CLOUD_GATE_MS (مهلة 1.5 ثانية) نهائيًا — بوابة السحابي
     صارت حدثية (onerror فعلي) لا زمنية */
  const origSpeak = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = function (u) {
    try {
      if (!u || typeof u.text !== "string") return origSpeak(u);
      if (u.__v49Child) return origSpeak(u); /* جملة تابعة داخل تسلسل — مرور مباشر */
      /* ④ التنقية قبل أي نطق: وحدات منطوقة + بلا إيموجي + ترقيم نظيف */
      try {
        const preL2 = tlOf(u.lang) || (String(window.__matarBridge?.lang?.() || "ar").slice(0, 2));
        const cleaned = sanitizeForSpeech(u.text, preL2);
        if (cleaned) u.text = cleaned;
      } catch (e) { /* تعذر التنقية → النص كما هو */ }
      const plain = stripCloud(u.text);
      if (!plain) return origSpeak(u); /* حرف التسخين الصامت — مرور مباشر */
      const l2 = tlOf(u.lang) || (String(window.__matarBridge?.lang?.() || "ar").slice(0, 2));
      /* v51: هل كان المحرك مشغولًا قبل هذه اللمسة؟ إن نعم فلزمنا فاصل التفريغ،
         وإن لا فالبداية فورية داخل إيماءة المستخدم نفسها (شرط iOS Autoplay) */
      const wasBusy = (() => {
        try { return isSpeaking || seqActive || !!(speechSynthesis.speaking || speechSynthesis.pending); }
        catch (e) { return isSpeaking; }
      })();
      /* ⑦ قفل حصري: stopAllSpeech يفرغ المحرك المحلي والسحابي والتسلسل ويزيد
         عداد الجلسة قبل أي نطق جديد — لا جملتان ولا محركان معًا أبدًا */
      stopAllSpeech();
      isSpeaking = true;
      const vs = voicesCache.length ? voicesCache : readVoices();
      /* ⑨ صوت رجل عربي واضح ومفهوم: أولوية قصوى لأصوات الرجال العربية
         (Hamed/Naayf/Tarik/Maged/Male بأسمائها اللاتينية والعربية) —
         وv57: نبرة هادئة وسرعة 0.88 موحدة لجميع اللغات السبع */
      if (l2 === "ar") {
        const mv = maleArabicVoice(vs);
        if (mv) { try { u.voice = mv; } catch (e) {} try { u.lang = mv.lang || u.lang; } catch (e) {} }
        else { try { u.voice = null; } catch (e) {} } /* v58: بلا صوت عربي مثبت → محرك النظام الافتراضي (voice=null) */
      }
      u.rate = 0.88;
      u.pitch = 0.88;
      /* ⑥ تقسيم عند النقاط والفواصل → إلقاء متتابع بوقف صامت طبيعي بين الجمل
         (v57: المحلي حصري دائمًا — لا يوجد أي محرك آخر يمكن الفتح إليه) */
      const sents = splitSentences(plain);
      /* v51: بدء مؤجل واعٍ بالجلسة — أي إيقاف خلال فاصل التفريغ يجهض البدء
         فلا تتقدم جملة قديمة أو تتداخل مع الجلسة الأحدث */
      const mySession = speechSessionId;
      const myGen = gen;
      /* v54+v57: مسار «الجملة الواحدة المتماسكة» — النص كاملًا بعبارة واحدة
         متصلة بلا تقسيم ولا تسلسل ولا مؤقتات، وبلا أي صوت سحابي إطلاقًا (حُذف
         نهائيًا في v57). الزران المتبقيان في التطبيق (النشرة الصوتية + تفاصيل
         اليوم) يمرران __v54Single حصرًا بنبرة هادئة وسرعة 0.88 لكل اللغات */
      if (u.__v54Single) {
        const kick1 = () => {
          if (mySession !== speechSessionId || myGen !== gen) return;
          wrapLifecycle(u);
          /* v58: resume() قبل speak() — فكّ تعليق محرك Chromium/Android قبل النطق */
          try { speechSynthesis.resume(); } catch (e) {}
          origSpeak(u);
        };
        if (wasBusy) setTimeout(kick1, CANCEL_FLUSH_MS);
        else kick1();
        return;
      }
      const kick = () => {
        if (mySession !== speechSessionId || myGen !== gen) return;
        /* v57: المحلي حصري دائمًا — تقسيم الجمل يبقى محليًا بالكامل، وفشل أي
           جملة يُغلق بنظافة عبر wrapLifecycle — لا مسار موازٍ إطلاقًا */
        /* v58: resume() قبل speak() — فكّ تعليق محرك Chromium/Android قبل النطق */
        try { speechSynthesis.resume(); } catch (e) {}
        if (sents.length > 1) { playSequence(u, sents, l2); return; }
        wrapLifecycle(u);
        origSpeak(u);
      };
      if (wasBusy) setTimeout(kick, CANCEL_FLUSH_MS);
      else kick();
      return;
    } catch (e) {
      try { return origSpeak(u); } catch (e2) { return undefined; }
    }
  };

  /* ══ التغليف الموحد لـ cancel: يوقف السحابي والتسلسل والمحلي معًا ══ */
  const origCancel = speechSynthesis.cancel.bind(speechSynthesis);
  speechSynthesis.cancel = function () {
    try { stopAllSpeech(); } catch (e) {}
    return origCancel();
  };

  /* ══ رفع إشارتي speaking/pending أثناء التسلسل المحلي ══
     كي تتعامل مؤقتات v29/strategy مع الجلسة الجارية كنطق فعلي لم ينته */
  let rawSpeaking = () => { try { return !!(speechSynthesis.speaking || speechSynthesis.pending); } catch (e) { return true; } };
  function patchFlags() {
    try {
      const proto = Object.getPrototypeOf(speechSynthesis);
      const gs = Object.getOwnPropertyDescriptor(proto, "speaking");
      const gp = Object.getOwnPropertyDescriptor(proto, "pending");
      if (gs?.get && gp?.get && gs.configurable && gp.configurable) {
        const os = gs.get.bind(speechSynthesis);
        const op = gp.get.bind(speechSynthesis);
        /* قراءة خام للقيمة الأصلية — يستخدمها مراقب صمت التسلسل حصرًا */
        rawSpeaking = () => { try { return !!os(); } catch (e) { return false; } };
        Object.defineProperty(speechSynthesis, "speaking", { get() { try { return seqActive ? true : os(); } catch (e) { return seqActive; } }, configurable: true });
        Object.defineProperty(speechSynthesis, "pending", { get() { try { return seqActive ? true : op(); } catch (e) { return seqActive; } }, configurable: true });
        flagsPatched = true;
      }
    } catch (e) { flagsPatched = false; }
  }
  patchFlags();

  window.addEventListener("beforeunload", () => { try { stopAllSpeech(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} });
  window.addEventListener("pagehide", () => { try { stopAllSpeech(); } catch (e) {} });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { try { stopAllSpeech(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} } });

  return { unlock, voicesReady, hasArabicVoice: () => !!voiceFor("ar"), sanitize: sanitizeForSpeech, stopAll: stopAllSpeech, sessionId: () => speechSessionId, maleVoice: maleArabicVoice, get isSpeaking() { return !!(isSpeaking || seqActive); } };
})();

    

/* ═══════════════════ v48 — محرك الطقس البصري والسمعي (html[data-wtheme] + Web Audio) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 48: Dynamic Weather-Reactive UI & Soundscapes
   ------------------------------------------------------------
   ① محرك الألوان الديناميكي: html[data-wtheme] مربوط بـ weather_code
      و is_day ووقت الشروق/الغروب وجودة الهواء — بانتقال سلس 1.2s
   ② الزجاجية التفاعلية: انعكاس علوي + blur(16px) + ظلال محيطة ملوّنة (CSS)
   ③ أيقونات SVG متحركة للبطل (شمس تدور، قطرات لامعة، هلال ونجوم) عبر
      MutationObserver يتبدّل مع كل إعادة رسم من المحرك الرئيسي دون مساس به
   ④ بطاقة بطل سينمائية: Parallax + تقلص بالتمرير + شريط زجاجي ثابت
      يعرض المدينة والحرارة + عدّ تصاعدي سلس بـ tabular-nums
   ⑤ مؤشرات حية: قوس الشمس/القمر، بوصلة رياح دوارة، شرائط AQI/UV طيفية
   ⑥ لمس مرن: نبضة vibrate(10) على الأزرار + ضغط بطاقات scale(0.98)
   ⑦ أصوات الجو بدون أي ملف خارجي: Web Audio API تولّد مطرًا ورياحًا ورعدًا
      متزامنًا مع وميض البرق — مكتوم افتراضيًا وFade-out عند الإيقاف أو النشرة
   ⑧ الربط بالوضع الاقتصادي (matar:eco + html.eco) و prefers-reduced-motion:
      توقف فوري للحركة والأصوات وتثبيت الألوان وإلغاء backdrop-filter الثقيل
   التوافق: ملف واحد · لا مساس بالسكربتات السابقة (بصماتها كما هي) ·
   بصمة هذا السكربت مضافة إلى CSP · hosts كلها مغطاة مسبقًا
   ============================================================ */
const DashboardV48 = (() => {
  const $q = (sel, root = document) => (root || document).querySelector(sel);
  const esc = (s) => escapeHtml(String(s ?? ""));
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SKY_RAIN = 70, SKY_STARS = 42, SKY_CLOUDS = 4, SKY_MOTES = 22;
  let curTheme = "";
  let stormTimer = 0;
  let arcTimer = 0;
  let soundOn = false;
  let soundForced = false;

  /* ─────────────── الترجمات: مدخلات v48 في القاموس الممتد ─────────────── */
  try {
    Object.assign(I18N_EXTRA, {
      "مباشر": { en: "Live", fr: "En direct", de: "Live", es: "En vivo", pt: "Em direto", it: "Diretta" },
      "صوت الجو": { en: "Ambient sound", fr: "Son de l’ambiance", de: "Wetterklänge", es: "Sonido del ambiente", pt: "Som do ambiente", it: "Suono dell’ambiente" },
      "أصوات الجو الحية — زقزقة ونسيم ومطر ورعد مولّدة برمجيًا دون أي ملفات صوتية": { en: "Live ambience — birdsong, breeze, rain and thunder generated in code with zero audio files", fr: "Ambiance en direct — chants d’oiseaux, brise, pluie et tonnerre générés par code sans aucun fichier audio", de: "Live-Kulisse — Vogelgezwitscher, Brise, Regen und Donner per Code erzeugt, ohne Audiodateien", es: "Ambiente en vivo — trinos, brisa, lluvia y truenos generados por código sin archivos de audio", pt: "Ambiente ao vivo — trinados, brisa, chuva e trovão gerados por código sem ficheiros de áudio", it: "Ambiente dal vivo — cinguettio, brezza, pioggia e tuono generati via codice senza file audio" },
      "الصوت متوقف في الوضع الاقتصادي لتوفير البطارية": { en: "Sound is paused in Eco mode to save battery", fr: "Le son est en pause en mode éco pour économiser la batterie", de: "Ton ist im Eco-Modus zur Akkusparung pausiert", es: "El sonido está pausado en modo eco para ahorrar batería", pt: "O som está pausado no modo ecológico para poupar bateria", it: "L’audio è in pausa in modalità eco per risparmiare batteria" },
      "مؤشرات حية": { en: "Live gauges", fr: "Indicateurs en direct", de: "Live-Anzeigen", es: "Indicadores en vivo", pt: "Indicadores em direto", it: "Indicatori live" },
      "قوس الشمس والقمر، بوصلة الرياح، وشرائط جودة الهواء والأشعة تتحرك مع القراءة الفعلية": { en: "Sun & moon arc, wind compass and air-quality/UV spectrum bars move with the actual reading", fr: "Arc du soleil et de la lune, boussole du vent et barres de qualité d’air/UV suivant la lecture réelle", de: "Sonne-Mond-Bogen, Windkompass und AQI/UV-Spektralbänder folgen der tatsächlichen Messung", es: "Arco solar/lunar, brújula del viento y barras de calidad del aire/UV según la lectura real", pt: "Arco do sol/lua, bússola do vento e barras de qualidade do ar/UV conforme a leitura real", it: "Arco sole/luna, bussola del vento e barre qualità dell’aria/UV in base alla lettura reale" },
      "قوس الشمس والقمر": { en: "Sun & moon arc", fr: "Arc du soleil et de la lune", de: "Bogen von Sonne & Mond", es: "Arco del sol y la luna", pt: "Arco do sol e da lua", it: "Arco del sole e della luna" },
      "بوصلة الرياح": { en: "Wind compass", fr: "Boussole du vent", de: "Windkompass", es: "Brújula del viento", pt: "Bússola do vento", it: "Bussola del vento" },
      "الشروق": { en: "Sunrise", fr: "Lever du soleil", de: "Sonnenaufgang", es: "Amanecer", pt: "Nascer do sol", it: "Alba" },
      "الغروب": { en: "Sunset", fr: "Coucher du soleil", de: "Sonnenuntergang", es: "Atardecer", pt: "Pôr do sol", it: "Tramonto" },
      "قوس الليل": { en: "Night arc", fr: "Arc de la nuit", de: "Nachtbogen", es: "Arco nocturno", pt: "Arco noturno", it: "Arco notturno" },
      "جودة الهواء الآن": { en: "Air quality now", fr: "Qualité de l’air maintenant", de: "Luftqualität jetzt", es: "Calidad del aire ahora", pt: "Qualidade do ar agora", it: "Qualità dell’aria ora" },
      "الأشعة الآن": { en: "UV now", fr: "UV maintenant", de: "UV jetzt", es: "UV ahora", pt: "UV agora", it: "UV ora" },
      "جيد": { en: "Good", fr: "Bonne", de: "Gut", es: "Buena", pt: "Boa", it: "Buona" },
      "متوسط": { en: "Moderate", fr: "Moyenne", de: "Mäßig", es: "Moderada", pt: "Moderada", it: "Media" },
      "غير صحي للحساسين": { en: "Unhealthy for sensitive groups", fr: "Mauvaise pour les sensibles", de: "Ungesund für Empfindliche", es: "Insalubre para sensibles", pt: "Má para sensíveis", it: "Scarsa per sensibili" },
      "غير صحي": { en: "Unhealthy", fr: "Malsaine", de: "Ungesund", es: "Insalubre", pt: "Má", it: "Insalubre" },
      "غير صحي جدًا": { en: "Very unhealthy", fr: "Très malsaine", de: "Sehr ungesund", es: "Muy insalubre", pt: "Muito má", it: "Molto scarsa" },
      "خطير": { en: "Hazardous", fr: "Dangereuse", de: "Gefährlich", es: "Peligrosa", pt: "Perigosa", it: "Pericolosa" },
      "لا توجد بيانات": { en: "No data", fr: "Aucune donnée", de: "Keine Daten", es: "Sin datos", pt: "Sem dados", it: "Nessun dato" },
      "اقفز إلى أعلى لوحة القيادة": { en: "Jump to the top of the dashboard", fr: "Revenir en haut du tableau de bord", de: "Nach oben der Übersicht springen", es: "Ir arriba del panel", pt: "Voltar ao topo do painel", it: "Torna in cima alla dashboard" },
      "الرياح هادئة": { en: "Calm wind", fr: "Vent calme", de: "Schwacher Wind", es: "Viento suave", pt: "Vento fraco", it: "Vento lieve" },
      "الرياح نشطة": { en: "Fresh wind", fr: "Vent frais", de: "Frischer Wind", es: "Viento activo", pt: "Vento ativo", it: "Vento vivace" },
      "عاصفة رياح": { en: "Windstorm", fr: "Tempête de vent", de: "Windsturm", es: "Ventarrón", pt: "Tempestade de vento", it: "Tempesta di vento" },
    });
  } catch (e) { /* القاموس غير متاح في بيئة اختبار — لا يعطل الواجهة */ }

  /* ─────────────── حراس الحركة: الوضع الاقتصادي + تفضيل النظام ─────────────── */
  function ecoOn() { try { return typeof Eco === "object" && Eco.isEco(); } catch (e) { return false; } }
  function motionOk() { return !ecoOn() && !REDUCED.matches; }

  /* ══════════════════ ① محرك الألوان الديناميكي ══════════════════ */
  function minutesOf(iso) {
    const m = String(iso || "").match(/T(\d{2}):(\d{2})/);
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }

  function themeFor() {
    const wx = state.wx;
    if (!wx || !wx.current) return "";
    const cur = wx.current;
    const code = cur.weather_code ?? 0;
    const isDay = (cur.is_day ?? 1) === 1;
    const air = state.air?.current ?? {};
    const nowIdx = (typeof hourIndexAtPlace === "function" && wx.hourly?.time) ? hourIndexAtPlace(wx) : 0;
    const temp = cur.temperature_2m ?? wx.hourly?.temperature_2m?.[nowIdx];
    const feels = cur.apparent_temperature ?? temp;

    /* موجة غبار: غبار مرتفع أو pm10 مرتفع */
    if ((air.dust != null && air.dust >= 120) || (air.pm10 != null && air.pm10 >= 120)) return "hot-dust";
    /* موجة حر */
    if ((feels != null && feels >= 41) || (temp != null && temp >= 43)) return "hot-dust";
    /* عواصف رعدية */
    if ([95, 96, 99].includes(code)) return "storm";
    /* ثلوج → غائمة (قبل فحص الرموز ≥51 كي لا تلتقطها قاعدة الأمطار) */
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "overcast";
    /* أمطار غزيرة/متوسطة ورذاذ كثيف */
    if ((code >= 63 && code <= 67) || (code >= 81 && code <= 82)) return "storm";
    if (code >= 51) return "storm";
    /* ضباب */
    if (code === 45 || code === 48) return "overcast";
    /* نافذة الغروب الذهبي: سماء صافية/شبه صافية قرب الشروق أو الغروب */
    const h = wx.hourly;
    const nowISO = h?.time?.[nowIdx];
    if (nowISO && wx.daily?.sunrise?.[0] && wx.daily?.sunset?.[0]) {
      const nowMin = minutesOf(nowISO);
      const srMin = minutesOf(wx.daily.sunrise[0]);
      const ssMin = minutesOf(wx.daily.sunset[0]);
      if (nowMin != null && srMin != null && ssMin != null) {
        const morning = Math.abs(nowMin - srMin) <= 50;
        const evening = nowMin >= ssMin - 80 && nowMin <= ssMin + 20;
        if ((morning || evening) && code <= 2) return "sunset";
      }
    }
    /* ليل صافٍ ومقمر */
    if (!isDay) return "clear-night";
    /* غائم كثيف */
    if (code === 3 || (cur.cloud_cover ?? 0) >= 85) return "overcast";
    /* نهار مشمس (صافٍ أو غائم جزئيًا) */
    return "sunny-day";
  }

  function applyThemeEngine() {
    const t = themeFor();
    if (t === curTheme) return;
    curTheme = t;
    try {
      if (t) document.documentElement.dataset.wtheme = t;
      else delete document.documentElement.dataset.wtheme;
    } catch (e) {}
    buildSky();
    scheduleStormLoop();
  }

  /* ══════════════════ ③ طبقة السماء الحية ══════════════════ */
  let skyEl = null;
  function ensureSky() {
    if (skyEl && document.body.contains(skyEl)) return skyEl;
    skyEl = document.createElement("div");
    skyEl.id = "v48-sky";
    skyEl.setAttribute("aria-hidden", "true");
    document.body.prepend(skyEl);
    return skyEl;
  }
  function span(cls, vars) {
    const s = document.createElement("i");
    s.className = cls;
    for (const [k, v] of Object.entries(vars || {})) s.style.setProperty(k, v);
    s.style.left = vars?.left != null ? vars.left : `${Math.round(Math.random() * 100)}%`;
    return s;
  }
  function buildSky() {
    if (!skyEl) skyEl = ensureSky();
    skyEl.innerHTML = "";
    if (!curTheme || !motionOk()) return;
    const vw = Math.max(360, window.innerWidth);
    const scale = vw < 480 ? 0.62 : vw < 768 ? 0.82 : 1;
    if (curTheme === "storm" || curTheme === "overcast") {
      const n = Math.round(SKY_CLOUDS * scale) + (curTheme === "overcast" ? 2 : 0);
      for (let i = 0; i < n; i++) {
        skyEl.appendChild(span("cloud", { "--dur": `${52 + Math.random() * 40}s`, "--delay": `${-Math.random() * 60}s`, top: `${4 + Math.random() * 26}%`, left: `${Math.random() * 100}%` }));
      }
    }
    if (curTheme === "storm") {
      for (let i = 0; i < Math.round(SKY_RAIN * scale); i++) {
        skyEl.appendChild(span("drop", { "--dur": `${0.55 + Math.random() * 0.5}s`, "--delay": `${-Math.random() * 2}s`, "--op": `${0.4 + Math.random() * 0.45}`, left: `${Math.random() * 100}%` }));
      }
      const bolt = document.createElement("i");
      bolt.className = "bolt";
      skyEl.appendChild(bolt);
    } else if (curTheme === "sunny-day" || (curTheme === "sunset")) {
      const beam = document.createElement("i");
      beam.className = "sunbeam";
      skyEl.appendChild(beam);
      for (let i = 0; i < Math.round(3 * scale); i++) {
        skyEl.appendChild(span("cloud", { "--dur": `${70 + Math.random() * 50}s`, "--delay": `${-Math.random() * 70}s`, top: `${5 + Math.random() * 18}%`, left: `${Math.random() * 100}%` }));
      }
    } else if (curTheme === "clear-night") {
      const glow = document.createElement("i");
      glow.className = "moon-glow";
      skyEl.appendChild(glow);
      for (let i = 0; i < Math.round(SKY_STARS * scale); i++) {
        skyEl.appendChild(span("star", { "--dur": `${1.4 + Math.random() * 2.4}s`, "--delay": `${-Math.random() * 3}s`, top: `${Math.random() * 82}%`, left: `${Math.random() * 100}%` }));
      }
    } else if (curTheme === "hot-dust") {
      for (let i = 0; i < Math.round(SKY_MOTES * scale); i++) {
        skyEl.appendChild(span("mote", { "--dur": `${7 + Math.random() * 7}s`, "--delay": `${-Math.random() * 9}s`, left: `${Math.random() * 100}%` }));
      }
    }
  }

  /* وميض البرق + رعد متزامن — العاصفة فقط، وبحلقة هادئة عشوائية */
  function flashNow() {
    if (!skyEl || curTheme !== "storm") return;
    skyEl.classList.remove("flash");
    void skyEl.offsetWidth; /* إعادة تشغيل الأنيميشن */
    skyEl.classList.add("flash");
    setTimeout(() => skyEl && skyEl.classList.remove("flash"), 900);
    if (soundOn && !ecoOn()) {
      try { Sound.thunder(0.15 + Math.random() * 0.5); } catch (e) {}
    }
  }
  function scheduleStormLoop() {
    clearTimeout(stormTimer);
    if (curTheme !== "storm" || !motionOk() || document.hidden) return;
    stormTimer = setTimeout(() => {
      try { flashNow(); } catch (e) {}
      scheduleStormLoop();
    }, 5600 + Math.random() * 8200);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(stormTimer);
    else scheduleStormLoop();
  });
  REDUCED.addEventListener?.("change", () => { buildSky(); scheduleStormLoop(); });

  /* ══════════════════ ⑦ أيقونات SVG متحركة للبطل ══════════════════ */
  function animatedIcon(code, isDay) {
    const S = 2.2; /* سماكة الخط */
    const sunCore = `<circle class="halo" cx="32" cy="32" r="21" fill="rgb(255 223 138 / 30%)"/><circle cx="32" cy="32" r="11.5" fill="#ffd469"/>`;
    const rays = (() => {
      let r = `<g class="rays" stroke="#ffdf8a" stroke-width="${S}" stroke-linecap="round">`;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * i) / 4;
        const x1 = 32 + Math.cos(a) * 17.5, y1 = 32 + Math.sin(a) * 17.5;
        const x2 = 32 + Math.cos(a) * 24, y2 = 32 + Math.sin(a) * 24;
        r += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }
      return r + `</g>`;
    })();
    const cloudBack = `<path class="sway" d="M20 44a10.5 10.5 0 0 1 3.2-20.6 13.6 13.6 0 0 1 25.9 3.6A9.4 9.4 0 0 1 46 45.5H23a10 10 0 0 1-3-1.5Z" fill="rgb(255 255 255 / 92%)"/>`;
    const drops = `<g stroke="#9fdcff" stroke-width="3" stroke-linecap="round">
        <line class="wdrop" style="--delay:0s" x1="24" y1="50" x2="24" y2="54"/>
        <line class="wdrop" style="--delay:.45s" x1="33" y1="51" x2="33" y2="55"/>
        <line class="wdrop" style="--delay:.9s" x1="42" y1="50" x2="42" y2="54"/>
      </g>`;
    const moonPath = `<path d="M44 36A21 21 0 1 1 27.5 12.6 16.6 16.6 0 0 0 44 36Z" fill="#e9f1ff"/>`;
    const stars = `<g fill="#dfe9ff">
        <circle class="tw" style="--delay:0s" cx="47" cy="17" r="1.8"/>
        <circle class="tw" style="--delay:.6s" cx="52" cy="28" r="1.4"/>
        <circle class="tw" style="--delay:1.1s" cx="15" cy="20" r="1.5"/>
      </g>`;
    let body;
    if ([95, 96, 99].includes(code)) {
      body = `${cloudBack}<polygon class="boltf" points="31,44 40,44 33,52 38,52 28,62 32,54 27,54" fill="#ffe37a"/>${drops}`;
    } else if (code >= 51) {
      body = `${cloudBack}${drops}`;
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      body = `${cloudBack}<g fill="#eaf6ff">
        <circle class="flake" style="--delay:0s" cx="24" cy="52" r="2.2"/>
        <circle class="flake" style="--delay:.9s" cx="33" cy="53" r="2.2"/>
        <circle class="flake" style="--delay:1.8s" cx="42" cy="52" r="2.2"/>
      </g>`;
    } else if (code === 45 || code === 48) {
      body = `<g stroke="rgb(255 255 255 / 88%)" stroke-width="4" stroke-linecap="round">
        <line class="fogline" style="--delay:0s" x1="12" y1="22" x2="52" y2="22"/>
        <line class="fogline" style="--delay:.5s" x1="9" y1="31" x2="55" y2="31"/>
        <line class="fogline" style="--delay:1s" x1="13" y1="40" x2="51" y2="40"/>
        <line class="fogline" style="--delay:1.5s" x1="17" y1="49" x2="47" y2="49"/>
      </g>`;
    } else if (code === 0 || code === 1) {
      body = isDay ? `${sunCore}${rays}` : `${moonPath}${stars}`;
    } else if (code === 2) {
      body = isDay
        ? `<g transform="translate(9 -6) scale(0.72)">${sunCore}${rays}</g>${cloudBack}`
        : `<g transform="translate(6 -4) scale(0.6)">${moonPath}</g>${cloudBack}${stars}`;
    } else {
      body = `${cloudBack}`;
    }
    return `<svg class="v48-ico" viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  /* استبدال أيقونة البطل الثابتة بأيقونة متحركة كلما أعاد المحرك الرئيسي رسمها */
  let writingIcon = false;
  const heroIconEl = $q("#hero-icon");
  if (heroIconEl && "MutationObserver" in window) {
    const icoObs = new MutationObserver(() => {
      if (writingIcon) { writingIcon = false; return; }
      try {
        const wx = state.wx;
        if (!wx?.current) return;
        const code = wx.current.weather_code ?? 0;
        const isDay = (wx.current.is_day ?? 1) === 1;
        if (heroIconEl.querySelector(".v48-ico")) {
          /* أيقونة v48 قائمة — نحدّث النوع فقط إن تغيّر الجو */
          const next = animatedIcon(code, isDay);
          if (heroIconEl.firstElementChild?.outerHTML !== next) {
            writingIcon = true;
            heroIconEl.innerHTML = next;
          }
          return;
        }
        writingIcon = true;
        heroIconEl.innerHTML = animatedIcon(code, isDay);
      } catch (e) {}
    });
    icoObs.observe(heroIconEl, { childList: true });
  }

  /* ══════════════════ ④ البطل السينمائي: عدّ تصاعدي + Parallax + شريط ثابت ══════════════════ */
  const AR_DIGITS = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9" };
  function parseShown(text) {
    const t = String(text).replace(/[٠-٩]/g, (d) => AR_DIGITS[d] ?? d);
    const m = t.match(/-?\d+(?:[.,]\d+)?/);
    if (!m) return null;
    const dec = (m[0].split(/[.,]/)[1] || "").length;
    return { v: parseFloat(m[0].replace(",", ".")), dec, pre: t.slice(0, m.index), post: t.slice(m.index + m[0].length) };
  }
  const tempEl = $q("#hero-temp");
  let lastTempNum = null;
  let tempAnim = 0;
  if (tempEl && "MutationObserver" in window) {
    let writingTemp = false;
    const tempObs = new MutationObserver(() => {
      if (writingTemp) { writingTemp = false; return; }
      try {
        const target = parseShown(tempEl.textContent);
        if (!target) { lastTempNum = null; return; }
        if (!motionOk() || document.hidden || lastTempNum == null) { lastTempNum = target.v; return; }
        const from = lastTempNum, to = target.v;
        if (Math.abs(to - from) < 0.01) { lastTempNum = to; return; }
        lastTempNum = to;
        cancelAnimationFrame(tempAnim);
        const t0 = performance.now(), DUR = 520;
        const tick = (now) => {
          const p = clampN((now - t0) / DUR, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = from + (to - from) * eased;
          writingTemp = true;
          tempEl.textContent = `${target.pre}${(typeof localNum === "function" ? localNum(val, target.dec) : val.toFixed(target.dec))}${target.post}`;
          if (p < 1) tempAnim = requestAnimationFrame(tick);
          else setTimeout(() => { writingTemp = false; }, 30);
        };
        tempAnim = requestAnimationFrame(tick);
      } catch (e) {}
    });
    tempObs.observe(tempEl, { childList: true, characterData: true, subtree: true });
  }

  /* الشريط الزجاجي الثابت (Sticky Header) */
  let stickyEl = null;
  function ensureSticky() {
    if (stickyEl) return stickyEl;
    stickyEl = document.createElement("div");
    stickyEl.className = "v48-sticky";
    stickyEl.id = "v48-sticky";
    stickyEl.title = tr("اقفز إلى أعلى لوحة القيادة");
    stickyEl.setAttribute("role", "button");
    stickyEl.setAttribute("tabindex", "0");
    stickyEl.innerHTML = `<span class="vs-ico" aria-hidden="true"></span><b class="vs-city"></b><span class="vs-temp"></span>`;
    stickyEl.addEventListener("click", () => window.scrollTo({ top: 0, behavior: motionOk() ? "smooth" : "auto" }));
    stickyEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stickyEl.click(); } });
    document.body.appendChild(stickyEl);
    return stickyEl;
  }
  function updateSticky() {
    const s = ensureSticky();
    const wx = state.wx;
    const dashVisible = !$q("#dash-content")?.classList.contains("hidden");
    if (!wx || !state.place || !dashVisible) { s.classList.remove("is-on"); return; }
    const cur = wx.current || {};
    const city = state.place.name || tr("الموقع المحدد");
    const temp = tempEl ? tempEl.textContent : tempText(cur.temperature_2m);
    const cityEl = s.querySelector(".vs-city");
    const tempElS = s.querySelector(".vs-temp");
    if (cityEl.textContent !== city) cityEl.textContent = city;
    if (tempElS.textContent !== temp) tempElS.textContent = temp;
    const icoBox = s.querySelector(".vs-ico");
    /* v70 — C-01: أيقونة الشريط الثابت بقاعدة السحب الموحدة، والمفتاح يشمل السحب */
    const stickKey = `${cur.weather_code}-${cur.is_day}-${cur.cloud_cover}`;
    if (typeof wmoSvg === "function" && icoBox.dataset.k !== stickKey) {
      icoBox.dataset.k = stickKey;
      icoBox.innerHTML = wmoSvg(cloudFixCode(cur.weather_code ?? 0, cur.cloud_cover), cur.is_day ?? 1, 14);
    }
    const show = window.scrollY > 240;
    s.classList.toggle("is-on", show);
  }

  /* Parallax: تقلص رقم الحرارة تدريجيًا مع السحب للأسفل */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const dashVisible = !$q("#dash-content")?.classList.contains("hidden");
      const hero = $q("#dash-content .hero");
      if (!dashVisible || !hero) { stickyEl?.classList.remove("is-on"); return; }
      const y = window.scrollY;
      if (motionOk()) {
        const scale = clampN(1 - y / 950, 0.62, 1);
        hero.querySelector(".current-temp")?.style.setProperty("transform", `scale(${scale.toFixed(3)})`);
        hero.classList.toggle("is-shrunk", y > 210);
      } else {
        hero.querySelector(".current-temp")?.style.removeProperty("transform");
        hero.classList.remove("is-shrunk");
      }
      updateSticky();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ══════════════════ ⑤ المؤشرات الحية ══════════════════ */
  function minutesOfDay(iso) { return minutesOf(iso); }
  function aqiLevel(a) {
    if (a == null) return tr("لا توجد بيانات");
    if (a <= 50) return tr("جيد");
    if (a <= 100) return tr("متوسط");
    if (a <= 150) return tr("غير صحي للحساسين");
    if (a <= 200) return tr("غير صحي");
    if (a <= 300) return tr("غير صحي جدًا");
    return tr("خطير");
  }
  function ensureGauges() {
    if ($q("#v48-gauges")) return $q("#v48-gauges");
    const heroSec = $q("#dash-content section.hero");
    if (!heroSec) return null;
    const sec = document.createElement("section");
    sec.className = "card section v48-gauges";
    sec.id = "v48-gauges";
    sec.innerHTML = `
      <div class="sec-head">
        <div>
          <h2 data-i18n="مؤشرات حية">مؤشرات حية</h2>
          <p class="hint" data-i18n="قوس الشمس والقمر، بوصلة الرياح، وشرائط جودة الهواء والأشعة تتحرك مع القراءة الفعلية">قوس الشمس والقمر، بوصلة الرياح، وشرائط جودة الهواء والأشعة تتحرك مع القراءة الفعلية</p>
        </div>
        <span class="sec-badge" id="g48-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M4.9 19.1l2.1-2.1m10-10 2.1-2.1"/></svg> <span data-i18n="مباشر">مباشر</span></span>
      </div>
      <div class="g-grid">
        <div class="v48-gauge-card" id="g48-sun">
          <h3>☀️ <span data-i18n="قوس الشمس والقمر">قوس الشمس والقمر</span></h3>
          <div class="g-arc-wrap"><svg viewBox="0 0 220 122" role="img" id="g48-arc-svg"></svg></div>
          <div class="g-arc-times"><span id="g48-sr">—</span><b class="g-val" id="g48-arc-state">—</b><span id="g48-ss">—</span></div>
        </div>
        <div class="v48-gauge-card" id="g48-wind">
          <h3>🧭 <span data-i18n="بوصلة الرياح">بوصلة الرياح</span></h3>
          <div class="g-compass-wrap"><svg viewBox="0 0 132 132" role="img" id="g48-compass-svg"></svg></div>
          <span class="g-val" id="g48-wind-val">—</span>
          <span class="g-sub" id="g48-wind-sub">—</span>
        </div>
        <div class="v48-gauge-card" id="g48-air">
          <h3>🌫 <span data-i18n="جودة الهواء الآن">جودة الهواء الآن</span></h3>
          <div class="g-spec">
            <div class="spec-row">
              <span class="spec-head"><span>AQI</span><b id="g48-aqi-val">—</b></span>
              <div class="spec-bar"><i class="spec-dot" id="g48-aqi-dot" style="inset-inline-start:0%"></i></div>
              <span class="g-sub" id="g48-aqi-word">—</span>
            </div>
            <div class="spec-row">
              <span class="spec-head"><span data-i18n="الأشعة الآن">الأشعة الآن</span><b id="g48-uv-val">—</b></span>
              <div class="spec-bar"><i class="spec-dot" id="g48-uv-dot" style="inset-inline-start:0%"></i></div>
              <span class="g-sub" id="g48-uv-word">—</span>
            </div>
          </div>
        </div>
      </div>`;
    heroSec.insertAdjacentElement("afterend", sec);
    return sec;
  }

  function renderArc() {
    const wx = state.wx;
    const svg = $q("#g48-arc-svg");
    if (!svg || !wx?.daily?.sunrise?.[0] || !wx.daily?.sunset?.[0]) {
      if (svg) svg.innerHTML = `<text x="110" y="66" text-anchor="middle" style="fill:var(--muted);font-size:11px">${esc(tr("لا توجد بيانات"))}</text>`;
      return;
    }
    const h = wx.hourly;
    const nowIdx = (typeof hourIndexAtPlace === "function" && h?.time) ? hourIndexAtPlace(wx) : 0;
    const nowMin = minutesOfDay(h?.time?.[nowIdx]);
    const srMin = minutesOfDay(wx.daily.sunrise[0]);
    const ssMin = minutesOfDay(wx.daily.sunset[0]);
    const srT = wx.daily.sunrise[0] ? placeClock(wx.daily.sunrise[0]) : "—";
    const ssT = wx.daily.sunset[0] ? placeClock(wx.daily.sunset[0]) : "—";
    const isDayNow = (wx.current?.is_day ?? 1) === 1;
    let frac = 0.5, night = false;
    if (nowMin != null && srMin != null && ssMin != null) {
      if (isDayNow && nowMin >= srMin && nowMin <= ssMin) frac = (nowMin - srMin) / Math.max(1, ssMin - srMin);
      else {
        night = true;
        const srNext = minutesOfDay(wx.daily.sunrise?.[1]) ?? srMin;
        const len = (srNext <= ssMin ? srNext + 1440 : srNext) - ssMin;
        const pos = nowMin < srMin ? nowMin + 1440 - ssMin : nowMin - ssMin;
        frac = clampN(pos / Math.max(1, len), 0, 1);
      }
    }
    frac = clampN(frac, 0, 1);
    const R = 88, CX = 110, CY = 104;
    const ang = Math.PI * (1 - frac);
    const dx = CX - R * Math.cos(ang), dy = CY - R * Math.sin(ang);
    const dotFill = night ? "#cfe0ff" : "#ffd469";
    svg.innerHTML = `
      <line x1="8" y1="${CY}" x2="212" y2="${CY}" stroke="var(--line)" stroke-width="2"/>
      <path d="M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}" fill="none" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>
      <path d="M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}" fill="none" stroke="${night ? "#8fb6ff" : "var(--accent)"}" stroke-width="4" stroke-linecap="round" pathLength="100" style="stroke-dasharray:${(frac * 100).toFixed(1)} ${(100 - frac * 100).toFixed(1)};opacity:.9"/>
      ${night ? `<circle cx="${CX + R * 0.62}" cy="${CY - R * 0.55}" r="2" fill="#dfe9ff" opacity=".8"/><circle cx="${CX - R * 0.5}" cy="${CY - R * 0.72}" r="1.6" fill="#dfe9ff" opacity=".6"/>` : `<circle cx="${CX}" cy="${CY - R - 8}" r="6" fill="#ffd469" opacity=".85"/>`}
      <circle class="g-arc-dot" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="11" fill="${dotFill}" opacity=".28"/>
      <circle class="g-arc-dot" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="6.5" fill="${dotFill}" stroke="rgb(255 255 255 / 85%)" stroke-width="2"/>
      <text x="24" y="118" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:700">${esc(night ? tr("الغروب") : tr("الشروق"))} ${esc(night ? ssT : srT)}</text>
      <text x="196" y="118" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:700">${night ? esc(tr("الشروق")) + " " + esc(srT) : ""}</text>`;
    const stateEl = $q("#g48-arc-state");
    if (stateEl) stateEl.textContent = night ? tr("قوس الليل") : `${localNum(Math.round(frac * 100))}٪`;
    const srEl = $q("#g48-sr"), ssEl = $q("#g48-ss");
    if (srEl) srEl.textContent = `${tr("الشروق")} ${srT}`;
    if (ssEl) ssEl.textContent = `${tr("الغروب")} ${ssT}`;
  }

  function renderCompass() {
    const wx = state.wx;
    const svg = $q("#g48-compass-svg");
    if (!svg || !wx?.current) return;
    const cur = wx.current;
    const nowIdx = (typeof hourIndexAtPlace === "function" && wx.hourly?.time) ? hourIndexAtPlace(wx) : 0;
    const dir = cur.wind_direction_10m ?? wx.hourly?.wind_direction_10m?.[nowIdx];
    const speed = cur.wind_speed_10m ?? wx.hourly?.wind_speed_10m?.[nowIdx];
    const gust = cur.wind_gusts_10m ?? wx.hourly?.wind_gusts_10m?.[nowIdx];
    const L = {
      n: tr("شمال"), e: tr("شرق"), s: tr("جنوب"), w: tr("غرب"),
    };
    let ticks = "";
    for (let i = 0; i < 24; i++) {
      const a = (Math.PI * 2 * i) / 24;
      const major = i % 6 === 0;
      const r1 = major ? 44 : 49, r2 = 53;
      ticks += `<line x1="${(66 + Math.sin(a) * r1).toFixed(1)}" y1="${(66 - Math.cos(a) * r1).toFixed(1)}" x2="${(66 + Math.sin(a) * r2).toFixed(1)}" y2="${(66 - Math.cos(a) * r2).toFixed(1)}" stroke="var(--line)" stroke-width="${major ? 2.4 : 1.2}"/>`;
    }
    svg.innerHTML = `
      ${ticks}
      <text x="66" y="14" text-anchor="middle" style="fill:var(--muted);font-size:9px;font-weight:800">${esc(L.n)}</text>
      <text x="124" y="69" text-anchor="middle" style="fill:var(--muted);font-size:9px;font-weight:800">${esc(L.e)}</text>
      <text x="66" y="128" text-anchor="middle" style="fill:var(--muted);font-size:9px;font-weight:800">${esc(L.s)}</text>
      <text x="8" y="69" text-anchor="middle" style="fill:var(--muted);font-size:9px;font-weight:800">${esc(L.w)}</text>
      <g class="g-arrow" id="g48-arrow" style="transform-origin:66px 66px">
        <polygon points="66,20 72,70 66,63 60,70" fill="var(--accent)" stroke="none"/>
        <circle cx="66" cy="66" r="5" fill="var(--accent)"/>
        <circle cx="66" cy="66" r="1.8" fill="var(--card-bg)"/>
      </g>`;
    if (dir != null) {
      /* السهم يشير إلى الجهة التي تهبّ نحوها الرياح (الاتجاه المرجعي +180°) */
      const arrow = svg.querySelector("#g48-arrow");
      if (arrow) arrow.style.transform = `rotate(${(dir + 180) % 360}deg)`;
    }
    const val = $q("#g48-wind-val"), sub = $q("#g48-wind-sub");
    if (val) val.textContent = dir != null ? `${(typeof windDirName === "function" ? windDirName(dir) : "—")}` : tr("لا توجد بيانات");
    if (sub) sub.textContent = `${localNum(speed ?? 0)} ${tr("كم/س")}${gust != null ? ` · ${tf("هبّات {v}", { v: localNum(gust) })}` : ""}`;
  }

  function renderBars() {
    const wx = state.wx;
    if (!wx) return;
    const aqi = state.air?.current?.us_aqi ?? null;
    const aqiDot = $q("#g48-aqi-dot"), aqiVal = $q("#g48-aqi-val"), aqiWordEl = $q("#g48-aqi-word");
    if (aqiDot) aqiDot.style.setProperty("inset-inline-start", `${clampN((aqi ?? 0) / 200, 0, 1) * 100}%`);
    if (aqiVal) aqiVal.textContent = aqi != null ? `${localNum(aqi)}` : "—";
    if (aqiWordEl) aqiWordEl.textContent = aqiLevel(aqi);
    const nowIdx = (typeof hourIndexAtPlace === "function" && wx.hourly?.time) ? hourIndexAtPlace(wx) : 0;
    const uv = wx.hourly?.uv_index?.[nowIdx] ?? wx.daily?.uv_index_max?.[0] ?? null;
    const uvDot = $q("#g48-uv-dot"), uvVal = $q("#g48-uv-val"), uvWordEl = $q("#g48-uv-word");
    if (uvDot) uvDot.style.setProperty("inset-inline-start", `${clampN((uv ?? 0) / 11, 0, 1) * 100}%`);
    if (uvVal) uvVal.textContent = uv != null ? `${localNum(uv, 1)}` : "—";
    if (uvWordEl) uvWordEl.textContent = typeof uvLabel === "function" && uv != null ? uvLabel(uv) : tr("لا توجد بيانات");
  }

  function renderGauges() {
    ensureGauges();
    try { renderArc(); renderCompass(); renderBars(); } catch (e) {}
  }

  /* ══════════════════ محرك الأصوات (Web Audio API — صفر بايت ملفات) ══════════════════ */
  const Sound = (() => {
    let ctx = null, master = null, rainG = null, windG = null, birdG = null, built = false;
    /* v56: حلقتا الأجواء الصافية — زقزقة العصافير النهارية وصراصير الليل الناعمة */
    let birdTimer = 0, cricketTimer = 0, clearOn = false, nightOn = false;
    const BASE = 0.85;
    function noiseBuffer(seconds) {
      const len = Math.floor(ctx.sampleRate * seconds);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + 0.029 * w; b1 = 0.985 * b1 + 0.032 * w; b2 = 0.95 * b2 + 0.048 * w;
        d[i] = (b0 + b1 + b2 + w * 0.05) * 0.55;
      }
      return buf;
    }
    function ensure() {
      if (built) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        const buf = noiseBuffer(4);
        /* طبقة المطر: ضجيج → highpass → lowpass → gain */
        const rSrc = ctx.createBufferSource(); rSrc.buffer = buf; rSrc.loop = true;
        const rHP = ctx.createBiquadFilter(); rHP.type = "highpass"; rHP.frequency.value = 520;
        const rLP = ctx.createBiquadFilter(); rLP.type = "lowpass"; rLP.frequency.value = 2500; rLP.Q.value = 0.4;
        rainG = ctx.createGain(); rainG.gain.value = 0;
        rSrc.connect(rHP); rHP.connect(rLP); rLP.connect(rainG); rainG.connect(master);
        rSrc.start();
        /* طبقة الرياح: ضجيج أبطأ → lowpass متمايل بـ LFO → gain */
        const wSrc = ctx.createBufferSource(); wSrc.buffer = buf; wSrc.loop = true; wSrc.playbackRate.value = 0.6;
        const wLP = ctx.createBiquadFilter(); wLP.type = "lowpass"; wLP.frequency.value = 360; wLP.Q.value = 0.7;
        windG = ctx.createGain(); windG.gain.value = 0;
        wSrc.connect(wLP); wLP.connect(windG); windG.connect(master);
        wSrc.start();
        const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.09;
        const lfoG = ctx.createGain(); lfoG.gain.value = 150;
        lfo.connect(lfoG); lfoG.connect(wLP.frequency); lfo.start();
        const lfo2 = ctx.createOscillator(); lfo2.type = "sine"; lfo2.frequency.value = 0.05;
        const lfo2G = ctx.createGain(); lfo2G.gain.value = 0.16;
        lfo2.connect(lfo2G); lfo2G.connect(windG.gain); lfo2.start();
        /* v55: ناقل الزقزقة — نغمات العصافير مولّدة لحظيًا وتجري عبره إلى المخرج الرئيسي */
        birdG = ctx.createGain(); birdG.gain.value = 0; birdG.connect(master);
        built = true;
        return true;
      } catch (e) { built = false; return false; }
    }
    function setMix(rain01, wind01) {
      if (!built) return;
      const now = ctx.currentTime;
      rainG.gain.cancelScheduledValues(now);
      rainG.gain.setTargetAtTime(clampN(rain01, 0, 1) * 0.42, now, 0.6);
      windG.gain.cancelScheduledValues(now);
      windG.gain.setTargetAtTime(clampN(wind01, 0, 1) * 0.30, now, 0.6);
    }
    function fade(on, fast) {
      if (!built) return;
      if (!on) { clearOn = false; nightOn = false; clearTimeout(birdTimer); clearTimeout(cricketTimer); } /* v56: الإيقاف ينهي حلقتي الزقزقة والصراصير فورًا */
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(on ? BASE : 0.0001, now, on ? 0.55 : (fast ? 0.12 : 0.75));
      if (on) ctx.resume().catch(() => {});
      else setTimeout(() => { try { if (master.gain.value < 0.02) ctx.suspend(); } catch (e) {} }, fast ? 500 : 2400);
    }
    /* دوي رعد عميق: دفعة ضجيج بمرشح lowpass منحدر وغلاف انحلالي */
    function thunder(delayS) {
      if (!built || !master) return;
      try {
        const t0 = ctx.currentTime + (delayS || 0.2);
        const dur = 2.7;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          const p = i / d.length;
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 2.1) * (0.6 + 0.4 * Math.sin(p * 34));
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
        lp.frequency.setValueAtTime(170, t0);
        lp.frequency.exponentialRampToValueAtTime(58, t0 + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.95, t0 + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        src.connect(lp); lp.connect(g); g.connect(master);
        src.start(t0);
      } catch (e) {}
    }
    /* ══ v56: زقزقة عصافير غنية واضحة (Rich Multi-note FM Bird Chirps) ══
       صفر ملفات صوتية: زقزقة ثنائية وثلاثية النغمات (2–3 مقاطع) بترددات FM
       حية (2.2–3.6 كيلوهرتز) مع نغمة مصاحبة علوية (Overtone) وتذبذب Vibrato
       وأغلفة انحلالية ناعمة ومزج ستيريو — تتكرر بنعومة كل 2.5–5 ثوانٍ */
    function chirp() {
      if (!built || !clearOn || !birdG) return;
      try {
        const t0 = ctx.currentTime + 0.02;
        const notes = 2 + Math.floor(Math.random() * 2); /* زقزقة ثنائية أو ثلاثية النغمات */
        let t = t0;
        for (let i = 0; i < notes; i += 1) {
          const dur = 0.075 + Math.random() * 0.1;
          const f0 = 2200 + Math.random() * 1400;
          const f1 = f0 * (0.74 + Math.random() * 0.6);
          /* النغمة الأساسية FM */
          const osc = ctx.createOscillator(); osc.type = "sine";
          osc.frequency.setValueAtTime(f0, t);
          osc.frequency.exponentialRampToValueAtTime(Math.max(600, f1), t + dur);
          /* تعديل ترددي يمنح الزقزقة حيويتها الطبيعية */
          const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = 38 + Math.random() * 52;
          const modG = ctx.createGain(); modG.gain.value = 150 + Math.random() * 210;
          mod.connect(modG); modG.connect(osc.frequency);
          /* v56: نغمة علوية مصاحبة (Overtone) تُصفّي الصوت وتجمّله — زقزقة أوضح وأجمل */
          const ov = ctx.createOscillator(); ov.type = "sine";
          ov.frequency.setValueAtTime(f0 * 2.02, t);
          ov.frequency.exponentialRampToValueAtTime(Math.max(900, f1 * 2.02), t + dur);
          const ovG = ctx.createGain();
          ovG.gain.setValueAtTime(0.0001, t);
          ovG.gain.exponentialRampToValueAtTime(0.035 + Math.random() * 0.025, t + 0.02);
          ovG.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          ov.connect(ovG);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.15 + Math.random() * 0.12, t + 0.018);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(g);
          if (ctx.createStereoPanner) {
            const pan = ctx.createStereoPanner();
            pan.pan.value = Math.random() * 1.6 - 0.8;
            g.connect(pan); ovG.connect(pan); pan.connect(birdG);
          } else { g.connect(birdG); ovG.connect(birdG); }
          osc.start(t); osc.stop(t + dur + 0.02);
          mod.start(t); mod.stop(t + dur + 0.02);
          ov.start(t); ov.stop(t + dur + 0.02);
          t += dur + 0.05 + Math.random() * 0.09;
        }
      } catch (e) {}
    }
    function scheduleChirps() {
      clearTimeout(birdTimer);
      if (!built || !clearOn) return;
      birdTimer = setTimeout(() => {
        if (clearOn && !document.hidden && !ecoOn()) chirp();
        scheduleChirps();
      }, 2500 + Math.random() * 2500); /* v56: كل 2.5–5 ثوانٍ بنعومة */
    }
    /* ══ v56: صراصير الليل الناعمة (Soft Night Crickets Chirp) ══
       نغمات عالية التردد (4.1–4.9 كيلوهرتز) خافتة ومتقطعة: نبضات قصيرة جدًا
       (3–6 نبضات لكل burst) بفواصل طبيعية — تعطي إحساسًا واقعيًا بسكون الليل */
    function cricket() {
      if (!built || !nightOn || !birdG) return;
      try {
        const t0 = ctx.currentTime + 0.03;
        const pulses = 3 + Math.floor(Math.random() * 4);
        const base = 4100 + Math.random() * 800;
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) { pan.pan.value = Math.random() * 1.2 - 0.6; pan.connect(birdG); }
        let t = t0;
        for (let i = 0; i < pulses; i += 1) {
          const dur = 0.016 + Math.random() * 0.02;
          const osc = ctx.createOscillator(); osc.type = "sine";
          osc.frequency.setValueAtTime(base * (0.98 + Math.random() * 0.04), t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.022 + Math.random() * 0.02, t + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(g);
          g.connect(pan || birdG);
          osc.start(t); osc.stop(t + dur + 0.01);
          t += dur + 0.032 + Math.random() * 0.05;
        }
      } catch (e) {}
    }
    function scheduleCrickets() {
      clearTimeout(cricketTimer);
      if (!built || !nightOn) return;
      cricketTimer = setTimeout(() => {
        if (nightOn && !document.hidden && !ecoOn()) cricket();
        scheduleCrickets();
      }, 1400 + Math.random() * 1600); /* متقطع: كل 1.4–3 ثوانٍ */
    }
    /* ══ v56: أجواء الصافي — نهار صافٍ ومشمس (code ≤ 2): زقزقة غنية ثنائية/ثلاثية
       النغمات مع نسيم خفيف مستمر؛ ليل صافٍ: نسيم ليلي هادئ مدمج مع صراصير الليل
       الناعمة المتقطعة — بلا مطر ولا رياح عاتية ══ */
    function setClear(on, night) {
      clearOn = !!on && !night;   /* الزقزقة نهارًا حصرًا */
      nightOn = !!on && !!night;  /* صراصير الليل ليلًا حصرًا */
      clearTimeout(birdTimer);
      clearTimeout(cricketTimer);
      if (built && birdG) birdG.gain.value = (clearOn || nightOn) ? 0.9 : 0;
      if (clearOn && built) scheduleChirps();
      if (nightOn && built) scheduleCrickets();
    }
    /* خفض تدريجي أثناء النشرة الصوتية ثم استعادة المستوى بعد انتهائها */
    function duck(down) {
      if (!built) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(down ? 0.10 : BASE, now, down ? 0.3 : 0.55);
    }
    return { ensure, setMix, fade, thunder, duck, setClear, get ready() { return built; } };
  })();

  function rainMix() {
    const wx = state.wx;
    if (!wx) return 0;
    const cur = wx.current || {};
    const nowIdx = (typeof hourIndexAtPlace === "function" && wx.hourly?.time) ? hourIndexAtPlace(wx) : 0;
    const mm = cur.precipitation ?? wx.hourly?.precipitation?.[nowIdx] ?? 0;
    const code = cur.weather_code ?? 0;
    let m = mm >= 2 ? 0.95 : mm >= 0.5 ? 0.62 : mm > 0 ? 0.38 : 0;
    if ([95, 96, 99].includes(code)) m = Math.max(m, 0.9);
    if ([80, 81, 82].includes(code)) m = Math.max(m, 0.7);
    if (code >= 51 && code <= 57) m = Math.max(m, 0.3);
    return m;
  }
  function windMix() {
    const wx = state.wx;
    const s = wx?.current?.wind_speed_10m ?? 0;
    return clampN(s / 42, 0, 1) * 0.85 + 0.12;
  }
  /* v56: أجواء الصافي — نهار مشمس/صافٍ (code ≤ 2 بلا مطر): زقزقة غنية + نسيم هواء
     خفيف مستمر؛ ليل صافٍ: نسيم ليلي هادئ مدمج مع صراصير الليل — وبقية الأجواء
     مطر ورعد ورياح كما هي */
  function clearSkyMix() {
    const wx = state.wx;
    if (!wx?.current) return null;
    const code = wx.current.weather_code ?? 0;
    if (code > 2) return null;
    if ((wx.current.precipitation ?? 0) > 0.05) return null;
    return { night: (wx.current.is_day ?? 1) === 0 };
  }
  function refreshMix() {
    if (!(soundOn && Sound.ready) || ecoOn()) { try { Sound.setClear(false, false); } catch (e) {} return; }
    const clear = clearSkyMix();
    if (clear) {
      Sound.setClear(true, clear.night);
      /* نسيم هواء خفيف مستمر نهارًا وليلًا — منخفض الصوت بلا مطر ولا رياح قوية */
      Sound.setMix(0, clear.night ? 0.11 : 0.16);
    } else {
      Sound.setClear(false, false);
      Sound.setMix(rainMix(), windMix());
    }
  }

  /* زر «صوت الجو» بجانب اسم المدينة */
  function ensureSoundBtn() {
    let btn = $q("#v48-snd");
    if (btn) return btn;
    const place = $q("#hero-place");
    if (!place) return null;
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "v48-snd";
    btn.className = "snd-btn";
    btn.setAttribute("aria-pressed", "false");
    btn.title = tr("أصوات الجو الحية — زقزقة ونسيم ومطر ورعد مولّدة برمجيًا دون أي ملفات صوتية");
    btn.innerHTML = `🔊 <span data-i18n="صوت الجو">صوت الجو</span>`;
    btn.addEventListener("click", toggleSound);
    place.insertAdjacentElement("afterend", btn);
    return btn;
  }
  function toggleSound() {
    const btn = ensureSoundBtn();
    if (!btn || ecoOn()) return;
    soundOn = !soundOn;
    btn.setAttribute("aria-pressed", String(soundOn));
    try { localStorage.setItem("matar:sound", soundOn ? "1" : "0"); } catch (e) {}
    if (soundOn) {
      if (Sound.ensure()) {
        Sound.fade(true);
        refreshMix();
      }
    } else {
      Sound.fade(false); /* خفض تدريجي Fade-out */
    }
  }
  /* استرجاع التفضيل المحفوظ: يبدأ المحرك فعليًا عند أول لمسة (سياسة المتصفحات) */
  function restoreSoundPref() {
    try { soundOn = localStorage.getItem("matar:sound") === "1"; } catch (e) { soundOn = false; }
    const btn = ensureSoundBtn();
    if (btn && soundOn) btn.setAttribute("aria-pressed", "true");
    if (soundOn) {
      const kick = () => {
        document.removeEventListener("pointerdown", kick, true);
        if (!soundOn || ecoOn()) return;
        if (Sound.ensure()) { Sound.fade(true); refreshMix(); }
      };
      document.addEventListener("pointerdown", kick, { capture: true, once: false });
      setTimeout(() => document.removeEventListener("pointerdown", kick, true), 60_000);
    }
  }

    /* v48: يتوقف صوت الجو تلقائيًا عند تشغيل أي نشرة صوتية (بدل الخفض المؤقت) */
  function ambientForceStop() {
    try {
      if (soundOn && Sound.ready) {
        soundOn = false;
        try { localStorage.setItem("matar:sound", "0"); } catch (err) {}
        const sndBtn = $q("#v48-snd");
        if (sndBtn) sndBtn.setAttribute("aria-pressed", "false");
        Sound.fade(false, true); /* Fade-out سريع */
      }
    } catch (e) {}
  }
  try {
    if (typeof speechSynthesis !== "undefined" && !speechSynthesis.__v48DuckWrapped) {
      const origSpeak = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = function (u) {
        try { ambientForceStop(); } catch (e) {}
        return origSpeak(u);
      };
      speechSynthesis.__v48DuckWrapped = true;
    }
  } catch (e) {}
  /* واجهة موصولة للمحرك المزدوج للنطق (v48b): إيقاف/فحص أصوات الجو برمجيًا */
  try {
    window.__matarAmb = {
      stop: () => ambientForceStop(),
      duck: (down) => { try { if (soundOn && Sound.ready) Sound.duck(down); } catch (e) {} },
      isOn: () => { try { return !!(soundOn && Sound.ready); } catch (e) { return false; } },
    };
  } catch (e) {}

  /* ══════════════════ ⑥ اللمس المرن: اهتزاز + ضغط البطاقات ══════════════════ */
  document.addEventListener("pointerdown", (e) => {
    const t = e.target.closest?.("button, a, summary, .tab, .fav-chip, .fb-btn, .vb-btn, [role='switch']");
    if (t && !ecoOn()) { try { navigator.vibrate?.(10); } catch (err) {} }
  }, { capture: true, passive: true });

  document.addEventListener("pointerdown", (e) => {
    const c = e.target.closest?.(".card, .detail-card, .today-box, .v48-gauge-card");
    if (!c || ecoOn() || REDUCED.matches) return;
    c.classList.add("v48-press");
    const release = () => c.classList.remove("v48-press");
    c.addEventListener("pointerup", release, { once: true });
    c.addEventListener("pointercancel", release, { once: true });
    c.addEventListener("pointerleave", release, { once: true });
  }, { capture: true, passive: true });

  /* ══════════════════ ⑧ التكامل مع الوضع الاقتصادي ══════════════════ */
  document.addEventListener("matar:eco", (e) => {
    const on = !!(e?.detail?.eco);
    clearTimeout(stormTimer);
    if (on) {
      soundOn = false;
      soundForced = true;
      const btn = ensureSoundBtn();
      if (btn) { btn.setAttribute("aria-pressed", "false"); btn.disabled = true; btn.title = tr("الصوت متوقف في الوضع الاقتصادي لتوفير البطارية"); }
      try { Sound.fade(false, true); } catch (err) {}
      buildSky();
    } else {
      soundForced = false;
      const btn = ensureSoundBtn();
      if (btn) { btn.disabled = false; btn.title = tr("أصوات الجو الحية — زقزقة ونسيم ومطر ورعد مولّدة برمجيًا دون أي ملفات صوتية"); }
      buildSky();
      scheduleStormLoop();
    }
  });

  /* ══════════════════ الأحداث والتهيئة ══════════════════ */
  document.addEventListener("matar:data", () => {
    applyThemeEngine();
    renderGauges();
    updateSticky();
    refreshMix();
    scheduleStormLoop();
  });
  document.addEventListener("matar:language", () => {
    renderGauges();
    updateSticky();
    const btn = ensureSoundBtn();
    if (btn && !soundForced) btn.title = tr("أصوات الجو الحية — زقزقة ونسيم ومطر ورعد مولّدة برمجيًا دون أي ملفات صوتية");
  });
  document.addEventListener("matar:theme", () => { applyThemeEngine(); buildSky(); });
  document.addEventListener("matar:place", () => { applyThemeEngine(); });
  /* تبديل الصفحات من شريط التنقل يخفي/يظهر الشريط الثابت فورًا */
  document.addEventListener("click", (e) => {
    if (e.target.closest?.(".tab, .topnav a, .topnav button")) setTimeout(updateSticky, 90);
  }, true);

  function wire() {
    restoreSoundPref();
    applyThemeEngine();
    renderGauges();
    updateSticky();
    /* قوس الشمس يتحرك بدقيقة التقويم + تجديد مزيج الصوت دوريًا */
    clearInterval(arcTimer);
    arcTimer = setInterval(() => {
      if (document.hidden || !state.wx) return;
      try { renderArc(); } catch (e) {}
    }, 60_000);
    setInterval(() => { if (state.wx && !document.hidden) refreshMix(); }, 5 * 60_000);
    /* لصق متأخر: بعض العناصر تُرسم عند وصول البيانات — نضمن الزر والشريط */
    setTimeout(() => { ensureSoundBtn(); updateSticky(); applyThemeEngine(); }, 1200);
    /* تغيّر مقاس الشاشة يعيد بناء كثافة الجزيئات */
    let rsTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(rsTimer);
      rsTimer = setTimeout(() => buildSky(), 400);
    });
  }

  wire();
  return { refreshAll: () => { applyThemeEngine(); renderGauges(); updateSticky(); refreshMix(); } };
})();

    

/* ═══════════════════ v49 — منظّم تسريع الأداء (تهيئة كسلو + إيقاف الأنيميشن خارج الشاشة) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 49: منظّم تسريع الأداء 60fps (Performance Orchestrator)
   ------------------------------------------------------------
   ① قصر الزجاجية: كلاس v49-perf يفعّل قواعد v49-style — blur(8px) للهيدر
      العلوي (.topnav) والبطاقة الرئيسية (.hero) والشريط الثابت حصرًا، وإزالة
      backdrop-filter من كل البطاقات الأخرى (خلفية شبه شفافة سريعة بلاها)
   ② إيقاف الأنيميشن خارج الشاشة: IntersectionObserver على البطل + عتبة
      تمرير داخل إطار requestAnimationFrame واحد لطبقة السماء الثابتة +
      visibilitychange + مراقب body[data-page] لتبديل صفحات التطبيق —
      كلاس v49-anim-off يخفي السماء ويتجمد أيقونات SVG عبر CSS
   ③ التهيئة الكسولة للتبويبات الثقيلة (خريطة Leaflet الكبرى MX.show، منحنيات
      المزارعين Agri.ensure، الشهرية Monthly.onShow، جوّك اليوم Joq.onShow)
      قائمة أصلًا عبر showPage — وv49 يؤجّل إضافةً الخريطة المصغرة والنماذج
      الممتدة والمدن المفضلة 800ms بعد ظهور البطاقة الرئيسية (في السكربت
      الرئيسي وسكربت v47)
   ④ تقلص الهيدر يعمل أصلًا بـ requestAnimationFrame مع { passive: true }
      منذ v48 — يُحفظ كما هو ويُضاف إليه فحص عتبة السماء داخل نفس الإطار
   توافق CSP: بلوك سكربت جديد — بصمته SHA-256 مضافة إلى script-src.
   ============================================================ */
(() => {
  const root = document.documentElement;
  try { root.classList.add("v49-perf"); } catch (e) {}

  /* ── ② إيقاف الأنيميشن خارج الشاشة ── */
  let heroVisible = null; /* null = البطل لم يُرسم بعد → عتبة التمرير تحكم */
  let animOff = false;
  const setOff = () => { if (!animOff) { animOff = true; try { root.classList.add("v49-anim-off"); } catch (e) {} } };
  const setOn = () => { if (animOff) { animOff = false; try { root.classList.remove("v49-anim-off"); } catch (e) {} } };

  function evaluate() {
    if (document.hidden) { setOff(); return; }
    /* صفحة غير لوحة القيادة → السماء خلف الخريطة/النصوص بلا قيمة بصرية */
    const page = (document.body?.dataset?.page) || "dashboard";
    if (page !== "dashboard") { setOff(); return; }
    /* البطل ظاهر؟ (عنصر داخل التدفق — المراقب يعمل بدقة) */
    if (heroVisible === false) { setOff(); return; }
    /* السماء خلفية ثابتة ملء الشاشة — نستخدم عتبة تمرير بدل التقاطع */
    if (window.scrollY > window.innerHeight * 1.6) { setOff(); return; }
    setOn();
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      heroVisible = entries.some((en) => en.isIntersecting);
      evaluate();
    }, { rootMargin: "140px 0px" });
    const attach = () => {
      const hero = document.querySelector("#dash-content section.hero") || document.querySelector("#hero-icon");
      if (hero) { try { io.observe(hero); } catch (e) {} return true; }
      return false;
    };
    if (!attach()) {
      /* البطل يُرسم بعد وصول البيانات — إعادة محاولة لطيفة ثم تتوقف */
      let tries = 0;
      const t = setInterval(() => { if (attach() || ++tries > 40) clearInterval(t); }, 250);
    }
    document.addEventListener("matar:data", () => setTimeout(evaluate, 200));
  }

  /* عتبة التمرير داخل إطار rAF واحد بلا قياس تخطيط متكرر (مرور passive) */
  let tick49 = false;
  window.addEventListener("scroll", () => {
    if (tick49) return;
    tick49 = true;
    requestAnimationFrame(() => { tick49 = false; evaluate(); });
  }, { passive: true });

  document.addEventListener("visibilitychange", evaluate);

  /* مراقب تبديل الصفحات: body[data-page] يتغير عند showPage فقط */
  if ("MutationObserver" in window && document.body) {
    try { new MutationObserver(evaluate).observe(document.body, { attributes: true, attributeFilter: ["data-page"] }); } catch (e) {}
  }

  /* البدء بعد أول إطارين كي لا يعترض الإقلاع إطلاقًا */
  requestAnimationFrame(() => requestAnimationFrame(evaluate));
})();
    

/* ═══════════════════ v51 — المركز الموسمي وجوّك اليوم (تقويم 30 يومًا + آلة الزمن + الأنشطة) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 51: الترقية الشاملة المزدوجة + صوت بلا تداخل نهائيًا
   ------------------------------------------------------------
   ① Zero-Overlap Audio (الطبقة التطبيقية): كل أزرار الاستماع الجديدة تمر
      عبر قفل الضغطة الزمني 400ms (مرسوم في v48b بمرحلة الالتقاط) وربط
      onclick الأحادي، والنطق عبر speechSynthesis المُغلَّف في v48b/v51
      (تفريغ 60ms + جلسات speechSessionId + بوابة سحابية 1.5 ثانية) فلا
      يُسمع صوتان معًا ولا تتداخل الجمل أبدًا.
   ② التوقعات الشهرية — Seasonal & Climate Hub:
      • تقويم 30 يومًا بنمط الخريطة الحرارية (تلوين حراري + شارة مطر ٪/مم)
      • بطاقة تفاصيل اليوم بأربعة فترات (🌅 صباح / ☀️ ظهيرة / 🌇 مساء / 🌙 ليل)
        — الأيام 1-16 من البيانات الساعية الدقيقة والأيام 17-30 مشتقة ذكاءً
        من العظمى والصغرى ومجموع الهطول اليومي
      • «توصية اليوم الذكية» مع زر استماع سريع
      • مؤشر «أفضل شهر للسفر» بدرجة من 100 + شارتا 🏆 الأفضل للزيارة و⚠️ طقس قاسٍ
      • آلة الزمن المناخي بمنتقي تاريخ — سجل 20 سنة: أعلى حرارة وأقل حرارة
        وأكثر عام ممطر في ذلك التاريخ مع منحنى بياني (ERA5 Archive)
      • توحيد بطاقات المستشار الموسمي المكررة في «المستشار الاستراتيجي الموسمي»
        واحدة تدعم الاستماع والمشاركة كصورة
   ③ جوّك اليوم — Personal Lifestyle Co-Pilot:
      • شريط الشخصيات الذكي (🌟 الكل | 🏃 رياضي | 🌊 بحر وصيد | 🚁 درون |
        🩺 صحة | 🏠 منزل) محفوظ في matar:state ويعيد ترتيب الأقسام
      • الرياضيين: حاسبة الترطيب (مل/ساعة من WBGT والرطوبة) + سرعة الجري
        + شريط 12 ساعة يبرز الساعات الخضراء المثالية للتمرين
      • البحر والصيد: نشاط الأسماك العلمي من 100٪ (ميل الضغط + طور القمر)
        + مؤشر صفاء المياه للسباحة + تنبيه التيارات الساحبة (Rip Current)
      • الدرونز: محدد النوع (Mini < 250g حد 28 كم/س مقابل Pro حد 42) + بطاقة
        فحص ما قبل الإقلاع (الرياح 10م/80م/120م + الرؤية + تكثف الندى)
      • الصحة: رادار الصداع النصفي (تغير الضغط 6/12 ساعة) + درع الحساسية
        (PM2.5/PM10) + حاسبة دقائق فيتامين د حسب UV
      • المنزل: مؤشر تهوية المنزل — أفضل ساعات فتح النوافذ من نقطة الندى
        وجودة الهواء
      • زر استماع (محرك الرجل العربي المنقّى) وزر مشاركة كصورة أعلى كل قسم
   ④ التحميل الكسول الصارم: كل بطاقات الصفحتين تُبنى وتُجلب بياناتها فقط
      عند فتح الصفحة، وكل جلب ثقيل (تفاصيل اليوم/آلة الزمن/فحص الإقلاع)
      لا يبدأ إلا بفعل المستخدم — حفاظًا على سرعة 60fps.
   ============================================================ */
(() => {
  /* الجسر من المحرك الرئيسي — إن غاب ننتظر إقلاعه (حتى 10 ثوانٍ) */
  let B = null;
  let tries0 = 0;
  const bootWait = () => {
    B = window.__matarBridge || null;
    if (B) start();
    else if (++tries0 < 80) setTimeout(bootWait, 125);
  };
  bootWait();

  function start() {
    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const { tr, tf, tx, isAr, localNum, escapeHtml, tempText, clamp, hourIndexAtPlace, wmoDesc } = B;
    const state = B.state;
    const HOOKS = window.__matarJoqHooks || {};

    /* ══ الترجمة: عناوين وشارات واجهة v51 باللغات السبع ══ */
    const L10N = {
      en: {
        "الكل": "All", "رياضي وعدّاء": "Athlete & runner", "بحر وصيد": "Sea & fishing",
        "طيار درون": "Drone pilot", "صحة وحساسية": "Health & allergies", "منزل وحياة يومية": "Home & daily life",
        "استماع": "Listen", "كصورة": "As image", "فلتر الفئات الذكي": "Smart persona filter",
        "الأفضل للزيارة": "Best to visit", "طقس قاسٍ": "Harsh weather", "ملاءمة السفر": "Travel fit",
        "تفاصيل اليوم": "Day breakdown", "مؤشر الأمطار الإجمالي": "Overall rain index",
        "الصباح": "Morning", "الظهيرة": "Midday", "المساء": "Evening", "الليل": "Night",
        "الحرارة": "Temp", "الإحساس الفعلي": "Feels like", "حالة السماء": "Sky", "احتمال المطر": "Rain chance",
        "الكمية": "Amount", "ذروة الحرارة": "Peak temp", "الأشعة فوق البنفسجية": "UV index", "الرياح": "Wind",
        "الرطوبة": "Humidity", "الصغرى": "Low", "نقطة الندى": "Dew point", "توصية اليوم الذكية": "Smart day tip",
        "إغلاق": "Close", "تقديري": "estimated", "بالنموذج الساعي الدقيق": "from hourly model",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Climate time machine — check any date across 20 years",
        "افحص هذا التاريخ": "Check this date", "أعلى حرارة قياسية": "Record high", "أقل حرارة قياسية": "Record low",
        "أكثر عام ممطر": "Wettest year", "المنحنى عبر عشرين سنة": "20-year curve",
        "المستشار الاستراتيجي الموسمي": "Strategic seasonal advisor", "موحّد": "Unified",
        "منزلك وحياتك اليومية": "Your home & daily life", "مؤشر تهوية المنزل": "Home ventilation index",
        "حاسبة الترطيب": "Hydration calculator", "سرعة الجري الآمنة": "Safe running pace",
        "شريط الساعات الخضراء — 12 ساعة": "Green-hours strip — next 12h",
        "نشاط الأسماك العلمي": "Scientific fish activity", "صفاء المياه للسباحة": "Water clarity for swimming",
        "تنبيه التيارات الساحبة": "Rip current alert", "نوع الدرون": "Drone type",
        "فحص ما قبل الإقلاع": "Pre-flight check", "رادار الصداع النصفي": "Migraine radar",
        "درع الحساسية والغبار": "Allergy & dust shield", "دقائق فيتامين د": "Vitamin D minutes",
        "ميل الضغط": "Pressure tendency", "طور القمر": "Moon phase",
        "درجتان صغيرتان": "Mini < 250g", "احترافي": "Pro", "الحد الآمن للرياح": "Safe wind limit",
        "مناسب لنوعك": "OK for your drone", "على الحد": "At the limit", "ممنوع لنوعك": "Not OK for your drone",
        "سنة": "yr", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/hour", "دقيقة": "min",
        "افتح النوافذ": "Open the windows", "أفضل نافذة تهوية": "Best ventilation window",
        "خلال": "within", "الأكثر": "Best", "الأسوأ": "Worst",
      },
      fr: {
        "الكل": "Tout", "رياضي وعدّاء": "Athlète & coureur", "بحر وصيد": "Mer & pêche",
        "طيار درون": "Pilote de drone", "صحة وحساسية": "Santé & allergies", "منزل وحياة يومية": "Maison & quotidien",
        "استماع": "Écouter", "كصورة": "En image", "فلتر الفئات الذكي": "Filtre intelligent de profils",
        "الأفضل للزيارة": "Meilleure à visiter", "طقس قاسٍ": "Météo rude", "ملاءمة السفر": "Aptitude voyage",
        "تفاصيل اليوم": "Détail de la journée", "مؤشر الأمطار الإجمالي": "Indice de pluie global",
        "الصباح": "Matin", "الظهيرة": "Midi", "المساء": "Soir", "الليل": "Nuit",
        "الحرارة": "Température", "الإحساس الفعلي": "Ressenti", "حالة السماء": "Ciel", "احتمال المطر": "Prob. de pluie",
        "الكمية": "Quantité", "ذروة الحرارة": "Pic de chaleur", "الأشعة فوق البنفسجية": "Indice UV", "الرياح": "Vent",
        "الرطوبة": "Humidité", "الصغرى": "Minimale", "نقطة الندى": "Point de rosée", "توصية اليوم الذكية": "Conseil intelligent du jour",
        "إغلاق": "Fermer", "تقديري": "estimé", "بالنموذج الساعي الدقيق": "du modèle horaire",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Machine climatique — tout jour sur 20 ans",
        "افحص هذا التاريخ": "Vérifier cette date", "أعلى حرارة قياسية": "Record de chaleur", "أقل حرارة قياسية": "Record de froid",
        "أكثر عام ممطر": "Année la plus arrosée", "المنحنى عبر عشرين سنة": "Courbe sur 20 ans",
        "المستشار الاستراتيجي الموسمي": "Conseiller saisonnier stratégique", "موحّد": "Unifié",
        "منزلك وحياتك اليومية": "Votre maison & quotidien", "مؤشر تهوية المنزل": "Indice de ventilation",
        "حاسبة الترطيب": "Calcul d’hydratation", "سرعة الجري الآمنة": "Allure de course sûre",
        "شريط الساعات الخضراء — 12 ساعة": "Bandes vertes — 12 prochaines heures",
        "نشاط الأسماك العلمي": "Activité scientifique des poissons", "صفاء المياه للسباحة": "Clarté de l’eau",
        "تنبيه التيارات الساحبة": "Alerte courants d’arrachement", "نوع الدرون": "Type de drone",
        "فحص ما قبل الإقلاع": "Contrôle prévol", "رادار الصداع النصفي": "Radar migraine",
        "درع الحساسية والغبار": "Bouclier allergies & poussière", "دقائق فيتامين د": "Minutes de vitamine D",
        "ميل الضغط": "Tendance de pression", "طور القمر": "Phase lunaire",
        "درجتان صغيرتان": "Mini < 250 g", "احترافي": "Pro", "الحد الآمن للرياح": "Limite de vent sûre",
        "مناسب لنوعك": "OK pour votre drone", "على الحد": "À la limite", "ممنوع لنوعك": "Interdit pour votre drone",
        "سنة": "an", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/heure", "دقيقة": "min",
        "افتح النوافذ": "Ouvrez les fenêtres", "أفضل نافذة تهوية": "Meilleure fenêtre de ventilation",
        "خلال": "dans", "الأكثر": "Meilleur", "الأسوأ": "Pire",
      },
      de: {
        "الكل": "Alle", "رياضي وعدّاء": "Sportler & Läufer", "بحر وصيد": "Meer & Angeln",
        "طيار درون": "Drohnenpilot", "صحة وحساسية": "Gesundheit & Allergien", "منزل وحياة يومية": "Zuhause & Alltag",
        "استماع": "Anhören", "كصورة": "Als Bild", "فلتر الفئات الذكي": "Smarter Profilverband",
        "الأفضل للزيارة": "Bestens zu besuchen", "طقس قاسٍ": "Rauwetter", "ملاءمة السفر": "Reiseeignung",
        "تفاصيل اليوم": "Tagesdetail", "مؤشر الأمطار الإجمالي": "Gesamtregenindex",
        "الصباح": "Morgen", "الظهيرة": "Mittag", "المساء": "Abend", "الليل": "Nacht",
        "الحرارة": "Temp.", "الإحساس الفعلي": "Gefühlt", "حالة السماء": "Himmel", "احتمال المطر": "Regenrisiko",
        "الكمية": "Menge", "ذروة الحرارة": "Höchstwert", "الأشعة فوق البنفسجية": "UV-Index", "الرياح": "Wind",
        "الرطوبة": "Luftfeuchte", "الصغرى": "Tiefstwert", "نقطة الندى": "Taupunkt", "توصية اليوم الذكية": "Smarter Tagestipp",
        "إغلاق": "Schließen", "تقديري": "geschätzt", "بالنموذج الساعي الدقيق": "aus dem Stundenmodell",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Klima-Zeimaschine — jeder Tag über 20 Jahre",
        "افحص هذا التاريخ": "Dieses Datum prüfen", "أعلى حرارة قياسية": "Hitzerekord", "أقل حرارة قياسية": "Kälterekord",
        "أكثر عام ممطر": "Regenreichstes Jahr", "المنحنى عبر عشرين سنة": "Kurve über 20 Jahre",
        "المستشار الاستراتيجي الموسمي": "Strategischer Saisonberater", "موحّد": "Vereint",
        "منزلك وحياتك اليومية": "Zuhause & Alltag", "مؤشر تهوية المنزل": "Lüftungsindex",
        "حاسبة الترطيب": "Trinkrechner", "سرعة الجري الآمنة": "Sicheres Lauftempo",
        "شريط الساعات الخضراء — 12 ساعة": "Grünstreifen — nächste 12 Std.",
        "نشاط الأسماك العلمي": "Wissenschaftlicher Fischaktivität", "صفاء المياه للسباحة": "Wasserklarheit",
        "تنبيه التيارات الساحبة": "Rip-Current-Warnung", "نوع الدرون": "Drohnentyp",
        "فحص ما قبل الإقلاع": "Pre-Flight-Check", "رادار الصداع النصفي": "Migräne-Radar",
        "درع الحساسية والغبار": "Allergie- & Staubschild", "دقائق فيتامين د": "Vitamin-D-Minuten",
        "ميل الضغط": "Drucktrend", "طور القمر": "Mondphase",
        "درجتان صغيرتان": "Mini < 250 g", "احترافي": "Pro", "الحد الآمن للرياح": "Sichere Windgrenze",
        "مناسب لنوعك": "OK für Ihren Drohn", "على الحد": "Grenzwertig", "ممنوع لنوعك": "Nicht OK für Ihren Typ",
        "سنة": "J.", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/Std.", "دقيقة": "Min.",
        "افتح النوافذ": "Fenster öffnen", "أفضل نافذة تهوية": "Bestes Lüftungsfenster",
        "خلال": "in", "الأكثر": "Beste", "الأسوأ": "Schlechteste",
      },
      es: {
        "الكل": "Todo", "رياضي وعدّاء": "Atleta y corredor", "بحر وصيد": "Mar y pesca",
        "طيار درون": "Piloto de dron", "صحة وحساسية": "Salud y alergias", "منزل وحياة يومية": "Hogar y vida diaria",
        "استماع": "Escuchar", "كصورة": "Como imagen", "فلتر الفئات الذكي": "Filtro inteligente de perfiles",
        "الأفضل للزيارة": "La mejor para visitar", "طقس قاسٍ": "Tiempo duro", "ملاءمة السفر": "Aptitud para viajar",
        "تفاصيل اليوم": "Detalle del día", "مؤشر الأمطار الإجمالي": "Índice de lluvia total",
        "الصباح": "Mañana", "الظهيرة": "Mediodía", "المساء": "Tarde", "الليل": "Noche",
        "الحرارة": "Temp.", "الإحساس الفعلي": "Sensación", "حالة السماء": "Cielo", "احتمال المطر": "Prob. de lluvia",
        "الكمية": "Cantidad", "ذروة الحرارة": "Pico de calor", "الأشعة فوق البنفسجية": "Índice UV", "الرياح": "Viento",
        "الرطوبة": "Humedad", "الصغرى": "Mínima", "نقطة الندى": "Punto de rocío", "توصية اليوم الذكية": "Consejo inteligente del día",
        "إغلاق": "Cerrar", "تقديري": "estimado", "بالنموذج الساعي الدقيق": "del modelo horario",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Máquina del tiempo climático — cualquier día en 20 años",
        "افحص هذا التاريخ": "Comprobar esta fecha", "أعلى حرارة قياسية": "Récord de calor", "أقل حرارة قياسية": "Récord de frío",
        "أكثر عام ممطر": "Año más lluvioso", "المنحنى عبر عشرين سنة": "Curva de 20 años",
        "المستشار الاستراتيجي الموسمي": "Asesor estacional estratégico", "موحّد": "Unificado",
        "منزلك وحياتك اليومية": "Tu hogar y vida diaria", "مؤشر تهوية المنزل": "Índice de ventilación",
        "حاسبة الترطيب": "Calculadora de hidratación", "سرعة الجري الآمنة": "Ritmo de carrera seguro",
        "شريط الساعات الخضراء — 12 ساعة": "Franja verde — próximas 12 h",
        "نشاط الأسماك العلمي": "Actividad científica de peces", "صفاء المياه للسباحة": "Claridad del agua",
        "تنبيه التيارات الساحبة": "Alerta de corrientes de resaca", "نوع الدرون": "Tipo de dron",
        "فحص ما قبل الإقلاع": "Chequeo prevuelo", "رادار الصداع النصفي": "Radar de migraña",
        "درع الحساسية والغبار": "Escudo de alergias y polvo", "دقائق فيتامين د": "Minutos de vitamina D",
        "ميل الضغط": "Tendencia de presión", "طور القمر": "Fase lunar",
        "درجتان صغيرتان": "Mini < 250 g", "احترافي": "Pro", "الحد الآمن للرياح": "Límite seguro de viento",
        "مناسب لنوعك": "Apto para tu dron", "على الحد": "Al límite", "ممنوع لنوعك": "No apto para tu dron",
        "سنة": "año", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/hora", "دقيقة": "min",
        "افتح النوافذ": "Abre las ventanas", "أفضل نافذة تهوية": "Mejor ventana de ventilación",
        "خلال": "en", "الأكثر": "Mejor", "الأسوأ": "Peor",
      },
      pt: {
        "الكل": "Tudo", "رياضي وعدّاء": "Atleta e corredor", "بحر وصيد": "Mar e pesca",
        "طيار درون": "Piloto de drone", "صحة وحساسية": "Saúde e alergias", "منزل وحياة يومية": "Casa e vida diária",
        "استماع": "Ouvir", "كصورة": "Como imagem", "فلتر الفئات الذكي": "Filtro inteligente de perfis",
        "الأفضل للزيارة": "Melhor para visitar", "طقس قاسٍ": "Tempo rigoroso", "ملاءمة السفر": "Aptidão para viagem",
        "تفاصيل اليوم": "Detalhe do dia", "مؤشر الأمطار الإجمالي": "Índice de chuva total",
        "الصباح": "Manhã", "الظهيرة": "Meio-dia", "المساء": "Tarde", "الليل": "Noite",
        "الحرارة": "Temp.", "الإحساس الفعلي": "Sensação", "حالة السماء": "Céu", "احتمال المطر": "Prob. de chuva",
        "الكمية": "Quantidade", "ذروة الحرارة": "Pico de calor", "الأشعة فوق البنفسجية": "Índice UV", "الرياح": "Vento",
        "الرطوبة": "Humidade", "الصغرى": "Mínima", "نقطة الندى": "Ponto de orvalho", "توصية اليوم الذكية": "Dica inteligente do dia",
        "إغلاق": "Fechar", "تقديري": "estimado", "بالنموذج الساعي الدقيق": "do modelo horário",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Máquina do tempo climático — qualquer dia em 20 anos",
        "افحص هذا التاريخ": "Verificar esta data", "أعلى حرارة قياسية": "Recorde de calor", "أقل حرارة قياسية": "Recorde de frio",
        "أكثر عام ممطر": "Ano mais chuvoso", "المنحنى عبر عشرين سنة": "Curva de 20 anos",
        "المستشار الاستراتيجي الموسمي": "Consultor sazonal estratégico", "موحّد": "Unificado",
        "منزلك وحياتك اليومية": "Sua casa e vida diária", "مؤشر تهوية المنزل": "Índice de ventilação",
        "حاسبة الترطيب": "Calculadora de hidratação", "سرعة الجري الآمنة": "Ritmo de corrida seguro",
        "شريط الساعات الخضراء — 12 ساعة": "Faixa verde — próximas 12 h",
        "نشاط الأسماك العلمي": "Atividade científica dos peixes", "صفاء المياه للسباحة": "Claridade da água",
        "تنبيه التيارات الساحبة": "Alerta de correntes de retorno", "نوع الدرون": "Tipo de drone",
        "فحص ما قبل الإقلاع": "Verificação pré-voo", "رادار الصداع النصفي": "Radar de enxaqueca",
        "درع الحساسية والغبار": "Escudo de alergias e poeira", "دقائق فيتامين د": "Minutos de vitamina D",
        "ميل الضغط": "Tendência de pressão", "طور القمر": "Fase lunar",
        "درجتان صغيرتان": "Mini < 250 g", "احترافي": "Pro", "الحد الآمن للرياح": "Limite seguro de vento",
        "مناسب لنوعك": "Adequado ao seu drone", "على الحد": "No limite", "ممنوع لنوعك": "Inadequado ao seu drone",
        "سنة": "ano", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/hora", "دقيقة": "min",
        "افتح النوافذ": "Abra as janelas", "أفضل نافذة تهوية": "Melhor janela de ventilação",
        "خلال": "em", "الأكثر": "Melhor", "الأسوأ": "Pior",
      },
      it: {
        "الكل": "Tutto", "رياضي وعدّاء": "Atleta e runner", "بحر وصيد": "Mare e pesca",
        "طيار درون": "Pilota di drone", "صحة وحساسية": "Salute e allergie", "منزل وحياة يومية": "Casa e vita quotidiana",
        "استماع": "Ascolta", "كصورة": "Come immagine", "فلتر الفئات الذكي": "Filtro intelligente dei profili",
        "الأفضل للزيارة": "La migliore da visitare", "طقس قاسٍ": "Meteo rigido", "ملاءمة السفر": "Idoneità ai viaggi",
        "تفاصيل اليوم": "Dettaglio del giorno", "مؤشر الأمطار الإجمالي": "Indice pioggia totale",
        "الصباح": "Mattina", "الظهيرة": "Mezzogiorno", "المساء": "Sera", "الليل": "Notte",
        "الحرارة": "Temp.", "الإحساس الفعلي": "Percepita", "حالة السماء": "Cielo", "احتمال المطر": "Prob. pioggia",
        "الكمية": "Quantità", "ذروة الحرارة": "Picco di calore", "الأشعة فوق البنفسجية": "Indice UV", "الرياح": "Vento",
        "الرطوبة": "Umidità", "الصغرى": "Minima", "نقطة الندى": "Punto di rugiada", "توصية اليوم الذكية": "Consiglio intelligente del giorno",
        "إغلاق": "Chiudi", "تقديري": "stimato", "بالنموذج الساعي الدقيق": "dal modello orario",
        "آلة الزمن المناخي — افحص أي يوم عبر 20 سنة": "Macchina del tempo climatica — ogni giorno su 20 anni",
        "افحص هذا التاريخ": "Verifica questa data", "أعلى حرارة قياسية": "Record di caldo", "أقل حرارة قياسية": "Record di freddo",
        "أكثر عام ممطر": "Anno più piovoso", "المنحنى عبر عشرين سنة": "Curva di 20 anni",
        "المستشار الاستراتيجي الموسمي": "Consulente stagionale strategico", "موحّد": "Unificato",
        "منزلك وحياتك اليومية": "Casa e vita quotidiana", "مؤشر تهوية المنزل": "Indice di ventilazione",
        "حاسبة الترطيب": "Calcolatore di idratazione", "سرعة الجري الآمنة": "Andatura di corsa sicura",
        "شريط الساعات الخضراء — 12 ساعة": "Fascia verde — prossime 12 h",
        "نشاط الأسماك العلمي": "Attività scientifica dei pesci", "صفاء المياه للسباحة": "Chiarezza dell’acqua",
        "تنبيه التيارات الساحبة": "Allerta correnti di risacca", "نوع الدرون": "Tipo di drone",
        "فحص ما قبل الإقلاع": "Controllo pre-volo", "رادار الصداع النصفي": "Radar emicrania",
        "درع الحساسية والغبار": "Scudo allergie e polvere", "دقائق فيتامين د": "Minuti di vitamina D",
        "ميل الضغط": "Tendenza di pressione", "طور القمر": "Fase lunare",
        "درجتان صغيرتان": "Mini < 250 g", "احترافي": "Pro", "الحد الآمن للرياح": "Limite sicuro del vento",
        "مناسب لنوعك": "Adatto al tuo drone", "على الحد": "Al limite", "ممنوع لنوعك": "Non adatto al tuo drone",
        "سنة": "anno", "مم": "mm", "كم/س": "km/h", "ملليلتر/ساعة": "ml/ora", "دقيقة": "min",
        "افتح النوافذ": "Apri le finestre", "أفضل نافذة تهوية": "Migliore finestra di ventilazione",
        "خلال": "entro", "الأكثر": "Migliore", "الأسوأ": "Peggiore",
      },
    };
    /* v54: نصوص جديدة بست لغات — زر تفاصيل اليوم وتسميات منتقي آلة الزمن */
    const L10N_V54 = {
      en: { "استمع لتفاصيل اليوم": "Listen to the day’s details", "اليوم": "Day", "الشهر": "Month", "اختر اليوم": "Pick the day", "اختر الشهر": "Pick the month", "سجل ERA5 عبر عشرين سنة": "20-year ERA5 archive", "أعلى · أقل · أكثر مطرًا": "High · Low · Wettest" },
      fr: { "استمع لتفاصيل اليوم": "Écouter les détails du jour", "اليوم": "Jour", "الشهر": "Mois", "اختر اليوم": "Choisir le jour", "اختر الشهر": "Choisir le mois", "سجل ERA5 عبر عشرين سنة": "Archives ERA5 sur vingt ans", "أعلى · أقل · أكثر مطرًا": "Max · Min · Plus pluvieux" },
      de: { "استمع لتفاصيل اليوم": "Tagesdetails anhören", "اليوم": "Tag", "الشهر": "Monat", "اختر اليوم": "Tag wählen", "اختر الشهر": "Monat wählen", "سجل ERA5 عبر عشرين سنة": "ERA5-Archiv über 20 Jahre", "أعلى · أقل · أكثر مطرًا": "Max · Min · Regnerischste" },
      es: { "استمع لتفاصيل اليوم": "Escuchar los detalles del día", "اليوم": "Día", "الشهر": "Mes", "اختر اليوم": "Elegir el día", "اختر الشهر": "Elegir el mes", "سجل ERA5 عبر عشرين سنة": "Archivo ERA5 de veinte años", "أعلى · أقل · أكثر مطرًا": "Máx · Mín · Más lluvioso" },
      pt: { "استمع لتفاصيل اليوم": "Ouvir os detalhes do dia", "اليوم": "Dia", "الشهر": "Mês", "اختر اليوم": "Escolher o dia", "اختر الشهر": "Escolher o mês", "سجل ERA5 عبر عشرين سنة": "Arquivo ERA5 de vinte anos", "أعلى · أقل · أكثر مطرًا": "Máx · Mín · Mais chuvoso" },
      it: { "استمع لتفاصيل اليوم": "Ascolta i dettagli del giorno", "اليوم": "Giorno", "الشهر": "Mese", "اختر اليوم": "Scegli il giorno", "اختر الشهر": "Scegli il mese", "سجل ERA5 عبر عشرين سنة": "Archivio ERA5 di vent’anni", "أعلى · أقل · أكثر مطرًا": "Max · Min · Più piovoso" },
    };
    Object.keys(L10N_V54).forEach((lg) => { try { Object.assign(L10N[lg] || (L10N[lg] = {}), L10N_V54[lg]); } catch (e) {} });
    /* v56: مسح الترجمة الشامل (100% Full Translation Sweep) — كل نصوص v51–v55
       التي بقيت بالعربية الثابتة تُربط الآن بقاموس اللغات السبع عبر I18N_EXTRA
       (يخدم tr/tx) وبقاموس L10N (يخدم T): شاشة التحميل، آلة الزمن المناخي،
       بطاقات تقويم الـ 30 يومًا والفترات الأربع، فلاتر جوّك اليوم، والزراعة الدقيقة */
    const L10N_V56 = {
      en: { "أعلى حرارة مسجلة": "Record high", "أبرد ليلة مسجلة": "Coldest night", "أكثر عام ممطر": "Wettest year", "المنحنى عبر عشرين سنة": "20-year curve" },
      fr: { "أعلى حرارة مسجلة": "Record de chaleur", "أبرد ليلة مسجلة": "Nuit la plus froide", "أكثر عام ممطر": "Année la plus arrosée", "المنحنى عبر عشرين سنة": "Courbe sur 20 ans" },
      de: { "أعلى حرارة مسجلة": "Höchstwert", "أبرد ليلة مسجلة": "Kälteste Nacht", "أكثر عام ممطر": "Regenreichstes Jahr", "المنحنى عبر عشرين سنة": "Kurve über 20 Jahre" },
      es: { "أعلى حرارة مسجلة": "Récord de calor", "أبرد ليلة مسجلة": "Noche más fría", "أكثر عام ممطر": "Año más lluvioso", "المنحنى عبر عشرين سنة": "Curva de 20 años" },
      pt: { "أعلى حرارة مسجلة": "Recorde de calor", "أبرد ليلة مسجلة": "Noite mais fria", "أكثر عام ممطر": "Ano mais chuvoso", "المنحنى عبر عشرين سنة": "Curva de 20 anos" },
      it: { "أعلى حرارة مسجلة": "Record di caldo", "أبرد ليلة مسجلة": "Notte più fredda", "أكثر عام ممطر": "Anno più piovoso", "المنحنى عبر عشرين سنة": "Curva di 20 anni" },
    };
    Object.keys(L10N_V56).forEach((lg) => { try { Object.assign(L10N[lg] || (L10N[lg] = {}), L10N_V56[lg]); } catch (e) {} });
    try {
      Object.assign(I18N_EXTRA, {
        "أعلى حرارة مسجلة": { en: "Record high", fr: "Record de chaleur", de: "Höchstwert", es: "Récord de calor", pt: "Recorde de calor", it: "Record di caldo" },
        "أبرد ليلة مسجلة": { en: "Coldest night", fr: "Nuit la plus froide", de: "Kälteste Nacht", es: "Noche más fría", pt: "Noite mais fria", it: "Notte più fredda" },
        "أكثر عام ممطر": { en: "Wettest year", fr: "Année la plus arrosée", de: "Regenreichstes Jahr", es: "Año más lluvioso", pt: "Ano mais chuvoso", it: "Anno più piovoso" },
        "شريط اختيار التاريخ الزجاجي": { en: "Glass date selector", fr: "Sélecteur de date en verre", de: "Glas-Datumsauswahl", es: "Selector de fecha de vidrio", pt: "Seletor de data em vidro", it: "Selettore data in vetro" },
        "عبر {n} سنة مسجلة: أعلى حرارة {h} في {y1}، وأبرد ليلة {c} في {y2}، وأكثر عام مطرًا {w} مم في {y3} — والمنحنى يتتبع اتجاه العشرين سنة كاملة.": {
          en: "Across {n} recorded years: the record high is {h} in {y1}, the coldest night {c} in {y2}, and the wettest year {w} mm in {y3} — the curve traces the full 20-year trend.",
          fr: "Sur {n} années enregistrées : record de chaleur {h} en {y1}, nuit la plus froide {c} en {y2} et année la plus arrosée {w} mm en {y3} — la courbe suit la tendance des vingt années.",
          de: "Über {n} erfasste Jahre: Höchstwert {h} in {y1}, kälteste Nacht {c} in {y2} und regenreichstes Jahr {w} mm in {y3} — die Kurve verfolgt den 20-Jahre-Trend.",
          es: "En {n} años registrados: el récord de calor es {h} en {y1}, la noche más fría {c} en {y2} y el año más lluvioso {w} mm en {y3} — la curva sigue la tendencia de los veinte años.",
          pt: "Em {n} anos registados: o recorde de calor é {h} em {y1}, a noite mais fria {c} em {y2} e o ano mais chuvoso {w} mm em {y3} — a curva segue a tendência dos vinte anos.",
          it: "In {n} anni registrati: il record di caldo è {h} nel {y1}, la notte più fredda {c} nel {y2} e l'anno più piovoso {w} mm nel {y3} — la curva segue la tendenza dei venti anni.",
        },
        "اختر أي تاريخ لعرض الرقم القياسي لأعلى حرارة وأقل حرارة وأكثر عام ممطر في ذلك اليوم تحديدًا — من سجل ERA5 الحقيقي": {
          en: "Pick any date to see the record high, record low and wettest year for that exact day — from the real ERA5 archive",
          fr: "Choisissez n’importe quelle date pour voir le record de chaleur, le record de froid et l’année la plus arrosée de ce jour précis — depuis les vraies archives ERA5",
          de: "Wählen Sie ein beliebiges Datum, um den Hitze- und Kälterekord sowie das regenreichste Jahr genau für diesen Tag zu sehen — aus dem echten ERA5-Archiv",
          es: "Elija cualquier fecha para ver el récord de calor, el récord de frío y el año más lluvioso de ese día exacto — del archivo real ERA5",
          pt: "Escolha qualquer data para ver o recorde de calor, o recorde de frio e o ano mais chuvoso desse dia exato — do arquivo real ERA5",
          it: "Scegli qualsiasi data per vedere il record di caldo, il record di freddo e l’anno più piovoso di quel giorno esatto — dall’archivio reale ERA5",
        },
        "سجل ERA5 عبر عشرين سنة": { en: "20-year ERA5 archive", fr: "Archives ERA5 sur vingt ans", de: "ERA5-Archiv über 20 Jahre", es: "Archivo ERA5 de veinte años", pt: "Arquivo ERA5 de vinte anos", it: "Archivio ERA5 di vent’anni" },
        "أعلى · أقل · أكثر مطرًا": { en: "High · Low · Wettest", fr: "Max · Min · Plus pluvieux", de: "Max · Min · Regnerischste", es: "Máx · Mín · Más lluvioso", pt: "Máx · Mín · Mais chuvoso", it: "Max · Min · Più piovoso" },
        "السجل الأرشيفي يتأخر أيامًا قليلة — اختر تاريخًا من الماضي. النتيجة تُخزَّن على جهازك 24 ساعة.": {
          en: "The archive lags a few days — pick a past date. Results are cached on your device for 24 hours.",
          fr: "Les archives ont quelques jours de retard — choisissez une date passée. Le résultat est mis en cache sur votre appareil pendant 24 heures.",
          de: "Das Archiv hinkt einige Tage hinterher — wählen Sie ein vergangenes Datum. Das Ergebnis wird 24 Stunden auf Ihrem Gerät gespeichert.",
          es: "El archivo va con unos días de retraso — elija una fecha pasada. El resultado se guarda en su dispositivo durante 24 horas.",
          pt: "O arquivo tem alguns dias de atraso — escolha uma data passada. O resultado é guardado no seu dispositivo por 24 horas.",
          it: "L’archivio è in ritardo di qualche giorno — scegli una data passata. Il risultato è salvato sul dispositivo per 24 ore.",
        },
        "نسافر عبر عشرين سنة من السجل…": { en: "Travelling through twenty years of records…", fr: "Voyage à travers vingt ans d’archives…", de: "Reise durch zwanzig Jahre Aufzeichnungen…", es: "Viajando por veinte años de registros…", pt: "A viajar por vinte anos de registos…", it: "Viaggio attraverso vent’anni di registrazioni…" },
        "تعذر جلب سجل هذا التاريخ — تحقق من الاتصال ثم أعد المحاولة.": {
          en: "Couldn't load this date's record — check your connection and retry.",
          fr: "Impossible de charger les archives de cette date — vérifiez la connexion puis réessayez.",
          de: "Aufzeichnung für dieses Datum nicht ladbar — Verbindung prüfen und erneut versuchen.",
          es: "No se pudo cargar el registro de esta fecha — compruebe la conexión e inténtelo de nuevo.",
          pt: "Não foi possível carregar o registo desta data — verifique a ligação e tente novamente.",
          it: "Impossibile caricare il registro di questa data — controlla la connessione e riprova.",
        },
        "جارٍ تجهيز تطبيق مَطَر برو": { en: "Preparing Matar Pro…", fr: "Préparation de Matar Pro…", de: "Matar Pro wird vorbereitet…", es: "Preparando Matar Pro…", pt: "A preparar o Matar Pro…", it: "Preparazione di Matar Pro…" },
        "دقة الأرصاد.. بين يديك": { en: "Forecast precision.. at your fingertips", fr: "La précision météo.. entre vos mains", de: "Präzise Vorhersagen.. in Ihren Händen", es: "Precisión meteorológica.. en tus manos", pt: "Precisão meteorológica.. nas suas mãos", it: "Precisione meteo.. tra le tue mani" },
        "تخطَّ إلى المحتوى الرئيسي": { en: "Skip to main content", fr: "Aller au contenu principal", de: "Zum Hauptinhalt springen", es: "Saltar al contenido principal", pt: "Saltar para o conteúdo principal", it: "Vai al contenuto principale" },
        "ضباب أو شبورة محتملة ليلاً — الرطوبة قرب التشبع": {
          en: "Fog or dew possible overnight — humidity near saturation",
          fr: "Brouillard ou rosée possibles dans la nuit — humidité proche de la saturation",
          de: "Nachts Nebel oder Tau möglich — Luftfeuchte nahe der Sättigung",
          es: "Niebla o rocío posibles durante la noche — humedad cerca de la saturación",
          pt: "Nevoeiro ou orvalho possíveis durante a noite — humidade perto da saturação",
          it: "Nebbia o rugiada possibili durante la notte — umidità vicino alla saturazione",
        },
        "ليلة باردة — طبقة دافئة إن كنت خارجًا متأخرًا": {
          en: "Cold night — a warm layer if you are out late",
          fr: "Nuit froide — une couche chaude si vous sortez tard",
          de: "Kalte Nacht — eine warme Schicht, wenn Sie spät draußen sind",
          es: "Noche fría — una capa abrigada si sale tarde",
          pt: "Noite fria — uma camada quente se sair tarde",
          it: "Notte fredda — uno strato caldo se esci tardi",
        },
        "عاصفة رعدية متوقعة — أجّل الأنشطة الخارجية كليًا وخطط ليوم داخلي، وتجنب المناطق المفتوحة والأشجار المنفردة.": {
          en: "Thunderstorms expected — postpone all outdoor plans for an indoor day and avoid open areas and lone trees.",
          fr: "Orages attendus — reportez toutes les sorties pour une journée en intérieur et évitez les espaces ouverts et les arbres isolés.",
          de: "Gewitter erwartet — verschieben Sie alle Outdoor-Pläne auf einen Tag drinnen und meiden Sie offene Flächen und Einzelbäume.",
          es: "Tormentas eléctricas previstas — posponga todos los planes al aire libre por un día de interior y evite zonas abiertas y árboles solitarios.",
          pt: "Tempestades previstas — adie todos os planos ao ar livre para um dia de interior e evite áreas abertas e árvores isoladas.",
          it: "Temporali attesi — rimanda tutti i piani all’aperto per una giornata al chiuso ed evita spazi aperti e alberi isolati.",
        },
        "يوم ماطر بوضوح — جهّز بديلًا داخليًا واحمل مظلة، ونوافذ رحلتك حول ذروة المطر في الفترات أعلاه.": {
          en: "A clearly wet day — plan an indoor alternative, carry an umbrella and route around the rain peak shown above.",
          fr: "Journée clairement pluvieuse — prévoyez une alternative en intérieur, prenez un parapluie et contournez le pic de pluie indiqué ci-dessus.",
          de: "Ein klar nasser Tag — planen Sie eine Indoor-Alternative, nehmen Sie einen Regenschirm mit und umgehen Sie die oben gezeigte Regenspitze.",
          es: "Un día claramente lluvioso — planee una alternativa bajo techo, lleve paraguas y esquive el pico de lluvia mostrado arriba.",
          pt: "Um dia claramente chuvoso — planeie uma alternativa em interior, leve guarda-chuva e contorne o pico de chuva mostrado acima.",
          it: "Giornata chiaramente piovosa — programma un’alternativa al coperto, porta l’ombrello e aggira il picco di pioggia mostrato sopra.",
        },
        "حر شديد — أنشئتك في الصباح الباكر حصرًا، ماء على كل نصف ساعة، وظل دائم، وتجنب الظهيرة تمامًا.": {
          en: "Severe heat — keep activity to the early morning, water every half hour, stay in shade and skip midday entirely.",
          fr: "Chaleur intense — limitez-vous au petit matin, eau toutes les demi-heures, ombre permanente et midi à éviter totalement.",
          de: "Extreme Hitze — Aktivität nur am frühen Morgen, Wasser jede halbe Stunde, stets im Schatten und die Mittagszeit ganz meiden.",
          es: "Calor extremo — actividad solo a primera hora, agua cada media hora, sombra permanente y evite por completo el mediodía.",
          pt: "Calor extremo — atividade só de manhã cedo, água a cada meia hora, sombra permanente e evite totalmente o meio-dia.",
          it: "Caldo intenso — attività solo al mattino presto, acqua ogni mezz’ora, sempre all’ombra e salta del tutto il mezzogiorno.",
        },
        "يوم حار — المبكر والمتأخر أفضل ساعاتك، مع ماء وثقل خفيف، والظهيرة للظل والاستراحة.": {
          en: "A hot day — early and late are your best hours with water and light clothing; keep midday for shade and rest.",
          fr: "Journée chaude — tôt et tard sont vos meilleures heures avec de l’eau et des vêtements légers ; gardez midi pour l’ombre et le repos.",
          de: "Heißer Tag — früh und spät sind Ihre besten Stunden, mit Wasser und leichter Kleidung; die Mittagszeit gehört Schatten und Pause.",
          es: "Día caluroso — temprano y tarde son sus mejores horas, con agua y ropa ligera; deje el mediodía para la sombra y el descanso.",
          pt: "Dia quente — cedo e tarde são as suas melhores horas, com água e roupa leve; deixe o meio-dia para a sombra e o descanso.",
          it: "Giornata calda — presto e tardi sono le tue ore migliori, con acqua e vestiti leggeri; il mezzogiorno va in ombra e riposo.",
        },
        "ليلة باردة قرب الصقيع — طبقات دافئة صباحًا ومساءً، وانتبه لانزلاق الصباح على الجسور والجسور العلوية.": {
          en: "A cold night near frost — warm layers morning and evening and watch icy patches on bridges early.",
          fr: "Nuit froide proche du gel — couches chaudes matin et soir, attention aux plaques verglaçantes sur les ponts tôt le matin.",
          de: "Kalte Nacht nahe Frost — warme Schichten morgens und abends, achten Sie früh auf Glatteis auf Brücken.",
          es: "Noche fría cerca de las heladas — capas abrigadas mañana y noche, y atención a las placas de hielo en los puentes al amanecer.",
          pt: "Noite fria perto da geada — camadas quentes de manhã e à noite, atenção a placas de gelo nas pontes ao amanhecer.",
          it: "Notte fredda vicino al gelo — strati caldi mattino e sera, attenzione alle lastre di ghiaccio sui ponti all’alba.",
        },
        "يوم لطيف ومستقر — مثالي للأنشطة الخارجية والقعدات والمشي؛ التقط اللقطات وقت الذروة الضوئية قبل الغروب.": {
          en: "A pleasant, stable day — ideal for outdoor plans, walks and gatherings; catch the golden light before sunset.",
          fr: "Journée agréable et stable — idéale pour les sorties, les promenades et les retrouvailles ; saisissez la lumière dorée avant le coucher du soleil.",
          de: "Angenehmer, stabiler Tag — ideal für Outdoor-Pläne, Spaziergänge und Treffen; holen Sie das goldene Licht vor Sonnenuntergang.",
          es: "Día agradable y estable — ideal para planes al aire libre, paseos y reuniones; aproveche la luz dorada antes del atardecer.",
          pt: "Dia agradável e estável — ideal para planos ao ar livre, caminhadas e encontros; aproveite a luz dourada antes do pôr do sol.",
          it: "Giornata piacevole e stabile — ideale per piani all’aperto, passeggiate e incontri; cogli la luce dorata prima del tramonto.",
        },
        "يوم معتدل بإمكانات جيدة — راقب شارة المطر أعلاه والتزم بالفترة الأنسب لخططك.": {
          en: "A moderate day with good potential — watch the rain badge above and pick the most suitable period.",
          fr: "Journée modérée avec un bon potentiel — surveillez le badge de pluie ci-dessus et choisissez la période la plus adaptée.",
          de: "Mäßiger Tag mit gutem Potenzial — achten Sie auf die Regenanzeige oben und wählen Sie die passendste Phase.",
          es: "Día moderado con buen potencial — vigile la insignia de lluvia de arriba y elija el período más adecuado.",
          pt: "Dia moderado com bom potencial — vigie o selo de chuva acima e escolha o período mais adequado.",
          it: "Giornata moderata con buon potenziale — osserva il badge della pioggia sopra e scegli il periodo più adatto.",
        },
        "بيانات الحرارة والرطوبة غير كافية الآن — أعد فتح اللوحة بعد تحميل البيانات.": {
          en: "Temperature/humidity not ready yet — reopen after data loads.",
          fr: "Température/humidité pas encore prêtes — rouvrez après le chargement des données.",
          de: "Temperatur/Luftfeuchte noch nicht bereit — nach dem Laden der Daten erneut öffnen.",
          es: "Temperatura/humedad aún no listas — vuelva a abrir después de cargar los datos.",
          pt: "Temperatura/humidade ainda não prontas — reabra depois de carregar os dados.",
          it: "Temperatura/umidità non ancora pronte — riapri dopo il caricamento dei dati.",
        },
        "اشرب نحو {v} ملليلتر/ساعة أثناء التمرين الحالي — أي {l} لتر في جلسة ساعة كاملة.": {
          en: "Drink about {v} ml/hour at current conditions — that is {l} L over a one-hour session.",
          fr: "Buvez environ {v} ml/heure dans les conditions actuelles — soit {l} L sur une séance d’une heure.",
          de: "Trinken Sie bei den aktuellen Bedingungen rund {v} ml/Std. — das sind {l} L pro Stunde Training.",
          es: "Beba unos {v} ml/hora en las condiciones actuales — es decir, {l} L en una sesión de una hora.",
          pt: "Beba cerca de {v} ml/hora nas condições atuais — ou seja, {l} L numa sessão de uma hora.",
          it: "Bevi circa {v} ml/ora nelle condizioni attuali — cioè {l} L in una sessione di un’ora.",
        },
        "مبني على WBGT = {v} والرطوبة {r}٪": { en: "based on WBGT = {v} and humidity {r}%", fr: "basé sur WBGT = {v} et humidité {r} %", de: "basierend auf WBGT = {v} und Luftfeuchte {r} %", es: "basado en WBGT = {v} y humedad {r} %", pt: "baseado em WBGT = {v} e humidade {r} %", it: "basato su WBGT = {v} e umidità {r} %" },
        "لا حساب متاح الآن — انتظر بيانات اللوحة.": {
          en: "No estimate right now — wait for the board data.",
          fr: "Pas d’estimation pour l’instant — attendez les données du tableau.",
          de: "Derzeit keine Schätzung — warten Sie auf die Board-Daten.",
          es: "Sin estimación por ahora — espere los datos del panel.",
          pt: "Sem estimativa por agora — aguarde os dados do painel.",
          it: "Nessuna stima al momento — attendi i dati della scheda.",
        },
        "الجو محايد — اركب زمنك المعتاد بلا عقوبة فيزيائية تُذكر.": {
          en: "Neutral air — keep your usual pace with no meaningful penalty.",
          fr: "Air neutre — gardez votre allure habituelle sans pénalité notable.",
          de: "Neutrale Luft — behalten Sie Ihr gewohntes Tempo ohne spürbare Strafe.",
          es: "Aire neutro — mantenga su ritmo habitual sin penalización notable.",
          pt: "Ar neutro — mantenha o seu ritmo habitual sem penalização notável.",
          it: "Aria neutra — mantieni il tuo passo abituale senza penalità apprezzabile.",
        },
        "اخلط {v}٪ على زمنك المعتاد (خفّض الوتيرة) — الجسم يصرف جزءًا من الوقود على التبريد بدل الدفع.": {
          en: "Add {v}% to your usual pace (slow down) — part of your fuel is spent on cooling instead of propulsion.",
          fr: "Ajoutez {v} % à votre allure habituelle (ralentissez) — une partie de votre énergie part dans le refroidissement au lieu de la propulsion.",
          de: "Rechnen Sie {v} % auf Ihr gewohntes Tempo (verlangsamen) — ein Teil der Energie fließt in die Kühlung statt in den Vortrieb.",
          es: "Añada {v} % a su ritmo habitual (reduzca la marcha) — parte del combustible se gasta en enfriarse en lugar de impulsarse.",
          pt: "Acrescente {v} % ao seu ritmo habitual (abrande) — parte do combustível é gasta no arrefecimento em vez da propulsão.",
          it: "Aggiungi {v} % al tuo passo abituale (rallenta) — parte del carburante va nel raffreddamento invece che nella spinta.",
        },
        "محاذاة إرشادات الطباعة الرياضية للحرارة": { en: "aligned with heat pacing guidance", fr: "conforme aux recommandations d’allure par chaleur", de: "entspricht den Empfehlungen zum Lauftempo bei Hitze", es: "alineado con las pautas de ritmo en calor", pt: "alinhado com as diretrizes de ritmo no calor", it: "conforme alle linee guida sul passo con il caldo" },
        "كل خانة ساعة قادمة: الأخضر المثالي للتمرين عالي الكثافة، والأصفر بحذر، والأحمر للراحة أو الجهد الخفيف.": {
          en: "Each cell is one coming hour: green is ideal for hard training, amber is cautious, red means rest or light effort.",
          fr: "Chaque case est une heure à venir : le vert est idéal pour un entraînement intense, l’ambre appelle la prudence, le rouge veut dire repos ou effort léger.",
          de: "Jede Zelle ist eine kommende Stunde: Grün ist ideal für hartes Training, Gelb heißt Vorsicht, Rot bedeutet Pause oder leichte Anstrengung.",
          es: "Cada casilla es una hora venidera: el verde es ideal para entrenamiento intenso, el ámbar pide cautela y el rojo significa descanso o esfuerzo ligero.",
          pt: "Cada célula é uma hora futura: o verde é ideal para treino intenso, o âmbar pede cautela e o vermelho significa descanso ou esforço leve.",
          it: "Ogni cella è un’ora a venire: il verde è ideale per l’allenamento intenso, l’ambra chiede cautela e il rosso significa riposo o sforzo leggero.",
        },
        "دمج فيزياء الضغط مع سولنار القمر — دقيقة أعلى = فترات تغذية أقوى": {
          en: "pressure physics merged with solunar moon — higher % = stronger feeding windows",
          fr: "physique de la pression fusionnée au solunaire lunaire — plus le % est élevé, plus les fenêtres d’alimentation sont fortes",
          de: "Druckphysik verschmolzen mit der Mond-Solunar-Theorie — höherer % = stärkere Fressfenster",
          es: "física de la presión combinada con el solunar lunar — mayor % = ventanas de alimentación más fuertes",
          pt: "física da pressão combinada com o solunar lunar — % mais alto = janelas de alimentação mais fortes",
          it: "fisica della pressione fusa con il solunar lunare — % più alto = finestre di alimentazione più forti",
        },
        "نافذة تغذية قوية — الضغط والقمر معًا في صالحك: انطلق فجرًا أو غروبًا بالطُعم المتحرك.": {
          en: "Strong feeding window — pressure and moon both align: go at dawn or dusk with moving lures.",
          fr: "Fenêtre d’alimentation forte — pression et lune alignées : partez à l’aube ou au crépuscule avec des leurres animés.",
          de: "Starkes Fressfenster — Druck und Mond stimmen überein: gehen Sie in der Dämmerung mit bewegten Ködern los.",
          es: "Ventana de alimentación fuerte — presión y luna alineadas: salga al alba o al anochecer con señuelos en movimiento.",
          pt: "Janela de alimentação forte — pressão e lua alinhadas: saia ao amanhecer ou ao entardecer com iscas em movimento.",
          it: "Finestra di alimentazione forte — pressione e luna allineate: esci all’alba o al tramonto con esche in movimento.",
        },
        "نشاط متوسط إلى جيد — التزم الساعات الذهبية حول الشروق والغروب وعمّق الطُعم قليلًا.": {
          en: "Moderate-to-good activity — stick to golden hours around sunrise/sunset and fish slightly deeper.",
          fr: "Activité moyenne à bonne — restez sur les heures dorées autour du lever/coucher du soleil et pêchez un peu plus profond.",
          de: "Mittlere bis gute Aktivität — halten Sie sich an die Goldenen Stunden um Sonnenauf-/untergang und fischen Sie etwas tiefer.",
          es: "Actividad moderada a buena — limítese a las horas doradas alrededor del amanecer/atardecer y pesque algo más profundo.",
          pt: "Atividade moderada a boa — limite-se às horas douradas do nascer/pôr do sol e pesque um pouco mais fundo.",
          it: "Attività da moderata a buona — resta sulle ore dorate intorno ad alba/tramonto e pesca un po’ più in profondità.",
        },
        "نشاط ضعيف اليوم — الأسماك كامنة؛ وقت أفضل لصيانة العدة أو رحلة قصيرة تجريبية قرب الشاطئ.": {
          en: "Low activity today — fish hold deep; better for tackle maintenance or a short inshore test trip.",
          fr: "Faible activité aujourd’hui — les poissons se cachent en profondeur ; mieux vaut entretenir le matériel ou faire un court essai près du rivage.",
          de: "Geringe Aktivität heute — die Fische stehen tief; besser Gerätepflege oder ein kurzer Testtrip küstennah.",
          es: "Actividad baja hoy — los peces están a fondo; mejor mantenimiento del equipo o una prueba corta cerca de la costa.",
          pt: "Atividade baixa hoje — os peixes estão escondidos em profundidade; melhor manter o equipamento ou fazer um teste curto perto da costa.",
          it: "Attività bassa oggi — i pesci sono nascosti in profondità; meglio manutenere l’attrezzatura o fare una breve prova vicino alla costa.",
        },
        "مياه صفية — رؤية جيدة تحت السطح وسباحة مريحة داخل المنطقة المخصصة.": {
          en: "Clear water — good underwater visibility and comfortable swimming inside the designated zone.",
          fr: "Eau claire — bonne visibilité sous la surface et nage confortable dans la zone réservée.",
          de: "Klares Wasser — gute Sicht unter der Oberfläche und angenehmes Schwimmen in der ausgewiesenen Zone.",
          es: "Agua clara — buena visibilidad bajo la superficie y natación cómoda dentro de la zona designada.",
          pt: "Água clara — boa visibilidade debaixo da superfície e natação confortável dentro da zona designada.",
          it: "Acqua chiara — buona visibilità sotto la superficie e nuoto confortevole nella zona designata.",
        },
        "عكارة متوسطة — هبّات أو موج يرفعان الرمل؛ تفتح العين تحت الماء بحذر وابتعد عن الصخور.": {
          en: "Moderate murkiness — gusts or waves stirring sand; open your eyes underwater carefully and keep off rocks.",
          fr: "Trouble modéré — rafales ou vagues soulevant le sable ; ouvrez les yeux sous l’eau avec prudence et restez loin des rochers.",
          de: "Mäßige Trübung — Böen oder Wellen wirbeln Sand auf; öffnen Sie die Augen unter Wasser vorsichtig und meiden Sie Felsen.",
          es: "Turbidez moderada — ráfagas u olas levantan arena; abra los ojos bajo el agua con cuidado y aléjese de las rocas.",
          pt: "Turbidez moderada — rajadas ou ondas levantam areia; abra os olhos debaixo de água com cuidado e afaste-se das rochas.",
          it: "Turbidità moderata — raffiche o onde sollevano sabbia; apri gli occhi sott’acqua con cautela e stai lontano dagli scogli.",
        },
        "مياه عكرة بالغبار والرمل — رؤية ضعيفة وسباحة غير مجدية اليوم؛ كن مرئيًا للقوارب بعوامة ملونة.": {
          en: "Sand-churned murky water — poor visibility, not a swimming day; stay visible to boats with a bright float.",
          fr: "Eau trouble brassée par le sable — visibilité faible, journée sans natation ; restez visible des bateaux avec une bouée colorée.",
          de: "Sandaufgewühltes trübes Wasser — schlechte Sicht, kein Schwimmtag; bleiben Sie mit einer hellen Boje für Boote sichtbar.",
          es: "Agua turbia revuelta por la arena — visibilidad pobre, día sin natación; hágase visible a los botes con un flotador colorido.",
          pt: "Água turva revolvida pela areia — visibilidade fraca, dia sem natação; mantenha-se visível aos barcos com uma boia colorida.",
          it: "Acqua torbida mossa dalla sabbia — visibilità scarsa, giornata senza nuoto; renditi visibile alle barche con un galleggiante colorato.",
        },
        "موج الآن {w} م · هبّات {g} كم/س · مطر 6 س {r} مم": { en: "waves now {w} m · gusts {g} km/h · 6h rain {r} mm", fr: "vagues actuelles {w} m · rafales {g} km/h · pluie 6 h {r} mm", de: "Wellen jetzt {w} m · Böen {g} km/h · Regen 6 Std. {r} mm", es: "olas ahora {w} m · ráfagas {g} km/h · lluvia 6 h {r} mm", pt: "ondas agora {w} m · rajadas {g} km/h · chuva 6 h {r} mm", it: "onde ora {w} m · raffiche {g} km/h · pioggia 6 h {r} mm" },
        "هبّات {g} كم/س (بلا تغطية موج لموقعك)": { en: "gusts {g} km/h (no wave coverage here)", fr: "rafales {g} km/h (pas de couverture de vagues ici)", de: "Böen {g} km/h (keine Wellenabdeckung hier)", es: "ráfagas {g} km/h (sin cobertura de olas aquí)", pt: "rajadas {g} km/h (sem cobertura de ondas aqui)", it: "raffiche {g} km/h (nessuna copertura onde qui)" },
        "موج قوي وطويل يضخّ الماء نحو الشاطئ ويعيد خروجًا مركزًا (Rip Current): سبح داخل الحارس فقط، وإن انتزعك فسبح موازيًا للشاطئ لا عكس التيار.": {
          en: "Strong long-period waves pump water ashore and set up a rip current: swim only where lifeguards are, and if caught swim parallel to shore — never against it.",
          fr: "Des vagues fortes et longues pompent l’eau vers le rivage et créent un courant d’arrachement : nagez uniquement sous surveillance de sauveteurs, et si vous êtes emporté, nagez parallèlement au rivage — jamais à contre-courant.",
          de: "Starke langperiodische Wellen pumpen Wasser an den Strand und erzeugen eine Strandströmung: schwimmen Sie nur bei Bademeistern, und wenn Sie erfasst werden, schwimmen Sie parallel zum Ufer — nie dagegen.",
          es: "Olas fuertes y largas bombean agua a la orilla y generan una corriente de resaca: nade solo donde haya socorristas y, si lo arrastra, nade paralelo a la orilla — nunca contra la corriente.",
          pt: "Ondas fortes e longas bombeiam água para a costa e criam uma corrente de retorno: nade apenas onde haja socorristas e, se for arrastado, nade paralelo à costa — nunca contra a corrente.",
          it: "Onde forti e lunghe pompano acqua verso riva e creano una corrente di risacca: nuota solo dove ci sono bagnini e, se ti trascina, nuota parallelo alla riva — mai contro corrente.",
        },
        "احتمال تيار ساحب موضعي قرب الفتحات والصخور — أبقِ الأطفال قرب الشاطئ وتعرف على لون الماء الأغمق الممتد نحو البحر.": {
          en: "A localised rip is possible near gaps and rocks — keep children close and learn the darker channel stretching seaward.",
          fr: "Un courant d’arrachement local est possible près des passes et des rochers — gardez les enfants près de vous et repérez le chenal plus sombre qui s’étend vers le large.",
          de: "Eine örtliche Strandströmung ist bei Lücken und Felsen möglich — halten Sie Kinder in der Nähe und erkennen Sie den dunkleren Kanal, der seewärts verläuft.",
          es: "Es posible una corriente localizada cerca de aberturas y rocas — mantenga a los niños cerca y aprenda a reconocer el canal más oscuro que se extiende hacia el mar.",
          pt: "É possível uma corrente localizada perto de aberturas e rochas — mantenha as crianças por perto e aprenda a reconhecer o canal mais escuro que se estende para o mar.",
          it: "È possibile una corrente localizzata vicino a passaggi e scogli — tieni i bambini vicini e impara a riconoscere il canale più scuro che si estende verso il mare.",
        },
        "ظروف تيار منخفضة — الموج والهبّات في نطاق هادئ مع التزام الدائم بحراسة الأطفال.": {
          en: "Low rip conditions — waves and gusts in a calm band, with the usual eye on children.",
          fr: "Conditions de courant faibles — vagues et rafales dans une gamme calme, avec la vigilance habituelle sur les enfants.",
          de: "Geringe Strömungsbedingungen — Wellen und Böen in ruhigem Bereich, mit der gewohnten Aufsicht der Kinder.",
          es: "Condiciones de corriente bajas — olas y ráfagas en rango tranquilo, con la vigilancia habitual de los niños.",
          pt: "Condições de corrente baixas — ondas e rajadas numa faixa calma, com a habitual vigilância das crianças.",
          it: "Condizioni di corrente basse — onde e raffiche in gamma tranquilla, con la consueta sorveglianza dei bambini.",
        },
        "ذروة الموج اليوم {w} م خلال 12 ساعة": { en: "today's wave peak {w} m within 12h", fr: "pic de vagues du jour {w} m dans les 12 h", de: "heutiger Wellenspitzenwert {w} m innerhalb von 12 Std.", es: "pico de olas de hoy {w} m dentro de 12 h", pt: "pico de ondas de hoje {w} m dentro de 12 h", it: "picco di onde di oggi {w} m entro 12 h" },
        "بلا بيانات موج — الحكم من الهبّات حصرًا": { en: "no wave data — judged from gusts only", fr: "pas de données de vagues — jugé d’après les rafales seulement", de: "keine Wellendaten — nur aus den Böen beurteilt", es: "sin datos de olas — valorado solo por las ráfagas", pt: "sem dados de ondas — avaliado apenas pelas rajadas", it: "nessun dato onde — valutato solo dalle raffiche" },
        "خطر": { en: "High", fr: "Élevé", de: "Hoch", es: "Alto", pt: "Alto", it: "Alto" },
        "ممكن": { en: "Possible", fr: "Possible", de: "Möglich", es: "Posible", pt: "Possível", it: "Possibile" },
        "منخفض": { en: "Low", fr: "Faible", de: "Niedrig", es: "Bajo", pt: "Baixo", it: "Basso" },
        "الهبّات على السطح": { en: "Surface gusts", fr: "Rafales en surface", de: "Böen am Boden", es: "Ráfagas en superficie", pt: "Rajadas à superfície", it: "Raffiche in superficie" },
        "حد نوعك ({t}): {v} كم/س — الهبّات الحالية تحته بأمان، وابقَ ضمن مدى الرؤية وارتقِ تدريجيًا.": {
          en: "Your type's limit ({t}): {v} km/h — current gusts are safely below it; stay within visual range and climb gradually.",
          fr: "Limite de votre type ({t}) : {v} km/h — les rafales actuelles restent en sécurité en dessous ; restez en vue directe et montez progressivement.",
          de: "Grenze Ihres Typs ({t}): {v} km/h — die aktuellen Böen liegen sicher darunter; bleiben Sie in Sichtweite und steigen Sie allmählich.",
          es: "Límite de su tipo ({t}): {v} km/h — las ráfagas actuales están con seguridad por debajo; manténgase a la vista y suba gradualmente.",
          pt: "Limite do seu tipo ({t}): {v} km/h — as rajadas atuais estão seguramente abaixo; mantenha-se à vista e suba gradualmente.",
          it: "Limite del tuo tipo ({t}): {v} km/h — le raffiche attuali sono in sicurezza al di sotto; resta nel campo visivo e sali gradualmente.",
        },
        "الهبّات تجاوزت حد نوعك ({v} كم/س) — أجّل الإقلاع أو انتقل لموقع محمي؛ الوزن الخفيف أكثر عرضة للانجراف.": {
          en: "Gusts exceed your type's limit ({v} km/h) — postpone or move to a sheltered spot; lighter airframes drift first.",
          fr: "Les rafales dépassent la limite de votre type ({v} km/h) — reportez le vol ou déplacez-vous à l’abri ; les appareils légers dérivent en premier.",
          de: "Die Böen überschreiten die Grenze Ihres Typs ({v} km/h) — verschieben Sie den Start oder wechseln Sie an einen geschützten Ort; leichte Luftfahrzeuge driften zuerst.",
          es: "Las ráfagas superan el límite de su tipo ({v} km/h) — posponga el despegue o muévase a un lugar protegido; los aparatos ligeros derivan primero.",
          pt: "As rajadas excedem o limite do seu tipo ({v} km/h) — adie a descolagem ou mude para um local protegido; as aeronaves leves derivam primeiro.",
          it: "Le raffiche superano il limite del tuo tipo ({v} km/h) — rimanda il decollo o spostati in un punto riparato; gli apparecchi leggeri derivano per primi.",
        },
        "الرياح · 10 م": { en: "Wind · 10 m", fr: "Vent · 10 m", de: "Wind · 10 m", es: "Viento · 10 m", pt: "Vento · 10 m", it: "Vento · 10 m" },
        "الرياح · 80 م": { en: "Wind · 80 m", fr: "Vent · 80 m", de: "Wind · 80 m", es: "Viento · 80 m", pt: "Vento · 80 m", it: "Vento · 80 m" },
        "الرياح · 120 م": { en: "Wind · 120 m", fr: "Vent · 120 m", de: "Wind · 120 m", es: "Viento · 120 m", pt: "Vento · 120 m", it: "Vento · 120 m" },
        "الرؤية الأفقية": { en: "Horizontal visibility", fr: "Visibilité horizontale", de: "Horizontale Sicht", es: "Visibilidad horizontal", pt: "Visibilidade horizontal", it: "Visibilità orizzontale" },
        "كم": { en: "km", fr: "km", de: "km", es: "km", pt: "km", it: "km" },
        "تكثف الندى على العدسات": { en: "Dew on lens/props", fr: "Rosée sur l’objectif/hélices", de: "Tau auf Objektiv/Propellern", es: "Rocío en lente/hélices", pt: "Orvalho na lente/hélices", it: "Rugiada su ottica/eliche" },
        "فرق {v}° عن نقطة الندى": { en: "{v}° above dew point", fr: "{v}° au-dessus du point de rosée", de: "{v}° über dem Taupunkt", es: "{v}° sobre el punto de rocío", pt: "{v}° acima do ponto de orvalho", it: "{v}° sopra il punto di rugiada" },
        "سرعة تغير الضغط الجوي هي المحفز الأول الموثق للصداع النصفي": {
          en: "air-pressure change rate is the best-documented migraine trigger",
          fr: "la vitesse de variation de la pression est le déclencheur de migraine le mieux documenté",
          de: "die Änderungsgeschwindigkeit des Luftdrucks ist der am besten belegte Migräne-Auslöser",
          es: "la velocidad de cambio de la presión atmosférica es el desencadenante de migraña mejor documentado",
          pt: "a velocidade de variação da pressão atmosférica é o desencadeador de enxaqueca melhor documentado",
          it: "la velocità di variazione della pressione atmosferica è il trigger dell’emicrania meglio documentato",
        },
        "خطر مرتفع": { en: "High risk", fr: "Risque élevé", de: "Hohes Risiko", es: "Riesgo alto", pt: "Risco alto", it: "Rischio alto" },
        "حذر": { en: "Caution", fr: "Prudence", de: "Vorsicht", es: "Precaución", pt: "Cautela", it: "Cautela" },
        "مستقر": { en: "Stable", fr: "Stable", de: "Stabil", es: "Estable", pt: "Estável", it: "Stabile" },
        "خلال 6 ساعات": { en: "over 6 hours", fr: "sur 6 heures", de: "über 6 Std.", es: "en 6 horas", pt: "em 6 horas", it: "su 6 ore" },
        "خلال 12 ساعة": { en: "over 12 hours", fr: "sur 12 heures", de: "über 12 Std.", es: "en 12 horas", pt: "em 12 horas", it: "su 12 ore" },
        "تغير ضغط حاد في النافذتين — ماء كافٍ، نوم منتظم، شاشة أقل، ودواءك في المتناول قبل الذروة.": {
          en: "Sharp pressure change across both windows — hydrate, keep sleep regular, cut screens and keep medication at hand before the peak.",
          fr: "Variation de pression marquée sur les deux fenêtres — hydratez-vous, dormez régulièrement, réduisez les écrans et gardez votre médicament à portée avant le pic.",
          de: "Kräftiger Druckwechsel in beiden Fenstern — trinken Sie, schlafen Sie regelmäßig, weniger Bildschirme und Medikament griffbereit vor dem Höhepunkt.",
          es: "Cambio de presión pronunciado en ambas ventanas — hidrátese, duerma con regularidad, menos pantallas y tenga su medicación a mano antes del pico.",
          pt: "Variação de pressão acentuada em ambas as janelas — hidrate-se, durma com regularidade, menos ecrãs e tenha a medicação à mão antes do pico.",
          it: "Variazione di pressione marcata in entrambe le finestre — idratati, dormi regolarmente, meno schermi e tieni la medicina a portata di mano prima del picco.",
        },
        "تغير محسوس قد يزعج الحساسين — خطط فترات راحة وعين داكنة إن كنت من المعرضين.": {
          en: "A noticeable shift may bother sensitive people — plan breaks and a dark room if you are prone.",
          fr: "Une variation sensible peut gêner les personnes sensibles — prévoyez des pauses et une pièce sombre si vous êtes sujet.",
          de: "Ein spürbarer Wechsel kann Empfindliche stören — planen Sie Pausen und einen dunklen Raum, wenn Sie anfällig sind.",
          es: "Un cambio perceptible puede molestar a los sensibles — planee pausas y una habitación oscura si es propenso.",
          pt: "Uma mudança percetível pode incomodar os sensíveis — planeie pausas e um quarto escuro se for propenso.",
          it: "Un cambio percettibile può disturbare i sensibili — pianifica pause e una stanza buia se sei predisposto.",
        },
        "الضغط شبه مستقر — مخاطر الصداع النصفي منخفضة هذه الساعات.": {
          en: "Pressure near-stable — migraine risk stays low this window.",
          fr: "Pression quasi stable — le risque de migraine reste faible sur cette fenêtre.",
          de: "Druck nahezu stabil — das Migränerisiko bleibt in diesem Zeitraum niedrig.",
          es: "Presión casi estable — el riesgo de migraña se mantiene bajo en este período.",
          pt: "Pressão quase estável — o risco de enxaqueca mantém-se baixo neste período.",
          it: "Pressione quasi stabile — il rischio emicranico resta basso in questa finestra.",
        },
        "كلما ارتفع الدرع كان الهواء ألطف للأنف والحلق والعينين": {
          en: "the higher the shield, the kinder the air to nose, throat and eyes",
          fr: "plus le bouclier est haut, plus l’air est doux pour le nez, la gorge et les yeux",
          de: "je höher der Schild, desto milder die Luft für Nase, Rachen und Augen",
          es: "cuanto más alto el escudo, más suave el aire para nariz, garganta y ojos",
          pt: "quanto mais alto o escudo, mais suave o ar para nariz, garganta e olhos",
          it: "più alto è lo scudo, più gentile è l’aria per naso, gola e occhi",
        },
        "هواء نظيف — يوم آمن للحساسين ومرضى الصدر والأنشطة الخارجية العادية.": {
          en: "Clean air — a safe day for allergy, chest patients and normal outdoor activity.",
          fr: "Air pur — journée sûre pour les allergiques, les patients pulmonaires et les activités extérieures normales.",
          de: "Saubere Luft — ein sicherer Tag für Allergiker, Lungenpatienten und normale Outdoor-Aktivität.",
          es: "Aire limpio — día seguro para alérgicos, pacientes pulmonares y actividad exterior normal.",
          pt: "Ar limpo — dia seguro para alérgicos, doentes pulmonares e atividades exteriores normais.",
          it: "Aria pulita — giornata sicura per allergici, pazienti polmonari e attività all’aperto normali.",
        },
        "غبار مرتفع جزئيًا — نظارات شمسية وكمامة في الشوارع المفتوحة، واغسل الأنف عند العودة.": {
          en: "Partly elevated dust — sunglasses and a mask on open streets, rinse your nose after returning.",
          fr: "Poussière partiellement élevée — lunettes de soleil et masque dans les rues ouvertes, rincez le nez au retour.",
          de: "Teilweise erhöhter Staub — Sonnenbrille und Maske auf offenen Straßen, nach der Rückkehr die Nase spülen.",
          es: "Polvo parcialmente elevado — gafas de sol y mascarilla en calles abiertas, y enjuague la nariz al volver.",
          pt: "Poeira parcialmente elevada — óculos de sol e máscara em ruas abertas, lave o nariz ao voltar.",
          it: "Polvere parzialmente elevata — occhiali da sole e mascherina nelle strade aperte, risciacqua il naso al rientro.",
        },
        "غبار كثيف — أغلق النوافذ ساعات الذروة وشغّل المنقي، وامتنع عن الجري الخارجي اليوم.": {
          en: "Heavy dust — keep windows shut at peak hours, run a purifier and skip outdoor running today.",
          fr: "Poussière dense — gardez les fenêtres fermées aux heures de pointe, utilisez un purificateur et évitez la course extérieure aujourd’hui.",
          de: "Dichter Staub — Fenster in Spitzenzeiten geschlossen halten, Luftreiniger laufen lassen und heute auf Lauftraining draußen verzichten.",
          es: "Polvo denso — mantenga las ventanas cerradas en horas pico, use un purificador y evite correr al aire libre hoy.",
          pt: "Poeira densa — mantenha as janelas fechadas nas horas de pico, use um purificador e evite correr ao ar livre hoje.",
          it: "Polvere densa — tieni le finestre chiuse nelle ore di punta, usa un purificatore e salta la corsa all’aperto oggi.",
        },
        "بأشعة اليوم (UV {uv}) تكفي نحو {m} دقيقة كشف للساعدين والساقين حول منتصف النهار لتصنيع حصة فيتامين د.": {
          en: "With today's UV ({uv}), about {m} minutes of forearms-and-calves exposure near midday makes your vitamin D quota.",
          fr: "Avec l’UV du jour ({uv}), environ {m} minutes d’exposition des avant-bras et des mollets vers midi suffisent pour votre quota de vitamine D.",
          de: "Bei der heutigen UV-Strahlung ({uv}) reichen rund {m} Minuten Exposition von Unterarmen und Waden um die Mittagszeit für Ihre Vitamin-D-Quote.",
          es: "Con el UV de hoy ({uv}), unos {m} minutos de exposición de antebrazos y pantorrillas cerca del mediodía cubren su cuota de vitamina D.",
          pt: "Com o UV de hoje ({uv}), cerca de {m} minutos de exposição dos antebraços e das canelas perto do meio-dia cobrem a sua quota de vitamina D.",
          it: "Con gli UV di oggi ({uv}), circa {m} minuti di esposizione di avambracci e polpacci verso mezzogiorno coprono la tua dose di vitamina D.",
        },
        "نافذة الوسط الذهبي: {h} — أشعة كافية بلا حرق": { en: "the golden-middle window: {h} — enough sun without burning", fr: "la fenêtre dorée intermédiaire : {h} — assez de soleil sans brûlure", de: "das goldene Mittelfenster: {h} — genug Sonne ohne Brand", es: "la ventana dorada intermedia: {h} — sol suficiente sin quemadura", pt: "a janela dourada intermédia: {h} — sol suficiente sem queimadura", it: "la finestra dorata intermedia: {h} — sole sufficiente senza bruciature" },
        "الشمس ضعيفة اليوم — اعتمد على المصادر الغذائية": { en: "weak sun today — lean on dietary sources", fr: "soleil faible aujourd’hui — comptez sur les sources alimentaires", de: "schwache Sonne heute — setzen Sie auf Nahrungsquellen", es: "sol débil hoy — apóyese en las fuentes alimentarias", pt: "sol fraco hoje — conte com as fontes alimentares", it: "sole debole oggi — conta sulle fonti alimentari" },
        "التهوية الذكية · جفاف الغسيل · غسيل السيارة — قراءات عملية من نفس بيانات موقعك": {
          en: "Smart ventilation, laundry drying and car wash — practical readings from the same data",
          fr: "Ventilation intelligente, séchage du linge et lavage de voiture — lectures pratiques des mêmes données",
          de: "Smarte Lüftung, Wäschetrocknung und Autowäsche — praktische Werte aus denselben Daten",
          es: "Ventilación inteligente, secado de la ropa y lavado del coche — lecturas prácticas de los mismos datos",
          pt: "Ventilação inteligente, secagem da roupa e lavagem do carro — leituras práticas dos mesmos dados",
          it: "Ventilazione intelligente, asciugatura dei panni e lavaggio dell’auto — letture pratiche dagli stessi dati",
        },
        "هواء خارجي لطيف ونقطة ندى منخفضة — افتح النوافذ حول {a} حتى {b} للتجديد الحراري بلا رطوبة زائدة.": {
          en: "Outdoor air is kind with a low dew point — open windows from {a} to {b} for a refresh without extra humidity.",
          fr: "Air extérieur doux et point de rosée bas — ouvrez les fenêtres de {a} à {b} pour un renouvellement sans humidité excessive.",
          de: "Sanfte Außenluft mit niedrigem Taupunkt — öffnen Sie die Fenster von {a} bis {b} zur Erfrischung ohne zusätzliche Feuchte.",
          es: "Aire exterior suave y punto de rocío bajo — abra las ventanas de {a} a {b} para renovar sin humedad extra.",
          pt: "Ar exterior suave e ponto de orvalho baixo — abra as janelas das {a} às {b} para renovar sem humidade extra.",
          it: "Aria esterna mite e punto di rugiada basso — apri le finestre dalle {a} alle {b} per rinnovare senza umidità extra.",
        },
        "ظروف متوسطة — نافذة التهوية الأفضل {a} حتى {b}، وافتح بشكل متقاطع لعشر دقائق بدل التعتيق الطويل.": {
          en: "Mixed conditions — the best window is {a} to {b}; prefer 10 minutes of cross-ventilation over long airing.",
          fr: "Conditions moyennes — la meilleure fenêtre va de {a} à {b} ; préférez dix minutes de ventilation croisée à une longue aération.",
          de: "Gemischte Bedingungen — das beste Fenster ist {a} bis {b}; lieber 10 Minuten Querlüftung als langes Lüften.",
          es: "Condiciones medias — la mejor ventana va de {a} a {b}; prefiera diez minutos de ventilación cruzada a un largo aireado.",
          pt: "Condições médias — a melhor janela vai das {a} às {b}; prefira dez minutos de ventilação cruzada a uma longa arejada.",
          it: "Condizioni medie — la finestra migliore va dalle {a} alle {b}; preferisci dieci minuti di ventilazione incrociata a una lunga aerazione.",
        },
        "يوم مغلق — رطوبة أو غبار خارجي مرتفع: أجّل فتح النوافذ وشغّل المنقي أو المكيف بوضع التجفيف.": {
          en: "Keep it shut — outdoor humidity or dust is high: postpone airing and run a purifier or the AC in dry mode.",
          fr: "Restez fermé — humidité ou poussière extérieure élevée : reportez l’aération et utilisez un purificateur ou la clim en mode sec.",
          de: "Fenster zu — Außenluftfeuchte oder Staub ist hoch: Lüften verschieben und einen Luftreiniger oder die Klimaanlage im Trockenmodus laufen lassen.",
          es: "Manténgalo cerrado — humedad o polvo exterior altos: posponga el aireado y use un purificador o el aire acondicionado en modo seco.",
          pt: "Mantenha fechado — humidade ou poeira exterior elevadas: adie a ventilação e use um purificador ou o AC em modo seco.",
          it: "Tieni chiuso — umidità o polvere esterna alte: rimanda l’areazione e usa un purificatore o l’AC in modalità secca.",
        },
        "PM10 الآن {v} µg/m³ — أحد عوامل الدرجة مع فرق نقطة الندى": { en: "PM10 now {v} µg/m³ — one of the score inputs alongside dew spread", fr: "PM10 maintenant {v} µg/m³ — l’un des paramètres du score avec l’écart au point de rosée", de: "PM10 jetzt {v} µg/m³ — einer der Bewertungsfaktoren neben der Taupunktdifferenz", es: "PM10 ahora {v} µg/m³ — uno de los factores de la puntuación junto al margen del punto de rocío", pt: "PM10 agora {v} µg/m³ — um dos fatores da pontuação junto ao afastamento do ponto de orvalho", it: "PM10 ora {v} µg/m³ — uno dei fattori del punteggio insieme allo scarto del punto di rugiada" },
        "الدرجة من نقطة الندى والحرارة والرياح": { en: "scored from dew point, temperature and wind", fr: "score calculé à partir du point de rosée, de la température et du vent", de: "Bewertung aus Taupunkt, Temperatur und Wind", es: "puntuación a partir del punto de rocío, la temperatura y el viento", pt: "pontuação a partir do ponto de orvalho, da temperatura e do vento", it: "punteggio da punto di rugiada, temperatura e vento" },
        "تعذّر قراءة طقس هذه النقطة. حاول مرة أخرى.": {
          en: "Couldn't read the weather at this point. Try again.",
          fr: "Impossible de lire la météo de ce point. Réessayez.",
          de: "Wetter an diesem Punkt nicht lesbar. Versuchen Sie es erneut.",
          es: "No se pudo leer el clima de este punto. Inténtelo de nuevo.",
          pt: "Não foi possível ler o tempo neste ponto. Tente novamente.",
          it: "Impossibile leggere il meteo di questo punto. Riprova.",
        },
        "الكمية": { en: "Amount", fr: "Quantité", de: "Menge", es: "Cantidad", pt: "Quantidade", it: "Quantità" },
        "قراءة موحدة: انحرافات SEAS5 عن مناخ العقد + التفسير العملي — بطاقة واحدة بدل البطاقات المتكررة": {
          en: "One unified read: SEAS5 anomalies vs decade climate plus the practical interpretation — a single card instead of repeated ones",
          fr: "Une lecture unifiée : anomalies SEAS5 par rapport au climat de la décennie et interprétation pratique — une seule carte au lieu des cartes répétées",
          de: "Eine einheitliche Lesart: SEAS5-Anomalien gegenüber dem Jahrzehntsklima plus praktische Deutung — eine einzige Karte statt wiederholter Karten",
          es: "Una lectura unificada: anomalías SEAS5 frente al clima de la década y la interpretación práctica — una sola tarjeta en lugar de tarjetas repetidas",
          pt: "Uma leitura unificada: anomalias SEAS5 face ao clima da década e a interpretação prática — um único cartão em vez de cartões repetidos",
          it: "Una lettura unificata: anomalie SEAS5 rispetto al clima del decennio e interpretazione pratica — una sola scheda invece di schede ripetute",
        },
      });
    } catch (e) { /* القاموس اختياري في بيئة الاختبار */ }
    const T = (ar) => {
      const lang = String(B.lang?.() || "ar").slice(0, 2);
      if (lang === "ar") return ar;
      return L10N[lang]?.[ar] ?? L10N.en?.[ar] ?? ar;
    };

    /* ══ CSS الداخلي لطبقة v51 — يُحقن مرة واحدة (style-src unsafe-inline مسموح) ══ */
    function injectCSS() {
      if ($("#v51-style")) return;
      const st = document.createElement("style");
      st.id = "v51-style";
      st.textContent = `
      /* ═══ شريط الشخصيات الذكي ═══ */
      .v51-persona-bar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin: 4px 0 14px;
        padding: 10px 12px; border:1px solid var(--line); border-radius:18px;
        background: color-mix(in srgb, var(--card) 72%, transparent); backdrop-filter: blur(8px);
        box-shadow: var(--shadow-sm); }
      .v51-persona-btn { display:inline-flex; align-items:center; gap:6px; min-height:44px; padding: 8px 14px;
        border:1px solid var(--line); border-radius:999px; color:var(--muted); background:transparent;
        font-size:12.5px; font-weight:800; white-space:nowrap; transition: background 160ms ease, color 160ms ease, border-color 160ms ease; }
      .v51-persona-btn:hover { color:var(--teal); background:var(--teal-soft); }
      .v51-persona-btn[aria-pressed="true"] { color:#fffdf6; background:var(--teal); border-color:var(--teal);
        box-shadow: 0 5px 14px rgb(35 101 110 / 28%); }
      html[data-theme="dark"] .v51-persona-btn[aria-pressed="true"] { color:#14201e; }
      /* ═══ تعتيم الأقسام خارج الفئة المختارة ═══ */
      section.card.v51-dim { opacity: 0.42; filter: saturate(0.55); transition: opacity 300ms ease, filter 300ms ease; }
      section.card.v51-focus { box-shadow: 0 14px 34px color-mix(in srgb, var(--teal) 22%, transparent); border-color: color-mix(in srgb, var(--teal) 45%, var(--line)); }
      /* ═══ الخريطة الحرارية لتقويم 30 يومًا ═══ */
      .nm-day.v51-clickable { cursor: pointer; }
      .nm-day.v51-h-scorch { background: color-mix(in srgb, #d64545 20%, var(--card)); }
      .nm-day.v51-h-hot    { background: color-mix(in srgb, #e8905a 20%, var(--card)); }
      .nm-day.v51-h-warm   { background: color-mix(in srgb, #e6c465 18%, var(--card)); }
      .nm-day.v51-h-mild   { background: color-mix(in srgb, #7cc4a0 16%, var(--card)); }
      .nm-day.v51-h-cool   { background: color-mix(in srgb, #7fa9d6 16%, var(--card)); }
      .nm-day.v51-h-cold   { background: color-mix(in srgb, #8e9bc4 20%, var(--card)); }
      .v51-rain { display:inline-flex; align-items:center; gap:2px; margin-top:2px; padding:1px 6px; border-radius:999px;
        font-size:9.5px; font-weight:800; color:#22506e; background: color-mix(in srgb, #7fb3d5 30%, transparent); }
      html[data-theme="dark"] .v51-rain { color:#bfe0f5; background: color-mix(in srgb, #55a4d4 26%, transparent); }
      /* ═══ بطاقة تفاصيل اليوم (Bottom Sheet) ═══ */
      #v51-day-sheet { position: fixed; inset: 0; z-index: 7600; display: none; }
      #v51-day-sheet.open { display: block; }
      .v51-sheet-backdrop { position:absolute; inset:0; background: rgb(9 24 28 / 55%); backdrop-filter: blur(3px); }
      .v51-sheet-panel { position:absolute; bottom:0; left:50%; transform: translateX(-50%); width:min(680px, 100%);
        max-height: 88dvh; overflow:auto; border-radius: 26px 26px 0 0; padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
        background: var(--card); border:1px solid var(--line); box-shadow: 0 -18px 60px rgb(0 0 0 / 35%); }
      .v51-sheet-close { position:absolute; top:12px; inset-inline-end:12px; width:40px; height:40px; border-radius:50%;
        border:1px solid var(--line); background:var(--paper); color:var(--ink); font-size:15px; }
      .v51-sheet-head { display:flex; flex-direction:column; gap:6px; margin: 2px 6px 12px; }
      .v51-sheet-title { font-size:17px; font-weight:800; color:var(--ink); }
      .v51-rain-index { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:16px;
        background: color-mix(in srgb, var(--rain) 12%, var(--paper)); border:1px solid color-mix(in srgb, var(--rain) 30%, var(--line));
        font-size:13px; font-weight:800; color:var(--ink); }
      .v51-rain-index b { color: var(--rain); font-size:16px; }
      .v51-periods { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
      @media (max-width: 640px) { .v51-periods { grid-template-columns: 1fr; } }
      .v51-period { border:1px solid var(--line); border-radius:16px; padding:12px 12px 10px; background:var(--paper); }
      .v51-period h4 { margin:0 0 8px; font-size:13px; color:var(--teal-strong); display:flex; align-items:center; gap:6px; }
      .v51-period .vp-row { display:flex; justify-content:space-between; gap:8px; font-size:12px; color:var(--ink); padding:3px 0; }
      .v51-period .vp-row span { color: var(--muted); }
      .v51-period .vp-row b { font-weight:800; }
      .v51-alert { margin-top:8px; padding:7px 10px; border-radius:12px; font-size:11.5px; font-weight:700; }
      .v51-alert.fog { background: color-mix(in srgb, #8e9bc4 18%, transparent); color:#3c4668; }
      html[data-theme="dark"] .v51-alert.fog { color:#c0c9ea; }
      .v51-alert.cold { background: color-mix(in srgb, #7fa9d6 20%, transparent); color:#274b73; }
      html[data-theme="dark"] .v51-alert.cold { color:#bcd6f2; }
      .v51-tip { margin-top:12px; padding:12px 14px; border-radius:16px; background: color-mix(in srgb, var(--gold) 14%, var(--paper));
        border:1px solid color-mix(in srgb, var(--gold) 40%, var(--line)); }
      .v51-tip h4 { margin:0 0 6px; font-size:13px; color:var(--gold-deep); }
      .v51-tip p { margin:0; font-size:12.5px; line-height:1.8; color:var(--ink); }
      .v51-sheet-actions { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
      /* ═══ شارات درجة الشهر + الأفضل/الأقسى ═══ */
      .v51-month-score { display:flex; flex-direction:column; gap:3px; margin-top:10px; padding-top:9px;
        border-top:1px dashed var(--line); font-size:10.5px; }
      .v51-month-score .ms-top { display:flex; align-items:center; justify-content:space-between; gap:6px; }
      .v51-month-score b { font-size:15px; font-weight:800; color:var(--teal-strong); }
      .v51-month-score[data-band="poor"] b { color: var(--danger); }
      .v51-month-score[data-band="fair"] b { color: var(--gold-deep); }
      .v51-month-score small { color:var(--muted); font-weight:700; }
      .v51-month-flag { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px; font-size:10px; font-weight:800; }
      .v51-month-flag.best { color:#fffdf6; background: var(--gold); }
      .v51-month-flag.hard { color:#fffdf6; background: var(--danger); }
      /* ═══ آلة الزمن المناخي — v56: بطاقة تحليل مناخي عالمية فاخرة (Luxury Climate Analysis Card)
         بنمط Apple Weather / Windy: شريط تاريخ زجاجي + 3 بطاقات قياسية متساوية الارتفاع
         + رسم بياني نظيف — باتجاه صحيح RTL للعربية وLTR لباقي اللغات عبر الخصائص المنطقية ═══ */
      .v56-tm-hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;
        margin:2px 0 16px; padding:14px 18px; border-radius:18px;
        border:1px solid color-mix(in srgb, var(--teal) 22%, var(--line));
        background:linear-gradient(135deg, color-mix(in srgb, var(--teal) 10%, transparent), color-mix(in srgb, var(--gold) 7%, transparent));
        box-shadow:var(--shadow-sm); }
      .v56-tm-hero .tm-hero-title { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:var(--ink); }
      .v56-tm-hero .tm-hero-badge { padding:4px 12px; border-radius:999px; font-size:11px; font-weight:800;
        color:var(--teal-strong); font-variant-numeric:tabular-nums; letter-spacing:.04em;
        background:color-mix(in srgb, var(--teal) 14%, transparent);
        border:1px solid color-mix(in srgb, var(--teal) 30%, transparent); }
      /* ① شريط اختيار التاريخ الزجاجي (Glass Date Pill Bar) */
      .v56-glass-bar { display:flex; flex-wrap:wrap; gap:10px; align-items:stretch; margin:0 0 6px;
        padding:12px; border-radius:14px;
        border:1px solid color-mix(in srgb, var(--teal) 30%, transparent);
        background:linear-gradient(160deg, color-mix(in srgb, var(--card) 84%, transparent), color-mix(in srgb, var(--teal-soft) 50%, transparent));
        -webkit-backdrop-filter: blur(10px) saturate(1.25); backdrop-filter: blur(10px) saturate(1.25);
        box-shadow:0 10px 26px color-mix(in srgb, var(--teal) 12%, transparent), inset 0 1px 0 color-mix(in srgb, #ffffff 42%, transparent); }
      .v56-glass-field { display:flex; flex-direction:column; gap:6px; flex:1 1 150px; min-width:148px; }
      .v56-glass-field > label { font-size:11px; font-weight:800; color:var(--muted); letter-spacing:.03em; }
      .v56-glass-select {
        appearance:none; -webkit-appearance:none; font-family:inherit; text-align:start; min-height:44px;
        padding:10px 14px; padding-inline-end:36px; border-radius:14px; font-size:14px; font-weight:800;
        color:var(--ink); font-variant-numeric:tabular-nums; cursor:pointer;
        border:1px solid color-mix(in srgb, var(--teal) 30%, var(--line));
        background-color:color-mix(in srgb, var(--card) 90%, transparent);
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23586b68' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat:no-repeat; background-position:left 13px center;
        transition:border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }
      html[dir="ltr"] .v56-glass-select { background-position:right 13px center; padding-inline:14px 36px; }
      .v56-glass-select:hover { border-color:var(--teal); }
      .v56-glass-select:focus-visible { outline:none; border-color:var(--teal);
        box-shadow:0 0 0 3px color-mix(in srgb, var(--teal) 20%, transparent); }
      .v56-glass-run {
        min-height:44px; align-self:flex-end; padding:0 22px; border-radius:14px; font-weight:800;
        font-family:inherit; font-size:13.5px; letter-spacing:.02em; cursor:pointer;
        color:#fffdf6; border:1px solid color-mix(in srgb, var(--teal) 55%, transparent);
        background:linear-gradient(150deg, var(--teal), var(--teal-strong));
        box-shadow:0 8px 18px color-mix(in srgb, var(--teal) 30%, transparent);
        transition:transform 140ms ease, box-shadow 160ms ease, filter 160ms ease;
      }
      html[data-theme="dark"] .v56-glass-run { color:#eafff7; }
      .v56-glass-run:hover { filter:brightness(1.06); }
      .v56-glass-run:active { transform:scale(.985); }
      .v56-tm-note { color:var(--muted); font-size:11px; margin:8px 2px 14px; line-height:1.8; }
      /* ② شبكة الأرقام القياسية الثلاثية (3-Column Record Cards) — متساوية الارتفاع وتباين لوني واضح */
      .v56-rec-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; margin:16px 0 4px; }
      @media (max-width: 620px) { .v56-rec-grid { grid-template-columns:1fr; } }
      .v56-rec-card { position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; gap:6px;
        min-height:122px; padding:15px 16px 13px; border-radius:18px; border:1px solid transparent;
        background:color-mix(in srgb, var(--card) 84%, transparent); box-shadow:var(--shadow-sm);
        word-break:break-word; overflow-wrap:anywhere; }
      .v56-rec-card::before { content:""; position:absolute; inset-inline-start:0; top:0; bottom:0; width:4px; }
      .v56-rec-card .rc-head { font-size:11.5px; color:var(--muted); font-weight:800; display:flex; gap:7px; align-items:center; letter-spacing:.02em; }
      .v56-rec-card .rc-val { font-size:26px; font-weight:800; font-variant-numeric:tabular-nums; line-height:1.18; }
      .v56-rec-card .rc-sub { display:inline-flex; align-items:center; gap:5px; margin-top:4px; padding:3px 11px; align-self:flex-start;
        border-radius:999px; font-size:11px; font-weight:800; color:var(--ink); font-variant-numeric:tabular-nums;
        background:color-mix(in srgb, var(--ink) 7%, transparent);
        border:1px solid color-mix(in srgb, var(--ink) 14%, transparent); }
      .v56-rec-card[data-kind="hot"] { border-color:color-mix(in srgb, #ef7d3a 40%, transparent);
        background:linear-gradient(150deg, color-mix(in srgb, #ef7d3a 15%, var(--card)), color-mix(in srgb, var(--card) 86%, transparent)); }
      .v56-rec-card[data-kind="hot"]::before { background:linear-gradient(180deg, #ffb26b, #ef7d3a); }
      .v56-rec-card[data-kind="hot"] .rc-val { color:#c2531b; }
      html[data-theme="dark"] .v56-rec-card[data-kind="hot"] .rc-val { color:#ffb26b; }
      .v56-rec-card[data-kind="cold"] { border-color:color-mix(in srgb, #7fc7ff 45%, transparent);
        background:linear-gradient(150deg, color-mix(in srgb, #7fc7ff 17%, var(--card)), color-mix(in srgb, var(--card) 86%, transparent)); }
      .v56-rec-card[data-kind="cold"]::before { background:linear-gradient(180deg, #bfe3ff, #6db6f2); }
      .v56-rec-card[data-kind="cold"] .rc-val { color:#1e5f96; }
      html[data-theme="dark"] .v56-rec-card[data-kind="cold"] .rc-val { color:#9fd6ff; }
      .v56-rec-card[data-kind="wet"] { border-color:color-mix(in srgb, #38bdf8 45%, transparent);
        background:linear-gradient(150deg, color-mix(in srgb, #38bdf8 16%, var(--card)), color-mix(in srgb, var(--card) 86%, transparent)); }
      .v56-rec-card[data-kind="wet"]::before { background:linear-gradient(180deg, #7ddcf8, #0ea5e9); }
      .v56-rec-card[data-kind="wet"] .rc-val { color:#0b7285; }
      html[data-theme="dark"] .v56-rec-card[data-kind="wet"] .rc-val { color:#67e0ff; }
      /* ③ الرسم البياني النظيف لاتجاه 20 سنة + ملخص نصي من جملة واحدة */
      .v56-chart-card { margin:14px 0 4px; padding:13px 15px 11px; border-radius:18px;
        border:1px solid color-mix(in srgb, var(--teal) 22%, var(--line));
        background:linear-gradient(180deg, color-mix(in srgb, var(--teal-soft) 32%, transparent), color-mix(in srgb, var(--card) 88%, transparent) 52%, color-mix(in srgb, var(--gold) 6%, transparent));
        box-shadow:var(--shadow-sm); }
      .v56-chart-sum { display:flex; align-items:flex-start; gap:8px; margin:2px 2px 10px; font-size:12.5px; font-weight:700;
        color:var(--ink); line-height:1.85; }
      .v56-chart-sum .cs-ico { flex:0 0 auto; font-size:14px; line-height:1.6; }
      .v51-tm-svg { width:100%; height:auto; display:block; color:var(--ink); }
      /* ═══ بطاقة المستشار الاستراتيجي الموحد ═══ */
      #v51-seasonal-strategic .v51-sec-tools { display:inline-flex; gap:6px; }
      #v51-seasonal-host > section { border:0 !important; box-shadow:none !important; background:transparent !important;
        padding: 8px 4px 4px !important; margin:0 !important; }
      #v51-seasonal-host > section + section { border-top: 1px dashed var(--line) !important; }
      /* ═══ أدوات القسم (استماع/كصورة) ═══ */
      .v51-sec-tools { display:inline-flex; gap:6px; flex:0 0 auto; }
      /* ═══ شريط الساعات الخضراء ═══ */
      .v51-strip { display:flex; gap:4px; margin: 8px 0 4px; }
      .v51-strip-cell { flex:1 1 0; min-width:0; border-radius:10px; padding:7px 2px; text-align:center; border:1px solid transparent; }
      .v51-strip-cell .st-t { display:block; font-size:9.5px; font-weight:800; color:var(--muted); }
      .v51-strip-cell .st-v { display:block; font-size:12px; font-weight:800; margin-top:2px; }
      .v51-strip-cell[data-band="good"] { background: color-mix(in srgb, #35a06a 22%, var(--card)); color:#14532d; border-color: color-mix(in srgb, #35a06a 45%, transparent); }
      html[data-theme="dark"] .v51-strip-cell[data-band="good"] { color:#c9f2dc; }
      .v51-strip-cell[data-band="fair"] { background: color-mix(in srgb, #e6c465 26%, var(--card)); color:#6b4d0d; border-color: color-mix(in srgb, #e6c465 50%, transparent); }
      html[data-theme="dark"] .v51-strip-cell[data-band="fair"] { color:#f4e3b0; }
      .v51-strip-cell[data-band="poor"] { background: color-mix(in srgb, #d64545 18%, var(--card)); color:#7f1d1d; border-color: color-mix(in srgb, #d64545 40%, transparent); }
      html[data-theme="dark"] .v51-strip-cell[data-band="poor"] { color:#f3c1c1; }
      .v51-strip-cell.v51-best { box-shadow: 0 0 0 2px color-mix(in srgb, #35a06a 55%, transparent) inset; }
      .v51-strip-cell.v51-best .st-t::after { content: " 🎯"; }
      /* ═══ بطاقات v51 داخل أقسام جوّك ═══ */
      .v51-mini-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin: 10px 0; }
      @media (max-width: 640px) { .v51-mini-grid { grid-template-columns: 1fr; } }
      .v51-kv { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; font-size:12.5px; border-bottom:1px dashed var(--line); }
      .v51-kv:last-child { border-bottom:0; }
      .v51-kv span { color:var(--muted); }
      .v51-kv b { font-weight:800; color:var(--ink); }
      .v51-check { display:flex; align-items:center; gap:8px; padding:7px 0; font-size:12.5px; border-bottom:1px dashed var(--line); }
      .v51-check:last-child { border-bottom:0; }
      .v51-check .ck-ico { font-size:15px; flex:0 0 auto; }
      .v51-check .ck-lbl { flex:1 1 auto; min-width:0; }
      .v51-check .ck-val { font-weight:800; flex:0 0 auto; }
      .v51-check[data-ok="1"] .ck-val { color: var(--ok); }
      .v51-check[data-ok="0"] .ck-val { color: var(--warn); }
      .v51-check[data-ok="-1"] .ck-val { color: var(--danger); }
      .v51-drone-pick { display:flex; gap:8px; margin: 8px 0 4px; flex-wrap:wrap; }
      .v51-drone-pick button { min-height:44px; padding: 9px 16px; border-radius:999px; border:1px solid var(--line);
        background:transparent; color:var(--muted); font-weight:800; font-size:12.5px; }
      .v51-drone-pick button[aria-pressed="true"] { color:#fffdf6; background:var(--teal); border-color:var(--teal); }
      html[data-theme="dark"] .v51-drone-pick button[aria-pressed="true"] { color:#14201e; }
      .v51-bars { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
      .v51-bar-row { display:flex; align-items:center; gap:10px; font-size:11.5px; }
      .v51-bar-row .br-lbl { flex:0 0 auto; width:76px; color:var(--muted); font-weight:800; }
      .v51-bar-row .br-track { flex:1 1 auto; height:9px; border-radius:5px; background:var(--line); overflow:hidden; }
      .v51-bar-row .br-track b { display:block; height:100%; border-radius:5px; }
      .v51-bar-row .br-val { flex:0 0 auto; width:70px; text-align:end; font-weight:800; color:var(--ink); }
      .v51-legend { color:var(--muted); font-size:10.5px; margin: 4px 2px 0; }
      `;
      document.head.appendChild(st);
    }

    /* ═══ أدوات مشتركة ═══ */
    const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
    const hourLabel = (iso) => String(iso || "").slice(11, 16) || "—";
    const dayNameOf = (iso) => {
      try {
        return new Intl.DateTimeFormat(isAr() ? "ar-EG" : (B.lang?.() || "en"), { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T12:00:00Z`));
      } catch (e) { return iso; }
    };
    const modeCode = (codes) => {
      const c = {};
      codes.forEach((x) => { if (x != null) c[x] = (c[x] || 0) + 1; });
      const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
      return best ? Number(best[0]) : 0;
    };

    /* ── النطق الموحد: عبر المحرك v48b/v51 (تنقية + صوت رجل عربي + قفل جلسات
       + تفريغ 60ms) — والقفل الزمني 400ms يُطبَّق في مرحلة الالتقاط على كل
       عنصر يحمل صنف v51-listen حصرًا ── */
    function toggleSpeak(btn, text) {
      if (typeof speechSynthesis === "undefined") return;
      if (btn.dataset.speaking === "1") {
        delete btn.dataset.speaking;
        try { window.stopAllSpeech?.(); } catch (e) {}
        try { speechSynthesis.cancel?.(); } catch (e) {}
        return;
      }
      if (!text) return;
      const u = new SpeechSynthesisUtterance(text);
      btn.dataset.speaking = "1";
      u.onend = () => { delete btn.dataset.speaking; };
      u.onerror = () => { delete btn.dataset.speaking; };
      try { speechSynthesis.speak(u); } catch (e) { delete btn.dataset.speaking; }
    }
    /* ملخص نصي للقسم من محتواه الحقيقي (بلا اختلاق) */
    function sectionSpeechText(sec, title) {
      const bits = [title];
      $$(".adv-title, .adv-msg, .joq-verdict, .adv-when", sec).forEach((n) => {
        const t2 = String(n.textContent || "").replace(/\s+/g, " ").trim();
        if (t2 && t2.length > 3 && !t2.includes("— —")) bits.push(t2);
      });
      return smartCut(bits.join(". ").replace(/\s*\.\s*\./g, "."), 620); /* v70 — C-03: قطع ذكي بلا بتر كلمات */
    }

    /* ── مشاركة كصورة: بطاقة أنيقة 1080×1350 من نص القسم ── */
    async function shareAsImage(title, lines) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080; canvas.height = 1350;
        const ctx = canvas.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, 1080 * 0.7, 1350);
        g.addColorStop(0, "#1d525a"); g.addColorStop(1, "#2f7f8c");
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1350);
        ctx.fillStyle = "rgba(255,250,240,0.9)";
        ctx.font = "700 34px 'Segoe UI', Tahoma, Arial, sans-serif";
        ctx.textAlign = "right"; ctx.direction = "rtl";
        ctx.fillText(`مَطَر برو · ${new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" }).format(new Date())}`, 1010, 90);
        ctx.fillStyle = "#ffe9b8";
        ctx.font = "800 52px 'Segoe UI', Tahoma, Arial, sans-serif";
        wrapText(ctx, title, 1010, 190, 940, 64);
        ctx.fillStyle = "#fffaf0";
        ctx.font = "600 33px 'Segoe UI', Tahoma, Arial, sans-serif";
        let y = 330;
        (lines || []).slice(0, 11).forEach((ln) => {
          if (y > 1240) return;
          y = wrapText(ctx, ln, 1010, y, 940, 46) + 16;
        });
        /* v52: ختم الشعار العالمي الرسمي في زاوية بطاقة المشاركة الزراعية */
        try { window.__matarDrawLogoStamp?.(ctx, 88, 1262, 56); } catch (e) {}
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        const file = new File([blob], "matar-pro.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file], title }); return; } catch (e) { /* ألغى المستخدم */ }
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "matar-pro-v52.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } catch (e) { /* زينة لا تكسر شيئًا */ }
    }
    function wrapText(ctx, text, x, y, maxW, lh) {
      const words = String(text || "").split(/\s+/);
      let line = "", yy = y;
      words.forEach((w) => {
        const t2 = line ? line + " " + w : w;
        if (ctx.measureText(t2).width > maxW) { ctx.fillText(line, x, yy); yy += lh; line = w; }
        else line = t2;
      });
      if (line) { ctx.fillText(line, x, yy); yy += lh; }
      return yy;
    }

    /* ══ رصد فتح الصفحات (Lazy Loading Gate) — body[data-page] يتغير عند showPage ══ */
    function onPageShow(id, fn) {
      let last = document.body?.dataset?.page === id;
      if (last) setTimeout(fn, 60);
      if ("MutationObserver" in window && document.body) {
        new MutationObserver(() => {
          const cur = document.body?.dataset?.page === id;
          if (cur && !last) setTimeout(fn, 60);
          last = cur;
        }).observe(document.body, { attributes: true, attributeFilter: ["data-page"] });
      }
      document.addEventListener("matar:data", () => { if (document.body?.dataset?.page === id) setTimeout(fn, 30); });
      document.addEventListener("matar:unit", () => { if (document.body?.dataset?.page === id) setTimeout(fn, 30); });
    }

    /* ═══════════════════════════════════════════════════════════════
       ② التوقعات الشهرية — Seasonal & Climate Hub
       ═══════════════════════════════════════════════════════════════ */
    let monthScores = null;
    let monthFacts = null;
    let calObserved = false;
    let gridObserved = false;

    /* درجة ملاءمة الشهر للسفر من 100٪: راحة الحرارة 50٪ + جفاف معتدل 28٪
       + اعتدال الانحراف عن المناخ 22٪ — أرقام استرشادية من SEAS5 نفسها */
    function monthScoreOf(r) {
      const t = r.temp;
      let tS;
      if (t == null) tS = 0.5;
      else if (t >= 18 && t <= 27) tS = 1;
      else if (t < 18) tS = clamp((t + 8) / 26, 0.05, 1);
      else tS = clamp((40 - t) / 13, 0.05, 1);
      const rain = r.rain ?? 0;
      const rS = clamp(1 - rain / 130, 0.12, 1);
      const mild = r.delta == null ? 0.7 : clamp(1 - Math.abs(r.delta) / 6, 0.2, 1);
      return Math.round(100 * (0.5 * tS + 0.28 * rS + 0.22 * mild));
    }

    function applyMonthBadges() {
      const grid = $("#monthly-grid");
      if (!grid || !monthScores) return;
      const cards = $$(".month-card", grid);
      cards.forEach((card, i) => {
        const s = monthScores[i];
        const stamp = `${s?.score ?? ""}:${s?.flag ?? ""}`;
        const existing = card.querySelector(".v51-month-score");
        if (existing && existing.dataset.stamp === stamp) return;
        if (existing) existing.remove();
        if (!s) return;
        card.dataset.v51ScoreStamp = stamp;
        const band = s.score >= 72 ? "good" : s.score >= 55 ? "fair" : "poor";
        const div = document.createElement("div");
        div.className = "v51-month-score";
        div.dataset.band = band;
        div.dataset.stamp = stamp;
        div.innerHTML = `
          <div class="ms-top"><small>${escapeHtml(T("ملاءمة السفر"))}</small><b>${localNum(s.score)}٪</b></div>
          ${s.flag ? `<span class="v51-month-flag ${s.flag === "best" ? "best" : "hard"}">${s.flag === "best" ? "🏆 " + escapeHtml(T("الأفضل للزيارة")) : "⚠️ " + escapeHtml(T("طقس قاسٍ"))}</span>` : ""}`;
        card.appendChild(div);
      });
    }

    function watchMonthGrid() {
      const grid = $("#monthly-grid");
      if (!grid || gridObserved) return;
      gridObserved = true;
      /* المراقب يعيد التطبيق فقط عند بطاقات جديدة بلا شارة — فلا حلقة لا نهائية
         من إضافاتنا الخاصة (الشارات تُضاف مرّة واحدة لكل بطاقة) */
      new MutationObserver(() => {
        const cards = $$(".month-card", grid);
        if (cards.some((c) => !c.querySelector(".v51-month-score"))) applyMonthBadges();
      }).observe(grid, { childList: true });
    }

    /* ══ التقويم التفاعلي: تلوين حراري + شارة مطر + فتح تفاصيل اليوم ══ */
    const heatBand = (t) => (t == null ? "" : t >= 40 ? "scorch" : t >= 35 ? "hot" : t >= 28 ? "warm" : t >= 18 ? "mild" : t >= 8 ? "cool" : "cold");
    function decorateCalendar() {
      const cal = $("#nm-calendar");
      if (!cal) return;
      $$(".nm-day[data-iso]", cal).forEach((cell) => {
        if (cell.dataset.v51 === "1") return;
        cell.dataset.v51 = "1";
        cell.classList.add("v51-clickable");
        const tmax = parseFloat(cell.dataset.tmax);
        const band = heatBand(Number.isFinite(tmax) ? tmax : null);
        if (band) cell.classList.add(`v51-h-${band}`);
        const pr = parseFloat(cell.dataset.pr || "0") || 0;
        const prob = cell.dataset.prob === "" ? null : parseFloat(cell.dataset.prob);
        if ((prob != null && prob >= 25) || pr >= 0.2) {
          const prEl = cell.querySelector(".nm-pr");
          if (prEl) prEl.style.display = "none";
          const chip = document.createElement("span");
          chip.className = "v51-rain";
          const pTxt = prob != null ? `${localNum(Math.round(prob))}٪` : "";
          const mTxt = pr >= 0.2 ? `${localNum(pr, 1)}${T("مم")}` : "";
          chip.textContent = `💧${pTxt}${pTxt && mTxt ? " · " : ""}${mTxt}`;
          cell.appendChild(chip);
        }
      });
    }
    function watchCalendar() {
      const cal = $("#nm-calendar");
      if (!cal || calObserved) return;
      calObserved = true;
      new MutationObserver(() => decorateCalendar()).observe(cal, { childList: true });
      /* النقر يفوَّض على الحاوية — ينجو من كل إعادة رسم داخلية */
      if (cal.dataset.v51wired !== "1") {
        cal.dataset.v51wired = "1";
        cal.addEventListener("click", (e) => {
          const cell = e.target.closest(".nm-day[data-iso]");
          if (cell) openDaySheet({ ...cell.dataset });
        });
      }
    }

    /* ══ بطاقة تفاصيل اليوم: أربعة فترات ══ */
    function hourlyPeriodsOf(h, iso) {
      const idxs = [];
      (h.time || []).forEach((t, i) => { if (t.startsWith(iso)) idxs.push(i); });
      if (idxs.length < 16) return null;
      const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
      const mH = rng(5, 11), nH = rng(12, 16), eH = rng(17, 20), gH = rng(21, 23);
      /* الليل: 21–23 من اليوم + 0–4 من اليوم التالي إن توافر */
      const nextIso = (() => { try { const d2 = new Date(`${iso}T12:00:00Z`); d2.setUTCDate(d2.getUTCDate() + 1); return d2.toISOString().slice(0, 10); } catch (e) { return null; } })();
      const gIdx = [];
      gH.forEach((hh) => { const k = idxs.find((x) => Number((h.time[x] || "").slice(11, 13)) === hh); if (k != null) gIdx.push(k); });
      if (nextIso) {
        (h.time || []).forEach((t, i) => { if (t.startsWith(nextIso) && Number(t.slice(11, 13)) <= 4) gIdx.push(i); });
      }
      const sum = (arr) => arr.reduce((s, v) => s + v, 0);
      const maxOf = (arr) => (arr.length ? Math.max(...arr) : null);
      const bucket = (kList) => ({
        t: mean(pickA(h.temperature_2m, kList)),
        app: mean(pickA(h.apparent_temperature, kList)),
        rh: mean(pickA(h.relative_humidity_2m, kList)),
        dew: mean(pickA(h.dew_point_2m, kList)),
        uv: maxOf(pickA(h.uv_index, kList)),
        wind: maxOf(pickA(h.wind_speed_10m, kList)),
        prob: maxOf(pickA(h.precipitation_probability, kList)),
        mm: sum(pickA(h.precipitation, kList)),
        codes: pickA(h.weather_code, kList),
      });
      function pickA(arr, kList) { return kList.map((i) => arr?.[i]).filter((v) => v != null); }
      return {
        src: "hourly",
        morning: bucket(mH), noon: bucket(nH), evening: bucket(eH), night: bucket(gIdx),
      };
    }
    function derivedPeriodsOf(d) {
      /* الأيام البعيدة (17-30): اشتقاق ذكي من العظمى والصغرى ومجموع الهطول
         اليومي — توزيع فيزيائي للحرارة على الفترات وتوزيع مطري واقعي */
      const tmax = Number.isFinite(parseFloat(d.tmax)) ? parseFloat(d.tmax) : null;
      const tmin = Number.isFinite(parseFloat(d.tmin)) ? parseFloat(d.tmin) : null;
      const pr = parseFloat(d.pr || "0") || 0;
      const prob = d.prob === "" || d.prob == null ? null : parseFloat(d.prob);
      if (tmax == null || tmin == null) return null;
      const span = Math.max(tmax - tmin, 4);
      const estProb = prob != null ? prob : (pr >= 1 ? 70 : pr >= 0.2 ? 45 : pr > 0 ? 25 : 8);
      return {
        src: "derived",
        morning: { t: tmin + span * 0.45, app: tmin + span * 0.45 - 1, prob: Math.round(estProb * 0.5), mm: pr * 0.15, rh: null, dew: null, uv: null, wind: null, codes: [Number(d.code || 0)] },
        noon: { t: tmax, app: tmax + 1.5, prob: estProb, mm: pr * 0.35, rh: null, dew: null, uv: null, wind: null, codes: [Number(d.code || 0)] },
        evening: { t: tmin + span * 0.55, app: tmin + span * 0.55 - 1, prob: Math.round(estProb * 0.7), mm: pr * 0.30, rh: null, dew: null, uv: null, wind: null, codes: [Number(d.code || 0)] },
        night: { t: tmin, app: tmin - 1.5, prob: Math.round(estProb * 0.45), mm: pr * 0.20, rh: null, dew: tmin != null ? tmin - 1 : null, uv: 0, wind: null, codes: [Number(d.code || 0)] },
      };
    }
    function dayPeriods(d) {
      const h = state.wx?.hourly;
      if (h?.time?.length) {
        const p = hourlyPeriodsOf(h, d.iso);
        if (p) return p;
      }
      return derivedPeriodsOf(d);
    }

    function periodCardHTML(emoji, label, p, isNight) {
      if (!p) return `<div class="v51-period"><h4><span>${emoji}</span> ${escapeHtml(label)}</h4><div class="vp-row"><span>—</span><b>—</b></div></div>`;
      const rows = [];
      const mmTxt = (v) => (v == null || v <= 0.05 ? "0" : localNum(v, 1));
      if (isNight) {
        rows.push([T("الصغرى"), p.t != null ? tempText(p.t) : "—"]);
        rows.push([T("نقطة الندى"), p.dew != null ? tempText(p.dew) : "—"]);
        rows.push([T("احتمال المطر"), p.prob != null ? `${localNum(Math.round(p.prob))}٪ · ${mmTxt(p.mm)} ${T("مم")}` : "—"]);
      } else {
        rows.push([T("الحرارة"), p.t != null ? tempText(p.t) : "—"]);
        rows.push([T("الإحساس الفعلي"), p.app != null ? tempText(p.app) : "—"]);
        if (p.uv != null && p.uv > 0) rows.push([T("الأشعة فوق البنفسجية"), localNum(p.uv, 1)]);
        if (p.rh != null) rows.push([T("الرطوبة"), `${localNum(Math.round(p.rh))}٪`]);
        if (p.wind != null) rows.push([T("الرياح"), `${localNum(p.wind, 0)} ${T("كم/س")}`]);
        rows.push([T("احتمال المطر"), p.prob != null ? `${localNum(Math.round(p.prob))}٪ · ${mmTxt(p.mm)} ${T("مم")}` : "—"]);
      }
      const alerts = [];
      if (isNight && p.t != null && p.dew != null && (p.t - p.dew) < 2.5) alerts.push(`<div class="v51-alert fog">🌫️ ${escapeHtml(tx("ضباب أو شبورة محتملة ليلاً — الرطوبة قرب التشبع", "Fog or dew possible overnight — humidity near saturation"))}</div>`);
      if (isNight && p.t != null && p.t < 10) alerts.push(`<div class="v51-alert cold">🧊 ${escapeHtml(tx("ليلة باردة — طبقة دافئة إن كنت خارجًا متأخرًا", "Cold night — a warm layer if you are out late"))}</div>`);
      return `
        <div class="v51-period">
          <h4><span>${emoji}</span> ${escapeHtml(label)}</h4>
          ${rows.map(([k, v]) => `<div class="vp-row"><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join("")}
          ${p.codes?.length ? `<div class="vp-row"><span>${escapeHtml(T("حالة السماء"))}</span><b>${escapeHtml(wmoDesc(modeCode(p.codes)))}</b></div>` : ""}
          ${alerts.join("")}
        </div>`;
    }

    function recommendFor(d, periods) {
      const tmax = Number.isFinite(parseFloat(d.tmax)) ? parseFloat(d.tmax) : null;
      const tmin = Number.isFinite(parseFloat(d.tmin)) ? parseFloat(d.tmin) : null;
      const pr = parseFloat(d.pr || "0") || 0;
      const prob = d.prob === "" || d.prob == null ? null : parseFloat(d.prob);
      const totalMm = periods ? [periods.morning, periods.noon, periods.evening, periods.night].reduce((s, x) => s + (x.mm || 0), 0) : pr;
      const code = Number(d.code || 0);
      if (code >= 95 || (periods && [periods.morning, periods.noon, periods.evening, periods.night].some((x) => (x.codes || []).some((c) => c >= 95))))
        return tx("عاصفة رعدية متوقعة — أجّل الأنشطة الخارجية كليًا وخطط ليوم داخلي، وتجنب المناطق المفتوحة والأشجار المنفردة.", "Thunderstorms expected — postpone all outdoor plans for an indoor day and avoid open areas and lone trees.");
      if (totalMm >= 3 || (prob != null && prob >= 65) || pr >= 3)
        return tx("يوم ماطر بوضوح — جهّز بديلًا داخليًا واحمل مظلة، ونوافذ رحلتك حول ذروة المطر في الفترات أعلاه.", "A clearly wet day — plan an indoor alternative, carry an umbrella and route around the rain peak shown above.");
      if (tmax != null && tmax >= 38)
        return tx("حر شديد — أنشئتك في الصباح الباكر حصرًا، ماء على كل نصف ساعة، وظل دائم، وتجنب الظهيرة تمامًا.", "Severe heat — keep activity to the early morning, water every half hour, stay in shade and skip midday entirely.");
      if (tmax != null && tmax >= 33)
        return tx("يوم حار — المبكر والمتأخر أفضل ساعاتك، مع ماء وثقل خفيف، والظهيرة للظل والاستراحة.", "A hot day — early and late are your best hours with water and light clothing; keep midday for shade and rest.");
      if (tmin != null && tmin <= 5)
        return tx("ليلة باردة قرب الصقيع — طبقات دافئة صباحًا ومساءً، وانتبه لانزلاق الصباح على الجسور والجسور العلوية.", "A cold night near frost — warm layers morning and evening and watch icy patches on bridges early.");
      if (tmax != null && tmax >= 18 && tmax <= 30 && (prob == null || prob < 25) && pr < 0.2)
        return tx("يوم لطيف ومستقر — مثالي للأنشطة الخارجية والقعدات والمشي؛ التقط اللقطات وقت الذروة الضوئية قبل الغروب.", "A pleasant, stable day — ideal for outdoor plans, walks and gatherings; catch the golden light before sunset.");
      return tx("يوم معتدل بإمكانات جيدة — راقب شارة المطر أعلاه والتزم بالفترة الأنسب لخططك.", "A moderate day with good potential — watch the rain badge above and pick the most suitable period.");
    }

    let sheetEl = null;
    function ensureSheet() {
      if (sheetEl) return sheetEl;
      sheetEl = document.createElement("div");
      sheetEl.id = "v51-day-sheet";
      sheetEl.setAttribute("role", "dialog");
      sheetEl.setAttribute("aria-modal", "true");
      sheetEl.innerHTML = `
        <div class="v51-sheet-backdrop" data-close="1"></div>
        <div class="v51-sheet-panel" role="document" aria-label="${escapeHtml(T("تفاصيل اليوم"))}">
          <button type="button" class="v51-sheet-close" data-close="1" aria-label="${escapeHtml(T("إغلاق"))}">✕</button>
          <div id="v51-sheet-body"></div>
        </div>`;
      sheetEl.addEventListener("click", (e) => { if (e.target?.dataset?.close) closeSheet(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
      document.body.appendChild(sheetEl);
      return sheetEl;
    }
    function closeSheet() { sheetEl?.classList.remove("open"); }

    function openDaySheet(d) {
      const sheet = ensureSheet();
      const body = $("#v51-sheet-body", sheet);
      if (!body) return;
      const periods = dayPeriods(d);
      const prob = d.prob === "" || d.prob == null ? null : parseFloat(d.prob);
      const pr = parseFloat(d.pr || "0") || 0;
      const estProb = prob != null ? Math.round(prob) : (pr >= 1 ? 70 : pr >= 0.2 ? 45 : pr > 0 ? 25 : 8);
      const totalMm = periods ? [periods.morning, periods.noon, periods.evening, periods.night].reduce((s, x) => s + (x.mm || 0), 0) : pr;
      const tip = recommendFor(d, periods);
      const srcBadge = periods?.src === "hourly"
        ? `<span class="v51-month-flag best">${escapeHtml(T("بالنموذج الساعي الدقيق"))}</span>`
        : `<span class="v51-month-flag hard">${escapeHtml(T("تقديري"))}</span>`;
      const speakTxt = `${dayNameOf(d.iso)}. ${tx("احتمال المطر", "Rain chance")} ${localNum(estProb)}٪، ${tx("الكمية", "amount")} ${localNum(totalMm, 1)} ${T("مم")}. ${tx("العظمى", "High")} ${tempText(parseFloat(d.tmax))}، ${tx("الصغرى", "low")} ${tempText(parseFloat(d.tmin))}. ${tip}`;
      body.innerHTML = `
        <div class="v51-sheet-head">
          <div class="v51-sheet-title">📅 ${escapeHtml(dayNameOf(d.iso))}</div>
          <div class="v51-rain-index">🌧️ <span>${escapeHtml(T("مؤشر الأمطار الإجمالي"))}</span> <b>${localNum(estProb)}٪</b> · <b>${localNum(totalMm, 1)} ${escapeHtml(T("مم"))}</b> ${srcBadge}</div>
        </div>
        <div class="v51-periods">
          ${periodCardHTML("🌅", T("الصباح"), periods?.morning, false)}
          ${periodCardHTML("☀️", T("الظهيرة"), periods?.noon, false)}
          ${periodCardHTML("🌇", T("المساء"), periods?.evening, false)}
          ${periodCardHTML("🌙", T("الليل"), periods?.night, true)}
        </div>
        <div class="v51-tip">
          <h4>✨ ${escapeHtml(T("توصية اليوم الذكية"))}</h4>
          <p>${escapeHtml(tip)}</p>
        </div>
        <div class="v51-sheet-actions">
          <button type="button" class="ai-fresh v51-listen" data-speak-src="1" data-speak="${escapeHtml(speakTxt)}">🔊 <span>${escapeHtml(T("استمع لتفاصيل اليوم"))}</span></button>
        </div>`;
      const lbtn0 = body.querySelector(".v51-listen");
      /* v52: نسخة نظيفة قبل الربط — مسح أي مستمع موروث ثم onclick أحادي حصري */
      let lbtn = lbtn0;
      if (lbtn0) { lbtn = lbtn0.cloneNode(true); lbtn0.replaceWith(lbtn); }
      /* v51: onclick أحادي (لا EventListener مكرر) والقفل الزمني 400ms في الالتقاط */
      lbtn.onclick = () => toggleSpeak(lbtn, speakTxt);
      sheet.classList.add("open");
    }

    /* ══ آلة الزمن المناخي — منتقي تاريخ + سجل 20 سنة + منحنى ══ */
    const tmMemo = new Map(); // mmdd → Promise (جلسة واحدة)
    function fetchYearRow(place, year, mmdd) {
      const u = new URL("https://archive-api.open-meteo.com/v1/archive");
      u.search = new URLSearchParams({
        latitude: place.latitude.toFixed(3), longitude: place.longitude.toFixed(3),
        start_date: `${year}-${mmdd}`, end_date: `${year}-${mmdd}`,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum", timezone: "auto",
      });
      return fetch(u.toString()).then((r) => (r.ok ? r.json() : Promise.reject(new Error("http")))).then((j) => ({
        year,
        tmax: j?.daily?.temperature_2m_max?.[0] ?? null,
        tmin: j?.daily?.temperature_2m_min?.[0] ?? null,
        pr: j?.daily?.precipitation_sum?.[0] ?? null,
      }));
    }
    async function fetchTwoDecades(place, mmdd) {
      if (!place || typeof place.latitude !== "number") return [];
      const key = `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}:${mmdd}`;
      /* كاش 24 ساعة على الجهاز كي لا يثقل Archive الأرشيفي */
      try {
        const raw = localStorage.getItem(`matar:v51:tm:${key}`);
        if (raw) { const obj = JSON.parse(raw); if (obj?.ts && Date.now() - obj.ts < 86400000 && obj.rows?.length) return obj.rows; }
      } catch (e) {}
      if (tmMemo.has(key)) return tmMemo.get(key);
      const thisYear = new Date().getFullYear();
      const years = [];
      for (let y = thisYear - 20; y <= thisYear - 1; y += 1) years.push(y);
      const rows = [];
      let i = 0;
      const workers = Array.from({ length: 5 }, async () => {
        while (i < years.length) {
          const y = years[i++];
          /* 29 فبراير في سنوات غير كبيسة → 28 فبراير (سجل حقيقي بلا فشل) */
          let d = mmdd;
          if (d === "02-29") { const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; if (!leap) d = "02-28"; }
          try { rows.push(await fetchYearRow(place, y, d)); } catch (e) { /* سنة فاشلة لا تكسر البقية */ }
        }
      });
      const p = Promise.all(workers).then(() => {
        rows.sort((a, b) => a.year - b.year);
        try { localStorage.setItem(`matar:v51:tm:${key}`, JSON.stringify({ ts: Date.now(), rows })); } catch (e) {}
        tmMemo.delete(key);
        return rows;
      });
      tmMemo.set(key, p);
      return p;
    }
    function tmCurveSVG(rows) {
      const temps = rows.map((r) => r.tmax).filter((v) => v != null);
      if (temps.length < 3) return "";
      const W = 720, HH = 190, padL = 34, padR = 16, padT = 14, padB = 26;
      const all = rows.flatMap((r) => [r.tmax, r.tmin].filter((v) => v != null));
      const lo = Math.min(...all) - 1, hi = Math.max(...all) + 1;
      const xOf = (k) => padL + (k * (W - padL - padR)) / Math.max(rows.length - 1, 1);
      const yOf = (v) => padT + ((hi - v) * (HH - padT - padB)) / Math.max(hi - lo, 1);
      const maxPr = Math.max(...rows.map((r) => r.pr || 0), 1);
      const line = (key) => rows.map((r, k) => (r[key] == null ? null : `${xOf(k).toFixed(1)},${yOf(r[key]).toFixed(1)}`)).filter(Boolean).join(" ");
      const bars = rows.map((r, k) => (r.pr ? `<rect x="${(xOf(k) - 5).toFixed(1)}" y="${(HH - padB - ((r.pr / maxPr) * 52)).toFixed(1)}" width="10" height="${((r.pr / maxPr) * 52).toFixed(1)}" rx="2.5" fill="rgba(85,164,212,0.55)"/>` : "")).join("");
      const yLabels = [hi, (hi + lo) / 2, lo].map((v, k) => `<text x="${padL - 6}" y="${(yOf(v) + 4).toFixed(1)}" font-size="11" text-anchor="end" fill="currentColor" opacity="0.65">${localNum(Math.round(v))}°</text>`).join("");
      const xLabels = [0, Math.floor(rows.length / 2), rows.length - 1].map((k) => `<text x="${xOf(k).toFixed(1)}" y="${HH - 8}" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.65">${rows[k].year}</text>`).join("");
      return `<svg class="v51-tm-svg" viewBox="0 0 ${W} ${HH}" role="img" aria-label="${escapeHtml(T("المنحنى عبر عشرين سنة"))}">
        ${bars}
        <polyline points="${line("tmin")}" fill="none" stroke="#7fa9d6" stroke-width="2.4" stroke-dasharray="5 4"/>
        <polyline points="${line("tmax")}" fill="none" stroke="#e8905a" stroke-width="3"/>
        ${yLabels}${xLabels}</svg>`;
    }
    /* v56: الملخص النصي الواضح — جملة واحدة تقرأ الرقم القياسي الثلاثي واتجاه العشرين سنة */
    function tmSummary(rows, hi, lo, wet) {
      const n = rows.filter((r) => r.tmax != null).length;
      return tf(tx("عبر {n} سنة مسجلة: أعلى حرارة {h} في {y1}، وأبرد ليلة {c} في {y2}، وأكثر عام مطرًا {w} مم في {y3} — والمنحنى يتتبع اتجاه العشرين سنة كاملة.", "Across {n} recorded years: the record high is {h} in {y1}, the coldest night {c} in {y2}, and the wettest year {w} mm in {y3} — the curve traces the full 20-year trend."), { n: localNum(n), h: hi.tmax != null ? tempText(hi.tmax) : "—", y1: localNum(hi.year), c: lo.tmin != null ? tempText(lo.tmin) : "—", y2: localNum(lo.year), w: wet.pr != null ? localNum(wet.pr, 1) : "—", y3: localNum(wet.year) });
    }
    function buildTimePicker() {
      const pane = $("#monthly-time-pane");
      if (!pane || $("#v51-tm-picker")) return;
      const card = document.createElement("section");
      card.className = "card section";
      card.id = "v51-tm-picker";
      /* v54: القيمة الافتراضية = اليوم قبل 3 أيام (سجل ERA5 يتأخر أيامًا) */
      const def = new Date(Date.now() - 3 * 86400000);
      /* v54: أسماء الشهور بلغة الواجهة عبر Intl — بلا أي تنقل بين السنوات */
      const uiLang = String(B.lang?.() || "ar").slice(0, 2) || "ar";
      let monthNames = [];
      try {
        monthNames = Array.from({ length: 12 }, (x, m) =>
          new Intl.DateTimeFormat(uiLang, { month: "long" }).format(new Date(2024, m, 1)));
      } catch (e) {
        monthNames = Array.from({ length: 12 }, (x, m) =>
          new Date(2024, m, 1).toLocaleString(uiLang, { month: "long" }));
      }
      const dayOpts = Array.from({ length: 31 }, (x, i) => `<option value="${i + 1}">${localNum(i + 1)}</option>`).join("");
      const monthOpts = monthNames.map((nm, m) => `<option value="${m}">${escapeHtml(nm)}</option>`).join("");
      card.innerHTML = `
        <div class="sec-head">
          <div>
            <h2>🧭 ${escapeHtml(T("آلة الزمن المناخي — افحص أي يوم عبر 20 سنة"))}</h2>
            <p class="hint">${escapeHtml(tx("اختر أي تاريخ لعرض الرقم القياسي لأعلى حرارة وأقل حرارة وأكثر عام ممطر في ذلك اليوم تحديدًا — من سجل ERA5 الحقيقي", "Pick any date to see the record high, record low and wettest year for that exact day — from the real ERA5 archive"))}</p>
          </div>
          <span class="sec-badge">ERA5 · 20 ${escapeHtml(T("سنة"))}</span>
        </div>
        <div class="v56-tm-hero">
          <span class="tm-hero-title">🕰️ ${escapeHtml(tx("سجل ERA5 عبر عشرين سنة", "20-year ERA5 archive"))}</span>
          <span class="tm-hero-badge">📊 ${escapeHtml(tx("أعلى · أقل · أكثر مطرًا", "High · Low · Wettest"))}</span>
        </div>
        <div class="v56-glass-bar" role="group" aria-label="${escapeHtml(tx("شريط اختيار التاريخ الزجاجي", "Glass date selector"))}">
          <div class="v56-glass-field">
            <label for="v51-tm-day">${escapeHtml(T("اليوم"))}</label>
            <select id="v51-tm-day" class="v56-glass-select" aria-label="${escapeHtml(T("اختر اليوم"))}">${dayOpts}</select>
          </div>
          <div class="v56-glass-field">
            <label for="v51-tm-month">${escapeHtml(T("الشهر"))}</label>
            <select id="v51-tm-month" class="v56-glass-select" aria-label="${escapeHtml(T("اختر الشهر"))}">${monthOpts}</select>
          </div>
          <button type="button" class="v56-glass-run" id="v51-tm-run">${escapeHtml(T("افحص هذا التاريخ"))}</button>
        </div>
        <p class="v56-tm-note">${escapeHtml(tx("السجل الأرشيفي يتأخر أيامًا قليلة — اختر تاريخًا من الماضي. النتيجة تُخزَّن على جهازك 24 ساعة.", "The archive lags a few days — pick a past date. Results are cached on your device for 24 hours."))}</p>
        <div id="v51-tm-out"></div>`;
      pane.appendChild(card);
      const run = $("#v51-tm-run", card);
      const out = $("#v51-tm-out", card);
      const daySel = $("#v51-tm-day", card);
      const monthSel = $("#v51-tm-month", card);
      daySel.value = String(def.getDate());
      monthSel.value = String(def.getMonth());
      /* v54: عدد الأيام يتكيف مع الشهر المختار (29/30/31) — بلا تنقل بين السنوات
         (2024 سنة كبيسة للسماح بفحص يوم 29 فبراير عبر السجل) */
      const syncDays = () => {
        try {
          const m = parseInt(monthSel.value, 10) || 0;
          const dim = new Date(2024, m + 1, 0).getDate();
          Array.from(daySel.options).forEach((o, idx) => { o.disabled = idx + 1 > dim; });
          if ((parseInt(daySel.value, 10) || 1) > dim) daySel.value = String(dim);
        } catch (e) {}
      };
      monthSel.addEventListener("change", syncDays);
      syncDays();
      /* v51: onclick أحادي + جلب كسول بفعل المستخدم حصرًا */
      run.onclick = async () => {
        const dd = parseInt(daySel.value, 10), mm = parseInt(monthSel.value, 10);
        if (!dd || isNaN(mm)) return;
        const mmdd = `${String(mm + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        out.innerHTML = `<div class="loading" role="status"><strong>${escapeHtml(tx("نسافر عبر عشرين سنة من السجل…", "Travelling through twenty years of records…"))}</strong><div class="loading-bar"></div></div>`;
        try {
          const rows = await fetchTwoDecades(state.place, mmdd);
          const valid = rows.filter((r) => r.tmax != null || r.tmin != null);
          if (!valid.length) throw new Error("empty");
          const hiRow = valid.slice().sort((a, b) => (b.tmax ?? -99) - (a.tmax ?? -99))[0];
          const loRow = valid.slice().sort((a, b) => (a.tmin ?? 99) - (b.tmin ?? 99))[0];
          const wetRow = valid.slice().sort((a, b) => (b.pr ?? -1) - (a.pr ?? -1))[0];
          /* v56: شبكة الأرقام القياسية الثلاثية + رسم بياني نظيف بملخص من جملة واحدة */
          const svg = tmCurveSVG(rows);
          out.innerHTML = `
            <div class="v56-rec-grid">
              <div class="v56-rec-card" data-kind="hot"><span class="rc-head">🔥 ${escapeHtml(T("أعلى حرارة مسجلة"))}</span><span class="rc-val">${hiRow.tmax != null ? tempText(hiRow.tmax) : "—"}</span><span class="rc-sub">📅 ${localNum(hiRow.year)}</span></div>
              <div class="v56-rec-card" data-kind="cold"><span class="rc-head">❄️ ${escapeHtml(T("أبرد ليلة مسجلة"))}</span><span class="rc-val">${loRow.tmin != null ? tempText(loRow.tmin) : "—"}</span><span class="rc-sub">📅 ${localNum(loRow.year)}</span></div>
              <div class="v56-rec-card" data-kind="wet"><span class="rc-head">🌧️ ${escapeHtml(T("أكثر عام ممطر"))}</span><span class="rc-val">${wetRow.pr != null ? `${localNum(wetRow.pr, 1)} ${T("مم")}` : "—"}</span><span class="rc-sub">📅 ${localNum(wetRow.year)}</span></div>
            </div>
            ${svg ? `<div class="v56-chart-card"><p class="v56-chart-sum"><span class="cs-ico" aria-hidden="true">📈</span><span>${escapeHtml(tmSummary(rows, hiRow, loRow, wetRow))}</span></p>${svg}</div>` : ""}`;
        } catch (e) {
          out.innerHTML = `<div class="error-card" role="alert"><p>${escapeHtml(tx("تعذر جلب سجل هذا التاريخ — تحقق من الاتصال ثم أعد المحاولة.", "Couldn't load this date's record — check your connection and retry."))}</p></div>`;
        }
      };
    }

    /* ══ توحيد بطاقات المستشار الموسمي في بطاقة واحدة استراتيجية ══ */
    function unifySeasonalAdvisors() {
      const pane = $("#monthly-seasonal-pane");
      const adv = $("#seasonal-advisor");
      const read = $("#monthly-reading");
      if (!pane || !adv || !read || $("#v51-seasonal-strategic")) return;
      const advSec = adv.closest("section.card");
      const readSec = read.closest("section.card");
      if (!advSec || !readSec || advSec.contains(readSec)) return;
      const card = document.createElement("section");
      card.className = "card section";
      card.id = "v51-seasonal-strategic";
      card.innerHTML = `
        <div class="sec-head">
          <div>
            <h2>🎯 ${escapeHtml(T("المستشار الاستراتيجي الموسمي"))}</h2>
            <p class="hint">${escapeHtml(tx("قراءة موحدة: انحرافات SEAS5 عن مناخ العقد + التفسير العملي — بطاقة واحدة بدل البطاقات المتكررة", "One unified read: SEAS5 anomalies vs decade climate plus the practical interpretation — a single card instead of repeated ones"))}</p>
          </div>
          <span class="v51-sec-tools">
            <button type="button" class="ai-fresh ai-share" aria-label="${escapeHtml(T("كصورة"))}">🖼 ${escapeHtml(T("كصورة"))}</button>
          </span>
        </div>
        <div id="v51-seasonal-host"></div>`;
      advSec.before(card);
      const host = $("#v51-seasonal-host", card);
      /* نقل حي لعقد البطاقتين — كل التثبيتات وأزرار المصدر تعمل كما هي */
      host.appendChild(advSec);
      host.appendChild(readSec);
      /* v54: زر «استمع» حُذف من المستشار الاستراتيجي — صوت التطبيق في موضعين فقط */
      const sbtn = card.querySelector(".ai-share");
      sbtn.onclick = () => shareAsImage(T("المستشار الاستراتيجي الموسمي"), [sectionSpeechText(host, "")]);
    }

    function enhanceMonthly() {
      injectCSS();
      decorateCalendar();
      watchCalendar();
      watchMonthGrid();
      applyMonthBadges();
      ensureSheet();
      buildTimePicker();
      unifySeasonalAdvisors();
    }
    document.addEventListener("matar:monthly-data", (e) => {
      const rows = e.detail?.seasonalRows || [];
      if (!rows.length) return;
      monthFacts = e.detail;
      const scores = rows.map(monthScoreOf);
      let bi = -1, wi = -1, bv = -1, wv = 101;
      scores.forEach((s, i) => { if (s > bv) { bv = s; bi = i; } if (s < wv) { wv = s; wi = i; } });
      monthScores = scores.map((s, i) => ({ score: s, flag: i === bi && bv >= 60 ? "best" : i === wi && wv < 45 ? "hard" : null }));
      applyMonthBadges();
    });
    onPageShow("monthly", enhanceMonthly);

    /* v56: إعادة رسم (Re-render) جميع البطاقات الديناميكية فور اختيار Français أو أي
       لغة أخرى — آلة الزمن المناخي تُعاد بناها بأسماء الشهور الجديدة عبر Intl،
       فلاتر جوّك اليوم تُعاد ترجمتها، وأدوات الصفحتين تُعاد قراءتها بالقاموس السباعي */
    document.addEventListener("matar:language", () => {
      try {
        const tp = $("#v51-tm-picker");
        if (tp) { tp.remove(); buildTimePicker(); }
      } catch (e) {}
      try {
        $$(".v51-persona-btn").forEach((b) => {
          const p = PERSONAS.find((x) => x.id === b.dataset.persona);
          if (p) b.innerHTML = `<span aria-hidden="true">${p.icon}</span> ${escapeHtml(T(p.label))}`;
        });
        const bar = $("#v51-persona-bar");
        if (bar) bar.setAttribute("aria-label", T("فلتر الفئات الذكي"));
      } catch (e) {}
      try { if (document.body?.dataset?.page === "joq") setTimeout(enhanceJoq, 60); } catch (e) {}
      try { applyMonthBadges(); } catch (e) {}
    });

    /* ═══════════════════════════════════════════════════════════════
       ③ جوّك اليوم — Personal Lifestyle Co-Pilot
       ═══════════════════════════════════════════════════════════════ */
    const PERSONAS = [
      { id: "all", icon: "🌟", label: "الكل" },
      { id: "sport", icon: "🏃", label: "رياضي وعدّاء" },
      { id: "sea", icon: "🌊", label: "بحر وصيد" },
      { id: "drone", icon: "🚁", label: "طيار درون" },
      { id: "health", icon: "🩺", label: "صحة وحساسية" },
      { id: "home", icon: "🏠", label: "منزل وحياة يومية" },
    ];
    const PERSONA_ORDER = {
      all: ["sport", "sea", "drone", "health", "home"],
      sport: ["sport", "health", "sea", "home", "drone"],
      sea: ["sea", "sport", "health", "drone", "home"],
      drone: ["drone", "health", "sea", "sport", "home"],
      health: ["health", "sport", "sea", "home", "drone"],
      home: ["home", "sport", "health", "sea", "drone"],
    };
    const PERSONA_LS = "matar:v51:persona";
    let currentPersona = (() => { try { return localStorage.getItem(PERSONA_LS) || "all"; } catch (e) { return "all"; } })();
    function savePersona(id) {
      currentPersona = id;
      try { localStorage.setItem(PERSONA_LS, id); } catch (e) {}
      /* الحفظ الرسمي في matar:state (كاش حالة المستخدم الذي ينجو عبر الترقيات) */
      try { caches.open("matar:state").then((c) => c.put("/__matar_v51_persona", new Response(id))).catch(() => {}); } catch (e) {}
    }
    function joqSections() {
      const content = $("#joq-content");
      if (!content) return [];
      /* بطاقة سولنار v29 لا تحمل .joq-body لكنها أداة بحرية — تُشمل للوسم والترتيب */
      return $$("section.card", content).filter((s) => s.querySelector(".joq-body") || s.id === "v51-home-card" || s.classList.contains("v29-solunar-section"));
    }
    function tagSections() {
      const secs = joqSections();
      /* الترتيب الأصلي: رياضة، بحر، درونز، صحة + قسم المنزل v51 */
      const fixed = ["sport", "sea", "drone", "health"];
      let fi = 0;
      secs.forEach((s) => {
        if (s.id === "v51-home-card") s.dataset.v51Persona = "home";
        else if (s.classList.contains("v29-solunar-section")) s.dataset.v51Persona = "sea"; /* بطاقة سولنار v29 تابعة للبحر */
        else if (!s.dataset.v51Persona) { s.dataset.v51Persona = fixed[fi] || "sport"; fi = Math.min(fi + 1, fixed.length - 1); }
      });
      return secs;
    }
    function applyPersona(id) {
      const content = $("#joq-content");
      if (!content) return;
      const secs = tagSections();
      const order = PERSONA_ORDER[id] || PERSONA_ORDER.all;
      /* إعادة ترتيب: أدوات الفئة المختارة أولًا ثم البقية */
      order.forEach((p) => {
        secs.filter((s) => s.dataset.v51Persona === p).forEach((s) => {
          const anchor = content.querySelector("p.src-note:last-of-type");
          if (anchor) content.insertBefore(s, anchor);
          else content.appendChild(s);
        });
      });
      secs.forEach((s) => {
        const match = id === "all" || s.dataset.v51Persona === id;
        s.classList.toggle("v51-dim", !match);
        s.classList.toggle("v51-focus", id !== "all" && match);
      });
      $$(".v51-persona-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.persona === id)));
    }
    function buildPersonaBar() {
      const content = $("#joq-content");
      if (!content || $("#v51-persona-bar")) return;
      const bar = document.createElement("div");
      bar.className = "v51-persona-bar";
      bar.id = "v51-persona-bar";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", T("فلتر الفئات الذكي"));
      bar.innerHTML = PERSONAS.map((p) => `<button type="button" class="v51-persona-btn" data-persona="${p.id}" aria-pressed="false"><span aria-hidden="true">${p.icon}</span> ${escapeHtml(T(p.label))}</button>`).join("");
      content.insertBefore(bar, content.firstChild);
      /* v51: تفويض واحد على الحاوية (لا EventListener لكل زر عند إعادة الرسم) */
      bar.onclick = (e) => {
        const btn = e.target.closest(".v51-persona-btn");
        if (!btn) return;
        savePersona(btn.dataset.persona);
        applyPersona(btn.dataset.persona);
      };
      applyPersona(currentPersona);
    }

    /* ══ قسم «المنزل وحياة يومية» — ينقل بطاقتي الغسيل والسيارة إليه ويضيف التهوية ══ */
    function ensureHomeSection() {
      const content = $("#joq-content");
      if (!content || $("#v51-home-card")) return;
      const sec = document.createElement("section");
      sec.className = "card section";
      sec.id = "v51-home-card";
      sec.dataset.v51Persona = "home";
      sec.innerHTML = `
        <div class="sec-head">
          <div>
            <h2>🏠 ${escapeHtml(T("منزلك وحياتك اليومية"))}</h2>
            <p class="hint">${escapeHtml(tx("التهوية الذكية · جفاف الغسيل · غسيل السيارة — قراءات عملية من نفس بيانات موقعك", "Smart ventilation, laundry drying and car wash — practical readings from the same data"))}</p>
          </div>
          <span class="v51-sec-tools"></span>
        </div>
        <div class="joq-body" id="v51-home-body"></div>`;
      const body = $("#v51-home-body", sec);
      /* نقل بطاقتي جفاف الملابس وغسيل السيارة (بعناوينهما) من قسم الرياضة */
      ["joq-laundry-card", "joq-carwash-card"].forEach((cid) => {
        const cardEl = document.getElementById(cid);
        if (!cardEl) return;
        const h3 = cardEl.previousElementSibling;
        const note = h3?.previousElementSibling;
        if (note?.classList?.contains("joq-note")) body.appendChild(note);
        if (h3?.classList?.contains("joq-subtitle")) body.appendChild(h3);
        body.appendChild(cardEl);
      });
      /* بطاقة تهوية المنزل الجديدة */
      const vent = document.createElement("div");
      vent.className = "adv-card";
      vent.id = "v51-vent-card";
      vent.dataset.kind = "home";
      vent.innerHTML = `
        <h3 class="joq-subtitle">🌬️ ${escapeHtml(T("مؤشر تهوية المنزل"))}</h3>
        <span class="adv-title" id="v51-vent-title">—</span>
        <p class="adv-msg" id="v51-vent-msg">—</p>
        <div class="v51-bars" id="v51-vent-bars"></div>
        <div class="adv-when" id="v51-vent-when">—</div>`;
      body.insertBefore(vent, body.firstChild);
      const srcNote = content.querySelector("p.src-note");
      if (srcNote) srcNote.before(sec);
      else content.appendChild(sec);
    }

    /* ══ أدوات القسم أعلى كل قسم: استماع + مشاركة كصورة ══ */
    function wireSectionTools() {
      const content = $("#joq-content");
      if (!content) return;
      $$("section.card", content).forEach((sec) => {
        const head = sec.querySelector(".sec-head");
        if (!head) return;
        let tools = head.querySelector(".v51-sec-tools");
        if (!tools) {
          tools = document.createElement("span");
          tools.className = "v51-sec-tools";
          /* v54: زر «استمع» حُذف من أقسام جوّك اليوم — صوت التطبيق في موضعين فقط */
          tools.innerHTML = `
            <button type="button" class="ai-fresh ai-share" aria-label="${escapeHtml(T("كصورة"))}">🖼 ${escapeHtml(T("كصورة"))}</button>`;
          head.appendChild(tools);
        }
        const title = sec.querySelector("h2")?.textContent?.trim() || "";
        /* v54: بلا زر استماع هنا — زر المشاركة كصورة فقط */
        const sbtn = tools.querySelector(".ai-share");
        if (sbtn && sbtn.dataset.bound !== "1") {
          sbtn.dataset.bound = "1";
          sbtn.onclick = () => shareAsImage(title, [sectionSpeechText(sec, "")]);
        }
      });
    }

    /* ══ ① الرياضيين: الترطيب + سرعة الجري + شريط 12 ساعة ══ */
    function renderSportTools() {
      const wx = state.wx;
      if (!wx?.hourly) return;
      const verdict = $("#joq-sport-verdict");
      if (!verdict) return;
      let host = $("#v51-sport-tools");
      if (!host) {
        host = document.createElement("div");
        host.id = "v51-sport-tools";
        host.innerHTML = `
          <div class="v51-mini-grid">
            <div class="adv-card" data-kind="sport"><span class="adv-title">💧 ${escapeHtml(T("حاسبة الترطيب"))}</span><p class="adv-msg" id="v51-hyd-msg">—</p><div class="adv-when" id="v51-hyd-when">—</div></div>
            <div class="adv-card" data-kind="sport"><span class="adv-title">🏃 ${escapeHtml(T("سرعة الجري الآمنة"))}</span><p class="adv-msg" id="v51-pace-msg">—</p><div class="adv-when" id="v51-pace-when">—</div></div>
          </div>
          <h3 class="joq-subtitle">🟢 ${escapeHtml(T("شريط الساعات الخضراء — 12 ساعة"))}</h3>
          <p class="joq-note">${escapeHtml(tx("كل خانة ساعة قادمة: الأخضر المثالي للتمرين عالي الكثافة، والأصفر بحذر، والأحمر للراحة أو الجهد الخفيف.", "Each cell is one coming hour: green is ideal for hard training, amber is cautious, red means rest or light effort."))}</p>
          <div class="v51-strip" id="v51-green-strip" role="list" aria-label="${escapeHtml(T("شريط الساعات الخضراء — 12 ساعة"))}"></div>`;
        verdict.after(host);
      }
      const h = wx.hourly;
      const idx = hourIndexAtPlace(wx);
      const t = h.temperature_2m?.[idx], rh = h.relative_humidity_2m?.[idx];
      const wbgt = HOOKS.wbgtC ? HOOKS.wbgtC(t, rh) : null;
      /* الترطيب: خط أساس 500 مل/ساعة يرتفع مع الإجهاد الحراري WBGT والرطوبة النسبية */
      const mlh = wbgt == null ? null : Math.round(clamp(500 + Math.max(0, wbgt - 16) * 60 + Math.max(0, (rh ?? 40) - 45) * 3.5, 400, 1500));
      $("#v51-hyd-msg").textContent = mlh == null
        ? tx("بيانات الحرارة والرطوبة غير كافية الآن — أعد فتح اللوحة بعد تحميل البيانات.", "Temperature/humidity not ready yet — reopen after data loads.")
        : tf(tx("اشرب نحو {v} ملليلتر/ساعة أثناء التمرين الحالي — أي {l} لتر في جلسة ساعة كاملة.", "Drink about {v} ml/hour at current conditions — that is {l} L over a one-hour session."), { v: localNum(mlh), l: localNum(mlh / 1000, 1) });
      $("#v51-hyd-when").textContent = wbgt != null ? tf(tx("مبني على WBGT = {v} والرطوبة {r}٪", "based on WBGT = {v} and humidity {r}%"), { v: localNum(wbgt, 1), r: localNum(rh ?? 0) }) : "";
      /* سرعة الجري: تباطؤ آمن نسبي يبدأ فوق WBGT 14 ويُسقف عند 30٪ */
      const slow = wbgt == null ? null : clamp((wbgt - 14) * 2.2, 0, 30);
      $("#v51-pace-msg").textContent = slow == null
        ? tx("لا حساب متاح الآن — انتظر بيانات اللوحة.", "No estimate right now — wait for the board data.")
        : slow < 2
          ? tx("الجو محايد — اركب زمنك المعتاد بلا عقوبة فيزيائية تُذكر.", "Neutral air — keep your usual pace with no meaningful penalty.")
          : tf(tx("اخلط {v}٪ على زمنك المعتاد (خفّض الوتيرة) — الجسم يصرف جزءًا من الوقود على التبريد بدل الدفع.", "Add {v}% to your usual pace (slow down) — part of your fuel is spent on cooling instead of propulsion."), { v: localNum(slow, 0) });
      $("#v51-pace-when").textContent = slow != null && slow >= 2 ? tx("محاذاة إرشادات الطباعة الرياضية للحرارة", "aligned with heat pacing guidance") : "";
      /* شريط 12 ساعة */
      const strip = $("#v51-green-strip");
      if (strip) {
        let bestI = -1, bestV = -1;
        const vals = [];
        for (let k = 0; k < 12; k += 1) {
          const i = idx + k;
          const sc = HOOKS.exerciseScore ? HOOKS.exerciseScore(h.temperature_2m?.[i], h.relative_humidity_2m?.[i], h.wind_speed_10m?.[i], h.precipitation_probability?.[i]) : null;
          vals.push({ t: h.time?.[i], sc });
          if (sc != null && sc > bestV) { bestV = sc; bestI = k; }
        }
        strip.innerHTML = vals.map((v, k) => {
          const band = v.sc == null ? "poor" : v.sc >= 70 ? "good" : v.sc >= 45 ? "fair" : "poor";
          return `<div class="v51-strip-cell${k === bestI ? " v51-best" : ""}" data-band="${band}" role="listitem"><span class="st-t">${escapeHtml(hourLabel(v.t))}</span><span class="st-v">${v.sc == null ? "—" : localNum(v.sc)}</span></div>`;
        }).join("");
      }
    }

    /* ══ ② البحر والصيد: النشاط العلمي + صفاء المياه + Rip Current ══ */
    const marineMemo = new Map();
    async function fetchMarineLite(place) {
      const key = `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
      if (marineMemo.has(key)) return marineMemo.get(key);
      const p = (async () => {
        try {
          const u = new URL("https://marine-api.open-meteo.com/v1/marine");
          u.search = new URLSearchParams({
            latitude: place.latitude.toFixed(3), longitude: place.longitude.toFixed(3),
            hourly: "wave_height,wave_period", timezone: "auto", forecast_days: "2",
          });
          const r = await fetch(u.toString());
          if (!r.ok) return null;
          const j = await r.json();
          return j?.hourly?.wave_height?.some((v) => v != null) ? j.hourly : null;
        } catch (e) { return null; }
      })();
      marineMemo.set(key, p);
      return p;
    }
    function moonInfo() {
      const syn = 29.530588853;
      const ref = Date.UTC(2000, 0, 6, 18, 14); /* محاق مرجعي معروف */
      const age = (((Date.now() - ref) / 86400000) % syn + syn) % syn;
      const illum = (1 - Math.cos((2 * Math.PI * age) / syn)) / 2;
      const ar = isAr();
      const name = age < 1.8 ? (ar ? "محاق" : "New moon")
        : age < 6.5 ? (ar ? "هلال متزايد" : "Waxing crescent")
        : age < 9 ? (ar ? "تربيع أول" : "First quarter")
        : age < 13.5 ? (ar ? "أحدب متزايد" : "Waxing gibbous")
        : age < 16.5 ? (ar ? "بدر" : "Full moon")
        : age < 21 ? (ar ? "أحدب متناقص" : "Waning gibbous")
        : age < 23.8 ? (ar ? "تربيع أخير" : "Last quarter")
        : age < 28 ? (ar ? "هلال متناقص" : "Waning crescent") : (ar ? "محاق" : "New moon");
      /* عامل سولنار مبسط: حول البدر والمحاق أعلى نشاط */
      const factor = illum >= 0.85 || illum <= 0.15 ? 1 : illum >= 0.6 || illum <= 0.4 ? 0.72 : 0.45;
      return { age, illum, name, factor };
    }
    function renderSeaTools() {
      const wx = state.wx;
      if (!wx?.hourly) return;
      const swimCard = $("#joq-swim-card");
      if (!swimCard) return;
      let grid = swimCard.closest(".adv-grid2");
      if (!grid) return;
      const h = wx.hourly;
      const idx = hourIndexAtPlace(wx);
      /* النشاط العلمي: ميل الضغط (عبر HOOKS) + طور القمر */
      const dp3 = HOOKS.pressureDelta ? HOOKS.pressureDelta(h.pressure_msl, idx, 3) : null;
      const pScoreMap = { "very-high": 1, high: 0.82, normal: 0.55, low: 0.34, "very-low": 0.15, unknown: 0.5 };
      let pKind = "unknown";
      try { pKind = HOOKS.fishActivity ? HOOKS.fishActivity(dp3).kind : "unknown"; } catch (e) {}
      const moon = moonInfo();
      const score = Math.round(100 * (0.62 * (pScoreMap[pKind] ?? 0.5) + 0.38 * moon.factor));
      const scoreBand = score >= 72 ? "low" : score >= 45 ? "warn" : "high";
      let fishSci = $("#v51-fish-sci");
      if (!fishSci) {
        fishSci = document.createElement("div");
        fishSci.className = "adv-card";
        fishSci.id = "v51-fish-sci";
        fishSci.dataset.kind = "fish";
        fishSci.innerHTML = `
          <span class="adv-title">🎣 ${escapeHtml(T("نشاط الأسماك العلمي"))}<span class="adv-sev" data-sev="${scoreBand}">${localNum(score)}٪</span></span>
          <p class="adv-msg" id="v51-fishsci-msg">—</p>
          <div class="v51-kv"><span>${escapeHtml(T("ميل الضغط"))}</span><b>${dp3 == null ? "—" : `${dp3 >= 0 ? "+" : ""}${localNum(dp3, 1)} hPa/3س`}</b></div>
          <div class="v51-kv"><span>${escapeHtml(T("طور القمر"))}</span><b>🌙 ${escapeHtml(moon.name)}</b></div>
          <div class="adv-when">${escapeHtml(tx("دمج فيزياء الضغط مع سولنار القمر — دقيقة أعلى = فترات تغذية أقوى", "pressure physics merged with solunar moon — higher % = stronger feeding windows"))}</div>`;
        grid.appendChild(fishSci);
      } else {
        fishSci.querySelector(".adv-sev").dataset.sev = scoreBand;
        fishSci.querySelector(".adv-sev").textContent = `${localNum(score)}٪`;
        fishSci.querySelector(".v51-kv b").textContent = dp3 == null ? "—" : `${dp3 >= 0 ? "+" : ""}${localNum(dp3, 1)} hPa/3س`;
        fishSci.querySelectorAll(".v51-kv b")[1].textContent = `🌙 ${moon.name}`;
      }
      $("#v51-fishsci-msg").textContent = score >= 72
        ? tx("نافذة تغذية قوية — الضغط والقمر معًا في صالحك: انطلق فجرًا أو غروبًا بالطُعم المتحرك.", "Strong feeding window — pressure and moon both align: go at dawn or dusk with moving lures.")
        : score >= 45
          ? tx("نشاط متوسط إلى جيد — التزم الساعات الذهبية حول الشروق والغروب وعمّق الطُعم قليلًا.", "Moderate-to-good activity — stick to golden hours around sunrise/sunset and fish slightly deeper.")
          : tx("نشاط ضعيف اليوم — الأسماك كامنة؛ وقت أفضل لصيانة العدة أو رحلة قصيرة تجريبية قرب الشاطئ.", "Low activity today — fish hold deep; better for tackle maintenance or a short inshore test trip.");
      /* صفاء المياه + التيارات الساحبة: بيانات الموج تُجلب كسولًا ومخبأة */
      fetchMarineLite(state.place).then((mh) => {
        const gust = h.wind_gusts_10m?.[idx] ?? h.wind_speed_10m?.[idx] ?? 0;
        const rain6 = Array.from({ length: Math.min(6, (h.time?.length ?? 0) - idx) }, (_, k) => h.precipitation?.[idx + k] ?? 0).reduce((s, v) => s + v, 0);
        let whNow = null, whPeak = 0;
        if (mh?.time?.length) {
          const j = mh.time.indexOf(h.time[idx]);
          whNow = j >= 0 ? mh.wave_height?.[j] : null;
          for (let k = 0; k < Math.min(12, (h.time?.length ?? 0) - idx); k += 1) {
            const t2 = h.time[idx + k];
            const j2 = mh.time.indexOf(t2);
            if (j2 >= 0 && mh.wave_height?.[j2] != null) whPeak = Math.max(whPeak, mh.wave_height[j2]);
          }
        }
        const clarity = Math.round(clamp(100 - gust * 1.1 - (whNow ?? 0) * 16 - rain6 * 5, 5, 100));
        let clarityCard = $("#v51-clarity-card");
        if (!clarityCard) {
          clarityCard = document.createElement("div");
          clarityCard.className = "adv-card";
          clarityCard.id = "v51-clarity-card";
          clarityCard.dataset.kind = "swim";
          clarityCard.innerHTML = `
            <span class="adv-title">🤿 ${escapeHtml(T("صفاء المياه للسباحة"))}<span class="adv-sev" data-sev="low">${localNum(clarity)}٪</span></span>
            <p class="adv-msg" id="v51-clarity-msg">—</p>
            <div class="adv-when" id="v51-clarity-when">—</div>`;
          grid.appendChild(clarityCard);
        } else {
          const sev = clarity >= 65 ? "low" : clarity >= 40 ? "warn" : "high";
          clarityCard.querySelector(".adv-sev").dataset.sev = sev;
          clarityCard.querySelector(".adv-sev").textContent = `${localNum(clarity)}٪`;
        }
        $("#v51-clarity-msg").textContent = clarity >= 65
          ? tx("مياه صفية — رؤية جيدة تحت السطح وسباحة مريحة داخل المنطقة المخصصة.", "Clear water — good underwater visibility and comfortable swimming inside the designated zone.")
          : clarity >= 40
            ? tx("عكارة متوسطة — هبّات أو موج يرفعان الرمل؛ تفتح العين تحت الماء بحذر وابتعد عن الصخور.", "Moderate murkiness — gusts or waves stirring sand; open your eyes underwater carefully and keep off rocks.")
            : tx("مياه عكرة بالغبار والرمل — رؤية ضعيفة وسباحة غير مجدية اليوم؛ كن مرئيًا للقوارب بعوامة ملونة.", "Sand-churned murky water — poor visibility, not a swimming day; stay visible to boats with a bright float.");
        $("#v51-clarity-when").textContent = mh ? tf(tx("موج الآن {w} م · هبّات {g} كم/س · مطر 6 س {r} مم", "waves now {w} m · gusts {g} km/h · 6h rain {r} mm"), { w: whNow == null ? "—" : localNum(whNow, 1), g: localNum(gust, 0), r: localNum(rain6, 1) }) : tf(tx("هبّات {g} كم/س (بلا تغطية موج لموقعك)", "gusts {g} km/h (no wave coverage here)"), { g: localNum(gust, 0) });
        /* تنبيه التيارات الساحبة (Rip Current) — أعلى موج خلال 12 ساعة */
        const ripHigh = whPeak >= 1.6 || (whPeak >= 1.1 && gust >= 35);
        const ripMid = !ripHigh && (whPeak >= 0.9 || gust >= 28);
        const sev = ripHigh ? "high" : ripMid ? "warn" : "low";
        let ripCard = $("#v51-rip-card");
        if (!ripCard) {
          ripCard = document.createElement("div");
          ripCard.className = "adv-card";
          ripCard.id = "v51-rip-card";
          ripCard.dataset.kind = "swim";
          ripCard.innerHTML = `
            <span class="adv-title">🌀 ${escapeHtml(T("تنبيه التيارات الساحبة"))}<span class="adv-sev" data-sev="${sev}">${ripHigh ? escapeHtml(tx("خطر", "high")) : ripMid ? escapeHtml(tx("ممكن", "possible")) : escapeHtml(tx("منخفض", "low"))}</span></span>
            <p class="adv-msg" id="v51-rip-msg">—</p>
            <div class="adv-when" id="v51-rip-when">—</div>`;
          grid.appendChild(ripCard);
        } else {
          ripCard.querySelector(".adv-sev").dataset.sev = sev;
          ripCard.querySelector(".adv-sev").textContent = ripHigh ? tx("خطر", "high") : ripMid ? tx("ممكن", "possible") : tx("منخفض", "low");
        }
        $("#v51-rip-msg").textContent = ripHigh
          ? tx("موج قوي وطويل يضخّ الماء نحو الشاطئ ويعيد خروجًا مركزًا (Rip Current): سبح داخل الحارس فقط، وإن انتزعك فسبح موازيًا للشاطئ لا عكس التيار.", "Strong long-period waves pump water ashore and set up a rip current: swim only where lifeguards are, and if caught swim parallel to shore — never against it.")
          : ripMid
            ? tx("احتمال تيار ساحب موضعي قرب الفتحات والصخور — أبقِ الأطفال قرب الشاطئ وتعرف على لون الماء الأغمق الممتد نحو البحر.", "A localised rip is possible near gaps and rocks — keep children close and learn the darker channel stretching seaward.")
            : tx("ظروف تيار منخفضة — الموج والهبّات في نطاق هادئ مع التزام الدائم بحراسة الأطفال.", "Low rip conditions — waves and gusts in a calm band, with the usual eye on children.");
        $("#v51-rip-when").textContent = mh ? tf(tx("ذروة الموج اليوم {w} م خلال 12 ساعة", "today's wave peak {w} m within 12h"), { w: localNum(whPeak, 1) }) : tx("بلا بيانات موج — الحكم من الهبّات حصرًا", "no wave data — judged from gusts only");
      }).catch(() => {});
    }

    /* ══ ③ الدرونز: محدد النوع + فحص ما قبل الإقلاع ══ */
    const DRONE_LS = "matar:v51:dronetype";
    let droneType = (() => { try { return localStorage.getItem(DRONE_LS) || "mini"; } catch (e) { return "mini"; } })();
    const droneLimit = () => (droneType === "pro" ? 42 : 28);
    function saveDroneType(v) {
      droneType = v;
      try { localStorage.setItem(DRONE_LS, v); } catch (e) {}
      try { caches.open("matar:state").then((c) => c.put("/__matar_v51_dronetype", new Response(v))).catch(() => {}); } catch (e) {}
    }
    const windMemo = new Map();
    async function fetchUpperWinds(place) {
      const key = `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
      if (windMemo.has(key)) return windMemo.get(key);
      const p = (async () => {
        try {
          const u = new URL("https://api.open-meteo.com/v1/forecast");
          u.search = new URLSearchParams({
            latitude: String(place.latitude), longitude: String(place.longitude),
            hourly: "wind_speed_80m,wind_speed_120m", timezone: "auto",
            forecast_days: "2", wind_speed_unit: "kmh",
          });
          const r = await fetch(u.toString());
          return r.ok ? (await r.json())?.hourly || null : null;
        } catch (e) { return null; }
      })();
      windMemo.set(key, p);
      return p;
    }
    function renderDroneTools() {
      const wx = state.wx;
      if (!wx?.hourly) return;
      const droneCard = $("#joq-drone-card");
      if (!droneCard) return;
      let host = $("#v51-drone-tools");
      if (!host) {
        host = document.createElement("div");
        host.id = "v51-drone-tools";
        host.innerHTML = `
          <div class="v51-drone-pick" role="group" aria-label="${escapeHtml(T("نوع الدرون"))}">
            <button type="button" data-dt="mini" aria-pressed="false">🛸 ${escapeHtml(T("درجتان صغيرتان"))} <small>(&lt; 250g · 28 ${escapeHtml(T("كم/س"))})</small></button>
            <button type="button" data-dt="pro" aria-pressed="false">🚁 ${escapeHtml(T("احترافي"))} <small>(42 ${escapeHtml(T("كم/س"))})</small></button>
          </div>
          <div class="adv-card" data-kind="drone">
            <span class="adv-title">✅ ${escapeHtml(T("فحص ما قبل الإقلاع"))}<span class="adv-sev" id="v51-pref-sev" data-sev="low">—</span></span>
            <p class="adv-msg" id="v51-pref-msg">—</p>
            <div id="v51-pref-rows"></div>
          </div>`;
        droneCard.after(host);
        host.querySelector(".v51-drone-pick").onclick = (e) => {
          const b = e.target.closest("button[data-dt]");
          if (!b) return;
          saveDroneType(b.dataset.dt);
          renderDroneTools();
        };
      }
      $$(".v51-drone-pick button", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dt === droneType)));
      const h = wx.hourly;
      const idx = hourIndexAtPlace(wx);
      const limit = droneLimit();
      const gust = h.wind_gusts_10m?.[idx] ?? 0;
      const wind10 = h.wind_speed_10m?.[idx] ?? 0;
      const vis = h.visibility?.[idx];
      const t = h.temperature_2m?.[idx], dew = h.dew_point_2m?.[idx];
      const spread = t != null && dew != null ? t - dew : null;
      const rows = [];
      const rowOf = (ok, ico, lbl, val) => `<div class="v51-check" data-ok="${ok}"><span class="ck-ico">${ico}</span><span class="ck-lbl">${escapeHtml(lbl)}</span><b class="ck-val">${val}</b></div>`;
      rows.push(rowOf(gust <= limit ? 1 : gust <= limit * 1.15 ? 0 : -1, gust <= limit ? "✅" : gust <= limit * 1.15 ? "⚠️" : "⛔", tx("الهبّات على السطح", "Surface gusts"), `${localNum(gust, 0)} / ${localNum(limit)} ${T("كم/س")}`));
      $("#v51-pref-rows").innerHTML = rows.join("");
      $("#v51-pref-sev").textContent = gust <= limit ? T("مناسب لنوعك") : gust <= limit * 1.15 ? T("على الحد") : T("ممنوع لنوعك");
      $("#v51-pref-sev").dataset.sev = gust <= limit ? "low" : gust <= limit * 1.15 ? "warn" : "high";
      $("#v51-pref-msg").textContent = gust <= limit
        ? tf(tx("حد نوعك ({t}): {v} كم/س — الهبّات الحالية تحته بأمان، وابقَ ضمن مدى الرؤية وارتقِ تدريجيًا.", "Your type's limit ({t}): {v} km/h — current gusts are safely below it; stay within visual range and climb gradually."), { t: droneType === "pro" ? T("احترافي") : T("درجتان صغيرتان"), v: localNum(limit) })
        : tf(tx("الهبّات تجاوزت حد نوعك ({v} كم/س) — أجّل الإقلاع أو انتقل لموقع محمي؛ الوزن الخفيف أكثر عرضة للانجراف.", "Gusts exceed your type's limit ({v} km/h) — postpone or move to a sheltered spot; lighter airframes drift first."), { v: localNum(limit) });
      /* رياح 80م/120م تُجلب كسولًا بفعل فتح القسم (كاش جلسة) */
      fetchUpperWinds(state.place).then((wh) => {
        const mapT = {};
        (wh?.time || []).forEach((t2, i) => { mapT[t2] = i; });
        const j = mapT[h.time[idx]] ?? 0;
        const w80 = wh?.wind_speed_80m?.[j], w120 = wh?.wind_speed_120m?.[j];
        const rowsAll = [
          rowOf(wind10 <= limit ? 1 : wind10 <= limit * 1.15 ? 0 : -1, wind10 <= limit ? "✅" : wind10 <= limit * 1.15 ? "⚠️" : "⛔", tx("الرياح · 10 م", "Wind · 10 m"), `${localNum(wind10, 0)} ${T("كم/س")}`),
          w80 == null ? "" : rowOf(w80 <= limit * 0.9 ? 1 : w80 <= limit ? 0 : -1, w80 <= limit * 0.9 ? "✅" : w80 <= limit ? "⚠️" : "⛔", tx("الرياح · 80 م", "Wind · 80 m"), `${localNum(w80, 0)} ${T("كم/س")}`),
          w120 == null ? "" : rowOf(w120 <= limit * 0.85 ? 1 : w120 <= limit * 1.05 ? 0 : -1, w120 <= limit * 0.85 ? "✅" : w120 <= limit * 1.05 ? "⚠️" : "⛔", tx("الرياح · 120 م", "Wind · 120 m"), `${localNum(w120, 0)} ${T("كم/س")}`),
          rowOf(vis == null ? 0 : vis >= 5000 ? 1 : vis >= 2000 ? 0 : -1, vis == null ? "⚠️" : vis >= 5000 ? "✅" : vis >= 2000 ? "⚠️" : "⛔", tx("الرؤية الأفقية", "Horizontal visibility"), vis == null ? "—" : `${localNum(Math.round(vis / 100) / 10, 1)} ${tx("كم", "km")}`),
          rowOf(spread == null ? 0 : spread >= 3 ? 1 : spread >= 1.5 ? 0 : -1, spread == null ? "⚠️" : spread >= 3 ? "✅" : spread >= 1.5 ? "⚠️" : "⛔", tx("تكثف الندى على العدسات", "Dew on lens/props"), spread == null ? "—" : tf(tx("فرق {v}° عن نقطة الندى", "{v}° above dew point"), { v: localNum(spread, 1) })),
        ];
        $("#v51-pref-rows").innerHTML = rowsAll.join("");
      }).catch(() => {});
    }

    /* ══ ④ الصحة: رادار الصداع + درع الحساسية + فيتامين د ══ */
    function renderHealthTools() {
      const wx = state.wx;
      if (!wx?.hourly) return;
      const migCard = $("#joq-migraine-card");
      if (!migCard) return;
      let grid = migCard.closest(".adv-grid2");
      if (!grid) return;
      const h = wx.hourly;
      const idx = hourIndexAtPlace(wx);
      /* رادار الصداع النصفي: تغير الضغط خلال 6 و 12 ساعة */
      const dp6 = HOOKS.pressureDelta ? HOOKS.pressureDelta(h.pressure_msl, idx, 6) : null;
      const dp12 = HOOKS.pressureDelta ? HOOKS.pressureDelta(h.pressure_msl, idx, 12) : null;
      const sev6 = dp6 == null ? "low" : Math.abs(dp6) >= 6 ? "high" : Math.abs(dp6) >= 3.5 ? "warn" : "low";
      const sev12 = dp12 == null ? "low" : Math.abs(dp12) >= 8 ? "high" : Math.abs(dp12) >= 5 ? "warn" : "low";
      let radar = $("#v51-mig-radar");
      if (!radar) {
        radar = document.createElement("div");
        radar.className = "adv-card";
        radar.id = "v51-mig-radar";
        radar.dataset.kind = "migraine";
        radar.innerHTML = `
          <span class="adv-title">🧠 ${escapeHtml(T("رادار الصداع النصفي"))}<span class="adv-sev" data-sev="${sev6 === "high" || sev12 === "high" ? "high" : sev6 === "warn" || sev12 === "warn" ? "warn" : "low"}">—</span></span>
          <p class="adv-msg" id="v51-mig-msg">—</p>
          <div class="v51-bars" id="v51-mig-bars"></div>
          <div class="adv-when">${escapeHtml(tx("سرعة تغير الضغط الجوي هي المحفز الأول الموثق للصداع النصفي", "air-pressure change rate is the best-documented migraine trigger"))}</div>`;
        grid.appendChild(radar);
      }
      const overall = sev6 === "high" || sev12 === "high" ? "high" : sev6 === "warn" || sev12 === "warn" ? "warn" : "low";
      radar.querySelector(".adv-sev").dataset.sev = overall;
      radar.querySelector(".adv-sev").textContent = overall === "high" ? tx("خطر مرتفع", "high risk") : overall === "warn" ? tx("حذر", "caution") : tx("مستقر", "stable");
      const barHTML = (lbl, v, sev) => {
        const pct = v == null ? 0 : clamp(Math.abs(v) / 12, 0.03, 1) * 100;
        const color = sev === "high" ? "var(--danger)" : sev === "warn" ? "var(--warn)" : "var(--ok)";
        return `<div class="v51-bar-row"><span class="br-lbl">${escapeHtml(lbl)}</span><span class="br-track"><b style="width:${pct.toFixed(0)}%;background:${color}"></b></span><span class="br-val">${v == null ? "—" : `${v >= 0 ? "+" : ""}${localNum(v, 1)} hPa`}</span></div>`;
      };
      $("#v51-mig-bars").innerHTML = barHTML(tx("خلال 6 ساعات", "over 6 hours"), dp6, sev6) + barHTML(tx("خلال 12 ساعة", "over 12 hours"), dp12, sev12);
      $("#v51-mig-msg").textContent = overall === "high"
        ? tx("تغير ضغط حاد في النافذتين — ماء كافٍ، نوم منتظم، شاشة أقل، ودواءك في المتناول قبل الذروة.", "Sharp pressure change across both windows — hydrate, keep sleep regular, cut screens and keep medication at hand before the peak.")
        : overall === "warn"
          ? tx("تغير محسوس قد يزعج الحساسين — خطط فترات راحة وعين داكنة إن كنت من المعرضين.", "A noticeable shift may bother sensitive people — plan breaks and a dark room if you are prone.")
          : tx("الضغط شبه مستقر — مخاطر الصداع النصفي منخفضة هذه الساعات.", "Pressure near-stable — migraine risk stays low this window.");
      /* درع الحساسية والغبار: PM2.5/PM10 */
      const air = state.air?.current || null;
      const pm25 = air?.pm2_5 ?? null, pm10 = air?.pm10 ?? null;
      const shield = pm25 == null && pm10 == null ? null : Math.round(clamp(100 - (pm25 ?? 0) * 1.4 - (pm10 ?? 0) * 0.5, 0, 100));
      let allergy = $("#v51-allergy-card");
      if (!allergy) {
        allergy = document.createElement("div");
        allergy.className = "adv-card";
        allergy.id = "v51-allergy-card";
        allergy.dataset.kind = "aqi";
        allergy.innerHTML = `
          <span class="adv-title">🛡️ ${escapeHtml(T("درع الحساسية والغبار"))}<span class="adv-sev" data-sev="low">—</span></span>
          <p class="adv-msg" id="v51-allergy-msg">—</p>
          <div class="v51-kv"><span>PM2.5</span><b>${pm25 == null ? "—" : `${localNum(pm25, 1)} µg/m³`}</b></div>
          <div class="v51-kv"><span>PM10</span><b>${pm10 == null ? "—" : `${localNum(pm10, 1)} µg/m³`}</b></div>
          <div class="adv-when">${escapeHtml(tx("كلما ارتفع الدرع كان الهواء ألطف للأنف والحلق والعينين", "the higher the shield, the kinder the air to nose, throat and eyes"))}</div>`;
        grid.appendChild(allergy);
      } else {
        const kv = allergy.querySelectorAll(".v51-kv b");
        if (kv[0]) kv[0].textContent = pm25 == null ? "—" : `${localNum(pm25, 1)} µg/m³`;
        if (kv[1]) kv[1].textContent = pm10 == null ? "—" : `${localNum(pm10, 1)} µg/m³`;
      }
      if (shield != null) {
        const sev = shield >= 65 ? "low" : shield >= 40 ? "warn" : "high";
        allergy.querySelector(".adv-sev").dataset.sev = sev;
        allergy.querySelector(".adv-sev").textContent = `${localNum(shield)}٪`;
        $("#v51-allergy-msg").textContent = shield >= 65
          ? tx("هواء نظيف — يوم آمن للحساسين ومرضى الصدر والأنشطة الخارجية العادية.", "Clean air — a safe day for allergy, chest patients and normal outdoor activity.")
          : shield >= 40
            ? tx("غبار مرتفع جزئيًا — نظارات شمسية وكمامة في الشوارع المفتوحة، واغسل الأنف عند العودة.", "Partly elevated dust — sunglasses and a mask on open streets, rinse your nose after returning.")
            : tx("غبار كثيف — أغلق النوافذ ساعات الذروة وشغّل المنقي، وامتنع عن الجري الخارجي اليوم.", "Heavy dust — keep windows shut at peak hours, run a purifier and skip outdoor running today.");
      } else {
        allergy.querySelector(".adv-sev").textContent = "—";
      }
      /* فيتامين د: دقائق التعرض الآمنة حسب UV الآن + أفضل نافذة */
      const uvNow = h.uv_index?.[idx] ?? 0;
      const mins = uvNow >= 9 ? 5 : uvNow >= 7 ? 8 : uvNow >= 5 ? 12 : uvNow >= 3 ? 20 : 30;
      let bestWin = null;
      for (let k = 0; k < Math.min(12, (h.time?.length ?? 0) - idx); k += 1) {
        const uv = h.uv_index?.[idx + k];
        if (uv != null && uv >= 3 && uv <= 6.5) { bestWin = h.time[idx + k]; break; }
      }
      let vitd = $("#v51-vitd-card");
      if (!vitd) {
        vitd = document.createElement("div");
        vitd.className = "adv-card";
        vitd.id = "v51-vitd-card";
        vitd.dataset.kind = "sun";
        vitd.innerHTML = `
          <span class="adv-title">☀️ ${escapeHtml(T("دقائق فيتامين د"))}<span class="adv-sev" data-sev="low">${localNum(mins)} ${escapeHtml(T("دقيقة"))}</span></span>
          <p class="adv-msg" id="v51-vitd-msg">—</p>
          <div class="adv-when" id="v51-vitd-when">—</div>`;
        grid.appendChild(vitd);
      } else {
        vitd.querySelector(".adv-sev").textContent = `${localNum(mins)} ${T("دقيقة")}`;
      }
      $("#v51-vitd-msg").textContent = tf(tx("بأشعة اليوم (UV {uv}) تكفي نحو {m} دقيقة كشف للساعدين والساقين حول منتصف النهار لتصنيع حصة فيتامين د.", "With today's UV ({uv}), about {m} minutes of forearms-and-calves exposure near midday makes your vitamin D quota."), { uv: localNum(uvNow, 1), m: localNum(mins) });
      $("#v51-vitd-when").textContent = bestWin ? tf(tx("نافذة الوسط الذهبي: {h} — أشعة كافية بلا حرق", "the golden-middle window: {h} — enough sun without burning"), { h: hourLabel(bestWin) }) : tx("الشمس ضعيفة اليوم — اعتمد على المصادر الغذائية", "weak sun today — lean on dietary sources");
    }

    /* ══ ⑤ المنزل: مؤشر التهوية ══ */
    function renderVentTool() {
      const wx = state.wx;
      if (!wx?.hourly) return;
      const title = $("#v51-vent-title"), msg = $("#v51-vent-msg"), when = $("#v51-vent-when"), bars = $("#v51-vent-bars");
      if (!title) return;
      if (!$("#v51-vent-card")) return;
      const h = wx.hourly;
      const idx = hourIndexAtPlace(wx);
      const pm10 = state.air?.current?.pm10 ?? null;
      const scores = [];
      for (let k = 0; k < Math.min(12, (h.time?.length ?? 0) - idx); k += 1) {
        const i = idx + k;
        const t = h.temperature_2m?.[i], dew = h.dew_point_2m?.[i];
        const wind = h.wind_speed_10m?.[i] ?? 0;
        const spread = t != null && dew != null ? t - dew : null;
        const s = clamp((spread == null ? 10 : (spread - 1) * 15) + (pm10 == null ? 20 : pm10 < 40 ? 30 : pm10 < 80 ? 14 : 0) + (t != null && t >= 16 && t <= 29 ? 25 : t != null && t >= 10 && t <= 33 ? 12 : 0) - Math.max(0, wind - 22) * 2, 0, 100);
        scores.push({ t: h.time?.[i], s });
      }
      /* أفضل نافذة متتالية (ساعتان فأكثر) بمتوسط أعلى */
      let bestStart = 0, bestAvg = -1;
      for (let k = 0; k + 1 < scores.length; k += 1) {
        const avg = (scores[k].s + scores[k + 1].s) / 2;
        if (avg > bestAvg) { bestAvg = avg; bestStart = k; }
      }
      const avgScore = Math.round(bestAvg);
      const sev = avgScore >= 65 ? "low" : avgScore >= 40 ? "warn" : "high";
      title.innerHTML = `🌬️ ${escapeHtml(T("مؤشر تهوية المنزل"))}<span class="adv-sev" data-sev="${sev}">${localNum(avgScore)}٪</span>`;
      msg.textContent = avgScore >= 65
        ? tf(tx("هواء خارجي لطيف ونقطة ندى منخفضة — افتح النوافذ حول {a} حتى {b} للتجديد الحراري بلا رطوبة زائدة.", "Outdoor air is kind with a low dew point — open windows from {a} to {b} for a refresh without extra humidity."), { a: hourLabel(scores[bestStart]?.t), b: hourLabel(scores[bestStart + 1]?.t) })
        : avgScore >= 40
          ? tf(tx("ظروف متوسطة — نافذة التهوية الأفضل {a} حتى {b}، وافتح بشكل متقاطع لعشر دقائق بدل التعتيق الطويل.", "Mixed conditions — the best window is {a} to {b}; prefer 10 minutes of cross-ventilation over long airing."), { a: hourLabel(scores[bestStart]?.t), b: hourLabel(scores[bestStart + 1]?.t) })
          : tx("يوم مغلق — رطوبة أو غبار خارجي مرتفع: أجّل فتح النوافذ وشغّل المنقي أو المكيف بوضع التجفيف.", "Keep it shut — outdoor humidity or dust is high: postpone airing and run a purifier or the AC in dry mode.");
      when.textContent = pm10 != null ? tf(tx("PM10 الآن {v} µg/m³ — أحد عوامل الدرجة مع فرق نقطة الندى", "PM10 now {v} µg/m³ — one of the score inputs alongside dew spread"), { v: localNum(pm10, 0) }) : tx("الدرجة من نقطة الندى والحرارة والرياح", "scored from dew point, temperature and wind");
      bars.innerHTML = scores.map((x) => {
        const band = x.s >= 65 ? "good" : x.s >= 40 ? "fair" : "poor";
        const color = band === "good" ? "var(--ok)" : band === "fair" ? "var(--warn)" : "var(--danger)";
        return `<div class="v51-bar-row"><span class="br-lbl">${escapeHtml(hourLabel(x.t))}</span><span class="br-track"><b style="width:${clamp(x.s, 4, 100).toFixed(0)}%;background:${color}"></b></span><span class="br-val">${localNum(Math.round(x.s))}</span></div>`;
      }).join("");
    }

    function enhanceJoq() {
      injectCSS();
      buildPersonaBar();
      ensureHomeSection();
      wireSectionTools();
      renderSportTools();
      renderSeaTools();
      renderDroneTools();
      renderHealthTools();
      renderVentTool();
      applyPersona(currentPersona);
    }
    onPageShow("joq", enhanceJoq);
  }
})();
    

/* ═══════════════════ v52 — طقس المزارعين المحسّن + الشعار الرسمي (نافذة الرش + GDD) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 52: حزمة التطوير والإصلاح الشاملة
   ------------------------------------------------------------
   ① سبلاش الشعار الافتتاحي (90×90 مع دوران حلقة الرادار — يتوقف
     في الوضع الاقتصادي ومع prefers-reduced-motion) وطيفه الآمن.
   ② ختم الشعار العالمي window.__matarDrawLogoStamp(ctx,x,y,r)
     لبطاقات المشاركة (Canvas 2D) — يُستدعى من بطاقات v52 وv51
     وv47 والودجت في sw.js.
   ③ مساعد Leaflet الاحتياطي __matarEnsureLeaflet — فحص typeof L
     مع انتظار سلسلة cdnjs → unpkg → jsdelivr الجاهزة.
   ④ صفحة طقس المزارعين — Smart Precision Agriculture:
     • محدد المحصول الزجاجي (5 محاصيل) محفوظ في matar:state
       ويضبط رطوبة التربة المثالية وحساسية الصقيع والحرارة الحرجة.
     • شريط نافذة الرش الآمنة 24 ساعة (رياح < 15 كم/س، لا أمطار
       خلال 6 ساعات، رطوبة معتدلة) مع تحذير الانجراف والغسل.
     • حاسبة وحدات النمو الحرارية GDD بدرجة أساس المحصول.
     • بطاقة إنقاذ فورية للصقيع والموجات الحارة بخطة عملية.
     • زر استماع سريع (المحرك الموحد بلا تداخل) وزر مشاركة كصورة.
   ⑤ التحميل الكسول الصارم: كل الرسم والحسابات تبدأ عند فتح صفحة
     المزارعين حصرًا (MutationObserver على body[data-page]) — 60fps.
   ============================================================ */
(() => {
  /* ══ ① سبلاش الشعار الافتتاحي — إخفاء آمن بلا أي عوائق ══ */
  try {
    const sp = document.getElementById("v52-splash");
    if (sp) {
      let bye = false;
      /* v54: الوضع الاقتصادي يختصر الدخلة السينمائية — بلا حركات ولا انتظار */
      const ecoNow = () => {
        try { return document.documentElement.classList.contains("eco"); } catch (e) { return false; }
      };
      const dismiss = () => {
        if (bye) return;
        bye = true;
        const bar = sp.querySelector(".v54-loadbar");
        if (bar && !ecoNow()) bar.classList.add("v54-bye"); /* شريط التحميل يتلاشى بنعومة 0.5 ثانية */
        setTimeout(() => {
          sp.classList.add("v52-bye");
          setTimeout(() => { try { sp.remove(); } catch (e) {} }, 560);
        }, ecoNow() ? 60 : 430);
      };
      if (document.readyState === "complete") setTimeout(dismiss, 620);
      else window.addEventListener("load", () => setTimeout(dismiss, 620), { once: true });
      setTimeout(dismiss, 3600); /* صمام أمان — لا سبلاش عالق أبدًا */
    }
  } catch (e) { /* زينة إقلاع لا تكسر شيئًا */ }

  /* ══ ② ختم الشعار الرسمي الجديد icons/logo.png للبطاقات المرسومة (Canvas 2D) — v60 ══
     الصورة الرسمية المعتمدة نفسها (المحملة مسبقًا فور بدء السكربت) تُقصّ في سكويرش
     بزوايا 22٪ بتغطية كاملة (cover) — نفس زوايا الهيدر والسبلاش — وإن لم تكن
     جاهزة بعد (أول إقلاع بلا شبكة) يعمل الاحتياط المتجهي الرياحي الكامل (v59)
     كما هو: سكويرش بتدرج سماوي عميق وحرف M أبيض و3 قطرات سيانية.
     v61: الصورة الرسمية مضمّنة Base64 Data URI داخل وسم img بالواجهة — يُعاد
     استعمال src نفسه هنا بلا أي طلب شبكة أو مسار خارجي (والاحتياط المتجهي
     الرياحي v59 يبقى كما هو إن غاب العنصر لأي سبب). */
  let __matarLogoImg = null;
  try {
    const __matarLogoIm = new Image();
    __matarLogoIm.decoding = "async";
    __matarLogoIm.src = (document.querySelector("img.mlogo-img") || {}).src || "./icons/logo.png";
    __matarLogoImg = __matarLogoIm;
  } catch (e) { /* الاحتياط المتجهي يظل يعمل */ }

  window.__matarDrawLogoStamp = function (ctx, cx, cy, r) {
    try {
      if (!ctx || !(r > 0)) return;
      const sz = r * 1.84, x0 = cx - sz / 2, y0 = cy - sz / 2;
      const __im = __matarLogoImg;
      if (__im && __im.complete && __im.naturalWidth > 0) {
        const rad = sz * 0.22;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0 + rad, y0);
        ctx.lineTo(x0 + sz - rad, y0);
        ctx.quadraticCurveTo(x0 + sz, y0, x0 + sz, y0 + rad);
        ctx.lineTo(x0 + sz, y0 + sz - rad);
        ctx.quadraticCurveTo(x0 + sz, y0 + sz, x0 + sz - rad, y0 + sz);
        ctx.lineTo(x0 + rad, y0 + sz);
        ctx.quadraticCurveTo(x0, y0 + sz, x0, y0 + sz - rad);
        ctx.lineTo(x0, y0 + rad);
        ctx.quadraticCurveTo(x0, y0, x0 + rad, y0);
        ctx.closePath();
        ctx.clip();
        const __k = Math.max(sz / __im.naturalWidth, sz / __im.naturalHeight);
        const __dw = __im.naturalWidth * __k, __dh = __im.naturalHeight * __k;
        ctx.drawImage(__im, x0 + (sz - __dw) / 2, y0 + (sz - __dh) / 2, __dw, __dh);
        ctx.restore();
        return;
      }
      ctx.save();
      /* الرسم كله على شبكة 96×96 بتحجيم موحد — نفس هندسة SVG حرفيًا */
      ctx.translate(x0, y0);
      ctx.scale(sz / 96, sz / 96);
      const rr = (x, y, w, h, rad) => {
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx.lineTo(x, y + rad);
        ctx.quadraticCurveTo(x, y, x + rad, y);
        ctx.closePath();
      };
      /* ① السكويرش: تدرج سماوي عميق + لمعة سيانية + إطار زجاجي رفيع */
      const bg = ctx.createLinearGradient(3, 3, 93, 93);
      bg.addColorStop(0, "#0284C7"); bg.addColorStop(1, "#0F172A");
      rr(3, 3, 90, 90, 24); ctx.fillStyle = bg; ctx.fill();
      const sh = ctx.createRadialGradient(33, 21, 2, 33, 21, 62);
      sh.addColorStop(0, "rgba(56,189,248,0.34)"); sh.addColorStop(1, "rgba(56,189,248,0)");
      rr(3, 3, 90, 90, 24); ctx.fillStyle = sh; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,0.24)";
      rr(3.9, 3.9, 88.2, 88.2, 23.2); ctx.stroke();
      /* ② تيارا حرف M الأبيض (مساران + تدبيبان مستدقان) — نفس مسارات SVG */
      const A = "M21.5,56.5 L21.5,35 Q21.5,27 29.5,29.5 C34.5,33.8 36.2,37.4 37.5,41.8";
      const AC = "M41.3,40.7 Q43.9,49.3 47.2,50.58 L43.2,51.82 Q36.3,51.5 33.7,42.9 Z";
      const B = "M44.5,50 C51,45.8 57,41.5 62.5,36.2 C67.5,31.8 73,32.4 75.8,37.6 C76.9,40 77.6,41.5 78.2,42.9";
      const BC = "M81.9,41.3 Q85.05,48.65 88.6,58.5 Q77.65,51.85 74.5,44.5 Z";
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      /* ظل العمق الخفيف الناعم (بروز ثلاثي الأبعاد للحرف الأبيض) */
      ctx.save(); ctx.translate(0, 1.2); ctx.globalAlpha = 0.3;
      ctx.lineWidth = 8; ctx.strokeStyle = "#041022"; ctx.fillStyle = "#041022";
      ctx.stroke(new Path2D(A)); ctx.stroke(new Path2D(B));
      ctx.fill(new Path2D(AC)); ctx.fill(new Path2D(BC));
      ctx.restore();
      /* الحرف الأبيض الناصع #FFFFFF */
      ctx.lineWidth = 8; ctx.strokeStyle = "#FFFFFF"; ctx.fillStyle = "#FFFFFF";
      ctx.stroke(new Path2D(A)); ctx.stroke(new Path2D(B));
      ctx.fill(new Path2D(AC)); ctx.fill(new Path2D(BC));
      /* توهج سياني ناعم أسفل قوس الحرف */
      const gl = ctx.createRadialGradient(48.5, 70, 1, 48.5, 70, 13);
      gl.addColorStop(0, "rgba(56,189,248,0.16)"); gl.addColorStop(0.55, "rgba(56,189,248,0.06)"); gl.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.ellipse(48.5, 70, 13, 5.8, 0, 0, Math.PI * 2); ctx.fill();
      /* ③ القطرات الثلاث الزجاجية على شبكة 96 — رأس نقطة ولمبة دائرية */
      const drawDrop = (tx, ty, dr, tilt) => {
        const cyd = ty + 3.5 * dr;
        ctx.save();
        ctx.translate(tx, cyd);
        ctx.rotate((tilt * Math.PI) / 180);
        ctx.translate(-tx, -cyd);
        const g2 = ctx.createLinearGradient(tx, ty, tx, ty + 4.5 * dr);
        g2.addColorStop(0, "#BAE6FD"); g2.addColorStop(0.45, "#38BDF8"); g2.addColorStop(1, "#0369A1");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.bezierCurveTo(tx - 0.45 * dr, ty + 1.2 * dr, tx - 0.9 * dr, ty + 2.4 * dr, tx - 0.958 * dr, ty + 3.213 * dr);
        ctx.arc(tx, cyd, dr, Math.PI + 0.291, -0.291, true);
        ctx.bezierCurveTo(tx + 0.9 * dr, ty + 2.4 * dr, tx + 0.45 * dr, ty + 1.2 * dr, tx, ty);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.ellipse(tx - 0.28 * dr, ty + 3 * dr, 0.26 * dr, 0.5 * dr, -26 * Math.PI / 180, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawDrop(37.5, 62.5, 2.7, -12);
      drawDrop(49.5, 59.5, 4.1, 0);
      drawDrop(60.5, 62, 2.7, 12);
      ctx.restore();
    } catch (e) { /* ختم زخرفي لا يكسر البطاقة أبدًا */ }
  };

  /* ══ ③ مساعد Leaflet الاحتياطي — فحص typeof L قبل أي تهيئة ══ */
  window.__matarEnsureLeaflet = function () {
    try {
      if (typeof L !== "undefined") return Promise.resolve(true);
      const p = window.matarLeafletReady || Promise.resolve(false);
      return p.then((ok) => !!ok);
    } catch (e) { return Promise.resolve(false); }
  };

  /* ══ ترجمات رسائل الرادار الجديدة بسبع لغات (تُدمج في قاموس التطبيق) ══ */
  try {
    if (window.I18N_EXTRA) {
      Object.assign(window.I18N_EXTRA, {
        "تعذّر وصول رادار RainViewer — تُعرض تقديرات أمطار NASA GIBS (IMERG) ويعاد الرادار اللحظي تلقائيًا كل 5 دقائق": {
          en: "RainViewer's radar is unreachable — showing NASA GIBS (IMERG) rain estimates; live radar retries automatically every 5 minutes.",
          fr: "Le radar RainViewer est inaccessible — estimations de pluie NASA GIBS (IMERG) affichées ; nouvelle tentative automatique toutes les 5 minutes.",
          de: "RainViewer-Radar nicht erreichbar — NASA-GIBS-Regenschätzungen (IMERG) werden angezeigt; automatischer Retry alle 5 Minuten.",
          es: "El radar de RainViewer no está accesible — se muestran estimaciones de lluvia de NASA GIBS (IMERG); reintento automático cada 5 minutos.",
          pt: "O radar da RainViewer está inacessível — mostrando estimativas de chuva da NASA GIBS (IMERG); nova tentativa automática a cada 5 minutos.",
          it: "Il radar RainViewer non è raggiungibile — stime di pioggia NASA GIBS (IMERG) in mostra; nuovo tentativo automatico ogni 5 minuti.",
        },
        "تعذّر وصول رادار RainViewer — تُعرض تقديرات أمطار NASA GIBS (IMERG) ويعاد الرادار اللحظي تلقائيًا.": {
          en: "RainViewer's radar is unreachable — NASA GIBS (IMERG) rain estimates are shown; live radar retries automatically.",
          fr: "Le radar RainViewer est inaccessible — estimations de pluie NASA GIBS (IMERG) affichées ; nouvelle tentative automatique.",
          de: "RainViewer-Radar nicht erreichbar — NASA-GIBS-Regenschätzungen (IMERG) werden angezeigt; automatischer Retry.",
          es: "El radar de RainViewer no está accesible — se muestran estimaciones de NASA GIBS (IMERG); reintento automático.",
          pt: "O radar da RainViewer está inacessível — estimativas de chuva da NASA GIBS (IMERG); nova tentativa automática.",
          it: "Il radar RainViewer non è raggiungibile — stime di pioggia NASA GIBS (IMERG); nuovo tentativo automatico.",
        },
        "تُعرض سحب NASA GIBS الحية بديلًا — ويعاد رادار RainViewer تلقائيًا كل 5 دقائق": {
          en: "Live NASA GIBS clouds shown instead — RainViewer radar retries automatically every 5 minutes.",
          fr: "Nuages NASA GIBS en direct en remplacement — le radar RainViewer réessaie automatiquement toutes les 5 minutes.",
          de: "Live-NASA-GIBS-Wolken als Ersatz — RainViewer-Radar versucht es automatisch alle 5 Minuten erneut.",
          es: "Nubes en vivo de NASA GIBS como alternativa — el radar RainViewer reintenta automáticamente cada 5 minutos.",
          pt: "Nuvens ao vivo da NASA GIBS como alternativa — o radar RainViewer tenta novamente automaticamente a cada 5 minutos.",
          it: "Nuvole live NASA GIBS in sostituzione — il radar RainViewer riprova automaticamente ogni 5 minuti.",
        },
      });
    }
  } catch (e) { /* القاموس اختياري */ }

  /* ══ انتظار جسر المحرك الرئيسي ══ */
  let B = null;
  let tries0 = 0;
  const bootWait = () => {
    B = window.__matarBridge || null;
    if (B) start();
    else if (++tries0 < 80) setTimeout(bootWait, 125);
  };
  bootWait();

  function start() {
    const $ = (s, r) => (r || document).querySelector(s);
    const state = B.state;
    const { tr, localNum, tempText, clamp, hourIndexAtPlace } = B;
    const lang2 = () => String(B.lang?.() || "ar").slice(0, 2);

    /* ══ الترجمة: واجهة الزراعة الدقيقة باللغات السبع ══ */
    const L10N = {
      en: {
        "الزراعة الدقيقة الذكية": "Smart Precision Agriculture",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Pick your crop — moisture, frost and heat limits adjust automatically",
        "نوع المحصول": "Crop profile",
        "قمح وحبوب": "Wheat & grains", "خضروات وطماطم": "Vegetables & tomato", "موالح وفاكهة": "Citrus & fruit", "نخيل": "Palm", "محاصيل ورقية": "Leafy greens",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Smart spraying window — next 24 hours",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Best spraying hours: wind under 15 km/h, no rain within 6 hours, moderate humidity",
        "آمن للرش": "Safe to spray", "خطر انجراف الرذاذ": "Drift risk", "خطر غسل الرشاشة (مطر)": "Washout risk (rain)", "حرارة حرجة أو جفاف زائد": "Critical heat / too dry",
        "بانتظار بيانات الطقس…": "Waiting for weather data…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Growing Degree Days (GDD) — today",
        "درجة الأساس للمحصول": "Crop base temp", "التراكم 7 أيام": "7-day total",
        "حدود رطوبة التربة المثالية": "Ideal soil moisture", "حساسية الصقيع": "Frost sensitivity", "الحرارة الحرجة": "Critical heat",
        "خطة إنقاذ فورية — خطر صقيع": "Instant rescue plan — frost risk",
        "خطة إنقاذ فورية — موجات حارة": "Instant rescue plan — heat wave",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "No frost or extreme heat risk in the next 48 hours — your field is safe",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "A quick light irrigation before sunset protects roots from dawn frost; cover sensitive seedlings with fabric before midnight and run smudge pots on open plots.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "Irrigate early at dawn to full depth, postpone any spraying until after the heat peak, and give partial shade to nurseries and sensitive plots.",
        "يبدأ تقريبًا": "starting around", "استماع سريع": "Quick listen", "مشاركة كصورة": "Share as image",
        "أقل من المدى المثالي — يلزم ري قريب": "Below ideal range — irrigation needed",
        "ضمن المدى المثالي للمحصول": "Within the ideal range for this crop",
        "فوق المدى المثالي — احذر التشبّع المائي": "Above ideal range — watch drainage & waterlogging",
        "أفضل نافذة رش اليوم": "Best spraying window today", "لا نافذة آمنة اليوم — الأقل ضررًا": "No fully safe window today — least harm",
        "توصيتي الزراعية من مَطَر برو": "My farm advisory from Matar Pro",
        "رطوبة التربة الآن": "Soil moisture now", "درجة": "°", "ساعة": "h", "يوم": "day",
        "نافذة الرش الآمنة": "Safe spraying window", "من": "from", "إلى": "to", "رياح هادئة": "calm wind", "كم/س": "km/h",
        "حالة النمو الحراري": "Thermal growth status", "نشاط ممتاز للمحصول": "Excellent crop activity", "نشاط جيد للمحصول": "Good crop activity", "نشاط نمو محدود اليوم": "Limited growth activity today", "لا نشاط نمو فعلي — تحت درجة الأساس": "No effective growth — below base temperature",
        "خطة الإنقاذ الفورية": "Instant rescue plan",
      },
      fr: {
        "الزراعة الدقيقة الذكية": "Agriculture de précision intelligente",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Choisissez votre culture — humidité, gel et chaleur critiques s'ajustent automatiquement",
        "نوع المحصول": "Profil de culture",
        "قمح وحبوب": "Blé & céréales", "خضروات وطماطم": "Légumes & tomate", "موالح وفاكهة": "Agrumes & fruits", "نخيل": "Palmier", "محاصيل ورقية": "Cultures feuillues",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Fenêtre de traitement sûre — 24 prochaines heures",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Meilleures heures : vent < 15 km/h, pas de pluie dans 6 h, humidité modérée",
        "آمن للرش": "Pulvérisation sûre", "خطر انجراف الرذاذ": "Risque de dérive", "خطر غسل الرشاشة (مطر)": "Risque de lessivage (pluie)", "حرارة حرجة أو جفاف زائد": "Chaleur critique / trop sec",
        "بانتظار بيانات الطقس…": "En attente des données météo…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Unités thermiques (GDD) — aujourd'hui",
        "درجة الأساس للمحصول": "Température de base", "التراكم 7 أيام": "Cumul 7 jours",
        "حدود رطوبة التربة المثالية": "Humidité du sol idéale", "حساسية الصقيع": "Sensibilité au gel", "الحرارة الحرجة": "Chaleur critique",
        "خطة إنقاذ فورية — خطر صقيع": "Plan de sauvetage immédiat — risque de gel",
        "خطة إنقاذ فورية — موجات حارة": "Plan de sauvetage immédiat — vague de chaleur",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "Aucun risque de gel ou de chaleur extrême dans les 48 h — votre champ est en sécurité",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "Un arrosage léger avant le coucher du soleil protège les racines du gel de l'aube ; couvrez les jeunes plants avant minuit et allumez les boucliers thermiques en plein champ.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "Irriguez tôt à l'aube en profondeur, reportez toute pulvérisation après le pic de chaleur et ombragez les pépinières sensibles.",
        "يبدأ تقريبًا": "à partir d'environ", "استماع سريع": "Écoute rapide", "مشاركة كصورة": "Partager en image",
        "أقل من المدى المثالي — يلزم ري قريب": "Sous la plage idéale — irrigation nécessaire",
        "ضمن المدى المثالي للمحصول": "Dans la plage idéale de cette culture",
        "فوق المدى المثالي — احذر التشبّع المائي": "Au-dessus de la plage — surveillez drainage et engorgement",
        "أفضل نافذة رش اليوم": "Meilleure fenêtre du jour", "لا نافذة آمنة اليوم — الأقل ضررًا": "Aucune fenêtre sûre — le moins nuisible",
        "توصيتي الزراعية من مَطَر برو": "Mon conseil agricole de Matar Pro",
        "رطوبة التربة الآن": "Humidité du sol", "درجة": "°", "ساعة": "h", "يوم": "j",
        "نافذة الرش الآمنة": "Fenêtre de traitement sûre", "من": "de", "إلى": "à", "رياح هادئة": "vent calme", "كم/س": "km/h",
        "حالة النمو الحراري": "État thermique de croissance", "نشاط ممتاز للمحصول": "Activité excellente pour la culture", "نشاط جيد للمحصول": "Activité correcte pour la culture", "نشاط نمو محدود اليوم": "Croissance limitée aujourd'hui", "لا نشاط نمو فعلي — تحت درجة الأساس": "Pas de croissance effective — sous la température de base",
        "خطة الإنقاذ الفورية": "Plan de sauvetage immédiat",
      },
      de: {
        "الزراعة الدقيقة الذكية": "Smart Precision Farming",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Kultur wählen — Feuchte-, Frost- und Hitzegrenzen stellen sich automatisch ein",
        "نوع المحصول": "Kulturprofil",
        "قمح وحبوب": "Weizen & Getreide", "خضروات وطماطم": "Gemüse & Tomate", "موالح وفاكهة": "Zitrus & Obst", "نخيل": "Palme", "محاصيل ورقية": "Blattgemüse",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Sicheres Spritzfenster — nächste 24 Stunden",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Beste Stunden: Wind < 15 km/h, kein Regen in 6 h, mäßige Luftfeuchte",
        "آمن للرش": "Sicher spritzen", "خطر انجراف الرذاذ": "Abdrift-Risiko", "خطر غسل الرشاشة (مطر)": "Auswaschungsrisiko (Regen)", "حرارة حرجة أو جفاف زائد": "Kritische Hitze / zu trocken",
        "بانتظار بيانات الطقس…": "Warte auf Wetterdaten…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Growing Degree Days (GDD) — heute",
        "درجة الأساس للمحصول": "Basistemperatur", "التراكم 7 أيام": "7-Tage-Summe",
        "حدود رطوبة التربة المثالية": "Ideale Bodenfeuchte", "حساسية الصقيع": "Frostempfindlichkeit", "الحرارة الحرجة": "Kritische Hitze",
        "خطة إنقاذ فورية — خطر صقيع": "Sofort-Rettungsplan — Frostgefahr",
        "خطة إنقاذ فورية — موجات حارة": "Sofort-Rettungsplan — Hitzewelle",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "Keine Frost- oder Hitzefahr in den nächsten 48 Stunden — Ihr Feld ist sicher",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "Eine schnelle leichte Bewässerung vor Sonnenuntergang schützt die Wurzeln vor Morgenfrost; empfindliche Jungpflanzen vor Mitternacht abdecken und Frostschutzbefeuerung offen halten.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "In der Frühe gründlich bewässern, jede Spritzung nach der Hitzeespitze verschieben und empfindliche Beete teilweise beschatten.",
        "يبدأ تقريبًا": "beginnt gegen", "استماع سريع": "Schnell anhören", "مشاركة كصورة": "Als Bild teilen",
        "أقل من المدى المثالي — يلزم ري قريب": "Unter dem Idealbereich — Bewässerung nötig",
        "ضمن المدى المثالي للمحصول": "Im Idealbereich dieser Kultur",
        "فوق المدى المثالي — احذر التشبّع المائي": "Über dem Idealbereich — Drainage und Staunässe beachten",
        "أفضل نافذة رش اليوم": "Bestes Spritzfenster heute", "لا نافذة آمنة اليوم — الأقل ضررًا": "Kein sicheres Fenster — am wenigsten schädlich",
        "توصيتي الزراعية من مَطَر برو": "Mein Agrar-Tipp von Matar Pro",
        "رطوبة التربة الآن": "Bodenfeuchte jetzt", "درجة": "°", "ساعة": "h", "يوم": "T",
        "نافذة الرش الآمنة": "Sicheres Spritzfenster", "من": "von", "إلى": "bis", "رياح هادئة": "ruhiger Wind", "كم/س": "km/h",
        "حالة النمو الحراري": "Wärmeentwicklung", "نشاط ممتاز للمحصول": "Hervorragende Kulturaktivität", "نشاط جيد للمحصول": "Gute Kulturaktivität", "نشاط نمو محدود اليوم": "Begrenztes Wachstum heute", "لا نشاط نمو فعلي — تحت درجة الأساس": "Kein wirksames Wachstum — unter Basistemperatur",
        "خطة الإنقاذ الفورية": "Sofort-Rettungsplan",
      },
      es: {
        "الزراعة الدقيقة الذكية": "Agricultura de precisión inteligente",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Elige tu cultivo — humedad, helada y calor crítico se ajustan automáticamente",
        "نوع المحصول": "Perfil de cultivo",
        "قمح وحبوب": "Trigo y cereales", "خضروات وطماطم": "Verduras y tomate", "موالح وفاكهة": "Cítricos y fruta", "نخيل": "Palma", "محاصيل ورقية": "Hojas verdes",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Ventana segura de pulverización — próximas 24 h",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Mejores horas: viento < 15 km/h, sin lluvia en 6 h y humedad moderada",
        "آمن للرش": "Seguro para rociar", "خطر انجراف الرذاذ": "Riesgo de deriva", "خطر غسل الرشاشة (مطر)": "Riesgo de lavado (lluvia)", "حرارة حرجة أو جفاف زائد": "Calor crítico / demasiado seco",
        "بانتظار بيانات الطقس…": "Esperando datos del tiempo…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Grados día de crecimiento (GDD) — hoy",
        "درجة الأساس للمحصول": "Temperatura base", "التراكم 7 أيام": "Acumulado 7 días",
        "حدود رطوبة التربة المثالية": "Humedad ideal del suelo", "حساسية الصقيع": "Sensibilidad a la helada", "الحرارة الحرجة": "Calor crítico",
        "خطة إنقاذ فورية — خطر صقيع": "Plan de rescate inmediato — riesgo de helada",
        "خطة إنقاذ فورية — موجات حارة": "Plan de rescate inmediato — ola de calor",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "Sin riesgo de helada o calor extremo en las próximas 48 h — tu campo está seguro",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "Un riego ligero rápido antes del atardecer protege las raíces de la helada del alba; cubre los semilleros sensibles antes de medianoche y usa quemadores de protección en parcelas abiertas.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "Riega de madrugada en profundidad, pospone cualquier pulverización hasta pasada la picos de calor y da sombra parcial a los viveros sensibles.",
        "يبدأ تقريبًا": "comienza hacia", "استماع سريع": "Escucha rápida", "مشاركة كصورة": "Compartir como imagen",
        "أقل من المدى المثالي — يلزم ري قريب": "Por debajo del rango ideal — necesita riego",
        "ضمن المدى المثالي للمحصول": "Dentro del rango ideal para este cultivo",
        "فوق المدى المثالي — احذر التشبّع المائي": "Por encima del rango — vigila drenaje y encharcamiento",
        "أفضل نافذة رش اليوم": "Mejor ventana hoy", "لا نافذة آمنة اليوم — الأقل ضررًا": "Sin ventana segura — el menos dañino",
        "توصيتي الزراعية من مَطَر برو": "Mi asesoría agrícola de Matar Pro",
        "رطوبة التربة الآن": "Humedad del suelo", "درجة": "°", "ساعة": "h", "يوم": "d",
        "نافذة الرش الآمنة": "Ventana segura de pulverización", "من": "de", "إلى": "a", "رياح هادئة": "viento calmado", "كم/س": "km/h",
        "حالة النمو الحراري": "Estado térmico de crecimiento", "نشاط ممتاز للمحصول": "Actividad excelente del cultivo", "نشاط جيد للمحصول": "Actividad buena del cultivo", "نشاط نمو محدود اليوم": "Crecimiento limitado hoy", "لا نشاط نمو فعلي — تحت درجة الأساس": "Sin crecimiento efectivo — bajo la temperatura base",
        "خطة الإنقاذ الفورية": "Plan de rescate inmediato",
      },
      pt: {
        "الزراعة الدقيقة الذكية": "Agricultura de precisão inteligente",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Escolha a cultura — humidade, geada e calor críticos ajustam-se automaticamente",
        "نوع المحصول": "Perfil da cultura",
        "قمح وحبوب": "Trigo e cereais", "خضروات وطماطم": "Vegetais e tomate", "موالح وفاكهة": "Citrus e frutas", "نخيل": "Palmeira", "محاصيل ورقية": "Folhosas",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Janela segura de pulverização — próximas 24 h",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Melhores horas: vento < 15 km/h, sem chuva em 6 h, humidade moderada",
        "آمن للرش": "Seguro para pulverizar", "خطر انجراف الرذاذ": "Risco de deriva", "خطر غسل الرشاشة (مطر)": "Risco de lavagem (chuva)", "حرارة حرجة أو جفاف زائد": "Calor crítico / muito seco",
        "بانتظار بيانات الطقس…": "À espera dos dados meteorológicos…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Graus-dia de crescimento (GDD) — hoje",
        "درجة الأساس للمحصول": "Temperatura base", "التراكم 7 أيام": "Acumulado 7 dias",
        "حدود رطوبة التربة المثالية": "Humidade ideal do solo", "حساسية الصقيع": "Sensibilidade à geada", "الحرارة الحرجة": "Calor crítico",
        "خطة إنقاذ فورية — خطر صقيع": "Plano de resgate imediato — risco de geada",
        "خطة إنقاذ فورية — موجات حارة": "Plano de resgate imediato — onda de calor",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "Sem risco de geada ou calor extremo nas próximas 48 h — o campo está seguro",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "Uma rega leve rápida antes do pôr do sol protege as raízes da geada da madrugada; cubra as plântulas sensíveis antes da meia-noite e acenda proteções térmicas em campos abertos.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "Regue de madrugada em profundidade, adie qualquer pulverização para depois do pico de calor e dê sombra parcial aos viveiros sensíveis.",
        "يبدأ تقريبًا": "começa por volta das", "استماع سريع": "Ouvir rápido", "مشاركة كصورة": "Partilhar como imagem",
        "أقل من المدى المثالي — يلزم ري قريب": "Abaixo da faixa ideal — precisa de rega",
        "ضمن المدى المثالي للمحصول": "Dentro da faixa ideal desta cultura",
        "فوق المدى المثالي — احذر التشبّع المائي": "Acima da faixa ideal — atenção à drenagem e encharcamento",
        "أفضل نافذة رش اليوم": "Melhor janela hoje", "لا نافذة آمنة اليوم — الأقل ضررًا": "Sem janela segura — o menos prejudicial",
        "توصيتي الزراعية من مَطَر برو": "O meu aviso agrícola do Matar Pro",
        "رطوبة التربة الآن": "Humidade do solo", "درجة": "°", "ساعة": "h", "يوم": "d",
        "نافذة الرش الآمنة": "Janela segura de pulverização", "من": "das", "إلى": "às", "رياح هادئة": "vento calmo", "كم/س": "km/h",
        "حالة النمو الحراري": "Estado térmico de crescimento", "نشاط ممتاز للمحصول": "Atividade excelente da cultura", "نشاط جيد للمحصول": "Boa atividade da cultura", "نشاط نمو محدود اليوم": "Crescimento limitado hoje", "لا نشاط نمو فعلي — تحت درجة الأساس": "Sem crescimento efetivo — abaixo da temperatura base",
        "خطة الإنقاذ الفورية": "Plano de resgate imediato",
      },
      it: {
        "الزراعة الدقيقة الذكية": "Agricoltura di precisione intelligente",
        "حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا": "Scegli la coltura — umidità, gelo e calore critico si regolano automaticamente",
        "نوع المحصول": "Profilo della coltura",
        "قمح وحبوب": "Grano e cereali", "خضروات وطماطم": "Ortaggi e pomodoro", "موالح وفاكهة": "Agrumi e frutta", "نخيل": "Palma", "محاصيل ورقية": "Ortaggi a foglia",
        "نافذة الرش الآمنة — 24 ساعة القادمة": "Finestra sicura di irrorazione — prossime 24 h",
        "أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة": "Migliori ore: vento < 15 km/h, nessuna pioggia entro 6 h, umidità moderata",
        "آمن للرش": "Trattamento sicuro", "خطر انجراف الرذاذ": "Rischio deriva", "خطر غسل الرشاشة (مطر)": "Rischio dilavamento (pioggia)", "حرارة حرجة أو جفاف زائد": "Calore critico / troppo secco",
        "بانتظار بيانات الطقس…": "In attesa dei dati meteo…",
        "وحدات النمو الحرارية (GDD) — اليوم": "Gradi giorno di crescita (GDD) — oggi",
        "درجة الأساس للمحصول": "Temperatura base", "التراكم 7 أيام": "Totale 7 giorni",
        "حدود رطوبة التربة المثالية": "Umidità ideale del suolo", "حساسية الصقيع": "Sensibilità al gelo", "الحرارة الحرجة": "Calore critico",
        "خطة إنقاذ فورية — خطر صقيع": "Piano di soccorso immediato — rischio gelo",
        "خطة إنقاذ فورية — موجات حارة": "Piano di soccorso immediato — ondata di calore",
        "لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان": "Nessun rischio di gelo o calore estremo nelle prossime 48 ore — il campo è al sicuro",
        "ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.": "Un'irrigazione leggera rapida prima del tramonto protegge le radici dal gelo dell'alba; copri le piantine sensibili prima di mezzanotte e accendi le protezioni termiche nelle aree scoperte.",
        "اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.": "Irriga all'alba in profondità, posticipa ogni trattamento dopo il picco di calore e ombreggia parzialmente i vivai sensibili.",
        "يبدأ تقريبًا": "inizia verso", "استماع سريع": "Ascolto rapido", "مشاركة كصورة": "Condividi come immagine",
        "أقل من المدى المثالي — يلزم ري قريب": "Sotto la gamma ideale — serve irrigazione",
        "ضمن المدى المثالي للمحصول": "Nella gamma ideale per questa coltura",
        "فوق المدى المثالي — احذر التشبّع المائي": "Sopra la gamma ideale — controlla drenaggio e ristagni",
        "أفضل نافذة رش اليوم": "Migliore finestra di oggi", "لا نافذة آمنة اليوم — الأقل ضررًا": "Nessuna finestra sicura — il meno dannoso",
        "توصيتي الزراعية من مَطَر برو": "Il mio consiglio agrario di Matar Pro",
        "رطوبة التربة الآن": "Umidità del suolo", "درجة": "°", "ساعة": "h", "يوم": "g",
        "نافذة الرش الآمنة": "Finestra sicura di irrorazione", "من": "dalle", "إلى": "alle", "رياح هادئة": "vento calmo", "كم/س": "km/h",
        "حالة النمو الحراري": "Stato termico della crescita", "نشاط ممتاز للمحصول": "Attività eccellente della coltura", "نشاط جيد للمحصول": "Buona attività della coltura", "نشاط نمو محدود اليوم": "Crescita limitata oggi", "لا نشاط نمو فعلي — تحت درجة الأساس": "Nessuna crescita effettiva — sotto la temperatura base",
        "خطة الإنقاذ الفورية": "Piano di soccorso immediato",
      },
    };
    const T = (k) => (lang2() === "ar" ? k : (L10N[lang2()]?.[k] ?? L10N.en[k] ?? k));

    /* ══ ملفات المحاصيل: درجة الأساس (GDD) + حدود رطوبة التربة المثالية
       + عتبة صقيع المحصول + الحرارة الحرجة + سقف GDD اليومي ══ */
    const CROPS = [
      { id: "wheat", emoji: "🌾", name: "قمح وحبوب", base: 4.4, soil: [30, 60], frost: -6, heat: 32, ceil: 30 },
      { id: "veg", emoji: "🍅", name: "خضروات وطماطم", base: 10, soil: [55, 80], frost: 2, heat: 35, ceil: 30 },
      { id: "citrus", emoji: "🍊", name: "موالح وفاكهة", base: 10, soil: [50, 70], frost: 0, heat: 38, ceil: 35 },
      { id: "palm", emoji: "🌴", name: "نخيل", base: 13, soil: [35, 60], frost: -2, heat: 45, ceil: 38 },
      { id: "leafy", emoji: "🌿", name: "محاصيل ورقية", base: 5, soil: [60, 85], frost: 1, heat: 28, ceil: 25 },
    ];
    const LS_KEY = "matar:v52:crop";
    let cropId = (() => { try { return localStorage.getItem(LS_KEY) || "wheat"; } catch (e) { return "wheat"; } })();
    const crop = () => CROPS.find((c) => c.id === cropId) || CROPS[0];

    /* الحفظ الرسمي في matar:state (كاش حالة المستخدم الذي ينجو عبر الترقيات) */
    function setCrop(id) {
      cropId = id;
      try { localStorage.setItem(LS_KEY, id); } catch (e) {}
      try { caches.open("matar:state").then((c) => c.put("/__matar_v52_crop", new Response(id))).catch(() => {}); } catch (e) {}
      render();
    }

    const fmtHour = (iso) => {
      try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat(lang2() === "ar" ? "ar-EG" : lang2(), { hour: "2-digit", minute: "2-digit" }).format(d);
      } catch (e) { return String(iso || "").slice(11, 16); }
    };

    /* ══ بناء الواجهة مرة واحدة (زراعة كسولة — عند فتح الصفحة حصرًا) ══ */
    function ensureUI() {
      const host = $("#agri-content");
      if (!host || $("#v52-cropbar")) return;
      host.insertAdjacentHTML("afterbegin", `
        <div class="v52-cropbar" id="v52-cropbar" role="group" aria-label="${T("نوع المحصول")}">
          <span class="v52-croplbl">${T("نوع المحصول")}</span>
          ${CROPS.map((c) => `<button type="button" class="v52-crop" data-crop="${c.id}" aria-pressed="false">${c.emoji} ${T(c.name)}</button>`).join("")}
        </div>
        <section class="card section v52-card" id="v52-agri-card">
          <div class="sec-head">
            <div>
              <h2>${T("الزراعة الدقيقة الذكية")}</h2>
              <p class="hint">${T("حدد محصولك — تُضبط حدود الرطوبة والصقيع والحرارة الحرجة تلقائيًا")}</p>
            </div>
            <span class="sec-badge" id="v52-crop-badge">🌾</span>
          </div>
          <h3>${T("نافذة الرش الآمنة — 24 ساعة القادمة")}</h3>
          <p class="hint">${T("أفضل ساعات الرش: رياح أقل من 15 كم/س، لا أمطار خلال 6 ساعات، ورطوبة معتدلة")}</p>
          <div class="v52-stripwrap"><div class="v52-strip" id="v52-spray-strip" aria-hidden="true"></div></div>
          <div class="v52-legend" id="v52-spray-legend">
            <span><i style="background:#10b981"></i>${T("آمن للرش")}</span>
            <span><i style="background:#d97706"></i>${T("خطر انجراف الرذاذ")}</span>
            <span><i style="background:#2563eb"></i>${T("خطر غسل الرشاشة (مطر)")}</span>
            <span><i style="background:#dc2626"></i>${T("حرارة حرجة أو جفاف زائد")}</span>
          </div>
          <p id="v52-spray-sum">—</p>
          <h3>${T("وحدات النمو الحرارية (GDD) — اليوم")}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">
            <span class="v52-gdd-num" id="v52-gdd-val">—</span>
            <span style="font-size:12px;color:var(--muted)"><b id="v52-gdd-base">—</b> · ${T("التراكم 7 أيام")}: <b id="v52-gdd-acc">—</b></span>
          </div>
          <div class="v53-gdd-verdict" id="v52-gdd-verdict" data-level="none">${T("حالة النمو الحراري")}: —</div>
          <div id="v52-crop-limits" class="v52-crop-limits">—</div>
          <h3>${T("خطة الإنقاذ الفورية")}</h3>
          <div id="v52-rescue"></div>
          <div class="v52-tools">
            <button type="button" class="ai-fresh v52-share" id="v52-agri-share">🖼 ${T("مشاركة كصورة")}</button>
          </div>
        </section>`);
      host.querySelectorAll(".v52-crop").forEach((btn) => {
        btn.addEventListener("click", () => setCrop(btn.dataset.crop));
      });
      /* v54: زر «استماع سريع» حُذف من الزراعة الدقيقة — صوت التطبيق كله محصور
         في موضعين حصرًا (النشرة الصوتية + تفاصيل اليوم)، وزر المشاركة كصورة يعمل كما هو */
      try { window.__matarAgroSpeechText = speechText; } catch (e) {}
      $("#v52-agri-share").onclick = () => shareFarmCard();
    }

    function renderCropbar() {
      const c = crop();
      document.querySelectorAll(".v52-crop").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.crop === c.id));
      });
      const badge = $("#v52-crop-badge");
      if (badge) badge.textContent = c.emoji;
    }

    /* ══ نافذة الرش الآمنة: تصنيف ساعة بساعة من بيانات النموذج الحية ══ */
    function sprayClass(h, i, s, critHeat) {
      const wind = h.wind_speed_10m?.[s + i] ?? 0;
      const gust = h.wind_gusts_10m?.[s + i] ?? wind;
      const rh = h.relative_humidity_2m?.[s + i] ?? 50;
      const temp = h.temperature_2m?.[s + i] ?? 25;
      let rain6 = 0;
      for (let k = i; k < Math.min(i + 6, 24); k += 1) rain6 += h.precipitation?.[s + k] ?? 0;
      if (rain6 >= 0.2) return "wash";
      if (wind >= 15 || gust >= 25) return "drift";
      if (temp >= critHeat || rh < 30) return "hot";
      if (rh > 90) return "drift";
      return "ok";
    }

    function renderSpray(wx) {
      const strip = $("#v52-spray-strip");
      const sum = $("#v52-spray-sum");
      if (!strip) return;
      const h = wx.hourly;
      const s = hourIndexAtPlace(wx);
      const c = crop();
      const bars = [];
      let bestIdx = -1;
      for (let i = 0; i < 24; i += 1) {
        const cls = sprayClass(h, i, s, c.heat);
        bars.push(cls);
        if (cls === "ok" && bestIdx < 0) bestIdx = i;
      }
      strip.innerHTML = bars.map((cls, i) => `<b class="${cls}" title="${fmtHour(h.time?.[s + i])}"><small>${i % 3 === 0 ? fmtHour(h.time?.[s + i]) : ""}</small></b>`).join("");
      if (bestIdx >= 0) {
        /* v53: صياغة زراعية احترافية — «نافذة الرش الآمنة: من X إلى Y (رياح هادئة W كم/س)»
           مع قياس طول النافذة الآمنة المتصلة وسرعة الرياح عند بدايتها */
        let endIdx = bestIdx;
        while (endIdx + 1 < 24 && bars[endIdx + 1] === "ok") endIdx += 1;
        const windBest = Math.round(h.wind_speed_10m?.[s + bestIdx] ?? 0);
        sum.textContent = `${T("نافذة الرش الآمنة")}: ${T("من")} ${fmtHour(h.time?.[s + bestIdx])} ${T("إلى")} ${fmtHour(h.time?.[s + endIdx])} (${T("رياح هادئة")} ${localNum(windBest)} ${T("كم/س")})`;
      } else {
        sum.textContent = `${T("لا نافذة آمنة اليوم — الأقل ضررًا")}: ${fmtHour(h.time?.[s])}`;
      }
    }

    /* ══ GDD: max(0, ((Tmax+Tmin)/2 − Tbase)) بسقف يومي للمحصول ══ */
    function renderGDD(wx) {
      const d = wx.daily;
      const c = crop();
      const val = $("#v52-gdd-val"), base = $("#v52-gdd-base"), acc = $("#v52-gdd-acc"), lim = $("#v52-crop-limits");
      if (!val) return;
      const tmax = d?.temperature_2m_max?.[0], tmin = d?.temperature_2m_min?.[0];
      let gdd = 0;
      if (tmax != null && tmin != null) gdd = clamp(((tmax + tmin) / 2 - c.base), 0, c.ceil);
      val.textContent = `${localNum(gdd, 1)} °م`;
      base.textContent = `${T("درجة الأساس للمحصول")}: ${localNum(c.base, 1)} °م`;
      let acc7 = 0;
      if (d?.temperature_2m_max && d?.temperature_2m_min) {
        for (let i = 0; i < Math.min(7, d.temperature_2m_max.length); i += 1) {
          const hi = d.temperature_2m_max[i], lo = d.temperature_2m_min[i];
          if (hi != null && lo != null) acc7 += clamp(((hi + lo) / 2 - c.base), 0, c.ceil);
        }
      }
      acc.textContent = `${localNum(acc7, 0)} °م`;
      /* v53: صياغة احترافية لحالة النمو الحراري نسبةً إلى سقف المحصول اليومي */
      const verdict = $("#v52-gdd-verdict");
      if (verdict) {
        const ratio = c.ceil > 0 ? gdd / c.ceil : 0;
        const level = gdd <= 0 ? "none" : ratio >= 0.5 ? "great" : ratio >= 0.25 ? "good" : "low";
        const vTxt = gdd <= 0 ? T("لا نشاط نمو فعلي — تحت درجة الأساس") : level === "great" ? T("نشاط ممتاز للمحصول") : level === "good" ? T("نشاط جيد للمحصول") : T("نشاط نمو محدود اليوم");
        verdict.textContent = `${T("حالة النمو الحراري")}: ${vTxt}`;
        verdict.dataset.level = level;
      }
      if (lim) {
        lim.innerHTML = `${T("حدود رطوبة التربة المثالية")}: <b>${c.soil[0]}٪ – ${c.soil[1]}٪</b> · ${T("حساسية الصقيع")}: <b>${tempText(c.frost)}</b> · ${T("الحرارة الحرجة")}: <b>${tempText(c.heat)}</b>`;
      }
    }

    /* رطوبة التربة الآن مقابل مدى المحصول */
    function soilNow(wx) {
      const h = wx.hourly;
      const s = hourIndexAtPlace(wx);
      const v = h.soil_moisture_0_to_1cm?.[s];
      return v == null ? null : Math.round(v * 100);
    }

    /* ══ بطاقة الإنقاذ الفورية: صقيع المزروع أولًا ثم الحر الشديد ══ */
    function renderRescue(wx) {
      const box = $("#v52-rescue");
      if (!box) return;
      const h = wx.hourly;
      const s = hourIndexAtPlace(wx);
      const N = Math.min(49, h.time.length - s);
      const c = crop();
      let frostIdx = -1, frostMin = Infinity;
      let heatIdx = -1, heatMax = -Infinity;
      for (let i = 0; i < N; i += 1) {
        const v = h.temperature_2m?.[s + i];
        if (v == null) continue;
        if (v < frostMin) frostMin = v;
        if (v > heatMax) heatMax = v;
        if (frostIdx < 0 && v <= c.frost) frostIdx = i;
        if (heatIdx < 0 && v >= c.heat) heatIdx = i;
      }
      const when = (i) => `${T("يبدأ تقريبًا")} ${fmtHour(h.time?.[s + i])}`;
      if (frostIdx >= 0) {
        box.innerHTML = `<div class="v52-rescue frost">
          <span class="v52-rs-emoji">🧊</span>
          <div><strong>${T("خطة إنقاذ فورية — خطر صقيع")} · ${tempText(frostMin)}</strong>
          <p>${T("ريّة خفيفة سريعة قبل الغروب لحماية الجذور من صقيع الفجر، وغطِّ الشتلات الحساسة بأغطية قماشية قبل منتصف الليل، وشغّل المدخّنات للمساحات المكشوفة.")}</p>
          <span class="v52-when">⏱ ${when(frostIdx)}</span></div></div>`;
      } else if (heatIdx >= 0) {
        box.innerHTML = `<div class="v52-rescue">
          <span class="v52-rs-emoji">🔥</span>
          <div><strong>${T("خطة إنقاذ فورية — موجات حارة")} · ${tempText(heatMax)}</strong>
          <p>${T("اسقِ فجرًا مبكرًا بعمق كافٍ، وأجّل أي رش إلى ما بعد الذروة الحرارية، ووفّر ظلًا جزئيًا للمشاتل والحقول الحساسة.")}</p>
          <span class="v52-when">⏱ ${when(heatIdx)}</span></div></div>`;
      } else {
        box.innerHTML = `<div class="v52-rescue" style="border-color:color-mix(in srgb,var(--ok) 38%,transparent);border-inline-start-color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,transparent)">
          <span class="v52-rs-emoji">✅</span>
          <div><strong>${T("لا مخاطر صقيع أو حر شديد خلال 48 ساعة القادمة — الحقل بأمان")}</strong></div></div>`;
      }
    }

    /* نص الاستماع: ملخص زراعي منطقي من القيم الحقيقية */
    function speechText() {
      const wx = state.wx;
      if (!wx?.hourly) return "";
      const c = crop();
      const sm = soilNow(wx);
      const smTxt = sm == null ? "—" : sm < c.soil[0] ? T("أقل من المدى المثالي — يلزم ري قريب") : sm > c.soil[1] ? T("فوق المدى المثالي — احذر التشبّع المائي") : T("ضمن المدى المثالي للمحصول");
      const best = $("#v52-spray-sum")?.textContent || "";
      const gdd = $("#v52-gdd-val")?.textContent || "";
      const rescue = $("#v52-rescue")?.innerText?.split("\n")[0] || "";
      return `${T(c.name)}. ${T("رطوبة التربة الآن")} ${sm == null ? "—" : localNum(sm) + "٪"}: ${smTxt}. ${best}. ${T("وحدات النمو الحرارية (GDD) — اليوم")} ${gdd}. ${rescue}`;
    }

    /* ══ مشاركة التوصية الزراعية كبطاقة 1080×1350 مع ختم الشعار ══ */
    async function shareFarmCard() {
      try {
        const wx = state.wx;
        const c = crop();
        const canvas = document.createElement("canvas");
        canvas.width = 1080; canvas.height = 1350;
        const ctx = canvas.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, 1080 * 0.7, 1350);
        g.addColorStop(0, "#163A5F"); g.addColorStop(1, "#0B192C");
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1350);
        ctx.direction = "rtl"; ctx.textAlign = "right";
        ctx.fillStyle = "rgba(255,250,240,0.9)";
        ctx.font = "700 32px 'Segoe UI', Tahoma, Arial, sans-serif";
        ctx.fillText(`مَطَر برو · ${T(c.name)}`, 1010, 88);
        ctx.fillStyle = "#ffe9b8";
        ctx.font = "800 50px 'Segoe UI', Tahoma, Arial, sans-serif";
        const wrap = (text, x, y, maxW, lh) => {
          const words = String(text || "").split(/\s+/);
          let line = "", yy = y;
          words.forEach((w) => {
            const t = line ? line + " " + w : w;
            if (ctx.measureText(t).width > maxW) { ctx.fillText(line, x, yy); yy += lh; line = w; }
            else line = t;
          });
          if (line) { ctx.fillText(line, x, yy); yy += lh; }
          return yy;
        };
        let y = wrap(T("الزراعة الدقيقة الذكية"), 1010, 175, 930, 62);
        const sm = wx?.hourly ? soilNow(wx) : null;
        const lines = [
          `${T("رطوبة التربة الآن")}: ${sm == null ? "—" : localNum(sm) + "٪"} (${sm == null ? "—" : sm < c.soil[0] ? T("أقل من المدى المثالي — يلزم ري قريب") : sm > c.soil[1] ? T("فوق المدى المثالي — احذر التشبّع المائي") : T("ضمن المدى المثالي للمحصول")})`,
          `${$("#v52-spray-sum")?.textContent || ""}`,
          `${T("وحدات النمو الحرارية (GDD) — اليوم")}: ${$("#v52-gdd-val")?.textContent || "—"} · ${T("التراكم 7 أيام")}: ${$("#v52-gdd-acc")?.textContent || "—"}`,
          `${T("حدود رطوبة التربة المثالية")}: ${c.soil[0]}٪–${c.soil[1]}٪ · ${T("الحرارة الحرجة")}: ${tempText(c.heat)}`,
          `${$("#v52-rescue")?.innerText?.trim() || ""}`,
        ];
        ctx.fillStyle = "#fffaf0";
        ctx.font = "600 32px 'Segoe UI', Tahoma, Arial, sans-serif";
        y = Math.max(y + 40, 320);
        lines.forEach((ln) => { y = wrap(ln, 1010, y, 930, 48) + 14; });
        ctx.fillStyle = "rgba(255,250,240,0.62)";
        ctx.font = "700 26px 'Segoe UI', Tahoma, Arial, sans-serif";
        ctx.fillText(`${new Intl.DateTimeFormat(lang2() === "ar" ? "ar-EG" : lang2(), { day: "numeric", month: "long" }).format(new Date())} · ${T("توصيتي الزراعية من مَطَر برو")}`, 1010, 1240);
        try { window.__matarDrawLogoStamp?.(ctx, 88, 1262, 56); } catch (e) {}
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        const title = T("توصيتي الزراعية من مَطَر برو");
        const file = new File([blob], "matar-pro-v53-farm.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file], title }); return; } catch (e) { /* ألغى المستخدم */ }
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "matar-pro-v53-farm.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } catch (e) { /* زينة لا تكسر شيئًا */ }
    }

    /* ══ الرسم الكسول: يبدأ فقط عند فتح صفحة المزارعين أو وصول بيانات جديدة ══ */
    function render() {
      try {
        if (document.body?.dataset?.page !== "agri") return;
        ensureUI();
        renderCropbar();
        const wx = state.wx;
        if (!wx?.hourly) {
          const strip = $("#v52-spray-strip");
          if (strip) strip.innerHTML = "";
          const sum = $("#v52-spray-sum");
          if (sum) sum.textContent = T("بانتظار بيانات الطقس…");
          return;
        }
        /* رسم داخل إطار طلب واحد — بلا كتل متزامنة ثقيلة حفاظًا على 60fps */
        requestAnimationFrame(() => {
          try { renderSpray(wx); } catch (e) {}
          try { renderGDD(wx); } catch (e) {}
          try { renderRescue(wx); } catch (e) {}
        });
      } catch (e) { /* وحدة زراعية اختيارية لا تكسر الصفحة */ }
    }

    /* ══ بوابة الصفحة الكسولة (نفس نمط v51): مراقب data-page + أحداث البيانات ══ */
    let last = document.body?.dataset?.page === "agri";
    if (last) setTimeout(render, 60);
    if ("MutationObserver" in window && document.body) {
      new MutationObserver(() => {
        const cur = document.body?.dataset?.page === "agri";
        if (cur && !last) setTimeout(render, 60);
        last = cur;
      }).observe(document.body, { attributes: true, attributeFilter: ["data-page"] });
    }
    document.addEventListener("matar:data", () => { if (document.body?.dataset?.page === "agri") setTimeout(render, 30); });
    document.addEventListener("matar:unit", () => { if (document.body?.dataset?.page === "agri") setTimeout(render, 30); });
    document.addEventListener("matar:language", () => {
      /* إعادة بناء الواجهة بنصوص اللغة الجديدة */
      try {
        const bar = $("#v52-cropbar");
        const card = $("#v52-agri-card");
        if (bar) bar.remove();
        if (card) card.remove();
        if (document.body?.dataset?.page === "agri") setTimeout(render, 60);
      } catch (e) {}
    });
  }
})();
    

/* ═══════════════════ v53/54 — الصوت بلا تداخل (المستمع الموحد بمرحلة الالتقاط) ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 54: الصوت بلا تداخل عبر موضعين مضبوطين فقط
   (Controlled Dual-Point Audio)
   ------------------------------------------------------------
   ① موضعا الصوت الوحيدان في التطبيق كله بعد إزالة كل أزرار
     «استمع» من المستشارين وصفحات v51 والزراعة الدقيقة:
       • «🎙 نشرة اليوم الصوتية» أعلى الصفحة الرئيسية.
       • «🔊 استمع لتفاصيل اليوم» في بطاقة تفاصيل اليوم المختار
         بتقويم «توقعات الشهر القادم».
   ② مستمع واحد على document بمرحلة الالتقاط ينفّذ فورًا
     e.preventDefault() + e.stopImmediatePropagation() — كل كود
     نطق قديم موروث معطّل نهائيًا ولا يتنافس مع الوحدة أبدًا.
   ③ قاعدة النطق القاطعة: window.speechSynthesis.cancel() قبل
     speak() حصرًا — النص كاملًا بعبارة واحدة متماسكة (__v54Single)
     بلا تقسيم ولا تسلسل ولا مؤقتات، وبلا أي محرك سحابي إطلاقًا (v57: حُذف
     كود google.com وnew Audio نهائيًا). نبرة هادئة وسرعة 0.88 لجميع اللغات
     السبع عبر المحرك الموحد المُغلَّف في v48b (صوت الرجل العربي المنقّى
     Hamed/Naayf/Tarik/Maged للعربية).
   ============================================================ */
(() => {
  /* v56: موضعا الصوت الوحيدان في التطبيق كله */
  const SEL = "#voice-brief-btn, .v51-listen";
  /* v56: القفل الزمني الصارم — أي نقرة ثانية خلال 1000 مللي ثانية (ثانية كاملة) تُبتلع */
  const LOCK_MS = 1000;

  function stopAll() {
    try { window.stopAllSpeech?.(); } catch (e) {}
    try { window.speechSynthesis.cancel(); } catch (e) {}
    try { window.__matarSpeaking = false; } catch (e) {}
  }

  function lang2() {
    try { return String(window.__matarBridge?.lang?.() || "ar").slice(0, 2); } catch (e) { return "ar"; }
  }

  /* ══ v56: التنقية العتادية للمستمعات (Hardware-Level Listener Purge) ══
     استنساخ الزر واستبداله في DOM عبر replaceWith يمسح أي مستمع قديم
     (click/pointerdown/touchstart/onclick) نهائيًا وبلا استثناءات —
     فيستجيب الزر لمسار واحد فقط: المستمع الموحد أدناه (click حصرًا). */
  function sanitize(btn) {
    if (!btn || btn.dataset?.v56Clean === "1") return btn;
    try {
      const clone = btn.cloneNode(true);
      clone.removeAttribute("onclick");
      clone.removeAttribute("onpointerdown");
      clone.removeAttribute("ontouchstart");
      clone.removeAttribute("data-speaking");
      clone.setAttribute("aria-pressed", "false");
      clone.dataset.v56Clean = "1";
      btn.replaceWith(clone);
      return clone;
    } catch (e) { return btn; }
  }
  /* زر النشرة الصوتية الثابت: تنقية فورية عند الإقلاع */
  const sanitizeBrief = () => sanitize(document.getElementById("voice-brief-btn"));
  try {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sanitizeBrief, { once: true });
    else sanitizeBrief();
  } catch (e) {}
  /* أزرار «استمع لتفاصيل اليوم» الديناميكية: كل زر جديد يُستنسخ لحظة إضافته للصفحة */
  try {
    new MutationObserver(() => {
      try { document.querySelectorAll(".v51-listen:not([data-v56-clean='1'])").forEach(sanitize); } catch (e) {}
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  /* جمع نص القسم من محتواه الحقيقي (نفس منطق sectionSpeechText في v51) */
  function collectSectionText(root) {
    try {
      const bits = [];
      const h = root.querySelector("h2, h3, .v51-sheet-title");
      const ht = h ? String(h.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (ht) bits.push(ht);
      root.querySelectorAll(".adv-title, .adv-msg, .joq-verdict, .adv-when, .v51-tip h4, .v51-tip p").forEach((n) => {
        const t = String(n.textContent || "").replace(/\s+/g, " ").trim();
        if (t && t.length > 3 && !t.includes("— —")) bits.push(t);
      });
      return smartCut(bits.join(". ").replace(/\s*\.\s*\./g, "."), 620); /* v70 — C-03: قطع ذكي بلا بتر كلمات */
    } catch (e) { return ""; }
  }

  /* موفّرات النص لكل زر — بلا أي نطق مباشر هنا */
  function textFor(btn) {
    try {
      /* نص تفاصيل اليوم المعدّ مسبقًا — جملة واحدة متماسكة */
      if (btn.dataset?.speak) return String(btn.dataset.speak || "");
      if (btn.id === "voice-brief-btn") return window.__matarBriefText?.() || "";
      if (btn.classList?.contains("v51-listen")) {
        const sheet = btn.closest("#v51-sheet-body");
        if (sheet) return collectSectionText(sheet);
      }
      return "";
    } catch (e) { return ""; }
  }

  /* ══ v56: صوت الرجل العربي المنقّى — اختيار مباشر داخل الوحدة ══
     الأولوية: Hamed ← Naayf ← Tarik ← Maged ← Male، ثم أي ar-SA ثم أي صوت عربي. */
  function pickVoice(l2) {
    try {
      const vs = window.speechSynthesis.getVoices?.() || [];
      if (l2 !== "ar") return vs.find((v) => String(v.lang || "").toLowerCase().startsWith(l2)) || null;
      const isAr = (v) => /^ar([-_]|$)/i.test(String(v.lang || ""));
      const pick = (re) => vs.find((v) => isAr(v) && re.test(String(v.name || ""))) || null;
      return pick(/hamed|حامد/i)
        || pick(/naayf|nayef|نايف/i)
        || pick(/tarik|طارق/i)
        || pick(/maged|majed|ماجد/i)
        || pick(/\bmale\b|ذكر/i)
        || vs.find((v) => isAr(v) && /^ar[-_]sa$/i.test(String(v.lang || "")))
        || vs.find(isAr)
        || null;
    } catch (e) { return null; }
  }

  /* ══ النطق الموحد القاطع: cancel() ← انتظار 80ms ← speak() مرة واحدة فقط ══
     قفل حالة عام window.__matarSpeaking يمنع أي نطق موازٍ، وبلا أي محرك
     سحابي أو مسار بديل بالتوازي — الجملة كاملة بعبارة واحدة متماسكة. */
  function speak(txt, btn) {
    const text = String(txt || "").trim();
    if (!text || !("speechSynthesis" in window)) return;
    stopAll(); /* cancel() فوري قبل أي شيء */
    window.__matarSpeaking = true;
    const l2 = lang2();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { ar: "ar-SA", en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES", pt: "pt-PT", it: "it-IT" }[l2] || "en-US";
    const v = pickVoice(l2);
    /* v58 (Smart Voice Fallback): البحث أولًا عن صوت يبدأ بـ ar (ar-SA/ar-EG/ar)
       عبر pickVoice أعلاه — وإن لم يتوفر أي صوت عربي مثبت في المتصفح يبقى
       utterance.voice = null فيتكفل محرك النظام الافتراضي بالنطق تلقائيًا
       بدل توقفه بصمت */
    if (v) { try { u.voice = v; if (v.lang) u.lang = v.lang; } catch (e) {} }
    else { try { u.voice = null; } catch (e) {} }
    u.volume = 1;
    u.__v54Single = true;
    u.rate = 0.88; u.pitch = 0.88; /* v57: نبرة هادئة وسرعة 0.88 لجميع اللغات السبع */
    if (btn) { btn.setAttribute("data-speaking", "1"); btn.setAttribute("aria-pressed", "true"); }
    const done = () => {
      try { window.__matarSpeaking = false; } catch (e) {}
      if (btn) { btn.removeAttribute("data-speaking"); btn.setAttribute("aria-pressed", "false"); }
    };
    u.onend = done;
    u.onerror = done;
    /* فاصل 80ms بعد cancel كي لا يدمج المتصفح الجملة الجديدة مع بقايا القديمة */
    setTimeout(() => {
      try {
        if (window.__matarSpeaking !== true) return; /* أُلغي أثناء الفاصل — لا نطق إطلاقًا */
        /* v58: resume() قبل speak() — فكّ تعليق محرك الصوت المجمد في متصفحات
           Chromium/Android كي يخرج الصوت العربي فعلًا بدل الصمت */
        try { window.speechSynthesis.resume(); } catch (e) {}
        window.speechSynthesis.speak(u);
      } catch (e) { done(); }
    }, 80);
  }

  /* ══ المستمع الوحيد في التطبيق لأزرار الصوت — click حصرًا بمرحلة الالتقاط ══
     بلا pointerdown ولا touchstart نهائيًا، مع قفل زمني عام 1000ms على
     window.__matarLastAudioTs يتجاهل أي نقرة ثانية خلال الثانية الكاملة. */
  document.addEventListener("click", (e) => {
    const btn0 = e.target?.closest?.(SEL);
    if (!btn0) return;
    /* منع أي كود نطق قديم من التشغيل بالتوازي — فورًا ودائمًا */
    e.preventDefault();
    e.stopImmediatePropagation();
    const now = Date.now();
    try {
      if (now - (window.__matarLastAudioTs || 0) < LOCK_MS) return; /* القفل الزمني الصارم 1000ms */
      window.__matarLastAudioTs = now;
    } catch (err) { window.__matarLastAudioTs = now; }
    /* فكّ قفل محرك النطق داخل اللمسة نفسها (شرط iOS) — بلا أي حدث لمس موازٍ */
    try { window.__matarUnlock?.(); } catch (err) {}
    /* تنقية احترازية داخل اللمسة: استنساخ الزر يمسح أي مستمع تراكمي */
    const btn = sanitize(btn0);
    /* تبديل: الزر الناطق نفسه = إيقاف فوري */
    if (btn.dataset.speaking === "1") {
      btn.removeAttribute("data-speaking");
      btn.setAttribute("aria-pressed", "false");
      stopAll();
      return;
    }
    /* إزالة حالة النطق من كل زر آخر (لا يوجد أكثر من صوت واحد أبدًا) */
    try {
      document.querySelectorAll("[data-speaking='1']").forEach((b) => {
        if (b !== btn) b.removeAttribute("data-speaking");
      });
    } catch (err) {}
    const t = textFor(btn);
    if (t && typeof t.then === "function") t.then((txt) => speak(txt, btn)).catch(() => {});
    else speak(t, btn);
  }, { capture: true });

  /* إيقاف احترازي عند إخفاء الصفحة */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      try { document.querySelectorAll("[data-speaking='1']").forEach((b) => b.removeAttribute("data-speaking")); } catch (e) {}
      try { window.__matarSpeaking = false; } catch (e) {}
    }
  });
})();
    

/* ═══════════════════ v62 — نافذة السيرة الذاتية داخل التطبيق (زر الطباعة PDF) ═══════════════════ */

      /* ═══ v62-script: نافذة السيرة الذاتية الداخلية (In-App Developer CV Modal) ═══
         زرّا بطاقة «عن المطوّر» بأسفل الإعدادات (data-matar-cv) يفتحان النافذة عبر
         تفويض نقر بمرحلة الالتقاط — فيعمل مع أي إعادة رسم ديناميكية للوحة الإعدادات
         — وزر 🖨️ يستدعي window.print() وتتولى قواعد @media print طباعة بطاقة السيرة
         وحدها بشكل نظيف على A4 — والإغلاق بزر ✕ أو بالخلفية أو بزر Escape. */
      (function () {
        "use strict";
        /* ══ v72 — إصلاح توقيت الربط (تطابق index.html ↔ app.js) ══
           نافذة السيرة #matarCvModal تقع في نهاية <body> بعد وسوم السكربتات
           نفسها، فلا تكون موجودة في DOM لحظة تنفيذ app.js — كان الربط الفوري
           يعود خاليًا (getElementById = null) فلا تُربط النافذة أبدًا ولا
           تستجيب أزرارها. الآن يُؤجَّل الربط كله إلى DOMContentLoaded (نفس
           نمط كتلتي v71/v72 أدناه وحارس الشعار v60 أعلى الملف) فيعمل مع أي
           موضع للنافذة في الصفحة — دون أي تغيير في المعرّفات أو السمات
           أو السلوك (التفويض بمرحلة الالتقاط يظل يعمل مع أي إعادة رسم
           ديناميكية للوحة الإعدادات). */
        function wireCvModal() {
          var modal = document.getElementById("matarCvModal");
          if (!modal || modal.dataset.v62Bound === "1") return;
          modal.dataset.v62Bound = "1";
          var printBtn = document.getElementById("mcvPrintBtn");
          function openCv() {
            if (!modal.hidden) return;
            modal.hidden = false;
            requestAnimationFrame(function () { modal.classList.add("open"); });
            document.body.classList.add("matar-cv-open");
            try { document.body.style.setProperty("overflow", "hidden", "important"); } catch (e) {}
            try { if (printBtn) printBtn.focus({ preventScroll: true }); } catch (e) {}
          }
          function closeCv() {
            modal.classList.remove("open");
            document.body.classList.remove("matar-cv-open");
            try { document.body.style.removeProperty("overflow"); } catch (e) {}
            setTimeout(function () { if (!modal.classList.contains("open")) modal.hidden = true; }, 230);
          }
          document.addEventListener("click", function (e) {
            var el = e.target && e.target.closest ? e.target.closest("[data-matar-cv],[data-mcv-close]") : null;
            if (!el) return;
            e.preventDefault();
            if (el.hasAttribute("data-mcv-close")) closeCv();
            else openCv();
          }, true);
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.hidden) closeCv();
          });
          if (printBtn) printBtn.addEventListener("click", function () {
            try { window.print(); } catch (e) {}
          });
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", wireCvModal, { once: true });
        } else {
          wireCvModal();
        }
      })();

/* ═══════════════════════════════════════════════════════════════════════════
   v71 — المرحلة الثانية: الترحيب الشخصي الذكي + ترجمة الاسم والشريط السفلي
   ─────────────────────────────────────────────────────────────────────────
   ① معالج مفاتيح data-i18n الرمزية (app_brand_name · dock_home …
      dock_settings): يطبق قاموس I18N_EXTRA على عناصر الواجهة الثابتة
      فوراً وعند كل تبديل لغة — بجانب مشي النصوص القائم (translateTree)
      دون أي تعارض (المفاتيح العربية القديمة يتكفل بها المشي نفسه).
   ② الترحيب الشخصي: سطر تحية أنيق (#hero-greet) أعلى اسم المدينة في
      البطل يتغير حسب ساعة المدينة المختارة (نفس منطقة «الوقت المحلي»
      اتساقاً مع M-03) مع الاسم الأول المحفوظ في matar_user_name:
      5:00–11:59 «صباح الخير، الاسم ☀️» · 12:00–17:59 «طاب مساؤك، الاسم 🌤️»
      · 18:00–4:59 «مساء الخير، الاسم 🌙» — وبلا اسم عند التخطي، بالسبع لغات.
   ③ نافذة الاسم الزجاجية عند أول زيارة فقط (لا اسم محفوظ + لم يُضغط
      «تخطي» = مفتاح matar_user_skipped) + خانة تعديل/مسح الاسم في
      صفحة الإعدادات (#user-name-card).
   ④ M-02: هياكل عظمية (Skeleton) للبطاقات الكسولة — «المدن المفضلة
      الحية» تُرسم هيكلها فور الإقلاع إن وُجدت مدن محفوظة (تُستبدل فور
      اكتمال الجلب)، وصمام أمان يعيد «—» لشارة وقت الرادار المصغّر إن
      لم يصلها تحديث خلال 12 ثانية (هيكل «اليوم مقابل غدًا» ثابت في
      index.html ويُستبدل برسم المقارنة في كل المسارات).
   التخزين كله محلي على الجهاز: matar_user_name · matar_user_skipped.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const NAME_KEY = "matar_user_name";
  const SKIP_KEY = "matar_user_skipped";

  /* ─── اسم المستخدم (تخزين محلي صرف — بلا أي خادم) ─── */
  function getUserName() {
    try {
      const v = String(localStorage.getItem(NAME_KEY) || "").trim();
      return v ? v.slice(0, 24) : "";
    } catch (e) { return ""; }
  }
  function setUserName(name) { try { localStorage.setItem(NAME_KEY, name); } catch (e) {} }
  function clearUserName() { try { localStorage.removeItem(NAME_KEY); } catch (e) {} }
  function hasSkipped() { try { return localStorage.getItem(SKIP_KEY) === "1"; } catch (e) { return false; } }
  function markSkipped() { try { localStorage.setItem(SKIP_KEY, "1"); } catch (e) {} }

  /* ─── ① معالج مفاتيح data-i18n الرمزية ───
     المفاتيح الجديدة (app_brand_name · dock_*) تحمل قيمة «ar» داخل قاموس
     I18N_EXTRA لأنها ليست نصوصاً عربية — فتُطبق مباشرة بأي لغة. المفاتيح
     العربية القديمة (130+ عنصراً) إما تجد مدخلاً في القاموس فيُطبق نفس
     النص الذي يكتبه مشي النصوص، أو لا تجده فيُترك العنصر لمشي النصوص. */
  function applyKeyI18n(root) {
    try {
      let scope;
      if (root && typeof root.querySelectorAll === "function") {
        scope = (root.matches && root.matches("[data-i18n]"))
          ? [root, ...root.querySelectorAll("[data-i18n]")]
          : [...root.querySelectorAll("[data-i18n]")];
      } else {
        scope = [...document.querySelectorAll("[data-i18n]")];
      }
      scope.forEach((el) => {
        const key = el.dataset ? el.dataset.i18n : el.getAttribute("data-i18n");
        if (!key) return;
        const entry = (typeof I18N_EXTRA !== "undefined") && I18N_EXTRA && I18N_EXTRA[key];
        if (!entry) return;
        const val = entry[currentLanguage] ?? entry.ar;
        if (val != null) el.textContent = val;
      });
    } catch (e) { /* الترجمة زينة — لا تكسر شيئاً أبداً */ }
  }

  /* ─── ② التحية الذكية ───
     الساعة بتوقيت المدينة المختارة (نفس منطقة سطر «الوقت المحلي» في البطل)،
     وسقوطاً آمناً لساعة الجهاز عند غياب المنطقة الزمنية. */
  function greetHour() {
    try {
      const zone = (state && (state.wx?.timezone || state.place?.timezone)) || null;
      if (zone) {
        const h = parseInt(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: zone }).format(new Date()), 10);
        if (Number.isFinite(h)) return ((h % 24) + 24) % 24;
      }
    } catch (e) {}
    return new Date().getHours();
  }
  function greetText() {
    const h = greetHour();
    const bucket = (h >= 5 && h < 12) ? "am" : (h >= 12 && h < 18) ? "pm" : "ev";
    const word = { am: "صباح الخير", pm: "طاب مساؤك", ev: "مساء الخير" }[bucket];
    const emoji = { am: "☀️", pm: "🌤️", ev: "🌙" }[bucket];
    const name = getUserName();
    return name ? `${tf(`${word}، {name}`, { name })} ${emoji}` : `${tr(word)} ${emoji}`;
  }
  let lastGreet = "";
  function renderGreeting() {
    const g = document.getElementById("hero-greet");
    if (!g) return;
    const txt = greetText();
    if (txt === lastGreet) return;
    lastGreet = txt;
    g.textContent = txt;
  }

  /* ─── ③ نافذة الاسم (Onboarding Modal) ───
     العناصر تُحل عند الإقلاع لا عند التنفيذ: النافذة تقع في نهاية body بعد
     وسوم السكربت نفسها، فلا تكون موجودة في DOM لحظة تنفيذ app.js */
  const nm = {};
  function resolveNm() {
    nm.overlay = nm.overlay || document.getElementById("name-modal");
    nm.input = nm.input || document.getElementById("name-modal-input");
    nm.save = nm.save || document.getElementById("name-modal-save");
    nm.skip = nm.skip || document.getElementById("name-modal-skip");
    return nm.overlay;
  }
  let modalOpen = false;
  function openModal() {
    if (!nm.overlay || modalOpen) return;
    modalOpen = true;
    nm.overlay.hidden = false;
    requestAnimationFrame(() => nm.overlay.classList.add("open"));
    setTimeout(() => { try { nm.input && nm.input.focus({ preventScroll: true }); } catch (e) {} }, 300);
  }
  function closeModal(markSkip) {
    if (!nm.overlay || !modalOpen) return;
    modalOpen = false;
    if (markSkip) markSkipped(); /* «تخطي» الصريح وحده يمنع إعادة الظهور */
    nm.overlay.classList.remove("open");
    setTimeout(() => { try { nm.overlay.hidden = true; } catch (e) {} }, 260);
  }
  function maybeShowModal() {
    try {
      if (getUserName() || hasSkipped()) return;
      /* ننتظر رحيل شاشة البداية كي تظهر النافذة فوق واجهة جاهزة */
      if (document.getElementById("v52-splash")) { setTimeout(maybeShowModal, 450); return; }
      openModal();
    } catch (e) {}
  }
  function wireModal() {
    if (!nm.overlay || nm.overlay.dataset.v71) return;
    nm.overlay.dataset.v71 = "1";
    const doSave = () => {
      const name = String((nm.input && nm.input.value) || "").trim().slice(0, 24);
      if (!name) {
        if (nm.input) {
          nm.input.classList.add("nm-err");
          setTimeout(() => nm.input.classList.remove("nm-err"), 520);
          try { nm.input.focus({ preventScroll: true }); } catch (e) {}
        }
        return;
      }
      setUserName(name);
      closeModal(false);
      renderGreeting();
      syncSettingsName();
    };
    nm.save && nm.save.addEventListener("click", doSave);
    nm.skip && nm.skip.addEventListener("click", () => closeModal(true));
    nm.input && nm.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); doSave(); }
    });
    /* إغلاق لطيف (بلا تخطٍّ) بالنقر على الخلفية أو Escape — «تخطي» وحده يمنع العودة */
    nm.overlay.addEventListener("click", (e) => { if (e.target === nm.overlay) closeModal(false); });
    document.addEventListener("keydown", (e) => {
      if (!modalOpen) return;
      if (e.key === "Escape") { e.preventDefault(); closeModal(false); return; }
      if (e.key !== "Tab") return;
      const f = [nm.input, nm.save, nm.skip].filter(Boolean);
      if (f.length < 2) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ─── خانة الاسم في الإعدادات (تُحل عند الإقلاع — نفس سبب نافذة الاسم) ─── */
  const st = {};
  function resolveSt() {
    st.input = st.input || document.getElementById("user-name-input");
    st.save = st.save || document.getElementById("user-name-save");
    st.clear = st.clear || document.getElementById("user-name-clear");
    st.state = st.state || document.getElementById("user-name-state");
    return !!(st.save && st.clear);
  }
  function syncSettingsName() {
    if (st.input) st.input.value = getUserName();
  }
  let stateTimer = null;
  function flashState(msg) {
    if (!st.state) return;
    st.state.textContent = msg || "";
    clearTimeout(stateTimer);
    if (msg) stateTimer = setTimeout(() => { st.state.textContent = ""; }, 3200);
  }
  function wireSettings() {
    if (!st.save || !st.clear || st.save.dataset.v71) return;
    st.save.dataset.v71 = "1";
    st.clear.dataset.v71 = "1";
    st.save.addEventListener("click", () => {
      const name = String((st.input && st.input.value) || "").trim().slice(0, 24);
      if (!name) { flashState(tr("اكتب اسمًا أولًا لحفظه")); return; }
      setUserName(name);
      flashState(tr("تم حفظ اسمك بنجاح"));
      renderGreeting();
    });
    st.clear.addEventListener("click", () => {
      clearUserName();
      if (st.input) st.input.value = "";
      flashState(tr("تم مسح اسمك — ستبقى التحية بلا اسم"));
      renderGreeting();
    });
    st.input && st.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); st.save.click(); }
    });
    syncSettingsName();
  }

  /* ─── ④ M-02: هياكل عظمية للبطاقات الكسولة ─── */
  function injectLazySkeletons() {
    /* شريط المدن المفضلة الحية: هيكل فوري فقط عند وجود مدن محفوظة —
       renderFavLive يستبدله عند اكتمال الجلب أو يمسحه إن خلت القائمة */
    try {
      const favs = JSON.parse(localStorage.getItem("matar:favs") || "[]");
      const host = document.getElementById("fav-live");
      if (host && Array.isArray(favs) && favs.length) {
        host.innerHTML = favs.slice(0, 4).map(() =>
          `<span class="fav-skel" aria-hidden="true"><span class="matar-skel" style="width:20px;height:20px;border-radius:50%"></span><span class="matar-skel" style="width:58px"></span><span class="matar-skel" style="width:38px"></span></span>`).join("");
      }
    } catch (e) {}
    /* صمام أمان شارة وقت الرادار المصغّر: إن لم يصلها تحديث خلال 12 ثانية
       نعيد «—» بدل هيكل عظمي عالق (الوضع الاقتصادي/فشل الرادار) */
    setTimeout(() => {
      try {
        const b = document.getElementById("mini-radar-time");
        if (b && b.querySelector(".matar-skel")) b.textContent = "—";
      } catch (e) {}
    }, 12000);
  }

  /* ─── الإقلاع والربط ─── */
  function boot() {
    resolveNm();
    resolveSt();
    applyKeyI18n();
    renderGreeting();
    wireModal();
    wireSettings();
    injectLazySkeletons();
    /* النافذة بعد استقرار الواجهة (~2.1 ثانية) — أول زيارة فقط */
    setTimeout(maybeShowModal, 2100);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  document.addEventListener("matar:language", () => {
    applyKeyI18n();
    renderGreeting();
    if (st.state) st.state.textContent = "";
  });
  document.addEventListener("matar:data", renderGreeting);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderGreeting(); });
  /* تجديد هادئ كل دقيقة — تتبدل التحية مع دورة اليوم دون أي وميض */
  setInterval(renderGreeting, 60_000);

  /* جسر عام لبقية السكربتات (نفس نمط __matarBridge) */
  try {
    window.__matarGreet = { text: greetText, render: renderGreeting, name: getUserName };
  } catch (e) {}
})();

/* ═══════════════════════════════════════════════════════════════════════════
   v72 — المرحلة الثانية (التنفيذ القياسي): تشغيل الترحيب الشخصي وحفظ الاسم
   ─────────────────────────────────────────────────────────────────────────
   تنفّذ هذه الكتلة مواصفة المرحلة الثانية بدقة تامة فوق كتلة v71 الموجودة
   أعلاه (دون حذف أو تعديل أي سطر منها) وتتولى هي وحدها السلوك النهائي:

   ① المفاتيح القياسية وفق المواصفة: matar_user_name + matar_onboarding_done.
      يُقرأ مفتاح v71 القديم matar_user_skipped احترامًا لمن تخطّى سابقًا (فلا
      تُزعجه النافذة مجددًا)، وتُكتب إليه مرآة "1" مع كل إتمام/تخطٍّ فتبقى
      كتلة v71 هادئة نهائيًا بلا أي ظهور مزدوج.
   ② نافذة الترحيب (#name-modal): عند الإقلاع (DOMContentLoaded) إن لم يكن
      هناك اسم محفوظ ولم يكتمل الترحيب سابقًا تُعرض النافذة بإزالة سمة
      hidden — بعد رحيل شاشة البداية — في منتصف الشاشة فوق كل العناصر
      (z-index: 9999 في style.css). «حفظ ومتابعة» يخزّن matar_user_name و
      matar_onboarding_done="1" معًا ثم يغلق ويحدّث التحية وحقل الإعدادات
      فورًا · «تخطي» يخزّن المفتاحين (بلا اسم) ويغلق فتظهر التحية بلا اسم.
   ③ دالة updatePersonalGreeting() العالمية: ساعة الجهاز الجارية
      new Date().getHours() وفق المواصفة — من 5 إلى 11 «صباح الخير، {name} ☀️»
      · من 12 إلى 17 «طاب مساؤك، {name} 🌤️» · من 18 إلى 4 «مساء الخير،
      {name} 🌙» (وبلا اسم عند غيابه) — عبر دوال الترجمة tf و tr فتظهر
      بلغة الواجهة النشطة بالسبع لغات، وتُستدعى عند الإقلاع وعند كل تغيير
      للغة (وتتجدد بهدوء كل دقيقة ومع عودة التبويب لتتبع دورة اليوم).
   ④ الاستحواذ النظيف على العناصر: تُستبدل عقدة النافذة وعقد حقل الإعدادات
      بنسخ مطابقة (cloneNode) فتسقط مستمعات v71 القديمة عن العقد الأصلية
      نهائيًا — دون حذف أي سطر ولا ازدواج مستمعين ولا صراع تركيز — بينما
      تبقى المعرّفات والفئات وسمات data-i18n كما هي، فتعمل عليها ترجمات
      i18n.js كاملة (مشي النصوص + معالج data-i18n الرمزية) بلا أي تغيير.
   ⑤ حارس التحية: مراقب MutationObserver على #hero-greet يعيد فورًا نص
      المواصفة (ساعة الجهاز) لو كتبت فيه كتلة v71 نصها القديم (ساعة
      المدينة) — التصحيح يجري قبل رسم الإطار فلا وميض ولا اهتزاز إطلاقًا.
   التخزين كله محلي على الجهاز فقط: matar_user_name · matar_onboarding_done
   (+ مرآة matar_user_skipped القديمة) — بلا أي خادم أو إرسال أي بيانات.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  /* ─── مفاتيح التخزين المحلي (على الجهاز فقط — بلا أي خادم) ─── */
  const NAME_KEY = "matar_user_name";       /* الاسم الأول للتحية الشخصية */
  const DONE_KEY = "matar_onboarding_done"; /* مفتاح المواصفة القياسي */
  const LEGACY_KEY = "matar_user_skipped";  /* مفتاح v71 — يُقرأ ويُرايا */

  function getName() {
    try {
      const v = String(localStorage.getItem(NAME_KEY) || "").trim();
      return v ? v.slice(0, 24) : "";
    } catch (e) { return ""; }
  }
  function saveName(name) { try { localStorage.setItem(NAME_KEY, name); } catch (e) {} }
  function wipeName() { try { localStorage.removeItem(NAME_KEY); } catch (e) {} }
  function isDone() {
    try {
      if (localStorage.getItem(DONE_KEY) === "1") return true;
      if (localStorage.getItem(LEGACY_KEY) === "1") return true; /* أتمّ/تخطّى سابقًا في v71 */
    } catch (e) {}
    return false;
  }
  function markDone() {
    try {
      localStorage.setItem(DONE_KEY, "1");   /* وفق المواصفة */
      localStorage.setItem(LEGACY_KEY, "1"); /* مرآة تُبقي v71 هادئة نهائيًا */
    } catch (e) {}
  }

  /* ─── ③ التحية الديناميكية — ساعة الجهاز الحالية وفق المواصفة ─── */
  function greetingParts() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { tpl: "صباح الخير، {name}", base: "صباح الخير", icon: "☀️" };
    if (h >= 12 && h < 18) return { tpl: "طاب مساؤك، {name}", base: "طاب مساؤك", icon: "🌤️" };
    return { tpl: "مساء الخير، {name}", base: "مساء الخير", icon: "🌙" };
  }
  function greetingText() {
    const g = greetingParts();
    const name = getName();
    /* الرمز في ذيل السطر — نفس ترتيب v71 فيتطابق النصان عند توافق التوقيتين */
    return (name ? tf(g.tpl, { name }) : tr(g.base)) + " " + g.icon;
  }

  let lastGreeting = null;
  function updatePersonalGreeting() {
    const el = document.getElementById("hero-greet");
    if (!el) return;
    lastGreeting = greetingText();
    if (el.textContent !== lastGreeting) el.textContent = lastGreeting;
  }

  /* حارس التحية: أي كتابة أخرى في السطر (من v71 بحساب ساعة المدينة) تُصحَّح
     فورًا إلى نص المواصفة (ساعة الجهاز) قبل رسم الإطار — بلا وميض إطلاقًا */
  let greetGuardOn = false;
  function installGreetGuard() {
    if (greetGuardOn) return;
    const el = document.getElementById("hero-greet");
    if (!el) return;
    greetGuardOn = true;
    new MutationObserver(() => {
      const node = document.getElementById("hero-greet");
      if (node && lastGreeting != null && node.textContent !== lastGreeting) {
        node.textContent = lastGreeting;
      }
    }).observe(el, { childList: true, characterData: true, subtree: true });
  }

  /* ─── ② نافذة الترحيب — عناصرها بعد وسوم السكربت فتُحل عند الإقلاع ─── */
  const dlg = {};
  let dlgOpen = false;

  function resolveDialog() {
    if (dlg.root) return dlg.root;
    const original = document.getElementById("name-modal");
    if (!original) return null;
    /* الاستحواذ النظيف: نسخة حية مطابقة (نفس المعرّفات والفئات وdata-i18n)
       تحل محل العقدة الأصلية فتسقط مستمعات v71 عنها نهائيًا */
    const live = original.cloneNode(true);
    original.replaceWith(live);
    dlg.root = live;
    dlg.input = live.querySelector("#name-modal-input");
    dlg.save = live.querySelector("#name-modal-save");
    dlg.skip = live.querySelector("#name-modal-skip");
    return live;
  }

  function openDialog() {
    if (!dlg.root || dlgOpen) return;
    dlgOpen = true;
    dlg.root.hidden = false; /* إزالة سمة hidden — تظهر في منتصف الشاشة */
    requestAnimationFrame(() => { try { dlg.root.classList.add("open"); } catch (e) {} });
    try { document.documentElement.classList.add("nm-lock"); } catch (e) {} /* قفل تمرير الخلفية */
    setTimeout(() => { try { dlg.input && dlg.input.focus({ preventScroll: true }); } catch (e) {} }, 300);
  }
  function closeDialog() {
    if (!dlg.root || !dlgOpen) return;
    dlgOpen = false;
    try { dlg.root.classList.remove("open"); } catch (e) {}
    try { document.documentElement.classList.remove("nm-lock"); } catch (e) {}
    setTimeout(() => { if (!dlgOpen) { try { dlg.root.hidden = true; } catch (e) {} } }, 300);
  }

  function needOnboarding() { return !getName() && !isDone(); }

  function maybeShowDialog(deadline) {
    try {
      if (!needOnboarding()) return;
      /* ننتظر رحيل شاشة البداية (رفعها من DOM أو تحوّلها الشفاف v52-bye)
         كي تظهر النافذة فوق واجهة جاهزة — بسقف أمان 9 ثوانٍ لا انتظار أبدًا */
      const splash = document.getElementById("v52-splash");
      if (splash && !splash.classList.contains("v52-bye") && Date.now() < deadline) {
        setTimeout(() => maybeShowDialog(deadline), 350);
        return;
      }
      openDialog();
    } catch (e) { /* زينة إقلاع لا تكسر شيئًا أبدًا */ }
  }

  function wireDialog() {
    if (!dlg.root || dlg.root.dataset.v72) return;
    dlg.root.dataset.v72 = "1";
    const doSave = () => {
      const name = String((dlg.input && dlg.input.value) || "").trim().slice(0, 24);
      if (!name) {
        /* اسم فارغ: هزّة لطيفة وتركيز — بلا إغلاق ولا تخزين */
        if (dlg.input) {
          dlg.input.classList.add("nm-err");
          setTimeout(() => { try { dlg.input.classList.remove("nm-err"); } catch (e) {} }, 560);
          try { dlg.input.focus({ preventScroll: true }); } catch (e) {}
        }
        return;
      }
      saveName(name);             /* matar_user_name */
      markDone();                 /* matar_onboarding_done = "1" (+ مرآة v71) */
      closeDialog();
      updatePersonalGreeting();   /* التحية في البطل فورًا */
      syncPrefsField();           /* حقل الاسم في الإعدادات فورًا */
    };
    dlg.save && dlg.save.addEventListener("click", doSave);
    dlg.skip && dlg.skip.addEventListener("click", () => {
      markDone();                 /* تخطٍّ صريح — لا تعود النافذة أبدًا */
      closeDialog();
      updatePersonalGreeting();   /* التحية بلا اسم */
    });
    dlg.input && dlg.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); doSave(); }
    });
    /* إغلاق لطيف بلا تخطٍّ (خلفية/Escape) — يعود السؤال في الزيارة التالية؛
       زر «تخطي» وحده يمنع العودة نهائيًا */
    dlg.root.addEventListener("click", (e) => { if (e.target === dlg.root) closeDialog(); });
    document.addEventListener("keydown", (e) => {
      if (!dlgOpen) return;
      if (e.key === "Escape") { e.preventDefault(); closeDialog(); return; }
      if (e.key !== "Tab") return;
      /* حصر التركيز داخل النافذة أثناء انفتاحها */
      const f = [dlg.input, dlg.save, dlg.skip].filter(Boolean);
      if (f.length < 2) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ─── خانة الاسم في الإعدادات — تُحل وتُستحوذ عليها عند الإقلاع ─── */
  const prefs = {};

  function resolvePrefs() {
    if (prefs.save) return true;
    const input = document.getElementById("user-name-input");
    const save = document.getElementById("user-name-save");
    const clear = document.getElementById("user-name-clear");
    const state = document.getElementById("user-name-state");
    if (!save || !clear) return false;
    /* الاستحواذ النظيف نفسه على الحقل والزرين ورسالة الحالة */
    [[input, "input"], [save, "save"], [clear, "clear"], [state, "state"]].forEach(([el, key]) => {
      if (!el) return;
      const live = el.cloneNode(true);
      el.replaceWith(live);
      prefs[key] = live;
    });
    return true;
  }

  function syncPrefsField() {
    if (prefs.input) { try { prefs.input.value = getName(); } catch (e) {} }
  }

  let statusTimer = null;
  let lastStatusKey = "";
  function showStatus(key) {
    lastStatusKey = key || "";
    if (!prefs.state) return;
    prefs.state.textContent = key ? tr(key) : ""; /* رسالة تأكيد مترجمة من i18n.js */
    if (statusTimer) clearTimeout(statusTimer);
    if (key) statusTimer = setTimeout(() => {
      lastStatusKey = "";
      if (prefs.state) prefs.state.textContent = "";
    }, 3600);
  }

  function wirePrefs() {
    if (!prefs.save || !prefs.clear || prefs.save.dataset.v72) return;
    prefs.save.dataset.v72 = "1";
    prefs.clear.dataset.v72 = "1";
    prefs.save.addEventListener("click", () => {
      const name = String((prefs.input && prefs.input.value) || "").trim().slice(0, 24);
      if (!name) { showStatus("اكتب اسمًا أولًا لحفظه"); return; }
      saveName(name);
      markDone(); /* من قدّم اسمه من الإعدادات أكمل الترحيب قطعًا */
      showStatus("تم حفظ اسمك بنجاح");
      updatePersonalGreeting();
    });
    prefs.clear.addEventListener("click", () => {
      wipeName();
      if (prefs.input) { try { prefs.input.value = ""; } catch (e) {} }
      showStatus("تم مسح اسمك — ستبقى التحية بلا اسم");
      updatePersonalGreeting();
    });
    prefs.input && prefs.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); prefs.save.click(); }
    });
    syncPrefsField();
  }

  /* ─── الإقلاع والربط ─── */
  function init() {
    resolveDialog();
    resolvePrefs();
    wireDialog();
    wirePrefs();
    updatePersonalGreeting(); /* عند الإقلاع — وفق المواصفة */
    installGreetGuard();
    if (needOnboarding()) maybeShowDialog(Date.now() + 9000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  /* عند كل تغيير للغة — وفق المواصفة: التحية ورسالة التأكيد بلغة الواجهة الجديدة */
  document.addEventListener("matar:language", () => {
    updatePersonalGreeting();
    if (lastStatusKey) showStatus(lastStatusKey);
  });
  /* تجديد هادئ كل دقيقة + عند عودة التبويب — تتبدل التحية مع دورة اليوم بلا وميض */
  setInterval(updatePersonalGreeting, 60_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updatePersonalGreeting(); });

  /* جسر عام للفحص والمراحل القادمة (نفس نمط __matarBridge و__matarGreet) */
  try {
    window.updatePersonalGreeting = updatePersonalGreeting;
    window.__matarOnboarding = {
      update: updatePersonalGreeting,
      getName, saveName, wipeName, isDone, markDone,
      open: openDialog, close: closeDialog, text: greetingText,
    };
  } catch (e) {}
})();
