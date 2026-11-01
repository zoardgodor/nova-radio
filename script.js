const radioapi = "https://de1.api.radio-browser.info/json";

const hang = document.getElementById("audioPlayer");
hang.crossOrigin = "anonymous";

const keresobemenet = document.getElementById("searchInput");
const keresogomb = document.getElementById("searchButton");

const orszagszuro = document.getElementById("countryFilter");
const mufajszuro = document.getElementById("genreFilter");

const radiolista = document.getElementById("radioList");
const kedvenclista = document.getElementById("favoritesList");

const betoltes = document.getElementById("loading");

const allomasneve = document.getElementById("stationName");
const mostszol = document.getElementById("nowPlaying");
const lejatszoallapot = document.getElementById("playerStatus");
const lejatsolapallapot = document.getElementById("playerStatusSheet");

const lejatszasgomb = document.getElementById("playButton");
const leallitasgomb = document.getElementById("stopButton");
const visszatekeresgomb = document.getElementById("rewindButton");
const eloretekeresgomb = document.getElementById("forwardButton");
const laplejatszasgomb = document.getElementById("sheetPlayButton");
const lapleallitasgomb = document.getElementById("sheetStopButton");
const lapvisszatekeresgomb = document.getElementById("sheetRewindButton");
const lapeloretekeresgomb = document.getElementById("sheetForwardButton");

const hangerocsuszka = document.getElementById("volumeSlider");

const kedvenckapcsolo = document.getElementById("favoritesToggle");

const kedvenclenyilo = document.getElementById("favoritesDropdown");

const tovabbiakgomb = document.getElementById("loadMoreButton");

const menugomb = document.getElementById("menuButton");
const menubezarogomb = document.getElementById("closeMenuButton");
const oldalsav = document.getElementById("sidebar");
const reteg = document.getElementById("overlay");

const nyelvvalaszto = document.getElementById("languageSelect");

const lejatszosavallomas = document.getElementById("playerBarStation");
const lejatsosavmeta = document.getElementById("playerBarMeta");
const lejatsosavminoseg = document.getElementById("playerBarQuality");
const lejatsosavikon = document.getElementById("playerBarIcon");
const allomasikon = document.getElementById("stationIcon");
const lejatsolapallomas = document.getElementById("playerSheetStation");
const lejatsolapmeta = document.getElementById("playerSheetMeta");
const lejatsolapprotokoll = document.getElementById("playerSheetProtocol");
const lejatsolapfolyam = document.getElementById("playerSheetStream");
const lejatsolapminoseg = document.getElementById("playerSheetQuality");
const lejatsolapikon = document.getElementById("playerSheetIcon");
const lejatsosav = document.getElementById("playerBar");
const lejatsolap = document.getElementById("playerSheet");
const lejatsolapbezaro = document.getElementById("closePlayerSheet");

const legutobbilista = document.getElementById("recentList");

const legutobbikapcsolo = document.getElementById("recentToggle");

const legutobbilenyilo = document.getElementById("recentDropdown");

const legutobbitorlesgomb = document.getElementById("clearRecentButton");

const elalvasidozitovalaszto = document.getElementById("sleepTimerSelect");
const oldalmegosztogomb = document.getElementById("sharePageButton");
const allomasmegosztogomb = document.getElementById("shareStationButton");
const rogzitogomb = document.getElementById("recordButton");
const hibajelentesgomb = document.getElementById("bugReportButton");
const hibajelentesablak = document.getElementById("bugReportModal");
const hibajelentesmegsemegomb = document.getElementById("cancelBugReportButton");
const hibajelentesmasologomb = document.getElementById("copyBugEmailButton");
const megosztasieritesablak = document.getElementById("shareNoticeModal");
const megosztasieritesbezarogomb = document.getElementById("closeShareNoticeButton");

const hibajelentesemail = "zoardgodor@duck.com";

function ikonletrehozas(nev){
    const ikon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ikon.classList.add("icon");
    ikon.setAttribute("aria-hidden", "true");
    const hasznalat = document.createElementNS("http://www.w3.org/2000/svg", "use");
    hasznalat.setAttribute("href", `#icon-${nev}`);
    ikon.appendChild(hasznalat);
    return ikon;
}

function ikonbeallitas(elem, nev){
    elem.replaceChildren(ikonletrehozas(nev));
}

function lejatsolapnyitasbeallitas(nyitva){
    if(nyitva){
        lejatsolap.classList.add("open");
        lejatsolap.setAttribute("aria-hidden", "false");
    } else {
        lejatsolap.classList.remove("open");
        lejatsolap.setAttribute("aria-hidden", "true");
    }
}


let allomasok = [];

let jelenlegiallomas = null;

let jelenlegifolyamurl = null;

let felhasznaloszuneteltetett = false;

let jelenlegiallapot = "ready";

let oldal = 0;

const oldalmeret = 100;

let elalvasidozito = null;

