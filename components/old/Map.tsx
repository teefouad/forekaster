/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import MapPart from './MapPart';

/**
 * Local imports
 */

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})<Partial<MapCombinedProps>>((props) => css`
  position: relative;
  width: 1010px;
  height: 666px;
  perspective: 600px;
  transform-style: preserve-3d;
`);

/**
 * Component(s)
 */

/**
 * Map Component
 */
export interface MapProps {
  [prop: string]: any,
}

export type MapCombinedProps = MapProps & JSX.IntrinsicElements['div'];

const Map: React.FC<MapCombinedProps> = (props) => {
  const countX = 10;
  const countY = 10;

  return (
    <Root>
      {
        Array.from({ length: countX * countY }).map((v, n) => (
          <MapPart
            key={n}
            x={n % countX}
            y={Math.floor(n / countX)}
            width={100 / countX}
            height={100 / countY}
            style={{
              transform: `rotateY(45deg)`,
            }}
          />
        ))
      }
      <MapPart x={1} y={0} width={20} height={20} />
    </Root>
  );
};

Map.defaultProps = {};

export default Map;
