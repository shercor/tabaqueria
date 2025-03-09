import 'dotenv/config';

export default {
  development: {
    username: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NOMBRE,
    host: '127.0.0.1',
    port: 4306,
    dialect: 'mysql',
    define: {
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NOMBRE + '_test',
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NOMBRE,
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql'
  }
};
