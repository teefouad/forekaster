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
import { toRem } from '../utils/text';
import { animate } from '../utils/animation';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})<{}>((props) => css`
  #world-map {
    /* width: 85vw;
    height: 85vw;
    margin-left: ${toRem(300)}; */
  }
`);

/**
 * HomePage Component
 */
const HomePage: NextPage = (props) => {
  const [config, setConfig] = React.useState({
    interactive: true,
    autoOrbit: 'off',
    target: undefined,
    zoom: 1,
  });

  return (
    <Layout {...props} >
      <Root>
        <button onClick={() => setConfig(v => ({ ...v, interactive: !v.interactive }))}>Toggle Interactive ({config.interactive ? 'on' : 'off'})</button>
        <button onClick={() => setConfig(v => ({ ...v, autoOrbit: 'slow' }))}>AutoOrbit: Slow ({config.autoOrbit})</button>
        <button onClick={() => setConfig(v => ({ ...v, autoOrbit: 'fast' }))}>AutoOrbit: Fast ({config.autoOrbit})</button>
        <button onClick={() => setConfig(v => ({ ...v, autoOrbit: 'off' }))}>AutoOrbit: Off ({config.autoOrbit})</button>
        <button onClick={() => setConfig(v => ({ ...v, target: { lat: 21.414795, lon: 39.807913, } }))}>Makkah</button>
        <button onClick={() => setConfig(v => ({ ...v, target: { lat: 30.01, lon: 31.14, } }))}>Target Cairo</button>
        <button onClick={() => setConfig(v => ({ ...v, target: { lat: 36.42, lon: 3.08, } }))}>Target Algiers</button>
        <button onClick={() => setConfig(v => ({ ...v, target: { lat: -28.814427, lon: 24.817810, } }))}>Target South Africa</button>
        <button onClick={() => setConfig(v => ({ ...v, target: { lat: 65.296558, lon: -44.267634, } }))}>Target Greenland</button>
        <button onClick={() => setConfig(v => ({ ...v, zoom: 10 }))}>Zoom In</button>
        <button onClick={() => setConfig(v => ({ ...v, zoom: 5 }))}>Zoom midway</button>
        <button onClick={() => setConfig(v => ({ ...v, zoom: 1 }))}>Zoom Out</button>

        <WorldMap
          id="world-map"
          interactive={config.interactive}
          autoOrbit={config.autoOrbit}
          target={config.target}
          zoom={config.zoom}
        />
      </Root>
    </Layout>
  );
};

export default HomePage;
