const api = "https://de1.api.radio-browser.info/json";

const audio = document.getElementById("audioPlayer");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const countryFilter = document.getElementById("countryFilter");
const genreFilter = document.getElementById("genreFilter");

const radioList = document.getElementById("radioList");
const favoritesList = document.getElementById("favoritesList");

const loading = document.getElementById("loading");

const stationName = document.getElementById("stationName");
const nowPlaying = document.getElementById("nowPlaying");
const playerStatus = document.getElementById("playerStatus");

const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");

const volumeSlider = document.getElementById("volumeSlider");

const favoritesToggle = document.getElementById("favoritesToggle");

const favoritesDropdown = document.getElementById("favoritesDropdown");

const loadMoreButton = document.getElementById("loadMoreButton");

const menuButton = document.getElementById("menuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const englishButton = document.getElementById("englishButton");
const hungarianButton = document.getElementById("hungarianButton");

const trackInfo = document.getElementById("trackInfo");

const recentList = document.getElementById("recentList");

const recentToggle = document.getElementById("recentToggle");

const recentDropdown = document.getElementById("recentDropdown");

const clearRecentButton = document.getElementById("clearRecentButton");

const sleepTimerSelect = document.getElementById("sleepTimerSelect");


let stations = [];

let currentStation = null;

let userPaused = false;

let currentStatus = "ready";

let page = 0;

const pageSize = 100;

let nowPlayingTimer = null;

let sleepTimer = null;


let retryTimes = [3000,5000,10000,15000,20000,30000];

let retryIndex = 0;

let retryTimer = null;

let language =
localStorage.getItem("language") || "en";


audio.volume =
Number(localStorage.getItem("volume")) || 0.7;



function translatePage(){

    document.querySelectorAll("[data-i18n]")
    .forEach(element=>{

        const key =
        element.dataset.i18n;

        if(
            translations[language] &&
            translations[language][key]
        ){

            element.textContent =
            translations[language][key];

        }

    });

}



function setLanguage(lang){

    language = lang;

    localStorage.setItem(
        "language",
        lang
    );

    translatePage();

    displayRecent();

    displayFavorites();

    if(currentStation){

        updateNowPlayingTrack();

    }

}



function getFavorites(){

    return JSON.parse(
        localStorage.getItem("radioFavorites") || "[]"
    );

}



function saveFavorites(list){

    localStorage.setItem(
        "radioFavorites",
        JSON.stringify(list)
    );

}



function isFavorite(uuid){

    return getFavorites()
    .some(
        station =>
        station.stationuuid === uuid
    );

}



function toggleFavorite(station){

    let favorites =
    getFavorites();


    if(isFavorite(station.stationuuid)){

        const confirmed =
        confirm(
            language === "hu"
            ?
            "Biztosan törlöd a kedvencek közül?"
            :
            "Are you sure you want to remove this station from favorites?"
        );


        if(!confirmed){

            return;

        }


    favorites =
    favorites.filter(
        item =>
        item.stationuuid !== station.stationuuid
    );

}

    else {

        favorites.push(station);

    }


    saveFavorites(favorites);

    displayStations();

    displayFavorites();

}



function getRecent(){

    return JSON.parse(
        localStorage.getItem("radioRecent") || "[]"
    );

}



function saveRecent(list){

    localStorage.setItem(
        "radioRecent",
        JSON.stringify(list)
    );

}



function addRecent(station){

    let recent =
    getRecent()
    .filter(
        item =>
        item.stationuuid !== station.stationuuid
    );


    recent.unshift(station);


    if(recent.length > 10){

        recent = recent.slice(0,10);

    }


    saveRecent(recent);

    displayRecent();

}



function displayRecent(){

    recentList.innerHTML="";

    const recent = getRecent();


    if(recent.length === 0){

        recentList.innerHTML =
        `<p>${translations[language].noRecent}</p>`;

        return;

    }


    recent.forEach(
        station=>{

            recentList.appendChild(
                createCard(station)
            );

        }
    );

}



function clearRecent(){

    const confirmed =
    confirm(
        translations[language].confirmClearHistory
    );


    if(!confirmed){

        return;

    }


    saveRecent([]);

    displayRecent();

}



async function loadCountries(){

    const response =
    await fetch(
        api + "/countries"
    );


    const countries =
    await response.json();


    countries
    .filter(
        country =>
        country.stationcount > 0
    )
    .sort(
        (a,b)=>
        a.name.localeCompare(b.name)
    )
    .forEach(
        country=>{

            const option =
            document.createElement("option");

            option.value =
            country.name;

            option.textContent =
            country.name;

            countryFilter.appendChild(option);

        }
    );

}



async function loadGenres(){

    const response =
    await fetch(
        api + "/tags"
    );


    const genres =
    await response.json();


    genres
    .filter(
        tag =>
        tag.stationcount > 100
    )
    .sort(
        (a,b)=>
        b.stationcount-a.stationcount
    )
    .slice(0,150)
    .forEach(
        tag=>{

            const option =
            document.createElement("option");

            option.value =
            tag.name;

            option.textContent =
            tag.name;

            genreFilter.appendChild(option);

        }
    );

}



async function loadStations(reset=true){

    if(reset){

        page=0;

        stations=[];

        radioList.innerHTML="";

    }


    loading.classList.remove("hidden");


    let url =
    api +
    "/stations/search?hidebroken=true"
    +
    "&limit=" + pageSize
    +
    "&offset=" + (page*pageSize);



    if(searchInput.value.trim()){

        url +=
        "&name=" +
        encodeURIComponent(
            searchInput.value
        );

    }


    if(countryFilter.value){

        url +=
        "&country=" +
        encodeURIComponent(
            countryFilter.value
        );

    }


    if(genreFilter.value){

        url +=
        "&tag=" +
        encodeURIComponent(
            genreFilter.value
        );

    }


    const response =
    await fetch(url);


    const result =
    await response.json();


    stations =
    stations.concat(result);


    displayStations();


    page++;


    loading.classList.add("hidden");

}



function createCard(station){

    const card =
    document.createElement("div");


    card.className =
    "radio-card";


    card.innerHTML = `

    <button class="favorite-button ${isFavorite(station.stationuuid) ? "active":""}">
    ⭐
    </button>

    <h3>${station.name}</h3>

    <p>${station.country || "Unknown country"}</p>

    <p>${station.tags || "No genre"}</p>

    `;



    card.onclick =
    event=>{

        if(
            event.target.classList.contains(
                "favorite-button"
            )
        ){

            toggleFavorite(station);

            return;

        }


        playStation(station);

        sidebar.classList.remove("open");

        overlay.classList.remove("show");

    };


    return card;

}

function displayStations(){

    radioList.innerHTML="";


    stations.forEach(
        station=>{

            radioList.appendChild(
                createCard(station)
            );

        }
    );

}


function displayFavorites(){

    favoritesList.innerHTML="";

    const favorites = getFavorites();


    if(favorites.length === 0){

        favoritesList.innerHTML =
        "<p>No favorites</p>";

        return;

    }


    favorites.forEach(
        station=>{

            favoritesList.appendChild(
                createCard(station)
            );

        }
    );

}



async function fetchNowPlayingMetadata(station){

    try{

        const streamUrl =
        new URL(station.url_resolved);


        const statusUrl =
        streamUrl.origin + "/status-json.xsl";


        const response =
        await fetch(statusUrl,{cache:"no-store"});


        if(!response.ok){

            throw new Error("no metadata");

        }


        const data =
        await response.json();


        let sources =
        data.icestats &&
        data.icestats.source;


        if(!sources){

            throw new Error("no metadata");

        }


        if(!Array.isArray(sources)){

            sources = [sources];

        }


        const mountPath =
        streamUrl.pathname;


        let match =
        sources.find(
            source =>
            source.listenurl &&
            source.listenurl.indexOf(mountPath) !== -1
        );


        if(!match){

            match = sources[0];

        }


        const title =
        match &&
        (match.title || match.yp_currently_playing);


        if(!title){

            throw new Error("no metadata");

        }


        return title;

    }

    catch(error){

        return null;

    }

}



function updateMediaSession(station,track){

    if(!("mediaSession" in navigator)){

        return;

    }


    navigator.mediaSession.metadata =
    new MediaMetadata({
        title: track || station.name,
        artist: station.name,
        album: station.country || "",
        artwork: station.favicon ?
        [{src:station.favicon,sizes:"512x512",type:"image/png"}] :
        []
    });

}



async function updateNowPlayingTrack(){

    if(!currentStation){

        return;

    }


    const track =
    await fetchNowPlayingMetadata(currentStation);


    if(track){

        trackInfo.textContent =
        translations[language].trackLabel + ": " + track;

        trackInfo.classList.remove("hidden");

    }

    else {

        trackInfo.classList.add("hidden");

    }


    updateMediaSession(currentStation,track);

}



function startNowPlayingPolling(){

    if(nowPlayingTimer){

        clearInterval(nowPlayingTimer);

    }


    updateNowPlayingTrack();


    nowPlayingTimer =
    setInterval(
        updateNowPlayingTrack,
        20000
    );

}



function stopNowPlayingPolling(){

    if(nowPlayingTimer){

        clearInterval(nowPlayingTimer);
        nowPlayingTimer = null;

    }


    trackInfo.classList.add("hidden");

}



function setStatus(text,type){

    currentStatus = type;

    playerStatus.textContent =
    text;

    playerStatus.className =
    "status " + type;

}



function playStation(station){

    if(retryTimer){

        clearTimeout(retryTimer);
        retryTimer = null;

    }

    currentStation =
    station;


    retryIndex=0;


    audio.src =
    station.url_resolved;


    audio.play().catch(()=>{

        setStatus(
            translations[language].paused,
            "paused"
        );

    });


    stationName.textContent =
    station.name;


    nowPlaying.textContent =
    "Streaming";


    setStatus(
        translations[language].playing,
        "playing"
    );


    addRecent(station);


    startNowPlayingPolling();


    updateMediaSession(station,null);

}



function retryConnection(){

  if(retryTimer){
        return;
    }

    if(!currentStation){
        return;
    }



    if(retryIndex >= retryTimes.length){

        retryTimer = null;

        setStatus(
            translations[language].connectionLost,
            "error"
        );

        return;

    }


    const time =
    retryTimes[retryIndex];


    setStatus(
        translations[language].retrying +
        " " +
        (time/1000) +
        "s",
        "buffering"
    );


    retryTimer =
    setTimeout(()=>{

        audio.src =
        currentStation.url_resolved;

        audio.play()
        .then(()=>{

            retryIndex = 0;
            clearTimeout(retryTimer);
            retryTimer = null;

        })
        .catch(()=>{

            retryIndex++;
            retryTimer = null;
            retryConnection();

        });

    },time);

}



audio.addEventListener(
"waiting",
()=>{

    setStatus(
        translations[language].buffering,
        "buffering"
    );

});


audio.addEventListener(
"playing",
()=>{

    retryIndex = 0;

    if(retryTimer){

        clearTimeout(retryTimer);
        retryTimer = null;

    }

    setStatus(
        translations[language].playing,
        "playing"
    );

});


audio.addEventListener(
"pause",
()=>{

    if(userPaused){

        setStatus(
            translations[language].paused,
            "paused"
        );

    }

});


audio.addEventListener(
"stalled",
retryConnection
);


audio.addEventListener(
"error",
retryConnection
);



window.addEventListener(
"offline",
()=>{

    retryConnection();

});


window.addEventListener(
"online",
()=>{

    if(currentStation){

        retryIndex=0;

        retryConnection();

    }

});



    playButton.onclick =
    ()=>{

        userPaused = false;
        retryIndex = 0;

        if(retryTimer){

            clearTimeout(retryTimer);
            retryTimer = null;

        }

        audio.play().catch(error=>{

            console.log(error);

    });

        if(currentStation){

            startNowPlayingPolling();

        }

};



pauseButton.onclick =
()=>{

    userPaused = true;
    audio.pause();

    stopNowPlayingPolling();

};



volumeSlider.oninput =
()=>{

    audio.volume =
    volumeSlider.value;

    localStorage.setItem(
        "volume",
        volumeSlider.value
    );

};



searchButton.onclick =
()=>{


    loadStations(true);

};



searchInput.onkeydown =
event=>{

    if(event.key==="Enter"){

        loadStations(true);

    }

};



countryFilter.onchange =
()=>{

    loadStations(true);

};



genreFilter.onchange =
()=>{

    loadStations(true);

};



loadMoreButton.onclick =
()=>{

    loadStations(false);

};



sleepTimerSelect.onchange =
()=>{

    if(sleepTimer){

        clearTimeout(sleepTimer);
        sleepTimer = null;

    }


    const minutes =
    Number(sleepTimerSelect.value);


    if(minutes === 0){

        setStatus(
            translations[language].sleepTimerCancelled,
            currentStatus
        );

        return;

    }


    sleepTimer =
    setTimeout(()=>{

        userPaused = true;
        audio.pause();
        stopNowPlayingPolling();

        setStatus(
            translations[language].sleepTimerFinished,
            "paused"
        );

        sleepTimer = null;

        sleepTimerSelect.value = "0";

    },minutes * 60 * 1000);


    setStatus(
        translations[language].sleepTimerSet +
        " " +
        minutes +
        " " +
        translations[language].minutesSuffix,
        currentStatus
    );

};



document.addEventListener(
"keydown",
event=>{

    if(
        event.code !== "Space" ||
        event.target === searchInput
    ){

        return;

    }


    event.preventDefault();


    if(userPaused || audio.paused){

        playButton.onclick();

    }

    else {

        pauseButton.onclick();

    }

});



if("mediaSession" in navigator){

    navigator.mediaSession.setActionHandler(
        "play",
        ()=>{

            playButton.onclick();

        }
    );


    navigator.mediaSession.setActionHandler(
        "pause",
        ()=>{

            pauseButton.onclick();

        }
    );

}



favoritesToggle.onclick =
()=>{

    favoritesDropdown.classList.toggle(
        "hidden"
    );

    displayFavorites();

};



recentToggle.onclick =
()=>{

    recentDropdown.classList.toggle(
        "hidden"
    );

    displayRecent();

};



clearRecentButton.onclick =
()=>{

    clearRecent();

};



menuButton.onclick =
()=>{

    sidebar.classList.add("open");

    overlay.classList.add("show");

};



closeMenuButton.onclick =
()=>{

    sidebar.classList.remove("open");

    overlay.classList.remove("show");

};



overlay.onclick =
()=>{

    sidebar.classList.remove("open");

    overlay.classList.remove("show");

};



englishButton.onclick =
()=>{

    setLanguage("en");

};



hungarianButton.onclick =
()=>{

    setLanguage("hu");

};



volumeSlider.value =
audio.volume;



translatePage();

loadCountries();

loadGenres();

loadStations();

displayFavorites();

displayRecent();

if("serviceWorker" in navigator){

    navigator.serviceWorker.register("sw.js")
    .then(()=>{

        console.log("Service Worker registered");

    })
    .catch(error=>{

        console.log(
            "Service Worker error:",
            error
        );

    });

}
