/**
 * Dependency imports
 */
import React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
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

if (typeof document !== 'undefined') {
  tooltipRoot = document.createElement('div');
  tooltipRoot.id = 'wb-tooltip-root';
  document.body.append(tooltipRoot);
}

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'target',
    'color',
    'opacity',
    'position',
    'offset',
    'posX',
    'posY',
    'targetWidth',
    'targetHeight',
  ]).includes(prop.toString()),
})<Partial<TooltipElementProps>>(({
  target,
  color,
  opacity,
  position,
  offset,
  posX,
  posY,
  targetWidth,
  targetHeight,
}) => {
  let top = posY!;
  let left = posX!;

  top -= offset!;

  if (target === 'element') {
    left += targetWidth! / 2;
  }
  
  return css`
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    z-index: 99999;
    pointer-events: none;
    white-space: nowrap;
    transform: translate(-50%, -100%);

    > div {
      padding: ${toRem(3)} ${toRem(6)};
      font-size: ${toRem(12)};
      font-weight: 400;
      color: #fff;
      background: ${Color(color).alpha(opacity ?? 0.25).string()};
      backdrop-filter: blur(${toRem(10)});
      border-radius: ${toRem(4)};
      animation: 120ms wb-tooltip-appear ${easing.snap} both;
      
      @keyframes wb-tooltip-appear {
        from { opacity: 0; transform: translateY(25%); }
        to { opacity: 1; transform: translateY(0); }
      }
    }
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
  opacity?: number,
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end',
  offset?: number,
  openDelay?: number,
  closeDelay?: number,
}

const Tooltip: React.FC<TooltipProps & { children: React.ReactElement }> = ({
  children,
  target,
  openDelay,
  closeDelay,
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

  const tooltip = ReactDOM.createPortal(
    <TooltipElement
      {...props}
      target={target}
      posX={tooltipX}
      posY={tooltipY}
      targetWidth={targetWidth}
      targetHeight={targetHeight}
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

Tooltip.defaultProps = {
  target: 'element',
  color: '#000',
  offset: 5,
  position: 'top',
  openDelay: 1000,
  closeDelay: 0,
};

export default Tooltip;
