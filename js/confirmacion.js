/* =========================================================
   RUFFIANA — CONFIRMACIÓN DE PEDIDO
   Envío automático de comprobante por email
========================================================= */

const WORKER_URL =
    "https://ruffiana-email.ruffianafemme.workers.dev";


/* =========================================================
   DATOS DEL CLIENTE
========================================================= */

const customerData =
    JSON.parse(
        sessionStorage.getItem("ruffianaCustomer")
    );


/* =========================================================
   ELEMENTOS DEL HTML
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

const confirmShippingMethod =
    document.getElementById("confirm-shipping-method");

const confirmProducts =
    document.getElementById("confirm-products");

const confirmSubtotal =
    document.getElementById("confirm-subtotal");

const confirmShippingCost =
    document.getElementById("confirm-shipping-cost");

const confirmTotal =
    document.getElementById("confirm-total");

const confirmOrderButton =
    document.getElementById("confirm-order-button");


/* =========================================================
   VERIFICAR CLIENTE
========================================================= */

if (!customerData) {
    window.location.href =
        "./checkout.html";
}


/* =========================================================
   GENERAR NÚMERO DE PEDIDO
========================================================= */

const orderId =
    "RUF-" +
    Date.now().toString().slice(-6);

orderNumber.textContent =
    orderId;

sessionStorage.setItem(
    "ruffianaOrderId",
    orderId
);


/* =========================================================
   MOSTRAR DATOS DEL CLIENTE
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

const shippingCarrier =
    customerData.shippingCarrier ||
    (
        customerData.shippingMethod === "envio" &&
        (
            customerData.province ===
                "Ciudad Autónoma de Buenos Aires" ||
            customerData.province ===
                "Buenos Aires"
        )
            ? "Motomensajería"
            : ""
    );

if (
    customerData.shippingMethod === "envio"
) {

    confirmShipping.textContent =
        "Envío a domicilio";

    confirmAddress.innerHTML = `
        <p>
            <strong>Dirección:</strong>
            ${customerData.address || ""}
        </p>

        <p>
            <strong>Localidad:</strong>
            ${customerData.city || ""}
        </p>

        <p>
            <strong>Provincia:</strong>
            ${customerData.province || ""}
        </p>

        <p>
            <strong>Código postal:</strong>
            ${customerData.postalCode || ""}
        </p>

        <p>
            <strong>Método de envío:</strong>
            ${shippingCarrier}
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
        function (product) {

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

                    <span class="confirmation-product-name">
                        ${product.name}
                    </span>

                    <span class="confirmation-product-details">
                        Cantidad: ${quantity}
                    </span>

                </div>

                <span class="confirmation-product-price">
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
   MOSTRAR SUBTOTAL, ENVÍO Y TOTAL
========================================================= */

const shippingCost =
    customerData.shippingCost ??
    (
        customerData.province ===
            "Ciudad Autónoma de Buenos Aires"
            ? 4311
            : customerData.province ===
                "Buenos Aires"
                ? 7100
                : null
    );

    
/* -----------------------------------------
   SUBTOTAL
----------------------------------------- */

confirmSubtotal.textContent =
    formatCurrency(total);


/* -----------------------------------------
   ENVÍO
----------------------------------------- */

if (
    customerData.shippingMethod === "retiro"
) {

    confirmShippingCost.textContent =
        formatCurrency(0);

} else if (
    shippingCost === null ||
    shippingCost === undefined
) {

    confirmShippingCost.textContent =
        "$ A COTIZAR";

} else {

    confirmShippingCost.textContent =
        formatCurrency(shippingCost);

}


/* -----------------------------------------
   TOTAL
----------------------------------------- */

const finalTotal =
    shippingCost === null ||
    shippingCost === undefined
        ? total
        : total + Number(shippingCost);

confirmTotal.textContent =
    formatCurrency(finalTotal);


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

