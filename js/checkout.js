/* =========================================================
   RUFFIANA — CHECKOUT
   Datos del cliente + entrega
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "checkout-form"
            );

        const shippingMethod =
            document.getElementById(
                "shipping-method"
            );

        const shippingFields =
            document.getElementById(
                "shipping-fields"
            );

        const province =
            document.getElementById(
                "customer-province"
            );

        const cityGroup =
            document.getElementById(
                "city-group"
            );

        const city =
            document.getElementById(
                "customer-city"
            );

        const otherCityGroup =
            document.getElementById(
                "other-city-group"
            );

        const otherCity =
            document.getElementById(
                "customer-city-other"
            );

        const carrierGroup =
            document.getElementById(
                "carrier-group"
            );

        const carrier =
            document.getElementById(
                "shipping-carrier"
            );

        const shippingSummary =
            document.getElementById(
                "shipping-summary"
            );

        const shippingSummaryLabel =
            document.getElementById(
                "shipping-summary-label"
            );

        const shippingSummaryPrice =
            document.getElementById(
                "shipping-summary-price"
            );

        const address =
            document.getElementById(
                "customer-address"
            );

        const postalCode =
            document.getElementById(
                "customer-postal-code"
            );


        /* =====================================================
           PROVINCIAS
        ===================================================== */

        if (
            typeof provinciasArgentina !==
            "undefined"
        ) {

            provinciasArgentina.forEach(
                function (provincia) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        provincia;

                    option.textContent =
                        provincia;

                    province.appendChild(
                        option
                    );

                }
            );

        }


        /* =====================================================
           CAMBIO DE FORMA DE ENTREGA
        ===================================================== */

        shippingMethod.addEventListener(
            "change",
            function () {

                resetShippingFields();

                if (
                    shippingMethod.value ===
                    "envio"
                ) {

                    shippingFields.hidden =
                        false;

                    province.required =
                        true;

                    address.required =
                        true;

                    postalCode.required =
                        true;

                }

                else if (
                    shippingMethod.value ===
                    "retiro"
                ) {

                    shippingFields.hidden =
                        true;

                    province.required =
                        false;

                    address.required =
                        false;

                    postalCode.required =
                        false;

                }

            }
        );


        /* =====================================================
           CAMBIO DE PROVINCIA
        ===================================================== */

province.addEventListener("change", function () {

    resetLocationFields();

    if (province.value === "Ciudad Autónoma de Buenos Aires") {

        showCABA();

    } else if (province.value === "Buenos Aires") {

        showBuenosAires();

    } else if (province.value) {

        showOtherProvince();

    }
});

        /* =====================================================
           CABA
        ===================================================== */

function showCABA() {

    cityGroup.hidden = true;
    city.required = false;

    otherCityGroup.hidden = true;
    otherCity.required = false;

    carrierGroup.hidden = true;
    carrier.required = false;

    carrier.value = "Motomensajería";

    shippingSummary.hidden = false;

    shippingSummaryLabel.textContent =
        "Motomensajería";

shippingSummaryPrice.textContent =
    formatCurrency(
        localidadesEnvio[
            "Ciudad Autónoma de Buenos Aires"
        ].precio
    );
}


        /* =====================================================
           BUENOS AIRES
        ===================================================== */

function showBuenosAires() {

    cityGroup.hidden = false;
    city.required = true;

    otherCityGroup.hidden = true;
    otherCity.required = false;

    carrierGroup.hidden = true;
    carrier.required = false;

    shippingSummary.hidden = true;

    populateCities();
}


        /* =====================================================
           OTRA PROVINCIA
        ===================================================== */

