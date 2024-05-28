import { mediaTabletUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { smokeLightest } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import { ExploreView as DXExploreView } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import styled from "@emotion/styled";

interface Props {
  marginTop: number;
}

export const ExploreView = styled(DXExploreView)`
  .MuiTableContainer-root {
    .MuiTable-root {
      .MuiTableHead-root {
        .MuiTableRow-root {
          th {
            background-color: ${smokeLightest};
          }
        }
      }
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
