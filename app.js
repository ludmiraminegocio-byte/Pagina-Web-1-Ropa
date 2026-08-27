const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbz8Te_iDAr2Y-3WsxXTYvp7rf6OItvjEo8XG5Ak67AgYcpFruu-P539t4yg7Hm3GcpK/exec';

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
        alert("El carrito está vacío.");
        return;
    }

    // Mapeamos los productos enviando solo ID y talle
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

        // Mensaje formateado para WhatsApp
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
