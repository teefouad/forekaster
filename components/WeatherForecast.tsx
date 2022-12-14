/**
 * Dependency imports
 */
import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useQuery } from 'react-query';

/**
 * Local imports
 */
import api from '../services/api';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import CloudTooltip from './CloudTooltip';
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

  .weather-forecast__close-button {
    position: absolute;
    top: ${toRem(40)};
    right: ${toRem(34)};
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
    right: ${toRem(50)};
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
  }

  .current-weather__temp {
    font-size: ${toRem(70)};
  }

  .current-weather__wind {
    span {
      margin-right: ${toRem(10)};
      font-size: ${toRem(11)};
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #999;
    }
  }

  .forecast-chart {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: ${toRem(50)};
  }

  .forecast-data-list {
    display: flex;
    text-align: center;
    list-style: none;
    padding: 0;

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
  count,
  onClose,
  ...props
}) => {
  const { data, isLoading, error } = useQuery(city, ({ queryKey }) => api.client.weatherDataForCity.get(queryKey[0]));

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

  if (isLoading) {
    return (
      <div>
        isLoading!!!
      </div>
    )
  }
  

  if (error) {
    return (
      <div>
        Error!!!
      </div>
    )
  }
  
  return (
    <Root {...props} count={count}>
      <div className="weather-forecast__close-button">
        <button onClick={onClose} title="Back">
          Close
        </button>
      </div>

      <div className="current-weather weather-card">
        <div className="current-weather__wind weather-card__head">
          <span>Wind</span> {data.weather.wind.toFixed(2)} km/h
        </div>

        <div className="current-weather__temp temp">
          {data.weather.temp}
        </div>

        <div className="current-weather__description weather-card__foot">
          <Tooltip label={data.weather.weather.description}>
            {data.weather.weather.main}
          </Tooltip>
        </div>
      </div>

      <div className="forecast-chart">


        <ul className="forecast-data-list">
          {
            data.forecast.map((weatherForecast: any, n: number) => (
              <li
                key={n}
                className="forecast-data weather-card"
                title={weatherForecast.weather.description}
                style={{
                  animationDelay: `${n * 50}ms`,
                }}
              >
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
              </li>
            ))
          }
        </ul>
      </div>
    </Root>
  );
};

export default WeatherForecast;
