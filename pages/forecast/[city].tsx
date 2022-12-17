/**
 * Dependency imports
 */
import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

/**
 * Local imports
 */
import Layout from '../../components/Layout';
import WeatherForecast from '../../components/WeatherForecast';

/**
 * CityPage Component
 */
const CityPage: NextPage = (props) => {
  const router = useRouter();

  if (!router.query.city) return null;
  
  return (
    <Layout {...props} >
      <WeatherForecast city={router.query.city.toString()} />
    </Layout>
  );
};

export default CityPage;