if (confirmOrderButton) {

    confirmOrderButton.addEventListener(
        "click",
        async function () {

            if (
                confirmOrderButton.disabled
            ) {
                return;
            }


            /* -----------------------------------------
               VERIFICAR EMAIL
            ----------------------------------------- */

            if (!customerData.email) {

                alert(
                    "Necesitamos un email para poder enviarte el comprobante del pedido."
                );

                return;
            }


            /* -----------------------------------------
               BLOQUEAR BOTÓN
            ----------------------------------------- */

            confirmOrderButton.disabled =
                true;

            const originalButtonText =
                confirmOrderButton.textContent;

            confirmOrderButton.textContent =
                "ENVIANDO PEDIDO...";


            try {

                /* -----------------------------------------
                   ARMAR PEDIDO
                ----------------------------------------- */

                const finalOrder = {

                    orderId:
                        orderId,

                    customer:
                        customerData,

                    products:
                        cartProducts,

                    total:
                        finalTotal,

                    date:
                        new Date().toISOString()
                };


                console.log(
                    "Pedido RUFFIANA:",
                    finalOrder
                );


                /* -----------------------------------------
                   GENERAR PDF
                ----------------------------------------- */

                const pdfDataUri =
                    generatePDF(
                        finalOrder
                    );


                /* -----------------------------------------
                   PRODUCTOS PARA EMAIL
                ----------------------------------------- */

                const productsText =
                    orderProductsToText(
                        finalOrder.products
                    );


                /* -----------------------------------------
                   FORMA DE ENTREGA
                ----------------------------------------- */

                const shippingText =
                    finalOrder.customer.shippingMethod === "envio"
                        ? "Envío a domicilio"
                        : "Retiro";


                /* -----------------------------------------
                   DIRECCIÓN
                ----------------------------------------- */

                let addressText = "";


                if (
                    finalOrder.customer.shippingMethod === "envio"
                ) {

                    addressText =
                        `Dirección: ${finalOrder.customer.address || ""}\n` +
                        `Localidad: ${finalOrder.customer.city || ""}\n` +
                        `Provincia: ${finalOrder.customer.province || ""}\n` +
                        `Código postal: ${finalOrder.customer.postalCode || ""}`;
                }


                /* -----------------------------------------
                   ENVIAR AL WORKER
                ----------------------------------------- */

                const response =
                    await fetch(
                        `${WORKER_URL}/send-order`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                order_id:
                                    finalOrder.orderId,

                                customer_name:
                                    finalOrder.customer.name,

                                customer_phone:
                                    finalOrder.customer.phone,

                                customer_email:
                                    finalOrder.customer.email,

                                shipping_method:
                                    shippingText,

                                shipping_carrier: shippingCarrier,

                                shipping_cost: shippingCost,

                                address:
                                    addressText,

                                products:
                                    productsText,

                                total:
                                    formatCurrency(
                                        finalOrder.total
                                    ),

                                pdf_attachment:
                                    pdfDataUri
                            })
                        }
                    );


                /* -----------------------------------------
                   RESPUESTA DEL WORKER
                ----------------------------------------- */

                let result;


                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "El servidor respondió de forma inesperada."
                    );
                }


                console.log(
                    "Respuesta del Worker:",
                    result
                );


                /* -----------------------------------------
                   VERIFICAR ENVÍO
                ----------------------------------------- */

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.error ||
                        "No se pudo enviar el comprobante por email."
                    );
                }


                /* -----------------------------------------
                   GUARDAR ÚLTIMO PEDIDO
                ----------------------------------------- */

                localStorage.setItem(
                    "ruffianaLastOrder",
                    JSON.stringify(
                        finalOrder
                    )
                );


                /* -----------------------------------------
                   PEDIDO ENVIADO
                ----------------------------------------- */

                confirmOrderButton.textContent =
                    "PEDIDO ENVIADO ✓";


                alert(
                    "¡Pedido confirmado correctamente!\n\n" +
                    "Te enviamos el comprobante a:\n" +
                    finalOrder.customer.email
                );


                /* -----------------------------------------
                   ABRIR WHATSAPP
                ----------------------------------------- */

                sendOrderToWhatsApp(
                    finalOrder
                );


            } catch (error) {

                console.error(
                    "Error al confirmar pedido:",
                    error
                );


                alert(
                    "No pudimos enviar el comprobante por email.\n\n" +
                    "El pedido NO fue confirmado todavía.\n\n" +
                    "Podés volver a intentarlo."
                );


                confirmOrderButton.disabled =
                    false;

                confirmOrderButton.textContent =
                    originalButtonText;
            }
        }
    );
}


