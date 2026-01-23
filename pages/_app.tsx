import { JSX } from "react";
import "@databiosphere/findable-ui";
import { AzulEntitiesStaticResponse } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { Error } from "@databiosphere/findable-ui/lib/components/Error/error";
import { ErrorBoundary } from "@databiosphere/findable-ui/lib/components/ErrorBoundary";
import { Head } from "@databiosphere/findable-ui/lib/components/Head/head";
import { AppLayout } from "@databiosphere/findable-ui/lib/components/Layout/components/AppLayout/appLayout.styles";
import { Floating } from "@databiosphere/findable-ui/lib/components/Layout/components/Floating/floating";
import { Footer } from "@databiosphere/findable-ui/lib/components/Layout/components/Footer/footer";
import { Header as DXHeader } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { ConfigProvider as DXConfigProvider } from "@databiosphere/findable-ui/lib/providers/config";
import { ExploreStateProvider } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { LayoutDimensionsProvider } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/provider";
import { NextAuthAuthenticationProvider } from "@databiosphere/findable-ui/lib/providers/nextAuthAuthentication/provider";
import { ServicesProvider } from "@databiosphere/findable-ui/lib/providers/services/provider";
import { SystemStatusProvider } from "@databiosphere/findable-ui/lib/providers/systemStatus";
import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { DataExplorerError } from "@databiosphere/findable-ui/lib/types/error";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { createBreakpoints } from "@mui/system";
import { deepmerge } from "@mui/utils";
import { config } from "app/config/config";
import { NextPage } from "next";
import { Session } from "next-auth";
import type { AppProps } from "next/app";
import { AuthorizationProvider } from "../app/providers/authorization";
import { mergeAppTheme } from "../app/theme/theme";
import { BREAKPOINTS } from "../site-config/common/constants";
import {
  SESSION_REFETCH_INTERVAL,
  SESSION_TIMEOUT,
} from "../site-config/hca-atlas-tracker/local/authentication/constants";

export interface PageProps extends AzulEntitiesStaticResponse {
  pageTitle?: string;
  session?: Session | null;
}

export type NextPageWithComponent = NextPage & {
  Main?: typeof DXMain;
};

export type AppPropsWithComponent = AppProps & {
  Component: NextPageWithComponent;
};

function MyApp({ Component, pageProps }: AppPropsWithComponent): JSX.Element {
  // Set up the site configuration, layout and theme.
  const appConfig = config();
  const { layout, redirectRootToPath, themeOptions } = appConfig;
  const { floating, footer, header } = layout || {};
  const defaultTheme = createAppTheme(themeOptions);
  const appTheme = mergeAppTheme(defaultTheme);
  const { entityListType, pageTitle, session } = pageProps as PageProps;
  const Main = Component.Main || DXMain;
  return (
    <EmotionThemeProvider theme={appTheme}>
      <ThemeProvider theme={appTheme}>
        <DXConfigProvider config={appConfig} entityListType={entityListType}>
          <Head pageTitle={pageTitle} />
          <CssBaseline />
          <ServicesProvider>
            <SystemStatusProvider>
              <NextAuthAuthenticationProvider
                session={session}
                timeout={SESSION_TIMEOUT}
                refetchInterval={SESSION_REFETCH_INTERVAL}
              >
                <LayoutDimensionsProvider>
                  <AppLayout>
                    <ThemeProvider
                      theme={(theme: Theme): Theme =>
                        createTheme(
                          deepmerge(theme, {
                            breakpoints: createBreakpoints(BREAKPOINTS),
                          }),
                        )
                      }
                    >
                      <DXHeader {...header} />
                    </ThemeProvider>
                    <ExploreStateProvider entityListType={entityListType}>
                      <AuthorizationProvider>
                        <Main>
                          <ErrorBoundary
                            fallbackRender={({
                              error,
                              reset,
                            }: {
                              error: DataExplorerError;
                              reset: () => void;
                            }): JSX.Element => (
                              <Error
                                errorMessage={error.message}
                                requestUrlMessage={error.requestUrlMessage}
                                rootPath={redirectRootToPath}
                                onReset={reset}
                              />
                            )}
                          >
                            <Component {...pageProps} />
                            <Floating {...floating} />
                          </ErrorBoundary>
                        </Main>
                      </AuthorizationProvider>
                    </ExploreStateProvider>
                    <Footer {...footer} />
                  </AppLayout>
                </LayoutDimensionsProvider>
              </NextAuthAuthenticationProvider>
            </SystemStatusProvider>
          </ServicesProvider>
        </DXConfigProvider>
      </ThemeProvider>
    </EmotionThemeProvider>
  );
}

export default MyApp;
