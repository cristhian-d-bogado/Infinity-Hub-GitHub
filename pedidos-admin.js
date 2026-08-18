

const listaPedidos = document.getElementById("lista-pedidos");

const pedidosGuardados =
    JSON.parse(localStorage.getItem("pedidos")) || [];


if (pedidosGuardados.length > 0) {

    listaPedidos.innerHTML = "";

    pedidosGuardados.forEach(function(pedido) {

        let productosHTML = "";

        for (let nombre in pedido.productosPedido) {

            const cantidad = pedido.productosPedido[nombre];

            productosHTML += `
                <p>${nombre} × ${cantidad}</p>
            `;
        }


        listaPedidos.innerHTML += `
    <div class="pedido-admin">

        <div class="pedido-admin-header">

            <div>
                <h3>Pedido #${pedido.numeroPedido}</h3>

                <p>
                    Estado:
                    <span class="estado-pedido ${pedido.estado || "Pendiente"}">
                        ${pedido.estado || "Pendiente"}
                    </span>
                </p>
            </div>

            <div class="acciones-pedido">

                ${(pedido.estado || "Pendiente") === "Pendiente" ? `
                    <button onclick="cambiarEstado(${pedidosGuardados.indexOf(pedido)}, 'Confirmado')">
                        Confirmar pedido
                    </button>
                ` : ""}

                ${pedido.estado === "Confirmado" ? `
                    <button onclick="cambiarEstado(${pedidosGuardados.indexOf(pedido)}, 'Enviado')">
                        Marcar como enviado
                    </button>
                ` : ""}

                ${pedido.estado === "Enviado" ? `
                    <button onclick="cambiarEstado(${pedidosGuardados.indexOf(pedido)}, 'Entregado')">
                        Marcar como entregado
                    </button>
                ` : ""}

                <button
                    class="btn-eliminar-pedido"
                    onclick="eliminarPedido(${pedidosGuardados.indexOf(pedido)})"
                >
                    Eliminar pedido
                </button>

            </div>

        </div>


        <div class="pedido-admin-grid">

            <div class="pedido-bloque">
                <h4>Cliente</h4>

                <p><strong>Nombre:</strong> ${pedido.clientePedido.nombre}</p>
                <p><strong>Correo:</strong> ${pedido.clientePedido.correo}</p>
                <p><strong>Teléfono:</strong> ${pedido.clientePedido.telefono}</p>
            </div>


            <div class="pedido-bloque">
                <h4>Dirección de entrega</h4>

                <p><strong>Departamento:</strong> ${pedido.clientePedido.departamento}</p>
                <p><strong>Ciudad:</strong> ${pedido.clientePedido.ciudad}</p>
                <p><strong>Barrio:</strong> ${pedido.clientePedido.barrio}</p>
                <p><strong>Dirección:</strong> ${pedido.clientePedido.direccion}</p>
                <p><strong>Referencia:</strong> ${pedido.clientePedido.referencia || "Sin referencia"}</p>
                <p><strong>Método de pago:</strong> ${pedido.clientePedido.metodoPago}</p>
            </div>

        </div>


        <div class="pedido-bloque productos-pedido-admin">

            <h4>Productos</h4>

            ${productosHTML}

            <p class="total-pedido-admin">
                <strong>
                    Total: Gs. ${Number(pedido.totalPedido).toLocaleString("es-PY")}
                </strong>
            </p>

        </div>

    </div>
`;

    });

} else {

    listaPedidos.innerHTML = `
        <p>No hay pedidos realizados.</p>
    `;
}



function cambiarEstado(indice, nuevoEstado) {

    const pedidos =
        JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos[indice].estado = nuevoEstado;

    localStorage.setItem(
        "pedidos",
        JSON.stringify(pedidos)
    );

    location.reload();
}





function eliminarPedido(indice) {

    const pedidos =
        JSON.parse(localStorage.getItem("pedidos")) || [];

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este pedido?"
    );

    if (!confirmar) {
        return;
    }

    pedidos.splice(indice, 1);

    localStorage.setItem(
        "pedidos",
        JSON.stringify(pedidos)
    );

    location.reload();
}