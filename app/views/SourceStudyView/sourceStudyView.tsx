import { getSourceStudyCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "@/app/components/Detail/components/ViewSourceStudy/components/Actions/actions";
import { Tabs } from "@/app/components/Detail/components/ViewSourceStudy/components/Tabs/tabs";
import { ViewSourceStudy } from "@/app/components/Detail/components/ViewSourceStudy/viewSourceStudy";
import { useBackPath } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "@/app/hooks/useFetchAtlas";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { getBreadcrumbs } from "./common/utils";
import { useEditSourceStudyForm } from "./hooks/useEditSourceStudyForm";
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
  const backPath = useBackPath(pathParameter);
  const {
    access: { canEdit },
    formAction,
    formStatus: { isDirty },
    isLoading,
  } = formManager;
  const { data: sourceStudy } = formMethod;

  if (isLoading) return <Fragment />;

  return (
    <ConditionalComponent isIn={Boolean(atlas && sourceStudy)}>
      <DetailView
        actions={
          canEdit && <Actions isDirty={isDirty} pathParameter={pathParameter} />
        }
        backPath={backPath}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewSourceStudy formManager={formManager} formMethod={formMethod} />
        }
        subTitle={getSourceStudyCitation(sourceStudy)}
        tabs={<Tabs pathParameter={pathParameter} sourceStudy={sourceStudy} />}
        title={sourceStudy?.title || "Source Study"}
      />
    </ConditionalComponent>
  );
};
