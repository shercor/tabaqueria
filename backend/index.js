// Debe ir primero: carga el .env antes de que el resto de módulos lea process.env
import 'dotenv/config';

// Dependencias
import express from 'express'; //Import con EMS, configurado en el package.json con type: module
import cookieParser from 'cookie-parser'
import db from './config/db.js'
import './models/Categoria.js';
import './models/Producto.js'
import './models/DetallePedido.js'
import './models/Pedido.js'
import './models/MetodosPago.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import productosRoutes from './routes/productosRoutes.js'
import pedidosRoutes from './routes/pedidosRoutes.js'
import verificarJWT from './middlewares/authMiddleware.js';
import manejarErrores, { rutaNoEncontrada } from './middlewares/errorMiddleware.js';
import { protegerCsrf, tokenEnVistas } from './middlewares/csrfMiddleware.js';
import { formatearPesos } from './helpers/formato.js';

//Crear la app
const app = express();

// Habilitar Template Engine: Pug
app.set('view engine' , 'pug')
app.set('views' , './views')
app.locals.formatearPesos = formatearPesos

// Carpeta Pública: va antes del resto para que los archivos estáticos no pasen por sesión ni CSRF
app.use(express.static('public'))
app.use('/vendor/bootstrap', express.static('node_modules/bootstrap/dist'))

// Lectura del body en JSON y de formularios URL-encoded.
// Los formularios con archivos (multipart) los procesa multer solo en las rutas que suben imágenes
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Habilitar Cookie Parser
app.use( cookieParser())

// Habilitar CSRF y dejar el token disponible en todas las vistas
app.use(protegerCsrf)
app.use(tokenEnVistas)

// Todo requiere sesión, salvo las rutas de autenticación
app.use((req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/api/auth')) {
        return next();
    }
    return verificarJWT(req, res, next);
});

// Routing
app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});
app.use('/auth' , usuarioRoutes)
app.use('/productos' , productosRoutes)
app.use('/' , propiedadesRoutes)
app.use('/pedidos' , pedidosRoutes)
app.use('/api/pedidos', pedidosRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

//Conexion a la db con Sequelize
try{
    await db.authenticate();
    await db.sync(); // Crea las tablas definidas en el modelo que no estén creadas en la base de datos
    console.log('Conexion a la base de datos establecida')
} catch (error) {
    console.log(error)
}

//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`El servidor esta funcionando correctamente en el puerto ${port}`)
)
