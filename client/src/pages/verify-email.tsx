import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/verify-email/:token");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.token) {
      verifyEmail(params.token);
    }
  }, [params?.token]);

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setVerified(true);
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });
        setTimeout(() => setLocation("/"), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to verify email");
      }
    } catch (error) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Confirming your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {loading && (
            <div className="space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto" />
              <p className="text-slate-600">Verifying your email...</p>
            </div>
          )}

          {!loading && verified && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Email Verified!</h3>
                <p className="text-slate-600 mt-2">Your email has been verified successfully.</p>
              </div>
              <p className="text-sm text-slate-500">Redirecting to login page...</p>
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-go-to-login"
              >
                Go to Login
              </Button>
            </div>
          )}

          {!loading && !verified && error && (
            <div className="space-y-4">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
