import { JSX } from "react";
import { AlertTitle } from "@mui/material";
import { StyledAlert } from "./alert.styles";
import { ALERT_PROPS } from "./constants";

export const Alert = (): JSX.Element => {
  return (
    <StyledAlert {...ALERT_PROPS}>
      <AlertTitle>What is a &quot;Source Study&quot;?</AlertTitle>
      <div>
        <p>
          A Source Study is a publication, pre-publication, or unpublished study
          that contains one or more datasets selected for integration into the
          Atlas. Published or preprint studies are identified by their DOI.
          Given a DOI, the system queries CrossRef to retrieve basic study
          metadata, including authorship information. Unpublished source studies
          are identified by the author&apos;s name.
        </p>
      </div>
    </StyledAlert>
  );
};
