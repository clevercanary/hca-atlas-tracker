import {
  OnSubmitOptions,
  Payload,
} from "../../../../hooks/UseEditFileArchived/entities";

export interface Props {
  isArchived: boolean;
  payload: Payload;
  submitOptions?: OnSubmitOptions;
}
