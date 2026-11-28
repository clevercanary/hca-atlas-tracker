import {
  FILE_KIND_LABEL,
  FILE_KINDS,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  filterByKind,
  getFileUrl,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Typography } from "@mui/material";
import { type JSX } from "react";
import { StyledFileLink, StyledFileList } from "./fileList.styles";
import { type Props } from "./types";

export const FileList = ({ files, statusUrl }: Props): JSX.Element => {
  return (
    <StyledFileList>
      {FILE_KINDS.map((kind) =>
        filterByKind(files, kind).map((file) => (
          <li key={file.fileStem}>
            <StyledFileLink href={getFileUrl(statusUrl, file.fileStem)}>
              <Typography
                color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
              >
                {file.displayName}
              </Typography>
              <Typography
                color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
                variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
              >
                {FILE_KIND_LABEL[kind]}
              </Typography>
              <ChevronRightRoundedIcon
                fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
              />
            </StyledFileLink>
          </li>
        )),
      )}
    </StyledFileList>
  );
};
