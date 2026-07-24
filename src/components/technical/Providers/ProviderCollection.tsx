import AuthProvider from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { ThemeProvider } from "@/components/technical/Providers/ThemeProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import stores from "@/stores";
import { NotificationModalProvider } from "./NotificationModalProvider";

const client = new QueryClient();

const ProviderCollection = (props: { children: ReactNode }) => {
  return (
    <Provider store={stores}>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <AuthProvider>
            {props.children}
            <NotificationModalProvider />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ProviderCollection;
