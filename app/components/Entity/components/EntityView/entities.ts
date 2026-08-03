import { type ElementType } from "react";
import { type SectionConfig } from "./components/Section/entities";

export interface Props<C extends ElementType> {
  sectionConfigs: SectionConfig<C>[];
}
