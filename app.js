// 1. BASE DE DATOS DE PRODUCTOS
const productos = [
    { id: 1, nombre: "Remera Rosa", precio: 10, imagen: "img/remera.jpg" },
    { id: 2, nombre: "Pantalón de Jean", precio: 20, imagen: "img/pantalon.jpg" },
    { id: 3, nombre: "Campera de Abrigo", precio: 4, imagen: "img/campera.jpg" },
    { id: 4, nombre: "Borsegos", precio: 50, imagen: "img/borsegos.jpg" },
    { id: 5, nombre: "Bikini Negra", precio: 18, imagen: "img/bikini.jpg" },
    { id: 6, nombre: "Pollera Negra", precio: 12, imagen: "img/pollera-negra.jpg" }
];

// 2. ESTADO DEL CARRITO
let carrito = [];

// 3. MOSTRAR CATÁLOGO EN PANTALLA
function mostrarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;
    
    contenedor.innerHTML = ""; 
    productos.forEach(producto => {
        contenedor.innerHTML += `
            <div style="background-color: white; color: black; border-radius: 8px; margin: 10px; padding: 15px; text-align: center; display: inline-block; width: 250px; vertical-align: top; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null; this.src='https://via.placeholder.com/250x250?text=Producto';">
                <h3 style="margin: 10px 0 5px 0;">${producto.nombre}</h3>
                <p style="font-weight: bold; margin-bottom: 10px;">$${producto.precio}</p>
                <button onclick="agregarAlCarrito(${producto.id})" style="padding: 10px 15px; cursor: pointer; background-color: black; color: white; border: none; border-radius: 5px; font-weight: bold;">
                    Agregar al carrito
                </button>
            </div>
        `;
    });
}

// 4. AGREGAR AL CARRITO
function agregarAlCarrito(idProducto) {
    const productoElegido = productos.find(p => p.id === idProducto);
    if (productoElegido) {
        carrito.push(productoElegido);
        actualizarVistaCarrito();
    }
}

// 5. ELIMINAR DEL CARRITO
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}

// 6. ACTUALIZAR CARRITO Y TOTAL
function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById("carrito");
    const inputMonto = document.getElementById("input-monto");
    
    if (listaCarrito) {
        listaCarrito.innerHTML = ""; 
        let total = 0;

        carrito.forEach((producto, index) => {
            total += producto.precio;
            listaCarrito.innerHTML += `
                <li style="margin-bottom: 8px; color: white;">
                    ${producto.nombre} - $${producto.precio} 
                    <button onclick="eliminarDelCarrito(${index})" style="background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-left: 10px;">❌</button>
                </li>
            `;
        });

        if (inputMonto) {
            inputMonto.value = `$${total}`;
        }
    }
}

// 7. INICIALIZAR Y CONFIGURAR BOTÓN WHATSAPP
document.addEventListener("DOMContentLoaded", () => {
    // Carga los productos apenas la página esté lista
    mostrarCatalogo();

    const btnWhatsapp = document.getElementById("btn-whatsapp");
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener("click", () => {
            if (carrito.length === 0) {
                alert("Tu carrito está vacío, ¡agrega algo primero!");
                return;
            }

            const inputTitular = document.getElementById('input-titular');
            let nombreTitular = inputTitular ? inputTitular.value.trim() : "";

            if (!nombreTitular) {
                alert("Por favor, ingresa el nombre de la cuenta con la que vas a transferir.");
                if (inputTitular) inputTitular.focus();
                return;
            }

            const inputMonto = document.getElementById('input-monto');
            let montoTotal = inputMonto ? inputMonto.value : "$0";

            // Guardar estadísticas globales
            let clicksWp = parseInt(localStorage.getItem("stats_whatsapp") || 0) + 1;
            localStorage.setItem("stats_whatsapp", clicksWp);

            let totalCarritos = parseInt(localStorage.getItem("stats_total_carritos") || 0) + 1;
            localStorage.setItem("stats_total_carritos", totalCarritos);

            // Cada producto aparece en un renglón distinto (<br>) en el panel admin
            let detalleProductos = carrito.map(p => `• ${p.nombre} ($${p.precio})`).join("<br>");

            let ahora = new Date();
            let fechaStr = ahora.toLocaleDateString();
            let horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let historial = JSON.parse(localStorage.getItem("stats_historial_detallado")) || [];

            historial.unshift({
                fecha: fechaStr,
                hora: horaStr,
                producto: detalleProductos,
                titular: nombreTitular,
                montoTotal: montoTotal,
                comproWp: "Sí"
            });

            localStorage.setItem("stats_historial_detallado", JSON.stringify(historial));

            // Mensaje para enviar por WhatsApp
            let textoMensaje = "Hola, quiero confirmar este pedido:\n\n";
            carrito.forEach(p => {
                textoMensaje += `- ${p.nombre} ($${p.precio})\n`;
            });

            textoMensaje += `\nMonto total a pagar: ${montoTotal}`;
            textoMensaje += `\nTitular de la cuenta: ${nombreTitular}`;
            textoMensaje += `\n\nAdjunto el comprobante de transferencia. Gracias!`;

            const numeroWhatsApp = "5493424279070"; 
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`;
            
            window.open(url, '_blank');
        });
    }
});
