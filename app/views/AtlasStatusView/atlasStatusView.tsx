import { getAtlasName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type PathParameter } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { Tabs } from "@/app/components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { AtlasStatuses } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { useBackPath } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { ROUTE } from "@/app/routes/constants";
import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { useRouter } from "next/router";
import { type JSX, useCallback } from "react";
import { getBreadcrumbs } from "./common/utils";
import { CurationReport } from "./components/CurationReport/curationReport";
import HEART_V1_REPORT from "./components/CurationReport/fixtures/heartV1.json";
import { type CurationReport as CurationReportData } from "./components/CurationReport/types";

// Prototype: every atlas shows the Heart v1 evaluation until an evaluation API
// exists. JSON imports infer a union per file that no named type matches, so
// the fixture is asserted through unknown; the API will parse at its boundary.
const REPORT = HEART_V1_REPORT as unknown as CurationReportData;

interface AtlasStatusViewProps {
  pathParameter: PathParameter;
}

export const AtlasStatusView = ({
  pathParameter,
}: AtlasStatusViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { asPath, query } = useRouter();
  const fileStem = typeof query.file === "string" ? query.file : undefined;
  const getFileHref = useCallback(
    (stem?: string): string => {
      const path = asPath.split("?")[0];
      return stem ? `${path}?file=${encodeURIComponent(stem)}` : path;
    },
    [asPath],
  );
  // Status is the atlas landing page, so its back arrow returns to the
  // atlases list (honoring an explicit `from` origin when one is provided).
  const backPath = useBackPath(pathParameter) ?? getRouteURL(ROUTE.ATLASES);

  return (
    <ConditionalComponent isIn={Boolean(atlas)}>
      <DetailView
        backPath={backPath}
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <CurationReport
            fileStem={fileStem}
            getFileHref={getFileHref}
            report={REPORT}
          />
        }
        status={atlas && <AtlasStatuses statuses={atlas} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Status"}
      />
    </ConditionalComponent>
  );
};
