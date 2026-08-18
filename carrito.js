function agregarAlCarrito(nombre, precio) {

    let cantidades = JSON.parse(localStorage.getItem("carrito")) || {};

    if (cantidades[nombre]) {
        cantidades[nombre]++;
    } else {
        cantidades[nombre] = 1;
    }

    localStorage.setItem("carrito", JSON.stringify(cantidades));

    let totalCompra = Number(localStorage.getItem("totalCompra")) || 0;
    totalCompra += precio;
    localStorage.setItem("totalCompra", totalCompra);

    let cantidadProductos = Number(localStorage.getItem("cantidadProductos")) || 0;
    cantidadProductos++;
    localStorage.setItem("cantidadProductos", cantidadProductos);
}