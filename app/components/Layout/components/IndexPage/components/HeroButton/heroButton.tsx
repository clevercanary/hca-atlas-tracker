import {
  ButtonLinkProps,
  BUTTON_COLOR,
} from "../../../../../common/Button/components/ButtonLink/buttonLink";
import { Button } from "./heroButton.styles";

export const HeroButton = (props: ButtonLinkProps): JSX.Element | null => {
  return <Button {...props} color={BUTTON_COLOR.PRIMARY} />;
};
