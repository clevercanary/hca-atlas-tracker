import { ElementType, ReactNode } from "react";
import { SectionConfig } from "./components/Section/entities";

export interface Props<C extends ElementType> {
  accessFallback: ReactNode;
  sectionConfigs: SectionConfig<C>[];
}
