import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { RequestAccess as Section } from "../../../../../../components/Detail/components/TrackerForm/components/Section/components/RequestAccess/requestAccess";
import { ROUTE } from "../../../../../../routes/constants";

export const RequestAccess = (): JSX.Element => {
  return (
    <Section>
      <Link label="Sign in" url={ROUTE.LOGIN} /> to view the source datasets.
    </Section>
  );
};
