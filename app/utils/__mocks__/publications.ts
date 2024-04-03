import { TEST_DOI_PUBLICATIONS } from "../../../testing/constants";
import { PublicationInfo } from "../../apis/catalog/hca-atlas-tracker/common/entities";

const actualPublications = jest.requireActual("../publications");

const publications = {
  ...actualPublications,
  async getPublicationInfo(doi: string): Promise<PublicationInfo> {
    const publication = TEST_DOI_PUBLICATIONS.get(doi);
    if (!publication) throw new Error("Error getting publication info");
    return publication;
  },
};

module.exports = publications;
