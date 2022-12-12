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
import citiesListData from '../data/cities.json';
import { raf } from '../utils/animation';
import * as easing from '../utils/easing';
import { toRem } from '../utils/text';

/**
 * Constants
 */
const ARC_RADIUS = 136; // in vh
const TRACK_WIDTH = 440;
const TRACK_WIDTH_CLOSED = 220;
const DEGREES_PER_CITY = 8;
const VISIBILITY_SPAN = 80;

const indexedCities = citiesListData.sort((a, b) => a.city.localeCompare(b.city)).map((city, n) => ({ index: n, ...city }));

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
  const m = 0.5;
  const circum = `2 * ${Math.PI} * ${ARC_RADIUS}vh`;
  const halfCircum = `${m} * ${Math.PI} * ${ARC_RADIUS}vh`;

  return css`
    position: absolute;
    top: 50%;
    left: ${toRem(50)};
    transform: translate(${open ? toRem(100) : 0}, -50%);
    transition: 800ms transform ${easing.soft} ${open ? 0 : 150}ms;

    > button {
      display: none;
      margin-left: -10px;
      height: 36px;
    }

    .city-picker__list {
      position: absolute;
      top: 50%;
      left: ${ARC_RADIUS}vh;
      pointer-events: ${open ? 'auto' : 'none'};
      transform: translate(-50%, -50%);
    }

    .city-button {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      position: absolute;
      top: 50%;
      right: 0;
      width: ${toRem(TRACK_WIDTH)};
      margin-top: ${toRem(-50)};
      height: ${toRem(100)};
      padding-inline-end: ${toRem(20)};
      transform-origin: right center;
      cursor: pointer;
      font-family: Lato;
      opacity: ${open ? 1 : 0};
      border: none;
      background: transparent;
      transition: 200ms opacity;
    }

    .city-button__index {
      margin-inline-start: ${toRem(20)};
      margin-top: ${toRem(10)};
      opacity: 0.07;
      font-size: ${toRem(21)};
      font-weight: 900;
      letter-spacing: -0.005em;
      user-select: none;
      color: #333;
    }

    .city-button__label {
      display: block;
      font-size: ${toRem(34)};
      font-weight: 900;
      letter-spacing: -0.005em;
      white-space: nowrap;
      text-transform: uppercase;
      color: #333;
      opacity: 0.25;
      transition: 180ms opacity;
    }

    .city-button__dot {
      position: absolute;
      top: 50%;
      right: ${toRem(-43)};
      margin-top: ${toRem(2)};
      display: block;
      width: ${toRem(5)};
      height: ${toRem(5)};
      background: #d9d9d9;
      border-radius: 50%;
      transition: 180ms background-color;

      &:before {
        content: '';
        position: absolute;
        left: ${toRem(-50)};
        top: 50%;
        width: ${toRem(24)};
        height: ${toRem(1)};
        opacity: 0.07;
        background-color: #333;
      }
    }

    .city-button:hover {
      .city-button__label {
        opacity: 1;
      }
    }

    .city-picker__arc {
      position: absolute;
      top: 50%;
      left: 0;
      pointer-events: none;
      transform: translate(0, -50%);
    }

    svg {
      position: absolute;
      top: 50%;
      left: 0;
      width: ${2 * ARC_RADIUS}vh;
      height: ${2 * ARC_RADIUS}vh;
      transform: translate(0, -50%);
    }

    .city-picker__arc-middle {
      opacity: ${open ? 0.6 : 1};
      fill: transparent;
      stroke: #fff;
      stroke-width: ${toRem(open ? 2 * TRACK_WIDTH : 2 * TRACK_WIDTH_CLOSED)};
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
      width: ${toRem(open ? TRACK_WIDTH : TRACK_WIDTH_CLOSED)};
      transition: 600ms width ${easing.swiftSnap} ${open ? 0 : 200}ms;

      &:before {
        content: '';
        display: block;
        width: 100%;
        height: 18px;
        opacity: ${open ? 0 : 1};
        background: #fff;
        margin-top: -18px;
        border-radius: ${toRem(open ? 0 : 18)} ${toRem(open ? 0 : 18)} 0 0;
        transform-origin: calc(${ARC_RADIUS}vh) 100%;
        transform: rotate(${open ? 0.5 * m * Math.PI : 0}rad);
        transition:
          200ms opacity linear ${open ? 300 : 0}ms,
          600ms border-radius ${easing.swiftSnap} ${open ? 200 : 0}ms,
          600ms transform ${easing.swiftSnap} ${open ? 200 : 0}ms;
      }
    }

    .city-picker__arc-bottom {
      &:before {
        margin-top: 0;
        border-radius: 0 0 ${toRem(open ? 0 : 18)} ${toRem(open ? 0 : 18)};
        transform: rotate(${open ? -0.5 * m * Math.PI : 0}rad);
      }
    }

    .city-picker__arc-inner,
    .city-picker__arc-outer {
      position: absolute;
      top: 50%;
      left: ${ARC_RADIUS}vh;
      width: calc(${2 * ARC_RADIUS}vh - ${toRem(2 * TRACK_WIDTH + 80)} + ${toRem(open ? 0 : 300)});
      height: calc(${2 * ARC_RADIUS}vh - ${toRem(2 * TRACK_WIDTH + 80)} + ${toRem(open ? 0 : 300)});
      pointer-events: none;
      opacity: ${open ? 1 : 0};
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition:
        140ms opacity linear 400ms,
        600ms width ${easing.swiftSnap} ${open ? 0 : 200}ms,
        600ms height ${easing.swiftSnap} ${open ? 0 : 200}ms;
    }

    .city-picker__arc-outer {
      width: calc(${2 * ARC_RADIUS}vh + ${toRem(150)});
      height: calc(${2 * ARC_RADIUS}vh + ${toRem(150)});
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
  const [visibleCities, setVisibleCities] = React.useState(indexedCities.slice(0, Math.floor(VISIBILITY_SPAN / DEGREES_PER_CITY) + 1));

  const scrollDataRef = React.useRef({
    target: 0,
    actual: 0,
  });
  
  React.useEffect(() => {
    if (!open) return;

    const onScroll = (e: WheelEvent) => {
      scrollDataRef.current.target += 0.025 * e.deltaY;
    };
    
    window.addEventListener('wheel', onScroll);

    const cancelFrame = raf(() => {
      scrollDataRef.current.actual += (scrollDataRef.current.target - scrollDataRef.current.actual) / 7;
      
      // cap scroll position
      const minScrollPosition = 0;
      const maxScrollPosition = indexedCities.length * DEGREES_PER_CITY - VISIBILITY_SPAN + 30;

      if (scrollDataRef.current.target < minScrollPosition) {
        scrollDataRef.current.target += (minScrollPosition - scrollDataRef.current.target) / 1.1;
      }
      
      if (scrollDataRef.current.target > maxScrollPosition) {
        scrollDataRef.current.target += (maxScrollPosition - scrollDataRef.current.target) / 1.1;
      }

      // calculate visible cities
      const scrollPosition = Math.max(minScrollPosition, Math.min(maxScrollPosition, scrollDataRef.current.actual));
      const firstVisibleCityIndex = Math.max(0, Math.floor(scrollPosition / DEGREES_PER_CITY) - 2); // use 2 cities as buffer
      const numberOfVisibleCities = firstVisibleCityIndex + Math.floor(VISIBILITY_SPAN / DEGREES_PER_CITY) + 1 + 2; // use 2 cities as buffer

      setVisibleCities(indexedCities.slice(firstVisibleCityIndex, numberOfVisibleCities));
    });

    return () => {
      cancelFrame();
      window.removeEventListener('wheel', onScroll);
    };
  }, [open]);

  return (
    <Root
      open={open}
      {...props}
      className={classnames('city-picker', props.className)}
    >
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

      <div className="city-picker__arc-inner" />
      <div className="city-picker__arc-outer" />

      <button onClick={onTriggerClick}>Click to open menu</button>

      <div
        className="city-picker__list"
        style={{
          transform: `translate3d(0, 0, 0) rotate(${scrollDataRef.current.actual + 22}deg)`,
        }}
      >
        {
          visibleCities.map((cityData, n) => {
            const equatorLine = scrollDataRef.current.actual + 22;
            const cityPosition = cityData.index * DEGREES_PER_CITY;
            const transitionDelay = open ? (
              8 * Math.abs(cityPosition - equatorLine) + 450
            ) : (
              Math.max(0, 200 - 5 * Math.abs(cityPosition - equatorLine))
            );
            
            return (
              <button
                key={n}
                style={{
                  transform: `
                    translate3d(0, 0, 0)
                    rotate(${-cityPosition}deg)
                    translateX(calc(${-ARC_RADIUS}vh + ${toRem(TRACK_WIDTH)}))
                  `,
                  transitionDelay: `${transitionDelay}ms`,
                }}
                className="city-button"
              >
                <span className="city-button__index">
                  #{'0'.repeat(3 - (cityData.index + 1).toString().length) + (cityData.index + 1)}
                </span>

                <span className="city-button__label">
                  {cityData.city}
                </span>
                
                <span className="city-button__dot" />
              </button>
            );
          })
        }
      </div>
    </Root>
  );
};

export default CityPicker;
