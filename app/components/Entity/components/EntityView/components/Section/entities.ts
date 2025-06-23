import { ComponentProps, ElementType } from "react";

export interface Props<C extends ElementType> {
  sectionConfig: SectionConfig<C>;
}

export interface SectionConfig<C extends ElementType = ElementType> {
  Component: C;
  componentProps: ComponentProps<C>;
  slotProps?: SlotProps;
}

export interface SlotProps {
  section: { fullWidth: boolean };
}