let ujraprobalasiidok = [3000,5000,10000,15000,20000,30000];

let ujraprobalasiindex = 0;

let ujraprobalasiidozito = null;

let kezialleallitas = false;

let mp3kodolo = null;

let mp3darabok = [];

let rogzitofeldolgozo = null;

let rogzitesfolyamatban = false;

let hangkornyezet = null;

let rogzitesforras = null;

let nyelv =
localStorage.getItem("language") || "en";


const mentetthangero = localStorage.getItem("volume");

hang.volume = mentetthangero !== null
    ? Number(mentetthangero)
    : 0.7;


function lejatszasiurllekero(urlcim){
    if(!urlcim){
        return null;
    }

    return urlcim;
}

function allomasikonlekero(allomas){

    if(
        allomas.favicon &&
        /^https?:\/\//i.test(allomas.favicon)
    ){

        return allomas.favicon;

    }

    return "";

}


function szovegcimmelbeallitas(elem,szoveg){
    const ertek = szoveg || "";
    elem.textContent = ertek;
    elem.title = ertek;
}

function allomasminoseglekero(allomas){
    if(!allomas){
        return forditasok[nyelv].qualityUnavailable;
    }

    const reszek = [];
    if(allomas.codec){
        reszek.push(allomas.codec.toUpperCase());
    }
    if(Number(allomas.bitrate) > 0){
        reszek.push(`${allomas.bitrate} kbps`);
    }
    return reszek.length ? reszek.join(" · ") : forditasok[nyelv].qualityUnavailable;
}

function lejatszofeluletrissites(){
    const cimke = jelenlegiallomas ? jelenlegiallomas.name : forditasok[nyelv].noStationSelected;
    const metaadat = jelenlegiallomas ? (mostszol.textContent || forditasok[nyelv].nothingPlaying) : forditasok[nyelv].nothingPlaying;
    const ikonurl = jelenlegiallomas ? allomasikonlekero(jelenlegiallomas) : "";
    const aktivurl = jelenlegifolyamurl || (jelenlegiallomas && jelenlegiallomas.url_resolved) || "";

    allomasneve.textContent = cimke;
    lejatszosavallomas.textContent = cimke;
    lejatsolapallomas.textContent = cimke;
    lejatsosavmeta.textContent = metaadat;
    lejatsolapmeta.textContent = metaadat;
    lejatsolapprotokoll.textContent = "";
    lejatsolapfolyam.textContent = aktivurl || "-";
    lejatsosavminoseg.textContent = allomasminoseglekero(jelenlegiallomas);
    lejatsolapminoseg.textContent = allomasminoseglekero(jelenlegiallomas);

    [allomasikon, lejatsosavikon, lejatsolapikon].forEach(elem => {
        elem.innerHTML = "";
        elem.classList.remove("has-image");
        if(ikonurl){
            const kep = document.createElement("img");
            kep.src = ikonurl;
            kep.alt = "";
            kep.loading = "lazy";
            kep.onerror = ()=>{
                kep.remove();
                ikonbeallitas(elem, "music");
            };
            elem.appendChild(kep);
            elem.classList.add("has-image");
        } else {
            ikonbeallitas(elem, "music");
        }
    });
}

function lejatszasgombfrissitese(){
    const lejatszasgombok = [lejatszasgomb, laplejatszasgomb].filter(Boolean);
    if(lejatszasgombok.length === 0){
        return;
    }

    const szunetmutatasa = !!jelenlegiallomas && !hang.paused && !felhasznaloszuneteltetett;
    lejatszasgombok.forEach(gomb => {
        const ikon = gomb.querySelector(".player-icon");
        if(ikon){
            ikonbeallitas(ikon, szunetmutatasa ? "pause" : "play");
        }
        gomb.setAttribute("aria-label", forditasok[nyelv][szunetmutatasa ? "pause" : "play"]);
    });
}

function rogziteszarolasuzenet(){
    window.alert(forditasok[nyelv].stopRecordingFirst);
}

function rogzitofeluletfrissites(){
    const zaroltgombok = [
        lejatszasgomb,
        leallitasgomb,
        visszatekeresgomb,
        eloretekeresgomb,
        laplejatszasgomb,
        lapleallitasgomb,
        lapvisszatekeresgomb,
        lapeloretekeresgomb
    ];

    zaroltgombok.forEach(gomb=>{
        gomb.classList.toggle("recording-locked", rogzitesfolyamatban);
    });

    rogzitogomb.classList.toggle("recording", rogzitesfolyamatban);
    const cimke = forditasok[nyelv][rogzitesfolyamatban ? "stopRecording" : "startRecording"];
    rogzitogomb.setAttribute("aria-label", cimke);
    rogzitogomb.title = cimke;
}

