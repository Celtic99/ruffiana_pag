document.querySelector(".choose").addEventListener("click", function () {
    setActive(".choose", "one", "#first");
});

document.querySelector(".pay").addEventListener("click", function () {
    setActive(".pay", "two", "#second");
});

document.querySelector(".wrap").addEventListener("click", function () {
    setActive(".wrap", "three", "#third");
});

document.querySelector(".ship").addEventListener("click", function () {
    setActive(".ship", "four", "#fourth");
});


function setActive(elementSelector, lineClass, contentSelector) {

    // Elementos del menú
    const menuItems = document.querySelectorAll(".choose, .pay, .wrap, .ship");

    // Sacar active de todos
    menuItems.forEach(function (item) {
        item.classList.remove("active");

        const icon = item.querySelector(".icon");

        if (icon) {
            icon.classList.remove("active");
        }
    });

    // Activar elemento seleccionado
    const selectedItem = document.querySelector(elementSelector);
    selectedItem.classList.add("active");

    const selectedIcon = selectedItem.querySelector(".icon");

    if (selectedIcon) {
        selectedIcon.classList.add("active");
    }


    // Línea
    const line = document.querySelector("#line");

    line.classList.remove("one", "two", "three", "four");
    line.classList.add(lineClass);


    // Contenido
    const contents = document.querySelectorAll(
        "#first, #second, #third, #fourth"
    );

    contents.forEach(function (content) {
        content.classList.remove("active");
    });

    document.querySelector(contentSelector).classList.add("active");
}