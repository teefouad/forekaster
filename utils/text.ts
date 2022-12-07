export const baseFontSize = 16;

/**
 * Converts a measurement value from pixels to rem
 * @param px Value in pixels
 * @param includeUnit Whether the returned value should include the unit or not
 * @returns Value in rem
 */
export const toRem = (px: number, includeUnit: boolean = true, precision: number = 5) => `${+(px / baseFontSize).toFixed(precision)}${includeUnit && 'rem'}`;
