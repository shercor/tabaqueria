import { validationResult } from 'express-validator'
import { Op } from 'sequelize';
import Categoria from '../models/Categoria.js';
import Producto from '../models/Producto.js';
import { ErrorNegocio } from '../helpers/http.js';

// Campos del formulario que se guardan en el producto
const datosDelFormulario = body => ({
    nombre: body.nombre,
    descripcion: body.descripcion,
    precio: body.precio,
    stock: body.stock,
    categoria_id: body.categoria_id || null,
    estado: body.estado === '1'
});

const crear = async (req, res) => {
    res.render('productos/crear', {
        pagina: 'Crear un producto',
        barra: true,
        categorias: await Categoria.findAll(),
        producto: {}
    })
}

const ingresarProducto = async (req, res) => {
    const resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.status(400).render('productos/crear', {
            pagina: 'Crear un producto',
            barra: true,
            categorias: await Categoria.findAll(),
            errores: resultado.array(),
            producto: req.body
        });
    }

    await Producto.create({
        ...datosDelFormulario(req.body),
        imagen: req.file ? `/uploads/${req.file.filename}` : null
    });

    res.redirect('/productos/crear');
}

const editar = async (req, res) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);

    res.render('productos/editar', {
        pagina: `Editar ${producto.nombre}`,
        barra: true,
        categorias: await Categoria.findAll(),
        producto
    });
}

const editarProducto = async (req, res) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);

    const resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.status(400).render('productos/editar', {
            pagina: `Editar ${producto.nombre}`,
            barra: true,
            categorias: await Categoria.findAll(),
            errores: resultado.array(),
            producto: { ...producto.toJSON(), ...req.body, id: producto.id }
        });
    }

    const datos = datosDelFormulario(req.body);
    // Sin archivo nuevo se conserva la imagen actual
    if (req.file) datos.imagen = `/uploads/${req.file.filename}`;

    await producto.update(datos);
    res.redirect('/productos/lista');
}

// "$15.000" -> 15000; vacío o sin dígitos -> null
const aEntero = valor => {
    const digitos = String(valor ?? '').replace(/\D/g, '');
    return digitos ? parseInt(digitos, 10) : null;
};

const listaProductos = async (req, res) => {
    // La categoría llega por la ruta (/lista/3) o por el formulario de filtros (?categoria=3)
    const categoriaId = req.params.id || req.query.categoria || null;
    const { nombre, precioMin, precioMax } = req.query;
    const condiciones = {};
    let categoria = null;

    if (categoriaId) {
        categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) throw new ErrorNegocio('La categoría no existe', 404);
        condiciones.categoria_id = categoria.id;
    }

    if (nombre) {
        condiciones.nombre = { [Op.like]: `%${nombre}%` };
    }

    const minimo = aEntero(precioMin);
    const maximo = aEntero(precioMax);
    if (minimo !== null || maximo !== null) {
        condiciones.precio = {};
        if (minimo !== null) condiciones.precio[Op.gte] = minimo;
        if (maximo !== null) condiciones.precio[Op.lte] = maximo;
    }

    res.render('productos/lista', {
        pagina: categoria ? categoria.nombre : 'Todos los productos',
        barra: true,
        categorias: await Categoria.findAll(),
        categoriaId: categoria?.id ?? null,
        nombre: nombre ?? '',
        precioMin: precioMin ?? '',
        precioMax: precioMax ?? '',
        productos: await Producto.findAll({ where: condiciones })
    })
}

export{
    crear,
    ingresarProducto,
    listaProductos,
    editar,
    editarProducto
}
