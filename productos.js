const productos = [

    //===== Relojes =====
    {
        nombre: "Reloj para Hombre",
        precio: 450000,
        imagen: "imagenes/reloj.jpg",
        categoria: "relojes"
    },

    //===== Smartwatch =====
    {
        nombre: "Smartwatch",
        precio: 150000,
        imagen: "imagenes/smartwatch.jpg",
        categoria: "smartwatch"
    },

    //===== Cargadores =====
    {
        nombre: "Cargador Samsung Tipo C",
        precio: 165000,
        imagen: "imagenes/cargador.jpg",
        categoria: "cargadores"
    },
    
    //===== Celulares =====
    {
        nombre: "Iphone 13 pro",
        precio: 2550000,
        imagen: "imagenes/iphone.jpg",
        categoria: "celulares"
    }
];

if (!
    localStorage.getItem("productos")
) {
    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );
}