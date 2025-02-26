import { PaletteColorOptions } from "@mui/material/styles";

/**
 * Palette definitions.
 */
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    caution: PaletteColor;
  }

  interface PaletteOptions {
    caution?: PaletteColorOptions;
  }
}

/**
 * Chip prop options.
 */
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    caution: true;
  }
}
