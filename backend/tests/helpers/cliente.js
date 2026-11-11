import request from 'supertest';
import app from '../../src/app.js';
import { Usuario, Categoria, Producto } from '../../src/models/index.js';

const PASSWORD = '123456';

// Agente con sus propias cookies, como un navegador
const nuevoAgente = () => request.agent(app);

// El token CSRF está atado a la sesión, así que se pide de nuevo antes de cada envío.
// Hay que pedirlo antes de armar la petición: el agente adjunta las cookies al crearla
const tokenCsrf = async (agente) => (await agente.get('/api/auth/csrf-token').expect(200)).body.csrfToken;

const enviarFormulario = async (agente, url, datos = {}) => {
    const _csrf = await tokenCsrf(agente);
    return agente
        .post(url)
        .type('form')
        .send({ _csrf, ...datos });
};

const enviarJSON = async (agente, metodo, url, cuerpo) => {
    const token = await tokenCsrf(agente);
    return agente[metodo](url).set('Accept', 'application/json').set('X-CSRF-Token', token).send(cuerpo);
};

const crearUsuario = (datos = {}) =>
    Usuario.create({ nombre: 'Ana', email: 'ana@test.cl', password: PASSWORD, confirmado: true, ...datos });

const crearCategoria = (nombre = 'Habanos') =>
    Categoria.create({ nombre, descripcion: nombre, estado: true });

const crearProducto = (datos = {}) =>
    Producto.create({ nombre: 'Cohiba', precio: 15000, stock: 5, estado: true, ...datos });

// Crea el usuario (si hace falta) y devuelve un agente con la sesión iniciada
const agenteConSesion = async (email = 'ana@test.cl') => {
    if (!(await Usuario.findOne({ where: { email } }))) await crearUsuario({ email });
    const agente = nuevoAgente();
    const res = await enviarFormulario(agente, '/auth/login', { email, password: PASSWORD });
    if (res.headers.location !== '/index') throw new Error(`No se pudo iniciar sesión como ${email}`);
    return agente;
};

export {
    PASSWORD,
    nuevoAgente,
    tokenCsrf,
    enviarFormulario,
    enviarJSON,
    crearUsuario,
    crearCategoria,
    crearProducto,
    agenteConSesion,
};
