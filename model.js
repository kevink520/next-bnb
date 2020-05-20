import { Sequelize, Model, DataTypes } from 'sequelize'
import { user, password, host, database } from './database'
import bcrypt from 'bcryptjs'

const sequelize = new Sequelize(
  database,
  user,
  password,
  {
    host,
    dialect: 'postgres',
    logging: false
  }
)

export class User extends Model {}

User.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'user',
  timestamps: false,
  hooks: {
    beforeCreate: async user => {
      const saltRounds = 10
      user.password = await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
            return reject(err)
          }

          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
              return reject(err)
            }

            resolve(hash)
          })
        })
      })
    }
  }
})

User.prototype.isPasswordValid = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.promise, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res)
    })
  })
}

