import { AppHeader } from "@/app/components/Layout/components/Header/appHeader";
import { config } from "@/app/config/config";
import { useLogoutCallbackUrl } from "@/app/hooks/UseLogoutCallbackUrl/hook";
import { AuthorizationProvider } from "@/app/providers/authorization";
import { makeQueryClient } from "@/app/query/queryClient";
import { ROUTE } from "@/app/routes/constants";
import { mergeAppTheme } from "@/app/theme/theme";
import { BREAKPOINTS } from "@/site-config/common/constants";
import {
  SESSION_REFETCH_INTERVAL,
  SESSION_TIMEOUT,
} from "@/site-config/hca-atlas-tracker/local/authentication/constants";
import "@databiosphere/findable-ui";
import { type AzulEntitiesStaticResponse } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { Error } from "@databiosphere/findable-ui/lib/components/Error/error";
import { ErrorBoundary } from "@databiosphere/findable-ui/lib/components/ErrorBoundary/errorBoundary";
import { Head } from "@databiosphere/findable-ui/lib/components/Head/head";
import { AppLayout } from "@databiosphere/findable-ui/lib/components/Layout/components/AppLayout/appLayout.styles";
import { Floating } from "@databiosphere/findable-ui/lib/components/Layout/components/Floating/floating";
import { Footer } from "@databiosphere/findable-ui/lib/components/Layout/components/Footer/footer";
import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { NextAuthAuthenticationProvider } from "@databiosphere/findable-ui/lib/nextauth/provider";
import { ConfigProvider as DXConfigProvider } from "@databiosphere/findable-ui/lib/providers/config";
import { ExploreStateProvider } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { LayoutDimensionsProvider } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/provider";
import { ServicesProvider } from "@databiosphere/findable-ui/lib/providers/services/provider";
import { SystemStatusProvider } from "@databiosphere/findable-ui/lib/providers/systemStatus";
import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { type DataExplorerError } from "@databiosphere/findable-ui/lib/types/error";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import {
  createTheme,
  CssBaseline,
  type Theme,
  ThemeProvider,
} from "@mui/material";
import { AppCacheProvider } from "@mui/material-nextjs/v16-pagesRouter";
import { createBreakpoints } from "@mui/system";
import { deepmerge } from "@mui/utils";
import { QueryClientProvider } from "@tanstack/react-query";
import { type NextPage } from "next";
import { type Session } from "next-auth";
import { type AppProps } from "next/app";
import { type JSX, useState } from "react";

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

function MyApp(props: AppPropsWithComponent): JSX.Element {
  const { Component, pageProps } = props;
  // Set up the site configuration, layout and theme.
  const appConfig = config();
  const { layout, themeOptions } = appConfig;
  const { floating, footer, header } = layout || {};
  const defaultTheme = createAppTheme(themeOptions);
  const appTheme = mergeAppTheme(defaultTheme);
  const { pageTitle, session } = pageProps as PageProps;
  const Main = Component.Main || DXMain;
  const entityListType = pageProps.entityListType ?? "atlases";
  const logoutCallbackUrl = useLogoutCallbackUrl();
  const [queryClient] = useState(makeQueryClient);
  return (
    <AppCacheProvider {...props}>
      <EmotionThemeProvider theme={appTheme}>
        <ThemeProvider theme={appTheme}>
          <DXConfigProvider config={appConfig} entityListType={entityListType}>
            <Head pageTitle={pageTitle} />
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
              <ServicesProvider>
                <SystemStatusProvider>
                  <NextAuthAuthenticationProvider
                    logoutCallbackUrl={logoutCallbackUrl}
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
                          <AppHeader header={header} />
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
                                    onReset={reset}
                                    requestUrlMessage={error.requestUrlMessage}
                                    rootPath={ROUTE.ATLASES}
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
            </QueryClientProvider>
          </DXConfigProvider>
        </ThemeProvider>
      </EmotionThemeProvider>
    </AppCacheProvider>
  );
}

export default MyApp;
