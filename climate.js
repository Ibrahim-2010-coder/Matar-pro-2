/* ═══════════════════════════════════════════════════════════════════════════
   مَطَر برو — climate.js · إصدار 73 (صفحة «التغير المناخي»)
   ─────────────────────────────────────────────────────────────────────────
   أربع ميزات تحليلية تُبنى تلقائيًا داخل أي عنصر يحمل السمة data-matar-climate
   (القيمة "all" لكل الميزات، أو قائمة مفاتيح مفصولة بفواصل:
    stripes,heat,gdd,frost — بترتيب العرض حسب المواصفة دائمًا):

     1) Warming Strips (شرائط الاحترار 1950–2024)
        جلب المتوسط اليومي temperature_2m_mean من أرشيف ERA5
        (archive-api.open-meteo.com) وتجميعه سنويًا داخل المتصفح، ثم رسم
        SVG يدوي (createElementNS) بلوحة Ed Hawkins القياسية (RdBu معكوسة)
        مقارنةً بمتوسط 1981–2010 المرجعي + محور سنوات كل 10 سنوات + جملة
        خلاصة: «2024 في هذا الموقع كان أدفأ/أبرد من متوسط 1981–2010 بـ X°م».
     2) Heatwave Context (سياق موجة الحر 2015–2024)
        جلب العظمى والصغرى اليومية (temperature_2m_max,temperature_2m_min)
        من 2015-01-01 إلى 2024-12-31 → حساب P95 وP50 للحرارة العظمى وتصنيف
        حرارة اليوم (متطرفة/أحمر · مرتفعة/برتقالي · اعتيادية/أخضر) مع
        3 بطاقات إحصائية صغيرة وشريط موضع اليوم على مقياس العقد.
     3) GDD Trend (وحدات النمو الزراعي 1980–2024)
        GDD = max(0, ((Tmax+Tmin)/2) − 10) لكل يوم من مارس إلى أكتوبر لكل
        سنة 1980–2024 → منحنى SVG أخضر مع مقارنة متوسط 1980–1989 بـ 2015–2024.
     4) Frost Trend (ليالي الصقيع 2015–2024)
        عدّ الليالي تحت 0°م لكل سنة 2015–2024 من بيانات الميزة الثانية
        نفسها → أعمدة SVG مع جملة مقارنة 2024 بمتوسط 2015–2023.

   الشروط التشغيلية المُنفَّذة حرفيًا:
     • IIFE نظيفة بلا أي مكتبات خارجية — كل الرسم بـ createElementNS.
     • كاش localStorage بادئته "matar:climate:v73:" وصلاحية 30 يومًا
       (تُخزَّن النواتج المحسوبة الصغيرة — لا حمولات الشبكة الخام).
     • الوضع الاقتصادي (matar:eco === "1" أو html.eco) يوقف كل الميزات
       عدا Heatwave Context.
     • التحديث التلقائي عند حدث "matar:data" (تغيّر الموقع أو البيانات)
       + مراقبة تبديل اللغة/الوضع الاقتصادي لإعادة البناء باللسان الجديد.
     • ربط النقر على #dl-climate: إظهار #page-climate وإخفاء باقي أقسام
       .view وتحديث aria-current="page" (مع إلغائها عن #dl-climate عند
       النقر على أي زر .drawer-link آخر) — عبر خاصية hidden نفسها التي
       يستخدمها التطبيق (القاعدة العامة [hidden] = display:none !important).
     • تصدير window.MatarClimate { version, render, refresh, clearCache }.
     • دعم RTL كامل: خصائص CSS منطقية، وقواميس سبع لغات تُقرأ من
       document.documentElement.lang، والمحاور الزمنية للرسوم LTR ثابتة.
     • textContent حصريًا مع كل بيانات الشبكة — بلا eval ولا new Function
       ولا innerHTML إطلاقًا (متوافق مع CSP الصارمة بلا unsafe-inline).
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {

  /* ══ 1) ثوابت عامة ══ */

  var SVG_NS = "http://www.w3.org/2000/svg";
  var CACHE_PREFIX = "matar:climate:v73:";
  var CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; /* 30 يومًا */
  var ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/archive";
  var FETCH_TIMEOUT_MS = 25000;

  var FEATURE_ORDER = ["stripes", "heat", "gdd", "frost"];
  var STRIPES_FIRST_YEAR = 1950, STRIPES_LAST_YEAR = 2024;
  var HEAT_FIRST_YEAR = 2015, HEAT_LAST_YEAR = 2024;
  var GDD_FIRST_YEAR = 1980, GDD_LAST_YEAR = 2024;
  var GDD_BASE_TEMP = 10; /* درجة الأساس لوحدات النمو */
  var BASELINE_FIRST = 1981, BASELINE_LAST = 2010; /* مرجع شرائط الاحترار */

  /* لوحة شرائط الاحترار — Ed Hawkins القياسية (ColorBrewer RdBu معكوسة):
     11 مرساة لونية من الأزرق البارد (يسار) إلى الأحمر الحار (يمين) */
  var STRIPE_STOPS = ["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"];

  /* ══ 2) قواميس الواجهة الداخلية (سبع لغات — العربية هي الافتراضية) ══
     تُقرأ لغة العرض من document.documentElement.lang الذي يحدّثه التطبيق
     عند تبديل اللغة، فتُعاد بناء الرسوم والجمل باللسان الجديد فورًا. */

  var L = {

    ar: {
      deg: "°م",
      place: "الموقع: {v}",
      no_place: "اختر موقعًا أولًا من البحث أو زر تحديد الموقع — سيظهر تحليل المناخ تلقائيًا فور توفر الموقع.",
      eco_note: "الوضع الاقتصادي مفعّل: شرائط الاحترار ووحدات النمو وليالي الصقيع متوقفة لتوفير البيانات — سياق موجة الحر يعمل كالمعتاد.",
      loading: "نجهّز تحليل المناخ لهذا الموقع…",
      error: "تعذّر جلب بيانات الأرشيف المناخي (ERA5) — تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.",
      retry: "إعادة المحاولة",
      src: "المصدر: أرشيف ERA5 عبر Open-Meteo — تُجمَّع القيم اليومية سنويًا داخل متصفحك، وتُخزَّن النتائج على جهازك 30 يومًا.",
      stripes_title: "شرائط الاحترار 1950–2024",
      stripes_sub: "كل شريطة عام واحد: متوسط الحرارة السنوي مقارنةً بمتوسط 1981–2010 المرجعي (لوحة Ed Hawkins — RdBu معكوسة)",
      stripes_aria: "رسم شرائط الاحترار: متوسط الحرارة السنوي من 1950 إلى 2024 مقارنةً بمتوسط 1981–2010",
      cap_warmer: "2024 في هذا الموقع كان أدفأ من متوسط 1981–2010 بـ {v}°م",
      cap_cooler: "2024 في هذا الموقع كان أبرد من متوسط 1981–2010 بـ {v}°م",
      cap_near: "2024 في هذا الموقع كان قريبًا من متوسط 1981–2010 (الفرق {v}°م فقط)",
      colder: "أبرد",
      warmer: "أدفأ",
      heat_title: "سياق موجة الحر 2015–2024",
      heat_sub: "أين تقف حرارة اليوم بين توزيع الحرارة القصوى لآخر عشر سنوات؟",
      p95_label: "العتبة الحادة (P95)",
      p95_note: "لا يتجاوزها سوى 5٪ من أيام 2015–2024",
      p50_label: "وسيط الحرارة القصوى (P50)",
      p50_note: "منتصف توزيع أيام العقد 2015–2024",
      today_label: "حرارة اليوم",
      lvl_extreme: "متطرفة",
      lvl_high: "مرتفعة",
      lvl_normal: "اعتيادية",
      note_extreme: "ضمن أعلى 5٪ من أيام العقد — خطر إجهاد حراري",
      note_high: "فوق وسيط العقد الأخير",
      note_normal: "دون وسيط العقد الأخير",
      note_wait: "توقعات اليوم لم تصل بعد — ستُحدَّث البطاقة تلقائيًا",
      track_aria: "موضع حرارة اليوم على مقياس توزيع الحرارة القصوى للعقد الأخير",
      gdd_title: "وحدات النمو الزراعي (GDD) 1980–2024",
      gdd_sub: "مجموع الفائض الحراري فوق 10°م خلال موسم النمو (مارس–أكتوبر) لكل سنة",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — يُجمع لكل يوم من مارس إلى أكتوبر",
      gdd_aria: "منحنى وحدات النمو الزراعي السنوي من 1980 إلى 2024 مع متوسطي 1980–1989 و2015–2024",
      ref_early: "متوسط 1980–1989",
      ref_recent: "متوسط 2015–2024",
      cap_gdd_up: "متوسط وحدات النمو 2015–2024 أعلى مما كان في 1980–1989 بـ {v} وحدة (+{p}٪)",
      cap_gdd_down: "متوسط وحدات النمو 2015–2024 أقل مما كان في 1980–1989 بـ {v} وحدة (−{p}٪)",
      frost_title: "ليالي الصقيع 2015–2024",
      frost_sub: "عدد الليالي التي هبطت فيها الحرارة الصغرى دون 0°م في كل سنة",
      frost_aria: "أعمدة ليالي الصقيع السنوية من 2015 إلى 2024",
      cap_frost_more: "عام 2024 سجّل {n} ليلة صقيع — أكثر بـ {v} ليلة من متوسط 2015–2023 ({m} ليلة)",
      cap_frost_less: "عام 2024 سجّل {n} ليلة صقيع — أقل بـ {v} ليلة من متوسط 2015–2023 ({m} ليلة)",
      cap_frost_equal: "عام 2024 سجّل {n} ليلة صقيع — مطابق لمتوسط 2015–2023 ({m} ليلة)",
      cap_frost_none: "لم تُسجَّل أي ليلة تحت 0°م في هذا الموقع بين 2015 و2024 — مناخ خالٍ من الصقيع"
    },

    en: {
      deg: "°C",
      place: "Location: {v}",
      no_place: "Pick a location first — the climate analysis appears automatically once a place is selected.",
      eco_note: "Economy mode is on: warming stripes, growing degree days and frost nights are paused to save data — the heatwave context keeps working.",
      loading: "Preparing the climate analysis for this location…",
      error: "Could not fetch the ERA5 climate archive — check your connection and try again.",
      retry: "Try again",
      src: "Source: ERA5 archive via Open-Meteo — daily values are aggregated yearly inside your browser, and results are stored on your device for 30 days.",
      stripes_title: "Warming Stripes 1950–2024",
      stripes_sub: "Each stripe is one year: annual mean temperature against the 1981–2010 reference average (Ed Hawkins palette — inverted RdBu)",
      stripes_aria: "Warming stripes: annual mean temperature 1950–2024 against the 1981–2010 average",
      cap_warmer: "2024 at this location was warmer than the 1981–2010 average by {v}°C",
      cap_cooler: "2024 at this location was cooler than the 1981–2010 average by {v}°C",
      cap_near: "2024 at this location was close to the 1981–2010 average (only {v}°C apart)",
      colder: "Cooler",
      warmer: "Warmer",
      heat_title: "Heatwave Context 2015–2024",
      heat_sub: "Where does today's high stand within the last decade's daily maxima?",
      p95_label: "Extreme threshold (P95)",
      p95_note: "Exceeded by only 5% of days in 2015–2024",
      p50_label: "Median daily high (P50)",
      p50_note: "Midpoint of the 2015–2024 maxima",
      today_label: "Today's high",
      lvl_extreme: "Extreme",
      lvl_high: "High",
      lvl_normal: "Normal",
      note_extreme: "Within the top 5% of the decade — heat-stress risk",
      note_high: "Above the decade's median",
      note_normal: "Below the decade's median",
      note_wait: "Today's forecast hasn't arrived yet — the card updates automatically",
      track_aria: "Today's high on the last decade's daily-max scale",
      gdd_title: "Growing Degree Days (GDD) 1980–2024",
      gdd_sub: "Yearly heat surplus above 10°C over the growing season (March–October)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — summed for every day from March to October",
      gdd_aria: "Yearly growing-degree-days curve 1980–2024 with the 1980–1989 and 2015–2024 averages",
      ref_early: "1980–1989 avg",
      ref_recent: "2015–2024 avg",
      cap_gdd_up: "The 2015–2024 GDD average is higher than 1980–1989 by {v} units (+{p}%)",
      cap_gdd_down: "The 2015–2024 GDD average is lower than 1980–1989 by {v} units (−{p}%)",
      frost_title: "Frost Nights 2015–2024",
      frost_sub: "Number of nights per year with a minimum below 0°C",
      frost_aria: "Yearly frost-night bars from 2015 to 2024",
      cap_frost_more: "2024 recorded {n} frost nights — {v} more than the 2015–2023 average ({m})",
      cap_frost_less: "2024 recorded {n} frost nights — {v} fewer than the 2015–2023 average ({m})",
      cap_frost_equal: "2024 recorded {n} frost nights — matching the 2015–2023 average ({m})",
      cap_frost_none: "No night fell below 0°C at this location between 2015 and 2024 — a frost-free climate"
    },

    fr: {
      deg: "°C",
      place: "Localisation : {v}",
      no_place: "Choisissez d'abord un lieu — l'analyse climatique apparaîtra automatiquement.",
      eco_note: "Mode économique activé : bandes de réchauffement, degrés-jours et nuits de gel sont en pause pour économiser les données — le contexte de canicule reste actif.",
      loading: "Préparation de l'analyse climatique de ce lieu…",
      error: "Impossible de récupérer l'archive climatique ERA5 — vérifiez votre connexion puis réessayez.",
      retry: "Réessayer",
      src: "Source : archive ERA5 via Open-Meteo — les valeurs quotidiennes sont agrégées par année dans votre navigateur et stockées 30 jours sur votre appareil.",
      stripes_title: "Bandes de réchauffement 1950–2024",
      stripes_sub: "Chaque bande est une année : température moyenne annuelle face à la référence 1981–2010 (palette d'Ed Hawkins — RdBu inversée)",
      stripes_aria: "Bandes de réchauffement : température moyenne annuelle 1950–2024 face à la moyenne 1981–2010",
      cap_warmer: "En 2024, ce lieu a été plus chaud que la moyenne 1981–2010 de {v}°C",
      cap_cooler: "En 2024, ce lieu a été plus froid que la moyenne 1981–2010 de {v}°C",
      cap_near: "En 2024, ce lieu est resté proche de la moyenne 1981–2010 (écart de seulement {v}°C)",
      colder: "Plus froid",
      warmer: "Plus chaud",
      heat_title: "Contexte de canicule 2015–2024",
      heat_sub: "Où se situe le maximum d'aujourd'hui dans la distribution de la dernière décennie ?",
      p95_label: "Seuil extrême (P95)",
      p95_note: "Dépassé par seulement 5 % des jours de 2015–2024",
      p50_label: "Médiane des maxima (P50)",
      p50_note: "Point médian des maxima 2015–2024",
      today_label: "Maxi d'aujourd'hui",
      lvl_extreme: "Extrême",
      lvl_high: "Élevée",
      lvl_normal: "Normale",
      note_extreme: "Dans les 5 % supérieurs de la décennie — risque de stress thermique",
      note_high: "Au-dessus de la médiane de la décennie",
      note_normal: "En dessous de la médiane de la décennie",
      note_wait: "Les prévisions du jour ne sont pas encore arrivées — mise à jour automatique",
      track_aria: "Position du maximum d'aujourd'hui sur l'échelle de la décennie",
      gdd_title: "Degrés-jours de croissance (GDD) 1980–2024",
      gdd_sub: "Surplus thermique annuel au-dessus de 10°C sur la saison de croissance (mars–octobre)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — sommé pour chaque jour de mars à octobre",
      gdd_aria: "Courbe annuelle des degrés-jours 1980–2024 avec les moyennes 1980–1989 et 2015–2024",
      ref_early: "Moy. 1980–1989",
      ref_recent: "Moy. 2015–2024",
      cap_gdd_up: "La moyenne 2015–2024 dépasse celle de 1980–1989 de {v} degrés-jours (+{p} %)",
      cap_gdd_down: "La moyenne 2015–2024 est inférieure à celle de 1980–1989 de {v} degrés-jours (−{p} %)",
      frost_title: "Nuits de gel 2015–2024",
      frost_sub: "Nombre de nuits par an avec un minimum sous 0°C",
      frost_aria: "Barres annuelles des nuits de gel de 2015 à 2024",
      cap_frost_more: "2024 a compté {n} nuits de gel — soit {v} de plus que la moyenne 2015–2023 ({m})",
      cap_frost_less: "2024 a compté {n} nuits de gel — soit {v} de moins que la moyenne 2015–2023 ({m})",
      cap_frost_equal: "2024 a compté {n} nuits de gel — conforme à la moyenne 2015–2023 ({m})",
      cap_frost_none: "Aucune nuit sous 0°C en ce lieu entre 2015 et 2024 — climat sans gel"
    },

    de: {
      deg: "°C",
      place: "Standort: {v}",
      no_place: "Wählen Sie zuerst einen Ort — die Klimaanalyse erscheint dann automatisch.",
      eco_note: "Sparmodus aktiv: Erwärmungsstreifen, Wachstumsgrade und Frostnächte sind pausiert, um Daten zu sparen — der Hitzewellen-Kontext läuft weiter.",
      loading: "Klimaanalyse für diesen Ort wird vorbereitet…",
      error: "ERA5-Klimaarchiv konnte nicht geladen werden — Verbindung prüfen und erneut versuchen.",
      retry: "Erneut versuchen",
      src: "Quelle: ERA5-Archiv über Open-Meteo — Tageswerte werden jährlich im Browser aggregiert und 30 Tage auf dem Gerät gespeichert.",
      stripes_title: "Erwärmungsstreifen 1950–2024",
      stripes_sub: "Jeder Streifen ist ein Jahr: Jahresmitteltemperatur gegen den Referenzmittelwert 1981–2010 (Ed-Hawkins-Palette — invertiertes RdBu)",
      stripes_aria: "Erwärmungsstreifen: Jahresmitteltemperatur 1950–2024 gegenüber dem Mittel 1981–2010",
      cap_warmer: "2024 war an diesem Ort um {v}°C wärmer als das Mittel 1981–2010",
      cap_cooler: "2024 war an diesem Ort um {v}°C kälter als das Mittel 1981–2010",
      cap_near: "2024 lag an diesem Ort nahe am Mittel 1981–2010 (nur {v}°C Abweichung)",
      colder: "Kälter",
      warmer: "Wärmer",
      heat_title: "Hitzewellen-Kontext 2015–2024",
      heat_sub: "Wo steht das heutige Maximum innerhalb der Verteilung des letzten Jahrzehnts?",
      p95_label: "Extremschwelle (P95)",
      p95_note: "Nur 5 % der Tage 2015–2024 überschreiten sie",
      p50_label: "Median der Maxima (P50)",
      p50_note: "Mittelpunkt der Tagesmaxima 2015–2024",
      today_label: "Heutiges Maximum",
      lvl_extreme: "Extrem",
      lvl_high: "Hoch",
      lvl_normal: "Normal",
      note_extreme: "In den obersten 5 % des Jahrzehnts — Hitzestress-Risiko",
      note_high: "Über dem Median des Jahrzehnts",
      note_normal: "Unter dem Median des Jahrzehnts",
      note_wait: "Die Vorhersage für heute liegt noch nicht vor — automatische Aktualisierung",
      track_aria: "Heutiges Maximum auf der Skala des letzten Jahrzehnts",
      gdd_title: "Wachstumsgrade (GDD) 1980–2024",
      gdd_sub: "Jährlicher Wärmeüberschuss über 10°C in der Wachstumssaison (März–Oktober)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — für jeden Tag von März bis Oktober summiert",
      gdd_aria: "Jahreskurve der Wachstumsgrade 1980–2024 mit den Mitteln 1980–1989 und 2015–2024",
      ref_early: "Mittel 1980–1989",
      ref_recent: "Mittel 2015–2024",
      cap_gdd_up: "Das Mittel 2015–2024 liegt um {v} Wachstumsgrade über dem von 1980–1989 (+{p} %)",
      cap_gdd_down: "Das Mittel 2015–2024 liegt um {v} Wachstumsgrade unter dem von 1980–1989 (−{p} %)",
      frost_title: "Frostnächte 2015–2024",
      frost_sub: "Anzahl der Nächte pro Jahr mit einem Minimum unter 0°C",
      frost_aria: "Jährliche Balken der Frostnächte von 2015 bis 2024",
      cap_frost_more: "2024 verzeichnete {n} Frostnächte — {v} mehr als der Durchschnitt 2015–2023 ({m})",
      cap_frost_less: "2024 verzeichnete {n} Frostnächte — {v} weniger als der Durchschnitt 2015–2023 ({m})",
      cap_frost_equal: "2024 verzeichnete {n} Frostnächte — genau der Durchschnitt 2015–2023 ({m})",
      cap_frost_none: "Zwischen 2015 und 2024 fiel an diesem Ort keine Nacht unter 0°C — frostfreies Klima"
    },

    es: {
      deg: "°C",
      place: "Ubicación: {v}",
      no_place: "Elige primero una ubicación — el análisis climático aparecerá automáticamente.",
      eco_note: "Modo económico activado: las franjas de calentamiento, los grados-día y las noches de helada están en pausa para ahorrar datos — el contexto de ola de calor sigue funcionando.",
      loading: "Preparando el análisis climático de esta ubicación…",
      error: "No se pudo obtener el archivo climático ERA5 — comprueba tu conexión e inténtalo de nuevo.",
      retry: "Reintentar",
      src: "Fuente: archivo ERA5 vía Open-Meteo — los valores diarios se agregan por año en tu navegador y los resultados se guardan 30 días en tu dispositivo.",
      stripes_title: "Franjas de calentamiento 1950–2024",
      stripes_sub: "Cada franja es un año: temperatura media anual frente a la referencia 1981–2010 (paleta de Ed Hawkins — RdBu invertida)",
      stripes_aria: "Franjas de calentamiento: temperatura media anual 1950–2024 frente a la media 1981–2010",
      cap_warmer: "En 2024, este lugar fue más cálido que la media 1981–2010 por {v}°C",
      cap_cooler: "En 2024, este lugar fue más frío que la media 1981–2010 por {v}°C",
      cap_near: "En 2024, este lugar quedó cerca de la media 1981–2010 (solo {v}°C de diferencia)",
      colder: "Más frío",
      warmer: "Más cálido",
      heat_title: "Contexto de ola de calor 2015–2024",
      heat_sub: "¿Dónde queda el máximo de hoy dentro de la distribución de la última década?",
      p95_label: "Umbral extremo (P95)",
      p95_note: "Solo lo supera el 5 % de los días de 2015–2024",
      p50_label: "Mediana de máximos (P50)",
      p50_note: "Punto medio de los máximos de 2015–2024",
      today_label: "Máximo de hoy",
      lvl_extreme: "Extremo",
      lvl_high: "Alta",
      lvl_normal: "Normal",
      note_extreme: "Entre el 5 % superior de la década — riesgo de estrés térmico",
      note_high: "Por encima de la mediana de la década",
      note_normal: "Por debajo de la mediana de la década",
      note_wait: "La previsión de hoy aún no llegó — la tarjeta se actualiza sola",
      track_aria: "Máximo de hoy en la escala de la última década",
      gdd_title: "Grados-día de crecimiento (GDD) 1980–2024",
      gdd_sub: "Excedente térmico anual sobre 10°C en la temporada de crecimiento (marzo–octubre)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — sumado para cada día de marzo a octubre",
      gdd_aria: "Curva anual de grados-día 1980–2024 con las medias 1980–1989 y 2015–2024",
      ref_early: "Media 1980–1989",
      ref_recent: "Media 2015–2024",
      cap_gdd_up: "La media 2015–2024 supera a la de 1980–1989 en {v} unidades (+{p} %)",
      cap_gdd_down: "La media 2015–2024 queda por debajo de la de 1980–1989 en {v} unidades (−{p} %)",
      frost_title: "Noches de helada 2015–2024",
      frost_sub: "Número de noches al año con mínimo inferior a 0°C",
      frost_aria: "Barras anuales de noches de helada de 2015 a 2024",
      cap_frost_more: "2024 registró {n} noches de helada — {v} más que la media 2015–2023 ({m})",
      cap_frost_less: "2024 registró {n} noches de helada — {v} menos que la media 2015–2023 ({m})",
      cap_frost_equal: "2024 registró {n} noches de helada — igual que la media 2015–2023 ({m})",
      cap_frost_none: "Ninguna noche bajó de 0°C en este lugar entre 2015 y 2024 — clima sin heladas"
    },

    pt: {
      deg: "°C",
      place: "Localização: {v}",
      no_place: "Escolha primeiro uma localização — a análise climática aparece automaticamente.",
      eco_note: "Modo económico ativado: faixas de aquecimento, graus-dia e noites de geada em pausa para poupar dados — o contexto de onda de calor continua a funcionar.",
      loading: "A preparar a análise climática desta localização…",
      error: "Não foi possível obter o arquivo climático ERA5 — verifique a ligação e tente novamente.",
      retry: "Tentar novamente",
      src: "Fonte: arquivo ERA5 via Open-Meteo — os valores diários são agregados por ano no seu navegador e os resultados ficam guardados 30 dias no dispositivo.",
      stripes_title: "Faixas de aquecimento 1950–2024",
      stripes_sub: "Cada faixa é um ano: temperatura média anual face à referência 1981–2010 (paleta de Ed Hawkins — RdBu invertida)",
      stripes_aria: "Faixas de aquecimento: temperatura média anual 1950–2024 face à média 1981–2010",
      cap_warmer: "Em 2024, este local foi mais quente do que a média 1981–2010 em {v}°C",
      cap_cooler: "Em 2024, este local foi mais frio do que a média 1981–2010 em {v}°C",
      cap_near: "Em 2024, este local ficou perto da média 1981–2010 (apenas {v}°C de diferença)",
      colder: "Mais frio",
      warmer: "Mais quente",
      heat_title: "Contexto de onda de calor 2015–2024",
      heat_sub: "Onde fica o máximo de hoje na distribuição da última década?",
      p95_label: "Limiar extremo (P95)",
      p95_note: "Apenas 5 % dos dias de 2015–2024 o ultrapassam",
      p50_label: "Mediana dos máximos (P50)",
      p50_note: "Ponto médio dos máximos de 2015–2024",
      today_label: "Máximo de hoje",
      lvl_extreme: "Extremo",
      lvl_high: "Elevada",
      lvl_normal: "Normal",
      note_extreme: "Nos 5 % superiores da década — risco de stress térmico",
      note_high: "Acima da mediana da década",
      note_normal: "Abaixo da mediana da década",
      note_wait: "A previsão de hoje ainda não chegou — o cartão atualiza-se automaticamente",
      track_aria: "Máximo de hoje na escala da última década",
      gdd_title: "Graus-dia de crescimento (GDD) 1980–2024",
      gdd_sub: "Excedente térmico anual acima de 10°C na estação de crescimento (março–outubro)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — somado para cada dia de março a outubro",
      gdd_aria: "Curva anual de graus-dia 1980–2024 com as médias 1980–1989 e 2015–2024",
      ref_early: "Média 1980–1989",
      ref_recent: "Média 2015–2024",
      cap_gdd_up: "A média 2015–2024 supera a de 1980–1989 em {v} unidades (+{p} %)",
      cap_gdd_down: "A média 2015–2024 fica abaixo da de 1980–1989 em {v} unidades (−{p} %)",
      frost_title: "Noites de geada 2015–2024",
      frost_sub: "Número de noites por ano com mínimo abaixo de 0°C",
      frost_aria: "Barras anuais de noites de geada de 2015 a 2024",
      cap_frost_more: "2024 registou {n} noites de geada — {v} acima da média 2015–2023 ({m})",
      cap_frost_less: "2024 registou {n} noites de geada — {v} abaixo da média 2015–2023 ({m})",
      cap_frost_equal: "2024 registou {n} noites de geada — igual à média 2015–2023 ({m})",
      cap_frost_none: "Nenhuma noite desceu abaixo de 0°C neste local entre 2015 e 2024 — clima sem geada"
    },

    it: {
      deg: "°C",
      place: "Località: {v}",
      no_place: "Scegli prima una località — l'analisi climatica apparirà automaticamente.",
      eco_note: "Modalità economia attiva: strisce di riscaldamento, gradi-giorno e notti di gelo in pausa per risparmiare dati — il contesto di ondata di calore resta attivo.",
      loading: "Preparazione dell'analisi climatica per questa località…",
      error: "Impossibile recuperare l'archivio climatico ERA5 — controlla la connessione e riprova.",
      retry: "Riprova",
      src: "Fonte: archivio ERA5 via Open-Meteo — i valori giornalieri vengono aggregati per anno nel browser e i risultati restano salvati 30 giorni sul dispositivo.",
      stripes_title: "Strisce di riscaldamento 1950–2024",
      stripes_sub: "Ogni striscia è un anno: temperatura media annua rispetto al riferimento 1981–2010 (tavolozza di Ed Hawkins — RdBu invertita)",
      stripes_aria: "Strisce di riscaldamento: temperatura media annua 1950–2024 rispetto alla media 1981–2010",
      cap_warmer: "Nel 2024 questa località è stata più calda della media 1981–2010 di {v}°C",
      cap_cooler: "Nel 2024 questa località è stata più fredda della media 1981–2010 di {v}°C",
      cap_near: "Nel 2024 questa località è rimasta vicina alla media 1981–2010 (solo {v}°C di scarto)",
      colder: "Più freddo",
      warmer: "Più caldo",
      heat_title: "Contesto di ondata di calore 2015–2024",
      heat_sub: "Dove si colloca il massimo di oggi nella distribuzione dell'ultimo decennio?",
      p95_label: "Soglia estrema (P95)",
      p95_note: "Superata solo dal 5% dei giorni del 2015–2024",
      p50_label: "Mediana dei massimi (P50)",
      p50_note: "Punto medio dei massimi 2015–2024",
      today_label: "Massimo di oggi",
      lvl_extreme: "Estremo",
      lvl_high: "Alta",
      lvl_normal: "Normale",
      note_extreme: "Nel 5% superiore del decennio — rischio di stress termico",
      note_high: "Sopra la mediana del decennio",
      note_normal: "Sotto la mediana del decennio",
      note_wait: "Le previsioni di oggi non sono ancora arrivate — la scheda si aggiorna da sola",
      track_aria: "Massimo di oggi sulla scala dell'ultimo decennio",
      gdd_title: "Gradi-giorno di crescita (GDD) 1980–2024",
      gdd_sub: "Eccedenza termica annua sopra i 10°C nella stagione di crescita (marzo–ottobre)",
      gdd_formula: "GDD = max(0, ((Tmax + Tmin) ÷ 2) − 10) — sommato per ogni giorno da marzo a ottobre",
      gdd_aria: "Curva annuale dei gradi-giorno 1980–2024 con le medie 1980–1989 e 2015–2024",
      ref_early: "Media 1980–1989",
      ref_recent: "Media 2015–2024",
      cap_gdd_up: "La media 2015–2024 supera quella del 1980–1989 di {v} unità (+{p}%)",
      cap_gdd_down: "La media 2015–2024 è inferiore a quella del 1980–1989 di {v} unità (−{p}%)",
      frost_title: "Notti di gelo 2015–2024",
      frost_sub: "Numero di notti all'anno con minimo sotto 0°C",
      frost_aria: "Barre annuali delle notti di gelo dal 2015 al 2024",
      cap_frost_more: "Il 2024 ha registrato {n} notti di gelo — {v} in più della media 2015–2023 ({m})",
      cap_frost_less: "Il 2024 ha registrato {n} notti di gelo — {v} in meno della media 2015–2023 ({m})",
      cap_frost_equal: "Il 2024 ha registrato {n} notti di gelo — in linea con la media 2015–2023 ({m})",
      cap_frost_none: "Nessuna notte sotto 0°C in questa località tra 2015 e 2024 — clima senza gelo"
    }
  };

  function langKey() {
    var l = ((document.documentElement.lang || "ar") + "").slice(0, 2).toLowerCase();
    return L[l] ? l : "ar";
  }

  /* ترجمة مفتاح داخلي مع تعويض قوالب {v} — بلا eval ولا new Function */
  function t(key, vars) {
    var s = L[langKey()][key];
    if (typeof s !== "string") s = L.ar[key] || key;
    if (vars) {
      for (var k in vars) {
        s = s.split("{" + k + "}").join(vars[k]);
      }
    }
    return s;
  }

  function deg() { return L[langKey()].deg; }

  /* ══ 3) أدوات DOM وSVG — textContent حصريًا (متوافق مع CSP) ══ */

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined && txt !== null) n.textContent = txt;
    return n;
  }

  function svgEl(name, attrs) {
    var n = document.createElementNS(SVG_NS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
      }
    }
    return n;
  }

  function svgText(x, y, str, cls, anchor) {
    var node = svgEl("text", { x: x, y: y, "class": cls || "mc-tick" });
    if (anchor) node.setAttribute("text-anchor", anchor);
    node.textContent = str; /* بيانات نصية عبر textContent فقط */
    return node;
  }

  /* ══ 4) أدوات رقمية ══ */

  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function fmt1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  function fmtInt(v) { return String(Math.round(v)); }

  function meanArr(arr) {
    var s = 0, n = 0;
    for (var i = 0; i < arr.length; i++) {
      if (isNum(arr[i])) { s += arr[i]; n++; }
    }
    return n ? s / n : null;
  }

  /* المئين باستيفاء خطي على مصفوفة مرتبة تصاعديًا */
  function percentile(sortedNums, p) {
    if (!sortedNums.length) return null;
    var idx = (sortedNums.length - 1) * p;
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sortedNums[lo];
    return sortedNums[lo] + (sortedNums[hi] - sortedNums[lo]) * (idx - lo);
  }

  /* أصغر قيمة «جميلة» (1 · 1.2 · 1.5 · 2 · 2.5 · 3 · 4 · 5 · 6 · 8 × 10ⁿ) ≥ v */
  function niceCeil(v) {
    if (!(v > 0)) return 10;
    var mag = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
    var steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] * mag >= v) return steps[i] * mag;
    }
    return 10 * mag;
  }

  /* ══ 5) جسر التطبيق: الموقع والوضع الاقتصادي وحرارة اليوم ══ */

  function getPlace() {
    try {
      var st = window.__matarBridge && window.__matarBridge.state;
      if (st && st.place && isNum(st.place.latitude) && isNum(st.place.longitude)) return st.place;
    } catch (e) { /* تجاهل */ }
    try {
      var raw = localStorage.getItem("matar:place");
      if (raw) {
        var p = JSON.parse(raw);
        if (p && isNum(p.latitude) && isNum(p.longitude)) return p;
      }
    } catch (e) { /* تجاهل */ }
    return null;
  }

  function placeName(p) {
    if (p && p.name) return String(p.name);
    return (Math.round(p.latitude * 1000) / 1000) + ", " + (Math.round(p.longitude * 1000) / 1000);
  }

  /* معرّف الموقع للكاش — إحداثيات مقرّبة إلى 3 خانات عشرية */
  function placeId(p) {
    return (Math.round(p.latitude * 1000) / 1000) + "," + (Math.round(p.longitude * 1000) / 1000);
  }

  function isEco() {
    try {
      if (localStorage.getItem("matar:eco") === "1") return true;
    } catch (e) { /* تجاهل */ }
    return document.documentElement.classList.contains("eco");
  }

  /* حرارة اليوم العظمى من حالة التطبيق (مصفوفة توقعات — أول قيمة = اليوم) */
  function todayMax() {
    try {
      var wx = window.__matarBridge && window.__matarBridge.state && window.__matarBridge.state.wx;
      var d = wx && wx.daily;
      var arr = d && d.temperature_2m_max;
      if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length && i < 2; i++) {
          if (isNum(arr[i])) return arr[i];
        }
      } else if (isNum(arr)) {
        return arr;
      }
    } catch (e) { /* تجاهل */ }
    return null;
  }

  /* ══ 6) طبقة الكاش — "matar:climate:v73:" بصلاحية 30 يومًا ══ */

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj.t !== "number" || (Date.now() - obj.t) > CACHE_TTL_MS) return null;
      return obj.d;
    } catch (e) {
      return null;
    }
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* الكاش ممتلئ أو محجوب — نتابع بلا كاش */ }
  }

  function cacheDel(key) {
    try { localStorage.removeItem(key); } catch (e) { /* تجاهل */ }
  }

  /* نواتج قيد الجلب — تُشارك بين الميزات (الحرارة والصقيع من الطلب نفسه) */
  var inflight = {};

  /* قراءة ناتج محسوب من الكاش أو جلبه وتخزينه — مع إلغاء التكرار المتزامن */
  function cached(kind, id, compute) {
    var key = CACHE_PREFIX + kind + ":" + id;
    var hit = cacheGet(key);
    if (hit) return Promise.resolve(hit);
    if (inflight[key]) return inflight[key];
    inflight[key] = compute().then(
      function (res) {
        cacheSet(key, res);
        delete inflight[key];
        return res;
      },
      function (err) {
        delete inflight[key];
        throw err;
      }
    );
    return inflight[key];
  }

  /* ══ 7) جلب أرشيف ERA5 — مهلة إلغاء 25 ثانية ══ */

  function fetchArchive(place, startDate, endDate, dailyVars) {
    var url = ARCHIVE_BASE +
      "?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&start_date=" + startDate +
      "&end_date=" + endDate +
      "&daily=" + dailyVars.join(",") +
      "&timezone=auto";
    var p;
    if (typeof AbortController === "function") {
      var ctl = new AbortController();
      var tid = setTimeout(function () { ctl.abort(); }, FETCH_TIMEOUT_MS);
      p = fetch(url, { signal: ctl.signal }).then(
        function (res) { clearTimeout(tid); return res; },
        function (err) { clearTimeout(tid); throw err; }
      );
    } else {
      p = fetch(url);
    }
    return p.then(function (res) {
      if (!res.ok) throw new Error("archive-http-" + res.status);
      return res.json();
    }).then(function (json) {
      if (!json || !json.daily || !Array.isArray(json.daily.time) || !json.daily.time.length) {
        throw new Error("archive-empty");
      }
      return json;
    });
  }

  /* ══ 8) الميزة 1: شرائط الاحترار — تجميع سنوي في المتصفح ══ */

  function computeStripes(daily) {
    var time = daily.time || [];
    var vals = daily.temperature_2m_mean || [];
    var byYear = {};
    for (var i = 0; i < time.length; i++) {
      var v = vals[i];
      if (!isNum(v)) continue;
      var y = String(time[i]).slice(0, 4);
      if (!byYear[y]) byYear[y] = { s: 0, n: 0 };
      byYear[y].s += v;
      byYear[y].n++;
    }
    var years = [], means = [];
    for (var Y = STRIPES_FIRST_YEAR; Y <= STRIPES_LAST_YEAR; Y++) {
      var e = byYear[String(Y)];
      years.push(Y);
      /* سنة ذات تغطية كافية (≥ 60 يومًا صالحًا) تُقبل في المتوسط السنوي */
      means.push(e && e.n >= 60 ? e.s / e.n : null);
    }
    var baseVals = [];
    for (var j = 0; j < years.length; j++) {
      if (years[j] >= BASELINE_FIRST && years[j] <= BASELINE_LAST && isNum(means[j])) baseVals.push(means[j]);
    }
    var baseline = meanArr(baseVals);
    return { years: years, means: means, baseline: baseline };
  }

  /* ══ 9) الميزتان 2 و4: إحصاءات الحرارة والصقيع من طلب واحد ══ */

  function computeHeatFrost(daily) {
    var time = daily.time || [];
    var mx = daily.temperature_2m_max || [];
    var mn = daily.temperature_2m_min || [];
    var maxes = [];
    var frostByYear = {};
    for (var i = 0; i < time.length; i++) {
      var y = String(time[i]).slice(0, 4);
      if (isNum(mx[i])) maxes.push(mx[i]);
      if (isNum(mn[i]) && mn[i] < 0) {
        frostByYear[y] = (frostByYear[y] || 0) + 1;
      }
    }
    if (maxes.length < 60) return null; /* بيانات غير كافية للحكم */
    maxes.sort(function (a, b) { return a - b; });
    var frostYears = [], frostCounts = [];
    for (var Y = HEAT_FIRST_YEAR; Y <= HEAT_LAST_YEAR; Y++) {
      frostYears.push(Y);
      frostCounts.push(frostByYear[String(Y)] || 0);
    }
    return {
      p95: percentile(maxes, 0.95),
      p50: percentile(maxes, 0.50),
      min: maxes[0],
      max: maxes[maxes.length - 1],
      n: maxes.length,
      frostYears: frostYears,
      frostCounts: frostCounts
    };
  }

  /* ══ 10) الميزة 3: وحدات النمو الزراعي (GDD) ══ */

  function computeGdd(daily) {
    var time = daily.time || [];
    var mx = daily.temperature_2m_max || [];
    var mn = daily.temperature_2m_min || [];
    var per = {};
    for (var i = 0; i < time.length; i++) {
      var a = mx[i], b = mn[i];
      if (!isNum(a) || !isNum(b)) continue;
      var mon = parseInt(String(time[i]).slice(5, 7), 10);
      if (mon < 3 || mon > 10) continue; /* موسم النمو: مارس–أكتوبر */
      var g = ((a + b) / 2) - GDD_BASE_TEMP;
      if (g > 0) {
        var y = String(time[i]).slice(0, 4);
        per[y] = (per[y] || 0) + g;
      }
    }
    var years = [], gdd = [];
    for (var Y = GDD_FIRST_YEAR; Y <= GDD_LAST_YEAR; Y++) {
      years.push(Y);
      gdd.push(per[String(Y)] || 0);
    }
    return { years: years, gdd: gdd };
  }

  /* متوسطا المقارنة: العقد الأول (1980–1989) والعقد الأخير (2015–2024) */
  function gddAverages(res) {
    var early = meanArr(res.gdd.slice(0, 10));
    var recent = meanArr(res.gdd.slice(-10));
    return { early: early, recent: recent };
  }

  /* متوسط السنوات 2015–2023 (للمقارنة مع 2024 في الصقيع) */
  function frostAverage(res) {
    return meanArr(res.frostCounts.slice(0, res.frostCounts.length - 1));
  }

  /* ══ 11) لوحة ألوان الشرائط — RdBu معكوسة بثلاث مراحل RGB ══ */

  function hexRgb(h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  var STRIPE_RGB = STRIPE_STOPS.map(hexRgb);

  /* t في [−1..1] → لون بين الأزرق البارد والأحمر الحار */
  function stripeColor(t) {
    var u = (Math.max(-1, Math.min(1, t)) + 1) / 2;
    var f = u * (STRIPE_RGB.length - 1);
    var i = Math.min(STRIPE_RGB.length - 2, Math.floor(f));
    var r = f - i;
    var a = STRIPE_RGB[i], b = STRIPE_RGB[i + 1];
    function ch(x, y) {
      var v = Math.round(x + (y - x) * r);
      return (v < 16 ? "0" : "") + v.toString(16);
    }
    return "#" + ch(a[0], b[0]) + ch(a[1], b[1]) + ch(a[2], b[2]);
  }

  /* ══ 12) بُناة SVG — يدويًا عبر createElementNS بالكامل ══ */

  /* رسم شرائط الاحترار 1950–2024 مع محور كل 10 سنوات ومفتاح اللون */
  function buildStripesSvg(res) {
    var W = 760, H = 202;
    var x0 = 26, plotW = 708, y0 = 12, barH = 118;
    var axisY = y0 + barH + 16;
    var n = res.years.length;
    var bw = plotW / n;

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("stripes_aria")
    });

    /* مقياس الشذوذ: أكبر انحراف مطلق عن المرجع (بأرضية 0.4° لتفادي التشبع) */
    var scale = 0;
    for (var i = 0; i < n; i++) {
      if (isNum(res.means[i]) && isNum(res.baseline)) {
        scale = Math.max(scale, Math.abs(res.means[i] - res.baseline));
      }
    }
    if (scale < 0.4) scale = 0.4;

    /* الشرائط السنوية — كل شريطة عام واحد */
    for (var j = 0; j < n; j++) {
      var m = res.means[j];
      var col = (isNum(m) && isNum(res.baseline)) ? stripeColor((m - res.baseline) / scale) : "#a8b5b0";
      svg.appendChild(svgEl("rect", {
        x: (x0 + j * bw).toFixed(2),
        y: y0,
        width: (bw + 0.6).toFixed(2),
        height: barH,
        fill: col
      }));
    }

    /* إبراز شريطة 2024 (آخر شريطة) بإطار خفيف */
    svg.appendChild(svgEl("rect", {
      x: (x0 + (n - 1) * bw - 0.9).toFixed(2),
      y: y0 - 3,
      width: (bw + 1.8).toFixed(2),
      height: barH + 6,
      rx: 3,
      fill: "none",
      "class": "mc-stripe-focus"
    }));

    /* محور السنوات — علامة واسم كل 10 سنوات (1950 … 2020) */
    svg.appendChild(svgEl("line", { x1: x0, y1: axisY, x2: x0 + plotW, y2: axisY, "class": "mc-axis" }));
    for (var yr = STRIPES_FIRST_YEAR; yr <= 2020; yr += 10) {
      var tx = x0 + (yr - STRIPES_FIRST_YEAR) * bw + bw / 2;
      svg.appendChild(svgEl("line", { x1: tx, y1: axisY, x2: tx, y2: axisY + 5, "class": "mc-axis" }));
      svg.appendChild(svgText(tx, axisY + 18, String(yr), "mc-tick", "middle"));
    }

    /* مفتاح اللون: شريط متدرج صغير بين «أبرد» و«أدفأ» */
    var lgW = 190, lgX = (W - lgW) / 2, lgY = axisY + 34, seg = lgW / 30;
    for (var s = 0; s < 30; s++) {
      svg.appendChild(svgEl("rect", {
        x: (lgX + s * seg).toFixed(2),
        y: lgY,
        width: (seg + 0.5).toFixed(2),
        height: 8,
        rx: 1.5,
        fill: stripeColor((s / 29) * 2 - 1)
      }));
    }
    svg.appendChild(svgText(lgX - 9, lgY + 8, t("colder"), "mc-legend-word", "end"));
    svg.appendChild(svgText(lgX + lgW + 9, lgY + 8, t("warmer"), "mc-legend-word", "start"));

    return svg;
  }

  /* منحنى وحدات النمو الأخضر مع خطي المتوسطين المتقطعين */
  function buildGddSvg(res) {
    var W = 760, H = 228;
    var x0 = 50, x1 = 738, y0 = 16, y1 = 196;
    var n = res.years.length;
    var maxGdd = 0;
    for (var i = 0; i < n; i++) maxGdd = Math.max(maxGdd, res.gdd[i]);
    var yMax = niceCeil(maxGdd * 1.06 || 10);

    function X(yr) { return x0 + ((yr - GDD_FIRST_YEAR) / (n - 1)) * (x1 - x0); }
    function Y(v) { return y1 - (v / yMax) * (y1 - y0); }

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("gdd_aria")
    });

    /* خطوط الشبكة الأفقية وتسميات المحور الرأسي (5 مستويات من 0 إلى yMax) */
    for (var k = 0; k <= 4; k++) {
      var gy = y1 - (k / 4) * (y1 - y0);
      svg.appendChild(svgEl("line", {
        x1: x0, y1: gy, x2: x1, y2: gy,
        "class": k === 0 ? "mc-axis" : "mc-grid"
      }));
      svg.appendChild(svgText(x0 - 8, gy + 3.5, fmtInt(yMax * k / 4), "mc-tick", "end"));
    }

    /* تسميات المحور الأفقي — كل 10 سنوات (1980 … 2020) */
    for (var yr = GDD_FIRST_YEAR; yr <= 2020; yr += 10) {
      svg.appendChild(svgText(X(yr), y1 + 18, String(yr), "mc-tick", "middle"));
    }

    /* المساحة المظللة تحت المنحنى ثم المنحنى الأخضر نفسه */
    var areaPts = "M" + x0.toFixed(1) + "," + y1.toFixed(1);
    var linePts = [];
    for (var j = 0; j < n; j++) {
      var px = X(res.years[j]).toFixed(1), py = Y(res.gdd[j]).toFixed(1);
      areaPts += " L" + px + "," + py;
      linePts.push(px + "," + py);
    }
    areaPts += " L" + x1.toFixed(1) + "," + y1.toFixed(1) + " Z";
    svg.appendChild(svgEl("path", { d: areaPts, "class": "mc-gdd-area" }));
    svg.appendChild(svgEl("polyline", { points: linePts.join(" "), "class": "mc-gdd-line" }));

    /* نقاط السنوات الصغيرة */
    for (var d = 0; d < n; d++) {
      svg.appendChild(svgEl("circle", {
        cx: X(res.years[d]).toFixed(1),
        cy: Y(res.gdd[d]).toFixed(1),
        r: 1.7,
        "class": "mc-gdd-dot"
      }));
    }

    /* خطا المتوسطين المتقطعان (1980–1989 رمادي · 2015–2024 أخضر) مع تسميتيهما */
    var av = gddAverages(res);
    if (isNum(av.early) && isNum(av.recent)) {
      var yE = Y(av.early), yR = Y(av.recent);
      svg.appendChild(svgEl("line", { x1: x0, y1: yE, x2: x1, y2: yE, "class": "mc-ref-early" }));
      svg.appendChild(svgEl("line", { x1: x0, y1: yR, x2: x1, y2: yR, "class": "mc-ref-recent" }));
      /* تسمية الخط الأعلى فوقه والأسفل تحته كي لا تتطابقا */
      var recentIsUpper = yR < yE;
      svg.appendChild(svgText(x1 - 4, recentIsUpper ? yR - 6 : yR + 14, t("ref_recent") + ": " + fmtInt(av.recent), "mc-ref-lbl-recent", "end"));
      svg.appendChild(svgText(x1 - 4, recentIsUpper ? yE + 14 : yE - 6, t("ref_early") + ": " + fmtInt(av.early), "mc-ref-lbl-early", "end"));
    }

    return svg;
  }

  /* أعمدة ليالي الصقيع 2015–2024 (عمود 2024 مميّز) */
  function buildFrostSvg(res) {
    var W = 760, H = 240;
    var x0 = 42, x1 = 738, yTop = 20, yBase = 198;
    var counts = res.frostCounts, years = res.frostYears;
    var n = counts.length;
    var maxC = 0;
    for (var i = 0; i < n; i++) maxC = Math.max(maxC, counts[i]);
    var yMax = Math.max(4, Math.ceil(maxC / 4) * 4);
    var slot = (x1 - x0) / n;
    var bw = Math.min(44, slot * 0.62);

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("frost_aria")
    });

    /* الشبكة الأفقية والتسميات */
    for (var k = 0; k <= 4; k++) {
      var gy = yBase - (k / 4) * (yBase - yTop);
      svg.appendChild(svgEl("line", {
        x1: x0, y1: gy, x2: x1, y2: gy,
        "class": k === 0 ? "mc-axis" : "mc-grid"
      }));
      svg.appendChild(svgText(x0 - 8, gy + 3.5, String(Math.round(yMax * k / 4)), "mc-tick", "end"));
    }

    /* الأعمدة السنوية مع قيمة كل عمود وسنته */
    for (var j = 0; j < n; j++) {
      var cx = x0 + slot * (j + 0.5);
      var h = (counts[j] / yMax) * (yBase - yTop);
      if (counts[j] > 0) h = Math.max(3, h);
      var last = j === n - 1;
      svg.appendChild(svgEl("rect", {
        x: (cx - bw / 2).toFixed(1),
        y: (yBase - h).toFixed(1),
        width: bw.toFixed(1),
        height: Math.max(0, h).toFixed(1),
        rx: 4,
        "class": "mc-frost-bar" + (last ? " mc-frost-last" : "")
      }));
      svg.appendChild(svgText(cx.toFixed(1), (yBase - h - 6).toFixed(1), String(counts[j]), "mc-bar-val", "middle"));
      svg.appendChild(svgText(cx.toFixed(1), yBase + 16, String(years[j]), "mc-tick", "middle"));
    }

    return svg;
  }

  /* ══ 13) هياكل الأقسام وحالات التحميل والخطأ ══ */

  var FEATURE_META = {
    stripes: { title: "stripes_title", sub: "stripes_sub", badge: "1950–2024" },
    heat: { title: "heat_title", sub: "heat_sub", badge: "P95 · P50" },
    gdd: { title: "gdd_title", sub: "gdd_sub", badge: "1980–2024" },
    frost: { title: "frost_title", sub: "frost_sub", badge: "2015–2024" }
  };

  function buildSection(kind) {
    var root = el("section", "mc-section mc-" + kind);
    var head = el("div", "mc-sec-head");
    var txt = el("div", "mc-sec-txt");
    txt.appendChild(el("h3", "mc-title", t(FEATURE_META[kind].title)));
    txt.appendChild(el("p", "mc-sub", t(FEATURE_META[kind].sub)));
    head.appendChild(txt);
    head.appendChild(el("span", "mc-badge", FEATURE_META[kind].badge));
    root.appendChild(head);
    var body = el("div", "mc-body");
    root.appendChild(body);
    return { kind: kind, root: root, body: body };
  }

  function showLoading(sec) {
    sec.body.textContent = "";
    var box = el("div", "mc-loading");
    box.appendChild(el("i"));
    box.appendChild(el("span", null, t("loading")));
    sec.body.appendChild(box);
  }

  /* بطاقة خطأ مع زر إعادة محاولة يمسح كاش هذه الميزة وحدها */
  function renderFail(sec, msg) {
    sec.body.textContent = "";
    var box = el("div", "mc-error");
    box.appendChild(el("p", null, msg || t("error")));
    var btn = el("button", "mc-retry", t("retry"));
    btn.type = "button";
    btn.addEventListener("click", function () {
      var place = getPlace();
      if (place) cacheDel(CACHE_PREFIX + sec.kind + ":" + placeId(place));
      scan();
    });
    box.appendChild(btn);
    sec.body.appendChild(box);
  }

  function buildSourceNote() {
    return el("p", "mc-note", t("src"));
  }

  /* أيقونة دبوس الموقع الصغيرة (SVG يدوي) */
  function pinSvg() {
    var s = svgEl("svg", {
      viewBox: "0 0 24 24", width: "13", height: "13",
      fill: "none", stroke: "currentColor", "stroke-width": "1.9",
      "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true", "class": "mc-pin"
    });
    s.appendChild(svgEl("path", { d: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" }));
    s.appendChild(svgEl("circle", { cx: "12", cy: "10", r: "2.5" }));
    return s;
  }

  /* ══ 14) تعبئة الأقسام بالمحتوى ══ */

  /* الميزة 1: الشرائط + جملة الخلاصة الإلزامية عن 2024 */
  function renderStripes(sec, res) {
    sec.body.textContent = "";
    if (!res || !isNum(res.baseline) || !isNum(res.means[res.means.length - 1])) {
      renderFail(sec);
      return;
    }
    var wrap = el("div", "mc-stripes-wrap");
    wrap.appendChild(buildStripesSvg(res));
    sec.body.appendChild(wrap);

    var d = res.means[res.means.length - 1] - res.baseline;
    var cap;
    if (Math.abs(d) < 0.05) {
      cap = el("p", "mc-caption", t("cap_near", { v: fmt1(Math.abs(d)) }));
    } else if (d > 0) {
      cap = el("p", "mc-caption", t("cap_warmer", { v: fmt1(d) }));
    } else {
      cap = el("p", "mc-caption", t("cap_cooler", { v: fmt1(-d) }));
    }
    sec.body.appendChild(cap);
    sec.body.appendChild(buildSourceNote());
  }

  /* الميزة 2: البطاقات الثلاث + شريط موضع اليوم */
  function renderHeat(sec, stats) {
    sec.body.textContent = "";
    if (!stats) {
      renderFail(sec);
      return;
    }
    var today = todayMax();
    var level = null;
    if (isNum(today)) {
      level = today >= stats.p95 ? "extreme" : today >= stats.p50 ? "high" : "normal";
    }

    var grid = el("div", "mc-stats");

    /* البطاقة 1: عتبة P95 */
    var c1 = el("div", "mc-stat");
    c1.appendChild(el("p", "mc-stat-label", t("p95_label")));
    c1.appendChild(el("p", "mc-stat-value", fmt1(stats.p95) + deg()));
    c1.appendChild(el("p", "mc-stat-note", t("p95_note")));
    grid.appendChild(c1);

    /* البطاقة 2: الوسيط P50 */
    var c2 = el("div", "mc-stat");
    c2.appendChild(el("p", "mc-stat-label", t("p50_label")));
    c2.appendChild(el("p", "mc-stat-value", fmt1(stats.p50) + deg()));
    c2.appendChild(el("p", "mc-stat-note", t("p50_note")));
    grid.appendChild(c2);

    /* البطاقة 3: حرارة اليوم مع شارة التصنيف الملوّنة */
    var c3 = el("div", "mc-stat");
    c3.appendChild(el("p", "mc-stat-label", t("today_label")));
    var v3 = el("p", "mc-stat-value", isNum(today) ? fmt1(today) + deg() : "—");
    if (level) v3.setAttribute("data-level", level);
    c3.appendChild(v3);
    if (level) {
      var badge = el("span", "mc-heat-class", t("lvl_" + level));
      badge.setAttribute("data-level", level);
      c3.appendChild(badge);
      c3.appendChild(el("p", "mc-stat-note", t("note_" + level)));
    } else {
      c3.appendChild(el("p", "mc-stat-note", t("note_wait")));
    }
    grid.appendChild(c3);
    sec.body.appendChild(grid);

    /* شريط الموضع: أخضر حتى P50 · برتقالي حتى P95 · أحمر بعدها + نقطة اليوم */
    var box = el("div", "mc-heat-box");
    var track = el("div", "mc-heat-track");
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", t("track_aria"));
    var lo = stats.min, hi = stats.max;
    function pos(v) {
      if (hi > lo) return Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
      return 50;
    }
    var p50pos = pos(stats.p50), p95pos = pos(stats.p95);
    var zones = el("div", "mc-heat-zones");
    [
      { level: "normal", left: 0, width: p50pos },
      { level: "high", left: p50pos, width: Math.max(0, p95pos - p50pos) },
      { level: "extreme", left: p95pos, width: Math.max(0, 100 - p95pos) }
    ].forEach(function (z) {
      var zn = el("span", "mc-heat-zone");
      zn.setAttribute("data-level", z.level);
      zn.style.left = z.left.toFixed(2) + "%";
      zn.style.width = z.width.toFixed(2) + "%";
      zones.appendChild(zn);
    });
    track.appendChild(zones);
    if (isNum(today)) {
      var dot = el("span", "mc-heat-dot");
      dot.setAttribute("data-level", level);
      dot.style.left = pos(today).toFixed(2) + "%";
      track.appendChild(dot);
    }
    box.appendChild(track);

    /* تسميات المقياس: الأدنى · الوسيط · العتبة · الأقصى —
       إن تقاربت المواضع (قيم متقاربة أو حواف المقياس) تنتقل التسمية
       الوسطى إلى صف علوي كي لا تتراكب مع جاراتها أبدًا */
    var scale = el("div", "mc-heat-scale");
    var sMin = el("span", "mc-s-min", fmt1(lo) + deg());
    var s50Cls = "mc-s-mid" + (p50pos < 12 ? " mc-s-top" : "");
    var s50 = el("span", s50Cls, fmt1(stats.p50) + deg());
    s50.style.left = p50pos.toFixed(2) + "%";
    var s95Cls = "mc-s-mid" + ((p95pos > 88 || (p95pos - p50pos) < 12) ? " mc-s-top" : "");
    var s95 = el("span", s95Cls, fmt1(stats.p95) + deg());
    s95.style.left = p95pos.toFixed(2) + "%";
    var sMax = el("span", "mc-s-max", fmt1(hi) + deg());
    scale.appendChild(sMin);
    scale.appendChild(s50);
    scale.appendChild(s95);
    scale.appendChild(sMax);
    box.appendChild(scale);
    sec.body.appendChild(box);

    sec.body.appendChild(buildSourceNote());
  }

  /* الميزة 3: منحنى GDD + جملة مقارنة العقدين */
  function renderGdd(sec, res) {
    sec.body.textContent = "";
    if (!res) {
      renderFail(sec);
      return;
    }
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildGddSvg(res));
    sec.body.appendChild(wrap);

    var av = gddAverages(res);
    if (isNum(av.early) && isNum(av.recent)) {
      var diff = av.recent - av.early;
      var pct = av.early > 0 ? Math.abs((diff / av.early) * 100) : 0;
      var cap;
      if (diff >= 0) {
        cap = el("p", "mc-caption", t("cap_gdd_up", { v: fmtInt(diff), p: fmtInt(pct) }));
      } else {
        cap = el("p", "mc-caption", t("cap_gdd_down", { v: fmtInt(-diff), p: fmtInt(pct) }));
      }
      sec.body.appendChild(cap);
    }
    sec.body.appendChild(el("p", "mc-note", t("gdd_formula")));
    sec.body.appendChild(buildSourceNote());
  }

  /* الميزة 4: أعمدة الصقيع + جملة مقارنة 2024 بمتوسط 2015–2023 */
  function renderFrost(sec, stats) {
    sec.body.textContent = "";
    if (!stats) {
      renderFail(sec);
      return;
    }
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildFrostSvg(stats));
    sec.body.appendChild(wrap);

    var counts = stats.frostCounts;
    var total = 0;
    for (var i = 0; i < counts.length; i++) total += counts[i];
    var cap;
    if (total === 0) {
      cap = el("p", "mc-caption", t("cap_frost_none"));
    } else {
      var last = counts[counts.length - 1];
      var avg = frostAverage(stats);
      var d = last - avg;
      if (Math.abs(d) < 0.5) {
        cap = el("p", "mc-caption", t("cap_frost_equal", { n: fmtInt(last), m: fmtInt(avg) }));
      } else if (d > 0) {
        cap = el("p", "mc-caption", t("cap_frost_more", { n: fmtInt(last), v: fmtInt(d), m: fmtInt(avg) }));
      } else {
        cap = el("p", "mc-caption", t("cap_frost_less", { n: fmtInt(last), v: fmtInt(-d), m: fmtInt(avg) }));
      }
    }
    sec.body.appendChild(cap);
    sec.body.appendChild(buildSourceNote());
  }

  /* ══ 15) محرك العرض ══ */

  /* قراءة الميزات المطلوبة من قيمة السمة (all أو قائمة مفصولة بفواصل) */
  function wantedFeatures(root) {
    var v = (root.getAttribute("data-matar-climate") || "all").trim();
    var list;
    if (!v || v.toLowerCase() === "all") {
      list = FEATURE_ORDER.slice();
    } else {
      list = v.split(",").map(function (s) { return s.trim(); }).filter(function (f) {
        return FEATURE_ORDER.indexOf(f) > -1;
      });
    }
    /* ترتيب العرض ثابت دائمًا حسب ترتيب المواصفة: شرائط ← حر ← نمو ← صقيع */
    list.sort(function (a, b) { return FEATURE_ORDER.indexOf(a) - FEATURE_ORDER.indexOf(b); });
    return list;
  }

  function render(root, place) {
    root.textContent = "";
    var wrap = el("div", "mc-root");
    root.appendChild(wrap);

    if (!place) {
      wrap.appendChild(el("p", "mc-noplace", t("no_place")));
      return;
    }

    /* شريحة الموقع أعلى التحليل + تحديث شريحة الموقع في رأس الصفحة */
    var chip = el("span", "mc-place");
    chip.appendChild(pinSvg());
    chip.appendChild(el("span", null, placeName(place)));
    wrap.appendChild(chip);
    var headChip = document.getElementById("climate-loc-chip");
    if (headChip) {
      var sp = headChip.querySelector("span");
      if (sp) sp.textContent = placeName(place);
    }

    var eco = isEco();
    if (eco) {
      wrap.appendChild(el("p", "mc-eco-note", t("eco_note")));
    }

    var feats = wantedFeatures(root).filter(function (f) {
      return !eco || f === "heat"; /* الوضع الاقتصادي: سياق الحرارة وحده */
    });

    var secs = {};
    feats.forEach(function (k) {
      var sec = buildSection(k);
      secs[k] = sec;
      showLoading(sec);
      wrap.appendChild(sec.root);
    });

    var id = placeId(place);

    function fill(kind, fn) {
      return function (res) {
        if (secs[kind] && secs[kind].root.isConnected) fn(secs[kind], res);
      };
    }
    function fail(kind) {
      return function () {
        if (secs[kind] && secs[kind].root.isConnected) renderFail(secs[kind]);
      };
    }

    /* 1) شرائط الاحترار: المتوسط اليومي 1950–2024 مُجمَّعًا سنويًا */
    if (secs.stripes) {
      cached("stripes", id, function () {
        return fetchArchive(place, STRIPES_FIRST_YEAR + "-01-01", STRIPES_LAST_YEAR + "-12-31", ["temperature_2m_mean"])
          .then(function (json) { return computeStripes(json.daily || {}); });
      }).then(fill("stripes", renderStripes), fail("stripes"));
    }

    /* 2) سياق موجة الحر: العظمى والصغرى اليومية 2015–2024 (يُشاركه الصقيع) */
    if (secs.heat || secs.frost) {
      cached("heat", id, function () {
        return fetchArchive(place, HEAT_FIRST_YEAR + "-01-01", HEAT_LAST_YEAR + "-12-31", ["temperature_2m_max", "temperature_2m_min"])
          .then(function (json) { return computeHeatFrost(json.daily || {}); });
      }).then(function (stats) {
        if (secs.heat && secs.heat.root.isConnected) renderHeat(secs.heat, stats);
        if (secs.frost && secs.frost.root.isConnected) renderFrost(secs.frost, stats);
      }, function () {
        if (secs.heat && secs.heat.root.isConnected) renderFail(secs.heat);
        if (secs.frost && secs.frost.root.isConnected) renderFail(secs.frost);
      });
    }

    /* 3) وحدات النمو الزراعي: العظمى والصغرى 1980–2024 لموسم مارس–أكتوبر */
    if (secs.gdd) {
      cached("gdd", id, function () {
        return fetchArchive(place, GDD_FIRST_YEAR + "-01-01", GDD_LAST_YEAR + "-12-31", ["temperature_2m_max", "temperature_2m_min"])
          .then(function (json) { return computeGdd(json.daily || {}); });
      }).then(fill("gdd", renderGdd), fail("gdd"));
    }
  }

  /* تحديث خفيف لقسم الحرارة فقط (تصنيف اليوم) دون إعادة بناء كل الرسوم */
  function refreshHeatOnly(root, place) {
    if (!place) return;
    var secRoot = root.querySelector(".mc-section.mc-heat");
    if (!secRoot) return;
    var body = secRoot.querySelector(".mc-body");
    if (!body) return;
    var fakeSec = { kind: "heat", root: secRoot, body: body };
    var id = placeId(place);
    cached("heat", id, function () {
      return fetchArchive(place, HEAT_FIRST_YEAR + "-01-01", HEAT_LAST_YEAR + "-12-31", ["temperature_2m_max", "temperature_2m_min"])
        .then(function (json) { return computeHeatFrost(json.daily || {}); });
    }).then(function (stats) {
      if (secRoot.isConnected) renderHeat(fakeSec, stats);
    }, function () { /* صمت: القسم يبقى على آخر حالة صالحة */ });
  }

  /* البناء في كل عناصر data-matar-climate — مع حارس توقيع يمنع إعادة البناء
     العبثية ما لم يتغيّر الموقع أو اللغة أو الوضع الاقتصادي */
  function scan() {
    var roots = document.querySelectorAll("[data-matar-climate]");
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      var place = getPlace();
      var sig = (place ? placeId(place) : "none") + "|" + (isEco() ? "1" : "0") + "|" + langKey();
      if (root.getAttribute("data-mc-sig") === sig && root.querySelector(".mc-root")) {
        refreshHeatOnly(root, place);
        continue;
      }
      root.setAttribute("data-mc-sig", sig);
      render(root, place);
    }
  }

  /* ══ 16) ربط التنقل — زر #dl-climate وصفحة #page-climate ══ */

  function showClimatePage() {
    var page = document.getElementById("page-climate");
    if (!page) return;
    /* إظهار قسم المناخ وإخفاء باقي أقسام .view (خاصية hidden نفسها
       التي يستخدمها التطبيق — القاعدة العامة [hidden] = display:none !important) */
    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) {
      views[i].hidden = (views[i] !== page);
    }
    /* تحديث aria-current="page" على زر المناخ وإلغاؤه عن البقية */
    var links = document.querySelectorAll(".drawer-link");
    for (var j = 0; j < links.length; j++) {
      if (links[j].id === "dl-climate") links[j].setAttribute("aria-current", "page");
      else links[j].removeAttribute("aria-current");
    }
    try { document.body.dataset.page = "climate"; } catch (e) { /* تجاهل */ }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    scan(); /* ضمان جاهزية المحتوى فور فتح الصفحة */
  }

  function bindNav() {
    var climateBtn = document.getElementById("dl-climate");
    if (!climateBtn) return;

    climateBtn.addEventListener("click", showClimatePage);

    /* النقر على أي زر .drawer-link آخر: إلغاء aria-current عن زر المناخ
       وإخفاء صفحة المناخ (سلوك متماثل مع بقية الصفحات) */
    var links = document.querySelectorAll(".drawer-link");
    for (var i = 0; i < links.length; i++) {
      (function (link) {
        if (link === climateBtn) return;
        link.addEventListener("click", function () {
          climateBtn.removeAttribute("aria-current");
          var page = document.getElementById("page-climate");
          if (page) page.hidden = true;
        });
      })(links[i]);
    }
  }

  /* ══ 17) الأحداث والإقلاع ══ */

  var lastEco = null, lastLang = null;

  function onMatarData() {
    lastEco = isEco();
    lastLang = langKey();
    scan(); /* موقع جديد أو بيانات جديدة → إعادة البناء التلقائية */
  }

  /* مراقبة تبديل اللغة أو الوضع الاقتصادي على <html> لإعادة البناء
     باللسان/الوضع الجديد — بلا أي إعادة بناء عبثية عند تغيّر أصناف أخرى */
  function watchDocument() {
    if (typeof MutationObserver !== "function") return;
    var mo = new MutationObserver(function () {
      var e = isEco(), l = langKey();
      if (e !== lastEco || l !== lastLang) {
        lastEco = e;
        lastLang = l;
        scan();
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "class"] });
  }

  function boot() {
    lastEco = isEco();
    lastLang = langKey();
    bindNav();
    /* تهيئة كسولة بعد إقلاع التطبيق (نفس نهج v49) كي لا تنافس الجلب الأولي —
       وفتح الصفحة قبل انقضاء المهلة يستدعي scan() فورًا من showClimatePage */
    setTimeout(scan, 900);
    document.addEventListener("matar:data", onMatarData);
    watchDocument();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ══ 18) الواجهة العامة على window ══ */

  window.MatarClimate = {
    version: "73",
    /* إعادة البناء في كل عناصر data-matar-climate */
    render: scan,
    /* إعادة بناء كاملة متجاهلة حارس التوقيع (الكاش يبقى مستخدمًا) */
    refresh: function () {
      var roots = document.querySelectorAll("[data-matar-climate]");
      for (var i = 0; i < roots.length; i++) roots[i].removeAttribute("data-mc-sig");
      scan();
    },
    /* مسح كل مفاتيح كاش المناخ (matar:climate:v73:*) مع إعادة بناء اختيارية */
    clearCache: function (rescan) {
      try {
        var kill = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(CACHE_PREFIX) === 0) kill.push(k);
        }
        for (var j = 0; j < kill.length; j++) localStorage.removeItem(kill[j]);
      } catch (e) { /* تجاهل */ }
      if (rescan && window.MatarClimate) window.MatarClimate.refresh();
    }
  };

})();
