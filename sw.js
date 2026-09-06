const CACHE_NAME = "nova-radio-v13";

const FILES = [
    "./?v=13",
    "./index.html?v=13",
    "./styles.css?v=13",
    "./script.js?v=13",
    "./translations.js?v=13",
    "./manifest.json?v=13",
    "./icon-192.png?v=13",
    "./icon-512.png?v=13"
];


self.addEventListener(
"install",
event=>{

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache=>cache.addAll(FILES))
    );

});


self.addEventListener(
"fetch",
event=>{

    event.respondWith(
        caches.match(event.request)
        .then(response=>{

            return response || fetch(event.request);

        })
    );

});


self.addEventListener(
"activate",
event=>{

    event.waitUntil(
        caches.keys()
        .then(keys=>{

            return Promise.all(
                keys
                .filter(key=>key !== CACHE_NAME)
                .map(key=>caches.delete(key))
            );

        })
        .then(()=>self.clients.claim())
    );

});
