import {check, validationResult} from 'express-validator'
import Categoria from '../models/Categoria.js';
import Producto from '../models/Producto.js';

const crear = async (req, res) => {

    const categorias = await Categoria.findAll();

    res.render('productos/crear', {
        pagina: 'Crear un producto',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias
    })
}

const ingresarProducto = async (req, res) => {
    await check('nombre')
        .notEmpty().withMessage('El nombre del producto es obligatorio')
        .isLength({min:3}).withMessage('El nombre debe tener al menos 2 carácteres');
    await check('precio')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ gt: 99 }).withMessage("El precio debe tener un valor mínimo de 100$");

    let resultado = validationResult(req);

    try {
        // Imprimir todo el cuerpo de la solicitud
        console.log("Datos del formulario:", req.body);

        // Imprimir el archivo subido (si existe)
        if (req.file) {
            console.log("Archivo subido:", req.file);
        }

        const { nombre, descripcion, precio, stock, categoria_id, estado } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : null; 

        const producto = await Producto.create({
            nombre,
            descripcion,
            precio,
            stock,
            categoria_id,
            imagen,
            estado: estado === '1'
        });

        res.redirect('/productos/crear');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el producto');
    }


}

export{
    crear,
    ingresarProducto
}