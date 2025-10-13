import { LoadingIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/LoadingIcon/loadingIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { Section } from "../../section";
import { StyledCode } from "./codeSection.styles";
import { Props } from "./entities";

export const CodeSection = ({ url }: Props): JSX.Element => {
  if (!url)
    return (
      <LoadingIcon
        color={SVG_ICON_PROPS.COLOR.PRIMARY}
        fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
      />
    );

  return (
    <>
      <Stack gap={2} useFlexGap>
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_LARGE_500}>
          Presigned URL
        </Typography>
        <StyledCode code={url} />
      </Stack>
      <Section color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}>
        This presigned URL is valid for 48 hours.
      </Section>
    </>
  );
};
