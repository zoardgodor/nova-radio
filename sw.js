const gyorsitotar_neve = "nova-radio-v15";

const fajlok = [
    "./?v=15",
    "./index.html?v=15",
    "./styles.css?v=15",
    "./script.js?v=15",
    "./translations.js?v=15",
    "./manifest.json?v=15",
    "./icon-192.png?v=15",
    "./icon-512.png?v=15"
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
