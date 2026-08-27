const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbz8Te_iDAr2Y-3WsxXTYvp7rf6OItvjEo8XG5Ak67AgYcpFruu-P539t4yg7Hm3GcpK/exec';

// Al hacer clic en el botón de confirmar pedido:
const itemsParaEnviar = carrito.map(item => ({
    id: item.id,
    talle: item.talle
}));

const datosPedido = {
    titular: nombreTitular,
    whatsapp: numeroWsp,
    items: itemsParaEnviar
};

btnWhatsapp.innerText = "Procesando...";
btnWhatsapp.disabled = true;

fetch(URL_API_GOOGLE, {
    method: 'POST',
    body: JSON.stringify(datosPedido)
})
.then(res => res.json())
.then(datos => {
    if (!datos.exito) throw new Error("Error en el servidor");

    // Construimos el mensaje de WhatsApp con el monto inalterable retornado por Google
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
    btnWhatsapp.innerText = "Confirmar y Avisar por WhatsApp";
    btnWhatsapp.disabled = false;
})
.catch(err => {
    alert("Ocurrió un error al procesar el pedido.");
    btnWhatsapp.innerText = "Confirmar y Avisar por WhatsApp";
    btnWhatsapp.disabled = false;
});
