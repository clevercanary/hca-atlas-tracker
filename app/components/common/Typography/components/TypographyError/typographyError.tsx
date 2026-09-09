import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { type TypographyProps } from "@mui/material";
import { type JSX } from "react";
import { StyledTypography } from "./typographyError.styles";

/**
 * An error rendered beside the control that raised it, for the dialogs where
 * the app-level stack can't be read (see `ErrorSnackbar`). `useInlineRequest`
 * supplies the message.
 *
 * The region is mounted whether or not there is a message. A `role="alert"`
 * inserted into the DOM together with its text is announced unreliably —
 * screen readers commonly miss an element that appears already populated —
 * whereas text swapped into a region already in the accessibility tree is
 * announced consistently. That is also why the empty region stays rendered
 * rather than hidden: `display: none` would take it back out of the tree and
 * reintroduce the same problem.
 * @param props - Component props.
 * @param props.children - The content to be displayed as the error message.
 * @returns the error region.
 */
export function TypographyError({
  children,
  ...props
}: TypographyProps): JSX.Element {
  return (
    <StyledTypography
      {...props}
      color={TYPOGRAPHY_PROPS.COLOR.ERROR}
      role="alert"
    >
      {children}
    </StyledTypography>
  );
}