function rogzitesletoltese(){
    if(mp3darabok.length === 0){
        return;
    }

    const rogzites = new Blob(mp3darabok, { type: "audio/mpeg" });
    const letoltesiurl = URL.createObjectURL(rogzites);
    const hivatkozas = document.createElement("a");
    const allomasneve = (jelenlegiallomas && jelenlegiallomas.name) || "nova-radio";
    const fajlnev = allomasneve.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "nova-radio";

    hivatkozas.href = letoltesiurl;
    hivatkozas.download = `${fajlnev}-${Date.now()}.mp3`;
    hivatkozas.click();
    URL.revokeObjectURL(letoltesiurl);
    mp3darabok = [];
    allapotbeallitasa(forditasok[nyelv].recordingSaved, "ready");
}

async function rogzitesihangkornyezetlekero(){
    const hangkornyezetosztaly = window.AudioContext || window.webkitAudioContext;
    if(!hangkornyezetosztaly){
        return null;
    }

    if(!hangkornyezet){
        hangkornyezet = new hangkornyezetosztaly();
        rogzitesforras = hangkornyezet.createMediaElementSource(hang);
        rogzitesforras.connect(hangkornyezet.destination);
    }

    if(hangkornyezet.state === "suspended"){
        await hangkornyezet.resume();
    }

    return hangkornyezet;
}

async function rogzitesinditasa(){
    if(!jelenlegiallomas || hang.paused){
        window.alert(forditasok[nyelv].startRadioFirst);
        return;
    }

    if(!window.lamejs){
        window.alert(forditasok[nyelv].recordingUnavailable);
        return;
    }

    try {
        const kornyezet = await rogzitesihangkornyezetlekero();
        if(!kornyezet){
            throw new Error("Audio recording is unavailable");
        }
        mp3kodolo = new lamejs.Mp3Encoder(1, kornyezet.sampleRate, 128);
        mp3darabok = [];
        rogzitofeldolgozo = kornyezet.createScriptProcessor(4096, 1, 1);
        rogzitofeldolgozo.onaudioprocess = esemeny=>{
            if(!rogzitesfolyamatban || !mp3kodolo){
                return;
            }
            const mintak = esemeny.inputBuffer.getChannelData(0);
            const pcm = new Int16Array(mintak.length);
            for(let index = 0; index < mintak.length; index++){
                const minta = Math.max(-1, Math.min(1, mintak[index]));
                pcm[index] = minta < 0 ? minta * 0x8000 : minta * 0x7fff;
            }
            const kodolt = mp3kodolo.encodeBuffer(pcm);
            if(kodolt.length > 0){
                mp3darabok.push(new Int8Array(kodolt));
            }
        };
        rogzitesforras.connect(rogzitofeldolgozo);
        rogzitofeldolgozo.connect(kornyezet.destination);
        rogzitesfolyamatban = true;
        rogzitofeluletfrissites();
        allapotbeallitasa(forditasok[nyelv].recordingStarted, "playing");
    } catch(hiba) {
        mp3kodolo = null;
        rogzitofeldolgozo = null;
        window.alert(forditasok[nyelv].recordingUnavailable);
    }
}

function rogzitesleallitasa(){
    if(rogzitofeldolgozo){
        rogzitofeldolgozo.disconnect();
        rogzitofeldolgozo.onaudioprocess = null;
        rogzitofeldolgozo = null;
    }
    if(mp3kodolo){
        const vegsodarab = mp3kodolo.flush();
        if(vegsodarab.length > 0){
            mp3darabok.push(new Int8Array(vegsodarab));
        }
        mp3kodolo = null;
    }
    rogzitesfolyamatban = false;
    rogzitofeluletfrissites();
    rogzitesletoltese();
}

function rogzitesvaltasa(){
    if(rogzitesfolyamatban){
        rogzitesleallitasa();
        return;
    }
    rogzitesinditasa();
}

function oldalforditasa(){

    document.querySelectorAll("[data-i18n]")
    .forEach(elem=>{

        const kulcs =
        elem.dataset.i18n;

        if(
            forditasok[nyelv] &&
            forditasok[nyelv][kulcs]
        ){

            elem.textContent =
            forditasok[nyelv][kulcs];

        }

    });

    document.querySelectorAll("[data-i18n-aria-label]")
    .forEach(elem=>{
        const kulcs = elem.dataset.i18nAriaLabel;
        elem.setAttribute("aria-label", forditasok[nyelv][kulcs]);
    });

    document.querySelectorAll("[data-i18n-title]")
    .forEach(elem=>{
        const kulcs = elem.dataset.i18nTitle;
        elem.title = forditasok[nyelv][kulcs];
    });

    document.querySelectorAll("[data-i18n-placeholder]")
    .forEach(elem=>{
        const kulcs = elem.dataset.i18nPlaceholder;
        elem.placeholder = forditasok[nyelv][kulcs];
    });

    rogzitofeluletfrissites();

}

function alkalmazasurllekero(){
    const urlcim = new URL(window.location.href);
    urlcim.search = "";
    urlcim.hash = "";
    return urlcim;
}

