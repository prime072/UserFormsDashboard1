import { useRoute, useLocation } from "wouter";
import { useForms, OutputFormat } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Share2, Download, FileJson, File } from "lucide-react";
import { generateExcel, generateDocx, generatePdf, generateWhatsAppShareMessage } from "@/lib/output-generators";

export default function SubmissionConfirmation() {
  const [match, params] = useRoute("/s/:id/confirmation/:submissionId");
  const { getForm } = useForms();
  const [, setLocation] = useLocation();

  const formId = params?.id;
  const submissionId = params?.submissionId;

  const form = formId ? getForm(formId) : undefined;
  const submissionData = submissionId 
    ? JSON.parse(localStorage.getItem(`formflow_submission_${submissionId}`) || "{}")
    : null;

  if (!form || !submissionData) {
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
  const { data } = submissionData;

  const handleDownloadExcel = () => {
    generateExcel(form.title, data);
  };

  const handleDownloadDocx = async () => {
    await generateDocx(form.title, data);
  };

  const handleDownloadPdf = () => {
    generatePdf(form.title, data);
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
              onClick={() => setLocation("/dashboard")}
              className="gap-2"
              data-testid="button-back-to-dashboard"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
