const listaProductos = document.getElementById("lista-productos");

async function cargarProductosDesdeSupabase() {

    if (!listaProductos) return;

    const { data: productosSupabase, error } =
        await supabaseCliente
            .from("productos")
            .select("*")
            .order("id", { ascending: true });

    if (error) {
        console.error("Error al cargar productos:", error);
        return;
    }

    listaProductos.innerHTML = "";

    productosSupabase.forEach(function(producto) {

        

        const estaAgotado =
            producto.disponible === false;

        const imagenPrincipal =
            Array.isArray(producto.imagenes) &&
            producto.imagenes.length > 0
                ? producto.imagenes[0]
                : "";

        listaProductos.innerHTML += `
            <div 
                class="producto ${estaAgotado ? "producto-agotado" : ""}"
                data-categoria="${(producto.categoria || "").toLowerCase()}"
                data-descripcion="${producto.descripcion || ""}"
                data-imagenes='${JSON.stringify(producto.imagenes || [])}'
            >

                <img
                    src="${imagenPrincipal}"
                    alt="${producto.nombre}"
                >

                <h3>${producto.nombre}</h3>

                <p>
                    Precio: Gs. ${Number(producto.precio).toLocaleString("es-PY")}
                </p>

                <p class="disponibilidad-producto ${
                    estaAgotado
                        ? "estado-agotado"
                        : "estado-disponible"
                }">
                    ${
                        estaAgotado
                            ? "🔴 Agotado"
                            : "🟢 Disponible"
                    }
                </p>

                <button 
                    class="comprar"
                    ${estaAgotado ? "disabled" : ""}
                >
                    ${
                        estaAgotado
                            ? "❌ Producto agotado"
                            : "🛒 Agregar al carrito"
                    }
                </button>

                <button class="favorito">
                    🩷 Favorito
                </button>

            </div>
        `;
    });


    actualizarCarrito();
}


cargarProductosDesdeSupabase();


setInterval(function () {
    cargarProductosDesdeSupabase();
}, 5000);



// ================= CARRITO DEL VISITANTE =================

const claveCarrito = "carrito_invitado";

const claveTotalCompra = "totalCompra_invitado";

const claveCantidadProductos = "cantidadProductos_invitado";

let carrito = 0;
let totalCompra = 0;
let productosCarrito = [];
let cantidades = {};

const contador = document.getElementById("cantidad");
const contadorHeader = document.getElementById("cantidadHeader");

const total = document.getElementById("total");
const listaCarrito = document.getElementById("lista-carrito");

const carritoGuardado =
    localStorage.getItem(claveCarrito);

if (carritoGuardado) {
    cantidades = JSON.parse(carritoGuardado);

    

    totalCompra =
    Number(localStorage.getItem(claveTotalCompra)) || 0;

carrito =
    Number(localStorage.getItem(claveCantidadProductos)) || 0;

    contador.textContent = carrito;
    contadorHeader.textContent = carrito;
    total.textContent = totalCompra.toLocaleString("es-PY");

    actualizarCarrito();
}



document.addEventListener("click", function(event) {

    const boton = event.target.closest(".comprar");

    if (!boton) {
        return;
    }

    const textoOriginal = boton.textContent;

    boton.textContent = "✅ Agregado";
    boton.classList.add("boton-agregado");
    boton.disabled = true;

    setTimeout(function () {
        boton.textContent = textoOriginal;
        boton.classList.remove("boton-agregado");
        boton.disabled = false;
    }, 1000);

    const tarjeta = boton.closest(".producto");

    const nombre = tarjeta.querySelector("h3").textContent;

    const precioTexto = tarjeta.querySelector("p").textContent;
    const precio = Number(precioTexto.replace(/\D/g, ""));

    carrito++;
    totalCompra += precio;

    contador.textContent = carrito;
    contadorHeader.textContent = carrito;
    total.textContent = totalCompra.toLocaleString("es-PY");

    productosCarrito.push(nombre);

    if (cantidades[nombre]) {
        cantidades[nombre]++;
    } else {
        cantidades[nombre] = 1;
    }

    actualizarCarrito();

    localStorage.setItem(
        claveCarrito,
        JSON.stringify(cantidades)
    );

    localStorage.setItem(
        claveTotalCompra,
        totalCompra
    );

    localStorage.setItem(
        claveCantidadProductos,
        carrito
    );

});




