import { Op } from 'sequelize';
import { Categoria, Producto } from '../models/index.js';
import { ErrorNegocio } from '../utils/errores.js';
import { aEntero } from '../utils/formato.js';

const listarCategorias = () => Categoria.findAll({ order: [['id', 'ASC']] });

const buscarCategoria = async (id) => {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) throw new ErrorNegocio('La categoría no existe', 404);
    return categoria;
};

// Filtros opcionales; los precios pueden venir formateados ("$15.000")
const listar = async ({ categoriaId, nombre, precioMin, precioMax } = {}) => {
    const condiciones = {};
    const categoria = categoriaId ? await buscarCategoria(categoriaId) : null;

    if (categoria) condiciones.categoria_id = categoria.id;
    if (nombre) condiciones.nombre = { [Op.like]: `%${nombre}%` };

    const minimo = aEntero(precioMin);
    const maximo = aEntero(precioMax);
    if (minimo !== null || maximo !== null) {
        condiciones.precio = {};
        if (minimo !== null) condiciones.precio[Op.gte] = minimo;
        if (maximo !== null) condiciones.precio[Op.lte] = maximo;
    }

    const productos = await Producto.findAll({ where: condiciones, order: [['id', 'ASC']] });
    return { productos, categoria };
};

const buscar = async (id) => {
    const producto = await Producto.findByPk(id);
    if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);
    return producto;
};

// Campos del formulario que se guardan en el producto
const datosDelFormulario = (datos, archivo) => ({
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio: datos.precio,
    stock: datos.stock,
    categoria_id: datos.categoria_id || null,
    estado: datos.estado === '1',
    ...(archivo && { imagen: `/uploads/${archivo.filename}` }),
});

const crear = (datos, archivo) => Producto.create(datosDelFormulario(datos, archivo));

// Sin archivo nuevo se conserva la imagen actual
const actualizar = async (id, datos, archivo) => {
    const producto = await buscar(id);
    return producto.update(datosDelFormulario(datos, archivo));
};

export { listarCategorias, listar, buscar, crear, actualizar };