function allomasurllekero(allomas){
    const urlcim = alkalmazasurllekero();
    if(allomas && allomas.stationuuid){
        urlcim.searchParams.set("station", allomas.stationuuid);
    }
    return urlcim.toString();
}

function allomasurlfrissitese(allomas){
    history.replaceState({}, "", allomasurllekero(allomas));
}

async function megosztasiurl(urlcim, cim, szoveg){
    const megosztasiadatok = { cim, szoveg, urlcim };

    if(navigator.share){
        try {
            await navigator.share(megosztasiadatok);
            return;
        } catch(hiba) {
            if(hiba.name === "AbortError"){
                return;
            }
        }
    }

    try {
        await navigator.clipboard.writeText(urlcim);
        megosztasieritesablak.classList.remove("hidden");
    } catch(hiba) {
        window.prompt(forditasok[nyelv].copyLink, urlcim);
    }
}

function parbeszedablakbezarasa(parbeszedablak){
    parbeszedablak.classList.add("hidden");
}

function hibajelentesmegnyitasa(){
    hibajelentesablak.classList.remove("hidden");
}

async function hibajelentesmasolasa(){
    try {
        await navigator.clipboard.writeText(hibajelentesemail);
    } catch(hiba) {
        window.prompt(forditasok[nyelv].copyAddress, hibajelentesemail);
    }
    parbeszedablakbezarasa(hibajelentesablak);
}

function oldalmegosztasa(){
    megosztasiurl(alkalmazasurllekero().toString(), "Nova Radio", "Nova Radio");
}

function allomasmegosztasa(esemeny){
    esemeny?.stopPropagation();
    if(!jelenlegiallomas){
        return;
    }
    megosztasiurl(
        allomasurllekero(jelenlegiallomas),
        jelenlegiallomas.name || "Nova Radio",
        jelenlegiallomas.name || "Nova Radio"
    );
}

async function allomasbetolteseurlbol(){
    const azonosito = new URLSearchParams(window.location.search).get("station");
    if(!azonosito){
        return;
    }

    try {
        const valasz = await fetch(`${radioapi}/stations/byuuid/${encodeURIComponent(azonosito)}`);
        const eredmeny = await valasz.json();
        if(eredmeny[0]){
            allomaslejatszasa(eredmeny[0]);
        }
    } catch(hiba) {
        console.log(hiba);
    }
}



function nyelvbeallitasa(ujnyelv){

    nyelv = ujnyelv;

    localStorage.setItem(
        "language",
        nyelv
    );

    oldalforditasa();

    allomasokmegjelenitese();
    legutobbiakmegjelenitese();

    kedvencekmegjelenitese();

    mostszol.textContent = jelenlegiallomas && jelenlegifolyamurl
        ? forditasok[nyelv].streaming
        : forditasok[nyelv].nothingPlaying;
    lejatszofeluletrissites();
    lejatszasgombfrissitese();
    const allapotkulcs = {
        ready: "ready",
        playing: "playing",
        buffering: "buffering",
        paused: "paused",
        error: "connectionLost"
    }[jelenlegiallapot] || "ready";
    allapotbeallitasa(forditasok[nyelv][allapotkulcs], jelenlegiallapot);

}



function kedvenceklekero(){

    return JSON.parse(
        localStorage.getItem("radioFavorites") || "[]"
    );

}



function kedvencekmentese(lista){

    localStorage.setItem(
        "radioFavorites",
        JSON.stringify(lista)
    );

}



function kedvenc(azonosito){

    return kedvenceklekero()
    .some(
        allomas =>
        allomas.stationuuid === azonosito
    );

}



function kedvencvaltasa(allomas){

    let kedvencek =
    kedvenceklekero();


    if(kedvenc(allomas.stationuuid)){

        const megerositve =
        confirm(
            forditasok[nyelv].confirmRemoveFavorite
        );


        if(!megerositve){

            return;

        }


    kedvencek =
    kedvencek.filter(
        elem =>
        elem.stationuuid !== allomas.stationuuid
    );

}

    else {

        kedvencek.push(allomas);

    }


    kedvencekmentese(kedvencek);

    allomasokmegjelenitese();

    kedvencekmegjelenitese();

}



function legutobbiaklekero(){

    return JSON.parse(
        localStorage.getItem("radioRecent") || "[]"
    );

}



function legutobbiakmentese(lista){

    localStorage.setItem(
        "radioRecent",
        JSON.stringify(lista)
    );

}



function legutobbiakhozzaadas(allomas){

    let legutobbiak =
    legutobbiaklekero()
    .filter(
        elem =>
        elem.stationuuid !== allomas.stationuuid
    );


    legutobbiak.unshift(allomas);


    if(legutobbiak.length > 10){

        legutobbiak = legutobbiak.slice(0,10);

    }


    legutobbiakmentese(legutobbiak);

    legutobbiakmegjelenitese();

}



