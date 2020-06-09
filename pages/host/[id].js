import axios from 'axios';
import Layout from '../../components/Layout';
import Head from 'next/head';
import HouseForm from '../../components/HouseForm';

const EditHouse = ({ house }) => (
  <Layout>
    <>
      <Head>
        <title>Edit house</title>
      </Head>
      <HouseForm
        house={house}
        edit
      />
    </>
  </Layout>
);

EditHouse.getInitialProps = async ({ query }) => {
  try {
    const { id } = query;
    const response = await axios.get(`http://localhost:3000/api/houses/${id}`);
    return { house: response.data };
  } catch (error) {
    console.log(error);
  }
};

export default EditHouse;
