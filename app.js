// 1. NUESTRA BASE DE DATOS ACTUALIZADA (Con TUS imágenes)
const productos = [
    { 
        id: 1, 
        nombre: "Remera Rosa", 
        precio: 15000, 
        imagen: "img/remera.jpg" 
    },
    { 
        id: 2, 
        nombre: "Pantalón de Jean", 
        precio: 25000, 
        imagen: "img/pantalon.jpg" 
    },
    { 
        id: 3, 
        nombre: "Campera de Abrigo", 
        precio: 45000, 
        imagen: "img/campera.jpg" 
    },
    { 
        id: 4, 
        nombre: "Borsegos", 
        precio: 55000, 
        imagen: "img/borsegos.jpg" 
    },
    { 
        id: 5, 
        nombre: "Bikini Negra", 
        precio: 18000, 
        imagen: "img/bikini.jpg" 
    },
    { 
        id: 6, 
        nombre: "Pollera Negra", 
        precio: 12000, 
        imagen: "img/pollera-negra.jpg" // Acuérdate de cambiarle el nombre al archivo con el guion
    }
];

// ... EL RESTO DEL CÓDIGO HACIA ABAJO QUEDA EXACTAMENTE IGUAL ...

// 2. EL CARRITO (Queda igual)
let carrito = [];

// 3. MOSTRAR CATÁLOGO (Actualizado para cuadros blancos)
function mostrarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = ""; 
    
    productos.forEach(producto => {
        contenedor.innerHTML += `
            <!-- Le agregamos background-color: white; y color: black; a la caja -->
            <div style="background-color: white; color: black; border-radius: 8px; margin: 10px; padding: 15px; text-align: center; display: inline-block; width: 250px; vertical-align: top;">
                
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;">
                
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                
                <!-- Hice el botón negro con letras blancas para que combine mejor -->
                <button onclick="agregarAlCarrito(${producto.id})" style="padding: 10px; cursor: pointer; background-color: black; color: white; border: none; border-radius: 5px;">
                    Agregar al carrito
                </button>
            </div>
        `;
    });
}

// 4. AGREGAR AL CARRITO: Mete la prenda en la lista del carrito
function agregarAlCarrito(idProducto) {
    const productoElegido = productos.find(producto => producto.id === idProducto);
    carrito.push(productoElegido);
    
    // Actualizamos lo que se ve en pantalla
    actualizarVistaCarrito();
}

// 5. ACTUALIZAR VISTA: Dibuja el carrito en el HTML (debajo de "Tu Carrito")
function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById("carrito");
    listaCarrito.innerHTML = ""; // Limpiamos la lista para no duplicar
    
    carrito.forEach(producto => {
        listaCarrito.innerHTML += `<li>${producto.nombre} - $${producto.precio}</li>`;
    });
}

// 6. ENVIAR A WHATSAPP: Arma el mensaje y abre la app
document.getElementById("btn-whatsapp").addEventListener("click", () => {
    // Si el carrito está vacío, tiramos una alerta y no hacemos nada
    if(carrito.length === 0) {
        alert("Tu carrito está vacío, ¡agrega algo primero!");
        return;
    }

    // Empezamos a armar el texto del mensaje
    let textoMensaje = "¡Hola! Quiero confirmar este pedido:\n\n";
    let total = 0;

    // Recorremos cada producto que el cliente agregó al carrito
    carrito.forEach(producto => {
        textoMensaje += `- ${producto.nombre} ($${producto.precio})\n`;
        total += producto.precio; // Sumamos el precio al total
    });

    textoMensaje += `\n*Total a pagar: $${total}*\n`;
    textoMensaje += `¿Me pasas tu alias para transferir?`;

    // ¡AQUÍ PONES TU NÚMERO REAL!
    // Recuerda poner el código de país (ej: 549 para Argentina) seguido de tu número sin el 15.
    const numeroWhatsApp = "5493424279070"; 
    
    // Codificamos el texto para que la URL respete los espacios y saltos de línea
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`;
    
    // Abrimos WhatsApp en una pestaña nueva
    window.open(url, '_blank');
});

// Arrancamos la página mostrando el catálogo
mostrarCatalogo();
