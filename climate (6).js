/* ═══════════════════════════════════════════════════════════════════════════
   مَطَر برو — climate.js · إصدار 74.1 (مرصد التغير المناخي العربي 1950–2050 · المرحلة 3)
   ─────────────────────────────────────────────────────────────────────────
   سبع قراءات تحليلية تُبنى تلقائيًا داخل أي عنصر يحمل السمة data-matar-climate
   (القيمة "all" أو "hist" لكل القراءات، أو قائمة مفاتيح مفصولة بفواصل:
    stripes,heat,gdd,frost,rate,spei,sea — بترتيب العرض حسب المواصفة دائمًا،
    والقيمة "2050" تحمل حاوية محاكي المرحلة الثالثة كما في القسم (ب) أدناه):

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
     5) City Warming Rate (هل مدينتك تسخن أسرع؟)
        انحدار خطي على المتوسطات السنوية 1950–2024 (من ناتج الميزة الأولى
        نفسها — بلا طلب شبكة جديد) مضروبًا في 10 → معدل الموقع لكل عقد
        (°م/عقد) في مخطط ثلاثة أشرطة حول محور الصفر مع المرجعين العالمي
        +0.18 والإقليمي MENA +0.26 (°م/عقد)، وسطر المقارنة الشاملة في
        سطر واحد + شارة أسرع/أبطأ/معاكس وثبات الاتجاه R².
     6) SPEI / Water Deficit (مؤشر الجفاف التراكمي 1980–2024)
        مجموع الأمطار اليومية مطروحًا منه التبخر-نتح المرجعي FAO-56
        (precipitation_sum − et0_fao_evapotranspiration) لكل سنة → أعمدة
        SVG ثنائية اللون (أزرق للسنوات الرطبة · برتقالي←أحمر حسب شدة
        الجفاف) مع خط اتجاه الانحدار وخلاصة التصحّر/الترطّب.
     7) Sea-Level Rise (مؤشر ارتفاع مستوى سطح البحر الساحلي 1950–2050)
        يظهر تلقائيًا للمدن الساحلية فقط — كشف الساحل محليًا بالمسافة إلى
        أقرب قطعة من سلاسل نقاط السواحل (عتبة 50 كم)، ويُحجب للمدن
        الداخلية البعيدة. رسم SVG خطي بالسنتيمتر: الارتفاع التراكمي
        المسجّل (1.4 مم/سنة 1950–1992 ثم 3.3 مم/سنة 1993–2024) حتى 2024
        ثم المسار المتوقع حتى 2050 وفق سيناريو IPCC المختار (AR6).

   (ب) محاكي 2050 (CMIP6) — الحاوية data-matar-climate="2050":
        طلب واحد من climate-api.open-meteo.com/v1/climate للفترة 2025-01-01
        إلى 2050-12-31 بخمسة نماذج (CMCC_CM2_VHR4,FGOALS_f3_H,HiRAM_SIT_HR,
        MRI_AGCM3_2_S,EC_Earth3P_HR) للمتغيرات temperature_2m_mean,
        temperature_2m_max,precipitation_sum — تجميع سنوي في المتصفح
        (متوسط جماعي + الحد الأدنى والأقصى بين النماذج لكل سنة = نطاق
        عدم اليقين) وتخزين الناتج المحسوب في localStorage بادئة
        matar:climate:v74:2050: لمدة 30 يومًا. أزرار السيناريوهات
        .climate-ssp[data-ssp] (SSP1-2.6 = 0.55× · SSP2-4.5 = 0.78× ·
        SSP5-8.5 = 1.00× وفق IPCC AR6) تحدّث aria-pressed وتعيد رسم
        البطاقات الثلاث ومنحنى 2025–2050 ومؤشر البحر والمستشار فورًا
        محليًا بلا أي طلب شبكة جديد. ثلاث بطاقات مقارنةً بخط الأساس
        1981–2010 (ارتفاع الحرارة، الأيام فوق 40°م، وتغيّر الهطول ±٪)،
        ومنحنى SVG خطي تفاعلي بتظليل Min/Max يتلوّن بالسيناريو، مع
        التصدير في window.__MATAR_CLIMATE_STATE.sim2050 — وفي الوضع
        الاقتصادي رسالة أنيقة توقف المحاكاة لتوفير البيانات.

   (ج) المستشار الاستراتيجي للمناخ — بطاقة #climate-advisor-card:
        يملأ #climate-adv-agri و#climate-adv-city و#climate-adv-infra تلقائيًا
        بدمج نواتج السجل التاريخي مع نتائج سيناريو 2050 المختار بلغة
        الواجهة النشطة (سبع لغات)، مع زر «صياغة أخرى» (#climate-ai-refresh)
        يديّر ثلاث صياغات غنية بالأرقام، وزر «مشاركة» (#climate-ai-share)
        ينسخ التوصيات الثلاث ويشاركها عبر navigator.share أو الحافظة.

   v74.1 (إصلاحات الجلب والمصداقية — فوق إصدار 74 نفسه وبكاشه المتوافق):
     ① طلب الأرشيف الموحّد الواحد: كانت القراءات تطلق 4 طلبات متزامنة
        متداخلة النطاقات إلى archive-api.open-meteo.com (شرائط 1950–2024 ·
        حرارة/صقيع 2015–2024 · نمو 1980–2024 · جفاف 1980–2024) فتُحظر بحد
        المعدل 429 وتتعطل قراءة ERA5 وتعلق أقسام GDD وSPEI — الآن طلب
        واحد فقط (1950-01-01 → 2024-12-31) يجلب المتغيرات الخمسة معًا
        ويُوزَّع من الذاكرة على كل الدوال (الشرائط · المعدل · الحرارة ·
        الصقيع · GDD · SPEI · خطوط أساس المحاكي).
     ② فك الارتباط بالوضع الاقتصادي: بيانات السجل الأساسية تُحسب دائمًا.
     ③ فحص أمان الكاش: البيانات التالفة/الفارغة في localStorage تُمحى
        فورًا ويُعاد جلبها نظيفة في الحال.

   الشروط التشغيلية المُنفَّذة حرفيًا:
     • IIFE نظيفة بلا أي مكتبات خارجية — كل الرسم بـ createElementNS.
     • كاش localStorage بادئته "matar:climate:v74:" وصلاحية 30 يومًا (تُنقّى مفاتيح v73 القديمة عند الإقلاع)
       (تُخزَّن النواتج المحسوبة الصغيرة — لا حمولات الشبكة الخام).
     • v74.1: الوضع الاقتصادي (matar:eco === "1" أو html.eco — المفعّل
       يدويًا حصرًا) يوقف محاكي 2050 والمستشار الاستراتيجي برسائل أنيقة —
       أما قراءات السجل التاريخي السبع (الشرائط والحرارة والنمو والصقيع
       والمعدل والجفاف والبحر) فتُحسب وتُعرض دائمًا من طلب الأرشيف الموحّد
       الواحد ولا يتوقف بسببها GDD أو SPEI أبدًا. صنف html.low-end للأجهزة
       المتوسطة (تخفيف الظلال والأنيميشن فقط) لا يوقف شيئًا منها.
     • التحديث التلقائي عند حدث "matar:data" (تغيّر الموقع أو البيانات)
       + مراقبة تبديل اللغة/الوضع الاقتصادي لإعادة البناء باللسان الجديد.
     • ربط النقر على #dl-climate: إظهار #page-climate وإخفاء باقي أقسام
       .view وتحديث aria-current="page" (مع إلغائها عن #dl-climate عند
       النقر على أي زر .drawer-link آخر) — عبر خاصية hidden نفسها التي
       يستخدمها التطبيق (القاعدة العامة [hidden] = display:none !important).
     • شريط التبويبات المنزلق #climate-seg (السجل التاريخي · محاكي 2050 ·
       خرائط الأرض): تحديث aria-selected، إزاحة الإبهام .seg-thumb بسلاسة
       (قياس فيزيائي getBoundingClientRect ← inset-inline-start فيعمل في
       RTL وLTR معًا)، إظهار اللوحة المطابقة #climate-pane-* وإخفاء البقية،
       واستدعاء window.MatarClimateMap.init()/resize() عند فتح تبويب
       الخرائط إن وُجدا (يُبنى في المرحلة الرابعة).
     • تصدير الحالة window.__MATAR_CLIMATE_STATE — كائن حي يُحدَّث مع كل
       ناتج محسوب (hist لكل القراءات + sim2050 للمحاكي) ليقرأه المستشار
       الاستراتيجي ومرحلة الخرائط الرابعة بلا أي طلب شبكة إضافي.
     • تصدير window.MatarClimate { version, render, refresh, clearCache,
       setScenario, scenario }.
     • دعم RTL كامل: خصائص CSS منطقية، وقواميس سبع لغات تُقرأ من
       document.documentElement.lang، والمحاور الزمنية للرسوم LTR ثابتة.
     • textContent حصريًا مع كل بيانات الشبكة — بلا eval ولا new Function
       ولا innerHTML إطلاقًا (متوافق مع CSP الصارمة بلا unsafe-inline).
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {

  /* ══ 1) ثوابت عامة ══ */

  var SVG_NS = "http://www.w3.org/2000/svg";
  var CACHE_PREFIX = "matar:climate:v74:";
  var CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; /* 30 يومًا */
  var ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/archive";
  var FETCH_TIMEOUT_MS = 25000;

  /* ══ v74.1 — طلب الأرشيف الموحّد الواحد ══
     نطاق واحد (1950-01-01 → 2024-12-31) بخمسة متغيرات يومية معًا — بديل
     الطلبات الأربعة المتزامنة القديمة التي كانت تُحظر بحد المعدل 429 */
  var ARCHIVE_START = "1950-01-01", ARCHIVE_END = "2024-12-31";
  var ARCHIVE_VARS = [
    "temperature_2m_mean", "temperature_2m_max", "temperature_2m_min",
    "precipitation_sum", "et0_fao_evapotranspiration"
  ];

  var FEATURE_ORDER = ["stripes", "heat", "gdd", "frost", "rate", "spei", "sea"];
  var STRIPES_FIRST_YEAR = 1950, STRIPES_LAST_YEAR = 2024;
  var HEAT_FIRST_YEAR = 2015, HEAT_LAST_YEAR = 2024;
  var GDD_FIRST_YEAR = 1980, GDD_LAST_YEAR = 2024;
  var GDD_BASE_TEMP = 10; /* درجة الأساس لوحدات النمو */
  var BASELINE_FIRST = 1981, BASELINE_LAST = 2010; /* مرجع شرائط الاحترار */
  var GLOBAL_WARMING_PER_DECADE = 0.18; /* المرجع العالمي للاحتلال الحراري لكل عقد (°م/عقد) */
  var SPEI_FIRST_YEAR = 1980, SPEI_LAST_YEAR = 2024; /* نطاق مؤشر الجفاف P − ET0 */

  /* ══ 1-b) ثوابت المرحلة الثالثة: MENA + محاكي 2050 + البحر الساحلي ══ */

  var MENA_WARMING_PER_DECADE = 0.26; /* المرجع الإقليمي MENA للاحترار لكل عقد (°م/عقد) */

  var CLIMATE_BASE = "https://climate-api.open-meteo.com/v1/climate";
  var CLIMATE_MODELS = ["CMCC_CM2_VHR4", "FGOALS_f3_H", "HiRAM_SIT_HR", "MRI_AGCM3_2_S", "EC_Earth3P_HR"];
  var CLIMATE_FETCH_TIMEOUT_MS = 40000; /* طلب المحاكي ضخم (26 سنة × 5 نماذج) */
  var SIM_FIRST_YEAR = 2025, SIM_LAST_YEAR = 2050;
  var HOT_THRESHOLD = 40; /* عتبة الأيام شديدة الحرارة (°م) */
  var HOT_GRID_MIN = 36, HOT_GRID_MAX = 46; /* شبكة عتبات العدّ لإزاحة عتبة السيناريو */

  /* معاملات تحجيم IPCC AR6 لفرق الحرارة عن خط الأساس (1981–2010) */
  var SSP_KEYS = ["ssp126", "ssp245", "ssp585"];
  var SSP_FACTORS = { ssp126: 0.55, ssp245: 0.78, ssp585: 1.0 };
  var SSP_DEFAULT = "ssp245";
  var SSP_STORE_KEY = "matar:climate:ssp"; /* تذكّر السيناريو المختار بين الجلسات */
  /* ألوان السيناريوهات من توكنز التطبيق نفسها (أخضر --ok · ذهبي --gold · أحمر --danger) */
  var SSP_COLORS = { ssp126: "#17663a", ssp245: "#d9935b", ssp585: "#ab342e" };

  /* معدلات ارتفاع مستوى سطح البحر (مم/سنة) — مسارات AR6 الوسيطة 2025–2050
     والتسجيل التاريخي: 1.4 مم/سنة (1950–1992) ثم 3.3 مم/سنة (1993–2024) */
  var SEA_OLD_RATE_MM = 1.4, SEA_SAT_RATE_MM = 3.3;
  var SEA_PROJ_RATE_MM = { ssp126: 4.0, ssp245: 5.2, ssp585: 6.9 };
  var COASTAL_KM = 50; /* عتبة اعتبار الموقع ساحليًا (مسافة إلى أقرب ساحل — سلوك محافظ) */

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
      eco_note: "الوضع الاقتصادي مفعّل: محاكي 2050 والمستشار الاستراتيجي متوقفان لتوفير البيانات — كل قراءات السجل التاريخي (شرائط الاحترار وGDD وSPEI وسائرها) تعمل كالمعتاد من طلب الأرشيف الموحد الواحد.",
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
      cap_frost_none: "لم تُسجَّل أي ليلة تحت 0°م في هذا الموقع بين 2015 و2024 — مناخ خالٍ من الصقيع",
      rate_title: "هل مدينتك تسخن أسرع؟",
      rate_sub: "معدل احترار موقعك لكل عقد (°م/عقد) من 1950–2024 مقابل المعدل العالمي المرجعي +0.18°م/عقد",
      rate_aria: "مقارنة معدل احترار الموقع بالمعدل العالمي المرجعي لكل عقد",
      rate_unit: "°م/عقد",
      rate_city: "موقعك",
      rate_global: "المتوسط العالمي",
      rate_method: "الطريقة: انحدار خطي على المتوسطات السنوية 1950–2024 من أرشيف ERA5 مضروبًا في 10 لكل عقد، مقارنةً بالمرجع العالمي +0.18°م/عقد.",
      badge_rate_fast: "تسخن أسرع من المتوسط العالمي",
      badge_rate_slow: "تسخن أبطأ من المتوسط العالمي",
      badge_rate_cooling: "تبريد محلي معاكس للاحترار العالمي",
      badge_rate_par: "قريبة من المتوسط العالمي",
      cap_rate_fast: "هذا الموقع يسخن بمعدل {v}°م/عقد — أي {g}× سرعة المتوسط العالمي (+0.18°م/عقد)",
      cap_rate_slow: "هذا الموقع يسخن بمعدل {v}°م/عقد — أي {p}٪ فقط من سرعة المتوسط العالمي (+0.18°م/عقد)",
      cap_rate_cooling: "هذا الموقع يبرد بمعدل {v}°م/عقد — اتجاه محلي معاكس للاحترار العالمي",
      cap_rate_par: "هذا الموقع يسخن بمعدل {v}°م/عقد — قريب من المتوسط العالمي (+0.18°م/عقد)",
      r2_note: "ثبات الاتجاه (R²): {v}",
      spei_title: "مؤشر الجفاف التراكمي (SPEI / عجز الماء)",
      spei_sub: "الفرق السنوي بين الأمطار والتبخر-نتح المرجعي (P − ET0) من 1980 إلى 2024 — أزرق للسنوات الرطبة وبرتقالي/أحمر للسنوات الجافة",
      spei_aria: "أعمدة العجز والفائض المائي السنوي من 1980 إلى 2024 مع خط الاتجاه",
      spei_wet: "رطب (فائض ماء)",
      spei_dry: "جاف (عجز ماء)",
      spei_method: "الطريقة: مجموع الأمطار اليومية (P) مطروحًا منه التبخر-نتح المرجعي (ET0) لكل سنة من أرشيف ERA5 — القيم السالبة تعني سحبًا صافيًا للرطوبة من التربة.",
      cap_spei_drying: "اتجاه نحو الجفاف: العجز المائي يزداد بمقدار {v} مم/عقد — من متوسط {a} مم/سنة في 1980–1989 إلى {b} في 2015–2024",
      cap_spei_wetting: "اتجاه نحو الرطوبة: الفائض المائي يزداد بمقدار {v} مم/عقد — من متوسط {a} مم/سنة في 1980–1989 إلى {b} في 2015–2024",
      cap_spei_stable: "لا اتجاه واضح: التغيّر {v} مم/عقد فقط — من متوسط {a} مم/سنة في 1980–1989 إلى {b} في 2015–2024",
      /* ══ المرحلة 3 — معدل الاحترار: المقارنة الشاملة بسطر واحد (الموقع · MENA · العالم) ══ */
      rate_mena: "متوسط MENA الإقليمي",
      rate_line: "موقعك {a}°م/عقد · إقليمي MENA {b}°م/عقد · عالمي {c}°م/عقد",
      /* ══ المرحلة 3 — القراءة 7: مؤشر ارتفاع مستوى سطح البحر الساحلي ══ */
      sea_title: "مؤشر ارتفاع مستوى سطح البحر الساحلي 1950–2050",
      sea_sub: "الارتفاع التراكمي المسجّل حتى 2024 والمسار المتوقع حتى 2050 (سم) وفق سيناريو IPCC المختار — يظهر للمدن الساحلية فقط",
      sea_aria: "منحنى ارتفاع مستوى سطح البحر من 1950 إلى 2050: الجزء المسجّل حتى 2024 والمسار المتوقع حتى 2050 بالسنتيمتر",
      sea_recorded: "المسجّل (1950–2024)",
      sea_projected: "المتوقع (2025–2050)",
      sea_cm: "سم",
      sea_cap: "ارتفع المستوى المسجّل نحو {a} سم منذ 1950، ووفق سيناريو {s} يُتوقع بلوغ نحو {b} سم بحلول 2050 (+{d} سم إضافية عن 2024).",
      sea_method: "المصدر: مسار المستوى العالمي الوسيط لتقرير IPCC AR6 — معدلات مسجّلة 1.4 مم/سنة (1950–1992) و3.3 مم/سنة (1993–2024) ثم معدل السيناريو المختار حتى 2050.",
      /* ══ المرحلة 3 — محاكي 2050 (CMIP6) ══ */
      sim_title: "محاكي 2050 — متوسط خمسة نماذج CMIP6",
      sim_sub: "توقعات 2025–2050 مجمّعة سنويًا من خمسة نماذج CMIP6 عالية الدقة، مع تحجيم الفرق عن خط الأساس بمعاملات IPCC AR6 للسيناريو المختار",
      sim_aria: "منحنى الحرارة السنوي المتوقع من 2025 إلى 2050 مع نطاق عدم اليقين بين النماذج",
      sim_eco: "الوضع الاقتصادي مفعّل: محاكاة 2050 (CMIP6) متوقفة لتوفير البيانات — عطّل الوضع الاقتصادي لعرض السيناريوهات ومنحنى 2025–2050.",
      sim_loading: "نجهّز محاكاة 2050 (خمسة نماذج CMIP6 عبر واجهة المناخ)…",
      sim_error: "تعذّر جلب توقعات CMIP6 من واجهة Open-Meteo المناخية — تحقّق من اتصالك ثم أعد المحاولة.",
      card1_t: "ارتفاع الحرارة في 2050",
      card1_s: "مقارنةً بخط الأساس 1981–2010",
      card2_t: "أيام الحر الشديد (فوق 40°م) في 2050",
      card2_s: "سنويًا مقابل {v} يومًا في خط الأساس 1981–2010",
      card3_t: "تغيّر الهطول السنوي في 2050",
      card3_s: "نسبةً إلى متوسط 1981–2010",
      curve_band: "نطاق عدم اليقين (Min–Max بين النماذج)",
      curve_baseline: "خط الأساس 1981–2010",
      sim_method: "الطريقة: طلب واحد لخمسة نماذج (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) وتجميعها سنويًا داخل متصفحك (متوسط جماعي + الحد الأدنى والأقصى بين النماذج)، ثم تحجيم فرق الحرارة عن خط الأساس بمعامل السيناريو المختار (0.55 / 0.78 / 1.00 وفق AR6).",
      sim_src: "المصدر: Open-Meteo Climate API (CMIP6) — تُخزَّن النواتج السنوية على جهازك 30 يومًا.",
      ssp_name_126: "SSP1-2.6 المتفائل",
      ssp_name_245: "SSP2-4.5 المتوسط",
      ssp_name_585: "SSP5-8.5 المتشائم",
      /* ══ المرحلة 3 — المستشار الاستراتيجي للمناخ ══ */
      adv_wait: "يقرأ السجل التاريخي ونتائج سيناريو 2050 لتجهيز التوصيات…",
      adv_eco: "الوضع الاقتصادي مفعّل — التوصيات الاستراتيجية تحتاج بيانات السجل التاريخي ومحاكاة 2050.",
      adv_sea: " مع نحو {s} سم من ارتفاع مستوى البحر",
      adv_agri_0: "الزراعة والمياه: موقعك يسخن بمعدل {r}°م/عقد، ووفق سيناريو {ssp} يُتوقع +{w}°م مع {h} يومًا فوق 40°م سنويًا بحلول 2050 — قدّم مواعيد البذر والري نحو الربيع، واعتمد التنقيط وغطِّ التربة لتقليل الفاقد.",
      adv_agri_1: "الزراعة والمياه: وحدات النمو الزراعية تغيّرت {g} وحدة منذ الثمانينيات ومؤشر الجفاف {d} مم/عقد — اعتمد أصنافًا متحمّلة للحرارة والملوحة، واجمع مياه الأمطار الشتوية لتعويض تغيّر الهطول {p} بحلول 2050.",
      adv_agri_2: "الزراعة والمياه: خطة 2050 — {h} يومًا/سنة فوق 40°م تستدعي زراعة محمية ومبكرة، مع مراقبة رطوبة التربة أسبوعيًا ومرونة كاملة في جدولة الري مقابل تغيّر الأمطار {p}.",
      adv_city_0: "المدن والسكان: مع +{w}°م في 2050 ({ssp}){sea} — كثّف الظل الحضري وممرات التهوية والأسطح العاكسة، وفعّل بروتوكولات التبريد المجتمعية لكبار السن والأحياء الكثيفة.",
      adv_city_1: "المدن والسكان: أيام الحر الشديد قد تبلغ {h} يومًا سنويًا في 2050 مقابل {hb} في خط الأساس — حدّث خرائط الإجهاد الحراري الحضري، ورتّب العمل الخارجي فجرًا ومساءً، وجهّز مراكز تبريد متنقلة.",
      adv_city_2: "المدن والسكان: تغيّر الأمطار {p} وإجهاد حراري متصاعد يفرضان تحديث شبكات الصرف وتشجير الشوارع — ادمج تبريد الأحياء في كل تصميم عمراني جديد.",
      adv_infra_0: "البنية التحتية: إجهاد حراري متزايد (+{w}°م في 2050 وفق {ssp}) يعني تمددًا حراريًا أوسع — راجع فواصل الجسور والسكك ومواصفات الأسفلت، وارفع سعة تبريد محطات الطاقة والمراكز الحيوية.",
      adv_infra_1: "البنية التحتية: {h} يومًا/سنة فوق 40°م يرفع حمل تبريد الصناعة ومراكز البيانات — وخذ تغيّر الهطول {p} في حسابات التصريف والسدود، وثبّت شبكات الكهرباء ضد العواصف الغبارية المصاحبة للجفاف ({d} مم/عقد).",
      adv_infra_2: "البنية التحتية: صمّم بمعامل أمان مناخي حتى 2050{sea} — قواعد أعمق للمنشآت الساحلية، وتظليل منهجي للطرق السريعة، وخطط صيانة صيفية مكثفة لأصول الطاقة والمياه.",
      adv_share_header: "مرصد التغير المناخي (1950–2050) — مَطَر برو",
      adv_share_sub: "توصيات استراتيجية للمناخ · {v} · سيناريو {s} (2050)",
      adv_share_ok: "تمت المشاركة بنجاح",
      adv_share_copy: "نُسخت التوصيات الثلاث إلى الحافظة",
      adv_share_fail: "تعذّرت المشاركة — انسخ التوصيات يدويًا من البطاقة",
      adv_note: "توصيات تلقائية تُولَّد محليًا على جهازك من سجل ERA5 ونتائج CMIP6 — استرشادية ولا تُغني عن الجهات الرسمية.",
    },

    en: {
      deg: "°C",
      place: "Location: {v}",
      no_place: "Pick a location first — the climate analysis appears automatically once a place is selected.",
      eco_note: "Economy mode is on: the 2050 simulator and the strategic advisor are paused to save data — all historical readings (warming stripes, GDD, SPEI and the rest) keep working from one shared archive request.",
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
      cap_frost_none: "No night fell below 0°C at this location between 2015 and 2024 — a frost-free climate",
      rate_title: "Is your city warming faster?",
      rate_sub: "Your location's warming rate per decade (°C/decade) for 1950–2024 against the global reference rate of +0.18°C/decade",
      rate_aria: "Comparison of the location's warming rate with the global reference rate per decade",
      rate_unit: "°C/decade",
      rate_city: "Your location",
      rate_global: "Global average",
      rate_method: "Method: linear regression over the 1950–2024 annual means from the ERA5 archive, multiplied by 10 per decade, compared with the +0.18°C/decade global reference.",
      badge_rate_fast: "Warming faster than the global average",
      badge_rate_slow: "Warming slower than the global average",
      badge_rate_cooling: "Local cooling against global warming",
      badge_rate_par: "Close to the global average",
      cap_rate_fast: "This location is warming at {v}°C/decade — {g}× the global average pace (+0.18°C/decade)",
      cap_rate_slow: "This location is warming at {v}°C/decade — only {p}% of the global average pace (+0.18°C/decade)",
      cap_rate_cooling: "This location is cooling at {v}°C/decade — a local trend opposite to global warming",
      cap_rate_par: "This location is warming at {v}°C/decade — close to the global average (+0.18°C/decade)",
      r2_note: "Trend consistency (R²): {v}",
      spei_title: "Cumulative Drought Index (SPEI / Water Deficit)",
      spei_sub: "The yearly difference between precipitation and reference evapotranspiration (P − ET0) from 1980 to 2024 — blue for wet years, orange/red for dry ones",
      spei_aria: "Yearly water-deficit and surplus bars from 1980 to 2024 with the trend line",
      spei_wet: "Wet (water surplus)",
      spei_dry: "Dry (water deficit)",
      spei_method: "Method: yearly total precipitation (P) minus reference evapotranspiration (ET0) from the ERA5 archive — negative values mean a net moisture draw from the soil.",
      cap_spei_drying: "A drying trend: the water deficit grows by {v} mm/decade — from an average of {a} mm/year in 1980–1989 to {b} in 2015–2024",
      cap_spei_wetting: "A wetting trend: the water surplus grows by {v} mm/decade — from an average of {a} mm/year in 1980–1989 to {b} in 2015–2024",
      cap_spei_stable: "No clear trend: the change is only {v} mm/decade — from an average of {a} mm/year in 1980–1989 to {b} in 2015–2024",
      /* ══ Phase 3 — warming rate: the single-line full comparison (site · MENA · global) ══ */
      rate_mena: "MENA regional average",
      rate_line: "Your site {a}°C/decade · MENA regional {b}°C/decade · Global {c}°C/decade",
      /* ══ Phase 3 — reading 7: coastal sea-level rise indicator ══ */
      sea_title: "Coastal Sea-Level Rise Indicator 1950–2050",
      sea_sub: "Cumulative recorded rise to 2024 and the projected path to 2050 (cm) under the selected IPCC scenario — shown for coastal cities only",
      sea_aria: "Sea-level rise curve from 1950 to 2050: the recorded part to 2024 and the projected path to 2050 in centimetres",
      sea_recorded: "Recorded (1950–2024)",
      sea_projected: "Projected (2025–2050)",
      sea_cm: "cm",
      sea_cap: "The recorded level has risen about {a} cm since 1950, and under {s} it is expected to reach about {b} cm by 2050 (+{d} cm above 2024).",
      sea_method: "Source: IPCC AR6 mid global mean sea-level path — recorded rates of 1.4 mm/yr (1950–1992) and 3.3 mm/yr (1993–2024), then the selected-scenario rate to 2050.",
      /* ══ Phase 3 — 2050 simulator (CMIP6) ══ */
      sim_title: "2050 Simulator — 5-model CMIP6 ensemble",
      sim_sub: "2025–2050 projections aggregated yearly from five high-resolution CMIP6 models, with the anomaly over the baseline scaled by the selected IPCC AR6 factor",
      sim_aria: "Projected annual temperature curve 2025–2050 with the model uncertainty range",
      sim_eco: "Economy mode is on: the 2050 CMIP6 simulation is paused to save data — turn economy mode off to view the scenarios and the 2025–2050 curve.",
      sim_loading: "Preparing the 2050 simulation (five CMIP6 models via the climate API)…",
      sim_error: "Could not fetch the CMIP6 projections from the Open-Meteo climate API — check your connection and try again.",
      card1_t: "Warming in 2050",
      card1_s: "Against the 1981–2010 baseline",
      card2_t: "Extreme heat days (above 40°C) in 2050",
      card2_s: "Per year versus {v} days in the 1981–2010 baseline",
      card3_t: "Annual precipitation change in 2050",
      card3_s: "Relative to the 1981–2010 average",
      curve_band: "Uncertainty range (min–max across models)",
      curve_baseline: "1981–2010 baseline",
      sim_method: "Method: one request for five models (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) aggregated yearly in your browser (ensemble mean + the min and max across models), then the temperature anomaly over the baseline is scaled by the scenario factor (0.55 / 0.78 / 1.00 per AR6).",
      sim_src: "Source: Open-Meteo Climate API (CMIP6) — yearly outputs are stored on your device for 30 days.",
      ssp_name_126: "SSP1-2.6 (optimistic)",
      ssp_name_245: "SSP2-4.5 (medium)",
      ssp_name_585: "SSP5-8.5 (pessimistic)",
      /* ══ Phase 3 — strategic climate advisor ══ */
      adv_wait: "Reading the historical record and the 2050 scenario results to prepare the recommendations…",
      adv_eco: "Economy mode is on — strategic recommendations need the historical record and the 2050 simulation.",
      adv_sea: " with about {s} cm of sea-level rise",
      adv_agri_0: "Agriculture & water: your site is warming at {r}°C/decade; under {ssp} about +{w}°C with {h} days above 40°C per year are expected by 2050 — shift sowing and irrigation toward spring, adopt drip irrigation and mulch to cut losses.",
      adv_agri_1: "Agriculture & water: growing degree days have changed by {g} units since the 1980s and the drought index moves {d} mm/decade — choose heat- and salt-tolerant varieties and harvest winter rain to offset the {p} precipitation shift by 2050.",
      adv_agri_2: "Agriculture & water: the 2050 plan — {h} days/year above 40°C call for protected and early-season cropping, weekly soil-moisture monitoring and fully flexible irrigation scheduling against a {p} rainfall shift.",
      adv_city_0: "Cities & people: with +{w}°C in 2050 ({ssp}){sea} — densify urban shade and ventilation corridors, spread reflective roofs, and activate community cooling protocols for the elderly and dense districts.",
      adv_city_1: "Cities & people: extreme heat days may reach {h} a year by 2050 versus {hb} in the baseline — update urban heat-stress maps, schedule outdoor work for dawn and evening, and prepare mobile cooling centres.",
      adv_city_2: "Cities & people: a {p} rainfall shift and rising heat stress demand upgraded drainage and street trees — embed neighbourhood cooling in every new urban design.",
      adv_infra_0: "Infrastructure: growing heat stress (+{w}°C in 2050 under {ssp}) means wider thermal expansion — re-check bridge and rail expansion joints and asphalt specs, and raise cooling capacity at power plants and critical facilities.",
      adv_infra_1: "Infrastructure: {h} days/year above 40°C raise industrial and data-centre cooling loads — fold the {p} precipitation shift into drainage and dam calculations, and harden power grids against the dust storms that accompany drought ({d} mm/decade).",
      adv_infra_2: "Infrastructure: design with a climate-safety margin to 2050{sea} — deeper foundations for coastal structures, systematic shading for expressways, and intensive summer maintenance for energy and water assets.",
      adv_share_header: "Climate Change Observatory (1950–2050) — Matar Pro",
      adv_share_sub: "Strategic climate recommendations · {v} · {s} scenario (2050)",
      adv_share_ok: "Shared successfully",
      adv_share_copy: "The three recommendations were copied to the clipboard",
      adv_share_fail: "Sharing failed — copy the recommendations manually from the card",
      adv_note: "Automatic recommendations generated locally on your device from the ERA5 record and CMIP6 outputs — advisory only.",
    },

    fr: {
      deg: "°C",
      place: "Localisation : {v}",
      no_place: "Choisissez d'abord un lieu — l'analyse climatique apparaîtra automatiquement.",
      eco_note: "Mode économique activé : le simulateur 2050 et le conseiller stratégique sont en pause pour économiser les données — toutes les lectures historiques (bandes, GDD, SPEI et le reste) continuent via une seule requête d'archive partagée.",
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
      cap_frost_none: "Aucune nuit sous 0°C en ce lieu entre 2015 et 2024 — climat sans gel",
      rate_title: "Votre ville se réchauffe-t-elle plus vite ?",
      rate_sub: "Le rythme de réchauffement de votre lieu par décennie (°C/décennie) sur 1950–2024 face à la référence mondiale de +0,18 °C/décennie",
      rate_aria: "Comparaison du rythme de réchauffement du lieu avec la référence mondiale par décennie",
      rate_unit: "°C/décennie",
      rate_city: "Votre lieu",
      rate_global: "Moyenne mondiale",
      rate_method: "Méthode : régression linéaire sur les moyennes annuelles 1950–2024 de l'archive ERA5, multipliée par 10 par décennie, comparée à la référence mondiale +0,18 °C/décennie.",
      badge_rate_fast: "Se réchauffe plus vite que la moyenne mondiale",
      badge_rate_slow: "Se réchauffe moins vite que la moyenne mondiale",
      badge_rate_cooling: "Refroidissement local contraire au réchauffement mondial",
      badge_rate_par: "Proche de la moyenne mondiale",
      cap_rate_fast: "Ce lieu se réchauffe de {v} °C/décennie — soit {g}× le rythme mondial (+0,18 °C/décennie)",
      cap_rate_slow: "Ce lieu se réchauffe de {v} °C/décennie — soit seulement {p} % du rythme mondial (+0,18 °C/décennie)",
      cap_rate_cooling: "Ce lieu se refroidit de {v} °C/décennie — une tendance locale opposée au réchauffement mondial",
      cap_rate_par: "Ce lieu se réchauffe de {v} °C/décennie — proche de la moyenne mondiale (+0,18 °C/décennie)",
      r2_note: "Fiabilité de la tendance (R²) : {v}",
      spei_title: "Indice de sécheresse cumulé (SPEI / déficit d'eau)",
      spei_sub: "La différence annuelle entre précipitations et évapotranspiration de référence (P − ET0) de 1980 à 2024 — bleu pour les années humides, orange/rouge pour les sèches",
      spei_aria: "Barres annuelles de déficit et d'excédent hydrique de 1980 à 2024 avec la droite de tendance",
      spei_wet: "Humide (excédent d'eau)",
      spei_dry: "Sec (déficit d'eau)",
      spei_method: "Méthode : total annuel des précipitations (P) moins évapotranspiration de référence (ET0) tiré de l'archive ERA5 — les valeurs négatives signalent un prélèvement net d'humidité du sol.",
      cap_spei_drying: "Tendance au dessèchement : le déficit hydrique croît de {v} mm/décennie — d'une moyenne de {a} mm/an en 1980–1989 à {b} en 2015–2024",
      cap_spei_wetting: "Tendance à l'humidification : l'excédent hydrique croît de {v} mm/décennie — d'une moyenne de {a} mm/an en 1980–1989 à {b} en 2015–2024",
      cap_spei_stable: "Pas de tendance nette : la variation n'est que de {v} mm/décennie — d'une moyenne de {a} mm/an en 1980–1989 à {b} en 2015–2024",
      /* ══ Phase 3 — rythme de réchauffement : comparaison complète en une ligne ══ */
      rate_mena: "Moyenne régionale MENA",
      rate_line: "Votre site {a}°C/décennie · MENA régional {b}°C/décennie · Mondial {c}°C/décennie",
      /* ══ Phase 3 — lecture 7 : indicateur d'élévation du niveau de la mer ══ */
      sea_title: "Indicateur d'élévation du niveau de la mer côtière 1950–2050",
      sea_sub: "Élévation cumulée enregistrée jusqu'en 2024 et trajectoire projetée jusqu'en 2050 (cm) selon le scénario IPCC choisi — affiché pour les villes côtières uniquement",
      sea_aria: "Courbe d'élévation du niveau de la mer de 1950 à 2050 : partie enregistrée jusqu'en 2024 et trajectoire projetée jusqu'en 2050, en centimètres",
      sea_recorded: "Enregistré (1950–2024)",
      sea_projected: "Projeté (2025–2050)",
      sea_cm: "cm",
      sea_cap: "Le niveau enregistré a monté d'environ {a} cm depuis 1950 ; selon {s}, il devrait atteindre environ {b} cm d'ici 2050 (+{d} cm au-dessus de 2024).",
      sea_method: "Source : trajectoire médiane du niveau mondial moyen de la mer (IPCC AR6) — taux enregistrés de 1,4 mm/an (1950–1992) et 3,3 mm/an (1993–2024), puis le taux du scénario choisi jusqu'en 2050.",
      /* ══ Phase 3 — simulateur 2050 (CMIP6) ══ */
      sim_title: "Simulateur 2050 — moyenne de cinq modèles CMIP6",
      sim_sub: "Projections 2025–2050 agrégées par année à partir de cinq modèles CMIP6 haute résolution, l'écart à la référence étant ajusté par le facteur IPCC AR6 du scénario choisi",
      sim_aria: "Courbe de température annuelle projetée 2025–2050 avec la plage d'incertitude entre modèles",
      sim_eco: "Mode économique activé : la simulation CMIP6 2050 est en pause pour économiser les données — désactivez le mode économique pour voir les scénarios et la courbe 2025–2050.",
      sim_loading: "Préparation de la simulation 2050 (cinq modèles CMIP6 via l'API climatique)…",
      sim_error: "Impossible de récupérer les projections CMIP6 depuis l'API climatique Open-Meteo — vérifiez votre connexion puis réessayez.",
      card1_t: "Réchauffement en 2050",
      card1_s: "Par rapport à la référence 1981–2010",
      card2_t: "Jours de chaleur extrême (au-dessus de 40°C) en 2050",
      card2_s: "Par an contre {v} jours de la référence 1981–2010",
      card3_t: "Évolution des précipitations annuelles en 2050",
      card3_s: "Par rapport à la moyenne 1981–2010",
      curve_band: "Plage d'incertitude (min–max entre modèles)",
      curve_baseline: "Référence 1981–2010",
      sim_method: "Méthode : une seule requête pour cinq modèles (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) agrégés par année dans votre navigateur (moyenne d'ensemble + min et max entre modèles), puis l'anomalie de température par rapport à la référence est mise à l'échelle par le facteur du scénario (0,55 / 0,78 / 1,00 selon AR6).",
      sim_src: "Source : Open-Meteo Climate API (CMIP6) — les sorties annuelles sont stockées 30 jours sur votre appareil.",
      ssp_name_126: "SSP1-2.6 (optimiste)",
      ssp_name_245: "SSP2-4.5 (moyen)",
      ssp_name_585: "SSP5-8.5 (pessimiste)",
      /* ══ Phase 3 — conseiller stratégique du climat ══ */
      adv_wait: "Lecture du registre historique et des résultats du scénario 2050 pour préparer les recommandations…",
      adv_eco: "Mode économique activé — les recommandations stratégiques nécessitent le registre historique et la simulation 2050.",
      adv_sea: " avec environ {s} cm d'élévation du niveau de la mer",
      adv_agri_0: "Agriculture et eau : votre site se réchauffe de {r}°C/décennie ; selon {ssp}, environ +{w}°C et {h} jours au-dessus de 40°C par an sont attendus d'ici 2050 — avancez semis et irrigation vers le printemps, adoptez le goutte-à-goutte et le paillage pour réduire les pertes.",
      adv_agri_1: "Agriculture et eau : les degrés-jours de croissance ont varié de {g} unités depuis les années 1980 et l'indice de sécheresse évolue de {d} mm/décennie — choisissez des variétés tolérantes à la chaleur et à la salinité et recueillez la pluie hivernale pour compenser le changement de précipitations de {p} d'ici 2050.",
      adv_agri_2: "Agriculture et eau : le plan 2050 — {h} jours/an au-dessus de 40°C appellent des cultures protégées et précoces, un suivi hebdomadaire de l'humidité du sol et une irrigation flexible face à un changement des pluies de {p}.",
      adv_city_0: "Villes et populations : avec +{w}°C en 2050 ({ssp}){sea} — densifiez l'ombre urbaine et les corridors de ventilation, généralisez les toitures réfléchissantes et activez les protocoles communautaires de rafraîchissement pour les personnes âgées et les quartiers denses.",
      adv_city_1: "Villes et populations : les jours de chaleur extrême pourraient atteindre {h} par an en 2050 contre {hb} pour la référence — actualisez les cartes de stress thermique urbain, programmez le travail extérieur à l'aube et au soir, et préparez des centres de rafraîchissement mobiles.",
      adv_city_2: "Villes et populations : un changement des pluies de {p} et un stress thermique croissant imposent des réseaux de drainage et des arbres urbains modernisés — intégrez le rafraîchissement des quartiers dans chaque nouveau projet urbain.",
      adv_infra_0: "Infrastructures : un stress thermique croissant (+{w}°C en 2050 selon {ssp}) entraîne une dilatation thermique plus large — revoyez les joints de dilatation des ponts et des rails et les enrobés, et augmentez la capacité de refroidissement des centrales et sites critiques.",
      adv_infra_1: "Infrastructures : {h} jours/an au-dessus de 40°C accroissent les charges de refroidissement industriel et des centres de données — intégrez le changement de précipitations de {p} dans les calculs de drainage et de barrages, et renforcez les réseaux électriques contre les tempêtes de poussière liées à la sécheresse ({d} mm/décennie).",
      adv_infra_2: "Infrastructures : concevez avec une marge de sécurité climatique jusqu'en 2050{sea} — fondations plus profondes pour les ouvrages côtiers, ombrage systématique des voies rapides et maintenance estivale intensive des actifs énergie et eau.",
      adv_share_header: "Observatoire du changement climatique (1950–2050) — Matar Pro",
      adv_share_sub: "Recommandations climatiques stratégiques · {v} · scénario {s} (2050)",
      adv_share_ok: "Partage réussi",
      adv_share_copy: "Les trois recommandations ont été copiées dans le presse-papiers",
      adv_share_fail: "Échec du partage — copiez les recommandations manuellement depuis la carte",
      adv_note: "Recommandations automatiques générées localement sur votre appareil à partir du registre ERA5 et des sorties CMIP6 — à titre indicatif.",
    },

    de: {
      deg: "°C",
      place: "Standort: {v}",
      no_place: "Wählen Sie zuerst einen Ort — die Klimaanalyse erscheint dann automatisch.",
      eco_note: "Sparmodus aktiv: der 2050-Simulator und der strategische Berater sind pausiert, um Daten zu sparen — alle historischen Messungen (Streifen, GDD, SPEI usw.) laufen über eine einzige gemeinsame Archiv-Anfrage weiter.",
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
      cap_frost_none: "Zwischen 2015 und 2024 fiel an diesem Ort keine Nacht unter 0°C — frostfreies Klima",
      rate_title: "Erwärmt sich deine Stadt schneller?",
      rate_sub: "Der Erwärmungstrend deines Ortes pro Jahrzehnt (°C/Jahrzehnt) 1950–2024 im Vergleich zur globalen Referenz von +0,18 °C/Jahrzehnt",
      rate_aria: "Vergleich des Erwärmungstempos des Ortes mit der globalen Referenz pro Jahrzehnt",
      rate_unit: "°C/Jahrzehnt",
      rate_city: "Dein Ort",
      rate_global: "Globaler Durchschnitt",
      rate_method: "Methode: lineare Regression über die Jahresmittel 1950–2024 des ERA5-Archivs, mal 10 pro Jahrzehnt, verglichen mit der globalen Referenz +0,18 °C/Jahrzehnt.",
      badge_rate_fast: "Erwärmt sich schneller als der globale Durchschnitt",
      badge_rate_slow: "Erwärmt sich langsamer als der globale Durchschnitt",
      badge_rate_cooling: "Lokale Abkühlung entgegen der globalen Erwärmung",
      badge_rate_par: "Nahe am globalen Durchschnitt",
      cap_rate_fast: "Dieser Ort erwärmt sich mit {v} °C/Jahrzehnt — das {g}× des globalen Tempos (+0,18 °C/Jahrzehnt)",
      cap_rate_slow: "Dieser Ort erwärmt sich mit {v} °C/Jahrzehnt — nur {p} % des globalen Tempos (+0,18 °C/Jahrzehnt)",
      cap_rate_cooling: "Dieser Ort kühlt mit {v} °C/Jahrzehnt ab — ein lokaler Trend entgegen der globalen Erwärmung",
      cap_rate_par: "Dieser Ort erwärmt sich mit {v} °C/Jahrzehnt — nahe am globalen Durchschnitt (+0,18 °C/Jahrzehnt)",
      r2_note: "Verlässlichkeit des Trends (R²): {v}",
      spei_title: "Kumulativer Dürreindex (SPEI / Wasserdefizit)",
      spei_sub: "Die jährliche Differenz zwischen Niederschlag und Referenz-Verdunstung (P − ET0) von 1980 bis 2024 — blau für feuchte, orange/rot für trockene Jahre",
      spei_aria: "Jährliche Balken für Wasserdefizit und -überschuss von 1980 bis 2024 mit Trendlinie",
      spei_wet: "Feucht (Wasserüberschuss)",
      spei_dry: "Trocken (Wasserdefizit)",
      spei_method: "Methode: Jahressumme des Niederschlags (P) minus Referenz-Verdunstung (ET0) aus dem ERA5-Archiv — negative Werte bedeuten einen Netto-Entzug von Bodenfeuchte.",
      cap_spei_drying: "Trend zur Trockenheit: das Wasserdefizit wächst um {v} mm/Jahrzehnt — von im Schnitt {a} mm/Jahr (1980–1989) zu {b} (2015–2024)",
      cap_spei_wetting: "Trend zur Feuchte: der Wasserüberschuss wächst um {v} mm/Jahrzehnt — von im Schnitt {a} mm/Jahr (1980–1989) zu {b} (2015–2024)",
      cap_spei_stable: "Kein klarer Trend: die Änderung beträgt nur {v} mm/Jahrzehnt — von im Schnitt {a} mm/Jahr (1980–1989) zu {b} (2015–2024)",
      /* ══ Phase 3 — Erwärmungstempo: vollständiger Vergleich in einer Zeile ══ */
      rate_mena: "Regionaler MENA-Durchschnitt",
      rate_line: "Dein Standort {a}°C/Jahrzehnt · MENA regional {b}°C/Jahrzehnt · Global {c}°C/Jahrzehnt",
      /* ══ Phase 3 — Lesung 7: Meeresspiegel-Indikator ══ */
      sea_title: "Küsten-Meeresspiegel-Indikator 1950–2050",
      sea_sub: "Kumulierter aufgezeichneter Anstieg bis 2024 und projizierter Pfad bis 2050 (cm) gemäß dem gewählten IPCC-Szenario — nur für Küstenstädte",
      sea_aria: "Meeresspiegel-Kurve von 1950 bis 2050: aufgezeichneter Teil bis 2024 und projizierter Pfad bis 2050 in Zentimetern",
      sea_recorded: "Aufgezeichnet (1950–2024)",
      sea_projected: "Projiziert (2025–2050)",
      sea_cm: "cm",
      sea_cap: "Der aufgezeichnete Spiegel ist seit 1950 um etwa {a} cm gestiegen; gemäß {s} werden bis 2050 etwa {b} cm erwartet (+{d} cm über 2024).",
      sea_method: "Quelle: mittlerer globaler Meeresspiegelpfad des IPCC AR6 — aufgezeichnete Raten von 1,4 mm/Jahr (1950–1992) und 3,3 mm/Jahr (1993–2024), danach die Rate des gewählten Szenarios bis 2050.",
      /* ══ Phase 3 — 2050-Simulator (CMIP6) ══ */
      sim_title: "2050-Simulator — Fünf-Modell-CMIP6-Mittel",
      sim_sub: "2025–2050-Projektionen, jährlich aus fünf hochauflösenden CMIP6-Modellen aggregiert, mit der nach dem gewählten IPCC-AR6-Faktor skalierten Abweichung von der Referenz",
      sim_aria: "Projizierte jährliche Temperaturkurve 2025–2050 mit der Modell-Unsicherheitsband",
      sim_eco: "Sparmodus aktiv: die CMIP6-2050-Simulation ist pausiert, um Daten zu sparen — deaktiviere den Sparmodus, um die Szenarien und die 2025–2050-Kurve zu sehen.",
      sim_loading: "2050-Simulation wird vorbereitet (fünf CMIP6-Modelle über die Klima-API)…",
      sim_error: "CMIP6-Projektionen konnten nicht von der Open-Meteo-Klima-API geladen werden — Verbindung prüfen und erneut versuchen.",
      card1_t: "Erwärmung im Jahr 2050",
      card1_s: "Gegenüber der Referenz 1981–2010",
      card2_t: "Extreme Hitzetage (über 40°C) im Jahr 2050",
      card2_s: "Pro Jahr gegenüber {v} Tagen der Referenz 1981–2010",
      card3_t: "Änderung des Jahresniederschlags 2050",
      card3_s: "Relativ zum Mittel 1981–2010",
      curve_band: "Unsicherheitsband (Min–Max zwischen Modellen)",
      curve_baseline: "Referenz 1981–2010",
      sim_method: "Methode: eine Anfrage für fünf Modelle (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR), im Browser jährlich aggregiert (Ensemble-Mittel + Min und Max zwischen Modellen); danach wird die Temperaturanomalie gegenüber der Referenz mit dem Szenariofaktor skaliert (0,55 / 0,78 / 1,00 gemäß AR6).",
      sim_src: "Quelle: Open-Meteo Climate API (CMIP6) — Jahreswerte werden 30 Tage auf dem Gerät gespeichert.",
      ssp_name_126: "SSP1-2.6 (optimistisch)",
      ssp_name_245: "SSP2-4.5 (mittel)",
      ssp_name_585: "SSP5-8.5 (pessimistisch)",
      /* ══ Phase 3 — strategischer Klima-Berater ══ */
      adv_wait: "Der historische Datensatz und die Ergebnisse des 2050-Szenarios werden gelesen, um die Empfehlungen vorzubereiten…",
      adv_eco: "Sparmodus aktiv — strategische Empfehlungen benötigen den historischen Datensatz und die 2050-Simulation.",
      adv_sea: " mit rund {s} cm Meeresspiegelanstieg",
      adv_agri_0: "Landwirtschaft & Wasser: Dein Standort erwärmt sich mit {r}°C/Jahrzehnt; gemäß {ssp} werden bis 2050 etwa +{w}°C und {h} Tage über 40°C pro Jahr erwartet — verlege Aussaat und Bewässerung Richtung Frühjahr und setze auf Tröpfchenbewässerung und Mulchen, um Verluste zu senken.",
      adv_agri_1: "Landwirtschaft & Wasser: Die Wachstumsgrade haben sich seit den 1980ern um {g} Einheiten verändert, und der Dürreindex bewegt sich um {d} mm/Jahrzehnt — wähle wärme- und salztolerante Sorten und nutze das Winterregenwasser, um die Niederschlagsänderung von {p} bis 2050 auszugleichen.",
      adv_agri_2: "Landwirtschaft & Wasser: Der 2050-Plan — {h} Tage/Jahr über 40°C erfordern geschützte und vorgezogene Kulturen, wöchentliche Bodenfeuchte-Kontrolle und eine vollständig flexible Bewässerungsplanung gegenüber einer Regenänderung von {p}.",
      adv_city_0: "Städte & Bevölkerung: Mit +{w}°C im Jahr 2050 ({ssp}){sea} — verdichte urbanen Schatten und Lüftungskorridore, verbreitere reflektierende Dächer und aktiviere kommunale Abkühlungsprotokolle für Seniorinnen und Senioren sowie dichte Viertel.",
      adv_city_1: "Städte & Bevölkerung: Extreme Hitzetage könnten 2050 {h} pro Jahr erreichen gegenüber {hb} in der Referenz — aktualisiere Karten des urbanen Hitzestresses, lege Außenarbeit in Früh- und Abendstunden und bereite mobile Abkühlzentren vor.",
      adv_city_2: "Städte & Bevölkerung: Eine Niederschlagsänderung von {p} und wachsender Hitzestress erfordern modernisierte Entwässerung und Straßenbäume — binde Viertelkühlung in jedes neue Stadtprojekt ein.",
      adv_infra_0: "Infrastruktur: Wachsender Hitzestress (+{w}°C 2050 gemäß {ssp}) bedeutet stärkere thermische Ausdehnung — prüfe Dehnfugen von Brücken und Schienen sowie Asphaltmischungen und erhöhe die Kühlleistung von Kraftwerken und kritischen Anlagen.",
      adv_infra_1: "Infrastruktur: {h} Tage/Jahr über 40°C erhöhen die Kühllast von Industrie und Rechenzentren — beziehe die Niederschlagsänderung von {p} in Entwässerungs- und Talsperrenberechnungen ein und härte Stromnetze gegen die staubsturmreiche Dürre ({d} mm/Jahrzehnt) ab.",
      adv_infra_2: "Infrastruktur: Plane mit einer Klima-Sicherheitsmarge bis 2050{sea} — tiefere Gründungen für Küstenbauwerke, systematische Beschattung von Schnellstraßen und intensive Sommerwartung für Energie- und Wasseranlagen.",
      adv_share_header: "Klimawandel-Observatorium (1950–2050) — Matar Pro",
      adv_share_sub: "Strategische Klimaempfehlungen · {v} · Szenario {s} (2050)",
      adv_share_ok: "Erfolgreich geteilt",
      adv_share_copy: "Die drei Empfehlungen wurden in die Zwischenablage kopiert",
      adv_share_fail: "Teilen fehlgeschlagen — kopiere die Empfehlungen manuell aus der Karte",
      adv_note: "Automatische Empfehlungen, lokal auf deinem Gerät aus dem ERA5-Datensatz und CMIP6-Ausgaben erzeugt — nur richtungsweisend.",
    },

    es: {
      deg: "°C",
      place: "Ubicación: {v}",
      no_place: "Elige primero una ubicación — el análisis climático aparecerá automáticamente.",
      eco_note: "Modo económico activado: el simulador 2050 y el consejero estratégico están en pausa para ahorrar datos — todas las lecturas históricas (franjas, GDD, SPEI y demás) siguen funcionando con una única solicitud de archivo compartida.",
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
      cap_frost_none: "Ninguna noche bajó de 0°C en este lugar entre 2015 y 2024 — clima sin heladas",
      rate_title: "¿Tu ciudad se calienta más rápido?",
      rate_sub: "El ritmo de calentamiento de tu ubicación por década (°C/década) entre 1950 y 2024 frente a la referencia mundial de +0,18 °C/década",
      rate_aria: "Comparación del ritmo de calentamiento del lugar con la referencia mundial por década",
      rate_unit: "°C/década",
      rate_city: "Tu ubicación",
      rate_global: "Media mundial",
      rate_method: "Método: regresión lineal sobre las medias anuales 1950–2024 del archivo ERA5, multiplicada por 10 por década, comparada con la referencia mundial +0,18 °C/década.",
      badge_rate_fast: "Se calienta más rápido que la media mundial",
      badge_rate_slow: "Se calienta más despacio que la media mundial",
      badge_rate_cooling: "Enfriamiento local frente al calentamiento global",
      badge_rate_par: "Cerca de la media mundial",
      cap_rate_fast: "Este lugar se calienta a {v} °C/década — {g}× el ritmo mundial (+0,18 °C/década)",
      cap_rate_slow: "Este lugar se calienta a {v} °C/década — solo el {p} % del ritmo mundial (+0,18 °C/década)",
      cap_rate_cooling: "Este lugar se enfría a {v} °C/década — una tendencia local contraria al calentamiento global",
      cap_rate_par: "Este lugar se calienta a {v} °C/década — cerca de la media mundial (+0,18 °C/década)",
      r2_note: "Fiabilidad de la tendencia (R²): {v}",
      spei_title: "Índice de sequía acumulada (SPEI / déficit hídrico)",
      spei_sub: "La diferencia anual entre precipitación y evapotranspiración de referencia (P − ET0) de 1980 a 2024 — azul para años húmedos, naranja/rojo para secos",
      spei_aria: "Barras anuales de déficit y superávit hídrico de 1980 a 2024 con la línea de tendencia",
      spei_wet: "Húmedo (superávit hídrico)",
      spei_dry: "Seco (déficit hídrico)",
      spei_method: "Método: total anual de precipitación (P) menos evapotranspiración de referencia (ET0) del archivo ERA5 — los valores negativos indican una extracción neta de humedad del suelo.",
      cap_spei_drying: "Tendencia a la sequía: el déficit hídrico crece {v} mm/década — de una media de {a} mm/año en 1980–1989 a {b} en 2015–2024",
      cap_spei_wetting: "Tendencia a la humedad: el superávit hídrico crece {v} mm/década — de una media de {a} mm/año en 1980–1989 a {b} en 2015–2024",
      cap_spei_stable: "Sin tendencia clara: el cambio es solo de {v} mm/década — de una media de {a} mm/año en 1980–1989 a {b} en 2015–2024",
      /* ══ Fase 3 — ritmo de calentamiento: comparación completa en una línea ══ */
      rate_mena: "Media regional MENA",
      rate_line: "Tu sitio {a}°C/década · MENA regional {b}°C/década · Global {c}°C/década",
      /* ══ Fase 3 — lectura 7: indicador de elevación del nivel del mar ══ */
      sea_title: "Indicador de elevación del nivel del mar costero 1950–2050",
      sea_sub: "Elevación acumulada registrada hasta 2024 y trayectoria proyectada hasta 2050 (cm) según el escenario IPCC elegido — solo para ciudades costeras",
      sea_aria: "Curva de elevación del nivel del mar de 1950 a 2050: la parte registrada hasta 2024 y la trayectoria proyectada hasta 2050 en centímetros",
      sea_recorded: "Registrado (1950–2024)",
      sea_projected: "Proyectado (2025–2050)",
      sea_cm: "cm",
      sea_cap: "El nivel registrado ha subido unos {a} cm desde 1950; según {s}, se espera alcanzar unos {b} cm en 2050 (+{d} cm sobre 2024).",
      sea_method: "Fuente: trayectoria media del nivel global del mar del IPCC AR6 — tasas registradas de 1,4 mm/año (1950–1992) y 3,3 mm/año (1993–2024), luego la tasa del escenario elegido hasta 2050.",
      /* ══ Fase 3 — simulador 2050 (CMIP6) ══ */
      sim_title: "Simulador 2050 — media de cinco modelos CMIP6",
      sim_sub: "Proyecciones 2025–2050 agregadas por año a partir de cinco modelos CMIP6 de alta resolución, con la anomalía respecto a la referencia escalada por el factor IPCC AR6 elegido",
      sim_aria: "Curva de temperatura anual proyectada 2025–2050 con el rango de incertidumbre entre modelos",
      sim_eco: "Modo económico activado: la simulación CMIP6 2050 está en pausa para ahorrar datos — desactiva el modo económico para ver los escenarios y la curva 2025–2050.",
      sim_loading: "Preparando la simulación 2050 (cinco modelos CMIP6 vía la API climática)…",
      sim_error: "No se pudieron obtener las proyecciones CMIP6 de la API climática de Open-Meteo — comprueba tu conexión e inténtalo de nuevo.",
      card1_t: "Calentamiento en 2050",
      card1_s: "Frente a la referencia 1981–2010",
      card2_t: "Días de calor extremo (más de 40°C) en 2050",
      card2_s: "Al año frente a {v} días de la referencia 1981–2010",
      card3_t: "Cambio de la precipitación anual en 2050",
      card3_s: "Respecto a la media 1981–2010",
      curve_band: "Rango de incertidumbre (mín–máx entre modelos)",
      curve_baseline: "Referencia 1981–2010",
      sim_method: "Método: una sola solicitud para cinco modelos (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) agregados por año en tu navegador (media de conjunto + mínimo y máximo entre modelos); la anomalía térmica respecto a la referencia se escala luego con el factor del escenario (0,55 / 0,78 / 1,00 según AR6).",
      sim_src: "Fuente: Open-Meteo Climate API (CMIP6) — las salidas anuales se guardan 30 días en tu dispositivo.",
      ssp_name_126: "SSP1-2.6 (optimista)",
      ssp_name_245: "SSP2-4.5 (medio)",
      ssp_name_585: "SSP5-8.5 (pesimista)",
      /* ══ Fase 3 — asesor estratégico del clima ══ */
      adv_wait: "Leyendo el registro histórico y los resultados del escenario 2050 para preparar las recomendaciones…",
      adv_eco: "Modo económico activado — las recomendaciones estratégicas necesitan el registro histórico y la simulación 2050.",
      adv_sea: " con unos {s} cm de elevación del nivel del mar",
      adv_agri_0: "Agricultura y agua: tu sitio se calienta a {r}°C/década; según {ssp}, se esperan hacia 2050 unos +{w}°C y {h} días por encima de 40°C al año — adelanta siembra y riego hacia la primavera y adopta riego por goteo y acolchado para reducir pérdidas.",
      adv_agri_1: "Agricultura y agua: los grados-día de crecimiento han cambiado {g} unidades desde los años ochenta y el índice de sequía se mueve {d} mm/década — elige variedades tolerantes al calor y a la salinidad y aprovecha la lluvia invernal para compensar el cambio de precipitación de {p} hacia 2050.",
      adv_agri_2: "Agricultura y agua: el plan 2050 — {h} días/año por encima de 40°C exigen cultivos protegidos y anticipados, seguimiento semanal de la humedad del suelo y riego totalmente flexible ante un cambio de lluvias de {p}.",
      adv_city_0: "Ciudades y población: con +{w}°C en 2050 ({ssp}){sea} — densifica la sombra urbana y los corredores de ventilación, generaliza tejados reflectantes y activa protocolos comunitarios de refrigeración para mayores y barrios densos.",
      adv_city_1: "Ciudades y población: los días de calor extremo podrían llegar a {h} al año en 2050 frente a {hb} de la referencia — actualiza los mapas de estrés térmico urbano, programa el trabajo exterior al alba y al atardecer y prepara centros de refrigeración móviles.",
      adv_city_2: "Ciudades y población: un cambio de lluvias de {p} y un estrés térmico creciente exigen actualizar drenajes y arbolado viario — integra la refrigeración de barrios en cada nuevo diseño urbano.",
      adv_infra_0: "Infraestructuras: un estrés térmico creciente (+{w}°C en 2050 según {ssp}) implica mayor dilatación térmica — revisa las juntas de dilatación de puentes y vías y las mezclas asfálticas, y amplía la capacidad de refrigeración de plantas e instalaciones críticas.",
      adv_infra_1: "Infraestructuras: {h} días/año por encima de 40°C elevan la carga de refrigeración industrial y de centros de datos — incorpora el cambio de precipitación de {p} en los cálculos de drenaje y presas, y refuerza las redes eléctricas frente a las tormentas de polvo que acompañan la sequía ({d} mm/década).",
      adv_infra_2: "Infraestructuras: diseña con un margen de seguridad climática hasta 2050{sea} — cimentaciones más profundas para obras costeras, sombreado sistemático de autovías y mantenimiento estival intensivo de los activos de energía y agua.",
      adv_share_header: "Observatorio del Cambio Climático (1950–2050) — Matar Pro",
      adv_share_sub: "Recomendaciones climáticas estratégicas · {v} · escenario {s} (2050)",
      adv_share_ok: "Compartido con éxito",
      adv_share_copy: "Las tres recomendaciones se copiaron al portapapeles",
      adv_share_fail: "No se pudo compartir — copia las recomendaciones manualmente desde la tarjeta",
      adv_note: "Recomendaciones automáticas generadas localmente en tu dispositivo a partir del registro ERA5 y las salidas CMIP6 — orientativas.",
    },

    pt: {
      deg: "°C",
      place: "Localização: {v}",
      no_place: "Escolha primeiro uma localização — a análise climática aparece automaticamente.",
      eco_note: "Modo económico ativado: o simulador de 2050 e o consultor estratégico estão em pausa para poupar dados — todas as leituras históricas (faixas, GDD, SPEI e as restantes) continuam a funcionar com um único pedido de arquivo partilhado.",
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
      cap_frost_none: "Nenhuma noite desceu abaixo de 0°C neste local entre 2015 e 2024 — clima sem geada",
      rate_title: "A sua cidade está a aquecer mais depressa?",
      rate_sub: "O ritmo de aquecimento da sua localização por década (°C/década) entre 1950 e 2024 face à referência global de +0,18 °C/década",
      rate_aria: "Comparação do ritmo de aquecimento do local com a referência global por década",
      rate_unit: "°C/década",
      rate_city: "A sua localização",
      rate_global: "Média global",
      rate_method: "Método: regressão linear sobre as médias anuais 1950–2024 do arquivo ERA5, multiplicada por 10 por década, comparada com a referência global +0,18 °C/década.",
      badge_rate_fast: "Aquece mais depressa do que a média global",
      badge_rate_slow: "Aquece mais devagar do que a média global",
      badge_rate_cooling: "Arrefecimento local contra o aquecimento global",
      badge_rate_par: "Perto da média global",
      cap_rate_fast: "Este local aquece {v} °C/década — {g}× o ritmo global (+0,18 °C/década)",
      cap_rate_slow: "Este local aquece {v} °C/década — apenas {p} % do ritmo global (+0,18 °C/década)",
      cap_rate_cooling: "Este local arrefece {v} °C/década — uma tendência local oposta ao aquecimento global",
      cap_rate_par: "Este local aquece {v} °C/década — perto da média global (+0,18 °C/década)",
      r2_note: "Fiabilidade da tendência (R²): {v}",
      spei_title: "Índice de seca acumulada (SPEI / défice hídrico)",
      spei_sub: "A diferença anual entre precipitação e evapotranspiração de referência (P − ET0) de 1980 a 2024 — azul para anos húmidos, laranja/vermelho para secos",
      spei_aria: "Barras anuais de défice e excedente hídrico de 1980 a 2024 com a linha de tendência",
      spei_wet: "Húmido (excedente hídrico)",
      spei_dry: "Seco (défice hídrico)",
      spei_method: "Método: total anual de precipitação (P) menos evapotranspiração de referência (ET0) do arquivo ERA5 — valores negativos significam extração líquida de humidade do solo.",
      cap_spei_drying: "Tendência de secagem: o défice hídrico cresce {v} mm/década — de uma média de {a} mm/ano em 1980–1989 para {b} em 2015–2024",
      cap_spei_wetting: "Tendência de humedecimento: o excedente hídrico cresce {v} mm/década — de uma média de {a} mm/ano em 1980–1989 para {b} em 2015–2024",
      cap_spei_stable: "Sem tendência clara: a mudança é apenas de {v} mm/década — de uma média de {a} mm/ano em 1980–1989 para {b} em 2015–2024",
      /* ══ Fase 3 — ritmo de aquecimento: comparação completa numa linha ══ */
      rate_mena: "Média regional MENA",
      rate_line: "O seu local {a}°C/década · MENA regional {b}°C/década · Global {c}°C/década",
      /* ══ Fase 3 — leitura 7: indicador de subida do nível do mar ══ */
      sea_title: "Indicador de subida do nível do mar costeiro 1950–2050",
      sea_sub: "Subida acumulada registada até 2024 e trajetória projetada até 2050 (cm) segundo o cenário IPCC escolhido — apenas para cidades costeiras",
      sea_aria: "Curva de subida do nível do mar de 1950 a 2050: a parte registada até 2024 e a trajetória projetada até 2050 em centímetros",
      sea_recorded: "Registado (1950–2024)",
      sea_projected: "Projetado (2025–2050)",
      sea_cm: "cm",
      sea_cap: "O nível registado subiu cerca de {a} cm desde 1950; segundo {s}, espera-se atingir cerca de {b} cm em 2050 (+{d} cm acima de 2024).",
      sea_method: "Fonte: trajetória mediana do nível médio global do mar do IPCC AR6 — taxas registadas de 1,4 mm/ano (1950–1992) e 3,3 mm/ano (1993–2024), depois a taxa do cenário escolhido até 2050.",
      /* ══ Fase 3 — simulador 2050 (CMIP6) ══ */
      sim_title: "Simulador 2050 — média de cinco modelos CMIP6",
      sim_sub: "Projeções 2025–2050 agregadas por ano a partir de cinco modelos CMIP6 de alta resolução, com o desvio em relação à referência escalado pelo fator IPCC AR6 escolhido",
      sim_aria: "Curva de temperatura anual projetada 2025–2050 com a faixa de incerteza entre modelos",
      sim_eco: "Modo económico ativado: a simulação CMIP6 2050 está em pausa para poupar dados — desative o modo económico para ver os cenários e a curva 2025–2050.",
      sim_loading: "A preparar a simulação 2050 (cinco modelos CMIP6 via a API climática)…",
      sim_error: "Não foi possível obter as projeções CMIP6 da API climática Open-Meteo — verifique a ligação e tente novamente.",
      card1_t: "Aquecimento em 2050",
      card1_s: "Face à referência 1981–2010",
      card2_t: "Dias de calor extremo (acima de 40°C) em 2050",
      card2_s: "Por ano face a {v} dias da referência 1981–2010",
      card3_t: "Alteração da precipitação anual em 2050",
      card3_s: "Em relação à média 1981–2010",
      curve_band: "Faixa de incerteza (mín–máx entre modelos)",
      curve_baseline: "Referência 1981–2010",
      sim_method: "Método: um único pedido para cinco modelos (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) agregados por ano no seu navegador (média de conjunto + mínimo e máximo entre modelos); depois, o desvio térmico face à referência é escalado pelo fator do cenário (0,55 / 0,78 / 1,00 segundo AR6).",
      sim_src: "Fonte: Open-Meteo Climate API (CMIP6) — as saídas anuais ficam guardadas 30 dias no seu dispositivo.",
      ssp_name_126: "SSP1-2.6 (otimista)",
      ssp_name_245: "SSP2-4.5 (médio)",
      ssp_name_585: "SSP5-8.5 (pessimista)",
      /* ══ Fase 3 — conselheiro estratégico do clima ══ */
      adv_wait: "A ler o registo histórico e os resultados do cenário 2050 para preparar as recomendações…",
      adv_eco: "Modo económico ativado — as recomendações estratégicas precisam do registo histórico e da simulação 2050.",
      adv_sea: " com cerca de {s} cm de subida do nível do mar",
      adv_agri_0: "Agricultura e água: o seu local aquece {r}°C/década; segundo {ssp}, esperam-se até 2050 cerca de +{w}°C e {h} dias acima de 40°C por ano — adiante a sementeira e a rega para a primavera e adote a rega gota-a-gota e a cobertura do solo para reduzir perdas.",
      adv_agri_1: "Agricultura e água: os graus-dia de crescimento variaram {g} unidades desde os anos 80 e o índice de seca move-se {d} mm/década — escolha variedades tolerantes ao calor e à salinidade e capte a chuva de inverno para compensar a variação de precipitação de {p} até 2050.",
      adv_agri_2: "Agricultura e água: o plano 2050 — {h} dias/ano acima de 40°C exigem culturas protegidas e precoces, monitorização semanal da humidade do solo e rega totalmente flexível perante uma variação das chuvas de {p}.",
      adv_city_0: "Cidades e população: com +{w}°C em 2050 ({ssp}){sea} — densifique a sombra urbana e os corredores de ventilação, generalize coberturas refletoras e ative protocolos comunitários de arrefecimento para idosos e bairros densos.",
      adv_city_1: "Cidades e população: os dias de calor extremo podem atingir {h} por ano em 2050 contra {hb} na referência — atualize os mapas de stress térmico urbano, agende o trabalho exterior para a madrugada e o fim de tarde e prepare centros de arrefecimento móveis.",
      adv_city_2: "Cidades e população: uma variação de chuvas de {p} e um stress térmico crescente exigem drenagens e arborização viária atualizadas — incorpore o arrefecimento de bairros em cada novo desenho urbano.",
      adv_infra_0: "Infraestruturas: um stress térmico crescente (+{w}°C em 2050 segundo {ssp}) implica maior dilatação térmica — reveja as juntas de dilatação de pontes e vias e os betumes e aumente a capacidade de refrigeração de centrais e instalações críticas.",
      adv_infra_1: "Infraestruturas: {h} dias/ano acima de 40°C elevam a carga de refrigeração da indústria e dos centros de dados — inclua a variação de precipitação de {p} nos cálculos de drenagem e barragens e reforce as redes elétricas contra as tempestades de poeira que acompanham a seca ({d} mm/década).",
      adv_infra_2: "Infraestruturas: projete com uma margem de segurança climática até 2050{sea} — fundações mais profundas para estruturas costeiras, sombreamento sistemático de autoestradas e manutenção de verão intensiva dos ativos de energia e água.",
      adv_share_header: "Observatório das Alterações Climáticas (1950–2050) — Matar Pro",
      adv_share_sub: "Recomendações climáticas estratégicas · {v} · cenário {s} (2050)",
      adv_share_ok: "Partilhado com sucesso",
      adv_share_copy: "As três recomendações foram copiadas para a área de transferência",
      adv_share_fail: "Falhou a partilha — copie as recomendações manualmente do cartão",
      adv_note: "Recomendações automáticas geradas localmente no seu dispositivo a partir do registo ERA5 e das saídas CMIP6 — meramente indicativas.",
    },

    it: {
      deg: "°C",
      place: "Località: {v}",
      no_place: "Scegli prima una località — l'analisi climatica apparirà automaticamente.",
      eco_note: "Modalità economia attiva: il simulatore 2050 e il consulente strategico sono in pausa per risparmiare dati — tutte le letture storiche (strisce, GDD, SPEI e le altre) continuano con una sola richiesta d'archivio condivisa.",
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
      cap_frost_none: "Nessuna notte sotto 0°C in questa località tra 2015 e 2024 — clima senza gelo",
      rate_title: "La tua città si scalda più velocemente?",
      rate_sub: "Il ritmo di riscaldamento della tua località per decennio (°C/decennio) nel 1950–2024 rispetto al riferimento globale di +0,18 °C/decennio",
      rate_aria: "Confronto tra il ritmo di riscaldamento della località e il riferimento globale per decennio",
      rate_unit: "°C/decennio",
      rate_city: "La tua località",
      rate_global: "Media globale",
      rate_method: "Metodo: regressione lineare sulle medie annue 1950–2024 dell'archivio ERA5, moltiplicata per 10 per decennio, confrontata con il riferimento globale +0,18 °C/decennio.",
      badge_rate_fast: "Si scalda più velocemente della media globale",
      badge_rate_slow: "Si scalda più lentamente della media globale",
      badge_rate_cooling: "Raffreddamento locale opposto al riscaldamento globale",
      badge_rate_par: "Vicino alla media globale",
      cap_rate_fast: "Questa località si scalda di {v} °C/decennio — {g}× il ritmo globale (+0,18 °C/decennio)",
      cap_rate_slow: "Questa località si scalda di {v} °C/decennio — solo il {p} % del ritmo globale (+0,18 °C/decennio)",
      cap_rate_cooling: "Questa località si raffredda di {v} °C/decennio — una tendenza locale opposta al riscaldamento globale",
      cap_rate_par: "Questa località si scalda di {v} °C/decennio — vicino alla media globale (+0,18 °C/decennio)",
      r2_note: "Affidabilità della tendenza (R²): {v}",
      spei_title: "Indice di siccità cumulativo (SPEI / deficit idrico)",
      spei_sub: "La differenza annua tra precipitazione ed evapotraspirazione di riferimento (P − ET0) dal 1980 al 2024 — blu per gli anni umidi, arancio/rosso per quelli secchi",
      spei_aria: "Barre annue di deficit ed eccedenza idrica dal 1980 al 2024 con la linea di tendenza",
      spei_wet: "Umido (eccedenza idrica)",
      spei_dry: "Secco (deficit idrico)",
      spei_method: "Metodo: totale annuo delle precipitazioni (P) meno l'evapotraspirazione di riferimento (ET0) dall'archivio ERA5 — i valori negativi indicano un'estrazione netta di umidità dal suolo.",
      cap_spei_drying: "Tendenza all'aridità: il deficit idrico cresce di {v} mm/decennio — da una media di {a} mm/anno nel 1980–1989 a {b} nel 2015–2024",
      cap_spei_wetting: "Tendenza all'umidità: l'eccedenza idrica cresce di {v} mm/decennio — da una media di {a} mm/anno nel 1980–1989 a {b} nel 2015–2024",
      cap_spei_stable: "Nessuna tendenza netta: la variazione è di soli {v} mm/decennio — da una media di {a} mm/anno nel 1980–1989 a {b} nel 2015–2024",
      /* ══ Fase 3 — ritmo di riscaldamento: confronto completo in una riga ══ */
      rate_mena: "Media regionale MENA",
      rate_line: "Il tuo sito {a}°C/decennio · MENA regionale {b}°C/decennio · Globale {c}°C/decennio",
      /* ══ Fase 3 — lettura 7: indicatore dell'innalzamento del livello del mare ══ */
      sea_title: "Indicatore dell'innalzamento del livello del mare costiero 1950–2050",
      sea_sub: "Innalzamento cumulativo registrato fino al 2024 e traiettoria prevista fino al 2050 (cm) secondo lo scenario IPCC scelto — solo per città costiere",
      sea_aria: "Curva dell'innalzamento del livello del mare dal 1950 al 2050: la parte registrata fino al 2024 e la traiettoria prevista fino al 2050 in centimetri",
      sea_recorded: "Registrato (1950–2024)",
      sea_projected: "Previsto (2025–2050)",
      sea_cm: "cm",
      sea_cap: "Il livello registrato è salito di circa {a} cm dal 1950; secondo {s}, si prevede di raggiungere circa {b} cm entro il 2050 (+{d} cm sopra il 2024).",
      sea_method: "Fonte: traiettoria mediana del livello medio globale del mare dell'IPCC AR6 — tassi registrati di 1,4 mm/anno (1950–1992) e 3,3 mm/anno (1993–2024), poi il tasso dello scenario scelto fino al 2050.",
      /* ══ Fase 3 — simulatore 2050 (CMIP6) ══ */
      sim_title: "Simulatore 2050 — media di cinque modelli CMIP6",
      sim_sub: "Proiezioni 2025–2050 aggregate per anno da cinque modelli CMIP6 ad alta risoluzione, con l'anomalia rispetto alla baseline scalata dal fattore IPCC AR6 scelto",
      sim_aria: "Curva della temperatura annuale prevista 2025–2050 con la gamma di incertezza tra modelli",
      sim_eco: "Modalità economia attiva: la simulazione CMIP6 2050 è in pausa per risparmiare dati — disattiva la modalità economia per vedere gli scenari e la curva 2025–2050.",
      sim_loading: "Preparazione della simulazione 2050 (cinque modelli CMIP6 tramite l'API climatica)…",
      sim_error: "Impossibile recuperare le proiezioni CMIP6 dall'API climatica di Open-Meteo — controlla la connessione e riprova.",
      card1_t: "Riscaldamento nel 2050",
      card1_s: "Rispetto alla baseline 1981–2010",
      card2_t: "Giorni di caldo estremo (sopra 40°C) nel 2050",
      card2_s: "All'anno contro {v} giorni della baseline 1981–2010",
      card3_t: "Variazione delle precipitazioni annue nel 2050",
      card3_s: "Rispetto alla media 1981–2010",
      curve_band: "Gamma di incertezza (min–max tra modelli)",
      curve_baseline: "Baseline 1981–2010",
      sim_method: "Metodo: una sola richiesta per cinque modelli (CMCC_CM2_VHR4 · FGOALS_f3_H · HiRAM_SIT_HR · MRI_AGCM3_2_S · EC_Earth3P_HR) aggregati per anno nel browser (media d'insieme + minimo e massimo tra modelli); l'anomalia termica rispetto alla baseline viene poi scalata dal fattore dello scenario (0,55 / 0,78 / 1,00 secondo AR6).",
      sim_src: "Fonte: Open-Meteo Climate API (CMIP6) — gli output annuali restano salvati 30 giorni sul dispositivo.",
      ssp_name_126: "SSP1-2.6 (ottimista)",
      ssp_name_245: "SSP2-4.5 (medio)",
      ssp_name_585: "SSP5-8.5 (pessimista)",
      /* ══ Fase 3 — consulente strategico del clima ══ */
      adv_wait: "Lettura del registro storico e dei risultati dello scenario 2050 per preparare i consigli…",
      adv_eco: "Modalità economia attiva — i consigli strategici richiedono il registro storico e la simulazione 2050.",
      adv_sea: " con circa {s} cm di innalzamento del livello del mare",
      adv_agri_0: "Agricoltura e acqua: il tuo sito si scalda di {r}°C/decennio; secondo {ssp}, entro il 2050 si attendono circa +{w}°C e {h} giorni sopra i 40°C all'anno — anticipa semina e irrigazione verso la primavera e adotta l'irrigazione a goccia e la pacciamatura per ridurre le perdite.",
      adv_agri_1: "Agricoltura e acqua: i gradi-giorno di crescita sono cambiati di {g} unità dagli anni Ottanta e l'indice di siccità si muove di {d} mm/decennio — scegli varietà tolleranti al calore e alla salinità e raccogli la pioggia invernale per compensare il cambiamento delle precipitazioni di {p} entro il 2050.",
      adv_agri_2: "Agricoltura e acqua: il piano 2050 — {h} giorni/anno sopra i 40°C richiedono colture protette e anticipate, monitoraggio settimanale dell'umidità del suolo e irrigazione del tutto flessibile rispetto a un cambiamento delle piogge di {p}.",
      adv_city_0: "Città e popolazione: con +{w}°C nel 2050 ({ssp}){sea} — infittisci l'ombra urbana e i corridoi di ventilazione, diffondi tetti riflettenti e attiva i protocolli comunitari di raffrescamento per anziani e quartieri densi.",
      adv_city_1: "Città e popolazione: i giorni di caldo estremo potrebbero raggiungere {h} all'anno nel 2050 contro {hb} della baseline — aggiorna le mappe di stress termico urbano, programma il lavoro esterno all'alba e alla sera e prepara centri di raffrescamento mobili.",
      adv_city_2: "Città e popolazione: un cambiamento delle piogge di {p} e uno stress termico crescente impongono fognature e alberature stradali rinnovate — includi il raffrescamento dei quartieri in ogni nuovo progetto urbano.",
      adv_infra_0: "Infrastrutture: uno stress termico crescente (+{w}°C nel 2050 secondo {ssp}) significa maggiore dilatazione termica — rivedi i giunti di dilatazione di ponti e ferrovie e le mescole asfaltiche e aumenta la capacità di raffreddamento di centrali e siti critici.",
      adv_infra_1: "Infrastrutture: {h} giorni/anno sopra i 40°C alzano i carichi di raffreddamento industriale e dei data center — includi il cambiamento delle precipitazioni di {p} nei calcoli di drenaggio e dighe e irrobustisci le reti elettriche contro le tempeste di polvere che accompagnano la siccità ({d} mm/decennio).",
      adv_infra_2: "Infrastrutture: progetta con un margine di sicurezza climatica fino al 2050{sea} — fondazioni più profonde per le opere costiere, ombreggiamento sistematico delle autostrade e manutenzione estiva intensiva degli asset energetici e idrici.",
      adv_share_header: "Osservatorio dei cambiamenti climatici (1950–2050) — Matar Pro",
      adv_share_sub: "Consigli climatici strategici · {v} · scenario {s} (2050)",
      adv_share_ok: "Condivisione riuscita",
      adv_share_copy: "I tre consigli sono stati copiati negli appunti",
      adv_share_fail: "Condivisione non riuscita — copia i consigli manualmente dalla scheda",
      adv_note: "Consigli automatici generati localmente sul tuo dispositivo dal registro ERA5 e dagli output CMIP6 — orientativi.",
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
  function fmt2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
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
    /* الوضع الاقتصادي المفعّل يدويًا (html.eco) وحده يوقف القراءات
       الثقيلة ويُبقي سياق موجة الحر — أما صنف html.low-end الذي يضيفه
       التطبيق تلقائيًا على الهواتف المتوسطة فهو لتخفيف الظلال
       والأنيميشن فقط ولا يوقف أي قراءة أو محاكاة أو مستشارًا */
    var cl = document.documentElement.classList;
    return cl.contains("eco");
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

  /* ══ v74.1 — فحص أمان الكاش (Cache Validation) ══
     أي بيانات تالفة (JSON مكسور) أو فارغة أو مشوهة البنية أو منتهية
     الصلاحية في localStorage تُمحى من الجهاز فورًا ويُعاد null — فيجلبها
     cached() نظيفة من الشبكة في الحال بلا تعليق ولا قراءة ناقصة. */
  function cacheGet(key) {
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e0) { return null; }
    if (raw == null) return null; /* لا قيمة أصلًا — جلب عادي */
    function bad() {
      try { localStorage.removeItem(key); } catch (e1) { /* تجاهل */ }
      return null;
    }
    if (!raw.length) return bad(); /* قيمة فارغة نصيًا — تُمحى فورًا */
    var obj = null;
    try { obj = JSON.parse(raw); } catch (e) { return bad(); } /* JSON تالف — يُمحى فورًا */
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return bad();
    if (!isNum(obj.t)) return bad();
    if ((Date.now() - obj.t) > CACHE_TTL_MS) return bad(); /* منتهية الصلاحية — تُمحى */
    if (!("d" in obj) || obj.d == null || typeof obj.d !== "object" || Array.isArray(obj.d)) {
      return bad(); /* ناتج مفقود أو مشوه البنية */
    }
    var empty = true;
    for (var k in obj.d) { empty = false; break; }
    if (empty) return bad(); /* ناتج فارغ {} — يُمحى ويُعاد جلبه نظيفًا */
    return obj.d;
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* الكاش ممتلئ أو محجوب — نتابع بلا كاش */ }
  }

  function cacheDel(key) {
    try { localStorage.removeItem(key); } catch (e) { /* تجاهل */ }
  }

  /* تنظيف مفاتيح بادئة الإصدار السابق (matar:climate:v73:*) مرة واحدة عند
     الإقلاع — بادئة v74 الجديدة تعزل نواتج القراءات السبع عن القديمة،
     وتُنقّى كذلك نواتج gdd القديمة (بلا سنويات الأيام فوق 40°م) فقد صار
     المفتاح المعتمد gdd2 بناتج موسع يستخدمه خط أساس المحاكي */
  function purgeLegacyCache() {
    try {
      var kill = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf("matar:climate:v73:") === 0 || k.indexOf("matar:climate:v74:gdd:") === 0)) kill.push(k);
      }
      for (var j = 0; j < kill.length; j++) localStorage.removeItem(kill[j]);
    } catch (e) { /* تجاهل */ }
  }

  /* نواتج قيد الجلب — تُشارك بين الميزات (الحرارة والصقيع من الطلب نفسه) */
  var inflight = {};

  /* ══ v74.1 — فحص أمان الكاش 2: بنية الناتج نفسها ══
     لكل نوع ناتج حقول مصفوفات لا يصح العمل بدونها — إن افتقدتها قيمة
     مخزّنة فهي تالفة/مبتورة فتُمحى فورًا ويُعاد جلبها نظيفة. */
  var KIND_SHAPE = {
    stripes: ["years", "means"],
    heat: ["frostYears", "frostCounts"],
    gdd2: ["years", "gdd", "hot40"],
    spei: ["years", "precip", "et0", "deficit"],
    "2050": ["years", "tmeanM", "prM", "hot"]
  };
  function shapeOk(kind, d) {
    var need = KIND_SHAPE[kind];
    if (!need) return true; /* أنواع بلا نمط مفروض — تُقبل كما هي */
    if (!d || typeof d !== "object" || Array.isArray(d)) return false;
    for (var i = 0; i < need.length; i++) {
      if (!Array.isArray(d[need[i]])) return false;
    }
    return true;
  }

  /* قراءة ناتج محسوب من الكاش أو جلبه وتخزينه — مع إلغاء التكرار المتزامن */
  function cached(kind, id, compute) {
    var key = CACHE_PREFIX + kind + ":" + id;
    var hit = cacheGet(key);
    /* v74.1: بنية تالفة — تُمحى ويُعاد الجلب النظيف فورًا */
    if (hit && !shapeOk(kind, hit)) {
      cacheDel(key);
      hit = null;
    }
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

  /* ══ 7-b) v74.1 — حزمة الأرشيف الموحّدة الواحدة في الذاكرة ══
     طلب شبكة واحد فقط لكل موقع في الجلسة كاملة: القراءات الخمس (الشرائط ·
     الحرارة/الصقيع · النمو · المعدل · الجفاف) وخطوط أساس المحاكي تقرأ
     جميعها نفس الحزمة من الذاكرة — لا تُخزَّن الحزمة الخام في localStorage
     (يبقى الكاش للنواتج المحسوبة الصغيرة كما هو التصميم)، وتُبقى في
     الذاكرة حزمة آخر موقعين فقط رحمةً بالأجهزة محدودة الذاكرة. */
  var bundleInflight = {};
  var bundleMemo = {};
  var bundleMemoOrder = [];

  function archiveDaily(place) {
    var id = placeId(place);
    if (bundleMemo[id]) return Promise.resolve(bundleMemo[id]);
    if (bundleInflight[id]) return bundleInflight[id];
    bundleInflight[id] = fetchArchive(place, ARCHIVE_START, ARCHIVE_END, ARCHIVE_VARS).then(
      function (json) {
        var daily = json.daily || {};
        bundleMemo[id] = daily;
        bundleMemoOrder.push(id);
        while (bundleMemoOrder.length > 2) {
          var old = bundleMemoOrder.shift();
          if (old !== id) delete bundleMemo[old];
        }
        delete bundleInflight[id];
        return daily;
      },
      function (err) {
        delete bundleInflight[id];
        throw err;
      }
    );
    return bundleInflight[id];
  }

  /* تقطيع الحزمة الموحّدة لنطاق سنوات محدد: تحسب الحرارة/الصقيع على عقد
     2015–2024 وحده والنمو والجفاف على 1980–2024 وحده — تمامًا كما كان
     لكل قراءة نطاقها الخاص قبل الدمج، فلا تتغير أي إحصاءة */
  function sliceDailyByYear(daily, y1, y2) {
    var time = daily.time || [];
    var out = { time: [] };
    var idx = [];
    for (var i = 0; i < time.length; i++) {
      var y = parseInt(String(time[i]).slice(0, 4), 10);
      if (y >= y1 && y <= y2) { out.time.push(time[i]); idx.push(i); }
    }
    for (var k in daily) {
      if (k === "time" || !Array.isArray(daily[k])) continue;
      var src = daily[k];
      out[k] = idx.map(function (j) { return src[j]; });
    }
    return out;
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

  /* ══ 10) الميزة 3: وحدات النمو الزراعي (GDD) + أيام الحر الشديد لخط الأساس ══
     من الطلب نفسه (tmax/tmin 1980–2024) تُحسب أيضًا سنويات الأيام فوق 40°م
     (hot40) — يستخدمها محاكي 2050 كخط أساس 1981–2010 بلا طلب إضافي */

  function computeGdd(daily) {
    var time = daily.time || [];
    var mx = daily.temperature_2m_max || [];
    var mn = daily.temperature_2m_min || [];
    var per = {}, hot = {};
    for (var i = 0; i < time.length; i++) {
      var y = String(time[i]).slice(0, 4);
      var a = mx[i];
      /* عدّ الأيام فوق عتبة 40°م لكل سنة كاملة (كل الشهور) */
      if (isNum(a) && a >= HOT_THRESHOLD) hot[y] = (hot[y] || 0) + 1;
      var b = mn[i];
      if (!isNum(a) || !isNum(b)) continue;
      var mon = parseInt(String(time[i]).slice(5, 7), 10);
      if (mon < 3 || mon > 10) continue; /* موسم النمو: مارس–أكتوبر */
      var g = ((a + b) / 2) - GDD_BASE_TEMP;
      if (g > 0) {
        per[y] = (per[y] || 0) + g;
      }
    }
    var years = [], gdd = [], hot40 = [];
    for (var Y = GDD_FIRST_YEAR; Y <= GDD_LAST_YEAR; Y++) {
      years.push(Y);
      gdd.push(per[String(Y)] || 0);
      hot40.push(hot[String(Y)] || 0);
    }
    return { years: years, gdd: gdd, hot40: hot40 };
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

  /* ══ 10-b) الميزة 5: معدل احترار المدينة لكل عقد (انحدار خطي 1950–2024) ══ */

  function computeRate(stripes) {
    if (!stripes || !Array.isArray(stripes.years) || !Array.isArray(stripes.means)) return null;
    var xs = [], ys = [];
    for (var i = 0; i < stripes.years.length; i++) {
      if (isNum(stripes.means[i])) { xs.push(stripes.years[i]); ys.push(stripes.means[i]); }
    }
    if (xs.length < 20) return null; /* سلسلة قصيرة جدًا لا تحتمل انحدارًا معتبرًا */
    var nx = meanArr(xs), ny = meanArr(ys);
    var num = 0, den = 0;
    for (var j = 0; j < xs.length; j++) {
      var dx = xs[j] - nx;
      num += dx * (ys[j] - ny);
      den += dx * dx;
    }
    if (!(den > 0)) return null;
    var slopePerYear = num / den;
    var ssTot = 0, ssRes = 0;
    for (var k = 0; k < xs.length; k++) {
      var pred = ny + slopePerYear * (xs[k] - nx);
      ssRes += (ys[k] - pred) * (ys[k] - pred);
      ssTot += (ys[k] - ny) * (ys[k] - ny);
    }
    return {
      perDecade: slopePerYear * 10,
      r2: ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : null,
      nYears: xs.length,
      globalPerDecade: GLOBAL_WARMING_PER_DECADE
    };
  }

  /* حكم المقارنة بالمرجع العالمي: أسرع / أبطأ / معاكس (تبريد) / موازٍ */
  function rateVerdict(perDecade) {
    if (!isNum(perDecade)) return null;
    if (perDecade < 0) return "cooling";
    if (perDecade > GLOBAL_WARMING_PER_DECADE + 0.02) return "fast";
    if (perDecade < GLOBAL_WARMING_PER_DECADE - 0.02) return "slow";
    return "par";
  }

  /* ══ 10-c) الميزة 6: مؤشر الجفاف — (P − ET0) سنويًا 1980–2024 ══ */

  function computeSpei(daily) {
    var time = daily.time || [];
    var pr = daily.precipitation_sum || [];
    var et = daily.et0_fao_evapotranspiration || [];
    var P = {}, E = {};
    for (var i = 0; i < time.length; i++) {
      var y = String(time[i]).slice(0, 4);
      if (isNum(pr[i])) P[y] = (P[y] || 0) + pr[i];
      if (isNum(et[i])) E[y] = (E[y] || 0) + et[i];
    }
    var years = [], precip = [], et0 = [], deficit = [];
    for (var Y = SPEI_FIRST_YEAR; Y <= SPEI_LAST_YEAR; Y++) {
      years.push(Y);
      var p = P[String(Y)] || 0, e = E[String(Y)] || 0;
      precip.push(p);
      et0.push(e);
      deficit.push(p - e);
    }
    return { years: years, precip: precip, et0: et0, deficit: deficit };
  }

  /* خط اتجاه الجفاف: انحدار خطي (مم/عقد) + متوسطا أول عقد وآخر عقد */
  function speiTrend(res) {
    if (!res || !Array.isArray(res.years) || !Array.isArray(res.deficit)) return null;
    var xs = res.years, ys = res.deficit;
    var nx = meanArr(xs), ny = meanArr(ys);
    var num = 0, den = 0;
    for (var i = 0; i < xs.length; i++) {
      var dx = xs[i] - nx;
      num += dx * (ys[i] - ny);
      den += dx * dx;
    }
    var slope = den > 0 ? num / den : 0; /* مم/سنة */
    return {
      slopePerYear: slope,
      perDecade: slope * 10,
      firstAvg: meanArr(ys.slice(0, 10)),
      lastAvg: meanArr(ys.slice(-10))
    };
  }

  /* حكم اتجاه الجفاف على خط الاتجاه (عتبة تقديرية ±15 مم/عقد) */
  function speiVerdict(tr) {
    if (!tr || !isNum(tr.perDecade)) return null;
    if (tr.perDecade <= -15) return "drying";
    if (tr.perDecade >= 15) return "wetting";
    return "stable";
  }

  /* ══ 10-d) المرحلة 3 — تحديد المواقع الساحلية ══
     سلاسل نقاط السواحل (خط العرض، خط الطول) تغطي بحار العالم العربي بدقة
     جيدة وبقية سواحل العالم تقريبيًا؛ تقاس المسافة إلى أقرب قطعة سلسلة
     (إسقاط متساوي المستطيلات محليًا) — الموقع داخل عتبة 50 كم يُعدّ ساحليًا
     (سلوك محافظ: المدن البعيدة نسبيًا عن الماء تُعامل كداخلية). */

  var COAST_CHAINS = [
    /* البحر المتوسط — الساحل الأفريقي والشرقي (طنجة ← الإسكندرية ← أنطاليا) */
    [[35.9,-5.9],[35.1,-2.2],[36.8,3.1],[36.9,7.8],[36.8,10.2],[34.0,10.0],[32.9,13.2],[31.3,16.6],[32.1,20.1],[32.6,22.1],[32.1,24.0],[31.3,27.2],[31.2,29.9],[31.3,32.3],[31.1,33.8],[31.5,34.4],[32.1,34.8],[32.8,35.0],[33.9,35.5],[34.9,35.9],[35.5,35.8],[36.6,36.2],[36.8,34.8],[36.9,30.7],[36.6,27.5]],
    /* البحر المتوسط — الساحل الأوروبي وبحر إيجة (مالقة ← برشلونة ← أثينا ← إزمير ← أنطاليا) */
    [[36.7,-4.4],[37.6,-1.0],[39.5,-0.4],[41.4,2.2],[43.3,5.4],[43.7,7.3],[44.4,8.9],[41.7,12.3],[40.8,14.2],[41.1,16.9],[40.5,19.0],[40.6,22.9],[39.4,22.9],[37.98,23.7],[37.0,23.4],[36.8,22.1],[38.2,21.7],[39.5,20.2],[40.9,24.4],[40.85,25.9],[40.4,26.7],[38.4,27.1],[37.0,27.4],[36.9,30.7]],
    /* البحر الأحمر — الساحل الأفريقي */
    [[29.9,32.5],[27.2,33.8],[25.0,34.9],[22.9,36.0],[19.6,37.2],[15.6,39.5],[13.0,42.7]],
    /* البحر الأحمر — الساحل العربي */
    [[29.5,34.9],[27.0,35.8],[24.1,38.1],[22.8,39.03],[21.5,39.2],[18.5,41.0],[16.9,42.6],[14.8,42.9],[12.6,43.3]],
    /* الخليج العربي — الساحل العربي (مع جزيرة البحرين) */
    [[29.4,48.0],[27.0,49.7],[26.4,50.1],[26.2,50.6],[25.3,51.5],[24.5,54.4],[25.3,55.3],[26.2,56.4]],
    /* الخليج العربي — الساحل الإيراني */
    [[30.0,48.2],[28.9,50.8],[26.9,53.8],[26.6,54.9],[27.2,56.3]],
    /* خليج عمان والساحل الإيراني المكراني حتى كراتشي */
    [[26.2,56.4],[25.3,60.6],[25.2,62.3],[24.8,67.0]],
    /* ساحل عمان والإمارات الشرقي ثم البحر العربي إلى باب المندب */
    [[26.2,56.4],[25.1,56.4],[24.3,56.7],[23.6,58.5],[22.6,59.5],[19.7,57.7],[17.0,54.0],[16.7,53.2],[14.5,49.1],[12.8,45.0],[12.6,43.4]],
    /* الأطلسي المغربي ثم موريتانيا والسنغال */
    [[35.9,-5.9],[33.6,-7.6],[31.5,-9.8],[30.4,-9.6],[28.5,-11.4],[23.7,-15.9],[20.9,-17.1],[18.1,-16.0],[14.7,-17.5]],
    /* قناة السويس (بورسعيد ← السويس) */
    [[31.3,32.3],[30.5,32.3],[29.9,32.5]],
    /* البحر الأسود */
    [[41.0,29.1],[41.3,36.3],[43.6,39.7],[44.6,33.5],[46.5,30.7]],
    /* بحر قزوين */
    [[41.0,49.0],[38.5,49.3],[36.9,53.5],[40.0,52.9],[42.5,50.0]],
    /* أوروبا الغربية: الأطلسي والمانش وبحر الشمال والبلطيق */
    [[38.7,-9.1],[43.4,-8.4],[47.0,-2.2],[48.6,-3.5],[51.1,1.3],[51.9,4.5],[54.5,8.5],[55.5,12.5],[57.0,24.0],[59.4,24.7],[60.4,28.0],[60.4,5.3],[63.4,10.4],[69.6,18.9]],
    /* الجزر البريطانية */
    [[50.3,-4.4],[51.5,-3.2],[53.4,-3.0],[55.0,-1.5],[56.0,-3.2],[53.3,-6.2],[54.6,-5.9]],
    /* الساحل الشرقي الأمريكي */
    [[25.8,-80.2],[32.1,-80.9],[35.3,-75.5],[39.3,-74.4],[40.6,-73.9],[41.5,-70.7],[42.4,-71.0],[44.6,-63.6]],
    /* خليج المكسيك */
    [[29.9,-93.9],[29.2,-90.1],[30.4,-87.2],[27.9,-82.5],[25.2,-80.4],[19.8,-90.5],[21.0,-97.1]],
    /* الساحل الغربي الأمريكي */
    [[32.7,-117.2],[33.7,-118.2],[35.6,-121.9],[37.8,-122.4],[43.0,-124.3],[47.6,-122.3],[49.3,-123.1]],
    /* المحيط الهادئ المكسيكي وأمريكا الوسطى */
    [[19.0,-104.3],[16.9,-99.9],[15.6,-96.5],[14.6,-92.2],[8.9,-79.5]],
    /* أمريكا الجنوبية — الهادئ */
    [[-0.9,-80.7],[-12.0,-77.2],[-18.4,-70.3],[-23.6,-70.4],[-33.0,-71.6],[-37.8,-73.5],[-41.5,-73.8]],
    /* أمريكا الجنوبية — الأطلسي */
    [[-34.6,-58.4],[-38.0,-57.5],[-32.0,-52.1],[-27.6,-48.5],[-23.96,-46.3],[-22.9,-43.2],[-21.0,-40.8],[-19.0,-39.7],[-13.0,-38.5],[-8.1,-34.9],[-3.7,-38.5],[-1.5,-48.5]],
    /* غرب أفريقيا الأطلسي حتى الجنوب الأفريقي */
    [[5.3,-4.0],[6.4,3.4],[4.8,7.0],[4.0,9.7],[0.4,9.4],[-4.8,11.8],[-8.8,13.2],[-15.2,12.2],[-22.9,14.5],[-33.9,18.4]],
    /* شرق أفريقيا والمحيط الهندي */
    [[2.0,45.3],[-4.0,39.7],[-6.8,39.3],[-10.7,40.4],[-16.0,40.7],[-25.9,32.6],[-29.9,31.0],[-33.9,25.6]],
    /* جنوب آسيا */
    [[24.8,67.0],[23.0,68.3],[19.0,72.8],[15.3,74.1],[9.9,76.3],[13.1,80.3],[17.7,83.3],[21.7,88.3],[22.3,91.8]],
    /* جنوب شرق آسيا */
    [[16.8,96.2],[13.5,100.6],[10.3,106.7],[8.6,104.8],[6.1,102.2],[1.3,103.9],[5.8,95.3],[-6.2,106.8],[-7.2,112.7],[1.5,124.9],[14.6,121.0],[10.7,122.9],[7.1,125.5]],
    /* شرق آسيا */
    [[22.3,114.2],[24.5,118.1],[31.2,121.5],[36.1,120.4],[38.9,121.6],[35.1,129.1],[37.5,126.5],[35.6,139.7],[34.6,135.5],[41.8,141.5],[43.1,141.3]],
    /* أستراليا ونيوزيلندا */
    [[-27.5,153.0],[-33.9,151.2],[-37.8,145.0],[-34.8,138.5],[-32.0,115.9],[-20.3,118.6],[-12.5,130.8],[-16.9,145.8],[-36.9,174.8],[-41.3,174.8],[-43.5,172.6]]
  ];

  /* مسافة إلى قطعة سلسلة (إسقاط متساوي المستطيلات المحلي — دقة كافية لمئات الكيلومترات) */
  function distToSegKm(pLat, pLon, aLat, aLon, bLat, bLon) {
    var lat0 = ((pLat + aLat + bLat) / 3) * Math.PI / 180;
    var kx = 111.32 * Math.cos(lat0), ky = 110.57;
    var px = pLon * kx, py = pLat * ky;
    var ax = aLon * kx, ay = aLat * ky, bx = bLon * kx, by = bLat * ky;
    var dx = bx - ax, dy = by - ay;
    var L2 = dx * dx + dy * dy;
    var t = L2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    var cx = ax + t * dx, cy = ay + t * dy;
    return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
  }

  /* الموقع ساحلي إذا اقتربت مسارته إلى أقرب قطعة ساحل عن العتبة (50 كم) */
  function isCoastalPlace(place) {
    if (!place || !isNum(place.latitude) || !isNum(place.longitude)) return false;
    var best = Infinity;
    for (var c = 0; c < COAST_CHAINS.length; c++) {
      var ch = COAST_CHAINS[c];
      for (var i = 0; i < ch.length - 1; i++) {
        var d = distToSegKm(place.latitude, place.longitude, ch[i][0], ch[i][1], ch[i + 1][0], ch[i + 1][1]);
        if (d < best) best = d;
        if (best <= COASTAL_KM) return true;
      }
    }
    return best <= COASTAL_KM;
  }

  /* ══ 10-e) المرحلة 3 — القراءة 7: مؤشر ارتفاع مستوى سطح البحر ══ */

  /* الارتفاع التراكمي المسجّل (سم) فوق مستوى 1950 — 1.4 مم/سنة (1950–1992)
     ثم 3.3 مم/سنة في عصر القياس بالأقمار (1993–2024) */
  function seaRecCm(year) {
    if (year <= 1992) return (year - 1950) * SEA_OLD_RATE_MM / 10;
    return 43 * SEA_OLD_RATE_MM / 10 + (year - 1993) * SEA_SAT_RATE_MM / 10;
  }

  /* المسار المتوقع (سم) فوق مستوى 1950 وفق معدل السيناريو المختار */
  function seaProjCm(year, ssp) {
    return seaRecCm(2024) + (year - 2024) * SEA_PROJ_RATE_MM[ssp] / 10;
  }

  function buildSeaSvg(ssp) {
    var W = 760, H = 244;
    var x0 = 56, x1 = 738, y0 = 16, y1 = 196;
    var col = SSP_COLORS[ssp];
    var rec24 = seaRecCm(2024);
    var incr = (2050 - 2024) * SEA_PROJ_RATE_MM[ssp] / 10;
    var projMax = rec24 + incr * 1.3, projMin = rec24 + incr * 0.75;
    var yMax = niceCeil(projMax * 1.06);

    function X(yr) { return x0 + ((yr - 1950) / 100) * (x1 - x0); }
    function Y(v) { return y1 - (v / yMax) * (y1 - y0); }

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("sea_aria")
    });

    /* الشبكة الأفقية مع تسميات المحور الرأسي (سم) */
    for (var k = 0; k <= 4; k++) {
      var gy = y1 - (k / 4) * (y1 - y0);
      svg.appendChild(svgEl("line", { x1: x0, y1: gy, x2: x1, y2: gy, "class": k === 0 ? "mc-axis" : "mc-grid" }));
      svg.appendChild(svgText(x0 - 8, gy + 3.5, fmtInt(yMax * k / 4), "mc-tick", "end"));
    }

    /* محور السنوات — كل 10 سنوات (1950 … 2050) */
    for (var yr = 1950; yr <= 2050; yr += 10) {
      svg.appendChild(svgText(X(yr), y1 + 18, String(yr), "mc-tick", "middle"));
    }

    /* نطاق توقّع السيناريو (المسار الوسيط ± نطاق AR6 التقريبي) */
    svg.appendChild(svgEl("path", {
      d: "M" + X(2024).toFixed(1) + "," + Y(rec24).toFixed(1) +
        " L" + X(2050).toFixed(1) + "," + Y(projMax).toFixed(1) +
        " L" + X(2050).toFixed(1) + "," + Y(projMin).toFixed(1) + " Z",
      fill: col, "fill-opacity": "0.13"
    }));

    /* المسار المسجّل 1950–2024 (فيروزي صلب) */
    var recPts = [];
    for (var ry = 1950; ry <= 2024; ry++) {
      recPts.push(X(ry).toFixed(1) + "," + Y(seaRecCm(ry)).toFixed(1));
    }
    svg.appendChild(svgEl("polyline", { points: recPts.join(" "), fill: "none", stroke: "#24636c", "stroke-width": "2.2", "stroke-linejoin": "round" }));

    /* المسار المتوقع 2024–2050 (متقطع بلون السيناريو) */
    svg.appendChild(svgEl("polyline", {
      points: X(2024).toFixed(1) + "," + Y(rec24).toFixed(1) + " " + X(2050).toFixed(1) + "," + Y(rec24 + incr).toFixed(1),
      fill: "none", stroke: col, "stroke-width": "2.2", "stroke-dasharray": "6 4"
    }));

    /* فاصل «المسجّل / المتوقع» عند 2024 */
    svg.appendChild(svgEl("line", { x1: X(2024).toFixed(1), y1: y0, x2: X(2024).toFixed(1), y2: y1, "class": "mc-grid" }));
    var recLbl = svgText((X(2024) - 6).toFixed(1), y0 + 10, t("sea_recorded"), "mc-legend-word", "end");
    recLbl.setAttribute("fill", "#24636c");
    svg.appendChild(recLbl);
    var prjLbl = svgText((X(2024) + 6).toFixed(1), y0 + 10, t("sea_projected"), "mc-legend-word", "start");
    prjLbl.setAttribute("fill", col);
    svg.appendChild(prjLbl);

    /* نقطة 2050 وقيمتها النهائية (سم) */
    svg.appendChild(svgEl("circle", { cx: X(2050).toFixed(1), cy: Y(rec24 + incr).toFixed(1), r: 3.4, fill: col }));
    svg.appendChild(svgText((X(2050) - 8).toFixed(1), (Y(rec24 + incr) - 8).toFixed(1), "+" + fmt1(rec24 + incr) + " " + t("sea_cm"), "mc-bar-val", "end"));

    return svg;
  }

  /* تعبئة جسم قسم مؤشر البحر (يُعاد استدعاؤه عند تبديل السيناريو بلا شبكة) */
  function renderSeaInto(body) {
    body.textContent = "";
    var ssp = currentSsp();
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildSeaSvg(ssp));
    body.appendChild(wrap);
    var rec = seaRecCm(2024);
    var proj = seaProjCm(2050, ssp);
    body.appendChild(el("p", "mc-caption", t("sea_cap", {
      a: fmt1(rec), s: t("ssp_name_" + ssp), b: fmt1(proj), d: fmt1(proj - rec)
    })));
    body.appendChild(el("p", "mc-note", t("sea_method")));
  }

  function exportSea(ssp) {
    var st = initState();
    var rec = seaRecCm(2024);
    var proj = seaProjCm(2050, ssp);
    st.hist.sea = {
      coastal: true,
      cumulative2024cm: rec,
      projected2050cm: proj,
      rateMmPerYear: SEA_PROJ_RATE_MM[ssp],
      ssp: ssp
    };
    st.hist.available = true;
    st.updatedAt = new Date().toISOString();
  }

  /* إعادة رسم كل أقسام مؤشر البحر عند تبديل السيناريو (بلا أي طلب شبكة) */
  function rerenderSeaAll() {
    var roots = document.querySelectorAll("[data-matar-climate]");
    var found = false;
    for (var i = 0; i < roots.length; i++) {
      var attrV = (roots[i].getAttribute("data-matar-climate") || "").toLowerCase();
      if (attrV === "2050") continue;
      var bodies = roots[i].querySelectorAll(".mc-section.mc-sea .mc-body");
      for (var j = 0; j < bodies.length; j++) {
        renderSeaInto(bodies[j]);
        found = true;
      }
    }
    if (found) exportSea(currentSsp());
  }

  /* ══ 10-f) المرحلة 3 — محاكي 2050: جلب CMIP6 وتجميعه سنويًا ══ */

  function fetchClimate(place) {
    var url = CLIMATE_BASE +
      "?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&start_date=" + SIM_FIRST_YEAR + "-01-01" +
      "&end_date=" + SIM_LAST_YEAR + "-12-31" +
      "&models=" + CLIMATE_MODELS.join(",") +
      "&daily=temperature_2m_mean,temperature_2m_max,precipitation_sum";
    var p;
    if (typeof AbortController === "function") {
      var ctl = new AbortController();
      var tid = setTimeout(function () { ctl.abort(); }, CLIMATE_FETCH_TIMEOUT_MS);
      p = fetch(url, { signal: ctl.signal }).then(
        function (res) { clearTimeout(tid); return res; },
        function (err) { clearTimeout(tid); throw err; }
      );
    } else {
      p = fetch(url);
    }
    return p.then(function (res) {
      if (!res.ok) throw new Error("climate-http-" + res.status);
      return res.json();
    }).then(function (json) {
      if (!json || !json.daily || !Array.isArray(json.daily.time) || !json.daily.time.length) {
        throw new Error("climate-empty");
      }
      return json;
    });
  }

  /* استخراج سلاسل النماذج: تدعم الاستجابة المتداخلة (مصفوفة لكل نموذج)،
     والمسطحة (نموذج واحد)، وخرائط نموذج←مصفوفة — أيًّا كان شكل الواجهة */
  function modelSeries(daily, name) {
    var v = daily ? daily[name] : null;
    if (!v) return [];
    if (Array.isArray(v)) {
      if (v.length && Array.isArray(v[0])) return v;
      return [v];
    }
    if (typeof v === "object") {
      var out = [];
      for (var k in v) {
        if (Object.prototype.hasOwnProperty.call(v, k) && Array.isArray(v[k])) out.push(v[k]);
      }
      return out;
    }
    return [];
  }

  function computeSim2050(daily) {
    var time = daily.time || [];
    var meanS = modelSeries(daily, "temperature_2m_mean");
    var maxS = modelSeries(daily, "temperature_2m_max");
    var prS = modelSeries(daily, "precipitation_sum");
    var nM = Math.max(meanS.length, Math.max(maxS.length, prS.length));
    if (!nM || !time.length) return null;

    var years = [];
    var yIdx = {};
    for (var Y = SIM_FIRST_YEAR; Y <= SIM_LAST_YEAR; Y++) {
      yIdx[String(Y)] = years.length;
      years.push(Y);
    }
    var nY = years.length;
    var gridN = HOT_GRID_MAX - HOT_GRID_MIN + 1;

    /* مجمّعات لكل نموذج لكل سنة: مجموع/عدد المتوسط، مجموع/عدد المطر،
       وشبكة عتبات العظمى (عدد الأيام فوق كل عتبة — تُخزَّن منقّاة للسيناريوهات) */
    var tsum = [], tcnt = [], psum = [], pcnt = [], hot = [];
    for (var m = 0; m < nM; m++) {
      tsum[m] = []; tcnt[m] = []; psum[m] = []; pcnt[m] = []; hot[m] = [];
      for (var yi0 = 0; yi0 < nY; yi0++) {
        tsum[m][yi0] = 0; tcnt[m][yi0] = 0; psum[m][yi0] = 0; pcnt[m][yi0] = 0;
        var g = [];
        for (var gi = 0; gi < gridN; gi++) g.push(0);
        hot[m][yi0] = g;
      }
    }

    for (var i = 0; i < time.length; i++) {
      var yi = yIdx[String(time[i]).slice(0, 4)];
      if (yi === undefined) continue;
      for (var mm = 0; mm < nM; mm++) {
        var mv = meanS[mm] ? meanS[mm][i] : null;
        if (isNum(mv)) { tsum[mm][yi] += mv; tcnt[mm][yi]++; }
        var pv = prS[mm] ? prS[mm][i] : null;
        if (isNum(pv)) { psum[mm][yi] += pv; pcnt[mm][yi]++; }
        var xv = maxS[mm] ? maxS[mm][i] : null;
        if (isNum(xv)) {
          var row = hot[mm][yi];
          for (var T = HOT_GRID_MIN; T <= HOT_GRID_MAX; T++) {
            if (xv >= T) row[T - HOT_GRID_MIN]++;
            else break;
          }
        }
      }
    }

    var tmeanM = [], prM = [];
    for (var m2 = 0; m2 < nM; m2++) {
      tmeanM[m2] = []; prM[m2] = [];
      for (var yi1 = 0; yi1 < nY; yi1++) {
        tmeanM[m2][yi1] = tcnt[m2][yi1] > 0 ? tsum[m2][yi1] / tcnt[m2][yi1] : null;
        prM[m2][yi1] = pcnt[m2][yi1] > 0 ? psum[m2][yi1] : null;
      }
    }

    return {
      years: years,
      models: nM,
      tmeanM: tmeanM,
      prM: prM,
      hot: hot,
      gridMin: HOT_GRID_MIN,
      gridMax: HOT_GRID_MAX
    };
  }

  /* عدد الأيام فوق عتبة T (بين عتبتي الشبكة — باستيفاء خطي) */
  function hotCountAt(row, T) {
    if (!row || !row.length) return null;
    if (T <= HOT_GRID_MIN) return row[0];
    if (T >= HOT_GRID_MAX) return row[row.length - 1];
    var f = T - HOT_GRID_MIN;
    var j = Math.floor(f), r = f - j;
    return row[j] + (row[j + 1] - row[j]) * r;
  }

  function minArr(arr) {
    var m = null;
    for (var i = 0; i < arr.length; i++) {
      if (isNum(arr[i]) && (m === null || arr[i] < m)) m = arr[i];
    }
    return m;
  }

  function maxArr(arr) {
    var m = null;
    for (var i = 0; i < arr.length; i++) {
      if (isNum(arr[i]) && (m === null || arr[i] > m)) m = arr[i];
    }
    return m;
  }

  /* القيم الموقّعة (+/−) لصياغة الجمل */
  function sgn(v) { return v >= 0 ? "+" : "-"; }
  function signed1(v) { return isNum(v) ? sgn(v) + fmt1(Math.abs(v)) : "—"; }
  function signed2(v) { return isNum(v) ? sgn(v) + fmt2(Math.abs(v)) : "—"; }
  function signedInt(v) { return isNum(v) ? sgn(v) + fmtInt(Math.abs(v)) : "—"; }

  /* تطبيق سيناريو SSP على النواتج السنوية الخام محليًا:
     فرق كل نموذج عن خط الأساس × معامل السيناريو، وإزاحة عتبة الأيام
     الحارة بالقدر نفسه (عدّ الأيام فوق 40 − إزاحة العتبة قبل التحجيم) */
  function applyScenario(data, base, ssp) {
    var f = SSP_FACTORS[ssp];
    var years = data.years, nY = years.length, nM = data.models;
    var tMean = [], tMin = [], tMax = [], hMean = [], hMin = [], hMax = [], pMean = [], pMin = [], pMax = [];
    for (var yi = 0; yi < nY; yi++) {
      var tv = [], hv = [], pv = [];
      for (var m = 0; m < nM; m++) {
        var tm = data.tmeanM[m][yi];
        if (!isNum(tm) || !isNum(base.temp)) continue;
        var aM = tm - base.temp;
        tv.push(base.temp + aM * f);
        var row = data.hot[m] ? data.hot[m][yi] : null;
        if (row) {
          var Ts = HOT_THRESHOLD - aM * (f - 1);
          var c = hotCountAt(row, Ts);
          if (isNum(c)) hv.push(c);
        }
        var pr = data.prM[m][yi];
        if (isNum(pr) && isNum(base.precip)) {
          pv.push(base.precip + (pr - base.precip) * f);
        }
      }
      tMean.push(meanArr(tv)); tMin.push(minArr(tv)); tMax.push(maxArr(tv));
      hMean.push(meanArr(hv)); hMin.push(minArr(hv)); hMax.push(maxArr(hv));
      pMean.push(meanArr(pv)); pMin.push(minArr(pv)); pMax.push(maxArr(pv));
    }
    return {
      years: years, factor: f, models: nM,
      temp: { mean: tMean, min: tMin, max: tMax },
      hot: { mean: hMean, min: hMin, max: hMax },
      precip: { mean: pMean, min: pMin, max: pMax }
    };
  }

  /* متوسط الأيام فوق 40°م خلال 1981–2010 من ناتج GDD نفسه (به tmax 1980–2024) */
  function gddHotBaseline(res) {
    if (!res || !Array.isArray(res.years) || !Array.isArray(res.hot40)) return null;
    var vals = [];
    for (var i = 0; i < res.years.length; i++) {
      if (res.years[i] >= BASELINE_FIRST && res.years[i] <= BASELINE_LAST) vals.push(res.hot40[i]);
    }
    return meanArr(vals);
  }

  /* متوسط الهطول السنوي خلال 1981–2010 من ناتج SPEI نفسه */
  function speiBaseline(res) {
    if (!res || !Array.isArray(res.years) || !Array.isArray(res.precip)) return null;
    var vals = [];
    for (var i = 0; i < res.years.length; i++) {
      if (res.years[i] >= BASELINE_FIRST && res.years[i] <= BASELINE_LAST) vals.push(res.precip[i]);
    }
    return meanArr(vals);
  }

  /* خطوط الأساس الثلاثة للمحاكي — تشارك المتصفح نفس طلبات السجل التاريخي
     (الكاش والجلب المتزامن inflight) فلا تُطلق طلبات إضافية عند فتح المحاكي —
     v74.1: كلها من الحزمة الموحّدة الواحدة نفسها في الذاكرة */
  function loadBaselines(place) {
    var id = placeId(place);
    return Promise.all([
      cached("stripes", id, function () {
        return archiveDaily(place).then(function (daily) { return computeStripes(daily); });
      }),
      cached("gdd2", id, function () {
        return archiveDaily(place).then(function (daily) {
          return computeGdd(sliceDailyByYear(daily, GDD_FIRST_YEAR, GDD_LAST_YEAR));
        });
      }),
      cached("spei", id, function () {
        return archiveDaily(place).then(function (daily) {
          return computeSpei(sliceDailyByYear(daily, SPEI_FIRST_YEAR, SPEI_LAST_YEAR));
        });
      })
    ]).then(function (r) {
      return {
        temp: r[0] ? r[0].baseline : null,
        hot40: gddHotBaseline(r[1]),
        precip: speiBaseline(r[2])
      };
    });
  }

  /* ══ 10-g) بناء محتوى المحاكي: البطاقات + المنحنى التفاعلي ══ */

  function buildSimSvg(sc, base, ssp) {
    var W = 760, H = 252;
    var x0 = 56, x1 = 738, y0 = 18, y1 = 200;
    var years = sc.years, n = years.length;
    var col = SSP_COLORS[ssp];

    var allMin = isNum(base.temp) ? base.temp : null, allMax = allMin;
    for (var i = 0; i < n; i++) {
      if (isNum(sc.temp.min[i]) && (allMin === null || sc.temp.min[i] < allMin)) allMin = sc.temp.min[i];
      if (isNum(sc.temp.max[i]) && (allMax === null || sc.temp.max[i] > allMax)) allMax = sc.temp.max[i];
    }
    if (allMin === null || allMax === null) { allMin = 0; allMax = 10; }
    var pad = Math.max(0.4, (allMax - allMin) * 0.12);
    var yLo = allMin - pad, yHi = allMax + pad;

    function X(yr) { return x0 + ((yr - years[0]) / (years[n - 1] - years[0])) * (x1 - x0); }
    function Y(v) { return y1 - ((v - yLo) / (yHi - yLo)) * (y1 - y0); }

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("sim_aria")
    });

    /* الشبكة الأفقية وتسمياتها (°م) */
    for (var k = 0; k <= 4; k++) {
      var gy = y1 - (k / 4) * (y1 - y0);
      svg.appendChild(svgEl("line", { x1: x0, y1: gy, x2: x1, y2: gy, "class": k === 0 ? "mc-axis" : "mc-grid" }));
      svg.appendChild(svgText(x0 - 8, gy + 3.5, fmt1(yLo + (yHi - yLo) * k / 4), "mc-tick", "end"));
    }

    /* محور السنوات — كل 5 سنوات */
    for (var yr = years[0]; yr <= years[n - 1]; yr += 5) {
      svg.appendChild(svgText(X(yr), y1 + 18, String(yr), "mc-tick", "middle"));
    }

    /* نطاق عدم اليقين (Min–Max بين النماذج الخمسة) مظللًا بلون السيناريو */
    var upPts = [], loPts = [];
    for (var j = 0; j < n; j++) {
      if (isNum(sc.temp.max[j])) upPts.push(X(years[j]).toFixed(1) + "," + Y(sc.temp.max[j]).toFixed(1));
      if (isNum(sc.temp.min[j])) loPts.push(X(years[j]).toFixed(1) + "," + Y(sc.temp.min[j]).toFixed(1));
    }
    if (upPts.length > 1 && loPts.length > 1) {
      svg.appendChild(svgEl("path", {
        d: "M" + upPts.join(" L") + " L" + loPts.slice().reverse().join(" L") + " Z",
        fill: col, "fill-opacity": "0.15"
      }));
    }

    /* خط الأساس 1981–2010 (متقطع رمادي) */
    if (isNum(base.temp)) {
      var by = Y(base.temp).toFixed(1);
      svg.appendChild(svgEl("line", { x1: x0, y1: by, x2: x1, y2: by, stroke: "#7c8a86", "stroke-width": "1.3", "stroke-dasharray": "6 5" }));
      svg.appendChild(svgText(x0 + 6, (Y(base.temp) - 6).toFixed(1), t("curve_baseline"), "mc-legend-word", "start"));
    }

    /* منحنى المتوسط الجماعي */
    var pts = [];
    for (var q = 0; q < n; q++) {
      if (isNum(sc.temp.mean[q])) pts.push(X(years[q]).toFixed(1) + "," + Y(sc.temp.mean[q]).toFixed(1));
    }
    if (pts.length > 1) {
      svg.appendChild(svgEl("polyline", { points: pts.join(" "), fill: "none", stroke: col, "stroke-width": "2.4", "stroke-linejoin": "round" }));
    }

    /* نقطة 2050 وقيمتها النهائية */
    var iLast = n - 1;
    if (isNum(sc.temp.mean[iLast])) {
      svg.appendChild(svgEl("circle", { cx: X(years[iLast]).toFixed(1), cy: Y(sc.temp.mean[iLast]).toFixed(1), r: 3.4, fill: col }));
      svg.appendChild(svgText((X(years[iLast]) - 8).toFixed(1), (Y(sc.temp.mean[iLast]) - 8).toFixed(1), signed1(sc.temp.mean[iLast]) + deg(), "mc-bar-val", "end"));
    }

    /* مفتاح النطاق أسفل الرسم */
    svg.appendChild(svgEl("rect", { x: x0, y: y1 + 26, width: 10, height: 8, rx: 2, fill: col, "fill-opacity": "0.35" }));
    svg.appendChild(svgText(x0 + 16, y1 + 33.5, t("curve_band"), "mc-legend-word", "start"));

    /* التفاعل: خط إرشاد + نقطة + بطاقة قيمة تتبع أقرب سنة
       (بلا أحداث سطرية — CSP آمن عبر addEventListener وtextContent) */
    var guide = svgEl("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: col, "stroke-width": "1", "stroke-dasharray": "3 3", opacity: "0" });
    var dot = svgEl("circle", { cx: 0, cy: 0, r: 3.2, fill: col, stroke: "#fffdf8", "stroke-width": "1.2", opacity: "0" });
    var lbl = svgEl("text", { x: 0, y: y0 + 10, "class": "mc-bar-val", "text-anchor": "middle", opacity: "0" });
    lbl.textContent = "";
    svg.appendChild(guide); svg.appendChild(dot); svg.appendChild(lbl);

    var hit = svgEl("rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: "#000", "fill-opacity": "0" });
    hit.style.cursor = "crosshair";
    svg.appendChild(hit);

    function nearestYear(vx) {
      var f = (vx - x0) / (x1 - x0) * (n - 1);
      if (f < 0) f = 0; else if (f > n - 1) f = n - 1;
      return Math.round(f);
    }
    hit.addEventListener("pointermove", function (ev) {
      var rect = svg.getBoundingClientRect();
      if (!(rect.width > 0)) return;
      var vbX = ((ev.clientX - rect.left) / rect.width) * W;
      var idx = nearestYear(vbX);
      var yr = years[idx];
      var mv = sc.temp.mean[idx];
      guide.setAttribute("x1", X(yr).toFixed(1));
      guide.setAttribute("x2", X(yr).toFixed(1));
      guide.setAttribute("opacity", "0.55");
      dot.setAttribute("cx", X(yr).toFixed(1));
      dot.setAttribute("cy", isNum(mv) ? Y(mv).toFixed(1) : y0);
      dot.setAttribute("opacity", "1");
      var txt = String(yr) + " · " + signed1(mv) + deg();
      if (isNum(sc.temp.min[idx]) && isNum(sc.temp.max[idx])) {
        txt += " · " + fmt1(sc.temp.min[idx]) + "–" + fmt1(sc.temp.max[idx]);
      }
      lbl.textContent = txt;
      var lx = X(yr);
      if (lx > x1 - 60) lx = x1 - 60;
      if (lx < x0 + 60) lx = x0 + 60;
      lbl.setAttribute("x", lx.toFixed(1));
      lbl.setAttribute("opacity", "1");
    });
    hit.addEventListener("pointerleave", function () {
      guide.setAttribute("opacity", "0");
      dot.setAttribute("opacity", "0");
      lbl.setAttribute("opacity", "0");
    });

    return svg;
  }

  /* تعبئة جسم المحاكي: 3 بطاقات + منحنى + ملاحظات + التصدير الحي */
  function renderSimInto(body, data, base, ssp) {
    var sc = applyScenario(data, base, ssp);
    body.textContent = "";

    var i2050 = sc.years.indexOf(SIM_LAST_YEAR);
    if (i2050 < 0) i2050 = sc.years.length - 1;
    var warming = (isNum(sc.temp.mean[i2050]) && isNum(base.temp)) ? sc.temp.mean[i2050] - base.temp : null;
    var hotMean = sc.hot.mean[i2050];
    var precipPct = (isNum(base.precip) && base.precip > 0 && isNum(sc.precip.mean[i2050]))
      ? ((sc.precip.mean[i2050] - base.precip) / base.precip) * 100 : null;

    /* ثلاث بطاقات 2050 مقارنةً بخط الأساس 1981–2010 */
    var grid = el("div", "mc-stats");

    var c1 = el("div", "mc-stat");
    c1.appendChild(el("p", "mc-stat-label", t("card1_t")));
    var v1 = el("p", "mc-stat-value", isNum(warming) ? signed1(warming) + deg() : "—");
    v1.style.color = SSP_COLORS[ssp];
    c1.appendChild(v1);
    c1.appendChild(el("p", "mc-stat-note", t("card1_s")));
    grid.appendChild(c1);

    var c2 = el("div", "mc-stat");
    c2.appendChild(el("p", "mc-stat-label", t("card2_t")));
    var hv = isNum(hotMean) ? fmtInt(hotMean) : "—";
    if (isNum(sc.hot.min[i2050]) && isNum(sc.hot.max[i2050]) && sc.hot.max[i2050] > sc.hot.min[i2050]) {
      hv += " (" + fmtInt(sc.hot.min[i2050]) + "–" + fmtInt(sc.hot.max[i2050]) + ")";
    }
    c2.appendChild(el("p", "mc-stat-value", hv));
    c2.appendChild(el("p", "mc-stat-note", t("card2_s", { v: isNum(base.hot40) ? fmtInt(base.hot40) : "—" })));
    grid.appendChild(c2);

    var c3 = el("div", "mc-stat");
    c3.appendChild(el("p", "mc-stat-label", t("card3_t")));
    c3.appendChild(el("p", "mc-stat-value", isNum(precipPct) ? signedInt(precipPct) + "%" : "—"));
    c3.appendChild(el("p", "mc-stat-note", t("card3_s")));
    grid.appendChild(c3);

    body.appendChild(grid);

    /* منحنى 2025–2050 التفاعلي مع تظليل عدم اليقين */
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildSimSvg(sc, base, ssp));
    body.appendChild(wrap);

    body.appendChild(el("p", "mc-note", t("sim_method")));
    body.appendChild(el("p", "mc-note", t("sim_src")));

    /* التصدير الحي في window.__MATAR_CLIMATE_STATE.sim2050 */
    var st = initState();
    st.sim2050 = {
      available: true,
      failed: false,
      ssp: ssp,
      factor: SSP_FACTORS[ssp],
      models: sc.models,
      years: sc.years,
      temp: sc.temp,
      hot: sc.hot,
      precip: sc.precip,
      baseline: { temp: base.temp, hot40: base.hot40, precip: base.precip },
      cards: {
        warming2050: warming,
        hot40: { mean: sc.hot.mean[i2050], min: sc.hot.min[i2050], max: sc.hot.max[i2050] },
        hotBaseline: base.hot40,
        precipPct2050: precipPct
      },
      updatedAt: new Date().toISOString()
    };
    st.updatedAt = st.sim2050.updatedAt;
  }

  /* حاوية المحاكي data-matar-climate="2050" — تُستدعى من scan() */
  var simStore = null; /* ناتج المحاكي الجاهز للمكان الحالي (لإعادة رسم السيناريوهات بلا شبكة) */

  function render2050(root, place) {
    root.textContent = "";
    var wrap = el("div", "mc-root");
    root.appendChild(wrap);

    if (!place) {
      stateBaseSim(null, isEco());
      wrap.appendChild(el("p", "mc-noplace", t("no_place")));
      renderAdvisor();
      return;
    }

    /* شريحة الموقع — نفس أسلوب لوحة السجل التاريخي */
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
    stateBaseSim(place, eco);
    if (eco) {
      wrap.appendChild(el("p", "mc-eco-note", t("sim_eco")));
      renderAdvisor();
      return;
    }

    var sec = buildSection("sim");
    sec.cacheKind = "2050";
    showLoading(sec, "sim_loading");
    wrap.appendChild(sec.root);
    var id = placeId(place);
    simStore = null;

    var simPromise = cached("2050", id, function () {
      return fetchClimate(place).then(function (json) { return computeSim2050(json.daily || {}); });
    });

    Promise.all([simPromise, loadBaselines(place)]).then(function (res) {
      var data = res[0], base = res[1];
      if (!data || !isNum(base.temp)) throw new Error("sim-empty");
      if (!sec.root.isConnected) return; /* الحاوية أُعيد بناؤها لمكان آخر */
      simStore = { id: id, data: data, base: base };
      renderSimInto(sec.body, data, base, currentSsp());
      renderAdvisor();
    }, function () {
      var st = initState();
      if (st.sim2050) st.sim2050.failed = true;
      if (sec.root.isConnected) renderFail(sec, t("sim_error"));
      renderAdvisor();
    });
  }

  /* إعادة رسم المحاكي محليًا عند تبديل السيناريو — بلا أي طلب شبكة */
  function rerenderSimLocal() {
    var st = initState();
    if (st.sim2050) {
      st.sim2050.ssp = currentSsp();
      st.sim2050.factor = SSP_FACTORS[currentSsp()];
    }
    if (!simStore || !simStore.data || !simStore.base) return;
    var place = getPlace();
    if (!place || placeId(place) !== simStore.id) return;
    var roots = document.querySelectorAll('[data-matar-climate="2050"]');
    for (var i = 0; i < roots.length; i++) {
      var body = roots[i].querySelector(".mc-section.mc-sim .mc-body");
      if (body) renderSimInto(body, simStore.data, simStore.base, currentSsp());
    }
  }

  /* ══ 10-h) سيناريوهات SSP — الأزرار .climate-ssp[data-ssp] ══ */

  function normalizeSsp(raw) {
    var s = String(raw || "").toLowerCase().replace(/[\s_-]/g, "");
    if (s.indexOf("2.6") > -1 || s.indexOf("126") > -1) return "ssp126";
    if (s.indexOf("4.5") > -1 || s.indexOf("245") > -1) return "ssp245";
    if (s.indexOf("8.5") > -1 || s.indexOf("585") > -1) return "ssp585";
    return SSP_DEFAULT;
  }

  var currentSspVal = null;

  function currentSsp() {
    if (currentSspVal) return currentSspVal;
    var s = SSP_DEFAULT;
    try {
      var raw = localStorage.getItem(SSP_STORE_KEY);
      if (raw) {
        var n = normalizeSsp(raw);
        if (SSP_KEYS.indexOf(n) > -1) s = n;
      }
    } catch (e) { /* تجاهل */ }
    currentSspVal = s;
    return s;
  }

  function setScenario(rawSsp) {
    var ssp = normalizeSsp(rawSsp);
    currentSspVal = ssp;
    try { localStorage.setItem(SSP_STORE_KEY, ssp); } catch (e) { /* تجاهل */ }

    /* تحديث aria-pressed على كل أزرار السيناريوهات */
    var btns = document.querySelectorAll(".climate-ssp");
    for (var i = 0; i < btns.length; i++) {
      var on = normalizeSsp(btns[i].getAttribute("data-ssp")) === ssp;
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    }

    /* إعادة الرسم المحلية الفورية: البطاقات + المنحنى + مؤشر البحر + المستشار */
    rerenderSimLocal();
    rerenderSeaAll();
    renderAdvisor();
  }

  function bindSspButtons() {
    var btns = document.querySelectorAll(".climate-ssp");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        if (btn.dataset.mcSsp === "1") return;
        btn.dataset.mcSsp = "1";
        btn.addEventListener("click", function () {
          setScenario(btn.getAttribute("data-ssp"));
        });
      })(btns[i]);
    }
    /* الحالة الابتدائية للأزرار (السيناريو المحفوظ أو المتوسط افتراضيًا) */
    var cur = currentSsp();
    for (var j = 0; j < btns.length; j++) {
      var on = normalizeSsp(btns[j].getAttribute("data-ssp")) === cur;
      btns[j].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* ══ 10-i) المستشار الاستراتيجي للمناخ — بطاقة #climate-advisor-card ══ */

  var advVariant = 0;   /* مؤشر الصياغة الحالية (0/1/2) — يُديره زر «صياغة أخرى» */
  var advTid = 0;       /* تجميع إعادة الرسم بعد تدفق النواتج */
  var advStatusTid = 0; /* مسح رسالة المشاركة بعد لحظات */

  function scheduleAdvisor() {
    clearTimeout(advTid);
    advTid = setTimeout(renderAdvisor, 350);
  }

  function advisorVars(st) {
    var h = st.hist, s = st.sim2050 || {};
    var c = s.cards || {};
    return {
      r: h.warmingRate && isNum(h.warmingRate.perDecade) ? signed2(h.warmingRate.perDecade) : "—",
      g: h.gdd && isNum(h.gdd.recentAvg) && isNum(h.gdd.earlyAvg) ? signedInt(h.gdd.recentAvg - h.gdd.earlyAvg) : "—",
      d: h.spei && isNum(h.spei.trendPerDecade) ? signedInt(h.spei.trendPerDecade) : "—",
      hb: isNum(c.hotBaseline) ? fmtInt(c.hotBaseline) : "—",
      w: isNum(c.warming2050) ? signed1(c.warming2050) : "—",
      h: c.hot40 && isNum(c.hot40.mean) ? fmtInt(c.hot40.mean) : "—",
      p: isNum(c.precipPct2050) ? signedInt(c.precipPct2050) + "%" : "—",
      sea: h.sea && h.sea.coastal && isNum(h.sea.projected2050cm) ? t("adv_sea", { s: fmtInt(h.sea.projected2050cm) }) : "",
      ssp: t("ssp_name_" + currentSsp())
    };
  }

  function renderAdvisor() {
    var targets = [
      document.getElementById("climate-adv-agri"),
      document.getElementById("climate-adv-city"),
      document.getElementById("climate-adv-infra")
    ];
    if (!targets[0] && !targets[1] && !targets[2]) return;
    var st = initState();

    function fillAll(txt) {
      for (var i = 0; i < targets.length; i++) {
        if (targets[i]) targets[i].textContent = txt;
      }
    }

    if (st.eco) { fillAll(t("adv_eco")); return; }
    var sim = st.sim2050 || {};
    var simSettled = sim.available === true || sim.failed === true;
    if (!simSettled) { fillAll(t("adv_wait")); return; }

    var v = advisorVars(st);
    var texts = [
      t("adv_agri_" + advVariant, v),
      t("adv_city_" + advVariant, v),
      t("adv_infra_" + advVariant, v)
    ];
    for (var k = 0; k < targets.length; k++) {
      if (targets[k]) targets[k].textContent = texts[k];
    }
  }

  function advisorStatus(msg) {
    var card = document.getElementById("climate-advisor-card");
    if (!card) return;
    var node = document.getElementById("climate-adv-status");
    if (!node) {
      node = el("p", "mc-note mc-adv-status");
      node.id = "climate-adv-status";
      node.setAttribute("role", "status");
      card.appendChild(node);
    }
    node.textContent = msg || "";
    clearTimeout(advStatusTid);
    advStatusTid = setTimeout(function () { node.textContent = ""; }, 2800);
  }

  function shareAdvisor() {
    var agri = document.getElementById("climate-adv-agri");
    var city = document.getElementById("climate-adv-city");
    var infra = document.getElementById("climate-adv-infra");
    var place = getPlace();

    var lines = [t("adv_share_header")];
    if (place) {
      lines.push(t("adv_share_sub", { v: placeName(place), s: t("ssp_name_" + currentSsp()) }));
    }
    lines.push("");
    if (agri && agri.textContent) lines.push("• " + agri.textContent);
    if (city && city.textContent) lines.push("• " + city.textContent);
    if (infra && infra.textContent) lines.push("• " + infra.textContent);
    lines.push("");
    lines.push(t("adv_note"));
    var text = lines.join("\n");

    function tryClipboard() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { advisorStatus(t("adv_share_copy")); },
          function () { advisorStatus(t("adv_share_fail")); }
        );
      } else {
        advisorStatus(t("adv_share_fail"));
      }
    }

    if (navigator.share) {
      navigator.share({ text: text }).then(
        function () { advisorStatus(t("adv_share_ok")); },
        function () { tryClipboard(); } /* أُلغيت المشاركة أو فشلت → الحافظة */
      );
    } else {
      tryClipboard();
    }
  }

  function bindAdvisor() {
    var refresh = document.getElementById("climate-ai-refresh");
    if (refresh && refresh.dataset.mcAdv !== "1") {
      refresh.dataset.mcAdv = "1";
      refresh.addEventListener("click", function () {
        advVariant = (advVariant + 1) % 3;
        renderAdvisor();
      });
    }
    var share = document.getElementById("climate-ai-share");
    if (share && share.dataset.mcAdv !== "1") {
      share.dataset.mcAdv = "1";
      share.addEventListener("click", shareAdvisor);
    }
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

  /* ══ 12-b) مخطط مقارنة معدل الاحترار — ثلاثة أشرطة حول محور الصفر ══
     الموقع (يتلوّن بحكم المقارنة) · MENA الإقليمي +0.26 (ذهبي) · العالمي +0.18 (رمادي) */

  function buildRateSvg(rate) {
    var W = 760, H = 152;
    var lblX = 118;               /* عمود التسميات (text-anchor: end) */
    var plotL = 130, plotR = 744;  /* منطقة الأشرطة */
    var axisX = Math.round((plotL + plotR) / 2);
    var cityY = 22, menaY = 62, globY = 102, barH = 22;
    var half = (plotR - plotL) / 2;
    var mena = MENA_WARMING_PER_DECADE;
    var scaleMax = niceCeil(Math.max(Math.abs(rate.perDecade), mena, rate.globalPerDecade) * 1.25) || 1;
    var verdict = rateVerdict(rate.perDecade) || "par";

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("rate_aria")
    });

    /* محور الصفر الرأسي في منتصف منطقة الرسم */
    svg.appendChild(svgEl("line", { x1: axisX, y1: 12, x2: axisX, y2: globY + barH + 10, "class": "mc-rate-axis" }));

    function barRect(y, value, cls, fill) {
      var w = (Math.abs(value) / scaleMax) * half;
      var x = value >= 0 ? axisX : axisX - w;
      var r = svgEl("rect", { x: x.toFixed(1), y: y, width: Math.max(2, w).toFixed(1), height: barH, rx: 5, "class": cls });
      if (fill) r.setAttribute("fill", fill);
      return r;
    }
    function endX(value) { return axisX + (value >= 0 ? 1 : -1) * (Math.abs(value) / scaleMax) * half; }

    /* شريط المدينة — يتلوّن بحكم المقارنة (سريع أحمر · بطيء أخضر · موازٍ فيروزي · تبريد أزرق) */
    var cityBar = barRect(cityY, rate.perDecade, "mc-rate-bar");
    cityBar.setAttribute("data-verdict", verdict);
    svg.appendChild(cityBar);
    var cityValTxt = fmt2(rate.perDecade) + " " + t("rate_unit");
    if (rate.perDecade >= 0) {
      svg.appendChild(svgText((endX(rate.perDecade) + 8).toFixed(1), cityY + barH * 0.72, cityValTxt, "mc-rate-val", "start"));
    } else {
      /* القيمة السالبة تُكتب يمين المحور (الجهة الفارغة) كي لا تتراكب مع التسميات */
      svg.appendChild(svgText((axisX + 8).toFixed(1), cityY + barH * 0.72, cityValTxt, "mc-rate-val", "start"));
    }

    /* شريط المرجع الإقليمي MENA (+0.26°م/عقد) الذهبي */
    svg.appendChild(barRect(menaY, mena, "mc-rate-mena", "#d9935b"));
    svg.appendChild(svgText((endX(mena) + 8).toFixed(1), menaY + barH * 0.72, "+" + fmt2(mena) + " " + t("rate_unit"), "mc-rate-val", "start"));

    /* شريط المرجع العالمي الرمادي (+0.18°م/عقد) */
    svg.appendChild(barRect(globY, rate.globalPerDecade, "mc-rate-global"));
    svg.appendChild(svgText((endX(rate.globalPerDecade) + 8).toFixed(1), globY + barH * 0.72, "+" + fmt2(rate.globalPerDecade) + " " + t("rate_unit"), "mc-rate-val", "start"));

    /* تسميات الصفوف الثلاثة على يسار المحور */
    svg.appendChild(svgText(lblX, cityY + barH * 0.72, t("rate_city"), "mc-rate-lbl", "end"));
    svg.appendChild(svgText(lblX, menaY + barH * 0.72, t("rate_mena"), "mc-rate-lbl", "end"));
    svg.appendChild(svgText(lblX, globY + barH * 0.72, t("rate_global"), "mc-rate-lbl", "end"));

    return svg;
  }

  /* ══ 12-c) مخطط عجز/فائض الماء — أزرق رطب · برتقالي←أحمر جاف ══ */

  function mixHex(a, b, r) {
    var ca = hexRgb(a), cb = hexRgb(b);
    function ch(x, y) {
      var v = Math.round(x + (y - x) * r);
      return (v < 16 ? "0" : "") + v.toString(16);
    }
    return "#" + ch(ca[0], cb[0]) + ch(ca[1], cb[1]) + ch(ca[2], cb[2]);
  }

  function buildSpeiSvg(res) {
    var W = 760, H = 252;
    var x0 = 46, x1 = 738;
    var yTop = 18, yBase = 202, yZero = Math.round((yTop + yBase) / 2); /* خط الصفر */
    var years = res.years, vals = res.deficit;
    var n = years.length;
    var maxAbs = 0;
    for (var i = 0; i < n; i++) maxAbs = Math.max(maxAbs, Math.abs(vals[i]));
    var yMax = niceCeil(maxAbs * 1.08 || 50);
    var slot = (x1 - x0) / n;
    var bw = Math.min(15, slot * 0.7);
    var tr = speiTrend(res);

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      "class": "mc-svg",
      role: "img",
      "aria-label": t("spei_aria")
    });

    /* خطوط الشبكة عند ±yMax/2 و ±yMax مع تسمياتها (مم) */
    [1, 0.5, -0.5, -1].forEach(function (f) {
      var gy = yZero - f * (yZero - yTop);
      svg.appendChild(svgEl("line", { x1: x0, y1: gy, x2: x1, y2: gy, "class": "mc-grid" }));
      svg.appendChild(svgText(x0 - 8, gy + 3.5, (f > 0 ? "+" : "") + fmtInt(f * yMax), "mc-tick", "end"));
    });

    /* خط الصفر الصلب */
    svg.appendChild(svgEl("line", { x1: x0, y1: yZero, x2: x1, y2: yZero, "class": "mc-spei-zero" }));

    function Yv(v) { return yZero - (v / yMax) * (yZero - yTop); }

    /* الأعمدة السنوية: فائض أزرق فوق الصفر · عجز برتقالي←أحمر تحته حسب الشدة */
    for (var j = 0; j < n; j++) {
      var v = vals[j];
      var cx = x0 + slot * (j + 0.5);
      var rect;
      if (v >= 0) {
        var h = Math.max(2, (v / yMax) * (yZero - yTop));
        rect = svgEl("rect", { x: (cx - bw / 2).toFixed(1), y: (yZero - h).toFixed(1), width: bw.toFixed(1), height: h.toFixed(1), rx: 2.5, "class": "mc-spei-pos" });
      } else {
        var d = Math.max(2, (Math.abs(v) / yMax) * (yBase - yZero));
        var sev = Math.max(0, Math.min(1, Math.abs(v) / yMax));
        rect = svgEl("rect", { x: (cx - bw / 2).toFixed(1), y: yZero, width: bw.toFixed(1), height: d.toFixed(1), rx: 2.5, fill: mixHex("#e0792f", "#ab342e", sev), "class": "mc-spei-neg" });
      }
      svg.appendChild(rect);
    }

    /* خط اتجاه الانحدار (متقطع ذهبي) عبر كامل السلسلة */
    if (tr && isNum(tr.slopePerYear)) {
      var nx = meanArr(years), ny = meanArr(vals);
      function predV(yr) { return ny + tr.slopePerYear * (yr - nx); }
      svg.appendChild(svgEl("line", {
        x1: (x0 + slot * 0.5).toFixed(1),
        y1: Yv(predV(years[0])).toFixed(1),
        x2: (x0 + slot * (n - 0.5)).toFixed(1),
        y2: Yv(predV(years[n - 1])).toFixed(1),
        "class": "mc-spei-trend"
      }));
    }

    /* محور السنوات — كل 5 سنوات ثم ختام 2024 */
    for (var yr = SPEI_FIRST_YEAR; yr <= 2020; yr += 5) {
      var tx = x0 + slot * (yr - SPEI_FIRST_YEAR + 0.5);
      svg.appendChild(svgText(tx.toFixed(1), yBase + 16, String(yr), "mc-tick", "middle"));
    }
    svg.appendChild(svgText((x0 + slot * (n - 0.5)).toFixed(1), yBase + 16, String(SPEI_LAST_YEAR), "mc-tick", "middle"));

    /* مفتاح اللون أسفل الرسم: رطب/فائض أزرق · جاف/عجز برتقالي */
    var legY = yBase + 34;
    svg.appendChild(svgEl("rect", { x: x0, y: legY - 7, width: 10, height: 10, rx: 2.5, "class": "mc-spei-pos" }));
    svg.appendChild(svgText(x0 + 16, legY + 1.5, t("spei_wet"), "mc-legend-word", "start"));
    svg.appendChild(svgEl("rect", { x: x1 - 10, y: legY - 7, width: 10, height: 10, rx: 2.5, fill: mixHex("#e0792f", "#ab342e", 0.45), "class": "mc-spei-neg" }));
    svg.appendChild(svgText(x1 - 16, legY + 1.5, t("spei_dry"), "mc-legend-word", "end"));

    return svg;
  }

  /* ══ 13) هياكل الأقسام وحالات التحميل والخطأ ══ */

  var FEATURE_META = {
    stripes: { title: "stripes_title", sub: "stripes_sub", badge: "1950–2024" },
    heat: { title: "heat_title", sub: "heat_sub", badge: "P95 · P50" },
    gdd: { title: "gdd_title", sub: "gdd_sub", badge: "1980–2024" },
    frost: { title: "frost_title", sub: "frost_sub", badge: "2015–2024" },
    rate: { title: "rate_title", sub: "rate_sub", badge: "1950–2024" },
    spei: { title: "spei_title", sub: "spei_sub", badge: "1980–2024" },
    sea: { title: "sea_title", sub: "sea_sub", badge: "1950–2050" },
    sim: { title: "sim_title", sub: "sim_sub", badge: "CMIP6 × 5" }
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

  function showLoading(sec, key) {
    sec.body.textContent = "";
    var box = el("div", "mc-loading");
    box.appendChild(el("i"));
    box.appendChild(el("span", null, t(key || "loading")));
    sec.body.appendChild(box);
  }

  /* بطاقة خطأ مع زر إعادة محاولة يمسح كاش هذه الميزة وحدها — مع إسقاط
     توقيع الحاوية كي يُعاد بناء القسم فعليًا (cacheKind يدعم مفتاح 2050) */
  function renderFail(sec, msg) {
    sec.body.textContent = "";
    var box = el("div", "mc-error");
    box.appendChild(el("p", null, msg || t("error")));
    var btn = el("button", "mc-retry", t("retry"));
    btn.type = "button";
    btn.addEventListener("click", function () {
      var place = getPlace();
      if (place) cacheDel(CACHE_PREFIX + (sec.cacheKind || sec.kind) + ":" + placeId(place));
      var host = sec.root.closest ? sec.root.closest("[data-matar-climate]") : null;
      if (host) host.removeAttribute("data-mc-sig");
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

  /* الميزة 5: شريطا المقارنة + شارة الحكم + خلاصة مع ثبات R² */
  function renderRate(sec, rate) {
    sec.body.textContent = "";
    var verdict = rate ? rateVerdict(rate.perDecade) : null;
    if (!rate || !verdict || !isNum(rate.perDecade)) {
      renderFail(sec);
      return;
    }
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildRateSvg(rate));
    sec.body.appendChild(wrap);

    /* المقارنة الشاملة في سطر واحد: الموقع · MENA الإقليمي · العالمي (المرحلة 3) */
    sec.body.appendChild(el("p", "mc-caption", t("rate_line", {
      a: signed2(rate.perDecade),
      b: "+" + fmt2(MENA_WARMING_PER_DECADE),
      c: "+" + fmt2(rate.globalPerDecade)
    })));

    var v = fmt2(rate.perDecade), G = rate.globalPerDecade;
    var cap;
    if (verdict === "fast") {
      cap = el("p", "mc-caption", t("cap_rate_fast", { v: v, g: (rate.perDecade / G).toFixed(1) }));
    } else if (verdict === "cooling") {
      cap = el("p", "mc-caption", t("cap_rate_cooling", { v: v }));
    } else if (verdict === "slow") {
      cap = el("p", "mc-caption", t("cap_rate_slow", { v: v, p: fmtInt(Math.max(0, Math.round((rate.perDecade / G) * 100))) }));
    } else {
      cap = el("p", "mc-caption", t("cap_rate_par", { v: v }));
    }
    var badge = el("span", "mc-rate-badge", t("badge_rate_" + verdict));
    badge.setAttribute("data-verdict", verdict);
    cap.appendChild(badge);
    sec.body.appendChild(cap);

    if (isNum(rate.r2)) sec.body.appendChild(el("p", "mc-note", t("r2_note", { v: fmt2(rate.r2) })));
    sec.body.appendChild(el("p", "mc-note", t("rate_method")));
    sec.body.appendChild(buildSourceNote());
  }

  /* الميزة 6: أعمدة العجز/الفائض + خلاصة اتجاه الجفاف */
  function renderSpei(sec, res) {
    sec.body.textContent = "";
    if (!res || !Array.isArray(res.years)) {
      renderFail(sec);
      return;
    }
    var wrap = el("div", "mc-chart-wrap");
    wrap.appendChild(buildSpeiSvg(res));
    sec.body.appendChild(wrap);

    var tr = speiTrend(res);
    var verdict = speiVerdict(tr) || "stable";
    sec.body.appendChild(el("p", "mc-caption", t("cap_spei_" + verdict, {
      v: fmtInt(Math.abs(tr.perDecade)), a: fmtInt(tr.firstAvg), b: fmtInt(tr.lastAvg)
    })));
    sec.body.appendChild(el("p", "mc-note", t("spei_method")));
    sec.body.appendChild(buildSourceNote());
  }

  /* ══ 14-b) الحالة العامة window.__MATAR_CLIMATE_STATE ══
     كائن حي يُحدَّث مع كل ناتج محسوب — يقرأه محاكي 2050 والمستشار
     الاستراتيجي (المرحلة الثالثة) مباشرة دون أي طلب شبكة إضافي. */

  function initState() {
    if (!window.__MATAR_CLIMATE_STATE) {
      window.__MATAR_CLIMATE_STATE = {
        version: 74,
        updatedAt: null,
        place: null,
        eco: false,
        lang: "ar",
        hist: {
          available: false,
          stripes: null,
          warmingRate: null,
          heat: null,
          gdd: null,
          frost: null,
          spei: null,
          sea: null
        },
        sim2050: { available: false, failed: false, ssp: null, factor: null }
      };
    }
    var st = window.__MATAR_CLIMATE_STATE;
    if (!st.hist) st.hist = {};
    if (st.hist.sea === undefined) st.hist.sea = null;
    if (!st.sim2050) st.sim2050 = { available: false, failed: false, ssp: null, factor: null };
    return st;
  }

  function stateBase(place, eco) {
    var st = initState();
    st.place = place ? { latitude: place.latitude, longitude: place.longitude, name: placeName(place) } : null;
    st.eco = !!eco;
    st.lang = langKey();
    st.updatedAt = new Date().toISOString();
    st.hist.available = false;
    st.hist.stripes = null;
    st.hist.warmingRate = null;
    st.hist.heat = null;
    st.hist.gdd = null;
    st.hist.frost = null;
    st.hist.spei = null;
    st.hist.sea = null;
    return st;
  }

  /* إعادة ضبط قسم المحاكي فقط في الحالة العامة (دون المساس بنواتج السجل) */
  function stateBaseSim(place, eco) {
    var st = initState();
    st.place = place ? { latitude: place.latitude, longitude: place.longitude, name: placeName(place) } : null;
    st.eco = !!eco;
    st.lang = langKey();
    st.updatedAt = new Date().toISOString();
    st.sim2050 = { available: false, failed: false, ssp: currentSsp(), factor: SSP_FACTORS[currentSsp()] };
    return st;
  }

  function exportHist(field, value) {
    if (!value) return;
    var st = initState();
    st.hist[field] = value;
    st.hist.available = true;
    st.updatedAt = new Date().toISOString();
    scheduleAdvisor(); /* المرحلة 3: المستشار يُعاد بناؤه مع كل ناتج جديد */
  }

  function exportStripes(res) {
    if (!res) return;
    exportHist("stripes", {
      years: res.years, means: res.means, baseline: res.baseline,
      anomaly2024: (isNum(res.baseline) && isNum(res.means[res.means.length - 1]))
        ? res.means[res.means.length - 1] - res.baseline : null
    });
  }

  function exportRate(rate) {
    if (!rate || !isNum(rate.perDecade)) return;
    exportHist("warmingRate", {
      perDecade: rate.perDecade,
      globalPerDecade: rate.globalPerDecade,
      menaPerDecade: MENA_WARMING_PER_DECADE,
      verdict: rateVerdict(rate.perDecade),
      r2: isNum(rate.r2) ? rate.r2 : null,
      nYears: rate.nYears
    });
  }

  function exportHeatFrost(stats) {
    if (!stats) return;
    exportHist("heat", { p95: stats.p95, p50: stats.p50, min: stats.min, max: stats.max, nDays: stats.n });
    exportHist("frost", {
      years: stats.frostYears, counts: stats.frostCounts,
      last: stats.frostCounts[stats.frostCounts.length - 1],
      avgPrev: frostAverage(stats)
    });
  }

  function exportGdd(res) {
    if (!res) return;
    var av = gddAverages(res);
    exportHist("gdd", {
      years: res.years, gdd: res.gdd,
      hot40: res.hot40, hotBaseline: gddHotBaseline(res),
      earlyAvg: av.early, recentAvg: av.recent
    });
  }

  function exportSpei(res) {
    if (!res) return;
    var tr = speiTrend(res);
    if (!tr) return;
    exportHist("spei", {
      years: res.years, precip: res.precip, et0: res.et0, deficit: res.deficit,
      trendPerDecade: tr.perDecade, firstAvg: tr.firstAvg, lastAvg: tr.lastAvg,
      verdict: speiVerdict(tr)
    });
  }

  /* ══ 15) محرك العرض ══ */

  /* قراءة الميزات المطلوبة من قيمة السمة (all أو قائمة مفصولة بفواصل) */
  function wantedFeatures(root) {
    var v = (root.getAttribute("data-matar-climate") || "all").trim();
    var list;
    if (!v || v.toLowerCase() === "all" || v.toLowerCase() === "hist") {
      list = FEATURE_ORDER.slice();
    } else {
      list = v.split(",").map(function (s) { return s.trim(); }).filter(function (f) {
        return FEATURE_ORDER.indexOf(f) > -1;
      });
    }
    /* ترتيب العرض ثابت دائمًا حسب ترتيب المواصفة: شرائط ← حر ← نمو ← صقيع ← معدل الاحترار ← جفاف SPEI */
    list.sort(function (a, b) { return FEATURE_ORDER.indexOf(a) - FEATURE_ORDER.indexOf(b); });
    return list;
  }

  function render(root, place) {
    root.textContent = "";
    var wrap = el("div", "mc-root");
    root.appendChild(wrap);

    if (!place) {
      stateBase(null, isEco());
      wrap.appendChild(el("p", "mc-noplace", t("no_place")));
      scheduleAdvisor();
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
    stateBase(place, eco);
    if (eco) {
      wrap.appendChild(el("p", "mc-eco-note", t("eco_note"))); /* v74.1: النص الجديد يوضح أن السجل يعمل وأن المحاكي والمستشار وحدهما متوقفان */
    }

    /* ══ v74.1 — فك الارتباط بالوضع الاقتصادي ══
       قراءات السجل التاريخي السبع (الشرائط · الحرارة · النمو · الصقيع ·
       المعدل · الجفاف · البحر) تُحسب وتُعرض دائمًا مهما كان وضع الاقتصادي —
       الطلب الموحّد الواحد جعل تكلفتها الشبكية زهيدة، ووقفها كان يعلّق
       أقسام GDD وSPEI بلا مبرر. يبقى الوضع الاقتصادي موقفًا لمحاكي 2050
       والمستشار الاستراتيجي وحدهما (برسائلهما كما هما). */
    var feats = wantedFeatures(root);

    var secs = {};
    feats.forEach(function (k) {
      /* القراءة 7 — مؤشر البحر الساحلي: للمدن الساحلية فقط (يُحجب للداخلية) */
      if (k === "sea" && !isCoastalPlace(place)) return;
      var sec = buildSection(k);
      secs[k] = sec;
      if (k === "sea") {
        /* بلا شبكة: يُرسم فورًا من مسارات AR6 ويتجدّد مع تبديل السيناريو */
        renderSeaInto(sec.body);
        exportSea(currentSsp());
      } else {
        showLoading(sec);
      }
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

    /* 1) شرائط الاحترار: المتوسط اليومي 1950–2024 مُجمَّعًا سنويًا —
       v74.1: من الحزمة الموحّدة في الذاكرة (بلا أي طلب خاص بها) */
    if (secs.stripes) {
      cached("stripes", id, function () {
        return archiveDaily(place).then(function (daily) { return computeStripes(daily); });
      }).then(function (res) {
        exportStripes(res);
        if (secs.stripes && secs.stripes.root.isConnected) renderStripes(secs.stripes, res);
      }, fail("stripes"));
    }

    /* 2) سياق موجة الحر: العظمى والصغرى اليومية 2015–2024 (يُشاركه الصقيع) —
       v74.1: من الحزمة الموحّدة مقطوعة على 2015–2024 (النطاق نفسه السابق) */
    if (secs.heat || secs.frost) {
      cached("heat", id, function () {
        return archiveDaily(place).then(function (daily) {
          return computeHeatFrost(sliceDailyByYear(daily, HEAT_FIRST_YEAR, HEAT_LAST_YEAR));
        });
      }).then(function (stats) {
        exportHeatFrost(stats);
        if (secs.heat && secs.heat.root.isConnected) renderHeat(secs.heat, stats);
        if (secs.frost && secs.frost.root.isConnected) renderFrost(secs.frost, stats);
      }, function () {
        if (secs.heat && secs.heat.root.isConnected) renderFail(secs.heat);
        if (secs.frost && secs.frost.root.isConnected) renderFail(secs.frost);
      });
    }

    /* 3) وحدات النمو الزراعي: العظمى والصغرى 1980–2024 لموسم مارس–أكتوبر
       (+ سنويات الأيام فوق 40°م لخط أساس المحاكي — مفتاح gdd2 بناتج موسع)
       v74.1: من الحزمة الموحّدة مقطوعة على 1980–2024 (النطاق نفسه السابق) */
    if (secs.gdd) {
      cached("gdd2", id, function () {
        return archiveDaily(place).then(function (daily) {
          return computeGdd(sliceDailyByYear(daily, GDD_FIRST_YEAR, GDD_LAST_YEAR));
        });
      }).then(function (res) {
        exportGdd(res);
        if (secs.gdd && secs.gdd.root.isConnected) renderGdd(secs.gdd, res);
      }, fail("gdd"));
    }

    /* 4) القراءة 5 — معدل احترار المدينة: تشترك في ناتج الشرائط نفسه
       (انحدار على متوسطاته السنوية — بلا أي طلب شبكة إضافي) */
    if (secs.rate) {
      cached("stripes", id, function () {
        return archiveDaily(place).then(function (daily) { return computeStripes(daily); });
      }).then(function (res) {
        var rate = computeRate(res);
        exportRate(rate);
        if (secs.rate && secs.rate.root.isConnected) renderRate(secs.rate, rate);
      }, fail("rate"));
    }

    /* 5) القراءة 6 — مؤشر الجفاف: الأمطار والتبخر-نتح المرجعي 1980–2024 —
       v74.1: من الحزمة الموحّدة مقطوعة على 1980–2024 (النطاق نفسه السابق) */
    if (secs.spei) {
      cached("spei", id, function () {
        return archiveDaily(place).then(function (daily) {
          return computeSpei(sliceDailyByYear(daily, SPEI_FIRST_YEAR, SPEI_LAST_YEAR));
        });
      }).then(function (res) {
        exportSpei(res);
        if (secs.spei && secs.spei.root.isConnected) renderSpei(secs.spei, res);
      }, fail("spei"));
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
      return archiveDaily(place).then(function (daily) {
        return computeHeatFrost(sliceDailyByYear(daily, HEAT_FIRST_YEAR, HEAT_LAST_YEAR));
      });
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
      var attrV = (root.getAttribute("data-matar-climate") || "").trim().toLowerCase();
      var place = getPlace();
      /* v74.1: توقيع لوحة السجل بلا eco (لم يعد يؤثر فيها شيء) — ولوحة
         المحاكي يظل توقيعها يشمل eco لأن محاكاة 2050 ما زالت تتوقف
         اقتصاديًا برسالتها المعروفة */
      var sigBase = (place ? placeId(place) : "none") + "|" + langKey();
      var sig = attrV === "2050" ? (sigBase + "|" + (isEco() ? "1" : "0")) : sigBase;
      /* حاوية محاكي 2050 (المرحلة الثالثة) — تُبنى بنفس حارس التوقيع */
      if (attrV === "2050") {
        if (root.getAttribute("data-mc-sig") === sig && root.querySelector(".mc-root")) continue;
        root.setAttribute("data-mc-sig", sig);
        render2050(root, place);
        continue;
      }
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
    updateSegThumb(); /* إعادة تموضع إبهام المقسّم بعد ظهور الصفحة */
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

  /* ══ 16-b) شريط التبويبات المنزلق #climate-seg — بأسلوب الصفحة الشهرية ══
     إزاحة الإبهام .seg-thumb قياسًا فيزيائيًا (getBoundingClientRect) يُترجم
     إلى inset-inline-start فيعمل في RTL وLTR معًا دون أي فرع اتجاهي، مع
     تنقّل لوحة المفاتيح (أسهم/Home/End) بأسلوب roving tabindex. */

  var segResizeTid = 0;

  function segPlaceThumb(seg, thumb, btn, instant) {
    if (!seg || !thumb || !btn) return;
    var sr = seg.getBoundingClientRect();
    var br = btn.getBoundingClientRect();
    if (!(br.width > 0) || !(sr.width > 0)) return; /* الصفحة مخفية — يُعاد التموضع عند فتحها */
    var start = br.left - sr.left;
    var w = br.width;
    var isRtl = false;
    try { isRtl = (window.getComputedStyle(seg).direction === "rtl"); }
    catch (e) { isRtl = ((document.documentElement.dir || "ltr") + "").toLowerCase() === "rtl"; }
    var logical = isRtl ? (sr.width - start - w) : start;
    if (instant) thumb.style.transition = "none";
    try {
      thumb.style.insetInlineStart = logical.toFixed(1) + "px";
      thumb.style.width = w.toFixed(1) + "px";
    } catch (e) {
      if (isRtl) { thumb.style.right = logical.toFixed(1) + "px"; thumb.style.left = "auto"; }
      else { thumb.style.left = logical.toFixed(1) + "px"; thumb.style.right = "auto"; }
    }
    if (instant) {
      void thumb.offsetWidth; /* إعادة تدفق فورية لإلغاء الانتقال */
      thumb.style.transition = "";
    }
  }

  function segCurrentBtn(seg) {
    var sel = seg.querySelector('.seg-btn[aria-selected="true"]');
    return sel || seg.querySelector(".seg-btn");
  }

  function updateSegThumb() {
    var seg = document.getElementById("climate-seg");
    if (!seg) return;
    segPlaceThumb(seg, seg.querySelector(".seg-thumb"), segCurrentBtn(seg), false);
  }

  function selectSegPane(paneId) {
    var ids = ["climate-pane-hist", "climate-pane-2050", "climate-pane-map"];
    for (var i = 0; i < ids.length; i++) {
      var pane = document.getElementById(ids[i]);
      if (pane) pane.hidden = (ids[i] !== paneId);
    }
  }

  /* المرحلة الرابعة ستزوّد window.MatarClimateMap { init, resize } — الاستدعاء
     مشروط بوجودهما فلا تنكسر اللوحة قبل بناء خرائط مراقبة الأرض */
  function activateClimateMapPane() {
    try {
      if (window.MatarClimateMap && typeof window.MatarClimateMap.init === "function") {
        window.MatarClimateMap.init();
      }
    } catch (e) { /* تجاهل: الخرائط تُبنى في المرحلة 4 */ }
    setTimeout(function () {
      try {
        if (window.MatarClimateMap && typeof window.MatarClimateMap.resize === "function") {
          window.MatarClimateMap.resize();
        }
      } catch (e) { /* تجاهل */ }
    }, 220);
  }

  function initSegmented() {
    var seg = document.getElementById("climate-seg");
    if (!seg || seg.dataset.mcSeg === "1") return;
    seg.dataset.mcSeg = "1";
    var btns = seg.querySelectorAll(".seg-btn");
    var thumb = seg.querySelector(".seg-thumb");

    function select(btn, focus) {
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
        if (b === btn) b.removeAttribute("tabindex");
        else b.setAttribute("tabindex", "-1");
      }
      if (focus) btn.focus();
      segPlaceThumb(seg, thumb, btn, false);
      var paneId = btn.getAttribute("aria-controls");
      if (paneId) {
        selectSegPane(paneId);
        if (paneId === "climate-pane-map") activateClimateMapPane();
      }
    }

    for (var j = 0; j < btns.length; j++) {
      (function (btn) {
        btn.addEventListener("click", function () { select(btn, false); });
      })(btns[j]);
    }

    /* لوحة المفاتيح: أسهم + Home/End — السهم «الأمامي» يتبع اتجاه الكتابة */
    seg.addEventListener("keydown", function (ev) {
      var k = ev.key;
      var idx = -1;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute("aria-selected") === "true") { idx = i; break; }
      }
      var next = -1;
      if (k === "ArrowRight" || k === "ArrowLeft") {
        var fwd = k === "ArrowRight";
        if (((document.documentElement.dir || "ltr") + "").toLowerCase() === "rtl") fwd = !fwd;
        next = (idx + (fwd ? 1 : -1) + btns.length) % btns.length;
      } else if (k === "Home") {
        next = 0;
      } else if (k === "End") {
        next = btns.length - 1;
      }
      if (next > -1) {
        ev.preventDefault();
        select(btns[next], true);
      }
    });

    /* أول تموضع فوري بلا انتقال + إعادة التموضع عند تغيّر المقاس */
    segPlaceThumb(seg, thumb, segCurrentBtn(seg), true);
    window.addEventListener("resize", function () {
      clearTimeout(segResizeTid);
      segResizeTid = setTimeout(updateSegThumb, 220);
    });
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
        updateSegThumb(); /* تغيّرت اللغة — إعادة تموضع الإبهام على التبويب الحالي */
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "class"] });
  }

  function boot() {
    lastEco = isEco();
    lastLang = langKey();
    bindNav();
    initSegmented();
    bindSspButtons();  /* المرحلة 3: أزرار السيناريوهات SSP */
    bindAdvisor();     /* المرحلة 3: المستشار الاستراتيجي */
    purgeLegacyCache();
    renderAdvisor();   /* نص انتظار أولي حتى تصل النواتج */
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
    version: "74.1",
    /* إعادة البناء في كل عناصر data-matar-climate */
    render: scan,
    /* إعادة بناء كاملة متجاهلة حارس التوقيع (الكاش يبقى مستخدمًا) */
    refresh: function () {
      var roots = document.querySelectorAll("[data-matar-climate]");
      for (var i = 0; i < roots.length; i++) roots[i].removeAttribute("data-mc-sig");
      scan();
    },
    /* مسح كل مفاتيح كاش المناخ (matar:climate:v74:* ومنها 2050:*) مع إعادة بناء اختيارية */
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
    },
    /* المرحلة 3: تبديل السيناريو يدويًا من أي سكربت (تستخدمه المرحلة الرابعة أيضًا) */
    setScenario: setScenario,
    scenario: currentSsp
  };

})();
