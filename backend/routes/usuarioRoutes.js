import express from "express";
import { formularioLogin, formularioOlvidePassword, formularioRegistro , registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, autenticar, logout, showUserInfo} from "../controllers/usersController.js";
import verificarJWT from "../middlewares/authMiddleware.js";

//Importamos la funcionalidad de Router de Express
const router = express.Router();


//Rutas para testeo
router.get('/info' , (req, res, next) => verificarJWT(req, res, next, true), showUserInfo)


// Rutas generales
router.get('/login', formularioLogin);
router.post('/login' , autenticar)
router.get('/registro' , formularioRegistro);
router.post('/registro', registrar)
router.get('/confirmar/:token', confirmar)
router.get('/olvide-password' , formularioOlvidePassword);
router.post('/olvide-password' , resetPassword);
router.post('/logout', logout)

//Almacena el nuevo password
router.get('/olvide-password/:token' , comprobarToken)
router.post('/olvide-password/:token' , nuevoPassword)

router.get('/nosotros', function (req, res) {
    console.log('Hola');
    res.send('Hola, somos nosotros')
});

export default router