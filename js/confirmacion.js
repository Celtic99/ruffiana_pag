/* =========================================================
   RUFFIANA — CONFIRMACIÓN DE PEDIDO
========================================================= */


/* =========================================================
   DATOS DEL CLIENTE
========================================================= */

const customerData =
    JSON.parse(
        sessionStorage.getItem("ruffianaCustomer")
    );


/* =========================================================
   ELEMENTOS
========================================================= */

const orderNumber =
    document.getElementById("order-number");

const confirmName =
    document.getElementById("confirm-name");

const confirmPhone =
    document.getElementById("confirm-phone");

const confirmEmail =
    document.getElementById("confirm-email");

const confirmShipping =
    document.getElementById("confirm-shipping");

const confirmAddress =
    document.getElementById("confirm-address");

const confirmProducts =
    document.getElementById("confirm-products");

const confirmTotal =
    document.getElementById("confirm-total");


/* =========================================================
   VERIFICAR DATOS
========================================================= */

if (!customerData) {

    window.location.href =
        "./checkout.html";

}


/* =========================================================
   NÚMERO DE PEDIDO
========================================================= */

const orderId =
    "RUF-" +
    Date.now().toString().slice(-6);


orderNumber.textContent =
    orderId;


/* Guardamos el número */

sessionStorage.setItem(
    "ruffianaOrderId",
    orderId
);


/* =========================================================
   DATOS DEL CLIENTE
========================================================= */

confirmName.textContent =
    customerData.name;

confirmPhone.textContent =
    customerData.phone;

confirmEmail.textContent =
    customerData.email || "No especificado";


/* =========================================================
   FORMA DE ENTREGA
========================================================= */

if (
    customerData.shippingMethod === "envio"
) {

    confirmShipping.textContent =
        "Envío a domicilio";


    confirmAddress.innerHTML = `

        <p>
            <strong>Dirección:</strong>
            ${customerData.address}
        </p>

        <p>
            <strong>Localidad:</strong>
            ${customerData.city}
        </p>

        <p>
            <strong>Provincia:</strong>
            ${customerData.province}
        </p>

        <p>
            <strong>Código postal:</strong>
            ${customerData.postalCode}
        </p>

    `;

} else {

    confirmShipping.textContent =
        "Retiro";

}


/* =========================================================
   PRODUCTOS DEL CARRITO
========================================================= */

const cartProducts =
    JSON.parse(
        localStorage.getItem("ruffianaCart")
    ) || [];


let total = 0;


if (cartProducts.length === 0) {

    confirmProducts.innerHTML = `

        <p>
            No hay productos en el carrito.
        </p>

    `;

} else {

    cartProducts.forEach(
        (product) => {

            const quantity =
                Number(product.quantity) || 1;

            const price =
                Number(product.price) || 0;

            const productTotal =
                price * quantity;


            total += productTotal;


            const productElement =
                document.createElement("div");


            productElement.className =
                "confirmation-product";


            productElement.innerHTML = `

                <div class="confirmation-product-info">

                    <span
                        class="confirmation-product-name"
                    >
                        ${product.name}
                    </span>

                    <span
                        class="confirmation-product-details"
                    >
                        Cantidad: ${quantity}
                    </span>

                </div>


                <span
                    class="confirmation-product-price"
                >
                    ${formatCurrency(productTotal)}
                </span>

            `;


            confirmProducts.appendChild(
                productElement
            );

        }
    );

}


/* =========================================================
   TOTAL
========================================================= */

confirmTotal.textContent =
    formatCurrency(total);


/* =========================================================
   FORMATO DE MONEDA
========================================================= */

function formatCurrency(value) {

    return Number(value).toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS"
        }
    );

}

/* =========================================================
   CONFIRMAR PEDIDO
========================================================= */

const confirmOrderButton =
    document.getElementById("confirm-order-button");


