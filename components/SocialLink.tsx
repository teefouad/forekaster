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
import CloudTooltip from './CloudTooltip';
import Icon, { IconName } from './Icon';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';
import * as colors from '../utils/colors';

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([
    'animationMode',
  ]).includes(prop.toString()),
})<Partial<SocialLinkCombinedProps & {
  animationMode: 'in' | 'out' | false,
}>>(({
  animationMode,
}) => css`
  position: relative;
  pointer-events: ${animationMode === 'out' ? 'none' : 'auto'};

  > span {
    > a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${toRem(40)};
      height: ${toRem(40)};
      text-decoration: none;

      // icon background
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        inset-inline-start: 50%;
        display: block;
        width: ${toRem(44)};
        height: ${toRem(44)};
        margin-top: ${toRem(-0.5 * 44)};
        margin-inline-start: ${toRem(-0.5 * 44)};
        pointer-events: none;
        opacity: 0;
        background: #fff;
        transform: scale(0.2);
        border-radius: 50%;
        transition:
          200ms color,
          200ms opacity 100ms,
          0ms background-color linear 200ms,
          300ms transform ${easing.easeIn};
      }

      ${animationMode === 'in' && css`
        &:before {
          opacity: 1;
          background: transparent;
          transform: scale(1);
          transition:
            200ms color,
            200ms opacity,
            0ms background-color linear 900ms,
            300ms transform ${easing.swiftBack};
        }
      `}

      // icon background blob
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        inset-inline-start: 50%;
        display: block;
        width: ${toRem(44)};
        height: ${toRem(44)};
        margin-top: ${toRem(-0.5 * 44)};
        margin-inline-start: ${toRem(-0.5 * 44)};
        pointer-events: none;
        opacity: 0;
        background: #fff;
        transform: scale(1);
        border-radius: 50%;
        transition:
          100ms opacity linear 500ms,
          300ms margin-top ${easing.snapIn} 300ms,
          0ms transform ${easing.snapIn} 600ms;
      }

      ${animationMode === 'in' && css`
        &:after {
          opacity: 1;
          margin-top: ${toRem(-0.5 * 44 - 50)};
          transform: scale(0.5);
          transition:
            100ms opacity linear 800ms,
            400ms margin-top ${easing.softBack} 1200ms,
            400ms transform ${easing.softBack} 1200ms;
        }
      `}

      // icon
      .wb-icon {
        position: relative;
        z-index: 1;

        &:before {
          color: ${colors.TEXT};
          font-size: ${toRem(24)};
          transition: 300ms color;
        }
      }

      ${animationMode === 'in' && css`
        .wb-icon {
          &:before {
            color: ${colors.TEXT_DARK};
          }
        }
      `}
    }
  }
`);

/**
 * SocialLink Component
 */
export interface SocialLinkProps {
  icon: IconName,
  link: string,
  label?: string,
  target?: 'self' | 'newtab',
}

export type SocialLinkCombinedProps = SocialLinkProps & JSX.IntrinsicElements['div'];

const SocialLink: React.FC<SocialLinkCombinedProps> = ({
  icon,
  link,
  label,
  target = 'newtab',
  ...props
}) => {
  const timeoutRef = React.useRef<any>();
  const [animationMode, setAnimationMode] = React.useState<'in' | 'out' | false>(false);

  const onMouseEnter = () => {
    if (animationMode !== false) return;
    clearTimeout(timeoutRef.current);
    setAnimationMode('in');
  };
  
  const onMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setAnimationMode('out');
    timeoutRef.current = setTimeout(() => {
      setAnimationMode(false);
    }, 600);
  };

  return (
    <Root {...props} animationMode={animationMode}>
      <CloudTooltip label={label} offset={15} openDelay={1500}>
        <a
          href={link}
          className="social-link"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          target={{
            newtab: '_blank',
            self: '_self',
          }[target]}
        >
          <Icon name={icon}>
            {label}
          </Icon>
        </a>
      </CloudTooltip>
    </Root>
  );
};

export default SocialLink;
