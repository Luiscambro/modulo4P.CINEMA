// Contenedor donde se dibujan las tarjetas de películas.
const movieContainer = document.getElementById("movieContainer");

// Contenedor que recibe los enlaces de géneros obtenidos desde la API o el respaldo local.
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

// Configuracion de las imagenes: conserva las rutas locales conocidas y usa un placeholder para las no disponibles.
const localPosterPaths = new Set([
    "images/poster-cielo-rojo.jpg",
    "images/poster-diario-de-una-pasion.jpg",
    "images/poster-el-viaje-de-chihiro.jpg",
    "images/poster-jurassic-park.jpg",
    "images/poster-rambo-first-blood.jpg",
    "images/OIP.jpg",
    "images/00ef392b6d02f7b85cfd36fb99cd149cb5acd61b38f3a025250dd247483ac52a.jpg"
]);
const posterPlaceholder = "images/poster-no-disponible.svg";
const localPosterAliases = new Map([
    ["images/poster-Interestellar.jpg", "images/OIP.jpg"],
    ["images/poster-the-conjuring.jpg", posterPlaceholder],
    ["images/poster-spiderman-new-day.jpg", "images/00ef392b6d02f7b85cfd36fb99cd149cb5acd61b38f3a025250dd247483ac52a.jpg"]
]);

