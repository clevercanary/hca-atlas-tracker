import { FluidPaper } from "@clevercanary/data-explorer-ui/lib/components/common/Paper/paper.styles";
import { smokeLight } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import {
  textBody4002Lines,
  textBodyLarge500,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/fonts";
import { TABLET } from "@clevercanary/data-explorer-ui/lib/theme/common/breakpoints";
import styled from "@emotion/styled";

export const Description = styled(FluidPaper)`
  ${({ theme }) => theme.breakpoints.up(TABLET)} {
    grid-column: 1 / 9;
    place-self: stretch;
  }
`;

export const SectionText = styled.div`
  code {
    background-color: ${smokeLight};
    font-size: inherit;
  }

  h3 {
    ${textBodyLarge500};
    margin: 16px 0 8px;
  }

  p {
    ${textBody4002Lines};
    margin-bottom: 8px;
  }

  *:last-child {
    margin-bottom: 0;
  }
`;
