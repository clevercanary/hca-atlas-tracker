import { ButtonProps } from "@clevercanary/data-explorer-ui/lib/components/common/Button/button";
import { forwardRef } from "react";
import { ButtonOutlineError as Button } from "./buttonOutlineError.styles";

export const ButtonOutlineError = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonOutlineError(
    {
      className,
      ...props /* Spread props to allow for Mui ButtonProps specific prop overrides e.g. "onClick". */
    }: ButtonProps,
    ref
  ): JSX.Element {
    return (
      <Button
        className={className}
        color="error"
        ref={ref}
        variant="outlined"
        {...props}
      />
    );
  }
);
