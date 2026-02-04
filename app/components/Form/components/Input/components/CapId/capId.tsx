import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { JSX, forwardRef, Fragment } from "react";
import { CAP_PROJECT_URL_REGEXP } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import {
  Input,
  InputProps,
} from "../../../../../common/Form/components/Input/input";
import { TypographyNoWrap } from "../../../../../common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { isNonEmptyString } from "../../../../common/utils";

export const CapId = forwardRef<HTMLInputElement, InputProps>(function CapId(
  {
    className,
    ...props /* Spread props to allow for Mui InputProps specific prop overrides and controller related props e.g. "field". */
  }: InputProps,
  ref,
): JSX.Element {
  const { label, value } = props;
  return (
    <Input
      {...props}
      className={className}
      label={
        <Fragment>
          <TypographyNoWrap>{label}</TypographyNoWrap>
          {isNonEmptyString(value) && CAP_PROJECT_URL_REGEXP.test(value) && (
            <Link label="Visit link" url={value} />
          )}
        </Fragment>
      }
      ref={ref}
    />
  );
});
