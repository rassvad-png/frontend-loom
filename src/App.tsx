import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "jotai";
import { LanguageInitializer } from "@/components/LanguageInitializer";
import { apolloClient } from "@/lib/apollo";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Apps from "./pages/Apps";
import AppDetails from "./pages/AppDetails";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import DeveloperAppManagement from "./pages/DeveloperAppManagement";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider>
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageInitializer />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/games" element={<Games />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/app/:slug" element={<AppDetails />} />
              <Route path="/developer" element={<DeveloperDashboard />} />
              <Route path="/developer-account" element={<DeveloperDashboard />} />
              <Route path="/developer/app/:id" element={<DeveloperAppManagement />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ApolloProvider>
  </Provider>
);

export default App;
