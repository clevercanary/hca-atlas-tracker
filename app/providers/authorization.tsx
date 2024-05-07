import { createContext, ReactNode } from "react";
import { HCAAtlasTrackerActiveUser } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchUser } from "../hooks/useFetchUser";

export interface AuthorizationContextProps {
  user?: HCAAtlasTrackerActiveUser;
}

export const AuthorizationContext = createContext<AuthorizationContextProps>(
  {}
);

interface Props {
  children: ReactNode | ReactNode[];
}

export function AuthorizationProvider({ children }: Props): JSX.Element {
  const user = useFetchUser();
  return (
    <AuthorizationContext.Provider value={{ user }}>
      {children}
    </AuthorizationContext.Provider>
  );
}
