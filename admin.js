// ================= PROTEGER PANEL ADMIN =================

async function verificarAdministrador() {

    const { data, error } =
        await supabaseCliente.auth.getUser();

    if (
        error ||
        !data.user ||
        localStorage.getItem("tipoUsuario") !== "admin"
    ) {

        localStorage.removeItem("sesion");
        localStorage.removeItem("tipoUsuario");

        alert("Acceso solo para administrador.");

        window.location.href = "login.html";

        return;
    }
}

verificarAdministrador();


let indiceEditar = -1;

const formulario = document.getElementById("form-producto");

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const archivos = document.getElementById("imagen").files;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const disponibilidad =
        document.getElementById("disponibilidad").value;

    try {

        // =========================================
        // PRODUCTO NUEVO: necesita al menos 1 foto
        // =========================================

        if (
            indiceEditar === -1 &&
            archivos.length === 0
        ) {
            alert("Selecciona al menos una imagen.");
            return;
        }

        // =========================================
        // COMPROBAR MÁXIMO DE 5 IMÁGENES
        // =========================================

        const cantidadImagenesActuales =
            indiceEditar !== -1
                ? imagenesEditando.length
                : 0;

        if (
            cantidadImagenesActuales +
            archivos.length >
            5
        ) {
            alert("El producto puede tener como máximo 5 imágenes.");
            return;
        }

        // Si estás editando, no permitimos guardar
        // un producto sin ninguna imagen.
        if (
            indiceEditar !== -1 &&
            imagenesEditando.length === 0 &&
            archivos.length === 0
        ) {
            alert("El producto debe tener al menos una imagen.");
            return;
        }

        const urlsImagenesNuevas = [];

        // =========================================
        // SUBIR NUEVAS IMÁGENES
        // =========================================

        for (let i = 0; i < archivos.length; i++) {

            const archivo = archivos[i];

            const nombreArchivo =
                Date.now() +
                "-" +
                i +
                "-" +
                archivo.name.replace(/\s+/g, "-");

            const { error: errorImagen } =
                await supabaseCliente.storage
                    .from("productos")
                    .upload(nombreArchivo, archivo);

            if (errorImagen) {

                console.error(errorImagen);

                alert("Error al subir una de las imágenes.");

                return;
            }

            const { data: urlData } =
                supabaseCliente.storage
                    .from("productos")
                    .getPublicUrl(nombreArchivo);

            urlsImagenesNuevas.push(
                urlData.publicUrl
            );
        }

        // =========================================
        // UNIR LAS FOTOS QUE QUEDARON + NUEVAS
        // =========================================

        let todasLasImagenes = [];

        if (indiceEditar === -1) {

            todasLasImagenes =
                urlsImagenesNuevas;

        } else {

            todasLasImagenes = [
                ...imagenesEditando,
                ...urlsImagenesNuevas
            ];
        }

        const productoGuardado = {
            nombre: nombre,
            precio: Number(precio),
            descripcion: descripcion,
            categoria: categoria,
            imagenes: todasLasImagenes,
            disponible:
                disponibilidad === "Disponible"
        };

        let errorGuardado;

        // =========================================
        // AGREGAR PRODUCTO
        // =========================================

        if (indiceEditar === -1) {

            const { error } =
                await supabaseCliente
                    .from("productos")
                    .insert([productoGuardado]);

            errorGuardado = error;

        // =========================================
        // ACTUALIZAR PRODUCTO
        // =========================================

        } else {

            const { error } =
                await supabaseCliente
                    .from("productos")
                    .update(productoGuardado)
                    .eq("id", indiceEditar);

            errorGuardado = error;
        }

        if (errorGuardado) {

            console.error(errorGuardado);

            alert("Error al guardar el producto.");

            return;
        }

        // =========================================
        // BORRAR DEL STORAGE LAS FOTOS MARCADAS ❌
        // =========================================

        if (
            indiceEditar !== -1 &&
            imagenesEliminar.length > 0
        ) {

            const archivosEliminar =
                imagenesEliminar
                    .map(function(url) {

                        const partes =
                            url.split("/productos/");

                        if (partes.length < 2) {
                            return null;
                        }

                        return decodeURIComponent(
                            partes[1]
                        );
                    })
                    .filter(Boolean);

            if (archivosEliminar.length > 0) {

                const { error: errorBorrarImagenes } =
                    await supabaseCliente.storage
                        .from("productos")
                        .remove(archivosEliminar);

                if (errorBorrarImagenes) {

                    console.error(
                        "Error al borrar imágenes:",
                        errorBorrarImagenes
                    );
                }
            }
        }

        // =========================================
        // MENSAJE
        // =========================================

        if (indiceEditar === -1) {

            alert("Producto agregado correctamente.");

        } else {

            alert("Producto actualizado correctamente.");
        }

        // =========================================
        // LIMPIAR EDICIÓN
        // =========================================

        indiceEditar = -1;

        imagenesEditando = [];
        imagenesEliminar = [];

        formulario.reset();

        const contenedorImagenes =
            document.getElementById("imagenes-actuales");

        if (contenedorImagenes) {
            contenedorImagenes.innerHTML = "";
        }

        mostrarProductos();

    } catch (error) {

        console.error(error);

        alert("Ocurrió un error al guardar el producto.");
    }

});


