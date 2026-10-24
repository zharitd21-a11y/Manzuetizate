

const CACHE_NAME = "manzuetizate-v1";
const ARCHIVOS = [
  "./",
  "./index.html"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith("manzuetizate-") &&
                              nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(evento.request, copia)
          );
        }
        return respuesta;
      })
      .catch(() => caches.match(evento.request).then((guardado) =>
        guardado || (evento.request.mode === "navigate"
          ? caches.match("./index.html")
          : undefined)
      ))
  );
});

