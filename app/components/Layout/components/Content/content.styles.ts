import {
  textBodyLarge4002Lines,
  textHeading,
  textHeadingLarge,
  textHeadingSmall,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/fonts";
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
    ${textHeadingLarge};
    margin: 0 0 16px;
    scroll-margin-top: ${({ headerHeight }) => headerHeight + 24}px;
  }

  h2 {
    ${textHeading};
  }

  h3 {
    ${textHeadingSmall};
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
    ${textBodyLarge4002Lines};
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
