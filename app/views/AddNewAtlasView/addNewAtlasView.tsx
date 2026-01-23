import { JSX, Fragment } from "react";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { EntityForm } from "../../components/Entity/components/EntityForm/entityForm";
import { ADD_ATLAS_SECTION_CONFIGS } from "../../components/Forms/components/Atlas/common/sections";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { FormManager } from "../../hooks/useFormManager/common/entities";
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
          accessFallback={renderAccessFallback(formManager)}
          formManager={formManager}
          formMethod={formMethod}
          sectionConfigs={ADD_ATLAS_SECTION_CONFIGS}
        />
      }
      title="Add New Atlas"
    />
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView)
    return <AccessPrompt divider={<Divider />} text="to add a new atlas" />;
  if (!canEdit) return <AccessDeniedPrompt divider={<Divider />} />;
  return null;
}
