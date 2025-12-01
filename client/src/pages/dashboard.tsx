import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileCheck, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useForms } from "@/lib/form-context";
import { formatDistanceToNow } from "date-fns";

// Mock data for stats (since we don't track responses yet)
const stats = [
  { label: "Total Forms", value: "12", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100" },
  { label: "Total Responses", value: "1,284", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  { label: "Completion Rate", value: "64%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
];

export default function Dashboard() {
  const { forms } = useForms();

  // Calculate real total forms for the stat
  const totalFormsStat = { 
    ...stats[0], 
    value: forms.length.toString() 
  };

  const displayStats = [totalFormsStat, stats[1], stats[2]];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your form performance</p>
          </div>
          <Link href="/forms/new">
            <Button className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create New Form
            </Button>
          </Link>
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
              <Card key={form.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {form.status}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(form.lastUpdated), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{form.title}</CardTitle>
                  <CardDescription>{form.responses} responses collected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* Random progress bar for visual effect since we don't have real goals yet */}
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Card */}
            <Link href="/forms/new">
              <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[200px]">
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
