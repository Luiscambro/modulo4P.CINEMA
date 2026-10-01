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

//Aqui empieza la tarea de conectar la api con el front end, para que se pueda ver la informacion de las peliculas en la pagina web.
const API_URL = "https://proyectocinemaapi.onrender.com";//esto fue lo primero que hice.//



// Aqui empiezo a crear el carrito de compras, para que se pueda agregar peliculas
//  a la lista de compras y luego se pueda ver la lista de compras.//





// **CORRECCION:** Se reemplaza getData() por dos funciones separadas.
// Cada funcion obtiene un recurso concreto de la API y devuelve sus datos.
async function getMovies() {
    try {
        // Solicita la lista de peliculas al endpoint GET /movies.
        const response = await fetch(`${API_URL}/movies`);

        // Comprueba que la API haya respondido correctamente.
        if (!response.ok) {
            throw new Error("No se pudieron obtener las peliculas.");
        }

        // Convierte la respuesta JSON en un arreglo de objetos JavaScript.
        const movies = await response.json();

        // Devuelve los datos para que init() pueda dibujar las tarjetas.
        return movies;
    } catch (error) {
        // Muestra el error en la consola y devuelve un arreglo vacio.
        alert("Error al cargar las peliculas:", error);
        return [];
    }
}

async function getGenres() {
   
    try {
        // Solicita la lista de generos al endpoint GET /genres.
        const response = await fetch(`${API_URL}/genres`);

        // Comprueba que la API haya respondido correctamente.
        if (!response.ok) {
            throw new Error("No se pudieron obtener los generos.");
        }

        // Convierte la respuesta JSON en un arreglo de strings.
        const genres = await fetch(`${API_URL}/genres`).then(res => res.json());

        // Devuelve los generos para crear los enlaces del menu.
        return genres;
    } catch (error) {
        // Muestra el error en la consola y devuelve un arreglo vacio.
        alert("Error al cargar los generos:", error);
        return genres = ["Todos"]; // Devuelve un arreglo con "Todos" para que el menú no quede vacío.
    }
}
    // Dibuja las tarjetas de películas en el contenedor movieContainer usando los datos obtenidos
    //  desde /movies.
    function renderMovies(movies) {

        movieContainer.innerHTML = '';

        movies.forEach(movie => {

            const article = document.createElement('article');
            article.classList.add("movie-card");

            // let texto = "<img src= " + movie.poster + " alt=" + movie.title + " class='movie-card__image'>"
           //  texto += "<div class='movie-card__content'>".
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
    //TAREA// 24/09/2026//
    // Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//

    // Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//
    function addButtonAction(movies) {
        const movieModal = document.getElementById("movieModal"); // Obtiene el elemento de la ventana modal por su ID
        const modalContent = document.getElementById("movieModalText");// Obtiene el elemento donde se mostrará el contenido de la película en la ventana modal
        const buttons = document.querySelectorAll(".movie-card__button");// Obtiene todos los botones de "Ver detalles" en las tarjetas de películas
        const movieModalClose = document.getElementById("movieModalClose");// Obtiene el botón de cierre de la ventana modal por su ID


        // Agrega un evento click al botón de cierre de la ventana modal para ocultarla cuando se haga clic en él.//
        movieModalClose.addEventListener("click", () => {
            movieModal.hidden = true;
        });



        // Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//
        buttons.forEach((button) => {

            // Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//
            button.addEventListener("click", () => {

                const movieId = Number(button.dataset.movieId);// Obtiene el ID de la película desde el atributo data-movie-id del botón

                const movie = movies.find((movie) => movie.id === movieId);// Busca la película correspondiente en el arreglo de películas usando el ID obtenido


                // Si se encuentra la película, muestra su información en la ventana modal.//
                if (movie && modalContent && movieModal) {
                    // Muestra la información de la película en formato JSON en el contenido de la ventana modal.//
                    modalContent.textContent = JSON.stringify(movie, null, 2);

                    // Muestra la ventana modal estableciendo su propiedad hidden en false.//
                    movieModal.hidden = false;
                }
            });
        });
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
                addButtonAction(filteredMovies);

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
    // La función init() se ejecuta cuando el DOM está completamente cargado y listo para ser manipulado y sirve como
    //  punto de entrada para inicializar la aplicación. Se encarga de obtener los datos de películas y géneros, renderizarlos en la página, configurar los eventos de los botones y el menú móvil,
    //  y actualizar el año en el pie de página.//
    async function init() {
              
         console.table(movies)

        // **CORRECCION:** init() ya no depende de getData().
        // Obtiene las peliculas y los generos mediante funciones independientes.
        const movies = await getMovies();
        const genres = await getGenres();

        // Dibuja las tarjetas usando los objetos recibidos desde /movies.
        renderMovies(movies);
        // Dibuja los enlaces usando los textos recibidos desde /genres.
        renderGenres(genres);

        // Se agregan los eventos de click a los botones de "Ver detalles" para mostrar la información de la película correspondiente.//
        addButtonAction(movies); // tarea 24/09/2026// Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//

        // Se filtran las películas por género cuando se hace clic en los enlaces de géneros.//
        filterByGenre(movies);

        // Se configura el comportamiento del menú móvil para abrir y cerrar el panel de géneros.//
        setupMobileMenu();
        allMovies = movies;

        // Actualiza el año en el pie de página con el año actual.//
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