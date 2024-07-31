import { Session } from "next-auth";
import { useSession } from "next-auth/react";

type UseNextAuth =
  | {
      isAuthenticated: true;
      session: Session;
    }
  | {
      isAuthenticated: false;
      session: null;
    };

export const useNextAuth = (): UseNextAuth => {
  const sessionInfo = useSession();
  return sessionInfo.status === "authenticated"
    ? {
        isAuthenticated: true,
        session: sessionInfo.data,
      }
    : {
        isAuthenticated: false,
        session: null,
      };
};
