import { useState, useRef } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Eye, EyeOff, Trash2, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        updateUser({ photo: dataUrl });
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ photo: "" });
    toast({
      title: "Photo Removed",
      description: "Your profile photo has been removed.",
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      updateUser(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      // Simulate password change - in production this would be done server-side
      setTimeout(() => {
        setPasswords({ current: "", new: "", confirm: "" });
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-500">Manage your account information and preferences</p>
        </div>

        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {user?.photo ? (
                  <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    {formData.firstName.charAt(0).toUpperCase()}{formData.lastName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-photo-upload"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                    data-testid="button-upload-photo"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  {user?.photo && (
                    <Button
                      variant="outline"
                      onClick={handleRemovePhoto}
                      className="gap-2 text-red-600 hover:text-red-700"
                      data-testid="button-remove-photo"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500">JPG or PNG, max 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleProfileChange}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleProfileChange}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleProfileChange}
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={handleProfileChange}
                data-testid="input-company"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full gap-2"
              data-testid="button-save-profile"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card>
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
                className="w-full"
                data-testid="button-save-password"
              >
                {loading ? "Changing..." : "Update Password"}
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}
