import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { EntityForm } from "@/app/components/Entity/components/EntityForm/entityForm";
import { ADD_ATLAS_SECTION_CONFIGS } from "@/app/components/Forms/components/Atlas/common/sections";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { Fragment, type JSX } from "react";
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
        <EntityForm
          formManager={formManager}
          formMethod={formMethod}
          sectionConfigs={ADD_ATLAS_SECTION_CONFIGS}
        />
      }
      title="Add New Atlas Family"
    />
  );
};
