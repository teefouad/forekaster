/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

/**
 * Local imports
*/
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import * as colors from '../utils/colors';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'open',
    'menuWidth',
    'menuHeight',
    'wheelWidth',
    'wheelRadiusInVH',
    'disablePointer',
  ]).includes(prop.toString()),
})<Partial<WheelMenuCombinedProps&  {
  disablePointer: boolean,
}>>(({
  open,
  menuWidth,
  menuHeight,
  wheelWidth,
  wheelRadiusInVH,
  disablePointer,
}) => {
  const L = 0.5;
  const circum = `2 * ${Math.PI} * ${wheelRadiusInVH}vh`;
  const halfCircum = `${L} * ${Math.PI} * ${wheelRadiusInVH}vh`;

  return css`
    /* =================================== */
    /* TRIGGER
    /* =================================== */
    
    .wheel-menu__trigger {
      position: relative;
      z-index: 9;
      display: block;
      width: ${toRem(open ? wheelWidth! : menuWidth!)};
      height: ${toRem(menuHeight!)};
      margin: 0;
      padding: ${toRem(1)} ${toRem(20)} 0;
      cursor: pointer;
      pointer-events: ${open ? 'none' : 'auto'};
      user-select: ${open ? 'none' : 'initial'};
      opacity: ${open ? 0 : 1};
      outline: none;
      font-family: Nunito, sans-serif;
      font-size: ${toRem(13)};
      font-weight: 500;
      text-align: start;
      color: ${colors.TEXT_LIGHT};
      border: none;
      background: #fff;
      border-radius: ${toRem(open ? 0 : 0.5 * menuHeight!)};
      transform: translateX(${toRem(open ? 150 : 0)});
      transition:
        200ms color,
        600ms width ${easing.swiftSnap} ${open ? 0 : 400}ms,
        600ms border-radius ${easing.swiftSnap} ${open ? 0 : 100}ms,
        600ms transform ${easing.snapInOut} ${open ? 0 : 400}ms,
        200ms opacity ${easing.soft} ${open ? 200 : 350}ms;

      ${!open && !disablePointer && css`
        &:hover {
          width: ${toRem(menuWidth! + 20)};
          color: ${colors.TEXT};
          transition:
            200ms color,
            300ms width ${easing.easyBack};
        }
      `}
    }

    /* =================================== */
    /* ARC
    /* =================================== */
    
    .wheel-menu__arc {
      position: absolute;
      top: 50%;
      inset-inline-start: 0;
      pointer-events: none;
      transform: translate(${toRem(open ? 150 : 0)}, -50%);
      transition: 600ms transform ${easing.snapInOut} ${open ? 0 : 400}ms;

      svg {
        position: absolute;
        top: 50%;
        left: 0;
        width: ${2 * wheelRadiusInVH!}vh;
        height: ${2 * wheelRadiusInVH!}vh;
        transform: translate(0, -50%);
      }

      &-middle-ring {
        fill: transparent;
        stroke: #fff;
        stroke-width: ${toRem(open ? 2 * wheelWidth! : 2 * menuWidth!)};
        stroke-dasharray: calc(${halfCircum}) calc(${circum});
        stroke-dashoffset: ${open ? 0 : `calc(${halfCircum})`};
        transform: rotate(${open ? (2 - L) * 0.5 * Math.PI : Math.PI}rad);
        transform-origin: center;
        transition:
          600ms opacity linear ${open ? 200 : 0}ms,
          600ms stroke-width ${easing.swiftSnap} ${open ? 0 : 400}ms,
          600ms stroke-dashoffset ${easing.swiftSnap} ${open ? 150 : 0}ms,
          600ms transform ${easing.swiftSnap} ${open ? 150 : 0}ms;
      }
      
      &-inner-ring,
      &-outer-ring {
        position: absolute;
        top: 50%;
        inset-inline-start: ${wheelRadiusInVH}vh;
        width: calc(${2 * wheelRadiusInVH!}vh - ${toRem(2 * wheelWidth! + 80)} + ${toRem(open ? 0 : 300)});
        height: calc(${2 * wheelRadiusInVH!}vh - ${toRem(2 * wheelWidth! + 80)} + ${toRem(open ? 0 : 300)});
        pointer-events: none;
        opacity: ${open ? 0.05 : 0};
        border: 1px solid #000;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition:
          140ms opacity linear ${open ? 300 : 0}ms,
          600ms width ${easing.swiftSnap},
          600ms height ${easing.swiftSnap};
      }

      &-outer-ring {
        width: calc(${2 * wheelRadiusInVH!}vh + ${toRem(100)});
        height: calc(${2 * wheelRadiusInVH!}vh + ${toRem(100)});
      }
    }

    /* =================================== */
    /* OVERLAY
    /* =================================== */
    
    .wheel-menu__overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: ${open ? 'auto' : 'none'};
    }
  `;
});

/**
 * WheelMenu Component
 */
export interface WheelMenuProps {
  data: WheelMenuItem[],
  value?: string,
  open?: boolean,
  placeholder?: string,
  menuWidth?: number,
  menuHeight?: number,
  wheelWidth?: number,
  wheelRadiusInVH?: number,
  onOpen?: () => void,
  onClose?: () => void,
  onSelect?: (item: WheelMenuItem) => void,
}

export interface WheelMenuItem {
  label: string,
  value: string,
  data?: any,
}

export type WheelMenuCombinedProps = WheelMenuProps & JSX.IntrinsicElements['div'];

const WheelMenu: React.FC<WheelMenuCombinedProps> = ({
  data,
  value,
  open,
  placeholder = 'Select an item...',
  menuWidth = 200,
  menuHeight = 40,
  wheelWidth = 440,
  wheelRadiusInVH = 136,
  onOpen,
  onClose,
  onSelect,
  ...props
}) => {
  const [disablePointer, setDisablePointer] = React.useState(false);

  React.useEffect(() => {
    let timeout: any;
    
    if (open) {
      setDisablePointer(true);
    } else {
      timeout = setTimeout(() => setDisablePointer(false), 1000);
    }

    return () => clearTimeout(timeout);
  }, [open]);

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
  
  return (
    <Root
      {...props}
      open={open}
      menuWidth={menuWidth}
      menuHeight={menuHeight}
      wheelWidth={wheelWidth}
      wheelRadiusInVH={wheelRadiusInVH}
      disablePointer={disablePointer}
    >
      <button className="wheel-menu__trigger" onClick={onOpen} disabled={disablePointer}>
        {value ?? placeholder}
      </button>

      <div className="wheel-menu__arc">
        <div className="wheel-menu__arc-inner-ring" />
        <div className="wheel-menu__arc-outer-ring" />

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
            className="wheel-menu__arc-middle-ring"
            xlinkHref="#circle-def"
            clipPath="url(#circle-clip-path)"
          />
        </svg>
      </div>

      <div className="wheel-menu__overlay" onClick={onClose} />
    </Root>
  );
};

export default WheelMenu;
