import { type ReactNode } from "react";

export interface Props {
  children: ReactNode;
  count: number;
  empty?: ReactNode;
  onClick: () => void;
}
