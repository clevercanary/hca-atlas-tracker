import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { Props } from "./entities";

export const Section = ({ children, title, ...props }: Props): JSX.Element => {
  return (
    <Stack spacing={1} useFlexGap>
      {title && (
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_LARGE_500}>
          {title}
        </Typography>
      )}
      <Typography
        component="div"
        gutterBottom={false}
        variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_400_2_LINES}
        {...props}
      >
        {children}
      </Typography>
    </Stack>
  );
};
