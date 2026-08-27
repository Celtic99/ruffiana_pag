/* =========================================================
RUFFIANA — COLECCIÓN
Categorías + paginación + resultados del buscador
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

const productsGrid =
    document.getElementById("products-grid");

const categoriesContainer =
    document.getElementById("collection-categories");

const paginationContainer =
    document.getElementById("collection-pagination");

const resultsContainer =
    document.getElementById("collection-results");


if (!productsGrid) {
    return;
}


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const PRODUCTOS_POR_PAGINA = 12;

let productosActuales = [];

let categoriaActual = "TODOS";

let paginaActual = 1;


/* =====================================================
   ESPERAR A QUE PRODUCTOS.JS TERMINE
===================================================== */

function esperarProductos() {

    if (
        Array.isArray(window.products) &&
        window.products.length > 0
    ) {

        iniciarColeccion();

        return;

    }


    setTimeout(
        esperarProductos,
        100
    );

}


/* =====================================================
   INICIAR
===================================================== */

function iniciarColeccion() {

    productosActuales =
        [...window.products];


    crearCategorias();


    /* =================================================
       BUSCADOR DESDE URL
    ================================================= */

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const busqueda =
        parametros.get("buscar");


    if (busqueda) {

        aplicarBusqueda(
            busqueda
        );

    } else {

        mostrarPagina();

    }

}


/* =====================================================
   CREAR CATEGORÍAS
===================================================== */

function crearCategorias() {

    if (!categoriesContainer) {
        return;
    }


    const categorias =
        new Set();


    window.products.forEach(
        producto => {

            const categoria =
                String(
                    producto.category || ""
                ).trim();


            if (categoria) {

                categorias.add(
                    categoria
                );

            }

        }
    );


    const categoriasOrdenadas =
        Array.from(
            categorias
        ).sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "es"
                )
        );


    categoriesContainer.innerHTML = "";


    /* =================================================
       TODOS
    ================================================= */

    const botonTodos =
        crearBotonCategoria(
            "TODOS",
            "TODOS"
        );


    botonTodos.classList.add(
        "active"
    );


    categoriesContainer.appendChild(
        botonTodos
    );


    /* =================================================
       CATEGORÍAS
    ================================================= */

    categoriasOrdenadas.forEach(
        categoria => {

            const boton =
                crearBotonCategoria(
                    categoria,
                    categoria
                );


            categoriesContainer.appendChild(
                boton
            );

        }
    );

}


/* =====================================================
   BOTÓN DE CATEGORÍA
===================================================== */

function crearBotonCategoria(
    texto,
    valor
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.type = "button";

    boton.className =
        "collection-category-button";


    boton.textContent =
        texto;


    boton.addEventListener(
        "click",
        () => {

            seleccionarCategoria(
                valor,
                boton
            );

        }
    );


    return boton;

}


/* =====================================================
   SELECCIONAR CATEGORÍA
===================================================== */

function seleccionarCategoria(
    categoria,
    botonActivo
) {

    categoriaActual =
        categoria;


    paginaActual =
        1;


    /* ================================================
       Actualizar botones
    ================================================= */

    document
        .querySelectorAll(
            ".collection-category-button"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "active"
                );

            }
        );


    botonActivo.classList.add(
        "active"
    );


    /* ================================================
       Filtrar
    ================================================= */

    if (
        categoria === "TODOS"
    ) {

        productosActuales =
            [...window.products];

    } else {

        productosActuales =
            window.products.filter(
                producto => {

                    return String(
                        producto.category || ""
                    ).trim() === categoria;

                }
            );

    }


    mostrarPagina();

}


/* =====================================================
   BUSCAR
===================================================== */

function aplicarBusqueda(
    texto
) {

    const busqueda =
        String(texto)
            .trim()
            .toLowerCase();


    if (!busqueda) {

        productosActuales =
            [...window.products];

        mostrarPagina();

        return;

    }


    productosActuales =
        window.products.filter(
            producto => {

                const nombre =
                    String(
                        producto.name || ""
                    ).toLowerCase();


                const categoria =
                    String(
                        producto.category || ""
                    ).toLowerCase();


                const descripcion =
                    String(
                        producto.description || ""
                    ).toLowerCase();


                const variantes =
                    producto.variants || [];


                const coincideVariante =
                    variantes.some(
                        variante => {

                            const color =
                                String(
                                    variante.color || ""
                                ).toLowerCase();


                            const talle =
                                String(
                                    variante.size || ""
                                ).toLowerCase();


                            return (
                                color.includes(
                                    busqueda
                                )
                                ||
                                talle.includes(
                                    busqueda
                                )
                            );

                        }
                    );


                return (
                    nombre.includes(
                        busqueda
                    )
                    ||
                    categoria.includes(
                        busqueda
                    )
                    ||
                    descripcion.includes(
                        busqueda
                    )
                    ||
                    coincideVariante
                );

            }
        );


    categoriaActual =
        "TODOS";


    paginaActual =
        1;


    actualizarCategorias();


    mostrarPagina();

}


