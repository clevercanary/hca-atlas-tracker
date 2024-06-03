export type NonEmpty<T = string> = T extends "" ? never : T;
