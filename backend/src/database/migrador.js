import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import db from '../config/database.js';
import env from '../config/env.js';

const require = createRequire(import.meta.url);
const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

// Las migraciones usan el formato de sequelize-cli: up(queryInterface, Sequelize).
// El registro queda en la tabla SequelizeMeta, la misma que usa sequelize-cli.
const migrador = new Umzug({
    migrations: {
        glob: ['*.cjs', { cwd: carpeta }],
        resolve: ({ name, path: ruta, context }) => {
            const migracion = require(ruta);
            return {
                name,
                up: () => migracion.up(context, Sequelize),
                down: () => migracion.down(context, Sequelize),
            };
        },
    },
    context: db.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db }),
    logger: env.esTest ? undefined : console,
});

export default migrador;
