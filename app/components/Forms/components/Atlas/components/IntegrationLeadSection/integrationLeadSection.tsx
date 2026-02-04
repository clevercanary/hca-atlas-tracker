import { JSX, Fragment } from "react";
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
import { AddItemButton } from "../../../../../Detail/components/TrackerForm/components/Section/components/ListSection/components/AddItemButton/addItemButton";
import { DeleteItemButton } from "../../../../../Detail/components/TrackerForm/components/Section/components/ListSection/components/DeleteItemButton/deleteItemButton";
import { ListSection } from "../../../../../Detail/components/TrackerForm/components/Section/components/ListSection/listSection";

interface IntegrationLeadSectionProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<YupValidatedFormValues<T>>,
  R = undefined,
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
  R = undefined,
>({
  formManager,
  formMethod,
  fullWidth,
  getEmailName,
  getNameName,
  getNewValue,
  integrationLeadName,
}: IntegrationLeadSectionProps<T, TFieldArrayName, R>): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { append, fields, remove } = useFieldArray({
    control: formMethod.control,
    name: integrationLeadName,
  });
  const multiLead = fields.length > 1;
  return (
    <ListSection fullWidth={fullWidth}>
      {fields.map((item, index) => {
        return (
          <Fragment key={item.id}>
            <InputController
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
            {multiLead && (
              <DeleteItemButton
                inputRowsPerItem={2}
                onClick={() => remove(index)}
                disabled={isReadOnly}
              />
            )}
          </Fragment>
        );
      })}
      <AddItemButton
        disabled={isReadOnly}
        onClick={() => append(getNewValue())}
      >
        Add lead
      </AddItemButton>
    </ListSection>
  );
};
