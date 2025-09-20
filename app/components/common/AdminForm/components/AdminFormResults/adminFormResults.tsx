import React from "react";
import { FormResponseErrors } from "../../../../../hooks/useForm/common/entities";
import { AdminFormErrors } from "../AdminFormErrors/adminFormErrors";

export interface Props {
  errors: FormResponseErrors | null;
  success: React.ReactNode | null;
  wrapResult?: ((result: React.ReactNode) => React.ReactNode) | null;
}

export const AdminFormResults = ({
  errors,
  success,
  wrapResult = defaultWrapResult,
}: Props): JSX.Element => {
  return (
    <>
      {errors === null
        ? success === null
          ? ""
          : applyResultWrapper(success, wrapResult)
        : applyResultWrapper(<AdminFormErrors errors={errors} />, wrapResult)}
    </>
  );
};

function applyResultWrapper(
  result: React.ReactNode,
  wrapResult: ((result: React.ReactNode) => React.ReactNode) | null
): React.ReactNode {
  return wrapResult === null ? result : wrapResult(result);
}

function defaultWrapResult(result: React.ReactNode): React.ReactNode {
  return <div style={{ marginTop: "1em" }}>{result}</div>;
}
