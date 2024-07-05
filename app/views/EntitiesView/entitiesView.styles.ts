import {
  mediaTabletDown,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { ExploreView as DXExploreView } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import styled from "@emotion/styled";
import { tableStyles } from "../../components/Table/table.styles";

interface Props {
  marginTop: number;
}

export const ExploreView = styled(DXExploreView)`
  & .MuiToolbar-table {
    padding: 16px;

    .MuiButton-containedSecondary {
      padding-bottom: 8px;
      padding-top: 8px;
    }
  }

  & .MuiTableContainer-root {
    ${tableStyles};
  }

  ${mediaTabletDown} {
    .MuiPaper-table {
      min-height: 64px;
    }
  }
`;

export const IndexView = styled.div<Props>`
  display: flex;
  flex: 1;
  margin-top: ${({ marginTop }) => marginTop}px;
`;

export const IndexLayout = styled.div`
  display: grid;
  flex: 1;
  gap: 24px 16px;
  grid-template-columns: 1fr;
  margin: 0 auto;
  max-width: min(calc(100% - 32px), 1232px);
  padding: 24px 0;
  width: 100%;
`;

export const IndexViewContent = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 24px 0;
  grid-template-columns: 1fr;
  margin-left: -16px;
  margin-right: -16px;

  ${mediaTabletUp} {
    margin: 0;
  }
`;
