/* =========================================================
Menú de navegación mobile
========================================================= */


const hamburgerButton = document.getElementById("hamburger-icon");

const mobileNav = document.querySelector(".mobile-nav");

const mobileNavLinks = document.querySelectorAll(".mobile-nav a");


/* =========================================================
   ABRIR / CERRAR MENÚ
========================================================= */

hamburgerButton.addEventListener("click", () => {

    const isOpen = mobileNav.classList.toggle("active");

    hamburgerButton.setAttribute(
        "aria-expanded",
        isOpen
    );

    const icon = hamburgerButton.querySelector("i");


    /* Cambiar icono */

    if (isOpen) {

        icon.classList.remove("fa-bars");

        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");

        icon.classList.add("fa-bars");

    }

});


/* =========================================================
   CERRAR AL HACER CLICK EN UN ENLACE
========================================================= */

mobileNavLinks.forEach((link) => {

    link.addEventListener("click", () => {

        mobileNav.classList.remove("active");

        hamburgerButton.setAttribute(
            "aria-expanded",
            "false"
        );

        const icon = hamburgerButton.querySelector("i");

        icon.classList.remove("fa-xmark");

        icon.classList.add("fa-bars");

    });

});