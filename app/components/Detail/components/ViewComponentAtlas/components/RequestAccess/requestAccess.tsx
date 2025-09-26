import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { ROUTE } from "../../../../../../routes/constants";
import { RequestAccess as Section } from "../../../TrackerForm/components/Section/components/RequestAccess/requestAccess";

export const RequestAccess = (): JSX.Element => {
  return (
    <Section>
      <Link label="Sign in" url={ROUTE.LOGIN} /> to view the integrated object.
    </Section>
  );
};
