import './helpers/entorno.js';
import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { prepararBD, vaciarTablas, cerrarBD } from './helpers/bd.js';
import { nuevoAgente, tokenCsrf, enviarJSON, agenteConSesion } from './helpers/cliente.js';
import env from '../src/config/env.js';

before(prepararBD);
beforeEach(vaciarTablas);
after(cerrarBD);

const PNG = Buffer.from('89504e470d0a1a0a', 'hex');

describe('CSRF', () => {
    it('rechaza formularios y peticiones JSON sin token', async () => {
        const agente = await agenteConSesion();
        await agente.post('/auth/logout').type('form').send({}).expect(403);

        const res = await agente
            .post('/pedidos/agregar-al-carro')
            .set('Accept', 'application/json')
            .send({ productoId: 1 })
            .expect(403);
        assert.equal(res.body.success, false);
    });

    it('no guarda archivos subidos sin token válido', async () => {
        const agente = await agenteConSesion();
        const antes = fs.readdirSync(env.carpetaUploads).length;
        await agente
            .post('/productos/crear?_csrf=falso')
            .field('nombre', 'Cohiba')
            .attach('imagen', PNG, { filename: 'a.png', contentType: 'image/png' })
            .expect(403);
        assert.equal(fs.readdirSync(env.carpetaUploads).length, antes);
    });

    it('el token de antes del login no sirve después', async () => {
        const agente = nuevoAgente();
        const tokenAnonimo = await tokenCsrf(agente);
        const sesion = await agenteConSesion();

        await sesion
            .post('/pedidos/agregar-al-carro')
            .set('Accept', 'application/json')
            .set('X-CSRF-Token', tokenAnonimo)
            .send({ productoId: 1 })
            .expect(403);
    });
});

describe('sesión', () => {
    it('las páginas privadas redirigen al login y la API responde 401', async () => {
        const agente = nuevoAgente();
        await agente.get('/productos/lista').expect(302).expect('Location', '/auth/login');
        await agente.get('/').expect(302).expect('Location', '/auth/login');

        const api = await enviarJSON(agente, 'patch', '/api/pedidos/finalizar/1', { delivery: true });
        assert.equal(api.status, 401);
        assert.equal(api.body.message, 'Debes iniciar sesión');
    });

    it('ignora un JWT firmado con otra clave', async () => {
        const falso = jwt.sign({ id: 1, nombre: 'Intruso' }, 'otra-clave');
        await nuevoAgente()
            .get('/productos/lista')
            .set('Cookie', `_token=${falso}`)
            .expect(302)
            .expect('Location', '/auth/login');
    });
});

describe('errores', () => {
    it('responde 404 en rutas inexistentes, con y sin sesión', async () => {
        await nuevoAgente().get('/auth/noexiste').expect(404);
        const agente = await agenteConSesion();
        await agente.get('/noexiste').expect(404);
    });

    it('un JSON mal formado es un 400, no un 500', async () => {
        const agente = await agenteConSesion();
        const token = await tokenCsrf(agente);
        const res = await agente
            .post('/pedidos/agregar-al-carro')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('X-CSRF-Token', token)
            .send('{"productoId":')
            .expect(400);
        assert.equal(res.body.message, 'El cuerpo de la petición no es JSON válido');
    });
});