const botonVaciar = document.getElementById("vaciar-carrito");
if (botonVaciar) {
    botonVaciar.addEventListener("click", function () {
    carrito = 0;
    totalCompra = 0;

    contador.textContent = 0;
contadorHeader.textContent = 0;
total.textContent = 0;
    listaCarrito.innerHTML = "";
        
        cantidades = {};
        localStorage.removeItem(claveCarrito);
localStorage.removeItem(claveTotalCompra);
localStorage.removeItem(claveCantidadProductos);
});
}


function actualizarCarrito() {

    listaCarrito.innerHTML = "";

    for (let nombre in cantidades) {

        const tarjetasProductos =
    document.querySelectorAll(".producto");

const tarjetaEncontrada =
    Array.from(tarjetasProductos).find(function(tarjeta) {

        const titulo = tarjeta.querySelector("h3");

        return titulo &&
            titulo.textContent.trim() === nombre.trim();
    });

if (!tarjetaEncontrada) {

    // Puede ocurrir mientras Supabase todavía está cargando.
    // No eliminamos el producto del carrito.
    continue;
}

const precioTexto =
    tarjetaEncontrada.querySelector("p").textContent;

const precio =
    Number(precioTexto.replace(/\D/g, ""));


        const producto =
            document.createElement("li");

        producto.textContent =
            `${nombre} × ${cantidades[nombre]}`;

        const botonEliminar =
            document.createElement("button");

        botonEliminar.textContent = "❌";

        botonEliminar.addEventListener(
            "click",
            function () {

                if (!cantidades[nombre]) {
                    return;
                }

                cantidades[nombre]--;

                carrito--;

                totalCompra -= precio;

                if (cantidades[nombre] <= 0) {
                    delete cantidades[nombre];
                }

                if (carrito < 0) {
                    carrito = 0;
                }

                if (totalCompra < 0) {
                    totalCompra = 0;
                }

                contador.textContent = carrito;
                contadorHeader.textContent = carrito;

                total.textContent =
                    totalCompra.toLocaleString("es-PY");

                localStorage.setItem(
                    claveCarrito,
                    JSON.stringify(cantidades)
                );

                localStorage.setItem(
                    claveTotalCompra,
                    totalCompra
                );

                localStorage.setItem(
                    claveCantidadProductos,
                    carrito
                );

                actualizarCarrito();
            }
        );

        producto.appendChild(botonEliminar);

        listaCarrito.appendChild(producto);
    }
}





const buscador = document.getElementById("buscar");

if (buscador) {

    buscador.addEventListener("keyup", function () {

        const texto = buscador.value.toLowerCase().trim();

        const tarjetasProductos =
            document.querySelectorAll(".producto");

        tarjetasProductos.forEach(function(producto) {

            const nombre =
                producto.querySelector("h3")
                    .textContent
                    .toLowerCase();

            if (nombre.includes(texto)) {
                producto.style.display = "block";
            } else {
                producto.style.display = "none";
            }

        });

    });

}



const botonesCategorias = document.querySelectorAll(".categorias button");

