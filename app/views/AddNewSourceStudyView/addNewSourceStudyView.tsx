import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { AddSourceStudy } from "../../components/Detail/components/AddSourceStudy/addSourceStudy";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useAddSourceStudyForm } from "./hooks/useAddSourceStudyForm";
import { useAddSourceStudyFormManager } from "./hooks/useAddSourceStudyFormManager";

interface AddNewSourceStudyViewProps {
  pathParameter: PathParameter;
}

export const AddNewSourceStudyView = ({
  pathParameter,
}: AddNewSourceStudyViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useAddSourceStudyForm();
  const formManager = useAddSourceStudyFormManager(pathParameter, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <AddSourceStudy formManager={formManager} formMethod={formMethod} />
        }
        title="Add Source Study"
      />
    </ConditionalComponent>
  );
};
