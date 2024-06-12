import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { Fragment, useState } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, PathParameter } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/GeneralInfo/generalInfo";
import { Dialog } from "./addSourceDataset.styles";
import { NewSourceDatasetData } from "./common/entities";
import { newSourceDatasetSchema } from "./common/schema";

const SCHEMA = newSourceDatasetSchema;

interface AddSourceDatasetProps {
  pathParameter: PathParameter;
}

export const AddSourceDataset = ({
  pathParameter,
}: AddSourceDatasetProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const onClose = (): void => setOpen(false);
  const onOpen = (): void => setOpen(true);
  return (
    <Fragment>
      <ButtonSecondary
        onClick={onOpen}
        size="small"
        startIcon={<AddIcon fontSize="small" />}
      >
        Add Source Dataset
      </ButtonSecondary>
      <Dialog onClose={onClose} open={open}>
        <GeneralInfo<NewSourceDatasetData>
          method={METHOD.POST}
          onClose={onClose}
          requestUrl={getRequestURL(API.CREATE_SOURCE_DATASET, pathParameter)}
          schema={SCHEMA}
          title="Add source dataset"
        />
      </Dialog>
    </Fragment>
  );
};
