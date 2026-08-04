import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type TaskCompletionDatesData as APITaskCompletionDatesData } from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "@/app/common/entities";
import { FormActions } from "@/app/components/common/Form/components/FormActions/formActions";
import { mapTargetCompletion } from "@/app/components/Form/components/Select/components/TargetCompletion/common/utils";
import { type OnEditFn } from "@/app/components/Index/components/ViewTasks/components/EditTasks/common/entities";
import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { type JSX } from "react";
import { type TaskCompletionDatesData } from "./common/entities";
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
  data: TaskCompletionDatesData,
): APITaskCompletionDatesData {
  return {
    ...data,
    targetCompletion: mapTargetCompletion(data.targetCompletion),
  };
}
