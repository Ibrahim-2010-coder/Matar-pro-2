/* ═════════════════════════════════════════════════════════════════════════════
   مَطَر برو — climate-report.js · المرحلة 4-ب (الأخيرة)
   مولّد التقرير المناخي العلمي A4 القابل للطباعة
   «مرصد التغير المناخي العربي (1950 – 2050)»
   ═════════════════════════════════════════════════════════════════════════════
   الفكرة برمتها تعمل داخل المتصفح بلا أي خادم: عند نقر زر #climate-export-pdf
   (المضاف في ترويسة #page-climate بجانب شارة الموقع) تُقرأ الحالة الجاهزة
   window.__MATAR_CLIMATE_STATE التي يصدّرها climate.js v74:
     • السجل التاريخي 1950–2024 (ERA5): شرائط الاحترار + شذوذ 2024 · معدل
       الاحترار لكل عقد (مقارنةً بالعالم +0.18 وMENA +0.26 °م/عقد) · وحدات
       النمو GDD · ليالي الصقيع · سياق موجة الحر P95/P50 · مؤشر الجفاف
       P−E (اتجاه/عقد) · مؤشر البحر الساحلي (للمدن الساحلية فقط).
     • محاكي 2050 (CMIP6): الحالة sim2050 تحتفظ بالمسار المقيَّس للسيناريو
       النشط (عامل SSP_FACTORS) وبخط أساس 1981–2010 — ويعيد هذا المولّد
       اشتقاق السيناريوهين الآخرين بتحجيم نمطي خطي (Pattern Scaling) وهي
       الطريقة المعتمدة في مُحرّكات سيناريوهات IPCC.
     • توصيات المستشار الاستراتيجي الثلاث (الزراعة والمياه · المدن والسكان ·
       البنية التحتية) — تُقرأ من عناصر DOM الحية فتخرج بلغة الواجهة نفسها.

   ثم تُبنى طبقة طباعة رسمية #climate-print-report بأسلوب تقارير الأمم
   المتحدة والمراصد العالمية (IPCC AR6 / WMO State of Climate):
     1) ترويسة رسمية: شعار مَطَر برو (SVG مستنسخ) + اسم المرصد + المدينة +
        الإحداثيات الجغرافية + تاريخ الإصدار + رقم مرجع.
     2) الملخص التنفيذي بالأرقام: فقرة سردية + 4 بطاقات إحصائية.
     3) جدول المؤشرات التاريخية 1950–2024.
     4) جدول مقارنة سيناريوهات 2050 الثلاثة (SSP1-2.6 / SSP2-4.5 / SSP5-8.5):
        ارتفاع الحرارة · الأيام فوق 40°م · تغير الأمطار · (البحر الساحلي إن وُجد).
     5) استنساخ الرسومات المتجهة من الصفحة نفسها بـ cloneNode(true) —
        شرائط الاحترار + منحنى 2050 + مؤشر البحر — بعرض كامل للطباعة.
     6) خطة التكيّف الاستراتيجية (التوصيات الثلاث بألوان المسارات).
     7) تذييل التوثيق العلمي: ERA5 Reanalysis · CMIP6 5-Model Ensemble ·
        IPCC AR6 · NASA GIBS · Esri Living Atlas + إخلاء المسؤولية.

   الطباعة: يُحقن وسم <style> عبر textContent بقواعد @media print تُخفي واجهة
   التطبيق بالكامل وتطبع التقرير A4 وحده بخلفية بيضاء نقية وألوان صريحة
   (print-color-adjust: exact) واتجاه RTL/LTR سليم حسب لغة الواجهة، ثم تُزال
   الطبقة والأنماط بعد afterprint (مع بديل focus للمتصفحات القديمة).

   الالتزام الصارم بـ CSP: صفر innerHTML — كل عنصر عبر createElement، كل نص
   عبر textContent، والرسومات عبر cloneNode(true) مع إعادة ترقيم المعرفات
   الداخلية (url(#id) → url(#id-cpr)) كي لا تتعارض مع أصل الصفحة.

   التحميل: <script src="./climate-report.js" defer></script> في نهاية <body>
   بعد climate-map.js — يعمل بلا أي اعتماد على Leaflet أو الشبكة.
   ═════════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {

  /* ══ 1) قاموس التقرير السباعي (ar · en · fr · de · es · pt · it) ══
     نفس منهجية climate.js: html lang هو مصدر اللغة، والعربية هي المرجع. */

  var L = {
    ar: {
      deg: "°م", na: "—",
      brand: "مَطَر برو",
      obs: "مرصد التغير المناخي العربي (1950 – 2050)",
      report_word: "التقرير المناخي العلمي",
      meta_city: "المدينة", meta_coords: "الإحداثيات الجغرافية", meta_date: "تاريخ الإصدار", meta_ref: "رقم المرجع",
      north: "شمالاً", south: "جنوبًا", east: "شرقًا", west: "غربًا",
      not_ready: "لم تكتمل بيانات المرصد بعد — افتح صفحة «التغير المناخي» وانتظر جاهزية القراءات (والمحاكي إن رغبت بمقارنة السيناريوهات) ثم أعد التصدير.",
      exec_title: "الملخص التنفيذي بالأرقام",
      exec_para: "منذ عام 1950 سخنت {city} بمعدل {rate}°م لكل عقد، مقابل {g}°م عالميًا و{m}°م إقليميًا (MENA)، وبلغ شذوذ الحرارة في عام 2024 نحو {anom}°م فوق خط الأساس 1981–2010. يتجه مؤشر الجفاف P−E نحو {v}، ووفق السيناريو المتوسط SSP2-4.5 يُتوقع ارتفاع إضافي قدره {w}°م بحلول عام 2050.",
      stat_rate: "معدل الاحترار المحلي", stat_rate_note: "العالم +0.18 · MENA +0.26 °م/عقد",
      value_lbl: "القيمة", decade_word: "عقد",
      stat_anom: "شذوذ الحرارة 2024", stat_anom_note: "فوق خط أساس 1981–2010",
      stat_spei: "اتجاه الجفاف (P−E)", stat_2050: "توقع 2050 (SSP2-4.5)",
      u_dec: "°م/عقد", u_mmd: "مم/عقد", u_days: "يومًا", u_cm: "سم",
      hist_title: "المؤشرات التاريخية (1950–2024) — أرشيف ERA5",
      row_rate: "معدل الاحترار لكل عقد", rate_ctx: "العالم +0.18 · MENA +0.26",
      row_gdd: "وحدات النمو الزراعي (GDD)", row_frost: "ليالي الصقيع (متوسط سابق ← الأخيرة)",
      row_heat: "سياق موجة الحر (P95 · P50)", row_spei: "اتجاه مؤشر الجفاف P−E",
      row_sea: "الارتفاع التراكمي للبحر 2024 (سم فوق 1950)",
      scen_title: "مقارنة سيناريوهات 2050 (CMIP6)",
      col_metric: "المؤشر", baseline_lbl: "الأساس",
      ssp126_label: "SSP1-2.6 · المتفائل", ssp245_label: "SSP2-4.5 · المتوسط", ssp585_label: "SSP5-8.5 · المتشائم",
      row_temp2050: "ارتفاع الحرارة المتوقع فوق أساس 1981–2010",
      row_days40: "الأيام فوق 40°م سنويًا (أساس 1981–2010)",
      row_rain2050: "تغير الأمطار السنوية",
      row_sea2050: "ارتفاع مستوى البحر 2050 (سم فوق 1950)",
      method_note: "منهجية الجدول: حرارة وأمطار كل سيناريو مشتقة بتحجيم نمطي خطي على عامل SSP من مسار CMIP6 الخماسي النشط (SSP_FACTORS: 0.55 / 0.78 / 1.00)، والأيام فوق 40°م للسيناريوهين غير النشطين تقدير نمطي خطي حول خط الأساس — منهج معتمد في مُحرّكات سيناريوهات IPCC.",
      models_note: "التجميع الخماسي CMIP6: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — عبر Open-Meteo Climate API.",
      charts_title: "الرسومات المتجهة عالية الدقة",
      chart_stripes: "شرائط الاحترار 1950–2024 (ERA5)",
      chart_sim: "منحنى المسار المستقبلي 2025–2050 (CMIP6)",
      chart_sea: "مؤشر ارتفاع البحر الساحلي 1950–2050",
      cap_stripes: "كل شريط سنة واحدة (أدنى شذوذًا في اليمين/اليسار حسب الاتجاه ← أعلى) — شذوذ 2024: {v} فوق خط أساس 1981–2010.",
      cur_ssp: "منحنى §4 وفق السيناريو النشط في المحاكي: {v}",
      adapt_title: "خطة التكيّف الاستراتيجية",
      adv_agri: "الزراعة والمياه", adv_city: "المدن والسكان", adv_infra: "البنية التحتية",
      sources_title: "التوثيق العلمي والمصادر",
      disclaimer: "تقرير آلي يُولَّد محليًا على جهازك من أرشيف ERA5 ومخرجات CMIP6 وثوابت AR6 — استرشادي للتخطيط ولا يُغني عن بيانات الجهات الرسمية.",
      gen_line: "وُلِّد محليًا في {dt} — تطبيق «مَطَر برو» يعمل كليًا على جهاز المستخدم بلا خادم خلفي.",
      v_fast: "احترار أسرع من المتوسط العالمي", v_par: "وتيرة مطابقة للمتوسط العالمي", v_slow: "وتيرة أبطأ من المتوسط العالمي", v_cooling: "اتجاه تبريد نادر",
      v_drying: "الجفاف", v_stable: "استقرار نسبي", v_wetting: "رطوبة متزايدة",
    },
    en: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Arab Climate Change Observatory (1950–2050)",
      report_word: "Scientific Climate Report",
      meta_city: "City", meta_coords: "Coordinates", meta_date: "Issue date", meta_ref: "Ref. no.",
      north: "N", south: "S", east: "E", west: "W",
      not_ready: "Observatory data is not complete yet — open the Climate Change page, wait for the readings (and the simulator if you want the scenario comparison) to load, then export again.",
      exec_title: "Executive summary in numbers",
      exec_para: "Since 1950, {city} has warmed at {rate}°C per decade, against {g}°C globally and {m}°C across MENA; the 2024 temperature anomaly stood at {anom}°C above the 1981–2010 baseline. The P−E drought index trends toward {v}, and under the intermediate SSP2-4.5 scenario a further {w}°C of warming is expected by 2050.",
      stat_rate: "Local warming rate", stat_rate_note: "Global +0.18 · MENA +0.26 °C/decade",
      value_lbl: "Value", decade_word: "decade",
      stat_anom: "2024 temperature anomaly", stat_anom_note: "Above the 1981–2010 baseline",
      stat_spei: "Drought trend (P−E)", stat_2050: "2050 outlook (SSP2-4.5)",
      u_dec: "°C/decade", u_mmd: "mm/decade", u_days: "days", u_cm: "cm",
      hist_title: "Historical indicators (1950–2024) — ERA5 archive",
      row_rate: "Warming per decade", rate_ctx: "Global +0.18 · MENA +0.26",
      row_gdd: "Growing degree days (GDD)", row_frost: "Frost nights (past average → latest)",
      row_heat: "Heat-wave context (P95 · P50)", row_spei: "P−E drought index trend",
      row_sea: "Cumulative sea-level rise 2024 (cm above 1950)",
      scen_title: "2050 scenario comparison (CMIP6)",
      col_metric: "Indicator", baseline_lbl: "Baseline",
      ssp126_label: "SSP1-2.6 · Optimistic", ssp245_label: "SSP2-4.5 · Intermediate", ssp585_label: "SSP5-8.5 · Pessimistic",
      row_temp2050: "Projected warming above the 1981–2010 baseline",
      row_days40: "Days above 40°C per year (1981–2010 baseline)",
      row_rain2050: "Annual precipitation change",
      row_sea2050: "Sea-level rise by 2050 (cm above 1950)",
      method_note: "Table method: each scenario’s temperature and precipitation are derived by linear pattern scaling on the SSP factor from the active 5-model CMIP6 pathway (SSP_FACTORS: 0.55 / 0.78 / 1.00); days above 40°C for the non-active scenarios are a linear pattern-scaling estimate around the baseline — a method used in IPCC scenario emulators.",
      models_note: "CMIP6 five-model ensemble: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — via the Open-Meteo Climate API.",
      charts_title: "High-resolution vector charts",
      chart_stripes: "Warming stripes 1950–2024 (ERA5)",
      chart_sim: "Projected pathway 2025–2050 (CMIP6)",
      chart_sea: "Coastal sea-level indicator 1950–2050",
      cap_stripes: "Each stripe is one year (lowest anomaly on one end → highest) — the 2024 anomaly: {v} above the 1981–2010 baseline.",
      cur_ssp: "The chart in §4 follows the scenario currently active in the simulator: {v}",
      adapt_title: "Strategic adaptation plan",
      adv_agri: "Agriculture & water", adv_city: "Cities & population", adv_infra: "Infrastructure",
      sources_title: "Scientific documentation & sources",
      disclaimer: "Auto-generated report produced locally on your device from the ERA5 archive, CMIP6 outputs and AR6 constants — indicative for planning and not a substitute for official authorities.",
      gen_line: "Generated locally at {dt} — Matar Pro runs entirely on the user’s device with no backend.",
      v_fast: "faster-than-global warming", v_par: "a pace matching the global average", v_slow: "a pace slower than the global average", v_cooling: "a rare cooling trend",
      v_drying: "drying", v_stable: "relative stability", v_wetting: "increasing wetness",
    },
    fr: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Observatoire arabe du changement climatique (1950–2050)",
      report_word: "Rapport climatique scientifique",
      meta_city: "Ville", meta_coords: "Coordonnées", meta_date: "Date d’émission", meta_ref: "Réf.",
      north: "N", south: "S", east: "E", west: "O",
      not_ready: "Les données de l’observatoire ne sont pas encore complètes — ouvrez la page « Changement climatique », attendez la disponibilité des relevés (et du simulateur pour la comparaison des scénarios), puis exportez à nouveau.",
      exec_title: "Résumé exécutif en chiffres",
      exec_para: "Depuis 1950, {city} s’est réchauffée de {rate}°C par décennie, contre {g}°C à l’échelle mondiale et {m}°C dans la région MENA ; l’anomalie de température de 2024 s’établit à {anom}°C au-dessus de la référence 1981–2010. L’indice de sécheresse P−E évolue vers {v} et, selon le scénario intermédiaire SSP2-4.5, un réchauffement supplémentaire de {w}°C est attendu d’ici 2050.",
      stat_rate: "Rythme de réchauffement local", stat_rate_note: "Monde +0.18 · MENA +0.26 °C/décennie",
      value_lbl: "Valeur", decade_word: "décennie",
      stat_anom: "Anomalie de température 2024", stat_anom_note: "Au-dessus de la référence 1981–2010",
      stat_spei: "Tendance de sécheresse (P−E)", stat_2050: "Prospective 2050 (SSP2-4.5)",
      u_dec: "°C/décennie", u_mmd: "mm/décennie", u_days: "jours", u_cm: "cm",
      hist_title: "Indicateurs historiques (1950–2024) — archive ERA5",
      row_rate: "Réchauffement par décennie", rate_ctx: "Monde +0.18 · MENA +0.26",
      row_gdd: "Degrés-jours de croissance (GDD)", row_frost: "Nuits de gel (moyenne passée → dernière)",
      row_heat: "Contexte des vagues de chaleur (P95 · P50)", row_spei: "Tendance de l’indice de sécheresse P−E",
      row_sea: "Élévation cumulative de la mer 2024 (cm au-dessus de 1950)",
      scen_title: "Comparaison des scénarios 2050 (CMIP6)",
      col_metric: "Indicateur", baseline_lbl: "Référence",
      ssp126_label: "SSP1-2.6 · Optimiste", ssp245_label: "SSP2-4.5 · Intermédiaire", ssp585_label: "SSP5-8.5 · Pessimiste",
      row_temp2050: "Réchauffement projeté au-dessus de la référence 1981–2010",
      row_days40: "Jours au-dessus de 40°C par an (référence 1981–2010)",
      row_rain2050: "Variation des précipitations annuelles",
      row_sea2050: "Élévation du niveau de la mer d’ici 2050 (cm au-dessus de 1950)",
      method_note: "Méthode du tableau : température et précipitations de chaque scénario sont dérivées par mise à l’échelle linéaire du facteur SSP sur la trajectoire CMIP6 active à cinq modèles (SSP_FACTORS : 0.55 / 0.78 / 1.00) ; les jours au-dessus de 40°C pour les scénarios non actifs sont une estimation par mise à l’échelle du schéma autour de la référence — méthode utilisée dans les émulateurs de scénarios du GIEC.",
      models_note: "Ensemble CMIP6 à cinq modèles : CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — via l’API climatique Open-Meteo.",
      charts_title: "Graphiques vectoriels haute résolution",
      chart_stripes: "Bandes de réchauffement 1950–2024 (ERA5)",
      chart_sim: "Trajectoire projetée 2025–2050 (CMIP6)",
      chart_sea: "Indicateur du niveau de la mer côtière 1950–2050",
      cap_stripes: "Chaque bande représente une année (anomalie la plus faible à une extrémité → la plus forte) — anomalie 2024 : {v} au-dessus de la référence 1981–2010.",
      cur_ssp: "La courbe du §4 suit le scénario actuellement actif dans le simulateur : {v}",
      adapt_title: "Plan d’adaptation stratégique",
      adv_agri: "Agriculture et eau", adv_city: "Villes et population", adv_infra: "Infrastructure",
      sources_title: "Documentation scientifique et sources",
      disclaimer: "Rapport généré automatiquement sur votre appareil à partir de l’archive ERA5, des sorties CMIP6 et des constantes AR6 — indicatif pour la planification et ne remplace pas les autorités officielles.",
      gen_line: "Généré localement le {dt} — Matar Pro fonctionne entièrement sur l’appareil de l’utilisateur, sans serveur.",
      v_fast: "un réchauffement plus rapide que la moyenne mondiale", v_par: "un rythme conforme à la moyenne mondiale", v_slow: "un rythme plus lent que la moyenne mondiale", v_cooling: "une tendance au refroidissement rare",
      v_drying: "l’assèchement", v_stable: "une stabilité relative", v_wetting: "une humidité croissante",
    },
    de: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Arabisches Klimawandel-Observatorium (1950–2050)",
      report_word: "Wissenschaftlicher Klimabericht",
      meta_city: "Stadt", meta_coords: "Koordinaten", meta_date: "Ausstellungsdatum", meta_ref: "Ref.-Nr.",
      north: "N", south: "S", east: "O", west: "W",
      not_ready: "Die Daten des Observatoriums sind noch nicht vollständig — öffnen Sie die Seite „Klimawandel“, warten Sie, bis die Messwerte (und ggf. der Simulator) bereit sind, und exportieren Sie dann erneut.",
      exec_title: "Kurzfassung in Zahlen",
      exec_para: "Seit 1950 hat sich {city} um {rate}°C pro Jahrzehnt erwärmt, gegenüber {g}°C weltweit und {m}°C in der MENA-Region; die Temperaturanomalie von 2024 lag bei {anom}°C über der Referenz 1981–2010. Der Dürreindex P−E entwickelt sich Richtung {v}, und gemäß dem Mittelszenario SSP2-4.5 wird bis 2050 eine zusätzliche Erwärmung von {w}°C erwartet.",
      stat_rate: "Lokale Erwärmungsrate", stat_rate_note: "Global +0.18 · MENA +0.26 °C/Dekade",
      value_lbl: "Wert", decade_word: "Jahrzehnt",
      stat_anom: "Temperaturanomalie 2024", stat_anom_note: "Über der Referenz 1981–2010",
      stat_spei: "Dürretrend (P−E)", stat_2050: "Ausblick 2050 (SSP2-4.5)",
      u_dec: "°C/Dekade", u_mmd: "mm/Dekade", u_days: "Tage", u_cm: "cm",
      hist_title: "Historische Indikatoren (1950–2024) — ERA5-Archiv",
      row_rate: "Erwärmung pro Jahrzehnt", rate_ctx: "Global +0.18 · MENA +0.26",
      row_gdd: "Wachstumsgradtage (GDD)", row_frost: "Frostnächte (frühere Ø → letzte)",
      row_heat: "Hitzewellen-Kontext (P95 · P50)", row_spei: "Trend des Dürreindex P−E",
      row_sea: "Kumulierter Meeresspiegelanstieg 2024 (cm über 1950)",
      scen_title: "Szenariovergleich 2050 (CMIP6)",
      col_metric: "Indikator", baseline_lbl: "Referenz",
      ssp126_label: "SSP1-2.6 · Optimistisch", ssp245_label: "SSP2-4.5 · Mittel", ssp585_label: "SSP5-8.5 · Pessimistisch",
      row_temp2050: "Erwartete Erwärmung über der Referenz 1981–2010",
      row_days40: "Tage über 40°C pro Jahr (Referenz 1981–2010)",
      row_rain2050: "Änderung des Jahresniederschlags",
      row_sea2050: "Meeresspiegelanstieg bis 2050 (cm über 1950)",
      method_note: "Tabellenmethode: Temperatur und Niederschlag jedes Szenarios werden durch lineare Pattern-Scaling auf den SSP-Faktor aus dem aktiven Fünf-Modell-CMIP6-Pfad abgeleitet (SSP_FACTORS: 0.55 / 0.78 / 1.00); die Tage über 40°C für die nicht aktiven Szenarien sind eine lineare Pattern-Scaling-Schätzung um die Referenz — eine Methode der Szenario-Emulatoren des IPCC.",
      models_note: "CMIP6-Fünf-Modell-Ensemble: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — über die Open-Meteo Climate API.",
      charts_title: "Vektorgrafiken in hoher Auflösung",
      chart_stripes: "Erwärmungsstreifen 1950–2024 (ERA5)",
      chart_sim: "Projizierter Pfad 2025–2050 (CMIP6)",
      chart_sea: "Küstenmeeresspiegel-Indikator 1950–2050",
      cap_stripes: "Jeder Streifen steht für ein Jahr (niedrigste Anomalie am einen Ende → höchste am anderen) — Anomalie 2024: {v} über der Referenz 1981–2010.",
      cur_ssp: "Die Kurve in §4 folgt dem im Simulator aktuell aktiven Szenario: {v}",
      adapt_title: "Strategischer Anpassungsplan",
      adv_agri: "Landwirtschaft & Wasser", adv_city: "Städte & Bevölkerung", adv_infra: "Infrastruktur",
      sources_title: "Wissenschaftliche Dokumentation & Quellen",
      disclaimer: "Automatisch erzeugter Bericht, lokal auf Ihrem Gerät aus dem ERA5-Archiv, CMIP6-Ausgaben und AR6-Konstanten erstellt — richtungsweisend für die Planung und kein Ersatz für offizielle Behörden.",
      gen_line: "Lokal erzeugt am {dt} — Matar Pro läuft vollständig auf dem Gerät des Nutzers, ohne Server.",
      v_fast: "eine schnellere Erwärmung als der weltweite Durchschnitt", v_par: "ein dem globalen Durchschnitt entsprechendes Tempo", v_slow: "ein langsameres Tempo als der globale Durchschnitt", v_cooling: "ein seltenes Abkühlungsmuster",
      v_drying: "Austrocknung", v_stable: "relative Stabilität", v_wetting: "zunehmende Feuchtigkeit",
    },
    es: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Observatorio Árabe del Cambio Climático (1950–2050)",
      report_word: "Informe climático científico",
      meta_city: "Ciudad", meta_coords: "Coordenadas", meta_date: "Fecha de emisión", meta_ref: "Ref.",
      north: "N", south: "S", east: "E", west: "O",
      not_ready: "Los datos del observatorio aún no están completos — abre la página «Cambio climático», espera a que se carguen las lecturas (y el simulador si deseas la comparación de escenarios) y vuelve a exportar.",
      exec_title: "Resumen ejecutivo en cifras",
      exec_para: "Desde 1950, {city} se ha calentado a {rate}°C por década, frente a {g}°C a escala mundial y {m}°C en la región MENA; la anomalía de temperatura de 2024 alcanzó {anom}°C por encima de la referencia 1981–2010. El índice de sequía P−E tiende a {v} y, según el escenario intermedio SSP2-4.5, se prevé un calentamiento adicional de {w}°C para 2050.",
      stat_rate: "Ritmo de calentamiento local", stat_rate_note: "Global +0.18 · MENA +0.26 °C/década",
      value_lbl: "Valor", decade_word: "década",
      stat_anom: "Anomalía de temperatura de 2024", stat_anom_note: "Por encima de la referencia 1981–2010",
      stat_spei: "Tendencia de sequía (P−E)", stat_2050: "Perspectiva 2050 (SSP2-4.5)",
      u_dec: "°C/década", u_mmd: "mm/década", u_days: "días", u_cm: "cm",
      hist_title: "Indicadores históricos (1950–2024) — archivo ERA5",
      row_rate: "Calentamiento por década", rate_ctx: "Global +0.18 · MENA +0.26",
      row_gdd: "Grados-día de crecimiento (GDD)", row_frost: "Noches de helada (media previa → última)",
      row_heat: "Contexto de ola de calor (P95 · P50)", row_spei: "Tendencia del índice de sequía P−E",
      row_sea: "Elevación acumulada del mar 2024 (cm sobre 1950)",
      scen_title: "Comparación de escenarios 2050 (CMIP6)",
      col_metric: "Indicador", baseline_lbl: "Referencia",
      ssp126_label: "SSP1-2.6 · Optimista", ssp245_label: "SSP2-4.5 · Intermedio", ssp585_label: "SSP5-8.5 · Pesimista",
      row_temp2050: "Calentamiento previsto sobre la referencia 1981–2010",
      row_days40: "Días por encima de 40°C al año (referencia 1981–2010)",
      row_rain2050: "Cambio en la precipitación anual",
      row_sea2050: "Elevación del nivel del mar para 2050 (cm sobre 1950)",
      method_note: "Método de la tabla: la temperatura y la precipitación de cada escenario se derivan por escalado lineal del patrón sobre el factor SSP de la trayectoria activa CMIP6 de cinco modelos (SSP_FACTORS: 0.55 / 0.78 / 1.00); los días por encima de 40°C para los escenarios no activos son una estimación de escalado lineal alrededor de la referencia — método empleado en los emuladores de escenarios del IPCC.",
      models_note: "Conjunto CMIP6 de cinco modelos: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — mediante la API climática de Open-Meteo.",
      charts_title: "Gráficos vectoriales de alta resolución",
      chart_stripes: "Franjas de calentamiento 1950–2024 (ERA5)",
      chart_sim: "Trayectoria proyectada 2025–2050 (CMIP6)",
      chart_sea: "Indicador del nivel del mar costero 1950–2050",
      cap_stripes: "Cada franja representa un año (anomalía más baja en un extremo → más alta en el otro) — anomalía de 2024: {v} por encima de la referencia 1981–2010.",
      cur_ssp: "La curva del §4 sigue el escenario activo en el simulador: {v}",
      adapt_title: "Plan de adaptación estratégica",
      adv_agri: "Agricultura y agua", adv_city: "Ciudades y población", adv_infra: "Infraestructura",
      sources_title: "Documentación científica y fuentes",
      disclaimer: "Informe generado automáticamente en tu dispositivo a partir del archivo ERA5, las salidas CMIP6 y las constantes AR6 — orientativo para la planificación y no sustituye a las autoridades oficiales.",
      gen_line: "Generado localmente el {dt} — Matar Pro funciona por completo en el dispositivo del usuario, sin servidor.",
      v_fast: "un calentamiento más rápido que la media mundial", v_par: "un ritmo acorde con la media mundial", v_slow: "un ritmo más lento que la media mundial", v_cooling: "una rara tendencia al enfriamiento",
      v_drying: "sequedad", v_stable: "estabilidad relativa", v_wetting: "humedad creciente",
    },
    pt: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Observatório Árabe da Mudança Climática (1950–2050)",
      report_word: "Relatório climático científico",
      meta_city: "Cidade", meta_coords: "Coordenadas", meta_date: "Data de emissão", meta_ref: "Ref.",
      north: "N", south: "S", east: "E", west: "O",
      not_ready: "Os dados do observatório ainda não estão completos — abra a página «Mudança Climática», aguarde o carregamento das leituras (e do simulador, se quiser a comparação de cenários) e exporte novamente.",
      exec_title: "Resumo executivo em números",
      exec_para: "Desde 1950, {city} aqueceu a {rate}°C por década, contra {g}°C a nível mundial e {m}°C na região MENA; a anomalia de temperatura de 2024 situou-se em {anom}°C acima da referência de 1981–2010. O índice de seca P−E tende para {v} e, segundo o cenário intermédio SSP2-4.5, prevê-se um aquecimento adicional de {w}°C até 2050.",
      stat_rate: "Ritmo de aquecimento local", stat_rate_note: "Global +0.18 · MENA +0.26 °C/década",
      value_lbl: "Valor", decade_word: "década",
      stat_anom: "Anomalia de temperatura de 2024", stat_anom_note: "Acima da referência 1981–2010",
      stat_spei: "Tendência de seca (P−E)", stat_2050: "Perspetiva 2050 (SSP2-4.5)",
      u_dec: "°C/década", u_mmd: "mm/década", u_days: "dias", u_cm: "cm",
      hist_title: "Indicadores históricos (1950–2024) — arquivo ERA5",
      row_rate: "Aquecimento por década", rate_ctx: "Global +0.18 · MENA +0.26",
      row_gdd: "Graus-dia de crescimento (GDD)", row_frost: "Noites de geada (média anterior → última)",
      row_heat: "Contexto de onda de calor (P95 · P50)", row_spei: "Tendência do índice de seca P−E",
      row_sea: "Elevação acumulada do mar 2024 (cm acima de 1950)",
      scen_title: "Comparação de cenários 2050 (CMIP6)",
      col_metric: "Indicador", baseline_lbl: "Referência",
      ssp126_label: "SSP1-2.6 · Otimista", ssp245_label: "SSP2-4.5 · Intermédio", ssp585_label: "SSP5-8.5 · Pessimista",
      row_temp2050: "Aquecimento previsto acima da referência 1981–2010",
      row_days40: "Dias acima de 40°C por ano (referência 1981–2010)",
      row_rain2050: "Alteração da precipitação anual",
      row_sea2050: "Elevação do nível do mar até 2050 (cm acima de 1950)",
      method_note: "Método da tabela: a temperatura e a precipitação de cada cenário derivam do escalonamento linear do padrão sobre o fator SSP da trajetória ativa CMIP6 de cinco modelos (SSP_FACTORS: 0.55 / 0.78 / 1.00); os dias acima de 40°C para os cenários não ativos são uma estimativa de escalonamento linear em torno da referência — método usado nos emuladores de cenários do IPCC.",
      models_note: "Conjunto CMIP6 de cinco modelos: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — através da API climática Open-Meteo.",
      charts_title: "Gráficos vetoriais de alta resolução",
      chart_stripes: "Faixas de aquecimento 1950–2024 (ERA5)",
      chart_sim: "Trajetória projetada 2025–2050 (CMIP6)",
      chart_sea: "Indicador do nível do mar costeiro 1950–2050",
      cap_stripes: "Cada faixa representa um ano (anomalia mais baixa num extremo → mais alta no outro) — anomalia de 2024: {v} acima da referência 1981–2010.",
      cur_ssp: "A curva do §4 segue o cenário ativo no simulador: {v}",
      adapt_title: "Plano de adaptação estratégica",
      adv_agri: "Agricultura e água", adv_city: "Cidades e população", adv_infra: "Infraestrutura",
      sources_title: "Documentação científica e fontes",
      disclaimer: "Relatório gerado automaticamente no seu dispositivo a partir do arquivo ERA5, das saídas CMIP6 e das constantes AR6 — indicativo para planeamento e não substitui as autoridades oficiais.",
      gen_line: "Gerado localmente em {dt} — o Matar Pro funciona totalmente no dispositivo do utilizador, sem servidor.",
      v_fast: "um aquecimento mais rápido que a média mundial", v_par: "um ritmo alinhado com a média mundial", v_slow: "um ritmo mais lento que a média mundial", v_cooling: "uma rara tendência de arrefecimento",
      v_drying: "secagem", v_stable: "estabilidade relativa", v_wetting: "humidade crescente",
    },
    it: {
      deg: "°C", na: "—",
      brand: "Matar Pro",
      obs: "Osservatorio Arabo dei Cambiamenti Climatici (1950–2050)",
      report_word: "Rapporto scientifico sul clima",
      meta_city: "Città", meta_coords: "Coordinate", meta_date: "Data di emissione", meta_ref: "Rif.",
      north: "N", south: "S", east: "E", west: "O",
      not_ready: "I dati dell’osservatorio non sono ancora completi — apri la pagina «Cambiamenti climatici», attendi il caricamento delle letture (e del simulatore se vuoi il confronto degli scenari) ed esporta di nuovo.",
      exec_title: "Sintesi operativa in cifre",
      exec_para: "Dal 1950, {city} si è riscaldata a {rate}°C per decennio, contro {g}°C a livello globale e {m}°C nella regione MENA; l’anomalia termica del 2024 si è attestata a {anom}°C sopra il riferimento 1981–2010. L’indice di siccità P−E tende verso {v} e, secondo lo scenario intermedio SSP2-4.5, entro il 2050 è previsto un riscaldamento aggiuntivo di {w}°C.",
      stat_rate: "Ritmo di riscaldamento locale", stat_rate_note: "Globale +0.18 · MENA +0.26 °C/decennio",
      value_lbl: "Valore", decade_word: "decennio",
      stat_anom: "Anomalia termica 2024", stat_anom_note: "Sopra il riferimento 1981–2010",
      stat_spei: "Tendenza siccità (P−E)", stat_2050: "Prospettiva 2050 (SSP2-4.5)",
      u_dec: "°C/decennio", u_mmd: "mm/decennio", u_days: "giorni", u_cm: "cm",
      hist_title: "Indicatori storici (1950–2024) — archivio ERA5",
      row_rate: "Riscaldamento per decennio", rate_ctx: "Globale +0.18 · MENA +0.26",
      row_gdd: "Gradi-giorno di crescita (GDD)", row_frost: "Notti di gelo (media precedente → ultima)",
      row_heat: "Contesto ondata di calore (P95 · P50)", row_spei: "Tendenza indice siccità P−E",
      row_sea: "Innalzamento cumulativo del mare 2024 (cm sopra il 1950)",
      scen_title: "Confronto degli scenari 2050 (CMIP6)",
      col_metric: "Indicatore", baseline_lbl: "Riferimento",
      ssp126_label: "SSP1-2.6 · Ottimista", ssp245_label: "SSP2-4.5 · Intermedio", ssp585_label: "SSP5-8.5 · Pessimista",
      row_temp2050: "Riscaldamento previsto sopra il riferimento 1981–2010",
      row_days40: "Giorni sopra 40°C all’anno (riferimento 1981–2010)",
      row_rain2050: "Variazione delle precipitazioni annuali",
      row_sea2050: "Innalzamento del livello del mare entro il 2050 (cm sopra il 1950)",
      method_note: "Metodo della tabella: temperatura e precipitazioni di ogni scenario derivano dal pattern-scaling lineare sul fattore SSP del percorso CMIP6 attivo a cinque modelli (SSP_FACTORS: 0.55 / 0.78 / 1.00); i giorni sopra 40°C per gli scenari non attivi sono una stima di pattern-scaling lineare attorno al riferimento — metodo usato negli emulatori di scenari dell’IPCC.",
      models_note: "Insieme CMIP6 a cinque modelli: CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H — tramite l’API climatica Open-Meteo.",
      charts_title: "Grafici vettoriali ad alta risoluzione",
      chart_stripes: "Strisce di riscaldamento 1950–2024 (ERA5)",
      chart_sim: "Percorso proiettato 2025–2050 (CMIP6)",
      chart_sea: "Indicatore del livello del mare costiero 1950–2050",
      cap_stripes: "Ogni striscia rappresenta un anno (anomalia più bassa a un estremo → più alta all’altro) — anomalia 2024: {v} sopra il riferimento 1981–2010.",
      cur_ssp: "La curva del §4 segue lo scenario attualmente attivo nel simulatore: {v}",
      adapt_title: "Piano strategico di adattamento",
      adv_agri: "Agricoltura e acqua", adv_city: "Città e popolazione", adv_infra: "Infrastruttura",
      sources_title: "Documentazione scientifica e fonti",
      disclaimer: "Rapporto generato automaticamente sul tuo dispositivo dall’archivio ERA5, dalle uscite CMIP6 e dalle costanti AR6 — indicativo per la pianificazione e non sostituisce le autorità ufficiali.",
      gen_line: "Generato localmente il {dt} — Matar Pro funziona interamente sul dispositivo dell’utente, senza server.",
      v_fast: "un riscaldamento più veloce della media mondiale", v_par: "un ritmo in linea con la media mondiale", v_slow: "un ritmo più lento della media mondiale", v_cooling: "una rara tendenza al raffreddamento",
      v_drying: "inaridimento", v_stable: "stabilità relativa", v_wetting: "umidità crescente",
    },
  };

  /* ══ 2) أدوات اللغة والأرقام (محاكاة أدوات climate.js حرفيًا) ══ */

  function langKey() {
    var l = ((document.documentElement.lang || "ar") + "").slice(0, 2).toLowerCase();
    return L[l] ? l : "ar";
  }

  /* ترجمة مفتاح داخلي مع تعويض قوالب {v} — بلا eval ولا new Function */
  function t(key, vars) {
    var s = L[langKey()][key];
    if (typeof s !== "string") s = L.ar[key] || key;
    if (vars) {
      for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
    }
    return s;
  }

  function deg() { return L[langKey()].deg; }

  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function fmt1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  function fmtInt(v) { return String(Math.round(v)); }
  function sgn(v) { return v < 0 ? "-" : "+"; }
  function signed1(v) { return isNum(v) ? sgn(v) + fmt1(Math.abs(v)) : t("na"); }
  function signedInt(v) { return isNum(v) ? sgn(v) + fmtInt(Math.abs(v)) : t("na"); }

  /* ══ 3) عنصر DOM آمن بـ CSP — createElement + textContent حصريًا ══ */

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined && txt !== null) n.textContent = txt;
    return n;
  }

  /* ══ 4) ثوابت علمية مطابقة لـ climate.js v74 ══
     (SSP_FACTORS لتحجيم السيناريوهات · معدلات AR6 للبحر · القيم المرجعية) */

  var SSP_FACTORS = { ssp126: 0.55, ssp245: 0.78, ssp585: 1.0 };
  var SSP_RATES_MM = { ssp126: 4.0, ssp245: 5.2, ssp585: 6.9 }; /* مم/سنة وفق مسارات AR6 */
  var SEA_OLD_RATE_MM = 1.4, SEA_SAT_RATE_MM = 3.3; /* 1950–1992 · 1993–2024 */
  var GLOBAL_WARMING_PER_DECADE = 0.18, MENA_WARMING_PER_DECADE = 0.26;
  var SEA_REC_2024_CM = 43 * SEA_OLD_RATE_MM / 10 + 31 * SEA_SAT_RATE_MM / 10; /* ≈ 16.3 سم */
  var CLIMATE_MODELS_LIST = "CMCC-CM2-VHR4 · FGOALS-f3-H · HiRAM-SIT-HR · MRI-AGCM3-2-S · EC-Earth3P-H";

  var LAYER_ID = "climate-print-report";
  var STYLE_ID = "climate-print-style";
  var BTN_ID = "climate-export-pdf";

  /* ══ 5) جمع البيانات الجاهزة من الحالة العامة + DOM ══ */

  function domText(id) {
    try {
      var n = document.getElementById(id);
      if (!n) return null;
      var v = (n.textContent || "").replace(/\s+/g, " ").trim();
      return v && v !== "—" && v !== "—" ? v : null;
    } catch (e) { return null; }
  }

  function collect() {
    var s = null;
    try { s = window.__MATAR_CLIMATE_STATE || null; } catch (e) { s = null; }

    var d = {
      state: s, place: null, city: null, lat: null, lon: null,
      rate: null, rateVerdict: null, r2: null,
      anom2024: null, baseline: null,
      gddEarly: null, gddRecent: null,
      frostLast: null, frostPrev: null,
      heatP95: null, heatP50: null,
      spei: null, speiVerdict: null, speiFirst: null, speiLast: null,
      coastal: false, sea24cm: null, seaSsp: null,
      sim: null, simSsp: null, simFactor: null, simModels: null,
      advAgri: null, advCity: null, advInfra: null,
      ready: false
    };

    if (s && typeof s === "object") {
      if (s.place && typeof s.place === "object") {
        d.place = s.place;
        d.lat = isNum(s.place.latitude) ? s.place.latitude : null;
        d.lon = isNum(s.place.longitude) ? s.place.longitude : null;
        if (typeof s.place.name === "string" && s.place.name) d.city = s.place.name;
      }
      var h = s.hist || {};
      if (h.stripes) {
        d.anom2024 = isNum(h.stripes.anomaly2024) ? h.stripes.anomaly2024 : null;
        d.baseline = isNum(h.stripes.baseline) ? h.stripes.baseline : null;
      }
      if (h.warmingRate) {
        d.rate = isNum(h.warmingRate.perDecade) ? h.warmingRate.perDecade : null;
        d.rateVerdict = h.warmingRate.verdict || null;
        d.r2 = isNum(h.warmingRate.r2) ? h.warmingRate.r2 : null;
      }
      if (h.gdd) {
        d.gddEarly = isNum(h.gdd.earlyAvg) ? h.gdd.earlyAvg : null;
        d.gddRecent = isNum(h.gdd.recentAvg) ? h.gdd.recentAvg : null;
      }
      if (h.frost) {
        d.frostLast = isNum(h.frost.last) ? h.frost.last : null;
        d.frostPrev = isNum(h.frost.avgPrev) ? h.frost.avgPrev : null;
      }
      if (h.heat) {
        d.heatP95 = isNum(h.heat.p95) ? h.heat.p95 : null;
        d.heatP50 = isNum(h.heat.p50) ? h.heat.p50 : null;
      }
      if (h.spei) {
        d.spei = isNum(h.spei.trendPerDecade) ? h.spei.trendPerDecade : null;
        d.speiVerdict = h.spei.verdict || null;
        d.speiFirst = isNum(h.spei.firstAvg) ? h.spei.firstAvg : null;
        d.speiLast = isNum(h.spei.lastAvg) ? h.spei.lastAvg : null;
      }
      if (h.sea && h.sea.coastal) {
        d.coastal = true;
        d.sea24cm = isNum(h.sea.cumulative2024cm) ? h.sea.cumulative2024cm : null;
        d.seaSsp = h.sea.ssp || null;
      }
      if (s.sim2050 && s.sim2050.available) {
        d.sim = s.sim2050;
        d.simSsp = s.sim2050.ssp || null;
        d.simFactor = isNum(s.sim2050.factor) ? s.sim2050.factor : null;
        d.simModels = isNum(s.sim2050.models) ? s.sim2050.models : null;
      }
      d.ready = !!(s.place && (h.available || d.sim));
    }

    /* توصيات المستشار — تُقرأ من DOM الحية فتخرج بلغة الواجهة نفسها */
    d.advAgri = domText("climate-adv-agri");
    d.advCity = domText("climate-adv-city");
    d.advInfra = domText("climate-adv-infra");
    if (!d.ready) { d.advAgri = d.advCity = d.advInfra = null; }

    /* اسم المدينة احتياطًا من شارة الموقع في الترويسة */
    if (!d.city) {
      var chip = document.getElementById("climate-loc-chip");
      if (chip) {
        var sp = chip.querySelector("span");
        var v = sp ? (sp.textContent || "").trim() : "";
        if (v && v !== "—") d.city = v;
      }
    }
    return d;
  }

  /* ══ 6) اشتقاق السيناريوهات الثلاثة من حالة المحاكي ══
     sim2050 يخزّن المسار المقيَّس للسيناريو النشط بعامله f؛ لذا يعاد اشتقاق
     سيناريوهين آخرين بنسبة العاملين (تحجيم نمطي خطي — حرارة وأمطار اشتقاق
     مضبوط رياضيًا، والأيام فوق 40°م تقدير نمطي حول خط الأساس كما في مُحرّكات IPCC). */

  function scenarioRows(d) {
    var sim = d.sim;
    var has = !!(sim && sim.cards);
    var fCur = (has && isNum(sim.factor)) ? sim.factor : 1;
    var base = (has && sim.baseline) ? sim.baseline : {};
    var cards = has ? sim.cards : {};
    var hotBase = isNum(base.hot40) ? base.hot40 : null;
    var hotMean = (cards.hot40 && isNum(cards.hot40.mean)) ? cards.hot40.mean : null;
    var keys = ["ssp126", "ssp245", "ssp585"];
    var out = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var r = SSP_FACTORS[k] / fCur;
      var row = { key: k, active: (sim && sim.ssp === k) };
      row.temp = (isNum(cards.warming2050) && has) ? cards.warming2050 * r : null;
      row.hot = (isNum(hotMean) && isNum(hotBase)) ? hotBase + (hotMean - hotBase) * r : null;
      row.hotBase = hotBase;
      row.precip = (isNum(cards.precipPct2050) && has) ? cards.precipPct2050 * r : null;
      if (d.coastal) {
        var rec = isNum(d.sea24cm) ? d.sea24cm : SEA_REC_2024_CM;
        row.sea = rec + (2050 - 2024) * SSP_RATES_MM[k] / 10;
      } else {
        row.sea = null;
      }
      out.push(row);
    }
    return out;
  }

  function sspLabel(key) {
    return t(key === "ssp126" ? "ssp126_label" : key === "ssp245" ? "ssp245_label" : "ssp585_label");
  }

  /* ══ 7) استنساخ SVG آمن — cloneNode(true) + إعادة ترقيم المعرفات ══
     المعرفات الداخلية (تدرجات · مسارات قص) تُلحق بـ -cpr وتُحدَّث كل مراجع
     url(#id) و#id داخل النسخة كي لا تتعارض مع أصول الصفحة المخفية زمن الطباعة. */

  var SVG_NS = "http://www.w3.org/2000/svg";
  var URL_REF_ATTRS = ["fill", "stroke", "clip-path", "mask", "filter",
    "marker-start", "marker-mid", "marker-end", "xlink:href", "href"];

  function cloneSvgSafe(src) {
    var clone = src.cloneNode(true);
    var idMap = {};
    var i, j, k;
    var rootId = clone.getAttribute && clone.getAttribute("id");
    if (rootId) {
      var rootNew = rootId + "-cpr";
      clone.setAttribute("id", rootNew);
      idMap[rootId] = rootNew;
    }
    var withIds = clone.querySelectorAll("[id]");
    for (i = 0; i < withIds.length; i++) {
      var oid = withIds[i].getAttribute("id");
      var nid = oid + "-cpr";
      withIds[i].setAttribute("id", nid);
      idMap[oid] = nid;
    }
    var all = clone.querySelectorAll("*");
    for (j = 0; j < all.length; j++) {
      var node = all[j];
      if (!node.getAttribute) continue;
      for (k = 0; k < URL_REF_ATTRS.length; k++) {
        var a = URL_REF_ATTRS[k];
        var v = node.getAttribute(a);
        if (!v) continue;
        var m = v.match(/^url\(#([^)]+)\)$/);
        if (m && idMap[m[1]]) { node.setAttribute(a, "url(#" + idMap[m[1]] + ")"); continue; }
        if (v.charAt(0) === "#" && idMap[v.slice(1)]) node.setAttribute(a, "#" + idMap[v.slice(1)]);
      }
    }
    return clone;
  }

  /* إزالة width/height الثابتين كي يتمدد الرسم بعرض A4 الكامل مع viewBox */
  function chartClone(src) {
    var c = cloneSvgSafe(src);
    try {
      if (c.hasAttribute("width")) c.removeAttribute("width");
      if (c.hasAttribute("height")) c.removeAttribute("height");
      c.setAttribute("preserveAspectRatio", "xMidYMid meet");
    } catch (e) {}
    return c;
  }

  function pickSvg() {
    var sels = Array.prototype.slice.call(arguments);
    for (var i = 0; i < sels.length; i++) {
      try {
        var n = document.querySelector(sels[i]);
        if (n && n.namespaceURI === SVG_NS) return n;
      } catch (e) {}
    }
    return null;
  }

  /* ══ 8) تنسيقات العرض ══ */

  function fmtCoord(lat, lon) {
    var Lc = L[langKey()];
    if (!isNum(lat) || !isNum(lon)) return t("na");
    return Math.abs(lat).toFixed(2) + "° " + (lat >= 0 ? Lc.north : Lc.south) +
      " · " + Math.abs(lon).toFixed(2) + "° " + (lon >= 0 ? Lc.east : Lc.west);
  }

  function fmtDate() {
    var lang = langKey();
    try {
      var loc = (window.LOCALES && window.LOCALES[lang]) || (lang === "ar" ? "ar-EG" : lang);
      if (typeof Intl === "object" && Intl.DateTimeFormat) {
        return new Intl.DateTimeFormat(loc, { year: "numeric", month: "long", day: "numeric" }).format(new Date());
      }
    } catch (e) {}
    return new Date().toISOString().slice(0, 10);
  }

  function genStamp() {
    var iso = new Date().toISOString();
    return iso.replace("T", " ").slice(0, 16) + " UTC";
  }

  function refNumber(d) {
    var ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    var geo = "00000000";
    if (isNum(d.lat) && isNum(d.lon)) {
      geo = String(Math.round(Math.abs(d.lat) * 100)) + String(Math.round(Math.abs(d.lon) * 100));
    }
    return "MPR-" + ymd + "-" + geo;
  }

  /* ══ 9) بناء التقرير — عناصر رسمية بأسلوب IPCC/WMO ══ */

  function statCard(label, value, note) {
    var c = el("div", "cpr-stat");
    c.appendChild(el("p", "cpr-stat-label", label));
    c.appendChild(el("p", "cpr-stat-value", value));
    c.appendChild(el("p", "cpr-stat-note", note));
    return c;
  }

  function secHead(num, title, extraCls) {
    var h = el("div", "cpr-sec-head" + (extraCls ? " " + extraCls : ""));
    h.appendChild(el("span", "cpr-sec-num", num));
    h.appendChild(el("h2", "cpr-sec-title", title));
    return h;
  }

  function metaItem(label, value) {
    var d = el("div");
    var b = el("b", null, label + ": ");
    d.appendChild(b);
    d.appendChild(document.createTextNode(value));
    return d;
  }

  function execParagraph(d, row245) {
    var city = d.city || t("na");
    var rate = isNum(d.rate) ? fmt1(d.rate) : t("na");
    var anom = isNum(d.anom2024) ? signed1(d.anom2024) : t("na");
    var v = t("v_" + (d.speiVerdict || "stable"));
    var w = (row245 && isNum(row245.temp)) ? signed1(row245.temp) : t("na");
    return t("exec_para", {
      city: city, rate: rate, g: fmt1(GLOBAL_WARMING_PER_DECADE),
      m: fmt1(MENA_WARMING_PER_DECADE), anom: anom, v: v, w: w
    });
  }

  /* جدول المؤشرات التاريخية: خلية قيمة + سياق صغير بنفس الخلية */
  function histRow(tblBody, label, valueTxt, ctxTxt) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.setAttribute("scope", "row");
    th.textContent = label;
    tr.appendChild(th);
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(valueTxt));
    if (ctxTxt) {
      td.appendChild(el("span", "cpr-ctx", "  ·  " + ctxTxt));
    }
    tr.appendChild(td);
    tblBody.appendChild(tr);
  }

  function buildHistTable(d) {
    var tbl = document.createElement("table");
    tbl.className = "cpr-tbl";
    var thead = document.createElement("thead");
    var trh = document.createElement("tr");
    var th1 = document.createElement("th");
    th1.setAttribute("scope", "col");
    th1.textContent = t("col_metric");
    var th2 = document.createElement("th");
    th2.setAttribute("scope", "col");
    th2.textContent = t("value_lbl");
    trh.appendChild(th1); trh.appendChild(th2);
    thead.appendChild(trh);
    tbl.appendChild(thead);
    var tbody = document.createElement("tbody");

    var na = t("na");

    /* معدل الاحترار + سياق عالمي/إقليمي + الحكم */
    histRow(tbody, t("row_rate"),
      isNum(d.rate) ? signed1(d.rate) + deg() + "/" + t("decade_word") : na,
      t("rate_ctx") + (d.rateVerdict ? " · " + t("v_" + d.rateVerdict) : ""));

    /* شذوذ 2024 */
    histRow(tbody, t("stat_anom"),
      isNum(d.anom2024) ? signed1(d.anom2024) + deg() : na,
      t("stat_anom_note") + (isNum(d.baseline) ? " (" + fmt1(d.baseline) + deg() + ")" : ""));

    /* GDD: متوسط أول عقد ← آخر عقد + النسبة */
    var gddV = na, gddCtx = "";
    if (isNum(d.gddEarly) && isNum(d.gddRecent)) {
      gddV = fmtInt(d.gddEarly) + " → " + fmtInt(d.gddRecent);
      if (d.gddEarly > 0) {
        var gddPct = (d.gddRecent - d.gddEarly) / d.gddEarly * 100;
        gddCtx = signed1(gddPct) + "%";
      }
    }
    histRow(tbody, t("row_gdd"), gddV, gddCtx);

    /* ليالي الصقيع: متوسط سابق ← آخر قيمة */
    histRow(tbody, t("row_frost"),
      (isNum(d.frostPrev) || isNum(d.frostLast)) ? fmt1(d.frostPrev) + " → " + fmt1(d.frostLast) : na, "");

    /* سياق موجة الحر P95 · P50 */
    histRow(tbody, t("row_heat"),
      (isNum(d.heatP95) || isNum(d.heatP50)) ? fmt1(d.heatP95) + deg() + " · " + fmt1(d.heatP50) + deg() : na, "");

    /* اتجاه الجفاف P−E (مم/عقد) + الحكم */
    histRow(tbody, t("row_spei"),
      isNum(d.spei) ? signed1(d.spei) + " " + t("u_mmd") : na,
      d.speiVerdict ? t("v_" + d.speiVerdict) : "");

    /* البحر الساحلي 2024 (إن وُجد) */
    if (d.coastal) {
      histRow(tbody, t("row_sea"),
        isNum(d.sea24cm) ? fmt1(d.sea24cm) + " " + t("u_cm") : na, "");
    }

    tbl.appendChild(tbody);
    return tbl;
  }

  /* جدول مقارنة السيناريوهات الثلاثة لعام 2050 */
  function buildScenarioTable(d, rows) {
    var tbl = document.createElement("table");
    tbl.className = "cpr-tbl cpr-scn";
    var thead = document.createElement("thead");
    var trh = document.createElement("tr");

    var th0 = document.createElement("th");
    th0.setAttribute("scope", "col");
    th0.textContent = t("col_metric");
    trh.appendChild(th0);

    var heads = [["ssp126", "cpr-c126"], ["ssp245", "cpr-c245"], ["ssp585", "cpr-c585"]];
    for (var h = 0; h < heads.length; h++) {
      var th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.className = heads[h][1];
      th.textContent = sspLabel(heads[h][0]);
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    tbl.appendChild(thead);
    var tbody = document.createElement("tbody");

    var na = t("na");

    function scnRow(label, cell) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = label;
      tr.appendChild(th);
      for (var i = 0; i < rows.length; i++) {
        var td = document.createElement("td");
        td.className = "cpr-c" + rows[i].key.slice(3);
        td.textContent = cell(rows[i]);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    /* ① ارتفاع الحرارة المتوقع فوق أساس 1981–2010 */
    scnRow(t("row_temp2050"), function (r) {
      return isNum(r.temp) ? signed1(r.temp) + deg() : na;
    });

    /* ② الأيام فوق 40°م سنويًا (أساس 1981–2010) */
    var baseTxt = "";
    if (rows.length && isNum(rows[0].hotBase)) baseTxt = " (" + t("baseline_lbl") + " " + fmtInt(rows[0].hotBase) + ")";
    scnRow(t("row_days40") + baseTxt, function (r) {
      return isNum(r.hot) ? fmtInt(r.hot) + " " + t("u_days") : na;
    });

    /* ③ تغير الأمطار السنوية */
    scnRow(t("row_rain2050"), function (r) {
      return isNum(r.precip) ? signedInt(r.precip) + "%" : na;
    });

    /* ④ ارتفاع مستوى البحر (للمدن الساحلية فقط) */
    if (d.coastal) {
      scnRow(t("row_sea2050"), function (r) {
        return isNum(r.sea) ? fmt1(r.sea) + " " + t("u_cm") : na;
      });
    }

    tbl.appendChild(tbody);
    return tbl;
  }

  /* بطاقة رسم متجه: عنوان + نسخة SVG معاد ترقيم معرفاتها + تعليق */
  function chartBlock(titleKey, svg, capTxt) {
    if (!svg) return null;
    var fig = el("div", "cpr-chart");
    fig.appendChild(el("h3", null, titleKey));
    fig.appendChild(chartClone(svg));
    if (capTxt) fig.appendChild(el("p", "cpr-cap", capTxt));
    return fig;
  }

  /* ══ 10) المولّد الرئيسي للطبقة #climate-print-report ══ */

  function buildReport(d) {
    var lang = langKey();
    var layer = el("div");
    layer.id = LAYER_ID;
    layer.setAttribute("role", "document");
    layer.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    layer.setAttribute("lang", lang);

    var art = el("article", "cpr-art");
    var rows = scenarioRows(d);
    var row245 = rows[1];
    var na = t("na");

    /* — الترويسة الرسمية — */
    var head = el("header", "cpr-head");

    var brandRow = el("div", "cpr-brand");
    var logo = null;
    try {
      var logoSrc = document.querySelector(".brand .brand-mark .mlogo-vec") ||
        document.querySelector(".brand-mark .mlogo-vec") ||
        document.querySelector(".mlogo-vec");
      if (logoSrc) {
        logo = cloneSvgSafe(logoSrc);
        logo.setAttribute("class", "cpr-logo-svg");
        logo.setAttribute("width", "44");
        logo.setAttribute("height", "44");
      }
    } catch (e) { logo = null; }
    if (logo) brandRow.appendChild(logo);
    var brandTxt = el("div", "cpr-brand-txt");
    brandTxt.appendChild(el("p", "cpr-brand-name", t("brand")));
    brandTxt.appendChild(el("p", "cpr-brand-obs", t("obs")));
    brandRow.appendChild(brandTxt);
    head.appendChild(brandRow);

    var titleTxt = t("report_word") + (d.city ? " — " + d.city : "");
    head.appendChild(el("h1", "cpr-title", titleTxt));

    var meta = el("div", "cpr-meta");
    meta.appendChild(metaItem(t("meta_city"), d.city || na));
    meta.appendChild(metaItem(t("meta_coords"), fmtCoord(d.lat, d.lon)));
    meta.appendChild(metaItem(t("meta_date"), fmtDate()));
    meta.appendChild(metaItem(t("meta_ref"), refNumber(d)));
    head.appendChild(meta);
    art.appendChild(head);

    /* تنبيه اكتمال البيانات */
    if (!d.ready) {
      art.appendChild(el("p", "cpr-warn", t("not_ready")));
    }

    /* — §1 الملخص التنفيذي بالأرقام — */
    var s1 = el("section", "cpr-sec");
    s1.appendChild(secHead("1", t("exec_title")));
    s1.appendChild(el("p", "cpr-lead", d.place ? execParagraph(d, row245) : t("not_ready")));
    var stats = el("div", "cpr-stats");
    stats.appendChild(statCard(t("stat_rate"),
      isNum(d.rate) ? signed1(d.rate) + deg() : na, t("stat_rate_note")));
    stats.appendChild(statCard(t("stat_anom"),
      isNum(d.anom2024) ? signed1(d.anom2024) + deg() : na, t("stat_anom_note")));
    stats.appendChild(statCard(t("stat_spei"),
      isNum(d.spei) ? signed1(d.spei) + " " + t("u_mmd") : na,
      t("v_" + (d.speiVerdict || "stable"))));
    stats.appendChild(statCard(t("stat_2050"),
      (row245 && isNum(row245.temp)) ? signed1(row245.temp) + deg() : na,
      t("ssp245_label")));
    s1.appendChild(stats);
    art.appendChild(s1);

    /* — §2 المؤشرات التاريخية — */
    var s2 = el("section", "cpr-sec");
    s2.appendChild(secHead("2", t("hist_title")));
    s2.appendChild(buildHistTable(d));
    s2.appendChild(el("p", "cpr-note", t("models_note")));
    art.appendChild(s2);

    /* — §3 مقارنة سيناريوهات 2050 — */
    var s3 = el("section", "cpr-sec");
    s3.appendChild(secHead("3", t("scen_title")));
    s3.appendChild(buildScenarioTable(d, rows));
    s3.appendChild(el("p", "cpr-note", t("method_note")));
    if (d.simSsp) {
      s3.appendChild(el("p", "cpr-note", t("cur_ssp", { v: sspLabel(d.simSsp) })));
    }
    art.appendChild(s3);

    /* — §4 الرسومات المتجهة (استنساخ مباشر من الصفحة) — */
    var s4 = el("section", "cpr-sec cpr-sec-charts");
    s4.appendChild(secHead("4", t("charts_title")));

    var stripesSvg = pickSvg(
      '#climate-pane-hist .mc-section.mc-stripes svg',
      '[data-matar-climate="hist"] .mc-stripes-wrap svg',
      '[data-matar-climate="hist"] .mc-body svg'
    );
    if (stripesSvg) {
      s4.appendChild(chartBlock(t("chart_stripes"), stripesSvg,
        isNum(d.anom2024) ? t("cap_stripes", { v: signed1(d.anom2024) + deg() }) : ""));
    }

    var simSvg = pickSvg(
      '[data-matar-climate="2050"] .mc-chart-wrap svg',
      '[data-matar-climate="2050"] svg'
    );
    if (simSvg) {
      s4.appendChild(chartBlock(t("chart_sim"), simSvg,
        d.simSsp ? t("cur_ssp", { v: sspLabel(d.simSsp) }) : ""));
    }

    var seaSvg = d.coastal ? pickSvg(
      '.mc-section.mc-sea svg',
      '[data-matar-climate="hist"] .mc-sea svg'
    ) : null;
    if (seaSvg) {
      s4.appendChild(chartBlock(t("chart_sea"), seaSvg, t("models_note")));
    }

    if (!stripesSvg && !simSvg && !seaSvg) {
      s4.appendChild(el("p", "cpr-note", t("not_ready")));
    }
    art.appendChild(s4);

    /* — §5 خطة التكيّف الاستراتيجية — */
    var s5 = el("section", "cpr-sec");
    s5.appendChild(secHead("5", t("adapt_title")));
    var tracks = [
      ["agri", "adv_agri", d.advAgri],
      ["city", "adv_city", d.advCity],
      ["infra", "adv_infra", d.advInfra]
    ];
    for (var i = 0; i < tracks.length; i++) {
      var box = el("div", "cpr-adv");
      box.setAttribute("data-track", tracks[i][0]);
      var ico = { agri: "🌱", city: "🏙️", infra: "🌉" }[tracks[i][0]];
      box.appendChild(el("h3", null, ico + " " + t(tracks[i][1])));
      box.appendChild(el("p", null, tracks[i][2] || na));
      s5.appendChild(box);
    }
    art.appendChild(s5);

    /* — تذييل التوثيق العلمي — */
    var foot = el("footer", "cpr-foot");
    var srcs = el("p", "cpr-srcs");
    srcs.appendChild(el("b", null, t("sources_title") + ": "));
    srcs.appendChild(document.createTextNode(
      "ERA5 Reanalysis (ECMWF) · CMIP6 5-Model Ensemble · IPCC AR6 · NASA GIBS · Esri Living Atlas"
    ));
    foot.appendChild(srcs);
    foot.appendChild(el("p", null, t("models_note")));
    foot.appendChild(el("p", null, t("disclaimer")));
    foot.appendChild(el("p", "cpr-gen", t("gen_line", { dt: genStamp() })));
    art.appendChild(foot);

    layer.appendChild(art);
    return layer;
  }

  /* ══ 11) أنماط الطباعة A4 — تُحقن بـ <style> و textContent ══
     على الشاشة: الطبقة مخفية تمامًا · عند الطباعة: تُخفى واجهة التطبيق
     بالكامل ويُطبع التقرير وحده A4 بخلفية بيضاء نقية وألوان صريحة. */

  var PRINT_CSS = [
    "/* مَطَر برو — طبقة تقرير مرصد المناخ: مخفية على الشاشة */",
    "#" + LAYER_ID + " { display: none !important; }",
    "",
    "@media print {",
    "  @page { size: A4 portrait; margin: 12mm 12mm 14mm; }",
    "",
    "  html, body { background: #fff !important; overflow: visible !important; height: auto !important; }",
    "  body > *:not(#" + LAYER_ID + ") { display: none !important; }",
    "  #" + LAYER_ID + " { display: block !important; }",
    "",
    "  #" + LAYER_ID + " {",
    "    width: 100%; margin: 0; padding: 0; background: #fff; color: #24484e;",
    "    font-family: \"Segoe UI\", Tahoma, \"Noto Sans Arabic\", Arial, sans-serif;",
    "    font-size: 10.2pt; line-height: 1.62;",
    "    -webkit-print-color-adjust: exact; print-color-adjust: exact;",
    "  }",
    "  .cpr-art { display: block; }",
    "",
    "  /* الترويسة الرسمية */",
    "  .cpr-head { border-bottom: 3px solid #24636c; padding-bottom: 10px; margin-bottom: 4px; }",
    "  .cpr-head::after { content: \"\"; display: block; border-bottom: 1px solid #24636c; margin-top: 3px; }",
    "  .cpr-brand { display: flex; align-items: center; gap: 10px; }",
    "  .cpr-logo-svg { width: 44px; height: 44px; flex: 0 0 auto; }",
    "  .cpr-brand-name { margin: 0; font-size: 13.5pt; font-weight: 800; color: #24636c; }",
    "  .cpr-brand-obs { margin: 1px 0 0; font-size: 8.6pt; font-weight: 700; color: #586b68; }",
    "  .cpr-title { margin: 13px 0 4px; font-size: 17pt; font-weight: 800; color: #24484e; line-height: 1.25; }",
    "  .cpr-meta { display: flex; flex-wrap: wrap; gap: 3px 16px; margin-top: 8px; padding: 7px 10px;",
    "    background: #eef3f0; border: 1px solid #cfd8d2; border-radius: 6px; }",
    "  .cpr-meta div { font-size: 8.2pt; color: #586b68; }",
    "  .cpr-meta b { color: #24484e; font-weight: 800; }",
    "",
    "  /* الأقسام */",
    "  .cpr-sec { margin-top: 15px; }",
    "  .cpr-sec-head { display: flex; align-items: center; gap: 8px; border-bottom: 1.5px solid #24636c;",
    "    padding-bottom: 4px; margin-bottom: 9px; break-after: avoid; page-break-after: avoid; }",
    "  .cpr-sec-num { display: inline-block; min-width: 17px; padding: 1px 5px; text-align: center;",
    "    background: #24636c; color: #fffdf8; font-size: 8.6pt; font-weight: 800; border-radius: 3px; }",
    "  .cpr-sec-title { margin: 0; font-size: 12.6pt; font-weight: 800; color: #24636c; }",
    "  .cpr-lead { margin: 0 0 10px; font-size: 10.4pt; line-height: 1.78; text-align: justify; }",
    "",
    "  /* بطاقات الملخص التنفيذي */",
    "  .cpr-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; }",
    "  .cpr-stat { border: 1px solid #cfd8d2; border-top: 3px solid #24636c; border-radius: 6px;",
    "    padding: 8px 9px; break-inside: avoid; page-break-inside: avoid; }",
    "  .cpr-stat-label { margin: 0; font-size: 7.6pt; font-weight: 700; color: #586b68; line-height: 1.35; }",
    "  .cpr-stat-value { margin: 5px 0 2px; font-size: 15.5pt; font-weight: 800; color: #24484e; line-height: 1.1; }",
    "  .cpr-stat-note { margin: 0; font-size: 7.2pt; color: #586b68; line-height: 1.4; }",
    "",
    "  /* الجداول */",
    "  table.cpr-tbl { width: 100%; border-collapse: collapse; margin: 4px 0 3px; font-size: 9.2pt; }",
    "  .cpr-tbl th, .cpr-tbl td { border: 1px solid #cfd8d2; padding: 5.5px 8px; text-align: start; }",
    "  .cpr-tbl thead th { background: #24636c; color: #fffdf8; font-weight: 800; font-size: 8.6pt; }",
    "  .cpr-tbl thead th.cpr-c126 { background: #17663a; }",
    "  .cpr-tbl thead th.cpr-c245 { background: #8a4f1b; }",
    "  .cpr-tbl thead th.cpr-c585 { background: #ab342e; }",
    "  .cpr-tbl tbody th { background: #eef3f0; color: #24484e; font-weight: 700; width: 40%; font-size: 8.8pt; }",
    "  .cpr-tbl tbody tr:nth-child(even) td { background: #f6faf8; }",
    "  .cpr-tbl tbody td { font-weight: 700; }",
    "  .cpr-tbl tbody td.cpr-c126 { color: #17663a; }",
    "  .cpr-tbl tbody td.cpr-c245 { color: #8a4f1b; }",
    "  .cpr-tbl tbody td.cpr-c585 { color: #ab342e; }",
    "  .cpr-tbl .cpr-ctx { font-weight: 600; color: #586b68; font-size: 8pt; }",
    "",
    "  .cpr-note { margin: 5px 0 0; font-size: 7.4pt; color: #586b68; line-height: 1.55; }",
    "  .cpr-warn { border: 1.5px solid #d9a526; background: #fdf6e3; color: #6b4d09; border-radius: 6px;",
    "    padding: 8px 10px; font-size: 9pt; font-weight: 700; margin: 10px 0 0; }",
    "",
    "  /* الرسومات المتجهة — صفحة مستقلة بعرض كامل */",
    "  .cpr-sec-charts { break-before: page; page-break-before: always; margin-top: 0; }",
    "  .cpr-chart { margin: 8px 0 13px; border: 1px solid #cfd8d2; border-radius: 8px; padding: 10px 10px 8px;",
    "    break-inside: avoid; page-break-inside: avoid; }",
    "  .cpr-chart h3 { margin: 0 0 6px; font-size: 9.8pt; font-weight: 800; color: #24484e; }",
    "  .cpr-chart svg { width: 100% !important; height: auto !important; max-width: 100%; display: block; }",
    "  .cpr-chart svg text { fill: #24484e !important; }",
    "  .cpr-cap { margin: 6px 0 0; font-size: 7.4pt; color: #586b68; line-height: 1.5; }",
    "",
    "  /* خطة التكيّف */",
    "  .cpr-adv { border: 1px solid #cfd8d2; border-inline-start: 4px solid #24636c; border-radius: 6px;",
    "    padding: 9px 11px; margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid; }",
    "  .cpr-adv[data-track=\"agri\"] { border-inline-start-color: #17663a; }",
    "  .cpr-adv[data-track=\"city\"] { border-inline-start-color: #24636c; }",
    "  .cpr-adv[data-track=\"infra\"] { border-inline-start-color: #d9935b; }",
    "  .cpr-adv h3 { margin: 0 0 4px; font-size: 10.6pt; font-weight: 800; color: #24484e; }",
    "  .cpr-adv p { margin: 0; font-size: 9.4pt; line-height: 1.7; text-align: justify; }",
    "",
    "  /* تذييل التوثيق */",
    "  .cpr-foot { margin-top: 15px; border-top: 2.5px solid #24636c; padding-top: 8px;",
    "    break-inside: avoid; page-break-inside: avoid; }",
    "  .cpr-foot p { margin: 0 0 4px; font-size: 8pt; color: #586b68; line-height: 1.6; }",
    "  .cpr-srcs { color: #24484e; font-weight: 700; }",
    "  .cpr-gen { font-size: 7.4pt; }",
    "}"
  ].join("\n");

  function buildStyleEl() {
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = PRINT_CSS;
    return st;
  }

  /* ══ 12) دورة الحياة: بناء ← طباعة ← إزالة ══ */

  var listenersOn = false;

  function cleanup() {
    try {
      var st = document.getElementById(STYLE_ID);
      if (st && st.parentNode) st.parentNode.removeChild(st);
      var ly = document.getElementById(LAYER_ID);
      if (ly && ly.parentNode) ly.parentNode.removeChild(ly);
    } catch (e) {}
    if (listenersOn) {
      window.removeEventListener("afterprint", onAfterPrint);
      window.removeEventListener("focus", onFocusPrint);
      listenersOn = false;
    }
  }

  function onAfterPrint() { setTimeout(cleanup, 80); }
  function onFocusPrint() { setTimeout(cleanup, 500); }

  function exportNow() {
    cleanup(); /* إزالة أي طبقة سابقة قبل بناء نسخة جديدة بالبيانات الأحدث */

    var d = collect();
    var layer = buildReport(d);
    var styleEl = buildStyleEl();

    document.head.appendChild(styleEl);
    document.body.appendChild(layer); /* طفل مباشر لـ body كي تصيغه قاعدة الإخفاء */

    if (!listenersOn) {
      window.addEventListener("afterprint", onAfterPrint);
      window.addEventListener("focus", onFocusPrint);
      listenersOn = true;
    }

    /* إطار واحد كي تستقر بنية الطبقة قبل فتح حوار الطباعة */
    setTimeout(function () {
      try { window.print(); }
      catch (e) { cleanup(); }
    }, 90);
  }

  /* ══ 13) مفتاح ترجمة زر التصدير — يُحقن في I18N_EXTRA ليتجاوب مع
     آلية data-i18n في app.js بكل اللغات السبع (ar هو نص الزر الافتراضي) ══ */

  function injectExportI18n() {
    try {
      if (window.I18N_EXTRA && !window.I18N_EXTRA["clim_export_pdf"]) {
        window.I18N_EXTRA["clim_export_pdf"] = {
          ar: "تصدير التقرير العلمي (PDF)",
          en: "Export scientific report (PDF)",
          fr: "Exporter le rapport scientifique (PDF)",
          de: "Wissenschaftlichen Bericht exportieren (PDF)",
          es: "Exportar informe científico (PDF)",
          pt: "Exportar relatório científico (PDF)",
          it: "Esporta rapporto scientifico (PDF)"
        };
      }
    } catch (e) {}
  }

  /* تطبيق مباشر فوري على الزر (يغطي حالة ترجمة app.js قبل تحميل هذا الملف) */
  function applyExportBtnLang() {
    try {
      var lang = langKey();
      if (lang === "ar") return;
      var btn = document.getElementById(BTN_ID);
      if (!btn) return;
      var span = btn.querySelector("span[data-i18n]") || null;
      var entry = window.I18N_EXTRA && window.I18N_EXTRA["clim_export_pdf"];
      var txt = entry && entry[lang];
      if (txt && span) span.textContent = txt;
    } catch (e) {}
  }

  /* ══ 14) الإقلاع ══ */

  function init() {
    injectExportI18n();
    applyExportBtnLang();
    var btn = document.getElementById(BTN_ID);
    if (btn) btn.addEventListener("click", exportNow);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* تصدير عام للاستخدام اليدوي من وحدة التحكم أو تكامل مستقبلي */
  try {
    window.MatarClimateReport = { version: "4b", print: exportNow };
  } catch (e) {}

})();
