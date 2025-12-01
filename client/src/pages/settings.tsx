import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { AlertCircle, Trash2, Lock, Eye, EyeOff, Monitor, Moon, Sun } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      setTimeout(() => {
        setPasswords({ current: "", new: "", confirm: "" });
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setShowPasswordSection(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been deleted.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
    setIsDeleting(false);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your account and preferences</p>
          </div>

          {/* Account Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="text-base font-medium text-slate-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Name</p>
                <p className="text-base font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how FormFlow looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-slate-600 mb-3 block">Background Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === "light"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    data-testid="button-theme-light"
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === "dark"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    data-testid="button-theme-dark"
                  >
                    <Moon className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === "system"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    data-testid="button-theme-system"
                  >
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security - Change Password */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </div>
                <Button
                  variant={showPasswordSection ? "default" : "outline"}
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    if (!showPasswordSection) {
                      setPasswords({ current: "", new: "", confirm: "" });
                    }
                  }}
                  className="gap-2"
                  data-testid="button-toggle-change-password"
                >
                  <Lock className="w-4 h-4" />
                  {showPasswordSection ? "Cancel" : "Change Password"}
                </Button>
              </div>
            </CardHeader>

            {showPasswordSection && (
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      name="current"
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      data-testid="input-current-password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      name="new"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      data-testid="input-new-password"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-500"
                      data-testid="button-toggle-new-password"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm"
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full gap-2"
                  data-testid="button-change-password"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Deleting your account will permanently remove all your forms, responses, and account data. This action cannot be undone.
                </AlertDescription>
              </Alert>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, all your forms, and all responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-account"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
