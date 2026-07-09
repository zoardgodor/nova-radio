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

const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");

const volumeSlider = document.getElementById("volumeSlider");

const showFavoritesButton = document.getElementById("showFavoritesButton");

const loadMoreButton = document.getElementById("loadMoreButton");


let stations = [];
let currentStation = null;
let showingFavorites = false;

let page = 0;
const pageSize = 100;


audio.volume = 0.7;



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

    let favorites = getFavorites();


    if(
        isFavorite(station.stationuuid)
    ){

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



async function loadStations(reset = true){

    if(reset){

        page = 0;

        stations = [];

        radioList.innerHTML = "";

    }



    loading.classList.remove("hidden");



    let url =
    api +
    "/stations/search?hidebroken=true"
    +
    "&limit=" + pageSize
    +
    "&offset=" + (page * pageSize);



    if(searchInput.value.trim()){

        url +=
        "&name=" +
        encodeURIComponent(
            searchInput.value.trim()
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



    const favorite =
    isFavorite(
        station.stationuuid
    )
    ?
    "active"
    :
    "";



    card.innerHTML = `

    <button class="favorite-button ${favorite}">
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

    };



    return card;

}



function displayStations(){

    if(showingFavorites){

        return;

    }


    radioList.innerHTML = "";


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


    getFavorites()
    .forEach(
        station=>{

            favoritesList.appendChild(
                createCard(station)
            );

        }
    );

}



function playStation(station){

    currentStation =
    station;


    audio.src =
    station.url_resolved;


    audio.play();



    stationName.textContent =
    station.name;


    nowPlaying.textContent =
    "Streaming";

}



playButton.onclick =
()=>{

    audio.play();

};



pauseButton.onclick =
()=>{

    audio.pause();

};



volumeSlider.oninput =
()=>{

    audio.volume =
    volumeSlider.value;

};



searchButton.onclick =
()=>{

    showingFavorites = false;

    loadStations(true);

};



searchInput.addEventListener(
"keydown",
event=>{

    if(event.key === "Enter"){

        showingFavorites = false;

        loadStations(true);

    }

});



countryFilter.onchange =
()=>{

    showingFavorites = false;

    loadStations(true);

};



genreFilter.onchange =
()=>{

    showingFavorites = false;

    loadStations(true);

};



loadMoreButton.onclick =
()=>{

    loadStations(false);

};



showFavoritesButton.onclick =
()=>{

    showingFavorites =
    !showingFavorites;


    if(showingFavorites){

        radioList.innerHTML = "";

        showFavoritesButton.textContent =
        "Show Stations";

    }

    else {

        showFavoritesButton.textContent =
        "⭐ Show Favorites";

        displayStations();

    }

};



loadCountries();

loadGenres();

loadStations();

displayFavorites();
