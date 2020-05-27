const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bodyParser = require('body-parser')

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./model').User;

const sequelize = require('./model').sequelize;

const sessionStore = new SequelizeStore({
  db: sequelize,
});

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    if (!email || !password) {
      done('Email and password required', null);
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      done('Email not found', null);
      return;
    }

    const valid = await user.isPasswordValid(password);
    if (!valid) {
      done('Email and password do not match', null);
      return;
    }
  
    done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  const user = await User.findOne({ where: { email } });
  done(null, user);
});

(async () => {
  try {
    await nextApp.prepare();
    const server = express();
    server.use(bodyParser.json())
    server.use(
      session({
        secret: 'somesupersecretstr10044',
        resave: false,
        saveUninitialized: true,
        true: 'nextbnb',
        cookie: {
          secure: false,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
        store: sessionStore,
      }),
      passport.initialize(),
      passport.session()
    );
  
    server.post('/api/auth/register', async (req, res) => {
      const { email, password, passwordconfirmation } = req.body;
      if (password !== passwordconfirmation) {
        res.end(JSON.stringify({
          status: 'error',
          message: 'Passwords do not match',
        }));
      
        return;
      }
  
      try {
        const user = await User.create({ email, password });
        req.login(user, err => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({
              status: 'error',
              message: err,
            }));
          
            return;
          }

          res.end(JSON.stringify({
            status: 'success',
            message: 'Logged in',
          }));
        });
      } catch(error) {
        res.statusCode = 500;
        let message = 'An error occurred';
        if (error.name === 'SequelizeUniqueConstraintError') {
          message = 'User already exists';
        }

        res.end(JSON.stringify({
          status: 'error',
          message,
        }));
      }
    });
    
    server.post('/api/auth/login', async (req, res, next) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            status: 'error',
            message: err,
          }));

          return;
        }

        if (!user) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            status: 'error',
            message: 'No user matching credentials',
          }));

          return;
        }

        req.login(user, err => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({
              status: 'error',
              message: err,
            }));

            return;
          }

          return res.end(JSON.stringify({
            status: 'success',
            message: 'Logged in',
          }));
        });
      })(req, res, next);
    });

    server.post('/api/auth/logout', async (req, res) => {
      req.logout();
      req.session.destroy();
      return res.end(JSON.stringify({
        status: 'success',
        message: 'Logged out',
      }));
    });

    server.all('*', (req, res) => handle(req, res));
    server.listen(port, err => {
      if (err) {
        throw err;
      }

      console.log(`> Ready on http://localhost:${port}`);
    });
  } catch(error) {
    console.log(error);
    process.exit(1);
  } 
})();

//sessionStore.sync();
