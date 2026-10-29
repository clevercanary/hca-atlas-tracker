import { ROUTE } from "@/app/routes/constants";
import { AlertIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AlertIcon/alertIcon";
import { SectionActions } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import {
  PRIORITY,
  StatusIcon,
} from "@databiosphere/findable-ui/lib/components/common/StatusIcon/statusIcon";
import {
  Error as ErrorContent,
  ErrorLayout,
  ErrorSection,
  SectionContent,
} from "@databiosphere/findable-ui/lib/components/Error/error.styles";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import { type JSX } from "react";

export const NotFoundView = (): JSX.Element => {
  return (
    <ErrorLayout>
      <ErrorContent>
        <ErrorSection>
          <StatusIcon priority={PRIORITY.HIGH} StatusIcon={AlertIcon} />
          <SectionContent>
            <Typography
              component="h1"
              variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XLARGE}
            >
              Page not found
            </Typography>
            <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_LARGE_400}>
              This page doesn&apos;t exist
            </Typography>
          </SectionContent>
          <SectionActions>
            <Button
              color={BUTTON_PROPS.COLOR.PRIMARY}
              component={Link}
              href={ROUTE.ATLASES}
              variant={BUTTON_PROPS.VARIANT.CONTAINED}
            >
              Go to Atlases
            </Button>
          </SectionActions>
        </ErrorSection>
      </ErrorContent>
    </ErrorLayout>
  );
};
