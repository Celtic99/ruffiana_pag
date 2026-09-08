/* =========================================================
   RUFFIANA — SALE
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
       CLICK EN PRODUCTO
    ===================================================== */

    productsGrid.addEventListener("click", event => {

        const imagen = event.target.closest(
            ".product-image[data-product-id]"
        );

        if (!imagen) return;

        const productId =
            imagen.dataset.productId;

        if (!productId) return;

        window.location.href =
            `./producto.html?id=${encodeURIComponent(productId)}`;

    });


    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const PRODUCTOS_POR_PAGINA = 12;

    let productosActuales = [];

    let categoriaActual = "TODOS";

    let paginaActual = 1;


    /* =====================================================
       LEER CATEGORÍA DESDE LA URL
       
       Ejemplo:
       saleoff.html?categoria=SWEATERS
    ===================================================== */

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const categoriaURL =
        parametros.get("categoria");


    /* =====================================================
       NORMALIZAR CATEGORÍA
    ===================================================== */

function normalizarCategoria(
    categoria
) {

    return String(
        categoria || ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

}


    /* =====================================================
       ESPERAR A QUE PRODUCTOSSALEOFF.JS TERMINE
    ===================================================== */

    function esperarProductosSale() {

        if (
            Array.isArray(window.saleProducts) &&
            window.saleProducts.length > 0
        ) {

            iniciarSale();

            return;

        }


        setTimeout(
            esperarProductosSale,
            100
        );

    }


    /* =====================================================
       INICIAR
    ===================================================== */

    function iniciarSale() {

        crearCategorias();


        /* =================================================
           SI VIENE UNA CATEGORÍA DESDE LA URL
        ================================================= */

        if (categoriaURL) {

const categoriaURLNormalizada =
    normalizarCategoria(
        categoriaURL
    );


const categoriaEncontrada =
    window.saleProducts.find(
        producto => {

            const categoriaProducto =
                normalizarCategoria(
                    producto.category
                );


            return (
                categoriaProducto ===
                categoriaURLNormalizada

                ||

                categoriaProducto ===
                categoriaURLNormalizada.replace(
                    /s$/,
                    ""
                )

                ||

                categoriaProducto + "s" ===
                categoriaURLNormalizada

            );

        }
    );


            /* =============================================
               SI LA CATEGORÍA EXISTE
            ============================================= */

            if (categoriaEncontrada) {

                categoriaActual =
                    String(
                        categoriaEncontrada.category
                    ).trim();


                productosActuales =
                    window.saleProducts.filter(
                        producto => {

                            return (
                                normalizarCategoria(
                                    producto.category
                                ) ===
                                normalizarCategoria(
                                    categoriaActual
                                )
                            );

                        }
                    );


                paginaActual = 1;


                activarBotonCategoria(
                    categoriaActual
                );


                mostrarPagina();

                return;

            }

        }


        /* =================================================
           SI NO HAY CATEGORÍA → MOSTRAR TODO
        ================================================= */

        categoriaActual =
            "TODOS";


        productosActuales =
            [...window.saleProducts];


        paginaActual = 1;


        activarBotonCategoria(
            "TODOS"
        );


        mostrarPagina();

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


        window.saleProducts.forEach(
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


        boton.dataset.category =
            valor;


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
       ACTIVAR BOTÓN DE CATEGORÍA
    ===================================================== */

    function activarBotonCategoria(
        categoria
    ) {

        if (!categoriesContainer) {
            return;
        }


        const categoriaNormalizada =
            normalizarCategoria(
                categoria
            );


        categoriesContainer
            .querySelectorAll(
                ".collection-category-button"
            )
            .forEach(
                boton => {

                    const valorBoton =
                        normalizarCategoria(
                            boton.dataset.category ||
                            boton.textContent
                        );


                    boton.classList.toggle(
                        "active",
                        valorBoton ===
                        categoriaNormalizada
                    );

                }
            );

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
            normalizarCategoria(
                categoria
            ) ===
            "todos"
        ) {

            productosActuales =
                [...window.saleProducts];

        } else {

            productosActuales =
                window.saleProducts.filter(
                    producto => {

                        return (
                            normalizarCategoria(
                                producto.category
                            ) ===
                            normalizarCategoria(
                                categoria
                            )
                        );

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


        /* =================================================
           SI SE BORRA LA BÚSQUEDA
        ================================================= */

        if (!busqueda) {

            /*
             * Si estamos en una categoría específica,
             * mantenemos esa categoría.
             */

            if (
                normalizarCategoria(
                    categoriaActual
                ) !== "todos"
            ) {

                productosActuales =
                    window.saleProducts.filter(
                        producto => {

                            return (
                                normalizarCategoria(
                                    producto.category
                                ) ===
                                normalizarCategoria(
                                    categoriaActual
                                )
                            );

                        }
                    );

            } else {

                productosActuales =
                    [...window.saleProducts];

            }


            paginaActual =
                1;


            activarBotonCategoria(
                categoriaActual
            );


            mostrarPagina();

            return;

        }


        /* =================================================
           BUSCAR DENTRO DE LA CATEGORÍA ACTUAL
        ================================================= */

        let productosBase;


        if (
            normalizarCategoria(
                categoriaActual
            ) !== "todos"
        ) {

            productosBase =
                window.saleProducts.filter(
                    producto => {

                        return (
                            normalizarCategoria(
                                producto.category
                            ) ===
                            normalizarCategoria(
                                categoriaActual
                            )
                        );

                    }
                );

        } else {

            productosBase =
                [...window.saleProducts];

        }


        productosActuales =
            productosBase.filter(
                producto => {

                    /* ==============================
                       NOMBRE
                    ============================== */

                    const nombre =
                        String(
                            producto.name || ""
                        ).toLowerCase();


                    /* ==============================
                       CATEGORÍA
                    ============================== */

                    const categoria =
                        String(
                            producto.category || ""
                        ).toLowerCase();


                    /* ==============================
                       DESCRIPCIÓN
                    ============================== */

                    const descripcion =
                        String(
                            producto.description || ""
                        ).toLowerCase();


                    /* ==============================
                       VARIANTES
                    ============================== */

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


                    /* ==============================
                       RESULTADO
                    ============================== */

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


        paginaActual =
            1;


        mostrarPagina();

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
           MOSTRAR PRODUCTOS SALE
        ================================================= */

        mostrarProductosSale(
            productosPagina
        );


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
       MOSTRAR PRODUCTOS SALE
    ===================================================== */

    function mostrarProductosSale(
        productos
    ) {

        productsGrid.innerHTML = "";


        productos.forEach(
            producto => {


                /* =================================================
                   VARIANTES
                ================================================= */

                const variantes =
                    producto.variants || [];


                /* =================================================
                   STOCK TOTAL
                ================================================= */

                const stockTotal =
                    variantes.reduce(
                        (
                            total,
                            variante
                        ) => {

                            return total +
                                Number(
                                    variante.stock
                                );

                        },
                        0
                    );


                /* =================================================
                   PRECIOS SALE
                ================================================= */

                const preciosSale =
                    variantes
                        .map(
                            variante =>
                                Number(
                                    variante.salePrice ??
                                    variante.price
                                )
                        )
                        .filter(
                            precio =>
                                precio > 0
                        );


                const preciosOriginales =
                    variantes
                        .map(
                            variante =>
                                Number(
                                    variante.originalPrice
                                )
                        )
                        .filter(
                            precio =>
                                precio > 0
                        );


                let precioSaleHTML = "";

                let precioOriginalHTML = "";


                /* =================================================
                   PRECIO SALE
                ================================================= */

                if (
                    preciosSale.length > 0
                ) {

                    const precioMin =
                        Math.min(
                            ...preciosSale
                        );


                    const precioMax =
                        Math.max(
                            ...preciosSale
                        );


                    if (
                        precioMin !==
                        precioMax
                    ) {

                        precioSaleHTML =
                            `${formatPriceSale(precioMin)} - ${formatPriceSale(precioMax)}`;

                    } else {

                        precioSaleHTML =
                            formatPriceSale(
                                precioMin
                            );

                    }

                }


                /* =================================================
                   PRECIO ORIGINAL
                ================================================= */

                if (
                    preciosOriginales.length > 0
                ) {

                    const precioMinOriginal =
                        Math.min(
                            ...preciosOriginales
                        );


                    const precioMaxOriginal =
                        Math.max(
                            ...preciosOriginales
                        );


                    if (
                        precioMinOriginal !==
                        precioMaxOriginal
                    ) {

                        precioOriginalHTML =
                            `${formatPriceSale(precioMinOriginal)} - ${formatPriceSale(precioMaxOriginal)}`;

                    } else {

                        precioOriginalHTML =
                            formatPriceSale(
                                precioMinOriginal
                            );

                    }

                }


                /* =================================================
                   DESCUENTO
                ================================================= */

                let descuento = 0;


                if (
                    producto.discount
                ) {

                    descuento =
                        producto.discount;

                } else if (
                    producto.originalPrice > 0 &&
                    producto.salePrice > 0 &&
                    producto.salePrice <
                    producto.originalPrice
                ) {

                    descuento =
                        Math.round(
                            (
                                1 -
                                producto.salePrice /
                                producto.originalPrice
                            ) * 100
                        );

                }


                /* =================================================
                   BOTÓN
                ================================================= */

                let botonHTML;


                if (
                    stockTotal <= 0
                ) {

                    botonHTML = `

                        <button
                            type="button"
                            class="add-to-cart disabled"
                            disabled
                        >
                            SIN STOCK
                        </button>

                    `;

                } else {

                    botonHTML = `

                        <button
                            type="button"
                            class="add-to-cart"
                            data-product-id="${producto.id}"
                        >
                            VER PRODUCTO
                        </button>

                    `;

                }


                /* =================================================
                   TARJETA
                ================================================= */

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "product-card";


                article.innerHTML = `

                    <div
                        class="product-image"
                        data-product-id="${producto.id}"
                    >

                        ${
                            descuento > 0
                                ? `
                                    <span class="sale-badge">
                                        ${descuento}% OFF
                                    </span>
                                `
                                : ""
                        }


                        <img
                            src="${producto.image}"
                            alt="${producto.name}"
                            loading="lazy"
                        >

                    </div>


                    <div class="product-info">

                        <h3>
                            ${producto.name}
                        </h3>


                        ${
                            variantes.length > 1
                                ? `
                                    <p class="product-variants">
                                        ${variantes.length} variantes
                                    </p>
                                `
                                : ""
                        }


                        ${
                            precioOriginalHTML
                                ? `
                                    <p class="product-price-original">
                                        ${precioOriginalHTML}
                                    </p>
                                `
                                : ""
                        }


                        <p class="product-price sale-price">
                            ${precioSaleHTML}
                        </p>


                        ${
                            producto.description
                                ? `
                                    <p class="product-description">
                                        ${producto.description}
                                    </p>
                                `
                                : ""
                        }


                        ${botonHTML}

                    </div>

                `;


                productsGrid.appendChild(
                    article
                );

            }
        );

    }


    /* =====================================================
       FORMATO DE PRECIO
    ===================================================== */

    function formatPriceSale(
        price
    ) {

        return Number(
            price
        ).toLocaleString(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0
            }
        );

    }


    /* =====================================================
       RESULTADOS
    ===================================================== */

    function actualizarTextoResultados(
        cantidad
    ) {

        if (!resultsContainer) {
            return;
        }


        if (
            cantidad === 0
        ) {

            resultsContainer.textContent =
                "No encontramos productos.";

            return;

        }


        resultsContainer.textContent =
            `${cantidad} productos`;

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


        if (
            !habilitado
        ) {

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
       BUSCADOR
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                "ruffianaBusqueda"
            ) {

                aplicarBusqueda(
                    event.newValue || ""
                );

            }

        }
    );


    /* =====================================================
       INICIAR
    ===================================================== */

    esperarProductosSale();

});

