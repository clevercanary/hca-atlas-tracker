import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { UserForm } from "../../components/Forms/components/User/user";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { getBreadcrumbs } from "./common/utils";
import { useEditUserForm } from "./hooks/useEditUserForm";
import { useEditUserFormManager } from "./hooks/useEditUserFormManager";

interface UserViewProps {
  pathParameter: PathParameter;
}

export const UserView = ({ pathParameter }: UserViewProps): JSX.Element => {
  const formMethod = useEditUserForm(pathParameter);
  const formManager = useEditUserFormManager(pathParameter, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: user } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(user))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(user)}
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
        title={user ? user.fullName : "View User"}
      />
    </ConditionalComponent>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the user" />;
  return null;
}
