import { black08 } from "@databiosphere/findable-ui/lib/theme/common/palette";
import { Components, Theme } from "@mui/material";
import { black20 } from "./palette";

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
        boxShadow: `0 1px 0 0 ${black08}, inset 0 -1px 0 0 ${black20}`,
        color: theme.palette.common.white,
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&:hover": {
          backgroundColor: "#901C13",
          boxShadow: `0 1px 0 0 ${black08}, inset 0 -1px 0 0 ${black20}`,
        },
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&:active": {
          backgroundColor: "#901C13",
          boxShadow: "none",
        },
        // eslint-disable-next-line sort-keys -- disabling key order for readability
        "&.Mui-disabled": {
          backgroundColor: theme.palette.alert.main,
          boxShadow: `0 1px 0 0 ${black08}, inset 0 -1px 0 0 ${black20}`,
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
