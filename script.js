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
const playerStatusSheet = document.getElementById("playerStatusSheet");

const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const rewindButton = document.getElementById("rewindButton");
const forwardButton = document.getElementById("forwardButton");
const sheetPlayButton = document.getElementById("sheetPlayButton");
const sheetStopButton = document.getElementById("sheetStopButton");
const sheetRewindButton = document.getElementById("sheetRewindButton");
const sheetForwardButton = document.getElementById("sheetForwardButton");

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
const playerBarStation = document.getElementById("playerBarStation");
const playerBarMeta = document.getElementById("playerBarMeta");
const playerBarIcon = document.getElementById("playerBarIcon");
const stationIcon = document.getElementById("stationIcon");
const playerSheetStation = document.getElementById("playerSheetStation");
const playerSheetMeta = document.getElementById("playerSheetMeta");
const playerSheetProtocol = document.getElementById("playerSheetProtocol");
const playerSheetStream = document.getElementById("playerSheetStream");
const playerSheetTrack = document.getElementById("playerSheetTrack");
const playerSheetIcon = document.getElementById("playerSheetIcon");
const playerBar = document.getElementById("playerBar");
const playerSheet = document.getElementById("playerSheet");
const closePlayerSheet = document.getElementById("closePlayerSheet");

const recentList = document.getElementById("recentList");

const recentToggle = document.getElementById("recentToggle");

const recentDropdown = document.getElementById("recentDropdown");

const clearRecentButton = document.getElementById("clearRecentButton");

const sleepTimerSelect = document.getElementById("sleepTimerSelect");

function setPlayerSheetOpen(open){
    if(open){
        playerSheet.classList.add("open");
        playerSheet.setAttribute("aria-hidden", "false");
    } else {
        playerSheet.classList.remove("open");
        playerSheet.setAttribute("aria-hidden", "true");
    }
}


let stations = [];

let currentStation = null;

let currentStreamUrl = null;

let userPaused = false;

let currentStatus = "ready";

let page = 0;

const pageSize = 100;

let nowPlayingTimer = null;

let sleepTimer = null;

let retryTimes = [3000,5000,10000,15000,20000,30000];

let retryIndex = 0;

let retryTimer = null;

let manualStop = false;

let language =
localStorage.getItem("language") || "en";


audio.volume =
Number(localStorage.getItem("volume")) || 0.7;


function getPlaybackUrl(url){
    if(!url){
        return null;
    }

    return url;
}

function getStationIcon(station){

    if(
        station.favicon &&
        /^https?:\/\//i.test(station.favicon)
    ){

        return station.favicon;

    }

    return "";

}


function setTextWithTitle(element,text){
    const value = text || "";
    element.textContent = value;
    element.title = value;
}

function updatePlayerUi(){
    const label = currentStation ? currentStation.name : "No station selected";
    const meta = currentStation ? (nowPlaying.textContent || translations[language].nothingPlaying) : translations[language].nothingPlaying;
    const iconUrl = currentStation ? getStationIcon(currentStation) : "";
    const activeUrl = currentStreamUrl || (currentStation && currentStation.url_resolved) || "";

    stationName.textContent = label;
    playerBarStation.textContent = label;
    playerSheetStation.textContent = label;
    playerBarMeta.textContent = meta;
    playerSheetMeta.textContent = meta;
    playerSheetProtocol.textContent = "";
    playerSheetStream.textContent = activeUrl || "-";

    [stationIcon, playerBarIcon, playerSheetIcon].forEach(element => {
        element.innerHTML = "";
        element.classList.remove("has-image");
        if(iconUrl){
            const img = document.createElement("img");
            img.src = iconUrl;
            img.alt = "";
            img.loading = "lazy";
            img.onerror = ()=>{
                img.remove();
                element.textContent = "♫";
            };
            element.appendChild(img);
            element.classList.add("has-image");
        } else {
            element.textContent = "♫";
        }
    });
}

function updatePlaybackButtonState(){
    const playButtons = [playButton, sheetPlayButton].filter(Boolean);
    if(playButtons.length === 0){
        return;
    }

    const shouldShowPause = !!currentStation && !audio.paused && !userPaused;
    playButtons.forEach(button => {
        const icon = button.querySelector(".player-icon");
        if(icon){
            icon.textContent = shouldShowPause ? "❚❚" : "▶";
        }
        button.setAttribute("aria-label", shouldShowPause ? "Pause" : "Play");
    });
}

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
            "Biztosan tĂ¶rlĂ¶d a kedvencek kĂ¶zĂĽl?"
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

        tag.stationcount > 20
        
    )
    
    .sort(
        (a,b)=>
        b.stationcount-a.stationcount
    )
    .slice(0,800)
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


    const validResult =
    result.filter(
        station =>
        station.url_resolved
    );


    stations =
    stations.concat(validResult);


    displayStations();


    page++;


    loading.classList.add("hidden");

}



