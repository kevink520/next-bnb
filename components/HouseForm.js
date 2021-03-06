import { useState } from 'react';
import Router from 'next/router';
import axios from 'axios';
import Editor from 'react-pell';

const HouseForm = props => {
  const id = (props.house && props.house.id) || null;
  const [title, setTitle] = useState((props.house && props.house.title) || '');
  const [town, setTown] = useState((props.house && props.house.town) || '');
  const [price, setPrice] = useState((props.house && props.house.price) || 0);
  const [picture, setPicture] = useState((props.house && props.house.picture) ||'');
  const [description, setDescription] = useState((props.house && props.house.description) || '');
  const [guests, setGuests] = useState((props.house && props.house.guests) || 0);
  const [bedrooms, setBedrooms] = useState((props.house && props.house.bedrooms) || 0);
  const [beds, setBeds] = useState((props.house && props.house.beds) || 0);
  const [baths, setBaths] = useState((props.house && props.house.baths) || 0);
  const [wifi, setWifi] = useState((props.house && props.house.wifi) || false);
  const [kitchen, setKitchen] = useState((props.house && props.house.kitchen) || false);
  const [heating, setHeating] = useState((props.house && props.house.heating) || false);
  const [freeParking, setFreeParking] = useState((props.house && props.house.freeParking) || false);
  const [entirePlace, setEntirePlace] = useState((props.house && props.house.entirePlace) || false);
  const [type, setType] = useState((props.house && props.house.type) || 'Entire house');
  const houseTypes = ['Entire house', 'Room'];

  return (
    <div>
      <form onSubmit={e => e.preventDefault()}>
        <div>
          <p>
            <label>House title</label>
            <input
              required
              onChange={e => setTitle(e.target.value)}
              placeholder="House title"
              value={title}
            />
          </p>
          <p>
            <label>Town</label>
            <input
              required
              onChange={e => setTown(e.target.value)}
              placeholder="Town"
              value={town}
            />
          </p>
          <p>
            <label>Price per night</label>
            <input
              required
              type="number"
              onChange={e => setPrice(e.target.value)}
              placeholder="Price per night"
              value={price}
            />
          </p>
          <p>
            <label>House picture</label>
            <input
              type="file"
              id="fileUpload"
              accept="image/*"
              onChange={async event => {
                const files = event.target.files;
                const formData = new FormData();
                formData.append('image', files[0]);
		try {
		  const response = await axios.post('/api/host/image', formData);
                  setPicture(response.data.imageUrl);
                } catch (error) {
                  console.log(error);
	          alert(JSON.stringify(error));
                }
              }}
            />
            {picture ? <img src={picture} width="200" alt="House image" /> : ''}
          </p>
          <div>
            <label>House description</label>
            <Editor
              onChange={html => setDescription(html)}
              defaultContent={description}
              actions={['bold', 'underline', 'italic']}
            />
          </div>
        </div>
        <div className="grid">
          <div>
            <p>
              <label>Number of guests</label>
              <input
                required
                type="number"
                onChange={e => setGuests(e.target.value)}
                placeholder="Number of guests"
                value={guests}
              />
            </p>
            <p>
              <label>Number of bedrooms</label>
              <input
                required
                type="number"
                onChange={e => setBedrooms(e.target.value)}
                placeholder="Number of bedrooms"
                value={bedrooms}
              />
            </p>
            <p>
              <label>Number of beds</label>
              <input
                required
                type="number"
                onChange={e => setBeds(e.target.value)}
                placeholder="Number of beds"
                value={beds}
              />
            </p>
            <p>
              <label>Number of baths</label>
              <input
                required
                type="number"
                onChange={e => setBaths(e.target.value)}
                placeholder="Number of baths"
                value={baths}
              />
            </p>
          </div>
          <div>
            <p>
              <label>Does it have Wifi?</label>
              <select
                onChange={e => setWifi(e.target.value)}
                value={wifi}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </p>
            <p>
              <label>Does it have a kitchen?</label>
              <select
                onChange={e => setKitchen(e.target.value)}
                value={kitchen}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </p>
            <p>
              <label>Does it have heating?</label>
              <select
                onChange={e => setHeating(e.target.value)}
                value={heating}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </p>
            <p>
              <label>Does it have free parking?</label>
              <select
                onChange={e => setFreeParking(e.target.value)}
                value={freeParking}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </p>
            <p>
              <label>Is it the entire place?</label>
              <select
                onChange={e => setEntirePlace(e.target.value)}
                value={entirePlace}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </p>
            <p>
              <label>Type of house?</label>
              <select
                onChange={e => setType(e.target.value)}
                value={type}
              >
                {houseTypes.map((item, key) => (
                  <option key={key} value={item}>{item}</option>
                ))}
              </select>
            </p>
          </div>
        </div>
        <button onClick={async event => {
          event.preventDefault();
          try {
            const response = await axios.post(`/api/host/${props.edit ? 'edit' : 'new'}`, {
              house: {
                id,
                title,
                town,
                price,
                picture,
                description,
                guests,
                bedrooms,
                beds,
                baths,
                wifi,
                kitchen,
                heating,
                freeParking,
                entirePlace,
                type,
              },
            });

            if (response.data.status === 'error') {
              alert(response.data.message);
              return;
            }

            Router.push('/host');
          } catch (error) {
            alert(error.response.data.message);
          }
        }}>{props.edit ? 'Edit' : 'Add'} house</button>
      </form>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: calc(50% - 25px) calc(50% - 25px);
          grid-gap: 50px;
        }

        input,
        select,
        textarea {
          display: block;
          padding: 20px;
          font-size: 16px !important;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          margin-bottom: 10px;
        }

	select {
          max-width: 100%;
          box-sizing: border-box;
	  margin: 0;
          box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
          -moz-appearance: none;
	  -webkit-appearance: none;
	  appearance: none;
          background-color: #fff;
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAABQCAYAAAC0wU3eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAihJREFUeJzt1bFrE1EcwPHv7y6FQpwUxAyd1U03B2kt8dpJHSTdROziIILW/8JiCs5FQYVizihCQWwlFRz8F3RWEBdxEB007zloQ+7say6X9xKQ33e7u/dy78O9y4GmaZqmaZqmaZqmaZqmaZqmjZa4Ltw5+3QOY2szh7rpUrrUHeeiXK0lz04Ya04emJ56fHXz/Pf89WjPSfV0WbCvJWLjw5f4fqvRisMvdf+aSbpgrXkrcO/bj58vVpMH1fyYfzBr9XTZiKzvHotwadKgZpIuYKPnwPTfNc1GtrqZB0XZSU/OGZF1QTLbb5KgPKS3JjgTmepG/7kMxhpO5SG9yRMAuSC9NWFP9x9nMLGdumvhvevHxwkaBMFiROy1/lMZzI3Ohc8SMz9pUBGIjczlm68amW2255ZqLrZrtsuOwFHXDa3l4czB7hXff9tFIbe2G4/yl5zfmUmARoHAPhgYL2hUCDg+mrutvLz4SWLmsbxzjfHxDvmAwIAn07vZYrvGLzoIx1xjyj4hXxAoiIEwIJ8QGAIDfkG+ITAkBvyAQkCgBAbg9lzrSKUS75QBhYJASQyUA4WEwAgYGA708avUQ0JgRAwUBm2JMEtACHjAQDGQM08Q8ISBP6C4EnVE5HjhSR4h4BEDQ4I8Q8AzBgqCAkAgAAYGgAJBIBAGHKCAEAiIgRwoMAQCYwBWk/bh2HIdMW9Wthtboe+naZqmaZqmaZqmaZqmadp/3G8I8Zhwt9JbhAAAAABJRU5ErkJggg==');
          background-repeat: no-repeat, repeat;
          background-position: right .7em top 50%, 0 0;
          background-size: .65em auto, 100%;
	}

        select::-ms-expand {
          display: none;
        }

        select:hover {
          border-color: #888;
        }

        select:focus {
          border-color: #aaa;
          box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
          box-shadow: 0 0 0 3px -moz-mac-focusring;
          color: #222;
          outline: none;
        }

        select option {
          font-weight: normal;
        }
      `}</style>
      <style jsx global>{`
        .pell-container {
          border: 1px solid #ccc;
        }

        .pell,
        .pell-content {
          box-sizing: border-box;
        }

        .pell-content {
          height: 300px;
          outline: 0;
          overflow-y: auto;
          padding: 10px;
        }

        .pell-actionbar {
          background-color: #fff;
          border-bottom: 1px solid hsla(0, 0%, 4%, 0.1);
        }

        .pell-button {
          background-color: transparent;
          border: none;
          cursor: pointer;
          height: 30px;
          outline: 0;
          width: 30px;
          vertical-align: bottom;
          color: black;
        }

        .pell-button-selected {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  )
};

export default HouseForm;
