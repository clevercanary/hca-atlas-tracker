import { JSX, Fragment } from "react";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { UserForm } from "../../components/Forms/components/User/user";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { getBreadcrumbs } from "./common/utils";
import { useAddUserForm } from "./hooks/useAddUserForm";
import { useAddUserFormManager } from "./hooks/useAddUserFormManager";

export const AddNewUserView = (): JSX.Element => {
  const formMethod = useAddUserForm();
  const formManager = useAddUserFormManager(formMethod);
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
        <UserForm
          accessFallback={renderAccessFallback(formManager)}
          formManager={formManager}
          formMethod={formMethod}
        />
      }
      title="Add New User"
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
    return <AccessPrompt divider={<Divider />} text="to add a new user" />;
  if (!canEdit) return <AccessDeniedPrompt divider={<Divider />} />;
  return null;
}
