const CACHE_NAME = "nova-radio-v2";

const FILES = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./translations.js",
    "./manifest.json"
];


self.addEventListener(
"install",
event=>{

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
