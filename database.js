const user = 'u0_a198';//'kevink520';
const password = '';
const host = 'localhost';
const database = 'nextbnb';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  database,
  user,
  password,
  {
    host,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
