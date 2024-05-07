import { Fragment } from "react";
import { AddAtlas } from "../../components/Detail/components/AddAtlas/addAtlas";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useAddAtlasForm } from "./hooks/useAddAtlasForm";
import { useAddAtlasFormManager } from "./hooks/useAddAtlasFormManager";

export const AddNewAtlasView = (): JSX.Element => {
  const formMethod = useAddAtlasForm();
  const formManager = useAddAtlasFormManager(formMethod);
  const { formAction, isLoading } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <DetailView
      breadcrumbs={
        <Breadcrumbs
          breadcrumbs={getBreadcrumbs()}
          onNavigate={formAction?.onNavigate}
        />
      }
      mainColumn={
        <AddAtlas formManager={formManager} formMethod={formMethod} />
      }
      title="Add New Atlas"
    />
  );
};
