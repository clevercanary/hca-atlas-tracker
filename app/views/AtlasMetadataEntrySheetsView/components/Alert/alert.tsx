import { ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import { AlertTitle } from "@mui/material";
import {
  BUTTON_COLOR,
  ButtonLink,
} from "../../../../components/common/Button/components/ButtonLink/buttonLink";
import { useEntity } from "../../../../providers/entity/hook";
import { ROUTE } from "../../../../routes/constants";
import { StyledAlert } from "./alert.styles";

export const Alert = (): JSX.Element => {
  const { pathParameter } = useEntity();
  return (
    <StyledAlert
      {...ALERT_PROPS.STANDARD_INFO}
      action={
        <ButtonLink
          color={BUTTON_COLOR.SECONDARY}
          href={{
            pathname: ROUTE.SOURCE_STUDIES,
            query: { atlasId: pathParameter?.atlasId },
          }}
        >
          Go to source studies
        </ButtonLink>
      }
    >
      <AlertTitle>Adding a new item to the list</AlertTitle>
      To add a new sheet, open the related source study and add it there. It
      will be added to the metadata entry list automatically.
    </StyledAlert>
  );
};
