const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

const sequelize = require('../database');

class User extends Sequelize.Model {}

User.init({
  email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'user',
  timestamps: false,
  hooks: {
    beforeCreate: async user => {
      const saltRounds = 10;
      user.password = await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
            return reject(err);
          }

          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
              return reject(err);
            }

            resolve(hash);
          });
        });
      });
    },
  },
});

User.prototype.isPasswordValid = async function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
};

module.exports = User;
