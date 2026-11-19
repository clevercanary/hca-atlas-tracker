import { NETWORK_KEYS } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { type DataDictionaryAttribute } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getAttributeBioNetworks,
  getAttributeEntrySheetRequired,
} from "@/app/utils/data-dictionary";
import dataDictionary from "hca-metadata-schema/core_data_dictionary.json";

const BASE_ATTRIBUTE: DataDictionaryAttribute = {
  description: "Test attribute",
  multivalued: false,
  name: "test_attribute",
  range: "string",
  required: true,
  title: "Test Attribute",
};

describe("getAttributeBioNetworks", () => {
  it("returns the attribute's bioNetworks list", () => {
    expect(
      getAttributeBioNetworks({
        ...BASE_ATTRIBUTE,
        annotations: { bioNetworks: ["adipose", "gut"] },
      }),
    ).toEqual(["adipose", "gut"]);
  });

  it("throws, naming the attribute, when the attribute has no bioNetworks list", () => {
    expect(() =>
      getAttributeBioNetworks({
        ...BASE_ATTRIBUTE,
        annotations: { annDataLocation: "obs" },
      }),
    ).toThrow("test_attribute");
  });

  it("throws, naming the value, when the bioNetworks list has a value that isn't a network key", () => {
    expect(() =>
      getAttributeBioNetworks({
        ...BASE_ATTRIBUTE,
        annotations: { bioNetworks: ["gut", "nervous_system"] },
      }),
    ).toThrow("nervous_system");
  });

  it("returns the bioNetworks of every attribute in the installed data dictionary, which together list exactly the tracker's network keys", () => {
    const dictionaryNetworks = new Set(
      dataDictionary.classes.flatMap((ddClass) =>
        ddClass.attributes.flatMap(getAttributeBioNetworks),
      ),
    );
    expect([...dictionaryNetworks].sort()).toEqual([...NETWORK_KEYS].sort());
  });
});

describe("getAttributeEntrySheetRequired", () => {
  it("returns false when entrySheetRequired is false, even if the attribute is required", () => {
    expect(
      getAttributeEntrySheetRequired({
        ...BASE_ATTRIBUTE,
        annotations: { entrySheetRequired: false },
        required: true,
      }),
    ).toEqual(false);
  });

  it("returns true when entrySheetRequired is true, even if the attribute isn't required", () => {
    expect(
      getAttributeEntrySheetRequired({
        ...BASE_ATTRIBUTE,
        annotations: { entrySheetRequired: true },
        required: false,
      }),
    ).toEqual(true);
  });

  it("returns true for a strongly recommended attribute without entrySheetRequired", () => {
    expect(
      getAttributeEntrySheetRequired({
        ...BASE_ATTRIBUTE,
        annotations: {},
        required: "strongly recommended",
      }),
    ).toEqual(true);
  });

  it("returns false for an attribute that isn't required and has no entrySheetRequired", () => {
    expect(
      getAttributeEntrySheetRequired({
        ...BASE_ATTRIBUTE,
        annotations: {},
        required: false,
      }),
    ).toEqual(false);
  });

  it("returns the attribute's required level when the attribute has no annotations", () => {
    expect(getAttributeEntrySheetRequired(BASE_ATTRIBUTE)).toEqual(true);
  });

  it("throws, naming the attribute, when entrySheetRequired isn't a boolean", () => {
    expect(() =>
      getAttributeEntrySheetRequired({
        ...BASE_ATTRIBUTE,
        annotations: { entrySheetRequired: "false" },
      }),
    ).toThrow("test_attribute");
  });

  it("returns a value for every attribute in the installed data dictionary", () => {
    for (const ddClass of dataDictionary.classes) {
      for (const attribute of ddClass.attributes) {
        expect(typeof getAttributeEntrySheetRequired(attribute)).toEqual(
          "boolean",
        );
      }
    }
  });
});
