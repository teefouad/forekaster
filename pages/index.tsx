/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import type { NextPage } from 'next';
import Head from 'next/head';

/**
 * Local imports
 */
import CityPicker, { City } from '../components/CityPicker';
import WorldMap from '../components/WorldMap';
import * as easing from '../utils/easing';
import { toRem } from '../utils/text';
import WeatherForecast from '../components/WeatherForecast';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'cityPickerActive',
  ]).includes(prop.toString()),
})<{
  cityPickerActive: boolean,
}>(({
  cityPickerActive,
}) => css`
  #world-map {
    opacity: ${cityPickerActive ? 0.6 : 1};
    transform: translate(${cityPickerActive ? `calc(-50% + ${toRem(100)})` : '-50%'}, -50%) scale(${cityPickerActive ? 0.55 : 1});
    transition:
      600ms opacity ${cityPickerActive ? easing.swiftSnap : 'linear'} ${cityPickerActive ? 0 : 250}ms,
      600ms transform ${easing.swiftSnap} ${cityPickerActive ? 0 : 250}ms;
  }
`);

/**
 * Homepage Component
 */
const Homepage: NextPage = (props) => {
  const [selectedCity, setSelectedCity] = React.useState<City | null>(null);
  const [cityPickerActive, setCityPickerActive] = React.useState(true);
  
  return (
    <Root {...props} cityPickerActive={cityPickerActive}>
      <Head>
        <title>Forekaster | A neat way to learn about the current weather and forecast</title>
        <meta name="description" content="A neat way to learn about the current weather and forecast" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <WeatherForecast city="oslo" onClose={() => alert('close')} />

      {/* <WorldMap
        id="world-map"
        interactive={!cityPickerActive}
        autoOrbit={cityPickerActive}
        markers={[
          {
            id: '1',
            label: 'Cairo, Egypt',
            lat: 30.040639,
            lon: 31.238230,
          },
          {
            id: '2',
            label: 'Jerusalem, Palestine',
            lat: 31.759729,
            lon: 35.212102,
          },
          {
            id: '3',
            label: 'Bairut, Lebanon',
            lat: 33.893540,
            lon: 35.500782,
          },
          {
            id: '4',
            label: 'Clear : 5℃',
            lat: 64.463597,
            lon: 16.786608,
          },
          {
            id: '5',
            label: 'Iceland',
            lat: 64.810050,
            lon: -18.490203,
          },
          {
            id: '6',
            label: 'Greenland',
            lat: 59.957960,
            lon: -43.552618,
          },
        ]}
      />

      <CityPicker
        id="city-picker"
        open={cityPickerActive}
        onTriggerClick={() => setCityPickerActive(true)}
        onClose={() => setCityPickerActive(false)}
        onItemSelect={cityData => setSelectedCity(cityData)}
      /> */}
    </Root>
  );
};

export default Homepage;
