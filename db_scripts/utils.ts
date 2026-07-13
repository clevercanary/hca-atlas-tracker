/**
 * Get a boolean that is randomly true according the given probability, to be used to generate data for manual testing.
 * @param probability - Probability (0 to 1) to check against.
 * @returns boolean to use for test data, corresponding to the provided probability.
 */
export function randomTestProbabilityPasses(probability: number): boolean {
  // eslint-disable-next-line sonarjs/pseudo-random -- Used only for persistent test data.
  return Math.random() < probability;
}

/**
 * Get a random integer in the given range, to be used to generate data for manual testing.
 * @param min - Inclusive minimum value.
 * @param max - Inclusive maximum value.
 * @returns random integer for test data.
 */
export function randomTestValueInRange(min: number, max: number): number {
  // eslint-disable-next-line sonarjs/pseudo-random -- Used only for persistent test data.
  return min + Math.floor(Math.random() * (max - min + 1));
}
