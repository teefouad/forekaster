export const ease = 'cubic-bezier(1, 0, 0, 1)';
export const easeIn = 'cubic-bezier(1, 0, 1, 1)';
export const easeOut = 'cubic-bezier(0, 0, 0, 1)';
export const soft = 'cubic-bezier(0.72, 0, 0, 1.02)';
export const softIn = 'cubic-bezier(0.77, 0, 0.94, 0.82)';
export const softOut = 'cubic-bezier(0, 0.22, 0.24, 1)';
export const snap = 'cubic-bezier(0.97, 0.07, 0.19, 0.71)';
export const softSnap = 'cubic-bezier(0.66, 0.22, 0.32, 0.73)';
export const swiftSnap = 'cubic-bezier(0.82, 0.03, 0.14, 1.03)';
export const back = 'cubic-bezier(0, 0.5, 0, 2)';
export const softBack = 'cubic-bezier(0.51, 0.01, 0.24, 1.24)';
export const swiftBack = 'cubic-bezier(0.82, 0.03, 0.15, 1.53)';
export const overshootBack = 'cubic-bezier(0.42, 0, 0, 3)';
export const easyBack = 'cubic-bezier(0.1, 0.49, 0.51, 1.66)';
export const easyBack2 = 'cubic-bezier(0.21, 0.66, 0.33, 1.41)';

export const scaleEasing = (easing: string, scale = 1) => `cubic-bezier(${easing.replace(/[^,.\d]/g, '').split(',').map((v, n) => +v * (n%2 === 0 ? 1 : scale)).join(', ')})`;
