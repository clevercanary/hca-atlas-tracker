import { TEST_DOI_PUBLICATIONS } from "../../../testing/constants";
import { PublicationInfo } from "../../apis/catalog/hca-atlas-tracker/common/entities";

const actualPublications = jest.requireActual("../crossref");

const publications = {
  ...actualPublications,
  async getCrossrefPublicationInfo(
    doi: string
  ): Promise<PublicationInfo | null> {
    const publication = TEST_DOI_PUBLICATIONS.get(doi);
    if (!publication) return null;
    return publication;
  },
};

module.exports = publications;
