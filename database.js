const user = 'ckalodkawatndo';// 'u0_a198';//'kevink520';
const password = process.env.DATABASE_PASSWORD;
const host = 'ec2-52-204-232-46.compute-1.amazonaws.com';// 'localhost';
const database = process.env.DATABASE_URL;//'des9j5i8s30crm';// 'nextbnb';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  database,
  user,
  password,
  {
    host,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

module.exports = sequelize;
