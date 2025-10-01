import { css, SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "../../button.styles";
import { BUTTON_COLOR } from "./buttonLink";

interface Props {
  color?: BUTTON_COLOR;
  disabled: boolean;
}

export const StyledLink = styled(Link, {
  shouldForwardProp: (props) => props !== "color" && props !== "disabled",
})<Props>`
  ${getButtonStyles};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `};

  :hover {
    text-decoration: none;
  }
`;

export const StartIcon = styled.span`
  display: flex;
  margin-left: -4px;
`;

/**
 * Returns serialized styles for the given button color.
 * @param props - Button props.
 * @returns serialized styles.
 */
function getButtonStyles(props: Props): SerializedStyles {
  if (props.color === BUTTON_COLOR.SECONDARY) {
    return buttonSecondary;
  }
  return buttonPrimary;
}
