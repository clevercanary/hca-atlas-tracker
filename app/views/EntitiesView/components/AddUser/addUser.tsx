import Link from "next/link";
import { ROUTE } from "../../../../routes/constants";
import { ActionButton } from "../ActionButton/actionButton";

export const AddUser = (): JSX.Element | null => {
  return (
    <ActionButton component={Link} href={ROUTE.CREATE_USER}>
      Add User
    </ActionButton>
  );
};
