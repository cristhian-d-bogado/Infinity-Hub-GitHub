const botonLogin = document.getElementById("btnLogin");
const correo = document.getElementById("correo");
const password = document.getElementById("password");

botonLogin.addEventListener("click", async function () {

    // Validar que los campos no estén vacíos
    if (correo.value === "" || password.value === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Validar que el correo tenga un @
    if (!correo.value.includes("@")) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }

    // ================= ADMINISTRADOR SUPABASE =================

    const { data: datosAdmin, error: errorAdmin } =
        await supabaseCliente.auth.signInWithPassword({
            email: correo.value,
            password: password.value
        });

    if (errorAdmin || !datosAdmin.user) {

        alert("Correo o contraseña de administrador incorrectos.");
        return;
    }

    alert("¡Bienvenido administrador!");

    localStorage.setItem("sesion", "activa");
    localStorage.setItem("tipoUsuario", "admin");

    window.location.href = "admin.html";

});



