import { ROUTE } from "@/app/routes/constants";
import { ActionButton } from "@/app/views/EntitiesView/components/ActionButton/actionButton";
import Link from "next/link";
import { JSX } from "react";

export const AddAtlas = (): JSX.Element | null => {
  return (
    <ActionButton component={Link} href={ROUTE.CREATE_ATLAS}>
      Add Atlas Family
    </ActionButton>
  );
};
