import styled from "@emotion/styled";
import Link from "next/link";
import { buttonPrimary } from "../../button.styles";

export const Button = styled(Link)`
  ${buttonPrimary};

  :hover {
    text-decoration: none;
  }
`;
