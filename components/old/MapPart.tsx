/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'x',
    'y',
    'width',
    'height',
  ]).includes(prop.toString()),
})<Partial<MapPartCombinedProps>>(({
  x,
  y,
  width,
  height,
}) => css`
  position: absolute;
  top: ${y! * width!}%;
  left:  ${x! * width!}%;
  width: ${width}%;
  height: ${height}%;
  overflow: hidden;

  > img {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-${x! * width!}%, -${y! * height!}%);
  }
`);

/**
 * MapPart Component
 */
export interface MapPartProps {
  x: number,
  y: number,
  width: number,
  height: number,
}

export type MapPartCombinedProps = MapPartProps & JSX.IntrinsicElements['div'];

const MapPart: React.FC<MapPartCombinedProps> = (props) => {
  return (
    <Root {...props}>
      <img src="/world.svg" />
    </Root>
  );
};

MapPart.defaultProps = {};

export default MapPart;
