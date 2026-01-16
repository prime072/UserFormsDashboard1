import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowLeft,
  Share2,
  Download,
  FileJson,
  File,
} from "lucide-react";
import {
  generateExcel,
  generateDocx,
  generatePdf,
  generateWhatsAppShareMessage,
  useForms,
} from "@/lib/form-context";
import { useState, useEffect } from "react";

export default function SubmissionConfirmation() {
  const [match, params] = useRoute("/s/:id/confirmation/:submissionId");
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedLookups, setResolvedLookups] = useState<
    Record<string, string>
  >({});
  const { resolveLookup } = useForms();

  const formId = params?.id;
  const submissionId = params?.submissionId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, responseRes] = await Promise.all([
          fetch(`/api/forms/${formId}`),
          fetch(`/api/responses/${submissionId}`),
        ]);
        if (formRes.ok) {
          const formData = await formRes.json();
          setForm(formData);
        }
        if (responseRes.ok) {
          const resData = await responseRes.json();
          setResponse(resData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (formId && submissionId) fetchData();
  }, [formId, submissionId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!form || !response)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Not Found
      </div>
    );
  const data = response.data;
  const grid = form.gridConfig;
  useEffect(() => {
    const fetchLookups = async () => {
      if (!grid || !grid.rows) return;
      const lookups: Record<string, string> = {};
      for (const row of grid.rows) {
        if (!row.cells) continue;
        for (const cell of row.cells) {
          if (cell.type === "lookup" && cell.lookupConfig) {
            try {
              const val = await resolveLookup(cell.lookupConfig);
              lookups[cell.id] = val;
            } catch (err) {
              console.error(`Error resolving lookup for cell ${cell.id}:`, err);
              lookups[cell.id] = "Error";
            }
          }
        }
      }
      setResolvedLookups(lookups);
    };
    if (grid) fetchLookups();
  }, [grid, resolveLookup]);
  const replaceVars = (text: string) => {
    let result = text || "";
    Object.entries(data).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(val));
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-t-4 border-t-green-500 shadow-xl">
        <CardHeader className="text-center pb-8 border-b">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">
            Submission Confirmed!
          </CardTitle>
          <p className="text-slate-500">Thank you for your response.</p>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {form.confirmationStyle === "paragraph" ? (
            <div className="bg-white p-6 rounded-lg border leading-relaxed whitespace-pre-wrap">
              {replaceVars(form.confirmationText)}
            </div>
          ) : (
            <div className="space-y-4">
              {grid?.textAbove && (
                <p className="text-slate-600 whitespace-pre-wrap">
                  {replaceVars(grid.textAbove)}
                </p>
              )}
              <div className="overflow-x-auto border rounded-lg bg-white">
                {grid && grid.headers?.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      {grid.tableName && (
                        <tr className="bg-slate-100">
                          <th
                            colSpan={grid.headers.length}
                            className="p-4 border-b text-center font-bold text-lg text-slate-900"
                          >
                            {replaceVars(grid.tableName)}
                          </th>
                        </tr>
                      )}
                      {grid.showHeaders !== false && (
                        <tr
                          style={{
                            backgroundColor: grid.headerColor || "#f8fafc",
                          }}
                        >
                          {grid.headers.map((h: any, i: number) => (
                            <th
                              key={i}
                              className="p-3 border-b border-r text-left text-sm font-bold last:border-r-0"
                              style={{
                                color: grid.headerTextColor || "#334155",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {grid.rows.map((row: any) => (
                        <tr
                          key={row.id}
                          className={
                            row.isFooter ? "bg-slate-50 font-semibold" : ""
                          }
                        >
                          {row.cells.map((cell: any) => {
                            let val = cell.value;
                            if (cell.type === "variable") {
                              val = String(data[cell.value] || "");
                            } else if (cell.type === "lookup") {
                              val = resolvedLookups[cell.id] || "Loading...";
                            }
                            return (
                              <td
                                key={cell.id}
                                className="p-3 border-b border-r text-sm last:border-r-0"
                                colSpan={cell.colspan || 1}
                                style={{
                                  backgroundColor: cell.color,
                                  color: cell.textColor || "#475569",
                                  fontSize: `${cell.fontSize || 14}px`,
                                  fontWeight: cell.bold
                                    ? "bold"
                                    : row.isFooter
                                      ? "semibold"
                                      : "normal",
                                  fontStyle: cell.italic ? "italic" : "normal",
                                }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 space-y-2">
                    {Object.entries(data).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b pb-2"
                      >
                        <span className="font-medium">{key}:</span>
                        <span>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {grid?.textBelow && (
                <p className="text-slate-600 whitespace-pre-wrap">
                  {replaceVars(grid.textBelow)}
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {form.outputFormats?.includes("excel") && (
              <Button
                variant="outline"
                onClick={() => generateExcel(form.title, data)}
              >
                <Download className="w-4 h-4 mr-2" /> Excel
              </Button>
            )}
            {form.outputFormats?.includes("pdf") && (
              <Button
                variant="outline"
                onClick={() =>
                  generatePdf(
                    form.title,
                    data,
                    undefined,
                    form.gridConfig,
                    resolveLookup,
                  )
                }
              >
                <File className="w-4 h-4 mr-2" /> PDF
              </Button>
            )}
            {form.outputFormats?.includes("docx") && (
              <Button
                variant="outline"
                onClick={() =>
                  generateDocx(
                    form.title,
                    data,
                    undefined,
                    form.gridConfig,
                    resolveLookup,
                  )
                }
              >
                <FileJson className="w-4 h-4 mr-2" /> Word
              </Button>
            )}
            {form.outputFormats?.includes("whatsapp") && (
              <Button
                variant="outline"
                className="text-green-600 border-green-200"
                onClick={async () => {
                  const msg = await generateWhatsAppShareMessage(
                    form.title,
                    data,
                    window.location.href,
                    form.whatsappFormat,
                    form.gridConfig,
                    resolveLookup,
                  );
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            )}
          </div>
          <Button className="w-full" onClick={() => setLocation("/")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
