// Carga categorías de ejemplo si la tabla está vacía: npm run seed
import { db, Categoria } from '../models/index.js';

const CATEGORIAS = [
    { nombre: 'Habanos', descripcion: 'Puros y cigarros' },
    { nombre: 'Tabaco de pipa', descripcion: 'Mezclas para pipa' },
    { nombre: 'Tabaco para armar', descripcion: 'Tabaco suelto' },
    { nombre: 'Papelillos y filtros', descripcion: 'Insumos para armar' },
    { nombre: 'Accesorios', descripcion: 'Pipas, encendedores y cortadores' },
];

try {
    if ((await Categoria.count()) > 0) {
        console.log('Ya hay categorías: no se cargó nada');
    } else {
        await Categoria.bulkCreate(CATEGORIAS.map((categoria) => ({ ...categoria, estado: true })));
        console.log(`Se cargaron ${CATEGORIAS.length} categorías`);
    }
} finally {
    await db.close();
}
