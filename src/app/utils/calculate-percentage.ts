export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 100 * 100) / 100;
};
