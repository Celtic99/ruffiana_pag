/* =========================================================
   RUFFIANA — PRODUCTOS
   Google Sheets + Variantes + Producto individual
   Mantiene las clases originales del CSS
========================================================= */


/* =========================================================
   1. GOOGLE SHEETS
========================================================= */

const GOOGLE_SHEETS_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7_lNtXTgezW5_wkaeCw-ldncnFhgAuxzFokw4yET6R_TTyfIo4QBW9L167Snqq3pitUdLHGlO6Phv/pub?gid=1517502785&single=true&output=csv";


/* =========================================================
   2. CONTENEDORES
========================================================= */

const productsContainer =
    document.getElementById("products-container");

const productsGrid =
    document.getElementById("products-grid");


/* =========================================================
   3. PRODUCTOS
========================================================= */

window.products = [];


/* =========================================================
   4. CONVERTIR CSV
========================================================= */

function convertirCSV(csv) {

    const filas = [];

    let fila = [];
    let valor = "";
    let dentroDeComillas = false;


    for (let i = 0; i < csv.length; i++) {

        const caracter = csv[i];


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

        else if (
            caracter === "," &&
            !dentroDeComillas
        ) {

            fila.push(valor);
            valor = "";

        }

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

        else {

            valor += caracter;

        }

    }


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


    const encabezados =
        filas
            .shift()
            .map(
                encabezado =>
                    encabezado
                        .trim()
                        .replace(/^\uFEFF/, "")
            );


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
   6. PREPARAR PRODUCTOS
   Agrupa las variantes por NOMBRE
========================================================= */

function prepararProductos(datos) {

    const datosLimpios =
        datos.filter(producto => {

            return (
                producto["Código"] ||
                producto["Nombre"]
            );

        });


    const productosAgrupados =
        new Map();


    datosLimpios.forEach(
        (producto, index) => {

            const codigo =
                String(
                    producto["Código"] ||
                    `variante-${index + 1}`
                ).trim();


            const nombre =
                String(
                    producto["Nombre"] || ""
                ).trim();


            const color =
                String(
                    producto["Color"] || ""
                ).trim();


            const size =
                String(
                    producto["Talle"] || ""
                ).trim();


            const stock =
                Number(
                    String(
                        producto["Stock"] ?? ""
                    ).trim()
                ) || 0;


            const price =
                convertirPrecio(
                    producto["Precio"]
                );


            const image =
                String(
                    producto["Imagen"] || ""
                ).trim();


            const category =
                String(
                    producto["Categoría"] || ""
                ).trim();


            const description =
                String(
                    producto["Descripción"] || ""
                ).trim();


            if (!nombre) {

                return;

            }


            /* =============================================
               BUSCAR PRODUCTO POR NOMBRE
            ============================================= */

            let productoBase =
                productosAgrupados.get(nombre);


            /* =============================================
               CREAR PRODUCTO BASE
            ============================================= */

            if (!productoBase) {

                productoBase = {

                    /*
                       IMPORTANTE:
                       El ID representa al producto agrupado.
                    */

                    id:
                        `producto-${nombre}`,

                    name:
                        nombre,

                    category:
                        category,

                    description:
                        description,

                    image:
                        image,

                    price:
                        price,

                    variants: []

                };


                productosAgrupados.set(
                    nombre,
                    productoBase
                );

            }


            /* =============================================
               AGREGAR VARIANTE
            ============================================= */

            productoBase.variants.push({

                code:
                    codigo,

                color:
                    color,

                size:
                    size,

                price:
                    price,

                stock:
                    stock,

                image:
                    image,

                category:
                    category,

                description:
                    description

            });


            /* =============================================
               IMAGEN PRINCIPAL
            ============================================= */

            if (
                !productoBase.image &&
                image
            ) {

                productoBase.image =
                    image;

            }

        }
    );


    const productosFinales =
        Array.from(
            productosAgrupados.values()
        );


    /* =====================================================
       PRECIO MÍNIMO
    ===================================================== */

    productosFinales.forEach(
        producto => {

            const precios =
                producto.variants
                    .map(
                        variante =>
                            Number(
                                variante.price
                            )
                    )
                    .filter(
                        precio =>
                            precio > 0
                    );


            if (precios.length > 0) {

                producto.price =
                    Math.min(...precios);

            }

        }
    );


    return productosFinales;

}


/* =========================================================
   7. MOSTRAR PRODUCTOS
========================================================= */

function mostrarProductos(productos) {

    if (!productsGrid) {

        console.error(
            "No existe #products-grid en el HTML."
        );

        return;

    }


    productsGrid.innerHTML = "";


    productos.forEach(producto => {


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
           PRECIOS
        ================================================= */

        const precios =
            variantes
                .map(
                    variante =>
                        Number(
                            variante.price
                        )
                )
                .filter(
                    precio =>
                        precio > 0
                );


        let precioHTML = "";


        if (precios.length > 0) {

            const precioMin =
                Math.min(...precios);


            const precioMax =
                Math.max(...precios);


            if (
                precioMin !==
                precioMax
            ) {

                precioHTML =
                    `${formatPrice(precioMin)} - ${formatPrice(precioMax)}`;

            } else {

                precioHTML =
                    formatPrice(precioMin);

            }

        }

        window.mostrarProductos = mostrarProductos;

        let botonHTML;


        if (stockTotal <= 0) {

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
            document.createElement("article");


        article.className =
            "product-card";


        article.innerHTML = `

            <div
                class="product-image"
                data-product-id="${producto.id}"
            >

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
                                ${
                                    variantes.length
                                } variantes
                            </p>
                        `
                        : ""
                }


                <p class="product-price">
                    ${precioHTML}
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

    });

}


/* =========================================================
   8. FORMATO DE PRECIO
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
   9. ABRIR PRODUCTO
========================================================= */

if (productsGrid) {

    productsGrid.addEventListener(
        "click",
        function(event) {


            const elemento =
                event.target.closest(
                    "[data-product-id]"
                );


            if (!elemento) {

                return;

            }


            const productId =
                elemento.dataset.productId;


            if (!productId) {

                return;

            }


            window.location.href =
                `./producto.html?id=${encodeURIComponent(
                    productId
                )}`;

        }
    );

}


/* =========================================================
   10. CARGAR GOOGLE SHEETS
========================================================= */

async function cargarProductosDesdeGoogle() {

    try {

        console.log(
            "Cargando productos desde Google Sheets..."
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


        console.log(
            "CSV recibido correctamente."
        );


        const datos =
            convertirCSV(csv);


        console.log(
            "PRODUCTOS DE GOOGLE SHEETS:"
        );


        console.table(
            datos
        );


        /* =================================================
           PREPARAR PRODUCTOS
        ================================================= */
        window.products =
            prepararProductos(
                datos
            );
        
        
        console.log(
            "PRODUCTOS AGRUPADOS:"
        );


        console.table(
            window.products
        );

        /* =================================================
           MOSTRAR
        ================================================= */

mostrarProductos(
    window.products
);

        /* =================================================
           DEBUG DE VARIANTES
        ================================================= */

    window.products.forEach(
        producto => {

            console.log(
                `PRODUCTO: ${producto.name}`
            );


            console.table(
                producto.variants
            );

        }
    );


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

    }

}

/* =========================================================
   11. INICIAR
========================================================= */

async function iniciarProductos() {

    await cargarProductosDesdeGoogle();


    /* =====================================================
       BUSCAR PRODUCTOS SI VIENE UNA BÚSQUEDA
    ===================================================== */

    const busqueda =
        sessionStorage.getItem(
            "ruffianaBusqueda"
        );


    if (!busqueda) {

        return;

    }


    const texto =
        busqueda
            .trim()
            .toLowerCase();


    if (!texto) {

        sessionStorage.removeItem(
            "ruffianaBusqueda"
        );

        return;

    }


    /* =====================================================
       FILTRAR
    ===================================================== */

    const resultados =
        window.products.filter(
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
                                    texto
                                )

                                ||

                                talle.includes(
                                    texto
                                )

                            );

                        }
                    );


                /* ==============================
                   RESULTADO
                ============================== */

                return (

                    nombre.includes(
                        texto
                    )

                    ||

                    categoria.includes(
                        texto
                    )

                    ||

                    descripcion.includes(
                        texto
                    )

                    ||

                    coincideVariante

                );

            }
        );


    /* =====================================================
       MOSTRAR RESULTADOS
    ===================================================== */

    mostrarProductos(
        resultados
    );


    /* =====================================================
       BORRAR BÚSQUEDA
       Para que no quede guardada para siempre.
    ===================================================== */

    sessionStorage.removeItem(
        "ruffianaBusqueda"
    );

}


/* =========================================================
   EJECUTAR
========================================================= */

iniciarProductos();