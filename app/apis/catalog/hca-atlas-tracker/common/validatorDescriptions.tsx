import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { Link } from "@mui/material";
import { ReactNode } from "react";
import { FileValidatorName } from "./entities";

export const FILE_VALIDATOR_DESCRIPTIONS: Record<FileValidatorName, ReactNode> =
  {
    cap: "Validates the dataset/object has sufficient metadata to be uploaded to CAP for annotation.",
    cellxgene: "",
    hcaCellAnnotation: (
      <>
        Validates the dataset/object conforms to the HCA{" "}
        <Link
          color="inherit"
          href="https://data.humancellatlas.org/metadata/cell-annotation"
          rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
          target={ANCHOR_TARGET.BLANK}
        >
          Cell Annotation Metadata Schema
        </Link>
        .
      </>
    ),
    hcaSchema: (
      <>
        Validates the dataset/object conforms to the HCA{" "}
        <Link
          color="inherit"
          href="https://data.humancellatlas.org/metadata/tier-1"
          rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
          target={ANCHOR_TARGET.BLANK}
        >
          Tier-1 Metadata Schema
        </Link>
        .
      </>
    ),
  };
