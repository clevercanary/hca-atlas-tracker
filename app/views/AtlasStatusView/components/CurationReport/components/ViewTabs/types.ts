export interface ViewOption<T extends string> {
  count: number;
  label: string;
  value: T;
}

export interface Props<T extends string> {
  onChange: (value: T) => void;
  options: ViewOption<T>[];
  value: T;
}
