import { StaticImageProps } from "@databiosphere/findable-ui/lib/components/common/StaticImage/staticImage";
import { Fragment } from "react";
import { IconLink } from "../../../../../common/IconLink/iconLink";

export interface AnalysisPortal {
  icon: StaticImageProps["src"];
  label: string;
  name: string;
  url: string;
}

interface AnalysisPortalCellProps {
  analysisPortals: AnalysisPortal[];
}

export const AnalysisPortalCell = ({
  analysisPortals,
}: AnalysisPortalCellProps): JSX.Element => {
  return (
    <Fragment>
      {analysisPortals.map((analysisPortal, i) => (
        <IconLink key={i} height={18} {...analysisPortal} />
      ))}
    </Fragment>
  );
};
