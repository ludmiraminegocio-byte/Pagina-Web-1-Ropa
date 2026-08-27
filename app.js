const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbzxwX4IvssM6Qwou05SPipK6tIu8g0vnNKkzmo-gUuYDU8mxigzWaLmt6zVEnbENKHP/exec';

// Lista de productos del catálogo
const productos = [
    { id: 1, nombre: "Remera Oversize", precio: 220, imagen: "https://via.placeholder.com/200" },
    { id: 2, nombre: "Pantalón Wide Leg", precio: 40, imagen: "https://via.placeholder.com/200" },
    { id: 3, nombre: "Buzo Cropped", precio: 65, imagen: "https://via.placeholder.com/200" },
    { id: 4, nombre: "Campera Denim", precio: 55, imagen: "https://via.placeholder.com/200" },
    { id: 5, nombre: "Top Urbano", precio: 18, imagen: "https://via.placeholder.com/200" },
    { id: 6, nombre: "Short Sastrero", precio: 15, imagen: "https://via.placeholder.com/200" }
];

let carrito = [];
let comisionActual = 0; // Guarda el valor aleatorio de los centavos de validación

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
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
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

// Actualizar la lista, el subtotal, la comisión y el total exacto
function actualizarCarritoUI() {
    const ulCarrito = document.getElementById("carrito");
    const inputMonto = document.getElementById("input-monto");
    const textoSubtotal = document.getElementById("texto-subtotal");
    const textoComision = document.getElementById("texto-comision");

    if (ulCarrito) ulCarrito.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((item) => {
        subtotal += item.precio;
        if (ulCarrito) {
            ulCarrito.innerHTML += `
                <li>
                    <span>- ${item.nombre} (Talle ${item.talle})</span>
                    <strong style="color: #00ffcc;">$${item.precio.toLocaleString('es-AR')}</strong>
                </li>
            `;
        }
    });

    if (subtotal > 0) {
        // Genera centavos de comisión únicos si aún no existen para este carrito (ej: 0.76)
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
        inputMonto.value = `$${totalConComision.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

// Confirmar pedido y enviar los datos
function confirmarPedido() {
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
        items: itemsParaEnviar
    };

    if (btnWhatsapp) {
        btnWhatsapp.innerText = "Procesando...";
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
        
        if (btnWhatsapp) {
            btnWhatsapp.innerText = "Confirmar y Avisar por WhatsApp";
            btnWhatsapp.disabled = false;
        }
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

// Inicializar cuando el HTML esté cargado
document.addEventListener("DOMContentLoaded", cargarCatalogo);
