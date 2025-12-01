import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import Layout from "@/components/layout";
import { useForms } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ResponsesAnalytics() {
  const [match, params] = useRoute("/forms/:id/analytics");
  const { getForm, getFormResponses } = useForms();
  const [selectedField, setSelectedField] = useState<string>("");
  const [viewMode, setViewMode] = useState<"rowwise" | "columnwise">("rowwise");

  const formId = params?.id;
  const form = formId ? getForm(formId) : undefined;
  const formResponses = formId ? getFormResponses(formId) : [];

  const fieldOptions = useMemo(() => form?.fields.map(f => ({ id: f.id, label: f.label })) || [], [form]);
  const defaultField = fieldOptions[0]?.label || "";

  const activeField = selectedField || defaultField;

  const chartData = useMemo(() => {
    if (!activeField || formResponses.length === 0) return [];

    if (viewMode === "rowwise") {
      return formResponses.map((resp, idx) => ({
        name: `Response ${idx + 1}`,
        value: String(resp.data[activeField] || "-")
      }));
    } else {
      const valueCounts: Record<string, number> = {};
      formResponses.forEach(resp => {
        const val = String(resp.data[activeField] || "Unknown");
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      });
      return Object.entries(valueCounts).map(([key, count]) => ({
        name: key,
        value: count
      }));
    }
  }, [activeField, formResponses, viewMode]);

  const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (!form) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-slate-900">Form not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/forms/${formId}/responses`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Response Analytics</h1>
            <p className="text-slate-500 mt-1">{form.title}</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Visualization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Field</label>
                <Select value={selectedField || defaultField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map(field => (
                      <SelectItem key={field.id} value={field.label}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">View Mode</label>
                <Select value={viewMode} onValueChange={(val) => setViewMode(val as "rowwise" | "columnwise")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rowwise">Row-wise (Individual Responses)</SelectItem>
                    <SelectItem value="columnwise">Column-wise (Aggregated Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bar Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={viewMode === "columnwise" ? "value" : "value"} fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart (for column-wise) */}
            {viewMode === "columnwise" && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
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

            {/* Line Chart (for row-wise) */}
            {viewMode === "rowwise" && chartData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#4F46E5" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Response Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Total Responses:</strong> {formResponses.length}</p>
              <p><strong>Selected Field:</strong> {activeField}</p>
              <p><strong>View Mode:</strong> {viewMode === "rowwise" ? "Row-wise (Individual)" : "Column-wise (Aggregated)"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
