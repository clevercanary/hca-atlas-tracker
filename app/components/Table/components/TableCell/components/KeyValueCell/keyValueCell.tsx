import {
  KeyValuePairs,
  type KeyValuePairsProps,
} from "@databiosphere/findable-ui/lib/components/common/KeyValuePairs/keyValuePairs";
import { type BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { type CellContext, type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { KeyElType } from "./components/KeyElType/keyElType";
import { KeyValueElType } from "./components/KeyValueElType/keyValueElType";
import { KeyValuesElType } from "./components/KeyValuesElType/keyValuesElType";

export const KeyValueCell = <
  T extends RowData,
  TValue extends KeyValuePairsProps = KeyValuePairsProps,
>({
  className,
  getValue,
}: BaseComponentProps & CellContext<T, TValue>): JSX.Element | null => {
  const props = getValue();
  if (!props) return null;
  return (
    <KeyValuePairs
      className={className}
      KeyElType={KeyElType}
      KeyValueElType={KeyValueElType}
      KeyValuesElType={KeyValuesElType}
      {...props}
    />
  );
};
