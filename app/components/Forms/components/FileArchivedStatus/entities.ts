import {
  type OnSubmitOptions,
  type Payload,
} from "@/app/hooks/UseEditFileArchived/entities";
import { type BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";

export interface Props extends BaseComponentProps {
  isArchived: boolean;
  options?: OnSubmitOptions;
  payload: Payload;
}