async function mostrarProductos() {

    const lista = document.getElementById("lista-admin");

    const { data: productos, error } =
        await supabaseCliente
            .from("productos")
            .select("*")
            .order("id", { ascending: true });

    if (error) {
        console.error("Error al cargar productos en admin:", error);
        lista.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

    lista.innerHTML = "";

    productos.forEach(function(producto) {

        const imagenPrincipal =
            Array.isArray(producto.imagenes) &&
            producto.imagenes.length > 0
                ? producto.imagenes[0]
                : "";

        lista.innerHTML += `
            <div class="producto-admin">

                <img 
                    src="${imagenPrincipal}" 
                    alt="${producto.nombre}"
                    style="width:80px;height:80px;object-fit:cover;"
                >

                <h3>${producto.nombre}</h3>

                <p>
                    Precio: Gs. ${Number(producto.precio).toLocaleString("es-PY")}
                </p>

                <p>
                    Categoría: ${producto.categoria || ""}
                </p>

                <p>
                    Estado:
                    <strong>
                        ${producto.disponible ? "Disponible" : "Agotado"}
                    </strong>
                </p>

                <button onclick="editarProducto(${producto.id})">
                    Editar
                </button>

                <button onclick="eliminarProducto(${producto.id})">
                    Eliminar
                </button>

            </div>
        `;
    });

}

async function eliminarProducto(id) {

    const confirmar =
        confirm("¿Seguro que quieres eliminar este producto?");

    if (!confirmar) {
        return;
    }

    const { data: producto, error: errorProducto } =
        await supabaseCliente
            .from("productos")
            .select("imagenes")
            .eq("id", id)
            .single();

    if (errorProducto) {
        console.error(errorProducto);
        alert("No se pudo cargar el producto para eliminarlo.");
        return;
    }

    const { error: errorEliminar } =
        await supabaseCliente
            .from("productos")
            .delete()
            .eq("id", id);

    if (errorEliminar) {
        console.error(errorEliminar);
        alert("No se pudo eliminar el producto.");
        return;
    }

    if (
        producto &&
        Array.isArray(producto.imagenes) &&
        producto.imagenes.length > 0
    ) {

        const nombresArchivos =
            producto.imagenes.map(function(url) {

                const partes =
                    url.split("/productos/");

                return partes[1];
            }).filter(Boolean);

        if (nombresArchivos.length > 0) {

            const { error: errorImagenes } =
                await supabaseCliente.storage
                    .from("productos")
                    .remove(nombresArchivos);

            if (errorImagenes) {
                console.error(
                    "El producto se eliminó, pero hubo un problema al borrar sus imágenes:",
                    errorImagenes
                );
            }
        }
    }

    alert("Producto eliminado correctamente.");

    mostrarProductos();
}

let imagenesEditando = [];
let imagenesEliminar = [];

async function editarProducto(id) {

    const { data: producto, error } =
        await supabaseCliente
            .from("productos")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        console.error("Error al cargar producto:", error);
        alert("No se pudo cargar el producto.");
        return;
    }

    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("descripcion").value =
        producto.descripcion || "";
    document.getElementById("categoria").value =
        producto.categoria || "";

    document.getElementById("disponibilidad").value =
        producto.disponible ? "Disponible" : "Agotado";

    indiceEditar = id;

    imagenesEditando =
        Array.isArray(producto.imagenes)
            ? [...producto.imagenes]
            : [];

    imagenesEliminar = [];

    mostrarImagenesActuales();
}


function mostrarImagenesActuales() {

    const contenedor =
        document.getElementById("imagenes-actuales");

    contenedor.innerHTML = "";

    imagenesEditando.forEach(function(url, indice) {

        const bloque = document.createElement("div");

        bloque.classList.add("imagen-admin-actual");

        bloque.innerHTML = `
            <img src="${url}" alt="Imagen del producto">

            <button
                type="button"
                class="eliminar-imagen-actual"
                data-indice="${indice}"
            >
                ❌
            </button>
        `;

        contenedor.appendChild(bloque);




        const botonEliminar =
    bloque.querySelector(".eliminar-imagen-actual");

botonEliminar.addEventListener("click", function() {

    const urlEliminada = imagenesEditando[indice];

    imagenesEliminar.push(urlEliminada);

    imagenesEditando.splice(indice, 1);

    mostrarImagenesActuales();
});



    });
}

mostrarProductos();



const botonCerrarSesionAdmin =
    document.getElementById("cerrar-sesion-admin");

botonCerrarSesionAdmin.addEventListener("click", async function() {

    const { error } =
        await supabaseCliente.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error);
        alert("No se pudo cerrar la sesión correctamente.");
        return;
    }

    localStorage.removeItem("sesion");
    localStorage.removeItem("tipoUsuario");

    alert("Sesión cerrada correctamente.");

    window.location.href = "login.html";

});


// ================= MODO OSCURO ADMIN =================

const botonModoAdmin = document.getElementById("modo-oscuro-admin");

// Revisar si el modo oscuro ya estaba activado
if (localStorage.getItem("modo") === "oscuro") {

    document.body.classList.add("oscuro-admin");

    botonModoAdmin.textContent = "☀️";
}

// Cambiar entre modo claro y oscuro
botonModoAdmin.addEventListener("click", function () {

    document.body.classList.toggle("oscuro-admin");

    if (document.body.classList.contains("oscuro-admin")) {

        localStorage.setItem("modo", "oscuro");

        botonModoAdmin.textContent = "☀️";

    } else {

        localStorage.setItem("modo", "claro");

        botonModoAdmin.textContent = "🌙";
    }

});