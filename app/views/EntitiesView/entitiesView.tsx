import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useConfig } from "@databiosphere/findable-ui/lib/hooks/useConfig";
import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { ExploreViewProps as DXExploreViewProps } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { RequestAccess } from "../../components/Detail/components/TrackerForm/components/Section/components/RequestAccess/requestAccess";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../routes/constants";
import {
  ExploreView,
  IndexLayout,
  IndexView,
  IndexViewContent,
} from "./entitiesView.styles";
import { useUpdateExploreState } from "./hooks/useUpdateExploreState";

export const EntitiesView = ({
  entityListType,
  ...props
}: DXExploreViewProps): JSX.Element => {
  const {
    config: { explorerTitle },
    entityConfig,
  } = useConfig();
  const {
    access: { canEdit, canView },
  } = useFormManager();
  const { dimensions } = useLayoutDimensions();
  useUpdateExploreState(canEdit);
  return canView ? (
    <ExploreView entityListType={entityListType} {...props} />
  ) : (
    <IndexView marginTop={dimensions.header.height}>
      <IndexLayout>
        <Title title={entityConfig.explorerTitle || explorerTitle} />
        <IndexViewContent>
          <RequestAccess divider={<Divider />}>
            <Link label="Sign in" url={ROUTE.LOGIN} /> to Atlas Tracker.
          </RequestAccess>
        </IndexViewContent>
      </IndexLayout>
    </IndexView>
  );
};
