import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import Router from "next/router";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { ROUTE_ATLASES } from "../../../../constants/routes";
import { useForm } from "../../../../hooks/useForm/useForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

const REQUEST_URL = "/api/atlases/create";

export const AddAtlas = (): JSX.Element => {
  const form = useForm<NewAtlasData>(
    newAtlasSchema,
    REQUEST_URL,
    METHOD.POST,
    onSuccess
  );
  return (
    <TrackerForm onSubmit={form.onSubmit}>
      <Divider />
      <GeneralInfo {...form} />
      <Divider />
      <FormActions>
        <ButtonLink color={BUTTON_COLOR.SECONDARY} href={ROUTE_ATLASES}>
          Discard
        </ButtonLink>
        <ButtonPrimary disabled={form.disabled} type="submit">
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerForm>
  );
};

/**
 * onSuccess callback to redirect to the edit page after a successful form submission.
 * @param id - Atlas ID.
 */
function onSuccess(id: string): void {
  Router.push(`${ROUTE_ATLASES}/${id}/edit`);
}
