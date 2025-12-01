import { useState, useMemo } from "react";
import Layout from "@/components/layout";
import { useForms } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MessageSquare, Users, TrendingUp, Search, ChevronDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function ResponsesDashboard() {
  const { forms, responses, getForm } = useForms();
  const { toast } = useToast();
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

  const filteredResponses = useMemo(() => {
    let result = responses;
    
    if (selectedForm && selectedForm !== "all") {
      result = result.filter(r => r.formId === selectedForm);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(r => {
        const dataString = JSON.stringify(r.data).toLowerCase();
        return dataString.includes(searchLower);
      });
    }
    
    return result;
  }, [selectedForm, searchTerm, responses]);

  const stats = useMemo(() => {
    return {
      totalResponses: responses.length,
      totalForms: forms.length,
      averagePerForm: forms.length > 0 ? Math.round(responses.length / forms.length) : 0,
      responseRate: forms.length > 0 ? Math.round((responses.length / (forms.length * 10)) * 100) : 0
    };
  }, [forms, responses]);

  const chartData = useMemo(() => {
    const formCounts: Record<string, number> = {};
    responses.forEach(resp => {
      const form = getForm(resp.formId);
      const formName = form?.title || resp.formId;
      formCounts[formName] = (formCounts[formName] || 0) + 1;
    });
    return Object.entries(formCounts).map(([name, count]) => ({ name, responses: count }));
  }, [responses, getForm]);

  const timelineData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    responses.forEach(resp => {
      const date = new Date(resp.submittedAt).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
  }, [responses]);

  const handleExportResponses = () => {
    const data = filteredResponses.map(resp => ({
      'Form': getForm(resp.formId)?.title || resp.formId,
      'Submitted At': new Date(resp.submittedAt).toLocaleString(),
      ...resp.data
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `form-responses-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Responses exported to Excel",
    });
  };

  const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Responses Dashboard</h1>
          <p className="text-slate-500 mt-2">Monitor and analyze all form responses in one place</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Responses</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalResponses}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Forms</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalForms}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Avg per Form</p>
                <p className="text-2xl font-bold text-slate-900">{stats.averagePerForm}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Response Rate</p>
                <p className="text-2xl font-bold text-slate-900">{stats.responseRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Responses by Form */}
            <Card>
              <CardHeader>
                <CardTitle>Responses by Form</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responses" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Form Distribution */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, responses }) => `${name}: ${responses}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="responses"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Timeline Chart */}
            {timelineData.length > 1 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Response Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#4F46E5" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Filters and Export */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Form</label>
                <Select value={selectedForm || "all"} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    {forms.map(form => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Search Responses</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search any field..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-responses"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleExportResponses} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Export as Excel
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">Showing {filteredResponses.length} of {responses.length} responses</p>
          </CardContent>
        </Card>

        {/* View Response Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>View Response Data</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No responses found</p>
            ) : (
              <div className="space-y-3">
                {filteredResponses.map(response => {
                  const form = getForm(response.formId);
                  const isExpanded = expandedResponseId === response.id;
                  return (
                    <Card key={response.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <button
                          onClick={() => setExpandedResponseId(isExpanded ? null : response.id)}
                          className="w-full flex items-center justify-between text-left hover:bg-slate-50 p-2 rounded transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{form?.title || 'Unknown Form'}</p>
                            <p className="text-sm text-slate-500">{new Date(response.submittedAt).toLocaleString()}</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                            {Object.entries(response.data)
                              .filter(([k]) => k !== 'id' && k !== 'submittedAt')
                              .map(([key, value]) => (
                                <div key={key} className="flex gap-4">
                                  <span className="font-medium text-slate-700 min-w-max">{key}:</span>
                                  <span className="text-slate-600">{String(value || '-')}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredResponses.length > 10 && (
                  <p className="text-sm text-slate-500 mt-4 text-center">
                    Showing {filteredResponses.slice(0, 50).length} of {filteredResponses.length} responses
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
