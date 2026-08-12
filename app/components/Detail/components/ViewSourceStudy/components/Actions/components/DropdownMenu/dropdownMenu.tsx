import { type PathParameter } from "@/app/common/entities";
import { DropdownMenu as MoreDropdownMenu } from "@/app/components/Detail/components/TrackerForm/components/DropdownMenu/dropdownMenu";
import { type FormStatus } from "@/app/hooks/useFormManager/common/entities";
import { useDeleteSourceStudy } from "@/app/views/SourceStudyView/hooks/useDeleteSourceStudy";
import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { type JSX } from "react";

export interface DropdownMenuProps {
  isDirty: FormStatus["isDirty"];
  pathParameter: PathParameter;
}

export const DropdownMenu = ({
  isDirty,
  pathParameter,
}: DropdownMenuProps): JSX.Element => {
  const { onDelete } = useDeleteSourceStudy(pathParameter);
  return (
    <MoreDropdownMenu disabled={isDirty}>
      {({ closeMenu }): JSX.Element[] => [
        <MenuItem
          key="delete-source-study"
          onClick={(): void => {
            closeMenu();
            // A failed delete is reported via the error snackbar (the
            // hook's onError); onDelete never rejects.
            void onDelete();
          }}
        >
          Delete
        </MenuItem>,
      ]}
    </MoreDropdownMenu>
  );
};
