import axios from 'axios';
import absoluteUrl from 'next-absolute-url';
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

EditHouse.getInitialProps = async ({ req, query }) => {
  try {
    const { origin } = absoluteUrl(req, 'localhost:3000');
    const { id } = query;
    const response = await axios.get(`${origin}/api/houses/${id}`);
    return { house: response.data };
  } catch (error) {
    console.log(error);
  }
};

export default EditHouse;
