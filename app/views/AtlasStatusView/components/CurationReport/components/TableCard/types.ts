import { type ReactNode } from "react";

export interface Props {
  children: ReactNode;
  filterTags?: ReactNode;
  toolbar: ReactNode;
}
