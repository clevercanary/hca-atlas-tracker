import { ElementType } from "react";
import { SectionConfig } from "./components/Section/entities";

export interface Props<C extends ElementType> {
  sectionConfigs: SectionConfig<C>[];
}
