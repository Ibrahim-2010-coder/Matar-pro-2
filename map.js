/* ═══════════════════════════════════════════════════════════════════════════
   مَطَر برو — map.js
   كل ما يخص الخرائط التفاعلية وطبقات الطقس والرادار وLeaflet ومسارات الطرق والزحمة
   ─────────────────────────────────────────────────────────────────────────
   المحتويات (بالترتيب):
     1) حماية تحميل CSS الخاص بـ Leaflet (بديل unpkg عند فشل cdnjs)
     2) محمّل Leaflet الاحتياطي window.matarLeafletReady (cdnjs ← unpkg ← jsdelivr)
     3) بنية الأساسات: BASE_PROVIDERS · ESRI_REF · ESRI_HILL_FAR · basemapRegistry ·
        themeBasemapWord · buildBasemapLayer · addBaseLayer · swapBasemap ·
        refreshBasemapsTheme · WINDY_BASE · addWindyBase
     4) وحدة الخريطة المصغرة والرادار اللحظي window.__matarMiniMapWidget
        (انتقلت من داخل وحدة Dashboard في السكربت الرئيسي — نفس الكود حرفيًا)
     5) وحدة Nowcast — تحليل حركة كتل المطر من رادار RainViewer
     6) وحدة MX — محرك الخريطة التفاعلية الكبرى (طبقات الطقس + الجزيئات) + window.MX
     7) وحدة Roads — طقس الطرق والسفر (OSRM + زحمة + محطات استراحة Overpass)
     8) v46 — الرفيق الذكي للقيادة الحية (مسارات بديلة + رادار المسار + بلاغات)
     9) v55 — طبقة التسمية «فلسطين المحتلة» window.matarCountryLabels
    10) v66 — رادار الأمطار والبرق + شريط التحكم الزمني الزجاجي
    11) v67 — تراكم الأمطار + خيوط الرياح الانسيابية + ملء الشاشة
    12) نقطة الإقلاع boot() — آخر ما ينفذ في التطبيق (كانت آخر سطر في السكربت الرئيسي)

   ترتيب التحميل الإلزامي داخل index.html (نهاية <body>):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" …></script>
     <script src="./app.js"></script>   ← أولًا: المحرك الأساسي والترجمة والوحدات التطبيقية
     <script src="./map.js"></script>   ← ثانيًا: هذا الملف (يعتمد على معرفات app.js العامة)

   ملاحظات النشر (مهمة):
     • CSP: يجب إضافة 'self' إلى script-src في ترويسة index.html
       (السياسة الحالية تسمح فقط بـ cdnjs/unpkg/jsdelivr وبصمات السكربتات الداخلية،
        والملفات الخارجية المحلية ستحجب بدون 'self' — وبصمات SHA-256 للسكربتات
        المنقولة لم تعد مطلوبة).
     • sw.js: أضف "./app.js" و"./map.js" إلى APP_SHELL وارفع إصدار الكاش.
     • الجسور العامة على window من هذا الملف:
       window.MX · window.matarCountryLabels · window.__matarMiniMapWidget ·
       window.__matarVeh · window.__matarNowcastTestHooks · window.matarLeafletReady
     • هذا الملف يقرأ (ولا يعيد تعريف) معرفات عامة من app.js مثل:
       $ · $$ · clamp · state · Eco · tr · tf · tx · getJson · clockText · showPage ·
       hourIndexAtPlace · escapeHtml · localNum · tempText · wmoDesc · iconSvg ·
       currentLanguage · Dashboard · Notif … (تعريفاتها كلها في app.js)
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/* ═══════════════════ 1) حماية CSS الخاص بـ Leaflet ═══════════════════ */

      /* المرحلة 11 (CSP): بديل آمن للمعالج السطري onerror — نفس سلوك الاحتياط السابق تمامًا:
         فشل cdnjs يفعّل رابط unpkg الاحتياطي، لكن عبر addEventListener بدل سمة onerror
         كي تبقى السياسة بلا أي استثناءات سطرية */
      try {
        var lc = document.getElementById("leaflet-css");
        if (lc) lc.addEventListener("error", function () {
          if (lc.dataset.fb) return;
          lc.dataset.fb = "1";
          var fb = document.createElement("link");
          fb.rel = "stylesheet";
          fb.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(fb);
        });
      } catch (e) {}
    

/* ═══════════════════ 2) محمّل Leaflet الاحتياطي ═══════════════════ */

      /* المرحلة 2 — إصلاح document.write: تنتظر مواضع تهيئة الخرائط الثلاثة وعد matarLeafletReady.
         المرحلة 5 — السكربت الرئيسي صار defer: الوعد ينتظر حدث DOMContentLoaded (الذي يُطلق بعد
         تنفيذ سكربتات defer حسب المواصفة) ثم يتحقق من window.L، ويعود لمحمّل unpkg الاحتياطي
         فقط إن فشل cdnjs — بلا تحميل مزدوج وبلا حجب. */
      window.matarLeafletReady = new Promise((resolve) => {
        if (window.L) { resolve(true); return; }
        document.addEventListener("DOMContentLoaded", () => {
          if (window.L) { resolve(true); return; }
          /* سلسلة احتياط ثلاثية: cdnjs (defer أعلاه) → unpkg → jsdelivr —
             نفس ملف npm بنفس بايتات حزمة 1.9.4 لذا نفس SRI يغطي المصادر الثلاثة */
          const LEAFLET_FALLBACKS = [
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js",
          ];
          let fbIdx = 0;
          const tryNextSource = () => {
            if (window.L) { resolve(true); return; }
            if (fbIdx >= LEAFLET_FALLBACKS.length) { resolve(false); return; }
            const s = document.createElement("script");
            s.src = LEAFLET_FALLBACKS[fbIdx]; fbIdx += 1;
            s.integrity = "sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH";
            s.crossOrigin = "anonymous";
            s.onload = () => resolve(true);
            s.onerror = tryNextSource;
            document.head.appendChild(s);
          };
          tryNextSource();
        });
      });

/* ═══════════════════ 3) بنية الأساسات (طبقات خرائط Esri) ═══════════════════ */

      /* ---------------- طبقة الخريطة الأساسية المتينة ----------------
         مزودا Esri للبلاطات لا يحتاجان مفتاح API؛ نتجنب مزودي البلاطات
         الذين يعيدون رسائل حجب أو طلب مفتاح داخل صورة الخريطة. */
      const BASE_PROVIDERS = [
        { id: "esri", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_{s0}_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          options: { maxZoom: 19, maxNativeZoom: 16 } },
        { id: "esri-street", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          options: { maxZoom: 19, maxNativeZoom: 19 } },
        /* ===== v41: MX+ ميزة 1 — مزوّد ثالث: القمر الصناعي الداكن (Esri World Imagery)
           بلاطات مجانية بلا مفتاح مع فلتر داكن سينمائي على الخاص mxp-dark-sat،
           وخلفية حاوية داكنة عبر #big-map.mxp-sat-base (يضيفها مبدّل الأساس) ===== */
        { id: "esri-sat", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          options: { maxZoom: 19, maxNativeZoom: 17 }, cls: "mxp-dark-sat" },
      ];
      const ESRI_REF = "&copy; <a href=\"https://www.esri.com/\" target=\"_blank\" rel=\"noreferrer\">Esri</a>, HERE, Garmin, OpenStreetMap contributors, and the GIS user community";
      /* v55: أساس المستويات البعيدة والمتوسطة النظيف تمامًا — Esri World_Hillshade
         بلا أي تسميات مدمجة (صفر أسماء دول أو مدن) — لأن بلاطات Canvas Gray
         (Dark/Light Gray Base) تحمل تسميات الدول والمحافظات المطبوعة داخلها،
         فيُحصر هذا الأخير بالمستويات القريبة (زووم 10+) ويقوم الهيلشيد مقامه
         بعيدًا ومتوسطًا مع التلوين الداكن السينمائي عبر .mx-hill-base */
      const ESRI_HILL_FAR = "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";
      const basemapRegistry = new Map(); // map -> { layer, idx, errors, loaded }
      function themeBasemapWord() { return document.documentElement.dataset.theme === "dark" ? "dark" : "light"; }
      function buildBasemapLayer(map, startIdx = 0) {
        const reg = basemapRegistry.get(map) || { idx: 0, errors: 0, loaded: false };
        reg.idx = startIdx; reg.errors = 0; reg.loaded = false; reg.custom = null;
        const prov = BASE_PROVIDERS[startIdx % BASE_PROVIDERS.length];
        const s0 = prov.id === "esri" ? themeBasemapWord()[0].toUpperCase() + themeBasemapWord().slice(1) : themeBasemapWord();
        const url = prov.url.replaceAll("{s0}", s0);
        // خريطة Esri الأساسية لها نسختا إضاءة وداكنة جاهزتان.
        /* ===== v41: MX+ ميزة 1 — احترام cls الخاص بالمزوّد (فلتر القمر الداكن) إن وُجد ===== */
        const className = prov.cls || (prov.id === "osm" ? "base-tiles" : "base-tiles-native");
        /* v55: مزوّدات الأساس التي تحمل تسميات جاهزة داخل بلاطاتها (Canvas Gray
           وStreet Map) تُحصر بالمستويات القريبة (زووم 10+)، ويتولى World_Hillshade
           النظيف بلا تسميات المستويات البعيدة والمتوسطة (0–9) — أما World_Imagery
           فلا تسميات له إطلاقًا فيبقى على كل المستويات */
        const bakedLabels = prov.id === "esri" || prov.id === "esri-street";
        const layer = L.tileLayer(url, {
          ...prov.options,
          ...(bakedLabels ? { minZoom: 10 } : {}),
          className,
            attribution: ESRI_REF,
        });
        layer.on("tileload", () => {
          if (reg.near !== layer) return;
          reg.loaded = true;
          reg.errors = 0;
        });
        layer.on("tileerror", () => {
          // بدّل المصدر بعد عدة إخفاقات متتالية، حتى لو حمّلت بعض البلاطات فقط.
          if (reg.near !== layer || ++reg.errors < 6) return;
          reg.errors = 0;
          const next = reg.idx + 1;
          if (next < BASE_PROVIDERS.length) swapBasemap(map, next);
        });
        /* v55: رفيق المستويات البعيدة — هيلشيد بلا تسميات (يظهر 0–9 حصرًا) */
        if (bakedLabels) {
          const hill = L.tileLayer(ESRI_HILL_FAR, {
            minZoom: 0, maxZoom: 9, maxNativeZoom: 12,
            className: "mx-hill-base", attribution: ESRI_REF,
          });
          reg.near = layer;
          reg.hill = hill;
          reg.layer = L.layerGroup([hill, layer]);
        } else {
          reg.near = layer;
          reg.hill = null;
          reg.layer = layer;
        }
        basemapRegistry.set(map, reg);
        return reg.layer;
      }
      function addBaseLayer(map) {
        const layer = buildBasemapLayer(map, 0).addTo(map);
        return layer;
      }
      function swapBasemap(map, idx) {
        const reg = basemapRegistry.get(map);
        if (!reg || !reg.layer) return;
        map.removeLayer(reg.layer);
        buildBasemapLayer(map, idx).addTo(map);
      }
      function refreshBasemapsTheme() {
        basemapRegistry.forEach((reg, map) => {
          try {
            /* المرحلة 9: خريطة Windy الداكنة الزيتية ثابتة لا تتبع ثيم التطبيق */
            if (reg.custom) return;
            const prov = BASE_PROVIDERS[reg.idx % BASE_PROVIDERS.length];
            if (prov.id !== "esri") return;
            map.removeLayer(reg.layer);
            buildBasemapLayer(map, reg.idx).addTo(map);
          } catch (e) { /* تجاهل */ }
        });
      }

      /* ---------------- v57: أساس «🌙 داكن» — شوارع واضحة بفلتر ليلي فاخر (Crisp Dark Map) ----------------
         استُبدلت طبقة الجبال الرمادية (World_Dark_Gray_Base) بطبقة شوارع Esri
         (arcgisonline.com {z}/{y}/{x}) على كل مستويات التقريب 0–19، مع الفلتر
         الليلي invert(92%) hue-rotate(180deg) brightness(92%) contrast(95%) على
         بلاطات هذه الطبقة عبر .mx-dark-base — فتظهر كل الطرق والمدن والسواحل
         والحدود بوضوح تام بألوان داكنة أنيقة بدل تضاريس الجبال الفارغة، والتسميات
         مدمجة داخل بلاطات الشوارع نفسها فلا حاجة لطبقة مرجع منفصلة ولا هيلشيد.
         وعطل "Block Access" عولج جذريًا (v44): صفر crossOrigin وصفر referrerPolicy
         على طبقات البلاطات — الطلب بنمط <img> العادي كما تفعل Windy.
         ملاحظة: بلاطات Esri لا تدعم {r} ولا subdomains — المقياس القياسي 256px
         والزووم الأصلي حتى 19 مع تكبير سلس من Leaflet فوق ذلك. */
      const WINDY_BASE = {
        /* v57: أساس «🌙 داكن» — Esri World Street Map بفلتر ليلي فاخر على كل
           المستويات (0–19): طرق وحدود ومدن وسواحل واضحة تمامًا بألوان داكنة أنيقة */
        base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        opts: { maxZoom: 19, maxNativeZoom: 19 },
        /* v57: Fallback — إعادة بناء نظيفة لنفس مزوّد الشوارع المجاني المسموح في CSP */
        fbBase: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        fbOpts: { maxZoom: 19, maxNativeZoom: 19 },
      };
      function addWindyBase(map) {
        /* v44: طلب نظيف تمامًا — لا crossOrigin ولا referrerPolicy ولا mode مخصص:
           المتصفح يرسل الطلب كصورة <img> عادية، وخوادم Esri لا ترفضه (لا Block Access) */
        /* v57: أساس داكن واحد على كل المستويات — شوارع Esri بفلتر ليلي فاخر عبر
           .mx-dark-base: طرق وحدود ومدن وسواحل واضحة تمامًا، والتسميات مدمجة في
           البلاطات نفسها (لا هيلشيد بعيد ولا طبقة مرجع منفصلة بعد اليوم) */
        const base = L.tileLayer(WINDY_BASE.base, {
          ...WINDY_BASE.opts,
          className: "mx-dark-base",
          attribution: ESRI_REF,
        });
        const reg = { layer: base, idx: -1, errors: 0, loaded: false, custom: "windy-dark", fellBack: false, refFellBack: false };
        base.on("tileload", () => { reg.loaded = true; reg.errors = 0; });
        base.on("tileerror", () => {
          /* v57: Fallback نظيف — بعد 8 إخفاقات متتالية تُبنى الطبقة من جديد مرة
             واحدة (تفك أي بلاطة عالقة) بنفس مزوّد الشوارع المسموح في CSP */
          if (reg.fellBack || ++reg.errors < 8) return;
          reg.fellBack = true;
          try { map.removeLayer(base); } catch (e) { /* أُزيلت سلفًا */ }
          const fbBase = L.tileLayer(WINDY_BASE.fbBase, { ...WINDY_BASE.fbOpts, className: "mx-dark-base", attribution: ESRI_REF });
          reg.base = fbBase;
          reg.hill = null;
          reg.ref = null;
          fbBase.addTo(map);
        });
        /* إصدار 33: حفظ مرجع الأساس في السجل — يحتاجه التبديل السياقي الذكي
           عند التقريب (إخفاء الأساس وإظهار أساس الشوارع التفصيلي والعكس) */
        reg.base = base;
        reg.hill = null; /* v57: لا هيلشيد — الشوارع تغطي كل المستويات */
        reg.ref = null;  /* v57: التسميات مدمجة داخل بلاطات الشوارع نفسها */
        basemapRegistry.set(map, reg);
        base.addTo(map);
        return base;
      }

/* ═══════════════════ 4) وحدة الخريطة المصغرة والرادار اللحظي ═══════════════════
   انتقل هذا القسم حرفيًا من داخل وحدة Dashboard (السكربت الرئيسي) إلى هنا
   حفاظًا على مبدأ الفصل: كل ما يمس Leaflet والرادار يعيش في map.js.
   تُعرَّف عناصر DOM الخاصة به محليًا، ويتكفل app.js بالاستدعاء عبر الجسور
   الرقيقة التالية الأسماء الأصلية: window.__matarMiniMapWidget.ensure(place) … */

window.__matarMiniMapWidget = (() => {
  /* نفس عناصر وحدة Dashboard الأصلية (miniMap/miniNote/miniTime) */
  const el = {
    miniMap: $("#mini-map"), miniNote: $("#mini-map-note"), miniTime: $("#mini-radar-time"),
  };
  let miniMap = null;
  let miniMarker = null;
  let miniRadar = null;

        /* ------- الخريطة المصغرة ------- */
        async function ensureMiniMap(place) {
          /* إصدار 16: الوضع الاقتصادي — لا Leaflet ولا بلاطات: نعرض البديل النصي الأنيق */
          if (Eco.isEco()) { Eco.apply(); return; }
          // المرحلة 2: انتظار Leaflet الاحتياطي غير المتزامن إن لزم (حُذف document.write)
          try { await window.matarLeafletReady; } catch (e) {}
          if (!window.L) return;
          if (!miniMap) {
            miniMap = L.map(el.miniMap, {
              zoomControl: false, attributionControl: true, dragging: true,
              scrollWheelZoom: false, doubleClickZoom: true, boxZoom: false, keyboard: false,
            }).setView([place.latitude, place.longitude], 7);
            /* v65 (المرحلة الأولى): أساس «الرادار اللحظي المصغّر» — بلاطات شوارع
               Esri (arcgisonline.com {z}/{y}/{x}) على كل المستويات بفلتر ليلي
               واضح invert(92%) hue-rotate(180deg) brightness(92%) contrast(95%)
               عبر .mx-dark-base — فتظهر المدن والشوارع والسواحل بوضوح تام بدل
               شكل الـ 3D الرمادي الفارغ (World_Dark_Gray_Base + الهيلشيد) */
            addWindyBase(miniMap);
            window.matarCountryLabels?.attach(miniMap); /* v55: التسمية المخصصة على الخريطة المصغرة */
            miniMarker = L.circleMarker([place.latitude, place.longitude], {
              radius: 8, color: "#fff", weight: 2.5, fillColor: "#d9935b", fillOpacity: 1,
            }).addTo(miniMap);
            loadMiniRadar();
            el.miniMap.parentElement.querySelector(".mini-map-open")?.addEventListener("click", () => showPage("map"));
          } else {
            miniMap.setView([place.latitude, place.longitude], 7);
            miniMarker?.setLatLng([place.latitude, place.longitude]);
          }
          /* v52: قفل القياس المزدوج للخريطة المصغرة بعد التحميل الكسول (200ms و500ms)
             كي لا تبقى بحجم 0px أو مخفية عند عودة البطاقة للعرض */
          setTimeout(() => { if (miniMap) { try { miniMap.invalidateSize(); } catch (e) {} } }, 200);
          setTimeout(() => { if (miniMap) { try { miniMap.invalidateSize(); } catch (e) {} } }, 500);
          setTimeout(() => miniMap.invalidateSize(), 60);
        }

        // إصلاح 6: إدارة مؤقت إعادة محاولة الرادار (إلغاؤه قبل جدولة محاولة جديدة، والتوقف إذا أُزيلت الخريطة)
        let miniRadarRetry = 0;
        // المرحلة 12: تحديث دوري للرادار المصغر كل 10 دقائق أثناء فتح لوحة القيادة فقط
        let miniRadarLastAt = 0;
        let miniRadarTick = 0;
        // المرحلة 13 — إصلاح الترجمة: حفظ حالة آخر إطار رادار لإعادة صياغة النص عند تبديل اللغة
        let lastRadarFrameAt = 0;
        let lastRadarOk = false;
        let miniRadarGibs = false; /* v52: حالة البديل GIBS للرادار المصغر */
        async function loadMiniRadar(force = false) {
          if (Eco.isEco()) { try { window.__matarEcoBite?.(160, "بلاطات الرادار الحي"); } catch (e) {} return; } // إصدار 16: الوضع الاقتصادي — صفر بلاطات رادار
          clearTimeout(miniRadarRetry);
          const now = Date.now();
          if (!force && now - miniRadarLastAt < 60e3) return; // حماية من الطلبات المتكررة السريعة
          miniRadarLastAt = now;
          /* v52: مهلة 8 ثوانٍ لجلب بيانات RainViewer — التأخر أو الفشل يحوّل تلقائيًا
             إلى بديل NASA GIBS (أمطار IMERG) بدل رسالة «تعذّر تحميل رادار الأمطار» */
          const rvAc = ("AbortController" in window) ? new AbortController() : null;
          const rvTimer = rvAc ? setTimeout(() => rvAc.abort(), 8000) : null;
          try {
            const meta = await getJson("https://api.rainviewer.com/public/weather-maps.json", rvAc ? rvAc.signal : undefined);
            if (rvTimer) clearTimeout(rvTimer);
            const frames = [...(meta.radar?.past ?? []), ...(meta.radar?.nowcast ?? [])];
            const last = frames[frames.length - 1];
            if (!last) throw new Error("لا إطارات");
            if (miniRadar) miniRadar.remove();
            miniRadar = L.tileLayer(`https://tilecache.rainviewer.com${last.path}/256/{z}/{x}/{y}/8/1_1.png`, { opacity: 0.85, maxZoom: 12, maxNativeZoom: 7 }).addTo(miniMap);
            const d = new Date(last.time * 1000);
            lastRadarFrameAt = last.time * 1000; lastRadarOk = true; miniRadarGibs = false;
            el.miniTime.textContent = tf("آخر رصد {v}", { v: clockText(d) });
            el.miniNote.textContent = tr("الطبقة الملوّنة تمثل شدّة الأمطار المرصودة من الرادار. اضغط على الخريطة للتكبير، أو افتح الخريطة الكاملة للطبقات الأخرى.");
          } catch (e) {
            if (rvTimer) clearTimeout(rvTimer);
            lastRadarOk = false;
            /* v52: تحول تلقائي إلى بديل NASA GIBS بدل رسالة الفشل — أمطار IMERG
               الشفافة فوق الخريطة المصغرة، ويعاد رادار RainViewer كل 90 ثانية */
            try {
              if (miniMap && window.L) {
                if (miniRadar) { try { miniRadar.remove(); } catch (e2) {} miniRadar = null; }
                miniRadar = L.tileLayer.wms("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", {
                  layers: "IMERG_Precipitation_Rate", format: "image/png", transparent: true, opacity: 0.7,
                  version: "1.3.0", crs: L.CRS.EPSG4326,
                  time: new Date(Date.now() - 30 * 3600e3).toISOString().slice(0, 10),
                  maxZoom: 12, maxNativeZoom: 6, zIndex: 412,
                  attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS · IMERG</a>',
                });
                delete miniRadar.wmsParams.bbox;
                miniRadar.addTo(miniMap);
                miniRadarGibs = true;
                el.miniNote.textContent = tr("تعذّر وصول رادار RainViewer — تُعرض تقديرات أمطار NASA GIBS (IMERG) ويعاد الرادار اللحظي تلقائيًا.");
              } else {
                throw e;
              }
            } catch (e2) {
              miniRadarGibs = false;
              el.miniNote.textContent = tr("تعذّر تحميل رادار الأمطار الآن. سنجري محاولة أخرى بعد قليل.");
            }
            if (miniMap) miniRadarRetry = setTimeout(() => loadMiniRadar(true), 90e3);
          }
        }
        // المرحلة 13: إعادة صياغة نص الرادار المصغر عند تغيير اللغة (كان يبقى باللغة القديمة)
        function refreshMiniRadarTexts() {
          if (lastRadarOk && lastRadarFrameAt) {
            el.miniTime.textContent = tf("آخر رصد {v}", { v: clockText(new Date(lastRadarFrameAt)) });
            el.miniNote.textContent = tr("الطبقة الملوّنة تمثل شدّة الأمطار المرصودة من الرادار. اضغط على الخريطة للتكبير، أو افتح الخريطة الكاملة للطبقات الأخرى.");
          } else if (miniRadarGibs) {
            /* v52: صياغة حالة البديل عند تغيير اللغة بدل رسالة الفشل القديمة */
            el.miniNote.textContent = tr("تعذّر وصول رادار RainViewer — تُعرض تقديرات أمطار NASA GIBS (IMERG) ويعاد الرادار اللحظي تلقائيًا.");
          } else {
            el.miniNote.textContent = tr("تعذّر تحميل رادار الأمطار الآن. سنجري محاولة أخرى بعد قليل.");
          }
        }
        document.addEventListener("matar:language", () => { try { refreshMiniRadarTexts(); } catch (e) {} });
        if (!miniRadarTick) {
          miniRadarTick = setInterval(() => {
            if (state.page === "dashboard" && miniMap && navigator.onLine) loadMiniRadar(true);
          }, 600e3);
        }

  /* ── واجهة الوحدة: جسور بنفس أسماء الدوال الأصلية داخل Dashboard ── */
  return {
    ensure: ensureMiniMap,          /* Dashboard: ensureMiniMap(place) */
    loadRadar: loadMiniRadar,       /* التحميل/التحديث القسري للرادار */
    refreshTexts: refreshMiniRadarTexts, /* إعادة صياغة النصوص عند تغيير اللغة */
    map: () => miniMap,
    invalidate(delay = 80) {
      if (miniMap) setTimeout(() => { try { miniMap.invalidateSize(); } catch (e) {} }, delay);
    },
  };
})();

/* ═══════════════════ 5) وحدة Nowcast — الرادار اللحظي ═══════════════════ */

      /* ============================================================
         إصدار 16 — الرادار اللحظي (Nowcasting) بأسلوب Dark Sky
         ------------------------------------------------------------
         بدل الاكتفاء بعرض صورة الرادار الحالية، يحلّل هذا المحرك حركة
         كتل المطر نفسها:
         ① يحمّل آخر إطارَين رادار من RainViewer لنافذة ±120 كم حول
            المستخدم على كانفاس مخفية ويصنّف بكسلات المطر (شفافية اللوحة
            العالمية الزرقاء).
         ② يقيس إزاحة مركز كتلة المطر بين الإطارين → متجه حركة الرادار
            الحقيقي (كم/س)، ثم يمزجه مع سرعة الرياح الحالية واتجاهها من
            Open-Meteo (60٪ رادار + 40٪ رياح) لمحاكاة دفع الكتل.
         ③ يقيس المسافة من المستخدم إلى أقرب كتلة مطرية واتجاهها، ويحسب
            وقت الوصول بالدقائق إن كانت تقترب، أو يطمئن المستخدم إن كانت
            تبتعد، أو يقدّر مدة استمرار المطر الحالي من امتداد الكتلة
            في اتجاه حركتها.
         ④ عند تعذر تحليل الرادار (انقطاع/حجب CORS/الوضع الاقتصادي):
            يسقط تلقائيًا إلى سلسلة minutely_15 من Open-Meteo التي تأتي
            مجانًا مع الطلب الرئيسي — لا تبقى البطاقة صامتة أبدًا.
         النتيجة بطاقة ذكية + إشعار هاتف اختياري: «بناءً على حركة الرياح
         الحالية، من المتوقع بدء هطول الأمطار في موقعك خلال 34 دقيقة…»
         ============================================================ */
      const Nowcast = (() => {
        const Z = 7;                 // مستوى التكبير المستخدم في تحليل البلاطات
        const RANGE_KM = 120;        // نصف قطر نافذة التحليل حول المستخدم
        const HORIZON_MIN = 120;     // أفق التنبؤ الأقصى بالدقائق
        const THROTTLE = 10 * 60e3;  // التحليل كل 10 دقائق (إيقاع مسح الرادار نفسه)
        const API_URL = "https://api.rainviewer.com/public/weather-maps.json";
        const TRACK_KEY = "matar:nowcast:lastNotify";

        const el = {
          card: $("#nowcast-card"), icon: $("#nowcast-icon"),
          title: $("#nowcast-title"), msg: $("#nowcast-msg"),
          track: $("#nowcast-track"), fill: $("#nc-fill"), dot: $("#nc-dot"),
          end: $("#nc-end"), meta: $("#nowcast-meta"),
        };

        let last = null;          // آخر نتيجة لعرضها عند تغيير اللغة
        let lastRun = 0;
        let running = false;
        let tick = 0;

        /* ── أدوات ميركاتور: تحويل الإحداثيات ↔ بكسلات البلاطات ── */
        function lonToX(lon, z) { return ((lon + 180) / 360) * Math.pow(2, z) * 256; }
        function latToY(lat, z) {
          const s = Math.sin((lat * Math.PI) / 180);
          const clamped = Math.max(Math.min(s, 0.9999999), -0.9999999);
          return (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * Math.pow(2, z) * 256;
        }
        function xToLon(x, z) { return (x / (Math.pow(2, z) * 256)) * 360 - 180; }
        function yToLat(y, z) {
          const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, z) * 256);
          return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        }
        /* المسافة الكبرى بين نقطتين بالكيلومتر (Haversine) */
        function haversine(lat1, lon1, lat2, lon2) {
          const R = 6371.0088, rad = Math.PI / 180;
          const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
          return 2 * R * Math.asin(Math.sqrt(a));
        }
        /* كم لكل بكسل خريطة عند مستوى تكبير معين وخط عرض معين */
        function kmPerPx(lat, z) {
          return (40075.016686 * Math.cos((lat * Math.PI) / 180)) / (Math.pow(2, z) * 256);
        }
        /* سرعة الرياح واتجاهها (الميتيورولوجي: مصدر الهبّة) → متجه حركة (شرقًا، شمالًا) كم/س */
        function windToVector(speedKmh, fromDeg) {
          const rad = (fromDeg * Math.PI) / 180;
          return { east: -speedKmh * Math.sin(rad), north: -speedKmh * Math.cos(rad) };
        }
        /* مزج متجهي موزون — دمج حركة الرادار المرصودة مع دفع الرياح */
        function blendVectors(a, b, wa) {
          const wb = 1 - wa;
          return { east: a.east * wa + b.east * wb, north: a.north * wa + b.north * wb };
        }
        /* صياغة مدة المطر بلغة بشرية: نصف ساعة / ساعة / ساعة وربع… */
        function formatDuration(min) {
          if (min < 35) return tr("نحو نصف ساعة");
          if (min < 50) return tr("نحو 45 دقيقة");
          if (min < 70) return tr("نحو ساعة كاملة");
          if (min < 85) return tr("نحو ساعة وربع");
          if (min < 105) return tr("نحو ساعة ونصف");
          if (min < 130) return tr("نحو ساعتين");
          return tf("نحو {m} دقيقة", { m: localNum(min) });
        }

        /* ── تحميل إطار رادار إلى كانفاس جاهز لقراءة البكسلات ── */
        function loadFrameCanvas(frame, place) {
          return new Promise((resolve, reject) => {
            const kmp = kmPerPx(place.latitude, Z);
            const halfPx = Math.ceil(RANGE_KM / kmp);
            const ux = lonToX(place.longitude, Z), uy = latToY(place.latitude, Z);
            const x0 = ux - halfPx, y0 = uy - halfPx, side = halfPx * 2;
            const tX0 = Math.floor(x0 / 256), tX1 = Math.floor((x0 + side) / 256);
            const tY0 = Math.floor(y0 / 256), tY1 = Math.floor((y0 + side) / 256);
            const tiles = [];
            for (let ty = tY0; ty <= tY1; ty++) for (let tx = tX0; tx <= tX1; tx++) tiles.push([tx, ty]);
            const cv = document.createElement("canvas");
            cv.width = (tX1 - tX0 + 1) * 256; cv.height = (tY1 - tY0 + 1) * 256;
            const ctx = cv.getContext("2d", { willReadFrequently: true });
            const ox = tX0 * 256, oy = tY0 * 256;
            let pending = tiles.length, failed = false;
            if (!pending) { reject(new Error("لا بلاطات")); return; }
            const done = () => { if (!failed) resolve({ cv, ctx, ox, oy, ux, uy, kmp }); };
            const timer = setTimeout(() => { failed = true; reject(new Error("مهلة تحميل الرادار")); }, 9000);
            tiles.forEach(([tx, ty]) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                clearTimeout(timer);
                try { ctx.drawImage(img, tx * 256 - ox, ty * 256 - oy); } catch (e) { failed = true; reject(e); return; }
                pending -= 1; if (pending === 0) done();
              };
              img.onerror = () => { clearTimeout(timer); failed = true; reject(new Error("فشل بلاطة رادار")); };
              img.src = `https://tilecache.rainviewer.com${frame.path}/256/${Z}/${tx}/${ty}/8/1_1.png`;
            });
          });
        }

        /* فحص بكسل: لوحة RainViewer الشفافة — بكسل معتم = مطر مرصود */
        function isRainPx(imgData, w, x, y) {
          if (x < 0 || y < 0 || x >= w || y >= imgData.height) return false;
          return imgData.data[(y * w + x) * 4 + 3] > 70;
        }

        /* مسح نافذة التحليل: أقرب كتلة مطرية + مركز الكتلة القريبة + هل الموقع نفسه ممطر */
        function scanFrame(f, place) {
          const { cv, ctx, ox, oy, ux, uy, kmp } = f;
          const img = ctx.getImageData(0, 0, cv.width, cv.height);
          const uxInt = Math.round(ux - ox), uyInt = Math.round(uy - oy);
          const half = Math.round(RANGE_KM / kmp);
          const step = 2;
          let nearest = null, sumX = 0, sumY = 0, n = 0, rainingHere = false;
          for (let dy = -half; dy <= half; dy += step) {
            for (let dx = -half; dx <= half; dx += step) {
              const px = uxInt + dx, py = uyInt + dy;
              if (!isRainPx(img, cv.width, px, py)) continue;
              const dist = Math.hypot(dx, dy) * kmp;
              if (dist <= RANGE_KM) {
                if (!nearest || dist < nearest.dist) nearest = { dist, x: px, y: py };
                if (dist <= 100) { sumX += px; sumY += py; n += 1; }
                if (dist <= 6) rainingHere = true;
              }
            }
          }
          const centroid = n >= 3 ? { x: sumX / n, y: sumY / n } : (nearest ? { x: nearest.x, y: nearest.y } : null);
          return { nearest, centroid, rainingHere, kmp, img, w: cv.width };
        }

        /* امتداد الكتلة المطرية في اتجاه الحركة (لتقدير مدة المطر) */
        function extentAlongMotion(scan, vx, vy, maxPx) {
          const sx = Math.sign(vx) || 1, sy = Math.sign(vy) || 1;
          const norm = Math.hypot(vx, vy) || 1;
          const ux = vx / norm, uy = vy / norm;
          const probe = (dirX, dirY) => {
            let gap = 0, far = 0;
            for (let d = 0; d <= maxPx; d += 2) {
              const px = Math.round(scan.px + dirX * d), py = Math.round(scan.py + dirY * d);
              if (isRainPx(scan.img, scan.w, px, py)) { far = d; gap = 0; }
              else if (++gap >= 6) break; // 12 بكسل بلا مطر ≈ نهاية الكتلة
            }
            return far;
          };
          return (probe(ux, uy) + probe(-ux, -uy)) * scan.kmp;
        }

        /* الخطة الاحتياطية: سلسلة minutely_15 من الطلب الرئيسي (صفر طلبات إضافية) */
        function estimateFromMinutely(wx) {
          const m = wx?.minutely_15;
          const nowPrecip = Number(wx?.current?.precipitation ?? 0);
          if (!m?.precipitation?.length) return null;
          const p = m.precipitation;
          const wet = (v) => v != null && v >= 0.05;
          if (wet(nowPrecip) || wet(p[0])) {
            let stop = p.length;
            for (let i = 1; i < p.length; i++) { if (!wet(p[i])) { stop = i; break; } }
            return { kind: "now", etaMin: 0, durationMin: Math.min(stop * 15, 240), src: "minutely" };
          }
          for (let i = 1; i < p.length; i++) {
            if (wet(p[i])) {
              let end = i;
              for (let j = i; j < p.length; j++) { if (!wet(p[j])) { end = j; break; } }
              return { kind: "soon", etaMin: Math.max(1, i * 15), durationMin: Math.min((end - i) * 15, 240), src: "minutely" };
            }
          }
          return { kind: "clear", etaMin: null, durationMin: null, src: "minutely" };
        }

        /* ── التحليل الكامل: إطاران رادار + رياح حالية → قرار واحد واضح ── */
        async function analyze(place, wx) {
          const frames = [];
          try {
            const meta = await getJson(API_URL);
            const past = (meta.radar?.past ?? []).slice(-3);
            if (past.length >= 2) frames.push(...past.slice(-2));
          } catch (e) { /* المصدر تعذر — نعتمد الخطة الاحتياطية */ }

          const fallback = () => {
            const f = estimateFromMinutely(wx);
            if (!f) return null;
            return { ...f, distKm: null, speedKmh: null, dirName: null, frameAt: null, via: "minutely" };
          };

          if (frames.length < 2 || Eco.isEco()) return fallback();

          let A, B;
          try {
            [A, B] = await Promise.all([loadFrameCanvas(frames[0], place), loadFrameCanvas(frames[1], place)]);
          } catch (e) { return fallback(); }

          let sa, sb;
          try {
            sa = scanFrame(A, place); sb = scanFrame(B, place);
          } catch (e) { return fallback(); /* canvas ملوث CORS — الخطة الاحتياطية */ }

          const dtMin = Math.max(1, (frames[1].time - frames[0].time) / 60);
          const frameAt = frames[1].time * 1000;
          const nowWind = wx?.current ?? {};
          const windV = windToVector(Number(nowWind.wind_speed_10m ?? 0), Number(nowWind.wind_direction_10m ?? 0));

          /* ① المطر يهطل على الموقع الآن: نقدّر وقت التوقف من امتداد الكتلة */
          if (sb.rainingHere) {
            let v = { east: 0, north: 0 };
            if (sa.centroid && sb.centroid) {
              const dx = (sb.centroid.x - sa.centroid.x) * sb.kmp / dtMin * 60;
              const dy = (sb.centroid.y - sa.centroid.y) * sb.kmp / dtMin * 60;
              const obs = { east: dx, north: -dy };
              if (Math.hypot(obs.east, obs.north) >= 2) v = blendVectors(obs, windV, 0.6);
              else v = windV;
            } else v = windV;
            const speed = Math.hypot(v.east, v.north);
            const extentKm = extentAlongMotion({ ...sb, px: Math.round(sb.ux - sb.ox), py: Math.round(sb.uy - sb.oy) }, v.east, -v.north, 160 / sb.kmp);
            const durationMin = speed >= 2 ? Math.min(Math.max(15, (extentKm / speed) * 60), 240) : 60;
            return { kind: "now", etaMin: 0, durationMin, distKm: 0, speedKmh: Math.round(speed), dirName: null, frameAt, via: "radar" };
          }

          /* ② لا مطر إطلاقًا في النافذة */
          if (!sb.nearest || !sb.centroid) return { kind: "clear", etaMin: null, durationMin: null, distKm: null, speedKmh: null, dirName: null, frameAt, via: "radar" };

          /* ③ أقرب كتلة مطرية: هل تقترب أم تبتعد؟ */
          const rainLat = yToLat(sb.oy + sb.nearest.y, Z);
          const rainLon = xToLon(sb.ox + sb.nearest.x, Z);
          const distKm = sb.nearest.dist;
          let v = { east: 0, north: 0 };
          if (sa.centroid && sb.centroid) {
            const dx = (sb.centroid.x - sa.centroid.x) * sb.kmp / dtMin * 60;
            const dy = (sb.centroid.y - sa.centroid.y) * sb.kmp / dtMin * 60;
            const obs = { east: dx, north: -dy };
            v = Math.hypot(obs.east, obs.north) >= 2 ? blendVectors(obs, windV, 0.6) : windV;
          } else v = windV;
          const speed = Math.hypot(v.east, v.north);
          /* المتجه من الكتلة نحو المستخدم (شرقًا/شمالًا) */
          const toUser = {
            east: (place.longitude - rainLon) * 111.32 * Math.cos(((place.latitude + rainLat) / 2) * Math.PI / 180),
            north: (place.latitude - rainLat) * 110.57,
          };
          const dot = toUser.east * v.east + toUser.north * v.north;
          const approaching = dot > 0 && speed >= 2;
          const bearing = (Math.atan2(toUser.east, toUser.north) * 180) / Math.PI;
          const dirName = windDirName((bearing + 360) % 360);
          if (!approaching) {
            return { kind: "clear", etaMin: null, durationMin: null, distKm: Math.round(distKm), speedKmh: Math.round(speed), dirName, frameAt, via: "radar", receding: true };
          }
          const etaMin = Math.min(Math.max(1, Math.round((distKm / speed) * 60)), HORIZON_MIN);
          if (etaMin >= HORIZON_MIN) {
            return { kind: "clear", etaMin: null, durationMin: null, distKm: Math.round(distKm), speedKmh: Math.round(speed), dirName, frameAt, via: "radar", far: true };
          }
          const extentKm = extentAlongMotion({ ...sb, px: sb.nearest.x, py: sb.nearest.y }, v.east, -v.north, 200 / sb.kmp);
          const durationMin = Math.min(Math.max(15, (extentKm / speed) * 60), 240);
          return { kind: "soon", etaMin, durationMin, distKm: Math.round(distKm), speedKmh: Math.round(speed), dirName, frameAt, via: "radar" };
        }

        /* ── عرض النتيجة على البطاقة ── */
        function render(res) {
          if (!el.card || !res) return;
          const rtl = document.documentElement.dir === "rtl";
          el.card.hidden = false;
          el.card.dataset.nc = res.kind === "soon" ? "soon" : res.kind === "now" ? "now" : "clear";
          el.icon.innerHTML = iconSvg(res.kind === "clear" ? "ok" : res.kind === "now" ? "water" : "rain", 27);

          if (res.kind === "soon") {
            el.title.textContent = tf("مطر متوقع خلال {m} دقيقة", { m: localNum(res.etaMin) });
            el.msg.textContent = tf("بناءً على حركة الرياح الحالية وحركة أمطار الرادار، من المتوقع بدء هطول الأمطار في موقعك خلال {m} دقيقة تقريبًا وتستمر {d}.", { m: localNum(res.etaMin), d: formatDuration(res.durationMin ?? 60) });
          } else if (res.kind === "now") {
            el.title.textContent = tr("المطر يهطل في موقعك الآن");
            el.msg.textContent = tf("بحسب حركة أمطار الرادار يُتوقع استمرار الهطول في موقعك {d} قبل أن يتراجع تدريجيًا.", { d: formatDuration(res.durationMin ?? 60) });
          } else {
            el.title.textContent = tr("لا مطر في طريقه إليك الآن");
            el.msg.textContent = res.receding
              ? tf("أقرب كتلة مطرية على بعد ~{k} كم، لكن حركة الهواء الحالية تدفعها بعيدًا عن موقعك — لا أثر للمطر خلال الساعة القادمة.", { k: localNum(res.distKm ?? 0) })
              : res.far
                ? tf("أقرب كتلة مطرية على بعد ~{k} كم خارج أفق التنبؤ القصير — تابع الشريط الساعي لمعرفة تطورها.", { k: localNum(res.distKm ?? 0) })
                : res.src === "minutely" ? tr("سلاسل دقائق Open-Meteo لا ترصد أمطارًا خلال الساعتين القادمتين في موقعك.")
                : tf("الرادار لا يرصد كتلًا مطرية في نطاق {r} كم حول موقعك خلال الساعة القادمة.", { r: localNum(RANGE_KM) });
          }

          /* الشريط الزمني: الآن ← وصول المطر ← مدته */
          const showTrack = res.kind !== "clear";
          el.track.hidden = !showTrack;
          if (showTrack) {
            const etaPct = Math.min(((res.etaMin ?? 0) / HORIZON_MIN) * 100, 100);
            const durPct = Math.min(((res.durationMin ?? 30) / HORIZON_MIN) * 100, 100 - etaPct);
            if (rtl) { el.fill.style.right = `${100 - etaPct}%`; el.fill.style.left = "auto"; el.dot.style.left = `${100 - etaPct}%`; }
            else { el.fill.style.left = `${etaPct}%`; el.fill.style.right = "auto"; el.dot.style.left = `${etaPct}%`; }
            el.fill.style.width = `${Math.max(durPct, 6)}%`;
            el.end.textContent = res.kind === "soon"
              ? tf("بعد {m} د · يستمر {d}", { m: localNum(res.etaMin), d: formatDuration(res.durationMin ?? 60) })
              : tf("يتوقّع تراجعه بعد {d}", { d: formatDuration(res.durationMin ?? 60) });
          }

          /* سطر الميتاداتا: مصدر القرار وسرعته */
          const parts = [];
          if (res.via === "radar" && res.frameAt) parts.push(tf("مسح الرادار {t}", { t: clockText(new Date(res.frameAt)) }));
          else parts.push(tr("المصدر: سلاسل الدقائق من Open-Meteo"));
          if (res.speedKmh != null && res.via === "radar") parts.push(tf("سرعة الدفع ~{v} كم/س", { v: localNum(res.speedKmh) }));
          if (res.dirName) parts.push(tf("الكتلة قادمة من جهة {d}", { d: res.dirName }));
          if (Eco.isEco()) parts.push(tr("الوضع الاقتصادي: تحليل من بيانات الدقائق بلا تحميل رادار"));
          el.meta.textContent = parts.join(" · ");
        }

        /* إشعار الهاتف: مرة واحدة لكل نافذة 30 دقيقة عند مطر قادم خلال 90 دقيقة */
        async function maybeNotify(res) {
          try {
            if (res.kind !== "soon" || res.etaMin > 90) return;
            if (!("Notification" in window) || Notification.permission !== "granted") return;
            if (Notif.prefs && Notif.prefs.rain === false) return;
            const bucket = Math.floor((res.frameAt || Date.now()) / (30 * 60e3));
            const lastBucket = Number(localStorage.getItem(TRACK_KEY) || 0);
            if (bucket <= lastBucket) return;
            localStorage.setItem(TRACK_KEY, String(bucket));
            const body = tf("بناءً على حركة الرياح الحالية، من المتوقع بدء هطول الأمطار في موقعك خلال {m} دقيقة وتستمر {d}.", { m: localNum(res.etaMin), d: formatDuration(res.durationMin ?? 60) });
            Notif.showNotification(`${state.place?.name ?? ""} · ${tr("مطر متوقع قريبًا")}`, body, "matar-nowcast");
          } catch (e) { /* الإشعار اختياري */ }
        }

        async function onData(force = false) {
          if (!state.wx || !state.place || running) return;
          const now = Date.now();
          if (!force && now - lastRun < THROTTLE) { if (last) render(last); return; }
          running = true; lastRun = now;
          try {
            const res = await analyze(state.place, state.wx);
            if (res) {
              last = res;
              render(res);
              maybeNotify(res);
              /* إصدار 32: تجاوز الرادار — رفع مؤشر الساعات الثلاث القادمة تلقائيًا */
              try { Dashboard.applyNowcastOverride(res); } catch (e) {}
            }
          } catch (e) { /* نُبقي آخر نتيجة معروضة */ }
          finally { running = false; }
        }

        /* حلقة دورية بمزامنة إيقاع الرادار — تتوقف كليًا فوق صفحات أخرى أو والشاشة مخفية */
        if (!tick) {
          tick = setInterval(() => {
            if (document.hidden || state.page !== "dashboard" || !navigator.onLine) return;
            onData(false);
          }, THROTTLE);
        }
        document.addEventListener("matar:data", () => { onData(true); });
        document.addEventListener("matar:language", () => { if (last) render(last); });

        /* خطافات اختبار ذاتي للدوال الرياضية البحتة */
        window.__matarNowcastTestHooks = { lonToX, latToY, xToLon, yToLat, haversine, kmPerPx, windToVector, blendVectors, formatDuration, HORIZON_MIN };

        return { onData, analyze: () => last };
      })();

/* ═══════════════════ 6) وحدة MX — الخريطة التفاعلية الكبرى ═══════════════════ */

      /* ============================================================
         الصفحة 2: الخريطة التفاعلية — محرك الطبقات MX
         شبكة بيانات إقليمية من Open-Meteo + رادار RainViewer + جزيئات رياح
         ============================================================ */
      const MX = (() => {
        const NX = 8, NY = 6;               // شبكة البيانات الإقليمية
        const PAST_H = 24, FUT_H = 74;      // سجل 24 ساعة + 74 ساعة قادمة (v63: نافذة 3 أيام كاملة لطبقة التراكم وشريط التوقعات)
        const CELL = 6, WCELL = 22;         // دقة العرض بالبكسل
        const TOTAL_H = PAST_H + FUT_H + 1;
        /* ══ v64: وضع الخط الزمني للرادار — آخر ساعتين + الآن + توقع ساعتين ══
           عند تفعيل طبقة رادار الأمطار يتحول الشريط الزمني إلى نافذة دقيقة
           بخطوة 5 دقائق (49 موضعًا عبر ± ساعتين) بشارة «رصد حي» مقابل
           «توقع مستقبلي» — وكل طبقة أخرى تعود للخط الساعي الكامل */
        const RT_STEP_MS = 5 * 60e3;
        const RT_SPAN_MIN = 120;
        const RT_SPAN_MS = RT_SPAN_MIN * 60e3;
        const RT_LEN = Math.round((RT_SPAN_MS * 2) / RT_STEP_MS) + 1;
        /* ══ v64: الوضع الخفيف للأجهزة المتوسطة والهواتف (60fps Zero-Lag) ══
           تيارات الرياح الانسيابية عبر Canvas2D حصرًا (حُذف محرك WebGL الثقيل
           كليًا في إعادة البناء النظيفة) بسقف صارم 400 جزيء على الهواتف —
           تمرير وتكبير سلس بلا تهنيج على كل الأجهزة */
        const LITE_DEVICE = (() => {
          try {
            const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
            const cores = navigator.hardwareConcurrency || 4;
            const mem = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : 4;
            return mobile || cores <= 4 || mem <= 3;
          } catch (e) { return false; }
        })();
        const PARTICLE_CAP = 400;

        /* مدرجات الألوان: [قيمة, r, g, b, شفافية] — v64: نظيفة ومقتصبة للأربع الطبقات النقية */
        /* سحاب أبيض/رمادي ناعم (احتياط القمر الصناعي عند غياب لقطات RainViewer) */
        const CLOUD_SOFT = [[0,255,255,255,0],[10,253,254,255,.07],[30,250,252,255,.24],[55,245,248,252,.45],[80,238,243,250,.66],[100,230,237,246,.88]];
        /* مدرج الحرارة لأعمدة شريط توقعات Windy السفلي */
        const TEMP = [[-10,105,80,170,0],[-5,125,95,190,.55],[2,80,130,210,.6],[10,90,180,170,.6],[18,120,205,110,.6],[25,235,205,70,.62],[32,235,140,55,.68],[40,200,60,50,.78],[48,140,20,40,.85]];
        const WIND_COLORS = ["#7fd0d8","#6db8e8","#5f9ae0","#57b45f","#c9c94e","#e0a526","#e07b3a","#d6453d"];
        const WIND_SPEEDS = [5, 14, 24, 35, 48, 63, 80, 100];
        /* ══ v64: قاعدة شفافية المطر الصفري (Zero-Rain Transparency Rule) ══
           أي نقطة يقل مطرها أو رادارها عن 0.15 مم تُرسم شفافة تمامًا (alpha = 0)
           قبل وأثناء الرسم — فلا يظهر أي لون أزرق فوق المناطق الجافة مثل مصر أبدًا.
           المطر الحقيقي فقط (≥ 0.15 مم) يُرسم بتدرج واضح ومفهوم: أزرق سماوي
           للخفيف ← أخضر للمتوسط ← أصفر للغزير ← أحمر للعاصف، والمفتاح السفلي
           بالأرقام (0.2 | 2 | 5 | 15+ مم) */
        const RAIN_CLEAN = [
          [0.15, 96, 178, 240, 0.34], [0.2, 72, 164, 238, 0.44],
          [1, 60, 190, 205, 0.52], [2, 82, 204, 108, 0.60],
          [3.5, 196, 222, 74, 0.68], [5, 250, 208, 60, 0.74],
          [8, 248, 140, 44, 0.82], [15, 234, 52, 46, 0.90],
        ];
        /* تراكم الأمطار (24 ساعة / 3 أيام) — نفس التدرج الواضح بسقف أحمر أعلى */
        const ACCUM_CLEAN = [
          [0.15, 96, 178, 240, 0.34], [0.2, 72, 164, 238, 0.44],
          [2, 82, 204, 108, 0.60], [5, 250, 208, 60, 0.74],
          [15, 234, 52, 46, 0.90], [30, 178, 34, 40, 0.94],
        ];

        /* ══ v64: الطبقات النقية الأربع حصرًا — لا طبقات مكررة ولا مدرجات زائدة ══ */
        const LAYERS_META = {
          rain: { name: "رادار الأمطار (حي + ساعتان قادمتان)" },
          accumulation: { name: "تراكم الأمطار الحقيقي", ramp: ACCUM_CLEAN, min: 0, max: 15, unit: "مم" },
          satellite: { name: "القمر الصناعي للسحب (لقطة اليوم الحية)" },
          wind: { name: "تيارات الرياح الانسيابية" },
        };

        /* حالة طبقة بلاطات حية واحدة (رادار أو أقمار) — نظام موحد لكل النوعين */
        const mkTile = () => ({ meta: null, preload: new Map(), target: null, shownPath: null, layer: null, shown: false, metaTriedAt: 0, fallbackClouds: false, fbAnnounced: false });

        const S = {
          map: null, ready: false, shown: false,
          /* ══ v65 (المرحلة الأولى): تنظيف كامل — لا طبقة طقس نشطة افتراضيًا:
             أساس نظيف (🌙 داكن | 🛣 شوارع) + تسمية «فلسطين المحتلة» فقط، وكل
             محركات الطبقات السابقة صامتة (لا جلب بيانات ولا بلاطات رادار)
             حتى تُعاد الطبقات طبقة طبقة في المراحل القادمة ══ */
          on: { rain: false, accumulation: false, satellite: false, wind: false },
          /* v64: شفافية موزونة موحدة 0.68 + لوحة Universal Blue القياسية الثابتة
             (أزرق سماوي ← أخضر ← أصفر ← أحمر) + تراكم أمامي افتراضي 24 ساعة */
          opacity: 0.68, model: "best_match", accumulationHours: 24,
          zen: false, resumeAfterPalette: false,
          /* v64: وضع الخط الزمني للرادار (± ساعتين بالدقائق) */
          rtMode: false, rtT0: 0,
          /* v63: كبت نقرة ما بعد الضغط المطوّل (شريط التوقعات) */
          lpSuppressClick: false,
          /* v42: دبوس الفحص النابض عند النقر على الخريطة + مؤقت كلاس التلاشي المتقاطع */
          clickPin: null, xfadeClsTimer: 0, deepBuf: { rain: 0, satellite: 0 },
          /* المرحلة 12: ضبط الرادار — سرعة الحركة (ms لكل إطار) + تنعيم الألوان + عرض الثلج */
          frameMs: 420, radarSmooth: true, radarSnow: true,
          /* المرحلة 7: مستوى الارتفاع — surface أو رقم مستوى ضغط (950/850/700/500/300) */
          level: "surface",
          /* المرحلة 7: الطبقات المثبتة في أعلى اللوحة (Windy Pin) */
          pins: [],
          pos: PAST_H, playing: false, start: 0,
          /* إصدار 17: سفر عبر الزمن — تشغيل حلقي محصور في نافذة الـ 24 ساعة القادمة */
          futureSim: false,
          grid: null, models: {}, air: null, marine: null,
          sam: {}, buf: {}, cur: null,
          pending: {}, fail: {}, fetchedAt: 0,
          /* طبقتا البلاطات الحيتان: الرادار (RainViewer) والأقمار تحت الحمراء — نفس نظام التحميل المسبق */
          tile: { rain: mkTile(), satellite: mkTile() },
          dockOpen: true,
          particles: null, flowRAF: 0, size: { x: 0, y: 0 },
          /* v64: التبديل السياقي للأساس عند التقريب — hiRes وضع دقة الحي (زووم ≥ 10)،
             baseReg مراجع الأساس الداكن، detailBase الأساس التفصيلي، uiBound يمنع
             تكرار ربط واجهة اللوحة بعد دورات التدمير/إعادة البناء (الوضع الاقتصادي) */
          hiRes: false, zoomApplied: false,
          baseReg: null, detailBase: null, detailTimer: 0, zctxTimer: 0, uiBound: false,
          token: 0,
        };

        const isDark = () => document.documentElement.dataset.theme === "dark";
        /* المرحلة 9: خريطة الأساس الكبرى داكنة زيتية دائمًا (Carto Dark) — رسم الكانفاس يتبعها
           بغضّ النظر عن ثيم التطبيق كي تبقى الأسهم والخطوط واضحة فوق الداكن */
        const MAP_DARK = true;
        /* المرحلة 9: احترام تفضيل تقليل الحركة — أسهم ثابتة بدل الجزيئات المتحركة */
        const REDUCE_MOTION = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

        /* ---------------- تهيئة الخريطة ----------------
           إصدار 33: مستمعو المستند/النافذة نُقلوا إلى bindOnce() على مستوى الوحدة
           كي تصلح دورة التدمير الكامل في الوضع الاقتصادي ثم إعادة البناء دون
           أي تكرار ربط — أما مستمعو Leaflet فيموتون مع map.remove() تلقائيًا */
        function init() {
          if (S.ready || !window.L) return;
          const map = (S.map = L.map("big-map", {
            center: state.place ? [state.place.latitude, state.place.longitude] : [30.05, 31.24],
            zoom: state.place ? 7 : 5,
            worldCopyJump: true,
            minZoom: 2,
            zoomControl: false,
          }));
          L.control.zoom({ position: "bottomright" }).addTo(map);
          addWindyBase(map); /* المرحلة 9: الأساس الداكن الزيتي بنمط Windy */
          S.baseReg = basemapRegistry.get(map); /* إصدار 33: مراجع الأساس الداكن للتبديل السياقي */
          window.matarCountryLabels?.attach(map); /* v55: طبقة التسمية المخصصة فوق كل الأساسات */

          S.cvStatic = document.createElement("canvas");
          S.cvStatic.className = "mx-canvas mx-field"; /* v63: حقول نظيفة بلا مزج شاشة */
          S.cvStatic.style.zIndex = "420";
          map.getContainer().appendChild(S.cvStatic);
          /* إصدار 25: desynchronized — قناة رسم منخفضة الكمون على الموبايل (تجاوز انتظار
             تركيب المتصفح) فتتحرك الجزيئات والرادار بسلاسة فائقة عبر مسار GPU المختصر،
             والمتصفحات التي لا تدعمه تتجاهل الخيار بأمان */
          S.ctx = S.cvStatic.getContext("2d", { alpha: true, desynchronized: true });

          /* إصدار 33: كانفاس 2D أصبح المسار الاحتياطي فقط — يُخفى تلقائيًا عند نجاح
             (v64: حُذف محرك WebGL — التيارات عبر Canvas2D حصرًا) */
          S.cvFlow = document.createElement("canvas");
          S.cvFlow.className = "mx-canvas";
          S.cvFlow.style.zIndex = "425";
          map.getContainer().appendChild(S.cvFlow);
          S.ctxFlow = S.cvFlow.getContext("2d", { alpha: true, desynchronized: true });

          S.ready = true;
          layoutCanvases();
          /* v64: دخول وضع الرادار (± ساعتين) عند كون طبقة الرادار هي النشطة */
          setRtMode(S.on.rain, true);
          if (!S.rtMode) buildTicks();
          /* إصدار 36: بعد بناء الأيام والعلامات نرسم الحالة النشطة (اليوم الأصفر
             وعلامة الساعة البيضاء) كي تُضاء من أول فتح للخريطة */
          paintClock();
          map.on("move zoom resize viewreset", () => { queueRedraw(); layoutCanvases(); });
          map.on("moveend zoomend", () => { layoutCanvases(); queueRedraw(); ensureSoon(); });
          /* إصدار 17: التصويبة المركزية — نخفي الصندوق أثناء الحركة ونقرأ النقطة بعد التوقف */
          map.on("movestart zoomstart", hideCrossBox);
          /* v42: خنق كثافة الجزيئات 50% أثناء السحب/التكبير كي يثبت 60fps على الهواتف */
          map.on("movestart zoomstart", () => setFlowThrottle(0.5));
          map.on("moveend zoomend", () => setFlowThrottle(1));
          /* إصدار 33: تفريغ ذيول الجزيئات عند بدء الحركة كي لا تتبقى أطياف فوق مواضع قديمة */
          map.on("movestart zoomstart", clearFlowCanvas);
          map.on("moveend zoomend", scheduleCrosshair);
          /* المرحلة 9 + إصدار 33: عند تغيير الزووم تُعاد الجزيئات بمقاس المستوى الجديد،
             ويُنفَّذ التبديل السياقي الذكي (أساس/نموذج/كثافة) مع تهدئة قصيرة تمنع
             طلبات متتالية أثناء تكبير سريع متصل */
          map.on("zoomend", () => {
            resetParticles();
            clearFlowCanvas();
            applyZoomContext(false);
          });
          map.on("click", onMapClick);
          /* ══ v65: الضغط المطوّل 500ms (لمسًا أو ماوسًا) على أي نقطة بالخريطة —
             يضع دبوسًا دائريًا نابضًا ويفتح شريط توقعات Windy السفلي (10 أيام ×
             كل 3 ساعات) — مع كتم قائمة سياق المتصفح فوق البلاطات على اللمس */
          bindLongPress(map);
          /* v63: كلاس وضع السحب الناعمة (blur 18px على كانفاس الحقول) */
          try { map.getContainer().classList.toggle("mx-clouds-on", !!S.on.clouds); } catch (e) {}
          /* الحالة الابتدائية للوحة الجانبية: مفتوحة على الشاشات الكبيرة، مطوية على الهواتف
             (wireUI مرة واحدة فقط على عمر الصفحة — العناصر ثابتة خارج حاوية الخريطة) */
          if (!S.uiBound) { S.uiBound = true; wireUI(); }
          let savedDock = null;
          try { savedDock = localStorage.getItem("matar:map:dock"); } catch (e) {}
          applyDock(savedDock == null ? window.matchMedia("(min-width: 861px)").matches : savedDock === "1", false);
          /* إصدار 33: تطبيق السياق الابتدائي فور التهيئة (أساس/شارة/جزيئات) */
          applyZoomContext(true);
        }

        /* ---------------- إصدار 33: ربط مرة واحدة على مستوى الوحدة ----------------
           مستمعو المستند والنافذة يبقون أحياء عبر دورة التدمير/إعادة البناء،
           ويستشيرون S.ready قبل أي عمل كي لا يلمسوا محركًا مدمرًا */
        let boundOnce = false;
        function bindOnce() {
          if (boundOnce) return;
          boundOnce = true;
          document.addEventListener("visibilitychange", () => { if (document.hidden) stopFlow(); else if (S.on.wind && S.ready) startFlow(); });
          document.addEventListener("matar:theme", () => { updateLegend(); queueRedraw(); });
          /* التعامل الذكي مع انقطاع الشبكة: رسالة واضحة + عرض آخر بيانات محفوظة محليًا */
          window.addEventListener("offline", () => {
            if (!S.ready) return;
            setStatus(tr("انقطع الاتصال بالإنترنت — تُعرض آخر بيانات متاحة محليًا حتى عودة الاتصال."), true);
            setPreStatus("offline");
          });
          window.addEventListener("online", () => {
            if (!S.ready) return;
            setStatus(tr("عاد الاتصال بالإنترنت — نجدد بيانات الرادار والطبقات الآن."));
            setPreStatus("ready");
            refreshTiles();
            ensureSoon();
            scheduleCrosshair(); /* إصدار 17: تحديث صندوق التصويبة عند رجوع الاتصال */
          });
          /* إصدار 33: الربط الكامل بالوضع الاقتصادي —
             التفعيل: تدمير محرك WebGL والكانفاسات وLeaflet تدميرًا كاملًا (Destroy/Unmount)
             والعودة للواجهة النصية المبرمجة (#mx-eco تظهرها Eco.apply مباشرة)؛
             الإيقاف: إعادة بناء كل شيء من الصفر فور فتح صفحة الخريطة.
             إصدار 17: التصويبة تُخفى فورًا في الوضع الاقتصادي (صفر طلبات إضافية) */
          document.addEventListener("matar:eco", (e) => {
            if (e.detail?.eco) {
              destroyEngine();
              hideCrossBox();
              clearTimeout(crossTimer);
            } else if (state.page === "map" && !S.shown) {
              show();
            }
          });
        }

        /* ---------------- إصدار 33: التدمير الكامل (Destroy/Unmount) ----------------
           يُستدعى عند تفعيل الوضع الاقتصادي: إيقاف حلقة الجزيئات، فقدان سياق WebGL
           عمدًا (تحرير ذاكرة الرسوميات على الـ GPU)، إزالة الكانفاسات، تفكيك Leaflet
           وبلاطاته، وإلغاء كل المؤقتات — ثم يُبنى كل شيء من جديد عند إيقاف الوضع */
        function destroyEngine() {
          try { stop(); } catch (e) { /* الخريطة قد تكون غير مهيأة */ }
          clearTimeout(ensureTimer);
          clearTimeout(S.retryTimer);
          clearTimeout(S.zctxTimer);
          clearTimeout(S.detailTimer);
          clearTimeout(crossTimer);
          clearTimeout(S.xfadeClsTimer);   /* v42: كلاس التلاشي المتقاطع المعلق */
          /* v42: إلغاء مؤشرات التحميل المسبق العميق لكل الأنواع */
          if (S.deepBuf) { clearTimeout(S.deepBuf.rain); clearTimeout(S.deepBuf.satellite); S.deepBuf = { rain: 0, satellite: 0 }; }
          S.clickPin = null;                /* v42: دبوس الفحص اختفى مع تدمير الخريطة */
          try { meteoDismiss(); } catch (e) { /* v63: شريط التوقعات يُخفى مع تدمير الخريطة */ }
          try { S.map?.getContainer()?.classList.remove("mx-clouds-on"); } catch (e) {}
          try { S.cvStatic?.remove(); } catch (e) {}
          try { S.cvFlow?.remove(); } catch (e) {}
          try { S.map?.remove(); } catch (e) {}
          S.map = null; S.ready = false; S.shown = false;
          S.grid = null; S.models = {}; S.air = null; S.marine = null;
          S.pending = {}; S.fail = {}; S.fetchedAt = 0;
          S.tile = { rain: mkTile(), satellite: mkTile() };
          S.cur = null; S.particles = null; S.sam = {}; S.buf = {};
          S.baseReg = null; S.detailBase = null; S.hiRes = false; S.zoomApplied = false;
          S.cvStatic = null; S.ctx = null; S.cvFlow = null; S.ctxFlow = null;
          /* v55: تصفير مراجع طبقات MX+ بعد تدمير الخريطة كي تُبنى من جديد عند
             الرجوع من الوضع الاقتصادي (تسميات الهجين والنيون وطبقات WMS) */
          try {
            MXP.layers = { tc: null, dust: null, neon: null, hybrid: null };
            MXP.groups = { storm: null, hz: null };
          } catch (e) { /* MXP قد لا يكون مهيأً بعد */ }
          ui.zoomChip?.setAttribute("hidden", "");
          setStatus("");
        }

        function layoutCanvases() {
          if (!S.ready || !S.map) return;
          const size = S.map.getSize();
          S.size = size;
          /* المرحلة 9: دقة شبكية عالية (devicePixelRatio حتى 2×) — جزيئات وخطوط حادة تمامًا
             على شاشات Retina، مع تحويل إحداثيات ثابت بوحدة بكسل CSS للرسم */
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          [S.cvStatic, S.cvFlow].forEach((cv) => {
            const w = Math.round(size.x * dpr), h = Math.round(size.y * dpr);
            if (cv.width !== w || cv.height !== h) {
              cv.width = w;
              cv.height = h;
              cv.style.width = `${size.x}px`;
              cv.style.height = `${size.y}px`;
            }
          });
          S.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          S.ctxFlow.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        /* ---------------- إصدار 33: التبديل السياقي الذكي عند التقريب (Contextual Zoom) ----------------
           نمط Windy الكامل:
           ① التقريب للمدن (زووم ≥ 10): الأساس يتبدل من الداكن الزيتي إلى Esri World
              Street Map التفصيلية (شوارع وأحياء ومسارات حقيقية بأسمائها المدمجة)
              بفلتر داكن يبقي ألوان الطقس أبرز — بلا مفتاح وبلا Block Access — والبيانات
              تتبدل صمتًا إلى نموذج ICON الإقليمي عالي الدقة (icon_seamless) لدقة الحي
              (الرادار أصله لحظي بالدقيقة عبر إطارات nowcast) — والجزيئات أقصر طولاً،
              أسمك، وأكثر كثافة لتوضيح مسارات الرياح المحلية بين المباني
           ② الابتعاد (زووم < 10): عودة تلقائية للأساس الداكن الفاخر والنموذج العالمي
              والجزيئات الطويلة الانسيابية لرؤية حركة المناخ الكبرى عبر الدول
           (ملاحظة: CartoDB Dark Matter تطلب مفتاح API منذ 2026 وتختم بلاطاتها بعلامة
           مائية، لذا الأساس الداكن الفاخر هنا هو Esri Dark Gray المعتمد في التطبيق) */
        function nearZoomOn() {
          return !!(S.map && S.map.getZoom() >= 10);
        }

        /* مفتاح بيانات الطبقات الفعّال — عند دقة الحي ونموذج «الأفضل» يستخدم icon_hires
           بينما احترام اختيار المستخدم اليدوي (ECMWF/GFS) يبقى أولوية */
        function dataModelKey() {
          return S.hiRes && S.model === "best_match" ? "icon_hires" : S.model;
        }

        function ensureDetailBase() {
          if (S.detailBase || !S.map) return;
          if (!S.map.getPane("mx-detail-base")) {
            const pane = S.map.createPane("mx-detail-base");
            pane.style.zIndex = "250"; /* فوق الأساس الداكن وتحت كل طبقات الطقس */
            pane.style.transition = "opacity 420ms ease";
          }
          S.detailBase = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 19,
            pane: "mx-detail-base",
            className: "mx-detail-base",
            attribution: ESRI_REF,
          });
        }

        function applyZoomContext(immediate = false) {
          if (!S.ready || !S.map) return;
          const run = () => {
            S.zctxTimer = 0;
            if (!S.ready || !S.map) return;
            const near = nearZoomOn();
            if (S.zoomApplied && near === S.hiRes) return;
            S.zoomApplied = true;
            const wasHi = S.hiRes;
            S.hiRes = near;
            S.map.getContainer().classList.toggle("mx-zoom-detail", near);
            if (near) {
              /* v57: أساس «🌙 داكن» الجديد شوارع Esri بفلتر ليلي على كل المستويات —
                 لا يُخفى ولا يُستبدل بالأساس التفصيلي؛ يبقى التبديل السياقي للبيانات
                 (icon_hires) والجزيئات وشارة دقة الحي كما هو تمامًا */
              /* v58: أساس «🛰 قمر صناعي» النقي (sat-clean) كذلك — لا شوارع تفصيلية
                 فوقه عند zoom≥10 وتبقى صور القمر الصافية ساطعة على كل المستويات */
              if (S.baseReg?.custom !== "windy-dark" && S.baseReg?.custom !== "sat-clean") {
                ensureDetailBase();
                clearTimeout(S.detailTimer);
                S.detailBase.addTo(S.map);
                S.map.getPane("mx-detail-base").style.opacity = "1";
                /* إخفاء الأساس وأسمائه — أساس الشوارع يحمل أسماءه بنفسه */
                if (S.baseReg?.base) S.baseReg.base.setOpacity(0);
                if (S.baseReg?.ref) S.baseReg.ref.setOpacity(0);
              }
              /* v65 (المرحلة الأولى): شارة «دقة الحي» ورسالتها تخصان بيانات طبقات
                 الطقس (ICON عالي الدقة + الرادار بالدقيقة) — لا تظهران إلا مع
                 طبقة نشطة، ويبقى الأساس نفسه على كل المستويات بدونهما */
              const anyLayerOn = S.on.rain || S.on.accumulation || S.on.satellite || S.on.wind;
              if (ui.zoomChip && anyLayerOn) {
                ui.zoomChip.textContent = S.model === "best_match"
                  ? tr("دقة الحي — ICON عالي الدقة · رادار بالدقيقة")
                  : tr("دقة الحي — النموذج المختار يدويًا · رادار بالدقيقة");
                ui.zoomChip.removeAttribute("hidden");
              }
              if (!wasHi && anyLayerOn) setStatus(tr("دقة الحي: شوارع تفصيلية + نموذج ICON الإقليمي عالي الدقة + جزيئات رياح كثيفة."));
            } else {
              if (S.baseReg?.base) S.baseReg.base.setOpacity(1);
              if (S.baseReg?.ref) S.baseReg.ref.setOpacity(1);
              if (S.detailBase) {
                S.map.getPane("mx-detail-base").style.opacity = "0";
                /* إزالة الطبقة بعد انتهاء التلاشي — صفر بلاطات شوارع أثناء الأبعاد */
                clearTimeout(S.detailTimer);
                const db = S.detailBase, m = S.map;
                S.detailTimer = setTimeout(() => { try { m.removeLayer(db); } catch (e) { /* أُزيلت */ } }, 520);
              }
              if (ui.zoomChip) ui.zoomChip.setAttribute("hidden", "");
              if (wasHi) setStatus("");
            }
            if (near !== wasHi) {
              /* تبديل صامت لبيانات النموذج (icon_hires ↔ العالمي) + إعادة بناء
                 الجزيئات بالمقاس الجديد (عدد/سماكة/طول ذيل) */
              S.models = {};
              S.fail = {};
              resetParticles();
              clearFlowCanvas();
              ensureSoon();
            }
          };
          if (immediate) run();
          else { clearTimeout(S.zctxTimer); S.zctxTimer = setTimeout(run, 180); }
        }

        /* ---------------- الشبكة والجلب ---------------- */
        function gridFromView() {
          const b = S.map.getBounds();
          let s = b.getSouth(), n = b.getNorth(), w = b.getWest(), e = b.getEast();
          const pl = (n - s) * 0.3, po = (e - w) * 0.3;
          s = Math.max(-80, s - pl); n = Math.min(80, n + pl);
          if (e - w >= 330) { w = -180; e = 180; }
          else { w = Math.max(-180, w - po); e = Math.min(180, e + po); }
          if (e - w < 1) { w = -180; e = 180; }
          if (n - s < 0.5) { s = -80; n = 80; }
          const dLat = (n - s) / (NY - 1), dLon = (e - w) / (NX - 1);
          const lats = [], lons = [];
          for (let r = 0; r < NY; r += 1) for (let c = 0; c < NX; c += 1) {
            lats.push(+(s + r * dLat).toFixed(3));
            lons.push(+(w + c * dLon).toFixed(3));
          }
          return { south: s, north: n, west: w, east: e, dLat, dLon, nx: NX, ny: NY, lats, lons };
        }

        function gridCovers(g) {
          const b = S.map.getBounds();
          const s = b.getSouth(), n = b.getNorth(), w = b.getWest(), e = b.getEast();
          const global = g.west <= -179.9 && g.east >= 179.9;
          const inLat = (s >= g.south - 1e-6 || g.south <= -79.9) && (n <= g.north + 1e-6 || g.north >= 79.9);
          const inLon = global || (w >= g.west && e <= g.east);
          return inLat && inLon
            && g.east - g.west <= Math.max(6, (e - w) * 4.5)
            && g.north - g.south <= Math.max(4, (n - s) * 4.5);
        }

        const SURFACE_VARS = "wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,cloud_cover,precipitation,weather_code,temperature_2m,relative_humidity_2m";
        /* المرحلة 7: سلّم متغيرات متدرّج — من الأغنى (كل الطبقات الجديدة) إلى الأساسي،
           يضمن استمرار العمل مع كل النماذج حتى لو أسقط بعضها متغيرات معينة */
        const MODEL_SETS = [
          `${SURFACE_VARS},cape,apparent_temperature,dew_point_2m,snowfall,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,soil_moisture_0_to_1cm`,
          `${SURFACE_VARS},apparent_temperature,dew_point_2m,snowfall,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility`,
          `${SURFACE_VARS},apparent_temperature,dew_point_2m,snowfall,cloud_cover_low,cloud_cover_mid,cloud_cover_high`,
          SURFACE_VARS,
        ];
        /* متغيرات مستوى الضغط لمنزلق الارتفاع (Windy Altitude) */
        const levelVarSet = (p) => `wind_speed_${p}hPa,wind_direction_${p}hPa,temperature_${p}hPa,geopotential_height_${p}hPa`;

        function parseModel(model, g, arr, hasCape, pLvl) {
          const times = arr[0].hourly.time, nT = times.length, nP = arr.length;
          const mk = () => new Float32Array(nT * nP);
          const v = { u: mk(), v: mk(), sp: mk(), gust: mk(), p: mk(), cl: mk(), pr: mk(), code: mk(), t2m: mk(), cape: hasCape ? mk() : null,
            rh: mk(), feels: mk(), dew: mk(), snow: mk(), clLow: mk(), clMid: mk(), clHigh: mk(), vis: mk(), soil: mk(),
            uL: null, vL: null, spL: null, tL: null, gh: null };
          if (pLvl) { v.uL = mk(); v.vL = mk(); v.spL = mk(); v.tL = mk(); v.gh = mk(); }
          const rad = Math.PI / 180;
          arr.forEach((entry, i) => {
            const h = entry.hourly;
            for (let t = 0; t < nT; t += 1) {
              const o = t * nP + i;
              const sp = h.wind_speed_10m?.[t] ?? 0;
              v.gust[o] = h.wind_gusts_10m?.[t] ?? sp;
              const dir = h.wind_direction_10m?.[t] ?? 0;
              v.sp[o] = sp; v.u[o] = -sp * Math.sin(dir * rad); v.v[o] = -sp * Math.cos(dir * rad);
              v.p[o] = h.pressure_msl?.[t] ?? NaN;
              v.cl[o] = h.cloud_cover?.[t] ?? 0;
              v.pr[o] = h.precipitation?.[t] ?? 0;
              v.code[o] = h.weather_code?.[t] ?? 0;
              v.t2m[o] = h.temperature_2m?.[t] ?? NaN;
              if (hasCape) v.cape[o] = h.cape?.[t] ?? 0;
              /* المرحلة 7: متغيرات الطبقات الجديدة (المتغير المفقود يصبح NaN فتظهر طبقته فارغة بلا انهيار) */
              v.rh[o] = h.relative_humidity_2m?.[t] ?? NaN;
              v.feels[o] = h.apparent_temperature?.[t] ?? NaN;
              v.dew[o] = h.dew_point_2m?.[t] ?? NaN;
              v.snow[o] = h.snowfall?.[t] ?? NaN;
              v.clLow[o] = h.cloud_cover_low?.[t] ?? NaN;
              v.clMid[o] = h.cloud_cover_mid?.[t] ?? NaN;
              v.clHigh[o] = h.cloud_cover_high?.[t] ?? NaN;
              v.vis[o] = h.visibility?.[t] ?? NaN;
              v.soil[o] = h.soil_moisture_0_to_1cm?.[t] ?? NaN;
              if (pLvl) {
                const spL = h[`wind_speed_${pLvl}hPa`]?.[t] ?? NaN;
                const dirL = h[`wind_direction_${pLvl}hPa`]?.[t] ?? NaN;
                v.spL[o] = spL; v.uL[o] = -spL * Math.sin(dirL * rad); v.vL[o] = -spL * Math.cos(dirL * rad);
                v.tL[o] = h[`temperature_${pLvl}hPa`]?.[t] ?? NaN;
                v.gh[o] = h[`geopotential_height_${pLvl}hPa`]?.[t] ?? NaN;
              }
            }
          });
          return { model, g, t0: weatherTime(times[0]), nT, nP, v, hasCape };
        }

        async function fetchModel(model, g, signal) {
          /* إصدار 33: «icon_hires» — نموذج ICON الإقليمي عالي الدقة (icon_seamless،
             دمج ICON-EU مع ICON-Global) للتبديل السياقي الصامت عند التقريب للمدن */
          const endpoint = model === "best_match" || model === "icon_hires" ? "forecast" : model;
          const pLvl = S.level === "surface" ? null : Number(S.level);
          let err = null;
          for (let k = 0; k < MODEL_SETS.length; k += 1) {
            try {
              const params = {
                latitude: g.lats.join(","), longitude: g.lons.join(","),
                hourly: pLvl ? `${MODEL_SETS[k]},${levelVarSet(pLvl)}` : MODEL_SETS[k],
                timezone: "UTC", past_hours: String(PAST_H), forecast_hours: String(FUT_H + 2),
                wind_speed_unit: "kmh", precipitation_unit: "mm",
              };
              if (model === "icon_hires") params.models = "icon_seamless";
              if (pLvl) params.pressure_level = String(pLvl);
              const url = new URL(`https://api.open-meteo.com/v1/${endpoint}`);
              url.search = new URLSearchParams(params);
              const j = await getJson(url, signal);
              const arr = Array.isArray(j) ? j : [j];
              if (arr.length !== g.lats.length || !arr[0].hourly?.time?.length) throw new Error("بيانات غير مكتملة");
              return parseModel(model, g, arr, MODEL_SETS[k].includes("cape"), pLvl);
            } catch (e) {
              if (e.name === "AbortError") throw e;
              err = e;
              if (e.status === 429) break;
            }
          }
          throw err || new Error("فشل الجلب");
        }

        async function fetchAir(g, signal) {
          const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
          url.search = new URLSearchParams({
            latitude: g.lats.join(","), longitude: g.lons.join(","),
            /* المرحلة 7: أضيفت PM2.5 وNO2 والأوزون وUV إلى جلب جودة الهواء */
            hourly: "dust,us_aqi,pm2_5,nitrogen_dioxide,ozone,uv_index",
            domains: "cams_global", timezone: "UTC", past_hours: String(PAST_H), forecast_hours: String(FUT_H + 2),
          });
          const j = await getJson(url, signal);
          const arr = Array.isArray(j) ? j : [j];
          if (arr.length !== g.lats.length || !arr[0].hourly?.time?.length) throw new Error("بيانات هواء غير مكتملة");
          const times = arr[0].hourly.time, nT = times.length, nP = arr.length;
          const mk = () => new Float32Array(nT * nP);
          const v = { dust: mk(), aqi: mk(), pm25: mk(), no2: mk(), o3: mk(), uv: mk() };
          arr.forEach((entry, i) => {
            for (let t = 0; t < nT; t += 1) {
              const o = t * nP + i;
              v.dust[o] = entry.hourly.dust?.[t] ?? 0;
              v.aqi[o] = entry.hourly.us_aqi?.[t] ?? NaN;
              v.pm25[o] = entry.hourly.pm2_5?.[t] ?? NaN;
              v.no2[o] = entry.hourly.nitrogen_dioxide?.[t] ?? NaN;
              v.o3[o] = entry.hourly.ozone?.[t] ?? NaN;
              v.uv[o] = entry.hourly.uv_index?.[t] ?? NaN;
            }
          });
          return { t0: weatherTime(times[0]), nT, nP, v };
        }

        /* المرحلة 7 — بيانات البحار من Open-Meteo Marine: أمواج، سول، حرارة سطح البحر، تيارات.
           بياناتها كل 3 ساعات (stepH) وتتوفر فوق المياه فقط؛ تفشل بهدوء فوق اليابسة،
           مع سلّم متغيرات ينسحب إلى الأمواج وحدها إن لم تتاح التيارات أو حرارة البحر. */
        const MARINE_SETS = [
          "wave_height,wave_direction,swell_wave_height,sea_surface_temperature,ocean_current_velocity,ocean_current_direction",
          "wave_height,wave_direction,swell_wave_height,sea_surface_temperature",
          "wave_height,wave_direction,swell_wave_height",
        ];

        async function fetchMarine(g, signal) {
          let err = null;
          for (let k = 0; k < MARINE_SETS.length; k += 1) {
            try {
              const url = new URL("https://marine-api.open-meteo.com/v1/marine");
              url.search = new URLSearchParams({
                latitude: g.lats.join(","), longitude: g.lons.join(","), hourly: MARINE_SETS[k],
                timezone: "UTC", past_days: "1", forecast_days: "4",
              });
              const j = await getJson(url, signal);
              const arr = Array.isArray(j) ? j : [j];
              if (!arr[0]?.hourly?.time?.length) throw new Error("بيانات بحرية غير متاحة");
              const times = arr[0].hourly.time;
              const t0 = weatherTime(times[0]);
              if (!t0) throw new Error("زمن بحري غير صالح");
              const stepH = times.length > 1 ? clamp(Math.round((weatherTime(times[1]) - t0) / HOUR), 1, 12) : 3;
              const nT = times.length, nP = arr.length;
              const mk = () => new Float32Array(nT * nP);
              const v = { wave: mk(), swell: mk(), sst: mk(), curV: mk(), curD: mk() };
              arr.forEach((entry, i) => {
                const h = entry.hourly ?? {};
                for (let t = 0; t < nT; t += 1) {
                  const o = t * nP + i;
                  v.wave[o] = h.wave_height?.[t] ?? NaN;
                  v.swell[o] = h.swell_wave_height?.[t] ?? NaN;
                  v.sst[o] = h.sea_surface_temperature?.[t] ?? NaN;
                  v.curV[o] = h.ocean_current_velocity?.[t] ?? NaN;
                  v.curD[o] = h.ocean_current_direction?.[t] ?? NaN;
                }
              });
              return { t0, nT, nP, stepH, v };
            } catch (e) {
              if (e.name === "AbortError") throw e;
              err = e;
              if (e.status === 429) break;
            }
          }
          throw err || new Error("فشل الجلب البحري");
        }

        const COOL = 30e3, COOL_429 = 70e3;
        let ensureTimer = 0;
        function ensureSoon() {
          clearTimeout(ensureTimer);
          ensureTimer = setTimeout(ensureData, 260);
        }

        function neededDatasets() {
          const on = S.on;
          /* v64: الطبقات النقية الأربع — الشبكة الساعية تلزم الرادار والتراكم والرياح */
          const needGrid = on.rain || on.accumulation || on.wind;
          const needAir = false;
          const needMarine = false;
          return { needGrid, needAir, needMarine };
        }

        async function ensureData() {
          if (!S.ready || !S.shown || !S.map || S.map.getSize().x < 50) return;
          const { needGrid, needAir, needMarine } = neededDatasets();
          if (!needGrid && !needAir && !needMarine) { S.cur = null; syncTiles(); redraw(); updateLegend(); return; }
          if (!S.grid || !gridCovers(S.grid)) {
            S.grid = gridFromView(); S.models = {}; S.air = null; S.marine = null; S.pending = {}; S.fail = {};
          }
          if (S.fetchedAt && Date.now() - S.fetchedAt > 30 * 60e3) { S.models = {}; S.air = null; S.marine = null; S.fetchedAt = 0; }
          const grid = S.grid;
          S.pending = S.pending || {}; S.fail = S.fail || {};
          const jobs = [];
          const run = (key, fetcher, store) => {
            if (S.pending[key]) { jobs.push(S.pending[key]); return; }
            if (S.fail[key] && Date.now() < S.fail[key].until) return;
            S.pending[key] = fetcher(grid)
              .then((v) => { if (S.grid === grid) { store(v); delete S.fail[key]; } })
              .catch((e) => { if (S.grid === grid) S.fail[key] = { status: e?.status, until: Date.now() + (e?.status === 429 ? COOL_429 : key === "marine" ? COOL * 4 : COOL) }; })
              .finally(() => { if (S.grid === grid) delete S.pending[key]; });
            jobs.push(S.pending[key]);
          };
          if (needGrid) {
            /* إصدار 33: المفتاح الفعّال يحترم دقة الحي (icon_hires عند زووم ≥ 10
               ونموذج «الأفضل») مع احترام الاختيار اليدوي للمستخدم */
            const dataKey = dataModelKey();
            if (!S.models[dataKey]) run(dataKey, (g2) => fetchModel(dataKey, g2), (ds) => { S.models[dataKey] = ds; });
          }
          if (needAir && !S.air) run("air", (g) => fetchAir(g), (a) => { S.air = a; });
          /* المرحلة 7: جلب بيانات البحار فقط عند تشغيل إحدى طبقاتها */
          if (needMarine && !S.marine) run("marine", (g) => fetchMarine(g), (m) => { S.marine = m; });
          if (jobs.length) setStatus(tr("يتم تحميل بيانات الطقس للمنطقة المعروضة…"));
          await Promise.allSettled(jobs);
          if (S.grid !== grid) return;
          S.fetchedAt = Date.now();
          const dataKey = dataModelKey();
          const lostGrid = needGrid && !S.models[dataKey];
          const lostAir = needAir && !S.air;
          const lostMarine = needMarine && !S.marine;
          if (lostGrid || lostAir || lostMarine) {
            const limited = [lostGrid ? dataKey : null, lostAir ? "air" : null, lostMarine ? "marine" : null].some((k) => S.fail[k]?.status === 429);
            if (lostMarine && !lostGrid && !lostAir) {
              setStatus(tr("بيانات البحار غير متاحة فوق اليابسة — قرّب الخريطة نحو ساحل أو محيط."), true);
            } else {
              setStatus(
                limited
                  ? tr("وصلنا للحد المؤقت للطلبات المجانية، سنعيد المحاولة تلقائيًا بعد دقيقة.")
                  : tr("تعذّر تحميل بعض بيانات الطبقات. جرّب تحريك الخريطة مرة أخرى."),
                true,
              );
            }
            if (limited) { clearTimeout(S.retryTimer); S.retryTimer = setTimeout(() => { S.fail = {}; ensureData(); }, COOL_429 + 1e3); }
          } else if (jobs.length) setStatus("");
          rebuildSamplers();
          computeCur();
          syncTiles();
          updateLegend();
          redraw();
        }

        /* ---------------- العينات (شبكة → شاشة) ---------------- */
        function buildSampler(cell) {
          const g = S.grid;
          if (!g || !S.map || S.size.x < 10) return null;
          const cols = Math.ceil(S.size.x / cell) + 1, rows = Math.ceil(S.size.y / cell) + 1, N = cols * rows;
          const idx = new Int32Array(N), fx = new Float32Array(N), fy = new Float32Array(N);
          for (let r = 0, k = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1, k += 1) {
            const ll = S.map.containerPointToLatLng([c * cell, r * cell]);
            const lon = ((((ll.lng - g.west) % 360) + 360) % 360) + g.west;
            const gx = (lon - g.west) / g.dLon, gy = (ll.lat - g.south) / g.dLat;
            if (!(gx >= 0 && gy >= 0 && gx <= g.nx - 1 && gy <= g.ny - 1)) { idx[k] = -1; continue; }
            const c0 = Math.min(Math.floor(gx), g.nx - 2), r0 = Math.min(Math.floor(gy), g.ny - 2);
            idx[k] = r0 * g.nx + c0; fx[k] = gx - c0; fy[k] = gy - r0;
          }
          const nx = g.nx;
          return {
            cols, rows, cell, N,
            fill(vals, out) {
              for (let k = 0; k < N; k += 1) {
                const i = idx[k];
                if (i < 0) { out[k] = NaN; continue; }
                const x = fx[k], y = fy[k];
                out[k] = (1 - y) * ((1 - x) * vals[i] + x * vals[i + 1]) + y * ((1 - x) * vals[i + nx] + x * vals[i + nx + 1]);
              }
              return out;
            },
          };
        }

        function rebuildSamplers() {
          if (!S.ready) return;
          S.sam.r = buildSampler(CELL);
          S.sam.w = buildSampler(WCELL);
          S.wu = S.sam.w ? new Float32Array(S.sam.w.N) : null;
          S.wv = S.sam.w ? new Float32Array(S.sam.w.N) : null;
          S.buf = {};
        }

        function pointSample(arr, lat, lon) {
          const g = S.grid;
          if (!g) return NaN;
          const lo = ((((lon - g.west) % 360) + 360) % 360) + g.west;
          const gx = (lo - g.west) / g.dLon, gy = (lat - g.south) / g.dLat;
          if (!(gx >= 0 && gy >= 0 && gx <= g.nx - 1 && gy <= g.ny - 1)) return NaN;
          const c0 = Math.min(Math.floor(gx), g.nx - 2), r0 = Math.min(Math.floor(gy), g.ny - 2);
          const x = gx - c0, y = gy - r0, i = r0 * g.nx + c0;
          return (1 - y) * ((1 - x) * arr[i] + x * arr[i + 1]) + y * ((1 - x) * arr[i + g.nx] + x * arr[i + g.nx + 1]);
        }

        /* ---------------- حقول الزمن الحالي ---------------- */
        const posT = (p) => (S.rtMode ? S.rtT0 + p * RT_STEP_MS : S.start + p * HOUR);

        function interp(ds, T) {
          /* المرحلة 7: ds.stepH يدعم بيانات البحار ثلاثية الساعات */
          const x = (T - ds.t0) / (HOUR * (ds.stepH || 1));
          const i0 = clamp(Math.floor(x), 0, Math.max(0, ds.nT - 2));
          return { i0, i1: Math.min(i0 + 1, ds.nT - 1), f: ds.nT < 2 ? 0 : clamp(x - i0, 0, 1) };
        }

        function fieldAt(ds, name, ti, out) {
          const a = ds.v[name], P = ds.nP, o0 = ti.i0 * P, o1 = ti.i1 * P, f = ti.f;
          for (let i = 0; i < P; i += 1) out[i] = a[o0 + i] * (1 - f) + a[o1 + i] * f;
          return out;
        }

        function computeCur() {
          const ds = S.models[dataModelKey()], air = S.air, marine = S.marine;
          const base = ds || air || marine;
          if (!base) { S.cur = null; return; }
          const P = base.nP, T = posT(S.pos);
          let c = S.cur;
          if (!c || c.P !== P) {
            const mk = () => new Float32Array(P);
            c = { P, u: mk(), v: mk(), sp: mk(), gust: mk(), p: mk(), cl: mk(), pr: mk(), accum: mk(), t2m: mk(), dust: mk(), aqi: mk(),
              pm25: mk(), no2: mk(), o3: mk(), uv: mk(),
              rh: mk(), feels: mk(), dew: mk(), tw: mk(), snow: mk(), ptype: mk(), clLow: mk(), clMid: mk(), clHigh: mk(), clBase: mk(), vis: mk(), soil: mk(),
              wave: mk(), swell: mk(), sst: mk(), curV: mk(), curD: mk() };
          }
          if (ds) {
            const ti = interp(ds, T);
            fieldAt(ds, "u", ti, c.u); fieldAt(ds, "v", ti, c.v); fieldAt(ds, "sp", ti, c.sp); fieldAt(ds, "gust", ti, c.gust);
            fieldAt(ds, "p", ti, c.p); fieldAt(ds, "cl", ti, c.cl); fieldAt(ds, "pr", ti, c.pr);
            fieldAt(ds, "t2m", ti, c.t2m);
            /* المرحلة 7: عند اختيار ارتفاع (مستوى ضغط) تستبدل الرياح والحرارة بقيم ذلك المستوى */
            if (S.level !== "surface" && ds.v.spL) {
              fieldAt(ds, "uL", ti, c.u); fieldAt(ds, "vL", ti, c.v); fieldAt(ds, "spL", ti, c.sp);
              if (ds.v.tL) fieldAt(ds, "tL", ti, c.t2m);
            }
            const simple = (name) => { if (ds.v[name]) fieldAt(ds, name, ti, c[name]); else c[name].fill(NaN); };
            simple("rh"); simple("feels"); simple("dew"); simple("snow");
            simple("clLow"); simple("clMid"); simple("clHigh"); simple("soil");
            if (ds.v.vis) {
              fieldAt(ds, "vis", ti, c.vis);
              for (let i = 0; i < P; i += 1) c.vis[i] = c.vis[i] / 1000; /* من متر إلى كم */
            } else c.vis.fill(NaN);
            /* v63: تراكم أمامي (Clear Rain Accumulation) — مجموع مطر النافذة
               القادمة (24 ساعة أو 3 أيام) من الموضع الزمني الحالي على الخط
               الزمني بدل النظر للخلف، لعرض المتوقع لا الماضي */
            const hours = S.accumulationHours;
            const startIndex = ti.i0;
            const endExclusive = Math.min(startIndex + hours, ds.nT);
            const span = endExclusive - startIndex;
            for (let point = 0; point < P; point += 1) {
              if (span < 2) { c.accum[point] = NaN; continue; }
              let total = 0;
              for (let hour = startIndex; hour < endExclusive; hour += 1) total += ds.v.pr[hour * P + point];
              c.accum[point] = total;
            }
            /* مؤشرات محسوبة طرفيًا:
               1) البصيلة الرطبة بمعادلة ستول — خطورة الموجات الحارة على جسم الإنسان
               2) نوع الهطول من حرارة السطح: 1 مطر، 2 ثلج، 3 متجمد
               3) قاعدة السحب التقريبية من فرق التشبع (T - Td) × 125م عند تغطية ≥ 15٪ */
            for (let i = 0; i < P; i += 1) {
              const t = c.t2m[i], rh = c.rh[i];
              c.tw[i] = (t === t && rh === rh)
                ? t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) + Math.atan(t + rh) - Math.atan(rh - 1.676331) + 0.00391838 * Math.pow(rh, 1.5) - 4.686035
                : NaN;
              c.ptype[i] = (c.pr[i] > 0.06 && t === t) ? (t <= 0 ? 2 : t <= 1.5 ? 3 : 1) : 0;
              const spread = t - c.dew[i];
              c.clBase[i] = (t === t && c.dew[i] === c.dew[i] && c.cl[i] >= 15 && spread > 0.4) ? spread * 125 : NaN;
              c.soil[i] = (c.soil[i] === c.soil[i]) ? c.soil[i] * 200 : NaN; /* m³/m³ → ٪ رطوبة */
            }
          } else {
            ["u", "v", "sp", "gust", "p", "cl", "pr", "accum", "t2m", "rh", "feels", "dew", "tw", "snow", "ptype", "clLow", "clMid", "clHigh", "clBase", "vis", "soil"].forEach((k) => c[k].fill(NaN));
          }
          if (air && air.nP === P) {
            const ta = interp(air, T);
            fieldAt(air, "dust", ta, c.dust); fieldAt(air, "aqi", ta, c.aqi);
            const simpleAir = (name) => { if (air.v[name]) fieldAt(air, name, ta, c[name]); else c[name].fill(NaN); };
            simpleAir("pm25"); simpleAir("no2"); simpleAir("o3"); simpleAir("uv");
          } else { ["dust", "aqi", "pm25", "no2", "o3", "uv"].forEach((k) => c[k].fill(NaN)); }
          /* المرحلة 7: حقول البحار (تُرسم فقط فوق المياه حيث تتوفر قيم) */
          if (marine && marine.nP === P) {
            const tm = interp(marine, T);
            fieldAt(marine, "wave", tm, c.wave); fieldAt(marine, "swell", tm, c.swell); fieldAt(marine, "sst", tm, c.sst);
            fieldAt(marine, "curV", tm, c.curV); fieldAt(marine, "curD", tm, c.curD);
          } else { ["wave", "swell", "sst", "curV", "curD"].forEach((k) => c[k].fill(NaN)); }
          S.cur = c;
        }
        /* ---------------- أدوات الرسم ---------------- */
        function ramp(stops, v, out) {
          if (v !== v || v == null) { out[0] = 0; out[1] = 0; out[2] = 0; out[3] = 0; return; }
          let i = 0;
          while (i < stops.length - 1 && v > stops[i + 1][0]) i += 1;
          const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
          const t = b[0] === a[0] ? 0 : clamp((v - a[0]) / (b[0] - a[0]), 0, 1);
          out[0] = a[1] + (b[1] - a[1]) * t;
          out[1] = a[2] + (b[2] - a[2]) * t;
          out[2] = a[3] + (b[3] - a[3]) * t;
          out[3] = (a[4] + (b[4] - a[4]) * t);
        }

        function rampCss(stops, min, max) {
          const parts = stops
            .filter((s) => s[0] >= min - 1e9)
            .map((s) => {
              const p = clamp(((s[0] - min) / Math.max(max - min, 1e-6)) * 100, 0, 100);
              return `rgb(${Math.round(s[1])},${Math.round(s[2])},${Math.round(s[3])}) ${p.toFixed(0)}%`;
            });
          return `linear-gradient(90deg, ${parts.join(",")})`;
        }

        function paint(vals, stops, mul = 1, mv = 0) {
          const sm = S.sam.r;
          if (!sm) return;
          const { cols, rows } = sm;
          if (!S.oc) S.oc = document.createElement("canvas");
          const oc = S.oc;
          if (oc.width !== cols || oc.height !== rows) {
            oc.width = cols; oc.height = rows;
            S.octx = oc.getContext("2d");
            S.img = S.octx.createImageData(cols, rows);
          }
          const d = S.img.data, o = S.col || (S.col = [0, 0, 0, 0]);
          /* v64: قاعدة شفافية المطر الصفري — أي قيمة تحت الحد تُرسم شفافة تمامًا (alpha = 0) */
          const minVal = mv || 0;
          for (let k = 0, n = cols * rows; k < n; k += 1) {
            const v = vals[k], j = k * 4;
            if (v !== v || v < minVal) { d[j + 3] = 0; continue; }
            ramp(stops, v, o);
            d[j] = o[0]; d[j + 1] = o[1]; d[j + 2] = o[2]; d[j + 3] = o[3] * 255 * mul;
          }
          S.octx.putImageData(S.img, 0, 0);
          const c = S.ctx;
          c.save();
          c.globalAlpha = S.opacity;
          c.imageSmoothingEnabled = true;
          c.imageSmoothingQuality = "high";
          c.drawImage(oc, 0, 0, cols, rows, -CELL / 2, -CELL / 2, cols * CELL, rows * CELL);
          c.restore();
        }

        function layerBuf(name) {
          const N = S.sam.r.N;
          if (!S.buf[name] || S.buf[name].length !== N) S.buf[name] = new Float32Array(N);
          return S.buf[name];
        }

        /* v64: حُذفت خطوط الضغط المتساوية (drawIsobars) مع حذف طبقة الضغط في التنظيف الجذري */

/* أسهم الرياح */
        function drawWindArrows() {
          const sm = S.sam.w, c = S.ctx;
          if (!sm || !S.cur) return;
          const u = S.wu, v = S.wv;
          sm.fill(S.cur.u, u);
          sm.fill(S.cur.v, v);
          c.save();
          c.lineWidth = 1.6;
          c.lineCap = "round";
          const dark = MAP_DARK; /* الخريطة الكبرى داكنة دائمًا (المرحلة 9) */
          for (let k = 0; k < sm.N; k += 1) {
            if (u[k] !== u[k] || v[k] !== v[k]) continue;
            const x = (k % sm.cols) * WCELL + WCELL / 2;
            const y = Math.floor(k / sm.cols) * WCELL + WCELL / 2;
            const speed = Math.hypot(u[k], v[k]);
            const mag = clamp(speed / Math.max(...WIND_SPEEDS), 0.06, 1);
            const len = 6 + mag * (WCELL * 0.72);
            const ang = Math.atan2(-v[k], u[k]); // محور الشاشة: y لأسفل
            const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
            let ci = 0;
            for (let i = 0; i < WIND_SPEEDS.length; i += 1) if (speed >= WIND_SPEEDS[i]) ci = i;
            c.strokeStyle = dark ? WIND_COLORS[ci] : WIND_COLORS[ci];
            c.globalAlpha = 0.92;
            c.beginPath();
            c.moveTo(x - dx, y - dy);
            c.lineTo(x + dx, y + dy);
            const hx = x + dx, hy = y + dy, hs = 3.2 + mag * 2.4;
            c.moveTo(hx, hy);
            c.lineTo(hx - Math.cos(ang - 0.5) * hs, hy - Math.sin(ang - 0.5) * hs);
            c.moveTo(hx, hy);
            c.lineTo(hx - Math.cos(ang + 0.5) * hs, hy - Math.sin(ang + 0.5) * hs);
            c.stroke();
          }
          c.restore();
        }

        /* v64: حُذفت أسهم تيارات المحيط (drawCurrents) مع حذف طبقات البحار */

/* إصدار 33: مقاييس الجزيئات التكيفية — قلب التبديل السياقي للرياح:
           بعيد (زووم < 10): ذيول طويلة انسيابية لحركة المناخ الكبرى عبر الدول
           قريب (زووم ≥ 10): ذيول أقصر، سماكة أعلى، كثافة وعدد أكبر
           لتوضيح مسارات الرياح المحلية بين المباني والتضاريس
           إصدار 39 (Wind Particle Refinement): عمر أطول للجزيئات (ذيول أطول
           تلاشيًا ناعمًا) + سماكة أعلى قليلًا + تلاشي أبطأ (fade أخفض) —
           خطوط فيكتور انسيابية ذات توهج خفيف بنمط Windy النهائي */
        function flowParams() {
          const near = nearZoomOn();
          /* v55: سقف الجزيئات 400 كحد أقصى في الوضع الخفيف (الهواتف/الأجهزة المتوسطة) */
          const cap = LITE_DEVICE ? PARTICLE_CAP : Infinity;
          const base = Math.min(900, Math.max(240, Math.floor((S.size.x * S.size.y) / 2600)));
          if (near) return { near: true, count: Math.min(2400, Math.round(base * 2.4), cap), thick: 2.7, fade: 0.12, kf: 1.3, maxAge: [55, 105] };
          return { near: false, count: Math.min(base, cap), thick: 1.7, fade: 0.055, kf: 1, maxAge: [120, 230] };
        }

        function resetParticles() {
          const P = flowParams();
          S.particles = Array.from({ length: P.count }, () => spawnParticle(true));
        }

        function spawnParticle(scatter) {
          const P = flowParams();
          return {
            x: Math.random() * S.size.x,
            y: Math.random() * S.size.y,
            age: scatter ? Math.random() * P.maxAge[1] * 0.5 : 0,
            max: P.maxAge[0] + Math.random() * (P.maxAge[1] - P.maxAge[0]),
          };
        }

        /* قراءة الرياح عند أي نقطة شاشة باستيفاء ثنائي خط فوق شبكة عرض WCELL */
        function windAtScreen(x, y) {
          const sm = S.sam.w;
          if (!sm || !S.wu || !S.wv) return null;
          const gx = x / WCELL - 0.5, gy = y / WCELL - 0.5; /* مراكز الخلايا */
          if (gx < -1 || gy < -1 || gx > sm.cols || gy > sm.rows) return null;
          const c0 = clamp(Math.floor(gx), 0, sm.cols - 1), r0 = clamp(Math.floor(gy), 0, sm.rows - 1);
          const c1 = Math.min(c0 + 1, sm.cols - 1), r1 = Math.min(r0 + 1, sm.rows - 1);
          const tx = clamp(gx - c0, 0, 1), ty = clamp(gy - r0, 0, 1);
          const i00 = r0 * sm.cols + c0, i10 = r0 * sm.cols + c1, i01 = r1 * sm.cols + c0, i11 = r1 * sm.cols + c1;
          let u = 0, v = 0, wsum = 0;
          const acc = (i, w) => { const a = S.wu[i], b = S.wv[i]; if (a === a && b === b) { u += a * w; v += b * w; wsum += w; } };
          acc(i00, (1 - tx) * (1 - ty)); acc(i10, tx * (1 - ty));
          acc(i01, (1 - tx) * ty); acc(i11, tx * ty);
          if (!wsum) return null;
          return [u / wsum, v / wsum];
        }

                /* v64: حُذف محرك جزيئات WebGL كليًا في إعادة البناء النظيفة —
           تيارات الرياح الانسيابية عبر مسار Canvas2D الخفيف حصرًا (60fps) */

        /* v64: تفريغ ذيول الجزيئات عند الحركة أو تغيّر الزووم (Canvas2D حصرًا) */
        function clearFlowCanvas() {
          if (S.ctxFlow) S.ctxFlow.clearRect(0, 0, S.size.x, S.size.y);
        }

        /* v64: حُذفت كتابة قطع GPU (pushSeg) مع محرك WebGL كليًا */

        /* ══ v42: خنق كثافة الجزيئات أثناء الحركة (Density Throttling) ══
           عند بدء السحب أو التكبير (movestart/zoomstart) تنخفض كثافة الجزيئات
           المعالَجة 50% تلقائيًا (flowThrottle = 0.5) فتثبت وتيرة الإطارات عند
           60fps على الهواتف أثناء التفاعل، وتعود للكثافة الكاملة عند التوقف
           (moveend/zoomend) — يقرؤه stepParticles فيحفّز نصف الجزيئات فقط */
        let flowThrottle = 1;
        function setFlowThrottle(v) {
          if (flowThrottle === v) return;
          flowThrottle = v;
        }

        /* إصدار 33: فيزياء الجزيئات المشتركة بين المحركين — خطوة واحدة لكل جزيء
           (استيفاء ثنائي خط + تقادد السرعة مع الزووم + إعادة توليد عند الخروج)
           v42: أثناء خنق الحركة تُخطَّى نصف الجزيئات (الفهرس الفردي) فتُخفّض
           كثافة الرسم والتقادم معًا وتظل الحركة انسيابية بلا أي تقطيع */
        function stepParticles(dt, P, emit) {
          const zoom = S.map ? S.map.getZoom() : 5;
          const zf = clamp(Math.pow(2, zoom - 5), 0.75, 3.4);
          const K = 1.75 * zf * P.kf;
          const skipOdd = flowThrottle < 1;
          for (let pi = 0; pi < S.particles.length; pi += 1) {
            if (skipOdd && (pi & 1)) continue;      /* نصف الجزيئات أثناء السحب/التكبير */
            const p = S.particles[pi];
            const w = windAtScreen(p.x, p.y);
            if (!w) { Object.assign(p, spawnParticle(false)); continue; }
            const nx2 = p.x + w[0] * K * dt, ny2 = p.y - w[1] * K * dt;
            const speed = Math.hypot(w[0], w[1]);
            let bi = 0;
            for (let i = 0; i < WIND_SPEEDS.length; i += 1) if (speed >= WIND_SPEEDS[i]) bi = i;
            emit(p.x, p.y, nx2, ny2, bi);
            p.x = nx2; p.y = ny2;
            p.age += 1;
            if (p.age > p.max || nx2 < -12 || ny2 < -12 || nx2 > S.size.x + 12 || ny2 > S.size.y + 12) {
              Object.assign(p, spawnParticle(false));
            }
          }
        }

        /* ══ v42: سطوع الذيل حسب سرعة الرياح (Speed-Adaptive Tail Brightness) ══
           الذيل المتلاشي الناعم يتغير سطوعه وتوهجه مع سرعة الرياح الفعلية:
           نسيم هادئ = خط هادئ شفاف (0.5)، رياح قوية = خط أسطع متوهج (0.95)
           — يُقرأ شدة الرياح من لون الخط وسطوعه معًا دون عناء */
        function windGlowAlpha(bi) {
          const n = WIND_SPEEDS.length;
          return 0.5 + 0.45 * (n <= 1 ? 1 : bi / (n - 1));
        }

                /* v64: مسار Canvas2D النقي حصرًا — نفس الفيزياء والمقاييس التكيفية */
/* مسار Canvas2D الاحتياطي — نفس الفيزياء نفسها بنفس المقاييس التكيفية */
        function flowFrame2D(dt, P) {
          const c = S.ctxFlow;
          if (!c || !S.particles) return;
          /* تلاشي الإطار السابق — ذيول متوهجة بطول متكيف مع مستوى التقريب.
             إصدار 39: destination-in يبقى قلب آلية التلاشي (حرفيًا كما هي):
             يقلّص ألفا الذيل السابق بنسبة (1 - fade) كل إطار فيتلاشى خط الحركة
             تدريجيًا بدل القفزات الحادة، ثم source-over يرسم الجزيئات الجديدة */
          c.globalCompositeOperation = "destination-in";
          c.fillStyle = `rgba(255,255,255,${(1 - P.fade).toFixed(3)})`;
          c.fillRect(0, 0, S.size.x, S.size.y);
          c.globalCompositeOperation = "source-over";
          /* تجميع الجزيئات في 8 مجموعات سرعة للرسم المجمع (أداء أعلى بكثير من stroke لكل جزيء) */
          const buckets = WIND_SPEEDS.map(() => []);
          stepParticles(dt, P, (x1, y1, x2, y2, bi) => buckets[bi].push(x1, y1, x2, y2));
          c.lineCap = "round";
          c.lineJoin = "round";
          buckets.forEach((arr, i) => {
            if (!arr.length) return;
            /* v42: توهج حسب السرعة — مروران لكل مجموعة: هالة عريضة شفافة ثم
               قلب رفيع لامع، والسطوع في المرورين يتدرج مع سرعة الرياح
               (نسيم هادئ شفاف ← رياح عاتية متوهجة) كنمط Windy النهائي */
            const coreA = windGlowAlpha(i);
            c.strokeStyle = WIND_COLORS[i];
            c.lineWidth = P.thick * 2.8;
            c.globalAlpha = coreA * 0.18;
            c.beginPath();
            for (let k = 0; k < arr.length; k += 4) {
              c.moveTo(arr[k], arr[k + 1]);
              c.lineTo(arr[k + 2], arr[k + 3]);
            }
            c.stroke();
            c.lineWidth = P.thick;
            c.globalAlpha = coreA;
            c.beginPath();
            for (let k = 0; k < arr.length; k += 4) {
              c.moveTo(arr[k], arr[k + 1]);
              c.lineTo(arr[k + 2], arr[k + 3]);
            }
            c.stroke();
          });
          c.globalAlpha = 1;
        }

        let flowLast = 0;
        function flowFrame(ts) {
          S.flowRAF = requestAnimationFrame(flowFrame);
          if (!S.cur) return;
          const sm = S.sam.w;
          if (!sm) return;
          /* تحديث عينات الرياح للشبكة (تتغير مع تحرك الزمن أو الخريطة) */
          sm.fill(S.cur.u, S.wu);
          sm.fill(S.cur.v, S.wv);
          const dt = flowLast ? clamp((ts - flowLast) / 1000, 0.001, 0.05) : 0.016;
          flowLast = ts;
          const P = flowParams();
          flowFrame2D(dt, P); /* v64: Canvas2D Streamlines النقية — بلا WebGL */
        }

        function startFlow() {
          if (S.flowRAF || !S.on.wind || document.hidden || state.page !== "map" || !S.ready) return;
          if (REDUCE_MOTION?.matches) return; /* حركة مخفّضة: أسهم ثابتة بدل الجزيئات */
          if (!S.particles || S.particles.length === 0) resetParticles();
          flowLast = 0;
          S.flowRAF = requestAnimationFrame(flowFrame);
        }

        function stopFlow() {
          if (S.flowRAF) cancelAnimationFrame(S.flowRAF);
          S.flowRAF = 0;
          flowLast = 0;
          clearFlowCanvas();
        }

        /* ---------------- الرسم الثابت العام ---------------- */
        let redrawQueued = false;
        function queueRedraw() {
          if (redrawQueued) return;
          redrawQueued = true;
          requestAnimationFrame(() => {
            redrawQueued = false;
            rebuildSamplers();
            redraw();
          });
        }

        function redraw() {
          if (!S.ready || state.page !== "map") return;
          const c = S.ctx;
          c.clearRect(0, 0, S.size.x, S.size.y);
          if (!S.sam.r) return;
          const active = Object.entries(S.on).filter(([, v]) => v).map(([k]) => k);
          if (!active.length) return;
          computeCur();
          if (S.cur) {
            /* ══ v64: الطبقات النقية الأربع حصرًا ══ */
            /* 💧 تراكم الأمطار الحقيقي — عتبة شفافية صارمة تحت 0.15 مم (شفاف تمامًا) */
            if (S.on.accumulation) layerFillPaint("accum", ACCUM_CLEAN, 1, 0.15);
            /* 🛰️ احتياط القمر الصناعي: غطاء سحابي أبيض/رمادي ناعم (cloud_cover)
               عند غياب لقطات RainViewer الحية لليوم */
            if (S.on.satellite && (!(S.tile.satellite?.meta?.frames?.length) || S.tile.satellite?.fallbackClouds)) layerFillPaint("cl", CLOUD_SOFT);
          }
          if (S.on.wind && S.cur) {
            /* 💨 تيارات الرياح الانسيابية — Canvas2D Streamlines 60fps
               (أو أسهم ثابتة مع تفضيل تقليل الحركة) */
            if (REDUCE_MOTION?.matches) drawWindArrows();
            else startFlow();
          } else stopFlow();
          /* 🌧️ رادار الأمطار: بلاطات RainViewer الحية عند توافر إطار قريب،
             وإلا كانفاس مطر النموذج بقاعدة شفافية 0.15 مم الصارمة */
          if (S.on.rain && S.level === "surface" && !S.tile.rain.shown && S.cur) layerFillPaint("pr", RAIN_CLEAN, 1, 0.15);
        }

        function layerFillPaint(name, stops, mul = 1, mv = 0) {
          const sm = S.sam.r;
          if (!sm || !S.cur || !S.cur[name]) return;
          const buf = layerBuf(name);
          sm.fill(S.cur[name], buf);
          paint(buf, stops, mul, mv);
        }

        /* ---------------- طبقات البلاطات الحية: رادار RainViewer + أقمار تحت الحمراء ----------------
           المرحلة 7: نظام موحّد لكل نوع (kind = rain | satellite):
           - كل إطار يُحمّل في طبقة مخفية تمامًا (شفافية صفر)، ولا يُعرض إلا بعد جهوزية
             بلاطاته 100% (حدث load) — حركة انسيابية فائقة السلاسة بلا تقطيع.
           - قيد صارم: maxNativeZoom لكل نوع منعًا للمربعات الرمادية الفارغة وأخطاء
             السيرفر عند التقريب الشديد (فوق ذلك تُكبّر البلاطات محليًا دون طلبات جديدة).
           - إدارة الذاكرة: الطبقة المعروضة السابقة تُدمّر تمامًا عبر map.removeLayer
             قبل ترقية الإطار الجديد، ويُقصّ مخزن التحميل المسبق لعدد محدود من الإطارات. */
        const TILE_DEF = {
          rain: {
            maxNativeZoom: 7,
            /* v63: عامل 1.0 — شفافية موزونة موحدة 0.68 تُظهر ألوان اللوحة القياسية
               (Universal Blue: أزرق سماوي ← أخضر ← أصفر ← أحمر) صافية نقية بلا
               أي مزج شاشة أو توهج فوق الأساس الداكن */
            factor: 1, zIndex: 412, cls: "mx-rain-tiles",
            /* المرحلة 10 — إصلاح جذري للرادار: كان التوقيع (path) يستقبل كائن الإطار كاملًا
               من addPreloadLayer فيصبح العنوان rainviewer.com[object Object]/… وتفشل كل
               البلاطات (404) فلا يظهر الرادار أبدًا. الآن يقرأ frame.path مثل الأقمار تمامًا.
               المرحلة 12 — ضبط الرادار: خانة الأرقام الأخيرة {smooth}_{snow} تُبنى من
               إعدادات المستخدم (تنعيم الألوان + عرض الثلج) بدل تثبيتها على 1_1 */
            /* v64: لوحة Universal Blue القياسية (2) ثابتة — أزرق سماوي ← أخضر ←
               أصفر ← أحمر، بلا أي مزج شاشة ولا توهج فوق الأساس الداكن */
            url: (frame) => `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/${S.radarSmooth ? 1 : 0}_${S.radarSnow ? 1 : 0}.png`,
            /* v64: الرادار الحي + توقع ساعتين — إطارات الماضي (آخر ساعتين)
               وإطارات Nowcast معًا على نافذة ± ساعتين الدقيقة */
            frames: (meta) => [...(meta.radar?.past ?? []), ...(meta.radar?.nowcast ?? [])],
          },
          satellite: {
            /* ══ v64: قمر السحب الصناعي الحي من RainViewer (satellite.infrared) ══
               أحدث لقطة متوفرة اليوم بمظهر سحابي أبيض/رمادي ناعم وجميل فوق
               الخريطة الداكنة — بلاطات IR بتدرج رمادي (color 0) مع
               maxNativeZoom 7 وفوقه تمطيط محلي ناعم؛ وإن غابت لقطات اليوم
               يُعرض الغطاء السحابي الأبيض الناعم من Open-Meteo احتياطًا واعدًا */
            maxNativeZoom: 7,
            factor: 1, zIndex: 408, cls: "mx-sat-tiles",
            url: (frame) => `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/0/0_0.png`,
            frames: (meta) => {
              const all = [...(meta.satellite?.infrared ?? [])];
              if (!all.length) return [];
              /* لقطات اليوم الحي حصرًا — وإن غابت (بداية يوم UTC مثلًا) فأحدث لقطة متاحة */
              const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
              const today = all.filter((f) => f.time * 1000 >= dayStart.getTime());
              return today.length ? today : [all[all.length - 1]];
            },
          },
        };
                /* v64: حُذفت لوحات ألوان الرادار الثمانية — لوحة Universal Blue (2) القياسية الثابتة */

/* v42: مخزن التحميل المسبق العميق — فتح الخريطة يجلب كل إطارات الرادار
           (الماضية + المستقبلية) في الخلفية مسبقًا كي يعمل زر التشغيل والسحب
           على الشريط الزمني بسلاسة الفيديو الفورية بلا أي انتظار. */
        const PRELOAD_KEEP = 28;
        /* v42: مدة التلاشي المتقاطع (Crossfade) بين إطارات الزمن بالمللي ثانية —
           الإطار الجديد يتلاشى دخولًا فوق القديم بدل إخفائه فجأة فلا وميض */
        const MX_CROSSFADE_MS = 240;
        const RADAR_CACHE_KEY = "matar:radar:last";
        /* v42: مؤشرات التحميل المسبق العميق لكل نوع (رادار/أقمار) */
        S.deepBuf = { rain: 0, satellite: 0 };

        /* ══ v52 — إصلاح رادار الأمطار جذريًا: مهلة 8 ثوانٍ + بديل NASA GIBS تلقائي ══
           ① أي جلب لـ RainViewer يتسابق مع مؤقت 8 ثوانٍ (AbortController) —
             التأخر أو الفشل لا يُترك بلا طبقة ولا برسالة «تعذّر تحميل رادار الأمطار».
           ② عند الفشل: تحول تلقائي إلى طبقة أمطار NASA GIBS (IMERG معدل المطر،
             بلاطات WMS شفافة PNG بنفس النمط المثبت لطبقات GIBS في الوحدة)،
             وإن فشل IMERG نفسه تعرض سحب VIIRS TrueColor بديلًا أخيرًا.
           ③ إعادة تجربة RainViewer كل 5 دقائق كي يعود البث المتحرك فور توافره. */
        const RV_URL = "https://api.rainviewer.com/public/weather-maps.json";
        const RV_TIMEOUT_MS = 8000;
        function rvTimedJson(url) {
          const ac = ("AbortController" in window) ? new AbortController() : null;
          const timer = ac ? setTimeout(() => ac.abort(), RV_TIMEOUT_MS) : null;
          return getJson(url, ac ? ac.signal : undefined).finally(() => { if (timer) clearTimeout(timer); });
        }
        let gibsRainWms = null;
        function gibsRainDate() { return new Date(Date.now() - 30 * 3600e3).toISOString().slice(0, 10); }
        function disableGibsRainLayer() {
          if (gibsRainWms && S.map) { try { S.map.removeLayer(gibsRainWms); } catch (e) {} }
          gibsRainWms = null;
        }
        function enableGibsRainLayer() {
          if (!S.ready || !S.map || gibsRainWms || !window.L) return;
          try {
            const wms = L.tileLayer.wms("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", {
              layers: "IMERG_Precipitation_Rate", format: "image/png", transparent: true, opacity: 0.72,
              version: "1.3.0", crs: L.CRS.EPSG4326, time: gibsRainDate(),
              pane: "tilePane", zIndex: 412, className: "mx-rain-tiles mx-gibs-rain",
              maxZoom: 19, maxNativeZoom: 6,
              attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS · IMERG</a>',
            });
            delete wms.wmsParams.bbox;
            let errs = 0;
            wms.on("tileerror", () => {
              errs += 1;
              if (errs >= 6 && gibsRainWms === wms) { /* IMERG فشل → سحب VIIRS بديلًا */
                disableGibsRainLayer();
                enableGibsCloudsLayer();
              }
            });
            gibsRainWms = wms.addTo(S.map);
            setStatus(tr("تعذّر وصول رادار RainViewer — تُعرض تقديرات أمطار NASA GIBS (IMERG) ويعاد الرادار اللحظي تلقائيًا كل 5 دقائق"));
          } catch (e) { /* بديل اختياري لا يكسر الخريطة */ }
        }
        function enableGibsCloudsLayer() {
          if (!S.ready || !S.map || gibsRainWms || !window.L) return;
          try {
            const wms = L.tileLayer.wms("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", {
              layers: "VIIRS_SNPP_CorrectedReflectance_TrueColor", format: "image/png", transparent: false, opacity: 0.5,
              version: "1.3.0", crs: L.CRS.EPSG4326, time: gibsRainDate(),
              pane: "tilePane", zIndex: 412, className: "mx-rain-tiles mx-gibs-clouds",
              maxZoom: 19, maxNativeZoom: 8,
              attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS</a>',
            });
            delete wms.wmsParams.bbox;
            gibsRainWms = wms.addTo(S.map);
            setStatus(tr("تُعرض سحب NASA GIBS الحية بديلًا — ويعاد رادار RainViewer تلقائيًا كل 5 دقائق"));
          } catch (e) { /* بديل اختياري لا يكسر الخريطة */ }
        }
        async function loadTileMeta(kind) {
          const tk = S.tile[kind];
          const isGibsRain = !!(tk.meta && tk.meta.source === "gibs-rain");
          /* ══ v64: القمر الصناعي الحي من RainViewer (satellite.infrared) ══
             أحدث لقطة متوفرة اليوم بمظهر سحابي أبيض/رمادي ناعم — يُحدَّث كل
             10 دقائق، وعند غياب اللقطات تُعلَّم fallbackClouds فيرسم redraw
             الغطاء السحابي الأبيض الناعم من Open-Meteo (cloud_cover) احتياطًا */
          if (kind === "satellite") {
            const fresh = !tk.meta || tk.meta.source !== "rainviewer" || Date.now() - (tk.meta.triedAt || 0) > 10 * 60e3;
            if (fresh) {
              tk.metaTriedAt = Date.now();
              try {
                const rvMeta = await rvTimedJson(RV_URL);
                tk.meta = { frames: TILE_DEF.satellite.frames(rvMeta), source: "rainviewer", triedAt: Date.now() };
              } catch (e) {
                tk.meta = tk.meta || { frames: [], source: "rainviewer", triedAt: Date.now() };
              }
              tk.fallbackClouds = !(tk.meta.frames && tk.meta.frames.length);
            }
            return tk.meta;
          }
          if (tk.meta && (tk.meta.frames.length || isGibsRain)) {
            /* v52: بديل GIBS للأمطار يعيد تجربة RainViewer كل 5 دقائق كي نعود
               للبث المتحرك فور توافره من جديد */
            const retryDue = Date.now() - tk.meta.triedAt > 5 * 60e3;
            if (kind === "rain" && isGibsRain && retryDue) {
              tk.meta.triedAt = Date.now();
              try {
                const meta = await rvTimedJson(RV_URL);
                const frames = TILE_DEF.rain.frames(meta);
                if (frames.length) {
                  tk.meta = { frames, source: "rainviewer" };
                  disableGibsRainLayer(); /* عاد RainViewer — تُزال طبقة GIBS فورًا */
                  syncTile("rain");
                }
              } catch (e) { /* نبقى على بديل GIBS حتى المحاولة التالية */ }
            }
            return tk.meta;
          }
          let meta = null;
          try {
            meta = await rvTimedJson(RV_URL); /* v52: مهلة انتظار 8 ثوانٍ بدل تعليق غير محدد */
          } catch (e) { meta = null; }
          const frames = meta ? TILE_DEF[kind].frames(meta) : [];
          if (kind === "rain" && !frames.length) {
            /* v52: رادار الأمطار — فشل أو تأخر RainViewer فوق 8 ثوانٍ → بديل GIBS
               تلقائي (أمطار IMERG ثم سحب VIIRS) فلا تظهر رسالة الفشل أبدًا */
            tk.meta = { frames: [], source: "gibs-rain", triedAt: Date.now() };
            enableGibsRainLayer();
          } else {
            tk.meta = { frames, source: "rainviewer" };
          }
          return tk.meta;
        }

        /* v64: حُذف حل تاريخ NASA GIBS مع انتقال القمر الصناعي إلى RainViewer IR الحي */

        function setPreStatus(stateName) {
          if (ui.pre) ui.pre.dataset.state = stateName;
        }

        function destroyTileLayer(kind) {
          const tk = S.tile[kind];
          if (!tk?.layer) return;
          clearTimeout(tk.fadeTimer);      /* v42: إلغاء أي تلاشي متقاطع معلق */
          tk.fadeTimer = 0;
          try { S.map.removeLayer(tk.layer); } catch (e) { /* أُزيلت مسبقًا */ }
          const entry = tk.preload.get(tk.shownPath);
          if (entry && entry.layer === tk.layer) { entry.layer = null; entry.ready = false; }
          tk.layer = null;
          tk.shownPath = null;
        }

        function destroyPreloadEntry(tk, entry) {
          if (entry?.layer && entry.layer !== tk.layer) {
            try { S.map.removeLayer(entry.layer); } catch (e) { /* تجاهل */ }
          }
          entry.layer = null;
          entry.ready = false;
        }

        function prunePreload(kind) {
          const tk = S.tile[kind];
          const protect = new Set([tk.target, tk.shownPath].filter(Boolean));
          const items = [...tk.preload.entries()].sort((a, b) => (b[1].time ?? 0) - (a[1].time ?? 0));
          let kept = 0;
          for (const [path, entry] of items) {
            if (protect.has(path)) continue;
            kept += 1;
            if (kept > PRELOAD_KEEP) { tk.preload.delete(path); destroyPreloadEntry(tk, entry); }
          }
        }

        function addPreloadLayer(kind, frame) {
          const tk = S.tile[kind];
          let entry = tk.preload.get(frame.path);
          if (entry?.layer) return entry;
          entry = entry || { path: frame.path, time: frame.time, layer: null, ready: false, failed: 0 };
          entry.time = frame.time;
          tk.preload.set(frame.path, entry);
          /* طبقة بلاطات مخفية تمامًا (شفافية صفر) للتحميل الصامت في ذاكرة المتصفح المؤقتة.
             المرحلة 9: zIndex لكل نوع — الأقمار (408) تحت الرادار (412) لتراكب Windy الدائم.
             ══ إصدار 39 — إصلاح حدود الرادار (Radar MaxZoom Fix) ══
             مصدر رادار RainViewer يتوقف عند الزووم 7: الطلبات الأصلية محصورة
             بـ maxNativeZoom: 7 حصرًا (تقييد صارم)، وأعلى من ذلك تمطط Leaflet
             بلاطات الزووم 7 وتنعّمها فوق الشوارع (Stretch & Smooth) بدل طلب
             مستويات أعلى غير مدعومة من السيرفر تظهر مربعات مكسورة أو فارغة.
             maxZoom يُبقى 19 كي تستمر الطبقة الممططة في «العرض» عند الزووم العميق
             داخل المدن (10+) — لو ضُبط 7 حرفيًا لاختفت طبقة الرادار كليًا فوق
             الزووم 7 لأن maxZoom في Leaflet حدّ عرضٍ لا حدّ طلبٍ. */
          entry.layer = L.tileLayer(TILE_DEF[kind].url(frame), {
            opacity: 0,
            /* أقصى تقريب أصلي: الرادار 7 صارمًا دائمًا، وGIBS يدويًا حتى 9، وبقية المصادر حسب النوع */
            maxNativeZoom: TILE_DEF[kind].maxNativeZoom, /* v64: حد طلب صارم لكل مصدر — وفوقه تمطيط محلي ناعم */
            maxZoom: 19,
            updateWhenIdle: false,
            keepBuffer: 2,
            zIndex: TILE_DEF[kind].zIndex,
            /* المرحلة 9: مصدر GIBS الاحتياطي يأخذ فلتر الجذب القوي (mx-sat-gibs) */
            className: TILE_DEF[kind].cls,
          });
          entry.layer.on("load", () => {
            entry.ready = true;
            if (tk.target === entry.path) promoteTileFrame(kind, frame, entry);
          });
          entry.layer.on("tileerror", () => {
            entry.failed += 1;
            /* v64: فشل بلاطات متكرر → احتياط الغطاء السحابي الأبيض الناعم (cloud_cover) */
            if (kind === "satellite" && entry.failed >= 8 && !tk.fallbackClouds) {
              tk.fallbackClouds = true;
              destroyTileLayer("satellite");
              syncTile("satellite");
            }
          });
          entry.layer.addTo(S.map);
          prunePreload(kind);
          return entry;
        }

        function promoteTileFrame(kind, frame, entry) {
          const tk = S.tile[kind];
          if (!entry?.ready || tk.target !== frame.path || !S.on[kind]) return;
          /* الإطار نفسه معروض بالفعل: لا داعي لإعادة الترقية (يمنع تدمير الطبقة الجارية) */
          if (tk.shownPath === frame.path && tk.layer === entry.layer) return;
          /* ══ v42: التلاشي المتقاطع (Crossfade) بدل الإخفاء الفجائي ══
             الإطار القديم يبقى ظاهرًا 240ms بعد ترقية الجديد، والجديد يتلاشى دخولًا
             فوقه (انتقال opacity على حاوية الطبقة عبر mxp-anim) — صفر وميض ولا
             فراغ أبيض عند التنقل بالشريط الزمني أو أثناء التشغيل التلقائي،
             وبعد انتهاء النافذة يُزال القديم كليًا لتحرير الذاكرة. */
          const oldLayer = tk.layer, oldPath = tk.shownPath;
          clearTimeout(tk.fadeTimer);
          tk.layer = entry.layer;            /* إعادة استخدام الطبقة المحمّلة مسبقًا دون تنزيل جديد */
          if (!tk.layer) return;             /* حماية إضافية ضد أي سباق في التبديل السريع */
          if (!S.playing) {
            /* خارج التشغيل نضيف كلاس الانتقال مؤقتًا حصرًا حول لحظة الترقية
               كي يبقى منزلق الشفافية العام فوريًا بلا أي تأخير محسوس */
            try { S.map.getContainer().classList.add("mxp-anim"); } catch (e) { /* خريطة غير مهيأة */ }
            clearTimeout(S.xfadeClsTimer);
            S.xfadeClsTimer = setTimeout(() => {
              try { S.map?.getContainer().classList.remove("mxp-anim"); } catch (e) { /* أُزيلت */ }
            }, MX_CROSSFADE_MS + 120);
          }
          tk.layer.setOpacity(S.opacity * TILE_DEF[kind].factor);   /* طبقة الطقس فقط */
          if (oldLayer && oldLayer !== entry.layer) {
            tk.fadeTimer = setTimeout(() => {
              try { S.map.removeLayer(oldLayer); } catch (e) { /* أُزيلت سلفًا */ }
              const oe = oldPath ? tk.preload.get(oldPath) : null;
              if (oe && oe.layer === oldLayer) { oe.layer = null; oe.ready = false; }
            }, MX_CROSSFADE_MS);
          }
          tk.shownPath = frame.path;
          tk.shown = true;
          /* v64: القمر الصناعي الحي ظهر فعليًا — إزالة كلاس احتياط السحاب الناعم */
          if (kind === "satellite") {
            tk.fbAnnounced = false;
            try { S.map.getContainer().classList.remove("mx-clouds-on"); } catch (e) {}
          }
          if (kind === "rain") {
            setPreStatus("ready");
            try { localStorage.setItem(RADAR_CACHE_KEY, JSON.stringify({ path: frame.path, time: frame.time, at: Date.now() })); } catch (e) {}
            /* الإصلاح ②: استئناف الحركة تلقائيًا بعد تغيير لوحة الألوان بمجرد جاهزية أول إطار */
            if (S.resumeAfterPalette) { S.resumeAfterPalette = false; setPlaying(true); }
          }
          updateLegend();
          queueRedraw();
        }

        /* مصفوفة تكرار خفية: تحميل الإطار التالي والسابق بصمت أثناء عرض الإطار الحالي */
        let silentPreloadTimer = 0;
        function scheduleSilentPreload(kind, frames, bestIdx) {
          clearTimeout(silentPreloadTimer);
          silentPreloadTimer = setTimeout(() => {
            if (!S.map || !S.on[kind]) return;
            [frames[bestIdx + 1], frames[bestIdx - 1]].forEach((f) => {
              if (f && !S.tile[kind].preload.get(f.path)?.layer) addPreloadLayer(kind, f);
            });
          }, 320);
        }

        /* ══ v42: التحميل المسبق العميق (Deep Pre-Buffering) ══
           عند فتح الخريطة (وبعد كل مزامنة) تُحمَّل كل إطارات الرادار/الأقمار
           مسبقًا في الخلفية كطبقات مخفية تمامًا (شفافية صفر) بإيقاع هادئ
           (إطار كل 340ms كي لا تخنق الشبكة ولا تزاحم طلبات الطقس الحيّة) —
           فيصبح زر التشغيل ▶ والسحب على الشريط الزمني بسلاسة الفيديو الفورية:
           أي إطار يُطلب يجد بلاطاته جاهزة في الذاكرة.
           تصميم «الدورة النشطة»: أثناء دورة تحميل جارية تتجاهل النداءات الجديدة
           (بدل إعادة جدولتها) كي لا يفسد استدعاء syncTile المتكرر أثناء التشغيل
           دورة التحميل، وبعد اكتمالها تبدأ دورة جديدة تلقائيًا عند أول نداء
           لالتقاط أي إطارات ظهرت حديثًا. */
        function ensureDeepBuffer(kind) {
          const tk = S.tile[kind];
          if (!S.map || !S.ready || !S.on[kind] || !tk.meta?.frames?.length) return;
          if (S.deepBuf[kind]) return;                     /* دورة جارية بالفعل */
          const frames = tk.meta.frames.filter((f, i, arr) => arr.findIndex((x) => x.path === f.path) === i);
          const pending = frames.filter((f) => !tk.preload.get(f.path)?.layer);
          if (!pending.length) return;
          let idx = 0;
          const step = () => {
            S.deepBuf[kind] = 0;
            if (!S.map || !S.on[kind] || !S.ready) return; /* أُلغيت (تدمير المحرك/إخفاء الطبقة) */
            /* تخطَّ الإطارات التي حُمّلت سلفًا (مثل الإطار المعروض الآن) */
            while (idx < pending.length && tk.preload.get(pending[idx].path)?.layer) idx += 1;
            if (idx < pending.length) {
              addPreloadLayer(kind, pending[idx]);
              idx += 1;
              S.deepBuf[kind] = setTimeout(step, 340);     /* أكمل بقية الدورة */
            }
            /* اكتملت الدورة: S.deepBuf[kind] صفر — النداء القادم يبدأ دورة جديدة */
          };
          S.deepBuf[kind] = setTimeout(step, 180);
        }

        function syncTile(kind) {
          const tk = S.tile[kind];
          if (!tk || !S.map) return;
          if (!S.on[kind]) { destroyTileLayer(kind); return; }
          /* الإصلاح ⑦: الرادار المرصود يقيس المطر قرب سطح الأرض فقط — عند اختيار
             مستوى ضغط علوي (950–300 hPa) نُخفي بلاطات الرادار كي لا يظهر طقس السطح
             فوق مستوى الطيران، ويعود تلقائيًا فور اختيار «سطح الأرض» */
          if (kind === "rain" && S.level !== "surface") { destroyTileLayer(kind); return; }
          /* ══ v64: القمر الصناعي — أحدث لقطة حية ثابتة (لقطة اليوم) بلا مطابقة
             زمنية مع الشريط، أو احتياط الغطاء السحابي الأبيض الناعم عند غيابها ══ */
          if (kind === "satellite") {
            if (!tk.meta) {
              loadTileMeta("satellite").then(() => { if (S.on.satellite) syncTile("satellite"); }).catch(() => {});
              return;
            }
            const sframes = tk.meta.frames ?? [];
            if (!sframes.length || tk.fallbackClouds) {
              destroyTileLayer("satellite");
              tk.shown = false;
              /* احتياط الغطاء السحابي الأبيض الناعم (cloud_cover) يرسمه redraw */
              try { S.map.getContainer().classList.add("mx-clouds-on"); } catch (e) {}
              if (!tk.fbAnnounced) {
                tk.fbAnnounced = true;
                setStatus(tr("لقطة القمر الصناعي غير متاحة الآن — يُعرض الغطاء السحابي الحي من النموذج"));
              }
              queueRedraw();
              return;
            }
            const frame = sframes[sframes.length - 1];
            tk.target = frame.path;
            const sentry = addPreloadLayer("satellite", frame);
            if (sentry.ready) promoteTileFrame("satellite", frame, sentry);
            scheduleSilentPreload("satellite", sframes, sframes.length - 1);
            ensureDeepBuffer("satellite");
            return;
          }
          /* v64: الرادار — غياب الإطارات (مصدر يحدّث قائمته) → إعادة محاولة كل 60 ثانية */
          if (!tk.meta || !tk.meta.frames.length) {
            const now = Date.now();
            if (!tk.metaTriedAt || now - tk.metaTriedAt > 60e3) {
              tk.metaTriedAt = now;
              loadTileMeta(kind).then(() => { if (S.on[kind]) syncTile(kind); }).catch(() => {});
            }
            return;
          }
          const T = posT(S.pos);
          const frames = tk.meta?.frames ?? [];
          let best = -1, bd = Infinity;
          frames.forEach((f, i) => {
            const d = Math.abs(f.time * 1000 - T);
            if (d < bd) { bd = d; best = i; }
          });
          /* الرادار كل ~10 دقائق: سماحية 45 دقيقة (بعدها كانفاس مطر النموذج) */
          const inRange = best >= 0 && bd <= 45 * 60e3;
          tk.shown = false;
          if (!inRange) {
            destroyTileLayer(kind);
            if (kind === "rain" && S.level === "surface" && S.cur) layerFillPaint("pr", RAIN_CLEAN, 1, 0.15);
            return;
          }
          const frame = frames[best];
          tk.target = frame.path;
          const entry = addPreloadLayer(kind, frame);
          if (entry.ready) {
            promoteTileFrame(kind, frame, entry);
          } else {
            /* لا ننقل الإطار الزمني على الخريطة إلا بعد اكتمال تحميله 100%؛
               الإطار السابق يظل معروضًا في الانتظار فلا يظهر أي فراغ */
            if (kind === "rain") {
              setPreStatus("loading");
              setStatus(tr("جاري تحميل إطار الرادار التالي…"));
            }
          }
          scheduleSilentPreload(kind, frames, best);
          /* v42: التحميل المسبق العميق — يبدأ مع أول مزامنة عند فتح الخريطة،
             ويعيد التعبئة تلقائيًا بعد اكتمال كل دورة (تصميم الدورة النشطة
             يحميه من إعادة الجدولة المتكررة أثناء التشغيل والسحب) */
          ensureDeepBuffer(kind);
        }

        function syncTiles() {
          syncTile("rain");
          syncTile("satellite");
        }

        /* انقطاع الشبكة: عرض آخر إطار رادار محفوظ محليًا إن وُجد */
        function offlineRadarFallback() {
          let saved = null;
          try { saved = JSON.parse(localStorage.getItem(RADAR_CACHE_KEY) || "null"); } catch (e) {}
          if (saved?.path && S.on.rain && S.map) {
            const tk = S.tile.rain;
            tk.target = saved.path;
            const entry = addPreloadLayer("rain", { path: saved.path, time: saved.time ?? 0 });
            if (entry.ready) promoteTileFrame("rain", { path: saved.path, time: saved.time }, entry);
            setStatus(tr("انقطع الاتصال بالشبكة — نعرض آخر رادار محفوظ محليًا."), true);
          } else {
            setStatus(tr("تعذّر الوصول لرادار الأمطار (الشبكة غير متاحة). سنحاول مجددًا تلقائيًا."), true);
          }
        }

        async function refreshTiles() {
          /* v65 (المرحلة الأولى): صفر طلبات رادار/أقمار دون طبقة بلاطات نشطة —
             الأساس النظيف وحده لا يحتاج أي بيانات لحظية */
          if (!S.on.rain && !S.on.satellite) { queueRedraw(); return; }
          let rainOk = true;
          try { await loadTileMeta("rain"); } catch (e) { rainOk = false; }
          /* المرحلة 9: قائمة إطارات الأقمار تُحمَّل دائمًا — تبقى جاهزة للمزامنة الفورية
             مع الرادار على نفس اللحظة الزمنية دون أي انتظار عند التشغيل */
          try { await loadTileMeta("satellite"); } catch (e) { /* تجاهل */ }
          if (rainOk) syncTiles();
          else offlineRadarFallback();
          /* v42: التحميل المسبق العميق — كل إطارات الرادار والأقمار تجلبها الخلفية
             بصمت بعد أول مزامنة كي يعمل التشغيل والسحب بلا أي انتظار */
          ensureDeepBuffer("rain");
          ensureDeepBuffer("satellite");
          queueRedraw();
        }

        /* المرحلة 9 — تغيير لوحة ألوان الرادار (RainViewer Color Scheme):
           تدمير كل طبقات الرادار المعروضة والمخبأة كليًا لأن عناوين بلاطاتها تغيّرت،
           ثم إعادة المزامنة فورًا بالإطار الحالي بلوحة الألوان الجديدة.
           المرحلة 12: منطق إعادة البناء نفسه صار دالة مشتركة تعيد استخدامها
           أزرار «تنعيم الألوان» و«عرض الثلج» لأنها تغيّر عنوان البلاطة كذلك */
        function rebuildRainTiles(reasonText) {
          const tk = S.tile.rain;
          /* الإصلاح ②: إيقاف الحركة مؤقتًا أثناء إعادة بناء طبقات الرادار
             الجديدة كي لا تنقطع الرحلة الزمنية، ثم استئنافها تلقائيًا مع أول إطار جاهز */
          S.resumeAfterPalette = S.playing;
          if (S.playing) setPlaying(false);
          destroyTileLayer("rain");
          [...tk.preload.values()].forEach((entry) => destroyPreloadEntry(tk, entry));
          tk.preload.clear();
          setStatus(tr(reasonText || "جاري إعادة تحميل الرادار بالإعدادات الجديدة…"));
          syncTile("rain");
          updateLegend();
        }

        /* v64: حُذف مبدّل لوحة ألوان الرادار — لوحة Universal Blue (2) القياسية الثابتة */

        /* المرحلة 12 — ضبط الرادار: سرعة الحركة + التنعيم + الثلج (مع حفظ التفضيل) */
        function setRadarSpeed(ms) {
          const v = Number(ms);
          if (!Number.isFinite(v) || v < 120 || v > 1200) return;
          S.frameMs = v;
          try { localStorage.setItem("matar:map:speed", String(v)); } catch (e) {}
          if (S.playing) { setPlaying(false); setPlaying(true); } // إعادة الجدولة بالسرعة الجديدة
        }

        function setRadarOption(key, on) {
          if (key !== "radarSmooth" && key !== "radarSnow") return;
          S[key] = !!on;
          try { localStorage.setItem(`matar:map:${key}`, S[key] ? "1" : "0"); } catch (e) {}
          $("#mx-smooth")?.setAttribute("aria-pressed", String(S.radarSmooth));
          $("#mx-snow")?.setAttribute("aria-pressed", String(S.radarSnow));
          rebuildRainTiles("جاري إعادة تحميل الرادار بالإعدادات الجديدة…");
        }

        /* إصدار 17: خطافات الاختبار الذاتي — رياضيات نافذة سفر الزمن */
        if (SELFTEST) window.__matarMapSimHooks = { PAST_H, TOTAL_H, nextPlayPos };

        /* v64: حُذفت طبقة الحرائق النشطة (NASA VIIRS) في التنظيف الجذري للطبقات */

/* ---------------- واجهة الخريطة: الخط الزمني والتفاعل ---------------- */
        const ui = {
          status: $("#mx-status"), legend: null,
          play: $("#mx-play"), range: $("#mx-range"), ticks: $("#mx-ticks"),
          /* إصدار 34: طبقة الأيام العربية + الفقاعة الزجاجية المنزلقة + شريط مقياس الملم
             إصدار 36: عناصر مقياس الألوان المدمج في الحاوية السفلية (وصف + تدرج + قيم) */
          days: $("#mx-days"), bubble: $("#mx-bubble"), scalebar: $("#mx-scalebar"),
          scaleCap: $("#mx-scale-cap"), scaleGrad: $("#mx-scale-grad"), scaleVals: $("#mx-scale-vals"),
          clock: $("#mx-clock"), rel: $("#mx-rel"), now: $("#mx-now"), opacity: $("#mx-opacity"),
          period: $("#mx-rain-period"), periodWrap: $("#mx-period-wrap"), alt: $("#mx-alt"),
          pre: $("#mx-pre"), opacityVal: $("#mx-opacity-val"),
          dock: $("#mx-dock"), dockToggle: $("#mx-dock-toggle"),
          /* المرحلة 9: زر ملء الشاشة + قائمة لوحة ألوان الرادار */
          zenBtn: $("#mx-zen-toggle"),
          /* إصدار 17: زر سفر عبر الزمن (24 ساعة قادمة) + عناصر التصويبة المركزية */
          futureBtn: $("#mx-future24"), crossBox: $("#mx-cross-box"), crosshair: $("#mx-crosshair"),
          /* إصدار 33: شارة «دقة الحي» في رأس الخريطة */
          zoomChip: $("#mx-zoom-chip"),
        };

        function setStatus(message, isError = false) {
          if (!ui.status) return;
          ui.status.textContent = message;
          ui.status.dataset.error = isError ? "true" : "false";
        }

        /* ══ v64: وضع الخط الزمني للرادار — آخر ساعتين + الآن + توقع ساعتين ══
           الدخول عند تفعيل طبقة الرادار: يعيد ارتساء النافذة الدقيقة (خطوة 5 دقائق)
           حول «الآن»، يبني علامات كل 30 دقيقة، ويقفز إلى اللحظة الحالية — والخروج
           عند اختيار أي طبقة أخرى يعيد الخط الساعي الكامل (24 ساعة + 3 أيام) */
        function rtNowPos() {
          return clamp(Math.round((Date.now() - S.rtT0) / RT_STEP_MS), 0, RT_LEN - 1);
        }
        function setRtMode(on, force = false) {
          const want = !!on && S.on.rain && S.ready;
          if (want === S.rtMode && !force) return;
          S.rtMode = want;
          try { document.getElementById("mx-bottom")?.classList.toggle("mx-rt", S.rtMode); } catch (e) {}
          const badge = document.getElementById("mx-live-badge");
          if (badge && !S.rtMode) badge.hidden = true;
          if (S.rtMode) {
            if (S.futureSim) setFutureSim(false); /* القفزات الساعية خارج نافذة ± ساعتين */
            S.rtT0 = Math.ceil((Date.now() - RT_SPAN_MS) / RT_STEP_MS) * RT_STEP_MS;
            if (ui.range) { ui.range.min = "0"; ui.range.max = String(RT_LEN - 1); }
            buildTicks();
            setPos(rtNowPos(), true);
          } else {
            /* العودة للخط الساعي الكامل: إعادة ارتساء الساعة وبناء علاماته وأيامها */
            resetClock();
            buildTicks();
          }
        }

        function resetClock() {
          const nowH = Math.floor(Date.now() / HOUR) * HOUR;
          S.start = nowH - PAST_H * HOUR;
          if (ui.range) { ui.range.min = "0"; ui.range.max = String(TOTAL_H - 1); }
          setPos(PAST_H, true);
        }

        function buildTicks() {
          if (!ui.ticks) return;
          ui.ticks.replaceChildren();
          /* ══ v64: وضع الرادار — علامات كل 30/60 دقيقة عبر نافذة ± ساعتين ══
             علامة «الآن» في المركز بالضبط، والأطراف بتثبيت داخلي كي لا تُقصّ */
          if (S.rtMode) {
            const fmt = placeDateFormatter({ hour: "2-digit", minute: "2-digit", hour12: false });
            const w = ui.ticks.clientWidth || ui.ticks.getBoundingClientRect().width || 320;
            const stepMin = w >= 300 ? 30 : 60;
            for (let m = -RT_SPAN_MIN; m <= RT_SPAN_MIN; m += stepMin) {
              const tick = document.createElement("span");
              tick.className = "mx-tick" + (m === 0 ? " mx-tick-now" : "");
              tick.style.left = `${((m + RT_SPAN_MIN) / (RT_SPAN_MIN * 2)) * 100}%`;
              tick.textContent = m === 0 ? tr("الآن") : fmt.format(new Date(Date.now() + m * 60e3));
              if (m === -RT_SPAN_MIN) tick.style.transform = "none";
              if (m >= RT_SPAN_MIN - stepMin + 1 && m !== 0) { tick.style.transform = "translateX(-100%)"; tick.style.borderLeft = "0"; }
              tick.dataset.p = String(Math.round((m + RT_SPAN_MIN) / 5));
              ui.ticks.append(tick);
            }
            if (ui.days) ui.days.replaceChildren();
            return;
          }
          /* إصدار 40: تكييف كثافة علامات الساعات مع عرض الحاوية ولغة الواجهة —
             التسميات الإنجليزية ("10:00" / "10:00 AM") أعرض من العربية فكانت تركب
             فوق بعضها على الشاشات الضيقة؛ نختار خطوة (6/12/18/24 ساعة) تضمن مساحة
             كافية بين كل تسميتين فلا تداخل مهما كانت اللغة أو عرض الشاشة */
          const fmt = placeDateFormatter({ hour: "2-digit", minute: "2-digit", hour12: false });
          const w = ui.ticks.clientWidth || ui.ticks.getBoundingClientRect().width || 320;
          const est = fmt.format(new Date(S.start || Date.now())).length * 6.6 + 9;
          let step = 6;
          while (step < 24 && Math.ceil(TOTAL_H / step) * est > w) step += 6;
          for (let p = 0; p < TOTAL_H; p += step) {
            const tick = document.createElement("span");
            tick.className = "mx-tick";
            const d = new Date(S.start + p * HOUR);
            tick.style.left = `${(p / (TOTAL_H - 1)) * 100}%`;
            tick.textContent = fmt.format(d);
            /* إصدار 40: تثبيت العلامتين الطرفيتين داخل حدود الحاوية كي لا يقصّهما
               التمرير الأفقي (الأولى بمحاذاة بدايتها والأخيرة بمحاذاة نهايتها) */
            if (p === 0) tick.style.transform = "none";
            if (p >= TOTAL_H - 1) { tick.style.transform = "translateX(-100%)"; tick.style.borderLeft = "0"; }
            /* إصدار 36: حفظ موضع العلامة كي تُضاء علامة الساعة النشطة في paintClock */
            tick.dataset.p = String(p);
            ui.ticks.append(tick);
          }
          const nowTick = document.createElement("span");
          nowTick.className = "mx-tick mx-tick-now";
          nowTick.style.left = `${(PAST_H / (TOTAL_H - 1)) * 100}%`;
          ui.ticks.append(nowTick);
          /* إصدار 34 — تقسيم عربي واضح لأيام الشريط الزمني بنمط Windy:
             اسم اليوم ورقمه (السبت 7، الأحد 8…) عند ظهر كل يوم على المحور،
             فيقرأ المستخدم التوقّع على مدار الأيام دون حساب ساعات */
          if (ui.days) {
            ui.days.replaceChildren();
            const seen = new Set();
            for (let p = 0; p < TOTAL_H; p += 1) {
              const d = new Date(S.start + p * HOUR);
              const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              if (d.getHours() !== 12 || seen.has(key)) continue;
              seen.add(key);
              const el = document.createElement("span");
              el.textContent = placeDateFormatter({ weekday: "long", day: "numeric" }).format(d);
              el.style.left = `${(p / (TOTAL_H - 1)) * 100}%`;
              /* إصدار 36: حفظ مفتاح اليوم كي تُضاء تسمية اليوم النشط في paintClock */
              el.dataset.key = key;
              ui.days.append(el);
            }
          }
        }

        function timeLabel(p) {
          const T = posT(Math.round(p));
          const d = new Date(T);
          if (S.rtMode) {
            /* v64: وضع الرادار — فرق بالدقائق (± ساعتين) مع وسم رصد/توقع */
            const diffMin = Math.round((T - Date.now()) / 60e3);
            return {
              clock: placeDateFormatter({ weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(d),
              rel: diffMin === 0 ? tr("الآن") : diffMin > 0 ? `${tr("بعد")} ${number(Math.abs(diffMin))} ${tr("دقيقة")}` : `${tr("قبل")} ${number(Math.abs(diffMin))} ${tr("دقيقة")}`,
              live: T <= Date.now(),
            };
          }
          const diffH = Math.round((T - Date.now()) / HOUR);
          return {
            clock: placeDateFormatter({ weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(d),
            rel: diffH === 0 ? tr("الآن") : diffH > 0 ? `${tr("بعد")} ${number(diffH)} ${tr("ساعة")}` : `${tr("قبل")} ${number(-diffH)} ${tr("ساعة")}`,
          };
        }

        function paintClock() {
          const { clock, rel } = timeLabel(S.pos);
          if (ui.clock) ui.clock.textContent = clock;
          if (ui.rel) ui.rel.textContent = rel;
          const curP = Math.round(S.pos);
          const maxP = S.rtMode ? RT_LEN - 1 : TOTAL_H - 1; /* v64: نطاق المنزلق حسب الوضع */
          if (ui.range) {
            ui.range.value = String(curP);
            /* إصلاح 35: تغذية تعبئة التدرج للمنزلق النحيف الجديد عبر متغير --mx-fill */
            ui.range.style.setProperty("--mx-fill", `${(curP / maxP) * 100}%`);
          }
          /* إصدار 36: الفقاعة الزجاجية المنزلقة — الساعة النشطة (مثل «5 م»)
             تتبع الإبهام فوق المسار وتنزلق معه بنعومة كفقاعة Windy */
          if (ui.bubble) {
            const bd = new Date(posT(curP));
            ui.bubble.textContent = placeDateFormatter({ hour: "numeric", minute: S.rtMode ? "2-digit" : undefined, hour12: true }).format(bd);
            ui.bubble.style.left = `${(curP / maxP) * 100}%`;
          }
          /* ══ v64: شارة «رصد حي» مقابل «توقع مستقبلي» في وضع الرادار (± ساعتين) ══ */
          const badge = document.getElementById("mx-live-badge");
          if (badge) {
            if (S.rtMode) {
              /* ضمن نصف خطوة (2.5 دقيقة) حول «الآن» يُعد رصدًا حيًا — النقطة المثبتة أصلًا */
              const live = posT(curP) <= Date.now() + RT_STEP_MS / 2;
              badge.hidden = false;
              badge.dataset.mode = live ? "live" : "fcst";
              badge.textContent = live ? tr("رصد حي") : tr("توقع مستقبلي");
            } else {
              badge.hidden = true;
            }
          }
          /* إصدار 36: إضاءة اليوم النشط — تسمية اليوم (السبت 7، الأحد 8…) التي تقع
             فيها الساعة المختارة تتحول للأصفر المضيء، وعلامة الساعة الأقرب (كل 6 ساعات)
             تتحول للأبيض الناصع — قراءة فورية للتوقيت النشط على المحور */
          if (ui.days) {
            const dd = new Date(posT(curP));
            const curKey = `${dd.getFullYear()}-${dd.getMonth()}-${dd.getDate()}`;
            ui.days.querySelectorAll("span").forEach((sp) => {
              sp.setAttribute("data-active", String(sp.dataset.key === curKey));
            });
          }
          if (ui.ticks) {
            let bestTick = null, bestDist = 4;
            ui.ticks.querySelectorAll(".mx-tick:not(.mx-tick-now)").forEach((tk) => {
              const dist = Math.abs(Number(tk.dataset.p || -99) - curP);
              if (dist < bestDist) { bestDist = dist; bestTick = tk; }
              tk.removeAttribute("data-active");
            });
            if (bestTick) bestTick.setAttribute("data-active", "true");
          }
          const ahead = curP - PAST_H;
          $$(".mx-jump").forEach((b) => b.setAttribute("data-active", String(Number(b.dataset.jump || 0) === ahead)));
        }

        function setPos(p, silent = false) {
          S.pos = clamp(p, 0, S.rtMode ? RT_LEN - 1 : TOTAL_H - 1); /* v64: حسب الوضع النشط */
          paintClock();
          if (silent) return;
          computeCur();
          syncTiles();
          updateLegend();
          queueRedraw();
        }

        let playTimer = 0;

        /* إصدار 17: الموضع التالي أثناء التشغيل — في وضع «24 ساعة قادمة» يلتف داخل
           نافذة المستقبل [الآن … +24]، وفي الوضع العادي يلفّ عبر الخط الزمني كله */
        function nextPlayPos(cur, futureSim = S.futureSim) {
          if (S.rtMode) return cur >= RT_LEN - 1 ? 0 : cur + 1; /* v64: الرادار يلف عبر ± ساعتين */
          if (futureSim) return cur >= PAST_H + 24 ? PAST_H : cur + 1;
          return cur >= TOTAL_H - 1 ? 0 : cur + 1;
        }

        function setPlaying(on) {
          S.playing = on;
          if (ui.play) { ui.play.textContent = on ? "⏸" : "▶"; ui.play.setAttribute("aria-label", on ? tr("إيقاف الحركة") : tr("تشغيل الحركة")); }
          clearInterval(playTimer);
          /* ===== v41: MX+ ميزة 10 — إلغاء حلقة rAF السابقة + تفعيل التلاشي المتقاطع
             (transition opacity 180ms على حاويات إطارات الرادار/السحب) أثناء الحركة فقط
             كي يبقى منزلق الشفافية فوريًا خارج التشغيل — شفافية على المركّب بلا layout thrashing ===== */
          cancelAnimationFrame(S.playRAF || 0);
          S.playRAF = 0;
          try { S.map?.getContainer().classList.toggle("mxp-anim", !!on); } catch (e) { /* خريطة غير مهيأة */ }
          if (on) {
            /* إصدار 17: في وضع سفر الزمن نبدأ من «الآن» حصرًا كي تجري المحاكاة على المستقبل */
            if (S.futureSim && (S.pos < PAST_H || S.pos > PAST_H + 24)) setPos(PAST_H, true);
            /* المرحلة 9: مزامنة الرادار والأقمار الصناعية قبل بدء الحركة — تحميل قائمتي
               الإطارات معًا في نفس الطلبين بحيث تظهر الطبقتان على نفس اللحظة الزمنية
               دون أي تأخير بينهما أثناء التشغيل */
            if (S.on.rain && S.on.satellite) setStatus(tr("جاري مزامنة الرادار والسحب على نفس اللحظة الزمنية…"));
            Promise.allSettled([loadTileMeta("rain"), loadTileMeta("satellite")]).then(() => { syncTiles(); });
            /* ===== v41: MX+ ميزة 10 — حلقة requestAnimationFrame مُجمِّعة بدل setInterval الخشن:
               نفس إيقاع S.frameMs لكن بتزامن مع إطارات العرض، فلا قفزات زمنية بين النبضات
               ولا تكدّس مؤقتات — والمنطق (nextPlayPos/سفر الزمن) كما هو دون أي تغيير ===== */
            let mxpLast = performance.now(), mxpAcc = 0;
            const mxpStep = (t) => {
              if (!S.playing) return;
              mxpAcc += t - mxpLast;
              mxpLast = t;
              const ms = Math.max(80, S.frameMs || 420);
              if (mxpAcc >= ms) { mxpAcc %= ms; try { setPos(nextPlayPos(S.pos)); } catch (e) { /* حماية */ } }
              S.playRAF = requestAnimationFrame(mxpStep);
            };
            mxpLast = performance.now();
            mxpAcc = 0;
            S.playRAF = requestAnimationFrame(mxpStep);
          }
        }

        /* إصدار 17 — سفر عبر الزمن (Time-Travel): محاكاة متحركة للساعات الـ 24 القادمة.
           قرب «الآن» تتحرك بلاطات الرادار الحية + إطارات Nowcast، وبعدها تتحرك حقول
           نموذج التوقعات (ECMWF/GFS) المرسومة على الكانفاس: المطر والسحب والرياح —
           نفس الخط الزمني لكن محصورًا حلقيًا في نافذة المستقبل القريبة. */
        function setFutureSim(on) {
          S.futureSim = !!on;
          ui.futureBtn?.setAttribute("aria-pressed", String(S.futureSim));
          if (S.futureSim) {
            setStatus(tr("سفر عبر الزمن: محاكاة الساعات الـ 24 القادمة — الرادار اللحظي قرب الآن ثم حقول نموذج التوقعات (ECMWF/GFS) للمستقبل."));
            setPos(PAST_H, false);
            if (!S.playing) setPlaying(true);
          } else {
            setStatus(tr("عودة إلى الخط الزمني الكامل: الرادار الحي + سجل 24 ساعة + توقعات 48 ساعة."));
            if (S.playing) setPlaying(false);
            setPos(PAST_H, false);
          }
        }

        /* ---------------- إصدار 17 — التصويبة المركزية (Crosshair Data) ----------------
           علامة + ثابتة في مركز الخريطة؛ عند توقف الحركة يُجلب طقس خفيف للنقطة المركزية
           (حرارة + احتمال مطر + رياح) ويظهر صندوق عائم دون أي نقرة — مع تخزين آخر نقطة
           لتفادي الطلبات المتكررة، وإلغاء الطلب السابق عند حركة جديدة. */
        let crossTimer = 0, crossAbort = null, crossLastKey = "";

        function hideCrossBox() {
          ui.crossBox?.classList.add("hidden");
        }

        function scheduleCrosshair() {
          if (!S.map || Eco.isEco() || !navigator.onLine) { hideCrossBox(); return; }
          clearTimeout(crossTimer);
          crossTimer = setTimeout(async () => {
            try {
              const c = S.map.getCenter();
              const lat = Math.round(c.lat * 100) / 100, lon = Math.round(c.lng * 100) / 100;
              const key = `${lat},${lon}`;
              if (key === crossLastKey && !ui.crossBox?.classList.contains("hidden")) return;
              crossLastKey = key;
              crossAbort?.abort();
              crossAbort = new AbortController();
              const url = new URL("https://api.open-meteo.com/v1/forecast");
              url.search = new URLSearchParams({
                latitude: String(lat), longitude: String(lon),
                current: "temperature_2m,weather_code,wind_speed_10m",
                hourly: "precipitation_probability", forecast_hours: "2", timezone: "auto",
              });
              const d = await getJson(url, crossAbort.signal);
              if (!ui.crossBox) return;
              const cur = d.current ?? {};
              const prob = d.hourly?.precipitation_probability?.[0];
              ui.crossBox.innerHTML = `
                <strong>${tempText(cur.temperature_2m)}</strong> · ${wmoDesc(cur.weather_code ?? 0)}<br>
                ${tf("💧 احتمال المطر {p}٪ · 💨 {w} كم/س", { p: localNum(prob), w: localNum(cur.wind_speed_10m) })}
                <span class="cb-sub">${lat.toFixed(2)}°, ${lon.toFixed(2)}°</span>`;
              ui.crossBox.classList.remove("hidden");
            } catch (e) {
              if (e?.name === "AbortError") return;
              hideCrossBox();
            }
          }, 620);
        }

        /* ============================================================
           إصدار 36 — مقياس ألوان الطبقة المدمج (Integrated Layer Color Scale)
           بدل مفتاح لوني يطفو في جانب الشاشة: شريط واحد نحيف داخل الحاوية
           السفلية تحت منزلق الوقت مباشرة، يتحدث تلقائيًا حسب الطبقة النشطة
           ذات الأولوية: التدرج يُبنى من مدرج ألوان الطبقة نفسه (نفس ألوان
           الحقول المرسومة والرادار) وكل رقم قياس يوضع بدقة فوق لونه،
           والوصف الصغير يحمل اسم الطبقة ووحدتها مترجمين بكل اللغات
           ============================================================ */
        function updateLegend() {
          if (!ui.scalebar) return;
          const active = Object.entries(S.on).filter(([, v]) => v).map(([k]) => k);
          if (!active.length) { ui.scalebar.hidden = true; return; }

          /* v64: أولوية الطبقات النقية الأربع — المطر أولًا ثم التراكم فالقمر فالرياح */
          const PRIORITY = ["rain", "accumulation", "satellite", "wind"];
          const key = PRIORITY.find((k) => active.includes(k));
          if (!key) { ui.scalebar.hidden = true; return; }
          const meta = LAYERS_META[key];

          /* مساعدات بناء الصف: وصف + تدرج + قيم موضوعة فوق ألوانها */
          const setScale = (cap, grad, vals) => {
            ui.scalebar.hidden = false;
            ui.scalebar.removeAttribute("data-mode");
            if (ui.scaleCap) ui.scaleCap.textContent = cap;
            if (ui.scaleGrad) ui.scaleGrad.style.background = grad;
            if (ui.scaleVals) {
              ui.scaleVals.replaceChildren();
              vals.forEach((v) => {
                const el = document.createElement("i");
                el.textContent = v.label;
                el.style.left = `${v.pct}%`;
                ui.scaleVals.append(el);
              });
            }
          };
          /* وضع الوصف فقط: طبقات بلا تدرج رقمي (القمر الصناعي) */
          const setCaptionOnly = (capHtml) => {
            ui.scalebar.hidden = false;
            ui.scalebar.setAttribute("data-mode", "caption");
            if (ui.scaleCap) ui.scaleCap.innerHTML = capHtml;
            if (ui.scaleGrad) ui.scaleGrad.style.background = "";
            if (ui.scaleVals) ui.scaleVals.replaceChildren();
          };
          const lvlTag = S.level !== "surface" ? ` · ${S.level} hPa` : "";

          if (key === "rain") {
            /* الإصلاح ⑦: عند مستوى ضغط علوي نوضح أن الرادار والمطر السطحيين مخفيان */
            if (S.level !== "surface") {
              setCaptionOnly(tr("المطر والرادار — مخفيان عند هذا الارتفاع"));
              return;
            }
            const cap = `${S.tile.rain.shown ? tr("رادار الأمطار المرصود") : tr("توقعات المطر (نموذج)")} · ${tr("مم/س")}`;
            /* v64: مفتاح لوني قياسي واضح — 0.2 | 2 | 5 | 15+ مم/س
               (أزرق سماوي للخفيف ← أخضر للمتوسط ← أصفر للغزير ← أحمر للعاصف) */
            setScale(
              cap,
              rampCss(RAIN_CLEAN, 0, 15),
              [
                { pct: (0.2 / 15) * 100, label: number(0.2, 1) },
                { pct: (2 / 15) * 100, label: number(2) },
                { pct: (5 / 15) * 100, label: number(5) },
                { pct: 100, label: `${number(15)}+` },
              ],
            );
            return;
          }
          if (key === "satellite") {
            setCaptionOnly(`🛰 ${tr("قمر السحب الصناعي الحي · RainViewer IR · لقطة اليوم")}`);
            return;
          }
          if (key === "wind") {
            /* مقياس الرياح: 8 قطاعات ملونة بألوان التيارات الحية نفسها وسرعاتها عند الحدود */
            const segs = WIND_COLORS.map((c, i) => `${c} ${(i / WIND_COLORS.length) * 100}%, ${c} ${((i + 1) / WIND_COLORS.length) * 100}%`).join(", ");
            setScale(
              `${tr(meta.name)}${lvlTag} · ${tr("كم/س")}`,
              `linear-gradient(90deg, ${segs})`,
              WIND_SPEEDS.map((s, i) => ({ pct: (i / WIND_SPEEDS.length) * 100, label: i === WIND_SPEEDS.length - 1 ? `${s}+` : String(s) })),
            );
            return;
          }
          /* 💧 تراكم الأمطار الحقيقي — مفتاح 0.2 | 2 | 5 | 15+ مم */
          setScale(
            `${tr(meta.name)} · ${S.accumulationHours === 72 ? tr("3 أيام قادمة") : tr("24 ساعة قادمة")} · ${tr("مم")}`,
            rampCss(ACCUM_CLEAN, 0, 15),
            [
              { pct: (0.2 / 15) * 100, label: number(0.2, 1) },
              { pct: (2 / 15) * 100, label: number(2) },
              { pct: (5 / 15) * 100, label: number(5) },
              { pct: 100, label: `${number(15)}+` },
            ],
          );
        }

                /* فتح/طي اللوحة الجانبية — انزلاق بتسريع عتادي مع حفظ التفضيل */
        function applyDock(open, persist = true) {
          S.dockOpen = !!open;
          ui.dock?.classList.toggle("collapsed", !S.dockOpen);
          ui.dockToggle?.setAttribute("aria-expanded", String(S.dockOpen));
          if (persist) { try { localStorage.setItem("matar:map:dock", S.dockOpen ? "1" : "0"); } catch (e) {} }
        }

        /* ---------------- المرحلة 9 — وضع ملء الشاشة بنمط Windy (Windy Zen) ----------------
           v67 (الإصلاح النهائي): بدل الاعتماد على وضع html.wx-zen الذي كان يُخفي
           حاوية الخريطة كليًا على الهواتف، يبدّل الزر فئة CSS واحدة (is-map-fullscreen)
           على حاوية الخريطة الكبرى (.map-stage) نفسها — فتصبح position: fixed بملء
           نافذة العرض (100vw × 100dvh · z-index: 9999 · خلفية #070d19) وتبقى لوحة
           الطبقات والشريط السفلي وزر الإغلاق × ظاهرين فوقها بوضوح لأنها كلها أبناء
           الحاوية — مع map.invalidateSize() فورًا ثم بعد 150ms كي لا تتشوّه البلاطات،
           وزر ESC ينهي الوضع كما هو. */
        function setZen(on) {
          if (!S.ready || !S.map) return;
          S.zen = !!on;
          const stage = document.querySelector(".map-stage");
          stage?.classList.toggle("is-map-fullscreen", S.zen);
          document.documentElement.classList.toggle("mx-fs-lock", S.zen);
          const label = tr(S.zen ? "إنهاء ملء الشاشة" : "ملء الشاشة بنمط Windy");
          ui.zenBtn?.setAttribute("aria-pressed", String(S.zen));
          ui.zenBtn?.setAttribute("title", label);
          ui.zenBtn?.setAttribute("aria-label", label);
          /* إبطال المقاس مرتين: مرة مباشرة ومرة بعد 150ms (v67) — يضمن بلاطات سليمة 100% */
          requestAnimationFrame(() => {
            S.map.invalidateSize({ animate: false });
            layoutCanvases();
            queueRedraw();
          });
          setTimeout(() => {
            S.map.invalidateSize({ animate: false });
            layoutCanvases();
            queueRedraw();
            ensureSoon();
          }, 150);
        }

        /* عزل الشفافية: طبقات الطقس النشطة فقط (tileLayer.setOpacity + globalAlpha للكانفاس)
           — لا تُلمس شفافية حاوية الخريطة أو بلاطات الأساس مطلقًا */
        function setWeatherOpacity(value) {
          S.opacity = clamp(Number(value) / 100, 0.1, 1);
          if (ui.opacity) ui.opacity.value = String(Math.round(S.opacity * 100));
          if (ui.opacityVal) ui.opacityVal.textContent = `${Math.round(S.opacity * 100)}٪`;
          ["rain", "satellite"].forEach((kind) => {
            const tk = S.tile?.[kind];
            if (tk?.layer) tk.layer.setOpacity(S.opacity * TILE_DEF[kind].factor);
          });
          queueRedraw();
        }

        /* المرحلة 7 — تثبيت الطبقات (Windy Pin): قائمة سريعة أعلى اللوحة */
        const PINS_KEY = "matar:map:pins";
        let suppressNextClick = false;

        function loadPins() {
          try { S.pins = (JSON.parse(localStorage.getItem(PINS_KEY) || "[]") || []).filter((k) => LAYERS_META[k]); } catch (e) { S.pins = []; }
          renderPins();
        }

        function togglePin(key) {
          if (!key || !LAYERS_META[key]) return;
          const i = S.pins.indexOf(key);
          if (i >= 0) S.pins.splice(i, 1); else S.pins.push(key);
          try { localStorage.setItem(PINS_KEY, JSON.stringify(S.pins)); } catch (e) {}
          renderPins();
        }

        function renderPins() {
          const grid = $("#mx-pins-grid"), sec = $("#mx-pins-sec");
          if (!grid || !sec) return;
          grid.replaceChildren();
          const valid = S.pins.filter((k) => LAYERS_META[k]);
          sec.classList.toggle("hidden", !valid.length);
          valid.forEach((key) => {
            const src = $(`.mx-layer[data-layer="${key}"]`, ui.dock || document);
            if (!src) return;
            grid.appendChild(src.cloneNode(true));
          });
          $$(".mx-layer").forEach((b) => b.setAttribute("data-pinned", String(S.pins.includes(b.dataset.layer))));
        }

        function toggleLayer(key) {
          if (!key || !(key in S.on)) return;
          const wasOn = !!S.on[key];
          const switchedOff = [];
          /* ══ v64: الحصرية الكاملة (4 Clean Exclusive Layers) ══
             اختيار أي طبقة يُغلق الطبقة السابقة تلقائيًا — طبقة واحدة صافية
             نقية في كل مرة بشفافية 0.68 الموحدة فلا ألوان متداخلة أبدًا */
          if (!wasOn) {
            Object.keys(S.on).forEach((k) => {
              if (k !== key && S.on[k]) { S.on[k] = false; switchedOff.push(k); }
            });
          }
          S.on[key] = !wasOn;
          $$(".mx-layer").forEach((b) => b.setAttribute("aria-pressed", String(Boolean(S.on[b.dataset.layer]))));
          ui.periodWrap?.classList.toggle("hidden", !S.on.accumulation);
          /* إدارة الذاكرة: إيقاف أي طبقة بلاطات يدمّر طبقتها من المحرك تمامًا */
          (wasOn ? [key] : switchedOff).forEach((k) => {
            if ((k === "rain" || k === "satellite") && !S.on[k]) destroyTileLayer(k);
          });
          /* v64: احتياط السحاب الناعم يُرفع إلا إذا احتاجه القمر الصناعي فعليًا */
          try { S.map?.getContainer()?.classList.remove("mx-clouds-on"); } catch (e) {}
          if (S.on[key] && key === "rain") refreshTiles();
          if (S.on[key] && key === "satellite") {
            /* v64: loadTileMeta وحده يملك علم الاحتياط (fallbackClouds) حسب توافر لقطات اليوم */
            loadTileMeta("satellite").then(() => { if (S.on.satellite) syncTile("satellite"); }).catch(() => {});
          }
          /* v64: وضع الخط الزمني — رادار = ± ساعتين بالدقائق، غيره = الساعي الكامل */
          setRtMode(S.on.rain);
          ensureSoon();
          computeCur();
          syncTiles();
          updateLegend();
          queueRedraw();
        }

        function wireUI() {
          ui.play?.addEventListener("click", () => setPlaying(!S.playing));
          ui.range?.addEventListener("input", () => { setPlaying(false); setPos(Number(ui.range.value)); });
          /* إصدار 17: زر سفر عبر الزمن — يبدّل وضع المحاكاة الحلقية للساعات الـ 24 القادمة */
          ui.futureBtn?.addEventListener("click", () => setFutureSim(!S.futureSim));
          /* القفزات الزمنية السريعة: الآن، +3، +6، +12، +24 ساعة (زر «24 ساعة قادمة» مستثنى — له سلوك المحاكاة) */
          $$(".mx-jump:not(#mx-future24)").forEach((btn) => btn.addEventListener("click", () => {
            setPlaying(false);
            setPos(PAST_H + Number(btn.dataset.jump || 0));
          }));
          ui.opacity?.addEventListener("input", () => setWeatherOpacity(ui.opacity.value));
          ui.period?.addEventListener("change", () => {
            S.accumulationHours = Number(ui.period.value) || 24; /* v63: نافذة أمامية */
            computeCur();
            updateLegend();
            queueRedraw();
          });
          /* المرحلة 7: منزلق الارتفاع (مستويات الضغط) — يعيد جلب نموذج الرياح/الحرارة للمستوى المختار */
          ui.alt?.addEventListener("change", () => {
            S.level = ui.alt.value || "surface";
            S.models = {};
            setStatus(tr("جاري تحميل بيانات الارتفاع المختار…"));
            computeCur();
            /* الإصلاح ⑦: إعادة مزامنة فورية لبلاطات الرادار — تُخفى عند المستويات العلوية
               (الرادار المرصود يقيس المطر قرب سطح الأرض فقط) وتعود عند العودة لسطح الأرض */
            syncTiles();
            if (S.level !== "surface") setStatus(tr("الرادار السطحي مخفي عند هذا المستوى — يعود تلقائيًا عند اختيار سطح الأرض"));
            updateLegend();
            queueRedraw();
            ensureSoon();
          });
          ui.dockToggle?.addEventListener("click", () => applyDock(!S.dockOpen));

          /* ---------------- إصدار 34: زر البحث العائم الدائري ----------------
             يخرج من وضع ملء الشاشة إن كان مفعّلًا ثم يُركّز حقل البحث الرئيسي —
             نفس سلوك عدسة Windy العائمة دون أي حاوية نصية فوق الخريطة */
          $("#mx-search-btn")?.addEventListener("click", () => {
            try { if (S.zen) setZen(false); } catch (e) {}
            setTimeout(() => {
              try {
                const inp = $("#search-input");
                inp?.scrollIntoView({ behavior: "smooth", block: "center" });
                inp?.focus({ preventScroll: true });
              } catch (e) {}
            }, 90);
          });

          /* ---------------- إصدار 25: أيقونة الإرشادات العائمة (i) ----------------
             نافذة منبثقة عند الطلب فقط — بديل بلوك الإرشادات المحذوف من اللوحة.
             تُغلق بالنقر خارجها أو بمفتاح Escape أو بزر «فهمت» — والعائد للتركيز زر الفتح */
          const infoBtn = $("#mx-info-btn"), infoPop = $("#mx-info-pop"), infoClose = $("#mx-info-close");
          function setInfoPop(open) {
            if (!infoBtn || !infoPop) return;
            infoPop.hidden = !open;
            infoBtn.setAttribute("aria-expanded", String(open));
          }
          infoBtn?.addEventListener("click", (e) => { e.stopPropagation(); setInfoPop(infoPop.hidden); });
          infoClose?.addEventListener("click", () => { setInfoPop(false); try { infoBtn.focus({ preventScroll: true }); } catch (err) {} });
          document.addEventListener("click", (e) => {
            if (!infoPop || infoPop.hidden) return;
            if (!e.target.closest?.("#mx-info-pop, #mx-info-btn")) setInfoPop(false);
          });
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && infoPop && !infoPop.hidden) { setInfoPop(false); try { infoBtn.focus({ preventScroll: true }); } catch (err) {} }
          });

          /* ---------------- إصدار 25: مقبض اللوحة السفلية على الهواتف ----------------
             نقرة قصيرة تُبدّل الفتح/الإغلاق، وسحب لأسفل (أو لأعلى) يطوي/يفتح اللوحة
             بانزلاق سلس — مقصور على المقبض نفسه كي لا يتعارض مع تمرير محتوى اللوحة */
          const sheetHandle = ui.dock?.querySelector(".mx-sheet-handle");
          if (sheetHandle) {
            let sy = 0, swipeLive = false;
            sheetHandle.addEventListener("pointerdown", (e) => {
              swipeLive = true;
              sy = e.clientY;
              try { sheetHandle.setPointerCapture(e.pointerId); } catch (err) {}
            });
            sheetHandle.addEventListener("pointermove", (e) => {
              if (!swipeLive) return;
              const dy = e.clientY - sy;
              if (dy > 64) { swipeLive = false; applyDock(false); }
              else if (dy < -44) { swipeLive = false; applyDock(true); }
            });
            const endSwipe = (e) => {
              if (!swipeLive) return;
              swipeLive = false;
              if (Math.abs((e.clientY || sy) - sy) < 10) applyDock(!S.dockOpen); /* نقرة = تبديل */
            };
            sheetHandle.addEventListener("pointerup", endSwipe);
            sheetHandle.addEventListener("pointercancel", endSwipe);
          }

          /* المرحلة 9: زر ملء الشاشة + زر ESC للخروج من ملء الشاشة
             (v64: حُذف مستمع لوحة ألوان الرادار مع حذف اللوحات كلها) */
          ui.zenBtn?.addEventListener("click", () => setZen(!S.zen));
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S.zen) setZen(false); });
          /* المرحلة 12: أدوات ضبط الرادار — السرعة والتنعيم والثلج */
          $("#mx-speed")?.addEventListener("change", (e) => setRadarSpeed(e.target.value));
          $("#mx-smooth")?.addEventListener("click", (e) => setRadarOption("radarSmooth", e.currentTarget.getAttribute("aria-pressed") !== "true"));
          $("#mx-snow")?.addEventListener("click", (e) => setRadarOption("radarSnow", e.currentTarget.getAttribute("aria-pressed") !== "true"));
          /* المرحلة 7: تفويض النقر على الطبقات — يغطي الأزرار الأصلية ونسخها المثبتة أعلى اللوحة */
          ui.dock?.addEventListener("click", (e) => {
            const btn = e.target.closest?.(".mx-layer");
            if (!btn) return;
            if (suppressNextClick) { suppressNextClick = false; return; }
            toggleLayer(btn.dataset.layer);
          });
          /* الضغطة المطولة (أو النقر الأيمن، أو مفتاح القائمة / Shift+F10 بلوحة المفاتيح — المرحلة 11) تثبّت/تفكّ تثبيت الطبقة — نظام Windy Pin */
          let pressTimer = 0, pressStart = null;
          ui.dock?.addEventListener("pointerdown", (e) => {
            const btn = e.target.closest?.(".mx-layer");
            if (!btn) return;
            pressStart = { x: e.clientX, y: e.clientY, key: btn.dataset.layer };
            clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
              pressTimer = 0;
              suppressNextClick = true;
              togglePin(pressStart?.key);
            }, 550);
          });
          const cancelPress = (e) => {
            if (pressTimer && pressStart && e?.type === "pointermove") {
              if (Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) < 12) return;
            }
            clearTimeout(pressTimer);
            pressTimer = 0;
          };
          ["pointerup", "pointercancel", "pointerleave", "pointermove"].forEach((ev) => ui.dock?.addEventListener(ev, cancelPress));
          ui.dock?.addEventListener("contextmenu", (e) => {
            const btn = e.target.closest?.(".mx-layer");
            if (!btn) return;
            e.preventDefault();
            togglePin(btn.dataset.layer);
          });
          /* المرحلة 11 — إغلاق W-04: مكافئ لوحة مفاتيح لإيماءة التثبيت (Windy Pin).
             مفتاح قائمة السياق (ContextMenu) أو Shift+F10 وأي زر طبقة بالتركيز يبدّل تثبيتها —
             تفويض على اللوحة يشمل نسخ الطبقات المثبتة أعلى اللوحة، والاختصار معلن
             على كل زر عبر aria-keyshortcuts ليصله مستخدمو قارئات الشاشة أيضًا. */
          ui.dock?.addEventListener("keydown", (e) => {
            const isMenuKey = e.key === "ContextMenu";
            const isShiftF10 = e.shiftKey && e.key === "F10";
            if (!isMenuKey && !isShiftF10) return;
            const btn = e.target.closest?.(".mx-layer");
            if (!btn) return;
            e.preventDefault();
            togglePin(btn.dataset.layer);
          });
          $$(".mx-models button").forEach((btn) => {
            btn.addEventListener("click", () => {
              S.model = btn.dataset.model;
              $$(".mx-models button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
              S.models = {};
              setStatus(tr("جاري تحميل بيانات النموذج المحدد…"));
              ensureSoon();
            });
          });
          /* v64: إغلاق شريط التوقعات — النقرة الواحدة والضغط المطوّل 500ms
             كلاهما يفتحانه مباشرة (بطاقة نقطة التفتيش حُذفت) */
          $("#mxmg-close")?.addEventListener("click", meteoClose);
          meteoBindScroll();
          document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            const bar = meteoBar();
            if (bar && !bar.classList.contains("hidden")) meteoClose();
          });
          loadPins();

          /* المرحلة 12: استعادة إعدادات ضبط الرادار المحفوظة (السرعة + التنعيم + الثلج) */
          try {
            const rawSpeed = Number(localStorage.getItem("matar:map:speed"));
            if (Number.isFinite(rawSpeed) && rawSpeed >= 120 && rawSpeed <= 1200) {
              S.frameMs = rawSpeed;
              const speedSel = $("#mx-speed");
              if (speedSel && [...speedSel.options].some((o) => o.value === String(rawSpeed))) speedSel.value = String(rawSpeed);
            }
          } catch (e) {}
          try {
            S.radarSmooth = localStorage.getItem("matar:map:radarSmooth") !== "0";
            S.radarSnow = localStorage.getItem("matar:map:radarSnow") !== "0";
          } catch (e) {}
          $("#mx-smooth")?.setAttribute("aria-pressed", String(S.radarSmooth));
          $("#mx-snow")?.setAttribute("aria-pressed", String(S.radarSnow));
        }

        /* نافذة النقر المنبثقة: قراءة الطقس في أي نقطة */
        /* ══ v42: الدبوس النابض — علامة دائرية متوهجة عند كل نقطة فحص ══
           تُنشأ عند النقر وتُزال عند إغلاق البطاقة أو النقر على نقطة أخرى */
        function setClickPin(latlng) {
          removeClickPin();
          S.clickPin = L.marker(latlng, {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
              className: "",
              html: '<div class="mx-pin"><span class="mx-pin-ring"></span><span class="mx-pin-ring2"></span><span class="mx-pin-core"></span></div>',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          }).addTo(S.map);
        }
        function removeClickPin() {
          if (S.clickPin && S.map) { try { S.map.removeLayer(S.clickPin); } catch (e) { /* أُزيلت */ } }
          S.clickPin = null;
        }

        /* v42: اسم المنطقة للنقطة المفحوصة — جلب عكسي خفيف من Photon (بدل الإحداثيات
           الجافة): اسم المدينة/القرية + المحافظة + الدولة بالعربية عند توافرها،
           والفشل صامت (تبقى الإحداثيات وحدها) */
        async function mxpRegionName(lat, lng, signal) {
          try {
            const url = new URL("https://photon.komoot.io/reverse");
            /* Photon يدعم اللغات en/fr/de حصرًا — العربية (وبقية اللغات) تُطلب
               بوضع default الذي يعيد الأسماء المحلية (عربية داخل مصر والعالم العربي) */
            const uiLang = (document.documentElement.lang || "ar").slice(0, 2).toLowerCase();
            const phLang = ["en", "fr", "de"].includes(uiLang) ? uiLang : "default";
            url.search = new URLSearchParams({ lat: String(lat), lon: String(lng), lang: phLang });
            const d = await getJson(url, signal);
            const p = d?.features?.[0]?.properties ?? {};
            const name = p.city || p.town || p.village || p.county || p.name || p.locality || "";
            const region = p.state || p.region || "";
            const country = p.country || "";
            return palestineFixText([name, region, country].filter(Boolean).join("، ")) || "";
          } catch (e) { return ""; }
        }

        async function onMapClick(e) {
          if (!S.ready) return;
          /* v63: ابتلاع نقرة ما بعد الضغط المطوّل كي لا تُفتح نقرتان معًا */
          if (S.lpSuppressClick) { S.lpSuppressClick = false; return; }
          const { lat, lng } = e.latlng;
          /* ══ v65: النقرة الواحدة — تمامًا كالضغط المطوّل 500ms — تضع الدبوس
             الدائري النابض وتفتح شريط توقعات Windy السفلي (10 أيام × كل 3 ساعات)
             مباشرة من Open-Meteo: اليوم والساعة + الأيقونة + الحرارة + مطر
             المليمتر + الرياح بسهم الاتجاه الفعلي ══ */
          meteoOpen(lat, lng);
        }

        /* ══════════════════════════════════════════════════════════════════════
           ══ إصدار 65: شريط توقعات Windy السفلي (10-Day Meteogram) ══
           الضغط المطوّل 500ms (لمسًا أو ماوسًا) على أي نقطة بالخريطة — أو نقرة
           واحدة — يضع دبوسًا دائريًا نابضًا ويجلب توقعات Open-Meteo
           (forecast_days=10) ثم يفتح شريطًا سفليًا احترافيًا قابلًا للتمرير
           الأفقي: 10 أيام متتالية مقسمة كل 3 ساعات (00 03 06 09 12 15
           18 21) في صفوف منظمة — اسم اليوم والساعة + أيقونة الحالة،
           الحرارة داخل شريط لوني متدرج (tabular-nums)، كمية المطر بالمليمتر
           بالأزرق عند وجوده، وسرعة الرياح بسهم الاتجاه الفعلي — مع زر
           إغلاق × أنيق في زاوية الشريط.
           ══════════════════════════════════════════════════════════════════════ */
        const MG = { lat: null, lng: null, abort: null, times: [], pitch: 51, origin: 0, syncing: false };

        function meteoBar() { return $("#mx-meteo"); }

        /* إخفاء صامت — تستدعيه نقرة خريطة جديدة أو تدمير المحرك (بلا لمس الدبوس) */
        function meteoDismiss() {
          try { MG.abort?.abort(); } catch (e) {}
          MG.abort = null;
          MG.times = [];
          meteoBar()?.classList.add("hidden");
        }

        /* الإغلاق الكامل من زر × أو Escape — يزيل الدبوس النابض أيضًا */
        function meteoClose() {
          meteoDismiss();
          removeClickPin();
        }

        function meteoHourToPos(tMs) {
          return clamp(PAST_H + Math.round((tMs - Date.now()) / HOUR), 0, TOTAL_H - 1);
        }

        function meteoOpen(lat, lng) {
          if (!S.ready || !S.map) return;
          MG.lat = lat; MG.lng = lng;
          MG.times = [];
          /* v64: دبوس دائري نابض عند النقطة (بطاقة النقطة حُذفت — الشريط وحده) */
          setClickPin([lat, lng]);
          const bar = meteoBar();
          if (!bar) return;
          /* v63: يرتفع الشريط فوق الحاوية السفلية (الخط الزمني + مقياس الألوان)
             بمقدار ارتفاعها الفعلي المقيس لحظة الفتح — فلا يغطي أسماء الأيام
             ولا منزلق الوقت على أي مقاس شاشة أو وضع مقياس، وينطلق بجانب لوحة
             الطبقات الجانبية إن كانت مفتوحة (سطح المكتب) فلا يتراكب معها */
          try {
            const bt = document.getElementById("mx-bottom");
            if (bt) bar.style.bottom = `${Math.round(bt.getBoundingClientRect().height) + 20}px`;
            const dock = document.getElementById("mx-dock");
            const dockClear = dock && !dock.classList.contains("collapsed") && getComputedStyle(dock).position === "absolute" && dock.getBoundingClientRect().height > 220;
            bar.style.insetInlineStart = dockClear ? `${Math.round(dock.getBoundingClientRect().width + 26)}px` : "";
          } catch (e) { /* يبقى موضع CSS الاحتياطي */ }
          bar.classList.remove("hidden");
          const scroll = $("#mxmg-scroll");
          if (scroll) scroll.textContent = "";
          const tEl = $("#mxmg-title");
          if (tEl) tEl.textContent = `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
          const sEl = $("#mxmg-sub");
          if (sEl) sEl.textContent = tr("جاري تحميل توقعات 10 أيام…");
          MG.abort?.abort();
          MG.abort = new AbortController();
          const signal = MG.abort.signal;
          mxpRegionName(lat, lng, signal).then((name) => {
            if (MG.lat !== lat || MG.lng !== lng || !name) return;
            const el = $("#mxmg-sub");
            if (el && !meteoBar()?.classList.contains("hidden")) el.textContent = name;
          }).catch(() => {});
          (async () => {
            try {
              const url = new URL("https://api.open-meteo.com/v1/forecast");
              url.search = new URLSearchParams({
                latitude: lat.toFixed(4), longitude: lng.toFixed(4),
                hourly: "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day",
                forecast_days: "10", timezone: "auto", wind_speed_unit: "kmh", /* v65: 10 أيام × كل 3 ساعات */
              });
              const data = await getJson(url, signal);
              if (MG.lat !== lat || MG.lng !== lng) return;
              meteoRender(data);
            } catch (error) {
              if (error.name === "AbortError") return;
              const el = $("#mxmg-sub");
              if (el) el.textContent = tr("تعذّر تحميل توقعات هذه النقطة. حاول مرة أخرى.");
            }
          })();
        }

        function meteoRender(data) {
          const scroll = $("#mxmg-scroll");
          const h = data?.hourly;
          const failMsg = () => {
            const el = $("#mxmg-sub");
            if (el) el.textContent = tr("تعذّر تحميل توقعات هذه النقطة. حاول مرة أخرى.");
          };
          if (!scroll || !h?.time?.length) { failMsg(); return; }
          scroll.textContent = "";
          /* الأزمنة محلية للنقطة (timezone=auto) — نحسب الحقبة الفعلية من الإزاحة */
          const offset = (Number(data.utc_offset_seconds) || 0) * 1000;
          const times = h.time.map((t) => ({ s: t, ms: Date.parse(`${t}:00Z`) - offset }));
          const now = Date.now();
          /* البداية: منتصف ليل اليوم المحلي للنقطة (00:00) — 10 أيام × 8 أعمدة */
          let day0 = times.findIndex((x) => x.s.endsWith("T00:00:00"));
          if (day0 < 0) day0 = 0;
          const cols = [];
          for (let i = day0; i < times.length && cols.length < 80; i += 3) {
            const hr = Number(times[i].s.slice(11, 13));
            if (hr % 3 !== 0) continue;
            cols.push({ i, x: times[i], day: Math.floor((i - day0) / 24) });
          }
          if (!cols.length) { failMsg(); return; }
          MG.times = cols.map((c) => c.x.ms);
          const dayFmt = new Intl.DateTimeFormat(activeLocale(), { weekday: "long", day: "numeric", month: "short" });
          const hourFmt = new Intl.DateTimeFormat(activeLocale(), { hour: "2-digit", hour12: false });
          const days = Array.from({ length: 10 }, () => []); /* v65: 10 أيام */
          cols.forEach((c) => { if (days[c.day]) days[c.day].push(c); });
          const rgb = [0, 0, 0, 0];
          const frag = document.createDocumentFragment();
          let firstColEl = null;
          days.forEach((dayCols, d) => {
            if (!dayCols.length) return;
            const dayEl = document.createElement("div");
            dayEl.className = "mxmg-day";
            const head = document.createElement("div");
            head.className = "mxmg-day-head" + (d === 0 ? " today" : "");
            head.textContent = dayFmt.format(new Date(dayCols[0].x.ms));
            const colsEl = document.createElement("div");
            colsEl.className = "mxmg-cols";
            dayCols.forEach((c) => {
              const colEl = document.createElement("div");
              colEl.className = "mxmg-col" + (c.x.ms <= now && now < c.x.ms + 3 * HOUR ? " now" : "");
              const hour = document.createElement("span");
              hour.className = "mxmg-hour";
              hour.textContent = hourFmt.format(new Date(c.x.ms));
              const ico = document.createElement("span");
              ico.className = "mxmg-ico";
              ico.innerHTML = wmoSvg(h.weather_code?.[c.i] ?? 0, h.is_day?.[c.i] ?? 1, 22);
              const temp = document.createElement("span");
              temp.className = "mxmg-temp";
              const t = h.temperature_2m?.[c.i];
              if (t != null && t === t) {
                ramp(TEMP, t, rgb);
                temp.textContent = `${Math.round(t)}°`;
                temp.style.background = `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])} / ${Math.max(0.62, rgb[3]).toFixed(2)})`;
              } else temp.textContent = "—";
              const rain = document.createElement("span");
              const pr = h.precipitation?.[c.i] ?? 0;
              rain.className = "mxmg-rain" + (pr >= 0.1 ? "" : " dry");
              rain.textContent = pr >= 0.1 ? `${localNum(Math.round(pr * 10) / 10, 1)}` : "·";
              const wind = document.createElement("span");
              wind.className = "mxmg-wind";
              const ws = h.wind_speed_10m?.[c.i];
              const wd = h.wind_direction_10m?.[c.i];
              /* سهم يشير إلى حيث تتجه الرياح فعليًا (الاتجاه الأرصادي «من») */
              wind.innerHTML = `${ws != null ? Math.round(ws) : "—"}<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform: rotate(${((wd ?? 0) + 180)}deg)"><path d="M12 21V3"/><path d="m5 10 7-7 7 7"/></svg>`;
              colEl.append(hour, ico, temp, rain, wind);
              colsEl.appendChild(colEl);
              if (!firstColEl) firstColEl = colEl;
            });
            dayEl.append(head, colsEl);
            frag.appendChild(dayEl);
          });
          scroll.appendChild(frag);
          const sEl = $("#mxmg-sub");
          if (sEl) sEl.textContent = tr("توقعات 10 أيام · كل 3 ساعات");
          /* قياس خطوة العمود ونقطة انطلاقه لمزامنة التمرير مع ساعة الخريطة */
          try {
            const all = scroll.querySelectorAll(".mxmg-col");
            if (all.length >= 2) {
              const fRect = all[0].getBoundingClientRect();
              const sRect2 = all[1].getBoundingClientRect();
              MG.pitch = (sRect2.left - fRect.left) || 51;
              MG.origin = fRect.left - scroll.getBoundingClientRect().left + scroll.scrollLeft;
            }
          } catch (e) { MG.pitch = 51; MG.origin = 0; }
          /* اجعل عمود «الآن» في المنتصف عند الفتح */
          try {
            const nowEl = scroll.querySelector(".mxmg-col.now") || firstColEl;
            if (nowEl) scroll.scrollLeft = Math.max(0, nowEl.offsetLeft - scroll.clientWidth / 2 + 26);
          } catch (e) {}
        }

        /* تمرير الشريط أفقيًا يحدّث الساعة المعروضة على الخريطة تلقائيًا */
        function meteoBindScroll() {
          const scroll = $("#mxmg-scroll");
          if (!scroll || scroll.dataset.mgBound) return;
          scroll.dataset.mgBound = "1";
          scroll.addEventListener("scroll", () => {
            if (MG.syncing || !MG.times.length || S.rtMode) return; /* v64: خارج نطاق الرادار الدقيق */
            MG.syncing = true;
            requestAnimationFrame(() => {
              MG.syncing = false;
              const bar = meteoBar();
              if (!bar || bar.classList.contains("hidden") || !MG.times.length) return;
              const center = scroll.scrollLeft + scroll.clientWidth / 2;
              const idx = clamp(Math.round((center - MG.origin) / MG.pitch), 0, MG.times.length - 1);
              const pos = meteoHourToPos(MG.times[idx]);
              if (pos !== S.pos) setPos(pos);
            });
          }, { passive: true });
        }

        /* ══ v63: الضغط المطوّل 500ms (لمسًا أو ماوسًا) على أي نقطة بالخريطة ══ */
        function bindLongPress(map) {
          const host = map.getContainer();
          let timer = 0, start = null;
          const clear = () => { clearTimeout(timer); timer = 0; start = null; };
          /* منع قائمة المتصفح الأصلية فوق البلاطات أثناء الضغط المطوّل باللمس */
          host.addEventListener("contextmenu", (e) => {
            if (!e.target.closest(".leaflet-control-container")) e.preventDefault();
          });
          host.addEventListener("pointerdown", (e) => {
            if (e.pointerType === "mouse" && e.button !== 0) { clear(); return; }
            if (e.target.closest(".leaflet-control-container, .leaflet-popup, .leaflet-tooltip")) { clear(); return; }
            let ll = null;
            try { ll = map.mouseEventToLatLng(e); } catch (err) {
              try {
                const r = host.getBoundingClientRect();
                ll = map.containerPointToLatLng([e.clientX - r.left, e.clientY - r.top]);
              } catch (err2) { return; }
            }
            if (!ll) return;
            start = { x: e.clientX, y: e.clientY, lat: ll.lat, lng: ll.lng };
            clearTimeout(timer);
            timer = setTimeout(() => {
              timer = 0;
              if (!start) return;
              const s = start;
              start = null;
              /* كبت نقرة Leaflet التالية + تصفير الحارس تلقائيًا بعد 600ms */
              S.lpSuppressClick = true;
              setTimeout(() => { S.lpSuppressClick = false; }, 600);
              if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
              meteoOpen(s.lat, s.lng);
            }, 500);
          });
          host.addEventListener("pointermove", (e) => {
            if (!start) return;
            if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) clear();
          }, { passive: true });
          ["pointerup", "pointercancel"].forEach((ev) => host.addEventListener(ev, () => { clearTimeout(timer); timer = 0; }, { passive: true }));
          host.addEventListener("wheel", () => { clearTimeout(timer); timer = 0; start = null; }, { passive: true });
        }

        /* واجهات عامة */
        function show() {
          /* إصدار 16: الوضع الاقتصادي — الخريطة الكبرى متوقفة كليًا (بلا Leaflet ولا شبكة
             بيانات ولا جزيئات) ونعرض مكانها لوحة تفسيرية بزر إعادة تفعيل */
          if (Eco.isEco()) {
            try { window.__matarEcoBite?.(420, "الخريطة الكبرى وبلاطاتها"); } catch (e) {}
            const overlay = $("#mx-eco");
            if (overlay) overlay.classList.remove("hidden");
            return;
          }
          $("#mx-eco")?.classList.add("hidden");
          if (!S.ready) {
            init();
            // المرحلة 2: إن لم يصل Leaflet الاحتياطي بعد، أعد المحاولة عند جهوزيته (مرة واحدة عند النجاح فقط)
            if (!S.ready) { window.matarLeafletReady.then((ok) => { if (ok && !S.ready) show(); }); return; }
          }
          S.shown = true;
          setNavH();
          /* إصدار 17: التصويبة المركزية — قراءة أولى لنقطة المركز فور فتح الخريطة
             (وتتحدث تلقائيًا بعد كل توقف للحركة عبر moveend) */
          scheduleCrosshair();
          setTimeout(() => {
            S.map.invalidateSize();
            layoutCanvases();
            if (S.needFly && state.place) {
              S.needFly = false;
              try { S.map.setView([state.place.latitude, state.place.longitude], Math.max(S.map.getZoom(), 6)); } catch (e) {}
            }
            /* v64: إعادة ارتساء وضع الخط الزمني عند كل فتح للخريطة (رادار ± ساعتين أو الساعي الكامل) */
            setRtMode(S.on.rain, true);
            if (!S.rtMode) buildTicks();
            /* إصدار 36: تفعيل إضاءة اليوم/الساعة النشطة بعد إعادة بناء العلامات */
            paintClock();
            /* إصدار 34: تحديث المفتاح اللوني وشريط مقياس الملم عند الفتح مباشرة —
               الطبقات الافتراضية (الأمطار والسحب) تُظهر شريطها من أول لحظة */
            updateLegend();
            ensureSoon();
            /* v65 (المرحلة الأولى): لا جلب لقوائم إطارات الرادار/الأقمار عند فتح
               الخريطة إلا مع تفعيل إحدى طبقات البلاطات الحية — الأساس النظيف
               وحده صفر طلبات إضافية فوق بلاطاته */
            if (S.on.rain || S.on.satellite) {
              Promise.allSettled([loadTileMeta("rain"), loadTileMeta("satellite")])
                .then(() => { syncTiles(); queueRedraw(); });
            }
            queueRedraw();
          }, 60);
          /* v52: قفل القياس المزدوج (Double invalidateSize) بعد فتح تبويب الخريطة التفاعلية —
             مهلتا 200ms و500ms تضمان عدم بقاء الخريطة بحجم 0px بعد التحميل الكسول
             (Lazy Loading) أو إظهار حاوية كانت مخفية: hidden → flex لا يعيد حساب
             مقاسات Leaflet تلقائيًا، والمهلتان تُرسمان الخريطة بكامل أبعادها */
          setTimeout(() => { if (state.page === "map" && S.ready) { try { S.map.invalidateSize({ animate: false }); } catch (e) {} } }, 200);
          setTimeout(() => { if (state.page === "map" && S.ready) { try { S.map.invalidateSize({ animate: false }); layoutCanvases(); } catch (e) {} } }, 500);
        }

        function setPlace(place) {
          if (!S.ready) { show(); return; }
          if (state.page !== "map") {
            // الخريطة مخفية: نُبطل بيانات المنطقة القديمة ونؤجل التحريك حتى فتح الصفحة
            S.grid = null;
            S.models = {};
            S.air = null;
            S.fetchedAt = 0;
            S.needFly = true;
            return;
          }
          try {
            S.map.flyTo([place.latitude, place.longitude], Math.max(S.map.getZoom(), 6), { duration: 0.8 });
          } catch (e) { /* خريطة بمقاس صفر: سيُعاد التمركز عند الفتح */ }
          S.grid = null;
          S.models = {};
          S.air = null;
          setTimeout(() => { if (state.page === "map" && S.ready) { S.map.invalidateSize(); ensureSoon(); } }, 900);
        }

        /* مغادرة صفحة الخريطة: إيقاف كامل للأنيميشن والمؤقتات وتعليق الجلب
           حفاظًا على الذاكرة والبطارية ومنعًا للتهنيج */
        function stop() {
          S.shown = false;
          stopFlow();
          if (S.playing) setPlaying(false);
          clearTimeout(silentPreloadTimer);
          if (S.zen) setZen(false); /* المرحلة 9: مغادرة الخريطة تُنهي ملء الشاشة تلقائيًا */
        }

        /* إصدار 33: ربط مستمعي المستند/النافذة مرة واحدة عند تحميل الوحدة —
           يبقى عاملًا عبر دورات تدمير/إعادة بناء المحرك في الوضع الاقتصادي */
        bindOnce();

        /* ═══════════════════════════════════════════════════════════════
           ===== v41: MX+ طبقات برو — حزمة الأقمار الصناعية والتتبع الذكي =====
           بلوك إضافي بحت (لا يعيد كتابة أي دالة قائمة): أساس القمر الداكن،
           تسميات النيون، True Color/IR التلقائي، الدمج، فاحص قمم السحب،
           تتبع العواصف، الغبار، الأخطار الحية، سلاسة الخط الزمني، والكوكب 3D.
           كل شيء يُدمَّر نظيفًا في destroyEngine عبر الغلاف أدناه.
           ═══════════════════════════════════════════════════════════════ */
        const MXP = {
          on: { neon: false, hybrid: false, storm: false, dust: false, hz: false },
          base: "windy", mode: "auto", satEngaged: false, lastNight: null,
          layers: { tc: null, dust: null, neon: null, hybrid: null },
          groups: { storm: null, hz: null },
          timers: { storm: 0, hz: 0 },
          abort: { storm: null, hz: null },
          busy: { storm: false, hz: false },
          err: { tc: 0, dust: 0, neon: 0 },
          errAt: { tc: 0, dust: 0 },
          cache: new Map(),          /* تخزين مؤقت لكل نقطة 10 دقائق (الميزات 7/9) */
          globe: { map: null },
          glPromise: null,
        };

        /* --- مساعدات عامة --- */
        function mxpEnsurePane(name, z) {
          if (S.map && !S.map.getPane(name)) { const p = S.map.createPane(name); p.style.zIndex = String(z); }
        }
        function mxpGroupClear(name) {
          if (MXP.groups[name] && S.map) { try { S.map.removeLayer(MXP.groups[name]); } catch (e) { /* أُزيلت */ } }
          MXP.groups[name] = null;
        }
        function mxpSyncUI() {
          $$("#mxp-sec .mxp-btn").forEach((b) => {
            const act = b.dataset.mxp;
            if (act === "base") b.classList.toggle("sel", b.dataset.base === MXP.base);
            else if (act === "mode") b.classList.toggle("sel", b.dataset.mode === MXP.mode);
            else b.setAttribute("aria-pressed", String(!!MXP.on[act]));
          });
        }
        /* ميزة 3 — ارتفاع الشمس (معادلة مبسطة: ميل + زاوية الساعة) — عتبة -3° */
        function mxpSunElev(lat, lng, d = new Date()) {
          const doy = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400e3);
          const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (doy + 10)) * Math.PI / 180;
          const solarH = d.getUTCHours() + d.getUTCMinutes() / 60 + lng / 15;
          const H = (solarH - 12) * 15 * Math.PI / 180;
          const phi = lat * Math.PI / 180;
          const sinE = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
          return Math.asin(clamp(sinE, -1, 1)) * 180 / Math.PI;
        }
        function mxpGibsDate() { return new Date(Date.now() - 86400e3).toISOString().slice(0, 10); }
        function mxpMaxN(arr) {
          if (!Array.isArray(arr)) return NaN;
          let mx = NaN;
          for (const v of arr.slice(0, 6)) { const n = Number(v); if (Number.isFinite(n) && (!Number.isFinite(mx) || n > mx)) mx = n; }
          return mx;
        }
        /* جلب أحادي الطيران لعدة نقاط مع كاش 10 دقائق لكل نقطة (Open-Meteo متعدد المواقع) */
        async function mxpFetchPoints(tag, pts, base, qs, signal) {
          const now = Date.now();
          const out = new Array(pts.length).fill(null);
          const missing = [];
          pts.forEach((p, i) => {
            const key = `${tag}:${p[0].toFixed(2)},${p[1].toFixed(2)}`;
            const hit = MXP.cache.get(key);
            if (hit && now - hit.at < 600e3) out[i] = hit.data;
            else missing.push({ i, key, p });
          });
          for (const [k, v] of MXP.cache) if (now - v.at >= 600e3) MXP.cache.delete(k);
          if (missing.length) {
            const url = `${base}?latitude=${missing.map((m) => m.p[0].toFixed(3)).join(",")}&longitude=${missing.map((m) => m.p[1].toFixed(3)).join(",")}&${qs}`;
            const res = await getJson(url, signal);
            const arr = Array.isArray(res) ? res : [res];
            missing.forEach((m, j) => {
              const d2 = arr[j] ?? null;
              if (d2) { MXP.cache.set(m.key, { at: now, data: d2 }); out[m.i] = d2; }
            });
          }
          return out;
        }

        /* --- ميزة 1: مبدّل الأساس — v56: إصلاح جذري لزرّي «🌙 داكن» و«🛣 شوارع» ---
           ① إزالة كل الطبقات السابقة المتعارضة حصرًا (الأساس + المرجع + الهيلشيد + المجموعة) قبل أي تفعيل
           ② v57: «🌙 داكن» يفعّل شوارع Esri (arcgisonline.com {z}/{y}/{x}) فورًا على كل المستويات بفلتر ليلي فاخر — بلا هيلشيد ولا طبقة مرجع
           ③ «🛣 شوارع» يفعّل World_Street_Map مباشرة على كل المستويات (0–19) بلا هيلشيد مرافق ولا قيد minZoom — الشوارع تظهر لحظة الضغط
           ④ البلاطات من server.arcgisonline.com المسموح في CSP (img-src/connect-src) — بلا أي حجب
           ⑤ map.invalidateSize() فور التبديل مباشرة ثم مرة ثانية بعد 220ms كي تتمدد الخريطة بكامل حجمها */
        function mxpSetBase(which) {
          if (!["windy", "street", "sat", "satplus"].includes(which)) return;
          /* v58: تطبيع «satplus» القديم إلى «sat» النقي — صور القمر الصناعي فقط
             بلا طبقة شوارع World_Transportation إطلاقًا في الخريطة الكبرى */
          if (which === "satplus") which = "sat";
          MXP.base = which;
          if (S.ready && S.map) {
            const map = S.map;
            const reg = basemapRegistry.get(map);
            if (reg) {
              /* v56: تفكيك صريح وشفاف لكل مراجع الأساس القديمة — لا طبقة عالقة ولا تعارض */
              ["layer", "base", "ref", "hill", "near"].forEach((k) => {
                try { if (reg[k]) map.removeLayer(reg[k]); } catch (e) { /* أُزيلت سلفًا */ }
              });
              reg.custom = null; reg.ref = null; reg.base = null; reg.hill = null; reg.near = null; reg.layer = null;
              reg.fellBack = false; reg.refFellBack = false; reg.errors = 0; reg.loaded = false;
            }
            if (which === "windy") {
              /* v57: «🌙 داكن» — شوارع Esri بفلتر ليلي فاخر على كل المستويات (0–19)
                 بلا هيلشيد ولا طبقة مرجع (التسميات مدمجة داخل بلاطات الشوارع) */
              addWindyBase(map);
              /* v57: إزالة الأساس التفصيلي السياقي إن بقي ظاهرًا من نمط سابق —
                 أساس داكن الجديد شوارع كاملة على كل المستويات فلا يحتاج تغطية */
              try {
                if (S.detailBase) {
                  const dpane = map.getPane("mx-detail-base");
                  if (dpane) dpane.style.opacity = "0";
                  clearTimeout(S.detailTimer);
                  const db = S.detailBase, m = map;
                  S.detailTimer = setTimeout(() => { try { m.removeLayer(db); } catch (e) { /* أُزيل */ } }, 520);
                }
              } catch (e) { /* تجاهل */ }
            } else if (which === "street") {
              /* v56: «🛣 شوارع» أساس مباشر على كل المستويات — بلا حد minZoom ولا طبقة مرافقة */
              const street = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
                maxZoom: 19, maxNativeZoom: 19, className: "base-tiles-native", attribution: ESRI_REF,
              });
              const reg2 = basemapRegistry.get(map) || {};
              reg2.idx = 1; reg2.errors = 0; reg2.loaded = false; reg2.custom = null;
              reg2.near = street; reg2.hill = null; reg2.ref = null; reg2.layer = street; reg2.base = street;
              reg2.fellBack = false; reg2.refFellBack = false;
              basemapRegistry.set(map, reg2);
              street.addTo(map);
            } else {
              /* v58: «🛰 قمر صناعي» النقي — صور Esri World_Imagery الصافية على كل
                 المستويات بلا فلتر داكن (زوال mxp-dark-sat) وبلا طبقة شوارع
                 World_Transportation — التسمية الوحيدة فوق الصور هي «فلسطين
                 المحتلة» المخصصة، وتُزال طبقة الشوارع التفصيلية السياقية كي
                 تظهر الكرة الأرضية والمدن والسواحل بجمالها الطبيعي النقي */
              const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                maxZoom: 19, maxNativeZoom: 17, className: "base-tiles-native", attribution: ESRI_REF,
              });
              const reg3 = basemapRegistry.get(map) || {};
              reg3.idx = 2; reg3.errors = 0; reg3.loaded = false; reg3.custom = "sat-clean";
              reg3.near = sat; reg3.hill = null; reg3.ref = null; reg3.layer = sat; reg3.base = sat;
              reg3.fellBack = false; reg3.refFellBack = false;
              basemapRegistry.set(map, reg3);
              sat.addTo(map);
              /* v58: إزالة الأساس التفصيلي السياقي (شوارع zoom≥10) إن بقي ظاهرًا من
                 نمط سابق — القمر النقي يبقى ساطعًا على كل مستويات التقريب */
              try {
                if (S.detailBase) {
                  const dpane = map.getPane("mx-detail-base");
                  if (dpane) dpane.style.opacity = "0";
                  clearTimeout(S.detailTimer);
                  const db = S.detailBase, m = map;
                  S.detailTimer = setTimeout(() => { try { m.removeLayer(db); } catch (e) { /* أُزيل */ } }, 520);
                }
              } catch (e) { /* تجاهل */ }
            }
            S.baseReg = basemapRegistry.get(map);
            map.getContainer().classList.toggle("mxp-sat-base", which === "sat" || which === "satplus");
            /* v58: حذف طبقة الشوارع (World_Transportation) من الخريطة الكبرى نهائيًا —
               «🛰 قمر صناعي» صافٍ خالص على كل المستويات، والتسمية المخصصة «فلسطين
               المحتلة» (لوح 660) هي الوحيدة فوق الصور */
            mxpSetHybridLabels(false);
            /* v58: لا تفعيل تلقائي لتسميات النيون مع القمر الصناعي النقي — تبقى
               صور Esri World_Imagery الطبيعية صافية (المفتاح اليدوي يعمل كالمعتاد) */
            /* v56: إعادة قياس فورية بعد التبديل مباشرة — ثم تثبيت ثانٍ بعد 220ms */
            try { map.invalidateSize(); } catch (e) { /* خريطة غير مهيأة */ }
            setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* تجاهل */ } }, 220);
          }
          mxpSyncUI();
        }

        /* --- ميزة 2: طبقة تسميات النيون (Esri Dark Gray Reference فوق كل الطبقات) --- */
        function mxpSetNeon(on) {
          MXP.on.neon = !!on;
          if (!on || !S.ready || !S.map) {
            if (MXP.layers.neon && S.map) { try { S.map.removeLayer(MXP.layers.neon); } catch (e) { /* أُزيلت */ } }
            MXP.layers.neon = null;
            mxpSyncUI();
            return;
          }
          if (!MXP.layers.neon) {
            mxpEnsurePane("mxp-neon", 640);
            S.map.getPane("mxp-neon").style.pointerEvents = "none";
            const layer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
              pane: "mxp-neon", className: "mxp-neon-labels",
              maxZoom: 19, maxNativeZoom: 16, attribution: ESRI_REF,
            });
            MXP.err.neon = 0;
            layer.on("tileerror", () => {
              if (!MXP.layers.neon) return;
              if (++MXP.err.neon >= 8) {
                mxpSetNeon(false);
                setStatus(tr("تعذّر تحميل تسميات النيون — أُخفت الطبقة."), true);
              }
            });
            MXP.layers.neon = layer.addTo(S.map);
          }
          mxpSyncUI();
        }

        /* --- v55: تسميات الهجين (قمر صناعي + شوارع) — World_Transportation في لوح 650 --- */
        function mxpSetHybridLabels(on) {
          if (!on || !S.ready || !S.map) {
            if (MXP.layers.hybrid && S.map) { try { S.map.removeLayer(MXP.layers.hybrid); } catch (e) { /* أُزيلت */ } }
            MXP.layers.hybrid = null;
            return;
          }
          if (MXP.layers.hybrid) return;
          mxpEnsurePane("mxp-hybrid-labels", 650);
          S.map.getPane("mxp-hybrid-labels").style.pointerEvents = "none";
          const layer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", {
            pane: "mxp-hybrid-labels", className: "satellite-hybrid-labels",
            maxZoom: 19, maxNativeZoom: 19, attribution: ESRI_REF,
          });
          MXP.layers.hybrid = layer.addTo(S.map);
        }

        /* --- ميزة 3/8: WMS من NASA GIBS — True Color نهاري + صورة الغبار الكاذبة 7-2-1 --- */
        function mxpSetWms(key, on) {
          const cfg = key === "tc"
            ? { layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor", pane: "mxp-tc-wms", z: 406, cls: "mxp-tc-wms", op: 0.85 }
            : { layer: "MODIS_Terra_CorrectedReflectance_Bands721", pane: "mxp-dust-wms", z: 410, cls: "mxp-dust-wms", op: 0.75 };
          if (!on) {
            if (MXP.layers[key] && S.map) { try { S.map.removeLayer(MXP.layers[key]); } catch (e) { /* أُزيلت */ } }
            MXP.layers[key] = null;
            return;
          }
          if (MXP.layers[key] || !S.ready || !S.map) return;
          mxpEnsurePane(cfg.pane, cfg.z);
          S.map.getPane(cfg.pane).style.pointerEvents = "none";
          const wms = L.tileLayer.wms("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", {
            layers: cfg.layer, format: "image/png", transparent: false, opacity: cfg.op,
            version: "1.3.0", bbox: "-90,-180,90,180", crs: L.CRS.EPSG4326, time: mxpGibsDate(),
            pane: cfg.pane, className: cfg.cls, maxZoom: 19, maxNativeZoom: 8,
            attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS</a>',
          });
          delete wms.wmsParams.bbox; /* Leaflet يحسب bbox لكل بلاطة — المُعامل الثابت يُحذف تفاديًا لازدواجه */
          MXP.err[key] = 0;
          MXP.errAt[key] = Date.now();
          wms.on("tileerror", () => {
            if (!MXP.layers[key]) return;
            MXP.err[key] += 1;
            if (MXP.err[key] >= 6 && Date.now() - MXP.errAt[key] < 25e3) {
              mxpSetWms(key, false);
              setStatus(tr("تعذّر تحميل صور الأقمار الصناعية الحية — تُعرض تحت الحمراء بدلًا منها."), true);
              if (key === "tc" && !S.on.satellite) toggleLayer("satellite"); /* تحت الحمراء تبقى تعمل */
              if (key === "dust") { MXP.on.dust = false; mxpSyncUI(); setStatus(tr("أُخفت طبقة الغبار — تعذّر تحميل صور GIBS."), true); }
            }
          });
          MXP.layers[key] = wms.addTo(S.map);
        }

        /* --- ميزة 3: وضع القمر الصناعي (تلقائي نهار/ليل + يدوي) — يعيد استخدام تحت الحمراء القائمة --- */
        function mxpSatApply(silent = false) {
          if (!S.ready || !S.map) { mxpSyncUI(); return; }
          const c = S.map.getCenter();
          const night = MXP.mode === "night" || (MXP.mode === "auto" && mxpSunElev(c.lat, c.lng) < -3);
          MXP.lastNight = night;
          if (night) {
            mxpSetWms("tc", false);
            if (!S.on.satellite) toggleLayer("satellite"); /* RainViewer IR القائمة */
            if (!silent) setStatus(tr("وضع ليلي: سحب تحت الحمراء تعمل الآن."));
          } else {
            mxpSetWms("tc", true);
            if (S.on.satellite) toggleLayer("satellite"); /* تفادي ازدواج السحب نهارًا */
            if (!silent) setStatus(tr("وضع نهاري: صورة القمر الصناعي بالألوان الحقيقية (NASA GIBS)."));
          }
          mxpSyncUI();
        }

        /* --- ميزة 4: الدمج (سحب تحت الحمراء 50٪ + رادار 80٪ فوقها — بلا طبقات مكررة) --- */
        function mxpSetHybrid(on) {
          MXP.on.hybrid = !!on;
          if (MXP.on.hybrid) {
            /* v63: الوضع المدمج استثناء صريح وحيد يسمح برادار + قمر صناعي معًا
               (بشفافيات يدوية 80/50) — يُفعَّل مباشرة دون المرور بمنطق toggleLayer
               الحصري كي لا يطفئ أحدهما الآخر */
            Object.keys(S.on).forEach((k) => { if (k !== "rain" && k !== "satellite") S.on[k] = false; });
            S.on.rain = true;
            S.on.satellite = true;
            $$(".mx-layer").forEach((b) => b.setAttribute("aria-pressed", String(Boolean(S.on[b.dataset.layer]))));
            try { S.map?.getContainer()?.classList.toggle("mx-clouds-on", !!S.on.clouds); } catch (e) {}
            ui.periodWrap?.classList.toggle("hidden", !S.on.accumulation);
            setStatus(tr("الدمج مفعّل: قمر صناعي 50٪ + رادار مطر 80٪ فوقه."));
            refreshTiles();
          } else {
            setStatus(tr("أُلغي الدمج — عادت الشفافيات الافتراضية."));
            syncTiles(); /* يستعيد شفافية S.opacity × معامل كل نوع */
          }
          ["rain", "satellite"].forEach((kind) => {
            const tk = S.tile?.[kind];
            if (MXP.on.hybrid && tk?.layer) tk.layer.setOpacity(kind === "rain" ? 0.8 : 0.5);
          });
          mxpSyncUI();
        }

        /* --- ميزة 5: فاحص حرارة قمم السحب في نافذة النقر (صامت عند الفشل) --- */
        async function mxpCloudTop(lat, lng, pop, signal) {
          try {
            const url = new URL("https://api.open-meteo.com/v1/forecast");
            url.search = new URLSearchParams({
              latitude: lat.toFixed(4), longitude: lng.toFixed(4),
              hourly: "temperature_850hPa,temperature_700hPa,temperature_500hPa,temperature_300hPa,cloudcover_850hPa,cloudcover_700hPa,cloudcover_500hPa,cloudcover_300hPa,cape",
              forecast_hours: "1",
            });
            const d = await getJson(url, signal);
            const h = d?.hourly;
            if (!h?.time?.length) return;
            const LV = [{ p: 850, km: 1.5 }, { p: 700, km: 3.1 }, { p: 500, km: 5.9 }, { p: 300, km: 9.2 }];
            /* القمة = أعلى مستوى ضغط فيه غيوم ≥ 50٪ — بتناسب خطي نحو المستوى الأعلى */
            let top = null;
            for (let i = LV.length - 1; i >= 0; i -= 1) {
              const cc = Number(h[`cloudcover_${LV[i].p}hPa`]?.[0]);
              if (!Number.isFinite(cc) || cc < 50) continue;
              const t = Number(h[`temperature_${LV[i].p}hPa`]?.[0]);
              if (!Number.isFinite(t)) return;
              if (i === LV.length - 1) { top = { t, km: LV[i].km }; break; }
              const cc2 = Number(h[`cloudcover_${LV[i + 1].p}hPa`]?.[0]);
              const t2 = Number(h[`temperature_${LV[i + 1].p}hPa`]?.[0]);
              let frac = 0;
              if (Number.isFinite(cc2) && Number.isFinite(t2) && cc2 < 50 && cc > cc2) frac = clamp((cc - 50) / (cc - cc2), 0, 1);
              top = { t: t + frac * (t2 - t), km: LV[i].km + frac * (LV[i + 1].km - LV[i].km) };
              break;
            }
            if (!top) return; /* سماء صافية عموديًا: لا بطاقة */
            const cape = Number(h.cape?.[0]) || 0;
            const cls = cape > 2500 ? "danger" : cape >= 1000 ? "active" : "calm";
            const capeLabel = cape > 2500 ? tr("ركامية خطرة") : cape >= 1000 ? tr("ركامية نشطة") : tr("ركامية هادئة");
            const pct = Math.round(clamp((20 - top.t) / 100, 0, 1) * 100); /* الأبرد أعلى الشريط (بنفسجي) */
            const el = pop.getElement()?.querySelector(".mx-pop");
            if (!el) return;
            el.querySelector(".mxp-ct")?.remove();
            el.insertAdjacentHTML("beforeend", `
              <div class="mxp-ct ${cls}">
                <div class="mxp-ct-head">🌡️ ${tx("قمة السحابة", "Cloud top")}: <b>${tempText(top.t)}</b> · ${localNum(top.km, 1)} ${tx("كم", "km")}</div>
                <div class="mxp-ct-mid">
                  <span class="mxp-ct-bar" aria-hidden="true"><i style="bottom:${pct}%"></i></span>
                  <div class="mxp-ct-rows">
                    <span>CAPE: <b>${localNum(cape)}</b> J/kg</span>
                    <span class="mxp-cape">⚡ ${capeLabel}</span>
                  </div>
                </div>
              </div>`);
          } catch (e) { /* فشل الجلب: لا شيء يُضاف للنافذة (صامت) */ }
        }

        /* --- ميزة 7: تتبع السحب والعواصف بأسهم الحركة (شبكة 8 نقاط على حدود العرض) --- */
        function mxpViewBox(pad = 0.06) {
          const b = S.map.getBounds().pad(-pad);
          return { s: b.getSouth(), n: b.getNorth(), w: b.getWest(), e: b.getEast() };
        }
        function mxpGrid8() {
          const v = mxpViewBox();
          const fy = (f) => v.s + (v.n - v.s) * f, fx = (f) => v.w + (v.e - v.w) * f;
          return [[fy(.08), fx(.08)], [fy(.08), fx(.5)], [fy(.08), fx(.92)], [fy(.5), fx(.08)], [fy(.5), fx(.92)], [fy(.92), fx(.08)], [fy(.92), fx(.5)], [fy(.92), fx(.92)]];
        }
        function mxpGrid6() {
          const v = mxpViewBox();
          const fy = (f) => v.s + (v.n - v.s) * f, fx = (f) => v.w + (v.e - v.w) * f;
          return [[fy(.3), fx(.2)], [fy(.3), fx(.5)], [fy(.3), fx(.8)], [fy(.7), fx(.2)], [fy(.7), fx(.5)], [fy(.7), fx(.8)]];
        }
        async function mxpStormUpdate() {
          if (!MXP.on.storm || !S.ready || !S.map || Eco.isEco() || MXP.busy.storm) return;
          MXP.busy.storm = true;
          MXP.abort.storm?.abort();
          MXP.abort.storm = new AbortController();
          try {
            const pts = mxpGrid8();
            const data = await mxpFetchPoints("storm", pts, "https://api.open-meteo.com/v1/forecast",
              "hourly=wind_speed_700hPa,wind_direction_700hPa,cape,cloudcover_700hPa&forecast_hours=1", MXP.abort.storm.signal);
            if (!MXP.on.storm || !S.ready || !S.map) return;
            mxpDrawStorm(pts, data);
          } catch (e) {
            if (e?.name !== "AbortError") mxpGroupClear("storm"); /* فشل صامت — تُعاد المحاولة عند الحركة */
          } finally { MXP.busy.storm = false; }
        }
        function mxpDrawStorm(pts, arr) {
          mxpGroupClear("storm");
          const g = MXP.groups.storm = L.layerGroup();
          arr.forEach((d, i) => {
            if (!d?.hourly || !pts[i]) return;
            const latlng = [pts[i][0], pts[i][1]];
            const spd = Number(d.hourly.wind_speed_700hPa?.[0]);
            const dir = Number(d.hourly.wind_direction_700hPa?.[0]);
            /* اتجاه الحركة = الاتجاه القادم منه + 180° (الرياح تُقاس "من") */
            if (Number.isFinite(spd) && Number.isFinite(dir)) {
              const size = Math.round(clamp(18 + spd * 0.55, 24, 64));
              const html = `<div class="mxp-arrow" style="width:${size}px;height:${size}px;transform:rotate(${(dir + 180) % 360}deg)"><svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="rgba(126,240,220,.9)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V4"/><path d="m6 10 6-6 6 6"/></svg></div>`;
              g.addLayer(L.marker(latlng, {
                icon: L.divIcon({ html, className: "mxp-arrow-wrap", iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
                pane: "mxp-arrows", interactive: false, keyboard: false,
              }));
            }
            const cape = Number(d.hourly.cape?.[0]);
            if (Number.isFinite(cape) && cape >= 1000) {
              const m = L.marker(latlng, {
                icon: L.divIcon({ html: '<div class="mxp-storm-dot mxp-pulse"></div>', className: "mxp-dot-wrap", iconSize: [16, 16], iconAnchor: [8, 8] }),
                pane: "mxp-arrows",
              });
              m.bindTooltip(`⚡ ${tf("ركامية خطرة — CAPE {v} J/kg", { v: localNum(cape) })}`, { direction: "top", offset: [0, -8] });
              g.addLayer(m);
            }
          });
          g.addTo(S.map);
        }
        function mxpStormSet(on) {
          MXP.on.storm = !!on;
          if (on) {
            setStatus(tr("تتبع السحب: أسهم حركة السحب عند 700 hPa + تحذيرات الركامية."));
            mxpStormUpdate();
          } else {
            MXP.abort.storm?.abort();
            clearTimeout(MXP.timers.storm);
            mxpGroupClear("storm");
            setStatus(tr("أُلغي تتبع السحب والعواصف."));
          }
          mxpSyncUI();
        }

        /* --- ميزة 8: وضع الغبار (GIBS 7-2-1) — يظهر فوق الأساس وتحت الرادار --- */
        function mxpDustSet(on) {
          MXP.on.dust = !!on;
          if (on) {
            setStatus(tr("صورة كاذبة 7-2-1 — الغبار يظهر بدرجات وردية."));
            mxpSetWms("dust", true);
          } else mxpSetWms("dust", false);
          mxpSyncUI();
        }

        /* --- ميزة 9: مناطق الخطر الحية (6 نقاط، جلبان متوازيان، مفتاح زجاجي) --- */
        function mxpLegendSet(on) {
          if (!S.map) return;
          let el = $("#mxp-legend");
          if (on && !el) {
            el = document.createElement("div");
            el.id = "mxp-legend";
            el.className = "mxp-legend";
            el.setAttribute("role", "note");
            el.innerHTML = `<b>${tr("مفتاح الأخطار الحية")}</b>
              <span><i style="--c:#ff8a3d"></i>${tr("هبّات ≥ 60 كم/س")}</span>
              <span><i style="--c:#ff5240"></i>${tr("هبّات ≥ 80 كم/س")}</span>
              <span><i style="--c:#4db8ff"></i>${tr("سيول ≥ 5 مم/س")}</span>
              <span><i style="--c:#ffb020"></i>${tr("غبار ≥ 50 µg/m³")}</span>`;
            S.map.getContainer().appendChild(el);
          } else if (!on) el?.remove();
        }
        async function mxpHazardUpdate() {
          if (!MXP.on.hz || !S.ready || !S.map || Eco.isEco() || MXP.busy.hz) return;
          MXP.busy.hz = true;
          MXP.abort.hz?.abort();
          MXP.abort.hz = new AbortController();
          try {
            const pts = mxpGrid6();
            const sig = MXP.abort.hz.signal;
            const [wxRes, airRes] = await Promise.allSettled([
              mxpFetchPoints("hz", pts, "https://api.open-meteo.com/v1/forecast", "hourly=wind_gusts_10m,precipitation&forecast_hours=6", sig),
              mxpFetchPoints("hza", pts, "https://air-quality-api.open-meteo.com/v1/air-quality", "hourly=dust&forecast_hours=6", sig),
            ]);
            if (!MXP.on.hz || !S.ready || !S.map) return;
            const wx = wxRes.status === "fulfilled" ? wxRes.value : null;
            const air = airRes.status === "fulfilled" ? airRes.value : null;
            mxpDrawHazard(pts, wx, air);
          } catch (e) {
            if (e?.name !== "AbortError") mxpGroupClear("hz");
          } finally { MXP.busy.hz = false; }
        }
        function mxpDrawHazard(pts, wx, air) {
          mxpGroupClear("hz");
          const g = MXP.groups.hz = L.layerGroup();
          const TITLES = { gust: tr("هبّات ≥ 60 كم/س"), gust2: tr("هبّات ≥ 80 كم/س"), rain: tr("سيول ≥ 5 مم/س"), dust: tr("غبار ≥ 50 µg/m³") };
          pts.forEach((pt, i) => {
            const w = wx?.[i]?.hourly, a = air?.[i]?.hourly;
            if (!w && !a) return;
            const gmax = w ? mxpMaxN(w.wind_gusts_10m) : NaN;
            const pmax = w ? mxpMaxN(w.precipitation) : NaN;
            const dmax = a ? mxpMaxN(a.dust) : NaN;
            const hits = [];
            if (Number.isFinite(gmax) && gmax >= 80) hits.push(["gust2", gmax]);
            else if (Number.isFinite(gmax) && gmax >= 60) hits.push(["gust", gmax]);
            if (Number.isFinite(pmax) && pmax >= 5) hits.push(["rain", pmax]);
            if (Number.isFinite(dmax) && dmax >= 50) hits.push(["dust", dmax]);
            hits.forEach(([type, val]) => {
              const m = L.marker(pt, {
                icon: L.divIcon({ html: `<div class="mxp-hz-dot mxp-hz-${type}"></div>`, className: "mxp-dot-wrap", iconSize: [15, 15], iconAnchor: [7.5, 7.5] }),
                pane: "mxp-hz",
              });
              m.bindTooltip(`${TITLES[type]} · ${localNum(val, 1)}`, { direction: "top", offset: [0, -8] });
              g.addLayer(m);
            });
          });
          g.addTo(S.map);
        }
        function mxpHazardSet(on) {
          MXP.on.hz = !!on;
          if (on) {
            mxpLegendSet(true);
            setStatus(tr("الأخطار الحية: هبّات وسيول وعواصف ترابية داخل الشاشة."));
            mxpHazardUpdate();
          } else {
            mxpLegendSet(false);
            MXP.abort.hz?.abort();
            clearTimeout(MXP.timers.hz);
            mxpGroupClear("hz");
            setStatus(tr("أُلغيت خريطة الأخطار."));
          }
          mxpSyncUI();
        }

        /* --- ميزة 11: الكوكب ثلاثي الأبعاد (MapLibre GL v5 — تحميل ديناميكي ببدائل) --- */
        function mxpLoadScript(src) {
          return new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = src; s.async = true;
            s.onload = () => res(true);
            s.onerror = () => { s.remove(); rej(new Error("script")); };
            document.head.appendChild(s);
          });
        }
        function mxpEnsureGL() {
          if (window.maplibregl) return Promise.resolve(true);
          if (!MXP.glPromise) {
            MXP.glPromise = (async () => {
              /* قاعدة CSS مصغّرة مضمونة (style-src يسمح بـ unsafe-inline) — تكفي لعرض الكانفاس الصحيح
                 حتى لو فشل تحميل ملف الأنماط الكامل من CDN */
              try {
                const cssEl = document.createElement("style");
                cssEl.id = "mxp-gl-css";
                cssEl.textContent = ".maplibregl-map{position:relative;overflow:hidden}.maplibregl-canvas{position:absolute;left:0;top:0;outline:none}.maplibregl-ctrl-group{background:#0a181c;color:#eaf7f3}";
                document.head.appendChild(cssEl);
              } catch (e) { /* تجاهل */ }
              /* الأنماط الكاملة من unpkg (مسموح في style-src) — اختيارية للتحكم الكامل */
              try {
                const l = document.createElement("link");
                l.rel = "stylesheet";
                l.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
                document.head.appendChild(l);
              } catch (e) { /* اختيارية */ }
              const js = ["https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js", "https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.js"];
              let ok = false;
              for (const src of js) {
                try { await mxpLoadScript(src); if (window.maplibregl) { ok = true; break; } } catch (e) { /* المصدر التالي */ }
              }
              if (!ok) { MXP.glPromise = null; throw new Error("maplibre-unavailable"); }
            })();
          }
          return MXP.glPromise;
        }
        function mxpGlobeToggle() {
          const btn = $("#mxp-globe-btn");
          if (MXP.globe.map) { mxpGlobeClose(); return; }
          if (!S.ready || !S.map) { setStatus(tr("افتح الخريطة الكبرى أولًا."), true); return; }
          btn?.setAttribute("aria-pressed", "true");
          setStatus(tr("جاري تحميل محرك الكرة الأرضية…"));
          mxpEnsureGL()
            .then(() => mxpGlobeOpen())
            .catch(() => {
              btn?.setAttribute("aria-pressed", "false");
              setStatus(tr("تعذر تشغيل الوضع الكروي — قد تكون غير متصل."), true);
            });
        }
        async function mxpGlobeOpen() {
          if (MXP.globe.map || !S.ready || !S.map || !window.maplibregl) return;
          const stage = $("#map-stage") || S.map.getContainer();
          const wrap = document.createElement("div");
          wrap.className = "mxp-globe";
          wrap.id = "mxp-globe";
          wrap.setAttribute("role", "dialog");
          wrap.setAttribute("aria-label", tr("الكوكب ثلاثي الأبعاد"));
          stage.appendChild(wrap);
          const style = {
            version: 8,
            sources: {
              sat: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, maxzoom: 17, attribution: "Esri World Imagery" },
              labels: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, maxzoom: 16, attribution: "Esri Dark Gray Reference" },
            },
            layers: [
              { id: "mxp-bg", type: "background", paint: { "background-color": "#04060b" } },
              { id: "mxp-sat", type: "raster", source: "sat", paint: { "raster-brightness-max": 0.65, "raster-saturation": -0.15 } },
              { id: "mxp-labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.92 } },
            ],
          };
          /* رادار RainViewer من weather-maps.json — ولا بأس إن غاب */
          try {
            const meta = await getJson("https://api.rainviewer.com/public/weather-maps.json");
            const fr = [...((meta?.radar?.past) ?? [])].pop();
            if (fr?.path) {
              style.sources.radar = { type: "raster", tiles: [`https://tilecache.rainviewer.com${fr.path}/256/{z}/{x}/{y}/8/1_1.png`], tileSize: 256, maxzoom: 7 };
              style.layers.splice(2, 0, { id: "mxp-radar", type: "raster", source: "radar", paint: { "raster-opacity": 0.8 } });
            }
          } catch (e) { /* الرادار اختياري على الكرة */ }
          const c = S.map.getCenter();
          const zc = clamp(S.map.getZoom() - 1.2, 1.2, 8);
          let gl;
          try {
            gl = new maplibregl.Map({ container: wrap, style, center: [c.lng, c.lat], zoom: zc, attributionControl: false });
          } catch (err) { wrap.remove(); throw err; }
          MXP.globe.map = gl;
          /* إسقاط كروي — إن رفضه المحرك اكتفينا بالمسطح مع toast إرشادي */
          let globed = false;
          try {
            if (typeof gl.getProjection === "function") globed = gl.getProjection()?.type === "globe";
            if (!globed && typeof gl.setProjection === "function") { gl.setProjection({ type: "globe" }); globed = true; }
          } catch (e) { globed = false; }
          if (!globed) setStatus(tr("المحرك لا يدعم الكروي — عُرض المسطح."));
          /* ميزة 12: حدود المباني المضيئة من OpenFreeMap (اختيارية بصمت) */
          gl.on("load", () => {
            try {
              gl.addSource("ofm", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
              gl.addLayer({ id: "mxp-bld", type: "line", source: "ofm", "source-layer": "building", minzoom: 14, paint: { "line-color": "#7ef0dc", "line-opacity": 0.65, "line-width": 0.8 } });
            } catch (e) { /* اختيارية — لا تكسر شيئًا */ }
          });
          const close = document.createElement("button");
          close.type = "button";
          close.className = "mxp-globe-close";
          close.textContent = `✕ ${tr("إغلاق الوضع الكروي")}`;
          close.addEventListener("click", mxpGlobeClose);
          wrap.appendChild(close);
          const note = document.createElement("span");
          note.className = "mxp-globe-note";
          note.textContent = `${tr("الكوكب ثلاثي الأبعاد")} · MapLibre GL`;
          wrap.appendChild(note);
          setStatus("");
        }
        function mxpGlobeClose() {
          try { MXP.globe.map?.remove(); } catch (e) { /* أُزيلت */ }
          MXP.globe.map = null;
          $("#mxp-globe")?.remove();
          $("#mxp-globe-btn")?.setAttribute("aria-pressed", "false");
        }

        /* --- الربط: أزرار اللوحة + مستمعو الخريطة (debounce 1500ms + AbortController) --- */
        function mxpOnMoveEnd() {
          if (!S.ready || !S.map) return;
          if (MXP.on.storm) { clearTimeout(MXP.timers.storm); MXP.timers.storm = setTimeout(() => { try { mxpStormUpdate(); } catch (e) { /* تجاهل */ } }, 1500); }
          if (MXP.on.hz) { clearTimeout(MXP.timers.hz); MXP.timers.hz = setTimeout(() => { try { mxpHazardUpdate(); } catch (e) { /* تجاهل */ } }, 1500); }
          /* التلقائي: إعادة تقييم نهار/ليل عند تغير مركز الخريطة */
          if (MXP.satEngaged && MXP.mode === "auto") {
            const c = S.map.getCenter();
            const night = mxpSunElev(c.lat, c.lng) < -3;
            if (night !== MXP.lastNight) mxpSatApply(true);
          }
        }
        function mxpBindMap() {
          if (!S.map) return;
          mxpEnsurePane("mxp-arrows", 440);
          mxpEnsurePane("mxp-hz", 442);
          S.map.on("moveend", mxpOnMoveEnd);
        }
        function mxpWire() {
          ui.dock?.addEventListener("click", (e) => {
            const b = e.target.closest?.(".mxp-btn");
            if (!b || !b.dataset.mxp) return;
            const act = b.dataset.mxp;
            try {
              if (act === "base") mxpSetBase(b.dataset.base);
              else if (act === "neon") mxpSetNeon(!MXP.on.neon);
              else if (act === "mode") { MXP.mode = b.dataset.mode || "auto"; MXP.satEngaged = true; if (MXP.on.hybrid) mxpSetHybrid(false); mxpSatApply(); }
              else if (act === "hybrid") mxpSetHybrid(!MXP.on.hybrid);
              else if (act === "storm") mxpStormSet(!MXP.on.storm);
              else if (act === "dust") mxpDustSet(!MXP.on.dust);
              else if (act === "hz") mxpHazardSet(!MXP.on.hz);
            } catch (err) { /* لا شيء يكسر الواجهة */ }
          });
          $("#mxp-globe-btn")?.addEventListener("click", mxpGlobeToggle);
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && MXP.globe.map) mxpGlobeClose(); });
          mxpSyncUI();
        }

        /* --- التدمير النظيف في الوضع الاقتصادي: طبقات ومؤقتات وDOM وكرة أرضية --- */
        function mxpTeardown() {
          clearTimeout(MXP.timers.storm);
          clearTimeout(MXP.timers.hz);
          MXP.abort.storm?.abort();
          MXP.abort.hz?.abort();
          MXP.busy.storm = false;
          MXP.busy.hz = false;
          mxpGlobeClose();
          $("#mxp-legend")?.remove();
          try { S.map?.getContainer()?.classList.remove("mxp-anim", "mxp-sat-base"); } catch (e) { /* خريطة غير مهيأة */ }
          MXP.layers.tc = null;
          MXP.layers.dust = null;
          MXP.layers.neon = null;
          MXP.groups.storm = null;
          MXP.groups.hz = null;
        }

        /* --- ربط v41 بآليات المحرك القائمة (أغلفة رقيقة بلا إعادة كتابة) --- */
        /* ميزة 10: تحميل مسبق للإطارات الثلاثة التالية + ميزة 4: إعادة تطبيق شفافيات الدمج بعد كل مزامنة */
        const _mxpSyncTile = syncTile;
        syncTile = function (kind) {
          _mxpSyncTile(kind);
          try {
            const tk = S.tile?.[kind];
            if (tk?.meta?.frames?.length && S.on[kind] && S.map) {
              const T = posT(S.pos);
              const frames = tk.meta.frames;
              let best = -1, bd = Infinity;
              frames.forEach((f, i) => { const d = Math.abs(f.time * 1000 - T); if (d < bd) { bd = d; best = i; } });
              if (best >= 0) [frames[best + 1], frames[best + 2], frames[best + 3]].forEach((f) => {
                if (f && !tk.preload.get(f.path)?.layer) addPreloadLayer(kind, f);
              });
            }
          } catch (e) { /* تجاهل */ }
          try { if (MXP.on.hybrid && S.tile?.[kind]?.layer) S.tile[kind].layer.setOpacity(kind === "rain" ? 0.8 : 0.5); } catch (e) { /* تجاهل */ }
        };
        /* تهيئة v41 بعد كل بناء للخريطة (وأول بناء) */
        const _mxpInit = init;
        init = function () {
          _mxpInit();
          if (S.ready && S.map) mxpBindMap();
        };
        /* الوضع الاقتصادي: تموت كل إضافات v41 مع المحرك ثم تُعاد الأزرار لوضعها الابتدائي */
        const _mxpDestroy = destroyEngine;
        destroyEngine = function () {
          mxpTeardown();
          try { cancelAnimationFrame(S.playRAF || 0); } catch (e) { /* تجاهل */ }
          S.playRAF = 0;
          _mxpDestroy();
          MXP.on = { neon: false, hybrid: false, storm: false, dust: false, hz: false };
          MXP.base = "windy";
          MXP.mode = "auto";
          MXP.satEngaged = false;
          MXP.lastNight = null;
          mxpSyncUI();
        };

        mxpWire();
        /* ===== نهاية بلوك v41: MX+ طبقات برو ===== */

        return { show, setPlace, init, stop, applyDock, destroyEngine, getMap: () => (S.ready && S.map ? S.map : null) };
      })();
      /* ══ v66 (المرحلة الثانية): جسر عام للخريطة الكبرى — يتيح لسكربت رادار
         الأمطار والبرق (v66-script) الوصول الآمن لخريطة Leaflet عبر
         window.MX.getMap() مهما أعيد بناء المحرك (دورات الوضع الاقتصادي) ══ */
      window.MX = MX;

/* ═══════════════════ 7) وحدة Roads — طقس الطرق والسفر ═══════════════════ */

      /* ============================================================
         الصفحة 4: طقس الطرق والسفر
         ============================================================ */
      const Roads = (() => {
        const el = {
          form: $("#road-form"), from: $("#trip-from"), to: $("#trip-to"), swap: $("#trip-swap"),
          check: $("#trip-check"), status: $("#road-status"),
          results: $("#road-results"), summary: $("#trip-summary"), mapBox: $("#road-map"),
          wpStrip: $("#wp-strip"), alerts: $("#road-alerts"),
          keypoints: $("#trip-keypoints"),
          /* إصدار 17: شريط الانطلاق + مؤشر الأمان + محطات الاستراحة */
          depPills: $("#dep-row .dep-pills"), safetyStrip: $("#safety-strip"),
          /* v45: مؤشر الرياح الجانبية + شريط مبدّل الخريطة الزجاجي */
          windSide: $("#wind-side"), mapSwitch: $("#map-switch"),
          restBtn: $("#rest-stops-btn"), restStatus: $("#rest-status"),
          /* إصدار 27: تنبيه المغادرة الذكي + حالة الطريق */
          depAlert: $("#dep-alert"), closureStrip: $("#closure-strip"),
          pickFrom: $("#pick-from"), pickTo: $("#pick-to"), pickBanner: $("#pick-banner"),
          sugFrom: $("#sug-from"), sugTo: $("#sug-to"),
        };

        let roadMap = null;
        let roadLayer = null;
        let lastTrip = null; // آخر رحلة ناجحة لإعادة الرسم عند تغيير اللغة
        let depOffsetH = 0;  // إصدار 17: تأجيل الانطلاق المختار من شريط الوقت (0–6 ساعات)
        let restLayer = null; // إصدار 17: طبقة محطات الاستراحة على خريطة الطرق
        let restAbort = null;
        /* v46: مخزن نقاط الاستراحة الأخيرة + مناطقها — يقرؤه «أقرب نقطة أمان 🆘»
           من السكربت المرفق عبر الجسر دون إعادة طلب Overpass */
        let restItems = null;
        let restAreas = null;
        let onRestsArrive = null;

        const TRIP_COLORS = ["#2e9e5b", "#e0a526", "#d6453d"];
        const FLAG_META = {
          dense: { icon: iconSvg("fog", 13), label: tr("ضباب كثيف جدًا") },
          fog: { icon: iconSvg("fog", 13), label: tr("ضباب/شبورة") },
          rain: { icon: iconSvg("rain", 13), label: tr("أمطار غزيرة") },
          storm: { icon: iconSvg("storm", 13), label: tr("عواصف رعدية") },
          wind: { icon: iconSvg("wind", 13), label: tr("رياح قوية") },
          dust: { icon: iconSvg("dust", 13), label: tr("غبار يقلل الرؤية") },
          ice: { icon: iconSvg("frost", 13), label: tr("احتمال تجمّد/صقيع") },
          heat: { icon: iconSvg("fire", 13), label: tr("حرارة إجهاد للمحرك والسائق") },
          /* الميزة الجديدة: أيقونة التنبيه الديناميكي للرياح الجانبية (خارج FLAG_ORDER —
             تُحسب من زاوية المسار × الرياح لا من classify الموسعي) */
          crosswind: { icon: iconSvg("wind", 13), label: tr("رياح جانبية شديدة") },
        };
        const FLAG_ORDER = ["dense", "storm", "fog", "dust", "rain", "wind", "ice", "heat"];

        /* ═══════ إصدار 17 — قاعدة المدن المصرية المحلية (تسمية نقاط المسار بأقرب مدينة) ═══════
           طلب المستخدم: داخل مصر يُوصف موضع كل نقطة على الطريق بأقرب مدينة، لا بالكيلومتر
           المجرد. قائمة ثابتة (~30 مدينة) تعمل دون أي طلب شبكة وتغطي شبكة الطرق المصرية
           من السلوم شمالًا إلى أسوان جنوبًا ومن سيوا غربًا إلى مرسى علم شرقًا. */
        const EGYPT_CITIES = [
          { ar: "القاهرة", en: "Cairo", lat: 30.0444, lon: 31.2357 },
          { ar: "الجيزة", en: "Giza", lat: 30.0131, lon: 31.2089 },
          { ar: "شبرا الخيمة", en: "Shubra El Kheima", lat: 30.0994, lon: 31.2093 },
          { ar: "6 أكتوبر", en: "6th of October", lat: 29.9285, lon: 30.9188 },
          { ar: "العاصمة الإدارية", en: "New Administrative Capital", lat: 30.0299, lon: 31.9209 },
          { ar: "الإسكندرية", en: "Alexandria", lat: 31.2001, lon: 29.9187 },
          { ar: "بورسعيد", en: "Port Said", lat: 31.2653, lon: 32.3019 },
          { ar: "الإسماعيلية", en: "Ismailia", lat: 30.5965, lon: 32.2715 },
          { ar: "السويس", en: "Suez", lat: 29.9668, lon: 32.5498 },
          { ar: "طنطا", en: "Tanta", lat: 30.7865, lon: 30.9982 },
          { ar: "المنصورة", en: "Mansoura", lat: 31.0361, lon: 31.3808 },
          { ar: "الزقازيق", en: "Zagazig", lat: 30.5877, lon: 31.5020 },
          { ar: "دمنهور", en: "Damanhur", lat: 31.0341, lon: 30.4682 },
          { ar: "كفر الشيخ", en: "Kafr El Sheikh", lat: 31.1117, lon: 30.9398 },
          { ar: "دمياط", en: "Damietta", lat: 31.4175, lon: 31.8144 },
          { ar: "بنها", en: "Banha", lat: 30.4594, lon: 31.1787 },
          { ar: "الفيوم", en: "Faiyum", lat: 29.3084, lon: 30.8428 },
          { ar: "بني سويف", en: "Beni Suef", lat: 29.0661, lon: 31.0994 },
          { ar: "المنيا", en: "Minya", lat: 28.1099, lon: 30.7503 },
          { ar: "أسيوط", en: "Assiut", lat: 27.1809, lon: 31.1837 },
          { ar: "سوهاج", en: "Sohag", lat: 26.5591, lon: 31.6957 },
          { ar: "قنا", en: "Qena", lat: 25.9982, lon: 32.7240 },
          { ar: "الأقصر", en: "Luxor", lat: 25.6872, lon: 32.6396 },
          { ar: "أسوان", en: "Aswan", lat: 24.0889, lon: 32.8998 },
          { ar: "مرسى مطروح", en: "Marsa Matrouh", lat: 31.3543, lon: 27.2373 },
          { ar: "الغردقة", en: "Hurghada", lat: 27.2579, lon: 33.8116 },
          { ar: "شرم الشيخ", en: "Sharm El Sheikh", lat: 27.9158, lon: 34.3299 },
          { ar: "مرسى علم", en: "Marsa Alam", lat: 25.5390, lon: 34.8880 },
          { ar: "العريش", en: "Arish", lat: 31.1249, lon: 33.7984 },
          { ar: "السلوم", en: "Sallum", lat: 31.5587, lon: 25.1724 },
          { ar: "الخارجة", en: "Kharga", lat: 25.4514, lon: 30.5464 },
          { ar: "سيوا", en: "Siwa", lat: 29.1975, lon: 25.5187 },
        ];

        // هل النقطة داخل الحدود الجغرافية لمصر؟ (تقريب كافٍ لتمييز المسارات الداخلية)
        const EG_BBOX = { minLat: 21.7, maxLat: 31.8, minLon: 24.5, maxLon: 37.1 };
        function inEgypt(lat, lon) {
          return lat >= EG_BBOX.minLat && lat <= EG_BBOX.maxLat && lon >= EG_BBOX.minLon && lon <= EG_BBOX.maxLon;
        }

        // مسافة هافرسين (كم) بين نقطتين بالدرجات — للمدن ونقاط الاستراحة (إصدار 17)
        function haversinePt(lat1, lon1, lat2, lon2) {
          const R = 6371, rad = Math.PI / 180;
          const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
          return 2 * R * Math.asin(Math.sqrt(a));
        }

        // أقرب مدينة مصرية لنقطة (يعمل بالكامل محليًا — صفر شبكة)
        function nearestEgyptCity(lat, lon) {
          let best = EGYPT_CITIES[0], bd = Infinity;
          for (const c of EGYPT_CITIES) {
            const d = haversinePt(lat, lon, c.lat, c.lon);
            if (d < bd) { bd = d; best = c; }
          }
          return { ar: best.ar, en: best.en, dKm: bd };
        }

        // اسم المدينة باللغة الحالية
        function cityName(city) { return city ? tr(city.ar) : ""; }

        function setStatus(message, isError = false) {
          el.status.textContent = message;
          el.status.dataset.error = isError ? "true" : "false";
        }

        async function ensureRoadMap() {
          /* إصدار 16: الوضع الاقتصادي — خريطة الطرق تُستبدل بواجهة نصية تشرح الإيقاف
             (التحديد النصي للمواقع والنتائج تعمل كالمعتاد بلا بلاطات) */
          if (Eco.isEco()) {
            el.mapSwitch?.classList.add("hidden"); // v45: لا مبدّل بلا خريطة
            try { window.__matarEcoBite?.(320, "خريطة الطرق"); } catch (e) {}
            if (el.mapBox && !el.mapBox.dataset.ecoNote) {
              el.mapBox.dataset.ecoNote = "1";
              el.mapBox.innerHTML = `<div class="road-eco-note" style="display:grid;place-content:center;justify-items:center;gap:9px;height:100%;min-height:280px;text-align:center;padding:20px"><span style="display:grid;width:46px;height:46px;place-items:center;border:1px solid var(--line);border-radius:14px;color:var(--teal);background:var(--teal-soft)"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span><strong style="font-size:14px">${escapeHtml(tr("خريطة الطرق متوقفة — الوضع الاقتصادي"))}</strong><span style="max-width:44ch;color:var(--muted);font-size:11.5px;line-height:1.9">${escapeHtml(tr("فحص الطريق والنتائج والتنبيهات تعمل كالمعتاد من الحقول النصية أعلاه بلا أي بلاطات خرائط — لتوفير البيانات والبطارية. أوقف الوضع الاقتصادي من الإعدادات لإعادة الخريطة."))}</span></div>`;
            }
            return;
          }
          // المرحلة 2: انتظار Leaflet الاحتياطي غير المتزامن إن لزم (حُذف document.write)
          try { await window.matarLeafletReady; } catch (e) {}
          if (!window.L || roadMap || !el.mapBox) return;
          roadMap = L.map(el.mapBox, { scrollWheelZoom: true });
          window.matarCountryLabels?.attach(roadMap); /* v55: التسمية المخصصة على خريطة الطرق */
          /* v45: الأساسات الثلاثة + التسميات في لوح 650 + طبقة الزحمة عبر المبدّل الزجاجي */
          initRoadSwitcher();
          const p = state.place;
          roadMap.setView(p ? [p.latitude, p.longitude] : [30.05, 31.24], p ? 11 : 5);
          // تطوير: الاستماع للنقر لوضع التحديد المباشر من الخريطة
          roadMap.on("click", onRoadMapClick);
          setTimeout(() => roadMap && roadMap.invalidateSize(), 80);
          /* v52: قفل القياس المزدوج لخريطة الطرق بعد التهيئة (200ms و500ms) —
             الحاوية تُبنى بعد التحميل الكسول فلا تبقى الخريطة بحجم صفر */
          setTimeout(() => { if (roadMap) { try { roadMap.invalidateSize(); } catch (e) {} } }, 200);
          setTimeout(() => { if (roadMap) { try { roadMap.invalidateSize(); } catch (e) {} } }, 500);
        }

        function onShow() {
          // تهيئة خريطة الطرق فور فتح التبويب كي لا تظهر فارغة
          ensureRoadMap();
          if (roadMap) setTimeout(() => roadMap.invalidateSize(), 80);
          /* v52: قفل القياس المزدوج عند فتح صفحة طقس الطرق (200ms و500ms) */
          setTimeout(() => { if (roadMap) { try { roadMap.invalidateSize(); } catch (e) {} } }, 200);
          setTimeout(() => { if (roadMap) { try { roadMap.invalidateSize(); } catch (e) {} } }, 500);
        }

        /* ================= المرحلة 12: اقتراحات ذكية عالمية (Open-Meteo + Photon ثم Nominatim) من أول حرفين ================= */
        function wireAutocomplete(input, box) {
          let timer = 0;
          let controller = null;
          let activeOpt = -1; // إصلاح N-04: الخيار النشط داخل صندوق الاقتراحات
          const sugOptions = () => $$(`#${box.id} [role="option"]`);
          const setActiveSug = (index) => {
            const list = sugOptions();
            if (!list.length) return;
            activeOpt = (index + list.length) % list.length;
            list.forEach((opt, i) => {
              opt.classList.toggle("active", i === activeOpt);
              opt.setAttribute("aria-selected", String(i === activeOpt));
            });
            input.setAttribute("aria-activedescendant", list[activeOpt].id);
            list[activeOpt].scrollIntoView({ block: "nearest" });
          };
          const clearActiveSug = () => {
            activeOpt = -1;
            input.removeAttribute("aria-activedescendant");
            sugOptions().forEach((opt) => { opt.classList.remove("active"); opt.setAttribute("aria-selected", "false"); });
          };
          const close = () => {
            box.classList.add("hidden");
            box.replaceChildren();
            input.setAttribute("aria-expanded", "false");
            input.removeAttribute("aria-activedescendant");
            activeOpt = -1;
          };
          input.addEventListener("input", () => {
            clearTimeout(timer);
            controller?.abort();
            input._place = null; // النص تغيّر — الاختيار السابق لم يعد صالحًا
            clearActiveSug();
            const q = input.value.trim();
            /* المرحلة 12: اقتراحات فورية عالمية من أول حرفين بدل 3، ومهلة أقصر (280ms) */
            if (q.length < 2) { close(); return; }
            timer = setTimeout(async () => {
              controller = new AbortController();
              const signal = controller.signal;
              try {
                let list = [];
                try {
                  list = await searchEgyptPlaces(q, signal); // بحث عالمي: OpenMeteo + Photon ثم Nominatim
                } catch (e) {
                  if (e.name === "AbortError") throw e;
                  list = await searchRoadAddresses(q, signal); // احتياطي للعناوين التفصيلية
                }
                if (signal.aborted) return;
                box.replaceChildren();
                if (!list.length) {
                  box.innerHTML = `<div class="sug-empty">${escapeHtml(tr("لا نتائج مطابقة — جرّب اسمًا أوضح أو أضف اسم البلد، أو حدد من الخريطة 📍"))}</div>`;
                  box.classList.remove("hidden");
                  input.setAttribute("aria-expanded", "true");
                  return;
                }
                list.slice(0, 7).forEach((p, index) => {
                  const b = document.createElement("button");
                  b.type = "button";
                  b.className = "sug-item";
                  b.setAttribute("role", "option");
                  b.id = `${box.id}-opt-${index}`; // إصلاح N-04: معرّف الخيار
                  b.setAttribute("aria-selected", "false");
                  b.innerHTML = `
                    <span class="sug-pin" aria-hidden="true">📍</span>
                    <span class="sug-txt">
                      <span class="sug-name">${escapeHtml(p.name)}</span>
                      <span class="sug-ctx">${escapeHtml([p.admin1, p.country].filter(Boolean).join("، "))}</span>
                    </span>`;
                  b.addEventListener("click", () => {
                    input.value = p.name;
                    input._place = p;
                    close();
                    setStatus(tf("تم تحديد {w}: {n}", { w: input === el.from ? tr("نقطة البداية") : tr("نقطة النهاية"), n: p.name }));
                    maybeAutoCheck();
                  });
                  box.append(b);
                });
                box.classList.remove("hidden");
                input.setAttribute("aria-expanded", "true");
              } catch (e) { /* الاقتراحات اختيارية — نتجاهل الأخطاء */ }
            }, 280);
          });
          input.addEventListener("keydown", (e) => { // إصلاح N-04: أسهم + Enter + Home/End + Escape لصندوق الاقتراحات
            const open = !box.classList.contains("hidden");
            const list = sugOptions();
            if (e.key === "ArrowDown" && open && list.length) {
              e.preventDefault();
              setActiveSug(activeOpt < 0 ? 0 : activeOpt + 1); // ↓ التالي مع التدوير
            } else if (e.key === "ArrowUp" && open && list.length) {
              e.preventDefault();
              setActiveSug(activeOpt < 0 ? list.length - 1 : activeOpt - 1); // ↑ السابق مع التدوير
            } else if (e.key === "Home" && open && list.length) {
              e.preventDefault();
              setActiveSug(0);
            } else if (e.key === "End" && open && list.length) {
              e.preventDefault();
              setActiveSug(list.length - 1);
            } else if (e.key === "Enter" && open && activeOpt >= 0 && list[activeOpt]) {
              e.preventDefault(); // اختيار الاقتراح النشط بدل إرسال النموذج
              list[activeOpt].click();
            } else if (e.key === "Escape") {
              close();
            }
          });
          document.addEventListener("click", (e) => {
            if (!e.target.closest?.(".field-input-wrap")) close();
          });
        }
        wireAutocomplete(el.from, el.sugFrom);
        wireAutocomplete(el.to, el.sugTo);

        /* ================= تطوير: التحديد المباشر من الخريطة (بأسلوب خرائط جوجل) ================= */
        let pickTarget = null; // "from" | "to" | null
        const pickMarkers = { from: null, to: null };

        function pinIcon(which) {
          return L.divIcon({
            className: "",
            html: `<span class="map-pin ${which === "from" ? "a" : "b"}"><b>${which === "from" ? "A" : "B"}</b></span>`,
            iconSize: [30, 38], iconAnchor: [15, 36],
          });
        }

        function wirePinDrag(which, marker) {
          marker.on("dragend", async () => {
            const { lat, lng } = marker.getLatLng();
            const input = which === "from" ? el.from : el.to;
            input.value = `${lat.toFixed(5)}، ${lng.toFixed(5)}`;
            input._place = { name: input.value, admin1: "", country: "", latitude: lat, longitude: lng };
            setStatus(tr("نحدد اسم النقطة الجديدة…"));
            const name = await reverseGeocodeName(lat, lng);
            if (name) {
              input.value = name;
              input._place = { name, admin1: "", country: "", latitude: lat, longitude: lng };
            }
            maybeAutoCheck();
          });
        }

        function ensureEndpointPin(which, lat, lng) {
          if (!roadMap) return;
          if (pickMarkers[which]) {
            pickMarkers[which].setLatLng([lat, lng]).setIcon(pinIcon(which));
          } else {
            pickMarkers[which] = L.marker([lat, lng], { icon: pinIcon(which), draggable: true, zIndexOffset: 900 }).addTo(roadMap);
            wirePinDrag(which, pickMarkers[which]);
          }
        }

        async function reverseGeocodeName(lat, lng) {
          try {
            await nominatimGate();
            const url = new URL("https://nominatim.openstreetmap.org/reverse");
            url.search = new URLSearchParams({
              lat: String(lat), lon: String(lng), format: "jsonv2", zoom: "17", "accept-language": "ar,en",
            });
            const d = await getJson(url);
            const a = d.address ?? {};
            const primary = d.name || a.road || a.pedestrian || a.footway || a.neighbourhood || a.suburb || a.village || a.town || a.city;
            const secondary = a.suburb || (a.city ?? a.town) || a.state;
            const label = [primary, secondary].filter(Boolean).join("، ")
              || (d.display_name ?? "").split(",").slice(0, 2).join("، ")
              || tf("نقطة {a}°, {b}°", { a: lat.toFixed(3), b: lng.toFixed(3) });
            return palestineFixText(label);
          } catch (e) { return null; }
        }

        function setPickTarget(target) {
          pickTarget = pickTarget === target ? null : target;
          el.pickFrom?.setAttribute("aria-pressed", String(pickTarget === "from"));
          el.pickTo?.setAttribute("aria-pressed", String(pickTarget === "to"));
          el.mapBox?.classList.toggle("picking", Boolean(pickTarget));
          if (el.pickBanner) {
            el.pickBanner.hidden = !pickTarget;
            if (pickTarget) {
              el.pickBanner.textContent = tf("🎯 انقر على الخريطة لتحديد {w} — ESC أو الزر مجددًا للإلغاء", { w: pickTarget === "from" ? tr("نقطة البداية") : tr("نقطة النهاية") });
            }
          }
        }

        async function onRoadMapClick(e) {
          if (!pickTarget || !roadMap) return;
          const which = pickTarget;
          const { lat, lng } = e.latlng;
          setPickTarget(which); // إطفاء وضع التحديد (toggle)
          const input = which === "from" ? el.from : el.to;
          // إسقاط الدبوس الملوّن واستخراج الإحداثيات فورًا
          ensureEndpointPin(which, lat, lng);
          input.value = `${lat.toFixed(5)}، ${lng.toFixed(5)}`;
          input._place = { name: input.value, admin1: "", country: "", latitude: lat, longitude: lng };
          setStatus(tr("تم إسقاط الدبوس · نستخرج اسم الموقع…"));
          const name = await reverseGeocodeName(lat, lng);
          if (name) {
            input.value = name;
            input._place = { name, admin1: "", country: "", latitude: lat, longitude: lng };
          }
          const done = Boolean(el.from._place && el.to._place);
          setStatus(done
            ? tr("النقطتان جاهزتان · نرسم الطريق تلقائيًا…")
            : tf("تم تحديد {w} · أكمل النقطة الأخرى لرسم الطريق تلقائيًا.", { w: which === "from" ? tr("نقطة البداية") : tr("نقطة النهاية") }));
          maybeAutoCheck();
        }

        /* ================= تطوير: GPS بضغطة واحدة + البحث الصوتي ================= */
        async function fillFromGps(which) {
          const input = which === "from" ? el.from : el.to;
          if (!navigator.geolocation) { setStatus(tr("متصفحك لا يدعم تحديد الموقع."), true); return; }
          setStatus(tr("نحدد موقعك الحالي…"));
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = +pos.coords.latitude.toFixed(5), lng = +pos.coords.longitude.toFixed(5);
            ensureRoadMap();
            if (roadMap) roadMap.setView([lat, lng], 14);
            ensureEndpointPin(which, lat, lng);
            input.value = `${lat}، ${lng}`;
            input._place = { name: input.value, admin1: "", country: "", latitude: lat, longitude: lng };
            setStatus(tr("تم تحديد موقعك · نستخرج اسم العنوان…"));
            const name = await reverseGeocodeName(lat, lng);
            if (name) {
              input.value = name;
              input._place = { name, admin1: "", country: "", latitude: lat, longitude: lng };
            }
            setStatus(tf("تم تحديد {w}: {n}", { w: which === "from" ? tr("نقطة البداية") : tr("نقطة النهاية"), n: input._place.name }));
            maybeAutoCheck();
          }, () => setStatus(tr("تعذّر الوصول لموقعك. تأكد من منح الإذن ثم أعد المحاولة."), true),
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 60e3 });
        }

        let voiceRecog = null;
        function startVoiceSearch(which) {
          const input = which === "from" ? el.from : el.to;
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SR) { setStatus(tr("البحث الصوتي غير مدعوم في هذا المتصفح — جرّب Chrome أو Edge."), true); return; }
          const btn = which === "from" ? $("#mic-from") : $("#mic-to");
          if (voiceRecog) { try { voiceRecog.stop(); } catch (e) {} voiceRecog = null; btn?.removeAttribute("data-listening"); return; }
          voiceRecog = new SR();
          /* إصلاح 38: التعرف على الكلام بالعربية السعودية ar-SA بطلب المستخدم
             (كان يتبع locale الواجهة ar-EG) — أدق للهجة الخليجية وأوضح للفهم */
          voiceRecog.lang = /^ar/i.test(String(activeLocale())) ? "ar-SA" : activeLocale();
          voiceRecog.interimResults = false;
          voiceRecog.maxAlternatives = 1;
          btn?.setAttribute("data-listening", "true");
          setStatus(tr("تكلم الآن… مثال: «القاهرة» أو «باريس» أو اسم شارع في مدينتك"));
          voiceRecog.onresult = (e) => {
            const said = e.results?.[0]?.[0]?.transcript?.trim() ?? "";
            if (!said) return;
            input.value = said;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            setStatus(tf("سمعنا: «{q}» — جارٍ البحث…", { q: said }));
          };
          voiceRecog.onerror = () => setStatus(tr("تعذّر التقاط الصوت. تأكد من إذن الميكروفون وحاول مجددًا."), true);
          voiceRecog.onend = () => { btn?.removeAttribute("data-listening"); voiceRecog = null; };
          try { voiceRecog.start(); } catch (e) { btn?.removeAttribute("data-listening"); voiceRecog = null; }
        }

        el.pickFrom?.addEventListener("click", () => setPickTarget("from"));
        el.pickTo?.addEventListener("click", () => setPickTarget("to"));
        $("#geo-from")?.addEventListener("click", () => fillFromGps("from"));
        $("#geo-to")?.addEventListener("click", () => fillFromGps("to"));
        $("#mic-from")?.addEventListener("click", () => startVoiceSearch("from"));
        $("#mic-to")?.addEventListener("click", () => startVoiceSearch("to"));
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && pickTarget) setPickTarget(null);
        });

        async function resolveEndpoint(input, fallbackPlace) {
          const q = input.value.trim();
          if (!q) {
            if (fallbackPlace) return { ...fallbackPlace, resolvedName: fallbackPlace.name };
            // إصلاح 1: الرسالة السابقة كانت تقول «نقطة البداية» حتى لو كان الفراغ في نقطة النهاية
            throw new Error(input === el.from ? tr("أدخل نقطة البداية أولًا.") : tr("أدخل نقطة النهاية أولًا."));
          }
          const stored = input._place;
          if (stored && (stored.name === q || placeLabel(stored) === q)) return { ...stored, resolvedName: stored.name };
          let results = [];
          try { results = await searchEgyptPlaces(q); } catch (e) { if (e.name === "AbortError") throw e; }
          if (!results.length) results = await searchRoadAddresses(q).catch(() => []);
          if (!results.length) throw new Error(tf("لم نتعرف على «{q}». جرّب اسمًا أوضح أو حدد النقطة من الخريطة 📍", { q }));
          return { ...results[0], resolvedName: results[0].name };
        }

        function km(a, b) {
          const R = 6371, rad = Math.PI / 180;
          const dLat = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
          const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
          return 2 * R * Math.asin(Math.sqrt(h));
        }

        function classify(h, k) {
          const vis = h.visibility?.[k], code = h.weather_code?.[k], pr = h.precipitation?.[k] ?? 0;
          const wind = h.wind_speed_10m?.[k] ?? 0, gust = h.wind_gusts_10m?.[k] ?? 0;
          const temp = h.temperature_2m?.[k], rh = h.relative_humidity_2m?.[k];
          const f = {
            dense: vis != null && vis < 200,
            fog: false,
            dust: false,
            rain: pr >= 4,
            storm: code >= 95,
            wind: wind >= 45 || gust >= 55,
            ice: temp != null && temp <= 1.5 && (pr >= 0.1 || (rh ?? 0) >= 95),
            heat: temp != null && temp >= 44,
          };
          f.fog = !f.dense && ((vis != null && vis < 1000) || code === 45 || code === 48);
          const level = f.dense || f.storm || pr >= 8 || gust >= 70 || f.ice ? 2 : f.fog || f.rain || f.wind || f.heat ? 1 : 0;
          return { level, f };
        }

        function samplePoints(coords, totalKm) {
          const cum = [0];
          for (let i = 1; i < coords.length; i += 1) cum.push(cum[i - 1] + km(coords[i - 1], coords[i]));
          const step = Math.max(12, totalKm / 16);
          const pts = [];
          let target = 0;
          for (let i = 0; i < coords.length; i += 1) {
            if (cum[i] >= target) {
              const bearing = i > 0 ? Math.atan2((coords[i][0] - coords[i - 1][0]) * Math.cos(((coords[i][1] + coords[i - 1][1]) / 2) * Math.PI / 180), coords[i][1] - coords[i - 1][1]) * 180 / Math.PI : 0;
              pts.push({ idx: i, km: cum[i], lon: coords[i][0], lat: coords[i][1], bearing });
              target = cum[i] + step;
            }
          }
          const last = coords.length - 1;
          if (!pts.length || pts[pts.length - 1].idx !== last) {
            pts.push({ idx: last, km: cum[last], lon: coords[last][0], lat: coords[last][1], bearing: pts[pts.length - 1]?.bearing ?? 0 });
          }
          return { pts, cum, totalKm: cum[last] };
        }

        // ضمان وجود نقطة عند منتصف المسار بالضبط (لعرضها ضمن النقاط الذكية الثلاث)
        function injectMidpoint(pts, coords, cum, totalKm) {
          const halfKm = totalKm / 2;
          if (pts.some((p) => Math.abs(p.km - halfKm) <= Math.max(1, totalKm * 0.04))) return;
          let ci = cum.findIndex((c) => c >= halfKm);
          if (ci < 0) ci = coords.length - 1;
          const bearing = ci > 0 ? Math.atan2((coords[ci][0] - coords[ci - 1][0]) * Math.cos(((coords[ci][1] + coords[ci - 1][1]) / 2) * Math.PI / 180), coords[ci][1] - coords[ci - 1][1]) * 180 / Math.PI : 0;
          const midPt = { idx: ci, km: cum[ci] ?? halfKm, lon: coords[ci][0], lat: coords[ci][1], bearing };
          const at = pts.findIndex((p) => p.km > halfKm);
          if (at < 0) pts.push(midPt); else pts.splice(at, 0, midPt);
        }

        // وسم النقاط الذكية الثلاث: الانطلاق + أقرب نقطة للمنتصف + الوصول
        function markKeyRoles(pts, totalKm) {
          if (!pts.length) return;
          pts[0].role = "start";
          pts[pts.length - 1].role = "end";
          if (pts.length < 3) return;
          const halfKm = totalKm / 2;
          let mi = 0, bd = Infinity;
          pts.forEach((p, i) => {
            const d = Math.abs(p.km - halfKm);
            if (d < bd) { bd = d; mi = i; }
          });
          if (mi !== 0 && mi !== pts.length - 1) pts[mi].role = "mid";
        }

        /* ================= المرحلة 3: بديل احتياطي لمزوّد التوجيه (G-03) =================
           كانت الرحلة تعتمد على خادم OSRM وحده: أي توقف أو تباطؤ فيه يُعلّق فحص الطريق
           كليًا — بلا مهلة زمنية تفصل الطلبات المعلّقة. الآن نجرّب سلسلة مزوّدين بالترتيب،
           لكل محاولة مهلة 9 ثوانٍ، والمزوّد الأخير (Valhalla) يُوحَّد عبر مُحوّل مخصّص.
           ملاحظة: «لا يوجد طريق بريدي بين النقطتين» استجابة نهائية فنتوقف فورًا،
           أما الأعطال الشبكية وانتهاء المهلة فننتقل بعدها للمزوّد التالي. */
        class NoRouteError extends Error {}

        // مُوحّد استجابة OSRM v1 (يعمل للخادم الرسمي ومثيل FOSSGIS على حدّ سواء)
        function normalizeOsrmRoute(data) {
          const line = data?.routes?.[0];
          if (line?.geometry?.coordinates?.length) {
            return { coords: line.geometry.coordinates, distM: line.distance, durSec: line.duration };
          }
          // استجابة سليمة تؤكد غياب الطريق (مثل code=NoRoute) — البدائل لن تفيد
          if (data && typeof data === "object" && "code" in data) {
            throw new NoRouteError(tr("لم نجد طريقًا بريديًا بين النقطتين."));
          }
          return null;
        }

        // فك ترميز polyline بدقة 6 أرقام الذي تعيده Valhalla → مصفوفة GeoJSON [lng, lat]
        function decodePolyline6(str) {
          const out = [];
          let lat = 0, lon = 0, i = 0;
          while (i < str.length) {
            let b, shift = 0;
            let dLat = 0, dLon = 0;
            for (let axis = 0; axis < 2; axis += 1) {
              let delta = 0;
              shift = 0;
              do {
                b = str.charCodeAt(i) - 63;
                i += 1;
                delta |= (b & 0x1f) << shift;
                shift += 5;
              } while (b >= 0x20);
              delta = (delta & 1) ? ~(delta >> 1) : (delta >> 1);
              if (axis === 0) dLat = delta; else dLon = delta;
            }
            lat += dLat;
            lon += dLon;
            out.push([lon / 1e6, lat / 1e6]);
          }
          return out;
        }

        // مُوحّد استجابة Valhalla: الأشكال polyline6 + الملخّص (length بالكيلومتر و time بالثواني)
        function normalizeValhallaRoute(data) {
          const trip = data?.trip;
          const shapes = (Array.isArray(trip?.legs) ? trip.legs : [])
            .map((leg) => leg?.shape)
            .filter((s) => typeof s === "string" && s.length > 0);
          if (shapes.length) {
            const coords = shapes.flatMap((s) => decodePolyline6(s));
            if (coords.length) {
              const sum = trip.summary || {};
              return { coords, distM: Math.round((sum.length ?? 0) * 1000), durSec: Math.round(sum.time ?? 0) };
            }
          }
          // Valhalla يعيد error_code (مثل no_path) عند غياب الطريق البريدي
          if (data?.error_code) throw new NoRouteError(tr("لم نجد طريقًا بريديًا بين النقطتين."));
          return null;
        }

        // سلسلة مزوّدي التوجيه: الأساسي ثم البدائل الاحتياطية (المرحلة 3)
        const ROUTE_PROVIDERS = [
          {
            id: "osrm", label: "OSRM",
            // الخادم التجريبي الرسمي لمشروع OSRM
            url: (A, B) => `https://router.project-osrm.org/route/v1/driving/${A.longitude},${A.latitude};${B.longitude},${B.latitude}?overview=full&geometries=geojson&alternatives=false`,
            parse: normalizeOsrmRoute,
          },
          {
            id: "fossgis-osrm", label: "FOSSGIS OSRM",
            // بديل 1: مثيل OSRM على خوادم FOSSGIS — نفس واجهة OSRM v1 تمامًا
            url: (A, B) => `https://routing.openstreetmap.de/routed-car/route/v1/driving/${A.longitude},${A.latitude};${B.longitude},${B.latitude}?overview=full&geometries=geojson&alternatives=false`,
            parse: normalizeOsrmRoute,
          },
          {
            id: "valhalla", label: "Valhalla",
            // بديل 2: Valhalla على خوادم FOSSGIS — واجهة مختلفة (POST) يغطيها المُوحّد أعلاه
            request: (A, B) => ({
              url: "https://valhalla1.openstreetmap.de/route",
              options: {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  locations: [
                    { lat: A.latitude, lon: A.longitude },
                    { lat: B.latitude, lon: B.longitude },
                  ],
                  costing: "auto",
                }),
              },
            }),
            parse: normalizeValhallaRoute,
          },
        ];

        // طلب مسار من مزوّد واحد مع مهلة زمنية (9 ثوانٍ) كي لا يبقى زر الفحص معطلًا إلى ما لا نهاية
        async function fetchRouteFromProvider(provider, A, B, timeoutMs = 9000) {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeoutMs);
          try {
            const req = provider.request ? provider.request(A, B) : { url: provider.url(A, B), options: {} };
            const r = await fetch(req.url, { ...req.options, signal: ctrl.signal });
            if (!r.ok) {
              let payload = null;
              try { payload = await r.json(); } catch (e) { /* استجابة غير JSON */ }
              if (payload?.error_code === "no_path" || payload?.error_code === "no_edge" || payload?.error_code === "no_traversable_edges") {
                throw new NoRouteError(tr("لم نجد طريقًا بريديًا بين النقطتين."));
              }
              throw new Error(`http ${r.status}`);
            }
            const route = provider.parse(await r.json());
            if (!route?.coords?.length) throw new Error("bad payload");
            return route;
          } finally {
            clearTimeout(timer);
          }
        }

        // المرحلة 3: يجرب المزوّدين بالترتيب حتى ينجح أحدهم ويعيد اسم من نجح
        async function fetchRouteWithFallback(A, B, onFallback) {
          for (let i = 0; i < ROUTE_PROVIDERS.length; i += 1) {
            const provider = ROUTE_PROVIDERS[i];
            try {
              if (i > 0 && onFallback) onFallback(provider);
              return { ...(await fetchRouteFromProvider(provider, A, B)), provider, fallbackUsed: i > 0 };
            } catch (error) {
              if (error instanceof NoRouteError) throw error; // «لا طريق» قرار نهائي لا يتحسّن بمزوّد آخر
              /* عطل شبكي أو مهلة: ننتقل للمزوّد التالي */
            }
          }
          throw new Error(tr("تعذّر رسم المسار: كل مزوّدي التوجيه غير مستجيبين حاليًا. تأكد من الاتصال ثم أعد المحاولة."));
        }

        /* المرحلة 6: خطاف للاختبار الذاتي (?selftest=1) — لا يُعرّف شيء في التشغيل العادي */
        if (SELFTEST) window.__matarRoadsTestHooks = { decodePolyline6, normalizeValhallaRoute, ROUTE_PROVIDERS, NoRouteError };
        /* إصدار 17: خطافات الاختبار الذاتي للميزات الجديدة (رياضيات الأمان والمدن المصرية) */
        if (SELFTEST) window.__matarRoadsV17Hooks = { EGYPT_CITIES, nearestEgyptCity, inEgypt, roadSafetyScore, haversinePt };

        /* حارس تسلسل (الإصلاح ⑭-ج): إن بدأ فحص جديد لأي سبب فإصدار قديم لا يرسم شيئًا
           بعد عودته — يمنع تداخل النتائج غير المتزامنة بين بداية ووسط ونهاية المسار */
        let tripToken = 0;

        async function runTrip(A, B) {
          const my = ++tripToken;
          setStatus(tr("نرسم المسار على الشبكة الطرقية…"));
          // المرحلة 3: الطلب يمر عبر سلسلة المزوّدين بدل خادم OSRM وحده
          const route = await fetchRouteWithFallback(A, B, (provider) => {
            setStatus(tf("تعذّر المزوّد السابق — نجرّب البديل: {v}…", { v: provider.label }));
          });
          const coords = route.coords;
          const durSec = route.durSec, distM = route.distM;
          const { pts, cum, totalKm } = samplePoints(coords, distM / 1000);
          injectMidpoint(pts, coords, cum, totalKm); // ضمان نقطة منتصف المسار
          markKeyRoles(pts, totalKm);                // النقاط الذكية: انطلاق / منتصف / وصول
          /* إصدار 17: داخل مصر فقط — نسمّي كل نقطة على الطريق بأقرب مدينة مصرية بدل
             الكيلومتر المجرد (طلب المستخدم). الاتجاه العام للمسار يُقرأ من نسبة النقاط
             داخل الحدود الجغرافية لمصر كي لا تتأثر الرحلات الدولية العابرة. */
          const egInside = pts.filter((p) => inEgypt(p.lat, p.lon)).length;
          const egyptMode = egInside >= pts.length * 0.6;
          pts.forEach((p) => { p.city = egyptMode ? nearestEgyptCity(p.lat, p.lon) : null; });
          const depNow = Date.now();

          // حساب وقت الوصول لكل نقطة بنسبة المسافة المقطوعة
          pts.forEach((p) => {
            p.eta = depNow + (p.km / Math.max(totalKm, 0.001)) * durSec * 1000;
          });

          setStatus(tr("نفحص طقس نقاط الطريق حسب وقت الوصول المتوقع…"));
          /* الإصلاح ⑭: طلب واحد مجمّع لكل النقاط (يمنع تداخل الاستجابات غير المتزامنة
             ويقلل الطلبات تجنّبًا للحظر)، مع timezone=auto كي تعود مصفوفة الساعات
             بتوقيت كل نقطة المحلي (توقيت مصر) بدل UTC */
          const lats = pts.map((p) => p.lat.toFixed(3)).join(",");
          const lons = pts.map((p) => p.lon.toFixed(3)).join(",");
          const url = new URL("https://api.open-meteo.com/v1/forecast");
          url.search = new URLSearchParams({
            latitude: lats, longitude: lons,
            hourly: "temperature_2m,relative_humidity_2m,precipitation,weather_code,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m",
            timezone: "auto", forecast_hours: "42", past_hours: "1",
            wind_speed_unit: "kmh", precipitation_unit: "mm",
            /* إصلاح حرارة الطرق (ج): تثبيت الوحدة صراحةً (بلا افتراضات) واختيار خلية
               اليابسة حصرًا — نقاط المسار على الجسور والكورنيش قرب بحيرة التمساح
               والبحيرة المرة قد تلمس خلايا سطح الماء فيجعل النموذج حرارتها أبرد
               بدرجات في الظهيرة، والطريق أصلاً على أرض */
            temperature_unit: "celsius", cell_selection: "land",
          });
          const fetched = await getJson(url);
          if (my !== tripToken) return; // سُبق بإصدار أحدث — لا نرسم شيئًا
          let list = Array.isArray(fetched) ? fetched : [fetched];
          if (list.length !== pts.length) throw new Error(tr("تعذّر جلب طقس نقاط الطريق. حاول مجددًا."));
          /* إصلاح حرارة الطرق (ب): إقران كل استجابة بنقطة مسارها بالإحداثيات لا بالترتيب */
          list = pairWeatherList(list, pts);

          pts.forEach((p, i) => {
            const h = list[i]?.hourly;
            if (!h?.time?.length) throw new Error(tr("تعذّر جلب طقس نقاط الطريق. حاول مجددًا."));
            /* إصلاح حرارة الطرق (أ): فهرس ساعة الوصول بمطابقة نصية حتمية داخل h.time
               نفسها — بلا أي معادلة تفاضلية يمكن أن تنزاح ساعات بصمت */
            const off = (list[i].utc_offset_seconds ?? 0) * 1000;
            p.utcOff = off; // إصدار 17: تُحفظ لإسقاط طقس النقطة عند تغيير وقت الانطلاق محليًا
            p.k = hourIndexFor(h, p.eta, off);
            p.hourStamp = h.time[p.k] ?? null; // ساعة البيانات الفعلية (تُعرض في نافذة الخريطة)
            p.hourly = h;
            p.info = classify(h, p.k);
            p.temp = h.temperature_2m?.[p.k];
            p.wind = h.wind_speed_10m?.[p.k];
            p.gust = h.wind_gusts_10m?.[p.k];
            p.pr = h.precipitation?.[p.k];
            p.vis = h.visibility?.[p.k];
            p.dir = h.wind_direction_10m?.[p.k];
          });

          // حساب زاوية الرياح الجانبية لكل نقطة (رياح عمودية على اتجاه الطريق خطيرة)
          pts.forEach((p) => {
            const diff = Math.abs(((p.dir ?? 0) - (p.bearing ?? 0)) % 180);
            p.cross = 1 - Math.abs(diff / 90 - 1); // 1 = عمودية تمامًا
          });

          drawRoute(coords, pts);
          renderAllTrip(A, B, { coords, distM, durSec, pts, totalKm });
          lastTrip = { A, B, coords, distM, durSec, pts, totalKm };
          /* إصدار 17: شريط الانطلاق يعود إلى «الآن» مع كل فحص جديد */
          depOffsetH = 0;
          updateDepPills();
          /* إصدار 17: محطات الاستراحة الآمنة — عند خطورة جوية جادة (مستوى 2) تُجلب تلقائيًا
             كي تجد المستشفيات ومحطات الوقود جاهزة على الخريطة قبل أن تسأل */
          clearRestStops();
          if (el.restStatus) el.restStatus.textContent = tr("مستشفيات ومحطات وقود ونقاط استراحة قريبة من مسارك — تظهر تلقائيًا عند وجود تنبيه جوي خطير، أو اضغط الزر لعرضها في أي وقت.");
          const worstLevel = Math.max(...pts.map((p) => p.info.level));
          if (worstLevel >= 2) fetchRestStops(true);
          // المرحلة 12: بث بيانات الرحلة للمستشار الذكي للقيادة (تحليل فوري بأسلوب بشري)
          document.dispatchEvent(new CustomEvent("matar:route", { detail: { A, B, distM, durSec, totalKm, pts } }));
          el.results.classList.remove("hidden");
          // المرحلة 3: نوضح للمستخدم إن نزل المسار على مزوّد بديل
          if (route.fallbackUsed) {
            setStatus(tf("تم رسم الطريق الفعلي ({v} كم) عبر البديل الاحتياطي ({p}) · طقس الانطلاق والمنتصف والوصول جاهز بالأعلى.", { v: localNum(totalKm), p: route.provider.label }));
          } else {
            setStatus(tf("تم رسم الطريق الفعلي ({v} كم) · طقس الانطلاق والمنتصف والوصول جاهز بالأعلى.", { v: localNum(totalKm) }));
          }
        }

        function tripPopupHtml(p, title) {
          const flags = FLAG_ORDER.filter((k) => p.info.f[k]);
          const code = p.hourly?.weather_code?.[p.k] ?? 0;
          const advice = p.info.level === 2
            ? tr("⚠️ ظروف خطرة هنا: يُنصح بتأجيل الرحلة أو اختيار طريق بديل.")
            : p.info.level === 1 ? tr("⚠️ خفّف السرعة وزد الحذر عند هذه النقطة.") : tr("سالك — لا مخاطر ظاهرة.");
          /* إصلاح حرارة الطرق: إظهار ساعة البيانات الفعلية كي يطابق المرء الحرارة بلحظتها */
          const dataHour = p.hourStamp ? ` · <small>${tf("بيانات الساعة {v}", { v: placeClock(p.hourStamp) })}</small>` : "";
          return `
            <div class="trip-pop">
              <b>${title}</b>
              <div>${wmoSvg(code, 1, 15)} ${wmoDesc(code)} · ${tempText(p.temp)}${dataHour}</div>
              <div>${tf("الوصول المتوقع {v}", { v: clockText(new Date(p.eta)) })}</div>
              <div>${tf("💨 {w} (هبّات {g}) كم/س", { w: localNum(p.wind), g: localNum(p.gust) })}</div>
              <div>${tf("💧 {p} مم/س · 👁 {v} كم", { p: localNum(p.pr, 1), v: p.vis != null ? localNum(p.vis / 1000, 1) : "—" })}</div>
              ${flags.length ? flags.map((k) => `<div>${FLAG_META[k].icon} ${FLAG_META[k].label}</div>`).join("") : `<div>${tr("لا تنبيهات")}</div>`}
              <div class="trip-pop-advice">${advice}</div>
            </div>`;
        }

        /* إصدار 17: عنوان نقطة على المسار — بأقرب مدينة داخل مصر وبالكيلومتر خارجها */
        function pointTitle(p) {
          if (p.city) return tf("📍 قرب {c} · {v} كم من الانطلاق", { c: escapeHtml(cityName(p.city)), v: localNum(p.km) });
          return tf("📍 نقطة على بعد {v} كم", { v: localNum(p.km) });
        }

        function drawRoute(coords, pts) {
          if (!window.L) return;
          ensureRoadMap();
          if (roadLayer) roadLayer.remove();
          roadLayer = L.layerGroup().addTo(roadMap);
          // تطوير: الخط الأزرق الفعلي للطريق (بأسلوب خرائط جوجل): غلاف أبيض + خط أزرق
          const full = coords.map((c) => [c[1], c[0]]);
          /* إصدار 39: smoothFactor: 1.5 — تبسيط أذكى للمسار عند كل مستوى زووم
             (Smooth & Simplify) فيبقى خط الطريق انسيابيًا ناعمًا دون كسور أو
             أسنان منشارية على الحواف، وخاصة على مسارات الجوال الطويلة */
          L.polyline(full, { color: "#ffffff", weight: 10, opacity: 0.9, smoothFactor: 1.5, lineCap: "round", lineJoin: "round" }).addTo(roadLayer);
          /* ═══ v45: تلوين مسار الرحلة حسب طقس كل مقطع عند وقت الوصول المتوقع (Color-Coded Route) ═══
             أخضر: أجواء آمنة صافية · سماوي: آمن غائم · أصفر: رياح متوسطة أو غبار ·
             أحمر متوهج (هالة): شبورة كثيفة أو أمطار غزيرة أو عواصف رعدية — والطقس
             مقروء عند ساعة وصولك لكل مقطع لا عند ساعة الانطلاق. */
          const segColor = (p) => {
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            if (p.info.level === 2) return TRIP_COLORS[2];
            if (p.info.level === 1 || (p.wind ?? 0) >= 30 || (code >= 30 && code <= 35)) return TRIP_COLORS[1];
            return code <= 1 ? "#2e9e5b" : "#1f9eae";
          };
          for (let i = 1; i < pts.length; i += 1) {
            const a = pts[i - 1], b = pts[i];
            const seg = coords.slice(a.idx, b.idx + 1).map((c) => [c[1], c[0]]);
            if (seg.length < 2) continue;
            const lvl = Math.max(a.info.level, b.info.level);
            const col = lvl === 2 ? TRIP_COLORS[2] : lvl === 1 ? TRIP_COLORS[1] : segColor(b);
            if (lvl === 2) L.polyline(seg, { color: col, weight: 13, opacity: 0.3, smoothFactor: 1.5, lineCap: "round", lineJoin: "round" }).addTo(roadLayer);
            L.polyline(seg, { color: col, weight: 6, opacity: 0.98, smoothFactor: 1.5, lineCap: "round", lineJoin: "round" }).addTo(roadLayer);
          }
          /* v45: دبابيس الحرارة وحالة الجو عند وقت الوصول لكل محطة على المسار —
             شارة حرارة بلون مستوى الخطورة، والنقر يفتح تفاصيل النقطة الكاملة */
          pts.forEach((p) => {
            if (p.role) return; // الانطلاق والمنتصف والوصول لها دبابيسها الخاصة أدناه
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            const t = p.temp != null ? Math.round(p.temp) : null;
            const cld = code > 1 ? " cld" : "";
            L.marker([p.lat, p.lon], {
              icon: L.divIcon({
                className: "",
                html: `<span class="trip-thermo lv${p.info.level}${cld}">${wmoSvg(code, 1, 12)}${t != null ? `<b>${localNum(t)}°</b>` : ""}</span>`,
                iconSize: [46, 26], iconAnchor: [23, 13],
              }),
              zIndexOffset: 300,
            }).bindPopup(tripPopupHtml(p, pointTitle(p))).addTo(roadLayer);
          });
          // شارة الطقس عند منتصف المسار
          pts.filter((p) => p.role === "mid").forEach((p) => {
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            L.marker([p.lat, p.lon], {
              icon: L.divIcon({
                className: "",
                html: `<span class="trip-wx key lv${p.info.level}">${wmoSvg(code, 1, 16)}</span>`,
                iconSize: [34, 34], iconAnchor: [17, 17],
              }),
            }).bindPopup(tripPopupHtml(p, "🧭 منتصف المسار")).addTo(roadLayer);
          });
          // دبابيس البداية والنهاية (منسجمة مع دبابيس التحديد القابلة للسحب)
          ensureEndpointPin("from", pts[0].lat, pts[0].lon);
          ensureEndpointPin("to", pts[pts.length - 1].lat, pts[pts.length - 1].lon);
          pickMarkers.from?.bindPopup(tripPopupHtml(pts[0], "🅐 نقطة الانطلاق"));
          pickMarkers.to?.bindPopup(tripPopupHtml(pts[pts.length - 1], "🅑 نقطة الوصول"));
          roadMap.fitBounds(L.latLngBounds(coords.map((c) => [c[1], c[0]])), { padding: [40, 40] });
          refreshTrafficEstimate(); // v45: إعادة رسم التقدير المحلي للزحمة إن كانت الطبقة مفعلة
          setTimeout(() => roadMap.invalidateSize(), 80);
        }

        /* ════════════════ v45 — مبدّل أساسات الخريطة + حركة المرور الحية 🚦 ════════════════
           ① ثلاثة أساسات Esri مجانية بلا مفتاح API: داكن (v57: شوارع World Street
              Map بفلتر ليلي فاخر)، شوارع (World Street Map)، قمر صناعي (World Imagery
              مع تسميات World Reference Overlay في لوح z-index 650 لتظهر أسماء المدن
              والطرق بوضوح فوق كل الطبقات).
           ② طبقة حركة المرور الحية: محاولة بث Esri World Traffic أولًا (طلباته تمر عبر
              الشبكة حصرًا بلا تخزين وفق قاعدة traffic في sw.js)، وعند أي إخفاق (الخدمة
              تتطلب اشتراكًا في بعض المناطق) يتحول الزر تلقائيًا إلى «التقدير المحلي الحي»
              لوقت الذروة بألوان قياسية: أخضر سيولة · أصفر بطء · أحمر ازدحام شديد،
              في لوح فوق الخريطة وتحت دبابيس الطقس. */
        const ROAD_BASES = {
          /* v57: «🌙 داكن» — شوارع Esri بفلتر ليلي فاخر (.mx-dark-base) على كل
             المستويات (0–19): طرق وحدود ومدن وسواحل واضحة تمامًا بدل الجبال،
             والتسميات مدمجة داخل بلاطات الشوارع فلا طبقة مرجع ولا هيلشيد */
          dark: {
            name: tr("داكن"),
            base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            baseOpts: { maxZoom: 19, maxNativeZoom: 19, className: "mx-dark-base" },
            far: null,
            farOpts: null,
            labels: null,
            labelOpts: null,
          },
          streets: {
            name: tr("شوارع"),
            base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            baseOpts: { maxZoom: 19, maxNativeZoom: 19, minZoom: 10 },
            far: ESRI_HILL_FAR,
            farOpts: { minZoom: 0, maxZoom: 9, maxNativeZoom: 12 },
            labels: null,
            labelOpts: null,
          },
          satellite: {
            name: tr("قمر صناعي"),
            base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            baseOpts: { maxZoom: 19, maxNativeZoom: 17 },
            /* v58: أسماء الشوارع والمحاور فوق القمر الصناعي — طبقة Esri
               World_Transportation في لوح علوي (roadLabels z-index 650) بفئة
               satellite-hybrid-labels (خطوط بيضاء ناعمة شبه شفافة: opacity 0.72 +
               brightness 1.3 + contrast 1.1 + drop-shadow حاد) بنمط خرائط الملاحة
               الفاخرة، مع بديل احتياطي Dark Gray Reference عند إخفاقات متكررة */
            labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
            labelOpts: { maxZoom: 19, maxNativeZoom: 19, className: "satellite-hybrid-labels" },
            labelsFallback: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
            labelsFallbackOpts: { maxZoom: 19, maxNativeZoom: 16 },
          },
        };
        const ROAD_BASE_KEY = "matar:roadBase";
        let roadBaseMode = null;
        let roadBaseLayer = null;
        let roadFarLayer = null; /* v55: أساس الهيلشيد للمستويات البعيدة والمتوسطة */
        let roadLabelsLayer = null;
        let roadLabelsErrors = 0;
        let trafficOn = false;
        let trafficMode = "off"; // off | esri | est
        let trafficLayer = null;
        let trafficErrors = 0;
        let trafficEstLayer = null;

        function roadSavedBase() {
          try {
            const v = localStorage.getItem(ROAD_BASE_KEY);
            return v && ROAD_BASES[v] ? v : "dark";
          } catch (e) { return "dark"; }
        }

        function setRoadBase(mode) {
          if (!roadMap || !ROAD_BASES[mode]) return;
          const def = ROAD_BASES[mode];
          roadBaseMode = mode;
          try { localStorage.setItem(ROAD_BASE_KEY, mode); } catch (e) { /* تفضيل مؤقت */ }
          if (roadBaseLayer) { try { roadMap.removeLayer(roadBaseLayer); } catch (e) {} roadBaseLayer = null; }
          if (roadFarLayer) { try { roadMap.removeLayer(roadFarLayer); } catch (e) {} roadFarLayer = null; }
          if (roadLabelsLayer) { try { roadMap.removeLayer(roadLabelsLayer); } catch (e) {} roadLabelsLayer = null; }
          roadLabelsErrors = 0;
          /* بلاطات Esri بنمط <img> العادي بلا crossOrigin — تُعرض طبيعيًا (نهج v44)،
             وupdateWhenIdle:false + keepBuffer:4 لتحريك سلس دون وميض */
          const common = { updateWhenIdle: false, keepBuffer: 4, attribution: ESRI_REF };
          roadBaseLayer = L.tileLayer(def.base, { ...common, ...def.baseOpts }).addTo(roadMap);
          roadBaseLayer.bringToBack();
          /* v55: أساس المستويات البعيدة النظيف — يظهر 0–9 تلقائيًا عبر حدود الزووم */
          if (def.far) {
            roadFarLayer = L.tileLayer(def.far, { ...common, ...def.farOpts }).addTo(roadMap);
            roadFarLayer.bringToBack();
          }
          if (def.labels) {
            roadLabelsLayer = L.tileLayer(def.labels, { ...common, ...def.labelOpts, pane: "roadLabels" }).addTo(roadMap);
            roadLabelsLayer.on("tileerror", () => {
              /* بديل احتياطي: إذا رفض مزوّد التسميات كثيرًا نستبدل بـ Dark Gray Reference */
              if (++roadLabelsErrors < 8 || !def.labelsFallback) return;
              roadLabelsErrors = -9999;
              try { roadMap.removeLayer(roadLabelsLayer); } catch (e) {}
              roadLabelsLayer = L.tileLayer(def.labelsFallback, { ...common, ...def.labelsFallbackOpts, pane: "roadLabels" }).addTo(roadMap);
            });
          }
          document.querySelectorAll("#map-switch .ms-btn[data-base]").forEach((b) => {
            b.setAttribute("aria-pressed", String(b.dataset.base === mode));
          });
        }

        /* طبقة Esri World Traffic الديناميكية: كل بلاطة طلب export مستقل بحدودها الجغرافية.
           تُبنى الكلاس ببطء (Lazy) عند أول استخدام بعد جاهزية Leaflet لأن الموديول يُقيّم قبل تحميلها */
        let EsriTrafficLayer = null;
        function esriTrafficClass() {
          if (EsriTrafficLayer || !window.L) return EsriTrafficLayer;
          EsriTrafficLayer = L.TileLayer.extend({
            getTileUrl(coords) {
              try {
                const b = this._tileCoordsToBounds(coords);
                const sw = b.getSouthWest(), ne = b.getNorthEast();
                const bbox = `${sw.lng.toFixed(6)},${sw.lat.toFixed(6)},${ne.lng.toFixed(6)},${ne.lat.toFixed(6)}`;
                return `https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=3857&size=256,256&transparent=true&format=png8&layers=show:1&f=image&_=${Date.now()}`;
              } catch (e) { return ""; }
            },
          });
          return EsriTrafficLayer;
        }

        function trafficStatus(text) {
          const chip = $("#traffic-status");
          if (chip) chip.textContent = text || "";
        }

        /* التقدير المحلي الحي للزحمة (وقت الذروة الحضري العام) — صفر طلبات شبكة:
           ذروة صباحية 7–9 ومسائية 15–19 = ازدحام شديد، ساعات الوسط = بطء، والباقي سيولة */
        function localJamLevel(d) {
          const h = d.getHours();
          if ((h >= 7 && h <= 9) || (h >= 15 && h <= 19)) return 2;
          if ((h >= 10 && h <= 14) || (h >= 20 && h <= 22)) return 1;
          return 0;
        }
        const JAM_COLORS = ["#2e9e5b", "#e0a526", "#d6453d"];

        function clearTrafficLayers() {
          if (trafficLayer) { try { roadMap.removeLayer(trafficLayer); } catch (e) {} trafficLayer = null; }
          if (trafficEstLayer) { try { roadMap.removeLayer(trafficEstLayer); } catch (e) {} trafficEstLayer = null; }
        }

        function drawLocalJam() {
          if (!roadMap || !lastTrip) return;
          if (trafficEstLayer) { try { trafficEstLayer.remove(); } catch (e) {} trafficEstLayer = null; }
          trafficEstLayer = L.layerGroup().addTo(roadMap);
          const lvl = localJamLevel(new Date());
          const pj = lastTrip.pts, cj = lastTrip.coords;
          for (let i = 1; i < pj.length; i += 1) {
            const seg = cj.slice(pj[i - 1].idx, pj[i].idx + 1).map((c) => [c[1], c[0]]);
            if (seg.length < 2) continue;
            L.polyline(seg, { pane: "roadTraffic", color: "#ffffff", weight: 18, opacity: 0.5, smoothFactor: 1.5, lineCap: "round", lineJoin: "round" }).addTo(trafficEstLayer);
            L.polyline(seg, { pane: "roadTraffic", color: JAM_COLORS[lvl], weight: 14, opacity: 0.95, smoothFactor: 1.5, lineCap: "round", lineJoin: "round" }).addTo(trafficEstLayer);
          }
        }

        function refreshTrafficEstimate() {
          /* تُستدعى بعد كل رسم مسار: بث Esri مستقل عن المسار، أما التقدير المحلي فيتبعه */
          if (!trafficOn || trafficMode !== "est") return;
          drawLocalJam();
        }

        function startTrafficEsri() {
          const Cls = esriTrafficClass();
          if (!Cls) { trafficMode = "est"; drawLocalJam(); trafficStatus(tr("تقدير محلي — وقت الذروة")); return; }
          trafficMode = "esri";
          trafficErrors = 0;
          trafficStatus(tf("{v} …", { v: tr("جارٍ الاتصال ببث الزحمة الحي") }));
          trafficLayer = new Cls("", {
            pane: "roadTraffic", opacity: 0.92, maxZoom: 19, maxNativeZoom: 17,
            updateWhenIdle: false, keepBuffer: 4,
            errorTileUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          }).addTo(roadMap);
          trafficLayer.on("tileload", () => {
            if (trafficMode === "esri") trafficStatus(tr("بث حي — Esri Traffic"));
          });
          trafficLayer.on("tileerror", () => {
            if (trafficMode !== "esri") return;
            if (++trafficErrors < 6) return;
            /* الخدمة تتطلب اشتراكًا في هذه المنطقة — تحول تلقائي للتقدير المحلي الحي */
            clearTrafficLayers();
            trafficMode = "est";
            drawLocalJam();
            trafficStatus(lastTrip ? tr("تقدير محلي — وقت الذروة") : tr("تقدير محلي — افحص طريقًا لتظهر الزحمة عليه"));
          });
        }

        function toggleTraffic() {
          trafficOn = !trafficOn;
          $("#traffic-toggle")?.setAttribute("aria-pressed", String(trafficOn));
          if (!trafficOn) {
            clearTrafficLayers();
            trafficMode = "off";
            trafficStatus("");
            return;
          }
          if (!roadMap || Eco.isEco()) {
            trafficOn = false;
            $("#traffic-toggle")?.setAttribute("aria-pressed", "false");
            try { window.__matarEcoBite?.(60, "حركة المرور"); } catch (e) {}
            setStatus(tr("طبقة الزحمة تحتاج إيقاف الوضع الاقتصادي أولًا."), true);
            return;
          }
          startTrafficEsri();
        }

        function initRoadSwitcher() {
          if (!roadMap) return;
          /* لوح التسميات المستقل: فوق كل الطبقات والتنبيهات (z-index 650) ولا يلتقط أي لمسة */
          if (!roadMap.getPane("roadLabels")) {
            const pane = roadMap.createPane("roadLabels");
            pane.style.zIndex = "650";
            pane.style.pointerEvents = "none";
          }
          /* لوح الزحمة: فوق بلاطات الأساس (200) وتحت خط المسار (400) ودبابيس الطقس (600) */
          if (!roadMap.getPane("roadTraffic")) {
            const pane = roadMap.createPane("roadTraffic");
            pane.style.zIndex = "390";
            pane.style.pointerEvents = "none";
          }
          el.mapSwitch?.classList.remove("hidden");
          setRoadBase(roadSavedBase());
          document.querySelectorAll("#map-switch .ms-btn[data-base]").forEach((b) => {
            b.addEventListener("click", () => setRoadBase(b.dataset.base));
          });
          $("#traffic-toggle")?.addEventListener("click", toggleTraffic);
        }

        /* ════════════════ v45 — مؤشر الرياح الجانبية + أفضل وقت للتحرك ════════════════
           المكوّن الجانبي الفعلي بالسرعة = السرعة × جيب الزاوية بين اتجاه الرياح ومسار
           السيارة، والطولي = × جيب التمام (موجب: معاكسة تعيق — سالب: موافقة تدفع).
           زر «أفضل وقت للتحرك» يفحص الساعات الست القادمة محليًا من بيانات الفحص نفسها
           (صفر طلبات شبكة) ويقترح الساعة الأقل خطورة على كل نقاط المسار. */
        function crosswindComps(p) {
          const ang = ((p.dir ?? 0) - (p.bearing ?? 0)) * Math.PI / 180;
          const s = Math.abs(Math.sin(ang));
          return {
            side: s * (p.wind ?? 0),
            sideGust: s * (p.gust ?? 0),
            longi: Math.cos(ang) * (p.wind ?? 0),
          };
        }

        function renderWindSide(pts) {
          if (!el.windSide) return;
          const list = Array.isArray(pts) ? pts : [];
          if (!list.length) { el.windSide.classList.add("hidden"); return; }
          let worst = null, wv = -1, head = 0, tail = 0;
          list.forEach((p) => {
            const c = crosswindComps(p);
            if (c.sideGust > wv) { wv = c.sideGust; worst = { p, c }; }
            head = Math.max(head, c.longi);
            tail = Math.max(tail, -c.longi);
          });
          const v = Math.round(wv);
          /* v46: حكم الرياح الجانبية يتكيف مع حساسية المركبة المختارة */
          const vAdj = v / (window.__matarVeh?.() ?? 1);
          const verdict = vAdj >= 45 ? "danger" : vAdj >= 25 ? "warn" : "good";
          const vLabel = verdict === "danger" ? tr("رياح جانبية خطرة") : verdict === "warn" ? tr("رياح جانبية محسوسة") : tr("لا رياح جانبية مؤثرة");
          const where = worst?.p ? (worst.p.city ? tf("قرب {c} · {v} كم", { c: cityName(worst.p.city), v: localNum(worst.p.km) }) : tf("عند {v} كم من الانطلاق", { v: localNum(worst.p.km) })) : "";
          const advice = verdict === "danger"
            ? tr("أمسك المقود بإحكام، خفف السرعة قبل الجسور والطرق المكشوفة، وانتبه للانزياح الجانبي عند الهبّات.")
            : verdict === "warn"
              ? tr("احفظ قبضة ثابتة على المقود وكن مستعدًا لانزياح بسيط في القطاعات المكشوفة.")
              : tr("قبضة عادية تكفي — لا انزياح جانبي متوقع على هذا المسار في هذا التوقيت.");
          const windTxt = head >= 18 ? tf("رياح معاكسة ~{v} كم/س تزيد الاستهلاك وزمن الوصول", { v: localNum(Math.round(head)) })
            : tail >= 18 ? tf("رياح موافقة ~{v} كم/س تساعدك على القطاعات المكشوفة", { v: localNum(Math.round(tail)) })
            : tr("لا رياح طولية مؤثرة (معاكسة أو موافقة)");
          const pct = clamp(Math.round((wv / 70) * 100), 2, 100);
          el.windSide.dataset.v = verdict;
          el.windSide.innerHTML = `
            <div class="ws-top">
              <span class="ws-title">${iconSvg("wind", 16)} ${escapeHtml(tr("مؤشر الرياح الجانبية"))}</span>
              <span class="ws-verdict" data-v="${verdict}">${escapeHtml(vLabel)}</span>
              <button type="button" class="ws-best-btn" data-act="best">⏱ ${escapeHtml(tr("أفضل وقت للتحرك"))}</button>
            </div>
            <div class="ws-gauge" role="img" aria-label="${escapeHtml(tf("أقصى رياح جانبية {v} كم/س", { v: localNum(v) }))}">
              <span class="ws-dot" style="left:${pct}%"></span>
            </div>
            <div class="ws-ends"><span>${escapeHtml(tr("هادئة 0"))}</span><span>70+ ${escapeHtml(tr("كم/س خطرة"))}</span></div>
            <div class="ws-rows">
              <div>${tf("💨 أقصى مكوّن جانبي: {v} كم/س (هبّات {g}) · {w}", { v: localNum(v), g: worst ? localNum(Math.round(worst.c.sideGust)) : "—", w: where })}</div>
              <div>🧭 ${escapeHtml(windTxt)}</div>
              <div class="ws-advice">${escapeHtml(advice)}</div>
            </div>
            <div class="ws-best" id="wind-best" hidden></div>`;
        }

        /* فحص أفضل ساعة انطلاق من الساعات الست القادمة — محلي بالكامل من p.hourly */
        function bestDepartureScan() {
          const bestBox = document.getElementById("wind-best");
          if (!bestBox || !lastTrip) { setStatus(tr("افحص الطريق أولًا كي نحسب أفضل وقت للتحرك."), true); return; }
          const now = Date.now();
          const cands = [];
          for (let off = 0; off <= 6; off += 1) {
            let red = 0, yellow = 0, worstX = 0;
            lastTrip.pts.forEach((p) => {
              const eta = now + off * HOUR + (p.km / Math.max(lastTrip.totalKm, 0.001)) * lastTrip.durSec * 1000;
              const h = p.hourly;
              if (!h?.time?.length) return;
              const k = hourIndexFor(h, eta, p.utcOff ?? 0);
              const info = classify(h, k);
              const wind = h.wind_speed_10m?.[k] ?? 0, gust = h.wind_gusts_10m?.[k] ?? 0;
              const dir = h.wind_direction_10m?.[k] ?? 0;
              const s = Math.abs(Math.sin((dir - (p.bearing ?? 0)) * Math.PI / 180));
              worstX = Math.max(worstX, s * Math.max(gust, wind * 1.35));
              if (info.level === 2) red += 1; else if (info.level === 1) yellow += 1;
            });
            const risk = red * 5 + yellow * 2 + (worstX >= 45 ? 3 : worstX >= 25 ? 1 : 0);
            cands.push({ off, red, yellow, worstX, risk });
          }
          const best = cands.reduce((a, b) => (b.risk < a.risk ? b : a));
          bestBox.hidden = false;
          bestBox.innerHTML = `
            <div class="ws-best-title">${escapeHtml(tr("مقارنة الساعات الـ 6 القادمة — محليًا من بيانات الفحص"))}</div>
            <div class="ws-cands">
              ${cands.map((c) => {
                const dot = c.red ? "lv2" : c.yellow ? "lv1" : "lv0";
                return `<button type="button" class="ws-cand${c.off === best.off ? " best" : ""}" data-off="${c.off}">
                  <b>${escapeHtml(c.off === 0 ? tr("الآن") : tf("+{h} س", { h: localNum(c.off) }))}</b>
                  <span>${escapeHtml(clockText(new Date(now + c.off * HOUR)))}</span>
                  <i class="ws-dot-mini ${dot}"></i>
                  <small>${escapeHtml(c.worstX >= 25 ? tf("جانبية {v}", { v: localNum(Math.round(c.worstX)) }) : tr("سليم"))}</small>
                </button>`;
              }).join("")}
            </div>
            <p class="ws-best-msg">${best.off === 0
              ? escapeHtml(tr("✅ الانطلاق الآن هو الخيار الأقل خطورة على هذا المسار — لا داعي للانتظار."))
              : escapeHtml(tf("⏱ الأفضل: الانتظار حتى {t} (بعد {h} ساعة) — يقلل المخاطر على نقاط المسار. اضغط الساعة لتطبيقها.", { t: clockText(new Date(now + best.off * HOUR)), h: localNum(best.off) }))}</p>`;
        }

        /* ربط أزرار الرياح/الأفضل (تفويض لأن المحتوى يُعاد بناؤه مع كل تحديث) */
        el.windSide?.addEventListener("click", (e) => {
          const b = e.target.closest("[data-act], .ws-cand");
          if (!b) return;
          if (b.dataset.act === "best") bestDepartureScan();
          else if (b.classList.contains("ws-cand")) applyDeparture(Number(b.dataset.off) || 0);
        });

        function renderSummary(A, B, { distM, durSec, pts }) {
          const worst = Math.max(...pts.map((p) => p.info.level));
          const hours = Math.floor(durSec / 3600), mins = Math.round((durSec % 3600) / 60);
          const arrive = new Date(Date.now() + depOffsetH * HOUR + durSec * 1000); // إصدار 17: يشمل تأجيل الانطلاق المختار
          const badgeText = worst === 2 ? tr("⚠️ مخاطر جادة على المسار") : worst === 1 ? tr("⚠️ حذر مطلوب في أجزاء") : tr("✅ الطريق سالك غالبًا");
          const risky = pts.filter((p) => p.info.level > 0).length;
          /* طلب المستخدم: زر يأخذك لخرائط جوجل لبدء التنقل مباشرة على المسار المحدد —
             Deep-Link رسمي: origin/destination بإحداثيات أول وآخر نقطة مسار مُقاسَين فعليًا
             (أدق من نص المكان)، وdir_action=navigate يفتح وضع القيادة خطوة بخطوة فورًا.
             رابط عادي target=_blank لا يخالف CSP (لا form ولا iframe) ويعمل على الهاتف والحاسوب */
          const o = pts[0], d = pts[pts.length - 1];
          const gmapsUrl = o && d
            ? `https://www.google.com/maps/dir/?api=1&origin=${o.lat.toFixed(5)},${o.lon.toFixed(5)}&destination=${d.lat.toFixed(5)},${d.lon.toFixed(5)}&travelmode=driving&dir_action=navigate`
            : null;
                    el.summary.innerHTML = `
            <div class="trip-stat"><span>${tr("المسافة")}</span><b>${localNum(distM / 1000)} ${tr("كم")}</b></div>
            <div class="trip-stat"><span>${tr("مدة القيادة التقديرية")}</span><b>${tf("{h} س {m} د", { h: number(hours), m: number(mins) })}</b></div>
            <div class="trip-stat"><span>${tr("الوصول المتوقع")}</span><b>${clockText(arrive)}</b></div>
            <div class="trip-stat"><span>${tr("نقاط تحتاج انتباه")}</span><b>${tf("{r} من {n}", { r: number(risky), n: number(pts.length) })}</b></div>
            <div class="overall-badge lv${worst}">${badgeText}</div>
          ${gmapsUrl ? `
          <div class="trip-actions">
            <a class="gmaps-btn" href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(tr("ابدأ القيادة على خرائط جوجل"))}">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.5S5 14.2 5 9.4a7 7 0 1 1 14 0c0 4.8-7 12.1-7 12.1Z"/><circle cx="12" cy="9.4" r="2.4"/><path d="M17.5 20.5 21 21.5l-1-3.5"/></svg>
              <span>${tr("ابدأ القيادة على خرائط جوجل")}</span>
            </a>
            <span class="gmaps-hint">${tr("يفتح تطبيق خرائط جوجل بنفس المسار لوضع التنقل خطوة بخطوة")}</span>
          </div>` : ""}`;
        }

        // بطاقات النقاط الذكية الثلاث: الانطلاق · منتصف المسار · الوصول
        function renderKeypoints(pts) {
          if (!el.keypoints) return;
          const roles = pts.filter((p) => p.role);
          if (!roles.length) { el.keypoints.innerHTML = ""; return; }
          const meta = {
            start: { title: tr("نقطة الانطلاق"), icon: "🅐" },
            mid: { title: tr("منتصف المسار"), icon: "🧭" },
            end: { title: tr("نقطة الوصول"), icon: "🅑" },
          };
          el.keypoints.innerHTML = roles.map((p) => {
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            const flags = FLAG_ORDER.filter((k) => p.info.f[k]);
            return `
              <div class="key-card" data-level="${p.info.level}">
                <div class="key-head"><span class="key-role">${meta[p.role].icon} ${meta[p.role].title}</span><span class="key-eta">${clockText(new Date(p.eta))}</span></div>
                <div class="key-main"><span class="key-emoji" aria-hidden="true">${wmoSvg(code, 1, 22)}</span><span>${wmoDesc(code)} · ${tempText(p.temp)}</span></div>
                <div class="key-sub">${tf("💨 {w} (هبّات {g}) كم/س · 💧 {p} مم/س", { w: localNum(p.wind), g: localNum(p.gust), p: localNum(p.pr, 1) })}<br>${p.city
                  ? tf("👁 {v} كم · 📍 قرب {c} · {k} كم من الانطلاق", { v: p.vis != null ? localNum(p.vis / 1000, 1) : "—", c: escapeHtml(cityName(p.city)), k: localNum(p.km) })
                  : tf("👁 {v} كم · 📍 {k} كم من الانطلاق", { v: p.vis != null ? localNum(p.vis / 1000, 1) : "—", k: localNum(p.km) })}</div>
                ${flags.length ? `<div class="wp-flags">${flags.map((k) => `<span class="wp-flag lv${p.info.level}">${FLAG_META[k].icon} ${FLAG_META[k].label}</span>`).join("")}</div>` : ""}
              </div>`;
          }).join("");
        }

        function renderWaypoints(pts) {
          el.wpStrip.innerHTML = pts.map((p, i) => {
            const flags = FLAG_ORDER.filter((k) => p.info.f[k]);
            const mainFlag = flags[0];
            return `
              <div class="wp-card" data-level="${p.info.level}">
                <div class="wp-eta"><span>${i === 0 ? tr("الانطلاق") : p.role === "mid" ? tr("منتصف المسار") : i === pts.length - 1 ? tf("الوصول {v}", { v: clockText(new Date(p.eta)) }) : tf("المرور ~{v}", { v: clockText(new Date(p.eta)) })}</span><span class="wp-emoji">${mainFlag ? FLAG_META[mainFlag].icon : p.info.level === 0 ? iconSvg("ok", 14) : iconSvg("warn", 14)}</span></div>
                <div class="wp-main">${tempText(p.temp)} · ${p.city ? `${escapeHtml(tf("قرب {c}", { c: cityName(p.city) }))}` : `${localNum(p.km)} كم`}</div>
                <div class="wp-sub">${tf("💨 {w} (هبّات {g}) كم/س", { w: localNum(p.wind), g: localNum(p.gust) })} (${windDirName(p.dir)})<br>${tf("💧 {p} مم/س · 👁 {v} كم", { p: localNum(p.pr, 1), v: p.vis != null ? localNum(p.vis / 1000, 1) : "—" })}</div>
                <div class="wp-flags">
                  ${flags.length ? flags.map((k) => `<span class="wp-flag lv${p.info.level}">${FLAG_META[k].icon} ${FLAG_META[k].label}</span>`).join("") : `${tr("طقس سليم")}`}
                </div>
              </div>`;
          }).join("");
        }

        function renderAlerts(pts) {
          const now = Date.now();
          const alerts = [];

          /* ═══ الميزة الجديدة — تنبيه الرياح الجانبية الديناميكي (Dynamic Crosswind Alert) ═══
             نقارن اتجاه مسار السيارة (bearing المجلوب من OSRM) مع سهم اتجاه الرياح القادمة:
             إذا كانت الزاوية عمودية أو قريبة من 90° (cross ≥ 0.65) وسرعة الهبّات ≥ 40 كم/س
             نُطلق تحذيرًا باسم القطاع بالكيلومتر: «تمسك بعجلة القيادة جيدًا».
             تُدرج أولًا في المصفوفة كي تتقدم دائمًا في الفرز المستقر وتتجاوز حد العرض 12. */
          pts.forEach((p) => {
            const gust = p.gust ?? 0, cross = p.cross ?? 0;
            /* v46: عتبة الرياح الجانبية تتكيف مع المركبة (دراجة/نقل أشد حساسية) */
            const gustThr = Math.round(clamp(40 / (window.__matarVeh?.() ?? 1), 26, 40));
            if (cross < 0.65 || gust < gustThr) return;
            if (p.eta - now > 12 * HOUR) return;
            const angle = Math.round(clamp(90 * cross, 0, 90));
            const severe = gust >= Math.round(gustThr * 1.5);
            alerts.push({
              kind: "crosswind",
              level: severe ? 2 : 1,
              title: severe ? tr("خطر: رياح جانبية شديدة على القطاع") : tr("رياح جانبية فعّالة على القطاع"),
              where: p.city ? tf("القطاع قرب {c} · {v} كم من الانطلاق", { c: cityName(p.city), v: localNum(p.km) }) : tf("القطاع عند {v} كم من الانطلاق", { v: localNum(p.km) }),
              when: clockText(new Date(p.eta)),
              extra: tf("هبّات {g} كم/س بزاوية ~{a}° عن مسار السيارة — {advice}", {
                g: localNum(gust), a: localNum(angle),
                advice: severe ? tr("تمسّك بالمقود جيدًا وقلّل السرعة قبل الجسور والطرق المكشوفة") : tr("خفف السرعة واحفظ قبضة ثابتة على المقود"),
              }),
            });
          });

          pts.forEach((p) => {
            FLAG_ORDER.forEach((k) => {
              if (!p.info.f[k]) return;
              const within12h = p.eta - now <= 12 * HOUR;
              if (!within12h) return;
              alerts.push({
                kind: k,
                level: p.info.level,
                title: FLAG_META[k].label,
                where: p.city ? tf("📍 قرب {c} · {v} كم", { c: cityName(p.city), v: localNum(p.km) }) : tf("📍 {v} كم من نقطة البداية", { v: localNum(p.km) }),
                when: clockText(new Date(p.eta)),
                extra: k === "wind" ? `${tf("هبّات {v} كم/س", { v: localNum(p.gust) })}${p.cross > 0.6 ? ` ${tr("وباتجاه جانبي على الطريق")}` : ""}` : k === "fog" || k === "dense" ? tf("مدى رؤية {v} كم", { v: p.vis != null ? localNum(p.vis / 1000, 1) : "—" }) : k === "rain" ? tf("شدة {v} مم/س", { v: localNum(p.pr, 1) }) : "",
              });
            });
          });
          if (!alerts.length) {
            el.alerts.innerHTML = `<p class="empty-note">${tr("✅ لا تنبيهات ضباب كثيف أو أمطار غزيرة أو رياح جانبية قوية خلال الـ 12 ساعة القادمة على نقاط هذا المسار. رحلة موفقة!")}</p>`;
            return;
          }
          alerts.sort((a, b) => a.level === b.level ? 0 : b.level - a.level);
          el.alerts.innerHTML = alerts.slice(0, 12).map((a) => `
            <div class="alert-card" data-kind="${a.kind}">
              <div class="alert-title">${FLAG_META[a.kind].icon} ${a.title}</div>
              <div class="alert-meta">
                <span>${tf("⏱ حوالي {v}", { v: a.when })}</span>
                <span>${a.where}</span>
                ${a.extra ? `<span>${a.extra}</span>` : ""}
                ${a.level === 2 ? `<span style="color:var(--danger);font-weight:800">${tr("خطورة عالية")}</span>` : ""}
              </div>
            </div>`).join("");
        }

        /* ═══ الميزة الجديدة — أفضل وقت للانطلاق (Best Time to Departure) ═══
           يفحص طقس نقطة الانطلاق الآن، وبعد ساعتين (+2)، وبعد أربع ساعات (+4).
           إن كان الآن ضباب كثيف أو مطرًا غزيرًا أو عاصفة رعدية ستنقشع لاحقًا،
           يقترح على السائق تأجيل الرحلة بمدة محددة مع نسبة التحسن المتوقعة،
           مثل: «تأجيل رحلتك لمدة ساعتين سيجنبك 90٪ من الضباب الكثيف الحالي». */
        function departureAdvice(pts) {
          const p = pts?.[0];
          const h = p?.hourly;
          if (!h?.time?.length) return null;
          const ar = isAr();
          const snap = (idx) => {
            const i = clamp(idx, 0, h.time.length - 1);
            return {
              vis: h.visibility?.[i],
              pr: h.precipitation?.[i],
              code: h.weather_code?.[i],
              gust: h.wind_gusts_10m?.[i],
            };
          };
          const now = snap(p.k), plus2 = snap(p.k + 2), plus4 = snap(p.k + 4);
          const fogNow = (now.vis != null && now.vis < 1000) || now.code === 45 || now.code === 48;
          const stormNow = (now.code ?? 0) >= 95;
          const rainNow = (now.pr ?? 0) >= 4;
          if (!fogNow && !stormNow && !rainNow) return null; // الانطلاق الآن لا يعاني — لا توصية

          // تقدير «درء الحرج» لكل لقطة: رؤية فعالة (م) — الضباب/العاصفة أولوية على المطر
          const effVis = (x) => {
            if (x.code >= 95) return 300;                       // عاصفة رعدية = أسوأ رؤية
            if (x.code === 45 || x.code === 48) return 400;      // شبورة معلنة بلا قياس
            return x.vis != null ? x.vis : 20000;
          };
          const impPct = (a, b) => clamp(Math.round((1 - a / Math.max(b, 1)) * 100), 5, 99);

          const cands = [[2, plus2], [4, plus4]]
            .filter(([, x]) => effVis(x) >= 1500 && (x.pr ?? 0) < Math.max(0.5, (now.pr ?? 0) * 0.4));
          if (cands.length) {
            const [hours, best] = cands[0];
            // نسبة التحسن: مطر غزير حاليًا ← نقارن بأفق رؤية صافٍ كامل؛ وإلا نقارن بالرؤية الفعلية للنافذة الأفضل
            const denom = (now.pr ?? 0) > 4 ? Math.max(effVis(best), 20000) : effVis(best);
            const imp = impPct(effVis(now), denom);
            const kind = stormNow ? "disease" : fogNow ? "frost" : "irrigation";
            const icon = stormNow ? "storm" : fogNow ? "fog" : "rain";
            const msg = stormNow
              ? (ar ? tf("عاصفة رعدية فوق نقطة الانطلاق الآن، ويُتوقع أن تنقشع بعد {h} ساعات. تأجيل رحلتك لمدة {h} ساعة يجعلك تتجاوز ذروة الهطول والرعد ويوفّر عليك ~{p}٪ من سوء الظروف الحالية.", { h: localNum(hours), p: localNum(imp) })
                : `A thunderstorm sits over your departure point now but should clear in about ${hours} h — delaying by ${hours} h avoids ~${imp}% of the current misery.`)
              : fogNow
                ? (ar ? tf("ضباب كثيف على نقطة الانطلاق الآن (الرؤية ~{v} كم). تأجيل رحلتك لمدة {h} ساعة يوفّر عليك ~{p}٪ من هذا الضباب — الانطلاق بعده أكثر أمانًا بكثير.", { v: now.vis != null ? localNum(now.vis / 1000, 1) : "—", h: localNum(hours), p: localNum(imp) })
                  : `Dense fog at departure now (~${now.vis != null ? (now.vis / 1000).toFixed(1) : "—"} km visibility). Delaying your trip by ${hours} h avoids ~${imp}% of the current fog.`)
                : (ar ? tf("مطر غزير على نقطة الانطلاق ({v} مم/س) يُتوقع أن يخف بعد {h} ساعات (تحسّن ~{p}٪). الانتظار يقيك الأسفلت الزلق ومسافة التوقف الأطول.", { v: localNum(now.pr, 1), h: localNum(hours), p: localNum(imp) })
                  : `Heavy rain (${now.pr?.toFixed(1)} mm/h) should ease after ${hours} h (~${imp}% improvement) — waiting avoids soaked asphalt.`);
            return { kind, icon, sev: "med", sevLabel: ar ? "توصية توقيت" : "Timing", title: tx("أفضل وقت للانطلاق", "Best departure window"), msg, when: ar ? tf("أفضل نافذة: بعد {h} ساعات من الآن", { h: localNum(hours) }) : `Best window: in ${hours} h` };
          }
          // لا تحسن واضح حتى +4 ساعات — توصية حذر بدل تأجيل وهمي
          const persists = tr(stormNow ? "العاصفة الرعدية قد تستمر حتى بعد أربع ساعات" : fogNow ? "الضباب الكثيف قد يستمر حتى بعد أربع ساعات" : "المطر الغزير قد يستمر حتى بعد أربع ساعات");
          return {
            kind: fogNow ? "frost" : "disease", icon: fogNow ? "fog" : "storm", sev: "high",
            sevLabel: ar ? "انتبه" : "Caution",
            title: ar ? "أفضل وقت للانطلاق" : "Best time to depart",
            msg: tf("{p} — إن اضطررت للانطلاق فاعتمد أضواء الضباب، خفف السرعة، وزد مسافة الأمان إلى الضعف، وفضّل الطرق الرئيسية المضاءة.", { p: persists }),
            when: tx("لا نافذة واضحة خلال 4 ساعات", "No clear window within 4 hours"),
          };
        }

        function renderDepartureAdvice(pts) {
          const box = document.getElementById("departure-advice");
          if (!box) return;
          const adv = departureAdvice(pts);
          box.classList.toggle("hidden", !adv);
          if (!adv) { box.innerHTML = ""; return; }
          box.innerHTML = `
            <div class="adv-card" data-kind="${adv.kind}">
              <span class="adv-title">${iconSvg(adv.icon, 14)} ${escapeHtml(adv.title)}<span class="adv-sev" data-sev="${adv.sev}">${escapeHtml(adv.sevLabel)}</span></span>
              <p class="adv-msg">${escapeHtml(adv.msg)}</p>
              <div class="adv-when">⏱ ${escapeHtml(adv.when)}</div>
            </div>`;
        }

        /* ═══════════════ إصدار 27 — تنبيهات المغادرة الذكية (Smart Departure Alerts) ═══════════════
           يمسح خطر المسار ساعة بساعة خلال الـ 12 ساعة القادمة (تصنيف كل نقطة في كل ساعة)
           ليكتشف الظواهر التي «ستتشكل» لاحقًا: ضباب كثيف، غبار، عاصفة، أمطار غزيرة، زلاجة.
           يقارن نوافذ الانطلاق الممكنة ويصيغ توصية صريحة:
             «يُنصح بتقديم موعد السفر ساعتين لتفادي الضباب على طريق…»
           مع زر إشعار هاتفي اختياري يذكّر قبل الموعد الموصى به (Notification API). */
        function routeHourlyWorst(pts, j) {
          let worst = null;
          pts.forEach((p) => {
            const h = p.hourly;
            if (!h?.time?.length) return;
            const k = (p.k ?? 0) + j;
            if (k >= h.time.length || k < 0) return;
            const info = classify(h, k);
            const score = (info.level ?? 0) * 100 + (h.wind_gusts_10m?.[k] ?? 0) / 4 + (h.precipitation?.[k] ?? 0) * 5;
            if (!worst || score > worst.score) worst = { p, k, info, score };
          });
          return worst;
        }

        function smartDepartureAlert(pts) {
          if (!pts?.length) return null;
          const ar = isAr();
          const H = 12;
          const perHour = Array.from({ length: H }, (_, j) => routeHourlyWorst(pts, j));
          const levelAt = (j) => perHour[j]?.info?.level ?? 0;
          const flagAt = (j) => FLAG_ORDER.find((k) => perHour[j]?.info?.f?.[k]) ?? null;
          const whereAt = (j) => {
            const p = perHour[j]?.p;
            if (!p) return "";
            return p.city ? tf("قرب {c} ({v} كم من الانطلاق)", { c: cityName(p.city), v: localNum(p.km) }) : tf("عند {v} كم من الانطلاق", { v: localNum(p.km) });
          };
          const clockAt = (j) => clockText(new Date(Date.now() + j * HOUR));
          const worstNow = levelAt(0);

          // الحالة ①: المسار سليم الآن لكن خطرًا سيتشكل لاحقًا → قدّم السفر قبل موعده
          const futureIdx = (() => {
            for (let j = 1; j < H; j += 1) if (levelAt(j) >= 1) return j;
            return -1;
          })();
          if (worstNow === 0 && futureIdx > 0) {
            const fl = flagAt(futureIdx);
            const label = fl ? FLAG_META[fl].label : tr("خطر جوي");
            const clearIdx = (() => {
              for (let j = futureIdx + 1; j < H; j += 1) if (levelAt(j) === 0) return j;
              return -1;
            })();
            return {
              sev: levelAt(futureIdx) >= 2 ? "high" : "med",
              icon: fl === "rain" ? "rain" : fl === "storm" ? "storm" : fl === "dust" ? "dust" : "fog",
              title: tr("تنبيه مغادرة ذكي: قدّم موعد السفر قبل تشكل الخطر"),
              msg: tf("{hazard} يتشكل على المسار حوالي {t} {where} — يُنصح بتقديم موعد السفر قبل ذلك بـ 1–2 ساعة{alt}. الانطلاق المبكر يجنبك الذروة كاملة.", {
                hazard: label, t: clockAt(futureIdx), where: whereAt(futureIdx),
                alt: clearIdx > 0 ? tf(" أو أجّل الرحلة كاملة إلى ما بعد {t}", { t: clockAt(clearIdx) }) : "",
              }),
              when: tf("نافذة الانطلاق المثلى: قبل {t}", { t: clockAt(futureIdx) }),
              bestStart: Math.max(0, futureIdx - 1),
            };
          }
          // الحالة ②: خطر الآن سينقشع لاحقًا → أجّل السفر حتى الانقشاع
          const clearIdx = (() => {
            for (let j = 1; j < H; j += 1) if (levelAt(j) < worstNow) return j;
            return -1;
          })();
          if (worstNow >= 1 && clearIdx > 0) {
            const fl = flagAt(0);
            const label = fl ? FLAG_META[fl].label : tr("خطر جوي");
            return {
              sev: worstNow >= 2 ? "high" : "med",
              icon: fl === "rain" ? "rain" : fl === "storm" ? "storm" : fl === "dust" ? "dust" : "fog",
              title: tf("تنبيه مغادرة ذكي: يُنصح بتأجيل السفر {h} — الخطر ينعقد لاحقًا", { h: clearIdx === 1 ? tr("ساعة") : tf("{v} ساعات", { v: localNum(clearIdx) }) }),
              msg: tf("{hazard} مؤثر على المسار الآن {where} (الرؤية والأسفلت في أسوأ حال) وينقشع حوالي {t} — تأجيل الانطلاق حتى ذلك الحين يوفّر عليك معظم الخطر وفق توقعات كل نقطة.", {
                hazard: label, where: whereAt(0), t: clockAt(clearIdx),
              }),
              when: tf("نافذة الانطلاق المثلى: بعد {t}", { t: clockAt(clearIdx) }),
              bestStart: clearIdx,
            };
          }
          // الحالة ③: خطر مستمر طول النافذة → تحذير عام دون وعد بنافذة وهمية
          if (worstNow >= 1) {
            const fl = flagAt(0);
            return {
              sev: "high",
              icon: fl === "storm" ? "storm" : fl === "rain" ? "rain" : "fog",
              title: tr("تنبيه مغادرة ذكي: خطر مستمر على المسار"),
              msg: tr("يظل الخطر الجوي مؤثرًا على نقاط المسار طول الـ 12 ساعة القادمة دون نافذة انقشاع واضحة — إن اضطررت للسفر فالتزم أضواء الضباب ومسافة أمان مضاعفة، وفكّر في مسار بديل أو تعديل التاريخ."),
              when: tr("لا نافذة آمنة واضحة خلال 12 ساعة"),
              bestStart: 0,
            };
          }
          return null; // مسار سليم الآن ولا خطر متشكل لاحقًا
        }

        /* زر الإشعار: تذكير هاتفي قبل الموعد الموصى به (30 دقيقة، أو فورًا إن اقترب الموعد).
           يعمل أثناء فتح التطبيق، ويُعاد تسليحه من التخزين عند إعادة الفتح، ويُعيد فحص
           خطر المسار لحظة الإطلاق ليرسل التوصية الأحدث لا نصًا جامدًا. */
        const DEP_REM_KEY = "matar:dep-reminder";
        let depRemindTimer = 0;

        async function armDepartureReminder(rec) {
          if (!("Notification" in window) || !rec) return;
          let perm = Notification.permission;
          if (perm === "default") { try { perm = await Notification.requestPermission(); } catch (e) { perm = "denied"; } }
          if (perm !== "granted") return;
          const leadMs = 30 * 60e3;
          const fireAt = Math.max(Date.now() + 15e3, Date.now() + rec.bestStart * HOUR - leadMs);
          const payload = {
            fireAt,
            route: lastTrip ? `${lastTrip.A?.name ?? ""} → ${lastTrip.B?.name ?? ""}` : "",
            body: rec.msg,
          };
          try { localStorage.setItem(DEP_REM_KEY, JSON.stringify(payload)); } catch (e) {}
          scheduleDepReminder(payload);
          updateDepAlertButton();
        }

        function scheduleDepReminder(payload) {
          clearTimeout(depRemindTimer);
          const wait = Math.max(0, payload.fireAt - Date.now());
          depRemindTimer = setTimeout(() => {
            try { localStorage.removeItem(DEP_REM_KEY); } catch (e) {}
            updateDepAlertButton();
            /* لحظة الإطلاق: نعيد تقييم الخطر من بيانات الرحلة الحالية ليرسل الإشعار أحدث توصية */
            let body = payload.body;
            if (lastTrip?.pts) {
              const fresh = smartDepartureAlert(lastTrip.pts);
              if (fresh) body = `${fresh.title} — ${fresh.msg}`;
            }
            Notif.showNotification(
              tf("🔔 تنبيه المغادرة{r}", { r: payload.route ? ` · ${payload.route}` : "" }),
              body,
              "matar-dep",
            );
          }, wait);
        }

        function rearmDepartureReminder() {
          try {
            const raw = localStorage.getItem(DEP_REM_KEY);
            if (!raw) return;
            const payload = JSON.parse(raw);
            if (payload?.fireAt && payload.fireAt > Date.now()) scheduleDepReminder(payload);
            else localStorage.removeItem(DEP_REM_KEY);
          } catch (e) {}
        }

        function updateDepAlertButton() {
          const btn = el.depAlert?.querySelector(".dep-alert-btn");
          if (!btn) return;
          let armed = false;
          try { armed = !!localStorage.getItem(DEP_REM_KEY); } catch (e) {}
          btn.setAttribute("aria-pressed", String(armed));
          btn.querySelector("span").textContent = armed
            ? tr("الإشعار مفعّل — سنذكّرك قبل الانطلاق ✓")
            : tr("فعّل إشعار المغادرة الذكي");
        }

        function renderDepAlert(pts) {
          if (!el.depAlert) return;
          const rec = smartDepartureAlert(pts);
          el.depAlert.classList.toggle("hidden", !rec);
          if (!rec) { el.depAlert.innerHTML = ""; return; }
          el.depAlert.dataset.kind = rec.icon === "rain" ? "irrigation" : rec.icon === "storm" ? "storm" : rec.icon === "dust" ? "dust" : "frost";
          el.depAlert.setAttribute("data-state", rec.sev === "high" ? "danger" : "warn");
          el.depAlert.innerHTML = `
            <span class="adv-title">${iconSvg(rec.icon, 14)} ${escapeHtml(rec.title)}<span class="adv-sev" data-sev="${rec.sev}">${escapeHtml(rec.sev === "high" ? tr("مهم") : tr("توصية"))}</span></span>
            <p class="adv-msg">${escapeHtml(rec.msg)}</p>
            <div class="adv-when">⏱ ${escapeHtml(rec.when)}</div>
            <div class="dep-alert-actions">
              <button type="button" class="dep-alert-btn" aria-pressed="false">${iconSvg("bell", 15)}<span>${escapeHtml(tr("فعّل إشعار المغادرة الذكي"))}</span></button>
              <span class="dep-alert-hint">${escapeHtml(tr("يصلك إشعار قبل ~30 دقيقة من موعد الانطلاق الموصى به مع إعادة فحص الخطر لحظتها."))}</span>
            </div>`;
          el.depAlert.querySelector(".dep-alert-btn")?.addEventListener("click", () => armDepartureReminder(rec));
          updateDepAlertButton();
        }

        /* ═══════════════ إصدار 27 — حالة الطريق (إغلاق/تقييد محتمل بسبب الطقس) ═══════════════
           دمج بيانات بسيطة توضح لو كان الطريق مهددًا بالإغلاق أو تقييد المرور بسبب الطقس:
             • مطر غزير ≥ 8 مم/س (تجمع مياه وسيول على المقاطع المنخفضة)
             • عاصفة رعدية معلنة (رمز ≥ 95) أو زلاجة (أمطار متجمدة/ثلج)
             • غبار أو ضباب يقلل الرؤية تحت 1 كم
           المستوى: منخفض / متوسط / مرتفع — مع توضيح صريح أنه تقدير من الطقس
           وليس بيانات مرور رسمية (لا يوجد مزود مرور مجاني بلا مفاتيح). */
        function closureRisk(pts) {
          if (!pts?.length) return null;
          let maxPr = 0, storm = false, ice = false, lowVis = 0, visMin = Infinity, worstP = null, worstQ = 0;
          pts.forEach((p) => {
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            const pr = p.pr ?? 0, vis = p.vis;
            const f = p.info?.f ?? {};
            maxPr = Math.max(maxPr, pr);
            if (code >= 95 || f.storm) storm = true;
            if (code === 56 || code === 57 || code === 66 || code === 67 || code === 71 || code === 73 || code === 75 || f.ice) ice = true;
            if (vis != null) { visMin = Math.min(visMin, vis); if (vis < 1000) lowVis += 1; }
            let q = pr >= 8 ? 60 : pr >= 3 ? 34 : pr >= 0.8 ? 12 : 0;
            if (storm) q += 22;
            if (ice) q += 18;
            if (vis != null && vis < 400) q += 20;
            else if (vis != null && vis < 1000) q += 10;
            if ((p.gust ?? 0) >= 60) q += 8;
            if (q > worstQ) { worstQ = q; worstP = p; }
          });
          const v = worstQ >= 60 ? "high" : worstQ >= 30 ? "med" : "low";
          const label = { high: tr("احتمال مرتفع"), med: tr("احتمال متوسط"), low: tr("منخفض") }[v];
          const whereTxt = worstP
            ? (worstP.city ? tf("أشد المقاطع: قرب {c} ({v} كم)", { c: cityName(worstP.city), v: localNum(worstP.km) }) : tf("أشد المقاطع: {v} كم من الانطلاق", { v: localNum(worstP.km) }))
            : "";
          let txt;
          if (v === "high") {
            txt = tf("ظروف على المسار قد تدفع الجهات المختصة لتقييد المرور أو إغلاق مؤقت: {parts} {where} — تجمّع المياه والسيول على المقاطع المنخفضة يقطع الطريق غالبًا، تجنّب السفر عبرها وقت الذروة.", {
              parts: [maxPr >= 3 ? tr("أمطار غزيرة") : null, storm ? tr("عواصف رعدية") : null, ice ? tr("تجمد/ثلوج محتملة") : null, visMin < 400 ? tr("رؤية شبه معدومة") : null].filter(Boolean).join(" · ") || tr("مخاطر جوية قوية"),
              where: whereTxt ? `(${whereTxt})` : "",
            });
          } else if (v === "med") {
            txt = tf("مؤشرات جوية تستدعي الحذر على أجزاء من المسار {where} — سلوكيات معتادة في الجو السيئ (تباطؤ، انغلاق مدرج أو حارة) واردة، وتجمّع مياه خفيف محتمل على المقاطع الممطرة.", {
              where: whereTxt ? `(${whereTxt})` : "",
            });
          } else {
            txt = tr("لا مؤشرات جوية لتقييد حركة المرور أو إغلاق أي مقطع من هذا المسار في توقيت الرحلة الحالي — الأسفلت جاف والرؤية جيدة.");
          }
          return { v, label, txt, src: tr("تقدير آلي من بيانات الطقس على نقاط المسار — وليس بيانات مرور رسمية") };
        }

        function renderClosure(pts) {
          if (!el.closureStrip) return;
          const r = closureRisk(pts);
          el.closureStrip.classList.toggle("hidden", !r);
          if (!r) return;
          el.closureStrip.innerHTML = `
            <span class="closure-badge" data-v="${r.v}">${iconSvg("car", 13)} ${escapeHtml(tf("إغلاق محتمل: {v}", { v: r.label }))}</span>
            <span class="closure-txt">${escapeHtml(r.txt)}</span>
            <span class="closure-src">${escapeHtml(r.src)}</span>`;
        }

        /* ═══════════════════ إصدار 17 — منظّم عرض الرحلة ═══════════════════
           استدعاء واحد لكل بطاقات الطريق (يستخدمه الفحص الأول، إسقاط وقت الانطلاق،
           وإعادة الرسم عند تغيير اللغة) كي لا تتخلف أي بطاقة عن التوقيت المختار. */
        function renderAllTrip(A, B, { coords, distM, durSec, pts, totalKm }) {
          drawRoute(coords, pts);
          renderSummary(A, B, { distM, durSec, pts, totalKm });
          renderSafety(pts);
          renderWindSide(pts); // v45: مؤشر الرياح الجانبية + زر أفضل وقت للتحرك
          renderKeypoints(pts);
          renderWaypoints(pts);
          renderAlerts(pts);
          renderDepartureAdvice(pts);
          renderDepAlert(pts); // إصدار 27: تنبيه المغادرة الذكي
          renderClosure(pts); // إصدار 27: حالة الطريق (إغلاق محتمل)
        }

        /* ═════════════ إصدار 17 — مؤشر أمان القيادة (Driving Safety Index) ═════════════
           درجة 0–100 من أخطر نقاط المسار في التوقيت الحالي: الرياح الجانبية
           (زاوية المسار × الهبّات)، الضباب/الرؤية الأفقية، شدة المطر، العواصف، والصقيع.
           نُرجّح الأسوأ (60٪ الأول + 25٪ الثاني + 15٪ الثالث) كي لا تختفي نقطة خطر واحدة
           خلف متوسط مريح — والشريط الملوّن يتحرك فورًا مع تغيير وقت الانطلاق. */
        function roadSafetyScore(pts) {
          if (!pts?.length) return { score: 100, worst: 0, risky: 0, level: 0 };
          /* إصدار 18: عقوبات متدرجة أدق لكل نقطة — الرياح الجانبية (الزاوية × الشدة)
             مع اعتبار الرياح المستدامة معادلًا للهبّات، وتدرّج رؤية يمتد حتى 4 كم،
             وتدرّج مطر يبدأ من الرذاذ، والعواصف والمطارات المتجمدة تُحتسب بشدة أعلى */
          const pens = pts.map((p) => {
            const gust = p.gust ?? 0, wind = p.wind ?? 0, cross = p.cross ?? 0, vis = p.vis, pr = p.pr ?? 0;
            const f = p.info?.f ?? {};
            const code = p.hourly?.weather_code?.[p.k] ?? 0;
            let q = 0;
            /* ═ v46 — ملف المركبة (Vehicle Physics Profile) ═
               مضاعف حساسية يعكس استجابة كل مركبة للظروف: سيارة ملاكي 1.0 ·
               دفع رباعي 1.4 · نقل/ميكروباص 1.6 · دراجة نارية 2.2 —
               يضاعف حساسية الرياح الجانبية للـ SUV والنقل، ويضيف تحذيرات
               فورية للرذاذ والرياح الخفيفة على الدراجات، وتحذير الانزلاق
               المائي للملاكي عند المطر الكثيف. */
            const vf = (window.__matarVeh?.() ?? 1);
            const eff = Math.max(gust, wind * 1.35) * vf;
            if (cross >= 0.35 && eff >= 25) q += Math.min(45, (eff - 25) * 1.15 * cross);
            else if (eff >= 55) q += Math.min(18, (eff - 55) * 0.8);
            if (vis != null && vis < 4000) q += Math.min(58, (1 - vis / 4000) * 62 * (0.75 + 0.25 * vf)) + (vis < 1000 ? 10 : 0);
            if (f.fog || code === 45 || code === 48) q += 8;
            if (f.dense) q += 10;
            if (pr >= 0.1) q += Math.min(40, pr * 5.2);
            if (f.storm || code >= 95) q += 30;
            if (code === 56 || code === 57 || code === 66 || code === 67) q += 18;
            if (f.ice) q += 24;
            if (vf >= 2.2 && (pr >= 0.1 || (vis != null && vis < 3000) || eff >= 18)) q += 8; /* دراجات: رذاذ/رياح خفيفة */
            if (vf <= 1 && pr >= 4.5) q += 12; /* ملاكي: انزلاق مائي عند المطر الكثيف */
            return Math.min(100, q);
          });
          const sorted = [...pens].sort((a, b) => b - a);
          let w = sorted[0] * 0.72 + (sorted[1] ?? 0) * 0.18 + (sorted[2] ?? 0) * 0.10;
          /* تناسق حاسم مع التنبيهات: وجود نقطة بتنبيه جاد (مستوى 2) تُبقي الدرجة في نطاق
             «خطورة عالية»، ومستوى 1 يمنع وصف القيادة بـ«آمنة غالبًا» — فلا يعود المؤشر
             يقول «آمن» فوق قطاع عليه إنذار أحمر على الخريطة */
          const level = pts.reduce((m, p) => Math.max(m, p.info?.level ?? 0), 0);
          if (level >= 2) w = Math.max(w, 58);
          else if (level === 1) w = Math.max(w, 26);
          return {
            score: Math.round(clamp(100 - w, 2, 100)),
            worst: Math.round(sorted[0] ?? 0),
            risky: pts.filter((p) => (p.info?.level ?? 0) > 0).length,
            level,
          };
        }

        function renderSafety(pts) {
          if (!el.safetyStrip) return;
          const list = Array.isArray(pts) ? pts : [];
          const { score, risky } = roadSafetyScore(list);
          const v = score >= 75 ? "good" : score >= 45 ? "fair" : "poor";
          const label = v === "good" ? tr("قيادة آمنة غالبًا") : v === "fair" ? tr("حذر مطلوب على أجزاء") : tr("خطورة عالية — خفّف السرعة");
          /* إصدار 18: نسمّي أسوأ قطاع على المسار بأقرب مدينة كي يطابق المؤشر التنبيهات */
          const worst = list.filter((p) => (p.info?.level ?? 0) > 0)
            .sort((a, b) => (b.info?.level ?? 0) - (a.info?.level ?? 0) || (b.gust ?? 0) - (a.gust ?? 0))[0];
          const worstName = worst
            ? (worst.city ? tf("قرب {c}", { c: cityName(worst.city) }) : tf("عند {v} كم من الانطلاق", { v: localNum(worst.km) }))
            : "";
          const worstTxt = worst ? tf(" — أسوأ قطاع: {d} ({c})", { d: worstName, c: wmoDesc(worst.hourly?.weather_code?.[worst.k] ?? 0) }) : "";
          const msg = v === "good"
            ? tr("لا رياح جانبية قوية ولا ضباب كثيف على نقاط المسار في هذا التوقيت — حافظ على السرعة القانونية ومسافة الأمان.")
            : v === "fair"
              ? tf("مقاطع على المسار تحتاج انتباهك في هذا التوقيت ({r} نقطة من {n}) — خفف السرعة عند القطاعات المعلّمة على الخريطة وزد مسافة الأمان.", { r: localNum(risky), n: localNum(list.length) }) + worstTxt
              : tr("مخاطر جادة على المسار — فكّر في تأجيل الانطلاق من شريط «وقت الانطلاق» أعلاه، أو اعرض محطات الاستراحة الآمنة من الزر الأسفل.") + worstTxt;
          el.safetyStrip.classList.remove("hidden");
          el.safetyStrip.innerHTML = `
            <div class="safety-top">
              <span class="safety-title">${iconSvg("car", 16)} ${escapeHtml(tr("مؤشر أمان القيادة"))}</span>
              <span class="safety-verdict" data-v="${v}">${escapeHtml(label)}</span>
              <span class="safety-score">${escapeHtml(tf("أمان {v}٪", { v: localNum(score) }))} · ${escapeHtml(tf("خطر {v}٪", { v: localNum(100 - score) }))}</span>
            </div>
            <div class="safety-bar" role="img" aria-label="${escapeHtml(tf("مؤشر أمان القيادة {v} من 100", { v: localNum(score) }))}"><span class="safety-dot" style="inset-inline-start:${100 - score}%"></span></div>
            <div class="safety-ends"><span>${escapeHtml(tr("آمن"))}</span><span>${escapeHtml(tr("خطر"))}</span></div>
            <p class="safety-msg">${escapeHtml(msg)}</p>`;
        }

        /* ═════════════ إصدار 17 — محدد وقت الانطلاق الذكي (Departure Slider) ═════════════
           «ماذا لو تأخرت ساعتين؟» — يعيد إسقاط طقس كل نقطة على وقت الوصول الجديد محليًا
           من البيانات المخزنة لكل نقطة (p.hourly + p.utcOff): صفر طلبات شبكة، وتتحدّث
           البطاقات والخريطة والتنبيهات ومؤشر الأمان فورًا بضغطة زر واحدة. */
        function applyDeparture(offsetH) {
          if (!lastTrip) return;
          depOffsetH = clamp(offsetH, 0, 6);
          const depBase = Date.now() + depOffsetH * HOUR;
          lastTrip.pts.forEach((p) => {
            p.eta = depBase + (p.km / Math.max(lastTrip.totalKm, 0.001)) * lastTrip.durSec * 1000;
            const h = p.hourly;
            if (!h?.time?.length) return;
            /* إصلاح حرارة الطرق (أ): نفس المطابقة النصية الحتمية المستخدمة في الفحص الأصلي */
            p.k = hourIndexFor(h, p.eta, p.utcOff ?? 0);
            p.hourStamp = h.time[p.k] ?? null;
            p.info = classify(h, p.k);
            p.temp = h.temperature_2m?.[p.k];
            p.wind = h.wind_speed_10m?.[p.k];
            p.gust = h.wind_gusts_10m?.[p.k];
            p.pr = h.precipitation?.[p.k];
            p.vis = h.visibility?.[p.k];
            p.dir = h.wind_direction_10m?.[p.k];
          });
          lastTrip.pts.forEach((p) => {
            const diff = Math.abs(((p.dir ?? 0) - (p.bearing ?? 0)) % 180);
            p.cross = 1 - Math.abs(diff / 90 - 1);
          });
          /* إصدار 29: بث بيانات الرحلة بعد تعديل الانطلاق كي تتحدث بطاقة الفرصة الأخيرة وHUD */
          document.dispatchEvent(new CustomEvent("matar:route", { detail: { A: lastTrip.A, B: lastTrip.B, distM: lastTrip.distM, durSec: lastTrip.durSec, totalKm: lastTrip.totalKm, pts: lastTrip.pts } }));
          renderAllTrip(lastTrip.A, lastTrip.B, lastTrip);
          updateDepPills();
          setStatus(depOffsetH === 0
            ? tr("طقس المسار محدّث لانطلاق الآن — كل النقاط والتنبيهات محسوبة على التوقيت الجديد.")
            : tf("طقس المسار محدّث لانطلاق بعد {h} ساعة (الوصول المتوقع {t}) — حُسب محليًا من بيانات الفحص دون أي طلب شبكة.", { h: localNum(depOffsetH), t: clockText(new Date(lastTrip.pts[lastTrip.pts.length - 1].eta)) }));
        }

        function updateDepPills() {
          el.depPills?.querySelectorAll("button[data-dep]").forEach((b) => {
            b.setAttribute("aria-pressed", String(Number(b.dataset.dep) === depOffsetH));
          });
        }

        /* ═════════════ إصدار 17 — أماكن الاستراحة الآمنة على الطريق ═════════════
           مستشفيات وعيادات ومحطات وقود ومناطق استراحة من OpenStreetMap (Overpass)
           ضمن 8 كم حول نقاط المسار — تُجلب تلقائيًا عند تنبيه جوي خطير (مستوى 2)
           أو يدويًا بالزر، وتظهر علامات ملونة على خريطة الطرق مع نوافذ تفصيلية. */
        function clearRestStops() {
          if (restLayer) { try { restLayer.remove(); } catch (e) { /* أُزيلت */ } restLayer = null; }
        }

async function fetchRestStops(auto = false) {
          if (!lastTrip || !el.restBtn || !el.restStatus) return;
          /* الوضع الاقتصادي: الجلب التلقائي معطّل، ويبقى الزر اليدوي متاحًا (استجابة JSON صغيرة) */
          if (Eco.isEco() && auto) { try { window.__matarEcoBite?.(25, "محطات الاستراحة"); } catch (e) {} return; }
          const lats = lastTrip.pts.map((p) => p.lat), lons = lastTrip.pts.map((p) => p.lon);
          const pad = 0.18;
          const bbox = `${(Math.min(...lats) - pad).toFixed(3)},${(Math.min(...lons) - pad).toFixed(3)},${(Math.max(...lats) + pad).toFixed(3)},${(Math.max(...lons) + pad).toFixed(3)}`;
          /* إصدار 35: أضفنا «المناطق القريبة» إلى نتيجة محطات الاستراحة — مدن وبلدات
             وقرى مأهولة على طول المسار (place=city/town/village/suburb)، فتعرف أين
             تتوقف وأين أقرب سكن وخدمات، وكل نقطة استراحة تُربط بأقرب منطقة لها */
          const q = `[out:json][timeout:25];(node["amenity"="hospital"](${bbox});node["amenity"="clinic"](${bbox});node["amenity"="fuel"](${bbox});node["highway"="rest_area"](${bbox});node["place"="city"](${bbox});node["place"="town"](${bbox});node["place"="village"](${bbox});node["place"="suburb"](${bbox}););out center 200;`;
          el.restBtn.disabled = true;
          el.restStatus.textContent = tr("نبحث عن المستشفيات ومحطات الوقود ونقاط الاستراحة والمناطق القريبة من المسار…");
          restAbort?.abort();
          restAbort = new AbortController();
          try {
            /* إصدار 17: المثيل الرئيسي ثم مرآة kumi الاحتياطية عند الانشغال أو الحجب */
            const endpoints = [
              "https://overpass-api.de/api/interpreter",
              "https://overpass.kumi.systems/api/interpreter",
            ];
            let r = null;
            for (const ep of endpoints) {
              try {
                r = await fetch(ep + "?data=" + encodeURIComponent(q), { signal: restAbort.signal });
                if (r.ok) break;
              } catch (e) {
                if (e?.name === "AbortError") throw e;
                r = null;
              }
            }
            if (!r || !r.ok) throw new Error(`http ${r ? r.status : "unreachable"}`);
            const data = await r.json();
            const raw = (data.elements ?? [])
              .map((n) => ({ lat: n.lat ?? n.center?.lat, lon: n.lon ?? n.center?.lon, tags: n.tags ?? {} }))
              .filter((n) => n.lat != null && n.lon != null)
              .map((n) => {
                /* نُبقي فقط ما يقارب المسار فعلًا: ضمن 8 كم من أقرب نقطة عينة */
                let d = Infinity;
                for (const p of lastTrip.pts) d = Math.min(d, haversinePt(n.lat, n.lon, p.lat, p.lon));
                return { ...n, dKm: d };
              });
            /* فصل النتائج: نقاط الاستراحة الآمنة (مستشفيات/وقود/استراحات) والمناطق القريبة (مدن وقرى) */
            const isArea = (n) => !!n.tags.place;
            const areas = raw.filter((n) => isArea(n) && n.dKm <= 8).sort((a, b) => a.dKm - b.dKm).slice(0, 10);
            const items = raw.filter((n) => !isArea(n) && n.dKm <= 8).sort((a, b) => a.dKm - b.dKm).slice(0, 24);
            /* ربط كل نقطة استراحة بأقرب منطقة مأهولة كي يقرأ السائق «أين» هذه النقطة فعليًا */
            const nearestArea = (n) => {
              let best = null;
              for (const a of areas) {
                const d = haversinePt(n.lat, n.lon, a.lat, a.lon);
                if (!best || d < best.d) best = { area: a, d };
              }
              return best;
            };
            drawRestStops(items, areas, nearestArea);
            /* v46: حفظ آخر نتائج الاستراحة لقراءتها من «أقرب نقطة أمان 🆘» */
            restItems = items;
            restAreas = areas;
            try { onRestsArrive?.(items, areas); } catch (e) {}
            const areaName = (a) => a.tags["name:ar"] || a.tags["name:en"] || a.tags.name || "";
            const areaNames = areas.map(areaName).filter(Boolean).slice(0, 4);
            const areaLine = areaNames.length
              ? " " + tf("المناطق القريبة من مسارك: {v}.", { v: areaNames.join("، ") })
              : "";
            if (!items.length && !areas.length) {
              el.restStatus.textContent = tr("لم نجد نقاط استراحة أو مناطق قريبة من هذا المسار ضمن 8 كم — احتفظ بمخزون وقود وماء كافٍ قبل الانطلاق.");
            } else if (!items.length) {
              el.restStatus.textContent = tf("لا نقاط استراحة مباشرة قرب المسار، لكنه يمر قرب {v} — خطط لتوقفك داخلها.", { v: areaNames.join("، ") || "—" });
            } else {
              el.restStatus.textContent = tf("عرضنا {v} نقطة استراحة آمنة (مستشفيات، محطات وقود، استراحات) على خريطة المسار مع المناطق القريبة — آخرها على بعد {d} كم من أقرب نقطة طريق.", { v: localNum(items.length), d: localNum(items[items.length - 1].dKm, 1) }) + areaLine;
            }
          } catch (error) {
            if (error?.name === "AbortError") return;
            el.restStatus.textContent = tr("تعذّر جلب محطات الاستراحة الآن (خدمة OpenStreetMap مشغولة أو غير متاحة) — حاول بعد قليل.");
          } finally {
            el.restBtn.disabled = false;
          }
        }

        /* علامات الاستراحة: أبيض على أحمر (مستشفى) / أبيض على تيل (وقود) / أبيض على ذهبي (استراحة) */
        const REST_GLYPHS = {
          hospital: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
          fuel: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 21V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15"/><path d="M3.5 21h11"/><path d="M13.5 9.5H16a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 0 3 0V9.6l-2.2-2.4"/></svg>',
          rest: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M7.5 4.5v1.2M11 4.5v1.2"/></svg>',
        };

function drawRestStops(items, areas = [], nearestArea = null) {
          clearRestStops();
          if (!window.L || !roadMap || (!items?.length && !areas?.length)) return;
          restLayer = L.layerGroup().addTo(roadMap);
          /* إصدار 35: المناطق القريبة أولًا — أوسمة هادئة صغيرة كي لا تزاحم نقاط الاستراحة */
          (areas || []).slice(0, 8).forEach((a) => {
            const name = a.tags["name:ar"] || a.tags["name:en"] || a.tags.name || tr("منطقة قريبة");
            L.marker([a.lat, a.lon], {
              icon: L.divIcon({ className: "rest-area-icon", html: `<span class="rest-area-marker">${escapeHtml(name)}</span>` }),
            }).bindPopup(`<div class="trip-pop"><b>${escapeHtml(name)}</b><div>${escapeHtml(tr("منطقة مأهولة قريبة من المسار"))} · ${tf("{v} كم من أقرب نقطة على المسار", { v: localNum(a.dKm, 1) })}</div></div>`).addTo(restLayer);
          });
          (items || []).forEach((n) => {
            const t = n.tags.amenity === "hospital" || n.tags.amenity === "clinic" ? "hospital" : n.tags.amenity === "fuel" ? "fuel" : "rest";
            const label = t === "hospital" ? tr("مستشفى/عيادة") : t === "fuel" ? tr("محطة وقود") : tr("منطقة استراحة");
            const name = n.tags["name:ar"] || n.tags["name:en"] || n.tags.name || label;
            /* إصدار 35: سطر «قرب …» يوضح أقرب منطقة مأهولة لكل محطة استراحة */
            const near = typeof nearestArea === "function" ? nearestArea(n) : null;
            const areaNameOf = (a) => a && (a.tags["name:ar"] || a.tags["name:en"] || a.tags.name || "—");
            const nearHtml = near && near.area
              ? `<div>📍 ${escapeHtml(tr("قرب"))} ${escapeHtml(areaNameOf(near.area))}${near.d != null && near.d > 0.3 ? ` · ${escapeHtml(tf("على بعد {v} كم منها", { v: localNum(near.d, 1) }))}` : ""}</div>`
              : "";
            L.marker([n.lat, n.lon], {
              icon: L.divIcon({ className: "", html: `<span class="rest-marker" data-type="${t}">${REST_GLYPHS[t]}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
            }).bindPopup(`<div class="trip-pop"><b>${escapeHtml(name)}</b><div>${escapeHtml(label)} · ${tf("{v} كم من أقرب نقطة على المسار", { v: localNum(n.dKm, 1) })}</div>${nearHtml}${n.tags.opening_hours ? `<div dir="ltr">${escapeHtml(n.tags.opening_hours)}</div>` : ""}${n.tags.phone ? `<div dir="ltr">${escapeHtml(n.tags.phone)}</div>` : ""}</div>`).addTo(restLayer);
          });
        }

        async function checkRoute() {
          // الأوفلاين: فحص الطريق يحتاج اتصالًا حيًا (OSRM + Open-Meteo)
          if (!navigator.onLine) { setStatus(tr("أنت غير متصل بالإنترنت — فحص الطريق يحتاج اتصالًا حيًا وسيعمل تلقائيًا عند عودة الشبكة."), true); return; }
          el.check.disabled = true;
          setStatus(tr("جارٍ التحليل…"));
          try {
            const A = await resolveEndpoint(el.from, state.place);
            const B = await resolveEndpoint(el.to, null);
            await runTrip(A, B);
          } catch (error) {
            // المرحلة 12: رسائل HTTP الخام (مثل http 429) تُستبدل برسالة ودّية مفهومة
            const raw = error?.message || "";
            setStatus(/^http \d+$/.test(raw)
              ? tr("خدمات التوجيه مشغولة حاليًا (حد الطلبات) — حاول مجددًا بعد دقيقة أو قلّل المسافة قليلًا.")
              : (raw || tr("تعذّر إكمال فحص الطريق الآن. حاول مجددًا بعد قليل.")), true);
          } finally {
            el.check.disabled = false;
          }
        }

        // تطوير: فحص تلقائي فور اكتمال النقطتين (بأسلوب خرائط جوجل) — والزر اليدوي يبقى متاحًا
        let autoCheckTimer = 0;
        function maybeAutoCheck() {
          if (!(el.from._place && el.to._place)) return;
          clearTimeout(autoCheckTimer);
          autoCheckTimer = setTimeout(() => {
            if (el.from._place && el.to._place && !el.check.disabled) checkRoute();
          }, 700);
        }

        /* ══ v55: وجهة فورية من بطاقة «نقطة التفتيش الفورية» على الخريطة الكبرى —
           تعبئة نقطة الوصول تلقائيًا برمز 🚗 ثم رسم الطريق فورًا ══ */
        document.addEventListener("matar:route-destination", (ev) => {
          const p = ev?.detail?.place;
          if (!p || !el.to || typeof p.latitude !== "number") return;
          const label = [p.name, p.admin1, p.country].filter(Boolean).join("، ")
            || tf("نقطة {a}°, {b}°", { a: p.latitude.toFixed(3), b: p.longitude.toFixed(3) });
          el.to.value = palestineFixText(label);
          el.to._place = { name: el.to.value, admin1: p.admin1 ?? "", country: p.country ?? "", latitude: p.latitude, longitude: p.longitude };
          setStatus(tf("وجهة جديدة: {n} — نرسم الطريق تلقائيًا…", { n: el.to.value }));
          maybeAutoCheck();
        });

        el.form.addEventListener("submit", (event) => { event.preventDefault(); checkRoute(); });
        el.swap.addEventListener("click", () => {
          const t = el.from.value;
          el.from.value = el.to.value;
          el.to.value = t;
          // تبديل النقاط المحفوظة والدبابيس مع النصوص
          const placeFrom = el.from._place, placeTo = el.to._place;
          el.from._place = placeTo;
          el.to._place = placeFrom;
          if (roadMap && pickMarkers.from && pickMarkers.to) {
            const ll = pickMarkers.from.getLatLng();
            pickMarkers.from.setLatLng(pickMarkers.to.getLatLng());
            pickMarkers.to.setLatLng(ll);
          }
          maybeAutoCheck();
        });

        // إعادة رسم الرحلة الأخيرة (لتغيير اللغة دون إعادة جلب) — بالتوقيت المختار من شريط الانطلاق
        function rerenderTrip() {
          if (!lastTrip) return;
          try {
            const t = lastTrip;
            renderAllTrip(t.A, t.B, t);
            updateDepPills();
          } catch (e) { /* تجاهل */ }
        }
        document.addEventListener("matar:language", rerenderTrip);

        /* إصدار 17: سحابة أزرار وقت الانطلاق + زر محطات الاستراحة الآمنة */
        el.depPills?.addEventListener("click", (event) => {
          const btn = event.target.closest("button[data-dep]");
          if (!btn || !lastTrip || el.check.disabled) return;
          applyDeparture(Number(btn.dataset.dep));
        });
        el.restBtn?.addEventListener("click", () => {
          if (!lastTrip) {
            el.restStatus.textContent = tr("افحص الطريق أولًا (حدد نقطة البداية والنهاية) ثم اعرض محطات الاستراحة على طول المسار.");
            return;
          }
          fetchRestStops(false);
        });

        /* إصدار 27: إعادة تسليح تذكير المغادرة المعلّق عند فتح التطبيق (لو خُزّن سابقًا) */
        rearmDepartureReminder();

        /* ═══ v46: جسر القراءة فقط لسكربت «الرفيق الذكي للقيادة» المرفق ═══
           يكشف الخريطة والرحلة الأخيرة ونقاط الاستراحة دون كسر التغليف. */
        return {
          onShow, rerender: rerenderTrip,
          api: {
            map: () => roadMap,
            trip: () => lastTrip,
            rests: () => restItems,
            areas: () => restAreas,
            ensureMap: ensureRoadMap,
            haversine: haversinePt,
            inEgypt,
            nearestCity: nearestEgyptCity,
            onRests: (fn) => { onRestsArrive = typeof fn === "function" ? fn : null; },
            fetchRests: fetchRestStops,
          },
        };
      })();

/* ═══════════════════ 8) v46 — الرفيق الذكي للقيادة الحية ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 46: الرفيق الذكي للقيادة (Live Co-Pilot)
   ------------------------------------------------------------
   ترقية شاملة لصفحة «طقس الطرق والسفر» فوق أساس v45:
   ① مقارنة المسارات البديلة (OSRM alternatives=true حتى 3 مسارات)
      + بطاقة مقارنة ذكية (الزمن × مستوى الأمان الجوي لكل مسار)
      + وقت الوصول المعدّل بالطقس (Weather-Adjusted ETA)
   ② وضع القيادة الحي: watchPosition + Screen Wake Lock + مؤشر
      سيارة متحرك + تنبيهات صوتية عربية تلقائية قبل الخطر بـ 15 كم
   ③ منحنى الارتفاعات (Open-Meteo Elevation) مع تمييز المنخفضات
      المعرضة لتكوّن الشبورة المفاجئة
   ④ حفظ الرحلة أوفلاين في كاش matar:state + زر «أقرب نقطة أمان 🆘»
   ⑤ ملف المركبة الزجاجي: يضبط مضاعف الحساسية عبر window.__matarVeh
      (يقرؤه محرك الخطورة في السكربت الرئيسي مباشرة)
   ⑥ رادار المطر الحي (RainViewer) فوق مسار الرحلة بشفافية متوازنة
   ⑦ بلاغات السائقين اللحظية النابضة + مشاركة Web Share / واتساب
   ⑧ التصدير المباشر للتطبيقات الملاحة: خرائط جوجل + Waze بضغطة
   ملاحظة CSP: كل المضيفين المستخدمين هنا مدرجون مسبقًا في
   connect-src/img-src (OSRM، Open-Meteo، RainViewer، Overpass).
   ============================================================ */
const CoPilot = (() => {
  const api = (typeof Roads !== "undefined" && Roads.api) ? Roads.api : null;
  if (!api) return {};
  const $q = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => escapeHtml(String(s ?? ""));
  const VEH_KEY = "matar:vehicle";
  const REPORTS_KEY = "matar:roadReports";
  const PACK_URL = "matar-trip-pack-v46";

  /* ── عوامل حساسية المركبة (Vehicle Physics Profile) ──
     ملاكي 1.0 · SUV 1.4 · نقل/ميكروباص 1.6 · دراجة نارية 2.2 */
  const VEH_FACTORS = { car: 1.0, suv: 1.4, bus: 1.6, moto: 2.2 };
  const VEH_LABELS = {
    car: { ar: "سيارة ملاكي", en: "Sedan" },
    suv: { ar: "دفع رباعي SUV", en: "SUV" },
    bus: { ar: "ميكروباص / نقل", en: "Van / Truck" },
    moto: { ar: "دراجة نارية", en: "Motorcycle" },
  };

  /* ── نطاق السرعة الآمنة المبدئية حسب المركبة (كم/س على طريق مكشوف) ── */
  const VEH_SAFE = { car: [90, 110], suv: [85, 105], bus: [70, 90], moto: [70, 90] };

  let vehMode = "car";
  try { vehMode = localStorage.getItem(VEH_KEY) || "car"; } catch (e) {}
  if (!VEH_FACTORS[vehMode]) vehMode = "car";
  /* الجسر الحاسم: يقرؤه roadSafetyScore/renderAlerts/renderWindSide في السكربت الرئيسي */
  window.__matarVeh = () => VEH_FACTORS[vehMode] || 1;

  const el = {
    vehBar: $q("#veh-bar"), vehSafe: $q("#veh-safe"),
    radarBtn: $q("#route-radar-toggle"),
    crowdBar: $q("#crowd-bar"),
    liveBtn: $q("#live-trip-btn"), saveBtn: $q("#save-trip-btn"),
    safeBtn: $q("#safe-haven-btn"), cpStatus: $q("#copilot-status"),
    altsWrap: $q("#alts-wrap"), summary: $q("#trip-summary"),
    elevBox: $q("#elev-box"), elevChart: $q("#elev-chart"),
    elevBadge: $q("#elev-badge"), elevNote: $q("#elev-note"),
  };

  /* ═══════════ ⑤ ملف المركبة ═══════════ */
  function vehName(mode) {
    const v = VEH_LABELS[mode] || VEH_LABELS.car;
    return isAr() ? v.ar : v.en;
  }

  function safeSpeedHint() {
    /* تقدير السرعة الآمنة الموصى بها على هذا المسار الآن: نبدأ من نطاق المركبة
       وننزل مع مستوى الخطورة الأقصى والرياح الجانبية والرؤية */
    const trip = api.trip();
    const [lo, hi] = VEH_SAFE[vehMode] || VEH_SAFE.car;
    if (!trip?.pts) return { v: hi, why: tr("حالة الطريق سليمة — السرعة القانونية مناسبة") };
    let worst = 0, worstX = 0, worstVis = 1e9, worstPr = 0;
    trip.pts.forEach((p) => {
      worst = Math.max(worst, p.info?.level ?? 0);
      worstX = Math.max(worstX, (p.cross ?? 0) * Math.max(p.gust ?? 0, (p.wind ?? 0) * 1.35) * window.__matarVeh());
      worstVis = Math.min(worstVis, p.vis ?? 1e9);
      worstPr = Math.max(worstPr, p.pr ?? 0);
    });
    let v = hi;
    const why = [];
    if (worst >= 2) { v -= 35; why.push(tr("خطر جوي جاد على مقاطع")); }
    else if (worst === 1) { v -= 15; why.push(tr("حذر جوي على مقاطع")); }
    if (worstX >= 45) { v -= 20; why.push(tr("رياح جانبية خطرة")); }
    else if (worstX >= 25) { v -= 10; why.push(tr("رياح جانبية محسوسة")); }
    if (worstVis < 400) { v -= 30; why.push(tr("رؤية شبه معدومة")); }
    else if (worstVis < 1000) { v -= 20; why.push(tr("شبورة/ضباب كثيف")); }
    else if (worstVis < 4000) { v -= 8; why.push(tr("رؤية محدودة")); }
    if (worstPr >= 4) { v -= 10; why.push(tr("مطر غزير وانزلاق مائي محتمل")); }
    v = clamp(v, 40, hi);
    return { v: Math.round(v / 5) * 5, why: why.length ? why.join(" · ") : tr("ظروف سليمة") };
  }

  function renderVehSafe() {
    if (!el.vehSafe) return;
    const { v, why } = safeSpeedHint();
    el.vehSafe.textContent = tr("سرعة آمنة مقترحة") + `: ${localNum(v)} ${tr("كم/س")} — ${why}`;
  }

  function wireVehicleBar() {
    if (!el.vehBar || el.vehBar.dataset.wired) return;
    el.vehBar.dataset.wired = "1";
    el.vehBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".veh-btn");
      if (!btn) return;
      vehMode = btn.dataset.veh;
      try { localStorage.setItem(VEH_KEY, vehMode); } catch (e2) {}
      window.__matarVeh = () => VEH_FACTORS[vehMode] || 1;
      el.vehBar.querySelectorAll(".veh-btn").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      /* إعادة تقييم فورية لكل مؤشرات السكربت الرئيسي (الأمان/الرياح/التنبيهات)
         عبر إعادة الرسم المحلي — صفر طلبات شبكة */
      try { Roads.rerender(); } catch (e2) {}
      renderVehSafe();
      renderEtaAdjusted(true);
      setStatus(tf("ضبطنا حساسية الخطورة والسرعة الآمنة على مركبتك: {v}.", { v: vehName(vehMode) }));
    });
    el.vehBar.querySelectorAll(".veh-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.veh === vehMode));
    });
    renderVehSafe();
  }

  function setStatus(msg, isError = false) {
    if (!el.cpStatus) return;
    el.cpStatus.textContent = msg || "";
    el.cpStatus.dataset.error = isError ? "true" : "false";
  }

  /* ═══════════ ①/أ — وقت الوصول المعدّل بالطقس (Weather-Adjusted ETA) ═══════════
     هامش تأخير واقعي يُضاف لمدة القيادة التقديرية عند وجود شبورة كثيفة
     أو أمطار غزيرة أو رياح جانبية قوية على نقاط المسار. */
  function etaMarginSec(pts) {
    if (!pts?.length) return 0;
    let frac = 0;
    pts.forEach((p) => {
      const vis = p.vis, pr = p.pr ?? 0;
      const gust = p.gust ?? 0, wind = p.wind ?? 0;
      const cross = (p.cross ?? 0) * Math.max(gust, wind * 1.35);
      const f = p.info?.f ?? {};
      let m = 0;
      if (f.dense || (vis != null && vis < 200)) m = 0.10;
      else if (f.fog || (vis != null && vis < 1000)) m = 0.06;
      else if (vis != null && vis < 2000) m = 0.03;
      if (pr >= 8) m += 0.10; else if (pr >= 4) m += 0.06; else if (pr >= 1) m += 0.02;
      if (f.ice) m += 0.10;
      if (cross >= 45) m += 0.04;
      frac = Math.max(frac, m); /* أسوأ مقطع يحكم — لا تراكم مزدوج */
    });
    return Math.min(frac, 0.25);
  }

  let etaBadgeHtml = "";
  function renderEtaAdjusted(force = false) {
    const trip = api.trip();
    if (!el.summary) return;
    let badge = el.summary.querySelector(".eta-adj");
    if (!trip?.pts || !trip?.durSec) { etaBadgeHtml = ""; if (badge) badge.remove(); return; }
    if (force && badge) { badge.remove(); badge = null; }
    const margin = etaMarginSec(trip.pts);
    if (margin <= 0.005) { etaBadgeHtml = ""; if (badge) badge.remove(); return; }
    const addMin = Math.round((trip.durSec * margin) / 60);
    const adj = new Date(Date.now() + trip.durSec * 1000 + trip.durSec * margin * 1000);
    const html2 = `
      <span class="eta-adj-icon" aria-hidden="true">⏱</span>
      <span class="eta-adj-main"><b>${esc(tr("الوصول المعدّل بالطقس"))}</b>
        ${esc(tf("{t} بعد هامش {m} دقيقة إضافية", { t: clockText(adj), m: localNum(addMin) }))}</span>
      <span class="eta-adj-why">${esc(tr("هامش واقعي للشبورة/المطر/الرياح الجانبية على أبطأ مقطع"))}</span>`;
    /* حماية من حلقة الـ MutationObserver: لا تعيد البناء إن كان المحتوى متطابقًا */
    if (badge && badge.innerHTML === html2) { injectNavHandoff(); return; }
    etaBadgeHtml = html2;
    if (badge) badge.remove();
    badge = document.createElement("div");
    badge.className = "eta-adj";
    badge.innerHTML = html2;
    el.summary.appendChild(badge);
    injectNavHandoff();
  }

  /* مراقب آمن من الحلقات: يلحق شارة الوصول المعدّل وأزرار الملاحة كلما أعاد
     السكربت الرئيسي بناء ملخص الرحلة (يتوقف ذاتيًا بفضل مقارنة المحتوى أعلاه) */
  new MutationObserver(() => renderEtaAdjusted()).observe(document.body, {
    childList: true, subtree: true,
  });

  /* ═══════════ ⑧ التصدير المباشر للملاحة (جوجل + Waze) ═══════════ */
  function navLinks(latA, lonA, latB, lonB, via = "") {
    const g = `https://www.google.com/maps/dir/?api=1&origin=${latA.toFixed(5)},${lonA.toFixed(5)}&destination=${latB.toFixed(5)},${lonB.toFixed(5)}&travelmode=driving&dir_action=navigate`;
    const w = `https://waze.com/ul?ll=${latB.toFixed(5)}%2C${lonB.toFixed(5)}&navigate=yes`;
    return `
      <div class="nav-handoff">
        <a href="${g}" target="_blank" rel="noopener noreferrer" title="${esc(tr("انطلاق فوري في خرائط جوجل"))}">🗺 ${esc(tr("جوجل"))}${via ? ` · ${esc(via)}` : ""}</a>
        <a href="${w}" target="_blank" rel="noopener noreferrer" title="${esc(tr("انطلاق فوري في Waze"))}">🧭 Waze</a>
      </div>`;
  }

  function injectNavHandoff() {
    const trip = api.trip();
    if (!el.summary || !trip?.pts) return;
    if (el.summary.querySelector(".nav-handoff")) return;
    const a = trip.pts[0], b = trip.pts[trip.pts.length - 1];
    el.summary.insertAdjacentHTML("beforeend", navLinks(a.lat, a.lon, b.lat, b.lon));
  }

  /* ═══════════ ①/ب — المسارات البديلة (OSRM alternatives=true) ═══════════ */
  let altLayer = null;
  let altCache = { key: "", at: 0, alts: [] };
  const ALT_COLORS = ["#9b6bd6", "#3f7fd1", "#c2753f"];

  function altDistKey(A, B) {
    return `${(+A.latitude).toFixed(3)},${(+A.longitude).toFixed(3)}|${(+B.latitude).toFixed(3)},${(+B.longitude).toFixed(3)}`;
  }

  async function fetchAlternatives(A, B) {
    const key = altDistKey(A, B);
    if (altCache.key === key && Date.now() - altCache.at < 10 * 60e3) return altCache.alts;
    const servers = [
      "https://router.project-osrm.org/route/v1/driving/",
      "https://routing.openstreetmap.de/routed-car/route/v1/driving/",
    ];
    let routes = null;
    for (const base of servers) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 11000);
        const url = `${base}${A.longitude},${A.latitude};${B.longitude},${B.latitude}?overview=full&geometries=geojson&alternatives=true`;
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);
        if (!r.ok) continue;
        const data = await r.json();
        if (Array.isArray(data?.routes) && data.routes.length) { routes = data.routes; break; }
        if (data && "code" in data && data.code === "NoRoute") return [];
      } catch (e) { /* المزوّد التالي */ }
    }
    if (!routes) return [];
    const alts = routes
      .map((rt) => ({
        coords: rt.geometry?.coordinates ?? [],
        distM: rt.distance ?? 0,
        durSec: rt.duration ?? 0,
      }))
      .filter((rt) => rt.coords.length > 1 && rt.distM > 0)
      .slice(0, 3);
    altCache = { key, at: Date.now(), alts };
    return alts;
  }

  /* تصنيف مبسّط مطابق لمنطق السكربت الرئيسي (لنقاط المسارات البديلة) */
  function classifyLite(h, k) {
    const vis = h.visibility?.[k], code = h.weather_code?.[k], pr = h.precipitation?.[k] ?? 0;
    const wind = h.wind_speed_10m?.[k] ?? 0, gust = h.wind_gusts_10m?.[k] ?? 0;
    const temp = h.temperature_2m?.[k];
    const f = {
      dense: vis != null && vis < 200,
      fog: false, dust: false,
      rain: pr >= 4, storm: code >= 95,
      wind: wind >= 45 || gust >= 55,
      ice: temp != null && temp <= 1.5 && (pr >= 0.1 || (h.relative_humidity_2m?.[k] ?? 0) >= 95),
      heat: temp != null && temp >= 44,
    };
    f.fog = !f.dense && ((vis != null && vis < 1000) || code === 45 || code === 48);
    const level = f.dense || f.storm || pr >= 8 || gust >= 70 || f.ice ? 2 : f.fog || f.rain || f.wind || f.heat ? 1 : 0;
    return { level, f };
  }

  function sampleLite(coords, totalKm, n = 10) {
    const pts = [];
    const step = totalKm / n;
    let target = 0, cum = 0;
    for (let i = 0; i < coords.length; i += 1) {
      if (i > 0) {
        const dLat = (coords[i][1] - coords[i - 1][1]);
        const dLon = (coords[i][0] - coords[i - 1][0]) * Math.cos(((coords[i][1] + coords[i - 1][1]) / 2) * Math.PI / 180);
        cum += Math.sqrt(dLat * dLat + dLon * dLon) * 111.32;
      }
      if (cum >= target || i === coords.length - 1) {
        pts.push({ lon: coords[i][0], lat: coords[i][1], km: cum });
        target = cum + step;
      }
    }
    return pts;
  }

  const altAnalysisCache = new Map(); /* "distM|durSec" → نتيجة التحليل (TTL 10 د) */

  async function analyzeAlt(alt) {
    const ck = `${Math.round(alt.distM)}|${Math.round(alt.durSec)}`;
    const hit = altAnalysisCache.get(ck);
    if (hit && Date.now() - hit.at < 10 * 60e3) return hit.an;
    const totalKm = alt.distM / 1000;
    const pts = sampleLite(alt.coords, totalKm, 10);
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: pts.map((p) => p.lat.toFixed(3)).join(","),
      longitude: pts.map((p) => p.lon.toFixed(3)).join(","),
      hourly: "temperature_2m,relative_humidity_2m,precipitation,weather_code,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m",
      timezone: "auto", forecast_hours: "30",
      wind_speed_unit: "kmh", temperature_unit: "celsius", cell_selection: "land",
    });
    let list = null;
    try { list = await getJson(url); } catch (e) { return null; }
    if (!list) return null;
    const arr = Array.isArray(list) ? list : [list];
    if (arr.length !== pts.length) return null;
    let worst = 0, risky = 0, worstFlag = "";
    const now = Date.now(), durMs = alt.durSec * 1000;
    pts.forEach((p, i) => {
      const h = arr[i]?.hourly;
      if (!h?.time?.length) return;
      const off = (arr[i].utc_offset_seconds ?? 0) * 1000;
      const eta = now + (p.km / Math.max(totalKm, 0.001)) * durMs;
      /* مطابقة نصية حتمية لأقرب ساعة وصول */
      let k = 0, bd = Infinity;
      h.time.forEach((t, j) => {
        const local = new Date(new Date(t + ":00Z").getTime() + off).getTime();
        const d = Math.abs(local - eta);
        if (d < bd) { bd = d; k = j; }
      });
      const info = classifyLite(h, k);
      p.level = info.level;
      if (info.level > worst) { worst = info.level; worstFlag = Object.keys(info.f).find((x) => info.f[x]) || ""; }
      if (info.level > 0) risky += 1;
    });
    const margin = worst >= 2 ? 0.14 : worst === 1 ? 0.07 : 0;
    const an = { worst, risky, worstFlag, durAdjSec: Math.round(alt.durSec * (1 + margin)) };
    altAnalysisCache.set(ck, { at: Date.now(), an });
    return an;
  }

  function safetyBadge(level, risky) {
    if (level >= 2) return `<span class="alt-safety lv2">⛔ ${esc(tr("مخاطر جادة"))}</span>`;
    if (level === 1) return `<span class="alt-safety lv1">⚠️ ${esc(tf("{r} مقاطع تحتاج انتباه", { r: localNum(risky) }))}</span>`;
    return `<span class="alt-safety lv0">✅ ${esc(tr("آمن جويًا"))}</span>`;
  }

  function flagName(flag) {
    const map = {
      dense: tr("شبورة كثيفة"), fog: tr("ضباب/شبورة"), rain: tr("أمطار غزيرة"),
      storm: tr("عواصف رعدية"), wind: tr("رياح قوية"), dust: tr("غبار"),
      ice: tr("صقيع"), heat: tr("حرارة إجهاد"),
    };
    return map[flag] || "";
  }

  async function renderAlternatives() {
    const trip = api.trip();
    if (!el.altsWrap || !trip || Eco.isEco()) return;
    const { A, B } = trip;
    if (!A || !B) return;
    el.altsWrap.classList.remove("hidden");
    el.altsWrap.innerHTML = `<p class="alts-loading">${esc(tr("نفحص المسارات البديلة ونقارن أمانها الجوي…"))}</p>`;
    const alts = await fetchAlternatives(A, B);
    const main = { coords: trip.coords, distM: trip.distM, durSec: trip.durSec };
    if (!alts.length || alts.length < 2) {
      el.altsWrap.innerHTML = `<p class="alts-empty">${esc(tr("لا مسارات بديلة مميزة بين النقطتين على الشبكة الطرقية — المسار الحالي هو الخيار الوحيد العملي."))}</p>`;
      return;
    }
    const items = [];
    for (const alt of alts) {
      const an = await analyzeAlt(alt);
      items.push({ ...alt, an });
    }
    /* المسار الرئيسي ضمن المقارنة كمرجع */
    const mainSafe = (() => {
      let worst = 0, risky = 0;
      trip.pts.forEach((p) => { worst = Math.max(worst, p.info?.level ?? 0); if ((p.info?.level ?? 0) > 0) risky += 1; });
      return { worst, risky };
    })();
    const safest = items.reduce((a, b) => {
      const sa = (a.an?.worst ?? 0) * 100 + (a.an?.risky ?? 0);
      const sb = (b.an?.worst ?? 0) * 100 + (b.an?.risky ?? 0);
      return sb < sa ? b : a;
    }, items[0]);
    const fmt = (sec) => tf("{h} س {m} د", { h: number(Math.floor(sec / 3600)), m: number(Math.round((sec % 3600) / 60)) });
    const dKm = (m) => localNum(m / 1000);
    const rowFor = (label, it, idx, isSafest, color) => {
      const an = it.an;
      const dMin = Math.round((it.durSec - main.durSec) / 60);
      const dTxt = dMin === 0 ? tr("نفس زمن المسار الأصلي تقريبًا")
        : dMin > 0 ? tf("أبطأ بـ {v} دقيقة من الأصلي", { v: localNum(dMin) })
          : tf("أسرع بـ {v} دقيقة من الأصلي", { v: localNum(-dMin) });
      const flagTxt = an?.worstFlag ? flagName(an.worstFlag) : "";
      const first = it.coords[0], last = it.coords[it.coords.length - 1];
      return `
        <div class="alt-card${isSafest ? " is-safest" : ""}" data-alt="${idx}" style="--alt-c:${color}">
          <div class="alt-head"><span class="alt-name">${esc(label)}</span>${isSafest ? `<span class="alt-tag">🛡 ${esc(tr("الأكثر أمانًا جويًا"))}</span>` : ""}</div>
          <div class="alt-stats">
            <span>📏 ${esc(dKm(it.distM))} ${esc(tr("كم"))}</span>
            <span>⏱ ${esc(fmt(an ? an.durAdjSec : it.durSec))}${an ? ` ${esc(tr("(معدّل بالطقس)"))}` : ""}</span>
            <span>${esc(dTxt)}</span>
          </div>
          <div class="alt-foot">
            ${an ? safetyBadge(an.worst, an.risky) : `<span class="alt-safety">${esc(tr("تعذّر فحص طقس هذا المسار"))}</span>`}
            ${flagTxt ? `<span class="alt-flag">🌫 ${esc(flagTxt)}</span>` : ""}
            ${navLinks(first[1], first[0], last[1], last[0])}
          </div>
        </div>`;
    };
    const mainRow = `
      <div class="alt-card is-main" data-alt="-1" style="--alt-c:#2e9e5b">
        <div class="alt-head"><span class="alt-name">🅐 ${esc(tr("المسار المفحوص حاليًا"))}</span></div>
        <div class="alt-stats">
          <span>📏 ${esc(dKm(main.distM))} ${esc(tr("كم"))}</span>
          <span>⏱ ${esc(fmt(main.durSec))}</span>
        </div>
        <div class="alt-foot">${safetyBadge(mainSafe.worst, mainSafe.risky)}</div>
      </div>`;
    el.altsWrap.innerHTML = `
      <div class="alt-title">🔀 ${esc(tr("مقارنة المسارات البديلة — الزمن × الأمان الجوي"))}</div>
      <div class="alts-grid">
        ${mainRow}
        ${items.map((it, i) => rowFor(`🅑 ${tr("المسار البديل")} ${number(i + 1)}`, it, i, it === safest, ALT_COLORS[i % ALT_COLORS.length])).join("")}
      </div>`;
    el.altsWrap.querySelectorAll(".alt-card[data-alt]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        showAltOnMap(Number(card.dataset.alt));
      });
    });
  }

  function showAltOnMap(idx) {
    const trip = api.trip();
    const map = api.map();
    if (!trip || !map || !window.L) return;
    clearAltLayer();
    if (idx < 0) {
      try { map.fitBounds(L.latLngBounds(trip.coords.map((c) => [c[1], c[0]])), { padding: [40, 40] }); } catch (e) {}
      setStatus(tr("عدنا إلى المسار المفحوص الأصلي."));
      return;
    }
    const alts = altCache.alts;
    const alt = alts[idx];
    if (!alt) return;
    altLayer = L.layerGroup().addTo(map);
    const line = alt.coords.map((c) => [c[1], c[0]]);
    L.polyline(line, { color: "#ffffff", weight: 9, opacity: 0.85, dashArray: "2 8", lineCap: "round" }).addTo(altLayer);
    L.polyline(line, { color: ALT_COLORS[idx % ALT_COLORS.length], weight: 5, opacity: 0.95, lineCap: "round" }).addTo(altLayer);
    const first = alt.coords[0], last = alt.coords[alt.coords.length - 1];
    L.marker([first[1], first[0]], { icon: L.divIcon({ className: "", html: `<span class="alt-pin" style="background:${ALT_COLORS[idx % ALT_COLORS.length]}">🅑</span>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(altLayer);
    L.marker([last[1], last[0]], { icon: L.divIcon({ className: "", html: `<span class="alt-pin" style="background:${ALT_COLORS[idx % ALT_COLORS.length]}">🏁</span>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(altLayer);
    try { map.fitBounds(L.latLngBounds(line), { padding: [40, 40] }); } catch (e) {}
    setStatus(tr("عرضنا المسار البديل على الخريطة بخط متقطع — اضغط البطاقة الأصلية للعودة."));
  }

  function clearAltLayer() {
    if (altLayer) { try { altLayer.remove(); } catch (e) {} altLayer = null; }
  }

  /* ═══════════ ③ منحنى الارتفاعات وخطر الشبورة ═══════════ */
  let lastElev = null;
  let elevCache = { key: "", at: 0, elevs: null };

  async function renderElevation() {
    const trip = api.trip();
    if (!el.elevBox || !el.elevChart || !trip || Eco.isEco()) return;
    const pts = trip.pts;
    if (!pts?.length) return;
    el.elevBox.classList.remove("hidden");
    const ck = `${Math.round(trip.distM)}|${pts.length}`;
    let elevs = null;
    if (elevCache.key === ck && Date.now() - elevCache.at < 15 * 60e3) {
      elevs = elevCache.elevs;
    } else {
      el.elevBadge.textContent = tr("نجلب التضاريس…");
      const url = new URL("https://api.open-meteo.com/v1/elevation");
      url.search = new URLSearchParams({
        latitude: pts.map((p) => p.lat.toFixed(4)).join(","),
        longitude: pts.map((p) => p.lon.toFixed(4)).join(","),
      });
      try {
        const d = await getJson(url);
        elevs = d?.elevation;
      } catch (e) { elevs = null; }
      if (Array.isArray(elevs) && elevs.length === pts.length) {
        elevCache = { key: ck, at: Date.now(), elevs };
      }
    }
    if (!Array.isArray(elevs) || elevs.length !== pts.length) {
      el.elevBadge.textContent = tr("غير متاح");
      el.elevChart.innerHTML = "";
      return;
    }
    lastElev = elevs;
    /* خطر الشبورة: منخفض طبوغرافي + رطوبة مرتفعة/رؤية منخفضة عند وقت الوصول */
    const emin = Math.min(...elevs), emax = Math.max(...elevs);
    const span = Math.max(emax - emin, 1);
    const lowThr = emin + span * 0.22;
    const fogIdx = [];
    elevs.forEach((e2, i) => {
      const p = pts[i];
      const rh = p.hourly?.relative_humidity_2m?.[p.k] ?? 0;
      const vis = p.vis;
      if (e2 <= lowThr && (rh >= 85 || (vis != null && vis < 2000))) fogIdx.push(i);
    });
    drawElevChart(elevs, pts, fogIdx, emin, emax);
    el.elevBadge.textContent = tf("فرق تضاريس {v} م", { v: localNum(Math.round(emax - emin)) });
    const fogKm = fogIdx.map((i) => localNum(Math.round(pts[i].km)));
    el.elevNote.innerHTML = fogIdx.length
      ? `🌫 <b>${esc(tr("مناطق منخفضة مرشحة للشبورة المفاجئة"))}:</b> ${esc(tf("حول الكيلومترات {v} — الرطوبة المرتفعة تتجمع في المنخفضات فتتشكل شبورة مفاجئة حتى مع سماء صافية، خفف السرعة وأضئ أضواء الضباب عند المرور بها.", { v: fogKm.slice(0, 6).join("، ") }))}`
      : esc(tr("لا منخفضات مميزة معرضة لتكوّن شبورة مفاجئة على هذا المسار في توقيت الرحلة."));
  }

  function drawElevChart(elevs, pts, fogIdx, emin, emax) {
    const box = el.elevChart;
    const W = Math.max(box.clientWidth || 640, 320), H = 150, PAD = 14;
    const span = Math.max(emax - emin, 1);
    const X = (i) => PAD + (i / Math.max(elevs.length - 1, 1)) * (W - PAD * 2);
    const Y = (e) => H - PAD - ((e - emin) / span) * (H - PAD * 2);
    const path = elevs.map((e2, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(e2).toFixed(1)}`).join(" ");
    const area = `${path} L${X(elevs.length - 1).toFixed(1)},${H - PAD} L${X(0).toFixed(1)},${H - PAD} Z`;
    const lowThr = emin + span * 0.22;
    const yLow = Y(lowThr);
    const dots = fogIdx.map((i) => {
      const p = pts[i];
      return `<circle cx="${X(i).toFixed(1)}" cy="${Y(elevs[i]).toFixed(1)}" r="5" class="elev-fog-dot"><title>${esc(tf("شبورة محتملة · {v} كم · ارتفاع {e} م", { v: localNum(Math.round(p.km)), e: localNum(Math.round(elevs[i])) }))}</title></circle>`;
    }).join("");
    box.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="elevG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2e9e5b" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#2e9e5b" stop-opacity="0.05"/>
        </linearGradient></defs>
        <line x1="${PAD}" x2="${W - PAD}" y1="${yLow.toFixed(1)}" y2="${yLow.toFixed(1)}" class="elev-fog-line"/>
        <text x="${W - PAD - 4}" y="${(yLow - 6).toFixed(1)}" class="elev-fog-txt" text-anchor="end">${esc(tr("عتبة المنخفضات"))}</text>
        <path d="${area}" fill="url(#elevG)"/>
        <path d="${path}" fill="none" class="elev-line"/>
        ${dots}
      </svg>
      <div class="elev-ends"><span>⬊ ${esc(tr("الانطلاق"))} ${localNum(Math.round(elevs[0]))} م</span><span>${esc(tr("الوصول"))} ${localNum(Math.round(elevs[elevs.length - 1]))} م ⬈</span></div>`;
  }

  /* ═══════════ ⑥ رادار المطر الحي فوق مسار الرحلة ═══════════ */
  let radarLayer = null, radarTimer = 0, radarOn = false, radarErr = 0;

  async function toggleRouteRadar() {
    radarOn = !radarOn;
    el.radarBtn?.setAttribute("aria-pressed", String(radarOn));
    if (!radarOn) { stopRouteRadar(); return; }
    if (!api.trip()) {
      radarOn = false;
      el.radarBtn?.setAttribute("aria-pressed", "false");
      setStatus(tr("افحص الطريق أولًا كي يظهر الرادار فوق مسار الرحلة."), true);
      return;
    }
    if (Eco.isEco()) {
      radarOn = false;
      el.radarBtn?.setAttribute("aria-pressed", "false");
      try { window.__matarEcoBite?.(45, "رادار المطر"); } catch (e) {}
      setStatus(tr("رادار المطر متوقف في الوضع الاقتصادي — أوقفه من الإعدادات."), true);
      return;
    }
    startRouteRadar();
  }

  async function startRouteRadar() {
    const map = api.map();
    if (!map || !window.L) return;
    if (!map.getPane("routeRadar")) {
      const pane = map.createPane("routeRadar");
      pane.style.zIndex = "450"; /* فوق خط المسار (400) وتحت دبابيس الطقس (600) */
      pane.style.pointerEvents = "none";
    }
    try {
      const r = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
      if (!r.ok) throw new Error("http");
      const data = await r.json();
      const frames = data?.radar?.past ?? [];
      const latest = frames[frames.length - 1];
      if (!latest?.path) throw new Error("no-frame");
      if (radarLayer) { try { radarLayer.remove(); } catch (e) {} }
      radarLayer = L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`, {
        pane: "routeRadar", opacity: 0.55, maxZoom: 12, maxNativeZoom: 10,
        errorTileUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      }).addTo(map);
      radarErr = 0;
      setStatus(tf("رادار المطر الحي فوق المسار — مسح {v}", { v: clockText(new Date(latest.time * 1000)) }));
      clearTimeout(radarTimer);
      radarTimer = setTimeout(() => { if (radarOn) startRouteRadar(); }, 10 * 60e3);
    } catch (e) {
      if (++radarErr <= 3) {
        setStatus(tr("تعذّر جلب رادار المطر الآن — سنعيد المحاولة تلقائيًا."), true);
        radarTimer = setTimeout(() => { if (radarOn) startRouteRadar(); }, 90e3);
      } else {
        toggleRouteRadar();
        setStatus(tr("خدمة الرادار غير مستجيبة حاليًا — جرّب لاحقًا."), true);
      }
    }
  }

  function stopRouteRadar() {
    clearTimeout(radarTimer);
    if (radarLayer) { try { radarLayer.remove(); } catch (e) {} radarLayer = null; }
    setStatus("");
  }

  /* ═══════════ ② وضع القيادة الحي + التنبيهات الصوتية ═══════════ */
  let liveOn = false, liveWatch = 0, liveMarker = null, wakeLock = null;
  let livePos = null, liveSpeed = 0, announced = new Set(), lastSpeakAt = 0;

  function B_() { return window.__matarBridge || null; }

  function speakAr(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const vs = speechSynthesis.getVoices() || [];
      const lang = (B_()?.lang?.() || "ar").slice(0, 2);
      const v = vs.find((x) => /^ar([-_]|$)/i.test(String(x.lang || "")))
        || vs.find((x) => /arab|maged|ماجد/i.test(x.name || ""));
      if (v) { try { u.voice = v; } catch (e) {} }
      u.lang = v?.lang || (lang === "ar" ? "ar-SA" : lang);
      u.rate = 0.98; u.pitch = 1; u.volume = 1;
      speechSynthesis.speak(u);
    } catch (e) { /* النطق اختياري */ }
  }

  async function toggleLiveTrip() {
    liveOn = !liveOn;
    el.liveBtn?.setAttribute("aria-pressed", String(liveOn));
    if (!liveOn) { stopLiveTrip(); return; }
    const trip = api.trip();
    if (!trip) {
      liveOn = false;
      el.liveBtn?.setAttribute("aria-pressed", "false");
      setStatus(tr("افحص الطريق أولًا ثم ابدأ الرحلة الحية."), true);
      return;
    }
    if (!("geolocation" in navigator)) {
      liveOn = false;
      el.liveBtn?.setAttribute("aria-pressed", "false");
      setStatus(tr("جهازك لا يدعم تحديد الموقع الحي."), true);
      return;
    }
    startLiveTrip();
  }

  async function startLiveTrip() {
    /* قفل إضاءة الشاشة (Screen Wake Lock) مع إعادة الاكتساب عند العودة للتبويب */
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener?.("release", () => { wakeLock = null; });
      }
    } catch (e) { wakeLock = null; }
    document.addEventListener("visibilitychange", relockWake);
    announced = new Set();
    speakAr(tr("بدأ وضع الرحلة الحية. سننبهك صوتيًا قبل أي خطر جوي على الطريق بمسافة خمسة عشر كيلومترًا."));
    setStatus(tr("الرحلة الحية جارية — التتبع يعمل والتنبيهات الصوتية مفعّلة 🔊"));
    liveWatch = navigator.geolocation.watchPosition(onLiveFix, () => {
      setStatus(tr("تعذّر تحديد موقعك الحي — تأكد من تفعيل GPS وإذن الموقع."), true);
    }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
  }

  async function relockWake() {
    if (document.visibilityState !== "visible" || !liveOn) return;
    try { if (!wakeLock && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {}
  }

  function onLiveFix(pos) {
    const trip = api.trip();
    const map = api.map();
    if (!trip || !map || !window.L) return;
    livePos = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy };
    liveSpeed = (pos.coords.speed != null && pos.coords.speed >= 0) ? pos.coords.speed * 3.6 : liveSpeed;
    /* أقرب نقطة على المسار من موقعك */
    let nearI = 0, bd = Infinity;
    trip.pts.forEach((p, i) => {
      const d = api.haversine(livePos.lat, livePos.lon, p.lat, p.lon);
      if (d < bd) { bd = d; nearI = i; }
    });
    const near = trip.pts[nearI];
    if (!liveMarker) {
      liveMarker = L.marker([livePos.lat, livePos.lon], {
        icon: L.divIcon({ className: "", html: `<span class="car-marker">🚗</span>`, iconSize: [38, 38], iconAnchor: [19, 19] }),
        zIndexOffset: 900,
      }).addTo(map);
    } else {
      liveMarker.setLatLng([livePos.lat, livePos.lon]);
    }
    liveMarker.bindPopup(`<div class="trip-pop"><b>${esc(tr("موقعك الحي"))}</b><div>${tf("السرعة {v} كم/س", { v: localNum(liveSpeed) })}</div><div>${tf("أقرب نقطة على المسار: {v} كم", { v: localNum(bd, 1) })}</div><div>${tf("الوصول المتوقع {t}", { t: clockText(new Date(near.eta)) })}</div></div>`);
    if (bd > 3) { try { map.panTo([livePos.lat, livePos.lon], { animate: true }); } catch (e) {} }
    /* ═ التنبيه الصوتي التلقائي: خطر جوي على نقطة أمامك بمسافة أقل من 15 كم ═ */
    checkVoiceHazards(trip, near);
    updateHud(bd);
  }

  function checkVoiceHazards(trip, near) {
    const now = Date.now();
    if (now - lastSpeakAt < 18e3) return;
    for (const p of trip.pts) {
      if ((p.info?.level ?? 0) < 1) continue;
      if (announced.has(Math.round(p.km))) continue;
      const d = api.haversine(livePos.lat, livePos.lon, p.lat, p.lon);
      if (d >= 15 || d < 0.3) continue;
      /* الخطر يجب أن يكون أمامك لا خلفك: نقطة أبعد من أقرب نقطة (مع تسامح) */
      if (p.km < near.km - 2) continue;
      announced.add(Math.round(p.km));
      lastSpeakAt = now;
      const flags = p.info.f || {};
      const kind = flags.dense ? tr("شبورة كثيفة") : flags.fog ? tr("شبورة") : flags.dust ? tr("عاصفة ترابية")
        : flags.storm ? tr("عاصفة رعدية") : flags.rain ? tr("أمطار غزيرة") : flags.wind ? tr("رياح قوية")
          : flags.ice ? tr("احتمال تجمد") : tr("ظروف جوية صعبة");
      const km = Math.max(1, Math.round(d));
      speakAr(tf("تنبيه: {k} قادمة بعد {v} كيلومتر، يرجى تهدئة السرعة.", { k: kind, v: number(km) }));
      setStatus(tf("🔊 نبّهناك صوتيًا: {k} بعد {v} كم", { k: kind, v: number(km) }));
      try {
        Notif?.showNotification?.(tf("🚗 تنبيه الرحلة الحية: {k}", { k: kind }),
          tf("{k} على مسارك بعد {v} كم تقريبًا — خفف السرعة وزد الحذر.", { k: kind, v: number(km) }), "matar-live");
      } catch (e) {}
      return;
    }
  }

  function updateHud(bd) {
    const trip = api.trip();
    if (!el.cpStatus) return;
    const remain = trip?.pts?.length ? trip.pts[trip.pts.length - 1].eta - Date.now() : 0;
    el.cpStatus.textContent = tf("🚗 {v} كم/س · أقرب نقطة {d} كم · {w} حتى الوصول · قفل الشاشة مفعّل", {
      v: localNum(liveSpeed), d: localNum(bd, 1),
      w: remain > 0 ? tf("{h} س {m} د", { h: number(Math.floor(remain / 3600e3)), m: number(Math.round((remain % 3600e3) / 60e3)) }) : "—",
    });
  }

  function stopLiveTrip() {
    if (liveWatch) { navigator.geolocation.clearWatch(liveWatch); liveWatch = 0; }
    try { wakeLock?.release?.(); } catch (e) {}
    wakeLock = null;
    document.removeEventListener("visibilitychange", relockWake);
    if (liveMarker) { try { liveMarker.remove(); } catch (e) {} liveMarker = null; }
    speakAr(tr("أوقفنا الرحلة الحية — وصلت بأمان."));
    setStatus(tr("أوقفت الرحلة الحية."));
  }

  /* ═══════════ ④ حفظ الرحلة أوفلاين + أقرب نقطة أمان ═══════════ */
  async function saveTripOffline() {
    const trip = api.trip();
    if (!trip) { setStatus(tr("افحص الطريق أولًا ثم احفظ الرحلة."), true); return; }
    const pack = {
      ts: Date.now(),
      A: { name: trip.A?.name, latitude: trip.A?.latitude, longitude: trip.A?.longitude },
      B: { name: trip.B?.name, latitude: trip.B?.latitude, longitude: trip.B?.longitude },
      coords: trip.coords.map((c) => [+c[0].toFixed(5), +c[1].toFixed(5)]),
      durSec: trip.durSec, distM: trip.distM, totalKm: trip.totalKm,
      vehicle: vehMode,
      pts: trip.pts.map((p) => ({
        km: +p.km.toFixed(2), lat: +p.lat.toFixed(4), lon: +p.lon.toFixed(4),
        role: p.role ?? null, temp: p.temp, code: p.hourly?.weather_code?.[p.k] ?? 0,
        level: p.info?.level ?? 0, eta: p.eta, city: p.city?.ar ?? null,
      })),
      elev: lastElev,
      rests: (api.rests() ?? []).slice(0, 40).map((n) => ({
        lat: n.lat, lon: n.lon,
        t: n.tags?.amenity === "hospital" || n.tags?.amenity === "clinic" ? "hospital" : n.tags?.amenity === "fuel" ? "fuel" : "rest",
        name: n.tags?.["name:ar"] || n.tags?.["name:en"] || n.tags?.name || "",
      })),
    };
    try {
      const cache = await caches.open("matar:state");
      await cache.put(PACK_URL, new Response(JSON.stringify(pack), { headers: { "Content-Type": "application/json" } }));
      setStatus(tf("حفظنا الرحلة ({a} ← {b}) أوفلاين كاملة: المسار والطقس ونقاط الاستراحة — الخريطة والتنبيهات ستعمل بلا شبكة على الطرق الصحراوية.", { a: pack.A?.name ?? "—", b: pack.B?.name ?? "—" }));
    } catch (e) {
      setStatus(tr("تعذّر الحفظ الأوفلاين — قد تكون مساحة التخزين ممتلئة."), true);
    }
  }

  async function loadTripPack() {
    try {
      const cache = await caches.open("matar:state");
      const hit = await cache.match(PACK_URL);
      if (!hit) return null;
      return await hit.json();
    } catch (e) { return null; }
  }

  function REST_GLYPH(t) {
    return t === "hospital" ? "＋" : t === "fuel" ? "⛽" : "☕";
  }

  async function drawPack(pack) {
    const map = api.map();
    if (!map || !window.L || !pack?.coords?.length) return false;
    const layer = L.layerGroup().addTo(map);
    const line = pack.coords.map((c) => [c[1], c[0]]);
    L.polyline(line, { color: "#ffffff", weight: 10, opacity: 0.9 }).addTo(layer);
    pack.pts.forEach((p) => {
      const lv = p.level ?? 0;
      const code = p.code ?? 0;
      const t = p.temp != null ? Math.round(p.temp) : null;
      L.marker([p.lat, p.lon], {
        icon: L.divIcon({
          className: "",
          html: `<span class="trip-thermo lv${lv}">${wmoSvg(code, 1, 12)}${t != null ? `<b>${localNum(t)}°</b>` : ""}</span>`,
          iconSize: [46, 26], iconAnchor: [23, 13],
        }),
        zIndexOffset: 300,
      }).bindPopup(`<div class="trip-pop"><b>${esc(tr("نقطة محفوظة أوفلاين"))}</b><div>${wmoDesc(code)} · ${t != null ? tempText(t) : "—"}</div><div>${tf("{v} كم من الانطلاق", { v: localNum(p.km) })}${p.city ? ` · ${esc(p.city)}` : ""}</div><div>${tf("الوصول المتوقع {t}", { t: clockText(new Date(p.eta)) })}</div></div>`).addTo(layer);
    });
    (pack.rests ?? []).forEach((n) => {
      const t = n.t;
      L.marker([n.lat, n.lon], {
        icon: L.divIcon({ className: "", html: `<span class="rest-marker" data-type="${t}">${REST_GLYPH(t)}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
      }).bindPopup(`<div class="trip-pop"><b>${esc(n.name || tr("نقطة استراحة"))}</b><div>${esc(t === "hospital" ? tr("مستشفى/عيادة") : t === "fuel" ? tr("محطة وقود") : tr("منطقة استراحة"))}</div></div>`).addTo(layer);
    });
    try { map.fitBounds(L.latLngBounds(line), { padding: [40, 40] }); } catch (e) {}
    return true;
  }

  async function maybeRestoreOffline() {
    if (navigator.onLine) return;
    const pack = await loadTripPack();
    if (!pack) return;
    if (!api.map()) { api.ensureMap(); await new Promise((r) => setTimeout(r, 400)); }
    const ok = await drawPack(pack);
    if (ok) setStatus(tf("أنت أوفلاين — استعنا بنسخة الرحلة المحفوظة ({a} ← {b}) من كاش matar:state، والمسار والتنبيهات تعمل بلا شبكة.", { a: pack.A?.name ?? "—", b: pack.B?.name ?? "—" }));
  }

  function currentPosOrMid() {
    if (livePos) return livePos;
    const trip = api.trip();
    if (!trip?.pts?.length) return null;
    const mid = trip.pts[Math.floor(trip.pts.length / 2)];
    return { lat: mid.lat, lon: mid.lon };
  }

  let pendingSafeHaven = false;

  async function emergencySafeHaven() {
    const pos = currentPosOrMid();
    if (!pos) { setStatus(tr("افحص الطريق أولًا كي نحدد أقرب نقطة أمان."), true); return; }
    let rests = api.rests();
    if (!rests?.length) {
      setStatus(tr("نجلب محطات الأمان حول مسارك (مستشفيات ووقود واستراحات)…"));
      /* علم تسليم غير متزامن: إن وصلت نتائج Overpass بعد مهلة الطلب
         الحالية فسنكمل التحديد تلقائيًا لحظة وصولها (مُسجّل في wire) */
      pendingSafeHaven = true;
      try {
        await new Promise((resolve) => {
          api.onRests(() => resolve());
          api.fetchRests(false);
          setTimeout(resolve, 24000);
        });
        rests = api.rests();
      } catch (e) { rests = null; }
    }
    if (!rests?.length) {
      setStatus(tr("لا نقاط أمان مسجلة قرب المسار — اتبع أقرب منطقة مأهولة واحتفظ بمخزون وقود وماء."), true);
      return;
    }
    pendingSafeHaven = false;
    let best = null;
    rests.forEach((n) => {
      const d = api.haversine(pos.lat, pos.lon, n.lat, n.lon);
      if (!best || d < best.d) best = { n, d };
    });
    if (!best) return;
    const map = api.map();
    const trip = api.trip();
    const worst = trip?.pts?.length ? Math.max(...trip.pts.map((p) => p.info?.level ?? 0)) : 0;
    const n = best.n;
    const t = n.tags?.amenity === "hospital" || n.tags?.amenity === "clinic" ? "hospital" : n.tags?.amenity === "fuel" ? "fuel" : "rest";
    const label = t === "hospital" ? tr("مستشفى/عيادة") : t === "fuel" ? tr("محطة وقود") : tr("منطقة استراحة");
    const name = n.tags?.["name:ar"] || n.tags?.["name:en"] || n.tags?.name || label;
    if (map && window.L) {
      const layer = L.layerGroup().addTo(map);
      L.polyline([[pos.lat, pos.lon], [n.lat, n.lon]], { color: "#d6453d", weight: 4, dashArray: "6 8", opacity: 0.9 }).addTo(layer);
      L.marker([n.lat, n.lon], {
        icon: L.divIcon({ className: "", html: `<span class="safe-pin">🆘</span>`, iconSize: [34, 34], iconAnchor: [17, 30] }),
        zIndexOffset: 950,
      }).bindPopup(`<div class="trip-pop"><b>${esc(name)}</b><div>${esc(label)} · ${tf("{v} كم من موقعك", { v: localNum(best.d, 1) })}</div>${navLinks(pos.lat, pos.lon, n.lat, n.lon, label)}</div>`).addTo(layer);
      try { map.fitBounds(L.latLngBounds([[pos.lat, pos.lon], [n.lat, n.lon]]), { padding: [60, 60] }); } catch (e) {}
    }
    const km = localNum(best.d, 1);
    setStatus(tf("🆘 أقرب نقطة أمان: {name} ({type}) على بعد {v} كم — فتحناها على الخريطة مع مسار الوصول وأزرار الملاحة.", { name, type: label, v: km }));
    if (worst >= 2) speakAr(tf("تنبيه طوارئ: أقرب نقطة أمان هي {name} على بعد {v} كيلومتر. توجه إليها الآن بحذر.", { name, v: km }));
  }

  /* ═══════════ ⑦ بلاغات السائقين اللحظية ═══════════ */
  const REPORT_META = {
    fog: { icon: "🌫", label: tr("شبورة الآن") },
    dust: { icon: "🌪", label: tr("عاصفة ترابية") },
    water: { icon: "💧", label: tr("تجمع مياه") },
    closed: { icon: "🚧", label: tr("طريق مغلق") },
  };
  /* REPORTS_KEY مُعرّف أعلى الموديول */
  let reportsLayer = null;

  function readReports() {
    try { return JSON.parse(localStorage.getItem(REPORTS_KEY)) || []; } catch (e) { return []; }
  }
  function writeReports(list) {
    try { localStorage.setItem(REPORTS_KEY, JSON.stringify(list.slice(-30))); } catch (e) {}
  }

  function activeLocaleSafe() {
    try { return B_()?.lang?.() || "ar"; } catch (e) { return "ar"; }
  }

  function reportShareText(r) {
    const meta = REPORT_META[r.kind] || REPORT_META.fog;
    return `${meta.label} — https://maps.google.com/?q=${r.lat},${r.lon} (مَطَر برو)`;
  }

  function drawReports() {
    const map = api.map();
    if (!map || !window.L) return;
    if (reportsLayer) { try { reportsLayer.remove(); } catch (e) {} reportsLayer = null; }
    const layer = L.layerGroup();
    readReports().forEach((r) => {
      const meta = REPORT_META[r.kind] || REPORT_META.fog;
      const stamp = new Intl.DateTimeFormat(activeLocaleSafe(), { hour: "2-digit", minute: "2-digit" }).format(new Date(r.ts));
      L.marker([r.lat, r.lon], {
        icon: L.divIcon({
          className: "crowd-wrap",
          html: `<span class="crowd-marker" data-kind="${r.kind}"><i class="crowd-pulse"></i>${meta.icon}</span>`,
          iconSize: [40, 40], iconAnchor: [20, 20],
        }),
        zIndexOffset: 800,
      }).bindPopup(`<div class="trip-pop"><b>${esc(meta.label)}</b><div>${esc(tr("بلاغ سائق"))} · ${esc(stamp)}</div><div class="crowd-share"><button type="button" class="crowd-share-btn" data-share='${encodeURIComponent(JSON.stringify(r))}'>📤 ${esc(tr("مشاركة سريعة"))}</button><a href="https://wa.me/?text=${encodeURIComponent(reportShareText(r))}" target="_blank" rel="noopener noreferrer">🟢 واتساب</a></div></div>`).addTo(layer);
    });
    reportsLayer = layer.addTo(map);
  }

  async function shareReport(r) {
    try {
      const txt = reportShareText(r);
      if (navigator.share) await navigator.share({ title: "مَطَر برو — بلاغ طريق", text: txt });
      else window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
    } catch (e) { /* ألغى المستخدم */ }
  }

  function wireCrowdBar() {
    if (!el.crowdBar || el.crowdBar.dataset.wired) return;
    el.crowdBar.dataset.wired = "1";
    el.crowdBar.addEventListener("click", async (e) => {
      const btn = e.target.closest(".crowd-btn");
      if (!btn) return;
      const kind = btn.dataset.report;
      const pos = currentPosOrMid();
      if (!pos) { setStatus(tr("افحص الطريق أولًا كي نربط البلاغ بالمسار."), true); return; }
      const report = { ts: Date.now(), lat: +pos.lat.toFixed(5), lon: +pos.lon.toFixed(5), kind };
      writeReports([...readReports(), report]);
      drawReports();
      const meta = REPORT_META[kind];
      setStatus(tf("سجّلنا بلاغك: {k} — ظهر كعلامة نابضة على الخريطة بإحداثياتك، ويمكنك مشاركته بضغطة.", { k: meta.label }));
      await shareReport(report);
    });
    /* ربط أزرار المشاركة داخل نوافذ البلاغات (تفويض على مستوى المستند) */
    document.addEventListener("click", (e) => {
      const shareBtn = e.target.closest(".crowd-share-btn");
      if (!shareBtn) return;
      evShare(shareBtn);
    });
    async function evShare(shareBtn) {
      try {
        const r = JSON.parse(decodeURIComponent(shareBtn.dataset.share));
        await shareReport(r);
      } catch (err) {}
    }
  }

  /* ═══════════ الربط والتشغيل ═══════════ */
  function wire() {
    wireVehicleBar();
    wireCrowdBar();
    el.radarBtn?.addEventListener("click", () => { toggleRouteRadar(); });
    el.liveBtn?.addEventListener("click", () => { toggleLiveTrip(); });
    el.saveBtn?.addEventListener("click", () => { saveTripOffline(); });
    el.safeBtn?.addEventListener("click", () => { emergencySafeHaven(); });

    /* وصول متأخر لمحطات الاستراحة: أكمل تحديد أقرب نقطة أمان تلقائيًا
       إن كان طلب الطوارئ معلقًا، وأعد رسم علامات البلاغات */
    api.onRests((items) => {
      if (pendingSafeHaven && items?.length) {
        pendingSafeHaven = false;
        emergencySafeHaven();
      }
    });

    /* بعد كل فحص طريق: بدائل + ارتفاعات + بلاغات + أزرار الملاحة + شارات الرادار/البلاغات */
    document.addEventListener("matar:route", () => {
      el.radarBtn?.classList.remove("hidden");
      el.crowdBar?.classList.remove("hidden");
      clearAltLayer();
      injectNavHandoff();
      renderVehSafe();
      renderAlternatives();
      renderElevation();
      drawReports();
    });

    document.addEventListener("matar:language", () => {
      renderVehSafe();
      renderEtaAdjusted(true);
      drawReports();
    });

    /* الأوفلاين: استعادة الرحلة المحفوظة تلقائيًا عند فقدان الشبكة */
    document.addEventListener("matar:offline", () => { maybeRestoreOffline(); });
    window.addEventListener("offline", () => { maybeRestoreOffline(); });

    /* إظهار بلاغات سابقة عند أول تهيئة للخريطة */
    setTimeout(() => { try { drawReports(); } catch (e) {} }, 1500);
  }

  wire();
  return {};
})();

/* ═══════════════════ 9) v55 — طبقة تسمية «فلسطين المحتلة» ═══════════════════ */

"use strict";
/* ============================================================
   مَطَر برو — إصدار 55: الخريطة التفاعلية الجيل القادم (Next-Gen Lightweight Map)
   ------------------------------------------------------------
   ① طبقة التسميات الجغرافية المخصصة: «فلسطين المحتلة / Occupied Palestine»
      عند الإحداثيات (30.946, 34.834) عبر L.divIcon في لوح z-index 660
      بـ pointer-events: none — تعمل على كل مستويات التقريب (من الزووم البعيد
      3 حتى القريب 16) بخط يتناسب حجمه تلقائيًا مع الزووم، وتطفو فوق كل
      الأساسات (الداكن، الشوارع، والقمر الصناعي) على الخريطة الكبرى وخريطة
      الطرق والخريطة المصغرة معًا.
   ② v65: بطاقة «نقطة التفتيش الفورية» حُذفت في التنظيف الجذري — النقرة الواحدة
      والضغط المطوّل 500ms كلاهما يفتح شريط توقعات Windy السفلي (10 أيام ×
      كل 3 ساعات) مباشرة من وحدة MX.
   ③ v64: ترجمات أزرار البطاقة حُذفت مع البطاقة نفسها.
   ============================================================ */
(() => {
  const $q = (s, r) => (r || document).querySelector(s);

    /* v64: حُذفت ترجمات أزرار بطاقة النقطة مع حذف البطاقة نفسها */

  /* ══ ① التسميات المخصصة (Custom Country Label Layer) ══ */
  /* v66: الإحداثيات الدقيقة المحدثة (30.946, 34.834) — تثبيت مركزي تام:
     iconSize [160,26] + iconAnchor [80,13] + direction: ltr على .cl-outer
     يجعل مركز صندوق التسمية هو نقطة الإحداثيات نفسها فلا تتحرك أبدًا عند
     أي تكبير أو تصغير — والنص يتحدث فورًا بكل اللغات السبع عبر sync
     ومستمع matar:language */
  const CL = { lat: 30.946, lng: 34.834 };
  const CL_MAPS = new WeakMap();
  function clText() {
    const l2 = (document.documentElement.lang || "ar").slice(0, 2).toLowerCase();
    return ({
      ar: "فلسطين المحتلة", en: "Occupied Palestine", fr: "Palestine occupée",
      de: "Besetztes Palästina", es: "Palestina Ocupada", pt: "Palestina Ocupada", it: "Palestina Occupata",
    })[l2] || "Occupied Palestine";
  }
  function clSize(zoom) {
    /* v56: خط صغير أنيق متناسق مع باقي أسماء الدول على البلاطات —
       11px في الزووم البعيد، 13px في المتوسط، 14px في القريب (ثابت داخل كل نطاق
       كي لا «يتحرك» النص مع كل عجلة تكبير — ثبات بصري كامل عند التكبير والتصغير) */
    const z = zoom || 3;
    return z >= 12 ? 14 : z >= 7 ? 13 : 11;
  }
  function attachCountryLabel(map) {
    if (!map || !window.L || CL_MAPS.has(map)) return;
    try {
      if (!map.getPane("mx-country-labels")) {
        const pane = map.createPane("mx-country-labels");
        pane.style.zIndex = "660";
        pane.style.pointerEvents = "none";
      }
    } catch (e) { return; }
    let marker = null;
    const build = () => {
      /* v57: صندوق إرساء دقيق — iconSize [160,26] مع iconAnchor [80,13] يجعل
         مركز صندوق 160×26 هو نقطة الإحداثيات نفسها تمامًا، وwidth: 160px مع
         text-align: center وline-height: 26px وdirection: ltr على .cl-outer
         يثبّت الكلمة في مركز الصندوق عند أي تكبير/تصغير بلا انزاح نهائيًا،
         والنص يتبدل فورًا مع لغة الواجهة عبر sync ومستمع matar:language */
      const html = `<span class="cl-outer"><i class="cl-dot" aria-hidden="true"></i><span class="cl-text" style="--cl-size:${clSize(map.getZoom()).toFixed(1)}px">${clText()}</span></span>`;
      return L.marker([CL.lat, CL.lng], {
        pane: "mx-country-labels",
        icon: L.divIcon({ className: "mx-country-label", html, iconSize: [160, 26], iconAnchor: [80, 13] }),
        interactive: false, keyboard: false,
      }).addTo(map);
    };
    try { marker = build(); } catch (e) { return; }
    const sync = () => {
      const el = marker.getElement();
      if (!el) return;
      const t = el.querySelector(".cl-text");
      if (!t) return;
      t.style.setProperty("--cl-size", `${clSize(map.getZoom()).toFixed(1)}px`);
      const txt = clText();
      if (t.textContent !== txt) t.textContent = txt;
    };
    map.on("zoom zoomend", sync);
    document.addEventListener("matar:language", sync);
    CL_MAPS.set(map, { marker, sync });
  }
  window.matarCountryLabels = { attach: attachCountryLabel };

    /* v64: حُذفت بطاقة «نقطة التفتيش الفورية» كليًا — النقرة الواحدة والضغط
     المطوّل 500ms كلاهما يفتح شريط توقعات Windy السفلي مباشرة، وتسميات
     «فلسطين المحتلة» المخصصة أعلاه تعمل كما هي على كل الخرائط */
})();

/* ═══════════════════ 10) v66 — رادار الأمطار والبرق + الشريط الزمني ═══════════════════ */

"use strict";
(() => {
  /* ════════════════════════════════════════════════════════════════════
     مَطَر برو — إصدار 66 (المرحلة الثانية): محرك «🌧️ رادار الأمطار والبرق»
     ------------------------------------------------------------
     ① زر «🌧️ رادار الأمطار» بجانب مبدّل الأساس (🌙 داكن | 🛣 شوارع) في
        اللوحة الجانبية — طبقة مستقلة لا تمس الأساس ولا شريط توقعات الـ 10
        أيام ولا خريطة «طقس الطرق والسفر» إطلاقًا،
     ② بلاطات RainViewer الحية (radar.past آخر ساعتين + radar.nowcast
        ساعتان قادمتان) بلوحة Universal Blue القياسية (لون 2 · smooth 1 ·
        snow 1) بشفافية 0.78 وفلتر blur(0.6px) saturate(1.15) — والمناطق
        الجافة شفافة تمامًا 100٪ من المصدر فلا لون أزرق وهمي فوق مصر،
     ③ مؤشرات برق ⚡ متوهجة (أبيض/بنفسجي ناعم) فوق بؤر العواصف النشطة عند
        نقاط الفحص حول الخريطة المرئية (weather_code ≥ 95 أو CAPE مرتفع)،
     ④ شريط التحكم الزمني الزجاجي (Floating Pill Dock) أسفل الخريطة: زر
        تشغيل نابض 42×42 بتدرج سياني + مسار ثنائي اللون (الماضي الرصدي سياني
        والآن نقطة مضيئة والمستقبل بنفسجي/ذهبي دافئ) + مقبض سحب أبيض لامع
        بهالة مضيئة + فقاعة وقت بشارة «رصد حي»/«توقع مستقبلي» + مفتاح ألوان
        نحيف (0.2 | 2 | 5 | 15+ مم/س) — وينكمش الشريط بسلاسة عند فتح شريط
        توقعات الـ 10 أيام ليترك له المساحة كاملة،
     ⑤ الوصول إلى خريطة Leaflet الكبرى عبر جسر window.MX.getMap() الذي
        يعرّفه السكربت الرئيسي في هذه النسخة — بلا أي مساس بمنطق الشريط
        أو خريطة الطرق نهائيًا.
     ════════════════════════════════════════════════════════════════════ */

  /* ── قاموس مصغّر مستقل باللغات السبع (نفس نمط v55 clText) ── */
  const T = {
    rainBtn: { ar: "🌧️ رادار الأمطار", en: "🌧️ Rain Radar", fr: "🌧️ Radar de pluie", de: "🌧️ Regenradar", es: "🌧️ Radar de lluvia", pt: "🌧️ Radar de chuva", it: "🌧️ Radar pioggia" },
    radarTitle: { ar: "رادار الأمطار والبرق", en: "Rain & Lightning Radar", fr: "Radar pluie et foudre", de: "Regen- und Blitzradar", es: "Radar de lluvia y rayos", pt: "Radar de chuva e raios", it: "Radar pioggia e fulmini" },
    live: { ar: "رصد حي", en: "Live", fr: "En direct", de: "Live", es: "En vivo", pt: "Ao vivo", it: "In tempo reale" },
    fcst: { ar: "توقع مستقبلي", en: "Forecast", fr: "Prévision", de: "Vorhersage", es: "Pronóstico", pt: "Previsão", it: "Previsione" },
    mmph: { ar: "مم/س", en: "mm/h", fr: "mm/h", de: "mm/h", es: "mm/h", pt: "mm/h", it: "mm/h" },
    timeline: { ar: "الخط الزمني للرادار", en: "Radar timeline", fr: "Chronologie du radar", de: "Radar-Zeitleiste", es: "Cronología del radar", pt: "Linha do tempo do radar", it: "Cronologia del radar" },
    playPause: { ar: "تشغيل/إيقاف حركة الرادار", en: "Play/pause radar animation", fr: "Lecture/pause du radar", de: "Radar-Animation starten/stoppen", es: "Reproducir/pausar el radar", pt: "Reproduzir/pausar o radar", it: "Riproduci/pausa radar" },
    radarErr: { ar: "تعذّر جلب إطارات الرادار الآن — حاول مرة أخرى", en: "Radar frames unavailable right now — try again", fr: "Images radar indisponibles pour le moment — réessayez", de: "Radarbilder derzeit nicht verfügbar — bitte erneut versuchen", es: "Fotogramas del radar no disponibles ahora — reintenta", pt: "Quadros do radar indisponíveis agora — tenta de novo", it: "Fotogrammi del radar non disponibili — riprova" },
  };
  const l2 = () => (document.documentElement.lang || "ar").slice(0, 2).toLowerCase();
  const tx = (k) => { const row = T[k]; return (row && (row[l2()] || row.en || row.ar)) || ""; };

  const RV_API = "https://api.rainviewer.com/public/weather-maps.json";
  /* Universal Blue القياسية: لون رقم 2 + تنعيم smooth 1 + ثلج snow 1 */
  const RV_TILE = (p) => `https://tilecache.rainviewer.com${p}/256/{z}/{x}/{y}/2/1_1.png`;
  const TPNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  const PANE_R = "mxr-radar", PANE_B = "mxr-bolts";

  const R = {
    on: false, frames: [], idx: 0, playing: false, wasPlaying: false, drag: false,
    timer: 0, boltTimer: 0, moveTimer: 0, hintTimer: 0,
    layer: null, bolts: null, token: 0, tMin: 0, tMax: 1, nowPos: 0.5,
  };
  const ui = {};
  const BOUND = new WeakSet();

  const bigMap = () => { try { return (window.MX && typeof window.MX.getMap === "function" && window.MX.getMap()) || null; } catch (e) { return null; } };
  const pageVisible = () => { const p = document.getElementById("page-map"); return !!(p && !p.hidden); };
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  let FMT = null, FMT_LANG = "";
  function fmtTime(ms) {
    const lg = document.documentElement.lang || "ar";
    if (!FMT || FMT_LANG !== lg) {
      try { FMT = new Intl.DateTimeFormat(lg, { hour: "2-digit", minute: "2-digit" }); }
      catch (e) { FMT = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }); }
      FMT_LANG = lg;
    }
    try { return FMT.format(new Date(ms)); } catch (e) { return "—"; }
  }

  function ensurePanes(map) {
    try {
      if (!map.getPane(PANE_R)) { const p = map.createPane(PANE_R); p.style.zIndex = "450"; }
      if (!map.getPane(PANE_B)) { const p = map.createPane(PANE_B); p.style.zIndex = "470"; p.style.pointerEvents = "none"; }
    } catch (e) { /* خريطة غير مهيأة */ }
  }

  /* ── جلب الإطارات: آخر ساعتين رصد حي (radar.past) + ساعتين توقع (radar.nowcast) ── */
  async function loadFrames() {
    const res = await fetch(RV_API, { cache: "no-store", credentials: "omit" });
    if (!res.ok) throw new Error("http");
    const j = await res.json();
    const nowS = Date.now() / 1000;
    const allPast = ((j && j.radar && j.radar.past) || []).filter((f) => f && f.path);
    let past = allPast.filter((f) => f.time >= nowS - 7200);
    const nowcast = ((j && j.radar && j.radar.nowcast) || []).filter((f) => f && f.path && f.time <= nowS + 7200);
    if (!past.length) past = allPast.slice(-3); /* احتياط: أحدث ما توافر */
    const fr = [];
    past.forEach((f) => fr.push({ t: f.time * 1000, path: f.path, fc: false }));
    nowcast.forEach((f) => fr.push({ t: f.time * 1000, path: f.path, fc: true }));
    if (fr.length < 2) throw new Error("no-frames");
    fr.sort((a, b) => a.t - b.t);
    return fr;
  }

  function framePos(i) {
    const f = R.frames[i];
    return clamp01((f.t - R.tMin) / Math.max(R.tMax - R.tMin, 1));
  }

  function showFrame(i) {
    if (!R.frames.length) return;
    const n = R.frames.length;
    R.idx = ((i % n) + n) % n;
    const f = R.frames[R.idx];
    const pos = framePos(R.idx);
    if (ui.main) ui.main.style.setProperty("--mxr-pos", (pos * 100).toFixed(2) + "%");
    const live = !f.fc && f.t <= Date.now() + 6e4;
    if (ui.badge) ui.badge.dataset.mode = live ? "live" : "fcst";
    if (ui.time) ui.time.textContent = fmtTime(f.t);
    if (ui.kind) ui.kind.textContent = live ? tx("live") : tx("fcst");
    if (ui.track) {
      ui.track.setAttribute("aria-valuenow", String(Math.round(pos * 100)));
      try { ui.track.setAttribute("aria-valuetext", `${fmtTime(f.t)} — ${live ? tx("live") : tx("fcst")}`); } catch (e) {}
    }
    if (R.layer) { try { R.layer.setUrl(RV_TILE(f.path)); } catch (e) {} }
  }

  function setPlaying(on) {
    R.playing = !!on;
    if (ui.orb) {
      ui.orb.classList.toggle("mxr-playing", R.playing);
      ui.orb.textContent = R.playing ? "⏸" : "▶";
    }
    clearInterval(R.timer);
    R.timer = 0;
    if (R.playing) {
      R.timer = setInterval(() => {
        if (!R.on || !pageVisible() || document.hidden) { R.wasPlaying = false; setPlaying(false); return; }
        showFrame(R.idx + 1);
      }, 700);
    }
  }

  /* ── مؤشرات البرق ⚡ فوق بؤر العواصف النشطة حول الخريطة المرئية ── */
  async function updateBolts() {
    const map = bigMap();
    if (!R.on || !map || !window.L) return;
    const tok = R.token;
    try {
      const b = map.getBounds().pad(0.03);
      const z = map.getZoom() || 4;
      const cols = z < 5 ? 4 : z < 8 ? 3 : 2;
      const rows = z < 5 ? 3 : 2;
      const pts = [];
      for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
          pts.push([
            b.getSouth() + ((b.getNorth() - b.getSouth()) * (i + 0.5)) / rows,
            b.getWest() + ((b.getEast() - b.getWest()) * (j + 0.5)) / cols,
          ]);
        }
      }
      const u = new URL("https://api.open-meteo.com/v1/forecast");
      u.search = new URLSearchParams({
        latitude: pts.map((p) => p[0].toFixed(3)).join(","),
        longitude: pts.map((p) => p[1].toFixed(3)).join(","),
        hourly: "cape,weather_code", forecast_days: "1", timezone: "UTC",
      });
      const res = await fetch(u, { credentials: "omit" });
      if (!res.ok) return;
      const data = await res.json();
      if (R.token !== tok) return;
      const arr = Array.isArray(data) ? data : [data];
      const nowKey = new Date().toISOString().slice(0, 13) + ":00";
      const grp = L.layerGroup();
      arr.forEach((d, i) => {
        if (!d || !d.hourly || !Array.isArray(d.hourly.time) || !pts[i]) return;
        let k = d.hourly.time.indexOf(nowKey);
        if (k < 0) k = Math.min(2, d.hourly.time.length - 1);
        const wc = Number((d.hourly.weather_code || [])[k] || 0);
        const cape = Number((d.hourly.cape || [])[k] || 0);
        /* خلية رعدية نشطة (v67): كود عاصفة رعدية (≥ 95) أو طاقة عدم استقرار
           جوي CAPE > 400 — ونبضة الإضاءة تتكرر كل ثانيتين فوق بؤرة العاصفة */
        if (wc >= 95 || cape >= 400) {
          grp.addLayer(L.marker(pts[i], {
            pane: PANE_B, interactive: false, keyboard: false,
            icon: L.divIcon({
              className: "mxr-bolt-wrap", iconSize: [30, 30], iconAnchor: [15, 15],
              html: '<span class="mxr-bolt" style="animation-delay:' + (((i * 470) % 2200) / 1000).toFixed(2) + 's">⚡</span>',
            }),
          }));
        }
      });
      if (R.bolts) { try { R.bolts.remove(); } catch (e) {} }
      R.bolts = grp;
      grp.addTo(map);
    } catch (e) { /* البرق زينة كشفية — فشله لا يكسر الرادار أبدًا */ }
  }

  function flashHint() {
    if (!ui.hint) return;
    ui.hint.textContent = tx("radarErr");
    clearTimeout(R.hintTimer);
    R.hintTimer = setTimeout(() => { if (ui.hint) ui.hint.textContent = ""; }, 6000);
  }

  function syncButton() {
    if (ui.btn) ui.btn.setAttribute("aria-pressed", String(R.on));
  }

  async function activate() {
    const tok = ++R.token;
    /* انتظار جهوزية الخريطة الكبرى (تحميل كسول لـ Leaflet أو بناء المحرك) */
    let map = bigMap();
    for (let tries = 0; !map && tries < 40; tries += 1) {
      await new Promise((r) => setTimeout(r, 250));
      if (R.token !== tok) return;
      map = bigMap();
    }
    if (!map || !window.L) { R.on = false; syncButton(); flashHint(); return; }
    R.on = true;
    syncButton();
    /* v67: الحصرية الكاملة والتنسيق — تفعيل الرادار يغلق طبقة تراكم الأمطار (v67)
       فورًا ويُخفي خيوط الرياح الدائمة عبر حدث matar:radar (تستمع به v67) */
    try { if (window.MatarV67 && typeof window.MatarV67.off === "function") window.MatarV67.off(); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("matar:radar", { detail: { on: true } })); } catch (e) {}
    ensurePanes(map);
    bindMapEvents(map);
    let frames;
    try { frames = await loadFrames(); }
    catch (e) {
      if (R.token !== tok) return;
      R.on = false; syncButton(); flashHint();
      return;
    }
    if (R.token !== tok) return;
    R.frames = frames;
    R.tMin = frames[0].t;
    R.tMax = frames[frames.length - 1].t;
    /* نقطة «الآن» المضيئة تفصل الرصد السياني عن التوقع البنفسجي/الذهبي */
    R.nowPos = Math.min(Math.max(clamp01((Date.now() - R.tMin) / Math.max(R.tMax - R.tMin, 1)), 0.06), 0.94);
    if (ui.main) ui.main.style.setProperty("--mxr-now", (R.nowPos * 100).toFixed(2) + "%");
    if (R.layer) { try { R.layer.remove(); } catch (e) {} R.layer = null; }
    /* الطبقة: Universal Blue (لون 2 · smooth 1 · snow 1) بشفافية 0.78 متوازنة —
       maxNativeZoom 7 صارمًا (حد طلب RainViewer المعتمد) وتمطيط ناعم حتى 19 */
    R.layer = L.tileLayer(RV_TILE(frames[0].path), {
      pane: PANE_R, opacity: 0.78, maxNativeZoom: 7, maxZoom: 19,
      className: "mxr-tiles", updateWhenIdle: false, keepBuffer: 2,
      errorTileUrl: TPNG,
    }).addTo(map);
    /* البداية من أحدث إطار رصد حي ثم تشغيل الحركة تلقائيًا (نمط Windy) */
    let start = 0;
    for (let i = 0; i < frames.length; i += 1) if (!frames[i].fc) start = i;
    showFrame(start);
    if (ui.dock) ui.dock.hidden = false;
    setPlaying(true);
    updateBolts();
    clearInterval(R.boltTimer);
    R.boltTimer = setInterval(() => { if (R.on && pageVisible() && !document.hidden) updateBolts(); }, 10 * 60e3);
  }

  function deactivate() {
    R.token += 1;
    R.on = false;
    setPlaying(false);
    clearInterval(R.boltTimer); R.boltTimer = 0;
    clearTimeout(R.moveTimer); R.moveTimer = 0;
    if (R.layer) { try { R.layer.remove(); } catch (e) {} R.layer = null; }
    if (R.bolts) { try { R.bolts.remove(); } catch (e) {} R.bolts = null; }
    R.frames = [];
    if (ui.dock) ui.dock.hidden = true;
    syncButton();
    /* v67: إشعار سكربت v67 بأن الرادار أُغلق — تعود خيوط الرياح الدائمة ومؤشرات
       البرق العامة فوق الخريطة تلقائيًا */
    try { document.dispatchEvent(new CustomEvent("matar:radar", { detail: { on: false } })); } catch (e) {}
  }

  function bindMapEvents(map) {
    if (BOUND.has(map)) return;
    BOUND.add(map);
    map.on("moveend zoomend", () => {
      if (!R.on) return;
      clearTimeout(R.moveTimer);
      R.moveTimer = setTimeout(() => { if (R.on && pageVisible()) updateBolts(); }, 1500);
    });
  }

  /* ── السحب على المسار: المقبض يتبع الإصبع فورًا (60fps) ── */
  function seekClientX(cx) {
    if (!ui.track || !R.frames.length) return;
    const r = ui.track.getBoundingClientRect();
    if (!r.width) return;
    const p = clamp01((cx - r.left) / r.width);
    let best = 0, bd = Infinity;
    R.frames.forEach((f, i) => {
      const d = Math.abs(framePos(i) - p);
      if (d < bd) { bd = d; best = i; }
    });
    showFrame(best);
  }

  function bindDock() {
    ui.orb?.addEventListener("click", () => setPlaying(!R.playing));
    const t = ui.track;
    if (!t) return;
    t.addEventListener("pointerdown", (e) => {
      if (!R.frames.length) return;
      try { t.setPointerCapture(e.pointerId); } catch (err) {}
      try { t.focus({ preventScroll: true }); } catch (err) {}
      R.wasPlaying = R.playing;
      setPlaying(false);
      R.drag = true;
      seekClientX(e.clientX);
    });
    t.addEventListener("pointermove", (e) => { if (R.drag) seekClientX(e.clientX); });
    const endDrag = () => {
      if (!R.drag) return;
      R.drag = false;
      if (R.wasPlaying && R.on) setPlaying(true);
    };
    t.addEventListener("pointerup", endDrag);
    t.addEventListener("pointercancel", endDrag);
    t.addEventListener("keydown", (e) => {
      if (!R.frames.length) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setPlaying(false); showFrame(R.idx + 1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setPlaying(false); showFrame(R.idx - 1); }
      else if (e.key === "Home") { e.preventDefault(); setPlaying(false); showFrame(0); }
      else if (e.key === "End") { e.preventDefault(); setPlaying(false); showFrame(R.frames.length - 1); }
    });
  }

  function buildDock() {
    const stage = document.querySelector(".map-stage");
    if (!stage || document.getElementById("mxr-dock")) return;
    const d = document.createElement("div");
    d.className = "mxr-dock";
    d.id = "mxr-dock";
    d.hidden = true;
    d.setAttribute("dir", "ltr");
    d.innerHTML = `
      <button type="button" class="mxr-orb" id="mxr-orb" aria-label="${tx("playPause")}">▶</button>
      <div class="mxr-main" id="mxr-main">
        <span class="mxr-badge" id="mxr-badge" data-mode="live">
          <i class="mxr-dot-live" aria-hidden="true"></i><span class="mxr-dot-fcst" aria-hidden="true">🔮</span>
          <b class="mxr-time" id="mxr-time">--:--</b>
          <em class="mxr-kind" id="mxr-kind"></em>
        </span>
        <div class="mxr-track" id="mxr-track" role="slider" tabindex="0" aria-label="${tx("timeline")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <div class="mxr-rail"><i class="mxr-past"></i><i class="mxr-future"></i><i class="mxr-nowdot"></i></div>
          <i class="mxr-handle"></i>
        </div>
        <div class="mxr-key" aria-hidden="true">
          <i class="mxr-key-bar"></i>
          <span class="mxr-key-vals"><b>0.2</b><b>2</b><b>5</b><b>15+</b><small data-mxr="mmph">${tx("mmph")}</small></span>
        </div>
      </div>`;
    stage.appendChild(d);
    ui.dock = d;
    ui.orb = d.querySelector("#mxr-orb");
    ui.main = d.querySelector("#mxr-main");
    ui.badge = d.querySelector("#mxr-badge");
    ui.time = d.querySelector("#mxr-time");
    ui.kind = d.querySelector("#mxr-kind");
    ui.track = d.querySelector("#mxr-track");
    bindDock();
    /* تنظيم المساحة: عند فتح شريط توقعات الـ 10 أيام ينكمش شريط الرادار بسلاسة
       (انزلاق + تلاشٍ) ليترك المساحة كاملة بلا أي تداخل — ويعود فور إغلاقه —
       عبر مراقبة كلاس hidden على #mx-meteo فقط (بلا أي مساس بمنطق الشريط) */
    const meteo = document.getElementById("mx-meteo");
    if (meteo && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (!ui.dock) return;
        ui.dock.classList.toggle("mxr-hide", !meteo.classList.contains("hidden"));
      }).observe(meteo, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function applyLang() {
    document.querySelectorAll("[data-mxr]").forEach((el) => {
      const v = tx(el.dataset.mxr);
      if (v) el.textContent = v;
    });
    if (ui.orb) ui.orb.setAttribute("aria-label", tx("playPause"));
    if (ui.track) ui.track.setAttribute("aria-label", tx("timeline"));
    if (R.frames.length) showFrame(R.idx);
  }

  function bindLifecycle() {
    /* مغادرة صفحة الخريطة: إيقاف الحركة فورًا (صفر طلبات بلاطات في الخلفية)
       والعودة تستأنف إن كانت تعمل */
    const pg = document.getElementById("page-map");
    if (pg && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (!R.on) return;
        if (pg.hidden) { R.wasPlaying = R.playing; setPlaying(false); }
        else if (R.wasPlaying && !document.hidden) setPlaying(true);
      }).observe(pg, { attributes: true, attributeFilter: ["hidden"] });
    }
    document.addEventListener("visibilitychange", () => {
      if (!R.on) return;
      if (document.hidden) { R.wasPlaying = R.playing; setPlaying(false); }
      else if (R.wasPlaying && pageVisible()) setPlaying(true);
    });
    /* الوضع الاقتصادي يدمّر محرك الخريطة كليًا — تنظيف شريط الرادار معه */
    document.addEventListener("matar:eco", (e) => {
      if (e && e.detail && e.detail.eco && R.on) {
        R.token += 1;
        R.on = false;
        setPlaying(false);
        clearInterval(R.boltTimer); R.boltTimer = 0;
        clearTimeout(R.moveTimer); R.moveTimer = 0;
        R.layer = null; R.bolts = null; R.frames = [];
        if (ui.dock) ui.dock.hidden = true;
        syncButton();
      }
    });
    document.addEventListener("matar:language", applyLang);
  }

  /* v67: جسر عام — يتيح لسكربت v67 (تراكم الأمطار) إغلاق الرادار نظيفًا عند
     تفعيل طبقته (الحصرية الكاملة: طبقة طقس واحدة صافية في كل مرة) */
  window.MatarV66 = { off: deactivate };

  function init66() {
    ui.btn = document.getElementById("mxr-toggle");
    ui.hint = document.getElementById("mxr-hint");
    buildDock();
    ui.btn?.addEventListener("click", () => { if (R.on) deactivate(); else activate(); });
    bindLifecycle();
    applyLang();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init66, { once: true });
  else init66();
})();

/* ═══════════════════ 11) v67 — تراكم الأمطار + خيوط الرياح + ملء الشاشة ═══════════════════ */

"use strict";
(() => {
  /* ════════════════════════════════════════════════════════════════════
     مَطَر برو — إصدار 67 (المرحلة الثالثة): تراكم الأمطار + خيوط الرياح + البرق
     ------------------------------------------------------------
     ① طبقة «💧 تراكم الأمطار (حتى 10 أيام)» بنمط Windy: زر التفعيل بجانب زر
        الرادار في اللوحة الجانبية يُغلق طبقة الرادار (v66) تلقائيًا (حصرية
        كاملة)، ويجلب أمطار Open-Meteo لعشرة أيام قادمة (forecast_days=10)
        على شبكة إقليمية 8×6 مموهة عبر L.imageOverlay في لوح z-index 440 —
        والشريط السفلي الزجاجي يعرض 5 أزرار لمدة التراكم (12 ساعة | 24 ساعة |
        3 أيام | 5 أيام | 10 أيام) + شريط تمرير زمني لعشرة أيام (خطوة 3 ساعات)
        + مفتاح ألوان واضح بالأرقام (0.5 | 3 | 10 | 25 | 100+ مم) — مع قاعدة
        الشفافية الصارمة: أي نقطة يقل مطرها عن 0.15 مم تُرسم شفافة تمامًا
        (alpha = 0) فلا لون أزرق وهمي فوق مصر والمناطق الجافة أبدًا،
     ② خيوط الرياح الانسيابية الدائمة (Persistent Wind Streamlines): خيوط
        بيضاء دقيقة متحركة عبر Canvas2D بسلاسة 60fps تعمل تلقائيًا فوق طبقة
        تراكم الأمطار وباقي الطبقات الجوية (كانفاس زجاجي 430) وتختفي تلقائيًا
        فقط عند تفعيل الرادار أو القمر الصناعي (حدثا matar:radar /
        matar:satellite) أو الوضع الاقتصادي — وتعود فور إغلاقه،
     ③ تعزيز طبقة الرعد والبرق الحية: أيقونات برق ⚡ متوهجة بنبضة إضاءة
        بيضاء/بنفسجية خفيفة تتكرر كل ثانيتين فوق الخلايا الرعدية النشطة
        (weather_code ≥ 95 أو CAPE > 400) في لوح z-index 470 — بلا أي تداخل
        مع برق الرادار (v66) لأن الحصرية تضمن طبقة واحدة في كل مرة،
     ④ لا مساس إطلاقًا بشريط توقعات الـ 10 أيام ولا خريطة «طقس الطرق والسفر».
     ════════════════════════════════════════════════════════════════════ */

  /* ── قاموس مصغّر مستقل باللغات السبع (نفس نمط v66) ── */
  const T = {
    accumBtn: { ar: "💧 تراكم الأمطار", en: "💧 Rain Accumulation", fr: "💧 Accumulation de pluie", de: "💧 Regenansammlung", es: "💧 Acumulación de lluvia", pt: "💧 Acúmulo de chuva", it: "💧 Accumulo di pioggia" },
    accumTitle: { ar: "تراكم الأمطار (حتى 10 أيام)", en: "Rain Accumulation (up to 10 days)", fr: "Accumulation de pluie (jusqu'à 10 jours)", de: "Regenansammlung (bis zu 10 Tagen)", es: "Acumulación de lluvia (hasta 10 días)", pt: "Acúmulo de chuva (até 10 dias)", it: "Accumulo di pioggia (fino a 10 giorni)" },
    dur12: { ar: "12 ساعة", en: "12 h", fr: "12 h", de: "12 Std.", es: "12 h", pt: "12 h", it: "12 h" },
    dur24: { ar: "24 ساعة", en: "24 h", fr: "24 h", de: "24 Std.", es: "24 h", pt: "24 h", it: "24 h" },
    dur3d: { ar: "3 أيام", en: "3 days", fr: "3 jours", de: "3 Tage", es: "3 días", pt: "3 dias", it: "3 giorni" },
    dur5d: { ar: "5 أيام", en: "5 days", fr: "5 jours", de: "5 Tage", es: "5 días", pt: "5 dias", it: "5 giorni" },
    dur10d: { ar: "10 أيام", en: "10 days", fr: "10 jours", de: "10 Tage", es: "10 días", pt: "10 dias", it: "10 giorni" },
    mm: { ar: "مم", en: "mm", fr: "mm", de: "mm", es: "mm", pt: "mm", it: "mm" },
    from: { ar: "من", en: "from", fr: "du", de: "von", es: "desde", pt: "de", it: "da" },
    to: { ar: "إلى", en: "to", fr: "au", de: "bis", es: "hasta", pt: "até", it: "a" },
    dursGroup: { ar: "مدة التراكم", en: "Accumulation duration", fr: "Durée d'accumulation", de: "Ansammlungsdauer", es: "Duración de acumulación", pt: "Duração do acúmulo", it: "Durata dell'accumulo" },
    timeline10: { ar: "الخط الزمني لتراكم الأمطار (10 أيام)", en: "Rain accumulation timeline (10 days)", fr: "Chronologie de l'accumulation (10 jours)", de: "Zeitleiste der Ansammlung (10 Tage)", es: "Cronología de acumulación (10 días)", pt: "Linha do tempo do acúmulo (10 dias)", it: "Cronologia dell'accumulo (10 giorni)" },
    accumErr: { ar: "تعذّر جلب بيانات تراكم الأمطار الآن — حاول مرة أخرى", en: "Rain accumulation data unavailable right now — try again", fr: "Données d'accumulation indisponibles — réessayez", de: "Ansammlungsdaten derzeit nicht verfügbar — erneut versuchen", es: "Datos de acumulación no disponibles ahora — reintenta", pt: "Dados de acúmulo indisponíveis agora — tenta de novo", it: "Dati di accumulo non disponibili ora — riprova" },
    ticks: {
      ar: ["الآن", "+2ي", "+4ي", "+6ي", "+8ي", "+10ي"],
      en: ["Now", "+2d", "+4d", "+6d", "+8d", "+10d"],
      fr: ["Maint.", "+2j", "+4j", "+6j", "+8j", "+10j"],
      de: ["Jetzt", "+2T", "+4T", "+6T", "+8T", "+10T"],
      es: ["Ahora", "+2d", "+4d", "+6d", "+8d", "+10d"],
      pt: ["Agora", "+2d", "+4d", "+6d", "+8d", "+10d"],
      it: ["Ora", "+2g", "+4g", "+6g", "+8g", "+10g"],
    },
  };
  const l2 = () => (document.documentElement.lang || "ar").slice(0, 2).toLowerCase();
  const tx = (k) => { const row = T[k]; return (row && (row[l2()] || row.en || row.ar)) || ""; };
  const tickLabels = () => { const r = T.ticks[l2()] || T.ticks.en; return r.slice(0); };

  /* ── ثوابت هندسية ولونية ── */
  const NX = 8, NY = 6;                 /* شبكة إقليمية 8×6 (48 نقطة) */
  const DUR = [12, 24, 72, 120, 240];   /* مدد التراكم الخمس بالساعات */
  const DUR_KEYS = ["dur12", "dur24", "dur3d", "dur5d", "dur10d"];
  const PANE_A = "mxa-accum", PANE_B = "mxa-bolts";
  const WIND_KMH = [5, 14, 24, 35, 48, 63, 80, 100];
  const LITE_DEVICE = (() => {
    try {
      const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
      const cores = navigator.hardwareConcurrency || 4;
      return mobile || cores <= 4;
    } catch (e) { return false; }
  })();
  const REDUCED = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  /* مدرج تراكم 10 أيام بنمط Windy: فيروزي ← أزرق ← أخضر ← أصفر ناعم ← برتقالي ←
     أحمر ← بنفسجي فوق 100 مم — وقاعدة الشفافية الصارمة: تحت 0.15 مم alpha = 0 */
  const ACCUM10 = [
    [0.15, 128, 205, 242, 0.30],
    [0.5, 56, 189, 248, 0.42],
    [1.5, 34, 211, 238, 0.50],
    [3, 74, 222, 128, 0.58],
    [6, 163, 230, 53, 0.64],
    [10, 250, 204, 21, 0.70],
    [25, 249, 115, 22, 0.78],
    [50, 239, 68, 68, 0.85],
    [100, 190, 24, 93, 0.92],
    [220, 147, 51, 234, 0.95],
  ];
  function ramp10(v, out) {
    if (v !== v || v == null) { out[3] = 0; return; }
    let i = 0;
    while (i < ACCUM10.length - 2 && v > ACCUM10[i + 1][0]) i += 1;
    const a = ACCUM10[i], b = ACCUM10[Math.min(i + 1, ACCUM10.length - 1)];
    const t = b[0] === a[0] ? 0 : Math.min(Math.max((v - a[0]) / (b[0] - a[0]), 0), 1);
    out[0] = a[1] + (b[1] - a[1]) * t;
    out[1] = a[2] + (b[2] - a[2]) * t;
    out[2] = a[3] + (b[3] - a[3]) * t;
    out[3] = a[4] + (b[4] - a[4]) * t;
  }

  /* ── الحالة العامة ── */
  const RADAR = { on: false };  /* مزامنة حالة رادار v66 عبر حدث matar:radar */
  const SAT = { on: false };    /* مستقبلي: طبقة القمر الصناعي عبر matar:satellite */
  const G = { grid: null, accum: null, accumAt: 0, wind: null, windAt: 0, wtoken: 0 };
  const A = { on: false, durIdx: 1, startH: 0, token: 0, overlay: null, oc: null, octx: null, img: null, col: [0, 0, 0, 0], bolts: null, moveTimer: 0, hintTimer: 0, lastRange: null };
  const W = { cv: null, ctx: null, raf: 0, parts: [], last: 0, throttle: 1, sam: null, offX: 0, offY: 0, anchorLL: null, anchorPx: null, map: null, size: { x: 0, y: 0 } };
  const BOUND67 = new WeakSet();
  const ui = {};

  const bigMap = () => { try { return (window.MX && typeof window.MX.getMap === "function" && window.MX.getMap()) || null; } catch (e) { return null; } };
  const pageVisible = () => { const p = document.getElementById("page-map"); return !!(p && !p.hidden); };
  const ecoOn = () => { try { return document.documentElement.classList.contains("eco") || localStorage.getItem("matar:eco") === "1"; } catch (e) { return false; } };

  let FMT = null, FMT_LANG = "";
  function fmtDT(ms) {
    const lg = document.documentElement.lang || "ar";
    if (!FMT || FMT_LANG !== lg) {
      try { FMT = new Intl.DateTimeFormat(lg, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
      catch (e) { FMT = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
      FMT_LANG = lg;
    }
    try { return FMT.format(new Date(ms)); } catch (e) { return "—"; }
  }

  /* ── الشبكة الإقليمية 8×6 فوق المنطقة المعروضة (بهامش 25٪) ──
     ترتيب النقاط: p = صف × NX + عمود (الصف 0 جنوبًا والعمود 0 غربًا) — نفس
     ترتيب latitude/longitude في طلبات Open-Meteo متعددة المواقع */
  function gridFromView(map) {
    const b = map.getBounds().pad(0.25);
    let s = Math.max(-85, b.getSouth()), n = Math.min(85, b.getNorth());
    let w = b.getWest(), e = b.getEast();
    if (!(e - w > 0)) { w = -179.9; e = 179.9; }
    if (e - w > 359.5) { w = Math.max(-179.9, w); e = Math.min(179.9, e); }
    const rowLats = [], colLons = [], pts = [];
    for (let r = 0; r < NY; r += 1) rowLats.push(s + ((n - s) * r) / (NY - 1));
    for (let c = 0; c < NX; c += 1) colLons.push(w + ((e - w) * c) / (NX - 1));
    for (let r = 0; r < NY; r += 1) for (let c = 0; c < NX; c += 1) pts.push([+rowLats[r].toFixed(3), +colLons[c].toFixed(3)]);
    return { south: s, north: n, west: w, east: e, rowLats, colLons, lats: pts.map((p) => p[0]), lons: pts.map((p) => p[1]), nP: NX * NY };
  }
  function gridCovers(g, map) {
    if (!g) return false;
    try {
      const b = map.getBounds();
      return b.getSouth() >= g.south && b.getNorth() <= g.north && b.getWest() >= g.west && b.getEast() <= g.east;
    } catch (e) { return false; }
  }
  /* استيفاء ثنائي خط لأي مصفوفة قيم على الشبكة الإقليمية */
  function gSample(g, arr, lat, lon) {
    const x = ((lon - g.west) / (g.east - g.west)) * (NX - 1);
    const y = ((lat - g.south) / (g.north - g.south)) * (NY - 1);
    if (!(x >= 0 && y >= 0 && x <= NX - 1 && y <= NY - 1)) return NaN;
    const c0 = Math.min(Math.floor(x), NX - 2), r0 = Math.min(Math.floor(y), NY - 2);
    const tx = x - c0, ty = y - r0;
    const i00 = r0 * NX + c0, i10 = i00 + 1, i01 = i00 + NX, i11 = i01 + 1;
    return (1 - ty) * ((1 - tx) * arr[i00] + tx * arr[i10]) + ty * ((1 - tx) * arr[i01] + tx * arr[i11]);
  }

  /* ── الجلب: أمطار 10 أيام (ساعية) + رياح/برق الآن — من Open-Meteo حصرًا ── */
  async function fetchAccum(g) {
    const u = new URL("https://api.open-meteo.com/v1/forecast");
    u.search = new URLSearchParams({
      latitude: g.lats.join(","), longitude: g.lons.join(","),
      hourly: "precipitation", forecast_days: "10",
      timezone: "UTC", timeformat: "unixtime", precipitation_unit: "mm",
    });
    const res = await fetch(u, { credentials: "omit" });
    if (!res.ok) throw new Error("http");
    const j = await res.json();
    const arr = Array.isArray(j) ? j : [j];
    if (!arr.length || arr.length !== g.nP || !arr[0] || !arr[0].hourly || !arr[0].hourly.time || !arr[0].hourly.time.length) throw new Error("bad");
    const times = arr[0].hourly.time.map(Number);
    const nT = times.length, nP = arr.length;
    const pr = new Float32Array(nT * nP);
    arr.forEach((e, i) => {
      const h = (e && e.hourly && e.hourly.precipitation) || [];
      for (let t = 0; t < nT; t += 1) pr[t * nP + i] = Number(h[t] ?? 0) || 0;
    });
    const t0 = times[0] > 1e12 ? times[0] : times[0] * 1000;
    const t1 = times.length > 1 ? (times[1] > 1e12 ? times[1] : times[1] * 1000) : t0 + 3600e3;
    return { t0, stepMs: Math.max(t1 - t0, 900e3), nT, nP, pr };
  }

  async function fetchWind(g) {
    const u = new URL("https://api.open-meteo.com/v1/forecast");
    u.search = new URLSearchParams({
      latitude: g.lats.join(","), longitude: g.lons.join(","),
      hourly: "wind_speed_10m,wind_direction_10m,weather_code,cape",
      forecast_days: "1", timezone: "UTC", timeformat: "unixtime",
      wind_speed_unit: "kmh",
    });
    const res = await fetch(u, { credentials: "omit" });
    if (!res.ok) throw new Error("http");
    const j = await res.json();
    const arr = Array.isArray(j) ? j : [j];
    if (!arr.length || arr.length !== g.nP || !arr[0] || !arr[0].hourly || !arr[0].hourly.time || !arr[0].hourly.time.length) throw new Error("bad");
    const times = arr[0].hourly.time.map(Number);
    const nowMs = Date.now();
    let k = 0;
    for (let i = 0; i < times.length; i += 1) {
      const ms = times[i] > 1e12 ? times[i] : times[i] * 1000;
      if (ms <= nowMs) k = i;
    }
    const nP = arr.length;
    const mk = () => new Float32Array(nP);
    const uu = mk(), vv = mk(), wc = mk(), cape = mk();
    arr.forEach((e, i) => {
      const h = (e && e.hourly) || {};
      const spd = Number((h.wind_speed_10m || [])[k] ?? 0) || 0;
      const dir = (Number((h.wind_direction_10m || [])[k] ?? 0) || 0) * Math.PI / 180;
      /* اتجاه أرصادي (الريح منه): مكوّنا الشرقي والشمالي الحقيقيان */
      uu[i] = -spd * Math.sin(dir);
      vv[i] = -spd * Math.cos(dir);
      wc[i] = Number((h.weather_code || [])[k] ?? 0) || 0;
      cape[i] = Number((h.cape || [])[k] ?? 0) || 0;
    });
    return { u: uu, v: vv, wc, cape, at: Date.now() };
  }

  function ensurePanes67(map) {
    try {
      if (!map.getPane(PANE_A)) {
        const p = map.createPane(PANE_A);
        p.style.zIndex = "440";
        p.style.pointerEvents = "none";
        /* تمويه ناعم بملمس Windy على حقل التراكم كاملًا فلا خطوط فواصل بين
           خلايا الشبكة — حواف المطر انسيابية كخرائط التراكم الاحترافية */
        p.style.filter = "blur(4px) saturate(1.08)";
      }
      if (!map.getPane(PANE_B)) {
        const p = map.createPane(PANE_B);
        p.style.zIndex = "470";
        p.style.pointerEvents = "none";
      }
    } catch (e) { /* خريطة غير مهيأة */ }
  }

  /* ══ ① طبقة تراكم الأمطار: الرسم بحصرية شفافية 0.15 مم ══ */
  function renderAccum() {
    const map = bigMap();
    const ds = G.accum, g = G.grid;
    if (!A.on || !ds || !g || !map || !window.L) return;
    const durMs = DUR[A.durIdx] * 3600e3;
    let iNow = 0;
    for (let i = 0; i < ds.nT; i += 1) if (ds.t0 + i * ds.stepMs <= Date.now()) iNow = i;
    const i0 = Math.min(Math.max(iNow + Math.round((A.startH * 3600e3) / ds.stepMs), 0), ds.nT - 2);
    const i1 = Math.min(i0 + Math.max(1, Math.round(durMs / ds.stepMs)), ds.nT - 1);
    A.lastRange = { i0, i1 };
    const cols = NX, rows = NY;
    if (!A.oc) {
      A.oc = document.createElement("canvas");
      A.oc.width = cols; A.oc.height = rows;
      A.octx = A.oc.getContext("2d");
      A.img = A.octx.createImageData(cols, rows);
    }
    const d = A.img.data, o = A.col;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const p = r * cols + c;
        let sum = 0;
        for (let t = i0; t < i1; t += 1) sum += ds.pr[t * ds.nP + p];
        /* الصف 0 في الشبكة جنوبًا والصورة صفها 0 شمالًا — قلب الترتيب رأسيًا */
        const j = ((rows - 1 - r) * cols + c) * 4;
        /* قاعدة الشفافية الصارمة: أقل من 0.15 مم = شفاف تمامًا (alpha = 0) */
        if (!(sum >= 0.15)) { d[j + 3] = 0; continue; }
        ramp10(sum, o);
        d[j] = o[0]; d[j + 1] = o[1]; d[j + 2] = o[2]; d[j + 3] = Math.round(o[3] * 255);
      }
    }
    A.octx.putImageData(A.img, 0, 0);
    const url = A.oc.toDataURL("image/png");
    const bounds = [[g.south, g.west], [g.north, g.east]];
    try {
      if (A.overlay) { A.overlay.setBounds(bounds); A.overlay.setUrl(url); }
      else {
        ensurePanes67(map);
        A.overlay = L.imageOverlay(url, bounds, { pane: PANE_A, interactive: false, className: "mxa-img" }).addTo(map);
      }
    } catch (e) { /* الطبقة زينة بصرية — فشل الرسم لا يكسر التطبيق */ }
    updateBadge();
  }

  function updateBadge() {
    if (!ui.badge || !A.lastRange || !G.accum) return;
    const ds = G.accum;
    const t0 = ds.t0 + A.lastRange.i0 * ds.stepMs;
    const t1 = ds.t0 + (A.lastRange.i1 - 1) * ds.stepMs;
    ui.badge.textContent = tx("from") + " " + fmtDT(t0) + " ← " + tx("to") + " " + fmtDT(t1) + " · " + tx(DUR_KEYS[A.durIdx]);
  }

  /* ══ ③ البرق الحي: نبضة بيضاء/بنفسجية كل ثانيتين فوق الخلايا الرعدية ══ */
  function removeBolts() {
    if (A.bolts) { try { A.bolts.remove(); } catch (e) {} A.bolts = null; }
  }
  function updateBolts() {
    const map = bigMap();
    if (!map || !window.L || !G.wind || !G.grid) { removeBolts(); return; }
    if (RADAR.on || SAT.on || ecoOn() || !pageVisible() || document.hidden) { removeBolts(); return; }
    const g = G.grid, w = G.wind;
    const grp = L.layerGroup();
    for (let p = 0; p < w.wc.length; p += 1) {
      /* خلية رعدية نشطة: كود عاصفة رعدية (≥ 95) أو CAPE > 400 */
      if (w.wc[p] >= 95 || w.cape[p] >= 400) {
        const r = Math.floor(p / NX), c = p % NX;
        grp.addLayer(L.marker([g.rowLats[r], g.colLons[c]], {
          pane: PANE_B, interactive: false, keyboard: false,
          icon: L.divIcon({
            className: "mxa-bolt-wrap", iconSize: [30, 30], iconAnchor: [15, 15],
            html: '<span class="mxa-bolt" style="animation-delay:' + (((p * 431) % 2000) / 1000).toFixed(2) + 's">⚡</span>',
          }),
        }));
      }
    }
    removeBolts();
    A.bolts = grp;
    grp.addTo(map);
  }

  /* ══ ② خيوط الرياح البيضاء الدائمة (Canvas2D · 60fps) ══
     تعمل تلقائيًا فوق طبقة تراكم الأمطار وباقي الطبقات الجوية وتختفي فقط عند
     تفعيل الرادار أو القمر الصناعي أو الوضع الاقتصادي — وتعود فور إغلاقه */
  /* windWanted: كل شروط الرغبة في الخيوط (بلا اشتراط البيانات) — تدخل بها دورة
     الجلب؛ أما windShouldRun (بعد توافر البيانات) فتقود حلقة الرسم نفسها */
  const windWanted = () => pageVisible() && !document.hidden && !ecoOn() && !RADAR.on && !SAT.on && !!bigMap();
  const windShouldRun = () => windWanted() && !!G.wind;

  function teardownWindCanvas() {
    if (W.cv) { try { W.cv.remove(); } catch (e) {} }
    W.cv = null; W.ctx = null; W.map = null; W.sam = null; W.parts = [];
  }
  function ensureWindCanvas(map) {
    if (W.cv && W.map === map) return;
    teardownWindCanvas();
    const cv = document.createElement("canvas");
    cv.className = "mx-canvas mxa-wind";
    cv.style.zIndex = "430";
    map.getContainer().appendChild(cv);
    W.cv = cv;
    W.ctx = cv.getContext("2d", { alpha: true, desynchronized: true });
    W.map = map;
    W.parts = [];
    resizeWindCanvas();
  }
  function resizeWindCanvas() {
    const map = W.map;
    if (!map || !W.cv || !W.ctx) return;
    try {
      const size = map.getSize();
      if (!size.x) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(size.x * dpr), h = Math.round(size.y * dpr);
      if (W.cv.width !== w || W.cv.height !== h) {
        W.cv.width = w; W.cv.height = h;
        W.cv.style.width = size.x + "px";
        W.cv.style.height = size.y + "px";
      }
      W.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W.size = { x: size.x, y: size.y };
    } catch (e) { /* خريطة غير مهيأة */ }
  }

  /* عينة شاشية خشنة (خلية 26px) من حقل الرياح الإقليمي — استيفاء ثنائي خط
     واعٍ بالقيم المفقودة (NaN خارج الشبكة) — يُبنى عند استقرار العرض */
  function buildWindSampler() {
    const map = W.map;
    if (!map || !G.wind || !G.grid || !W.size.x) { W.sam = null; return; }
    const cell = 26;
    const cols = Math.ceil(W.size.x / cell) + 1, rows = Math.ceil(W.size.y / cell) + 1, N = cols * rows;
    const su = new Float32Array(N), sv = new Float32Array(N);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const k = r * cols + c;
        try {
          const ll = map.containerPointToLatLng([c * cell, r * cell]);
          su[k] = gSample(G.grid, G.wind.u, ll.lat, ll.lng);
          sv[k] = gSample(G.grid, G.wind.v, ll.lat, ll.lng);
        } catch (e) { su[k] = NaN; sv[k] = NaN; }
      }
    }
    W.sam = { cols, rows, cell, su, sv };
    W.offX = 0; W.offY = 0;
    const g = G.grid;
    W.anchorLL = [(g.south + g.north) / 2, (g.west + g.east) / 2];
    try { W.anchorPx = map.latLngToContainerPoint(W.anchorLL); } catch (e) { W.anchorPx = null; }
  }
  function windAt(x, y) {
    const s = W.sam;
    if (!s) return null;
    const gx = (x - W.offX) / s.cell - 0.5;
    const gy = (y - W.offY) / s.cell - 0.5;
    if (gx < -1 || gy < -1 || gx > s.cols || gy > s.rows) return null;
    const c0 = Math.min(Math.max(Math.floor(gx), 0), s.cols - 1);
    const r0 = Math.min(Math.max(Math.floor(gy), 0), s.rows - 1);
    const c1 = Math.min(c0 + 1, s.cols - 1), r1 = Math.min(r0 + 1, s.rows - 1);
    const tx = Math.min(Math.max(gx - c0, 0), 1), ty = Math.min(Math.max(gy - r0, 0), 1);
    const i00 = r0 * s.cols + c0, i10 = r0 * s.cols + c1, i01 = r1 * s.cols + c0, i11 = r1 * s.cols + c1;
    let u = 0, v = 0, wsum = 0;
    const acc = (i, w) => { const a = s.su[i], b = s.sv[i]; if (a === a && b === b) { u += a * w; v += b * w; wsum += w; } };
    acc(i00, (1 - tx) * (1 - ty)); acc(i10, tx * (1 - ty));
    acc(i01, (1 - tx) * ty); acc(i11, tx * ty);
    if (!wsum) return null;
    return [u / wsum, v / wsum];
  }

  /* مقاييس تكيفية بعيدة/قريبة — نفس فيزياء الجزيئات المعتادة مع سقف صارم
     للأجهزة الخفيفة (340 جزيء أبيض دقيق) */
  function wpParams() {
    const near = !!(W.map && W.map.getZoom() >= 10);
    const base = Math.min(760, Math.max(220, Math.floor((W.size.x * W.size.y) / 3200)));
    const cap = LITE_DEVICE ? 340 : Infinity;
    if (near) return { count: Math.min(1600, Math.round(base * 2.2), cap), thick: 1.9, fade: 0.13, kf: 1.3, maxAge: [55, 105] };
    return { count: Math.min(base, cap), thick: 1.35, fade: 0.06, kf: 1, maxAge: [120, 230] };
  }
  function spawnWind(scatter) {
    const P = wpParams();
    return {
      x: Math.random() * W.size.x,
      y: Math.random() * W.size.y,
      age: scatter ? Math.random() * P.maxAge[1] * 0.5 : 0,
      max: P.maxAge[0] + Math.random() * (P.maxAge[1] - P.maxAge[0]),
    };
  }
  function resetWindParts() {
    const P = wpParams();
    W.parts = Array.from({ length: P.count }, () => spawnWind(true));
  }
  function clearWind() { if (W.ctx && W.size.x) W.ctx.clearRect(0, 0, W.size.x, W.size.y); }
  function startWind() {
    if (W.raf || !windShouldRun()) return;
    if (REDUCED && REDUCED.matches) return; /* تفضيل تقليل الحركة: بلا خيوط متحركة */
    if (!W.parts.length) resetWindParts();
    W.last = 0;
    W.raf = requestAnimationFrame(windFrame);
  }
  function suspendWind() {
    if (W.raf) cancelAnimationFrame(W.raf);
    W.raf = 0;
    W.last = 0;
    clearWind();
  }

  function windFrame(ts) {
    W.raf = requestAnimationFrame(windFrame);
    if (!windShouldRun()) { suspendWind(); return; }
    if (W.size.x < 10) { resizeWindCanvas(); return; }
    if (!W.sam) { buildWindSampler(); if (!W.sam) return; }
    const c = W.ctx;
    if (!c || !W.parts.length) return;
    const P = wpParams();
    if (W.parts.length !== P.count) resetWindParts();
    /* تلاشي الإطار السابق — ذيول بيضاء ناعمة متلاشية (destination-in) */
    c.globalCompositeOperation = "destination-in";
    c.fillStyle = "rgba(255,255,255," + (1 - P.fade).toFixed(3) + ")";
    c.fillRect(0, 0, W.size.x, W.size.y);
    c.globalCompositeOperation = "source-over";
    const dt = W.last ? Math.min(Math.max((ts - W.last) / 1000, 0.001), 0.05) : 0.016;
    W.last = ts;
    const zoom = W.map ? W.map.getZoom() : 5;
    const zf = Math.min(Math.max(Math.pow(2, zoom - 5), 0.75), 3.4);
    const K = 1.75 * zf * P.kf;
    const skipOdd = W.throttle < 1; /* خنق الكثافة 50٪ أثناء السحب/التكبير */
    const buckets = [[], [], [], [], [], [], [], []];
    for (let pi = 0; pi < W.parts.length; pi += 1) {
      if (skipOdd && (pi & 1)) continue;
      const p = W.parts[pi];
      const w = windAt(p.x, p.y);
      if (!w) { Object.assign(p, spawnWind(false)); continue; }
      const nx = p.x + w[0] * K * dt;
      const ny = p.y - w[1] * K * dt;
      const spd = Math.hypot(w[0], w[1]);
      let bi = 0;
      for (let i = 0; i < WIND_KMH.length; i += 1) if (spd >= WIND_KMH[i]) bi = i;
      buckets[bi].push(p.x, p.y, nx, ny);
      p.x = nx; p.y = ny; p.age += 1;
      if (p.age > p.max || nx < -12 || ny < -12 || nx > W.size.x + 12 || ny > W.size.y + 12) Object.assign(p, spawnWind(false));
    }
    /* رسم أبيض ناعم: مروران لكل مجموعة سرعة — هالة عريضة شفافة ثم قلب رفيع
       لامع بسطوع يتدرج مع سرعة الرياح (نسيم هادئ ← رياح عاتية) */
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let bi = 0; bi < buckets.length; bi += 1) {
      const arr = buckets[bi];
      if (!arr.length) continue;
      const a = 0.42 + 0.42 * (bi / (buckets.length - 1));
      c.strokeStyle = "rgba(255,255,255," + (a * 0.16).toFixed(3) + ")";
      c.lineWidth = P.thick * 3.1;
      c.beginPath();
      for (let k = 0; k < arr.length; k += 4) { c.moveTo(arr[k], arr[k + 1]); c.lineTo(arr[k + 2], arr[k + 3]); }
      c.stroke();
      c.strokeStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
      c.lineWidth = P.thick;
      c.beginPath();
      for (let k = 0; k < arr.length; k += 4) { c.moveTo(arr[k], arr[k + 1]); c.lineTo(arr[k + 2], arr[k + 3]); }
      c.stroke();
    }
  }

  /* ── التنسيق العام: جلب الرياح + بناء العينة + تشغيل الخيوط + البرق ── */
  async function refetchAccumSilent() {
    const map = bigMap();
    if (!A.on || !map) return;
    const grid = G.grid;
    if (!grid) return;
    try {
      const ds = await fetchAccum(grid);
      if (A.on && G.grid === grid) { G.accum = ds; G.accumAt = Date.now(); renderAccum(); }
    } catch (e) { /* الاحتفاظ بالصورة القديمة — بلا انهيار */ }
  }

  async function ensureWind() {
    /* بوابة الدخول تتحقق من الرغبة (windWanted) لا من توافر البيانات — وإلا
       لدارت الحلقة على بيانات لم تُجلب أبدًا (قفل دائري) */
    if (!windWanted()) { suspendWind(); updateBolts(); return; }
    const map = bigMap();
    if (!map || !window.L) return;
    ensureWindCanvas(map);
    bindMap67(map);
    resizeWindCanvas();
    if (!G.grid || !gridCovers(G.grid, map)) {
      G.grid = gridFromView(map);
      G.accum = null; G.wind = null;
      if (A.on) refetchAccumSilent();
    }
    if (!G.wind || Date.now() - G.windAt > 20 * 60e3) {
      const tok = ++G.wtoken;
      const grid = G.grid;
      try {
        const w = await fetchWind(grid);
        if (tok !== G.wtoken || G.grid !== grid) return;
        G.wind = w; G.windAt = Date.now();
      } catch (e) { if (!G.wind) return; }
    }
    buildWindSampler();
    if (!W.parts.length) resetWindParts();
    startWind();
    updateBolts();
  }

  /* ربط أحداث الخريطة (مرة واحدة لكل نسخة خريطة — دورات الوضع الاقتصادي) */
  function bindMap67(map) {
    if (BOUND67.has(map)) return;
    BOUND67.add(map);
    /* أثناء السحب: تحديث انزياح حقل الرياح من نقطة الإرساء (O(1) لكل إطار)
       كي تظل الخيوط مثبتة جغرافيًا فوق البلاطات المتحركة */
    map.on("move", () => {
      if (!W.anchorLL || !W.anchorPx || W.map !== map) return;
      try {
        const p = map.latLngToContainerPoint(W.anchorLL);
        W.offX = p.x - W.anchorPx.x;
        W.offY = p.y - W.anchorPx.y;
      } catch (e) {}
    });
    /* بدء الحركة: تفريغ الذيول + خنق الكثافة 50٪ حفاظًا على 60fps */
    map.on("movestart zoomstart", () => { W.throttle = 0.5; clearWind(); });
    map.on("moveend zoomend resize", () => {
      W.throttle = 1;
      if (W.map === map) { resizeWindCanvas(); buildWindSampler(); clearWind(); }
      clearTimeout(A.moveTimer);
      A.moveTimer = setTimeout(onSettled67, 900);
    });
  }

  /* بعد استقرار العرض: تجديد الشبكة والبيانات إن تحرك المستخدم خارج تغطيتها */
  async function onSettled67() {
    if (!pageVisible() || ecoOn()) return;
    const map = bigMap();
    if (!map) return;
    const escaped = !G.grid || !gridCovers(G.grid, map);
    if (escaped) {
      G.grid = gridFromView(map);
      G.accum = null; G.wind = null;
    }
    if (A.on) {
      if (!G.accum || Date.now() - G.accumAt > 30 * 60e3) await refetchAccumSilent();
      else renderAccum();
    }
    if (!G.wind || escaped || Date.now() - G.windAt > 20 * 60e3) await ensureWind();
    else updateBolts();
  }

  /* ══ تفعيل/إيقاف طبقة التراكم ══ */
  function syncAccumButton() {
    if (ui.btn) ui.btn.setAttribute("aria-pressed", String(A.on));
  }
  function flashAccumHint() {
    if (!ui.hint) return;
    ui.hint.textContent = tx("accumErr");
    clearTimeout(A.hintTimer);
    A.hintTimer = setTimeout(() => { if (ui.hint) ui.hint.textContent = ""; }, 6000);
  }

  async function activateAccum() {
    const tok = ++A.token;
    /* انتظار جهوزية الخريطة الكبرى (تحميل كسول لـ Leaflet أو إعادة بناء) */
    let map = bigMap();
    for (let tries = 0; !map && tries < 40; tries += 1) {
      await new Promise((r) => setTimeout(r, 250));
      if (A.token !== tok) return;
      map = bigMap();
    }
    if (!map || !window.L) { A.on = false; syncAccumButton(); flashAccumHint(); return; }
    /* الحصرية الكاملة: تفعيل التراكم يُغلق طبقة الرادار (v66) تلقائيًا */
    try { if (window.MatarV66 && typeof window.MatarV66.off === "function") window.MatarV66.off(); } catch (e) {}
    A.on = true;
    syncAccumButton();
    ensurePanes67(map);
    bindMap67(map);
    if (ui.dock) { ui.dock.hidden = false; ui.dock.classList.remove("mxa-hide"); }
    if (ui.range) ui.range.value = String(A.startH);
    if (!G.grid || !gridCovers(G.grid, map)) { G.grid = gridFromView(map); G.accum = null; G.wind = null; }
    const grid = G.grid;
    if (!G.accum || Date.now() - G.accumAt > 30 * 60e3) {
      let ds = null;
      try { ds = await fetchAccum(grid); }
      catch (e) {
        if (A.token !== tok) return;
        A.on = false; syncAccumButton();
        if (ui.dock) ui.dock.hidden = true;
        flashAccumHint();
        return;
      }
      if (A.token !== tok) return;
      if (G.grid !== grid) { renderAccum(); return; } /* الشبكة تحدّثت — الاستقرار سيتكفل */
      G.accum = ds; G.accumAt = Date.now();
    }
    renderAccum();
    /* خيوط الرياح الدائمة + البرق يعملان فوق الطبقة فورًا */
    ensureWind();
  }

  function deactivateAccum() {
    A.token += 1;
    A.on = false;
    syncAccumButton();
    clearTimeout(A.moveTimer); A.moveTimer = 0;
    if (A.overlay) { try { A.overlay.remove(); } catch (e) {} A.overlay = null; }
    if (ui.dock) ui.dock.hidden = true;
    /* البرق الحي طبقة قائمة بذاتها — يبقى إذا توافرت شروطه (خيوط/رصد حي) */
    updateBolts();
  }

  /* ═─ كبسولة التراكم الزجاجية (Accumulation Pill Dock) ══ */
  function syncDurButtons() {
    if (!ui.durs) return;
    ui.durs.querySelectorAll(".mxa-dur").forEach((el, i) => el.setAttribute("aria-pressed", String(i === A.durIdx)));
  }
  function renderDurButtons() {
    if (!ui.durs) return;
    ui.durs.replaceChildren();
    DUR_KEYS.forEach((key, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mxa-dur";
      b.dataset.dur = String(idx);
      b.textContent = tx(key);
      b.addEventListener("click", () => {
        if (A.durIdx === idx) return;
        A.durIdx = idx;
        syncDurButtons();
        renderAccum();
      });
      ui.durs.appendChild(b);
    });
    syncDurButtons();
  }
  function renderTicks() {
    if (!ui.ticks) return;
    ui.ticks.replaceChildren();
    tickLabels().forEach((t) => {
      const s = document.createElement("span");
      s.textContent = t;
      ui.ticks.appendChild(s);
    });
  }
  function buildDock() {
    const stage = document.querySelector(".map-stage");
    if (!stage || document.getElementById("mxa-dock")) return;
    const d = document.createElement("div");
    d.className = "mxa-dock";
    d.id = "mxa-dock";
    d.hidden = true;
    d.setAttribute("dir", "ltr");
    d.innerHTML = `
      <div class="mxa-badgerow">
        <span class="mxa-badge" id="mxa-badge">—</span>
      </div>
      <div class="mxa-durs" id="mxa-durs" role="group" aria-label="${tx("dursGroup")}"></div>
      <div class="mxa-slider">
        <input type="range" id="mxa-range" min="0" max="240" step="3" value="0" aria-label="${tx("timeline10")}" />
        <div class="mxa-ticks" id="mxa-ticks" aria-hidden="true"></div>
      </div>
      <div class="mxa-key" aria-hidden="true">
        <i class="mxa-key-bar"></i>
        <span class="mxa-key-vals">
          <b style="left:8%">0.5</b><b style="left:30%">3</b><b style="left:46%">10</b><b style="left:60%">25</b><b style="left:88%">100+</b><small data-mxa="mm">${tx("mm")}</small>
        </span>
      </div>`;
    stage.appendChild(d);
    ui.dock = d;
    ui.badge = d.querySelector("#mxa-badge");
    ui.durs = d.querySelector("#mxa-durs");
    ui.range = d.querySelector("#mxa-range");
    ui.ticks = d.querySelector("#mxa-ticks");
    renderDurButtons();
    renderTicks();
    ui.range?.addEventListener("input", () => {
      A.startH = Math.max(0, Math.min(240, Number(ui.range.value) || 0));
      renderAccum();
    });
    /* تنظيم المساحة: عند فتح شريط توقعات الـ 10 أيام ينكمش شريط التراكم
       بسلاسة ليترك المساحة كاملة — ويعود فور إغلاقه */
    const meteo = document.getElementById("mx-meteo");
    if (meteo && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (!ui.dock) return;
        ui.dock.classList.toggle("mxa-hide", !meteo.classList.contains("hidden"));
      }).observe(meteo, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function applyLang() {
    document.querySelectorAll("[data-mxa]").forEach((el) => {
      const v = tx(el.dataset.mxa);
      if (v) el.textContent = v;
    });
    if (ui.durs) { renderDurButtons(); ui.durs.setAttribute("aria-label", tx("dursGroup")); }
    if (ui.ticks) renderTicks();
    if (ui.range) ui.range.setAttribute("aria-label", tx("timeline10"));
    updateBadge();
  }

  /* ══ دورة الحياة: الصفحة/الرادار/القمر/الوضع الاقتصادي/اللغة ══ */
  let windKick = 0;
  function ensureWindRetry() {
    const kick = ++windKick;
    (async () => {
      for (let tries = 0; tries < 40; tries += 1) {
        if (kick !== windKick) return;
        if (!pageVisible() || ecoOn() || RADAR.on || SAT.on) return;
        const map = bigMap();
        if (map && window.L) { ensureWind(); return; }
        await new Promise((r) => setTimeout(r, 250));
      }
    })();
  }

  function bindLifecycle() {
    const pg = document.getElementById("page-map");
    if (pg && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (pg.hidden) { suspendWind(); updateBolts(); }
        else if (!ecoOn()) ensureWindRetry();
      }).observe(pg, { attributes: true, attributeFilter: ["hidden"] });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { suspendWind(); updateBolts(); }
      else if (pageVisible() && !ecoOn()) ensureWindRetry();
    });
    /* الرادار (v66) يخفي الخيوط والبرق العام — وإغلاقه يعيدهما فورًا */
    document.addEventListener("matar:radar", (e) => {
      RADAR.on = !!(e && e.detail && e.detail.on);
      if (RADAR.on) { suspendWind(); removeBolts(); }
      else if (pageVisible() && !ecoOn()) ensureWindRetry();
    });
    /* مستقبلي: طبقة القمر الصناعي تخفي الخيوط أيضًا عند عودتها لاحقًا */
    document.addEventListener("matar:satellite", (e) => {
      SAT.on = !!(e && e.detail && e.detail.on);
      if (SAT.on) { suspendWind(); removeBolts(); }
      else if (pageVisible() && !ecoOn()) ensureWindRetry();
    });
    /* الوضع الاقتصادي: تدمير كامل لكل عناصر v67 — وعودته تعيد الخيوط وحدها */
    document.addEventListener("matar:eco", (e) => {
      if (e && e.detail && e.detail.eco) {
        A.token += 1;
        A.on = false;
        syncAccumButton();
        if (A.overlay) { try { A.overlay.remove(); } catch (err) {} A.overlay = null; }
        removeBolts();
        suspendWind();
        teardownWindCanvas();
        G.grid = null; G.accum = null; G.wind = null; G.accumAt = 0; G.windAt = 0;
        if (ui.dock) ui.dock.hidden = true;
      } else if (pageVisible()) ensureWindRetry();
    });
    document.addEventListener("matar:language", applyLang);
    /* دورة تنشيط حية كل 10 دقائق: تجديد بيانات الرياح والبرق ما دامت الصفحة
       مفتوحة (الرادار المفعّل يجلب برقه بنفسه — فلا عمل هنا) */
    setInterval(() => {
      if (!pageVisible() || document.hidden || ecoOn() || RADAR.on || SAT.on) return;
      if (!G.wind || Date.now() - G.windAt > 20 * 60e3) ensureWind();
      else updateBolts();
    }, 10 * 60e3);
  }

  function init67() {
    ui.btn = document.getElementById("mxa-toggle");
    ui.hint = document.getElementById("mxa-hint");
    buildDock();
    ui.btn?.addEventListener("click", () => { if (A.on) deactivateAccum(); else activateAccum(); });
    bindLifecycle();
    applyLang();
    /* الخيوط الدائمة تبدأ فور فتح صفحة الخريطة — بلا أي زر */
    if (pageVisible() && !ecoOn()) ensureWindRetry();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init67, { once: true });
  else init67();

  /* جسر عام — يتيح لسكربت الرادار (v66) إغلاق طبقة التراكم نظيفًا (الحصرية) */
  window.MatarV67 = { off: deactivateAccum };
})();

/* ═══════════════════ 12) نقطة الإقلاع ═══════════════════
   آخر ما ينفذ في التطبيق — كانت آخر كتلة في السكربت الرئيسي الأحادي وتنفَّذ
   هنا بعد اكتمال تعريفات app.js وmap.js معًا (نفس الترتيب الأصلي تمامًا).
   ملاحظة: إنشاء window.__matarBridge (جسر القراءة لسكربتات v المرفقة)
   يُنفَّذ في نهاية app.js — قبل تقييم تلك السكربتات كما في الأصل. */

      (function boot() {
        setNavH();
        applyTheme(document.documentElement.dataset.theme || "light");
        applyUnitUI();
        applyLanguage(currentLanguage);
        const saved = loadSavedPlace();
        state.place = saved ?? {
          name: "القاهرة", admin1: "القاهرة", country: "مصر",
          latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo",
        };
        updateLocChips();
        const fromInput = $("#trip-from");
        if (fromInput) fromInput.value = state.place.name || "";
        /* إصدار 16: الوضع الاقتصادي — تفعيل التفضيل المحفوظ وتوصيل المفتاح فور الإقلاع */
        try { Eco.init(); } catch (e) { console.error("eco init", e); }
        loadMainData();

        // المرحلة 6: حزمة الاختبارات الذاتية — تعمل فقط عند ?selftest=1
        if (SELFTEST) { try { runSelfTestSuite(); } catch (e) { console.error("selftest", e); } }
        // دعم فتح صفحة محددة عبر الهاش: index.html#agri مثلاً (المرحلة 12: أضيفت monthly)
        const hashPage = location.hash.slice(1);
        if (PAGES.includes(hashPage)) showPage(hashPage);
        // تسجيل Service Worker: تخزين مؤقت + إشعارات + شرط أساسي لإمكانية التثبيت (يعمل فقط عبر http/https)
        // إصدار 20: نحدد النطاق صراحةً ليعمل التسجيل من أي مسار فرعي (مثل مواقع GitHub Pages)
        if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
          window.addEventListener("load", () => {
            navigator.serviceWorker.register("/Matar-pro-2/sw.js", { scope: "/Matar-pro-2/" }).catch(() => {});
          });
        }
      })();
