import {
  Select,
  SelectProps,
} from "@/app/components/common/Form/components/Select/select";
import { useEntity } from "@/app/providers/entity/hook";
import { useFetchSourceStudies } from "@/app/views/SourceStudiesView/hooks/UseFetchSourceStudies/hook";
import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, JSX, ReactNode, useMemo } from "react";
import {
  buildPublicationStringMap,
  getPublicationStringOptions,
} from "./utils";

export const SourceStudy = forwardRef<HTMLInputElement, SelectProps>(
  function SourceStudy(
    { className, ...props }: SelectProps,
    ref,
  ): JSX.Element | null {
    const { pathParameter } = useEntity();
    // Fetches lazily: this Select only mounts when the user opens the row-edit
    // dropdown, so the source studies are fetched on demand (React Query
    // caches/dedupes the result).
    const { data: sourceStudies } = useFetchSourceStudies(pathParameter ?? {});
    const publicationStringById = useMemo(
      () => buildPublicationStringMap(sourceStudies),
      [sourceStudies],
    );
    const publicationStringIds = useMemo(
      () => getPublicationStringOptions(publicationStringById),
      [publicationStringById],
    );

    return (
      <Select
        {...props}
        className={className}
        disabled={!sourceStudies}
        ref={ref}
        renderValue={renderValue(publicationStringById)}
        value={props.value ?? ""}
      >
        {publicationStringIds.map(([id, publicationString]) => {
          return (
            <MMenuItem key={id} value={id} sx={{ whiteSpace: "normal" }}>
              {publicationString}
            </MMenuItem>
          );
        })}
      </Select>
    );
  },
);

/**
 * Renders select value.
 * @param publicationStringById - Publication string by source study ID.
 * @returns select value.
 */
function renderValue(
  publicationStringById: Map<string, string>,
): (value: unknown) => ReactNode {
  return (value: unknown): ReactNode => {
    if (value && typeof value === "string")
      return publicationStringById?.get(value) ?? value;
    return "Choose...";
  };
}
