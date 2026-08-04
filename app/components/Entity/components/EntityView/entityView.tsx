import { Divider } from "@/app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { type ElementType, Fragment, type JSX } from "react";
import { Section } from "./components/Section/section";
import { type Props } from "./entities";

export const EntityView = <C extends ElementType>({
  sectionConfigs,
}: Props<C>): JSX.Element => {
  return (
    <Fragment>
      {sectionConfigs.map((sectionConfig, i) => (
        <Fragment key={i}>
          {sectionConfig.showDivider && <Divider />}
          <Section sectionConfig={sectionConfig} />
        </Fragment>
      ))}
    </Fragment>
  );
};
