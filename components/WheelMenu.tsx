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
          margin-top: ${toRem(10)};
          margin-inline-start: ${toRem(15)};
          opacity: 0.15;
          font-size: ${toRem(21)};
          font-weight: 700;
          user-select: none;
          color: ${colors.TEXT};
          transition: 240ms opacity;
        }

        &-label {
          display: block;
          font-size: ${toRem(34)};
          font-weight: 600;
          letter-spacing: -0.005em;
          white-space: nowrap;
          color: ${colors.MUTED};
          transition: 240ms color ${easing.snapInOut};
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
          transition: 240ms background-color;
        }

        &-dash {
          position: absolute;
          inset-inline-end: ${toRem(-10)};
          top: 50%;
          height: ${toRem(1)};
          transform: translateY(${toRem(4)});
          pointer-events: none;
          border-inline-start: ${toRem(24)} solid ${colors.TEXT};
          border-inline-end: 0 solid rgba(0, 0, 0, 0.1);
          animation: 240ms dash-out ${easing.snapInOut} forwards;

          @keyframes dash-out {
            to {
              border-inline-start-width: 0;
              border-inline-end-width: ${toRem(24)};
            }
          }
        }

        /* HOVER */

        &:hover {
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
              animation: 240ms dash-in ${easing.snapInOut} forwards;

              @keyframes dash-in {
                to {
                  border-inline-start-width: 0;
                  border-inline-end-width: ${toRem(24)};
                }
              }
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
      inset-inline-start: ${toRem(wheelWidth! + wheelMenuOffset! + 125)};
      margin: ${toRem(4)} 0 0;
      pointer-events: none;
      user-select: none;
      color: ${open ? colors.MUTED : 'transparent'};
      transform: translate(${toRem(open ? 0 : -wheelMenuOffset!)}, -50%);
      transition: 
        400ms color ${easing.snapInOut} ${open ? 580 : 0}ms,
        600ms transform ${easing.snapInOut} ${open ? 50 : 0}ms;

      &:before {
        content: '';
        position: absolute;
        top: 50%;
        inset-inline-start: ${toRem(-70)};
        display: block;
        width: ${toRem(open ? 50 : 0)};
        height: ${toRem(1)};
        background: rgba(0, 0, 0, 0.1);
        transition: 200ms width ${easing.snapInOut} ${open ? 500 : 0}ms;
      }
      
      > p {
        position: absolute;
        transform: translate(0, -50%);
        margin: 0;
        font-size: ${toRem(16)};
        font-style: italic;
        font-weight: 200;
        white-space: nowrap;

        &.placeholder-text {
          opacity: ${!open || searchQuery ? 0 : 1};
          transition: 300ms opacity;
        }

        &.search-text {
          display: flex;
          align-items: center;
          color: ${colors.TEXT_DARK};
          opacity: ${matchesUI === 'out' || !open || !searchQuery ? 0 : 1};
          transition: 300ms opacity ${matchesUI === 'out' || !open || !searchQuery ? 0 : 300}ms;

          &:after {
            content: '';
            display: ${searchQuery ? 'block' : 'none'};
            width: ${toRem(4)};
            height: ${toRem(16)};
            margin-inline-start: ${toRem(2)};
            background: ${colors.MUTED};
            transform: skewX(-8deg);
            animation: 700ms blink infinite;

            @keyframes blink {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          }

          &.no-match {
            color: #fd4949;

            &:after {
              background: #fd4949;
            }
          }
        }
      }
    }

    /* =================================== */
    /* OVERLAY
    /* =================================== */
    
    .wheel-menu__overlay {
      position: fixed;
      top: 0;
      inset-inline-start: 0;
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
  wheelMenuOffset?: number,
  degreesPerItem?: number,
  visibilitySpanInDegrees?: number,
  onOpen?: () => void,
  onClose?: () => void,
  onSelect?: (item: WheelMenuItem) => void,
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
  placeholder = 'Select an item...',
  menuWidth = 200,
  menuHeight = 40,
  wheelWidth = 440,
  wheelRadiusInVH = 136,
  wheelMenuOffset = 150,
  degreesPerItem = 7,
  visibilitySpanInDegrees = 80,
  onOpen,
  onClose,
  onSelect,
  ...props
}) => {
  const minScrollPosition = 0;
  const maxScrollPosition = data.length * degreesPerItem - visibilitySpanInDegrees + 30;

  const wheelRef = React.useRef<HTMLDivElement>(null);

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
  }, [open]);

  React.useEffect(() => {
    if (!open || !searchQuery) return;

    const matches = data.filter((item) => item.label.toLowerCase().startsWith(searchQuery.toLowerCase()));

    setMatchingResults(matches);

    if (matches.length) {
      if (currentMatchRef.current !== matches[0]) {
        const targetScrollPosition = Math.max(minScrollPosition, Math.min(maxScrollPosition, matches[0].index * degreesPerItem - 24));
  
        animate(scrollDataRef.current, {
          target: {
            to: targetScrollPosition
          },
        });
      }

      setMatchesUI('in');

      currentMatchRef.current = matches[0];
    }

    let searchModeTimeout = setTimeout(() => {
      setMatchesUI('out');

      searchModeTimeout = setTimeout(() => {
        setSearchQuery('');
        setMatchingResults([]);
        currentMatchRef.current = null;
      }, 300); // allow match ui animation to end in 300ms
    }, matches.length ? 1500 : 3000);

    return () => {
      clearTimeout(searchModeTimeout);
    };
  }, [
    open,
    data,
    searchQuery,
    degreesPerItem,
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

    const onScroll = (e: WheelEvent) => {
      scrollDataRef.current.target += 0.025 * e.deltaY;
    };
    
    window.addEventListener('wheel', onScroll);

    const cancelFrame = raf(() => {
      // cap scroll position
      scrollDataRef.current.target = Math.max(minScrollPosition, Math.min(maxScrollPosition, scrollDataRef.current.target));
      scrollDataRef.current.actual += (scrollDataRef.current.target - scrollDataRef.current.actual) / 3;

      // calculate visible items
      const itemsBuffer = 2; // use 2 items as buffer
      const scrollPosition = Math.max(minScrollPosition, Math.min(maxScrollPosition, scrollDataRef.current.actual));
      const firstVisibleItemIndex = Math.max(0, Math.floor(scrollPosition / degreesPerItem) - itemsBuffer);
      const numberOfVisibleItems = firstVisibleItemIndex + Math.floor(visibilitySpanInDegrees / degreesPerItem) + 1 + itemsBuffer;

      wheelRef.current!.style.transform = `
        translateX(${toRem(wheelMenuOffset)})
        rotate(${scrollDataRef.current.actual + 24}deg)
      `;

      if (visibleItems[0].index !== firstVisibleItemIndex) {
        setVisibleItems(data.slice(firstVisibleItemIndex, numberOfVisibleItems));
      }
    });

    return () => {
      cancelFrame();
      window.removeEventListener('wheel', onScroll);
    };
  }, [
    open,
    data,
    degreesPerItem,
    wheelMenuOffset,
    visibilitySpanInDegrees,
    visibleItems,
    setVisibleItems,
    maxScrollPosition,
  ]);
  
  return (
    <Root
      {...props}
      open={open}
      menuWidth={menuWidth}
      menuHeight={menuHeight}
      wheelWidth={wheelWidth}
      wheelRadiusInVH={wheelRadiusInVH}
      wheelMenuOffset={wheelMenuOffset}
      disablePointer={disablePointer}
      matchesUI={matchesUI}
      searchQuery={searchQuery}
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

      <div className="wheel-menu__list" ref={wheelRef}>
        {
          visibleItems.map((item, n) => {
            const isMatch = matchingResults?.[0]?.index === item.index;

            return (
              <button
                key={item.index}
                tabIndex={-1}
                className={classnames('wheel-menu__list-item', {
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
                  onSelect?.(item);
                  e.preventDefault();
                }}
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
                
                <span className="wheel-menu__list-item-dash" />
                <span className="wheel-menu__list-item-dot" />
              </button>
            )
          })
        }
      </div>

      <div className="wheel-menu__help-text">
        <p className="placeholder-text">
          select a city or start typing
        </p>

        <p className={classnames('search-text', { 'no-match': matchingResults.length === 0 })}>
          {searchQuery}
        </p>
      </div>

      <div className="wheel-menu__overlay" onClick={onClose} />
    </Root>
  );
};

export default WheelMenu;
