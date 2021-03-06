import Link from 'next/link';
import { useStoreState, useStoreActions } from 'easy-peasy';
import axios from 'axios';

const Header = () => {
  const setShowLoginModal = useStoreActions(
    actions => actions.modals.setShowLoginModal
  );

  const setShowRegistrationModal = useStoreActions(
    actions => actions.modals.setShowRegistrationModal
  );
  
  const user = useStoreState(state => state.user.user);
  const setUser = useStoreActions(
    actions => actions.user.setUser
  );

  return (
    <div className='nav-container'>
      <Link href='/'>
        <a className="brand">
          <img src='/img/logo.png' alt='' /> nextbnb
        </a>
      </Link>
      <nav>
        <ul>
          {user ?
          <>
            <li className="username">{user}</li>
            <li>
              <Link href="/bookings">
                <a>Bookings</a>
              </Link>
            </li>
            <li>
              <Link href="/host">
                <a>Your Houses</a>
              </Link>
            </li>
            <li>
              <Link href="/host/new">
                <a>Add House</a>
              </Link>
            </li>
            <li>
              <a
                href="#"
                onClick={async e => {
                  e.preventDefault();
                  await axios.post('/api/auth/logout');
                  setUser(null);
                }}
              >Log out</a>
            </li>
          </> : 
          <>
            <li>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setShowRegistrationModal();
                }}
              >Sign up</a>
            </li>
            <li>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setShowLoginModal();
                }}
              >Log in</a>
            </li>
          </>}
        </ul>
      </nav>
      <style jsx>{`
        .brand {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 700;
        }

        ul {
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        li {
          display: block;
        }

        .username {
          padding: 1em 0.5em;
          margin-right: 15px;
        }

        a {
          text-decoration: none;
          display: block;
          margin-right: 15px;
          color: #333;
        }

        nav a {
          padding: 1em 0.5em;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          height: 50px;
          margin-left: 40px;
          margin-right: 27px;
        }

        img {
          float: left;
        }
      `}</style>
    </div>
  )
};

export default Header;
