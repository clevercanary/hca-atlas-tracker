import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { PathParameter } from "../../common/entities";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { UserForm } from "../../components/Forms/components/User/user";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useEditUserForm } from "./hooks/useEditUserForm";
import { useEditUserFormManager } from "./hooks/useEditUserFormManager";

interface UserViewProps {
  pathParameter: PathParameter;
}

export const UserView = ({ pathParameter }: UserViewProps): JSX.Element => {
  const formMethod = useEditUserForm(pathParameter);
  const formManager = useEditUserFormManager(pathParameter, formMethod);
  const { formAction, isLoading } = formManager;
  const { data: user } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={Boolean(user)}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(user)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <UserForm formManager={formManager} formMethod={formMethod} />
        }
        title={user ? user.fullName : "View User"}
      />
    </ConditionalComponent>
  );
};
