import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useLayoutState } from "@databiosphere/findable-ui/lib/hooks/useLayoutState";
import { ExploreView } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { RequestAccess } from "../../components/Detail/components/TrackerForm/components/Section/components/RequestAccess/requestAccess";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../routes/constants";
import { IndexLayout, IndexView, IndexViewContent } from "./atlasesView.styles";

interface AtlasesViewProps {
  entityListType: string;
}

export const AtlasesView = ({
  entityListType,
  ...props
}: AtlasesViewProps): JSX.Element => {
  const {
    access: { canView },
  } = useFormManager();
  const {
    layoutState: { headerHeight },
  } = useLayoutState();
  return canView ? (
    <ExploreView entityListType={entityListType} {...props} />
  ) : (
    <IndexView marginTop={headerHeight}>
      <IndexLayout>
        <Title title="Manage Atlases" />
        <IndexViewContent>
          <RequestAccess divider={<Divider />}>
            <Link label="Sign in" url={ROUTE.LOGIN} /> to manage atlases.
          </RequestAccess>
        </IndexViewContent>
      </IndexLayout>
    </IndexView>
  );
};
