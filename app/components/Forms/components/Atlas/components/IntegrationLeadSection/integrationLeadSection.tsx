import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { IconButton } from "@mui/material";
import { Fragment } from "react";
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
import { DeleteIcon } from "../../../../../common/CustomIcon/components/DeleteIcon/deleteIcon";
import { InputController } from "../../../../../common/Form/components/Controllers/components/InputController/inputController";
import { SectionCard } from "../../../../../Detail/components/TrackerForm/components/Section/section.styles";
import { BUTTON_PROPS, ICON_BUTTON_PROPS, SVG_ICON_PROPS } from "./constants";
import {
  ControllerAction,
  StyledButton,
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
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { append, fields, remove } = useFieldArray({
    control: formMethod.control,
    name: integrationLeadName,
  });
  const multiLead = fields.length > 1;
  return (
    <SectionCard fullWidth={fullWidth} gridAutoFlow="dense">
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
              <ControllerAction>
                <IconButton
                  {...ICON_BUTTON_PROPS}
                  onClick={() => remove(index)}
                  disabled={isReadOnly}
                >
                  <DeleteIcon {...SVG_ICON_PROPS} />
                </IconButton>
              </ControllerAction>
            )}
          </Fragment>
        );
      })}
      <StyledButton
        {...BUTTON_PROPS}
        startIcon={<AddIcon />}
        onClick={() => append(getNewValue())}
        disabled={isReadOnly}
      >
        Add lead
      </StyledButton>
    </SectionCard>
  );
};
