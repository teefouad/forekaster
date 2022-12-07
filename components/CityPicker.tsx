/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import CloudTooltip from './CloudTooltip';

/**
 * Local imports
 */

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})<Partial<CityPickerCombinedProps>>((props) => css`
  position: absolute;
  bottom: 50px;
  left: 50px;
`);

/**
 * Component(s)
 */

/**
 * CityPicker Component
 */
export interface CityPickerProps {
  [prop: string]: any,
}

export type CityPickerCombinedProps = CityPickerProps & JSX.IntrinsicElements['div'];

const CityPicker: React.FC<CityPickerCombinedProps> = (props) => {
  return (
    <Root>
      <CloudTooltip label="My work on Github">
        Select a city
      </CloudTooltip>

      -

      <CloudTooltip label="My LinkedIn">
        Select a city
      </CloudTooltip>
    </Root>
  );
};

CityPicker.defaultProps = {};

export default CityPicker;
