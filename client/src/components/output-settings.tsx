import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputFormat } from "@/lib/form-context";
import { FileText, Share2, Table2, FileJson, Download } from "lucide-react";

interface OutputSettingsProps {
  selectedFormats: OutputFormat[];
  onChange: (formats: OutputFormat[]) => void;
}

const outputOptions = [
  { id: "thank_you" as OutputFormat, label: "Thank You Page", icon: FileText, description: "Show a thank you message after submission" },
  { id: "whatsapp" as OutputFormat, label: "WhatsApp Share Link", icon: Share2, description: "Allow sharing response via WhatsApp" },
  { id: "excel" as OutputFormat, label: "Excel Download", icon: Table2, description: "Download response as Excel file" },
  { id: "docx" as OutputFormat, label: "Word Document", icon: FileJson, description: "Download response as Word document" },
  { id: "pdf" as OutputFormat, label: "PDF Download", icon: Download, description: "Download response as PDF file" },
];

export default function OutputSettings({ selectedFormats, onChange }: OutputSettingsProps) {
  const toggleFormat = (format: OutputFormat) => {
    if (selectedFormats.includes(format)) {
      onChange(selectedFormats.filter(f => f !== format));
    } else {
      onChange([...selectedFormats, format]);
    }
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Output Options
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">Choose what respondents see after submitting the form</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {outputOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={selectedFormats.includes(option.id)}
                  onCheckedChange={() => toggleFormat(option.id)}
                  data-testid={`checkbox-output-${option.id}`}
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={option.id} className="text-sm font-medium text-slate-900 cursor-pointer flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
