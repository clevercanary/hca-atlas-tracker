import { SectionTitle } from "@databiosphere/findable-ui/lib/components/common/Section/components/SectionTitle/sectionTitle";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { JSX } from "react";
import { SectionPaper } from "./vewAtlasMetadataCorrectness.styles";

interface ViewAtlasMetadataCorrectness {
  atlas?: HCAAtlasTrackerAtlas;
}

export const ViewAtlasMetadataCorrectness = ({
  atlas,
}: ViewAtlasMetadataCorrectness): JSX.Element => {
  return (
    <SectionPaper elevation={0}>
      <SectionTitle title="Metadata Correctness Report" />
      <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}>
        {atlas?.metadataCorrectnessUrl ? (
          <Link url={atlas.metadataCorrectnessUrl} label="View Report" />
        ) : (
          "The metadata correctness report is unavailable for this atlas."
        )}
      </Typography>
    </SectionPaper>
  );
};
