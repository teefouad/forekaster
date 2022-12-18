/**
 * RequestAnimationFrame helper
 * @param render Render function
 * @param delay  Delay value
 * @param continous  Whether the render function should be continously called
 * @returns Cancel function
 */
export const raf = (render: (stopFunction: () => void) => void, delay: number = 0, continous: boolean = true) => {
  const $raf = window.requestAnimationFrame;
  const $caf = window.cancelAnimationFrame;

  let timer = 0;

  let frame = $raf(function tick() {
    if (timer >= delay) {
      if (continous) {
        frame = $raf(tick);
      }

      render(() => $caf(frame));
    } else {
      timer += 1000 * 1 / 60;
      frame = $raf(tick);
    }
  });

  return () => $caf(frame);
}

/**
 * RequestAnimationFramesPerSecond helper
 * @param render Render function
 * @param timeout Timeout value
 * @returns Cancel function
 */
export const rafps = (render: () => void, fps: number = 60) => {
  const interval = 1000 / fps;

  render();

  let cancelFrame = raf(function tick() {
    render();
    cancelFrame = raf(tick, interval, false);
  }, interval, false);

  return cancelFrame;
};

/**
 * Easing functions
 */
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = (2 * Math.PI) / 3;

export const easingFunctions = {
  linear: (x: number) => x,
  easeInQuad: (x: number) => x ** 2,
  easeOutQuad: (x: number) => 1 - ((1 - x) ** 2),
  easeInOutQuad: (x: number) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2),
  easeInCubic: (x: number) => x ** 3,
  easeOutCubic: (x: number) => 1 - ((1 - x) ** 3),
  easeInOutCubic: (x: number) => (x < 0.5 ? 4 * (x ** 3) : 1 - ((-2 * x + 2) ** 3) / 2),
  easeOutElastic: (x: number) => {
    if (x === 0) return 0;
    return x === 1 ? 1 : (2 ** (-10 * x)) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
  easeInBack: (x: number) => c3 * (x ** 3) - c1 * x * x,
  easeOutBack: (x: number) => 1 + c3 * ((x - 1) ** 3) + c1 * ((x - 1) ** 2),
  easeInOutBack: (x: number) => (
    x < 0.5
      ? (((2 * x) ** 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (((2 * x - 2) ** 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
  ),
  easeOutBounce: (x: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) return n1 * x * x;

    if (x < 2 / d1) {
      x -= (1.5 / d1);
      return n1 * x * x + 0.75;
    }

    if (x < 2.5 / d1) {
      x -= (2.25 / d1);
      return n1 * x * x + 0.9375;
    }

    x -= (2.625 / d1);

    return n1 * x * x + 0.984375;
  },
};

/**
 * Animates a given property or set of properties on an object.
 * @param  {Object}   object    The target object
 * @param  {Object}   props     An object that represents the animation config
 * @param  {Object}   config    Animation config
 * @return {Promise}             A Promise that resolves when the animation finishes
 */
type AnimationConfig = {
  from: number,
  to: number,
  time: number,
  duration: number,
  delay: number,
  easing: keyof typeof easingFunctions,
  onChange: (args: any) => void,
  onFinish: (args: any) => void,
};

type AnimatableProps = {
  [prop: string]: Partial<AnimationConfig>,
};

export const animate = async <T extends { [prop: string]: any }>(object: T, props: AnimatableProps, commonConfig: Partial<AnimationConfig> = {}) => {
  const animateProp = (prop: string, config: Partial<AnimationConfig>, configIndex = 0) => new Promise<void>((resolve) => {
    const animation: AnimationConfig = {
      from: object[prop],
      to: object[prop],
      time: 0,
      duration: 1000,
      delay: 0,
      easing: 'easeInOutCubic',
      onChange: () => null,
      onFinish: () => null,
      ...(commonConfig || {}),
      ...(Array.isArray(config) ? config[configIndex] : config),
    };

    animation.time -= animation.delay;

    raf((stopAnimation) => {
      animation.time = Math.min(animation.time + 1000 / 60, animation.duration);

      const t = Math.max(0, animation.time) / animation.duration;
      const v = easingFunctions[animation.easing](t);

      (object as any)[prop] = animation.from + v * (animation.to - animation.from);

      const callbackArgs = {
        object,
        animation,
        value: object[prop],
      };

      if (animation.onChange) {
        animation.onChange(callbackArgs);
      }

      if (animation.time >= animation.duration) {
        stopAnimation();

        animation.time = animation.duration;
        
        (object as any)[prop] = animation.to;

        if (Array.isArray(config) && configIndex < config.length - 1) {
          animateProp(prop, config, configIndex + 1).then(() => {
            if (animation.onFinish) animation.onFinish(callbackArgs);
            resolve();
          });
        } else {
          if (animation.onFinish) animation.onFinish(callbackArgs);
          resolve();
        }
      }
    });
  });
  
  return await Promise.all(Object.keys(props).map(prop => animateProp(prop, props[prop])));
};
