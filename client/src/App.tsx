import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { FormProvider } from "@/lib/form-context";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import { ReactNode } from "react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/forms/new">
        <ProtectedRoute component={FormBuilder} />
      </Route>
      <Route path="/forms">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      {/* Default Route */}
      <Route path="/">
        {() => {
          const { user } = useAuth();
          const [, setLocation] = useLocation();
          if (user) {
            setLocation("/dashboard");
          } else {
            setLocation("/auth");
          }
          return null;
        }}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormProvider>
          <Toaster />
          <Router />
        </FormProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
