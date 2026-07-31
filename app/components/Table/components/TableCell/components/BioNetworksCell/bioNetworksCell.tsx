import { BioNetworkCell } from "@/app/components/Table/components/TableCell/components/BioNetworkCell/bioNetworkCell";
import { Stack } from "@mui/material";
import { JSX } from "react";
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
