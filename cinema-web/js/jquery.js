// ====================================================
// 1) BUSCAMOS LOS ELEMENTOS DE HTML QUE VAMOS A MANIPULAR
// ====================================================
// document.getElementById("movieContainer") = busca el div donde van a ir las tarjetas de películas
// document.querySelector(".genreContainer") = busca el contenedor del menú lateral de géneros
const movieContainer = document.getElementById("movieContainer");
const genreContainer = document.querySelector(".genreContainer");

// ====================================================
// 2) LEEMOS LOS DATOS DEL ARCHIVO movies.json
// ====================================================
// fetch("data/movies.json") = pide el archivo JSON al navegador
// await = espera a que termine de cargar
// response.json() = convierte la respuesta JSON en un objeto JavaScript que podemos usar
// Es como abrir una caja y leer los datos que trae
async function getData() {
    const response = await fetch("data/movies.json");

    // Si la respuesta no fue exitosa, lanzamos un error
    if (!response.ok) {
        throw new Error("No se pudo cargar el archivo de películas.");
    }

    const data = await response.json();
    return data;
}

// ====================================================
// 3) RENDERIZAR PELÍCULAS EN PANTALLA
// ====================================================
// Esta función recibe un arreglo de películas y las dibuja en el contenedor movieContainer
function renderMovies(movies) {
    // Si no existe el contenedor, no hace nada
    if (!movieContainer) return;

    // Vacía el contenedor para no repetir tarjetas
    movieContainer.innerHTML = "";

    // forEach recorre cada película del arreglo
    // movie = cada objeto individual de la lista
    movies.forEach((movie) => {
        // Creamos un elemento <article> para cada película
        const article = document.createElement("article");
        article.classList.add("movie-card");

        // Con innerHTML le agregamos el contenido HTML que queremos mostrar
        // Aquí usamos los datos de la película: título, descripción, duración, género, imagen, id
        article.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" class="movie-card__image">
            <div class="movie-card__content">
                <h4 class="movie-card__title">${movie.title}</h4>
                <p class="movie-card__description">${movie.shortDescription}</p>
                <div class="movie-card__meta">
                    <span class="movie-card__duration">${movie.duration} min</span>
                    <span class="movie-card__genre">${movie.genre}</span>
                </div>
                <button class="movie-card__button" data-movie-id="${movie.id}">Ver detalles</button>
            </div>
        `;

        // appendChild = mete ese artículo dentro del contenedor principal
        movieContainer.appendChild(article);
    });
}

// ====================================================
// 4) CREAR EL MENÚ DE GÉNEROS EN EL LADO
// ====================================================
// Esta función crea los enlaces del menú lateral y también activa el filtro
function renderGenres(genres, movies) {
    // Si no existe el contenedor de géneros, no hace nada
    if (!genreContainer) return;

    // Limpiamos el menú para evitar duplicados
    genreContainer.innerHTML = "";

    // =====================
    // Opción "Todos"
    // =====================
    const allLink = document.createElement("a");
    allLink.href = "#";
    allLink.className = "genre-link is-active";
    allLink.textContent = "Todos";

    // Evento click: si presionas "Todos" muestra todas las películas
    allLink.addEventListener("click", (event) => {
        event.preventDefault(); // evita que el enlace recargue la página
        renderMovies(movies); // muestra todas
        updateActiveGenre("Todos"); // marca el género activo
    });

    genreContainer.appendChild(allLink);

    // =====================
    // Cada género del JSON
    // =====================
    genres.forEach((genre) => {
        const link = document.createElement("a");
        link.href = "#";
        link.className = "genre-link";
        link.textContent = genre;

        // Cuando haces click en un género, filtramos las películas
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // movies.filter(...) = crea un nuevo arreglo con solo las películas que cumplen la condición
            const filteredMovies = movies.filter((movie) => {
                // Ejemplo: "Romance/Drama" -> ["Romance", "Drama"]
                const movieGenres = movie.genre.split("/").map((item) => item.trim().toLowerCase());

                // revisa si el género seleccionado existe en esa lista
                return movieGenres.includes(genre.toLowerCase());
            });

            renderMovies(filteredMovies);
            updateActiveGenre(genre);
        });

        genreContainer.appendChild(link);
    });
}

// ====================================================
// 5) RESALTAR EL GÉNERO ACTIVO
// ====================================================
function updateActiveGenre(activeGenre) {
    // querySelectorAll busca todos los links del menú
    const genreLinks = document.querySelectorAll(".genre-link");

    // forEach recorre todos los links y activa solo el correcto
    genreLinks.forEach((link) => {
        // classList.toggle("is-active", condicion) = si la condición es true, agrega la clase; si es false, la quita
        link.classList.toggle("is-active", link.textContent.trim() === activeGenre);
    });
}

// ====================================================
// 6) BOTÓN "VER DETALLES"
// ====================================================
// Este bloque no hace nada muy sofisticado, solo cambia el fondo del footer cuando das clic
function addButtonAction() {
    const movieButtons = document.querySelectorAll(".movie-card__button");

    movieButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const footer = document.querySelector(".site-footer");
            if (footer) {
                footer.style.background = "white";
            }
        });
    });
}

// ====================================================
// 7) FUNCIÓN PRINCIPAL: INIT
// ====================================================
// Aquí se organiza todo el flujo principal de la página
async function init() {
    try {
        // 1. Trae los datos del JSON
        const data = await getData();

        // 2. Guarda todas las películas
        const allMovies = data.movies || [];

        // 3. Muestra todas las películas en pantalla
        renderMovies(allMovies);

        // 4. Crea el menú de géneros
        renderGenres(data.genres || [], allMovies);

        // 5. Agrega la acción a cada botón "Ver detalles"
        addButtonAction();

        // 6. Coloca el año actual en el footer
        const yearEl = document.getElementById("years");
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    } catch (error) {
        // Si algo sale mal, lo mostramos en consola y avisamos al usuario
        console.error(error);
        movieContainer.innerHTML = "<p>No se pudieron cargar las películas.</p>";
    }
}

// ====================================================
// 8) CUANDO LA PÁGINA ESTÉ LISTA, EJECUTA INIT
// ====================================================
// Esto asegura que los elementos HTML ya existan antes de usarlos
document.addEventListener("DOMContentLoaded", init);