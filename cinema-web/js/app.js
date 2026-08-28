// Busca una sola vez el contenedor donde se pintaran todas las peliculas.
// `getElementById` devuelve el elemento HTML cuyo atributo `id` es `movieContainer`.
const movieContainer = document.getElementById("movieContainer");

// Declara una funcion asincrona porque dentro de ella se esperan operaciones de red.
async function getData() {
    // Solicita al navegador el archivo JSON usando la ruta relativa al index.html.


    // `fetch` devuelve una Promesa, por eso se usa `await` para esperar su respuesta.
     const response = await fetch('data/movies.json');
    
     // Convierte el cuerpo de la respuesta HTTP desde texto JSON a un objeto JavaScript.
     const data = await response.json();
   
     // Entrega el objeto completo: contiene las propiedades `genres` y `movies`.
    return data;
}

// Recibe el arreglo de peliculas y crea su representacion visual en el HTML.
function renderMovies(movies) {

    // Borra el contenido anterior para evitar duplicar tarjetas si se renderiza otra vez.
    movieContainer.innerHTML = '';

    // Recorre el arreglo; en cada vuelta `movie` representa una pelicula individual.
    movies.forEach(movie => {

        // Crea en memoria un elemento <article>; aun no aparece en la pagina.
        const article = document.createElement('article');

        // Agrega la clase CSS que da formato visual a la tarjeta.
        article.classList.add("movie-card");

        // Ejemplo antiguo de construir HTML concatenando textos; se conserva como referencia.
        // let texto = "<img src= " + movie.poster + " alt=" + movie.title + " class='movie-card__image'>"

        // Define el HTML interno de la tarjeta usando una plantilla de texto.
        // Las expresiones `${...}` insertan valores del objeto `movie` en cada tarjeta.
        article.innerHTML =
            `<img src="${movie.poster}" alt="${movie.title}" class="movie-card__image">
            <div class="movie-card__content">
                <h4 class="movie-card__title">${movie.title}</h4>
                <p class="movie-card__description">${movie.shortDescription}</p>
                <div class="movie-card__meta">
                    <span class="movie-card__duration">${movie.duration} min</span>
                    <span class="movie-card__genre">${movie.genre}</span>
                    <span class="movie-card__genre">${palabra()}</span>
                </div>
            <button class="movie-card__button">Ver detalles</button>
        </div>`;

        // Inserta la tarjeta ya completa dentro de `#movieContainer` en el DOM.
        movieContainer.appendChild(article);
        // Esta instruccion serviria para inspeccionar cada pelicula en la consola del navegador.
        /*console.log(`Renderizando pelicula: ${movie.title}`); */
    });

    // Funcion local disponible solo dentro de `renderMovies`.
    function palabra() {
        // Devuelve siempre este texto; por eso aparece en todas las tarjetas.
        return "Hola Mundo";
    }

}


// Funcion principal que coordina la carga de datos y la actualizacion inicial de la pagina.
async function init() {
   
    // Espera a que `getData` termine y guarda el objeto JSON recibido.
    const data = await getData();
   
    // Envia solo el arreglo de peliculas a la funcion que construye las tarjetas.
    renderMovies(data.movies);

    // Busca el primer elemento cuyo id es `year`; el HTML actual repite ese id
    // en el <footer> y en el <span>, por lo que normalmente se obtiene el footer.
   
    const yearEl = document.getElementById('year');
    // Comprueba que exista y reemplaza su texto por el ano actual.
    // Si se obtiene el footer, `textContent` borra tambien su contenido interno.
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Espera a que el HTML este completamente construido antes de ejecutar `init`.
document.addEventListener('DOMContentLoaded', init)