if (confirmOrderButton) {

    confirmOrderButton.addEventListener(
        "click",
        function () {

            const finalOrder = {

                orderId: orderId,

                customer: customerData,

                products: cartProducts,

                total: total,

                date: new Date().toISOString()

            };


            /* Guardar pedido */

            localStorage.setItem(
                "ruffianaLastOrder",
                JSON.stringify(finalOrder)
            );


            console.log(
                "Pedido RUFFIANA:",
                finalOrder
            );


            /*
             * Por ahora NO redirigimos.
             * Primero comprobamos que todo
             * quede guardado correctamente.
             */

            alert(
                "¡Pedido confirmado correctamente! 🤎"
            );

            generatePDF(finalOrder);

        }
    );

}

/* =========================================================
   GENERAR PDF
========================================================= */

function generatePDF(order) {

    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF();


    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const margin = 20;

    let y = 20;


    /* =====================================================
       COLORES RUFFIANA
    ===================================================== */

    const brown = [134, 107, 80];

    const dark = [33, 33, 33];

    const lightBrown = [177, 140, 104];


    /* =====================================================
       ENCABEZADO
    ===================================================== */

    doc.setTextColor(
        ...brown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(24);

    doc.text(
        "RUFFIANA",
        margin,
        y
    );


    y += 10;


    doc.setTextColor(
        ...dark
    );

    doc.setFontSize(11);

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "ORDEN DE PEDIDO",
        margin,
        y
    );


    /* =====================================================
       PEDIDO Y FECHA
    ===================================================== */

    const date =
        new Date(order.date);


    const formattedDate =
        date.toLocaleDateString(
            "es-AR"
        );


    doc.text(
        `Pedido: ${order.orderId}`,
        190,
        20,
        {
            align: "right"
        }
    );


    doc.text(
        `Fecha: ${formattedDate}`,
        190,
        27,
        {
            align: "right"
        }
    );


    y += 15;


    /* =====================================================
       SEPARADOR
    ===================================================== */

    doc.setDrawColor(
        220,
        220,
        220
    );

    doc.line(
        margin,
        y,
        190,
        y
    );


    y += 12;


    /* =====================================================
       DATOS DEL CLIENTE
    ===================================================== */

    doc.setTextColor(
        ...lightBrown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.text(
        "DATOS DEL CLIENTE",
        margin,
        y
    );


    y += 8;


    doc.setTextColor(
        ...dark
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);


    doc.text(
        `Nombre: ${order.customer.name}`,
        margin,
        y
    );

    y += 6;


    doc.text(
        `WhatsApp: ${order.customer.phone}`,
        margin,
        y
    );

    y += 6;


    if (order.customer.email) {

        doc.text(
            `Email: ${order.customer.email}`,
            margin,
            y
        );

        y += 6;

    }


    /* =====================================================
       ENTREGA
    ===================================================== */

    y += 6;


    doc.setTextColor(
        ...lightBrown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "FORMA DE ENTREGA",
        margin,
        y
    );


    y += 8;


    doc.setTextColor(
        ...dark
    );

    doc.setFont(
        "helvetica",
        "normal"
    );


    const shippingText =
        order.customer.shippingMethod === "envio"
            ? "Envío a domicilio"
            : "Retiro";


    doc.text(
        shippingText,
        margin,
        y
    );


    y += 6;


    if (
        order.customer.shippingMethod === "envio"
    ) {

        doc.text(
            `Dirección: ${order.customer.address}`,
            margin,
            y
        );

        y += 6;


        doc.text(
            `Localidad: ${order.customer.city}`,
            margin,
            y
        );

        y += 6;


        doc.text(
            `Provincia: ${order.customer.province}`,
            margin,
            y
        );

        y += 6;


        doc.text(
            `Código postal: ${order.customer.postalCode}`,
            margin,
            y
        );

        y += 6;

    }


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    y += 10;


    doc.setTextColor(
        ...lightBrown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "PRODUCTOS",
        margin,
        y
    );


    y += 10;


    /* Encabezados */

    doc.setTextColor(
        ...dark
    );

    doc.setFontSize(9);


    doc.text(
        "PRODUCTO",
        margin,
        y
    );


    doc.text(
        "CANT.",
        125,
        y
    );


    doc.text(
        "TOTAL",
        190,
        y,
        {
            align: "right"
        }
    );


    y += 5;


    doc.setDrawColor(
        220,
        220,
        220
    );


    doc.line(
        margin,
        y,
        190,
        y
    );


    y += 8;


    /* =====================================================
       LISTA DE PRODUCTOS
    ===================================================== */

    order.products.forEach(
        function (product) {

            const quantity =
                Number(product.quantity) || 1;


            const price =
                Number(product.price) || 0;


            const productTotal =
                price * quantity;


            doc.text(
                product.name,
                margin,
                y
            );


            doc.text(
                String(quantity),
                128,
                y,
                {
                    align: "center"
                }
            );


            doc.text(
                formatCurrency(productTotal),
                190,
                y,
                {
                    align: "right"
                }
            );


            y += 8;

        }
    );


    /* =====================================================
       TOTAL
    ===================================================== */

    y += 5;


    doc.setDrawColor(
        220,
        220,
        220
    );


    doc.line(
        margin,
        y,
        190,
        y
    );


    y += 12;


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);


    doc.text(
        "TOTAL",
        margin,
        y
    );


    doc.text(
        formatCurrency(order.total),
        190,
        y,
        {
            align: "right"
        }
    );


    /* =====================================================
       PIE
    ===================================================== */

    y += 25;


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        120,
        120,
        120
    );


    doc.text(
        "Gracias por comprar en RUFFIANA 🤎",
        105,
        y,
        {
            align: "center"
        }
    );


    /* =====================================================
       DESCARGAR
    ===================================================== */

    doc.save(
        `${order.orderId}-RUFFIANA.pdf`
    );

    /* =====================================================
    WHATSAPP
    ===================================================== */

    sendOrderToWhatsApp(order);

}

