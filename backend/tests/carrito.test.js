import './helpers/entorno.js';
import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { prepararBD, vaciarTablas, cerrarBD } from './helpers/bd.js';
import { tokenCsrf, enviarJSON, crearProducto, agenteConSesion } from './helpers/cliente.js';
import { Pedido, DetallePedido } from '../src/models/index.js';

before(prepararBD);
beforeEach(vaciarTablas);
after(cerrarBD);

const agregar = (agente, productoId, cantidad) =>
    enviarJSON(agente, 'post', '/pedidos/agregar-al-carro', { productoId, cantidad });
const carrito = async (agente) => (await enviarJSON(agente, 'get', '/pedidos/obtener-carrito')).body.pedido;

describe('carrito', () => {
    it('agrega productos y calcula el total', async () => {
        const agente = await agenteConSesion();
        const cohiba = await crearProducto({ nombre: 'Cohiba', precio: 15000 });
        const pipa = await crearProducto({ nombre: 'Pipa', precio: 8000, stock: 2 });

        const res = await agregar(agente, cohiba.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        await agregar(agente, pipa.id, 2);

        const pedido = await carrito(agente);
        assert.equal(pedido.total, 31000);
        assert.equal(pedido.detalles_pedido.length, 2);
    });

    it('no deja superar el stock', async () => {
        const agente = await agenteConSesion();
        const pipa = await crearProducto({ nombre: 'Pipa', stock: 2 });
        await agregar(agente, pipa.id, 2);

        const res = await agregar(agente, pipa.id);
        assert.equal(res.status, 400);
        assert.match(res.body.message, /Solo quedan 2 unidades de Pipa/);
    });

    it('restar hasta 0 oculta la línea, recalcula el total y se puede volver a agregar', async () => {
        const agente = await agenteConSesion();
        const cohiba = await crearProducto({ nombre: 'Cohiba', precio: 15000 });
        const pipa = await crearProducto({ nombre: 'Pipa', precio: 8000 });
        await agregar(agente, cohiba.id);
        await agregar(agente, pipa.id, 2);
        const linea = await DetallePedido.findOne({ where: { producto_id: cohiba.id } });

        await enviarJSON(agente, 'post', '/pedidos/quitar-del-carro', { detalleId: linea.id });
        const pedido = await carrito(agente);
        assert.equal(pedido.detalles_pedido.length, 1);
        assert.equal(pedido.total, 16000);

        const otraVez = await enviarJSON(agente, 'post', '/pedidos/quitar-del-carro', {
            detalleId: linea.id,
        });
        assert.equal(otraVez.status, 404);
        assert.equal(otraVez.body.message, 'Este producto no está en tu carrito');

        await agregar(agente, cohiba.id);
        await linea.reload();
        assert.equal(linea.cantidad, 1, 'reutiliza la misma línea');
    });

    it('eliminar quita la línea completa', async () => {
        const agente = await agenteConSesion();
        const cohiba = await crearProducto();
        await agregar(agente, cohiba.id, 3);
        const linea = await DetallePedido.findOne();

        const res = await enviarJSON(agente, 'post', '/pedidos/eliminar-del-carro', { detalleId: linea.id });
        assert.equal(res.body.success, true);
        assert.equal((await carrito(agente)).total, 0);
    });

    it('valida el body', async () => {
        const agente = await agenteConSesion();
        const res = await agregar(agente, 'x');
        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'El producto no es válido');
    });

    it('un usuario no puede tocar el carrito de otro', async () => {
        const ana = await agenteConSesion('ana@test.cl');
        const beto = await agenteConSesion('beto@test.cl');
        await agregar(ana, (await crearProducto()).id);
        const linea = await DetallePedido.findOne();

        const res = await enviarJSON(beto, 'post', '/pedidos/eliminar-del-carro', { detalleId: linea.id });
        assert.equal(res.body.message, 'Este producto no está en tu carrito');
        await linea.reload();
        assert.equal(linea.cantidad, 1);
    });

    it('varios "agregar" simultáneos (doble clic) usan un solo carrito', async () => {
        const agente = await agenteConSesion();
        const cohiba = await crearProducto({ stock: 10 });
        // Mismo token para todos, como varios clics seguidos en la misma página
        const token = await tokenCsrf(agente);
        await Promise.all(
            Array.from({ length: 4 }, () =>
                agente
                    .post('/pedidos/agregar-al-carro')
                    .set('Accept', 'application/json')
                    .set('X-CSRF-Token', token)
                    .send({ productoId: cohiba.id })
                    .expect(200),
            ),
        );

        assert.equal(await Pedido.count({ where: { estado: 'carrito' } }), 1);
        assert.equal(await DetallePedido.sum('cantidad'), 4);
    });
});
