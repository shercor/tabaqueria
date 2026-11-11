import './helpers/entorno.js';
import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { prepararBD, vaciarTablas, cerrarBD } from './helpers/bd.js';
import { PASSWORD, nuevoAgente, enviarFormulario, crearUsuario, agenteConSesion } from './helpers/cliente.js';
import { Usuario } from '../src/models/index.js';

before(prepararBD);
beforeEach(vaciarTablas);
after(cerrarBD);

const datosRegistro = {
    nombre: 'Ana',
    email: 'ana@test.cl',
    password: PASSWORD,
    'repeat-password': PASSWORD,
};

describe('registro y confirmación', () => {
    it('crea la cuenta sin confirmar y la confirma con el token del email', async () => {
        const agente = nuevoAgente();
        const res = await enviarFormulario(agente, '/auth/registro', datosRegistro);
        assert.equal(res.status, 200);
        assert.match(res.text, /Cuenta creada correctamente/);

        const usuario = await Usuario.findOne({ where: { email: 'ana@test.cl' } });
        assert.equal(usuario.confirmado, false);
        assert.notEqual(usuario.password, PASSWORD, 'el password se guarda hasheado');

        const confirmacion = await agente.get(`/auth/confirmar/${usuario.token}`);
        assert.match(confirmacion.text, /Usuario verificado/);
        await usuario.reload();
        assert.equal(usuario.confirmado, true);
        assert.equal(usuario.token, null);
    });

    it('rechaza un email ya registrado', async () => {
        await crearUsuario();
        const res = await enviarFormulario(nuevoAgente(), '/auth/registro', datosRegistro);
        assert.match(res.text, /El usuario ya se encuentra registrado/);
        assert.equal(await Usuario.count(), 1);
    });

    it('muestra los errores de validación y conserva lo escrito', async () => {
        const res = await enviarFormulario(nuevoAgente(), '/auth/registro', {
            ...datosRegistro,
            email: 'no-es-email',
            'repeat-password': 'otra',
        });
        assert.match(res.text, /Las contraseñas no coinciden/);
        assert.match(res.text, /value="Ana"/);
    });

    it('un token de confirmación inválido no revienta', async () => {
        const res = await nuevoAgente().get('/auth/confirmar/noexiste');
        assert.equal(res.status, 200);
        assert.match(res.text, /Error al confirmar tu cuenta/);
    });
});

describe('login y logout', () => {
    it('inicia sesión con una cookie httpOnly y redirige al inicio', async () => {
        await crearUsuario();
        const res = await enviarFormulario(nuevoAgente(), '/auth/login', {
            email: 'ana@test.cl',
            password: PASSWORD,
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.location, '/index');
        const cookie = res.headers['set-cookie'].find((c) => c.startsWith('_token='));
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
    });

    it('avisa si el password es incorrecto y permite reintentar con el token de esa página', async () => {
        await crearUsuario();
        const agente = nuevoAgente();
        const error = await enviarFormulario(agente, '/auth/login', {
            email: 'ana@test.cl',
            password: 'mala',
        });
        assert.match(error.text, /El password es incorrecto/);

        const _csrf = error.text.match(/name="_csrf" value="([^"]+)"/)[1];
        await agente
            .post('/auth/login')
            .type('form')
            .send({ _csrf, email: 'ana@test.cl', password: PASSWORD })
            .expect(302);
    });

    it('no deja entrar con una cuenta sin confirmar', async () => {
        await crearUsuario({ confirmado: false });
        const res = await enviarFormulario(nuevoAgente(), '/auth/login', {
            email: 'ana@test.cl',
            password: PASSWORD,
        });
        assert.match(res.text, /Esta cuenta aún no ha sido confirmada/);
    });

    it('cierra la sesión y vuelve a pedir login', async () => {
        const agente = await agenteConSesion();
        const res = await enviarFormulario(agente, '/auth/logout');
        assert.equal(res.headers.location, '/auth/login');
        await agente.get('/productos/lista').expect(302).expect('Location', '/auth/login');
    });
});

describe('recuperar password', () => {
    it('genera un token aleatorio y permite guardar un password nuevo', async () => {
        await crearUsuario();
        const agente = nuevoAgente();
        const solicitud = await enviarFormulario(agente, '/auth/olvide-password', { email: 'ana@test.cl' });
        assert.match(solicitud.text, /Hemos enviado un email con las instrucciones/);

        const { token } = await Usuario.findOne({ where: { email: 'ana@test.cl' } });
        assert.match(token, /^[0-9a-f]{64}$/);

        await agente.get(`/auth/olvide-password/${token}`).expect(200);
        const cambio = await enviarFormulario(agente, `/auth/olvide-password/${token}`, {
            password: 'nueva123',
        });
        assert.match(cambio.text, /El password se guardó correctamente/);

        const login = await enviarFormulario(agente, '/auth/login', {
            email: 'ana@test.cl',
            password: 'nueva123',
        });
        assert.equal(login.headers.location, '/index');
    });

    it('un token inválido muestra un error en vez de reventar', async () => {
        const res = await enviarFormulario(nuevoAgente(), '/auth/olvide-password/noexiste', {
            password: 'nueva123',
        });
        assert.equal(res.status, 200);
        assert.match(res.text, /Hubo un error al validar tu información/);
    });

    it('avisa si el email no existe', async () => {
        const res = await enviarFormulario(nuevoAgente(), '/auth/olvide-password', {
            email: 'nadie@test.cl',
        });
        assert.match(res.text, /El email no pertenece a ningún usuario/);
    });
});
