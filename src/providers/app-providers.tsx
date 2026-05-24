"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ConfigProvider, App } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProvider } from "@/providers/auth-provider";
import theme from "@/config/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AntdRegistry>
        <ConfigProvider theme={theme}>
          <App>
            <AuthProvider>{children}</AuthProvider>
          </App>
        </ConfigProvider>
      </AntdRegistry>
    </QueryClientProvider>
  );
}
