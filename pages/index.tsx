/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import axios from 'axios';
import Link from 'next/link';
import type { NextPage } from 'next';

/**
 * Local imports
 */
import Layout from '../components/Layout';
import WorldMap, { Marker } from '../components/WorldMap';
import * as colors from '../utils/colors';
import { animate } from '../utils/animation';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import citiesData from '../data/cities.json';
import WeatherForecast from '../components/WeatherForecast';
import CityPicker from '../components/CityPicker.old';
import WheelMenu from '../components/WheelMenu';
import Tooltip from '../components/Tooltip';
import CloudTooltip from '../components/CloudTooltip';
import Icon from '../components/Icon';
import SocialLink from '../components/SocialLink';

const markerInfoCache: any = {};

const mapMarkers = citiesData.map((cityData, n) => ({
  id: n.toString(),
  label: cityData.city,
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
    'cityPickerActive',
  ]).includes(prop.toString()),
})<{
  forecastViewActive: boolean,
  cityPickerActive: boolean,
}>(({
  forecastViewActive,
  cityPickerActive,
}) => css`
  /* =================================== */
  /* APP HEADER
  /* =================================== */

  #app-header {
    position: absolute;
    top: calc(50% - 30vh);
    inset-inline-start: ${toRem(50)};
    transition:
      300ms opacity linear 300ms,
      550ms transform ${easing.snapInOut} 500ms;

    ${cityPickerActive && css`
      opacity: 0.025;
      transition-delay: 0ms;
    `}
  }

  #app-logo {
    font-size: ${toRem(48)};
    font-weight: 600;
    text-decoration: none;
    outline: none;
    color: ${colors.TEXT_DARK};
  }

  #app-description {
    margin: ${toRem(10)} 0 0;
    max-width: ${toRem(200)};
    font-size: ${toRem(15)};
    font-weight: 300;
    color: ${colors.TEXT_LIGHT};
  }

  /* =================================== */
  /* APP FOOTER
  /* =================================== */

  #app-footer {
    position: absolute;
    bottom: ${toRem(50)};
    inset-inline-start: ${toRem(50)};
    display: flex;
    align-items: center;
    transition:
      300ms opacity linear 300ms,
      550ms transform ${easing.snapInOut} 500ms;

    ${cityPickerActive && css`
      opacity: 0.025;
      transition-delay: 0ms;
    `}

    > div {
      & + div {
        margin-inline-start: ${toRem(5)};
      }
    }

    &:has(div .social-link:hover) {
      > div {
        .social-link:not(:hover) {
          .wb-icon {
            &:before {
              color: ${colors.TEXT_LIGHT};
            }
          }
        }
      }
    }

    > hr {
      margin: 0 ${toRem(15)} 0 ${toRem(10)};
      height: ${toRem(40)};
      opacity: 0.15;
      border: none;
      border-inline-start: ${toRem(1)} dashed #000;
    }

    > p {
      display: flex;
      align-items: center;
      font-size: ${toRem(11)};
      font-weight: 500;
      color: ${colors.TEXT_LIGHT};

      .wb-icon {
        margin-inline-end: ${toRem(7)};

        &:before {
          font-size: ${toRem(24)};
          color: ${colors.TEXT_LIGHT};
        }
      }
    }
  }

  /* =================================== */
  /* CITY SELECTOR
  /* =================================== */

  #city-selector {
    position: absolute;
    top: 50%;
    inset-inline-start: ${toRem(50)};
    z-index: 9999;
    margin-top: ${toRem(-20)};
  }





  /* #app-logo {
    position: absolute;
    top: ${forecastViewActive ? toRem(85) : `calc(50% - ${toRem(180)})`};
    inset-inline-start: ${toRem(50)};
    font-size: ${toRem(48)};
    font-weight: 600;
    text-decoration: none;
    outline: none;
    color: #333;
    transform: translate(0, -50%) scale(${forecastViewActive ? 0.4 : 1});
    transform-origin: top left;
    transition:
      550ms transform ${easing.snapInOut} ${forecastViewActive ? 120 : 50}ms,
      550ms top ${easing.snapInOut} ${forecastViewActive ? 0 : 150}ms;
  }

  .today {
    position: fixed;
    top: ${toRem(120)};
    left: ${toRem(50)};
    display: block;
    font-size: ${toRem(18)};
    font-weight: 300;
    opacity: ${forecastViewActive ? 1 : 0};
    transform: translate3d(0, ${forecastViewActive ? 0 : '130%'}, 0);
    transition:
      ${forecastViewActive ? 350 : 200}ms opacity ${forecastViewActive ? easing.snapOut : easing.snapIn} 260ms,
      ${forecastViewActive ? 350 : 200}ms transform ${forecastViewActive ? easing.snapOut : easing.snapIn} 260ms;
  }

  .city-name {
    position: fixed;
    top: ${toRem(145)};
    left: ${toRem(50)};
    margin: 0;
    font-size: ${toRem(48)};
    font-weight: 600;
    text-transform: capitalize;
    line-height: 1.4;
    opacity: ${forecastViewActive ? 1 : 0};
    transform: translate3d(0, ${forecastViewActive ? 0 : '50%'}, 0);
    transition:
      ${forecastViewActive ? 350 : 200}ms opacity ${forecastViewActive ? easing.snapOut : easing.snapIn} 260ms,
      ${forecastViewActive ? 350 : 200}ms transform ${forecastViewActive ? easing.snapOut : easing.snapIn} 260ms;
  }

  #world-map {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: ${forecastViewActive ? 'none' : 'auto'};
    opacity: ${forecastViewActive ? 0 : 1};
    transform: translate(calc(-50% + ${toRem(360)}), -50%);
    transition: 350ms opacity ${forecastViewActive ? 250 : 0}ms;
  } */
`);

