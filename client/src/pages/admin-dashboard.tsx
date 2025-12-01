import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Users, HardDrive, FileText, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForms } from "@/lib/form-context";

interface UserMetrics {
  userId: string;
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

  // Initialize users data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_users_metrics");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      // Create default user entry
      const defaultUser: UserMetrics = {
        userId: "user_1",
        formsCount: forms.length,
        storageUsed: Math.round(JSON.stringify(forms).length / 1024),
        formLimit: 10,
        storageLimit: 10240 // 10MB in KB
      };
      setUsers([defaultUser]);
      localStorage.setItem("admin_users_metrics", JSON.stringify([defaultUser]));
    }
  }, []);

  // Update user metrics when forms change
  useEffect(() => {
    if (users.length > 0) {
      const storageUsed = Math.round(JSON.stringify(forms).length / 1024);
      const updatedUsers = users.map(u => ({
        ...u,
        formsCount: forms.length,
        storageUsed
      }));
      setUsers(updatedUsers);
      localStorage.setItem("admin_users_metrics", JSON.stringify(updatedUsers));
    }
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
    setEditingUserId(user.userId);
    setEditData({ ...user });
  };

  const handleSaveUser = (userId: string) => {
    const updatedUsers = users.map(u =>
      u.userId === userId
        ? { ...u, ...editData }
        : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("admin_users_metrics", JSON.stringify(updatedUsers));
    setEditingUserId(null);
    toast({
      title: "User Updated",
      description: `Limits updated for ${userId}`,
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
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Forms Created</TableHead>
                    <TableHead>Storage Used</TableHead>
                    <TableHead>Form Limit</TableHead>
                    <TableHead>Storage Limit (MB)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => {
                    const isEditing = editingUserId === user.userId;
                    return (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.userId}</TableCell>
                        <TableCell>{user.formsCount}</TableCell>
                        <TableCell>{(user.storageUsed / 1024).toFixed(2)} MB</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData.formLimit || user.formLimit}
                              onChange={(e) => setEditData({ ...editData, formLimit: parseInt(e.target.value) })}
                              className="w-20"
                              data-testid={`input-form-limit-${user.userId}`}
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
                              data-testid={`input-storage-limit-${user.userId}`}
                            />
                          ) : (
                            <>{(user.storageLimit / 1024).toFixed(1)}</>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleSaveUser(user.userId)}
                                className="gap-1"
                                data-testid={`button-save-user-${user.userId}`}
                              >
                                <Save className="w-3 h-3" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUserId(null)}
                                className="gap-1"
                                data-testid={`button-cancel-user-${user.userId}`}
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
                              data-testid={`button-edit-user-${user.userId}`}
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
