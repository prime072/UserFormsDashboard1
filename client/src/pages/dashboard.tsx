import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileCheck, TrendingUp, Edit, ExternalLink, Share2, MoreHorizontal, Trash2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForms } from "@/lib/form-context";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const staticStats = [
  { label: "Completion Rate", value: "64%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
];

export default function Dashboard() {
  const { forms, responses, deleteForm } = useForms();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get form limit from admin settings
  const adminUserMetrics = JSON.parse(localStorage.getItem("admin_users_metrics") || "[]");
  const userMetrics = adminUserMetrics.find((m: any) => m.userId === user?.id);
  const formLimit = userMetrics?.formLimit || 10;
  const canCreateForm = forms.length < formLimit;
  const formsOverLimit = Math.max(0, forms.length - formLimit);

  const totalResponses = responses.length;
  const totalFormsStat = { 
    label: "Total Forms", 
    value: forms.length.toString(), 
    icon: FileCheck, 
    color: "text-blue-600", 
    bg: "bg-blue-100" 
  };
  
  const totalResponsesStat = {
    label: "Total Responses",
    value: totalResponses.toString(),
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100"
  };

  const displayStats = [totalFormsStat, totalResponsesStat, staticStats[0]];

  const handleShare = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/s/${formId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Form link copied to clipboard!",
    });
  };

  const handleDelete = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this form?")) {
      deleteForm(formId);
      toast({
        title: "Form Deleted",
        description: "The form has been removed.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Over Limit Alert */}
        {formsOverLimit > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {formsOverLimit} form(s) over your limit of {formLimit}. Only delete operations are allowed. Please delete some forms to create new ones.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your form performance</p>
            <p className="text-sm text-slate-600 mt-2">Forms: {forms.length}/{formLimit}</p>
          </div>
          {canCreateForm ? (
            <Link href="/forms/new">
              <Button 
                className="shadow-lg hover:shadow-xl transition-all"
                data-testid="button-create-form"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </Link>
          ) : (
            <Button 
              className="shadow-lg hover:shadow-xl transition-all"
              disabled
              data-testid="button-create-form"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Form
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayStats.map((stat) => (
            <Card key={stat.label} className="border-slate-100 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Forms */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card 
                key={form.id} 
                className="group hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
                onClick={() => setLocation(`/forms/${form.id}/edit`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {form.status}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/forms/${form.id}/edit`); }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/forms/${form.id}/responses`); }}>
                          <Users className="w-4 h-4 mr-2" /> View Responses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleShare(e, form.id)}>
                          <Share2 className="w-4 h-4 mr-2" /> Share Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/s/${form.id}`, '_blank'); }}>
                          <ExternalLink className="w-4 h-4 mr-2" /> View Live
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={(e) => handleDelete(e, form.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">{form.title}</CardTitle>
                  <CardDescription>{form.responses} responses collected</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(form.responses, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Updated {formatDistanceToNow(new Date(form.lastUpdated || new Date()), { addSuffix: true })}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 gap-2 border-t bg-slate-50/50 p-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setLocation(`/forms/${form.id}/edit`); }}>
                    <Edit className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); window.open(`/s/${form.id}`, '_blank'); }}>
                    <ExternalLink className="w-3 h-3 mr-2" /> View
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Create New Card */}
            <Link href="/forms/new">
              <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[250px]">
                <Plus className="w-10 h-10 mb-2 opacity-50" />
                <span className="font-medium">Create New Form</span>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}
