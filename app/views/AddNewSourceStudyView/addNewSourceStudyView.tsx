import { PathParameter } from "@/app/common/entities";
import { AddSourceStudy } from "@/app/components/Detail/components/AddSourceStudy/addSourceStudy";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "@/app/hooks/useFetchAtlas";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
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
  const { formAction, isLoading } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={Boolean(atlas)}>
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
