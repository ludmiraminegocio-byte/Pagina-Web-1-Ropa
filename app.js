// 1. NUESTRA BASE DE DATOS
const productos = [
    { id: 1, nombre: "Remera Rosa", precio: 15000, imagen: "img/remera.jpg" },
    { id: 2, nombre: "Pantalón de Jean", precio: 25000, imagen: "img/pantalon.jpg" },
    { id: 3, nombre: "Campera de Abrigo", precio: 45000, imagen: "img/campera.jpg" },
    { id: 4, nombre: "Borsegos", precio: 55000, imagen: "img/borsegos.jpg" },
    { id: 5, nombre: "Bikini Negra", precio: 18000, imagen: "img/bikini.jpg" },
    { id: 6, nombre: "Pollera Negra", precio: 12000, imagen: "img/pollera-negra.jpg" }
];

// 2. EL CARRITO
let carrito = [];

// 3. MOSTRAR CATÁLOGO
function mostrarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = ""; 
    
    productos.forEach(producto => {
        contenedor.innerHTML += `
            <div style="background-color: white; color: black; border-radius: 8px; margin: 10px; padding: 15px; text-align: center; display: inline-block; width: 250px; vertical-align: top;">
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                <button onclick="agregarAlCarrito(${producto.id})" style="padding: 10px; cursor: pointer; background-color: black; color: white; border: none; border-radius: 5px;">
                    Agregar al carrito
                </button>
            </div>
        `;
    });
}

// 4. AGREGAR AL CARRITO: Mete la prenda y registra las estadísticas
function agregarAlCarrito(idProducto) {
    const productoElegido = productos.find(producto => producto.id === idProducto);
    carrito.push(productoElegido);
    
    // 1. Aumentar contador global de carritos
    let totalCarritos = parseInt(localStorage.getItem("stats_total_carritos") || 0) + 1;
    localStorage.setItem("stats_total_carritos", totalCarritos);

    // 2. Registrar en el historial detallado con fecha y hora actual
    let ahora = new Date();
    let fechaStr = ahora.toLocaleDateString();
    let horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let historial = JSON.parse(localStorage.getItem("stats_historial_detallado")) || [];

    // Agregamos el registro con "No" por defecto
    historial.unshift({
        fecha: fechaStr,
        hora: horaStr,
        producto: productoElegido.nombre,
        comproWp: "No"
    });

    localStorage.setItem("stats_historial_detallado", JSON.stringify(historial));
    actualizarVistaCarrito();
}

// 5. ELIMINAR DEL CARRITO
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}

// 6. ACTUALIZAR VISTA DEL CARRITO
function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById("carrito");
    listaCarrito.innerHTML = ""; 
    
    carrito.forEach((producto, index) => {
        listaCarrito.innerHTML += `
            <li style="margin-bottom: 5px;">
                ${producto.nombre} - $${producto.precio} 
                <button onclick="eliminarDelCarrito(${index})" style="background: #e74c3c; color: white; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; margin-left: 10px;">❌</button>
            </li>
        `;
    });
}

// ENVIAR A WHATSAPP: Guarda las estadísticas correctamente y abre la app
document.getElementById("btn-whatsapp").addEventListener("click", () => {
    if(carrito.length === 0) {
        alert("Tu carrito está vacío, ¡agrega algo primero!");
        return;
    }

    // 1. Registrar clic global de WhatsApp
    let clicksWp = parseInt(localStorage.getItem("stats_whatsapp") || 0) + 1;
    localStorage.setItem("stats_whatsapp", clicksWp);

    // 2. Obtener el historial completo del navegador
    let historial = JSON.parse(localStorage.getItem("stats_historial_detallado")) || [];
    
    // 3. Crear una copia exacta de los nombres de los productos que están en el carrito ahora
    let productosEnCarrito = carrito.map(p => p.nombre);

    // 4. Recorrer el historial desde el más reciente y marcar con "Sí" 
    // aquellos registros que coincidan con los productos que el usuario está comprando
    for (let i = 0; i < productosEnCarrito.length; i++) {
        let nombreBuscado = productosEnCarrito[i];
        
        // Buscamos en el historial un registro que todavía diga "No" para este producto
        let indexEnHistorial = historial.findIndex(item => item.producto === nombreBuscado && item.comproWp === "No");
        
        if (indexEnHistorial !== -1) {
            historial[indexEnHistorial].comproWp = "Sí";
        }
    }

    // 5. Guardar el historial actualizado
    localStorage.setItem("stats_historial_detallado", JSON.stringify(historial));

    // 6. Armar el mensaje de texto para WhatsApp
    let textoMensaje = "¡Hola! Quiero confirmar este pedido:\n\n";
    let total = 0;

    carrito.forEach(producto => {
        textoMensaje += `- ${producto.nombre} ($${producto.precio})\n`;
        total += producto.precio;
    });

    textoMensaje += `\n*Total a pagar: $${total}*\n`;
    textoMensaje += `¿Me pasas tu alias para transferir?`;

    const numeroWhatsApp = "5493424279070"; 
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`;
    
    window.open(url, '_blank');
});

mostrarCatalogo();