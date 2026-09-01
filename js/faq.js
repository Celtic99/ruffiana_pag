
/* =========================================================
   RUFFIANA — PREGUNTAS FRECUENTES
   Navegación + enlaces externos al FAQ
========================================================= */


/* =========================================================
   FUNCIÓN PRINCIPAL
========================================================= */

function setActive(elementSelector, lineClass, contentSelector) {

    // Elementos del menú
    const menuItems = document.querySelectorAll(
        ".choose, .pay, .wrap, .ship"
    );


    // Sacar active de todos
    menuItems.forEach(function (item) {

        item.classList.remove("active");

        const icon = item.querySelector(".icon");

        if (icon) {
            icon.classList.remove("active");
        }

    });


    // Activar elemento seleccionado
    const selectedItem =
        document.querySelector(elementSelector);

    if (!selectedItem) {
        return;
    }


    selectedItem.classList.add("active");


    const selectedIcon =
        selectedItem.querySelector(".icon");

    if (selectedIcon) {
        selectedIcon.classList.add("active");
    }


    // Línea
    const line =
        document.querySelector("#line");

    if (line) {

        line.classList.remove(
            "one",
            "two",
            "three",
            "four"
        );

        line.classList.add(lineClass);

    }


    // Contenido
    const contents =
        document.querySelectorAll(
            "#first, #second, #third, #fourth"
        );


    contents.forEach(function (content) {

        content.classList.remove("active");

    });


    const selectedContent =
        document.querySelector(contentSelector);

    if (selectedContent) {

        selectedContent.classList.add("active");

    }

}


/* =========================================================
   BOTONES DEL FAQ
========================================================= */

const choose =
    document.querySelector(".choose");

const pay =
    document.querySelector(".pay");

const wrap =
    document.querySelector(".wrap");

const ship =
    document.querySelector(".ship");


if (choose) {

    choose.addEventListener("click", function () {

        setActive(
            ".choose",
            "one",
            "#first"
        );

    });

}


if (pay) {

    pay.addEventListener("click", function () {

        setActive(
            ".pay",
            "two",
            "#second"
        );

    });

}


if (wrap) {

    wrap.addEventListener("click", function () {

        setActive(
            ".wrap",
            "three",
            "#third"
        );

    });

}


if (ship) {

    ship.addEventListener("click", function () {

        setActive(
            ".ship",
            "four",
            "#fourth"
        );

    });

}


/* =========================================================
   ABRIR FAQ DESDE OTROS LINKS
========================================================= */

const parametros =
    new URLSearchParams(
        window.location.search
    );


const faq =
    parametros.get("faq");


if (faq === "compra") {

    setActive(
        ".choose",
        "one",
        "#first"
    );

}


if (faq === "pago") {

    setActive(
        ".pay",
        "two",
        "#second"
    );

}


if (faq === "envio") {

    setActive(
        ".wrap",
        "three",
        "#third"
    );

}


if (faq === "mayorista") {

    setActive(
        ".ship",
        "four",
        "#fourth"
    );

}


/* =========================================================
   SCROLL AUTOMÁTICO
========================================================= */

if (faq) {

    const faqContent =
        document.querySelector(
            ".faq-content"
        );


    if (faqContent) {

        setTimeout(function () {

            faqContent.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    }

}
