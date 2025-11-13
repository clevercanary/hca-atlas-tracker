import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TypographyNoWrap } from "app/components/common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { Fragment, ReactNode } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { Input, InputProps } from "../../../Input/input";
import { ControllerViewBuilder } from "../../common/entities";

export interface LabelLinkConfig {
  getUrl?: (v: string | null) => string | null;
  label?: string;
}

export interface InputControllerProps<T extends FieldValues, R = undefined>
  extends UseControllerProps<YupValidatedFormValues<T>> {
  className?: string;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  inputProps?: Partial<Omit<InputProps, "ref">>;
  labelLink?: LabelLinkConfig | true;
  renderHelperText?: (data?: R) => ReactNode;
  viewBuilder?: ControllerViewBuilder;
}

export const InputController = <T extends FieldValues, R = undefined>({
  className,
  formManager,
  formMethod,
  inputProps: { label, ...inputProps } = {},
  labelLink,
  name,
  renderHelperText,
  viewBuilder,
  ...props
}: InputControllerProps<T, R>): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error, invalid } }): JSX.Element => (
        <Input
          {...field}
          className={className}
          error={invalid}
          helperText={error?.message || renderHelperText?.(formMethod.data)}
          isFilled={Boolean(field.value)}
          label={
            labelLink
              ? getLabelWithLink(
                  label,
                  labelLink === true ? {} : labelLink,
                  field.value
                )
              : label
          }
          readOnly={isReadOnly}
          viewBuilder={viewBuilder}
          {...inputProps}
          {...props}
        />
      )}
    />
  );
};

/**
 * Get input label including a link derived from the input value.
 * @param label - Primary label.
 * @param param1 - Link config.
 * @param param1.getUrl - Function that takes the input value (cast to string or null) and returns the link URL, or null if the link shouldn't be displayed.
 * @param param1.label - Link label.
 * @param value - Input value.
 * @returns Input label with link.
 */
function getLabelWithLink(
  label: ReactNode,
  {
    getUrl = (v): string | null => (v ? v : null),
    label: linkLabel = "Visit link",
  }: LabelLinkConfig,
  value: unknown
): JSX.Element {
  const url = getUrl(
    value === null || value === undefined ? null : String(value)
  );
  return (
    <Fragment>
      <TypographyNoWrap>{label}</TypographyNoWrap>
      {url !== null && <Link label={linkLabel} url={url} />}
    </Fragment>
  );
}
