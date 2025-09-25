import { ComponentProps, ReactNode } from "react";
import { BackButton } from "./components/DetailViewHero/components/BackButton/backButton";

export interface Props extends ComponentProps<typeof BackButton> {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  mainColumn: ReactNode;
  status?: ReactNode;
  subTitle?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}
