import express from "express";
import { formularioLogin, formularioOlvidePassword, formularioRegistro , registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, autenticar, logout, showUserInfo} from "../controllers/usersController.js";
import { asyncHandler } from "../helpers/http.js";
import { usuarioOpcional } from "../middlewares/authMiddleware.js";

//Importamos la funcionalidad de Router de Express
const router = express.Router();

//Rutas para testeo
router.get('/info' , usuarioOpcional, showUserInfo)

// Rutas generales
router.get('/login', formularioLogin);
router.post('/login' , asyncHandler(autenticar))
router.get('/registro' , formularioRegistro);
router.post('/registro', asyncHandler(registrar))
router.get('/confirmar/:token', asyncHandler(confirmar))
router.get('/olvide-password' , formularioOlvidePassword);
router.post('/olvide-password' , asyncHandler(resetPassword));
router.post('/logout', logout)

//Almacena el nuevo password
router.get('/olvide-password/:token' , asyncHandler(comprobarToken))
router.post('/olvide-password/:token' , asyncHandler(nuevoPassword))

router.get('/nosotros', function (req, res) {
    res.send('Hola, somos nosotros')
});

export default router
