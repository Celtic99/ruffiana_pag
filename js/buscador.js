/* =========================================================
   RUFFIANA — BUSCADOR
   Busca desde cualquier página
   y muestra los resultados en colección.html
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchButton =
        document.querySelector(".search-button");

    if (!searchButton) {
        console.warn("No se encontró .search-button");
        return;
    }


    const navLeft =
        searchButton.parentElement;


    let searchContainer = null;
    let searchInput = null;


    /* =====================================================
       CREAR BUSCADOR
    ===================================================== */

    function crearBuscador() {

        if (
            document.querySelector(
                ".ruffiana-search-container"
            )
        ) {
            return;
        }


        searchContainer =
            document.createElement("div");


        searchContainer.className =
            "ruffiana-search-container";


        searchContainer.innerHTML = `

            <input
                type="text"
                class="ruffiana-search-input"
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                autocomplete="off"
            >

            <button
                type="button"
                class="ruffiana-search-close"
                aria-label="Cerrar búsqueda"
            >
                ×
            </button>

        `;


        /*
           IMPORTANTE:
           El buscador aparece DESPUÉS de la lupa.
        */

        navLeft.appendChild(
            searchContainer
        );


        searchInput =
            searchContainer.querySelector(
                ".ruffiana-search-input"
            );


        const closeButton =
            searchContainer.querySelector(
                ".ruffiana-search-close"
            );


        /* =================================================
           ABRIR
        ================================================= */

        searchButton.addEventListener(
            "click",
            () => {

                navLeft.classList.add(
                    "search-open"
                );


                searchContainer.classList.add(
                    "active"
                );


                searchButton.classList.add(
                    "search-hidden"
                );


                setTimeout(
                    () => {

                        searchInput.focus();

                    },
                    150
                );

            }
        );


        /* =================================================
           CERRAR
        ================================================= */

        closeButton.addEventListener(
            "click",
            cerrarBuscador
        );


        /* =================================================
           BUSCAR AL PRESIONAR ENTER
        ================================================= */

        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !== "Enter"
                ) {

                    return;

                }


                const texto =
                    searchInput.value
                        .trim();


                if (!texto) {

                    return;

                }


                /* =========================================
                   GUARDAMOS LA BÚSQUEDA
                ========================================= */

                sessionStorage.setItem(
                    "ruffianaBusqueda",
                    texto
                );


                /* =========================================
                   IR A COLECCIÓN
                ========================================= */

                const estamosEnPages =
                    window.location.pathname.includes(
                        "/pages/"
                    );


                if (estamosEnPages) {

                    window.location.href =
                        "./coleccion.html";

                } else {

                    window.location.href =
                        "./pages/coleccion.html";

                }

            }
        );

    }


    /* =====================================================
       CERRAR BUSCADOR
    ===================================================== */

    function cerrarBuscador() {

        if (!searchContainer) {
            return;
        }


        searchContainer.classList.remove(
            "active"
        );


        searchButton.classList.remove(
            "search-hidden"
        );


        navLeft.classList.remove(
            "search-open"
        );


        searchInput.value = "";

    }


    /* =====================================================
       INICIAR
    ===================================================== */

    crearBuscador();

});