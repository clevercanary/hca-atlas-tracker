import { Title } from "@databiosphere/findable-ui/lib/components/Index/components/EntityView/components/layout/Title/title";
import { StyledGridEntityLayout } from "@databiosphere/findable-ui/lib/components/Index/index.styles";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useLayoutSpacing } from "@databiosphere/findable-ui/lib/hooks/UseLayoutSpacing/hook";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import {
  ExploreViewProps as DXExploreViewProps,
  ExploreView,
} from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../routes/constants";
import { StyledGrid, StyledTypography } from "./entitiesView.styles";
import { useUpdateExploreState } from "./hooks/useUpdateExploreState";

export const EntitiesView = ({
  entityListType,
  ...props
}: DXExploreViewProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = useFormManager();
  const { spacing } = useLayoutSpacing();
  useUpdateExploreState(canEdit);

  if (canView)
    return <ExploreView entityListType={entityListType} {...props} />;

  return (
    <StyledGrid {...spacing}>
      <StyledGridEntityLayout container>
        <Title />
      </StyledGridEntityLayout>
      <StyledTypography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_400}>
        <Link label="Sign in" url={ROUTE.LOGIN} /> to Atlas Tracker.
      </StyledTypography>
    </StyledGrid>
  );
};
