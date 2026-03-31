import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { router } from "./router";
import "./index.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
