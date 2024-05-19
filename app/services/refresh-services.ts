import { isCellxGeneRefreshing } from "./cellxgene";
import { areProjectsRefreshing } from "./hca-projects";

export function isAnyServiceRefreshing(): boolean {
  return areProjectsRefreshing() || isCellxGeneRefreshing();
}
