import { useRoute, useLocation } from "wouter";
import { OutputFormat } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Share2, Download, FileJson, File } from "lucide-react";
import { generateExcel, generateDocx, generatePdf, generateWhatsAppShareMessage } from "@/lib/output-generators";
import { useState, useEffect } from "react";

export default function SubmissionConfirmation() {
  const [match, params] = useRoute("/s/:id/confirmation/:submissionId");
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formId = params?.id;
  const submissionId = params?.submissionId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form and response in parallel
        const [formRes, responseRes] = await Promise.all([
          fetch(`/api/forms/${formId}`),
          fetch(`/api/responses/${submissionId}`),
        ]);

        if (formRes.ok) {
          const formData = await formRes.json();
          setForm(formData);
        }

        if (responseRes.ok) {
          const responseData = await responseRes.json();
          setResponse(responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formId && submissionId) {
      fetchData();
    }
  }, [formId, submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Loading your submission...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form || !response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Submission Not Found</h1>
            <p className="text-slate-500 mb-6">We couldn't find your submission.</p>
            <Button onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const outputFormats = form.outputFormats || ["thank_you"];
  const data = response.data;

  const handleDownloadExcel = () => {
    generateExcel(form.title, data);
  };

  const handleDownloadDocx = async () => {
    await generateDocx(form.title, data, form.confirmationStyle === "paragraph" ? form.confirmationText : undefined);
  };

  const handleDownloadPdf = () => {
    generatePdf(form.title, data, form.confirmationStyle === "paragraph" ? form.confirmationText : undefined);
  };

  const handleWhatsAppShare = () => {
    const formUrl = `${window.location.origin}/s/${formId}`;
    const message = generateWhatsAppShareMessage(form.title, data, formUrl);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-t-green-500">
        <CardHeader className="text-center space-y-4 pb-8 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-4xl font-display font-bold text-slate-900 mb-2">Thank You!</CardTitle>
            <p className="text-slate-600">Your response has been successfully submitted.</p>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          {/* Response Summary */}
          {form.confirmationStyle === "paragraph" ? (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Submission Details</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {form.confirmationText || "Thank you for your response."}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Your Response Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {Object.entries(data).map(([key, value]) => (
                  key !== 'id' && key !== 'submittedAt' && (
                    <div key={key} className="flex justify-between items-start gap-4">
                      <span className="text-sm font-medium text-slate-700 capitalize">{key}:</span>
                      <span className="text-sm text-slate-600 text-right max-w-xs truncate" title={String(value)}>{String(value)}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Download/Share Options */}
          {outputFormats.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Export Your Response</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outputFormats.includes("excel") && (
                  <Button 
                    onClick={handleDownloadExcel}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-download-excel"
                  >
                    <Download className="w-4 h-4" />
                    Download as Excel
                  </Button>
                )}
                {outputFormats.includes("docx") && (
                  <Button 
                    onClick={handleDownloadDocx}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-download-docx"
                  >
                    <FileJson className="w-4 h-4" />
                    Download as Word
                  </Button>
                )}
                {outputFormats.includes("pdf") && (
                  <Button 
                    onClick={handleDownloadPdf}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-download-pdf"
                  >
                    <File className="w-4 h-4" />
                    Download as PDF
                  </Button>
                )}
                {outputFormats.includes("whatsapp") && (
                  <Button 
                    onClick={handleWhatsAppShare}
                    variant="outline"
                    className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                    data-testid="button-share-whatsapp"
                  >
                    <Share2 className="w-4 h-4" />
                    Share on WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/s/${formId}`)}
              className="gap-2"
              data-testid="button-fill-again"
            >
              <ArrowLeft className="w-4 h-4" />
              Fill Form Again
            </Button>
            <Button 
              onClick={() => setLocation("/")}
              className="gap-2"
              data-testid="button-back-to-home"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
