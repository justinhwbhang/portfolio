window.addEventListener('load', () => {
    /*
    ** API KEYS 
    */
    
    const TMDB_API_KEY = "365763a878a8f9fe9ab725c84e864923";
    const OPENWEATHERMAP_API = "6134317c10db877014543c36d6f4d45d";

    /**
     * VARIABLES
     */

    // declare the common html tags for easier access
    const searchForm = document.querySelector("#search-movie-form");
    const queryTextBox = document.querySelector('#search-query');
    const resultsDiv = document.querySelector("#results");
    const favouritesDiv = document.querySelector("#favourites");
    const favouritesCount = document.querySelector("#favourites-count");
    const searchTypeSelect = document.querySelector("#search-type");
    const weatherDiv = document.querySelector("#weather");

    let movies = [];
    let favourites = [];
    let searchType = "movie";

    /*
    ** FUNCTIONS 
    */

    // initialize the local storage
    const initializeLocalStorage = () => {
        if(localStorage.getItem('favourites') == null){
            localStorage.setItem('favourites', JSON.stringify([]));
        }else{
            favourites = JSON.parse(localStorage.getItem('favourites'));
        }
    }

    // function to search movie
    const searchMovie = (query)  => {
        // fetch the movie list
        const url = `https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_API_KEY}&query=${query}`;

        // display loading message
        resultsDiv.innerHTML = `Loading...`;

        fetch(url)
        .then(res => res.json())
        .then(res => {
            // empty the results div
            resultsDiv.innerHTML = "";

            if(res.results){
                // loop and display the results
                res.results.forEach(movie => {
                    movies.push(movie);
                    displayMovie(movie);
                });
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    // function to display each movie
    const displayMovie = (movie) => {
        // default poster path
        let poster = "./img/default.jpg";
        if(movie.poster_path){
            poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        }
        let html = `
            <div class="card">
                <div class="grid-x">
                    <div class="cell small-4">
                        <img src="${poster}" class = "img-fluid">
                    </div>

                    <div class="cell small-8">
                        
                        <div class="card-section">
                            <h4>${movie.original_title != undefined ? movie.original_title : movie.original_name }</h4>
                            <p>Release Year: ${movie.release_date != undefined ? movie.release_date : movie.first_air_date }<br>
                            Movie Rating: ${movie.vote_average}</p>
                            <p>${movie.overview}</p>
                            <p><button class = "favourite-button ${ movieIsFavourite(movie.id) ? "" : "hollow" } button" data-movie-id="${movie.id}"><i class = "fa fa-heart"></i> FAVOURITE</button></p>
                        </div>
                    </div>
                </div>
            </div>
                
                `;
        resultsDiv.innerHTML += html;
    }

     // determine if the provided movie has been saved to favourites
     const movieIsFavourite = (movieId) => {
        
        for(let i = 0; i < favourites.length; i++){
            if(favourites[i].id == movieId){
                return true;
            }
        }

        return false;
    }

    // add the specified movie to favourites, or remove it if it already exists
    const toggleFavourite = (movieId) => {
        
        // loop through the favourites to see if it has been set
        let favourite = movieIsFavourite(movieId);
        
        // the movie exists in the favourites, remove it
        if(favourite){
            favourites = favourites.filter(fav => fav.id != movieId);
        }
        
        // otherwise, add it to favourites
        else{
            for(let i = 0; i < movies.length; i++){
                if(movies[i].id == movieId){
                    favourites.push(movies[i]);
                    break;
                }
            }
        }

        // update local storage
        localStorage.setItem('favourites', JSON.stringify(favourites));

        // display the favourites
        displayFavourites();

        return !favourite;
    }

    const displayFavourites = ()=> {
        favouritesDiv.innerHTML = "";
        let html = "";

        for(let favourite in favourites){
            // default poster path
            let poster = "./img/default.jpg";
            if(favourites[favourite].poster_path){
                poster = `https://image.tmdb.org/t/p/w500${favourites[favourite].poster_path}`;
            }
            
            html += `
            <div class="card favourites-card">
                <p class = "text-right">
                    <button class = "button favourites-delete" data-movie-id = "${favourites[favourite].id}"> X </button>
                </p>
                <img src="${poster}" class = "favourites-img">
                <div class="card-section">
                    <p>${ favourites[favourite].original_title != undefined ? favourites[favourite].original_title : favourites[favourite].original_name}</p>
                </div>
            </div>
            `;
        }

        favouritesDiv.innerHTML = html;
        favouritesCount.innerHTML = favourites.length;
    }

    // query today's weather
    const getWeather = () => {
        // get location from user
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude;
                let long = position.coords.longitude;
                
                // query the weather data
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${OPENWEATHERMAP_API}&units=imperial`;
                fetch(url)
                .then(res => res.json())
                .then(res => {
                    weatherDiv.innerHTML = `
                        <img style = "height: 50px" src = "http://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png"> ${res.main.temp} &deg; F
                    `;
                    
                })
                .catch(err => {
                    console.log(err);
                });

            },
            (error) => {
                console.log(error);
            }
        );
    }

    /**
     * ACTUAL SCRIPT
     */

    // initialize local storage
    initializeLocalStorage();

    // display the favourites
    displayFavourites();

    // get todays weather
    getWeather();

    /**
     * EVENT LISTENERS
     */

    // event listener for when the search form is submitted
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let query = queryTextBox.value.trim();
        searchType = searchTypeSelect.value.trim();

        // only search if the query textbox is not empty
        if(query !== ""){
            searchMovie(query);
        }

    });

    // event listener for when the favourite button is clicked
    document.addEventListener('click', function(e){
        if(e.target.classList.contains("favourite-button") || e.target.classList.contains("favourites-delete")){
            
            
            let movieId = e.target.dataset.movieId;

            if(toggleFavourite(movieId)){
                e.target.classList.remove("hollow");
            }else{
                e.target.classList.add("hollow");
            }
        }
    });
});