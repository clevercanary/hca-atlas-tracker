import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getSourceStudyCitation } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ViewSourceDatasets } from "../../components/Detail/components/ViewSourceDatasets/viewSourceDatasets";
import { Actions } from "../../components/Detail/components/ViewSourceStudy/components/Actions/actions";
import { Tabs } from "../../components/Detail/components/ViewSourceStudy/components/Tabs/tabs";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { useFetchSourceStudy } from "../SourceStudyView/hooks/useFetchSourceStudy";
import { getBreadcrumbs } from "./common/utils";
import { useFetchSourceDatasets } from "./hooks/useFetchSourceDatasets";
import { StyledDetailView } from "./sourceDatasetsView.styles";

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
    access: { canEdit, canView },
  } = formManager;
  return (
    <EntityProvider pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={shouldRenderView(
          canView,
          Boolean(atlas && sourceStudy && sourceDatasets),
        )}
      >
        <StyledDetailView
          actions={canEdit && <Actions pathParameter={pathParameter} />}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <ViewSourceDatasets
              formManager={formManager}
              sourceDatasets={sourceDatasets}
            />
          }
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