botonesCategorias.forEach(function (boton) {

    boton.addEventListener("click", function () {

        botonesCategorias.forEach(function (btn) {
    btn.classList.remove("activo");
});

boton.classList.add("activo");

        const categoria = boton.dataset.categoria;


        const tarjetasProductos = document.querySelectorAll(".producto");

        

        tarjetasProductos.forEach(function (producto) {




            const categoriaProducto =
    (producto.dataset.categoria || "")
        .toLowerCase()
        .trim();

const categoriaSeleccionada =
    (categoria || "")
        .toLowerCase()
        .trim();

if (
    categoriaSeleccionada === "todos" ||
    categoriaProducto === categoriaSeleccionada
) {
    producto.style.display = "block";
} else {
    producto.style.display = "none";
}

        });

    });

});


const slides = document.querySelectorAll(".slide");

let slideActual = 0;

function cambiarSlide() {

    slides[slideActual].classList.remove("activo");

    slideActual++;

    if (slideActual >= slides.length) {
        slideActual = 0;
    }

    slides[slideActual].classList.add("activo");

}

setInterval(cambiarSlide, 3000);


const modal = document.getElementById("modal");
const modalImagen = document.getElementById("modal-imagen");
const modalTitulo = document.getElementById("modal-titulo");
const modalPrecio = document.getElementById("modal-precio");
const modalDescripcion = document.getElementById("modal-descripcion");
const cerrarModal = document.getElementById("cerrar-modal");

const botonAnterior = document.getElementById("imagen-anterior");
const botonSiguiente = document.getElementById("imagen-siguiente");
const indicadorImagenes = document.getElementById("indicador-imagenes");

let imagenesModal = [];
let indiceImagenActual = 0;


function actualizarImagenModal() {

    modalImagen.src = imagenesModal[indiceImagenActual];

    indicadorImagenes.textContent =
        `${indiceImagenActual + 1} / ${imagenesModal.length}`;

    if (imagenesModal.length <= 1) {

        botonAnterior.style.display = "none";
        botonSiguiente.style.display = "none";
        indicadorImagenes.style.display = "none";

    } else {

        botonAnterior.style.display = "block";
        botonSiguiente.style.display = "block";
        indicadorImagenes.style.display = "block";
    }
}


document.addEventListener("click", function(event) {

    const imagen = event.target.closest(".producto img");

    if (!imagen) {
        return;
    }

    event.preventDefault();

    const productoHTML = imagen.closest(".producto");

    const nombreProducto =
        productoHTML.querySelector("h3").textContent;

    modalTitulo.textContent = nombreProducto;

    modalPrecio.textContent =
        productoHTML.querySelector("p").textContent;

        modalDescripcion.textContent =
    productoHTML.dataset.descripcion || "";

    const descripcion =
        productoHTML.dataset.descripcion || "";

    const imagenesTexto =
        productoHTML.dataset.imagenes || "[]";

    try {
        imagenesModal = JSON.parse(imagenesTexto);
    } catch (error) {
        imagenesModal = [imagen.src];
    }

    if (
        !Array.isArray(imagenesModal) ||
        imagenesModal.length === 0
    ) {
        imagenesModal = [imagen.src];
    }

    indiceImagenActual = 0;

    actualizarImagenModal();

    modal.style.display = "block";

});


botonAnterior.addEventListener("click", function(event) {

    event.stopPropagation();

    indiceImagenActual--;

    if (indiceImagenActual < 0) {
        indiceImagenActual = imagenesModal.length - 1;
    }

    actualizarImagenModal();
});


botonSiguiente.addEventListener("click", function(event) {

    event.stopPropagation();

    indiceImagenActual++;

    if (indiceImagenActual >= imagenesModal.length) {
        indiceImagenActual = 0;
    }

    actualizarImagenModal();
});


cerrarModal.addEventListener("click", function() {

    modal.style.display = "none";

});


window.addEventListener("click", function(event) {

    if (event.target === modal) {

        modal.style.display = "none";

    }

});




// ================= FAVORITOS =================

const claveFavoritos = "favoritos_invitado";

let favoritos =
    JSON.parse(localStorage.getItem(claveFavoritos)) || [];


const botonesFavoritos = document.querySelectorAll(".favorito");
const listaFavoritos = document.getElementById("lista-favoritos");

