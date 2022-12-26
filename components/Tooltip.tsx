/**
 * Dependency imports
 */
import React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { css, SerializedStyles } from '@emotion/react';
import { useTimeout } from '@mantine/hooks';
import Color from 'color';

/**
 * Local imports
 */
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';

/**
 * Initialize
 */
let tooltipRoot: HTMLDivElement;

const isSSR = typeof document === 'undefined';

if (!isSSR) {
  tooltipRoot = document.createElement('div');
  tooltipRoot.id = 'wb-tooltip-root';
  document.body.append(tooltipRoot);
}

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'color',
    'backgroundColor',
    'opacity',
    'offset',
    'position',
    'posX',
    'posY',
    'targetWidth',
    'targetHeight',
    'tooltipStyles',
  ]).includes(prop.toString()),
})<Partial<TooltipElementProps>>(({
  color,
  backgroundColor,
  opacity,
  offset,
  position,
  posX,
  posY,
  targetWidth,
  targetHeight,
  tooltipStyles,
}) => {
  const offsetX = (offset as [number, number])[0] ?? offset;
  const offsetY = (offset as [number, number])[1] ?? offset;
  const [y, x] = position!.split('-');

  const positionStyles = css`
    top: ${toRem(posY! + ({ top: 0, center: 0.5, bottom: 1 }[y] ?? 0) * targetHeight! + offsetY)};
    inset-inline-start: ${toRem(posX! + ({ start: 0, end: 1 }[x] ?? 0.5) * targetWidth! + offsetX)};
    transform: translate(${({ start: -100, end: 0 }[x] ?? -50)}%, -${{top: 100, center: 50, bottom: 0}[y]}%);
  `;

  return css`
    position: fixed;
    z-index: 99999;
    pointer-events: none;
    white-space: nowrap;
    ${positionStyles};

    > div {
      padding: ${toRem(3)} ${toRem(6)};
      font-size: ${toRem(11)};
      font-weight: 400;
      color: ${color};
      background: ${Color(backgroundColor).alpha(opacity!).string()};
      backdrop-filter: blur(${toRem(10)});
      border-radius: ${toRem(4)};
      animation: 120ms wb-tooltip-appear ${easing.overshootBack} both;
      
      @keyframes wb-tooltip-appear {
        from { opacity: 0; transform: translateY(10%); }
        to { opacity: 1; transform: translateY(0); }
      }
    }

    ${tooltipStyles};
  `;
});

/**
 * Component(s)
 */
export interface TooltipElementProps extends TooltipProps {
  posX: number,
  posY: number,
  targetWidth: number,
  targetHeight: number,
}

const TooltipElement: React.FC<TooltipElementProps> = ({
  label,
  ...props
}) => {
  return (
    <Root {...props}>
      <div>
        {label}
      </div>
    </Root>
  )
};

/**
 * Tooltip Component
 */
export interface TooltipProps {
  label: string | React.ReactElement,
  target?: 'mouse' | 'element',
  color?: string,
  backgroundColor?: string,
  opacity?: number,
  position?: 'top-start' | 'top-center' | 'top-end' | 'center-start' | 'center' | 'center-end' | 'bottom-start' | 'bottom-center' | 'bottom-end',
  offset?: number | [number, number],
  openDelay?: number,
  closeDelay?: number,
  autoClose?: boolean,
  tooltipStyles?: SerializedStyles | string,
}

const Tooltip: React.FC<TooltipProps & { children: React.ReactElement }> = ({
  children,
  target = 'mouse',
  color = '#fff',
  backgroundColor = '#333',
  opacity = 1,
  offset = 0,
  position = 'top-center',
  openDelay = 1000,
  closeDelay = 0,
  autoClose = false,
  tooltipStyles,
  ...props
}) => {
  const activePos: {
    x: number,
    y: number,
    target: null | HTMLElement,
  } = {
    x: 0,
    y: 0,
    target: null,
  };

  const [tooltipX, setTooltipX] = React.useState(0);
  const [tooltipY, setTooltipY] = React.useState(0);
  const [targetWidth, setTargetWidth] = React.useState(0);
  const [targetHeight, setTargetHeight] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  /* open */
  const { start: startOpenTimeout, clear: clearOpenTimeout } = useTimeout(() => {
    if (target === 'mouse') {
      setTooltipX(activePos.x);
      setTooltipY(activePos.y);
    }

    if (target === 'element' && activePos.target) {
      const bbox = activePos.target.getBoundingClientRect();

      setTooltipX(bbox.x);
      setTooltipY(bbox.y);
      setTargetWidth(bbox.width);
      setTargetHeight(bbox.height);
    }

    setVisible(true);

    if (autoClose) {
      clearOpenTimeout();
      startCloseTimeout();
    }
  }, openDelay!);

  /* close */
  const { start: startCloseTimeout, clear: clearCloseTimeout } = useTimeout(() => {
    setVisible(false);
  }, closeDelay!);

  const tooltipTarget = React.cloneElement(children, {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      activePos.x = e.pageX;
      activePos.y = e.pageY;
      activePos.target = e.target as HTMLElement;
      children?.props?.onMouseMove?.(e);
    },
    onMouseOver: (e: React.MouseEvent<HTMLElement>) => {
      startOpenTimeout();
      clearCloseTimeout();
      children?.props?.onMouseOver?.(e);
    },
    onMouseOut: (e: React.MouseEvent<HTMLElement>) => {
      clearOpenTimeout();
      startCloseTimeout();
      children?.props?.onMouseOut?.(e);
    },
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      setVisible(false);
      children?.props?.onMouseDown?.(e);
    },
  });

  if (isSSR) return tooltipTarget;

  const tooltip = ReactDOM.createPortal(
    <TooltipElement
      {...props}
      color={color}
      backgroundColor={backgroundColor}
      opacity={opacity}
      offset={offset}
      position={position}
      posX={tooltipX}
      posY={tooltipY}
      targetWidth={targetWidth}
      targetHeight={targetHeight}
      tooltipStyles={tooltipStyles}
    />,
    tooltipRoot,
  );

  return (
    <>
      {tooltipTarget}
      {visible && tooltip}
    </>
  );
};

export default Tooltip;