function createCard(station,compact=false){
    const row = document.createElement("div");
    row.className = compact ? "radio-row compact" : "radio-row";

    const icon = document.createElement("div");
    icon.className = "radio-row-icon";

    const iconUrl = getStationIcon(station);
    if(iconUrl){
        const image = document.createElement("img");
        image.src = iconUrl;
        image.alt = "";
        image.loading = "lazy";
        image.onerror = ()=>{
            image.remove();
            icon.textContent = "♫";
        };
        icon.appendChild(image);
    } else {
        icon.textContent = "♫";
    }

    const content = document.createElement("div");
    content.className = "radio-row-content";

    const title = document.createElement("div");
    title.className = "radio-row-title";
    setTextWithTitle(title, station.name || "Unknown station");

    const sub = document.createElement("div");
    sub.className = "radio-row-sub";
    const genreText = station.tags || station.country || translations[language].noGenre;
    setTextWithTitle(sub, genreText);

    content.appendChild(title);
    if(!compact){
        content.appendChild(sub);
    }

    const protocol = document.createElement("span");
    protocol.className = "protocol-pill";
    protocol.textContent = (station.url_resolved || station.url || "").startsWith("https://") ? "HTTPS" : "HTTP";

    const favoriteButton = document.createElement("button");
    favoriteButton.className = `favorite-button ${isFavorite(station.stationuuid) ? "active" : ""}`;
    favoriteButton.type = "button";
    favoriteButton.textContent = "★";
    favoriteButton.title = isFavorite(station.stationuuid) ? "Remove from favorites" : "Add to favorites";

    row.appendChild(icon);
    row.appendChild(content);
    if(!compact){
        row.appendChild(protocol);
    }
    row.appendChild(favoriteButton);

    row.onclick = event=>{
        if(event.target.closest(".favorite-button")){
            toggleFavorite(station);
            return;
        }
        playStation(station);
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    };

    return row;
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
    favoritesList.innerHTML = "";
    const favorites = getFavorites();

    if(favorites.length === 0){
        favoritesList.innerHTML = `<p>${translations[language].noFavorites}</p>`;
        return;
    }

    favorites.forEach(station=>{
        favoritesList.appendChild(createCard(station, true));
    });
}

