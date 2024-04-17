import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../../common/entities";
import { getRequestURL } from "../../../../../../common/utils";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../../../routes/constants";
import { onSuccess } from "../../../../../../views/EditAtlasView/hooks/useEditAtlasForm";
import { Banner as TrackerBanner } from "../../../TrackerForm/components/Banner/banner";
import { FormManagement } from "../../../TrackerForm/components/Banner/components/FormManagement/formManagement";

interface BannerProps {
  atlasId: AtlasId;
  formMethod: FormMethod<AtlasEditData>;
}

export const Banner = ({ atlasId, formMethod }: BannerProps): JSX.Element => {
  const {
    disabled,
    formState: { isDirty },
    handleSubmit,
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(ROUTE.ATLASES);
  }, []);

  const onFormSubmit = useCallback(
    (payload: AtlasEditData) => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onSuccess,
      });
    },
    [atlasId, onSubmit]
  );

  return (
    <TrackerBanner>
      <FormManagement
        isDirty={isDirty}
        isDisabled={disabled}
        onDiscard={onDiscard}
        onSave={handleSubmit(onFormSubmit)}
      />
    </TrackerBanner>
  );
};
