import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OutputFormat, FormField, TableVariable } from "@/lib/form-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface OutputSettingsProps {
  selectedFormats: OutputFormat[];
  onChange: (formats: OutputFormat[]) => void;
  fields: FormField[];
  tableConfig: TableVariable[];
  onTableConfigChange: (config: TableVariable[]) => void;
  whatsappFormat: string;
  onWhatsappFormatChange: (format: string) => void;
}

export default function OutputSettings({ 
  selectedFormats, 
  onChange,
  fields,
  tableConfig,
  onTableConfigChange,
  whatsappFormat,
  onWhatsappFormatChange
}: OutputSettingsProps) {
  const formats: { id: OutputFormat; label: string; description: string }[] = [
    { id: "thank_you", label: "Thank You Page", description: "Standard confirmation page" },
    { id: "whatsapp", label: "WhatsApp Share", description: "Allow users to share on WhatsApp" },
    { id: "excel", label: "Excel Download", description: "Download response as .xlsx" },
    { id: "docx", label: "Word Download", description: "Download response as .docx" },
    { id: "pdf", label: "PDF Download", description: "Download response as .pdf" },
  ];

  const toggleFormat = (id: OutputFormat) => {
    if (selectedFormats.includes(id)) {
      onChange(selectedFormats.filter(f => f !== id));
    } else {
      onChange([...selectedFormats, id]);
    }
  };

  const addTableColumn = () => {
    const newCol: TableVariable = {
      id: Math.random().toString(36).substr(2, 9),
      header: "Column Header",
      fieldId: fields[0]?.id || "all"
    };
    onTableConfigChange([...tableConfig, newCol]);
  };

  const updateTableColumn = (id: string, updates: Partial<TableVariable>) => {
    onTableConfigChange(tableConfig.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeTableColumn = (id: string) => {
    onTableConfigChange(tableConfig.filter(c => c.id !== id));
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-semibold mb-4 block">Output Options</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map((format) => (
              <div 
                key={format.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedFormats.includes(format.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleFormat(format.id)}
              >
                <Checkbox 
                  checked={selectedFormats.includes(format.id)}
                  onCheckedChange={() => toggleFormat(format.id)}
                />
                <div className="space-y-1">
                  <Label className="text-sm font-medium cursor-pointer">{format.label}</Label>
                  <p className="text-xs text-slate-500">{format.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedFormats.includes("whatsapp") && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold">WhatsApp Message Format</Label>
            <p className="text-xs text-slate-500">Use variables like {'{{field_label}}'} to customize the message.</p>
            <Textarea 
              value={whatsappFormat}
              onChange={(e) => onWhatsappFormatChange(e.target.value)}
              placeholder="e.g. New submission for {{form_title}}: Name: {{Full Name}}, Email: {{Email Address}}"
              className="h-24"
            />
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Output Table Design (PDF/Word/Confirmation)</Label>
            <Button variant="outline" size="sm" onClick={addTableColumn}>
              <Plus className="w-4 h-4 mr-2" /> Add Column
            </Button>
          </div>
          <p className="text-xs text-slate-500">Customize what shows up in your response summaries and exports.</p>
          <div className="space-y-3">
            {tableConfig.map((col) => (
              <div key={col.id} className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Header Name</Label>
                  <Input 
                    value={col.header}
                    onChange={(e) => updateTableColumn(col.id, { header: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Value Variable</Label>
                  <select 
                    value={col.fieldId}
                    onChange={(e) => updateTableColumn(col.id, { fieldId: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Fields (JSON)</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => removeTableColumn(col.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {tableConfig.length === 0 && (
              <div className="text-center py-4 border-2 border-dashed rounded-lg text-slate-400 text-sm">
                No custom columns defined. Default summary will be used.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
