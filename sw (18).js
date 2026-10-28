/* ============================================================
   مَطَر برو — Service Worker (نسخة مصححة وجاهزة للنشر على GitHub)
   ------------------------------------------------------------
   الإصلاحات الحرجة الثلاثة الثابتة في هذه السلسلة:
   ① activate: فلتر مسح الكاش يفحص الشرطين معًا —
      (!k.startsWith(VERSION) && k !== STATE_CACHE)
      كي لا تُحذف تفضيلات وبيانات المستخدم المخزنة في
      STATE_CACHE ("matar:state") عند كل رفع لرقم الإصدار.
   ② fetch/TILE_HOSTS: عند فشل جلب بلاطة خريطة نعيد PNG شفاف
      بمقاس 1×1 بدل Response.error() — فلا تبدو الخريطة
      "مكسورة" بمربعات بيضاء حادة عند الانقطاع أو ضعف الشبكة.
   ③ showNotification: renotify: true — يهتز الهاتف ويصدر صوتًا
      مجددًا مع كل تنبيه جديد يحمل نفس الـ tag بدل تحديث صامت.
   ============================================================ */

/* النسخة: تُرفع بكل نشر جديد كي يُبني كاش تطبيق نظيف.
   (الفحص الذاتي يتوقع الصيغة: const VERSION = "matar-pro-vرقم")
   v16: إصلاح حرارة الطرق (مطابقة ساعة الوصول نصيًا + إقران الاستجابات بالإحداثيات
   + cell_selection=land) — رفع الإصدار يضمن بناء كاش نظيف ويستبدل أي نسخة قديمة
   مخبأة على أجهزة المستخدمين كانت قد عرضت حرارات من مصفوفات منزاحة.
   v20: إصلاح إمكانية التثبيت (PWA Installability) — أيقونات maskable مستقلة
   بأحجام صحيحة (192/512) ضمن APP_SHELL، ورفع الإصدار كي يُعاد بناء الكاش
   ويظهر زر «تثبيت التطبيق» لدى كل المستخدمين.
   v21: ضبط لغة الواجهات — بطاقات التوجه الموسمي (فترة أمطار وفيرة/قليلة)،
   بطاقات اتجاهات المناخ عبر عشرين سنة، شارة قرار الدرون بكلمات قرار بدل
   الألوان (صالح للطيران/بحذر/ممنوع)، وتنبيهات المزارع (حقلك يحتاج ريًّا
   عاجلًا). رفع الإصدار كي يُبنى كاش نظيف وتصل الصياغات الجديدة لكل الأجهزة. */
const VERSION = "matar-pro-v21";
const APP_CACHE = `${VERSION}:app`;
const TILE_CACHE = `${VERSION}:tiles`;

/* كاش حالة المستخدم: بلا بادئة إصدار عمدًا — يعيش عبر الترقيات.
   التطبيق نفسه يكتب فيه عبر caches.open("matar:state"). */
const STATE_CACHE = "matar:state";

/* أصل التطبيق: الصفحة + المانيفست + الأيقونات (بما فيها maskable التي
   يتطلبها المتصفح للتثبيت على الشاشات الدائرية/القصاصة) + مكتبة الخريطة
   (Leaflet من cdnjs بنفس روابط CSP) كي تعمل الخرائط دون اتصال. */
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-180.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
];

/* مضيفو بلاطات الخرائط المسموحون — نفس قائمة img-src في CSP */
const TILE_HOSTS = [
  "server.arcgisonline.com",
  "tilecache.rainviewer.com",
  "gibs.earthdata.nasa.gov",
];

/* مضيفو البيانات (طقس/توجيه/جيوكود): شبكة حيًا دائمًا —
   التطبيق يخزّن البيانات بنفسه في matar:state والأوفلاين يعالجه. */
const API_HOST_SUFFIXES = [
  "open-meteo.com", "rainviewer.com", "project-osrm.org",
  "openstreetmap.de", "komoot.io", "openstreetmap.org", "pollinations.ai",
];

