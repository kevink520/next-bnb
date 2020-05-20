import { useState } from 'react'
import { useStoreActions } from 'easy-peasy'
import houses from '../houses.json'
import Layout from '../../components/Layout'
import Head from 'next/head'
import DateRangePicker from '../../components/DateRangePicker'

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate) //clone
  const end = new Date(endDate) //clone
  let dayCount = 0
  while (start < end) {
    dayCount++
    start.setDate(start.getDate() + 1)
  }

  return dayCount
}

const House = ({ house }) => {
  const {
    picture,
    type,
    town,
    title,
    price,
    rating,
    reviewsCount,
  } = house

  const setShowLoginModal = useStoreActions(actions => actions.modals.setShowLoginModal)
  const [dateChosen, setDateChosen] = useState(false)  
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0)
  return (
    <Layout
      content={(
        <div className="container">
          <Head>
            <title>{title}</title>
          </Head>
          <article>
            <img src={picture} width='100%' alt='House picture' />
            <p>
              {type} - {town}
            </p>
            <p>{title}</p>
            <p>
              {rating} ({reviewsCount})
            </p>
          </article>          
          <aside>
            <h2>Add dates for prices</h2>
            <DateRangePicker
              datesChanged={(startDate, endDate) => {
                setNumberOfNightsBetweenDates(
                  calcNumberOfNightsBetweenDates(startDate, endDate)
                )
                setDateChosen(true)
              }}
            />
            {dateChosen && (
              <div>
                <h2>Price per night</h2>
                <p>{price}</p>
                <h2>Total price for booking</h2>
                <p>{(numberOfNightsBetweenDates * price).toFixed(2)}</p>
                <button
                  className="reserve"
                  type="button"
                  onClick={() => setShowLoginModal()}
                >Reserve</button>
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
      )}
    />
  )
}

House.getInitialProps = ({ query }) => {
  const { id } = query
  return {
    house: houses.filter(house => house.id === id)[0],
  }  
}

export default House

