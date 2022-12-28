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
    'active',
    'offset',
    'textColor',
    'cloudColor',
    'labelStyles',
    'verticalPadding',
    'fadeOutDelay',
    'onMouseOver',
  ]).includes(prop.toString()),
})<Partial<CloudTooltipCombinedProps & { active: boolean }>>(({
  active,
  offset,
  textColor,
  cloudColor,
  labelStyles,
  verticalPadding,
  fadeOutDelay,
}) => css`
  position: relative;
  user-select: none;

  > .cloud-tooltip__label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    padding: ${toRem(verticalPadding!)} ${toRem(12)};
    pointer-events: none;
    white-space: nowrap;
    opacity: ${active ? 1 : 0};
    font-family: Nunito, sans-serif;
    font-size: ${toRem(12)};
    font-weight: 600;
    background: ${active ? cloudColor : 'transparent'};
    border-radius: 50%;
    transform: translate(-50%, ${toRem(-offset!)}) scale(${active ? 1 : '0.2, 0.9'});
    transform-origin: center bottom;
    transition:
      background-color 250ms ${easing.softOut} ${active ? 250 : 0}ms,
      opacity 150ms ${active ? easing.backOut : easing.softIn} ${active ? 0 : fadeOutDelay}ms,
      transform 350ms ${active ? easing.backOut : easing.softIn};

    > span {
      color: ${textColor};
      opacity: ${active ? 1 : 0};
      transition: opacity ${active ? 500 : 200}ms ${easing.softOut} ${active ? 200 : 0}ms;
      ${labelStyles};
    }

    > i {
      display: block;
      position: absolute;
      z-index: -1;
      background-color: ${cloudColor};
      border-radius: 50%;
      animation: 1000ms cloud-tooltip-particle-wobble both infinite linear;
      transition:
        0ms top ${easing.backOut},
        0ms left ${easing.easyBack};

      @keyframes cloud-tooltip-particle-wobble {
        from { transform: rotate(0deg) scaleX(1.1) scaleY(0.9); }
        to { transform: rotate(360deg) scaleX(1.1) scaleY(0.9); }
      }
    }
  }
`);

/**
 * CloudTooltip Component
 */
export interface CloudTooltipProps {
  label: React.ReactNode,
  offset?: number,
  textColor?: string,
  cloudColor?: string,
  labelStyles?: string | SerializedStyles,
  verticalPadding?: number,
  fadeOutDelay?: number,
  count?: number,
  openDelay?: number,
  closeDelay?: number,
}

export type CloudTooltipCombinedProps = CloudTooltipProps & JSX.IntrinsicElements['span'];

const CloudTooltip: React.FC<CloudTooltipCombinedProps> = ({
  label,
  offset = 10,
  textColor = '#333',
  cloudColor = '#fff',
  labelStyles = '',
  verticalPadding = 5,
  fadeOutDelay = 150,
  count = 10,
  openDelay = 1000,
  closeDelay = 0,
  children,
  ...props
}) => {
  const rootRef = React.useRef<HTMLElement>(null);
  const timeoutRef = React.useRef<any>(null);
  const [active, setActive] = React.useState(false);
  const [readyToRender, setReadyToRender] = React.useState(false);

  React.useEffect(() => setReadyToRender(true), []);

  React.useEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current;

    const onMouseOver = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setActive(true);
      }, openDelay);
    };

    const onMouseOut = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setActive(false);
      }, closeDelay);
    };

    root.addEventListener('mouseenter', onMouseOver);
    root.addEventListener('mouseleave', onMouseOut);

    return () => {
      root.removeEventListener('mouseenter', onMouseOver);
      root.removeEventListener('mouseleave', onMouseOut);
    };
  }, [openDelay, closeDelay, readyToRender]);

  if (!readyToRender) return null;
  
  return (
    <Root
      ref={rootRef}
      {...props}
      active={active}
      offset={offset}
      textColor={textColor}
      cloudColor={cloudColor}
      labelStyles={labelStyles}
      verticalPadding={verticalPadding}
      fadeOutDelay={fadeOutDelay}
      className={classnames('cloud-tooltip', props.className)}
    >
      {children}

      <span className="cloud-tooltip__label">
        <span>
          {label}
        </span>

        {
          Array.from({ length: Math.max(18, 2.5 * count!) }).map((char, n) => {
            const angle = 2 * n * Math.PI / (Math.max(18, 2.5 * count!));
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
                  left: !active ? '50%' : `calc(50% + ${Math.sin(angle)} * 50% + ${Math.floor(Math.random() * 6 - 3)}%)`,
                  top: !active ? '50%' : `calc(50% + ${Math.cos(angle)} * 30% + ${Math.floor(Math.random() * 6 - 3)}%)`,
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
