import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { FormManager as FormManagerProps } from "../../../../../../../../hooks/useFormManager/common/entities";
import { DropdownMenu as MoreDropdownMenu } from "../../../../../TrackerForm/components/DropdownMenu/dropdownMenu";

export interface DropdownMenuProps {
  formManager: FormManagerProps;
}

export const DropdownMenu = ({
  formManager,
}: DropdownMenuProps): JSX.Element => {
  const {
    formAction: { onDelete } = {},
    formStatus: { isDirty },
  } = formManager;
  return (
    <MoreDropdownMenu disabled={isDirty}>
      {({ closeMenu }): JSX.Element[] => [
        <MenuItem
          key="delete-component-atlases"
          onClick={(): void => {
            closeMenu();
            onDelete?.();
          }}
        >
          Delete
        </MenuItem>,
      ]}
    </MoreDropdownMenu>
  );
};
