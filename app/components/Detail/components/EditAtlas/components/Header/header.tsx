import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { AtlasEditData } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../../../routes/constants";
import {
  ButtonLink,
  BUTTON_COLOR,
  BUTTON_VARIANT,
} from "../../../../../common/Button/components/ButtonLink/buttonLink";
import { Header as TrackerHeader } from "../../../TrackerForm/components/Header/header";
import {
  FormActions,
  FormStatus,
} from "../../../TrackerForm/components/Header/header.styles";

interface HeaderProps {
  formMethod: FormMethod<AtlasEditData>;
  onFormSubmit: (payload: AtlasEditData) => void;
}

export const Header = ({
  formMethod,
  onFormSubmit,
}: HeaderProps): JSX.Element => {
  const {
    disabled,
    formState: { isDirty },
    handleSubmit,
  } = formMethod;
  return (
    <TrackerHeader>
      {isDirty && <FormStatus>Unsaved Changes</FormStatus>}
      <FormActions>
        <ButtonLink
          color={BUTTON_COLOR.SECONDARY}
          href={ROUTE.ATLASES}
          variant={BUTTON_VARIANT.OUTLINED}
        >
          Discard
        </ButtonLink>
        <ButtonPrimary
          disabled={disabled || !isDirty}
          onClick={handleSubmit(onFormSubmit)}
        >
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerHeader>
  );
};
