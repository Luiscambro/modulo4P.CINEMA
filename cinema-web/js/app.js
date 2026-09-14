// Contenedor donde se dibujan las tarjetas de películas.
const movieContainer = document.getElementById("movieContainer");

// Contenedor que recibe los enlaces de géneros creados desde movies.json.
const genreContainer = document.getElementById("genreContainer");

// Permite saber si la ventana está en modo móvil/tablet (720px o menos).
// La misma condición existe en CSS para que ambos archivos cambien de modo juntos.
const mobileQuery = window.matchMedia("(max-width: 720px)");

// Elementos que forman el comportamiento del menú hamburguesa.
const genreMenu = document.getElementById("genreMenu");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuBackdrop = document.querySelector(".menu-backdrop");
let allMovies = [];
let activeGenre = "Todos";

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
    // Se seleccionan todos los enlaces, incluido "Todos", después de renderizarlos.
    const genreButtons = document.querySelectorAll(".aside-menu a");

    genreButtons.forEach((genreButton) => {
        genreButton.addEventListener("click", () => {
            // "Todos" devuelve todas las películas; los demás enlaces comparan géneros.
            const filteredMovies = movies.filter(movie => {
                if (genreButton.innerHTML == "Todos") {
                    return movie.genre
                } else {
                    return movie.genre.split("/").includes(genreButton.innerHTML);
                }
            })

            // Se reemplazan las tarjetas por el resultado del filtro seleccionado.
            renderMovies(filteredMovies);

            // En móvil, elegir un género también cierra el panel automáticamente.
            closeMobileMenu();
        })
    })
}

function setMobileMenu(isOpen) {
    // En escritorio no se modifica el menú: allí siempre debe permanecer lateral y visible.
    if (!genreMenu || !menuToggle || !mobileQuery.matches) return;

    // La clase is-open activa en CSS la animación que trae el panel desde la izquierda.
    genreMenu.classList.toggle("is-open", isOpen);

    // aria-expanded mantiene informado al lector de pantalla sobre el estado real.
    menuToggle.setAttribute("aria-expanded", String(isOpen));

    // Bloquea el scroll del fondo mientras el panel responsive está abierto.
    document.body.classList.toggle("menu-is-open", isOpen);

    if (menuBackdrop) {
        // hidden oculta o muestra la capa que está detrás del menú.
        menuBackdrop.hidden = !isOpen;
    }
}

function closeMobileMenu() {
    // Función reutilizable para cerrar el menú desde varios eventos diferentes.
    setMobileMenu(false);
}

function setupMobileMenu() {
    // Si falta algún elemento HTML, se cancela la configuración sin romper la página.
    if (!genreMenu || !menuToggle) return;

    // El botón hamburguesa abre el panel únicamente cuando mobileQuery es verdadero.
    menuToggle.addEventListener("click", () => setMobileMenu(true));

    // El panel se puede cerrar desde su botón interno o haciendo clic en el fondo oscuro.
    menuClose?.addEventListener("click", closeMobileMenu);
    menuBackdrop?.addEventListener("click", closeMobileMenu);

    // Escape ofrece una forma rápida y accesible de cerrar el panel.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMobileMenu();
    });

    // Si el usuario gira el dispositivo o cambia el tamaño de la ventana a escritorio,
    // se limpian las clases y atributos del modo móvil para evitar estados inconsistentes.
    mobileQuery.addEventListener("change", () => {
        if (!mobileQuery.matches) {
            genreMenu.classList.remove("is-open");
            document.body.classList.remove("menu-is-open");
            menuBackdrop.hidden = true;
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

async function init() {
    const data = await getData();
    //console.log(data);   
    renderMovies(data.movies);
    renderGenres(data.genres);

    addButtonAction();
    filterByGenre(data.movies)
    setupMobileMenu();

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