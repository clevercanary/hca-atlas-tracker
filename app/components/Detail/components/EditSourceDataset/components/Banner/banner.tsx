import Router from "next/router";
import { useCallback } from "react";
import { AtlasId } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetEditData } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../../../../common/utils";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../../../routes/constants";
import { Banner as TrackerBanner } from "../../../TrackerForm/components/Banner/banner";
import { FormManagement } from "../../../TrackerForm/components/Banner/components/FormManagement/formManagement";

interface BannerProps {
  atlasId: AtlasId;
  formMethod: FormMethod<SourceDatasetEditData>;
}

export const Banner = ({ atlasId, formMethod }: BannerProps): JSX.Element => {
  const {
    formState: { isDirty },
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId));
  }, [atlasId]);

  return (
    <TrackerBanner>
      <FormManagement
        isDirty={isDirty}
        isDisabled={true} // TODO: isDisabled
        onDiscard={onDiscard}
        onSave={(): void => {
          // TODO: onSave
        }}
      />
    </TrackerBanner>
  );
};
