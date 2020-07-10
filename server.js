const express = require('express');
const next = require('next');
const randomstring = require('randomstring');
//const dotenv = require('dotenv');
//dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bodyParser = require('body-parser');
//const fileupload = require('express-fileupload');
const { imageUpload } = require('./middleware/file-upload');
const sanitizeHtml = require('sanitize-html');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models/user');
const House = require('./models/house');
const Review = require('./models/review');
const Booking = require('./models/booking');

const { Op } = require('sequelize');
const sequelize = require('./database');

const sessionStore = new SequelizeStore({
  db: sequelize,
});

User.sync({ alter: true });
House.sync({ alter: true });
Review.sync({ alter: true });
Booking.sync({ alter: true });
sessionStore.sync({ alter: true });

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
    server.use(bodyParser.json(/*{
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    }*/));

    server.use(
      session({
        secret: process.env.SESSION_SECRET,
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
      passport.session(),
      fileupload()
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

    server.get('/api/houses', async (req, res) => {
      try {
        const result = await House.findAndCountAll();
        const houses = result.rows.map(house => house.dataValues);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(houses));
      } catch(error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'An error occurred' }));
      }
    });

    server.get('/api/houses/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const house = await House.findByPk(id);
        if (house) {
          const reviews = await Review.findAndCountAll({
            where: {
              houseId: id,
            },
          });

          house.dataValues.reviews = reviews.rows.map(review => review.dataValues);
          house.dataValues.reviewsCount = reviews.count;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(house.dataValues));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Not found' }));
        }
      } catch(error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'An error occurred' }));
      }
    });
    
    const canBookThoseDates = async (houseId, startDate, endDate) => {
      const results = await Booking.findAll({
        where: { 
          houseId,
          startDate: {
            [Op.lte]: new Date(endDate),
          },
          endDate: {
            [Op.gte]: new Date(startDate),
          },
        },
      });

      return !(results.length > 0);
    };

    server.post('/api/houses/reserve', async (req, res) => {
      try {
        const {
          houseId,
          startDate,
          endDate,
          sessionId,
        } = req.body;

        if (!req.session.passport) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        if (!await canBookThoseDates(houseId, startDate, endDate)) {
          res.status(500)
            .json({
              status: 'error',
              message: 'House is already booked',
            });

          return;
        }

        const userEmail = req.session.passport.user;
        const user = await User.findOne({
          where: { email: userEmail },
        });

        if (!user) {
          throw new Error();
        }

        await Booking.create({
          houseId,
          userId: user.id,
          startDate,
          endDate,
          sessionId,
        });

        res.json({
          status: 'success',
          message: 'ok',
        });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.string({ message: 'An error occurred' }));
      }
    });

    server.post('/api/houses/check', async (req, res) => {
      try {
        const {
          houseId,
          startDate,
          endDate,
        } = req.body;

        let message = 'free';
        if (!await canBookThoseDates(houseId, startDate, endDate)) {
          message = 'busy';
        }

        res.json({
          status: 'success',
          message,
        });
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    const getDatesBetweenDates = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let dates = [];
      while (start < end) {
        dates = [...dates, new Date(start)];
        start.setDate(start.getDate() + 1);
      }
    
      dates = [...dates, end];
      return dates;
    };

    server.post('/api/houses/booked', async (req, res) => {
      try {
        const { houseId } = req.body;
        if (!houseId) {
          throw new Error();
        }

        const results = await Booking.findAll({
          where: {
            houseId,
            endDate: {
              [Op.gte]: new Date(),
            },
          },
        });

        let bookedDates = [];
        for (result of results) {
          const { startDate, endDate } = result.dataValues;
          const dates = getDatesBetweenDates(startDate, endDate);
          bookedDates = [...bookedDates, ...dates];
        }

        bookedDates = [...new Set(bookedDates)];
        res.json({
          status: 'success',
          message: 'ok',
          bookedDates,
        });
      } catch(error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
            error,
          });
      }
    });

    server.post('/api/stripe/session', async (req, res) => {
      try {
        const { amount } = req.body;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            name: 'Booking house on NextBnB',
            amount: amount * 100,
            currency: 'usd',
            quantity: 1,
          }],
          success_url: `${process.env.BASE_URL}/bookings`,
          cancel_url: `${process.env.BASE_URL}/bookings`,
        });

        res.json({
          status: 'success',
          sessionId: session.id,
          stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        });
      } catch (error) {
        console.log(error)
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.post('/api/stripe/webhook', async (req, res) => {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const sig = req.headers['stripe-signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      } catch (error) {
        console.log(error.message);
        res.status(400)
          .json({
            status: 'success',
            message: `Webhook Error: ${error.message}`,
          });

        return;
      }

      if (event.type === 'checkout.session.completed') {
        const sessionId = event.data.object.id;
        try {
          await Booking.update({ paid: true }, { where: { sessionId } });
        } catch (error) {
          console.error(error);
        }
      }

      res.json({ received: true });
    });

    server.post('/api/bookings/clean', async (req, res) => {
      try {
        await Booking.destroy({ where: { paid: false } });
        res.json({
          status: 'success',
          message: 'ok',
        });
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.get('/api/bookings/list', async (req, res) => {
      try {
        if (!req.session.passport || !req.session.passport.user) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        const email = req.session.passport.user;
        const user = await User.findOne({ where: { email } });
        const result = await Booking.findAndCountAll({
          where: {
            paid: true,
            userId: user.id,
            endDate: {
              [Op.gte]: new Date(),
            },
          },
          order: [['startDate', 'ASC']],
        });

        const bookings = await Promise.all(result.rows.map(async booking => {
          const data = {};
          data.booking = booking.dataValues;
          data.house = (await House.findByPk(data.booking.houseId)).dataValues;
          return data;
        }));

        res.json(bookings);
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.get('/api/host/list', async (req, res) => {
      try {
        if (!req.session.passport || !req.session.passport.user) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        const email = req.session.passport.user;
        const user = await User.findOne({ where: { email } });
        const houses = await House.findAll({ where: { host: user.id } });
        houseIds = houses.map(house => house.id);
        const bookingsData = await Booking.findAll({
          where: {
            paid: true,
            houseId: {
              [Op.in]: houseIds,
            },
            endDate: {
              [Op.gte]: new Date(),
            },
          },
          order: [['startDate', 'ASC']],
        });

        const bookings = bookingsData.map(booking => ({
          booking: booking.dataValues,
          house: houses.filter(house => house.id === booking.dataValues.houseId)[0].dataValues,
        }));

        res.json({
          bookings,
          houses,
        });
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.post('/api/host/new', async (req, res) => {
      try {
        const houseData = req.body.house;
        if (!req.session.passport || !req.session.passport.user) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        const email = req.session.passport.user;
        const user = await User.findOne({ where: { email }});
        houseData.host = user.id;
        houseData.description = sanitizeHtml(houseData.description, {
          allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
        });

        await House.create(houseData);
        res.json({
          status: 'success',
          message: 'ok',
        });
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.post('/api/host/edit', async (req, res) => {
      try {
        const houseData = req.body.house;
        if (!req.session.passport || !req.session.passport.user) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        const email = req.session.passport.user;
        const user = await User.findOne({ where: { email } });
        const house = await House.findByPk(houseData.id);
        if (!house) {
          res.status(404)
            .json({
              status: 'error',
              message: 'Not found',
            });

          return;
        }
        
        if (house.host !== user.id) {
          res.status(403)
            .json({
              status: 'error',
              message: 'Unauthorized',
            });

          return;
        }

        houseData.description = sanitizeHtml(houseData.description, {
          allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
        });

        await House.update(houseData, {
          where: {
            id: houseData.id,
          },
        });

        res.json({
          status: 'success',
          message: 'ok',
        });
      } catch (error) {
        res.status(500)
          .json({
            status: 'error',
            message: 'An error occurred',
          });
      }
    });

    server.post('/api/host/image', async (req, res) => {
      if (!req.session.passport) {
        res.status(403)
          .json({
            status: 'error',
            message: 'Unauthorized',
          });

        return;
      }
	
      res.status(200)
        .json({
          status: 'success',
          imageUrl: req.file.location,
        });
      });
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
