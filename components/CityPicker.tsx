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
import * as easing from '../utils/easing';
import { toRem } from '../utils/text';

/**
 * Constants
 */
const TRACK_WIDTH = 680;
const TRACK_WIDTH_CLOSED = (2 / 3) * TRACK_WIDTH;

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'open',
  ]).includes(prop.toString()),
})<Partial<CityPickerCombinedProps>>(({
  open,
}) => {
  const m = 0.4;
  const circum = `2 * 3.14 * 50%`;
  const halfCircum = `${m} * 3.14 * 50%`;

  return css`
    position: absolute;
    top: 50%;
    left: ${toRem(50)};
    transform: translate(0, -50%);

    .city-picker__track {
      position: relative;

      .city-picker__track-top,
      .city-picker__track-bottom {
        position: absolute;
        z-index: 1;
        top: -${toRem(16)};
        left: 0;
        width: ${toRem(0.5 * (open ? TRACK_WIDTH : TRACK_WIDTH_CLOSED))};
        height: ${toRem(16)};
        transform: translate(${open ? toRem(150) : 0}, 0);
        transition:
          600ms width ${easing.swiftSnap} ${open ? 0 : 200}ms,
          840ms transform ${easing.soft} ${open ? 0 : 300}ms;

        &:before {
          content: '';
          display: block;
          width: 100%;
          height: 100%;
          opacity: ${open ? 0 : 1};
          background: #fff;
          border-radius: ${toRem(5)} ${toRem(5)} 0 0;
          transform-origin: calc(0.5 * 280vh) 100%;
          transform: rotate(${open ? 24 : 0}deg);
          transition:
            300ms opacity linear 200ms,
            600ms transform ${easing.swiftSnap} ${open ? 200 : 0}ms;
        }
      }

      .city-picker__track-bottom {
        top: 0;

        &:before {
          border-radius: 0 0 ${toRem(5)} ${toRem(5)};
          transform: rotate(${open ? -24 : 0}deg);
        }
      }

      > svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 280vh;
        height: 280vh;
        transform: translate(${open ? toRem(150) : 0}, -50%);
        pointer-events: none;
        transition: 800ms transform ${easing.soft} ${open ? 0 : 300}ms;
      }

      #city-picker__track-circle {
        opacity: ${open ? 0.3 : 1};
        stroke: #fff;
        stroke-width: ${toRem(open ? TRACK_WIDTH : TRACK_WIDTH_CLOSED)};
        fill: transparent;
        stroke-dasharray: calc(${halfCircum}) calc(${circum});
        stroke-dashoffset: ${open ? 0 : `calc(${halfCircum})`};
        transform: rotate(${open ? (2 - m) * 0.5 * 3.14 : 3.14}rad);
        transform-origin: center;
        transition:
          600ms opacity linear ${open ? 200 : 0}ms,
          600ms stroke-width ${easing.swiftSnap} ${open ? 0 : 200}ms,
          600ms stroke-dashoffset ${easing.swiftSnap} ${open ? 150 : 0}ms,
          600ms transform ${easing.swiftSnap} ${open ? 150 : 0}ms;
      }
    }
  `
});

/**
 * CityPicker Component
 */
export interface CityPickerProps {
  open?: boolean,
}

export type CityPickerCombinedProps = CityPickerProps & JSX.IntrinsicElements['div'];

const CityPicker: React.FC<CityPickerCombinedProps> = ({
  open,
  ...props
}) => {
  return (
    <Root
      open={open}
      {...props}
      className={classnames('city-picker', props.className)}
    >
      <div className="city-picker__track">
        <div className="city-picker__track-top" />

        <svg>
          <defs>
            <circle
              id="city-picker__track-circle-shape"
              r="50%"
              cx="50%"
              cy="50%"
            />

            <clipPath id="city-picker__track-circle-clipper">
              <use xlinkHref="#city-picker__track-circle-shape"/>
            </clipPath>
          </defs>

          <use
            id="city-picker__track-circle"
            xlinkHref="#city-picker__track-circle-shape"
            clipPath="url(#city-picker__track-circle-clipper)"
          />
        </svg>

        <div className="city-picker__track-bottom" />
      </div>
    </Root>
  );
};

CityPicker.defaultProps = {};

export default CityPicker;
