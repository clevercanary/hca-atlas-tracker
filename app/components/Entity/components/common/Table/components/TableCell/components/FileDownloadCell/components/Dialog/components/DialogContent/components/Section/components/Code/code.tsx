import { LoadingIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/LoadingIcon/loadingIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { FETCH_PROGRESS } from "../../../../../../../../../../../../../../../../../hooks/useFetchData";
import { StyledCode } from "./code.styles";
import { Props } from "./entities";

export const Code = ({ data, progress }: Props): JSX.Element => {
  if (progress !== FETCH_PROGRESS.COMPLETED)
    return (
      <LoadingIcon
        color={SVG_ICON_PROPS.COLOR.PRIMARY}
        fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
      />
    );

  return (
    <StyledCode
      code={`https://tracker.data.humancellatlas.org/${data?.fileName}`}
    />
  );
};
