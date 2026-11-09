# Tabaquería

Tienda web de tabaquería: registro de usuarios, catálogo con filtros, carrito y checkout.

**Stack:** Node 24 · Express 5 · Pug · Sequelize + MySQL 8 · Bootstrap 5 · Docker Compose

## Puesta en marcha con Docker

```bash
cp backend/example.env backend/.env   # y completa JWT_SECRET con un valor largo y aleatorio
docker compose up --build
docker compose exec backend npm run seed   # opcional: categorías de ejemplo
```

- App: http://localhost:3000
- MySQL desde el equipo: `127.0.0.1:4306` (usuario `root`, password `secret`)

Al arrancar, el contenedor aplica las migraciones pendientes. El código se monta como volumen y nodemon reinicia la app con cada cambio.

## Puesta en marcha sin Docker

Requiere Node 22 o superior y un MySQL 8 accesible.

```bash
cd backend
cp example.env .env   # ajusta BD_* y JWT_SECRET
npm install
npm run migrate
npm run seed          # opcional
npm run dev
```

Sin `EMAIL_HOST`, los emails no se envían: el enlace de confirmación de cuenta o de cambio de password aparece en la consola del backend.

## Variables de entorno

Plantilla completa en [backend/example.env](backend/example.env). Una variable vacía cuenta como no definida.

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `BD_NOMBRE`, `BD_USER` | sí | Base de datos |
| `BD_PASSWORD`, `BD_HOST`, `BD_PORT` | no | Por defecto `''`, `localhost`, `3306` |
| `JWT_SECRET` | sí | Firma la cookie de sesión |
| `CSRF_SECRET` | no | Si falta, se deriva de `JWT_SECRET` |
| `PORT` | no | Puerto de la app (3000) |
| `NOMBRE_TIENDA` | no | Nombre que se muestra en la interfaz |
| `APP_URL` | no | Base de los enlaces de los emails (por defecto `BACKEND_URL:PORT`) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | no | SMTP (por ejemplo Mailtrap) |
| `UPLOADS_DIR` | no | Carpeta de las imágenes subidas (`public/uploads`) |
| `BD_LOG` | no | `true` para ver el SQL en consola |
| `TEST_BD_*` | no | Base de los tests, ver más abajo |

## Scripts

Todos se corren dentro de `backend/`.

| Script | Qué hace |
| --- | --- |
| `npm run dev` | App con recarga automática |
| `npm start` | App sin recarga (producción) |
| `npm run migrate` / `npm run migrate:down` | Aplica las migraciones pendientes / revierte la última |
| `npm run seed` | Carga categorías de ejemplo si la tabla está vacía |
| `npm test` | Suite de pruebas |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |

## Base de datos y migraciones

El esquema se maneja solo con migraciones (no hay `sync()`). Están en `src/database/migrations/`, en formato sequelize-cli, y quedan registradas en la tabla `SequelizeMeta`.

Para cambiar el esquema, agrega un archivo `AAAAMMDDHHMMSS-descripcion.cjs`:

```js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('productos', 'destacado', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn('productos', 'destacado');
    },
};
```

Luego actualiza el modelo correspondiente en `src/models/` y corre `npm run migrate`.

Los montos (precios y totales) son **enteros en pesos chilenos**: no hay decimales en la base ni en el código.

## Tests

Usan `node:test` y supertest contra una base MySQL propia. Por defecto es `tabaqueria_test` en el MySQL de Docker Compose:

```bash
docker compose up -d db
cd backend && npm test
```

Se cambia con `TEST_BD_NOMBRE`, `TEST_BD_HOST`, `TEST_BD_PORT`, `TEST_BD_USER` y `TEST_BD_PASSWORD`, en el `.env` o en la línea de comandos. La base se crea si no existe y se le aplican las migraciones. Entre cada caso se vacían las tablas, por eso los tests **se niegan a correr si el nombre no termina en `_test`**.

## Estructura

```
backend/
├── src/
│   ├── server.js          Arranque: conecta a la base y levanta Express
│   ├── app.js             Configuración de Express (middlewares, estáticos, rutas)
│   ├── config/            env.js (única lectura de process.env) y conexión a la base
│   ├── models/            Modelos de Sequelize; las relaciones van en models/index.js
│   ├── database/          Migraciones, migrador y seed
│   ├── routes/            Rutas por dominio; routes/index.js decide cuáles exigen sesión
│   ├── validators/        Reglas de express-validator por dominio
│   ├── controllers/       Traducen HTTP ↔ servicios: leen req, renderizan o responden JSON
│   ├── services/          Lógica de negocio y transacciones
│   ├── middlewares/       Sesión, CSRF, subida de imágenes, validación y manejo de errores
│   └── utils/             Funciones sin dependencias de Express ni de la base
├── views/
│   ├── layouts/           base (con o sin barra de navegación) y auth
│   ├── partials/          Encabezado, modal del carrito, errores, filtros
│   ├── mixins/            Campos de formulario reutilizables
│   └── auth/ productos/ pedidos/   Páginas
├── public/
│   ├── css/app.css        Estilos propios
│   ├── js/                Módulos del navegador (uno por página + api, formato, alertas)
│   └── uploads/           Imágenes subidas (fuera de git)
└── tests/                 Pruebas y helpers
```

## Convenciones

- **Flujo de una petición:** ruta → validator → controller → service → modelo. Los controllers no consultan la base y los services no conocen `req` ni `res`.
- **Errores:** un service lanza `ErrorNegocio(mensaje, status)` para un error que el usuario puede ver. El middleware central responde con JSON en `/api/*` y en peticiones `fetch` (cabecera `Accept: application/json`), y con la vista `mensaje` en el resto. Cualquier otro error se registra y responde 500.
- **Sesión y CSRF:** la sesión es un JWT en la cookie `_token`. Todo POST, PATCH o DELETE necesita el token CSRF: en `fetch` va en la cabecera `X-CSRF-Token` (se toma de `<meta name="csrf-token">`), en formularios en el campo `_csrf`, y en formularios con archivos en la URL (`?_csrf=`).
- **Frontend:** sin JS ni estilos inline. Cada página carga su módulo de `public/js/`, y las llamadas al backend pasan por `public/js/api.js`.
- **Estilos:** inputs, selects y botones comparten la variable `--alto-control` (38 px) para que los controles de una misma fila midan lo mismo. Usa las clases existentes de `app.css` antes de crear una nueva.
- **Código:** ESLint y Prettier (comillas simples, 4 espacios). Los nombres de dominio van en español.
