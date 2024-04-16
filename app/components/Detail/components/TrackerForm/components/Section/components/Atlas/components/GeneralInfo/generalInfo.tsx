import { MenuItem as MMenuItem } from "@mui/material";
import { ReactNode } from "react";
import { Controller } from "react-hook-form";
import {
  NETWORKS,
  WAVES,
} from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  AtlasEditData,
  NewAtlasData,
} from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import {
  isNetworkKey,
  isWaveValue,
} from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { getBioNetworkByKey } from "../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Input } from "../../../../../../../../../common/Form/components/Input/input";
import { Select } from "../../../../../../../../../common/Form/components/Select/select";
import { NetworkIconAndName } from "../../../../../Select/components/NetworkIconAndName/networkIconAndName";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../section.styles";
import { DEFAULT_INPUT_PROPS, FIELD_NAME } from "../../common/constants";

export interface GeneralInfoProps {
  control: FormMethod<AtlasEditData | NewAtlasData>["control"];
  formState: FormMethod<AtlasEditData | NewAtlasData>["formState"];
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
          name={FIELD_NAME.SHORT_NAME}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.SHORT_NAME}
              error={Boolean(errors[FIELD_NAME.SHORT_NAME])}
              helperText={errors[FIELD_NAME.SHORT_NAME]?.message as string}
              isFilled={Boolean(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.VERSION}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.VERSION}
              error={Boolean(errors[FIELD_NAME.VERSION])}
              helperText={errors[FIELD_NAME.VERSION]?.message as string}
              isFilled={Boolean(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.BIO_NETWORK}
          render={({ field }): JSX.Element => (
            <Select
              {...field}
              {...DEFAULT_INPUT_PROPS.BIO_NETWORK}
              error={Boolean(errors[FIELD_NAME.BIO_NETWORK])}
              helperText={errors[FIELD_NAME.BIO_NETWORK]?.message as string}
              isFilled={Boolean(field.value)}
              renderValue={renderNetworkSelectValue}
            >
              {NETWORKS.map(({ key, name }) => (
                <MMenuItem key={key} value={key}>
                  <NetworkIconAndName networkKey={key} networkName={name} />
                </MMenuItem>
              ))}
            </Select>
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.WAVE}
          render={({ field }): JSX.Element => (
            <Select
              {...field}
              {...DEFAULT_INPUT_PROPS.WAVE}
              error={Boolean(errors[FIELD_NAME.WAVE])}
              helperText={errors[FIELD_NAME.WAVE]?.message as string}
              isFilled={Boolean(field.value)}
              renderValue={renderWaveSelectValue}
            >
              {WAVES.map((wave) => {
                return (
                  <MMenuItem key={wave} value={wave}>
                    {wave}
                  </MMenuItem>
                );
              })}
            </Select>
          )}
        />
      </SectionCard>
    </Section>
  );
};

/**
 * Renders network select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderNetworkSelectValue(value: unknown): ReactNode {
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

/**
 * Renders wave select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderWaveSelectValue(value: unknown): ReactNode {
  if (isWaveValue(value)) {
    return value;
  }
  return "Choose...";
}
