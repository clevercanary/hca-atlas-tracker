import { ROUTE } from "./constants";

export type RouteKey = keyof typeof ROUTE;
export type RouteValue = (typeof ROUTE)[RouteKey];
