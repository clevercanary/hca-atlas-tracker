import { type PathParameter } from "@/app/common/entities";
import { type FormStatus } from "@/app/hooks/useFormManager/common/entities";
import { type JSX } from "react";
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
