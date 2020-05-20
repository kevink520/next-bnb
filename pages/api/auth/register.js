import { User } from '../../../../model'

export default (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { email, password, pssswordconfirmation } = req.body
  if (password !== passwordconfirmation) {
    res.end(JSON.stringify({
      status: 'error',
      message: 'Passwords do not match'
    })
  }

  try {
    const user = await User.create({ email, password })
    res.end(JSON.stringify({
      status: 'success',
      message: 'User added'
    }))
  } catch(error) {
    res.statusCode = 500
    let message = 'An error occurred'
    if (error.name === 'SequelizeUniqueConstraintError') {
      message = 'User already exists'
    }

    res.end(JSON.stringify({
      status: 'error',
      message
    }))
  }
}

