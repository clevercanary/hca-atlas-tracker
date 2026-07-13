import React, { JSX } from "react";
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
  return <>{buildResults(errors, success, wrapResult)}</>;
};

function buildResults(
  errors: FormResponseErrors | null,
  success: React.ReactNode | null,
  wrapResult: ((result: React.ReactNode) => React.ReactNode) | null,
): React.ReactNode {
  if (errors !== null)
    return applyResultWrapper(<AdminFormErrors errors={errors} />, wrapResult);
  if (success !== null) return applyResultWrapper(success, wrapResult);
  return "";
}

function applyResultWrapper(
  result: React.ReactNode,
  wrapResult: ((result: React.ReactNode) => React.ReactNode) | null,
): React.ReactNode {
  return wrapResult === null ? result : wrapResult(result);
}

function defaultWrapResult(result: React.ReactNode): React.ReactNode {
  return <div style={{ marginTop: "1em" }}>{result}</div>;
}
