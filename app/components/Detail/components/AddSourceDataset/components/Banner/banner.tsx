import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceDatasetData } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../../../common/utils";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../../../routes/constants";
import { onSuccess } from "../../../../../../views/AddNewSourceDatasetView/hooks/useAddSourceDatasetForm";
import { Banner as TrackerBanner } from "../../../TrackerForm/components/Banner/banner";
import { FormManagement } from "../../../TrackerForm/components/Banner/components/FormManagement/formManagement";

interface BannerProps {
  atlasId: AtlasId;
  formMethod: FormMethod<NewSourceDatasetData>;
}

export const Banner = ({ atlasId, formMethod }: BannerProps): JSX.Element => {
  const {
    disabled,
    formState: { isDirty },
    handleSubmit,
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId));
  }, [atlasId]);

  const onFormSubmit = useCallback(
    (payload: NewSourceDatasetData): void => {
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_SOURCE_DATASET, atlasId),
        METHOD.POST,
        payload,
        {
          onSuccess: (id) => onSuccess(atlasId, id),
        }
      );
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
