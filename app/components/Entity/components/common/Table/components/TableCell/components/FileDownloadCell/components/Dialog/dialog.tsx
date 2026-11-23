import { useRequestPreSignedURL } from "@/app/components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/hooks/UseRequestPreSignedURL/hook";
import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";
import { type JSX } from "react";
import { CodeSection } from "./components/DialogContent/components/Section/components/CodeSection/codeSection";
import { Section } from "./components/DialogContent/components/Section/section";
import { DIALOG_PROPS } from "./constants";
import { StyledDialog } from "./dialog.styles";
import { type Props } from "./entities";

export const Dialog = ({
  fileId,
  fileName = LABEL.UNSPECIFIED,
  onClose,
  open,
  sizeBytes = 0,
}: Props): JSX.Element => {
  const { data, isFetching } = useRequestPreSignedURL({ fileId, open });
  const { filename: downloadFileName } = data ?? {};
  // Gate the presigned URL on the fetch completing. On dialog reopen React Query
  // refetches (staleTime: 0) while the previous data.url is still populated, so
  // without this the Download button would briefly point at the prior URL. A
  // brief loading state is preferable for a security-sensitive, expiring URL.
  const url = isFetching ? undefined : data?.url;
  return (
    <StyledDialog {...DIALOG_PROPS} onClose={onClose} open={open}>
      <DialogTitle onClose={onClose} title="Download from HCA Atlas Tracker" />
      <DialogContent dividers>
        <Section title="Data Format">.h5ad</Section>
        <Section title="Download Details">
          <Stack spacing={1} useFlexGap>
            <span>FileName: {downloadFileName ?? fileName}</span>
            <span>FileSize: {formatFileSize(sizeBytes)}</span>
          </Stack>
        </Section>
        <CodeSection url={url} />
      </DialogContent>
      <DialogActions>
        {/* MUI only accepts `download` with a string `href`, so render a plain
            disabled button until there is a URL rather than an empty `href`. */}
        {url ? (
          <Button {...BUTTON_PRESETS.PRIMARY_CONTAINED} download href={url}>
            Download
          </Button>
        ) : (
          <Button {...BUTTON_PRESETS.PRIMARY_CONTAINED} disabled>
            Download
          </Button>
        )}
        <Button {...BUTTON_PRESETS.SECONDARY_OUTLINED} onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
