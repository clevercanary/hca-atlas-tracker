import { PathParameter } from "@/app/common/entities";
import { FormStatus } from "@/app/hooks/useFormManager/common/entities";
import { JSX } from "react";
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
