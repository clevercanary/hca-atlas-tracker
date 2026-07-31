import { ROUTE } from "@/app/routes/constants";
import { ActionButton } from "@/app/views/EntitiesView/components/ActionButton/actionButton";
import Link from "next/link";
import { JSX } from "react";

export const AddUser = (): JSX.Element | null => {
  return (
    <ActionButton component={Link} href={ROUTE.CREATE_USER}>
      Add User
    </ActionButton>
  );
};
