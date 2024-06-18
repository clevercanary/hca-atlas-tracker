import { ButtonProps } from "@databiosphere/findable-ui/lib/components/common/Button/button";
import { Button } from "./iconButtonSecondary.styles";

export const IconButtonSecondary = ({
  children,
  ...props /* Spread props to allow for Mui ButtonProps specific prop overrides e.g. "onClick". */
}: ButtonProps): JSX.Element => {
  return (
    <Button color="secondary" variant="contained" {...props}>
      {children}
    </Button>
  );
};
