// Modal del carrito, presente en todas las páginas con sesión
import { obtenerCarrito, agregarAlCarro, quitarDelCarro, eliminarDelCarro } from './api.js';
import { escaparHtml, formatearPesos } from './formato.js';
import { mostrarError } from './alertas.js';

const modal = document.getElementById('carrito-modal');
const lineas = document.getElementById('carrito-lineas');
const total = document.getElementById('carrito-total');
const totalContenedor = document.getElementById('carrito-total-contenedor');
const checkout = document.getElementById('carrito-checkout');

function htmlLinea(detalle) {
    const { producto } = detalle;
    const nombre = escaparHtml(producto.nombre);
    return `
        <div class="carrito-linea">
            <div class="carrito-linea__producto">
                <img class="carrito-linea__imagen" src="${escaparHtml(producto.imagen ?? '/general/no-image.jpg')}" alt="${nombre}">
                <div>
                    <strong>${nombre}</strong><br>
                    <strong>Precio Unidad:</strong> ${formatearPesos(detalle.precio)}<br>
                    <strong>Cantidad:</strong> ${detalle.cantidad}<br>
                    <button type="button" class="btn btn-sm btn-secondary mt-2" data-accion="restar" data-detalle-id="${detalle.id}" title="Restar del carrito">-</button>
                    <button type="button" class="btn btn-sm btn-secondary mt-2" data-accion="sumar" data-producto-id="${producto.id}" title="Añadir al carrito">+</button>
                </div>
            </div>
            <div class="text-end">
                <div><strong>Total:</strong> ${formatearPesos(detalle.precio * detalle.cantidad)}</div>
                <button type="button" class="btn btn-sm btn-danger mt-2" data-accion="eliminar" data-detalle-id="${detalle.id}" title="Eliminar del carrito">❌</button>
            </div>
        </div>
    `;
}

function mostrarVacio(mensaje) {
    lineas.innerHTML = `<p class="my-3">${mensaje}</p>`;
    totalContenedor.hidden = true;
    checkout.hidden = true;
}

async function actualizar() {
    const resultado = await obtenerCarrito();
    if (!resultado.success) return mostrarVacio('Error al cargar el carrito');

    const detalles = resultado.pedido?.detalles_pedido ?? [];
    if (detalles.length === 0) return mostrarVacio('No has añadido ningún producto todavía');

    lineas.innerHTML = detalles.map(htmlLinea).join('');
    total.textContent = formatearPesos(resultado.pedido.total);
    totalContenedor.hidden = false;
    checkout.hidden = false;
}

const acciones = {
    sumar: (boton) => agregarAlCarro(boton.dataset.productoId),
    restar: (boton) => quitarDelCarro(boton.dataset.detalleId),
    eliminar: (boton) => eliminarDelCarro(boton.dataset.detalleId),
};

// Un solo listener para los botones +, - y ❌ de todas las líneas
lineas.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    boton.disabled = true;
    const resultado = await acciones[boton.dataset.accion](boton);
    if (!resultado.success) mostrarError(resultado.message);
    await actualizar();
});

const abrir = () => {
    modal.classList.add('carrito-modal--abierto');
    actualizar();
};
const cerrar = () => modal.classList.remove('carrito-modal--abierto');

document.getElementById('carrito-abrir').addEventListener('click', abrir);
document.getElementById('carrito-cerrar').addEventListener('click', cerrar);
// Cerrar al hacer clic fuera del contenido o con Escape
modal.addEventListener('click', (evento) => {
    if (evento.target === modal) cerrar();
});
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar();
});
