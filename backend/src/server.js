import app from './app.js';
import env from './config/env.js';
import db from './config/database.js';
import migrador from './database/migrador.js';

try {
    await db.authenticate();
    const pendientes = await migrador.pending();
    if (pendientes.length > 0) {
        console.warn(`Hay ${pendientes.length} migraciones pendientes: ejecuta "npm run migrate"`);
    }
} catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
}

app.listen(env.puerto, () => {
    console.log(`Servidor en ${env.urlPublica} (${env.entorno})`);
});
