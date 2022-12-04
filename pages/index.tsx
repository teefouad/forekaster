import type { NextPage } from 'next';
import Head from 'next/head';
import Map from '../components/Map';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Forekaster | A neat way to learn about the current weather and forecast</title>
        <meta name="description" content="A neat way to learn about the current weather and forecast" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Map />
    </div>
  );
}

export default Home
