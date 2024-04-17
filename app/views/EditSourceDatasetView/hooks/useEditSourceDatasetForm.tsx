import { useMemo } from "react";
import {
  HCAAtlasTrackerSourceDataset,
  PUBLICATION_STATUS,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  SourceDatasetEditData,
  sourceDatasetEditSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FIELD_NAME } from "../../../components/Detail/components/TrackerForm/components/Section/components/SourceDataset/common/constants";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { getSourceDatasetCitation } from "../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

const SCHEMA = sourceDatasetEditSchema;

export const useEditSourceDatasetForm = (
  sourceDataset?: HCAAtlasTrackerSourceDataset
): FormMethod<SourceDatasetEditData> => {
  const values = useMemo(() => mapSchemaValues(sourceDataset), [sourceDataset]);
  return useForm<SourceDatasetEditData>(SCHEMA, values);
};

/**
 * Returns schema default values mapped from source dataset.
 * @param sourceDataset - Source dataset.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): SourceDatasetEditData {
  return {
    [FIELD_NAME.CITATION]: getSourceDatasetCitation(sourceDataset),
    [FIELD_NAME.DOI]: sourceDataset?.doi || "",
    [FIELD_NAME.PUBLICATION_STATUS]:
      sourceDataset?.publicationStatus ||
      PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF,
    [FIELD_NAME.TITLE]: sourceDataset?.title || "",
  };
}