function getPosterSource(poster) {
    if (typeof poster !== "string") return posterPlaceholder;
    if (/^https?:\/\//i.test(poster)) return poster;

    const localPath = poster.replace(/^\.\//, "");
    if (localPosterAliases.has(localPath)) return localPosterAliases.get(localPath);
    return localPosterPaths.has(localPath) ? localPath : posterPlaceholder;
}



// Aqui empiezo a crear la logica de el carrito de compras, para que se pueda agregar peliculas
//  a la lista de compras y luego se pueda ver la lista de compras.//

// Estado y referencias del carrito que despues se mostraran en los elementos HTML.
// Contenedor donde se dibujan los elementos del carrito.
const cartContainer = document.getElementById("cartItems");
// Variable para almacenar los elementos del carrito en memoria.
let cartItems = [];
// Función para actualizar la visualización del carrito en el DOM.
function updateCartDisplay() {
    const totalQuantityElement = document.getElementById("totalQuantity");
    const totalPriceElement = document.getElementById("totalPrice");
    const emptyCartMessage = document.getElementById("emptyCartMessage");
    // Calcula la cantidad total de entradas y el precio total del carrito.
    cartContainer.innerHTML = "";
    // Calcula la cantidad total de entradas y el precio total del carrito.
    cartItems.forEach(selection => {
        const item = document.createElement("li");
        const subtotal = selection.unitPrice * selection.quantity;
        item.textContent = `${selection.title} - Género: ${selection.genre} - Horario: ${selection.showtime} - ${selection.quantity} entrada(s) - Precio por tiquete: $${selection.unitPrice.toFixed(2)} - Subtotal: $${subtotal.toFixed(2)}`;
        const removeButton = document.createElement("button");
        // Configura el botón de quitar con atributos y clases.
        removeButton.type = "button";
        removeButton.className = "cart-item__remove";
        removeButton.textContent = "Quitar";
        removeButton.dataset.movieId = selection.movieId;
        removeButton.dataset.showtime = selection.showtime;
        item.appendChild(removeButton);
        // Agrega un evento click al botón de quitar para eliminar la selección del carrito.
        cartContainer.appendChild(item);
    });

    // Calcula la cantidad total de entradas y el precio total del carrito.
    //reduce() suma las cantidades y los subtotales de todas las selecciones.
    //Luego se actualizan los elementos del HTML y se oculta el mensaje de carrito vacío cuando ya hay entradas.
    //Guarda y agrega una película para comprobar que cambien el contador y el total.


    const totalQuantity = cartItems.reduce(
        (sum, selection) => sum + selection.quantity,
        0
    );
    // Calcula la cantidad total de entradas y el precio total del carrito.
    const totalPrice = cartItems.reduce(
        (sum, selection) => sum + selection.unitPrice * selection.quantity,
        0
    );
    // Actualiza los elementos del DOM con la cantidad total y el precio total.
    totalQuantityElement.textContent = totalQuantity;
    // Actualiza los elementos del DOM con la cantidad total.
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    // Oculta el mensaje de carrito vacío si hay entradas en el carrito.
    emptyCartMessage.hidden = cartItems.length > 0;

}
// Obtiene el catalogo local desde data/movies.json y lo devuelve como un objeto JSON.
async function getLocalCatalog() {
    const response = await fetch("data/movies.json");

    if (!response.ok) {
        throw new Error("No se pudo cargar el catalogo local.");
    }

    return response.json();
}

// Carga primero cada recurso desde la API y consulta el catalogo local solo si falla.
async function getMovies() {
    try {
        const response = await fetch(`${API_URL}/movies`);

        if (!response.ok) {
            throw new Error("No se pudieron obtener las peliculas.");
        }

        const movies = await response.json();
        if (!Array.isArray(movies)) {
            throw new Error("La respuesta de peliculas no tiene el formato esperado.");
        } console.log("Películas recibidas:", movies);
        // Se espera que la API devuelva un arreglo de objetos de películas, cada uno con un precio numérico.
        const catalog = await getLocalCatalog();
        const priceText = catalog.movies[0]?.price;
        const localPrice = Number(priceText?.replace("$", ""));

        if (!Number.isFinite(localPrice)) {
            throw new Error("El precio de prueba del JSON no es válido.");
        }

        const apiMovies = movies.map(movie => ({
            ...movie,
            price: localPrice
        }));
        const apiTitles = new Set(apiMovies.map(movie => movie.title.trim().toLocaleLowerCase()));
        const usedIds = new Set(apiMovies.map(movie => Number(movie.id)));
        let nextId = Math.max(0, ...usedIds) + 1;
        const localMovies = catalog.movies
            .filter(movie => !apiTitles.has(movie.title.trim().toLocaleLowerCase()))
            .map(movie => {
                let id = Number(movie.id);
                if (usedIds.has(id)) id = nextId++;
                usedIds.add(id);
                return { ...movie, id, price: localPrice };
            });

        return [...apiMovies, ...localMovies];
    } catch (apiError) {
        // Si falla la API, el catalogo local permite seguir mostrando peliculas.
        console.warn("La API de peliculas no respondio; se intentara usar data/movies.json.", apiError);

        try {
            const catalog = await getLocalCatalog();
            if (!Array.isArray(catalog.movies)) {
                throw new Error("El respaldo local no contiene una lista de peliculas.");
            }
            return catalog.movies;
        } catch (fallbackError) {
            // Si tambien falla el respaldo, devolver [] evita romper init() al renderizar.
            console.error("No se pudieron cargar peliculas desde la API ni desde el respaldo local.", fallbackError);
            return [];
        }
    }
}

// Obtiene los generos de la API, con el mismo respaldo local si la solicitud falla.
async function getGenres() {
    try {
        const response = await fetch(`${API_URL}/genres`);

        if (!response.ok) {
            throw new Error("No se pudieron obtener los generos.");
        }

        // La respuesta se lee y devuelve dentro del try, donde response sigue disponible.
        const genres = await response.json();
        if (!Array.isArray(genres)) {
            throw new Error("La respuesta de generos no tiene el formato esperado.");
        }

        const catalog = await getLocalCatalog().catch(() => null);
        const localGenres = Array.isArray(catalog?.genres) ? catalog.genres : [];
        return [...new Set([...genres, ...localGenres])];
    } catch (apiError) {
        // El catch se ejecuta si falla la API o si su respuesta no tiene el formato esperado.
        console.warn("La API de generos no respondio; se intentara usar data/movies.json.", apiError);

        try {
            const catalog = await getLocalCatalog();
            if (!Array.isArray(catalog.genres)) {
                throw new Error("El respaldo local no contiene una lista de generos.");
            }
            return catalog.genres;
        } catch (fallbackError) {
            // Si tambien falla el JSON, devolver [] permite que la pagina gestione el catalogo vacio.
            console.error("No se pudieron cargar generos desde la API ni desde el respaldo local.", fallbackError);
            return [];
        }
    }
}
// Funciones de presentacion: convierten los datos recibidos en tarjetas y enlaces del DOM.
// Dibuja las tarjetas de películas en el contenedor movieContainer usando los datos obtenidos
//  desde /movies.
function renderMovies(movies) {

    movieContainer.innerHTML = '';

    if (movies.length === 0) {
        movieContainer.textContent = "No hay peliculas disponibles en este momento.";
        return;
    }

    movies.forEach(movie => {

        const article = document.createElement('article');
        article.classList.add("movie-card");

        // let texto = "<img src= " + movie.poster + " alt=" + movie.title + " class='movie-card__image'>"
        //  texto += "<div class='movie-card__content'>".
        article.innerHTML =
            `<img src="${getPosterSource(movie.poster)}" alt="${movie.title}" class="movie-card__image">
            <div class="movie-card__content">
                <h4 class="movie-card__title">${movie.title}</h4>
                <p class="movie-card__description">${movie.shortDescription}</p>
                <div class="movie-card__meta">
        
                    <label>Horario: <select class="movie-card__showtime">${movie.showtimes.map(showtime => `<option value="${showtime}">${showtime}</option>`).join("")}</select></label>
                    
                    <span class="movie-card__duration">${movie.duration} min</span>
                    <span class="movie-card__genre">${movie.genre}</span>                    
                </div>


                <label>Entradas: <input class="movie-card__quantity" type="number" min="1" value="1"></label>
                <button type="button" class="movie-card__add-to-cart" data-movie-id="${movie.id}">Agregar al carrito</button>
            
            
                <button class="movie-card__button" data-movie-id="${movie.id}">Ver detalles</button>
        </div>`;

        const posterImage = article.querySelector(".movie-card__image");
        posterImage.addEventListener("error", () => {
            posterImage.src = posterPlaceholder;
        }, { once: true });

        movieContainer.appendChild(article);
        /*console.log(`Renderizando película: ${movie.title}`); */
    });

}

function renderGenres(genres) {
    genreContainer.innerHTML = "";

    ["Todos", ...genres].forEach(genre => {

        const link = document.createElement("a");
        link.setAttribute("href", "#");

        link.textContent = genre;

        genreContainer.append(link);
    });
}
// La ventana modal permite consultar los detalles de la pelicula elegida.
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

// El filtro selecciona un genero y vuelve a dibujar solo las peliculas que coinciden.
function filterByGenre(movies) {
    // Se seleccionan todos los enlaces, incluido "Todos", después de renderizarlos.
    const genreButtons = document.querySelectorAll(".aside-menu a");

    genreButtons.forEach((genreButton) => {
        genreButton.addEventListener("click", (event) => {
            event.preventDefault();
            const selectedGenre = genreButton.textContent.trim();

            // "Todos" devuelve todas las películas; los demás enlaces comparan géneros.
            const filteredMovies = movies.filter(movie => {
                if (selectedGenre === "Todos") {
                    return true;
                } else {
                    return movie.genre.split("/").includes(selectedGenre);
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

// Estas funciones controlan la apertura y el cierre del menu en pantallas pequeñas.
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
// Punto de entrada: carga datos, dibuja la pagina y conecta sus eventos cuando el DOM esta listo.
// La función init() se ejecuta cuando el DOM está completamente cargado y listo para ser manipulado y sirve como
//  punto de entrada para inicializar la aplicación. Se encarga de obtener los datos de películas y géneros, renderizarlos en la página, configurar los eventos de los botones y el menú móvil,
//  y actualizar el año en el pie de página.//
async function init() {
    // **CORRECCION:** init() ya no depende de getData().
    // Obtiene las peliculas y los generos mediante funciones independientes.
    const movies = await getMovies();
    const genres = await getGenres();
    // Se agregan los eventos de click a los botones de "Ver detalles" para mostrar la información de la película correspondiente.//
    const cartToggle = document.getElementById("cartToggle");
    const cartPanel = document.getElementById("cartPanel");
    // Se agrega un evento click al botón de "Carrito" para mostrar u ocultar el panel del carrito y actualizar el atributo aria-expanded.//
    cartToggle.addEventListener("click", () => {
        const isOpening = cartPanel.hidden;
        cartPanel.hidden = !isOpening;
        cartToggle.setAttribute("aria-expanded", String(isOpening));
    });

    // Dibuja las tarjetas usando los objetos recibidos desde /movies.
    renderMovies(movies);
    // Dibuja los enlaces usando los textos recibidos desde /genres.
    renderGenres(genres);

    // Se agregan los eventos de click a los botones de "Ver detalles" para mostrar la información de la película correspondiente.//
    addButtonAction(movies); // tarea 24/09/2026// Agrega un evento click a cada botón de "Ver detalles" para mostrar la información de la película correspondiente.//


    // Se agrega un evento click al contenedor de películas para manejar los clics en los botones de "Agregar al carrito".//
    movieContainer.addEventListener("click", (event) => {
        // Se verifica si el elemento clickeado es un botón de "Agregar al carrito" o si está dentro de uno.//
        const addButton = event.target.closest(".movie-card__add-to-cart");
        if (!addButton) return;
        // Se obtiene la tarjeta de película correspondiente al botón de "Agregar al carrito" clickeado.//
        const card = addButton.closest(".movie-card");
        // Se obtiene el ID de la película desde el atributo data-movie-id del botón.//
        const movieId = Number(addButton.dataset.movieId);
        // Se busca la película correspondiente en el arreglo de películas usando el ID obtenido.//
        const movie = movies.find(movie => Number(movie.id) === movieId);
        // Se obtiene el horario seleccionado desde el elemento select de la tarjeta de película.//
        const showtime = card.querySelector(".movie-card__showtime").value;
        // Se obtiene la cantidad de entradas desde el elemento input de la tarjeta de película.//
        const quantity = Number(card.querySelector(".movie-card__quantity").value);

        // Si no se encuentra la película correspondiente, se cancela la operación.//
        if (!movie) return;

        const selection = {
            movieId: movie.id,
            title: movie.title,
            genre: movie.genre,
            showtime,
            quantity,
            unitPrice: Number(String(movie.price).replace("$", ""))
        };
        // Se verifica si ya existe una selección en el carrito con la misma película y horario.//
        const existingSelection = cartItems.find(item =>
            item.movieId === selection.movieId && item.showtime === selection.showtime
        );
        // Si ya existe, se suma la cantidad de entradas; si no, se agrega la nueva selección al carrito.//
        if (existingSelection) {
            existingSelection.quantity += selection.quantity;
        } else {
            cartItems.push(selection);
        }
        // Se actualiza la visualización del carrito y se muestra en la consola el estado actual del carrito.//
        updateCartDisplay();
        console.log("Carrito actual:", cartItems);
    });
    // Se agrega un evento click al contenedor del carrito para manejar los clics en los botones de "Quitar".//
    cartContainer.addEventListener("click", (event) => {
        // Se verifica si el elemento clickeado es un botón de "Quitar" o si está dentro de uno.//
        const removeButton = event.target.closest(".cart-item__remove");
        // Si no se encuentra un botón de "Quitar", se cancela la operación.//
        if (!removeButton) return;

        // Se obtiene el ID de la película y el horario desde los atributos data del botón de "Quitar".//
        const movieId = Number(removeButton.dataset.movieId);
        // Se obtiene el horario desde los atributos data del botón de "Quitar".//
        const showtime = removeButton.dataset.showtime;

        // Se filtra el arreglo cartItems para eliminar la selección correspondiente al ID de película y horario obtenidos.//
        cartItems = cartItems.filter(selection =>
            !(Number(selection.movieId) === movieId && selection.showtime === showtime)
        );
        // Se actualiza la visualización del carrito después de eliminar la selección.//
        updateCartDisplay();
    });

    // Se agrega un evento click al botón de "Confirmar compra" para generar un recibo de la transacción y mostrarlo en el contenedor purchaseReceipt.//
    const confirmPurchaseButton = document.getElementById("confirmPurchase");
    // Se obtiene el contenedor donde se mostrará el recibo de la transacción.//
    const purchaseReceipt = document.getElementById("purchaseReceipt");

    // Se agrega un evento click al botón de "Confirmar compra" para generar un recibo de la transacción y mostrarlo en el contenedor purchaseReceipt.//
    confirmPurchaseButton.addEventListener("click", () => {

        // Si el carrito está vacío, no se realiza ninguna acción.//
        if (cartItems.length === 0) return;

        const totalQuantity = cartItems.reduce(
            (sum, selection) => sum + selection.quantity,
            0
        );
        const totalPrice = cartItems.reduce(
            (sum, selection) => sum + selection.unitPrice * selection.quantity,
            0
        );

        const transaction = {
            transactionId: Date.now(),
            createdAt: new Date().toISOString(),
            items: cartItems.map(selection => ({
                movieId: selection.movieId,
                movie: selection.title,
                genre: selection.genre,
                showtime: selection.showtime,
                quantity: selection.quantity,
                unitPrice: selection.unitPrice,
                subtotal: selection.unitPrice * selection.quantity
            })),
            totalQuantity,
            totalPrice
        };
        // Se muestra el recibo de la transacción en formato JSON en el contenedor purchaseReceipt y se hace visible.//
        purchaseReceipt.textContent = JSON.stringify(transaction, null, 2);
        purchaseReceipt.hidden = false;
        // Se limpia el carrito después de confirmar la compra y se actualiza la visualización del carrito.//
        cartItems = [];
        updateCartDisplay();




        // Se crea un Blob con el contenido del recibo de la transacción en formato JSON para permitir su descarga.//
        const receiptBlob = new Blob([purchaseReceipt.textContent], {
            type: "application/json"
        });
        // Se crea un enlace de descarga para el recibo de la transacción y se simula un clic en él para iniciar la descarga.//
        const fileUrl = URL.createObjectURL(receiptBlob);
        const downloadLink = document.createElement("a");
      // Se configura el enlace de descarga con la URL del archivo y el nombre del archivo.//
        downloadLink.href = fileUrl;
        downloadLink.download = `comprobante-${transaction.transactionId}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    });

    // Se filtran las películas por género cuando se hace clic en los enlaces de géneros.//
    filterByGenre(movies);

    // Se configura el comportamiento del menú móvil para abrir y cerrar el panel de géneros.//
    setupMobileMenu();
    allMovies = movies;

    // Actualiza el año en el pie de página con el año actual.//
    $("#year").text(new Date().getFullYear());


}

document.addEventListener('DOMContentLoaded', init)


