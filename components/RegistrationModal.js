import { useState } from 'react'
import axios from 'axios'

const RegistrationModal = ({ showLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordconfirmation, setPasswordconfirmation] = useState('')
  const onSubmit = async e => {
    try {
      e.preventDefault()
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        passwordconfirmation
      })

      console.log(response)
    } catch(error) {
      console.log(error)
    }
  }

  return (
    <>
      <h2>Sign up</h2>
      <div>
        <form onSubmit={onSubmit}>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            id="passwordconfirmation"
            type="password"
            placeholder="Enter password again"
            value={passwordconfirmation}
            onChange={e => setPasswordconfirmation(e.target.value)}
          />
          <button>Sign up</button>
        </form>
        <p>
          Already have an account?{' '}
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              showLogin()
            }}
          >Log in</a>
        </p>
      </div>
    </>
  )
}

export default RegistrationModal

