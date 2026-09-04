const movieContainer = document.getElementById("movieContainer");
const genreContainer = document.getElementById("genreContainer");

async function getData() {
    const response = await fetch('data/movies.json');
    const data = await response.json();

    return data;
}

function renderMovies(movies) {

    movieContainer.innerHTML = '';

    movies.forEach(movie => {

        const article = document.createElement('article');
        article.classList.add("movie-card");

        // let texto = "<img src= " + movie.poster + " alt=" + movie.title + " class='movie-card__image'>"

        article.innerHTML =
            `<img src="${movie.poster}" alt="${movie.title}" class="movie-card__image">
            <div class="movie-card__content">
                <h4 class="movie-card__title">${movie.title}</h4>
                <p class="movie-card__description">${movie.shortDescription}</p>
                <div class="movie-card__meta">
                    <span class="movie-card__duration">${movie.duration} min</span>
                    <span class="movie-card__genre">${movie.genre}</span>                    
                </div>
            <button class="movie-card__button" data-movie-id="${movie.id}">Ver detalles</button>
        </div>`;

        movieContainer.appendChild(article);
        /*console.log(`Renderizando película: ${movie.title}`); */
    });

}

function renderGenres(genres) {
    //genreContainer.innerHTML = "";

    genres.forEach(genre => {

        const link = document.createElement("a");
        link.setAttribute("href", "#");

        link.innerHTML = genre;

        genreContainer.append(link);
    });
}

function addButtonAction() {

    $(".movie-card__button").click(function () { $(".site-footer").css("background", "white"); })

    /*const movieButtons = document.querySelectorAll(".movie-card__button");

    movieButtons.forEach((button) => {
        button.addEventListener("click", () => {
            console.log(button.dataset.movieId);
        })
    })*/

}

function filterByGenre(movies) {
    const genreButtons = document.querySelectorAll(".aside-menu a");

    genreButtons.forEach((genreButton) => {
        genreButton.addEventListener("click", () => {
            const filteredMovies = movies.filter(movie => {
                if (genreButton.innerHTML == "Todos") {
                    return movie.genre
                } else {
                    return movie.genre.split("/").includes(genreButton.innerHTML);
                }
            })
            renderMovies(filteredMovies);
        })
    })
}

async function init() {
    const data = await getData();
    //console.log(data);   
    renderMovies(data.movies);
    renderGenres(data.genres);

    addButtonAction();
    filterByGenre(data.movies)

    $("#year").text(new Date().getFullYear());

    /*const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();*/

    //const carts = document.getElementsByClassName("movie-card__content");
    //const genre_button = document.querySelector(".aside-menu a");
    //const genre_button = document.querySelector(".genreClass:nth-child(2)");
    //document.getElementById("genreContainer");
    //document.getElementsByClassName("genreClass");//todas las conincidencias

    //console.log(genre_button);

}

document.addEventListener('DOMContentLoaded', init)


//$(document).ready(init)