function legutobbiakmegjelenitese(){

    legutobbilista.innerHTML="";

    const legutobbiak = legutobbiaklekero();


    if(legutobbiak.length === 0){

        legutobbilista.innerHTML =
        `<p>${forditasok[nyelv].noRecent}</p>`;

        return;

    }


    legutobbiak.forEach(
        allomas=>{

            legutobbilista.appendChild(
                kartyaletrehozasa(allomas)
            );

        }
    );

}



function legutobbitorles(){

    const megerositve =
    confirm(
        forditasok[nyelv].confirmClearHistory
    );


    if(!megerositve){

        return;

    }


    legutobbiakmentese([]);

    legutobbiakmegjelenitese();

}



async function orszagokbetoltese(){

    const valasz =
    await fetch(
        radioapi + "/countries"
    );


    const orszagok =
    await valasz.json();


    orszagok
    .filter(
        orszag =>
        orszag.stationcount > 0
    )
    .sort(
        (alfa,beta)=>
        alfa.name.localeCompare(beta.name)
    )
    .forEach(
        orszag=>{

            const opcio =
            document.createElement("option");

            opcio.value =
            orszag.name;

            opcio.textContent =
            orszag.name;

            orszagszuro.appendChild(opcio);

        }
    );

}



async function mufajokbetoltese(){

    const valasz =
    await fetch(
        radioapi + "/tags"
    );


    const mufajok =
    await valasz.json();


    mufajok
    .sort(
        (alfa,beta)=>
        beta.stationcount-alfa.stationcount
    )
    .slice(0,400)
    .forEach(
        cimke=>{

            const opcio =
            document.createElement("option");

            opcio.value =
            cimke.name;

            opcio.textContent =
            cimke.name;

            mufajszuro.appendChild(opcio);

        }
    );

}



async function allomasokbetoltese(visszaallitas=true){

    if(visszaallitas){

        oldal=0;

        allomasok=[];

        radiolista.innerHTML="";

    }


    betoltes.classList.remove("hidden");


    let urlcim =
    radioapi +
    "/stations/search?hidebroken=true"
    +
    "&limit=" + oldalmeret
    +
    "&offset=" + (oldal*oldalmeret);



    if(keresobemenet.value.trim()){

        urlcim +=
        "&name=" +
        encodeURIComponent(
            keresobemenet.value
        );

    }


    if(orszagszuro.value){

        urlcim +=
        "&country=" +
        encodeURIComponent(
            orszagszuro.value
        );

    }


    if(mufajszuro.value){

        urlcim +=
        "&tag=" +
        encodeURIComponent(
            mufajszuro.value
        );

    }


    const valasz =
    await fetch(urlcim);


    const eredmeny =
    await valasz.json();


    const ervenyeseredmeny =
    eredmeny.filter(
        allomas =>
        allomas.url_resolved
    );


    allomasok =
    allomasok.concat(ervenyeseredmeny);


    allomasokmegjelenitese();


    oldal++;


    betoltes.classList.add("hidden");

}



function kartyaletrehozasa(allomas,tomor=false){
    const sor = document.createElement("div");
    sor.className = tomor ? "radio-row compact" : "radio-row";

    const ikon = document.createElement("div");
    ikon.className = "radio-row-icon";

    const ikonurl = allomasikonlekero(allomas);
    if(ikonurl){
        const kep = document.createElement("img");
        kep.src = ikonurl;
        kep.alt = "";
        kep.loading = "lazy";
        kep.onerror = ()=>{
            kep.remove();
            ikonbeallitas(ikon, "music");
        };
        ikon.appendChild(kep);
    } else {
        ikonbeallitas(ikon, "music");
    }

    const tartalom = document.createElement("div");
    tartalom.className = "radio-row-content";

    const cim = document.createElement("div");
    cim.className = "radio-row-title";
    szovegcimmelbeallitas(cim, allomas.name || forditasok[nyelv].unknownStation);

    const alcim = document.createElement("div");
    alcim.className = "radio-row-sub";
    const mufajszoveg = allomas.tags || allomas.country || forditasok[nyelv].noGenre;
    szovegcimmelbeallitas(alcim, mufajszoveg);

    tartalom.appendChild(cim);
    if(!tomor){
        tartalom.appendChild(alcim);
    }

    const protokoll = document.createElement("span");
    protokoll.className = "protocol-pill";
    protokoll.textContent = (allomas.url_resolved || allomas.url || "").startsWith("https://") ? "HTTPS" : "HTTP";

    const kedvencgomb = document.createElement("button");
    kedvencgomb.className = `favorite-button ${kedvenc(allomas.stationuuid) ? "active" : ""}`;
    kedvencgomb.type = "button";
    kedvencgomb.appendChild(ikonletrehozas("star"));
    kedvencgomb.title = forditasok[nyelv][kedvenc(allomas.stationuuid) ? "removeFromFavorites" : "addToFavorites"];

    sor.appendChild(ikon);
    sor.appendChild(tartalom);
    if(!tomor){
        sor.appendChild(protokoll);
    }
    sor.appendChild(kedvencgomb);

    sor.onclick = esemeny=>{
        if(
            esemeny.target.closest &&
            esemeny.target.closest(".favorite-button")
        ){
            kedvencvaltasa(allomas);
            return;
        }
        if(rogzitesfolyamatban){
            rogziteszarolasuzenet();
            return;
        }
        allomaslejatszasa(allomas);
        oldalsav.classList.remove("open");
        reteg.classList.remove("show");
    };

    return sor;
}

