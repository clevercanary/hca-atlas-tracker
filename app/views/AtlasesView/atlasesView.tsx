import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useLayoutState } from "@databiosphere/findable-ui/lib/hooks/useLayoutState";
import { ExploreView } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../../components/Detail/components/TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { ROUTE } from "../../routes/constants";
import { IndexLayout, IndexView, IndexViewContent } from "./atlasesView.styles";

interface AtlasesViewProps {
  entityListType: string;
}

export const AtlasesView = ({
  entityListType,
  ...props
}: AtlasesViewProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const {
    layoutState: { headerHeight },
  } = useLayoutState();
  return isAuthenticated ? (
    <ExploreView entityListType={entityListType} {...props} />
  ) : (
    <IndexView marginTop={headerHeight}>
      <IndexLayout>
        <Title title="Manage Atlases" />
        <IndexViewContent>
          <AuthenticationRequired divider={<Divider />}>
            <Link label="Sign in" url={ROUTE.LOGIN} /> to manage atlases.
          </AuthenticationRequired>
        </IndexViewContent>
      </IndexLayout>
    </IndexView>
  );
};
