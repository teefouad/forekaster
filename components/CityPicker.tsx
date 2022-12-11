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
  const radius = 140; // in vh
  const m = 0.4;
  const circum = `2 * ${Math.PI} * ${radius}vh`;
  const halfCircum = `${m} * ${Math.PI} * ${radius}vh`;

  return css`
    position: absolute;
    top: 50%;
    left: ${toRem(50)};
    transform: translate(0, -50%);

    button {
      margin-left: -10px;
      height: 36px;
    }

    .city-picker__arc {
      position: absolute;
      top: 50%;
      left: 0;
      pointer-events: none;
      transform: translate(${open ? toRem(150) : 0}, -50%);
      transition: 800ms transform ${easing.soft} ${open ? 0 : 300}ms;
    }

    svg {
      position: absolute;
      top: 50%;
      left: 0;
      width: ${2 * radius}vh;
      height: ${2 * radius}vh;
      transform: translate(0, -50%);
    }

    .city-picker__arc-middle {
      opacity: ${open ? 0.3 : 1};
      fill: transparent;
      stroke: #fff;
      stroke-width: ${toRem(open ? TRACK_WIDTH : TRACK_WIDTH_CLOSED)};
      stroke-dasharray: calc(${halfCircum}) calc(${circum});
      stroke-dashoffset: ${open ? 0 : `calc(${halfCircum})`};
      transform: rotate(${open ? (2 - m) * 0.5 * Math.PI : Math.PI}rad);
      transform-origin: center;
      transition:
        600ms opacity linear ${open ? 200 : 0}ms,
        600ms stroke-width ${easing.swiftSnap} ${open ? 0 : 200}ms,
        600ms stroke-dashoffset ${easing.swiftSnap} ${open ? 150 : 0}ms,
        600ms transform ${easing.swiftSnap} ${open ? 150 : 0}ms;
    }

    .city-picker__arc-top,
    .city-picker__arc-bottom {
      position: absolute;
      top: 50%;
      left: 0;
      z-index: 1;
      width: ${toRem(0.5 * (open ? TRACK_WIDTH : TRACK_WIDTH_CLOSED))};
      transition: 600ms width ${easing.swiftSnap} ${open ? 0 : 200}ms;

      &:before {
        content: '';
        display: block;
        width: 100%;
        height: 18px;
        opacity: ${open ? 0 : 1};
        background: #fff;
        margin-top: -18px;
        border-radius: ${toRem(5)} ${toRem(5)} 0 0;
        transform-origin: calc(${radius}vh) 100%;
        transform: rotate(${open ? 40 : 0}deg);
        transition:
          200ms opacity linear ${open ? 300 : 0}ms,
          600ms transform ${easing.swiftSnap} ${open ? 200 : 0}ms;
      }
    }

    .city-picker__arc-bottom {
      &:before {
        margin-top: 0;
        border-radius: 0 0 ${toRem(5)} ${toRem(5)};
        transform: rotate(${open ? -40 : 0}deg);
      }
    }
  `
});

/**
 * CityPicker Component
 */
export interface CityPickerProps {
  open?: boolean,
  onTriggerClick?: () => void,
}

export type CityPickerCombinedProps = CityPickerProps & JSX.IntrinsicElements['div'];

const CityPicker: React.FC<CityPickerCombinedProps> = ({
  open = false,
  onTriggerClick,
  ...props
}) => {
  return (
    <Root
      open={open}
      {...props}
      className={classnames('city-picker', props.className)}
    >
      <button onClick={onTriggerClick}>Click to open menu</button>

      <div className="city-picker__arc">
        <div className="city-picker__arc-top" />
        <div className="city-picker__arc-bottom" />

        <svg>
          <defs>
            <circle
              id="circle-def"
              r="50%"
              cx="50%"
              cy="50%"
            />

            <clipPath id="circle-clip-path">
              <use xlinkHref="#circle-def"/>
            </clipPath>
          </defs>

          <use
            className="city-picker__arc-middle"
            xlinkHref="#circle-def"
            clipPath="url(#circle-clip-path)"
          />
        </svg>
      </div>
    </Root>
  );
};

export default CityPicker;
