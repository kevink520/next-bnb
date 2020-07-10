import fetch from 'isomorphic-unfetch';
import Layout from '../components/Layout';
import House from '../components/House';

const Index = ({ houses }) => {
  return (
    <Layout>
      <div>
        <h2>Places to stay</h2>
        <div className="houses">
          {(houses || []).map((house, index) => (
            <House key={index} {...house} />
          ))}
        </div>
        <style jsx>{`
          .houses {
            display: grid;
            grid-template-columns: 50% 50%;
            grid-template-rows: 300px 300px;
            grid-gap: 40px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

Index.getInitialProps = async () => {
  try {
    //const res = await fetch('http://localhost:3000/api/houses');
    const houses = [];//await res.json();
    return { houses };
  } catch(error) {
    console.log(error);
  }
};

export default Index

