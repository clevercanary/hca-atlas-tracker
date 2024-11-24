import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { RemoveIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/RemoveIcon/removeIcon";
import { IconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import {
  FieldArrayPath,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { InputController } from "../../../../../common/Form/components/Controllers/components/InputController/inputController";
import {
  AddLeadRow,
  IntegrationLeadSectionCard,
  LeadControllers,
  NameInputController,
  RemoveLeadCell,
} from "./integrationLeadSection.styles";

interface IntegrationLeadSectionProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<YupValidatedFormValues<T>>,
  R = undefined
> {
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  fullWidth?: boolean;
  getEmailName: (i: number) => FieldPath<YupValidatedFormValues<T>>;
  getNameName: (i: number) => FieldPath<YupValidatedFormValues<T>>;
  getNewValue: () => FieldValues[TFieldArrayName][number];
  integrationLeadName: TFieldArrayName;
}

export const IntegrationLeadSection = <
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<YupValidatedFormValues<T>>,
  R = undefined
>({
  formManager,
  formMethod,
  fullWidth,
  getEmailName,
  getNameName,
  getNewValue,
  integrationLeadName,
}: IntegrationLeadSectionProps<T, TFieldArrayName, R>): JSX.Element => {
  const { append, fields, remove } = useFieldArray({
    control: formMethod.control,
    name: integrationLeadName,
  });
  const multiLead = fields.length > 1;
  return (
    <IntegrationLeadSectionCard fullWidth={fullWidth} multiLead={multiLead}>
      {fields.map((item, index) => {
        return (
          <LeadControllers key={item.id}>
            <NameInputController
              formManager={formManager}
              formMethod={formMethod}
              inputProps={{ label: "Full name" }}
              name={getNameName(index)}
            />
            <InputController
              formManager={formManager}
              formMethod={formMethod}
              inputProps={{ label: "Email" }}
              name={getEmailName(index)}
            />
            {multiLead ? (
              <RemoveLeadCell>
                {/* TODO use correct icon */}
                <IconButton
                  color="secondary"
                  Icon={RemoveIcon}
                  onClick={() => remove(index)}
                  size="medium"
                />
              </RemoveLeadCell>
            ) : null}
          </LeadControllers>
        );
      })}
      <AddLeadRow>
        <ButtonSecondary
          startIcon={<AddIcon />}
          onClick={() => append(getNewValue())}
        >
          Add lead
        </ButtonSecondary>
      </AddLeadRow>
    </IntegrationLeadSectionCard>
  );
};
