const RegistrationModal = ({ showLogin }) => (
  <>
    <h2>Sign up</h2>
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        alert('Sign up!')
      }}>
        <input
          id="email"
          type="email"
          placeholder="Email address"
        />
        <input
          id="password"
          type="password"
          placeholder="Password"
        />
        <input
          id="passwordconfirmation"
          type="password"
          placeholder="Enter password again"
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

export default RegistrationModal

