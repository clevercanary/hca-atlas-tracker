import { getSourceStudyCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "@/app/components/Detail/components/ViewSourceStudy/components/Actions/actions";
import { Tabs } from "@/app/components/Detail/components/ViewSourceStudy/components/Tabs/tabs";
import { StyledDetailView } from "@/app/components/Layout/components/Detail/sticky/detailView.styles";
import { useFetchAtlas } from "@/app/hooks/useFetchAtlas";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { useFetchSourceStudy } from "../SourceStudyView/hooks/useFetchSourceStudy";
import { getBreadcrumbs } from "./common/utils";
import { ViewSourceDatasets } from "./components/ViewSourceDatasets/viewSourceDatasets";
import { useFetchSourceDatasets } from "./hooks/useFetchSourceDatasets";

interface SourceDatasetsViewProps {
  pathParameter: PathParameter;
}

export const SourceDatasetsView = ({
  pathParameter,
}: SourceDatasetsViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { sourceStudy } = useFetchSourceStudy(pathParameter);
  const { sourceDatasets } = useFetchSourceDatasets(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canEdit },
  } = formManager;
  return (
    <EntityProvider data={{ sourceDatasets }} pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={Boolean(atlas && sourceStudy && sourceDatasets)}
      >
        <StyledDetailView
          actions={canEdit && <Actions pathParameter={pathParameter} />}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={<ViewSourceDatasets />}
          subTitle={getSourceStudyCitation(sourceStudy)}
          tabs={
            <Tabs pathParameter={pathParameter} sourceStudy={sourceStudy} />
          }
          title={sourceStudy?.title || "Source Study"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
