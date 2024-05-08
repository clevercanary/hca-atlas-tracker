import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Fragment } from "react";

export const RegistrationRequiredView = (): JSX.Element => {
  return (
    <Fragment>
      <h1>Registration Required</h1>
      <p>
        Please email{" "}
        <Link label="Ellen Todres" url="mailto:etodres@humancellatlas.org" /> to
        request access to the HCA Atlas Tracker Beta.
      </p>
    </Fragment>
  );
};
