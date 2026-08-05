import { useForm } from "@/app/hooks/useForm/useForm";
import { renderHook } from "@testing-library/react";
import { object, type ObjectSchema, string } from "yup";

interface ApiEntity {
  id: string;
  name: string;
}

interface FormValues {
  name: string;
}

const SCHEMA = object({ name: string().defined() }) as ObjectSchema<FormValues>;

/**
 * Map the API entity to the form's schema values.
 * @param entity - API entity.
 * @returns Partial form values.
 */
function mapSchemaValues(entity?: ApiEntity): Partial<FormValues> {
  return { name: entity?.name ?? "" };
}

describe("useForm data (mirror removed)", () => {
  it("returns apiData directly as data and tracks its reference changes", () => {
    const apiData: ApiEntity = { id: "1", name: "before" };

    const { rerender, result } = renderHook(
      ({ entity }: { entity: ApiEntity }) =>
        useForm<FormValues, ApiEntity>(SCHEMA, entity, mapSchemaValues),
      { initialProps: { entity: apiData } },
    );

    // data is the React Query result itself, not a local copy.
    expect(result.current.data).toBe(apiData);

    // When apiData changes (e.g. a save writes the response to the cache), data
    // follows it — no separate mirror to fall out of sync.
    const next: ApiEntity = { id: "1", name: "after" };
    rerender({ entity: next });
    expect(result.current.data).toBe(next);
  });
});