function allomasokmegjelenitese(){

    radiolista.innerHTML="";


    allomasok.forEach(
        allomas=>{

            radiolista.appendChild(
                kartyaletrehozasa(allomas)
            );

        }
    );

}


function kedvencekmegjelenitese(){
    kedvenclista.innerHTML = "";
    const kedvencek = kedvenceklekero();

    if(kedvencek.length === 0){
        kedvenclista.innerHTML = `<p>${forditasok[nyelv].noFavorites}</p>`;
        return;
    }

    kedvencek.forEach(allomas=>{
        kedvenclista.appendChild(kartyaletrehozasa(allomas, true));
    });
}

function allapotbeallitasa(szoveg,tipus){
    jelenlegiallapot = tipus;
    lejatszoallapot.textContent = szoveg;
    lejatsolapallapot.textContent = szoveg;
    lejatszoallapot.className = "status " + tipus;
    lejatsolapallapot.className = "status " + tipus;
    lejatszofeluletrissites();
}



function ujraprobalasifolyamurllekero(){

    if(!jelenlegiallomas){
        return null;
    }

    return lejatszasiurllekero(jelenlegiallomas.url_resolved || jelenlegiallomas.url);

}

function allomaslejatszasa(allomas){
    if(rogzitesfolyamatban){
        rogziteszarolasuzenet();
        return;
    }

    kezialleallitas = false;
    felhasznaloszuneteltetett = false;

    if(ujraprobalasiidozito){
        clearTimeout(ujraprobalasiidozito);
        ujraprobalasiidozito = null;
    }

    jelenlegiallomas = allomas;
    localStorage.setItem("lastStation", JSON.stringify(allomas));
    ujraprobalasiindex = 0;

    let eredetiurl = allomas.url_resolved || allomas.url;

    if(!eredetiurl){
        allapotbeallitasa(forditasok[nyelv].connectionLost, "error");
        return;
    }

    jelenlegifolyamurl = lejatszasiurllekero(eredetiurl);

    allomasurlfrissitese(allomas);

    hang.src = jelenlegifolyamurl;

    hang.play().catch(()=>{
        allapotbeallitasa(forditasok[nyelv].paused, "paused");
    });

    allomasneve.textContent = allomas.name;
    mostszol.textContent = forditasok[nyelv].streaming;
    lejatszofeluletrissites();
    allapotbeallitasa(forditasok[nyelv].playing, "playing");

    legutobbiakhozzaadas(allomas);
    lejatszasgombfrissitese();
}

function kapcsolatujraprobalasa(){

    if(kezialleallitas){
        return;
    }


  if(ujraprobalasiidozito){
        return;
    }

    if(!jelenlegiallomas){
        return;
    }

    if(ujraprobalasiindex >= ujraprobalasiidok.length){

        ujraprobalasiidozito = null;

        allapotbeallitasa(
            forditasok[nyelv].connectionLost,
            "error"
        );

        return;

    }


    const ido =
    ujraprobalasiidok[ujraprobalasiindex];


    allapotbeallitasa(
        forditasok[nyelv].retrying +
        " " +
        (ido/1000) +
        " " +
        forditasok[nyelv].secondsSuffix,
        "buffering"
    );


    ujraprobalasiidozito =
    setTimeout(()=>{

        jelenlegifolyamurl =
        ujraprobalasifolyamurllekero();

        hang.src = jelenlegifolyamurl;

        hang.play()
        .then(()=>{

            ujraprobalasiindex = 0;
            clearTimeout(ujraprobalasiidozito);
            ujraprobalasiidozito = null;

        })
        .catch(()=>{

            ujraprobalasiindex++;
            ujraprobalasiidozito = null;
            kapcsolatujraprobalasa();

        });

    },ido);

}



hang.addEventListener(
"waiting",
()=>{

    allapotbeallitasa(
        forditasok[nyelv].buffering,
        "buffering"
    );

});


hang.addEventListener("playing", ()=>{
    ujraprobalasiindex = 0;

    if(ujraprobalasiidozito){
        clearTimeout(ujraprobalasiidozito);
        ujraprobalasiidozito = null;
    }

    felhasznaloszuneteltetett = false;
    allapotbeallitasa(forditasok[nyelv].playing, "playing");
    lejatszasgombfrissitese();
});


hang.addEventListener("pause", ()=>{
    if(felhasznaloszuneteltetett){
        allapotbeallitasa(forditasok[nyelv].paused, "paused");
    }
    lejatszasgombfrissitese();
});


