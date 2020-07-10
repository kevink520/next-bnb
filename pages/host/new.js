import { useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import HouseForm from '../../components/HouseForm';

const NewHouse = ({ req }) => (
  <Layout>
    <>
      <Head>
        <title>Add a new house</title>
      </Head>
      <HouseForm req={req} />
    </>
  </Layout>
);

NewHouse.getInitialProps = ({ req }) => {
  return { req };
};

export default NewHouse;
