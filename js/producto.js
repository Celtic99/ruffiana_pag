/* =========================================================
   RUFFIANA — PRODUCTO INDIVIDUAL
   Google Sheets + Variantes + Carrito
========================================================= */


/* =========================================================
   1. GOOGLE SHEETS
========================================================= */

const GOOGLE_SHEETS_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7_lNtXTgezW5_wkaeCw-ldncnFhgAuxzFokw4yET6R_TTyfIo4QBW9L167Snqq3pitUdLHGlO6Phv/pub?gid=1517502785&single=true&output=csv";


/* =========================================================
   2. CONTENEDOR
========================================================= */

const productContainer =
    document.getElementById(
        "product-detail-container"
    );


/* =========================================================
   3. OBTENER ID DE LA URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


console.log(
    "ID RECIBIDO:",
    productId
);


/* =========================================================
   4. CONVERTIR CSV
========================================================= */

function convertirCSV(csv) {

    const filas = [];

    let fila = [];
    let valor = "";
    let dentroDeComillas = false;


    for (
        let i = 0;
        i < csv.length;
        i++
    ) {

        const caracter = csv[i];


        /* COMILLAS */

        if (caracter === '"') {

            if (
                dentroDeComillas &&
                csv[i + 1] === '"'
            ) {

                valor += '"';
                i++;

            } else {

                dentroDeComillas =
                    !dentroDeComillas;

            }

        }


        /* COMA */

        else if (
            caracter === "," &&
            !dentroDeComillas
        ) {

            fila.push(valor);

            valor = "";

        }


        /* FIN DE FILA */

        else if (
            (
                caracter === "\n" ||
                caracter === "\r"
            ) &&
            !dentroDeComillas
        ) {

            if (
                caracter === "\r" &&
                csv[i + 1] === "\n"
            ) {

                i++;

            }


            fila.push(valor);

            filas.push(fila);

            fila = [];

            valor = "";

        }


        /* TEXTO */

        else {

            valor += caracter;

        }

    }


    /* ÚLTIMA FILA */

    if (
        valor !== "" ||
        fila.length > 0
    ) {

        fila.push(valor);

        filas.push(fila);

    }


    if (filas.length === 0) {

        return [];

    }


    /* ENCABEZADOS */

    const encabezados =
        filas
            .shift()
            .map(
                encabezado =>
                    encabezado
                        .trim()
                        .replace(/^\uFEFF/, "")
            );


    /* OBJETOS */

    return filas.map(fila => {

        const producto = {};


        encabezados.forEach(
            (encabezado, index) => {

                producto[encabezado] =
                    fila[index]
                        ?.trim() || "";

            }
        );


        return producto;

    });

}


/* =========================================================
   5. CONVERTIR PRECIO
========================================================= */

function convertirPrecio(valor) {

    const precioTexto =
        String(valor ?? "0")
            .trim()
            .replace("$", "")
            .replace(/\./g, "")
            .replace(",", ".");


    return Number(precioTexto) || 0;

}


/* =========================================================
   6. OBTENER DATOS DE GOOGLE SHEETS
========================================================= */

async function cargarProducto() {

    try {

        console.log(
            "Cargando producto..."
        );


        const response =
            await fetch(
                GOOGLE_SHEETS_URL
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }


        const csv =
            await response.text();


        const datos =
            convertirCSV(csv);


        console.log(
            "DATOS DE GOOGLE SHEETS:"
        );

        console.table(datos);


        /* =================================================
           BUSCAR EL PRODUCTO
           
           productos.js manda:
           
           producto-NOMBRE
           
           Por eso primero buscamos por nombre.
        ================================================= */

        let nombreBuscado = "";


        if (
            productId &&
            productId.startsWith(
                "producto-"
            )
        ) {

            nombreBuscado =
                decodeURIComponent(
                    productId.replace(
                        "producto-",
                        ""
                    )
                );

        }


        console.log(
            "NOMBRE BUSCADO:",
            nombreBuscado
        );


        /* =================================================
           BUSCAR TODAS LAS VARIANTES
        ================================================= */

        let variantes =
            datos.filter(producto => {

                const nombre =
                    String(
                        producto["Nombre"] || ""
                    ).trim();


                return (
                    nombre ===
                    nombreBuscado
                );

            });


        /* =================================================
           COMPATIBILIDAD
           
           Por si alguna página vieja todavía
           manda directamente el Código.
        ================================================= */

        if (
            variantes.length === 0
        ) {

            variantes =
                datos.filter(producto => {

                    return (
                        String(
                            producto["Código"] || ""
                        ).trim() ===
                        String(
                            productId
                        ).trim()
                    );

                });

        }


        /* =================================================
           SI NO EXISTE
        ================================================= */

        if (
            variantes.length === 0
        ) {

            console.error(
                "No se encontraron variantes."
            );


            mostrarProductoNoEncontrado();

            return;

        }


        console.log(
            "VARIANTES ENCONTRADAS:"
        );

        console.table(
            variantes
        );


        /* =================================================
           MOSTRAR PRODUCTO
        ================================================= */

        mostrarProducto(
            variantes
        );


    } catch (error) {

        console.error(
            "Error cargando producto:",
            error
        );

    }

}