/* =========================================================
   GENERAR PDF
   ESTILO COMPROBANTE PROFESIONAL
========================================================= */

function generatePDF(order) {

    const { jsPDF } =
        window.jspdf;


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    const pageWidth = 210;
    const pageHeight = 297;

    const margin = 20;
    const right =
        pageWidth - margin;


    /* =====================================================
       COLORES
    ===================================================== */

    const brown =
        [134, 107, 80];

    const dark =
        [45, 45, 45];

    const gray =
        [105, 105, 105];

    const beigeLine =
        [218, 210, 202];


    /* =====================================================
       FECHA
    ===================================================== */

    const date =
        new Date(order.date);

    const formattedDate =
        date.toLocaleDateString(
            "es-AR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );


    /* =====================================================
       FONDO BLANCO
    ===================================================== */

    doc.setFillColor(
        255,
        255,
        255
    );

    doc.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
    );


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

    doc.setFontSize(25);

    doc.text(
        "RUFFIANA",
        margin,
        23
    );


    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.text(
        "COMPROBANTE DE PEDIDO",
        margin,
        30
    );


    /* =====================================================
       NÚMERO DE PEDIDO
    ===================================================== */

    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.text(
        "N.º DE PEDIDO",
        right,
        17,
        {
            align: "right"
        }
    );


    doc.setTextColor(
        ...brown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);

    doc.text(
        order.orderId,
        right,
        23,
        {
            align: "right"
        }
    );


    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.text(
        `Fecha: ${formattedDate}`,
        right,
        30,
        {
            align: "right"
        }
    );


    /* =====================================================
       LÍNEA PRINCIPAL
    ===================================================== */

    doc.setDrawColor(
        ...brown
    );

    doc.setLineWidth(
        0.5
    );

    doc.line(
        margin,
        38,
        right,
        38
    );


    let y = 53;


    /* =====================================================
       FUNCIÓN — TÍTULO DE SECCIÓN
    ===================================================== */

    function sectionTitle(title) {

        doc.setTextColor(
            ...brown
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);

        doc.text(
            title,
            margin,
            y
        );


        y += 6;


        doc.setDrawColor(
            ...beigeLine
        );

        doc.setLineWidth(
            0.3
        );

        doc.line(
            margin,
            y,
            right,
            y
        );


        y += 8;
    }


    /* =====================================================
       FUNCIÓN — CAMPO
    ===================================================== */

    function field(
        label,
        value,
        x,
        width
    ) {

        doc.setTextColor(
            ...gray
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(7);

        doc.text(
            label,
            x,
            y
        );


        doc.setTextColor(
            ...dark
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(9);


        const lines =
            doc.splitTextToSize(
                String(
                    value || "-"
                ),
                width
            );


        doc.text(
            lines,
            x,
            y + 5
        );
    }


    /* =====================================================
       DATOS DEL CLIENTE
    ===================================================== */

    sectionTitle(
        "DATOS DEL CLIENTE"
    );


    field(
        "Nombre",
        order.customer.name,
        margin,
        75
    );


    field(
        "WhatsApp",
        order.customer.phone,
        110,
        70
    );


    y += 17;


    if (
        order.customer.email
    ) {

        field(
            "Email",
            order.customer.email,
            margin,
            170
        );

        y += 17;
    }


    /* =====================================================
       FORMA DE ENTREGA
    ===================================================== */

    sectionTitle(
        "FORMA DE ENTREGA"
    );


    const shippingText =
        order.customer.shippingMethod === "envio"
            ? "Envío a domicilio"
            : "Retiro";


    field(
        "Modalidad",
        shippingText,
        margin,
        75
    );


    y += 17;


    if (
        order.customer.shippingMethod === "envio"
    ) {

        field(
            "Dirección",
            order.customer.address,
            margin,
            75
        );


        field(
            "Localidad",
            order.customer.city,
            110,
            70
        );


        y += 17;


        field(
            "Provincia",
            order.customer.province,
            margin,
            75
        );


        field(
            "Código postal",
            order.customer.postalCode,
            110,
            70
        );


        y += 17;
    }


    /* =====================================================
       DETALLE DEL PEDIDO
    ===================================================== */

    sectionTitle(
        "DETALLE DEL PEDIDO"
    );


    const xProduct =
        margin;

    const xUnit =
        112;

    const xQty =
        151;

    const xSubtotal =
        right;


    /* =====================================================
       ENCABEZADO TABLA
    ===================================================== */

    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(7);


    doc.text(
        "PRODUCTO",
        xProduct,
        y
    );


    doc.text(
        "PRECIO UNIT.",
        xUnit,
        y,
        {
            align: "right"
        }
    );


    doc.text(
        "CANT.",
        xQty,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        "SUBTOTAL",
        xSubtotal,
        y,
        {
            align: "right"
        }
    );


    y += 5;


    doc.setDrawColor(
        ...brown
    );

    doc.setLineWidth(
        0.4
    );

    doc.line(
        margin,
        y,
        right,
        y
    );


    y += 8;


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    order.products.forEach(
        function (product) {

            const quantity =
                Number(
                    product.quantity
                ) || 1;


            const price =
                Number(
                    product.price
                ) || 0;


            const productTotal =
                price * quantity;


            const nameLines =
                doc.splitTextToSize(
                    String(
                        product.name ||
                        "Producto"
                    ),
                    82
                );


            const rowHeight =
                Math.max(
                    8,
                    nameLines.length * 5
                );


            /* ---------------------------------------------
               NUEVA PÁGINA
            --------------------------------------------- */

            if (
                y +
                rowHeight +
                35 >
                pageHeight - 20
            ) {

                doc.addPage();


                y = 25;


                doc.setTextColor(
                    ...brown
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(14);


                doc.text(
                    "RUFFIANA",
                    margin,
                    y
                );


                y += 13;


                doc.setTextColor(
                    ...gray
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(7);


                doc.text(
                    "PRODUCTO",
                    xProduct,
                    y
                );


                doc.text(
                    "PRECIO UNIT.",
                    xUnit,
                    y,
                    {
                        align: "right"
                    }
                );


                doc.text(
                    "CANT.",
                    xQty,
                    y,
                    {
                        align: "center"
                    }
                );


                doc.text(
                    "SUBTOTAL",
                    xSubtotal,
                    y,
                    {
                        align: "right"
                    }
                );


                y += 5;


                doc.setDrawColor(
                    ...brown
                );


                doc.line(
                    margin,
                    y,
                    right,
                    y
                );


                y += 8;
            }


            /* ---------------------------------------------
               NOMBRE
            --------------------------------------------- */

            doc.setTextColor(
                ...dark
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                8.5
            );


            doc.text(
                nameLines,
                xProduct,
                y
            );


            /* ---------------------------------------------
               PRECIO UNITARIO
            --------------------------------------------- */

            doc.text(
                formatCurrency(price),
                xUnit,
                y,
                {
                    align: "right"
                }
            );


            /* ---------------------------------------------
               CANTIDAD
            --------------------------------------------- */

            doc.text(
                String(quantity),
                xQty,
                y,
                {
                    align: "center"
                }
            );


            /* ---------------------------------------------
               SUBTOTAL
            --------------------------------------------- */

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                formatCurrency(
                    productTotal
                ),
                xSubtotal,
                y,
                {
                    align: "right"
                }
            );


            y += rowHeight;


            /* ---------------------------------------------
               LÍNEA DEL PRODUCTO
            --------------------------------------------- */

            doc.setDrawColor(
                ...beigeLine
            );

            doc.setLineWidth(
                0.2
            );


            doc.line(
                margin,
                y - 3,
                right,
                y - 3
            );


            y += 5;
        }
    );


    /* =====================================================
       TOTAL
    ===================================================== */

    y += 5;


    doc.setDrawColor(
        ...brown
    );

    doc.setLineWidth(
        0.5
    );


    doc.line(
        115,
        y,
        right,
        y
    );


    y += 9;


    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);


    doc.text(
        "TOTAL",
        115,
        y
    );


    doc.setTextColor(
        ...brown
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(15);


    doc.text(
        formatCurrency(
            order.total
        ),
        right,
        y,
        {
            align: "right"
        }
    );


    /* =====================================================
       PIE DE PÁGINA
    ===================================================== */

    const footerY =
        pageHeight - 18;


    doc.setDrawColor(
        ...beigeLine
    );

    doc.setLineWidth(
        0.3
    );


    doc.line(
        margin,
        footerY - 5,
        right,
        footerY - 5
    );


    doc.setTextColor(
        ...gray
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);


    doc.text(
        "RUFFIANA",
        margin,
        footerY
    );


    doc.text(
        "ruffianafemme@gmail.com",
        pageWidth / 2,
        footerY,
        {
            align: "center"
        }
    );


    doc.text(
        "WhatsApp: +54 9 11 6555-7412",
        right,
        footerY,
        {
            align: "right"
        }
    );


    /* =====================================================
       DEVOLVER PDF
    ===================================================== */

    return doc.output(
        "datauristring"
    );
}


/* =========================================================
   PRODUCTOS → TEXTO PARA EMAIL
========================================================= */

function orderProductsToText(
    products
) {

    return products.map(
        function (product) {

            const quantity =
                Number(
                    product.quantity
                ) || 1;


            const price =
                Number(
                    product.price
                ) || 0;


            const productTotal =
                price * quantity;


            return (
                `${product.name}\n` +
                `Cantidad: ${quantity}\n` +
                `Precio: ${formatCurrency(productTotal)}`
            );
        }
    ).join(
        "\n\n"
    );
}


/* =========================================================
   ENVIAR PEDIDO POR WHATSAPP
========================================================= */

function sendOrderToWhatsApp(
    order
) {

    const phone =
        "5491165557412";


    let message =
        `🤎 RUFFIANA — NUEVO PEDIDO\n\n`;


    message +=
        `Pedido: ${order.orderId}\n`;


    message +=
        `Fecha: ${
            new Date(
                order.date
            ).toLocaleDateString(
                "es-AR"
            )
        }\n\n`;


    /* -----------------------------------------
       DATOS DEL CLIENTE
    ----------------------------------------- */

    message +=
        `👤 DATOS DEL CLIENTE\n`;


    message +=
        `Nombre: ${
            order.customer.name
        }\n`;


    message +=
        `WhatsApp: ${
            order.customer.phone
        }\n`;


    if (
        order.customer.email
    ) {

        message +=
            `Email: ${
                order.customer.email
            }\n`;
    }


    message +=
        `\n`;


    /* -----------------------------------------
       ENTREGA
    ----------------------------------------- */

    message +=
        `📦 ENTREGA\n`;


    if (
        order.customer.shippingMethod === "envio"
    ) {

        message +=
            `Forma: Envío a domicilio\n`;


        message +=
            `Dirección: ${
                order.customer.address
            }\n`;


        message +=
            `Localidad: ${
                order.customer.city
            }\n`;


        message +=
            `Provincia: ${
                order.customer.province
            }\n`;


        message +=
            `Código postal: ${
                order.customer.postalCode
            }\n`;

    } else {

        message +=
            `Forma: Retiro\n`;
    }


    message +=
        `\n`;


    /* -----------------------------------------
       PRODUCTOS
    ----------------------------------------- */

    message +=
        `🛍️ PRODUCTOS\n\n`;


    order.products.forEach(
        function (product) {

            const quantity =
                Number(
                    product.quantity
                ) || 1;


            const price =
                Number(
                    product.price
                ) || 0;


            const productTotal =
                price * quantity;


            message +=
                `${product.name}\n`;


            message +=
                `Cantidad: ${quantity}\n`;


            message +=
                `Precio: ${
                    formatCurrency(
                        productTotal
                    )
                }\n\n`;
        }
    );


    /* -----------------------------------------
       TOTAL
    ----------------------------------------- */

    message +=
        `💰 TOTAL: ${
            formatCurrency(
                order.total
            )
        }\n\n`;


    message +=
        `¡Gracias por tu compra! 🤎`;


    /* -----------------------------------------
       ABRIR WHATSAPP
    ----------------------------------------- */

    const whatsappURL =
        `https://wa.me/${phone}?text=${
            encodeURIComponent(
                message
            )
        }`;


    window.open(
        whatsappURL,
        "_blank"
    );
}