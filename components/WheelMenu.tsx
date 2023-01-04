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
import { animate, raf } from '../utils/animation';
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
    'wheelMenuOffset',
    'disablePointer',
    'matchesUI',
    'searchQuery',
    'selectedItem',
  ]).includes(prop.toString()),
})<Partial<WheelMenuCombinedProps & {
  disablePointer: boolean,
  matchesUI: 'in' | 'out',
  searchQuery: string,
}>>(({
  open,
  menuWidth,
  menuHeight,
  wheelWidth,
  wheelRadiusInVH,
  wheelMenuOffset,
  disablePointer,
  matchesUI,
  searchQuery,
  selectedItem,
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
      transform: translateX(${toRem(open ? wheelMenuOffset! : 0)});
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

      > span {
        position: absolute;
        top: 50%;
        inset-inline-end: ${toRem(18)};
        display: block;
        width: ${toRem(3)};
        height: ${toRem(3)};
        transform: translateY(-50%);

        &:before,
        &:after {
          content: '';
          position: absolute;
          top: 0;
          inset-inline-start: 0;
          display: block;
          width: 100%;
          height: 100%;
          border-top: ${toRem(1)} solid ${colors.TEXT_LIGHT};
          border-inline-end: ${toRem(1)} solid ${colors.TEXT_LIGHT};
          transform: translateY(${toRem(-3)}) rotate(-45deg);
        }

        &:after {
          transform: translateY(${toRem(3)}) rotate(135deg);
        }
      }
    }

    /* =================================== */
    /* ARC
    /* =================================== */
    
    .wheel-menu__arc {
      position: absolute;
      top: 50%;
      inset-inline-start: 0;
      pointer-events: none;
      transform: translate(${toRem(open ? wheelMenuOffset! : 0)}, -50%);
      transition: 600ms transform ${easing.snapInOut} ${open ? 0 : 400}ms;

      svg {
        position: absolute;
        top: 50%;
        inset-inline-start: 0;
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
        z-index: 1;
        width: calc(${2 * wheelRadiusInVH!}vh - ${toRem(2 * wheelWidth! + 60)} + ${toRem(open ? 0 : 300)});
        height: calc(${2 * wheelRadiusInVH!}vh - ${toRem(2 * wheelWidth! + 60)} + ${toRem(open ? 0 : 300)});
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
        opacity: ${open ? 0.075 : 0};
        width: calc(${2 * wheelRadiusInVH!}vh + ${toRem(120)});
        height: calc(${2 * wheelRadiusInVH!}vh + ${toRem(120)});
      }
    }

    /* =================================== */
    /* LIST
    /* =================================== */

    .wheel-menu__list {
      position: absolute;
      top: 50%;
      inset-inline-start: ${wheelRadiusInVH}vh;
      pointer-events: ${open ? 'auto' : 'none'};
      transform: translate(-50%, -50%);

      &-item {
        position: absolute;
        top: 50%;
        inset-inline-end: 0;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        width: ${toRem(wheelWidth!)};
        height: ${toRem(100)};
        margin-top: ${toRem(-50)};
        padding-inline-end: ${toRem(25)};
        cursor: pointer;
        outline: none;
        font-family: Nunito, sans-serif;
        opacity: ${open ? 1 : 0};
        border: none;
        background: transparent;
        transform-origin: right center;
        opacity: ${open ? 1 : 0};
        transition: 200ms opacity ${open ? 500 : 0}ms;

        &-index {
          margin-top: ${toRem(3)};
          opacity: 0.15;
          font-size: ${toRem(24)};
          font-weight: 300;
          letter-spacing: -0.05em;
          user-select: none;
          color: ${colors.TEXT};
          transform-origin: right center;
          transition:
            240ms opacity,
            240ms transform ${easing.easyBack};
        }

        &-label {
          display: block;
          margin-top: ${toRem(-4)};
          margin-inline-end: ${toRem(20)};
          font-size: ${toRem(32)};
          font-weight: 600;
          letter-spacing: -0.005em;
          white-space: nowrap;
          color: #d0d0d0;
          transform-origin: top right;
          transition:
            240ms color ${easing.snapInOut},
            240ms transform ${easing.easyBack};
        }

        &-info {
          display: flex;
          position: absolute;
          bottom: ${toRem(24)};
          inset-inline-end: ${toRem(97)};
          opacity: 0;
          font-size: ${toRem(13)};
          font-weight: 600;
          transform: translate(${toRem(-10)}, 0);
          transition:
            100ms opacity ${easing.snapInOut},
            240ms transform ${easing.easyBack};

          > img {
            display: block;
            width: ${toRem(18)};
            height: ${toRem(18)};
            margin-inline-start: ${toRem(6)};
            border: ${toRem(2)} solid rgba(0, 0, 0, 0.075);
            border-radius: 50%;
            filter: brightness(1.05) saturate(1.05);
          }
        }

        &-dot {
          position: absolute;
          top: 50%;
          inset-inline-end: ${toRem(-33)};
          display: block;
          width: ${toRem(5)};
          height: ${toRem(5)};
          margin-top: ${toRem(2)};
          pointer-events: none;
          background: #d9d9d9;
          border-radius: 50%;
          transform: translateY(${toRem(-4)});
          transition:
            240ms background-color,
            240ms transform ${easing.backOut};
        }

        &-dash {
          position: absolute;
          inset-inline-end: ${toRem(-10)};
          top: 50%;
          height: ${toRem(1)};
          pointer-events: none;
          border-inline-start: 0 solid ${colors.TEXT};
          border-inline-end: ${toRem(24)} solid rgba(0, 0, 0, 0.1);
        }

        /* INTERACTIVE */

        &.interactive:not(.is-selected) {
          .wheel-menu__list-item {
            &-dash {
              border-inline-start: ${toRem(24)} solid ${colors.TEXT};
              border-inline-end: 0 solid rgba(0, 0, 0, 0.1);
              animation: 120ms dash-out ${easing.snapInOut} both;

              @keyframes dash-out {
                to {
                  border-inline-start-width: 0;
                  border-inline-end-width: ${toRem(24)};
                }
              }
            }
          }
        }

        /* HOVER */

        &:hover:not(.is-selected) {
          .wheel-menu__list-item {
            &-label {
              color: ${colors.TEXT};
            }
          
            &-dot {
              background: ${colors.TEXT};
            }
            
            &-dash {
              border-inline-start: ${toRem(24)} solid rgba(0, 0, 0, 0.1);
              border-inline-end: 0 solid ${colors.TEXT};
              animation: 120ms dash-in linear both;

              @keyframes dash-in {
                to {
                  border-inline-start-width: 0;
                  border-inline-end-width: ${toRem(24)};
                }
              }
            }
          }
        }

        /* SELECTED */
        
        &.is-selected {
          .wheel-menu__list-item {
            &-label {
              color: ${colors.TEXT};
              transform: translate(${toRem(-30)}, ${toRem(-5)}) scale(0.75);
            }
          
            &-index {
              font-weight: 200;
              transform: scale(1.6);
            }
          
            &-info {
              opacity: 0.75;
              transform: translate(${toRem(-30)}, ${toRem(-5)});
            }

            &-dot {
              background: ${colors.TEXT};
              transform: translateY(${toRem(-4)}) scale(1.6);
            }
            
            &-dash {
              border-inline-start-width: ${toRem(24)};
              border-inline-end-width: 0;
            }
          }
        }

        /* MATCH */

        &.is-match {
          .wheel-menu__list-item-label {
            .matching-part {
              position: relative;

              &:before {
                content: '';
                position: absolute;
                bottom: ${toRem(0)};
                inset-inline-start: 0;
                inset-inline-end: 0;
                display: block;
                height: 100%;
                opacity: 0;
                background: ${colors.TEXT};
                border-radius: ${toRem(4)};
                transition: 300ms opacity;
              }
            }
          }

          &.in {
            .wheel-menu__list-item-label {
              color: ${colors.TEXT};
              
              .matching-part {
                &:before {
                  opacity: 0.1;
                }
              }
            }
          }

          &.out {
            .wheel-menu__list-item-label {
              .matching-part {
                &:before {
                  opacity: 0;
                }
              }
            }
          }
        }
      }
    }

    /* =================================== */
    /* HELPER TEXT
    /* =================================== */
    
    .wheel-menu__help-text {
      position: absolute;
      top: 50%;
      inset-inline-start: ${toRem(wheelWidth! + wheelMenuOffset! + 100)};
      margin: 0;
      user-select: none;
      opacity: ${open ? 1 : 0};
      color: ${selectedItem ? colors.TEXT : colors.MUTED};
      transform: translate(${toRem(open ? 0 : -wheelMenuOffset!)}, -50%);
      transition: 
        200ms color,
        400ms opacity ${easing.snapInOut} ${open ? 580 : 0}ms,
        600ms transform ${easing.snapInOut} ${open ? 50 : 0}ms;

      &:before {
        content: '';
        position: absolute;
        top: 50%;
        inset-inline-start: ${toRem(-50)};
        display: block;
        height: ${toRem(1)};
        pointer-events: none;
        border-inline-start: ${toRem(30)} solid ${colors.TEXT};
        border-inline-end: 0 solid rgba(0, 0, 0, 0.1);
        animation: 200ms placeholder-dash-out ${easing.snapInOut} both;

        @keyframes placeholder-dash-out {
          to {
            border-inline-start-width: 0;
            border-inline-end-width: ${toRem(30)};
          }
        }

        ${selectedItem && css`
          border-inline-start: ${toRem(30)} solid rgba(0, 0, 0, 0.1);
          border-inline-end: 0 solid ${colors.TEXT};
          animation: 120ms placeholder-dash-in linear both 200ms;

          @keyframes placeholder-dash-in {
            to {
              border-inline-start-width: 0;
              border-inline-end-width: ${toRem(30)};
            }
          }
        `};
      }

      > p {
        position: absolute;
        display: flex;
        align-items: end;
        margin: 0;
        font-size: ${toRem(14)};
        font-weight: 300;
        white-space: nowrap;
        padding: ${toRem(10)} ${toRem(13)};
        min-width: ${toRem(39)};
        min-height: ${toRem(39)};
        background: #fff;
        border-radius: ${toRem(8)};
        transform: translate(0, -50%);

        &.placeholder-text {
          opacity: ${!open || searchQuery ? 0 : 1};
          color: transparent;
          transition: 300ms opacity;
          cursor: ${selectedItem ? 'pointer' : 'default'};
          transition: 240ms transform ${easing.easyBack};
          animation: 300ms placeholder-${selectedItem ? 'selected' : 'default'}-fade-in linear forwards;

          ${selectedItem && css`
            &:hover {
              transform: translate(0, -50%) scale(1.035);
            }
          `};

          @keyframes placeholder-default-fade-in {
            to { color: ${colors.MUTED}; }
          }

          @keyframes placeholder-selected-fade-in {
            to { color: ${colors.TEXT}; }
          }

          &:after {
            content: '';
            position: absolute;
            top: 50%;
            inset-inline-start: 0;
            z-index: -1;
            display: block;
            width: ${toRem(22)};
            height: ${toRem(22)};
            background: #fff;
            border-radius: ${toRem(0)} ${toRem(0)} ${toRem(0)} ${toRem(4)};
            transform: translateX(${toRem(1)}) translate(-50%, -50%) scaleX(${selectedItem ? 0.8 : 0}) rotate(45deg);
            transition: 300ms transform ${easing.snapInOut};
          }
          
          small {
            margin-inline-start: ${toRem(5)};
            font-size: ${toRem(14)};
          }
          
          strong {
            margin-inline-start: ${toRem(5)};
            font-weight: 600;
          }
        }

        &.search-text {
          display: flex;
          align-items: center;
          pointer-events: none;
          color: ${colors.TEXT_DARK};
          opacity: ${matchesUI === 'out' || !open || !searchQuery ? 0 : 1};
          transition: 300ms opacity ${matchesUI === 'out' || !open || !searchQuery ? 0 : 300}ms;

          &:after {
            content: '';
            display: ${searchQuery ? 'block' : 'none'};
            width: ${toRem(4)};
            height: ${toRem(19)};
            margin-inline-start: ${toRem(2)};
            background: ${colors.TEXT};
            animation: 700ms blink infinite;

            @keyframes blink {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          }

          &.no-match {
            color: #f56d6d;

            &:after {
              background: #f56d6d;
            }
          }
        }
      }
    }

    /* =================================== */
    /* CLOSE BUTTON
    /* =================================== */
    
    .wheel-menu__close-button {
      position: absolute;
      top: 50%;
      inset-inline-start: ${toRem(wheelMenuOffset! - 80)};
      z-index: 9;
      opacity: ${open ? 1 : 0};
      transform: translateY(-50%) scale(${open ? 1 : 0});
      transition:
        200ms opacity linear ${open ? 500 : 100}ms,
        300ms transform ${open ? easing.easyBack : easing.backIn} ${open ? 400 : 0}ms;
      
      button {
        display: block;
        width: ${toRem(40)};
        height: ${toRem(40)};
        cursor: pointer;
        font-size: 0;
        color: transparent;
        border: ${toRem(1)} solid rgba(0, 0, 0, 0.1);
        border: none;
        background: #fff;
        border-radius: 999px;
        transform: rotate(${open ? 0 : -180}deg);
        transition: 500ms transform ${easing.snapInOut} ${open ? 400 : 0}ms;

        &:before,
        &:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          display: block;
          width: ${toRem(14)};
          height: ${toRem(2)};
          margin: -${toRem(1)} 0 0 -${toRem(7)};
          background: ${colors.MUTED};
          border-radius: 99px;
          transform: rotate(45deg);
          transition: 180ms background-color;
        }

        &:after {
          transform: rotate(-45deg);
        }
        
        &:hover {
          ${open && css`
            transform: scale(1.2) rotate(${open ? 0 : -180}deg);
            transition: 240ms transform ${easing.easyBack};
          `};

          &:before,
          &:after {
            background: ${colors.TEXT};
          }
        }
      }
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
  triggerPlaceholder?: React.ReactNode,
  wheelPlaceholder?: React.ReactNode,
  menuWidth?: number,
  menuHeight?: number,
  wheelWidth?: number,
  wheelRadiusInVH?: number,
  wheelMenuOffset?: number,
  degreesPerItem?: number,
  visibilitySpanInDegrees?: number,
  highlightTimeout?: number,
  selectedItem?: WheelMenuItem,
  onOpen?: () => void,
  onClose?: () => void,
  onScroll?: (e: WheelEvent) => void,
  onSelect?: (item: WheelMenuItem) => void,
  onMouseStay?: (item: WheelMenuItem) => void,
  onMouseLeave?: (item: WheelMenuItem) => void,
}

export interface WheelMenuItem {
  index: number,
  label: string,
  value: string,
  data?: any,
}

export type WheelMenuCombinedProps = WheelMenuProps & JSX.IntrinsicElements['div'];

const WheelMenu: React.FC<WheelMenuCombinedProps> = ({
  data,
  value,
  open,
  triggerPlaceholder = 'Select an item...',
  wheelPlaceholder = 'Select an item...',
  menuWidth = 200,
  menuHeight = 40,
  wheelWidth = 440,
  wheelRadiusInVH = 136,
  wheelMenuOffset = 100,
  degreesPerItem = 7,
  visibilitySpanInDegrees = 75,
  highlightTimeout = 1200,
  selectedItem,
  onOpen,
  onClose,
  onScroll,
  onSelect,
  onMouseStay,
  onMouseLeave,
  ...props
}) => {
  const minScrollPosition = -0.25 * visibilitySpanInDegrees;
  const maxScrollPosition = (data.length - 1) * degreesPerItem - 0.25 * visibilitySpanInDegrees;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);

  // selected item
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (item: WheelMenuItem, e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).classList.add('interactive');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onMouseStay?.(item);
    }, highlightTimeout);
  };

  const handleMouseLeave = (item: WheelMenuItem) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onMouseLeave?.(item);
  };

  const scrollToItem = (item: WheelMenuItem) => {
    animate(scrollDataRef.current, {
      target: {
        to: item.index * degreesPerItem - 0.25 * visibilitySpanInDegrees,
      },
    });
  };

  const selectItem = (item: WheelMenuItem) => {
    currentMatchRef.current = null;
    setMatchingResults([]);
    setSearchQuery('');
    scrollToItem(item);
    onSelect?.(item);
  };

  // enable/disable pointer while animation is off/on
  const [disablePointer, setDisablePointer] = React.useState(false);

  React.useEffect(() => {
    let timeout: any;
    
    if (open) {
      setDisablePointer(true);
    } else {
      timeout = setTimeout(() => {
        setDisablePointer(false);
        setSearchQuery('');
        setMatchingResults([]);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [open]);

  // handle search
  const currentMatchRef = React.useRef<WheelMenuItem | null>(null);
  const [matchingResults, setMatchingResults] = React.useState<WheelMenuItem[]>([]);
  const [matchesUI, setMatchesUI] = React.useState<'in' | 'out'>('out');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (!open) return;

    const onSearch = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (searchQuery && matchingResults.length) {
          selectItem(matchingResults[0]);
          e.preventDefault();
        } else
        if (selectedItem) {
          selectItem(selectedItem);
          e.preventDefault();
        }
      } else
      if (e.key === 'Backspace') {
        setSearchQuery(v => e.metaKey ? '' : v.slice(0, v.length - 1));
      } else
      if (/[a-zA-Z0-9\s\-']/.test(e.key) && e.key.length === 1) {
        setSearchQuery(v => v.length < 50 ? `${v}${e.key}` : v);
      }
    };
    
    window.addEventListener('keydown', onSearch);

    return () => {
      window.removeEventListener('keydown', onSearch);
    };
  }, [open, onSelect, searchQuery, matchingResults]);

  React.useEffect(() => {
    if (!open || !searchQuery) return;

    const matches = data.filter((item) => item.label.toLowerCase().startsWith(searchQuery.toLowerCase()));

    setMatchingResults(matches);

    setMatchesUI('in');

    if (matches.length && searchQuery.length >= 2) {
      if (currentMatchRef.current?.value !== matches[0].value) {
        const targetScrollPosition = Math.max(minScrollPosition, Math.min(maxScrollPosition, matches[0].index * degreesPerItem - 0.25 * visibilitySpanInDegrees));
  
        animate(scrollDataRef.current, {
          target: {
            to: targetScrollPosition
          },
        });
      }

      currentMatchRef.current = matches[0];
    }

    let searchModeTimeout = setTimeout(() => {
      setMatchesUI('out');

      searchModeTimeout = setTimeout(() => {
        setSearchQuery('');
        setMatchingResults([]);
        currentMatchRef.current = null;
        if (selectedItem) scrollToItem(selectedItem);
      }, 300); // allow match ui animation to end in 300ms
    }, matches.length ? 1500 : 3000);

    return () => {
      setMatchesUI('out');
      clearTimeout(searchModeTimeout);
    };
  }, [
    open,
    data,
    searchQuery,
    selectedItem,
    degreesPerItem,
    visibilitySpanInDegrees,
    minScrollPosition,
    maxScrollPosition,
  ]);
  
  // close menu on pressing Escape key
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  // rotate menu on mouse wheel
  const scrollDataRef = React.useRef({ target: 0, actual: 0 });
  const [visibleItems, setVisibleItems] = React.useState(data.slice(0, Math.floor(visibilitySpanInDegrees / degreesPerItem) + 1));

  React.useEffect(() => {
    if (!open) return;

    const handleScroll = (e: WheelEvent) => {
      scrollDataRef.current.target += 0.025 * e.deltaY;
      onScroll?.(e);
    };
    
    window.addEventListener('wheel', handleScroll);

    const cancelFrame = raf(() => {
      // cap scroll position
      scrollDataRef.current.target = Math.max(minScrollPosition, Math.min(maxScrollPosition, scrollDataRef.current.target));
      scrollDataRef.current.actual += (scrollDataRef.current.target - scrollDataRef.current.actual) / 3;

      // calculate visible items
      const itemsBuffer = 2; // use 2 items as buffer
      const firstVisibleItemIndex = Math.max(0, Math.floor(scrollDataRef.current.actual / degreesPerItem) - itemsBuffer);
      const numberOfVisibleItems = firstVisibleItemIndex + Math.floor(visibilitySpanInDegrees / degreesPerItem) + 1 + itemsBuffer;

      wheelRef.current!.style.transform = `
        translateX(${toRem(wheelMenuOffset)})
        rotate(${scrollDataRef.current.actual + 0.25 * visibilitySpanInDegrees}deg)
      `;

      if (visibleItems[0].index !== firstVisibleItemIndex) {
        setVisibleItems(data.slice(firstVisibleItemIndex, numberOfVisibleItems));
      }
    });

    return () => {
      cancelFrame();
      window.removeEventListener('wheel', handleScroll);
    };
  }, [
    open,
    data,
    degreesPerItem,
    wheelMenuOffset,
    visibilitySpanInDegrees,
    visibleItems,
    setVisibleItems,
    minScrollPosition,
    maxScrollPosition,
    onScroll,
  ]);

  // handle click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as HTMLElement)) {
        onClose?.();
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [onClose]);
  
  
  return (
    <Root
      ref={rootRef}
      {...props}
      open={open}
      menuWidth={menuWidth}
      menuHeight={menuHeight}
      wheelWidth={wheelWidth}
      wheelRadiusInVH={wheelRadiusInVH}
      wheelMenuOffset={wheelMenuOffset}
      selectedItem={selectedItem}
      disablePointer={disablePointer}
      matchesUI={matchesUI}
      searchQuery={searchQuery}
    >
      <button className="wheel-menu__trigger" onClick={onOpen} disabled={disablePointer}>
        {value ?? triggerPlaceholder}
        <span />
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

      <div className="wheel-menu__list" ref={wheelRef}>
        {
          visibleItems.map((item, n) => {
            const isMatch = matchingResults?.[0]?.index === item.index;

            return (
              <button
                key={item.index}
                tabIndex={-1}
                className={classnames('wheel-menu__list-item', {
                  'is-selected': selectedItem?.value === item.value,
                  'is-match': isMatch,
                  'in': isMatch && matchesUI === 'in',
                  'out': isMatch && matchesUI === 'out',
                })}
                style={{
                  transform: `
                    rotate(${-item.index * degreesPerItem}deg)
                    translate3d(calc(${-wheelRadiusInVH}vh + ${toRem(wheelWidth)}), 0, 0)
                  `,
                }}
                onClick={(e) => {
                  selectItem(item);
                  e.preventDefault();
                }}
                onMouseEnter={e => handleMouseEnter(item, e)}
                onMouseLeave={() => handleMouseLeave(item)}
              >
                <span className="wheel-menu__list-item-index">
                  #{'0'.repeat(3 - (item.index + 1).toString().length) + (item.index + 1)}
                </span>

                <span className="wheel-menu__list-item-label">
                  {
                    isMatch ? (
                      <>
                        <span className="matching-part">
                          {item.label.slice(0, searchQuery.length)}
                        </span>
                        {item.label.slice(searchQuery.length)}
                      </>
                    ) : item.label
                  }
                </span>

                <span className="wheel-menu__list-item-info">
                  {item.data?.country}
                  <img src={`/img/flags/${item.data.country.toLowerCase().replace(/\s/g, '-')}.png`} alt="" />
                </span>
                
                <span className="wheel-menu__list-item-dash" />
                <span className="wheel-menu__list-item-dot" />
              </button>
            )
          })
        }
      </div>

      <div className="wheel-menu__help-text">
        <p className="placeholder-text" onClick={() => selectedItem && onSelect?.(selectedItem)}>
          {wheelPlaceholder}
        </p>

        <p className={classnames('search-text', { 'no-match': matchingResults.length === 0 })}>
          {searchQuery}
        </p>
      </div>

      <div className="wheel-menu__close-button">
        <button onClick={onClose}>
          Close
        </button>
      </div>
    </Root>
  );
};

export default WheelMenu;
