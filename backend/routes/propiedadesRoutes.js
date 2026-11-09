import express from "express"
import { admin } from '../controllers/propiedadController.js'

const router = express.Router()

router.get('/', admin)
router.get('/index', admin)

export default router
