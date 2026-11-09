import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import {
    loginValidator,
    registroValidator,
    olvidePasswordValidator,
    nuevoPasswordValidator,
} from '../validators/authValidators.js';

const router = Router();

router.get('/login', auth.formularioLogin);
router.post('/login', loginValidator, auth.login);
router.post('/logout', auth.logout);

router.get('/registro', auth.formularioRegistro);
router.post('/registro', registroValidator, auth.registrar);
router.get('/confirmar/:token', auth.confirmar);

router.get('/olvide-password', auth.formularioOlvidePassword);
router.post('/olvide-password', olvidePasswordValidator, auth.olvidePassword);
router.get('/olvide-password/:token', auth.formularioNuevoPassword);
router.post('/olvide-password/:token', nuevoPasswordValidator, auth.nuevoPassword);

export default router;
