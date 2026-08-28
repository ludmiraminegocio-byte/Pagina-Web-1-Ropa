const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbyJmHD7mFmCHyWDuGD_AlezRmKaC6bTWz3HldnoF7Ke3vJ3OkstNMGnhtxJEZW2aCwx/exec';

// Precios SOLO para mostrar en pantalla. El servidor recalcula todo desde
// cero y estos valores nunca viajan en el pedido — si no coinciden con
// PRECIOS_CENT del backend, lo único que pasa es que el cliente ve un
// número momentáneamente distinto hasta que llega la respuesta del server.
const productos = [
    { id: 1, nombre: "Remera Oversize", precio: 22000, imagen: "img/remera-oversize.jpg" },
    { id: 2, nombre: "Pantalón Wide Leg", precio: 45000, imagen: "img/pantalon-wide-leg.jpg" },
    { id: 3, nombre: "Buzo Cropped", precio: 65000, imagen: "img/buzo-cropped.jpg" },
    { id: 4, nombre: "Campera Denim", precio: 55000, imagen: "img/campera-denim.jpg" },
    { id: 5, nombre: "Top Urbano", precio: 18000, imagen: "img/top-urbano.jpg" },
    { id: 6, nombre: "Short Sastrero", precio: 15000, imagen: "img/short-sastrero.jpg" }
];

