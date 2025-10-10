import { BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import {
  OnSubmitOptions,
  Payload,
} from "../../../../hooks/UseEditFileArchived/entities";

export interface Props extends BaseComponentProps {
  isArchived: boolean;
  payload: Payload;
  submitOptions?: OnSubmitOptions;
}
