import { DownloadIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/DownloadIcon/downloadIcon";
import { IconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { useCallback } from "react";
import { downloadFile } from "./utils";

export interface FileDownloadProps {
  disabled?: boolean;
  fileName: string;
  fileUrl?: string;
}

export const FileDownload = ({
  disabled,
  fileName,
  fileUrl,
}: FileDownloadProps): JSX.Element => {
  const onDownload = useCallback((): void => {
    downloadFile(fileName, fileUrl);
  }, [fileName, fileUrl]);

  return (
    <IconButton
      color="primary"
      disabled={disabled}
      Icon={DownloadIcon}
      onClick={onDownload}
      size="medium"
    />
  );
};
