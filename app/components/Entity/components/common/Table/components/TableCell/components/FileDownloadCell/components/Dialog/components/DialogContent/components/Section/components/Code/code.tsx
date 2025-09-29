import { LoadingIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/LoadingIcon/loadingIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { StyledCode } from "./code.styles";
import { Props } from "./entities";

export const Code = ({ url }: Props): JSX.Element => {
  if (!url)
    return (
      <LoadingIcon
        color={SVG_ICON_PROPS.COLOR.PRIMARY}
        fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
      />
    );

  return <StyledCode code={url} />;
};
