// CLI de migraciones: node src/database/migrar.js <up|down|pending|executed>
import migrador from './migrador.js';
import db from '../config/database.js';

try {
    await migrador.runAsCLI();
} finally {
    await db.close();
}
