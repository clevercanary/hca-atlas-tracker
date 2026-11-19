import { groupByCategory } from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX } from "react";
import {
  StyledCheck,
  StyledCheckTitle,
  StyledGrid,
  StyledGroup,
} from "./checksGrid.styles";
import { type Props } from "./types";

export const ChecksGrid = ({ checks }: Props): JSX.Element => {
  if (!checks.length) {
    return (
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
      >
        No passed checks recorded.
      </Typography>
    );
  }
  return (
    <>
      {groupByCategory(checks).map(([category, group]) => (
        <StyledGroup key={category}>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
          >
            {category}
          </Typography>
          <StyledGrid>
            {group.map((check) => (
              <StyledCheck key={check.id} elevation={0}>
                <StyledCheckTitle>
                  <SuccessIcon
                    color="success"
                    fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                  />
                  <Typography
                    color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                    variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
                  >
                    {check.title}
                  </Typography>
                </StyledCheckTitle>
                <Typography
                  color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
                  variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
                >
                  {check.detail}
                </Typography>
              </StyledCheck>
            ))}
          </StyledGrid>
        </StyledGroup>
      ))}
    </>
  );
};
