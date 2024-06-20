import { Fragment, ReactNode, useCallback, useState } from "react";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/AddNewSourceStudyView/common/constants";
import {
  NewSourceStudyData,
  PUBLICATION_STATUS,
} from "../../../../../../../../../../../../views/AddNewSourceStudyView/common/entities";
import { Tabs } from "../../../../../../../Tabs/tabs";
import { getSectionTabs } from "./common/utils";
import { SectionCard, SectionContent } from "./generalInfo.styles";

export interface GeneralInfoProps {
  children: ReactNode;
  formManager: FormManager;
  formMethod: FormMethod<NewSourceStudyData, HCAAtlasTrackerSourceStudy>;
}

export const GeneralInfo = ({
  children,
  formManager,
  formMethod,
}: GeneralInfoProps): JSX.Element => {
  const [publicationStatus, setPublicationStatus] =
    useState<PUBLICATION_STATUS>(PUBLICATION_STATUS.PUBLISHED);
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const {
    clearErrors,
    control,
    formState: { errors },
    setValue,
    watch,
  } = formMethod;
  const hasDoi = Boolean(watch(FIELD_NAME.DOI));

  // Callback to handle tab change; clears errors, sets publication status, and updates form value.
  const onTabChange = useCallback(
    (value: PUBLICATION_STATUS): void => {
      clearErrors();
      setPublicationStatus(value);
      setValue(FIELD_NAME.PUBLICATION_STATUS, value, { shouldDirty: false });
    },
    [clearErrors, setValue]
  );

  return (
    <Fragment>
      {/* Section hero */}
      <SectionCard>
        <Tabs
          onTabChange={onTabChange}
          tabs={getSectionTabs(hasDoi)}
          value={publicationStatus}
        />
        <SectionContent>{children}</SectionContent>
      </SectionCard>
    </Fragment>
  );
};
