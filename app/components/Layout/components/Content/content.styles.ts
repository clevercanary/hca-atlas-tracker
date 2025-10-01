import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import styled from "@emotion/styled";

interface Props {
  headerHeight: number;
}

export const Content = styled.div<Props>`
  a {
    color: inherit;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    &:hover {
      a {
        opacity: 1;
      }
    }
  }

  h1 {
    font: ${FONT.HEADING_LARGE};
    margin: 0 0 16px;
    scroll-margin-top: ${({ headerHeight }) => headerHeight + 24}px;
  }

  h2 {
    font: ${FONT.HEADING};
  }

  h3 {
    font: ${FONT.HEADING_SMALL};
  }

  h2,
  h3 {
    margin: 32px 0 16px;
    scroll-margin-top: ${({ headerHeight }) => headerHeight + 32}px;
  }

  li {
    margin: 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  p,
  ul {
    font: ${FONT.BODY_LARGE_400_2_LINES};
  }

  p {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin: 16px 0;
    padding-left: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
