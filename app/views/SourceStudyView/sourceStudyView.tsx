import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { getSourceStudyCitation } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "../../components/Detail/components/ViewSourceStudy/components/Actions/actions";
import { Tabs } from "../../components/Detail/components/ViewSourceStudy/components/Tabs/tabs";
import { ViewSourceStudy } from "../../components/Detail/components/ViewSourceStudy/viewSourceStudy";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import {
  mapPublicationStatus,
  useEditSourceStudyForm,
} from "./hooks/useEditSourceStudyForm";
import { useEditSourceStudyFormManager } from "./hooks/useEditSourceStudyFormManager";

interface SourceStudyViewProps {
  pathParameter: PathParameter;
}

export const SourceStudyView = ({
  pathParameter,
}: SourceStudyViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useEditSourceStudyForm(pathParameter);
  const formManager = useEditSourceStudyFormManager(pathParameter, formMethod);
  const {
    access: { canEdit, canView },
    formAction,
    formStatus: { isDirty },
    isLoading,
  } = formManager;
  const { data: sourceStudy } = formMethod;
  const { doi } = sourceStudy || {};
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceStudy))}
    >
      <DetailView
        actions={
          canEdit && <Actions isDirty={isDirty} pathParameter={pathParameter} />
        }
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas, sourceStudy)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewSourceStudy
            formManager={formManager}
            formMethod={formMethod}
            sdPublicationStatus={mapPublicationStatus(doi)}
          />
        }
        subTitle={getSourceStudyCitation(sourceStudy)}
        tabs={<Tabs pathParameter={pathParameter} />}
        title={sourceStudy?.title || "Source Study"}
      />
    </ConditionalComponent>
  );
};
