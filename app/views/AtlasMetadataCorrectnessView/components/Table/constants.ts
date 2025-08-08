export const TABLE_CONFIG = {
  COLUMN_COUNT: 10,
  FIRST_COLUMN_WIDTH: 156,
  TABLE_WIDTH: 1230,
  get AVAILABLE_COLUMN_COUNT() {
    return this.COLUMN_COUNT - 1;
  },
  get AVAILABLE_WIDTH() {
    return this.TABLE_WIDTH - this.FIRST_COLUMN_WIDTH - this.COLUMN_GAPS;
  },
  get COLUMN_GAPS() {
    return this.AVAILABLE_COLUMN_COUNT * 1;
  },
} as const;
