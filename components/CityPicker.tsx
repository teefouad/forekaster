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
 * Types
 */
export type City = typeof indexedCities[number];

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'open',
    'clickedCity',
  ]).includes(prop.toString()),
})<Partial<CityPickerCombinedProps & {
  clickedCity: City,
}>>(({
  open,
  clickedCity,
}) => {
  const m = 0.5;
  const circum = `2 * ${Math.PI} * ${ARC_RADIUS}vh`;
  const halfCircum = `${m} * ${Math.PI} * ${ARC_RADIUS}vh`;

  return css`
    position: absolute;
    top: 50%;
    left: ${toRem(50)};
    pointer-events: ${clickedCity === undefined ? 'auto' : 'none'};
    transform: translate(${open ? toRem(100) : 0}, -50%);
    transition: 800ms transform ${easing.soft} ${open ? 0 : 150}ms;

    .city-picker__trigger {
      position: relative;
      display: block;
      width: ${toRem(TRACK_WIDTH_CLOSED)};
      height: ${toRem(40)};
      margin: 0;
      padding: ${toRem(1)} ${toRem(20)} 0;
      z-index: 9;
      cursor: pointer;
      font-family: Nunito, sans-serif;
      font-size: ${toRem(13)};
      font-weight: 600;
      letter-spacing: 0.025em;
      text-align: start;
      color: #999;
      border: none;
      background: none;
      border-radius: 999px;
      opacity: ${open ? 0 : 1};
      pointer-events: ${open ? 'none' : 'auto'};
      transform: translateX(${toRem(open ? 100 : 0)});
      transition:
        200ms color,
        600ms transform ${open ? easing.softIn : easing.softOut} ${open ? 0 : 200}ms,
        400ms opacity ${easing.soft} ${open ? 0 : 200}ms;

      &:hover {
        color: #333;
      }
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
      outline: none;
      font-family: Nunito, sans-serif;
      opacity: ${open ? 1 : 0};
      border: none;
      background: transparent;
      transition: 200ms opacity;

      &[data-is-clicked="0"] {
        opacity: 0.1;
        transition-delay: 0ms !important;
      }

      &[data-is-clicked="1"] {
        opacity: 1;
        transition-delay: 0ms !important;

        .city-button__label {
          opacity: 1 !important;
        }
      }
    }

    .city-button__index {
      margin-inline-start: ${toRem(20)};
      margin-top: ${toRem(10)};
      opacity: 0.12;
      font-size: ${toRem(21)};
      font-weight: 800;
      user-select: none;
      color: #333;
    }

    .city-button__label {
      display: block;
      font-size: ${toRem(36)};
      font-weight: 600;
      letter-spacing: -0.005em;
      white-space: nowrap;
      color: #333;
      opacity: 0.4;
      transition: 240ms opacity;
    }

    .city-button.is-match .city-button__label {
      opacity: 0.9;
    }

    .city-button:hover {
      .city-button__label {
        opacity: 1;
      }
    }

    .city-button__dot {
      position: absolute;
      top: 50%;
      right: ${toRem(-43)};
      margin-top: ${toRem(2)};
      display: block;
      width: ${toRem(5)};
      height: ${toRem(5)};
      pointer-events: none;
      background: #e0e0e0;
      border-radius: 50%;
      transition: 180ms background-color;

      &:before {
        content: '';
        position: absolute;
        left: ${toRem(-50)};
        top: 50%;
        width: ${toRem(24)};
        height: ${toRem(1)};
        opacity: 0.1;
        background-color: #333;
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
      opacity: ${open ? 0.8 : 1};
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
        height: 20px;
        opacity: ${open ? 0 : 1};
        background: #f9f9f9;
        margin-top: -20px;
        border-radius: ${toRem(open ? 0 : 20)} ${toRem(open ? 0 : 20)} 0 0;
        transform-origin: calc(${ARC_RADIUS}vh) 100%;
        transform: rotate(${open ? 0.5 * m * Math.PI : 0}rad);
        transition:
          200ms background-color,
          200ms opacity linear ${open ? 300 : 0}ms,
          600ms border-radius ${easing.swiftSnap} ${open ? 200 : 0}ms,
          600ms transform ${easing.swiftSnap} ${open ? 200 : 0}ms;
      }
    }

    ${
      !open && css`
        .city-picker__trigger:hover ~ .city-picker__arc {
          .city-picker__arc-middle {
            stroke-width: ${toRem(2 * (TRACK_WIDTH_CLOSED + 30))};
            transition: 300ms stroke-width ${easing.easyBack2};
          }

          .city-picker__arc-top,
          .city-picker__arc-bottom {
            width: ${toRem(TRACK_WIDTH_CLOSED + 30)};
            transition: 300ms width ${easing.easyBack2};

            &:before {
              background: #fff;
            }
          }
        }
      `
    }

    .city-picker__arc-bottom {
      &:before {
        margin-top: 0;
        border-radius: 0 0 ${toRem(open ? 0 : 20)} ${toRem(open ? 0 : 20)};
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
      border: 1px solid #e0e0e0;
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

    .city-picker__overlay {
      position: absolute;
      top: -100vh;
      left: -100vw;
      width: 200vw;
      height: 200vh;
      opacity: ${open ? 0.5 : 0};
      z-index: -1;
      pointer-events: ${open ? 'auto' : 'none'};
      background: #fff;
      transition: 600ms opacity ${easing.swiftSnap} ${open ? 0 : 200}ms;
    }
  `
});

/**
 * CityPicker Component
 */
