/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css, SerializedStyles } from '@emotion/react';
import classnames from 'classnames';

/**
 * Local imports
 */
import * as easing from '../utils/easing';
import { toRem } from '../utils/text';

/**
 * Root
 */
const Root = styled('span', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'offset',
    'textColor',
    'cloudColor',
    'labelStyles',
  ]).includes(prop.toString()),
})<Partial<CloudTooltipCombinedProps>>(({
  offset,
  textColor,
  cloudColor,
  labelStyles,
}) => css`
  position: relative;

  > .cloud-tooltip__label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    padding: ${toRem(8)} ${toRem(12)};
    pointer-events: none;
    white-space: nowrap;
    opacity: 0;
    font-family: Nunito, sans-serif;
    font-size: ${toRem(11)};
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: transparent;
    background: transparent;
    border-radius: 50%;
    transform: translate(-50%, ${toRem(-offset!)}) scale(0.2, 0.9);
    transform-origin: center bottom;
    transition:
      color 600ms ${easing.softOut},
      background-color 250ms ${easing.softOut},
      opacity 150ms ${easing.softIn} 50ms,
      transform 350ms ${easing.softIn};

    > i {
      display: block;
      position: absolute;
      z-index: -1;
      background-color: ${cloudColor};
      border-radius: 50%;
      animation: 1000ms cloud-tooltip-particle-wobble both infinite linear;
      transition:
        0ms top ${easing.easyBack},
        0ms left ${easing.easyBack2};

      @keyframes cloud-tooltip-particle-wobble {
        from { transform: rotate(0deg) scaleX(1.1) scaleY(0.9); }
        to { transform: rotate(360deg) scaleX(1.1) scaleY(0.9); }
      }
    }
  }
  
  &:hover {
    > .cloud-tooltip__label {
      opacity: 1;
      color: ${textColor};
      background: ${cloudColor};
      transform: translate(-50%, ${toRem(-offset!)}) scale(1);
      transition-delay: 200ms, 250ms, 0ms, 0ms;
      transition-timing-function:
        ${easing.softOut},
        ${easing.softOut},
        ${easing.easyBack},
        ${easing.easyBack};
    }
  }
  
  &:not(:hover) {
    > .cloud-tooltip__label {
      > i {
        top: 50% !important;
        left: 50% !important;
      }
    }
  }

  > .cloud-tooltip__label {
    ${labelStyles};
  }
`);

/**
 * CloudTooltip Component
 */
export interface CloudTooltipProps {
  label: string,
  offset?: number,
  textColor?: string,
  cloudColor?: string,
  labelStyles?: string | SerializedStyles,
}

export type CloudTooltipCombinedProps = CloudTooltipProps & JSX.IntrinsicElements['span'];

const CloudTooltip: React.FC<CloudTooltipCombinedProps> = ({
  label,
  offset = 10,
  textColor = '#333',
  cloudColor = '#fff',
  labelStyles = '',
  children,
  ...props
}) => {
  const [key, setKey] = React.useState(0);

  const onMouseOver = (e: React.MouseEvent<HTMLSpanElement>) => {
    setKey(Math.floor(Math.random() * 999));
    props.onMouseOver?.(e);
  };

  return (
    <Root
      {...props}
      offset={offset}
      textColor={textColor}
      cloudColor={cloudColor}
      labelStyles={labelStyles}
      onMouseOver={onMouseOver}
      className={classnames('cloud-tooltip', props.className)}
    >
      {children}

      <span className="cloud-tooltip__label">
        {label}

        {
          Array.from({ length: Math.max(18, 2.5 * label.length) }).map((char, n) => {
            const angle = 2 * n * Math.PI / (Math.max(18, 2.5 * label.length));
            const minSize = 6;
            const baseSize = 20;
            const randomizeSizeBy = 8;
            const size = Math.max(minSize, Math.abs(((baseSize - 0.5 * randomizeSizeBy) + Math.random() * randomizeSizeBy) * Math.cos(angle)));

            return (
              <i
                key={n}
                style={{
                  width: toRem(size),
                  height: toRem(size),
                  margin: `${toRem(-0.5 * size)} 0 0 ${toRem(-0.5 * size)}`,
                  left: `calc(50% + ${Math.sin(angle)} * 50% + ${Math.floor(Math.random() * 6 - 3)}%)`,
                  top: `calc(50% + ${Math.cos(angle)} * 30% + ${Math.floor(Math.random() * 6 - 3)}%)`,
                  transitionDuration: `${Math.floor(150 + Math.random() * 200)}ms, ${Math.floor(400 - 400 * (Math.cos(angle)) + Math.random() * 200)}ms`,
                  transitionDelay: `${Math.floor(50 + Math.random() * 50)}ms, ${Math.floor(80 + Math.random() * 50)}ms`,
                  animationDuration: `${Math.floor(2500 + Math.random() * 1000)}ms`,
                  animationDirection: `${Math.random() > 0.5 ? 'reverse' : 'normal'}`
                }}
              />
            );
          })
        }
      </span>
    </Root>
  );
};

export default CloudTooltip;
