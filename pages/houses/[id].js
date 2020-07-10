import { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import fetch from 'isomorphic-unfetch';
import axios from 'axios';
import absoluteUrl from 'next-absolute-url';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../../components/Layout';
import Head from 'next/head';
import DateRangePicker from '../../components/DateRangePicker';

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate); //clone
  const end = new Date(endDate); //clone
  let dayCount = 0;
  while (start < end) {
    dayCount++;
    start.setDate(start.getDate() + 1);
  }

  return dayCount;
};

const getBookedDates = async houseId => {
  try {
    const response = await axios.post('http://localhost:3000/api/houses/booked', { houseId });
    if (response.data.status === 'error') {
      alert(response.data.message);
      return;
    }

    return response.data.bookedDates;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const canReserve = async (houseId, startDate, endDate) => {
  try {
    const response = await axios.post('/api/houses/check', {
      houseId,
      startDate,
      endDate,
    });

    if (response.data.status === 'error') {
      alert(response.data.message);
      return;
    }

    return response.data.message !== 'busy';
  } catch (error) {
    console.log(error);
    return;
  }
};

const House = ({
  house,
  bookedDates,
}) => {
  const {
    id,
    picture,
    type,
    town,
    title,
    price,
    reviews,
    reviewsCount,
  } = house;

  const user = useStoreState(state => state.user.user);
  const setShowLoginModal = useStoreActions(actions => actions.modals.setShowLoginModal);
  const [bookedDatesState, setBookedDatesState] = useState(bookedDates);
  const [dateChosen, setDateChosen] = useState(false);
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  return (
    <Layout>
      <div className='container'>
        <Head>
          <title>{title}</title>
        </Head>
        <article>
          <img src={picture} width='100%' alt='House picture' />
          <p>
            {type} - {town}
          </p>
          <p>{title}</p>
          {reviewsCount > 0 && (
            <div className='reviews'>
              <h3>{reviewsCount} Review{reviewsCount > 1 ? 's' : ''}</h3>
              {reviews.map((review, id) => (
                <div key={id}>
                  <p>{new Date(review.createdAt).toDateString()}</p>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </article>          
        <aside>
          <h2>Add dates for prices</h2>
          <DateRangePicker
            datesChanged={(startDate, endDate) => {
              setNumberOfNightsBetweenDates(
                calcNumberOfNightsBetweenDates(startDate, endDate)
              );

              setDateChosen(true);
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            bookedDates={bookedDatesState}
          />
          {dateChosen && (
            <div>
              <h2>Price per night</h2>
              <p>{price}</p>
              <h2>Total price for booking</h2>
              <p>{(numberOfNightsBetweenDates * price).toFixed(2)}</p>
              {user ? (
                <button
                  className='reserve'
                  type='button'
                  onClick={async () => {
                    try {
                      if (!await canReserve(id, startDate, endDate)) {
                        alert('The dates chosen are not valid');
                        return;
                      }
                      
                      const sessionResponse = await axios.post('/api/stripe/session', {
                        amount: price * numberOfNightsBetweenDates,
                      });

                      if (sessionResponse.data.status === 'error') {
                        alert(sessionResponse.data.message);
                        return;
                      }

                      const { sessionId, stripePublicKey } = sessionResponse.data;
                      const response = await axios.post('/api/houses/reserve', {
                        houseId: id,
                        startDate,
                        endDate,
                        sessionId,
                      });

                      if (response.data.status === 'error') {
                        alert(response.data.message);
                        return;
                      }

                      console.log(response.data);
                      const stripe = await loadStripe(stripePublicKey);
                      const { error } = await stripe.redirectToCheckout({ sessionId });
                      const newBookedDates = await getBookedDates(id);
                      setBookedDatesState(newBookedDates);
                    } catch(error) {
                      console.log(error);
                    }
                  }}
                >Reserve</button>
              ) : (
                <button
                  className='login'
                  type='button'
                  onClick={() => setShowLoginModal()}
                >Log in</button>
              )}
            </div>
          )}
        </aside>
        <style jsx>{`
          .container {
            display: grid;
            grid-template-columns: 60% 40%;
            grid-gap: 30px;
          }

          aside {
            border: 1px solid #ccc;
            padding: 20px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

House.getInitialProps = async ({ req, query }) => {
  try {
    const { origin } = absoluteUrl(req, 'localhost:3000');
    const { id } = query;
    const res = await fetch(`${origin}/api/houses/${id}`);
    const house = await res.json();
    const bookedDates = await getBookedDates(id);
    return {
      house,
      bookedDates,
    };
  } catch(error) {
    console.log(error);
  }
};

export default House;
