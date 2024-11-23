import { mediaDesktopSmallUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { InputController } from "../../../../../common/Form/components/Controllers/components/InputController/inputController";
import {
  SectionCard,
  SectionProps,
} from "../../../../../Detail/components/TrackerForm/components/Section/section.styles";

interface IntegrationLeadSectionCardProps extends SectionProps {
  multiLead: boolean;
}

export const IntegrationLeadSectionCard = styled(
  SectionCard
)<IntegrationLeadSectionCardProps>`
  grid-template-columns: ${(props) => (props.multiLead ? "1fr auto" : "1fr")};

  ${mediaDesktopSmallUp} {
    grid-template-columns: ${(props) =>
      props.multiLead ? "1fr 1fr auto" : "1fr 1fr"};
  }
`;

export const LeadControllers = styled.div`
  grid-column: 1 / -1;
  display: grid;
  gap: inherit;
  grid-template-columns: subgrid;
`;

export const RemoveLeadCell = styled.div`
  grid-row: 1;
  grid-column: 2;

  padding-top: 24px;

  ${mediaDesktopSmallUp} {
    grid-row: auto;
    grid-column: auto;
  }

  /* TODO better way to do this? */
  .MuiIconButton-root {
    width: 40px;
    height: 40px;
  }
`;

export const NameInputController = styled(InputController)`
  grid-column: 1;

  ${mediaDesktopSmallUp} {
    grid-column: auto;
  }
` as typeof InputController;

export const AddLeadRow = styled.div`
  grid-column: 1 -1;
`;
