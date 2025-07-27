// Dependencias
import express from 'express'; //Import con EMS, configurado en el package.json con type: module
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import productosRoutes from './routes/productosRoutes.js'
import pedidosRoutes from './routes/pedidosRoutes.js'
import verificarJWT from './middlewares/authMiddleware.js';
import db from './config/db.js'
import upload from './middlewares/uploadFilesMiddleware.js';
import './models/Categoria.js';
import './models/Producto.js'
import './models/DetallePedido.js'
import './models/Pedido.js'
import './models/MetodosPago.js'

import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const APP_ENV  = 'development' // Cambiar a 'production' en producción

//Crear la app
const app = express();

//Habilitar lectura de datos de formularios y peticiones POST (contenido de Body) para Express

// Express.json() parsea el cuerpo de la solicitud que viene en formato JSON, a un objeto JavaScript
app.use(express.json());

// Express.urlencoded() parsea el cuerpo de la solicitud que viene en formato URL-encoded (formulario), a un objeto JavaScript
app.use(express.urlencoded({extended: true}))

// Middleware de subida de archivos
app.use(upload.single('imagen'));

// Habilitar Cookie Parser
app.use( cookieParser())

// Habilitar CSRF, cada vez que se visite una vista se genera un token
app.use(csrf({cookie: true}))

//Conexion a la db con Sequelize
try{
    await db.authenticate();
    db.sync(); // Crea las tablas definidas en el modelo que no estén creadas en la base de datos
    console.log('Conexion a la base de datos establecida')
} catch (error) {
    console.log(error)
}

// Habilitar Template Engine: Pug
app.set('view engine' , 'pug')
app.set('views' , './views')

// Carpeta Pública, para setear donde estaran los archivos publicos
app.use(express.static('public'))

// Middleware de autenticación para la mayoría de rutas
app.use((req, res, next) => {
    // Para las rutas '/auth' no es necesario haber iniciado sesión
    // Para las rutas  de api, no es necesario tener un JWT
    if (!req.path.startsWith('/auth') && !req.path.startsWith('/api')) {
        return verificarJWT(req, res, next);
    }
    // si path inicia con /api, eliminar /api del path
    // if (req.path.startsWith('/api')) {
    //     req.path = req.path.replace('/api', '');
    // }
    next();
});

// Routing
app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
app.use('/auth' , usuarioRoutes)
app.use('/productos' , productosRoutes)
app.use('/' , propiedadesRoutes)
app.use('/pedidos' , pedidosRoutes)
app.use('/api/pedidos', pedidosRoutes);


//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`El servidor esta funcionando correctamente en el puerto ${port}`)
)


app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ ok: false, mensaje: 'Token CSRF inválido o faltante' });
  }
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});