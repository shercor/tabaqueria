// Archivo estático: no pasa por Pug, así que el token CSRF se lee del <meta> del layout
function obtenerCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// fetch con JSON y CSRF; siempre devuelve un objeto con "success" y "message"
async function enviarJSON(url, metodo = 'GET', datos) {
    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': obtenerCsrfToken()
            },
            body: datos ? JSON.stringify(datos) : undefined
        });
        return await respuesta.json();
    } catch (error) {
        console.error(`Error en ${metodo} ${url}:`, error);
        return { success: false, message: 'No se pudo conectar con el servidor' };
    }
}

// Evita que un texto (por ejemplo, el nombre de un producto) se interprete como HTML
function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function formatearPesos(valor) {
    return '$' + Math.round(Number(valor) || 0).toLocaleString('es-CL');
}

// Formatea en vivo un input de precio: 15000 -> $15.000
function formatearPrecio(input) {
    const digitos = input.value.replace(/[^0-9]/g, '');
    input.value = digitos ? formatearPesos(digitos) : '';
}

async function agregarAlCarro(productoId, cantidad = 1) {
    return enviarJSON('/pedidos/agregar-al-carro', 'POST', { productoId, cantidad });
}

async function quitarDelCarro(detalleId) {
    return enviarJSON('/pedidos/quitar-del-carro', 'POST', { detalleId });
}

async function eliminarDelCarro(detalleId) {
    return enviarJSON('/pedidos/eliminar-del-carro', 'POST', { detalleId });
}

function mostrarError(mensaje) {
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje || 'Ocurrió un problema' });
}
