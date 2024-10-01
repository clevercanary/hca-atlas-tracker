import { MenuItem as MMenuItem } from "@mui/material";
import { Fragment, ReactNode } from "react";
import { Controller } from "react-hook-form";
import { useFetchAtlases } from "../../../..//hooks/useFetchAtlases";
import {
  HCAAtlasTrackerUser,
  ROLE,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../components/Detail/components/TrackerForm/components/Section/section.styles";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "../../../../views/AddNewUserView/common/constants";
import { NewUserData } from "../../../../views/AddNewUserView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Input } from "../../../common/Form/components/Input/input";
import { Select } from "../../../common/Form/components/Select/select";
import { Divider } from "../../../Detail/components/TrackerForm/components/Divider/divider.styles";
import { Section } from "../../../Detail/components/TrackerForm/components/Section/section.styles";
import { TrackerForm } from "../../../Detail/components/TrackerForm/trackerForm";

interface UserFormProps {
  accessFallback: ReactNode;
  formManager: FormManagerProps;
  formMethod: FormMethod<NewUserData, HCAAtlasTrackerUser>;
}

export const UserForm = ({
  accessFallback,
  formManager,
  formMethod,
}: UserFormProps): JSX.Element => {
  const { atlases } = useFetchAtlases();
  if (accessFallback) return <Fragment>{accessFallback}</Fragment>;
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const {
    control,
    formState: { errors },
  } = formMethod;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <Section>
        <SectionHero>
          <SectionTitle>General info</SectionTitle>
        </SectionHero>
        <SectionCard>
          <Controller
            control={control}
            key={FIELD_NAME.FULL_NAME}
            name={FIELD_NAME.FULL_NAME}
            render={({ field }): JSX.Element => (
              <Input
                {...field}
                error={Boolean(errors[FIELD_NAME.FULL_NAME])}
                helperText={errors[FIELD_NAME.FULL_NAME]?.message}
                isFilled={Boolean(field.value)}
                label="Name"
                readOnly={isReadOnly}
              />
            )}
          />
          <Controller
            control={control}
            key={FIELD_NAME.EMAIL}
            name={FIELD_NAME.EMAIL}
            render={({ field }): JSX.Element => (
              <Input
                {...field}
                error={Boolean(errors[FIELD_NAME.EMAIL])}
                helperText={errors[FIELD_NAME.EMAIL]?.message}
                isFilled={Boolean(field.value)}
                label="Email"
                readOnly={isReadOnly}
              />
            )}
          />
          <Controller
            control={control}
            name={FIELD_NAME.ROLE}
            render={({ field }): JSX.Element => (
              <Select
                {...field}
                error={Boolean(errors[FIELD_NAME.ROLE])}
                helperText={errors[FIELD_NAME.ROLE]?.message}
                isFilled={Boolean(field.value)}
                label="Role"
                readOnly={isReadOnly}
              >
                {Object.keys(ROLE).map((role) => (
                  <MMenuItem key={role} value={role}>
                    {role}
                  </MMenuItem>
                ))}
              </Select>
            )}
          />
          <Controller
            control={control}
            name={FIELD_NAME.ROLE_ASSOCIATED_RESOURCE_IDS}
            render={({ field }): JSX.Element => (
              <Select
                {...field}
                error={Boolean(errors[FIELD_NAME.ROLE_ASSOCIATED_RESOURCE_IDS])}
                helperText={
                  errors[FIELD_NAME.ROLE_ASSOCIATED_RESOURCE_IDS]?.message
                }
                isFilled={Boolean(field.value)}
                label="Associated atlases"
                multiple
                readOnly={isReadOnly}
              >
                {(atlases ?? []).map((atlas) => (
                  <MMenuItem key={atlas.id} value={atlas.id}>
                    {atlas.shortName} v{atlas.version}
                  </MMenuItem>
                ))}
              </Select>
            )}
          />
        </SectionCard>
      </Section>
    </TrackerForm>
  );
};
