/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import type { NextPage } from 'next';

/**
 * Local imports
 */
import Layout from '../components/Layout';
import WorldMap from '../components/WorldMap';
import { animate } from '../utils/animation';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import citiesData from '../data/cities.json';

const mapMarkers = citiesData.map((cityData, n) => ({
  id: n,
  label: cityData.city,
  cloudLabel: cityData.country,
  country: cityData.country,
  lat: cityData.lat,
  lon: cityData.lon,
}));

// const mapMarkers = [
//   {
//     id: '1',
//     label: 'Cairo, Egypt',
//     lat: 30.040639,
//     lon: 31.238230,
//   },
//   {
//     id: '2',
//     label: 'Jerusalem, Palestine',
//     lat: 31.759729,
//     lon: 35.212102,
//   },
//   {
//     id: '3',
//     label: 'Bairut, Lebanon',
//     lat: 33.893540,
//     lon: 35.500782,
//   },
//   {
//     id: '4',
//     cloudLabel: <span>Clear <span style={{ marginLeft: 1, marginRight: 3, background: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, padding: '1px 3px 0' }}>5℃</span></span>,
//     label: 'Marwa',
//     lat: 64.463597,
//     lon: 16.786608,
//     cloudsCount: 14,
//   },
//   {
//     id: '5',
//     label: 'Iceland',
//     lat: 64.810050,
//     lon: -18.490203,
//   },
//   {
//     id: '6',
//     label: 'Greenland',
//     lat: 59.957960,
//     lon: -43.552618,
//   },
// ];

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'forecastViewActive',
  ]).includes(prop.toString()),
})<{
  forecastViewActive: boolean,
}>(({
  forecastViewActive,
}) => css`
  #world-map {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(calc(-50% + ${toRem(300)}), -50%);
    transition: 1000ms transform ${easing.snapInOut};

    ${forecastViewActive && css`
      /* transform: translate(-50%, -50%); */
    `};
  }
`);

/**
 * HomePage Component
 */
const HomePage: NextPage = (props) => {
  const isSSR = typeof window === 'undefined';
  const [mapSize, setMapSize] = React.useState(isSSR ? 0 : 0.85 * window.innerWidth);
  // const [mapZoom, setMapZoom] = React.useState(0);
  // const [mapTarget, setMapTarget] = React.useState<{lat: number, lon: number}>();

  React.useEffect(() => {
    const onWindowResize = () => {
      setMapSize(0.85 * window.innerWidth);
    };
    
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);


  return (
    <Layout {...props} >
      <Root>
        <WorldMap
          id="world-map"
          markers={mapMarkers}
          markersVisibilityRadius={350}
          canvasWidth={mapSize}
          canvasHeight={mapSize}
          zoom={10}
          getMarkerInfo={
            () => new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  {
                    content: (
                      <span>
                        Clear
                        <span
                          style={{
                            marginLeft: 5,
                            marginRight: 3,
                            background: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 5,
                            padding: '1px 3px 0',
                          }}
                        >5℃</span>
                      </span>
                    ),
                    count: 10,
                  }
                );
              }, 2000);
            })
          }
          // target={mapTarget}
          // zoom={mapZoom}
          // canvasWidth={2000}
          // onMarkerClick={(marker) => {
          //   if (mapTarget) {
          //     setMapTarget(undefined);
          //     setMapZoom(0);
          //   } else {
          //     setMapTarget({ lat: marker.lat, lon: marker.lon });
          //     setMapZoom(50);
          //   }
          // }}
        />
      </Root>
    </Layout>
  );
};

export default HomePage;
