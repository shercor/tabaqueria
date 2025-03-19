import express from "express"
import { agregarAlCarro} from '../controllers/pedidosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarro)

export default router