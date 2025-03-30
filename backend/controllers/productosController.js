import {check, validationResult} from 'express-validator'
import { Op } from 'sequelize';
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

const editar = async (req, res) => {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
        include: {
            model: Categoria,
            attributes: ['id', 'nombre']
        }
    });

    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    }

    const categorias = await Categoria.findAll();

    res.render('productos/editar', {
        pagina: `Editar ${producto.nombre}`,
        barra: true,
        csrfToken: req.csrfToken(),
        producto,
        categorias
    });
}

const editarProducto = async (req, res) => {
    console.log('El id del producto a editar es:', req.params.id);
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id, estado } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null; 

    try {
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        await producto.update({
            nombre,
            descripcion,
            precio,
            stock,
            categoria_id,
            imagen,
            estado: estado === '1'
        });

        res.redirect('/productos/lista');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al editar el producto');
    }
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

const listaProductos = async (req, res) => {
    console.log(req.params);
    const categoriaId = req.params.id ?? null;
    const {nombre, precioMin, precioMax} = req.query
    let productos = null;
    let categoria = null;
    console.log('AAAAAAAAAAAAAAAAAA');
    // console.log(precioMax);
    // console.log(formatearAEntero(precioMax));
    console.log(req.query);

    // Crear un objeto para las condiciones de la consulta
    const condiciones = {};

    // Filtrar por categoría si existe
    if (categoriaId) {
        condiciones.categoria_id = categoriaId;
        categoria = await Categoria.findOne({ where: { id: categoriaId } });
    }

    if (nombre){
        condiciones.nombre = {
            [Op.like]: `%${nombre}%`
        }
    }

    // Filtrar por rango de precios si existen
    if (precioMin !== undefined && precioMax !== undefined) {
        const precioMinNum = parseFloat(formatearAEntero(precioMin));
        const precioMaxNum = parseFloat(formatearAEntero(precioMax));

        if (!isNaN(precioMinNum) && !isNaN(precioMaxNum)) {
            condiciones.precio = {
                [Op.between]: [precioMinNum, precioMaxNum],
            };
        } else {
            console.error('precioMin o precioMax no son números válidos');
        }
    } else if (precioMin !== undefined) {
        const precioMinNum = parseFloat(formatearAEntero(precioMin));
        if (!isNaN(precioMinNum)) {
            condiciones.precio = {
                [Op.gte]: precioMinNum, // Mayor o igual que precioMin
            };
        } else {
            console.error('precioMin no es un número válido');
        }
    } else if (precioMax !== undefined) {
        const precioMaxNum = parseFloat(formatearAEntero(precioMax));
        if (!isNaN(precioMaxNum)) {
            condiciones.precio = {
                [Op.lte]: precioMaxNum, // Menor o igual que precioMax
            };
        } else {
            console.error('precioMax no es un número válido');
        }
    }

    console.log(condiciones);
    productos = await Producto.findAll({where: condiciones});
    if (categoriaId){
        categoria = await Categoria.findOne({where: {id: categoriaId}})
    } 

    res.render( 'productos/lista', {
        pagina: categoriaId ? categoria.nombre : 'Todos los productos',
        params: req.params,
        nombre: nombre ? nombre : null,
        precioMin: precioMin ? precioMin : '',
        precioMax: precioMax ? precioMax : '',
        barra: true,
        categorias: await Categoria.findAll(),
        csrfToken: req.csrfToken(),
        productos
    })
}

function formatearAEntero(valorFormateado) {
    const valorSinFormato = valorFormateado.replace(/[^0-9]/g, '');
    const valorEntero = parseInt(valorSinFormato, 10);
    return valorEntero;
}

export{
    crear,
    ingresarProducto,
    listaProductos,
    editar,
    editarProducto
}