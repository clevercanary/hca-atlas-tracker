import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { UserForm } from "@/app/components/Forms/components/User/user";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { Fragment, type JSX } from "react";
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
