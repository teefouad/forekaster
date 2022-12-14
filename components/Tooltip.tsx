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
    'bgColor',
    'labelStyles',
  ]).includes(prop.toString()),
})<Partial<TooltipCombinedProps>>(({
  offset,
  textColor,
  bgColor,
  labelStyles,
}) => css`
  position: relative;

  > .tooltip__label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    padding: ${toRem(2)} ${toRem(4)} ${toRem(1)};
    pointer-events: none;
    white-space: nowrap;
    opacity: 0;
    font-family: Nunito, sans-serif;
    font-size: ${toRem(11)};
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: ${textColor};
    background: ${bgColor};
    border-radius: ${toRem(4)};
    transform: translate(-50%, ${toRem(-offset! + 3)});
    transform-origin: center bottom;
    transition:
      opacity 150ms ${easing.easyBack},
      transform 150ms ${easing.easyBack} 50ms;
  }
  
  &:hover {
    > .tooltip__label {
      opacity: 1;
      transform: translate(-50%, ${toRem(-offset!)});
      transition-delay: 0ms, 0ms;
      transition-timing-function: ${easing.easyBack}, ${easing.easyBack};
    }
  }

  > .tooltip__label {
    ${labelStyles};
  }
`);

/**
 * Tooltip Component
 */
export interface TooltipProps {
  label: string,
  offset?: number,
  textColor?: string,
  bgColor?: string,
  labelStyles?: string | SerializedStyles,
}

export type TooltipCombinedProps = TooltipProps & JSX.IntrinsicElements['span'];

const Tooltip: React.FC<TooltipCombinedProps> = ({
  label,
  offset = 10,
  textColor = '#333',
  bgColor = '#fff',
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
      bgColor={bgColor}
      labelStyles={labelStyles}
      onMouseOver={onMouseOver}
      className={classnames('tooltip', props.className)}
    >
      {children}

      <span className="tooltip__label">
        {label}
      </span>
    </Root>
  );
};

export default Tooltip;
