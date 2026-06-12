import { Stack } from "@mui/material";
import { JSX, useMemo } from "react";
import { MetricCard } from "./components/MetricCard/metricCard";
import { StatusFlagCard } from "./components/StatusFlagCard/statusFlagCard";
import { StyledGrid } from "./statusDashboard.styles";
import { StatusDashboardProps } from "./types";
import {
  buildIntegratedObjectsCard,
  buildSourceDatasetsCard,
  buildSourceStudiesCard,
  buildStatusFlags,
} from "./utils";

export const StatusDashboard = ({
  summary,
}: StatusDashboardProps): JSX.Element => {
  const sourceStudiesCard = useMemo(
    () => buildSourceStudiesCard(summary),
    [summary],
  );
  const sourceDatasetsCard = useMemo(
    () => buildSourceDatasetsCard(summary),
    [summary],
  );
  const integratedObjectsCard = useMemo(
    () => buildIntegratedObjectsCard(summary),
    [summary],
  );
  const statusFlags = useMemo(() => buildStatusFlags(summary), [summary]);

  return (
    <StyledGrid>
      <Stack spacing={4} useFlexGap>
        <MetricCard card={sourceStudiesCard} />
        <StatusFlagCard flags={statusFlags} />
      </Stack>
      <MetricCard card={sourceDatasetsCard} />
      <MetricCard card={integratedObjectsCard} />
    </StyledGrid>
  );
};