/* ── إصلاح ②: PNG شفاف 1×1 (67 بايت) يُعاد بدل الخطأ الصريح ── */
const TRANSPARENT_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
let transparentPngBytes = null;
function transparentTileResponse() {
  if (!transparentPngBytes) {
    const bin = atob(TRANSPARENT_PNG_BASE64);
    transparentPngBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) transparentPngBytes[i] = bin.charCodeAt(i);
  }
  return new Response(transparentPngBytes, {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}

/* جدول ترجمة نصوص الإشعارات داخل الـ SW (يتطلبه الفحص الذاتي) */
const SW_I18N = {
  ar: { dir: "rtl", offlineTitle: "مَطَر برو", offlineBody: "التطبيق يعمل الآن دون اتصال — آخر البيانات محفوظة لديك.", updateTitle: "تحديث جديد", updateBody: "انقر لتحديث تطبيق مَطَر برو إلى أحدث نسخة." },
  en: { dir: "ltr", offlineTitle: "Matar Pro", offlineBody: "The app now works offline — your latest data is saved.", updateTitle: "New update", updateBody: "Tap to update Matar Pro to the latest version." },
  fr: { dir: "ltr", offlineTitle: "Matar Pro", offlineBody: "L’app fonctionne hors ligne — vos dernières données sont enregistrées.", updateTitle: "Nouvelle mise à jour", updateBody: "Touchez pour mettre à jour Matar Pro." },
};
function swLang() {
  const l = (self.navigator && self.navigator.language || "ar").slice(0, 2).toLowerCase();
  return SW_I18N[l] || SW_I18N.ar;
}

/* إظهار إشعار: tag دائمًا موجود لأن renotify يتطلبه */
function showLocal(title, body, tag) {
  const t = swLang();
  return self.registration.showNotification(title, {
    body,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: tag || "matar",
    renotify: true, /* إصلاح ③: اهتزاز/صوت مجدد مع كل تنبيه جديد من نفس النوع */
    lang: self.navigator && self.navigator.language || "ar",
    dir: t.dir,
    data: { url: "./" },
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    /* addAll يتوقف عند أول فشل — في بيئات بدون شبكة نثبّت الصفحة وحدها */
    try { await cache.addAll(APP_SHELL); }
    catch (e) { try { await cache.addAll(["./", "./index.html"]); } catch (e2) {} }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  /* إصلاح ①: فلتر الشرطين معًا —
     نحذف كاشًا قديمًا فقط إذا لم يبدأ بإصدارنا الحالي وليس كاش حالة المستخدم.
     (الكاش القديم "matar-pro-v13:*" يُمسح، و"matar:state" ينجو عبر الترقيات) */
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => !k.startsWith(VERSION) && k !== STATE_CACHE)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  /* ── بلاطات الخرائط: كاش أولًا ثم شبكة، والفشل يعيد PNG شفاف (إصلاح ②) ── */
  if (TILE_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req, { mode: "cors", credentials: "omit" });
        if (res && res.ok) { cache.put(req, res.clone()); return res; }
        return transparentTileResponse();
      } catch (e) {
        return transparentTileResponse();
      }
    })());
    return;
  }

  /* ── APIs الطقس والتوجيه: شبكة حيًا بلا تدخل (التطبيق يدير أوفلاينه بنفسه) ── */
  if (API_HOST_SUFFIXES.some((s) => url.hostname === s || url.hostname.endsWith(`.${s}`))) return;

  /* ── تنقل الصفحة: شبكة أولًا ثم الكاش (كي تصل التحديثات بسرعة) ── */
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(APP_CACHE);
        cache.put("./index.html", fresh.clone()).catch(() => {});
        return fresh;
      } catch (e) {
        const cache = await caches.open(APP_CACHE);
        return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
      }
    })());
    return;
  }

  /* ── باقي أصول التطبيق (نفس الأصل أو CDN مسبق التخزين): كاش أولًا ── */
  if (url.origin === self.location.origin || url.hostname === "cdnjs.cloudflare.com" || url.hostname === "unpkg.com" || url.hostname === "cdn.jsdelivr.net") {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const hit = await cache.match(req, { ignoreVary: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()).catch(() => {});
        return res;
      } catch (e) {
        return Response.error();
      }
    })());
  }
});

/* ── Push: خادم مستقبلي يرسل { title, body, tag } ── */
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) { payload = { body: event.data && event.data.text() }; }
  event.waitUntil(showLocal(payload.title || swLang().offlineTitle, payload.body || "", payload.tag));
});

/* ── نقر الإشعار يفتح/يركّز التطبيق ── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      if ("focus" in client) { client.navigate(target).catch(() => {}); return client.focus(); }
    }
    return self.clients.openWindow(target);
  })());
});

/* ── مزامنة دورية في الخلفية (حسب دعم المتصفح) — تلمس العملاء للتحديث ── */
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "matar-refresh") {
    event.waitUntil((async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      all.forEach((client) => client.postMessage({ type: "matar:periodic-refresh" }));
    })());
  }
});

/* ── تفعيل نسخة جديدة فورًا عند طلب الصفحة ── */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
