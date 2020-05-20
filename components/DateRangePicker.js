import { useState } from 'react'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { DateUtils } from 'react-day-picker'
import 'react-day-picker/lib/style.css'
import dateFnsFormat from 'date-fns/format'
import dateFnsParse from 'date-fns/parse'

const parseDate = (str, format, locale) => {
  const parsed = dateFnsParse(str, format, new Date(), { locale });
  return DateUtils.isDate(parsed) ? parsed : null
}

const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale })
const format = 'MMMM dd, yyyy'

const DateRangePicker = ({ datesChanged }) => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  return (
    <div className="date-range-picker-container">
      <div>
        <label>From:</label>
        <DayPickerInput
          formatDate={formatDate}
          format={format}
          value={startDate}
          parseDate={parseDate}
          placeholder={dateFnsFormat(new Date(), format)} 
          dayPickerProps={{
            modifiers: {
              disabled: {
                before: new Date()
              }
            }
          }}
          onDayChange={day => {
            setStartDate(day)
            const newEndDate = new Date(day)
            if (!DateUtils.isDayBefore(day, endDate)) {
              newEndDate.setDate(newEndDate.getDate() + 1)
              setEndDate(newEndDate)
            }

            datesChanged(day, newEndDate)
          }}
        />
      </div>
      <div>
        <label>To:</label>
        <DayPickerInput
          formatDate={formatDate}
          format={format}
          value={endDate}
          parseDate={parseDate}
          placeholder={dateFnsFormat(new Date(), format)}
          dayPickerProps={{
            modifiers: {
              disabled: {
                before: startDate ? startDate : new Date()
              }
            }
          }}
          onDayChange={day => {
            setEndDate(day)
            datesChanged(startDate, day)
          }}
        />
      </div>
      <style jsx>{`
        .date-range-picker-container > div {
          display: grid;
          grid-template-columns: 30% 70%;
          border: 1px solid #ddd;
          padding: 10px;
        }
  
        label {
          padding-top: 10px;
        }
      `}</style>
      <style jsx global>{`
        .DayPickerInput input {
          width: 120px;
          padding: 10px;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}

export default DateRangePicker

