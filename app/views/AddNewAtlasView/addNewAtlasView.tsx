import { Fragment, JSX } from "react";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { EntityForm } from "../../components/Entity/components/EntityForm/entityForm";
import { ADD_ATLAS_SECTION_CONFIGS } from "../../components/Forms/components/Atlas/common/sections";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useAddAtlasForm } from "./hooks/useAddAtlasForm";
import { useAddAtlasFormManager } from "./hooks/useAddAtlasFormManager";

export const AddNewAtlasView = (): JSX.Element => {
  const formMethod = useAddAtlasForm();
  const formManager = useAddAtlasFormManager(formMethod);
  const {
    access: { canEdit },
    formAction,
    isLoading,
  } = formManager;
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
        canEdit ? (
          <EntityForm
            formManager={formManager}
            formMethod={formMethod}
            sectionConfigs={ADD_ATLAS_SECTION_CONFIGS}
          />
        ) : (
          <AccessDeniedPrompt divider={<Divider />} />
        )
      }
      title="Add New Atlas Family"
    />
  );
};
