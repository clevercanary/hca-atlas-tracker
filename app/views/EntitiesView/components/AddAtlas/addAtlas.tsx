import Link from "next/link";
import { ROUTE } from "../../../../routes/constants";
import { ActionButton } from "../ActionButton/actionButton";

export const AddAtlas = (): JSX.Element | null => {
  return (
    <ActionButton component={Link} href={ROUTE.CREATE_ATLAS}>
      Add Atlas
    </ActionButton>
  );
};
