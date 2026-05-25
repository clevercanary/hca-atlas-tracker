import { Stack } from "@mui/material";
import { JSX } from "react";
import { BioNetworkCell } from "../BioNetworkCell/bioNetworkCell";
import { BioNetworksCellProps } from "./entities";

export const BioNetworksCell = ({
  networkKeys,
}: BioNetworksCellProps): JSX.Element => {
  const uniqueKeys = Array.from(new Set(networkKeys));
  return (
    <Stack spacing={1} useFlexGap>
      {uniqueKeys.map((networkKey) => (
        <BioNetworkCell key={networkKey} networkKey={networkKey} />
      ))}
    </Stack>
  );
};
