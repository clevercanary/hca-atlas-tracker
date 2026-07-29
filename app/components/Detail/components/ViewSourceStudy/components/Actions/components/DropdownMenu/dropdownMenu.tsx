import { PathParameter } from "@/app/common/entities";
import { DropdownMenu as MoreDropdownMenu } from "@/app/components/Detail/components/TrackerForm/components/DropdownMenu/dropdownMenu";
import { FormStatus } from "@/app/hooks/useFormManager/common/entities";
import { useDeleteSourceStudy } from "@/app/views/SourceStudyView/hooks/useDeleteSourceStudy";
import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { JSX } from "react";

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
            onDelete();
          }}
        >
          Delete
        </MenuItem>,
      ]}
    </MoreDropdownMenu>
  );
};
