import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { ROUTE } from "../../../../../../routes/constants";
import { Divider } from "../../../TrackerForm/components/Divider/divider.styles";
import { RequestAccess as Section } from "../../../TrackerForm/components/Section/components/RequestAccess/requestAccess";

export const RequestAccess = (): JSX.Element => {
  return (
    <Section divider={<Divider />}>
      <Link label="Sign in" url={ROUTE.LOGIN} /> to add a new component atlas.
    </Section>
  );
};
