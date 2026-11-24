/* ═══════════════════════════════════════════════════════════════════════════
   مَطَر برو — climate-map.js
   المرحلة 4-أ من «مرصد التغير المناخي العربي (1950 – 2050)»:
   خرائط مراقبة الأرض والمناخ من NASA GIBS و Esri Living Atlas
   ─────────────────────────────────────────────────────────────────────────
   ما يفعله هذا الملف:
     ① تهيئة كسولة (Lazy Init): لا تُبنى خريطة Leaflet ولا تُحمَّل أي بلاطة
        إلا عند أول استدعاء window.MatarClimateMap.init() — وهو ما يستدعيه
        climate.js (v74) عند فتح تبويب «🛰️ خرائط مراقبة الأرض»، مع
        window.MatarClimateMap.resize() بعد 220ms لإعادة التحجيم.
     ② احترام الوضع الاقتصادي والأجهزة الاقتصادية
        (localStorage "matar:eco" === "1" أو html.eco أو html.low-end):
        بلا خريطة وبلا بلاطات إطلاقًا — تُظهر بطاقة #climate-map-eco البديلة
        وتخفي #climate-leaflet-map و #climate-map-legend وشريط الطبقات.
        إن شُغّل الوضع الاقتصادي بعد بناء الخريطة تُدمَّر الخريطة فورًا
        (توقف تحميل أي بلاطات إضافية) وتُعاد طاهية نظيفة عند تعطيله.
     ③ التبديل الفوري بين الطبقات الأربع عبر أزرار .climate-layer-btn
        الموجودة في #climate-pane-map (data-layer="lst|ndvi|aod|esri"):
        · NASA LST  — حرارة سطح الأرض نهارًا (MODIS Terra، تاريخ قبل 3 أيام،
          maxNativeZoom 7 — GoogleMapsCompatible_Level7)
        · NASA NDVI — الغطاء النباتي والجفاف (مركّب 8 أيام، تاريخ قبل 10 أيام
          لضمان توفر المركّب، maxNativeZoom 9 — Level9)
        · NASA AOD  — الهباء الجوي والغبار (MODIS Combined VAAOD، تاريخ قبل
          3 أيام، maxNativeZoom 6 — Level6)
        · Esri Living Atlas — التضاريس والغطاء الأرضي (World_Physical_Map،
          maxNativeZoom 8) + طبقة مسميات حدودية شفافة
          (Reference/World_Boundaries_and_Places) لوضوح أسماء المدن.
     ④ أساس الخريطة Esri World_Dark_Gray_Base تحت طبقات ناسا شبه الشفافة
        (opacity 0.78) فتظهر السواحل والحدود بوضوح، وعلامة أنيقة ذهبية
        نابضة على إحداثيات الموقع النشط مع تحريك الخريطة تلقائيًا عند
        تغيّر الموقع عبر حدث "matar:data" (نفس الحدث الذي يستمع له
        climate.js على document) وقراءة الموقع من جسر التطبيق نفسه:
        __matarBridge.state.place ← localStorage "matar:place" ←
        __MATAR_CLIMATE_STATE.place.
     ⑤ مفتاح ألوان تفاعلي (#climate-map-legend → #climate-legend-body):
        شريط متدرج بألوان الطبقة النشطة + شرح الدلالة العلمية + شارة تاريخ
        الصورة + حدّ التكبير الأصلي — بجميع اللغات السبع
        (ar · en · fr · de · es · pt · it) ويُعاد بناؤه تلقائيًا عند تبديل
        الطبقة أو تغيير لغة الواجهة (document.documentElement.lang).

   الالتزام بـ CSP (script-src 'self' بلا unsafe-inline):
     · صفر innerHTML / insertAdjacentHTML في هذا الملف — كل نص عبر
       textContent وكل عنصر عبر createElement وتنسيقات عبر el.style فقط.
     · العلامة تُرسم بدائرتي Leaflet SVG (circleMarker) بلا divIcon.
     · أنماط عناصر المفتاح والنبضة تُحقن مرة واحدة بعنصر <style> عبر
       textContent (style-src يسمح 'unsafe-inline' في سياسة التطبيق).
     · لا أي كود داخلي inline — الملف يُحمَّل من index.html بـ
       <script src="./climate-map.js" defer></script> بعد climate.js.

   الواجهة العامة (window.MatarClimateMap):
     init()      — تهيئة كسولة (idempotent: استدعاءات متكررة آمنة)
     resize()    — إعادة تحجيم الخريطة عند تبديل التبويبات أو الشاشة
     setLayer(k) — تبديل الطبقة برمجيًا ("lst"|"ndvi"|"aod"|"esri")
     getLayer()  — مفتاح الطبقة النشطة
     locate(lat, lon, name) — وضع/تحريك علامة الموقع يدويًا (للمراحل القادمة)
     isEco()     — هل الوضع الاقتصادي/الجهاز الاقتصادي نشط الآن؟
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {

  /* ══ 1) ثوابت المعرّفات (مطابقة حرفيًا لقسم #page-climate في index.html) ══ */

  var MAP_ID = "climate-leaflet-map";
  var LEG_ID = "climate-map-legend";
  var LEG_BODY_ID = "climate-legend-body";
  var ECO_ID = "climate-map-eco";
  var PANE_ID = "climate-pane-map";
  var LAYERS_BAR_SEL = ".climate-layers";
  var LAYERS_LBL_SEL = ".climate-layers-label";
  var HINT_SEL = ".climate-map-hint";
  var BTN_CLS = "climate-layer-btn";
  var LAYER_ATTR = "data-layer";

  /* ══ 2) أساس الخريطة وطبقة المسميات (Esri Living Atlas) ══ */

  var BASE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  var BASE_ATTR = "© Esri · Dark Gray Canvas";
  var REF_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
  var REF_ATTR = "© Esri · Boundaries & Places";

  /* ══ 3) تعريف الطبقات الأربع — الروابط كما وردت حرفيًا في مواصفة المرحلة ══
        date: تُحسب عند الإقلاع (refreshDates) — LST/AOD قبل 3 أيام،
        NDVI قبل 10 أيام لضمان توفر مركّب الـ 8 أيام من ناسا.
        nat: maxNativeZoom (أعلى مستوى بلاطات أصلي قبل التمديد).
        op : شفافية الطبقة فوق الأساس الداكن (0.78 لطبقات ناسا). */

  var LAYERS = {
    lst: {
      nat: 7,
      op: 0.78,
      date: null,
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/{DATE}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png",
      attr: "NASA EOSDIS GIBS · MODIS Terra LST",
      grad: "linear-gradient(90deg, #262571 0%, #2f6fc4 12%, #37b7d9 26%, #2fb26e 40%, #9ace3f 54%, #eee63a 68%, #f59c2c 82%, #d4321e 100%)"
    },
    ndvi: {
      nat: 9,
      op: 0.78,
      date: null,
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{DATE8}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
      attr: "NASA EOSDIS GIBS · MODIS Terra NDVI 8-Day",
      grad: "linear-gradient(90deg, #8c6239 0%, #b58a52 16%, #d4b06e 32%, #cdd06a 48%, #7fae4a 64%, #3f7e32 80%, #1e5b23 100%)"
    },
    aod: {
      nat: 6,
      op: 0.78,
      date: null,
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Combined_Value_Added_AOD/default/{DATE}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
      attr: "NASA EOSDIS GIBS · MODIS Combined VAAOD",
      grad: "linear-gradient(90deg, #4aa9dd 0%, #62c8c9 12%, #7fd06b 28%, #d8e04b 44%, #f4b63c 60%, #ef7d2e 76%, #d9391f 88%, #8f1b12 100%)"
    },
    esri: {
      nat: 8,
      op: 1,
      date: null,
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
      ref: REF_URL,
      attr: "Esri · USGS · NOAA",
      grad: null
    }
  };

  /* شرائح ألوان الغطاء الأرضي لطبقة Esri (تظهر في المفتاح بدل الشريط المتدرج) */
  var ESRI_SWATCHES = ["#3f7e32", "#d4b06e", "#8c6239", "#2f6fc4", "#e8f1f7"];

  /* ══ 4) القاموس السباعي لمفتاح الألوان والدلالة العلمية ══
        img_date:   شارة تاريخ صورة القمر الصناعي {d}
        static_map: شارة «خريطة مرجعية ثابتة» لطبقة Esri
        zoom_note:  حد التكبير الأصلي {z}
        active_loc: نص علامة الموقع عند غياب الاسم
        lst/ndvi/aod/esri: الاسم المختصر + طرفا المقياس + الشرح العلمي
        esri.chips: تسميات شرائح ألوان الغطاء الأرضي الخمس */

  var STR = {
    ar: {
      img_date: "صورة بتاريخ {d}",
      static_map: "خريطة مرجعية ثابتة",
      zoom_note: "أعلى تفصيل أصلي حتى تكبير {z}",
      active_loc: "الموقع النشط",
      lst: {
        nm: "حرارة سطح الأرض",
        min: "−25°م · بارد",
        max: "+45°م · ساخن",
        desc: "حرارة سطح التربة والأسفلت والمباني كما يرصدها القمر الصناعي نهارًا (نحو 10:30 صباحًا) — تختلف عن حرارة الهواء في الظل: الأزرق سطح بارد، والأحمر سطح محترق كما في الصحارى والمدن الكثيفة. تُستخدم لرصد موجات الحر وإجهاد المحاصيل والجفاف."
      },
      ndvi: {
        nm: "الغطاء النباتي NDVI",
        min: "0 · تربة جرداء",
        max: "1 · نبات كثيف",
        desc: "مؤشر الفرق النباتي المعياري (NDVI) يقيس كثافة النبات من انعكاس الضوء الأحمر والقريب من الأحمر: البني والبيج أرض جرداء أو إجهاد مائي، والأخضر الغامق غطاء نباتي نشط — نافذة مباشرة على الجفاف الزراعي وصحة المراعي (مركّب 8 أيام)."
      },
      aod: {
        nm: "الهباء والغبار AOD",
        min: "0 · هواء صافٍ",
        max: "1+ · غبار كثيف",
        desc: "عمق العتامة البصرية للهباء (AOD) يقيس مجموع الغبار والدخان والتلوث في عمود الهواء كله: الأزرق هواء صافٍ، ثم يتدرج نحو الأحمر الغامق مع العجاج والدخان الكثيف — أداة أساسية لمتابعة العواصف الترابية وجودة الهواء."
      },
      esri: {
        nm: "التضاريس والغطاء الأرضي",
        desc: "خريطة طبيعية مرجعية عالية الجودة من Esri Living Atlas: الجبال والهضاب والسهول والصحارى والأنهار والغطاء الأرضي الثابت، مع طبقة مسميات شفافة لأسماء المدن والحدود — سياق جغرافي دائم لتفسير طبقات ناسا الحية فوقه.",
        chips: ["غابات ومراعٍ", "صحارى ورمال", "جبال ومرتفعات", "مياه وأنهار", "ثلوج وجليد"]
      }
    },
    en: {
      img_date: "Image dated {d}",
      static_map: "Static reference map",
      zoom_note: "Native detail up to zoom {z}",
      active_loc: "Active location",
      lst: {
        nm: "Land surface temperature",
        min: "−25 °C · cold",
        max: "+45 °C · hot",
        desc: "Skin temperature of soil, asphalt and rooftops as the satellite sees it in the late morning (~10:30 local) — different from shaded air temperature: blue is a cold surface, red a scorching one as in deserts and dense cities. Used to track heat waves, crop stress and drought."
      },
      ndvi: {
        nm: "Vegetation NDVI",
        min: "0 · bare soil",
        max: "1 · dense canopy",
        desc: "The Normalized Difference Vegetation Index measures plant density from red and near-infrared reflectance: browns and tans are bare or water-stressed land, dark green a thriving canopy — a direct window on agricultural drought and rangeland health (8-day composite)."
      },
      aod: {
        nm: "Aerosols & dust AOD",
        min: "0 · clean air",
        max: "1+ · thick dust",
        desc: "Aerosol Optical Depth sums all dust, smoke and pollution in the whole air column: blue is clean air, then the ramp darkens through yellow to deep red with dust storms or dense smoke — essential for tracking dust plumes and air quality."
      },
      esri: {
        nm: "Terrain & land cover",
        desc: "A high-quality physical reference map from Esri Living Atlas: mountains, plateaus, plains, deserts, rivers and static land cover, with a transparent labels layer for city names and borders — a permanent geographic context for the live NASA layers above it.",
        chips: ["Forests & rangeland", "Deserts & sands", "Mountains & highlands", "Water & rivers", "Snow & ice"]
      }
    },
    fr: {
      img_date: "Image du {d}",
      static_map: "Carte de référence statique",
      zoom_note: "Détail natif jusqu’au zoom {z}",
      active_loc: "Position active",
      lst: {
        nm: "Température de surface",
        min: "−25 °C · froid",
        max: "+45 °C · brûlant",
        desc: "Température de peau du sol, de l’asphalte et des toitures vue par satellite en fin de matinée (≈ 10h30 locales) — différente de la température de l’air à l’ombre : le bleu signale une surface froide, le rouge une surface brûlante comme dans les déserts et les villes denses. Sert à suivre vagues de chaleur, stress des cultures et sécheresse."
      },
      ndvi: {
        nm: "Végétation NDVI",
        min: "0 · sol nu",
        max: "1 · couvert dense",
        desc: "L’indice NDVI mesure la densité végétale via la réflexion rouge et infrarouge proche : brun et beige sont des sols nus ou en stress hydrique, le vert foncé un couvert vigoureux — fenêtre directe sur la sécheresse agricole et la santé des parcours (composite 8 jours)."
      },
      aod: {
        nm: "Aérosols et poussière AOD",
        min: "0 · air pur",
        max: "1+ · poussière dense",
        desc: "L’épaisseur optique des aérosols cumule poussière, fumée et pollution dans toute la colonne d’air : le bleu est un air pur, puis la rampe fonce du jaune au rouge profond avec les tempêtes de poussière ou la fumée dense — outil essentiel pour suivre les panaches et la qualité de l’air."
      },
      esri: {
        nm: "Relief et occupation du sol",
        desc: "Carte physique de référence de haute qualité d’Esri Living Atlas : montagnes, plateaux, plaines, déserts, rivières et couverture du sol stable, avec une couche d’étiquettes transparente pour les villes et les frontières — un contexte géographique permanent pour interpréter les couches NASA vivantes.",
        chips: ["Forêts et parcours", "Déserts et sables", "Montagnes et reliefs", "Eaux et rivières", "Neige et glace"]
      }
    },
    de: {
      img_date: "Bild vom {d}",
      static_map: "Statische Referenzkarte",
      zoom_note: "Native Auflösung bis Zoomstufe {z}",
      active_loc: "Aktiver Ort",
      lst: {
        nm: "Oberflächentemperatur",
        min: "−25 °C · kalt",
        max: "+45 °C · heiß",
        desc: "Hauttemperatur von Boden, Asphalt und Dächern, wie das Satellit sie am späten Vormittag (~10:30 Ortszeit) sieht — anders als die Lufttemperatur im Schatten: Blau ist eine kalte, Rot eine gluthitze Oberfläche wie in Wüsten und dichten Städten. Dient der Verfolgung von Hitzewellen, Pflanzenstress und Dürre."
      },
      ndvi: {
        nm: "Vegetation NDVI",
        min: "0 · nackter Boden",
        max: "1 · dichter Bestand",
        desc: "Der NDVI misst die Pflanzendichte aus Rot- und Nahinfrarot-Reflexion: Braun und Beige sind nackter oder wassergestresster Boden, Dunkelgrün ein vitaler Pflanzenbestand — ein direktes Fenster auf landwirtschaftliche Dürre und Weidengesundheit (8-Tage-Komposit)."
      },
      aod: {
        nm: "Aerosole und Staub AOD",
        min: "0 · saubere Luft",
        max: "1+ · dichter Staub",
        desc: "Die optische Dicke der Aerosole summiert Staub, Rauch und Verschmutzung über die ganze Luftsäule: Blau ist saubere Luft, die Rampe vertieft sich von Gelb bis Dunkelrot bei Staubstürmen oder dichtem Rauch — zentral für die Verfolgung von Staubfahnen und Luftqualität."
      },
      esri: {
        nm: "Gelände und Landbedeckung",
        desc: "Hochwertige physische Referenzkarte aus dem Esri Living Atlas: Gebirge, Hochebenen, Ebenen, Wüsten, Flüsse und stabile Landbedeckung, plus transparente Beschriftungsebene für Städte und Grenzen — ein dauerhafter geografischer Rahmen für die lebendigen NASA-Ebenen darüber.",
        chips: ["Wälder und Weiden", "Wüsten und Sand", "Gebirge und Höhen", "Gewässer und Flüsse", "Schnee und Eis"]
      }
    },
    es: {
      img_date: "Imagen del {d}",
      static_map: "Mapa de referencia estático",
      zoom_note: "Detalle nativo hasta zoom {z}",
      active_loc: "Ubicación activa",
      lst: {
        nm: "Temperatura de superficie",
        min: "−25 °C · frío",
        max: "+45 °C · ardiente",
        desc: "Temperatura de piel del suelo, el asfalto y los tejados vista por satélite a media mañana (≈ 10:30 local) — distinta de la temperatura del aire a la sombra: el azul es superficie fría, el rojo superficie abrasadora como en desiertos y ciudades densas. Sirve para rastrear olas de calor, estrés de cultivos y sequía."
      },
      ndvi: {
        nm: "Vegetación NDVI",
        min: "0 · suelo desnudo",
        max: "1 · dosel denso",
        desc: "El índice NDVI mide la densidad vegetal por la reflexión roja e infrarroja cercana: marrones y beiges son suelo desnudo o con estrés hídrico, el verde oscuro es un dosel vigoroso — ventana directa a la sequía agrícola y la salud de pastizales (compuesto de 8 días)."
      },
      aod: {
        nm: "Aerosoles y polvo AOD",
        min: "0 · aire limpio",
        max: "1+ · polvo denso",
        desc: "La profundidad óptica de aerosoles suma todo el polvo, humo y contaminación en la columna de aire: el azul es aire limpio, y la rampa se oscurece del amarillo al rojo profundo con tormentas de polvo o humo denso — esencial para seguir plumas de polvo y calidad del aire."
      },
      esri: {
        nm: "Relieve y cubierta terrestre",
        desc: "Mapa físico de referencia de alta calidad de Esri Living Atlas: montañas, mesetas, llanuras, desiertos, ríos y cubierta estable del suelo, con una capa transparente de nombres de ciudades y fronteras — contexto geográfico permanente para interpretar las capas vivas de la NASA.",
        chips: ["Bosques y pastizales", "Desiertos y arenas", "Montañas y altiplanos", "Aguas y ríos", "Nieve y hielo"]
      }
    },
    pt: {
      img_date: "Imagem de {d}",
      static_map: "Mapa de referência estático",
      zoom_note: "Detalhe nativo até ao zoom {z}",
      active_loc: "Localização ativa",
      lst: {
        nm: "Temperatura à superfície",
        min: "−25 °C · frio",
        max: "+45 °C · escaldante",
        desc: "Temperatura de pele do solo, do asfalto e dos telhados vista por satélite no fim da manhã (≈ 10h30 locais) — diferente da temperatura do ar à sombra: o azul é superfície fria, o vermelho superfície escaldante como nos desertos e cidades densas. Serve para seguir ondas de calor, stress das culturas e seca."
      },
      ndvi: {
        nm: "Vegetação NDVI",
        min: "0 · solo nu",
        max: "1 · coberto denso",
        desc: "O índice NDVI mede a densidade vegetal pela reflexão vermelha e infravermelha próxima: castanhos e beges são solo nu ou em stress hídrico, o verde escuro é coberto vigoroso — janela direta para a seca agrícola e a saúde das pastagens (composto de 8 dias)."
      },
      aod: {
        nm: "Aerossóis e poeira AOD",
        min: "0 · ar limpo",
        max: "1+ · pó denso",
        desc: "A profundidade ótica dos aerossóis soma todo o pó, fumo e poluição na coluna de ar: o azul é ar limpo, e a rampa escurece do amarelo ao vermelho profundo com tempestades de pó ou fumo denso — essencial para seguir plumas e a qualidade do ar."
      },
      esri: {
        nm: "Relevo e coberto terrestre",
        desc: "Mapa físico de referência de alta qualidade do Esri Living Atlas: montanhas, planaltos, planícies, desertos, rios e coberto estável do solo, com uma camada transparente de nomes de cidades e fronteiras — contexto geográfico permanente para interpretar as camadas vivas da NASA.",
        chips: ["Florestas e pastagens", "Desertos e areias", "Montanhas e altiplanos", "Águas e rios", "Neve e gelo"]
      }
    },
    it: {
      img_date: "Immagine del {d}",
      static_map: "Mappa di riferimento statica",
      zoom_note: "Dettaglio nativo fino a zoom {z}",
      active_loc: "Posizione attiva",
      lst: {
        nm: "Temperatura di superficie",
        min: "−25 °C · freddo",
        max: "+45 °C · rovente",
        desc: "Temperatura di pelle di suolo, asfalto e tetti vista da satellite a tarda mattina (≈ 10:30 locali) — diversa dalla temperatura dell’aria all’ombra: il blu è superficie fredda, il rosso superficie rovente come nei deserti e nelle città dense. Serve a seguire ondate di calore, stress delle colture e siccità."
      },
      ndvi: {
        nm: "Vegetazione NDVI",
        min: "0 · suolo nudo",
        max: "1 · chioma densa",
        desc: "L’indice NDVI misura la densità vegetale dalla riflessione rossa e infrarossa vicina: marroni e beige sono suolo nudo o in stress idrico, il verde scuro è chioma rigogliosa — finestra diretta sulla siccità agricola e la salute dei pascoli (composizione di 8 giorni)."
      },
      aod: {
        nm: "Aerosol e polvere AOD",
        min: "0 · aria pulita",
        max: "1+ · polvere densa",
        desc: "Lo spessore ottico degli aerosol somma tutta la polvere, il fumo e l’inquinamento nella colonna d’aria: il blu è aria pulita, e la rampa si scurisce dal giallo al rosso profondo con tempeste di polvere o fumo denso — essenziale per seguire pennacchi e qualità dell’aria."
      },
      esri: {
        nm: "Terreno e copertura del suolo",
        desc: "Mappa fisica di riferimento di alta qualità da Esri Living Atlas: montagne, altopiani, pianure, deserti, fiumi e copertura stabile del suolo, con uno strato trasparente di nomi di città e confini — contesto geografico permanente per interpretare i livelli vivi della NASA.",
        chips: ["Foreste e pascoli", "Deserti e sabbie", "Montagne e altipiani", "Acque e fiumi", "Neve e ghiaccio"]
      }
    }
  };

  /* ══ 5) الحالة الداخلية ══ */

  var map = null;        /* كائن Leaflet — يُبنى كسولًا فقط عند init() */
  var baseLayer = null; /* Esri World_Dark_Gray_Base */
  var overLayer = null;  /* الطبقة النشطة (ناسا أو Esri Physical) */
  var refLayer = null;   /* طبقة المسميات — تظهر مع طبقة Esri فقط */
  var ring = null;       /* حلقة النبضة الذهبية حول الموقع */
  var dot = null;       /* نقطة الموقع الصلبة + تلميح الاسم */
  var curKey = "lst";    /* الطبقة النشطة — الافتراضية حرارة السطح */
  var ecoOn = false;     /* آخر قيمة معروفة للوضع الاقتصادي */
  var langNow = "ar";    /* آخر لغة معروفة (document.documentElement.lang) */
  var shownLoc = null;   /* آخر موقع وُضع عليه العلامة (لكشف تغيّر الموقع) */
  var wiredBtns = false;
  var styleOn = false;

  /* ══ 6) أدوات صغيرة ══ */

  function isNum(v) { return typeof v === "number" && isFinite(v); }

  /* لغة الواجهة من <html lang> — نفس نهج climate.js (langKey) */
  function langKey() {
    var l = ((document.documentElement.lang || "ar") + "").slice(0, 2).toLowerCase();
    return STR[l] ? l : "ar";
  }

  /* ترجمة مفتاح عام مع تعويض قوالب {d}/{z} — بلا eval ولا new Function */
  function t(key, vars) {
    var s = STR[langKey()][key];
    if (typeof s !== "string") s = STR.ar[key] || key;
    if (vars) {
      for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
    }
    return s;
  }

  /* الوضع الاقتصادي أو الجهاز الاقتصادي — نفس منطق climate.js (isEco) */
  function isEco() {
    try {
      if (localStorage.getItem("matar:eco") === "1") return true;
    } catch (e) { /* تجاهل */ }
    var cl = document.documentElement.classList;
    return !!(cl && (cl.contains("eco") || cl.contains("low-end")));
  }

  /* تاريخ ISO (YYYY-MM-DD) قبل n يومًا بتوقيت UTC */
  function isoDaysAgo(n) {
    var d = new Date();
    d.setUTCDate(d.getUTCDate() - n);
    var m = String(d.getUTCMonth() + 1);
    if (m.length < 2) m = "0" + m;
    var day = String(d.getUTCDate());
    if (day.length < 2) day = "0" + day;
    return d.getUTCFullYear() + "-" + m + "-" + day;
  }

  /* تعويض تواريخ الطبقات: LST/AOD قبل 3 أيام · NDVI قبل 10 أيام
     (يُستدعى عند الإقلاع وعند كل بناء خريطة جديدًا — لو بقي التطبيق
      مفتوحًا عبر منتصف الليل تبقى التواريخ طازجة) */
  function refreshDates() {
    LAYERS.lst.date = isoDaysAgo(3);
    LAYERS.ndvi.date = isoDaysAgo(10);
    LAYERS.aod.date = isoDaysAgo(3);
  }

  /* عنصر DOM آمن: createElement + className + textContent فقط (بلا innerHTML) */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ══ 7) جسر الموقع — نفس سلسلة climate.js (getPlace) ══
        ① __matarBridge.state.place  (جسر التطبيق الحي)
        ② localStorage "matar:place" (آخر موقع محفوظ)
        ③ __MATAR_CLIMATE_STATE.place (حالة مرصد المناخ — يحدّثها climate.js) */

  function pickLatLon(o) {
    if (!o || typeof o !== "object") return null;
    var la = null, lo = null;
    if (isNum(o.lat)) la = o.lat;
    else if (isNum(o.latitude)) la = o.latitude;
    if (isNum(o.lon)) lo = o.lon;
    else if (isNum(o.lng)) lo = o.lng;
    else if (isNum(o.longitude)) lo = o.longitude;
    if (la === null || lo === null) return null;
    if (Math.abs(la) > 90 || Math.abs(lo) > 180) return null;
    var name = "";
    if (typeof o.name === "string" && o.name) name = o.name;
    else if (typeof o.city === "string" && o.city) name = o.city;
    else if (typeof o.place === "string" && o.place) name = o.place;
    return { lat: la, lon: lo, name: name };
  }

  function getPlace() {
    var r = null;
    try {
      var st = window.__matarBridge && window.__matarBridge.state;
      if (st && st.place) { r = pickLatLon(st.place); if (r) return r; }
    } catch (e) { /* تجاهل */ }
    try {
      var raw = localStorage.getItem("matar:place");
      if (raw) {
        var p = JSON.parse(raw);
        r = pickLatLon(p);
        if (r) return r;
      }
    } catch (e) { /* تجاهل */ }
    try {
      var cs = window.__MATAR_CLIMATE_STATE;
      if (cs && cs.place) { r = pickLatLon(cs.place); if (r) return r; }
    } catch (e) { /* تجاهل */ }
    return null;
  }

  /* قراءة الموقع من تفصيل حدث "matar:data" تحمّلًا لأي شكل شائع
     (place / location / loc / coords / state.place / latlng…) — وإن
     لم يحمل الحدث موقعًا صالحًا نرجع لسلسلة getPlace() نفسها */
  function locFromEvent(e) {
    if (!e || !e.detail) return null;
    var d = e.detail;
    var cands, i, r;
    try {
      cands = [d, d.place, d.location, d.loc, d.coords, d.state, d.state && d.state.place, d.data, d.data && d.data.place];
      for (i = 0; i < cands.length; i++) {
        r = pickLatLon(cands[i]);
        if (r) return r;
      }
      if (d.latlng && d.latlng.length === 2) {
        var la = +d.latlng[0], lo = +d.latlng[1];
        if (isFinite(la) && isFinite(lo)) {
          return { lat: la, lon: lo, name: typeof d.name === "string" ? d.name : "" };
        }
      }
    } catch (err) { /* تجاهل */ }
    return null;
  }

  /* ══ 8) حقن أنماط عناصر المفتاح والنبضة (مرة واحدة) ══
        تُحقن عبر createElement("style") + textContent — مسموح بموجب
        style-src 'unsafe-inline' في سياسة التطبيق، وتستعمل متغيرات
        الهوية (--ink/--muted/--line/--teal/--gold) فتنسجم مع الوضعين.
        تشمل أيضًا direction:ltr لحاوية الخريطة (إصلاح تموضع بلاطات
        Leaflet داخل صفحة RTL) وتعطيل النبضة في الوضع الاقتصادي. */

  var CSS_TEXT = [
    "#climate-leaflet-map { direction: ltr; }",
    "#climate-map-legend .clg-chip { padding: 3px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--teal-soft); color: var(--teal); font-size: 10.5px; font-weight: 800; white-space: nowrap; }",
    "#climate-map-legend .clg-chip.clg-nm { border-color: color-mix(in srgb, var(--gold) 38%, var(--line)); background: color-mix(in srgb, var(--gold) 16%, transparent); color: var(--gold-deep); }",
    "#climate-map-legend .clg-row { display: flex; flex: 0 0 auto; align-items: center; gap: 6px; direction: ltr; }",
    "#climate-map-legend .clg-lab { color: var(--muted); font-size: 10px; font-weight: 700; white-space: nowrap; }",
    "#climate-map-legend .clg-bar { flex: 0 0 auto; width: 176px; height: 12px; border: 1px solid rgb(0 0 0 / 14%); border-radius: 7px; box-shadow: inset 0 1px 2px rgb(0 0 0 / 18%); }",
    "#climate-map-legend .clg-desc { flex: 1 1 100%; margin: 2px 0 0; color: var(--ink); font-size: 11px; font-weight: 600; line-height: 1.85; }",
    "#climate-map-legend .clg-zoom { flex: 1 1 100%; margin: 0; color: var(--muted); font-size: 10px; font-weight: 700; }",
    "#climate-map-legend .clg-chips { display: flex; flex: 1 1 100%; flex-wrap: wrap; gap: 4px 12px; margin: 2px 0 0; }",
    "#climate-map-legend .clg-chipk { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-size: 10px; font-weight: 700; white-space: nowrap; }",
    "#climate-map-legend .clg-sw { width: 12px; height: 12px; border-radius: 4px; border: 1px solid rgb(0 0 0 / 20%); }",
    ".clim-pulse { animation: climPulse 2.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }",
    "@keyframes climPulse { 0% { transform: scale(0.85); opacity: 0.9; } 70% { transform: scale(2.1); opacity: 0; } 100% { transform: scale(2.1); opacity: 0; } }",
    "html.eco .clim-pulse, html.low-end .clim-pulse { animation: none !important; }",
    "@media (max-width: 767px) { #climate-map-legend .clg-bar { width: 128px; } }"
  ].join("\n");

  function injectStyle() {
    if (styleOn) return;
    try {
      var st = document.createElement("style");
      st.textContent = CSS_TEXT;
      document.head.appendChild(st);
      styleOn = true;
    } catch (e) { /* تجاهل — الأنماط الأساسية موجودة في style.css */ }
  }

  /* ══ 9) إظهار/إخفاء عناصر لوحة الخريطة ══
        setDisp: "" يعيد القيمة الافتراضية من style.css (display:none
        للبطاقة الاقتصادية، والارتفاع الكامل للخريطة…) — وبذلك لا
        نتصادم مع قواعد html.eco ذات !important في style.css. */

  function setDisp(node, val) {
    if (node && node.style) node.style.display = val;
  }

  function byId(id) { return document.getElementById(id); }

  /* تطبيق رؤية الوضع الاقتصادي: إظهار #climate-map-eco وإخفاء
     #climate-leaflet-map و #climate-map-legend وشريط الطبقات وتسميته
     والتلميح العابر — يكمل قواعد html.eco في style.css لحالة
     "matar:eco"===1 بلا صنف على <html> */
  function applyEcoVis(on) {
    setDisp(byId(ECO_ID), on ? "block" : "");
    setDisp(byId(MAP_ID), on ? "none" : "");
    setDisp(byId(LEG_ID), on ? "none" : "");
    setDisp(document.querySelector(LAYERS_BAR_SEL), on ? "none" : "");
    setDisp(document.querySelector(LAYERS_LBL_SEL), on ? "none" : "");
    setDisp(document.querySelector(HINT_SEL), on ? "none" : "");
  }

  /* تطبيق كامل: تحديث الرصد + دمر الخريطة إن كانت قائمة (يوقف أي
     بلاطات في الطابور — لا شيء يُحمَّل في الوضع الاقتصادي إطلاقًا) */
  function applyEco(on) {
    ecoOn = on;
    applyEcoVis(on);
    if (on && map) destroyMap();
  }

  /* ══ 10) بناء الطبقات وتبديلها ══ */

  function buildOverlay(key) {
    if (!map || typeof window.L === "undefined") return null;
    var d = LAYERS[key];
    var url = d.url.split("{DATE8}").join(d.date || "").split("{DATE}").join(d.date || "");
    return window.L.tileLayer(url, {
      maxNativeZoom: d.nat,
      maxZoom: 12,
      opacity: d.op,
      attribution: d.attr
    });
  }

  /* التبديل الفوري: إزالة الطبقة القديمة (والمسميات) → إضافة الجديدة
     → تحديث aria-pressed للأزرار → إعادة بناء مفتاح الألوان.
     يعمل حتى قبل بناء الخريطة (يحدّث الأزرار والمفتاح فقط) */
  function setLayer(key) {
    if (!LAYERS[key]) key = "lst";
    curKey = key;
    if (map) {
      if (overLayer) { try { map.removeLayer(overLayer); } catch (e) {} overLayer = null; }
      if (refLayer) { try { map.removeLayer(refLayer); } catch (e) {} refLayer = null; }
      overLayer = buildOverlay(key);
      if (overLayer) overLayer.addTo(map);
      /* طبقة المسميات الحدودية الشفافة — مع طبقة Esri فقط
         (maxNativeZoom 8 وفق المواصفة) لوضوح أسماء المدن */
      if (LAYERS[key].ref && window.L && typeof window.L.tileLayer === "function") {
        refLayer = window.L.tileLayer(LAYERS[key].ref, {
          maxNativeZoom: 8,
          maxZoom: 12,
          opacity: 1,
          attribution: REF_ATTR
        });
        refLayer.addTo(map);
      }
    }
    updateButtons();
    renderLegend();
    return key;
  }

  /* تحديث حالة أزرار الطبقات — نفس اصطلاح style.css:
     .climate-layer-btn[aria-pressed="true"] هو النمط النشط */
  function updateButtons() {
    var btns = document.querySelectorAll("." + BTN_CLS + "[" + LAYER_ATTR + "]");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute(LAYER_ATTR) === curKey;
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* البحث عن زر الطبقة صعودًا من هدف النقر (بديل آمن عن closest) */
  function closestBtn(node) {
    while (node && node !== document) {
      if (node.nodeType === 1 && node.classList && node.classList.contains(BTN_CLS) && node.getAttribute && node.getAttribute(LAYER_ATTR)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function wireButtons() {
    if (wiredBtns) return;
    var bar = document.querySelector(LAYERS_BAR_SEL);
    if (!bar) return;
    wiredBtns = true;
    bar.addEventListener("click", function (ev) {
      var btn = closestBtn(ev.target);
      if (!btn) return;
      var k = btn.getAttribute(LAYER_ATTR);
      if (k) setLayer(k);
    });
  }

  /* ══ 11) مفتاح الألوان التفاعلي (#climate-legend-body) ══
        يُفرَّغ ويُبنى بعناصر DOM آمنة (createElement/textContent):
        شارة الاسم المختصر + شارة التاريخ + شريط متدرج بطرفي المقياس
        (أو شرائح ألوان الغطاء الأرضي لطبقة Esri) + الشرح العلمي
        + حد التكبير الأصلي. صف المقياس يُفرض عليه direction:ltr دائمًا
        (كلغات واجهة) لأن أطراف التدرج العلمي تُقرأ فيزيائيًا من البارد
        (يسار) إلى الساخن (يمين) — فلا ينعكس الشريط في الواجهة العربية. */

  function renderLegend() {
    var body = byId(LEG_BODY_ID);
    if (!body) return;
    var lang = langKey();
    var s = STR[lang];
    var d = LAYERS[curKey];
    if (!s || !d) return;

    /* تفريغ آمن (يشمل ملاحظة الانتظار الأولية من المرحلة 1) */
    while (body.firstChild) body.removeChild(body.firstChild);

    /* شارة اسم الطبقة النشطة + شارة التاريخ (أو «خريطة ثابتة») */
    body.appendChild(el("span", "clg-chip clg-nm", s[curKey].nm));
    body.appendChild(el("span", "clg-chip clg-date", d.date ? t("img_date", { d: d.date }) : t("static_map")));

    if (d.grad) {
      /* شريط التدرج الملون بطرفي المقياس — دالة على ألوان GIBS الفعلية */
      var row = el("div", "clg-row");
      row.appendChild(el("span", "clg-lab", s[curKey].min));
      var bar = el("div", "clg-bar");
      bar.style.background = d.grad;
      row.appendChild(bar);
      row.appendChild(el("span", "clg-lab", s[curKey].max));
      body.appendChild(row);
    } else {
      /* طبقة Esri: شرائح ألوان الغطاء الأرضي الخمس بدل الشريط المتدرج */
      var chips = el("div", "clg-chips");
      for (var i = 0; i < ESRI_SWATCHES.length; i++) {
        var ck = el("span", "clg-chipk");
        var sw = el("i", "clg-sw");
        sw.style.background = ESRI_SWATCHES[i];
        ck.appendChild(sw);
        ck.appendChild(document.createTextNode(s.esri.chips[i] || ""));
        chips.appendChild(ck);
      }
      body.appendChild(chips);
    }

    /* الشرح العلمي + حد التكبير الأصلي */
    body.appendChild(el("p", "clg-desc", s[curKey].desc));
    body.appendChild(el("p", "clg-zoom", t("zoom_note", { z: String(d.nat) })));
  }

  /* ══ 12) علامة الموقع النشط + التحريك التلقائي ══ */

  function placeMarker(loc) {
    if (!map || !loc || typeof window.L === "undefined") return;
    var ll = window.L.latLng(loc.lat, loc.lon);
    var name = loc.name || (loc.lat.toFixed(3) + ", " + loc.lon.toFixed(3)) || t("active_loc");
    if (!ring || !dot) {
      /* حلقة نابضة ذهبية (SVG circleMarker + صنف نبضة CSS) فوق
         نقطة صلبة بحافة بيضاء — أنيقة على الأساس الداكن وفي الليل */
      ring = window.L.circleMarker(ll, {
        radius: 15,
        stroke: true,
        color: "#d9935b",
        weight: 1.3,
        opacity: 0.85,
        fill: true,
        fillColor: "#d9935b",
        fillOpacity: 0.13,
        className: "clim-pulse",
        interactive: false
      }).addTo(map);
      dot = window.L.circleMarker(ll, {
        radius: 6,
        stroke: true,
        color: "#fffdf6",
        weight: 2.2,
        opacity: 1,
        fill: true,
        fillColor: "#d9935b",
        fillOpacity: 1
      }).addTo(map);
      dot.bindTooltip(name, { direction: "top", offset: [0, -7], opacity: 1 });
    } else {
      ring.setLatLng(ll);
      dot.setLatLng(ll);
      try { dot.setTooltipContent(name); } catch (e) { /* تجاهل */ }
    }
  }

  /* تحريك سلس عند تغيّر الموقع فعليًا (أكثر من ~2 كم) — وإلا نبقى
     مكاننا كي لا تقفز الخريطة مع كل تحديث طقس يحمل الإحداثيات نفسها */
  function locate(loc) {
    if (!map || !loc) return;
    var moved = !shownLoc ||
      Math.abs(shownLoc.lat - loc.lat) > 0.02 ||
      Math.abs(shownLoc.lon - loc.lon) > 0.02;
    placeMarker(loc);
    shownLoc = loc;
    if (moved) {
      var z = map.getZoom();
      if (z < 5) z = 5;
      try {
        map.flyTo([loc.lat, loc.lon], z, { duration: 0.9 });
      } catch (e) {
        try { map.setView([loc.lat, loc.lon], z, { animate: false }); } catch (e2) { /* تجاهل */ }
      }
    }
  }

  /* ══ 13) دورة حياة الخريطة (تهيئة كسولة / تحجيم / تدمير) ══ */

  function paneOpen() {
    var p = byId(PANE_ID);
    return !!p && p.hidden === false;
  }

  function createMap() {
    var host = byId(MAP_ID);
    if (!host || typeof window.L === "undefined") return false;
    injectStyle();
    refreshDates();

    /* المركز الأولي: الموقع النشط إن عُرف (من جسر التطبيق أو الكاش)،
       وإلا نظرة عامة على وسط العالم العربي (الجزيرة العربية) */
    var loc = getPlace();
    var lat = loc ? loc.lat : 26.2;
    var lon = loc ? loc.lon : 44.8;
    var zoom = loc ? 6 : 4;

    try {
      map = window.L.map(host, {
        center: [lat, lon],
        zoom: zoom,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: true,
        attributionControl: true
      });
    } catch (e) {
      map = null;
      return false;
    }

    /* الأساس الداكن الرمادي — تظهر تحته السواحل والحدود بوضوح من
       خلال طبقات ناسا شبه الشفافة (0.78) */
    baseLayer = window.L.tileLayer(BASE_URL, {
      maxNativeZoom: 16,
      maxZoom: 12,
      attribution: BASE_ATTR
    }).addTo(map);

    /* الطبقة النشطة + الأزرار + المفتاح (يعمل قبل/بعد البناء) */
    setLayer(curKey);

    /* علامة الموقع إن وُجد */
    if (loc) {
      placeMarker(loc);
      shownLoc = loc;
    }

    /* حذف التلميح العابر فوق مساحة الخريطة (مهمته انتهت) */
    try {
      var hint = host.parentNode ? host.parentNode.querySelector(HINT_SEL) : null;
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
    } catch (e) { /* تجاهل */ }

    resize();
    return true;
  }

  function destroyMap() {
    if (map) {
      try { map.remove(); } catch (e) { /* تجاهل */ }
    }
    map = null;
    baseLayer = null;
    overLayer = null;
    refLayer = null;
    ring = null;
    dot = null;
  }

  /* إعادة تحجيم الخريطة عند تبديل التبويبات أو تغيير حجم الشاشة —
     invalidateSize فوريًا + بعد 180ms (استقرار تخطيط اللوحة)،
     والاستدعاء قبل بناء الخريطة عملية آمنة (no-op) */
  function resize() {
    if (!map) return;
    try { map.invalidateSize(false); } catch (e) { /* تجاهل */ }
    window.setTimeout(function () {
      if (!map) return;
      try { map.invalidateSize(false); } catch (e2) { /* تجاهل */ }
    }, 180);
  }

  /* التهيئة الكسولة — يستدعيها climate.js عند فتح تبويب الخرائط.
     idempotent: استدعاء متكرر لا يعيد البناء بل يعيد التحجيم فقط.
     في الوضع الاقتصادي: لا خريطة ولا بلاطات — البطاقة البديلة فقط.
     واحتياط نادر: إن غابت Leaflet (CDN محجوب) نعرض البطاقة البديلة
     كذلك فلا يظهر فراغ أسود في اللوحة. */
  function init() {
    var eco = isEco();
    if (eco !== ecoOn) applyEco(eco);
    if (eco) return;
    wireButtons();
    if (typeof window.L === "undefined") {
      applyEcoVis(true);
      return;
    }
    if (map) {
      resize();
      return;
    }
    createMap();
  }

  /* ══ 14) الأحداث العالمية ══ */

  /* حدث التطبيق الحي: موقع جديد أو بيانات جديدة → تحديث العلامة
     والتحريك السلس إن تغيّر الموقع + مزامنة اللغة/الوضع الاقتصادي */
  function onMatarData(e) {
    var eco = isEco();
    var lang = langKey();
    var loc = locFromEvent(e) || getPlace();
    if (loc) {
      if (map) locate(loc);
      else shownLoc = null; /* الخريطة غير مبنية — سيقرأ createMap الجسر بنفسه */
    }
    if (eco !== ecoOn) {
      applyEco(eco);
      if (!eco && paneOpen() && !map) {
        try { createMap(); } catch (err) { /* تجاهل */ }
      }
    }
    if (lang !== langNow) {
      langNow = lang;
      renderLegend();
      updateButtons();
    }
  }

  /* مراقبة <html lang> و class — تغيير اللغة يعيد بناء المفتاح،
     وتغيير eco/low-end يطبّق الوضع الاقتصادي فورًا (نفس نهج climate.js) */
  function watchDocument() {
    if (typeof MutationObserver !== "function") return;
    var mo = new MutationObserver(function () {
      var eco = isEco();
      var lang = langKey();
      if (eco === ecoOn && lang === langNow) return;
      var wasEco = ecoOn;
      applyEco(eco);
      langNow = lang;
      if (wasEco && !eco && paneOpen() && !map) {
        try { createMap(); } catch (e) { /* تجاهل */ }
      }
      renderLegend();
      updateButtons();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "class"] });
  }

  /* ══ 15) الإقلاع (السكربت defer — DOM جاهز) ══
        مستمعون خاملون فقط: لا خريطة ولا بلاطات ولا شبكة هنا إطلاقًا.
        أول بناء حقيقي يحدث عند فتح تبويب الخرائط عبر init() */
  function boot() {
    ecoOn = isEco();
    langNow = langKey();
    refreshDates();
    wireButtons();
    document.addEventListener("matar:data", onMatarData);
    window.addEventListener("resize", function () { resize(); });
    watchDocument();
    if (ecoOn) {
      applyEcoVis(true);
    } else {
      applyEcoVis(false);
      updateButtons();  /* الطبقة الافتراضية (LST) مضاءة منذ البداية */
      renderLegend();   /* المفتاح جاهز قبل فتح التبويب — لا وميض فراغ */
    }
  }

  boot();

  /* ══ 16) الواجهة العامة على window ══ */

  window.MatarClimateMap = {
    version: "4a",

    /* تهيئة كسولة عند فتح تبويب خرائط مراقبة الأرض (idempotent) */
    init: init,

    /* إعادة التحجيم عند تبديل التبويبات أو تغيير حجم الشاشة */
    resize: resize,

    /* تبديل الطبقة برمجيًا — "lst" | "ndvi" | "aod" | "esri" */
    setLayer: setLayer,

    /* مفتاح الطبقة النشطة حاليًا */
    getLayer: function () { return curKey; },

    /* وضع/تحريك علامة الموقع يدويًا (إحداثيات صريحة — للمراحل القادمة) */
    locate: function (lat, lon, name) {
      var la = +lat, lo = +lon;
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return;
      locate({ lat: la, lon: lo, name: name ? String(name) : "" });
    },

    /* هل الوضع الاقتصادي/الجهاز الاقتصادي نشط الآن؟ */
    isEco: function () { return isEco(); },

    /* تدمير كامل للخريطة وإفراغ الحالة الداخلية */
    destroy: function () {
      destroyMap();
      shownLoc = null;
    }
  };

})();
