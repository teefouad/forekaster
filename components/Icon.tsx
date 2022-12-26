/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import classnames from 'classnames';

/**
 * Root
 */
const Root = styled.span`
  font-size: 0;
  color: transparent;

  &:before {
    font-size: initial;
    color: initial;
  }
`;

/**
 * Icon Component
 */
export interface IconProps {
  name: IconName,
}

export type IconName = 'github' | 'linkedin' | 'lab';

export type IconCombinedProps = IconProps & JSX.IntrinsicElements['span'];

const Icon: React.FC<IconCombinedProps> = ({
  name,
  children,
  ...props
}) => {
  return (
    <Root {...props} className={classnames('wb-icon', `wb-icon-${name}`, props.className)}>
      {children}
    </Root>
  );
};

export default Icon;
