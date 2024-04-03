import { AzulEntityStaticResponse } from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import {
  PARAMS_INDEX_TAB,
  PARAMS_INDEX_UUID,
} from "@clevercanary/data-explorer-ui/lib/common/constants";
import { EntityConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { getEntityConfig } from "@clevercanary/data-explorer-ui/lib/config/utils";
import { getEntityService } from "@clevercanary/data-explorer-ui/lib/hooks/useEntityService";
import { EXPLORE_MODE } from "@clevercanary/data-explorer-ui/lib/hooks/useExploreMode";
import { database } from "@clevercanary/data-explorer-ui/lib/utils/database";
import { EntityDetailView } from "@clevercanary/data-explorer-ui/lib/views/EntityDetailView/entityDetailView";
import { config } from "app/config/config";
import fsp from "fs/promises";
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from "next";
import { ParsedUrlQuery } from "querystring";

interface PageUrl extends ParsedUrlQuery {
  entityListType: string;
  params: string[];
}

export interface EntityDetailPageProps extends AzulEntityStaticResponse {
  entityListType: string;
}

/**
 * Entity detail view page.
 * @param props - Entity detail view page props.
 * @param props.entityListType - Entity list type.
 * @returns Entity detail view component.
 */
const EntityDetailPage = (props: EntityDetailPageProps): JSX.Element => {
  if (!props.entityListType) return <></>;
  return <EntityDetailView {...props} />;
};

/**
 * Seed database.
 * @param entityListType - Entity list type.
 * @param entityConfig - Entity config.
 * @returns Promise<void>
 */
const seedDatabase = async function seedDatabase(
  entityListType: string,
  entityConfig: EntityConfig
): Promise<void> {
  const { entityMapper, label, staticLoadFile } = entityConfig;

  if (!staticLoadFile) {
    throw new Error(`staticLoadFile not found for entity entity ${label}`);
  }

  // Build database from configured JSON, if any.
  let jsonText;
  try {
    jsonText = await fsp.readFile(staticLoadFile, "utf8");
  } catch (e) {
    throw new Error(`File ${staticLoadFile} not found for entity ${label}`);
  }

  const object = JSON.parse(jsonText);
  const entities = entityMapper
    ? Object.values(object).map(entityMapper)
    : Object.values(object);

  // Seed entities.
  database.get().seed(entityListType, entities);
};

/**
 * getStaticPaths - return the list of paths to prerender for each entity type and its tabs.
 * @returns Promise<GetStaticPaths<PageUrl>>.
 */
export const getStaticPaths: GetStaticPaths<PageUrl> = async () => {
  return {
    fallback: "blocking", // 'blocking' will render the page on the first request
    paths: [], // An empty array means no paths are pre-rendered at build time
  };
};

export const getStaticProps: GetStaticProps<AzulEntityStaticResponse> = async ({
  params,
}: // eslint-disable-next-line sonarjs/cognitive-complexity -- ignore for now.
GetStaticPropsContext) => {
  const appConfig = config();
  const { entityListType } = params as PageUrl;
  const { entities } = appConfig;
  const entityConfig = getEntityConfig(entities, entityListType);
  const { exploreMode } = entityConfig;

  if (!entityConfig) {
    return {
      notFound: true,
    };
  }

  const props: EntityDetailPageProps = { entityListType: entityListType };

  // If the entity detail view is to be "statically loaded", we need to seed the database (for retrieval of the entity), or
  // fetch the entity detail from API.
  if (entityConfig.detail.staticLoad) {
    // Seed database.
    if (exploreMode === EXPLORE_MODE.CS_FETCH_CS_FILTERING) {
      await seedDatabase(entityConfig.route, entityConfig);
    }
    // Grab the entity detail, either from database or API.
    const { entityMapper, fetchEntity, fetchEntityDetail, path } =
      getEntityService(entityConfig, undefined);
    // When the entity detail is to be fetched from API, we only do so for the first tab.
    if (
      exploreMode === EXPLORE_MODE.SS_FETCH_SS_FILTERING &&
      params?.params?.[PARAMS_INDEX_TAB]
    ) {
      return { props };
    }

    if (exploreMode === EXPLORE_MODE.SS_FETCH_CS_FILTERING) {
      if (fetchEntity) {
        props.data = await fetchEntity(
          (params as PageUrl).params[PARAMS_INDEX_UUID],
          path,
          entityMapper
        );
      }
    } else {
      props.data = await fetchEntityDetail(
        (params as PageUrl).params[PARAMS_INDEX_UUID],
        path,
        undefined,
        undefined,
        undefined
      );
    }
  }

  return {
    props,
  };
};

export default EntityDetailPage;
