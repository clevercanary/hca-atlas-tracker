import {
  DropdownMenuIconButtonProps,
  DropdownMenuItemProps,
} from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/common/entities";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "../../../../../common/IconButton/iconButton";
import { DropdownMenu as MoreDropdownMenu } from "./dropdownMenu.styles";

export interface DropdownMenuProps {
  children: ({ closeMenu }: DropdownMenuItemProps) => JSX.Element[];
  className?: string;
  disabled?: boolean;
}

export const DropdownMenu = ({
  children,
  className,
  disabled = false,
  ...props /* Spread props to allow for Mui Menu specific prop overrides e.g. "anchorOrigin". */
}: DropdownMenuProps): JSX.Element => {
  return (
    <MoreDropdownMenu
      className={className}
      Button={(props: DropdownMenuIconButtonProps): JSX.Element =>
        renderButton({ ...props, disabled })
      }
      {...props}
    >
      {({ closeMenu }): JSX.Element[] => children({ closeMenu })}
    </MoreDropdownMenu>
  );
};

/**
 * Return the dropdown button.
 * @param props - Button props e.g. "onClick".
 * @returns button element.
 */
function renderButton(props: DropdownMenuIconButtonProps): JSX.Element {
  return (
    <IconButton
      color="secondary"
      Icon={MoreVertIcon}
      size="medium"
      {...props}
    />
  );
}
