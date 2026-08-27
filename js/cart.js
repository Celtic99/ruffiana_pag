/* =========================================================
   RUFFIANA — CART.JS
   Carrito de compras
========================================================= */


/* =========================================================
   1. RECUPERAR CARRITO
========================================================= */

let cart = JSON.parse(
    localStorage.getItem("ruffianaCart")
) || [];


/* =========================================================
   2. GUARDAR
========================================================= */

function saveCart() {

    localStorage.setItem(
        "ruffianaCart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   3. AGREGAR PRODUCTO
========================================================= */

function addToCart(productId) {

    const cleanProductId =
        String(productId).trim();


    console.log(
        "ID recibido:",
        cleanProductId
    );


    const product =
        products.find(
            item =>
                String(item.id).trim() ===
                cleanProductId
        );


    if (!product) {

        console.error(
            "NO SE ENCONTRÓ EL PRODUCTO:",
            cleanProductId
        );

        return;

    }


    /* Buscar producto existente */

    const existingProduct =
        cart.find(
            item =>
                String(item.id).trim() ===
                cleanProductId
        );


    /* -----------------------------------------
       YA EXISTE
    ----------------------------------------- */

    if (existingProduct) {

        if (
            existingProduct.quantity >=
            Number(existingProduct.Stock)
        ) {

            alert(
                "No hay más unidades disponibles de este producto."
            );

            return;

        }


        existingProduct.quantity += 1;

    }


    /* -----------------------------------------
       PRODUCTO NUEVO
    ----------------------------------------- */

    else {

        if (
            Number(product.Stock) <= 0
        ) {

            alert(
                "Este producto está agotado."
            );

            return;

        }


        cart.push({

            ...product,

            quantity: 1

        });

    }


    saveCart();

    updateCartCounter();

    renderCart();


    console.log(
        "CARRITO ACTUAL:",
        cart
    );

}


/* =========================================================
   4. ELIMINAR
========================================================= */

function removeFromCart(productId) {

    const cleanProductId =
        String(productId).trim();


    cart =
        cart.filter(
            item =>
                String(item.id).trim() !==
                cleanProductId
        );


    saveCart();

    updateCartCounter();

    renderCart();

}


/* =========================================================
   5. CAMBIAR CANTIDAD
========================================================= */

function changeQuantity(
    productId,
    amount
) {

    const cleanProductId =
        String(productId).trim();


    const product =
        cart.find(
            item =>
                String(item.id).trim() ===
                cleanProductId
        );


    if (!product) {

        return;

    }


    /* No superar stock */

    if (
        amount > 0 &&
        product.quantity >=
        Number(product.Stock)
    ) {

        alert(
            "No hay más unidades disponibles."
        );

        return;

    }


    product.quantity += amount;


    /* Si llega a 0 */

    if (
        product.quantity <= 0
    ) {

        removeFromCart(
            cleanProductId
        );

        return;

    }


    saveCart();

    updateCartCounter();

    renderCart();

}


/* =========================================================
   6. TOTAL PRODUCTOS
========================================================= */

function getItemCount() {

    return cart.reduce(
        (total, product) => {

            return total +
                Number(
                    product.quantity
                );

        },
        0
    );

}


/* =========================================================
   7. TOTAL CARRITO
========================================================= */

function getCartTotal() {

    return cart.reduce(
        (total, product) => {

            return total +
                (
                    Number(product.price) *
                    Number(product.quantity)
                );

        },
        0
    );

}


/* =========================================================
   8. PRECIO
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
   9. MOSTRAR CARRITO
========================================================= */

function renderCart() {

    const cartContainer =
        document.getElementById(
            "cart-products"
        );


    if (!cartContainer) {

        return;

    }


    /* VACÍO */

    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <li class="empty-cart">

                <h2>
                    Tu carrito está vacío
                </h2>

                <a
                    href="./coleccion.html"
                    class="checkout-button"
                >
                    VER COLECCIÓN
                </a>

            </li>

        `;


        updateCartSummary();

        return;

    }


    /* PRODUCTOS */

    cartContainer.innerHTML = "";


    cart.forEach(
        product => {

            const cartItem =
                document.createElement(
                    "li"
                );


            cartItem.className =
                "cart-product";


            cartItem.innerHTML = `

                <div class="cart-product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                </div>


                <div class="cart-product-info">

                    <h2>
                        ${product.name}
                    </h2>


                    <p>

                        ${product.color || ""}

                        ${
                            product.size
                                ? ` · Talle ${product.size}`
                                : ""
                        }

                    </p>


                    <p class="cart-product-price">

                        ${formatPrice(
                            product.price
                        )}

                    </p>

                </div>


                <div class="cart-product-actions">

                    <div class="quantity-control">

                        <button
                            type="button"
                            class="quantity-minus"
                            data-product-id="${product.id}"
                        >
                            −
                        </button>


                        <span>
                            ${product.quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-plus"
                            data-product-id="${product.id}"
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="remove-product"
                        data-product-id="${product.id}"
                        aria-label="Eliminar"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;


            cartContainer.appendChild(
                cartItem
            );

        }
    );


    updateCartSummary();

}


/* =========================================================
   10. RESUMEN
========================================================= */

function updateCartSummary() {

    const totalElement =
        document.getElementById(
            "cart-total"
        );


    const countElement =
        document.getElementById(
            "cart-count"
        );


    const total =
        getCartTotal();


    const itemCount =
        getItemCount();


    if (totalElement) {

        totalElement.textContent =
            formatPrice(total);

    }


    if (countElement) {

        countElement.textContent =
            `${itemCount} ${
                itemCount === 1
                    ? "producto"
                    : "productos"
            }`;

    }

}


/* =========================================================
   11. CONTADOR NAVBAR
========================================================= */

function updateCartCounter() {

    const cartButtons =
        document.querySelectorAll(
            ".cart-button"
        );


    cartButtons.forEach(
        button => {

            const count =
                getItemCount();


            let badge =
                button.querySelector(
                    ".cart-count-badge"
                );


            if (count === 0) {

                if (badge) {

                    badge.remove();

                }

                return;

            }


            if (!badge) {

                badge =
                    document.createElement(
                        "span"
                    );


                badge.className =
                    "cart-count-badge";


                button.appendChild(
                    badge
                );

            }


            badge.textContent =
                count;

        }
    );

}


/* =========================================================
   12. EVENTOS
========================================================= */

document.addEventListener(
    "click",
    event => {


        /* SUMAR */

        const plusButton =
            event.target.closest(
                ".quantity-plus"
            );


        if (plusButton) {

            changeQuantity(
                plusButton.dataset.productId,
                1
            );

            return;

        }


        /* RESTAR */

        const minusButton =
            event.target.closest(
                ".quantity-minus"
            );


        if (minusButton) {

            changeQuantity(
                minusButton.dataset.productId,
                -1
            );

            return;

        }


        /* ELIMINAR */

        const removeButton =
            event.target.closest(
                ".remove-product"
            );


        if (removeButton) {

            removeFromCart(
                removeButton.dataset.productId
            );

        }

    }
);


/* =========================================================
   13. INICIALIZAR
========================================================= */

updateCartCounter();


if (
    document.getElementById(
        "cart-products"
    )
) {

    renderCart();

}


/* =========================================================
   14. CHECKOUT
========================================================= */

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );


