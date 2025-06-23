import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import { Components, Theme } from "@mui/material";
import { COLOR_MIXES as APP_COLOR_MIXES } from "../../styles/common/constants/colorMixes";

/**
 * MuiButton Component
 * @param theme - Theme.
 * @returns MuiButton component theme styles.
 */
export const MuiButton = (theme: Theme): Components["MuiButton"] => {
  return {
    styleOverrides: {
      containedError: {
        backgroundColor: theme.palette.alert.main,
        boxShadow: `0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08}, inset 0 -1px 0 0 ${APP_COLOR_MIXES.COMMON_BLACK_20}`,
        color: theme.palette.common.white,
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&:hover": {
          backgroundColor: "#901C13",
          boxShadow: `0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08}, inset 0 -1px 0 0 ${APP_COLOR_MIXES.COMMON_BLACK_20}`,
        },
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&:active": {
          backgroundColor: "#901C13",
          boxShadow: "none",
        },
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&.Mui-disabled": {
          backgroundColor: theme.palette.alert.main,
          boxShadow: `0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08}, inset 0 -1px 0 0 ${APP_COLOR_MIXES.COMMON_BLACK_20}`,
          color: theme.palette.common.white,
          opacity: 0.5,
        },
      },
      containedSizeSmall: {
        padding: "8px 16px",
      },
      outlinedSizeSmall: {
        padding: "8px 16px",
      },
    },
  };
};

export const MuiChip = (theme: Theme): Components<Theme>["MuiChip"] => {
  return {
    variants: [
      ...(theme.components?.MuiChip?.variants ?? []),
      {
        props: { color: "default", variant: "status" },
        style: {
          backgroundColor: theme.palette.smoke.main,
          color: theme.palette.ink.light,
        },
      },
      {
        props: { color: "caution" },
        style: {
          backgroundColor: theme.palette.caution.light,
          color: theme.palette.caution.main,
        },
      },
    ],
  };
};
