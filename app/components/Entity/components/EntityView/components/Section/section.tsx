import { ElementType } from "react";
import { Props } from "./entities";
import { StyledSection } from "./section.styles";

export const Section = <C extends ElementType>({
  sectionConfig,
}: Props<C>): JSX.Element => {
  const { Component, componentProps, slotProps } = sectionConfig;
  const { section: { fullWidth = false } = {} } = slotProps || {};
  return (
    <StyledSection fullWidth={fullWidth}>
      <Component {...componentProps} />
    </StyledSection>
  );
};
