import { type BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { type ComponentProps, type ReactNode } from "react";
import { type BackButton } from "./components/DetailViewHero/components/BackButton/backButton";

export interface Props
  extends ComponentProps<typeof BackButton>, BaseComponentProps {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  mainColumn: ReactNode;
  status?: ReactNode;
  subTitle?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}
