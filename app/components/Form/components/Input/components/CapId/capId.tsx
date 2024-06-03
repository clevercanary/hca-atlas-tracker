import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { forwardRef, Fragment } from "react";
import {
  Input,
  InputProps,
} from "../../../../../common/Form/components/Input/input";
import { TypographyNoWrap } from "../../../../../common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { isNonEmptyString } from "../../../../common/utils";
import { CAP_ID_REGEXP } from "./common/constants";

export const CapId = forwardRef<HTMLInputElement, InputProps>(function CapId(
  {
    className,
    ...props /* Spread props to allow for Mui InputProps specific prop overrides and controller related props e.g. "field". */
  }: InputProps,
  ref
): JSX.Element {
  const { label, value } = props;
  return (
    <Input
      {...props}
      className={className}
      label={
        <Fragment>
          <TypographyNoWrap>{label}</TypographyNoWrap>
          {isNonEmptyString(value) && CAP_ID_REGEXP.test(value) && (
            <Link label="Visit link" url={value} />
          )}
        </Fragment>
      }
      ref={ref}
    />
  );
});
