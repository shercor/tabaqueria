// Llamadas al backend. Todas devuelven un objeto con "success" y "message"

// El token CSRF lo deja el layout en <meta name="csrf-token">
const tokenCsrf = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

async function enviarJSON(url, metodo = 'GET', datos) {
    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': tokenCsrf(),
            },
            body: datos ? JSON.stringify(datos) : undefined,
        });
        return await respuesta.json();
    } catch (error) {
        console.error(`Error en ${metodo} ${url}:`, error);
        return { success: false, message: 'No se pudo conectar con el servidor' };
    }
}

export const obtenerCarrito = () => enviarJSON('/pedidos/obtener-carrito');

export const agregarAlCarro = (productoId, cantidad = 1) =>
    enviarJSON('/pedidos/agregar-al-carro', 'POST', { productoId, cantidad });

export const quitarDelCarro = (detalleId) => enviarJSON('/pedidos/quitar-del-carro', 'POST', { detalleId });

export const eliminarDelCarro = (detalleId) => enviarJSON('/pedidos/eliminar-del-carro', 'POST', { detalleId });

export const finalizarPedido = (pedidoId, delivery) =>
    enviarJSON(`/pedidos/finalizar/${pedidoId}`, 'PATCH', { delivery });
