import { Grid } from "@clevercanary/data-explorer-ui/lib/components/common/Grid/grid";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import {
  TEXT_BODY_500,
  TEXT_BODY_SMALL_400,
} from "@clevercanary/data-explorer-ui/lib/theme/common/typography";
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
  // TODO sub-label color
  return (
    <Grid gridSx={{ gap: 1 }}>
      <Typography variant={TEXT_BODY_500}>
        <Link label={label} url={url} />
      </Typography>
      <Typography variant={TEXT_BODY_SMALL_400}>{subLabel}</Typography>
    </Grid>
  );
};
