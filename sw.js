const gyorsitotar_neve = "nova-radio-v16";

const fajlok = [
    "./?v=16",
    "./index.html?v=16",
    "./styles.css?v=16",
    "./script.js?v=16",
    "./translations.js?v=16",
    "./manifest.json?v=16",
    "./icon-192.png?v=16",
    "./icon-512.png?v=16"
];


self.addEventListener(
"install",
esemeny=>{

    self.skipWaiting();

    esemeny.waitUntil(
        caches.open(gyorsitotar_neve)
        .then(gyorsitotar=>gyorsitotar.addAll(fajlok))
    );

});


self.addEventListener(
"fetch",
esemeny=>{

    esemeny.respondWith(
        caches.match(esemeny.request)
        .then(valasz=>{

            return valasz || fetch(esemeny.request);

        })
    );

});


self.addEventListener(
"activate",
esemeny=>{

    esemeny.waitUntil(
        caches.keys()
        .then(kulcsok=>{

            return Promise.all(
                kulcsok
                .filter(kulcs=>kulcs !== gyorsitotar_neve)
                .map(kulcs=>caches.delete(kulcs))
            );

        })
        .then(()=>self.clients.claim())
    );

});