/* =========================================================
   7. MOSTRAR PRODUCTO
========================================================= */

function mostrarProducto(
    variantes
) {


    /* =====================================================
       PRODUCTO PRINCIPAL
    ===================================================== */

    const primeraVariante =
        variantes[0];


    const nombre =
        primeraVariante["Nombre"] || "";


    const category =
        primeraVariante["Categoría"] || "";


    const description =
        primeraVariante["Descripción"] || "";


    /* =====================================================
       COLORES DISPONIBLES
    ===================================================== */

    const colores = [
        ...new Set(
            variantes
                .map(
                    variante =>
                        String(
                            variante["Color"] || ""
                        ).trim()
                )
                .filter(Boolean)
        )
    ];


    /* =====================================================
       TALLES DISPONIBLES
    ===================================================== */

    const talles = [
        ...new Set(
            variantes
                .map(
                    variante =>
                        String(
                            variante["Talle"] || ""
                        ).trim()
                )
                .filter(Boolean)
        )
    ];


    /* =====================================================
       VARIANTE INICIAL
    ===================================================== */

    let varianteSeleccionada =
        variantes.find(
            variante =>
                Number(
                    String(
                        variante["Stock"] || "0"
                    ).trim()
                ) > 0
        ) ||
        variantes[0];


    /* =====================================================
       IMÁGENES
    ===================================================== */

    function obtenerImagenes(
        variante
    ) {

        return [

            variante["Imagen"],

            variante["Imagen2"],

            variante["Imagen3"],

            variante["Imagen4"]

        ].filter(
            imagen =>
                imagen &&
                imagen.trim() !== ""
        );

    }


    /* =====================================================
       IMÁGENES INICIALES
    ===================================================== */

    let imagenes =
        obtenerImagenes(
            varianteSeleccionada
        );


    let imagenPrincipal =
        imagenes[0] || "";


    /* =====================================================
       MINIATURAS
    ===================================================== */

    function generarMiniaturas(
        imagenesActuales
    ) {

        return imagenesActuales
            .map(
                (imagen, index) => {

                    return `

                        <button
                            type="button"
                            class="product-thumbnail"
                            data-image="${imagen}"
                        >

                            <img
                                src="${imagen}"
                                alt="${nombre} - imagen ${index + 1}"
                            >

                        </button>

                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       PRECIO
    ===================================================== */

    const precioInicial =
        convertirPrecio(
            varianteSeleccionada["Precio"]
        );


    /* =====================================================
       STOCK
    ===================================================== */

    const stockInicial =
        Number(
            varianteSeleccionada["Stock"] || "0"
        );


    /* =====================================================
       OPCIONES DE COLOR
    ===================================================== */

    let coloresHTML = "";


    if (
        colores.length > 0
    ) {

        coloresHTML = `

            <div class="product-variant-selector">

                <p class="product-detail-color">
                    Color:
                    <strong id="selected-color">
                        ${varianteSeleccionada["Color"] || ""}
                    </strong>
                </p>


                <div class="product-color-options">

                    ${
                        colores
                            .map(
                                color => {

                                    const activo =
                                        String(
                                            varianteSeleccionada["Color"] || ""
                                        ) ===
                                        String(color);


                                    return `

                                        <button
                                            type="button"
                                            class="product-color-option ${
                                                activo
                                                    ? "active"
                                                    : ""
                                            }"
                                            data-color="${color}"
                                        >
                                            ${color}
                                        </button>

                                    `;

                                }
                            )
                            .join("")
                    }

                </div>

            </div>

        `;

    }


    /* =====================================================
       OPCIONES DE TALLE
    ===================================================== */

    let tallesHTML = "";


    if (
        talles.length > 0
    ) {

        tallesHTML = `

            <div class="product-variant-selector">

                <p class="product-detail-size">
                    Talle:
                    <strong id="selected-size">
                        ${varianteSeleccionada["Talle"] || ""}
                    </strong>
                </p>


                <div class="product-size-options">

                    ${
                        talles
                            .map(
                                talle => {

                                    const activo =
                                        String(
                                            varianteSeleccionada["Talle"] || ""
                                        ) ===
                                        String(talle);


                                    return `

                                        <button
                                            type="button"
                                            class="product-size-option ${
                                                activo
                                                    ? "active"
                                                    : ""
                                            }"
                                            data-size="${talle}"
                                        >
                                            ${talle}
                                        </button>

                                    `;

                                }
                            )
                            .join("")
                    }

                </div>

            </div>

        `;

    }


    /* =====================================================
       BOTÓN
    ===================================================== */

    let botonHTML;


    if (
        isNaN(stockInicial) ||
        stockInicial <= 0
    ) {

        botonHTML = `

            <button
                type="button"
                class="product-add-button disabled"
                id="add-product-button"
                disabled
            >
                SIN STOCK
            </button>

        `;

    } else {

        botonHTML = `

            <button
                type="button"
                class="product-add-button"
                id="add-product-button"
            >
                AGREGAR AL CARRITO
            </button>

        `;

    }


    /* =====================================================
       HTML
    ===================================================== */

    productContainer.innerHTML = `

        <div class="product-gallery">


            <div
                class="product-thumbnails"
                id="product-thumbnails"
            >

                ${generarMiniaturas(imagenes)}

            </div>


            <div class="product-main-image">

                <img
                    id="main-product-image"
                    src="${imagenPrincipal}"
                    alt="${nombre}"
                >

            </div>


        </div>


        <div class="product-detail-info">


            <a
                href="./coleccion.html"
                class="back-to-collection"
            >
                ← VOLVER A COLECCIÓN
            </a>


            <h1>
                ${nombre}
            </h1>


            ${coloresHTML}


            ${tallesHTML}


            <p
                class="product-detail-price"
                id="product-detail-price"
            >
                ${formatPrice(precioInicial)}
            </p>


            ${
                description
                    ? `
                        <div class="product-description">

                            <h2>
                                DESCRIPCIÓN
                            </h2>

                            <p>
                                ${description}
                            </p>

                        </div>
                    `
                    : ""
            }


            <p
                class="product-stock"
                id="product-stock"
            >

                ${
                    stockInicial > 0
                        ? `Stock disponible: ${stockInicial}`
                        : "Sin stock"
                }

            </p>


            ${botonHTML}


        </div>

    `;


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const mainImage =
        document.getElementById(
            "main-product-image"
        );


    const thumbnailsContainer =
        document.getElementById(
            "product-thumbnails"
        );


    const priceElement =
        document.getElementById(
            "product-detail-price"
        );


    const stockElement =
        document.getElementById(
            "product-stock"
        );


    const addButton =
        document.getElementById(
            "add-product-button"
        );


    /* =====================================================
       ACTUALIZAR GALERÍA
    ===================================================== */

    function actualizarGaleria(
        variante
    ) {

        const nuevasImagenes =
            obtenerImagenes(
                variante
            );


        if (
            nuevasImagenes.length === 0
        ) {

            return;

        }


        imagenes =
            nuevasImagenes;


        imagenPrincipal =
            imagenes[0];


        if (mainImage) {

            mainImage.src =
                imagenPrincipal;

        }


        if (thumbnailsContainer) {

            thumbnailsContainer.innerHTML =
                generarMiniaturas(
                    imagenes
                );


            agregarEventosMiniaturas();

        }

    }


    /* =====================================================
       EVENTOS DE MINIATURAS
    ===================================================== */

    function agregarEventosMiniaturas() {

        const thumbnailButtons =
            document.querySelectorAll(
                ".product-thumbnail"
            );


        thumbnailButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (mainImage) {

                            mainImage.src =
                                button.dataset.image;

                        }

                    }
                );

            }
        );

    }


    agregarEventosMiniaturas();


    /* =====================================================
       BUSCAR VARIANTE
    ===================================================== */

    function buscarVariante() {

        const colorActivo =
            document.querySelector(
                ".product-color-option.active"
            );


        const talleActivo =
            document.querySelector(
                ".product-size-option.active"
            );


        const colorSeleccionado =
            colorActivo
                ? colorActivo.dataset.color
                : "";


        const talleSeleccionado =
            talleActivo
                ? talleActivo.dataset.size
                : "";


        console.log(
            "Buscando variante:",
            {
                color:
                    colorSeleccionado,

                talle:
                    talleSeleccionado
            }
        );


        let encontrada;


        /* =================================================
           SI HAY COLOR Y TALLE
        ================================================= */

        if (
            colorSeleccionado &&
            talleSeleccionado
        ) {

            encontrada =
                variantes.find(
                    variante => {

                        return (

                            String(
                                variante["Color"] || ""
                            ).trim() ===
                            String(
                                colorSeleccionado
                            ).trim()

                            &&

                            String(
                                variante["Talle"] || ""
                            ).trim() ===
                            String(
                                talleSeleccionado
                            ).trim()

                        );

                    }
                );

        }


        /* =================================================
           SOLO COLOR
        ================================================= */

        else if (
            colorSeleccionado
        ) {

            encontrada =
                variantes.find(
                    variante => {

                        return (
                            String(
                                variante["Color"] || ""
                            ).trim() ===
                            String(
                                colorSeleccionado
                            ).trim()
                        );

                    }
                );

        }


        /* =================================================
           SOLO TALLE
        ================================================= */

        else if (
            talleSeleccionado
        ) {

            encontrada =
                variantes.find(
                    variante => {

                        return (
                            String(
                                variante["Talle"] || ""
                            ).trim() ===
                            String(
                                talleSeleccionado
                            ).trim()
                        );

                    }
                );

        }


        if (!encontrada) {

            console.warn(
                "No existe esta combinación de variante."
            );

            if (addButton) {

                addButton.disabled =
                    true;

                addButton.classList.add(
                    "disabled"
                );

                addButton.textContent =
                    "SIN STOCK";

            }

            return;

        }


        /* =================================================
           GUARDAR VARIANTE
        ================================================= */

        varianteSeleccionada =
            encontrada;


        const precio =
            convertirPrecio(
                encontrada["Precio"]
            );


        const stock =
            Number(
                encontrada["Stock"] || "0"
            );


        /* =================================================
           ACTUALIZAR PRECIO
        ================================================= */

        if (priceElement) {

            priceElement.textContent =
                formatPrice(
                    precio
                );

        }


        /* =================================================
           ACTUALIZAR STOCK
        ================================================= */

        if (stockElement) {

            stockElement.textContent =
                stock > 0
                    ? `Stock disponible: ${stock}`
                    : "Sin stock";

        }


        /* =================================================
           ACTUALIZAR IMAGEN
        ================================================= */

        actualizarGaleria(
            encontrada
        );


        /* =================================================
           ACTUALIZAR BOTÓN
        ================================================= */

        if (addButton) {

            if (stock > 0) {

                addButton.disabled =
                    false;

                addButton.classList.remove(
                    "disabled"
                );

                addButton.textContent =
                    "AGREGAR AL CARRITO";

            } else {

                addButton.disabled =
                    true;

                addButton.classList.add(
                    "disabled"
                );

                addButton.textContent =
                    "SIN STOCK";

            }

        }


        /* =================================================
           ACTUALIZAR TEXTOS
        ================================================= */

        const selectedColor =
            document.getElementById(
                "selected-color"
            );


        const selectedSize =
            document.getElementById(
                "selected-size"
            );


        if (selectedColor) {

            selectedColor.textContent =
                encontrada["Color"] || "";

        }


        if (selectedSize) {

            selectedSize.textContent =
                encontrada["Talle"] || "";

        }


        console.log(
            "VARIANTE SELECCIONADA:",
            encontrada
        );

    }


    /* =====================================================
       EVENTOS COLOR
    ===================================================== */

    const colorButtons =
        document.querySelectorAll(
            ".product-color-option"
        );


    colorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    colorButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    buscarVariante();

                }
            );

        }
    );


    /* =====================================================
       EVENTOS TALLE
    ===================================================== */

    const sizeButtons =
        document.querySelectorAll(
            ".product-size-option"
        );


    sizeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    sizeButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    buscarVariante();

                }
            );

        }
    );


    /* =====================================================
       AGREGAR AL CARRITO
    ===================================================== */

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {


                /* =========================================
                   VARIANTE ACTUAL
                ========================================= */

                const variante =
                    varianteSeleccionada;


                const stock =
                    Number(
                        variante["Stock"] || "0"
                    );


                if (
                    stock <= 0
                ) {

                    alert(
                        "Este producto no tiene stock disponible."
                    );

                    return;

                }


                /* =========================================
                   PRODUCTO PARA CARRITO
                ========================================= */

                const productoParaCarrito = {

                    id:
                        variante["Código"],

                    name:
                        nombre,

                    price:
                        convertirPrecio(
                            variante["Precio"]
                        ),

                    color:
                        variante["Color"] || "",

                    size:
                        variante["Talle"] || "",

                    category:
                        category,

                    image:
                        variante["Imagen"] ||
                        imagenPrincipal,

                    stock:
                        stock,

                    description:
                        description

                };


                /* =========================================
                   LEER CARRITO
                ========================================= */

                let carrito =
                    JSON.parse(
                        localStorage.getItem(
                            "ruffianaCart"
                        )
                    ) || [];


                /* =========================================
                   BUSCAR MISMA VARIANTE
                   
                   IMPORTANTE:
                   Se compara por Código de Odoo.
                   
                   Por eso:
                   
                   Negro M
                   Blanco M
                   Blanco XL
                   
                   son productos diferentes
                   dentro del carrito.
                ========================================= */

                const existente =
                    carrito.find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                productoParaCarrito.id
                            )
                    );


                /* =========================================
                   YA EXISTE
                ========================================= */

                if (existente) {

                    if (
                        Number(
                            existente.quantity
                        ) <
                        stock
                    ) {

                        existente.quantity +=
                            1;

                    } else {

                        alert(
                            "No hay más stock disponible."
                        );

                        return;

                    }

                }


                /* =========================================
                   NUEVA VARIANTE
                ========================================= */

                else {

                    carrito.push({

                        ...productoParaCarrito,

                        quantity:
                            1

                    });

                }


                /* =========================================
                   GUARDAR
                ========================================= */

                localStorage.setItem(
                    "ruffianaCart",
                    JSON.stringify(
                        carrito
                    )
                );


                /* =========================================
                   ACTUALIZAR CONTADOR
                ========================================= */

                if (
                    typeof updateCartCounter ===
                    "function"
                ) {

                    updateCartCounter();

                }


                alert(
                    "¡Producto agregado al carrito! 🤎"
                );


                console.log(
                    "CARRITO ACTUAL:",
                    carrito
                );

            }
        );

    }

}


/* =========================================================
   8. PRODUCTO NO ENCONTRADO
========================================================= */

function mostrarProductoNoEncontrado() {

    productContainer.innerHTML = `

        <div class="product-not-found">

            <h1>
                Producto no encontrado
            </h1>


            <p>
                Este producto ya no está disponible.
            </p>


            <a
                href="./coleccion.html"
            >
                VOLVER A COLECCIÓN
            </a>

        </div>

    `;

}


/* =========================================================
   9. FORMATO DE PRECIO
========================================================= */

function formatPrice(price) {

    return Number(price).toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    );

}


/* =========================================================
   10. INICIAR
========================================================= */

if (productContainer) {

    cargarProducto();

}