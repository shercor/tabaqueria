import './helpers/entorno.js';
import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { prepararBD, vaciarTablas, cerrarBD } from './helpers/bd.js';
import { tokenCsrf, crearCategoria, crearProducto, agenteConSesion } from './helpers/cliente.js';
import { Producto } from '../src/models/index.js';
import env from '../src/config/env.js';

before(prepararBD);
beforeEach(vaciarTablas);
after(cerrarBD);

const PNG = Buffer.from('89504e470d0a1a0a', 'hex');
const archivosSubidos = () => fs.readdirSync(env.carpetaUploads);

// Los formularios con archivo llevan el token CSRF en la URL
const enviarProducto = async (agente, url, campos, archivo) => {
    const peticion = agente.post(`${url}?_csrf=${await tokenCsrf(agente)}`);
    for (const [nombre, valor] of Object.entries(campos)) peticion.field(nombre, String(valor));
    if (archivo) peticion.attach('imagen', archivo.contenido, archivo);
    return peticion;
};

const productoValido = { nombre: 'Cohiba', precio: 15000, stock: 5, estado: 1 };

describe('crear y editar productos', () => {
    it('guarda la imagen con la extensión que corresponde a su tipo', async () => {
        const agente = await agenteConSesion();
        const categoria = await crearCategoria();
        const res = await enviarProducto(
            agente,
            '/productos/crear',
            { ...productoValido, categoria_id: categoria.id },
            { contenido: PNG, filename: 'x.html', contentType: 'image/png' },
        );
        assert.equal(res.status, 302);

        const producto = await Producto.findOne({ where: { nombre: 'Cohiba' } });
        assert.match(producto.imagen, /^\/uploads\/.+\.png$/);
        assert.ok(fs.existsSync(path.join(env.carpetaUploads, path.basename(producto.imagen))));
    });

    it('permite crear sin categoría ni imagen', async () => {
        const agente = await agenteConSesion();
        const res = await enviarProducto(agente, '/productos/crear', { ...productoValido, categoria_id: '' });
        assert.equal(res.status, 302);
        const producto = await Producto.findOne({ where: { nombre: 'Cohiba' } });
        assert.equal(producto.categoria_id, null);
        assert.equal(producto.imagen, null);
    });

    it('muestra los errores de validación y conserva lo escrito', async () => {
        const agente = await agenteConSesion();
        const res = await enviarProducto(agente, '/productos/crear', {
            nombre: 'X',
            precio: 'abc',
            stock: 1,
        });
        assert.equal(res.status, 400);
        assert.match(res.text, /al menos 3 caracteres/);
        assert.match(res.text, /al menos \$100/);
        assert.match(res.text, /value="abc"/);
        assert.equal(await Producto.count(), 0);
    });

    it('rechaza archivos que no son imágenes y no los guarda', async () => {
        const agente = await agenteConSesion();
        const antes = archivosSubidos().length;
        const res = await enviarProducto(agente, '/productos/crear', productoValido, {
            contenido: Buffer.from('<script>alert(1)</script>'),
            filename: 'malo.html',
            contentType: 'text/html',
        });
        assert.match(res.text, /La imagen debe ser JPG/);
        assert.equal(archivosSubidos().length, antes);
        assert.equal(await Producto.count(), 0);
    });

    it('editar sin imagen nueva conserva la actual', async () => {
        const agente = await agenteConSesion();
        const producto = await crearProducto({ imagen: '/uploads/foto.png' });
        const res = await enviarProducto(agente, `/productos/editar/${producto.id}`, {
            ...productoValido,
            precio: 18000,
        });
        assert.equal(res.status, 302);
        await producto.reload();
        assert.equal(producto.precio, 18000);
        assert.equal(producto.imagen, '/uploads/foto.png');
    });

    it('editar un producto inexistente responde 404', async () => {
        const agente = await agenteConSesion();
        await agente.get('/productos/editar/9999').expect(404);
    });
});

describe('lista y filtros', () => {
    it('filtra por categoría desde la ruta y desde el formulario', async () => {
        const agente = await agenteConSesion();
        const habanos = await crearCategoria('Habanos');
        await crearProducto({ nombre: 'Cohiba', categoria_id: habanos.id });
        await crearProducto({ nombre: 'Pipa' });

        for (const url of [`/productos/lista/${habanos.id}`, `/productos/lista?categoria=${habanos.id}`]) {
            const res = await agente.get(url).expect(200);
            assert.match(res.text, />Cohiba</);
            assert.doesNotMatch(res.text, />Pipa</);
        }
    });

    it('acepta precios con formato de pesos ($10.000)', async () => {
        const agente = await agenteConSesion();
        await crearProducto({ nombre: 'Cohiba', precio: 15000 });
        await crearProducto({ nombre: 'Pipa', precio: 8000 });

        const res = await agente.get('/productos/lista').query({ precioMin: '$10.000' }).expect(200);
        assert.match(res.text, />Cohiba</);
        assert.doesNotMatch(res.text, />Pipa</);
    });

    it('una categoría inexistente responde 404', async () => {
        const agente = await agenteConSesion();
        await agente.get('/productos/lista/9999').expect(404);
    });

    it('escapa el HTML de los nombres de producto', async () => {
        const agente = await agenteConSesion();
        await crearProducto({ nombre: '<img src=x onerror="alert(1)">' });
        const res = await agente.get('/productos/lista').expect(200);
        assert.doesNotMatch(res.text, /<img src=x/);
        assert.match(res.text, /&lt;img src=x/);
    });
});
