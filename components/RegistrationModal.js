import { useState } from 'react'
import axios from 'axios'
import { useStoreActions } from 'easy-peasy'

const RegistrationModal = ({ showLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordconfirmation, setPasswordconfirmation] = useState('')
  const setUser = useStoreActions(actions => actions.user.setUser)
  const setHideModal = useStoreActions(actions => actions.modals.setHideModal)
  const onSubmit = async e => {
    try {
      e.preventDefault()
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        passwordconfirmation
      })

      if (response.data.status === 'error') {
        alert(response.data.message)
        return
      }

      setUser(email)
      setHideModal()
    } catch(error) {
      alert(error.response.data.message)
      return
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

