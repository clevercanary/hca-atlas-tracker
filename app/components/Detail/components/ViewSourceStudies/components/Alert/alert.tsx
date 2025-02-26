import { AlertTitle } from "@mui/material";
import { StyledAlert } from "./alert.styles";
import { ALERT_PROPS } from "./constants";

export const Alert = (): JSX.Element => {
  return (
    <StyledAlert {...ALERT_PROPS}>
      <AlertTitle>What is a &quot;Source Study&quot;?</AlertTitle>
      <div>
        <p>
          A Source Study is a publication (or pre-publication) containing one or
          more datasets selected for Atlas integration. Source studies are
          ingested into CELLxGENE as a &quot;CELLxGENE collection&quot; and into
          the HCA Data Repository and CAP as &quot;projects.&quot; A dataset is
          an AnnData file with a cell-by-gene count matrix and metadata.
        </p>
        <p>
          Not all of the datasets in a source study are necessarily integrated
          into a given atlas. The &quot;Datasets Used&quot; column indicates how
          many of the source study’s datasets are used in this atlas.
        </p>
        <p>
          Select a source study and view its &quot;Datasets&quot; list to
          indicate which datasets are used in the atlas.
        </p>
      </div>
    </StyledAlert>
  );
};
