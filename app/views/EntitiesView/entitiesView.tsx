import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useConfig } from "@databiosphere/findable-ui/lib/hooks/useConfig";
import { useLayoutState } from "@databiosphere/findable-ui/lib/hooks/useLayoutState";
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
  const {
    layoutState: { headerHeight },
  } = useLayoutState();
  useUpdateExploreState(canEdit);
  return canView ? (
    <ExploreView entityListType={entityListType} {...props} />
  ) : (
    <IndexView marginTop={headerHeight}>
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
