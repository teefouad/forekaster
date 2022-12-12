/**
 * RequestAnimationFrame helper
 * @param render Render function
 * @param delay  Delay value
 * @param continous  Whether the render function should be continously called
 * @returns Cancel function
 */
export const raf = (render: () => void, delay: number = 0, continous: boolean = true) => {
  const $raf = window.requestAnimationFrame;
  const $caf = window.cancelAnimationFrame;

  let timer = 0;

  let frame = $raf(function tick() {
    if (timer >= delay) {
      render();
      if (continous) {
        frame = $raf(tick);
      }
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