hang.addEventListener(
"stalled",
()=>{

    if(!kezialleallitas){

        kapcsolatujraprobalasa();

    }

});


hang.addEventListener(
"error",
()=>{

    if(!kezialleallitas){

        kapcsolatujraprobalasa();

    }

});



window.addEventListener(
"offline",
()=>{

    if(!kezialleallitas){

        kapcsolatujraprobalasa();

    }

});


window.addEventListener(
"online",
()=>{

    if(jelenlegiallomas){

        ujraprobalasiindex=0;

        kapcsolatujraprobalasa();

    }

});


function lejatszaskapcsolokezeles(esemeny){
    esemeny?.stopPropagation();

    if(rogzitesfolyamatban){
        rogziteszarolasuzenet();
        return;
    }

    if(jelenlegiallomas && !hang.paused && !felhasznaloszuneteltetett){
        felhasznaloszuneteltetett = true;
        hang.pause();
        lejatszasgombfrissitese();
        return;
    }

    kezialleallitas = false;
    felhasznaloszuneteltetett = false;
    ujraprobalasiindex = 0;

    if(!jelenlegiallomas){
        const mentett = localStorage.getItem("lastStation");
        if(mentett){
            jelenlegiallomas = JSON.parse(mentett);
            allomasneve.textContent = jelenlegiallomas.name;
        } else {
            return;
        }
    }

    if(!jelenlegifolyamurl){
        jelenlegifolyamurl = ujraprobalasifolyamurllekero();
        hang.src = jelenlegifolyamurl;
    }

    hang.play().catch(hiba=>{
        console.log(hiba);
    });

    lejatszasgombfrissitese();
}

function leallitaskezeles(esemeny){
    esemeny?.stopPropagation();

    if(rogzitesfolyamatban){
        rogziteszarolasuzenet();
        return;
    }

    kezialleallitas = true;

    felhasznaloszuneteltetett = true;

    if(ujraprobalasiidozito){

        clearTimeout(ujraprobalasiidozito);
        ujraprobalasiidozito = null;

    }

    hang.pause();

    hang.removeAttribute("src");

    hang.load();


    jelenlegifolyamurl = null;

    allomasurlfrissitese(null);


    allapotbeallitasa(
        forditasok[nyelv].stopped,
        "ready"
    );


    mostszol.textContent =
    forditasok[nyelv].nothingPlaying || "Nothing playing";
    lejatszofeluletrissites();
    lejatszasgombfrissitese();
}

function visszatekereskezeles(esemeny){
    esemeny?.stopPropagation();

    if(rogzitesfolyamatban){
        rogziteszarolasuzenet();
        return;
    }

    if(hang.currentTime > 10){
        hang.currentTime -= 10;
    } else {
        hang.currentTime = 0;
    }
}

function eloretekereskezeles(esemeny){
    esemeny?.stopPropagation();

    if(rogzitesfolyamatban){
        rogziteszarolasuzenet();
        return;
    }

    hang.currentTime += 10;
}

lejatszasgomb.onclick = lejatszaskapcsolokezeles;
laplejatszasgomb.onclick = lejatszaskapcsolokezeles;
leallitasgomb.onclick = leallitaskezeles;
lapleallitasgomb.onclick = leallitaskezeles;
visszatekeresgomb.onclick = visszatekereskezeles;
lapvisszatekeresgomb.onclick = visszatekereskezeles;
eloretekeresgomb.onclick = eloretekereskezeles;
lapeloretekeresgomb.onclick = eloretekereskezeles;
oldalmegosztogomb.onclick = oldalmegosztasa;
allomasmegosztogomb.onclick = allomasmegosztasa;
rogzitogomb.onclick = rogzitesvaltasa;
hibajelentesgomb.onclick = hibajelentesmegnyitasa;
hibajelentesmegsemegomb.onclick = ()=>parbeszedablakbezarasa(hibajelentesablak);
hibajelentesmasologomb.onclick = hibajelentesmasolasa;
megosztasieritesbezarogomb.onclick = ()=>parbeszedablakbezarasa(megosztasieritesablak);
hibajelentesablak.onclick = esemeny=>{
    if(esemeny.target === hibajelentesablak){
        parbeszedablakbezarasa(hibajelentesablak);
    }
};
megosztasieritesablak.onclick = esemeny=>{
    if(esemeny.target === megosztasieritesablak){
        parbeszedablakbezarasa(megosztasieritesablak);
    }
};



hangerocsuszka.oninput =
()=>{

    hang.volume =
    hangerocsuszka.value;

    localStorage.setItem(
        "volume",
        hangerocsuszka.value
    );

};



keresogomb.onclick =
()=>{


    allomasokbetoltese(true);

};



keresobemenet.onkeydown =
esemeny=>{

    if(esemeny.key==="Enter"){

        allomasokbetoltese(true);

    }

};



orszagszuro.onchange =
()=>{

    allomasokbetoltese(true);

};



