import { Grid } from "@databiosphere/findable-ui/lib/components/common/Grid/grid";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";

interface AtlasCellProps {
  label: string;
  subLabel: string;
  url: string;
}

export const AtlasCell = ({
  label,
  subLabel,
  url,
}: AtlasCellProps): JSX.Element => {
  return (
    <Grid gridSx={{ gap: 1 }}>
      <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}>
        <Link label={label} url={url} />
      </Typography>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
      >
        {subLabel}
      </Typography>
    </Grid>
  );
};
