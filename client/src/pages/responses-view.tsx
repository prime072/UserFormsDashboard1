import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/layout";
import { useForms } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Edit, Trash2, Save, X } from "lucide-react";
import { Link, useLocation as useLocationHook } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ResponsesView() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/forms/:id/responses");
  const { toast } = useToast();
  const { getForm, getFormResponses, updateResponse, deleteResponse } = useForms();

  const formId = params?.id;
  const form = formId ? getForm(formId) : undefined;
  const formResponses = formId ? getFormResponses(formId) : [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  if (!form) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-slate-900">Form not found</h2>
        </div>
      </Layout>
    );
  }

  const handleEdit = (responseId: string, data: Record<string, any>) => {
    setEditingId(responseId);
    setEditData({ ...data });
  };

  const handleSaveEdit = (responseId: string) => {
    updateResponse(responseId, editData);
    setEditingId(null);
    toast({
      title: "Response Updated",
      description: "The response has been updated successfully.",
    });
  };

  const handleDeleteResponse = (responseId: string) => {
    if (confirm("Are you sure you want to delete this response?")) {
      deleteResponse(responseId);
      toast({
        title: "Response Deleted",
        description: "The response has been removed.",
        variant: "destructive"
      });
    }
  };

  const fieldLabels = form.fields.reduce((acc, field) => {
    acc[field.id] = field.label;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{form.title}</h1>
            <p className="text-slate-500 mt-1">{formResponses.length} responses</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {formResponses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No responses yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {form.fields.map(field => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formResponses.map(response => (
                      <TableRow key={response.id}>
                        {form.fields.map(field => (
                          <TableCell key={`${response.id}-${field.id}`}>
                            {editingId === response.id ? (
                              <Input
                                value={editData[field.id] || ""}
                                onChange={(e) => setEditData({ ...editData, [field.id]: e.target.value })}
                                className="text-sm"
                                data-testid={`input-edit-${field.id}`}
                              />
                            ) : (
                              <span className="text-sm">{String(response.data[field.id] || "-")}</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          {editingId === response.id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveEdit(response.id)}
                                data-testid="button-save-response"
                              >
                                <Save className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                data-testid="button-cancel-edit"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(response.id, response.data)}
                                data-testid={`button-edit-${response.id}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteResponse(response.id)}
                                data-testid={`button-delete-${response.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
