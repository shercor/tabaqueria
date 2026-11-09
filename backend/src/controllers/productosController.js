import * as productosService from '../services/productosService.js';
import { erroresDeFormulario } from '../middlewares/validacion.js';

// Crear y editar comparten la vista productos/formulario
const mostrarFormulario = async (res, { producto = {}, errores, status = 200 }) => {
    const esNuevo = !producto.id;
    res.status(status).render('productos/formulario', {
        pagina: esNuevo ? 'Crear un producto' : `Editar ${producto.nombre}`,
        titulo: esNuevo ? 'Crear Producto' : 'Editar producto',
        accion: esNuevo ? '/productos/crear' : `/productos/editar/${producto.id}`,
        barra: true,
        categorias: await productosService.listarCategorias(),
        producto,
        errores,
    });
};

const formularioCrear = (req, res) => mostrarFormulario(res, {});

const crear = async (req, res) => {
    const errores = erroresDeFormulario(req);
    if (errores) return mostrarFormulario(res, { producto: req.body, errores, status: 400 });

    await productosService.crear(req.body, req.file);
    res.redirect('/productos/crear');
};

const formularioEditar = async (req, res) => {
    const producto = await productosService.buscar(req.params.id);
    await mostrarFormulario(res, { producto });
};

const editar = async (req, res) => {
    const errores = erroresDeFormulario(req);
    if (errores) {
        const producto = await productosService.buscar(req.params.id);
        // Se muestra lo que escribió el usuario sobre los datos guardados
        return mostrarFormulario(res, { producto: { ...producto.toJSON(), ...req.body }, errores, status: 400 });
    }

    await productosService.actualizar(req.params.id, req.body, req.file);
    res.redirect('/productos/lista');
};

const lista = async (req, res) => {
    // La categoría llega por la ruta (/lista/3) o por el formulario de filtros (?categoria=3)
    const { nombre = '', precioMin = '', precioMax = '' } = req.query;
    const { productos, categoria } = await productosService.listar({
        categoriaId: req.params.id || req.query.categoria,
        nombre,
        precioMin,
        precioMax,
    });

    res.render('productos/lista', {
        pagina: categoria ? categoria.nombre : 'Todos los productos',
        barra: true,
        productos,
        categorias: await productosService.listarCategorias(),
        filtros: { categoriaId: categoria?.id ?? null, nombre, precioMin, precioMax },
    });
};

export { formularioCrear, crear, formularioEditar, editar, lista };
