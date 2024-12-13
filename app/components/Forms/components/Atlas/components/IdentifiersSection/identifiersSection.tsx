import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TypographyNoWrap } from "app/components/common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { Fragment } from "react";
import { Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { Input } from "../../../../../common/Form/components/Input/input";
import { SectionCard } from "../../../../../Detail/components/TrackerForm/components/Section/section.styles";

interface IdentifiersSectionProps<T extends FieldValues, R = undefined> {
  cellxgeneAtlasCollectionName: FieldPath<YupValidatedFormValues<T>>;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  fullWidth?: boolean;
}

export const IdentifiersSection = <T extends FieldValues, R = undefined>({
  cellxgeneAtlasCollectionName,
  formManager,
  formMethod,
  fullWidth,
}: IdentifiersSectionProps<T, R>): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <SectionCard fullWidth={fullWidth}>
      <Controller
        control={control}
        name={cellxgeneAtlasCollectionName}
        render={({ field }): JSX.Element => (
          <Input
            {...field}
            isFullWidth
            isFilled={Boolean(field.value)}
            label={
              <Fragment>
                <TypographyNoWrap>CELLxGENE collection ID</TypographyNoWrap>
                {field.value && <Link label="Visit link" url={field.value} />}
              </Fragment>
            }
            readOnly={isReadOnly}
          />
        )}
      />
    </SectionCard>
  );
};
