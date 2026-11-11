import './helpers/entorno.js';
import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { prepararBD, vaciarTablas, cerrarBD } from './helpers/bd.js';
import { enviarJSON, crearProducto, agenteConSesion } from './helpers/cliente.js';
import { Pedido } from '../src/models/index.js';

before(prepararBD);
beforeEach(vaciarTablas);
after(cerrarBD);

// Deja un carrito con 1 Cohiba ($15.000) y 2 Pipas ($8.000) y devuelve su id
const armarCarrito = async (agente) => {
    const cohiba = await crearProducto({ nombre: 'Cohiba', precio: 15000, stock: 5 });
    const pipa = await crearProducto({ nombre: 'Pipa', precio: 8000, stock: 2 });
    await enviarJSON(agente, 'post', '/pedidos/agregar-al-carro', { productoId: cohiba.id });
    await enviarJSON(agente, 'post', '/pedidos/agregar-al-carro', { productoId: pipa.id, cantidad: 2 });
    const pedido = await Pedido.findOne({ where: { estado: 'carrito' } });
    return { pedidoId: pedido.id, cohiba, pipa };
};

const finalizar = (agente, pedidoId, cuerpo) =>
    enviarJSON(agente, 'patch', `/pedidos/finalizar/${pedidoId}`, cuerpo);

describe('checkout', () => {
    it('muestra el carrito vacío sin errores', async () => {
        const agente = await agenteConSesion();
        const res = await agente.get('/pedidos/finalizar-pedido').expect(200);
        assert.match(res.text, /No tienes productos en el carrito/);
    });

    it('finaliza con retiro en tienda, descuenta stock y cierra el carrito', async () => {
        const agente = await agenteConSesion();
        const { pedidoId, cohiba, pipa } = await armarCarrito(agente);

        const res = await finalizar(agente, pedidoId, { delivery: false });
        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Pedido finalizado correctamente');

        const pedido = await Pedido.findByPk(pedidoId);
        assert.equal(pedido.estado, 'pagado');
        assert.equal(pedido.delivery, false);
        assert.equal(pedido.total, 31000);
        assert.ok(pedido.fecha_pedido);
        await cohiba.reload();
        await pipa.reload();
        assert.deepEqual([cohiba.stock, pipa.stock], [4, 0]);
    });

    it('no se puede finalizar dos veces', async () => {
        const agente = await agenteConSesion();
        const { pedidoId } = await armarCarrito(agente);
        await finalizar(agente, pedidoId, { delivery: true });

        const res = await finalizar(agente, pedidoId, { delivery: true });
        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'No se puede cambiar de pagado a pagado');
    });

    it('exige indicar delivery o retiro', async () => {
        const agente = await agenteConSesion();
        const { pedidoId } = await armarCarrito(agente);
        const res = await finalizar(agente, pedidoId, {});
        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Debes indicar si el pedido es con delivery o retiro');
    });

    it('revalida el stock al finalizar y no descuenta nada si falta', async () => {
        const agente = await agenteConSesion();
        const { pedidoId, cohiba, pipa } = await armarCarrito(agente);
        // Otra compra se llevó una pipa mientras tanto
        await pipa.update({ stock: 1 });

        const res = await finalizar(agente, pedidoId, { delivery: false });
        assert.equal(res.status, 400);
        assert.match(res.body.message, /No hay stock suficiente de Pipa/);
        await cohiba.reload();
        assert.equal(cohiba.stock, 5);
        assert.equal((await Pedido.findByPk(pedidoId)).estado, 'carrito');
    });

    it('no deja finalizar el pedido de otro usuario', async () => {
        const ana = await agenteConSesion('ana@test.cl');
        const beto = await agenteConSesion('beto@test.cl');
        const { pedidoId } = await armarCarrito(ana);

        const res = await finalizar(beto, pedidoId, { delivery: true });
        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Pedido no encontrado');
        assert.equal((await Pedido.findByPk(pedidoId)).estado, 'carrito');
    });
});