const PLACEHOLDER_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">
       <rect width="100%" height="100%" fill="#222"/>
       <text x="50%" y="50%" fill="#666" font-family="Arial" font-size="16"
             text-anchor="middle" dominant-baseline="middle">Sin imagen</text>
     </svg>`
);

let carrito = [];

// ── Persistencia del carrito entre refresh (no localStorage: eso es global
//    al dominio y sobrevive cierres del navegador; sessionStorage alcanza y
//    se limpia solo). ──────────────────────────────────────────────────────
function guardarCarrito() {
    sessionStorage.setItem("carrito_actual", JSON.stringify(carrito));
}
function restaurarCarrito() {
    try {
        const guardado = JSON.parse(sessionStorage.getItem("carrito_actual") || "[]");
        if (Array.isArray(guardado)) carrito = guardado;
    } catch (e) { carrito = []; }
}

function cargarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    productos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "tarjeta-producto";

        const img = document.createElement("img");
        img.src = prod.imagen;
        img.alt = prod.nombre;
        img.onerror = function () { this.onerror = null; this.src = PLACEHOLDER_SVG; };
        card.appendChild(img);

        const h3 = document.createElement("h3");
        h3.textContent = prod.nombre;
        card.appendChild(h3);

        const precio = document.createElement("p");
        precio.style.cssText = "font-weight:bold;color:#fff;";
        precio.textContent = "$" + prod.precio.toLocaleString('es-AR');
        card.appendChild(precio);

        const label = document.createElement("label");
        label.textContent = "Talle: ";
        card.appendChild(label);

        const select = document.createElement("select");
        select.id = `talle-${prod.id}`;
        ["S", "M", "L", "XL"].forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            select.appendChild(opt);
        });
        card.appendChild(select);
        card.appendChild(document.createElement("br"));
        card.appendChild(document.createElement("br"));

        const btn = document.createElement("button");
        btn.className = "btn-agregar";
        btn.textContent = "Agregar al Carrito";
        btn.addEventListener("click", () => agregarAlCarrito(prod.id));
        card.appendChild(btn);

        contenedor.appendChild(card);
    });

    restaurarCarrito();
    actualizarCarritoUI();

    if (sessionStorage.getItem("pedido_bloqueado") === "true") {
        const datos = JSON.parse(sessionStorage.getItem("ultimo_pedido") || "null");
        if (datos) mostrarPantallaExito(datos);
    }
}

function agregarAlCarrito(id) {
    if (sessionStorage.getItem("pedido_bloqueado") === "true") return;

    const prod = productos.find(p => p.id === id);
    const talleElegido = document.getElementById(`talle-${id}`).value;

    const existente = carrito.find(it => it.id === prod.id && it.talle === talleElegido);
    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, talle: talleElegido, cantidad: 1 });
    }

    guardarCarrito();
    actualizarCarritoUI();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarritoUI();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarritoUI();
}

// Ya NO calcula ni muestra "comisión": ese monto lo define el servidor
// recién al confirmar el pedido, porque depende de qué otros códigos están
// ocupados en ese momento exacto. Mostrar una comisión estimada acá sería
// mentirle al cliente sobre el monto final.
function actualizarCarritoUI() {
    const ulCarrito = document.getElementById("carrito");
    const inputMonto = document.getElementById("input-monto");

    if (ulCarrito) ulCarrito.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((item, index) => {
        const cant = item.cantidad || 1;
        subtotal += item.precio * cant;
        if (ulCarrito) {
            const li = document.createElement("li");

            const span = document.createElement("span");
            span.textContent = `${cant}x ${item.nombre} (Talle ${item.talle})`;
            li.appendChild(span);

            const div = document.createElement("div");
            const strong = document.createElement("strong");
            strong.style.color = "#00ffcc";
            strong.textContent = "$" + (item.precio * cant).toLocaleString('es-AR');
            div.appendChild(strong);

            const btnDel = document.createElement("button");
            btnDel.className = "btn-eliminar";
            btnDel.textContent = "X";
            btnDel.addEventListener("click", () => eliminarDelCarrito(index));
            div.appendChild(btnDel);

            li.appendChild(div);
            ulCarrito.appendChild(li);
        }
    });

    if (inputMonto) {
        inputMonto.value = subtotal === 0
            ? "$0 (se calcula el monto final al confirmar)"
            : "$" + subtotal.toLocaleString('es-AR') + " + código de verificación";
    }
}

function mostrarPantallaExito(datos) {
    const checkoutSection = document.getElementById("checkout-section");
    if (!checkoutSection) return;

    checkoutSection.innerHTML = "";

    const box = document.createElement("div");
    box.style.cssText = "background:#111;padding:20px;border-radius:8px;text-align:center;border:1px solid #00ffcc;margin-top:20px;";

    const h3 = document.createElement("h3");
    h3.style.cssText = "color:#00ffcc;margin-top:0;";
    h3.textContent = "¡Pedido registrado!";
    box.appendChild(h3);

    const pId = document.createElement("p");
    pId.style.cssText = "color:#ddd;font-size:14px;";
    pId.innerHTML = `Tu número de pedido es <strong>${escapeHtml(datos.pedidoId)}</strong>`;
    box.appendChild(pId);

    const montoBox = document.createElement("div");
    montoBox.style.cssText = "background:#1a1a1a;padding:15px;border-radius:6px;margin:15px 0;border:1px solid #333;";

    const label = document.createElement("p");
    label.style.cssText = "margin:0 0 8px 0;color:#aaa;font-size:13px;";
    label.textContent = "Transferí exactamente:";
    montoBox.appendChild(label);

    const monto = document.createElement("p");
    monto.style.cssText = "margin:0;color:#00ffcc;font-size:28px;font-weight:bold;";
    monto.textContent = "$" + datos.montoExacto;
    montoBox.appendChild(monto);

    const btnCopiar = document.createElement("button");
    btnCopiar.textContent = "Copiar monto";
    btnCopiar.style.cssText = "margin-top:10px;background:#333;color:#00ffcc;border:1px solid #00ffcc;padding:6px 12px;border-radius:4px;cursor:pointer;";
    btnCopiar.addEventListener("click", () => {
        navigator.clipboard.writeText(datos.montoExacto).then(() => {
            btnCopiar.textContent = "¡Copiado!";
            setTimeout(() => { btnCopiar.textContent = "Copiar monto"; }, 1500);
        });
    });
    montoBox.appendChild(btnCopiar);
    box.appendChild(montoBox);

    const alias = document.createElement("p");
    alias.style.cssText = "color:#ddd;font-size:13px;";
    alias.innerHTML = `Alias: <strong>LUDMILA3105</strong> — Titular: <strong>Ludmila</strong>`;
    box.appendChild(alias);

    const nota = document.createElement("p");
    nota.style.cssText = "color:#888;font-size:11px;margin-top:10px;";
    nota.textContent = "Los centavos son tu código de verificación. Transferí el monto EXACTO (con centavos) para que el sistema te confirme automáticamente.";
    box.appendChild(nota);

    const btnOtro = document.createElement("button");
    btnOtro.textContent = "Hacer otro pedido";
    btnOtro.style.cssText = "background:#00ffcc;color:#000;border:none;padding:10px 20px;font-weight:bold;border-radius:5px;cursor:pointer;margin-top:15px;";
    btnOtro.addEventListener("click", () => {
        sessionStorage.removeItem("pedido_bloqueado");
        sessionStorage.removeItem("ultimo_pedido");
        sessionStorage.removeItem("carrito_actual");
        location.reload();
    });
    box.appendChild(btnOtro);

    checkoutSection.appendChild(box);
}

function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
}

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

    // Ventana abierta DENTRO del handler de click, antes del fetch:
    // así el navegador la asocia al gesto del usuario y no la bloquea.
    // Si el fetch falla, la cerramos.
    const ventanaWsp = window.open('', '_blank');

    const itemsParaEnviar = carrito.map(item => ({
        id: item.id,
        talle: item.talle,
        cantidad: item.cantidad || 1
    }));

    // Ya NO se envía comisionWeb ni ningún monto: el servidor calcula todo.
    const datosPedido = {
        titular: nombreTitular,
        whatsapp: numeroWsp,
        items: itemsParaEnviar
    };

    if (btnWhatsapp) {
        btnWhatsapp.textContent = "Registrando pedido...";
        btnWhatsapp.disabled = true;
    }

    fetch(URL_API_GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datosPedido)
    })
        .then(res => res.json())
        .then(datos => {
            if (!datos.exito) throw new Error(datos.error || "Error en el servidor");

            let mensaje = `Hola, quiero confirmar mi pedido *${datos.pedidoId}*:\n\n`;
            carrito.forEach(p => {
                mensaje += `- ${p.cantidad || 1}x ${p.nombre} (Talle ${p.talle})\n`;
            });
            mensaje += `\nMONTO EXACTO A TRANSFERIR: $${datos.montoExacto}`;
            mensaje += `\nAlias: LUDMILA3105 — Titular: Ludmila`;
            mensaje += `\n\nTitular de mi transferencia: ${nombreTitular}`;
            mensaje += `\nMi WhatsApp: ${numeroWsp}`;
            mensaje += `\n\n⚠️ Importante: transferir el monto EXACTO (con los centavos) para que el sistema confirme el pago automáticamente.`;

            if (ventanaWsp) {
                ventanaWsp.location = `https://wa.me/5493424279070?text=${encodeURIComponent(mensaje)}`;
            } else {
                // El navegador bloqueó igual la ventana pre-abierta (raro, pero
                // posible en algunas configuraciones): dejamos un link visible.
                alert("No pudimos abrir WhatsApp automáticamente. Usá el botón de la pantalla siguiente.");
            }

            sessionStorage.setItem("ultimo_pedido", JSON.stringify(datos));
            sessionStorage.setItem("pedido_bloqueado", "true");
            sessionStorage.removeItem("carrito_actual");
            vaciarCarrito();
            mostrarPantallaExito(datos);
        })
        .catch(err => {
            console.error("Error detallado:", err);
            if (ventanaWsp) ventanaWsp.close();
            alert("Ocurrió un error al procesar el pedido: " + err.message);

            if (btnWhatsapp) {
                btnWhatsapp.textContent = "Confirmar y Avisar por WhatsApp";
                btnWhatsapp.disabled = false;
            }
        });
}

document.addEventListener("DOMContentLoaded", cargarCatalogo);
