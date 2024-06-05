import { Divider } from "../../../TrackerForm/components/Divider/divider.styles";
import { RequestAccess as Section } from "../../../TrackerForm/components/Section/components/RequestAccess/requestAccess";

export const NoAccess = (): JSX.Element => {
  return (
    <Section divider={<Divider />}>
      You do not have access to this feature.
    </Section>
  );
};
