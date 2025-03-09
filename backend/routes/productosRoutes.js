import express from "express"
import { crear , ingresarProducto } from '../controllers/productosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.get('/crear', crear)
router.post('/crear', ingresarProducto)

// router.post('/crear', upload.single('imagen'), ingresarProducto);


export default router