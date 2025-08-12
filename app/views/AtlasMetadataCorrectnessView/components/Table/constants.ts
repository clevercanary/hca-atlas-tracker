export const TABLE_CONFIG = {
  get AVAILABLE_COLUMN_COUNT() {
    return this.COLUMN_COUNT - 1;
  },
  get AVAILABLE_WIDTH() {
    return this.TABLE_WIDTH - this.FIRST_COLUMN_WIDTH - this.COLUMN_GAPS;
  },
  COLUMN_COUNT: 10,
  get COLUMN_GAPS() {
    return this.AVAILABLE_COLUMN_COUNT * 1;
  },
  FIRST_COLUMN_WIDTH: 156,
  TABLE_WIDTH: 1230,
} as const;
