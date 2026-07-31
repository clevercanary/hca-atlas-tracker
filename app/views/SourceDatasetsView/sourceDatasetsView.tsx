import { getSourceStudyCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "@/app/components/Detail/components/ViewSourceStudy/components/Actions/actions";
import { Tabs } from "@/app/components/Detail/components/ViewSourceStudy/components/Tabs/tabs";
import { StyledDetailView } from "@/app/components/Layout/components/Detail/sticky/detailView.styles";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { useFetchSourceStudy } from "@/app/views/SourceStudyView/hooks/UseFetchSourceStudy/hook";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getBreadcrumbs } from "./common/utils";
import { ViewSourceDatasets } from "./components/ViewSourceDatasets/viewSourceDatasets";
import { useFetchSourceDatasets } from "./hooks/UseFetchSourceDatasets/hook";

interface SourceDatasetsViewProps {
  pathParameter: PathParameter;
}

export const SourceDatasetsView = ({
  pathParameter,
}: SourceDatasetsViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { data: sourceStudy } = useFetchSourceStudy(pathParameter);
  const { data: sourceDatasets } = useFetchSourceDatasets(pathParameter);
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
