import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId);
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: "Check your email for the verification code",
        });
      } else {
        const data = await response.json();
        setError(data.error || "Failed to request OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        setResetToken(data.resetToken);
        setStep("password");
        toast({
          title: "OTP Verified",
          description: "Now you can reset your password",
        });
      } else {
        const data = await response.json();
        setError(data.error || "Failed to verify OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please enter both passwords");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, resetToken, newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password reset successfully. Please log in.",
        });
        setLocation("/");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setLocation("/")}
              className="p-1 hover:bg-slate-100 rounded"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Recover your account securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <Button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full"
                data-testid="button-request-otp"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Verification Code</label>
                <p className="text-xs text-slate-500 mb-2">Enter the 6-digit code sent to {email}</p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  data-testid="input-otp"
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
                data-testid="button-verify-otp"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                variant="outline"
                className="w-full"
                data-testid="button-change-email"
              >
                Change Email
              </Button>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full"
                data-testid="button-reset-password"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