/**
 * HomePage Component
 */
const HomePage: NextPage = (props) => {
  // const isSSR = typeof window === 'undefined';
  // const selectedCityRef = React.useRef<Marker | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = React.useState(false);
  // const [mapSize, setMapSize] = React.useState(isSSR ? 0 : 0.85 * window.innerWidth);
  const [selectedCity, setSelectedCity] = React.useState<Marker | null>(null);
  // const [mapZoom, setMapZoom] = React.useState(0);
  // const [mapTarget, setMapTarget] = React.useState<{lat: number, lon: number}>();

  // const closeForecastView = () => {
  //   setSelectedCity(null);
  // };

  // React.useEffect(() => {
  //   const onWindowResize = () => {
  //     setMapSize(0.85 * window.innerWidth);
  //   };
    
  //   window.addEventListener('resize', onWindowResize);

  //   return () => {
  //     window.removeEventListener('resize', onWindowResize);
  //   };
  // }, []);

  return (
    <Layout {...props} >
      <Root
        forecastViewActive={Boolean(selectedCity)}
        cityPickerActive={cityPickerOpen}
      >
        <header id="app-header">
          <Link href="/">
            <a id="app-logo">
              <Tooltip
                label="Go to Homepage"
                position="center-end"
                offset={10}
                autoClose
                closeDelay={3000}
              >
                <span>
                  Forekaster
                </span>
              </Tooltip>
            </a>
          </Link>

          <p id="app-description">
            A neat way to learn about the current weather and forecast.
          </p>
        </header>

        <WheelMenu
          id="city-selector"
          data={[]}
          open={cityPickerOpen}
          onOpen={() => setCityPickerOpen(true)}
          onClose={() => setCityPickerOpen(false)}
          onSelect={() => setCityPickerOpen(false)}
        />

        <footer id="app-footer">
          <SocialLink
            icon="github"
            label="GitHub Profile"
            link="https://github.com/teefouad/"
          />

          <SocialLink
            icon="linkedin"
            label="Let's Connect"
            link="https://linkedin.com/in/mostafafouad"
          />

          <hr />

          <p>
            <Icon name="lab" />
            Designed / Developed by Mostafa Fouad
          </p>
        </footer>

        {/* <header id="app-header">
          <Link href="/">
            <a id="app-logo">
              Forekaster
            </a>
          </Link>

          <span className="today">
            {(new Date()).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'long',
              weekday: 'long',
            })}
          </span>
          
          <h1 className="city-name">
            {selectedCity?.label ?? selectedCityRef.current?.label}
          </h1>

          <div className="close-button">
            <Tooltip label="Back" target="mouse" position="bottom-end" offset={[10, 5]}>
              <button onClick={closeForecastView}>
                Close
              </button>
            </Tooltip>
          </div>
        </header> */}

        {
          selectedCity && (
            <WeatherForecast city={selectedCity?.label} />
          )
        }
        
        
        {/* <WorldMap
          id="world-map"
          markers={mapMarkers}
          canvasWidth={mapSize}
          canvasHeight={mapSize}
          zoom={5}
          showMarkers={selectedCity || cityPickerOpen ? false : true}
          onMarkerClick={(marker) => {
            setSelectedCity(marker);
            selectedCityRef.current = marker;
          }}
          getMarkerInfo={
            (markerData) => new Promise(async (resolve) => {
              if (markerInfoCache[markerData.label]) {
                const cached = markerInfoCache[markerData.label];

                if (cached.expires > +new Date()) {
                  return resolve(cached.response);
                }
              }

              const { data } = await axios.get(`/api/weather/current?city=${markerData.label}`);
              const iconResponse = await axios.get(`http://openweathermap.org/img/wn/${data.weather.icon}@2x.png`, { responseType: 'blob' });
              const reader = new FileReader();
              reader.readAsDataURL(iconResponse.data); 
              reader.onload = () => {
                const response = {
                  content: (
                    <MiniWeather
                      weather={data.weather.main}
                      icon={<img src={reader.result?.toString()} />}
                      temp={data.temp}
                    />
                  ),
                  count: data.weather.main.length * 3,
                };

                markerInfoCache[markerData.label] = {
                  response,
                  expires: +new Date() + 1 * 60 * 1000, // cache for 1 minute
                };
                
                resolve(response);
              };
            })
          }
          // target={mapTarget}
          // zoom={mapZoom}
          // canvasWidth={2000}
          
        /> */}

        {/* <CityPicker
          open={cityPickerOpen}
          onTriggerClick={() => setCityPickerOpen(true)}
          onClose={() => setCityPickerOpen(false)}
          onItemSelect={() => setCityPickerOpen(false)}
        /> */}
      </Root>
    </Layout>
  );
};

