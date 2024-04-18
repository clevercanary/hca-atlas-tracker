import { array, InferType, number, object, string, ValidationError } from "yup";
import { PublicationInfo } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { fetchCrossrefWork } from "./crossref-api";

const crossrefOrganizationAuthorSchema = object({
  name: string().required(),
}).strict();

const crossrefPersonAuthorSchema = object({
  family: string().required(),
  given: string().optional(),
}).strict();

const crossrefWorkSchema = object({
  author: array()
    .of(
      object()
        .required()
        .test(
          "author-variants",
          "Author must match organization or person form",
          (value) => {
            try {
              crossrefOrganizationAuthorSchema.validateSync(value);
              return true;
            } catch (e) {
              try {
                crossrefPersonAuthorSchema.validateSync(value);
                return true;
              } catch (e) {
                return false;
              }
            }
          }
        )
    )
    .required(),
  "container-title": array().of(string().required()).required(),
  institution: array()
    .of(object({ name: string().required() }).strict().required())
    .optional(),
  published: object({
    "date-parts": array()
      .of(array().of(number().required()).required().min(1).max(3))
      .required()
      .min(1),
  })
    .strict()
    .required(),
  "short-container-title": array().of(string().required()).required(),
  subtype: string().optional(),
  title: array().of(string().required()).required().min(1),
  type: string().optional(),
})
  .strict()
  .test(
    "type-subtype",
    'Must have type "journal-article" or subtype "preprint"',
    (value) => value.type === "journal-article" || value.subtype === "preprint"
  );

type CrossrefOrganizationAuthor = InferType<
  typeof crossrefOrganizationAuthorSchema
>;

type CrossrefPersonAuthor = InferType<typeof crossrefPersonAuthorSchema>;

export type CrossrefWork = Omit<
  InferType<typeof crossrefWorkSchema>,
  "author"
> & {
  author: (CrossrefOrganizationAuthor | CrossrefPersonAuthor)[];
};

export async function getCrossrefPublicationInfo(
  doi: string
): Promise<PublicationInfo | null> {
  const unvalidatedWork = await fetchCrossrefWork(doi);
  if (unvalidatedWork === null) return null;
  const work = crossrefWorkSchema.validateSync(unvalidatedWork) as CrossrefWork;
  let journal =
    work["container-title"][0] ||
    work["short-container-title"][0] ||
    work.institution?.[0].name;
  if (!journal) {
    if (work.subtype === "preprint") journal = "Preprint";
    else throw new ValidationError("Non-preprint work must have journal value");
  }
  return {
    authors: work.author.map((author) =>
      "name" in author
        ? { name: author.name, personalName: null }
        : { name: author.family, personalName: author.given || null }
    ),
    journal,
    publicationDate: work.published["date-parts"][0]
      .map((n) => n.toString().padStart(2, "0"))
      .join("-"),
    title: work.title[0],
  };
}
