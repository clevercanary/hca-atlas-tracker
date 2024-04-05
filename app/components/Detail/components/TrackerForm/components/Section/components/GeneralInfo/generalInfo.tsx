import { MenuItem as MMenuItem } from "@mui/material";
import { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { NETWORKS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { NewAtlasData } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { isNetworkKey } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { FormMethod } from "../../../../../../../../hooks/useForm/common/entities";
import { getBioNetworkByKey } from "../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Input } from "../../../../../../../common/Form/components/Input/input";
import { Select } from "../../../../../../../common/Form/components/Select/select";
import { NetworkIconAndName } from "../../../Select/components/NetworkIconAndName/networkIconAndName";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../section.styles";

export const FIELD_NAME_ATLAS_NAME = "focus"; // TODO convert focus to shortName.
export const FIELD_NAME_BIO_NETWORK = "network";
export const FIELD_NAME_VERSION = "version";

export interface GeneralInfoProps {
  control: FormMethod<NewAtlasData>["control"];
  formState: FormMethod<NewAtlasData>["formState"];
}

export const GeneralInfo = ({
  control,
  formState,
}: GeneralInfoProps): JSX.Element => {
  const { errors } = formState;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME_ATLAS_NAME}
          render={({ field }): JSX.Element => {
            return (
              <Input
                {...field}
                error={Boolean(errors[FIELD_NAME_ATLAS_NAME])}
                helperText={errors[FIELD_NAME_ATLAS_NAME]?.message as string}
                isDirty={Boolean(field.value)}
                label="Short name"
                placeholder="e.g. Cortex"
                readOnly={false}
              />
            );
          }}
        />
        <Controller
          control={control}
          name={FIELD_NAME_VERSION}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              error={Boolean(errors[FIELD_NAME_VERSION])}
              helperText={errors[FIELD_NAME_VERSION]?.message as string}
              isDirty={Boolean(field.value)}
              label="Version"
              placeholder="e.g. 1.0"
              readOnly={false}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME_BIO_NETWORK}
          render={({ field }): JSX.Element => {
            return (
              <Select
                {...field}
                displayEmpty
                error={Boolean(errors[FIELD_NAME_BIO_NETWORK])}
                helperText={errors[FIELD_NAME_BIO_NETWORK]?.message as string}
                isDirty={Boolean(field.value)}
                label="Select network"
                readOnly={false}
                renderValue={renderSelectValue}
              >
                {NETWORKS.map(({ key, name }) => (
                  <MMenuItem key={key} value={key}>
                    <NetworkIconAndName networkKey={key} networkName={name} />
                  </MMenuItem>
                ))}
              </Select>
            );
          }}
        />
      </SectionCard>
    </Section>
  );
};

/**
 * Renders select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderSelectValue(value: unknown): ReactNode {
  if (isNetworkKey(value)) {
    const networkName = getBioNetworkByKey(value)?.name;
    return (
      <NetworkIconAndName
        networkKey={value}
        networkName={networkName ?? value}
      />
    );
  }
  return "Choose...";
}
