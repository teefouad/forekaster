/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Root
 */
const Root = styled.span``;

/**
 * AnimatedNumber Component
 */
export interface AnimatedNumberProps {
  value: number,
  initialValue?: number,
  refreshInterval?: number,
  easing?: 'linear' | 'easeOut',
  useIntegers?: boolean,
  delay?: number,
}

export type AnimatedNumberCombinedProps = AnimatedNumberProps & JSX.IntrinsicElements['span'];

const AnimatedNumber: React.FC<AnimatedNumberCombinedProps> = ({
  value,
  initialValue,
  refreshInterval = 80,
  easing = 'linear',
  useIntegers = true,
  delay = 0,
  ...props
}) => {
  const [delayActive, setDelayActive] = React.useState(delay > 0);
  const [currentValue, setCurrentValue] = React.useState(initialValue ?? value);

  React.useEffect(() => {
    let timeout: any;

    if (delayActive) {
      timeout = setTimeout(() => {
        setDelayActive(false);
      }, delay);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, delayActive]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!delayActive) {
        if (Math.abs(value - currentValue) < 0.05) {
          clearInterval(interval);
          setCurrentValue(value);
        } else {
          setCurrentValue(v => v + (value - v) / (easing === 'linear' ? Math.abs(value - v) : 3));
        }
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, easing, delay, value, currentValue, delayActive]);

  return (
    <Root {...props}>
      {useIntegers ? Math.floor(currentValue) : currentValue.toFixed(2)}
    </Root>
  );
};

export default AnimatedNumber;
