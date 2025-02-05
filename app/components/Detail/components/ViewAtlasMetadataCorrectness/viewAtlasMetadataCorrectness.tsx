import { SectionTitle } from "@databiosphere/findable-ui/lib/components/common/Section/components/SectionTitle/sectionTitle";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TEXT_BODY_400 } from "@databiosphere/findable-ui/lib/theme/common/typography";
import { Typography } from "@mui/material";
import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { SectionPaper } from "./vewAtlasMetadataCorrectness.styles";

interface ViewAtlasMetadataCorrectness {
  atlas?: HCAAtlasTrackerAtlas;
  formManager: FormManager;
}

export const ViewAtlasMetadataCorrectness = ({
  atlas,
  formManager,
}: ViewAtlasMetadataCorrectness): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <SectionPaper>
      <SectionTitle title="Metadata Correctness Report" />
      <Typography variant={TEXT_BODY_400}>
        {atlas?.metadataCorrectnessUrl ? (
          <Link url={atlas.metadataCorrectnessUrl} label="View Report" />
        ) : (
          "The metadata correctness report is unavailable for this atlas."
        )}
      </Typography>
    </SectionPaper>
  );
};
