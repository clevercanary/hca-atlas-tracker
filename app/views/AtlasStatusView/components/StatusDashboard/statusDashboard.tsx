import { JSX, useMemo } from "react";
import { MetricCard } from "./components/MetricCard/metricCard";
import { StyledGrid } from "./statusDashboard.styles";
import { StatusDashboardProps } from "./types";
import {
  buildIntegratedObjectsCard,
  buildSourceDatasetsCard,
  buildSourceStudiesCard,
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

  return (
    <StyledGrid>
      <MetricCard card={sourceStudiesCard} />
      <MetricCard card={sourceDatasetsCard} />
      <MetricCard card={integratedObjectsCard} />
    </StyledGrid>
  );
};