function mostrarFavoritos() {

    if (!listaFavoritos) return;

    listaFavoritos.innerHTML = "";

    favoritos.forEach(function(nombre, indice) {

        const li = document.createElement("li");

        li.innerHTML = `
            ${nombre}
            <button class="eliminar-favorito" data-indice="${indice}">❌</button>
        `;

        listaFavoritos.appendChild(li);

    });

    const botonesEliminar = document.querySelectorAll(".eliminar-favorito");

    botonesEliminar.forEach(function(boton) {

        boton.addEventListener("click", function() {

            const indice = Number(boton.dataset.indice);

            favoritos.splice(indice, 1);

            localStorage.setItem(
    claveFavoritos,
    JSON.stringify(favoritos)
);

            mostrarFavoritos();

        });

    });

}

document.addEventListener("click", function(event) {

    const boton = event.target.closest(".favorito");

    if (!boton) {
        return;
    }

    const producto = boton.closest(".producto");
    const nombre = producto.querySelector("h3").textContent;

    if (!favoritos.includes(nombre)) {

        favoritos.push(nombre);

        localStorage.setItem(
            claveFavoritos,
            JSON.stringify(favoritos)
        );

        mostrarFavoritos();

        alert("❤️ " + nombre + " fue agregado a favoritos.");

    } else {

        alert("Este producto ya está en favoritos.");

    }

});

mostrarFavoritos();



// ================= MODO OSCURO =================

const botonModo = document.getElementById("modo-oscuro");

if (localStorage.getItem("modo") === "oscuro") {
    document.body.classList.add("oscuro");
    botonModo.textContent = "☀️";
}

botonModo.addEventListener("click", function () {

    document.body.classList.toggle("oscuro");

    if (document.body.classList.contains("oscuro")) {
        localStorage.setItem("modo", "oscuro");
        botonModo.textContent = "☀️";
    } else {
        localStorage.setItem("modo", "claro");
        botonModo.textContent = "🌙";
    }

});


// ================= CARRITO LATERAL =================

const botonCarrito = document.getElementById("abrir-carrito");
const panelCarrito = document.getElementById("carrito");
const fondoCarrito = document.getElementById("fondo-carrito");


botonCarrito.addEventListener("click", function () {

    panelCarrito.classList.toggle("abierto");
    fondoCarrito.classList.toggle("activo");

});


const botonCerrarCarrito = document.getElementById("cerrar-carrito");

botonCerrarCarrito.addEventListener("click", function () {

    panelCarrito.classList.remove("abierto");
    fondoCarrito.classList.remove("activo");

});

fondoCarrito.addEventListener("click", function () {

    panelCarrito.classList.remove("abierto");
    fondoCarrito.classList.remove("activo");

});





const botonFinalizar = document.getElementById("finalizar-compra");

if (botonFinalizar) {

    botonFinalizar.addEventListener("click", function () {

        if (carrito === 0 || Object.keys(cantidades).length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        let mensaje = "🛒 PEDIDO INFINITY HUB\n\n";

        for (let nombre in cantidades) {

            const cantidad = cantidades[nombre];

            mensaje +=
                "• " + nombre +
                " - Cantidad: " + cantidad +
                "\n";
        }

        mensaje +=
            "\n💰 Total: Gs. " +
            totalCompra.toLocaleString("es-PY") +
            "\n\n" +
            "Hola, quiero realizar este pedido. ¿Sigue disponible?";

        const numeroWhatsApp = "595983157394";

        const enlaceWhatsApp =
            "https://wa.me/" +
            numeroWhatsApp +
            "?text=" +
            encodeURIComponent(mensaje);

        window.open(enlaceWhatsApp, "_blank");

    });

}



// ================= ACTUALIZACIÓN AUTOMÁTICA DE PRODUCTOS =================

window.addEventListener("storage", function(event) {

    if (event.key === "productos") {

        location.reload();

    }

});


