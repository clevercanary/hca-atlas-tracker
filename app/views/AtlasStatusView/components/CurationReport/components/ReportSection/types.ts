import { type ReactNode } from "react";

export interface Props {
  children: ReactNode;
  description?: string;
  subtitle?: string;
  title: string;
}
