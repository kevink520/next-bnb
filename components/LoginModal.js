import { useState } from 'react'
import axios from 'axios'
import { useStoreActions } from 'easy-peasy'

const LoginModal = ({ showSignup }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setUser = useStoreActions(actions => actions.user.setUser)
  const setHideModal = useStoreActions(actions => actions.modals.setHideModal)

  return (
    <>
      <h2>Log in</h2>
      <div>
        <form onSubmit={async e => {
          try {
            e.preventDefault()
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.status === 'error') {
              alert(response.data.message)
              return
            }

            setUser(email)
            setHideModal()
          } catch(error) {
            if (error.response) {
              alert(error.response.data.message)
              return
            }

            if (error.request) {
              alert(error.request)
              return
            }

            alert(error.message)
          }
        }}>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />
          <button>Log in</button>
        </form>
        <p>
          Don&rsquo;t have an account yet?{' '}
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              showSignup()
            }}
          >Sign up</a>
        </p>
      </div>
    </>
  )
}

export default LoginModal

