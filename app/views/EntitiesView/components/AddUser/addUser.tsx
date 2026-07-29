import { ROUTE } from "@/app/routes/constants";
import Link from "next/link";
import { JSX } from "react";
import { ActionButton } from "../ActionButton/actionButton";

export const AddUser = (): JSX.Element | null => {
  return (
    <ActionButton component={Link} href={ROUTE.CREATE_USER}>
      Add User
    </ActionButton>
  );
};
