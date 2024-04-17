import { ThemeProps } from "@clevercanary/data-explorer-ui/lib/theme/theme";
import { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import {
  buttonPrimary,
  buttonSecondary,
  buttonSecondaryOutlined,
} from "../../button.styles";
import { BUTTON_COLOR, BUTTON_VARIANT } from "./buttonLink";

interface Props {
  color?: BUTTON_COLOR;
  variant?: BUTTON_VARIANT;
}

export const Button = styled(Link, {
  shouldForwardProp: (props) => props !== "color" && props !== "variant",
})<Props>`
  ${getButtonStyles};

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
function getButtonStyles(props: Props & ThemeProps): SerializedStyles {
  if (props.color === BUTTON_COLOR.SECONDARY) {
    if (props.variant === BUTTON_VARIANT.OUTLINED) {
      return buttonSecondaryOutlined(props);
    }
    return buttonSecondary(props);
  }
  return buttonPrimary(props);
}
