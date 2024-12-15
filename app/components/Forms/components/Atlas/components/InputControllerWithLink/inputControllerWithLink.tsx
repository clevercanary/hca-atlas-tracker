import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Fragment, ReactNode } from "react";
import { Controller, FieldPathValue, FieldValues, Path } from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import {
  Input,
  InputProps,
} from "../../../../../common/Form/components/Input/input";
import { TypographyNoWrap } from "../../../../../common/Typography/components/TypographyNoWrap/typographyNoWrap";

export interface InputControllerWithLinkProps<
  T extends FieldValues,
  R,
  TName extends Path<YupValidatedFormValues<T>>
> {
  className?: string;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  getUrl?: (v: FieldPathValue<YupValidatedFormValues<T>, TName>) => string;
  inputProps?: Partial<Omit<InputProps, "ref" | "label">>;
  label: ReactNode;
  linkLabel?: ReactNode;
  name: TName;
}

export const InputControllerWithLink = <
  T extends FieldValues,
  R,
  TName extends Path<YupValidatedFormValues<T>>
>({
  className,
  formManager,
  formMethod,
  getUrl = (v): string => String(v),
  inputProps,
  label,
  linkLabel = "Visit link",
  name,
}: InputControllerWithLinkProps<T, R, TName>): JSX.Element => {
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
          helperText={error?.message}
          isFilled={Boolean(field.value)}
          readOnly={isReadOnly}
          label={
            <Fragment>
              <TypographyNoWrap>{label}</TypographyNoWrap>
              {field.value && (
                <Link label={linkLabel} url={getUrl(field.value)} />
              )}
            </Fragment>
          }
          {...inputProps}
        />
      )}
    />
  );
};
