/* =========================================================
   RUFFIANA — CHECKOUT
========================================================= */

const shippingMethod =
    document.getElementById("shipping-method");

const shippingFields =
    document.getElementById("shipping-fields");

const provinceSelect =
    document.getElementById("customer-province");


/* =========================================================
   ENVÍO / RETIRO
========================================================= */

if (shippingMethod && shippingFields) {

    shippingMethod.addEventListener("change", function () {

        if (this.value === "envio") {

            shippingFields.hidden = false;

        } else {

            shippingFields.hidden = true;

        }

    });

}


/* =========================================================
   PROVINCIAS
========================================================= */

if (
    provinceSelect &&
    typeof provinciasArgentina !== "undefined"
) {

    provinciasArgentina.forEach(function (provincia) {

        const option =
            document.createElement("option");

        option.value = provincia;

        option.textContent = provincia;

        provinceSelect.appendChild(option);

    });

}


/* =========================================================
   CONFIRMAR CHECKOUT
========================================================= */

const checkoutForm =
    document.getElementById("checkout-form");


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const formData =
                new FormData(checkoutForm);


            const customerData = {

                name:
                    formData.get("customerName"),

                phone:
                    formData.get("customerPhone"),

                email:
                    formData.get("customerEmail"),

                shippingMethod:
                    formData.get("shippingMethod"),

                address:
                    formData.get("customerAddress") || "",

                city:
                    formData.get("customerCity") || "",

                province:
                    formData.get("customerProvince") || "",

                postalCode:
                    formData.get("customerPostalCode") || "",

                notes:
                    formData.get("customerNotes") || ""

            };


            sessionStorage.setItem(
                "ruffianaCustomer",
                JSON.stringify(customerData)
            );


            window.location.href =
                "./confirmacion.html";

        }
    );

}