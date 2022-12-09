/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import classnames from 'classnames';

/**
 * Local imports
 */
import CloudTooltip from './CloudTooltip';
import { toRem } from '../utils/text';

/**
 * Constants
 */
const TRACK_WIDTH = 340;

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})<Partial<CityPickerCombinedProps>>((props) => css`
  position: absolute;
  top: 0;
  left: 0;

  .city-picker__track {
    

    > svg {
      position: absolute;
      top: 50vh;
      left: 50vw;
      width: 200vh;
      height: 200vh;
      transform: translate(-50%, -50%);

      circle {
        stroke: black;
        stroke-width: ${toRem(TRACK_WIDTH)};
        fill: transparent;
      }
    }
  }

  
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
    <Root {...props} className={classnames('city-picker', props.className)}>
      <div className="city-picker__track">
        <svg>
          <circle r={`calc(50% - ${toRem(TRACK_WIDTH)})`} cx="50%" cy="50%" />
        </svg>
      </div>
    </Root>
  );
};

CityPicker.defaultProps = {};

export default CityPicker;
