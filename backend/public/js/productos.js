// Catálogo: botones "Añadir al carro" y filtros de precio
import { agregarAlCarro } from './api.js';
import { activarInputsDePesos } from './formato.js';
import { mostrarError } from './alertas.js';

activarInputsDePesos();

document.querySelectorAll('.boton-carrito[data-producto-id]').forEach((boton) => {
    boton.addEventListener('click', async () => {
        const resultado = await agregarAlCarro(boton.dataset.productoId);
        if (!resultado.success) {
            return mostrarError(resultado.message || 'Hubo un problema al agregar el producto');
        }
        Swal.fire({ icon: 'success', title: '¡Producto añadido al carro!', timer: 2000, confirmButtonText: 'Ok' });
    });
});