export default HomePage;

/**
 * MiniWeather Component
 */
const MiniWeatherRoot = styled.span`
  display: flex;
  align-items: center;
  text-transform: capitalize;

  > img {
    display: inline-block;
    margin: ${toRem(-5)} 0;
    height: ${toRem(32)};
    object-fit: contain;
    filter: contrast(0.5) saturate(2);
  }

  > span {
    position: relative;
    padding: ${toRem(3)} ${toRem(4)} ${toRem(2)};
    margin: 0 0 0 ${toRem(1)};
    font-size: ${toRem(11)};
    line-height: 1;

    &:before {
      content: '';
      position: absolute;
      top: ${toRem(2)};
      inset-inline-end: ${toRem(11.5)};
      display: block;
      width: ${toRem(2)};
      height: ${toRem(2)};
      margin-inline-start: ${toRem(3)};
      border-radius: 50%;
      border: ${toRem(1)} solid #333;
    }

    &:after {
      content: 'c';
      display: inline-block;
      margin-inline-start: ${toRem(5)};
    }
  }
`;

const MiniWeather: React.FC<{
  icon: React.ReactElement,
  weather: string,
  temp: number,
}> = ({
  icon,
  weather,
  temp,
}) => (
  <MiniWeatherRoot>
    {icon}
    {weather}
    <span>{temp}</span>
  </MiniWeatherRoot>
)