const shippingMethod =
    document.getElementById(
        "shipping-method"
    );


const addressGroup =
    document.getElementById(
        "address-group"
    );


if (
    shippingMethod &&
    addressGroup
) {

    shippingMethod.addEventListener(
        "change",
        () => {

            if (
                shippingMethod.value ===
                "envio"
            ) {

                addressGroup.style.display =
                    "flex";

            } else {

                addressGroup.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   15. FORMULARIO
========================================================= */

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Tu carrito está vacío."
                );

                return;

            }


            const customerName =
                document.getElementById(
                    "customer-name"
                )?.value.trim() || "";


            const customerPhone =
                document.getElementById(
                    "customer-phone"
                )?.value.trim() || "";


            const customerEmail =
                document.getElementById(
                    "customer-email"
                )?.value.trim() || "";


            const shipping =
                shippingMethod
                    ? shippingMethod.value
                    : "";


            const address =
                document.getElementById(
                    "customer-address"
                )?.value.trim() || "";


            const city =
                document.getElementById(
                    "customer-city"
                )?.value.trim() || "";


            const province =
                document.getElementById(
                    "customer-province"
                )?.value || "";


            const postalCode =
                document.getElementById(
                    "customer-postal-code"
                )?.value.trim() || "";


            const notes =
                document.getElementById(
                    "customer-notes"
                )?.value.trim() || "";


            const order = {

                id:
                    generateOrderNumber(),

                date:
                    new Date().toISOString(),

                customer: {

                    name:
                        customerName,

                    phone:
                        customerPhone,

                    email:
                        customerEmail,

                    shipping:
                        shipping,

                    address:
                        address,

                    city:
                        city,

                    province:
                        province,

                    postalCode:
                        postalCode,

                    notes:
                        notes

                },

                products:
                    cart,

                total:
                    getCartTotal()

            };


            console.log(
                "ORDEN GENERADA:",
                order
            );


            localStorage.setItem(
                "ruffianaLastOrder",
                JSON.stringify(order)
            );


            alert(
                "¡Pedido generado correctamente! 🤎"
            );

        }
    );

}


/* =========================================================
   16. NÚMERO DE PEDIDO
========================================================= */

function generateOrderNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-6);


    return `RUF-${timestamp}`;

}