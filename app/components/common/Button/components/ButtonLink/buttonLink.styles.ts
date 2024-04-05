import { ThemeProps } from "@clevercanary/data-explorer-ui/lib/theme/theme";
import { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "../../button.styles";
import { BUTTON_COLOR } from "./buttonLink";

interface Props {
  color?: BUTTON_COLOR;
}

export const Button = styled(Link, {
  shouldForwardProp: (props) => props !== "color",
})<Props>`
  ${getButtonStyles};

  :hover {
    text-decoration: none;
  }
`;

/**
 * Returns serialized styles for the given button color.
 * @param props - Button props.
 * @returns serialized styles.
 */
function getButtonStyles(props: Props & ThemeProps): SerializedStyles {
  if (props.color === BUTTON_COLOR.SECONDARY) {
    return buttonSecondary(props);
  }
  return buttonPrimary(props);
}
