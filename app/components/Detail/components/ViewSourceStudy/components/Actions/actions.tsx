import { JSX } from "react";
import { PathParameter } from "../../../../../../common/entities";
import { FormStatus } from "../../../../../../hooks/useFormManager/common/entities";
import { HeroActions } from "./actions.styles";
import { DropdownMenu } from "./components/DropdownMenu/dropdownMenu";

interface ActionsProps {
  isDirty?: FormStatus["isDirty"];
  pathParameter: PathParameter;
}

export const Actions = ({
  isDirty = false,
  pathParameter,
}: ActionsProps): JSX.Element => {
  return (
    <HeroActions>
      <DropdownMenu isDirty={isDirty} pathParameter={pathParameter} />
    </HeroActions>
  );
};
