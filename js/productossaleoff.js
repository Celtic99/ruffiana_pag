/* =========================================================
   RUFFIANA — PRODUCTOS SALE
   Google Sheets + Variantes
========================================================= */


/* =========================================================
   1. GOOGLE SHEETS SALE
========================================================= */

const GOOGLE_SHEETS_SALE_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7_lNtXTgezW5_wkaeCw-ldncnFhgAuxzFokw4yET6R_TTyfIo4QBW9L167Snqq3pitUdLHGlO6Phv/pub?gid=885919874&single=true&output=csv";

/* =========================================================
   2. CONVERTIR CSV
========================================================= */

function convertirCSVSale(csv) {

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

    console.log("ENCABEZADOS SALE:", encabezados);

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
   3. CONVERTIR PRECIO
========================================================= */

function convertirPrecioSale(valor) {

    console.log("PRECIO RECIBIDO:", valor);

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return 0;
    }

    const precioTexto =
        String(valor)
            .trim()
            .replace(/\$/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

    const precio =
        Number(precioTexto);

    console.log("PRECIO CONVERTIDO:", precio);

    return Number.isFinite(precio)
        ? precio
        : 0;
}


/* =========================================================
   4. PREPARAR PRODUCTOS
========================================================= */

function prepararProductosSale(datos) {

    const productosMap = new Map();

    datos.forEach(producto => {

        const nombre = String(producto["Nombre"] || "").trim();

        if (!nombre) return;


        // =====================================================
        // VERIFICAR PRECIO SALE
        // =====================================================

        const precioSaleTexto =
            String(producto["Precio SALE"] || "").trim();

        // Si Precio SALE está vacío → NO es un producto SALE
        if (!precioSaleTexto) {
            return;
        }


        const precioSale =
            convertirPrecioSale(precioSaleTexto);

        // Si no se pudo convertir o es 0 → NO mostrar
        if (!precioSale || precioSale <= 0) {
            return;
        }


        // =====================================================
        // PRECIO ORIGINAL
        // =====================================================

        const precioOriginal =
            convertirPrecioSale(producto["Precio"]);


        // =====================================================
        // STOCK
        // =====================================================

        const stock =
            Number(producto["Stock"]) || 0;


        // =====================================================
        // CREAR PRODUCTO
        // =====================================================

        if (!productosMap.has(nombre)) {

            productosMap.set(nombre, {

                id:
                    `sale-producto-${encodeURIComponent(nombre)}`,

                name: nombre,

                category:
                    producto["Categoría"] || "",

                description:
                    producto["Descripción"] || "",

                image:
                    producto["Imagen"] || "",

                variants: [],

                isSale: true

            });

        }


        const productoExistente =
            productosMap.get(nombre);


        // =====================================================
        // AGREGAR VARIANTE
        // =====================================================

        productoExistente.variants.push({

            code:
                producto["Código"] || "",

            color:
                producto["Color"] || "",

            size:
                producto["Talle"] || "",

            price:
                precioSale,

            originalPrice:
                precioOriginal,

            salePrice:
                precioSale,

            stock,

            image:
                producto["Imagen"] || "",

            image2:
                producto["Imagen2"] || "",

            image3:
                producto["Imagen3"] || "",

            image4:
                producto["Imagen4"] || "",

            category:
                producto["Categoría"] || "",

            description:
                producto["Descripción"] || ""

        });

    });


    // =====================================================
    // CONVERTIR MAP → ARRAY
    // =====================================================

    const productos =
        Array.from(productosMap.values());


    // =====================================================
    // CALCULAR PRECIOS Y DESCUENTO
    // =====================================================

    productos.forEach(producto => {

        const preciosOriginales =
            producto.variants
                .map(v => v.originalPrice)
                .filter(p => p > 0);

        const preciosSale =
            producto.variants
                .map(v => v.salePrice)
                .filter(p => p > 0);


        producto.originalPrice =
            preciosOriginales.length
                ? Math.min(...preciosOriginales)
                : 0;


        producto.salePrice =
            preciosSale.length
                ? Math.min(...preciosSale)
                : 0;


        if (
            producto.originalPrice > 0 &&
            producto.salePrice > 0
        ) {

            producto.discount =
                Math.round(
                    (
                        1 -
                        producto.salePrice /
                        producto.originalPrice
                    ) * 100
                );

        } else {

            producto.discount = 0;

        }

    });


    return productos;
}


/* =========================================================
   5. CARGAR PRODUCTOS SALE
========================================================= */

async function cargarProductosSale() {

    try {

        const response =
            await fetch(
                GOOGLE_SHEETS_SALE_URL
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }


        const csv =
            await response.text();


        const datos =
            convertirCSVSale(csv);

            console.log("PRIMERA FILA SALE:", datos[0]);
console.log("PRECIO:", datos[0]["Precio"]);
console.log("PRECIO SALE:", datos[0]["Precio SALE"]);


        window.saleProducts =
            prepararProductosSale(datos);


        console.log(
            "PRODUCTOS SALE:",
            window.saleProducts
        );


        if (
            typeof window.mostrarProductosSale ===
            "function"
        ) {

            window.mostrarProductosSale(
                window.saleProducts
            );

        }


    } catch (error) {

        console.error(
            "Error cargando productos SALE:",
            error
        );

    }

}


cargarProductosSale();