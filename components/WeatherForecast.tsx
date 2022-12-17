/**
 * Dependency imports
 */
import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useQuery } from 'react-query';
import { useDebouncedState } from '@mantine/hooks';


/**
 * Local imports
 */
import api from '../services/api';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import AnimatedNumber from './AnimatedNumber';
import Tooltip from './Tooltip';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'count',
  ]).includes(prop.toString()),
})<Partial<WeatherForecastCombinedProps>>(({
  count,
}) => css`
  .weather-card {
    display: flex;
    flex-direction: column;
    align-items: center;

    &__head {
      font-size: ${toRem(16)};
      font-weight: 300;
    }

    &__foot {
      font-size: ${toRem(15)};
      font-weight: 300;
    }
  }

  .temp {
    position: relative;
    font-size: ${toRem(70)};
    font-weight: 200;
    white-space: nowrap;
    
    &:before {
      content: '';
      display: block;
      width: 0.15em;
      height: 0.15em;
      position: absolute;
      top: 0.3em;
      right: 0.4em;
      border: 1px solid;
      border-radius: 50%;
    }

    &:after {
      content: 'C';
      display: inline-block;
      vertical-align: baseline;
      margin-left: 0.2em;
      font-size: 0.7em;
    }
  }

  .header {
    position: fixed;
    top: ${toRem(120)};
    left: ${toRem(50)};
    display: flex;
    flex-direction: column-reverse;
    animation: weather-forecast-header-appear 350ms ${easing.snapOut} both 200ms;

    @keyframes weather-forecast-header-appear {
      from {
        opacity: 0;
        transform: translate3d(0, 100%, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  }

  .city-name {
    margin: 0;
    font-size: ${toRem(48)};
    font-weight: 600;
    text-transform: capitalize;
    line-height: 1.4;
  }

  .today {
    display: block;
    font-size: ${toRem(18)};
    font-weight: 300;
    animation: weather-forecast-today-appear 350ms ${easing.snapOut} both 200ms;

    @keyframes weather-forecast-today-appear {
      from {
        opacity: 0;
        transform: translate3d(0, 100%, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  }

  .close-button {
    position: absolute;
    top: ${toRem(40)};
    inset-inline-end: ${toRem(34)};
    z-index: 9;
    animation: weather-forecast-close-button-appear 400ms ${easing.snapOut} both 600ms;

    @keyframes weather-forecast-close-button-appear {
      from {
        opacity: 0;
        transform: rotate(-180deg);
      }

      to {
        opacity: 1;
        transform: rotate(0deg);
      }
    }

    button {
      display: block;
      width: ${toRem(46)};
      height: ${toRem(46)};
      cursor: pointer;
      font-size: 0;
      color: transparent;
      border: none;
      background: transparent;
      border-radius: 999px;
      transition: 180ms background-color;
      
      &:hover {
        background: rgba(0, 0, 0, 0.035);
      }

      &:before,
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: ${toRem(20)};
        height: ${toRem(2)};
        margin: -${toRem(1)} 0 0 -${toRem(10)};
        background: #333;
        border-radius: 999px;
        transform: rotate(45deg);
      }

      &:after {
        transform: rotate(-45deg);
      }
    }
  }

  .current-weather {
    position: fixed;
    top: ${toRem(100)};
    inset-inline-end: ${toRem(50)};
    line-height: 1.4;
    align-items: end;
    animation: weather-forecast-current-weather-appear 350ms ${easing.snapOut} both 400ms;

    @keyframes weather-forecast-current-weather-appear {
      from {
        opacity: 0;
        transform: translate3d(0, 100%, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    &__wind {
      small {
        margin-right: ${toRem(10)};
        font-size: ${toRem(11)};
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #999;
      }
    }

    &__temp {
      font-size: ${toRem(70)};
    }
  }

  .forecast-chart {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-x: auto;
    padding: ${toRem(50)} ${toRem(0)} ${toRem(30)};
  }

  .forecast-graph {
    width: 100%;
    height: 33vh;
    margin-bottom: ${toRem(10)};
    min-width: ${toRem(850)};
  }
  
  .forecast-graph__point {
    fill: #333;
    transform-origin: center;
    animation: weather-forecast-forecast-graph-point-appear 350ms ${easing.easyBack} both 400ms;

    @keyframes weather-forecast-forecast-graph-point-appear {
      from {
        opacity: 0;
        r: 0;
      }

      to {
        opacity: 1;
        r: 4;
      }
    }
  }

  .forecast-graph__line {
    stroke: #333;
    stroke-width: ${toRem(2)};
    opacity: 0.1;
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: weather-forecast-forecast-graph-line-appear 350ms ${easing.snapOut} both 400ms;

    @keyframes weather-forecast-forecast-graph-line-appear {
      from {
        stroke-dashoffset: 400;
      }

      to {
        stroke-dashoffset: 0;
      }
    }
  }

  .forecast-data-list {
    display: flex;
    text-align: center;
    list-style: none;
    padding: 0;
    min-width: ${toRem(850)};

    .forecast-data {
      flex: 1;
      opacity: 0;
      transform: translate3d(0, 100%, 0);
      animation: weather-forecast-forecast-data-appear 400ms ${easing.snapInOut} both;

      @keyframes weather-forecast-forecast-data-appear {
        from {
          opacity: 0;
          transform: translate3d(0, 100%, 0);
        }

        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      &__temp {
        font-size: ${toRem(40)};
        font-weight: 300;
        line-height: 1.8;
      }
    }
  }

  /* Responsive */

  @media (width < 960px) {
    .city-name {
      font-size: ${toRem(36)};
    }

    .current-weather {
      &__temp {
        font-size: ${toRem(54)};
      }
    }
  }

  @media (width < 480px) {
    .header {
      top: ${toRem(80)};
      inset-inline-start: ${toRem(20)};
    }

    .today {
      font-size: ${toRem(16)};
    }

    .city-name {
      font-size: ${toRem(32)};
    }

    .close-button {
      top: ${toRem(20)};
      inset-inline-end: ${toRem(4)};
    }

    .current-weather {
      top: ${toRem(80)};
      inset-inline-end: ${toRem(20)};

      &__temp {
        font-size: ${toRem(42)};
        font-weight: 300;
      }
    }

    .forecast-chart {
      padding-bottom: ${toRem(20)};
    }

    .forecast-graph {
      height: 44vh;
    }

    .forecast-data-list {
      .forecast-data {
        &__time {
          font-size: ${toRem(14)};
        }

        &__temp {
          font-size: ${toRem(32)};
        }

        &__description {
          font-size: ${toRem(14)};
        }
      }
    }
  }

  @media (width < 340px) {
    .header {
      top: ${toRem(70)};
      left: ${toRem(10)};
    }

    .today {
      font-size: ${toRem(13)};
    }

    .city-name {
      font-size: ${toRem(24)};
    }

    .close-button {
      top: ${toRem(14)};
    }

    .current-weather {
      top: ${toRem(70)};
      inset-inline-end: ${toRem(10)};

      &__wind {
        font-size: ${toRem(13)};
      }

      &__temp {
        font-size: ${toRem(32)};
        font-weight: 300;
      }

      &__description {
        font-size: ${toRem(13)};
      }
    }

    .forecast-chart {
      padding-bottom: ${toRem(10)};
    }

    .forecast-data-list {
      .forecast-data {
        &__time {
          font-size: ${toRem(13)};
        }

        &__temp {
          font-size: ${toRem(24)};
        }

        &__description {
          font-size: ${toRem(13)};
        }
      }
    }
  }

  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    animation: weather-forecast-error-appear 950ms ${easing.snapInOut} both;
    
    strong {
      margin-top: ${toRem(-100)};
      font-size: ${toRem(80)};
      font-weight: 1000;
    }

    p {
      line-height: 1.8;
      animation: weather-forecast-error-appear 950ms ${easing.snapInOut} both;
    }

    a {
      position: relative;
      display: inline-block;
      margin-top: ${toRem(40)};
      padding: ${toRem(10)} ${toRem(24)};
      font-size: ${toRem(14)};
      font-weight: 500;
      letter-spacing: 0.025em;
      text-decoration: none;
      color: #333;
      background: #fff;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      border-radius: 999px;
      transition: padding-inline-start 300ms ${easing.snapInOut};
      animation: weather-forecast-error-appear 950ms ${easing.snapInOut} both;

      &:before {
        content: '';
        display: block;
        width: ${toRem(6)};
        height: ${toRem(6)};
        position: absolute;
        top: 50%;
        inset-inline-start: ${toRem(18)};
        opacity: 0;
        border-top: ${toRem(2)} solid #333;
        border-inline-start: ${toRem(2)} solid #333;
        transform: translate(0, -50%) rotate(-45deg);
        transition: opacity 200ms ${easing.snapInOut};
      }

      &:hover {
        padding-inline-start: ${toRem(40)};
        transition-timing-function: ${easing.swiftBack};

        &:before {
          opacity: 1;
          transition-delay: 100ms;
        }
      }
    }

    @keyframes weather-forecast-error-appear {
      from {
        opacity: 0;
        transform: translate3d(0, ${toRem(50)}, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  }
`);

