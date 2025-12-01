import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Users, HardDrive, FileText, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForms } from "@/lib/form-context";
import { User } from "@/lib/auth-context";

interface UserMetrics extends User {
  formsCount: number;
  storageUsed: number; // in KB
  formLimit: number;
  storageLimit: number; // in KB
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { forms, responses } = useForms();
  const [users, setUsers] = useState<UserMetrics[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserMetrics>>({});

  // Initialize and update user data from MongoDB
  useEffect(() => {
    const fetchUsersFromMongoDB = async () => {
      try {
        const adminMetrics = JSON.parse(localStorage.getItem("admin_users_metrics") || "[]");
        
        // Fetch users from API
        const response = await fetch("/api/admin/users", {
          headers: { "x-admin-session": localStorage.getItem("admin_session") || "" },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const allUsers = await response.json();
        
        if (allUsers.length === 0) {
          setUsers([]);
          return;
        }

        // Calculate storage for each user
        const storagePerUser = Math.round(JSON.stringify(forms).length / (allUsers.length || 1) / 1024);

        const updatedUsers: UserMetrics[] = allUsers.map((user: any) => {
          const existingMetrics = adminMetrics.find((m: any) => m.userId === user.id);
          return {
            ...user,
            storageUsed: storagePerUser,
            formLimit: existingMetrics?.formLimit || 10,
            storageLimit: existingMetrics?.storageLimit || 10240
          };
        });

        setUsers(updatedUsers);
        
        // Sync metrics to localStorage
        const updatedMetrics = updatedUsers.map(u => ({
          userId: u.id,
          formsCount: u.formsCount,
          storageUsed: u.storageUsed,
          formLimit: u.formLimit,
          storageLimit: u.storageLimit
        }));
        localStorage.setItem("admin_users_metrics", JSON.stringify(updatedMetrics));
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };
    
    fetchUsersFromMongoDB();
  }, [forms]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalForms: forms.length,
      totalResponses: responses.length,
      totalStorageUsed: users.reduce((sum, u) => sum + u.storageUsed, 0)
    };
  }, [users, forms, responses]);

  const handleEditUser = (user: UserMetrics) => {
    setEditingUserId(user.id);
    setEditData({ ...user });
  };

  const handleSaveUser = (userId: string) => {
    const updatedMetrics = users.map(u =>
      u.id === userId
        ? { ...u, formLimit: editData.formLimit || u.formLimit, storageLimit: editData.storageLimit || u.storageLimit }
        : u
    );
    setUsers(updatedMetrics);
    
    const metricsData = updatedMetrics.map(u => ({
      userId: u.id,
      formsCount: u.formsCount,
      storageUsed: u.storageUsed,
      formLimit: u.formLimit,
      storageLimit: u.storageLimit
    }));
    localStorage.setItem("admin_users_metrics", JSON.stringify(metricsData));
    setEditingUserId(null);
    toast({
      title: "User Updated",
      description: `Limits updated for ${editData.firstName} ${editData.lastName}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    toast({
      title: "Logged Out",
      description: "Admin session ended",
    });
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Manage users and system settings</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="gap-2"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Forms</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalForms}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Responses</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalResponses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <HardDrive className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Storage Used</p>
                <p className="text-2xl font-bold text-slate-900">{(stats.totalStorageUsed / 1024).toFixed(2)} MB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management - Real-Time Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Forms Created</TableHead>
                    <TableHead>Storage Used</TableHead>
                    <TableHead>Form Limit</TableHead>
                    <TableHead>Storage Limit (MB)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No users yet. Users will appear here when they sign up.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => {
                      const isEditing = editingUserId === user.id;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.firstName}</TableCell>
                          <TableCell>{user.lastName || "-"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell className="font-medium">{user.formsCount}</TableCell>
                          <TableCell>{(user.storageUsed / 1024).toFixed(2)} MB</TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editData.formLimit || user.formLimit}
                                onChange={(e) => setEditData({ ...editData, formLimit: parseInt(e.target.value) })}
                                className="w-20"
                                data-testid={`input-form-limit-${user.id}`}
                              />
                            ) : (
                              user.formLimit
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editData.storageLimit ? editData.storageLimit / 1024 : user.storageLimit / 1024}
                                onChange={(e) => setEditData({ ...editData, storageLimit: parseInt(e.target.value) * 1024 })}
                                className="w-24"
                                data-testid={`input-storage-limit-${user.id}`}
                              />
                            ) : (
                              (user.storageLimit / 1024).toFixed(1)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveUser(user.id)}
                                  className="gap-1"
                                  data-testid={`button-save-user-${user.id}`}
                                >
                                  <Save className="w-3 h-3" /> Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUserId(null)}
                                  className="gap-1"
                                  data-testid={`button-cancel-user-${user.id}`}
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                                className="gap-1"
                                data-testid={`button-edit-user-${user.id}`}
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
