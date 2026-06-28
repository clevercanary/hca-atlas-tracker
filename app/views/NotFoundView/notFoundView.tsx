import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
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
import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import Link from "next/link";
import { JSX } from "react";
import { ROUTE } from "../../routes/constants";

export const NotFoundView = (): JSX.Element => {
  const { dimensions } = useLayoutDimensions();
  return (
    <ErrorLayout offset={dimensions.header.height}>
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
            <ButtonPrimary component={Link} href={ROUTE.ATLASES}>
              Go to Atlases
            </ButtonPrimary>
          </SectionActions>
        </ErrorSection>
      </ErrorContent>
    </ErrorLayout>
  );
};
