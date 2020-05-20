const LoginModal = ({ showSignup }) => (
  <>
    <h2>Log in</h2>
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        alert('Log in')
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

export default LoginModal