/**
 * WeatherForecast Component
 */
export interface WeatherForecastProps {
  city: string,
  intervalInHours?: number,
  count?: number,
  onClose?: () => void,
}

export type WeatherForecastCombinedProps = WeatherForecastProps & JSX.IntrinsicElements['div'];

const WeatherForecast: React.FC<WeatherForecastCombinedProps> = ({
  city,
  intervalInHours,
  count = 8,
  onClose,
  ...props
}) => {
  const { data, isLoading, error } = useQuery([city, count], ({ queryKey }) => api.client.weatherDataForCity.get(queryKey[0].toString(), +queryKey[1]));

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);
  
  if (error) {
    return (
      <Root {...props}>
        <div className="error">
          <strong>Oops!</strong>

          <p>
            Something went wrong :(
            <br />
            We could not load forecast data for this city.
            <br />
            <Link href="/">
              <a>
                Select another city
              </a>
            </Link>
          </p>
        </div>
      </Root>
    )
  }

  if (isLoading) {
    return (
      <Root {...props}>
        <div className="loading">
          <span>Loading...</span>
        </div>
      </Root>
    )
  }

  const values = data.forecast.map((d: any) => d.temp);
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const span = max - min;

  // calculate points data
  const chartPoints = values.map((p: any, i: number) => ({
    x: (i * 100 / values.length) + 50 / values.length,
    y: Math.max(2, Math.min(98, (100 - ((p - min) * 100 / span)))),
  }));

  // calculate data for lines connecting the points
  const chartLines = chartPoints.reduce((prev: any, next: any) => {
    if (prev.length > 0) {
      prev[prev.length - 1] = {
        ...prev[prev.length - 1],
        x2: next.x,
        y2: next.y,
      }
    }

    if (prev.length < chartPoints.length - 1) {
      prev[prev.length] = {
        x1: next.x,
        y1: next.y,
      }
    }

    return prev;
  }, []);
  
  return (
    <Root {...props}>
      <div className="header">
        <h1 className="city-name">{city}</h1>

        <span className="today">
          {(new Date()).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
          })}
        </span>
      </div>
      
      <div className="close-button">
        <Tooltip label="Back" target="mouse" position="bottom-end" offset={[10, 5]}>
          <button onClick={onClose}>
            Close
          </button>
        </Tooltip>
      </div>

      <div className="current-weather weather-card">
        <div className="current-weather__wind weather-card__head">
          <small>Wind</small>
          <AnimatedNumber initialValue={0} value={+data.weather.wind} delay={400} useIntegers={false} easing="easeOut" />
          <span>km/h</span>
        </div>

        <div className="current-weather__temp temp">
          <AnimatedNumber initialValue={0} value={data.weather.temp} delay={400} />
        </div>

        <div className="current-weather__description weather-card__foot">
          {data.weather.weather.main}
        </div>
      </div>

      <div className="forecast-chart">
        <svg className="forecast-graph" xmlns="http://www.w3.org/2000/svg">
          {
            chartPoints.map((point: any, n: number) => (
              <circle
                key={`circle-${n}`}
                className="forecast-graph__point"
                style={{ animationDelay: `${n * 100}ms` }}
                cx={`${point.x}%`} 
                cy={`${point.y}%`} 
                r="4"
              />
            ))
          }

          {
            chartLines.map((line: any, n: number) => (
              <line
                key={`line-${n}`}
                className="forecast-graph__line"
                style={{ animationDelay: `${n * 100}ms` }}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
              />
            ))
          }
        </svg>

        <ul className="forecast-data-list">
          {
            data.forecast.map((weatherForecast: any, n: number) => (
              <li
                key={n}
                className="forecast-data weather-card"
                style={{ animationDelay: `${n * 50}ms` }}
              >
                <Tooltip
                  label={weatherForecast.weather.description}
                  target="mouse"
                  position="top-center"
                  offset={[0, -10]}
                  tooltipStyles={css`text-transform: capitalize;`}
                >
                  <div>
                    <div className="forecast-data__time weather-card__head">
                      {(new Date(weatherForecast.time)).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="forecast-data__temp temp">
                      {weatherForecast.temp}
                    </div>

                    <div className="forecast-data__description weather-card__foot">
                      {weatherForecast.weather.main}
                    </div>
                  </div>
                </Tooltip>
              </li>
            ))
          }
        </ul>
      </div>
    </Root>
  );
};

export default WeatherForecast;
