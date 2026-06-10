import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { JSX } from "react";
import { Props } from "./entities";
import { StyledLoginView, StyledSection, StyledStack } from "./homeView.styles";

export const HomeView = ({ providers }: Props): JSX.Element => {
  return (
    <StyledSection>
      <StyledLoginView providers={providers} />
      <StyledStack spacing={2} useFlexGap>
        <Typography component="h1">HCA Atlas Tracker</Typography>
        <Typography component="h2">Atlas Ingest and Validation</Typography>
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_LARGE_400}>
          Community generated, multi-omic, open data
        </Typography>
      </StyledStack>
    </StyledSection>
  );
};
