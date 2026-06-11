import { Class } from "@databiosphere/findable-ui/lib/common/entities";
import dataDictionary from "../../catalog/downloaded/data-dictionary.json";

export function getDataDictionaryClass(className: string): Class {
  const ddClass = dataDictionary.classes.find((c) => c.name === className);
  if (!ddClass)
    throw new Error(`Data dictionary class not found: ${className}`);
  return ddClass;
}
