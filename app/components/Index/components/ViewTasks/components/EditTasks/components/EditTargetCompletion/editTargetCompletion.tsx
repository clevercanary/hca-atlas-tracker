import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { API } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { TaskCompletionDatesData as APITaskCompletionDatesData } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../../../../common/entities";
import { FormActions } from "../../../../../../../common/Form/components/FormActions/formActions";
import { mapTargetCompletion } from "../../../../../../../Form/components/Select/components/TargetCompletion/common/utils";
import { OnEditFn } from "../../common/entities";
import { TaskCompletionDatesData } from "./common/entities";
import { taskCompletionDatesSchema } from "./common/schema";
import { Content } from "./components/Dialog/components/Content/content";

const SCHEMA = taskCompletionDatesSchema;
const TITLE = "Edit target completion";

export interface EditTargetCompletionProps {
  onEdit: OnEditFn<TaskCompletionDatesData>;
}

export const EditTargetCompletion = ({
  onEdit,
}: EditTargetCompletionProps): JSX.Element => {
  return (
    <MenuItem
      onClick={(): void =>
        onEdit({
          dialog: {
            actions: FormActions,
            content: Content,
            title: TITLE,
          },
          formManager: {
            requestMethod: METHOD.PATCH,
            requestURL: API.TASKS_COMPLETION_DATES,
          },
          formMethod: {
            mapApiValues,
            schema: SCHEMA,
          },
        })
      }
    >
      Target Completion
    </MenuItem>
  );
};

function mapApiValues(
  data: TaskCompletionDatesData
): APITaskCompletionDatesData {
  return {
    ...data,
    targetCompletion: mapTargetCompletion(data.targetCompletion),
  };
}
