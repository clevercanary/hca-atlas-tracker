import { Divider } from "@/app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { RequestAccess as Section } from "@/app/components/Detail/components/TrackerForm/components/Section/components/RequestAccess/requestAccess";
import { JSX } from "react";

export const NoAccess = (): JSX.Element => {
  return (
    <Section divider={<Divider />}>
      You do not have access to this feature.
    </Section>
  );
};
