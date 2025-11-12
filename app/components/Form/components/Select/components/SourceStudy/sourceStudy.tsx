import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, ReactNode, useEffect, useMemo } from "react";
import { useFetchDataState } from "../../../../../../hooks/useFetchDataState";
import { useEntity } from "../../../../../../providers/entity/hook";
import { fetchData } from "../../../../../../providers/fetchDataState/actions/fetchData/dispatch";
import { Entity } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { SOURCE_STUDIES } from "../../../../../../views/SourceStudiesView/hooks/useFetchSourceStudies";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";
import { getPublicationStringById } from "./utils";

export const SourceStudy = forwardRef<HTMLInputElement, SelectProps>(
  function SourceStudy(
    { className, ...props }: SelectProps,
    ref
  ): JSX.Element | null {
    const {
      data: { sourceStudies },
    } = useEntity() as Entity;
    const { fetchDataDispatch } = useFetchDataState();
    const publicationStringById = useMemo(
      () => getPublicationStringById(sourceStudies),
      [sourceStudies]
    );

    useEffect(() => {
      if (sourceStudies?.length) return;
      fetchDataDispatch(fetchData([SOURCE_STUDIES]));
    }, [fetchDataDispatch, sourceStudies]);

    return (
      <Select
        {...props}
        className={className}
        disabled={!sourceStudies}
        ref={ref}
        renderValue={renderValue(publicationStringById)}
        value={props.value ?? ""}
      >
        {[...publicationStringById].map(([id, publicationString]) => {
          return (
            <MMenuItem key={id} value={id} sx={{ whiteSpace: "normal" }}>
              {publicationString}
            </MMenuItem>
          );
        })}
      </Select>
    );
  }
);

/**
 * Renders select value.
 * @param publicationStringById - Publication string by source study ID.
 * @returns select value.
 */
function renderValue(
  publicationStringById: Map<string, string>
): (value: unknown) => ReactNode {
  return (value: unknown): ReactNode => {
    if (value && typeof value === "string")
      return publicationStringById?.get(value) ?? value;
    return "Choose...";
  };
}