async function fetchNowPlayingMetadata(station){

    try{

        const streamUrl =
        new URL(
            currentStreamUrl || station.url_resolved
        );


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
        trackInfo.textContent = translations[language].trackLabel + ": " + track;
        playerSheetTrack.textContent = track;
        trackInfo.classList.remove("hidden");
    }
    else {
        trackInfo.textContent = translations[language].noTrackInfo;
        playerSheetTrack.textContent = translations[language].noTrackInfo;
        trackInfo.classList.remove("hidden");
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
    playerStatus.textContent = text;
    playerStatusSheet.textContent = text;
    playerStatus.className = "status " + type;
    playerStatusSheet.className = "status " + type;
    updatePlayerUi();
}



function getRetryStreamUrl(){

    if(!currentStation){
        return null;
    }

    return getPlaybackUrl(currentStation.url_resolved || currentStation.url);

}

function playStation(station){
    manualStop = false;
    userPaused = false;

    if(retryTimer){
        clearTimeout(retryTimer);
        retryTimer = null;
    }

    currentStation = station;
    localStorage.setItem("lastStation", JSON.stringify(station));
    retryIndex = 0;

    let originalUrl = station.url_resolved || station.url;

    if(!originalUrl){
        setStatus(translations[language].connectionLost, "error");
        return;
    }

    currentStreamUrl = getPlaybackUrl(originalUrl);

    audio.src = currentStreamUrl;

    audio.play().catch(()=>{
        setStatus(translations[language].paused, "paused");
    });

    stationName.textContent = station.name;
    nowPlaying.textContent = translations[language].streaming;
    updatePlayerUi();
    setStatus(translations[language].playing, "playing");

    addRecent(station);
    startNowPlayingPolling();
    updateMediaSession(station, null);
    updatePlaybackButtonState();
}

function retryConnection(){

    if(manualStop){
        return;
    }


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

        currentStreamUrl =
        getRetryStreamUrl();

        audio.src = currentStreamUrl;

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


audio.addEventListener("playing", ()=>{
    retryIndex = 0;

    if(retryTimer){
        clearTimeout(retryTimer);
        retryTimer = null;
    }

    userPaused = false;
    setStatus(translations[language].playing, "playing");
    updatePlaybackButtonState();
});


audio.addEventListener("pause", ()=>{
    if(userPaused){
        setStatus(translations[language].paused, "paused");
    }
    updatePlaybackButtonState();
});


audio.addEventListener(
"stalled",
()=>{

    if(!manualStop){

        retryConnection();

    }

});


audio.addEventListener(
"error",
()=>{

    if(!manualStop){

        retryConnection();

    }

});



window.addEventListener(
"offline",
()=>{

    if(!manualStop){

        retryConnection();

    }

});


window.addEventListener(
"online",
()=>{

    if(currentStation){

        retryIndex=0;

        retryConnection();

    }

});


function handlePlayToggle(event){
    event?.stopPropagation();

    if(currentStation && !audio.paused && !userPaused){
        userPaused = true;
        audio.pause();
        stopNowPlayingPolling();
        updatePlaybackButtonState();
        return;
    }

    manualStop = false;
    userPaused = false;
    retryIndex = 0;

    if(!currentStation){
        const saved = localStorage.getItem("lastStation");
        if(saved){
            currentStation = JSON.parse(saved);
            stationName.textContent = currentStation.name;
        } else {
            return;
        }
    }

    if(!currentStreamUrl){
        currentStreamUrl = getRetryStreamUrl();
        audio.src = currentStreamUrl;
    }

    audio.play().catch(error=>{
        console.log(error);
    });

    startNowPlayingPolling();
    updatePlaybackButtonState();
}

function handleStop(event){
    event?.stopPropagation();

    manualStop = true;

    userPaused = true;

    if(retryTimer){

        clearTimeout(retryTimer);
        retryTimer = null;

    }

    audio.pause();

    audio.removeAttribute("src");

    audio.load();


    currentStreamUrl = null;


    stopNowPlayingPolling();


    setStatus(
        translations[language].stopped || "Stopped",
        "ready"
    );


    nowPlaying.textContent =
    translations[language].nothingPlaying || "Nothing playing";
    updatePlayerUi();
    updatePlaybackButtonState();
}

function handleRewind(event){
    event?.stopPropagation();

    if(audio.currentTime > 10){
        audio.currentTime -= 10;
    } else {
        audio.currentTime = 0;
    }
}

function handleForward(event){
    event?.stopPropagation();

    audio.currentTime += 10;
}

playButton.onclick = handlePlayToggle;
sheetPlayButton.onclick = handlePlayToggle;
stopButton.onclick = handleStop;
sheetStopButton.onclick = handleStop;
rewindButton.onclick = handleRewind;
sheetRewindButton.onclick = handleRewind;
forwardButton.onclick = handleForward;
sheetForwardButton.onclick = handleForward;



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



document.addEventListener("keydown", event=>{
    if(event.code !== "Space" || event.target === searchInput){
        return;
    }

    event.preventDefault();
    playButton.onclick();
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

            playButton.onclick();

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



overlay.onclick = ()=>{
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    setPlayerSheetOpen(false);
};

playerBar.addEventListener("click", event=>{
    if(event.target.closest(".player-icon-button")){
        return;
    }

    setPlayerSheetOpen(!playerSheet.classList.contains("open"));
});

closePlayerSheet.onclick = ()=>{
    setPlayerSheetOpen(false);
};

document.addEventListener("click", event=>{
    if(!playerSheet.classList.contains("open")){
        return;
    }

    if(event.target.closest(".player-sheet") || event.target.closest(".player-bar")){
        return;
    }

    setPlayerSheetOpen(false);
});

document.addEventListener("keydown", event=>{
    if(event.key === "Escape"){
        setPlayerSheetOpen(false);
    }
});

playerBar.addEventListener("keydown", event=>{
    if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        playerSheet.classList.add("open");
    }
});



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
updatePlayerUi();
updatePlaybackButtonState();

loadCountries();
loadGenres();
loadStations();
displayFavorites();
displayRecent();

const savedStation =
localStorage.getItem("lastStation");


if(savedStation){

    currentStation =
    JSON.parse(savedStation);

    stationName.textContent =
    currentStation.name;

}

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