export interface CityPickerProps {
  value?: string,
  open?: boolean,
  onTriggerClick?: () => void,
  onClose?: () => void,
  onItemSelect?: (cityData: City) => void,
}

export type CityPickerCombinedProps = CityPickerProps & JSX.IntrinsicElements['div'];

const CityPicker: React.FC<CityPickerCombinedProps> = ({
  value,
  open = false,
  onTriggerClick,
  onClose,
  onItemSelect,
  ...props
}) => {
  const scrollDataRef = React.useRef({ target: 0, actual: 0 });
  const searchDataRef = React.useRef<{
    query: string,
    timeout: any,
  }>({
    query: '',
    timeout: undefined,
  });
  const [clickedCity, setClickedCity] = React.useState<City | undefined>(undefined);
  const [searchMatches, setSearchMatches] = React.useState<City[]>([]);
  const [visibleCities, setVisibleCities] = React.useState(indexedCities.slice(0, Math.floor(VISIBILITY_SPAN / DEGREES_PER_CITY) + 1));

  React.useEffect(() => {
    if (!open) return;

    const minScrollPosition = 0;
    const maxScrollPosition = indexedCities.length * DEGREES_PER_CITY - VISIBILITY_SPAN + 30;

    const onScroll = (e: WheelEvent) => {
      scrollDataRef.current.target += 0.025 * e.deltaY;
    };
    
    window.addEventListener('wheel', onScroll);

    // const onFocus = (e: FocusEvent) => {
    //   const indexContainer: HTMLElement | null = (e.target as HTMLButtonElement)?.querySelector('.city-button__index');

    //   if (indexContainer) {
    //     const cityIndexInFocus = +indexContainer.innerText.slice(1) - 1;
    //     scrollDataRef.current.target = Math.max(minScrollPosition, Math.min(maxScrollPosition, cityIndexInFocus * DEGREES_PER_CITY + 30));
    //   }
    // };
    
    const onSearch = (e: KeyboardEvent) => {
      clearTimeout(searchDataRef.current.timeout);
      
      searchDataRef.current.query = `${searchDataRef.current.query}${e.key}`;

      if (searchDataRef.current.query.length < 2) return;
    
      searchDataRef.current.timeout = setTimeout(() => {
        clearTimeout(searchDataRef.current.timeout);

        const matchingCities = indexedCities.filter((cityData) => cityData.city.toLowerCase().startsWith(searchDataRef.current.query.toLowerCase()));

        setSearchMatches(matchingCities);

        if (matchingCities.length) {
          scrollDataRef.current.target = Math.max(minScrollPosition, Math.min(maxScrollPosition, matchingCities[0].index * DEGREES_PER_CITY - 24));
        }

        searchDataRef.current.timeout = setTimeout(() => {
          searchDataRef.current.query = '';
          setSearchMatches([]);
        }, 1000);
      }, 100);
    };
    
    window.addEventListener('keypress', onSearch);

    const cancelFrame = raf(() => {
      scrollDataRef.current.actual += (scrollDataRef.current.target - scrollDataRef.current.actual) / 3;
      
      // cap scroll position
      if (clickedCity === undefined) {
        if (scrollDataRef.current.target < minScrollPosition) {
          scrollDataRef.current.target += (minScrollPosition - scrollDataRef.current.target) / 1.1;
        }
        
        if (scrollDataRef.current.target > maxScrollPosition) {
          scrollDataRef.current.target += (maxScrollPosition - scrollDataRef.current.target) / 1.1;
        }
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
      window.removeEventListener('keypress', onSearch);
    };
  }, [open, clickedCity]);

  return (
    <Root
      open={open}
      clickedCity={clickedCity}
      {...props}
      className={classnames('city-picker', props.className)}
    >
      <button className="city-picker__trigger" onClick={onTriggerClick}>
        {value ?? 'Select a city...'}
      </button>

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

      <div
        className="city-picker__list"
        style={{
          transform: `translate3d(0, 0, 0) rotate(${scrollDataRef.current.actual + 24}deg)`,
        }}
      >
        {
          visibleCities.map((cityData, n) => {
            const equatorLine = scrollDataRef.current.actual + 24;
            const cityPosition = cityData.index * DEGREES_PER_CITY;
            const transitionDelay = open ? (
              8 * Math.abs(cityPosition - equatorLine) + 450
            ) : (
              Math.max(0, 200 - 5 * Math.abs(cityPosition - equatorLine))
            );
            
            return (
              <button
                key={n}
                // city elements in the DOM are automatically added/removed for better performance
                // for this reason, we cannot use the native 'focusin' event and we have to implement
                // 'tab' functionality manually
                tabIndex={-1}
                style={{
                  transform: `
                    translate3d(0, 0, 0)
                    rotate(${-cityPosition}deg)
                    translateX(calc(${-ARC_RADIUS}vh + ${toRem(TRACK_WIDTH)}))
                  `,
                  transitionDelay: `${transitionDelay}ms`,
                }}
                className={classnames('city-button', {
                  'is-match': searchMatches.find(c => c.city === cityData.city) !== undefined,
                })}
                data-is-clicked={clickedCity === undefined ? '-1' : (clickedCity.city === cityData.city ? '1' : '0')}
                onClick={(e) => {
                  setClickedCity(cityData);
                  scrollDataRef.current.target = (cityData.index * DEGREES_PER_CITY) - 24;

                  setTimeout(() => {
                    onClose?.();
                    setClickedCity(undefined);
                    onItemSelect?.(cityData);
                  }, 250);
                  
                  e.preventDefault();
                }}
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

      <div className="city-picker__overlay" onClick={onClose} />
    </Root>
  );
};

export default CityPicker;
