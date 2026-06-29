import { Fragment, JSX } from "react";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { UserForm } from "../../components/Forms/components/User/user";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
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
        <UserForm formManager={formManager} formMethod={formMethod} />
      }
      title="Add New User"
    />
  );
};
