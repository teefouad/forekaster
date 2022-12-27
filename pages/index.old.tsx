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
import CityPicker, { City } from '../components/CityPicker.old';
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

      <WeatherForecast city="amsterdam" onClose={() => alert('close')} />

      {/*  */}
    </Root>
  );
};

export default Homepage;
