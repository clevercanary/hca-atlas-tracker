import { FormManager as FormManagerProps } from "../../../../../../hooks/useFormManager/common/entities";
import { HeroActions } from "./actions.styles";
import { DropdownMenu } from "./components/DropdownMenu/dropdownMenu";

interface ActionsProps {
  formManager: FormManagerProps;
}

export const Actions = ({ formManager }: ActionsProps): JSX.Element => {
  return (
    <HeroActions>
      <DropdownMenu formManager={formManager} />
    </HeroActions>
  );
};
