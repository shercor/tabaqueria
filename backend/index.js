// Dependencias
import express from 'express'; //Import con EMS, configurado en el package.json con type: module
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import productosRoutes from './routes/productosRoutes.js'
import verificarJWT from './middlewares/authMiddleware.js';
import db from './config/db.js'
import upload from './middlewares/uploadFilesMiddleware.js';
import './models/Categoria.js';
import './models/Producto.js'
import './models/DetallePedido.js'
import './models/Pedido.js'
import './models/MetodosPago.js'

//Crear la app
const app = express();

//Habilitar lectura de datos de formularios para Express
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
    if (!req.path.startsWith('/auth')) {
        return verificarJWT(req, res, next);
    }
    next();
});

// Routing
app.use('/auth' , usuarioRoutes)
app.use('/productos' , productosRoutes)
app.use('/' , propiedadesRoutes)


//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`El servidor esta funcionando correctamente en el puerto ${port}`)
)
