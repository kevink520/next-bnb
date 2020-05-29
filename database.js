const user = 'kevink520';//'u0_a159';
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
