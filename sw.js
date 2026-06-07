const CACHE_NAME = "kitty-mini-games-v11";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "assets/kitty-source.jpg",
  "assets/icons/icon-32.png",
  "assets/icons/icon-120.png",
  "assets/icons/icon-152.png",
  "assets/icons/icon-167.png",
  "assets/icons/icon-180.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/apple-touch-icon.png",
  "assets/game/customers/customer-1.svg",
  "assets/game/customers/customer-2.svg",
  "assets/game/customers/customer-3.svg",
  "assets/game/customers/florist.svg",
  "assets/game/customers/shopper.svg",
  "assets/game/milk-tea/machine.svg",
  "assets/game/milk-tea/pearl.svg",
  "assets/game/milk-tea/pudding.svg",
  "assets/game/milk-tea/coconut.svg",
  "assets/game/flowers/rose.svg",
  "assets/game/flowers/tulip.svg",
  "assets/game/flowers/daisy.svg",
  "assets/game/flowers/sunflower.svg",
  "assets/game/flowers/baby-breath.svg",
  "assets/game/stall/cart.svg",
  "assets/game/stall/lantern-red.svg",
  "assets/game/stall/lantern-yellow.svg",
  "assets/game/stall/cake.svg",
  "assets/game/stall/skewer.svg",
  "assets/game/stall/cookie.svg",
  "assets/game/stall/gift.svg",
  "assets/game/stall/coin.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
