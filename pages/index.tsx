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
import CityPicker from '../components/CityPicker';
import WorldMap from '../components/WorldMap';
import { toRem } from '../utils/text';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})((props) => css`
  #world-map {
    /* position: relative; */
    /* margin-left: ${toRem(300)}; */
    /* left: 50%;
    transform: translate(calc(-50% + ${toRem(300)}), 0); */
  }

  #city-picker {
    /* transform: translateX(${toRem(300)}); */
  }
`);

/**
 * Homepage Component
 */
const Homepage: NextPage = (props) => {
  return (
    <Root {...props}>
      <Head>
        <title>Forekaster | A neat way to learn about the current weather and forecast</title>
        <meta name="description" content="A neat way to learn about the current weather and forecast" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <WorldMap
        id="world-map"
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

      {/* <CityPicker id="city-picker" /> */}
    </Root>
  );
};

export default Homepage;
