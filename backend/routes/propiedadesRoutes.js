import express from "express"
import { admin } from '../controllers/propiedadController.js'
import verificarJWT from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get('', admin)
router.get('/index', admin)

export default router