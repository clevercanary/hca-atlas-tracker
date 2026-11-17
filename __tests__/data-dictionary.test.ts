import { NETWORK_KEYS } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { getAttributeBioNetworks } from "@/app/utils/data-dictionary";
import { type Attribute } from "@databiosphere/findable-ui/lib/common/entities";
import dataDictionary from "hca-metadata-schema/core_data_dictionary.json";

const BASE_ATTRIBUTE: Attribute = {
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
