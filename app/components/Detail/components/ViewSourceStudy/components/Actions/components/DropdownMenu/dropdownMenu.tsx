import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { PathParameter } from "../../../../../../../../common/entities";
import { FormStatus } from "../../../../../../../../hooks/useFormManager/common/entities";
import { useDeleteSourceStudy } from "../../../../../../../../views/SourceStudyView/hooks/useDeleteSourceStudy";
import { DropdownMenu as MoreDropdownMenu } from "../../../../../TrackerForm/components/DropdownMenu/dropdownMenu";

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
