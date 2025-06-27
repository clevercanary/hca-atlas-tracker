import { ElementType, Fragment } from "react";
import { Divider } from "../../../Detail/components/TrackerForm/components/Divider/divider.styles";
import { Section } from "./components/Section/section";
import { Props } from "./entities";

export const EntityView = <C extends ElementType>({
  accessFallback,
  sectionConfigs,
}: Props<C>): JSX.Element => {
  if (accessFallback) return <Fragment>{accessFallback}</Fragment>;
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
