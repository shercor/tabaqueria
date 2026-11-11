import { Router } from 'express';
import { requerirSesion } from '../middlewares/auth.js';
import { inicio } from '../controllers/inicioController.js';
import authRoutes from './authRoutes.js';
import productosRoutes from './productosRoutes.js';
import pedidosRoutes from './pedidosRoutes.js';

const router = Router();

// Públicas
router.use('/auth', authRoutes);
router.get('/api/auth/csrf-token', (req, res) => res.json({ csrfToken: res.locals.csrfToken }));

// Requieren sesión
router.get(['/', '/index'], requerirSesion, inicio);
router.use('/productos', requerirSesion, productosRoutes);
router.use('/pedidos', requerirSesion, pedidosRoutes);
router.use('/api/pedidos', requerirSesion, pedidosRoutes);

export default router;
