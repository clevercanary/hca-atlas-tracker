import { StyledSnackbarContent } from "@/app/components/common/Snackbar/components/SnackbarStack/snackbarContent.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledSuccessContent = styled(StyledSnackbarContent)`
  background-color: ${PALETTE.SUCCESS_MAIN};
`;
