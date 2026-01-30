import { JSX } from "react";
import { FormResponseErrors } from "../../../../../hooks/useForm/common/entities";

export interface Props {
  errors: FormResponseErrors;
}

export const AdminFormErrors = ({ errors }: Props): JSX.Element => {
  return "message" in errors ? (
    <div>Error: {errors.message}</div>
  ) : (
    <>
      <div>Error:</div>
      {Object.entries(errors.errors).map(([field, message]) => (
        <div key={field}>
          {field}: {message}
        </div>
      ))}
    </>
  );
};
