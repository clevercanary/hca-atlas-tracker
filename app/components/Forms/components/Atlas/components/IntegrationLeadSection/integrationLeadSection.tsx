import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { RemoveIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/RemoveIcon/removeIcon";
import { IconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { useFieldArray } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../../../views/AddNewAtlasView/common/entities";
import { InputController } from "../../../../../common/Form/components/Controllers/components/InputController/inputController";
import { SectionControllersProps } from "../../../../common/entities";
import {
  AddLeadRow,
  IntegrationLeadSectionCard,
  LeadControllers,
  NameInputController,
  RemoveLeadCell,
} from "./integrationLeadSection.styles";

export const IntegrationLeadSection = ({
  formManager,
  formMethod,
  fullWidth,
}: SectionControllersProps<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>): JSX.Element => {
  const { append, fields, remove } = useFieldArray({
    control: formMethod.control,
    name: "integrationLead",
  });
  const multiLead = fields.length > 1;
  return (
    <IntegrationLeadSectionCard fullWidth={fullWidth} multiLead={multiLead}>
      {fields.map((item, index) => {
        return (
          <LeadControllers key={item.id}>
            <NameInputController
              formManager={formManager}
              formMethod={formMethod}
              inputProps={{ label: "Full name" }}
              name={`integrationLead.${index}.name`}
            />
            <InputController
              formManager={formManager}
              formMethod={formMethod}
              inputProps={{ label: "Email" }}
              name={`integrationLead.${index}.email`}
            />
            {multiLead ? (
              <RemoveLeadCell>
                {/* TODO use correct icon */}
                <IconButton
                  color="secondary"
                  Icon={RemoveIcon}
                  onClick={() => remove(index)}
                  size="medium"
                />
              </RemoveLeadCell>
            ) : null}
          </LeadControllers>
        );
      })}
      <AddLeadRow>
        <ButtonSecondary
          startIcon={<AddIcon />}
          onClick={() => append({ email: "", name: "" })}
        >
          Add lead
        </ButtonSecondary>
      </AddLeadRow>
    </IntegrationLeadSectionCard>
  );
};