function showOtherProvince() {

    cityGroup.hidden = true;
    city.required = false;

    otherCityGroup.hidden = false;
    otherCity.required = true;

    carrierGroup.hidden = false;
    carrier.required = true;

    shippingSummary.hidden = false;

    shippingSummaryLabel.textContent =
        "Costo de envío";

    shippingSummaryPrice.textContent =
        "A cotizar";
}


        /* =====================================================
           CARGAR LOCALIDADES
        ===================================================== */

        function populateCities() {

            city.innerHTML = `
                <option value="">
                    Seleccioná una localidad
                </option>
            `;

            if (
                typeof localidadesEnvio ===
                "undefined"
            ) {
                return;
            }

            Object.keys(
                localidadesEnvio
            )
            .sort(
                function (a, b) {
                    return a.localeCompare(
                        b,
                        "es"
                    );
                }
            )
            .forEach(
                function (localidad) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        localidad;

                    option.textContent =
                        localidad;

                    city.appendChild(
                        option
                    );

                }
            );

        }


        /* =====================================================
           CAMBIO DE LOCALIDAD
        ===================================================== */

        city.addEventListener(
            "change",
            function () {

                const selectedCity =
                    localidadesEnvio[
                        city.value
                    ];

                if (
                    !selectedCity
                ) {

                    shippingSummary.hidden =
                        true;

                    return;

                }


                shippingSummary.hidden =
                    false;

                shippingSummaryLabel.textContent =
                    selectedCity.tipo;

                shippingSummaryPrice.textContent =
                    formatCurrency(
                        selectedCity.precio
                    );

            }
        );


        /* =====================================================
           CAMBIO DE EMPRESA
           OTRAS PROVINCIAS
        ===================================================== */

        carrier.addEventListener(
            "change",
            function () {

                if (!carrier.value) {

                    shippingSummary.hidden =
                        true;

                    return;

                }

                shippingSummary.hidden =
                    false;

                shippingSummaryLabel.textContent =
                    carrier.options[
                        carrier.selectedIndex
                    ].textContent;

                shippingSummaryPrice.textContent =
                    "A cotizar";

            }
        );


        /* =====================================================
           SUBMIT
        ===================================================== */

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const customerData = {

                    name:
                        document
                            .getElementById(
                                "customer-name"
                            )
                            .value
                            .trim(),

                    phone:
                        document
                            .getElementById(
                                "customer-phone"
                            )
                            .value
                            .trim(),

                    email:
                        document
                            .getElementById(
                                "customer-email"
                            )
                            .value
                            .trim(),

                    shippingMethod:
                        shippingMethod.value,

                    address:
                        address.value.trim(),

                    city:
                        shippingMethod.value ===
                        "envio"
                            ? (
                                province.value ===
                                "Buenos Aires"
                                    ? city.value
                                    : otherCity.value.trim()
                            )
                            : "",

                    province:
                        shippingMethod.value ===
                        "envio"
                            ? province.value
                            : "",

                    postalCode:
                        postalCode.value.trim(),

                    shippingCarrier:
                        shippingMethod.value ===
                        "envio"
                            ? (
                                province.value ===
                                    "Ciudad Autónoma de Buenos Aires" ||
                                province.value ===
                                    "Buenos Aires"
                                    ? "Motomensajería"
                                    : carrier.value
                        )
                        : "",

                    shippingType:
                        getShippingType(),

                    shippingZone:
                        getShippingZone(),

                    shippingCost:
                        getShippingCost(),

                    notes:
                        document
                            .getElementById(
                                "customer-notes"
                            )
                            .value
                            .trim()

                };


                sessionStorage.setItem(
                    "ruffianaCustomer",
                    JSON.stringify(
                        customerData
                    )
                );


                window.location.href =
                    "./confirmacion.html";

            }
        );


        /* =====================================================
           TIPO DE ENVÍO
        ===================================================== */

function getShippingType() {

    if (shippingMethod.value === "retiro") {
        return "retiro";
    }

    if (
        province.value === "Ciudad Autónoma de Buenos Aires" ||
        province.value === "Buenos Aires"
    ) {
        return "motomensajeria";
    }

    return "correo";
}

/* =====================================================
   ZONA DE ENVÍO
===================================================== */

function getShippingZone() {

    if (shippingMethod.value === "retiro") {
        return "retiro";
    }

    if (
        province.value ===
        "Ciudad Autónoma de Buenos Aires"
    ) {
        return "caba";
    }

    if (
        province.value ===
        "Buenos Aires"
    ) {
        return "buenos_aires";
    }

    return "resto_del_pais";
}

/* =====================================================
   COSTO DE ENVÍO
===================================================== */

function getShippingCost() {

    if (shippingMethod.value !== "envio") {
        return 0;
    }

    // CABA
    if (
        province.value ===
        "Ciudad Autónoma de Buenos Aires"
    ) {

        return localidadesEnvio[
            "Ciudad Autónoma de Buenos Aires"
        ].precio;
    }

    // Provincia de Buenos Aires
    if (
        province.value ===
        "Buenos Aires"
    ) {

        if (
            city.value &&
            localidadesEnvio[city.value]
        ) {

            return localidadesEnvio[
                city.value
            ].precio;
        }
    }

    // Resto del país
    return null;
}

        /* =====================================================
           RESET GENERAL
        ===================================================== */

        function resetShippingFields() {

            province.value = "";

            resetLocationFields();

            address.value = "";

            postalCode.value = "";

        }


        /* =====================================================
           RESET LOCALIDAD
        ===================================================== */

        function resetLocationFields() {

            city.innerHTML = `
                <option value="">
                    Seleccioná una localidad
                </option>
            `;

            city.value = "";

            otherCity.value = "";

            carrier.value = "";

            cityGroup.hidden =
                true;

            otherCityGroup.hidden =
                true;

            carrierGroup.hidden =
                true;

            city.required =
                false;

            otherCity.required =
                false;

            carrier.required =
                false;

            shippingSummary.hidden =
                true;

        }


        /* =====================================================
           MONEDA
        ===================================================== */

        function formatCurrency(value) {

            return Number(
                value
            ).toLocaleString(
                "es-AR",
                {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0
                }
            );

        }

    }
);