/* =====================================================
   ACTUALIZAR CATEGORÍAS
===================================================== */

function actualizarCategorias() {

    if (!categoriesContainer) {
        return;
    }


    categoriesContainer
        .querySelectorAll(
            ".collection-category-button"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "active"
                );


                if (
                    boton.textContent
                        .trim()
                        .toUpperCase()
                    === "TODOS"
                ) {

                    boton.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =====================================================
   MOSTRAR PÁGINA
===================================================== */

function mostrarPagina() {

    const totalProductos =
        productosActuales.length;


    const totalPaginas =
        Math.ceil(
            totalProductos /
            PRODUCTOS_POR_PAGINA
        );


    if (
        paginaActual >
        totalPaginas &&
        totalPaginas > 0
    ) {

        paginaActual =
            totalPaginas;

    }


    const inicio =
        (
            paginaActual - 1
        ) *
        PRODUCTOS_POR_PAGINA;


    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;


    const productosPagina =
        productosActuales.slice(
            inicio,
            fin
        );


    /* =================================================
       MOSTRAR PRODUCTOS
    ================================================= */

    if (
        typeof window.mostrarProductos
        === "function"
    ) {

        window.mostrarProductos(
            productosPagina
        );

    }


    /* =================================================
       RESULTADOS
    ================================================= */

    actualizarTextoResultados(
        totalProductos
    );


    /* =================================================
       PAGINACIÓN
    ================================================= */

    crearPaginacion(
        totalPaginas
    );

}


/* =====================================================
   TEXTO DE RESULTADOS
===================================================== */

function actualizarTextoResultados(
    cantidad
) {

    if (!resultsContainer) {
        return;
    }


    if (cantidad === 0) {

        resultsContainer.textContent =
            "No encontramos productos.";

        return;

    }

}


/* =====================================================
   PAGINACIÓN
===================================================== */

function crearPaginacion(
    totalPaginas
) {

    if (!paginationContainer) {
        return;
    }


    paginationContainer.innerHTML = "";


    if (
        totalPaginas <= 1
    ) {

        return;

    }


    /* =================================================
       ANTERIOR
    ================================================= */

    const anterior =
        crearBotonPagina(
            "‹",
            paginaActual > 1
        );


    if (
        paginaActual > 1
    ) {

        anterior.addEventListener(
            "click",
            () => {

                paginaActual--;

                mostrarPagina();

                desplazarseArriba();

            }
        );

    }


    paginationContainer.appendChild(
        anterior
    );


    /* =================================================
       NÚMEROS
    ================================================= */

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const boton =
            crearBotonPagina(
                pagina,
                true
            );


        if (
            pagina === paginaActual
        ) {

            boton.classList.add(
                "active"
            );

        }


        boton.addEventListener(
            "click",
            () => {

                paginaActual =
                    pagina;


                mostrarPagina();

                desplazarseArriba();

            }
        );


        paginationContainer.appendChild(
            boton
        );

    }


    /* =================================================
       SIGUIENTE
    ================================================= */

    const siguiente =
        crearBotonPagina(
            "›",
            paginaActual < totalPaginas
        );


    if (
        paginaActual < totalPaginas
    ) {

        siguiente.addEventListener(
            "click",
            () => {

                paginaActual++;

                mostrarPagina();

                desplazarseArriba();

            }
        );

    }


    paginationContainer.appendChild(
        siguiente
    );

}


/* =====================================================
   CREAR BOTÓN
===================================================== */

function crearBotonPagina(
    texto,
    habilitado
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.type = "button";

    boton.className =
        "collection-page-button";


    boton.textContent =
        texto;


    if (!habilitado) {

        boton.classList.add(
            "disabled"
        );

        boton.disabled =
            true;

    }


    return boton;

}


/* =====================================================
   VOLVER ARRIBA
===================================================== */

function desplazarseArriba() {

    const collection =
        document.querySelector(
            ".collection"
        );


    if (!collection) {
        return;
    }


    collection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================================
   INICIAR
===================================================== */

esperarProductos();


});
