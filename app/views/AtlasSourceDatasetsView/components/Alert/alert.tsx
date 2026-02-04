import { JSX } from "react";
import { AlertTitle } from "@mui/material";
import { StyledAlert } from "./alert.styles";
import { ALERT_PROPS } from "./constants";

export const Alert = (): JSX.Element => {
  return (
    <StyledAlert {...ALERT_PROPS}>
      <AlertTitle>What is a &quot;Source Dataset&quot;?</AlertTitle>
      <div>
        <p>
          A source dataset is a dataset (AnnData file) from a Source Study that
          has been selected for integration into the atlas and uploaded into the
          Tracker.
        </p>
      </div>
    </StyledAlert>
  );
};
