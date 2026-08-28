const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbyJmHD7mFmCHyWDuGD_AlezRmKaC6bTWz3HldnoF7Ke3vJ3OkstNMGnhtxJEZW2aCwx/exec';

// Lista de productos del catálogo
const productos = [
    { id: 1, nombre: "Remera Oversize", precio: 220, imagen: "https://via.placeholder.com/200" },
    { id: 2, nombre: "Pantalón Wide Leg", precio: 450, imagen: "https://via.placeholder.com/200" },
    { id: 3, nombre: "Buzo Cropped", precio: 650, imagen: "https://via.placeholder.com/200" },
    { id: 4, nombre: "Campera Denim", precio: 550, imagen: "https://via.placeholder.com/200" },
    { id: 5, nombre: "Top Urbano", precio: 180, imagen: "https://via.placeholder.com/200" },
    { id: 6, nombre: "Short Sastrero", precio: 150, imagen: "https://via.placeholder.com/200" }
];

let carrito = [];
let comisionActual = 0; // Guarda los centavos de validación

// Mostrar el catálogo en pantalla
function cargarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    productos.forEach(prod => {
        contenedor.innerHTML += `
            <div class="tarjeta-producto">
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p style="font-weight: bold; color: #fff;">$${prod.precio.toLocaleString('es-AR')}</p>
                <label>Talle: </label>
                <select id="talle-${prod.id}">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                </select>
                <br><br>
                <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
            </div>
        `;
    });

    // Si ya se registró un pedido en esta sesión, ocultamos el formulario y mostramos el cartel de éxito
    if (sessionStorage.getItem("pedido_bloqueado") === "true") {
        bloquearTiendaPorPedidoRealizado();
    }
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
    if (sessionStorage.getItem("pedido_bloqueado") === "true") return;

    const prod = productos.find(p => p.id === id);
    const talleElegido = document.getElementById(`talle-${id}`).value;

    carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        talle: talleElegido
    });

    actualizarCarritoUI();
}

// Eliminar un producto puntual del carrito por índice
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// Vaciar carrito completo
function vaciarCarrito() {
    carrito = [];
    comisionActual = 0;
    actualizarCarritoUI();
}

// Actualizar lista, subtotal, comisión y total exacto
function actualizarCarritoUI() {
    const ulCarrito = document.getElementById("carrito");
    const inputMonto = document.getElementById("input-monto");
    const textoSubtotal = document.getElementById("texto-subtotal");
    const textoComision = document.getElementById("texto-comision");

    if (ulCarrito) ulCarrito.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((item, index) => {
        subtotal += item.precio;
        if (ulCarrito) {
            ulCarrito.innerHTML += `
                <li>
                    <span>- ${item.nombre} (Talle ${item.talle})</span>
                    <div>
                        <strong style="color: #00ffcc;">$${item.precio.toLocaleString('es-AR')}</strong>
                        <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">X</button>
                    </div>
                </li>
            `;
        }
    });

    if (subtotal > 0) {
        if (comisionActual === 0) {
            comisionActual = (Math.floor(Math.random() * 90) + 10) / 100;
        }
    } else {
        comisionActual = 0;
    }

    const totalConComision = subtotal + comisionActual;

    if (textoSubtotal) textoSubtotal.innerText = `$${subtotal.toLocaleString('es-AR')}`;
    if (textoComision) textoComision.innerText = `$${comisionActual.toFixed(2)}`;
    if (inputMonto) {
        if (subtotal === 0) {
            inputMonto.value = "$0";
        } else {
            const partes = totalConComision.toFixed(2).split('.');
            const enteroFormateado = parseInt(partes[0], 10).toLocaleString('es-AR');
            inputMonto.value = `$${enteroFormateado},${partes[1]}`;
        }
    }
}

// Muestra el cartel de éxito en la sección de checkout una vez procesado el pedido
function bloquearTiendaPorPedidoRealizado() {
    sessionStorage.setItem("pedido_bloqueado", "true");
    
    const checkoutSection = document.getElementById("checkout-section");
    if (checkoutSection) {
        checkoutSection.innerHTML = `
            <div style="background-color: #111; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #00ffcc; margin-top: 20px;">
                <h3 style="color: #00ffcc; margin-top: 0;">¡Pedido Registrado con Éxito!</h3>
                <p style="color: #ddd; font-size: 14px;">Ya generaste un pedido en esta sesión.</p>
                <button onclick="sessionStorage.clear(); location.reload();" style="background-color: #00ffcc; color: #000; border: none; padding: 10px 20px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    Hacer otro pedido
                </button>
            </div>
        `;
    }
}

// Confirmar pedido enviando los datos y respetando la comisión de la web
function confirmarPedido() {
    if (sessionStorage.getItem("pedido_bloqueado") === "true") {
        alert("Ya has registrado un pedido en esta sesión.");
        return;
    }

    const inputTitular = document.getElementById("input-titular");
    const inputWsp = document.getElementById("input-wsp");
    const btnWhatsapp = document.getElementById("btn-whatsapp");

    const nombreTitular = inputTitular ? inputTitular.value.trim() : "";
    const numeroWsp = inputWsp ? inputWsp.value.trim() : "";

    if (!nombreTitular || !numeroWsp) {
        alert("Por favor completá tu nombre y número de WhatsApp.");
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío. Seleccioná un producto antes de continuar.");
        return;
    }

    const itemsParaEnviar = carrito.map(item => ({
        id: item.id,
        talle: item.talle
    }));

    const datosPedido = {
        titular: nombreTitular,
        whatsapp: numeroWsp,
        items: itemsParaEnviar,
        comisionWeb: comisionActual
    };

    if (btnWhatsapp) {
        btnWhatsapp.innerText = "Registrando pedido...";
        btnWhatsapp.disabled = true;
    }

    fetch(URL_API_GOOGLE, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(datosPedido)
    })
    .then(res => res.json())
    .then(datos => {
        if (!datos.exito) throw new Error("Error en el servidor");

        let mensaje = `Hola, quiero confirmar mi pedido:\n\n`;
        carrito.forEach(p => { mensaje += `- ${p.nombre} (Talle ${p.talle})\n`; });
        mensaje += `\nSubtotal: $${datos.subtotalReal}`;
        mensaje += `\nComisión de validación: $${datos.comision}`;
        mensaje += `\n---------------------------------`;
        mensaje += `\nMONTO TOTAL A TRANSFERIR: $${datos.montoExacto}`;
        mensaje += `\n\nTitular: ${nombreTitular}`;
        mensaje += `\nWhatsApp: ${numeroWsp}`;
        mensaje += `\n\n⚠️ Transferir EXACTAMENTE $${datos.montoExacto} para que el sistema apruebe la compra.`;

        window.open(`https://wa.me/5493424279070?text=${encodeURIComponent(mensaje)}`, '_blank');
        
        vaciarCarrito();
        bloquearTiendaPorPedidoRealizado();
    })
    .catch(err => {
        console.error("Error detallado:", err);
        alert("Ocurrió un error al procesar el pedido.");
        
        if (btnWhatsapp) {
            btnWhatsapp.innerText = "Confirmar y Avisar por WhatsApp";
            btnWhatsapp.disabled = false;
        }
    });
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", cargarCatalogo);
