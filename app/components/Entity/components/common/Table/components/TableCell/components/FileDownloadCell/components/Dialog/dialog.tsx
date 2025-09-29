import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { Button, DialogActions, DialogContent } from "@mui/material";
import { useFetchDataState } from "../../../../../../../../../../../hooks/useFetchDataState";
import { FetchDataActionKind } from "../../../../../../../../../../../providers/fetchDataState/fetchDataState";
import { useRequestPreSignedURL } from "../../hooks/UseRequestPreSignedURL/hook";
import { Code } from "./components/DialogContent/components/Section/components/Code/code";
import { Section } from "./components/DialogContent/components/Section/section";
import { DIALOG_PROPS } from "./constants";
import { StyledDialog } from "./dialog.styles";
import { Props } from "./entities";

export const Dialog = ({
  fileId,
  onClose,
  open,
  sizeBytes = 0,
}: Props): JSX.Element => {
  const { fetchDataDispatch } = useFetchDataState();
  const { url } = useRequestPreSignedURL({ fileId });
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
          FileSize: {formatFileSize(sizeBytes)}
        </Section>
        <Code url={url} />
        {url && (
          <Section color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}>
            This presigned URL is valid for 48 hours.
          </Section>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          {...BUTTON_PROPS.PRIMARY_CONTAINED}
          disabled={!url}
          download
          href={url ?? ""}
        >
          Download
        </Button>
        <Button {...BUTTON_PROPS.SECONDARY_CONTAINED} onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
