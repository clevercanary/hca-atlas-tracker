import { type ComponentProps, type ReactNode } from "react";
import { type BackButton } from "./components/BackButton/backButton";

export interface Props extends ComponentProps<typeof BackButton> {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  pinned?: boolean;
  status?: ReactNode;
  subTitle?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}
