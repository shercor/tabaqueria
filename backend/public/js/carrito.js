// Página de checkout: eliminar líneas y finalizar el pedido
import { eliminarDelCarro, finalizarPedido } from './api.js';
import { mostrarError, mostrarExito } from './alertas.js';

document.querySelectorAll('[data-eliminar]').forEach((boton) => {
    boton.addEventListener('click', async () => {
        const resultado = await eliminarDelCarro(boton.dataset.eliminar);
        if (!resultado.success) return mostrarError(resultado.message);
        location.reload();
    });
});

const formulario = document.getElementById('form-finalizar');

formulario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const boton = formulario.querySelector('button[type=submit]');
    boton.disabled = true;

    const delivery = formulario.elements.delivery.value === 'true';
    const resultado = await finalizarPedido(formulario.dataset.pedidoId, delivery);

    if (!resultado.success) {
        boton.disabled = false;
        return mostrarError(resultado.message);
    }

    await mostrarExito('¡Pedido realizado!', 'Tu pedido quedó registrado.');
    location.href = '/productos/lista';
});