/* =========================================================
   ENVIAR PEDIDO A WHATSAPP
========================================================= */

function sendOrderToWhatsApp(order) {

    const phone =
        "5491165557412";


    let message =
        `🤎 RUFFIANA — NUEVO PEDIDO\n\n`;


    message +=
        `Pedido: ${order.orderId}\n`;


    message +=
        `Fecha: ${new Date(order.date).toLocaleDateString("es-AR")}\n\n`;


    /* =====================================================
       CLIENTE
    ===================================================== */

    message +=
        `👤 DATOS DEL CLIENTE\n`;

    message +=
        `Nombre: ${order.customer.name}\n`;

    message +=
        `WhatsApp: ${order.customer.phone}\n`;


    if (order.customer.email) {

        message +=
            `Email: ${order.customer.email}\n`;

    }


    message += `\n`;


    /* =====================================================
       ENTREGA
    ===================================================== */

    message +=
        `📦 ENTREGA\n`;


    if (
        order.customer.shippingMethod === "envio"
    ) {

        message +=
            `Forma: Envío a domicilio\n`;

        message +=
            `Dirección: ${order.customer.address}\n`;

        message +=
            `Localidad: ${order.customer.city}\n`;

        message +=
            `Provincia: ${order.customer.province}\n`;

        message +=
            `Código postal: ${order.customer.postalCode}\n`;

    } else {

        message +=
            `Forma: Retiro\n`;

    }


    message += `\n`;


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    message +=
        `🛍️ PRODUCTOS\n\n`;


    order.products.forEach(
        function (product) {

            const quantity =
                Number(product.quantity) || 1;


            const price =
                Number(product.price) || 0;


            const productTotal =
                price * quantity;


            message +=
                `${product.name}\n`;

            message +=
                `Cantidad: ${quantity}\n`;

            message +=
                `Precio: ${formatCurrency(productTotal)}\n\n`;

        }
    );


    /* =====================================================
       TOTAL
    ===================================================== */

    message +=
        `💰 TOTAL: ${formatCurrency(order.total)}\n\n`;


    message +=
        `¡Gracias por tu compra! 🤎`;


    const whatsappURL =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    window.open(
        whatsappURL,
        "_blank"
    );

}