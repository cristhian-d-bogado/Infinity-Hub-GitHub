const listaFavoritos = document.getElementById("lista-favoritos");

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

if (favoritos.length === 0) {

    listaFavoritos.innerHTML = "<p>No tienes productos favoritos.</p>";

} else {

    favoritos.forEach(function(producto) {

        const item = document.createElement("li");
        item.textContent = "❤️ " + producto;

        listaFavoritos.appendChild(item);

    });

}