mufajszuro.onchange =
()=>{

    allomasokbetoltese(true);

};



tovabbiakgomb.onclick =
()=>{

    allomasokbetoltese(false);

};



elalvasidozitovalaszto.onchange =
()=>{

    if(elalvasidozito){

        clearTimeout(elalvasidozito);
        elalvasidozito = null;

    }


    const percek =
    Number(elalvasidozitovalaszto.value);


    if(percek === 0){

        allapotbeallitasa(
            forditasok[nyelv].sleepTimerCancelled,
            jelenlegiallapot
        );

        return;

    }


    elalvasidozito =
    setTimeout(()=>{
    
        leallitaskezeles();
    
        lejatszoallapot.textContent =
            forditasok[nyelv].sleepTimerFinished;
    
        lejatsolapallapot.textContent =
            forditasok[nyelv].sleepTimerFinished;
    
        elalvasidozito = null;
    
        elalvasidozitovalaszto.value = "0";
    
    }, percek * 60 * 1000);


    allapotbeallitasa(
        forditasok[nyelv].sleepTimerSet +
        " " +
        percek +
        " " +
        forditasok[nyelv].minutesSuffix,
        jelenlegiallapot
    );

};



document.addEventListener("keydown", esemeny=>{
    if(esemeny.code !== "Space" || esemeny.target === keresobemenet){
        return;
    }

    esemeny.preventDefault();
    lejatszasgomb.onclick();
});



if("mediaSession" in navigator){

    try {

        navigator.mediaSession.setActionHandler(
            "play",
            ()=>{
                lejatszaskapcsolokezeles();
            }
        );

        navigator.mediaSession.setActionHandler(
            "pause",
            ()=>{
                lejatszaskapcsolokezeles();
            }
        );

    }
    catch(e){
        console.log("MediaSession actions not supported:", e);
    }

}



kedvenckapcsolo.onclick =
()=>{

    kedvenclenyilo.classList.toggle(
        "hidden"
    );

    kedvencekmegjelenitese();

};



legutobbikapcsolo.onclick =
()=>{

    legutobbilenyilo.classList.toggle(
        "hidden"
    );

    legutobbiakmegjelenitese();

};



legutobbitorlesgomb.onclick =
()=>{

    legutobbitorles();

};



menugomb.onclick =
()=>{

    oldalsav.classList.add("open");

    reteg.classList.add("show");

};



menubezarogomb.onclick =
()=>{

    oldalsav.classList.remove("open");

    reteg.classList.remove("show");

};



reteg.onclick = ()=>{
    oldalsav.classList.remove("open");
    reteg.classList.remove("show");
    lejatsolapnyitasbeallitas(false);
};

lejatsosav.addEventListener("click", esemeny=>{
    if(esemeny.target.matches(".player-icon-button") || esemeny.target.closest && esemeny.target.closest(".player-icon-button")){
        return;
    }

    lejatsolapnyitasbeallitas(!lejatsolap.classList.contains("open"));
});

lejatsolapbezaro.onclick = ()=>{
    lejatsolapnyitasbeallitas(false);
};

document.addEventListener("click", esemeny=>{
    if(!lejatsolap.classList.contains("open")){
        return;
    }

    if(
        (esemeny.target.closest && esemeny.target.closest(".player-sheet")) ||
        (esemeny.target.closest && esemeny.target.closest(".player-bar"))
    ){
        return;
    }

    lejatsolapnyitasbeallitas(false);
});

document.addEventListener("keydown", esemeny=>{
    if(esemeny.key === "Escape"){
        lejatsolapnyitasbeallitas(false);
    }
});

lejatsosav.addEventListener("keydown", esemeny=>{
    if(esemeny.key === "Enter" || esemeny.key === " "){
        esemeny.preventDefault();
        lejatsolap.classList.add("open");
    }
});



nyelvvalaszto.onchange = ()=>{
    nyelvbeallitasa(nyelvvalaszto.value);
};



hangerocsuszka.value =
hang.volume;

nyelvvalaszto.value = nyelv;


oldalforditasa();
lejatszofeluletrissites();
lejatszasgombfrissitese();
allapotbeallitasa(forditasok[nyelv].ready, "ready");

orszagokbetoltese();
mufajokbetoltese();
allomasokbetoltese();
allomasbetolteseurlbol();
kedvencekmegjelenitese();
legutobbiakmegjelenitese();

const mentettallomas =
localStorage.getItem("lastStation");


if(mentettallomas){

    jelenlegiallomas =
    JSON.parse(mentettallomas);

    allomasneve.textContent =
    jelenlegiallomas.name;

    lejatszofeluletrissites();

}

if("serviceWorker" in navigator){

    navigator.serviceWorker.register("./sw.js?v=16")
    .then(()=>{

        console.log("Service Worker registered");

    })
    .catch(hiba=>{

        console.log(
            "Service Worker error:",
            hiba
        );

    });

}
