import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { Button, DialogActions, DialogContent } from "@mui/material";
import { useFetchDataState } from "../../../../../../../../../../../hooks/useFetchDataState";
import { FetchDataActionKind } from "../../../../../../../../../../../providers/fetchDataState/fetchDataState";
import { useRequestPreSignedURL } from "../../hooks/useRequestPreSignedURL";
import { Code } from "./components/DialogContent/components/Section/components/Code/code";
import { Section } from "./components/DialogContent/components/Section/section";
import { DIALOG_PROPS } from "./constants";
import { StyledDialog } from "./dialog.styles";
import { Props } from "./entities";

export const Dialog = ({ onClose, open }: Props): JSX.Element => {
  const { fetchDataDispatch } = useFetchDataState();
  const { data, progress } = useRequestPreSignedURL();
  return (
    <StyledDialog
      {...DIALOG_PROPS}
      onClose={onClose}
      open={open}
      onTransitionEnter={() =>
        fetchDataDispatch({
          payload: undefined,
          type: FetchDataActionKind.FetchData,
        })
      }
    >
      <DialogTitle onClose={onClose} title="Download from HCA Atlas Tracker" />
      <DialogContent dividers>
        <Section title="Data Format">.h5ad</Section>
        <Section title="Download details">
          FileSize: {formatFileSize(data?.sizeBytes || 0)}
        </Section>
        <Code data={data} progress={progress} />
      </DialogContent>
      <DialogActions>
        <Button {...BUTTON_PROPS.SECONDARY_CONTAINED} onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
