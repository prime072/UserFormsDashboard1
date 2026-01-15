import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OutputFormat, FormField, GridConfig, FormTableRow, FormTableCell } from "@/lib/form-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface OutputSettingsProps {
  selectedFormats: OutputFormat[];
  onChange: (formats: OutputFormat[]) => void;
  fields: FormField[];
  gridConfig: GridConfig;
  onGridConfigChange: (config: GridConfig) => void;
  whatsappFormat: string;
  onWhatsappFormatChange: (format: string) => void;
}

export default function OutputSettings({ 
  selectedFormats, 
  onChange,
  fields,
  gridConfig,
  onGridConfigChange,
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

  const addRow = () => {
    const newRow: FormTableRow = {
      id: Math.random().toString(36).substr(2, 9),
      cells: gridConfig.headers.map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        type: "text",
        value: "",
        color: "#ffffff"
      }))
    };
    onGridConfigChange({
      ...gridConfig,
      rows: [...gridConfig.rows, newRow]
    });
  };

  const addColumn = () => {
    const newHeader = `Column ${gridConfig.headers.length + 1}`;
    onGridConfigChange({
      ...gridConfig,
      headers: [...gridConfig.headers, newHeader],
      rows: gridConfig.rows.map(row => ({
        ...row,
        cells: [...row.cells, {
          id: Math.random().toString(36).substr(2, 9),
          type: "text",
          value: "",
          color: "#ffffff"
        }]
      }))
    });
  };

  const removeRow = (index: number) => {
    const newRows = [...gridConfig.rows];
    newRows.splice(index, 1);
    onGridConfigChange({ ...gridConfig, rows: newRows });
  };

  const removeColumn = (index: number) => {
    onGridConfigChange({
      ...gridConfig,
      headers: gridConfig.headers.filter((_, i) => i !== index),
      rows: gridConfig.rows.map(row => ({
        ...row,
        cells: row.cells.filter((_, i) => i !== index)
      }))
    });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...gridConfig.headers];
    newHeaders[index] = value;
    onGridConfigChange({ ...gridConfig, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, updates: Partial<FormTableCell>) => {
    const newRows = [...gridConfig.rows];
    newRows[rowIndex].cells[colIndex] = { ...newRows[rowIndex].cells[colIndex], ...updates };
    onGridConfigChange({ ...gridConfig, rows: newRows });
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
            <Label className="text-sm font-semibold">Custom Grid Layout (PDF/Word/Confirmation)</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onGridConfigChange({ ...gridConfig, rows: [...gridConfig.rows, { id: Math.random().toString(36).substr(2, 9), cells: gridConfig.headers.map(() => ({ id: Math.random().toString(36).substr(2, 9), type: "text", value: "", color: "#ffffff", colspan: 1 })), isFooter: true }] })}>
                <Plus className="w-4 h-4 mr-1" /> Footer
              </Button>
              <Button variant="outline" size="sm" onClick={addColumn}>
                <Plus className="w-4 h-4 mr-1" /> Col
              </Button>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="w-4 h-4 mr-1" /> Row
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Table Name</Label>
              <Input 
                value={gridConfig.tableName || ""} 
                onChange={(e) => onGridConfigChange({ ...gridConfig, tableName: e.target.value })}
                placeholder="Enter table name..."
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Text Above Table</Label>
              <Input 
                value={gridConfig.textAbove || ""} 
                onChange={(e) => onGridConfigChange({ ...gridConfig, textAbove: e.target.value })}
                placeholder="Write something above..."
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Text Below Table</Label>
              <Input 
                value={gridConfig.textBelow || ""} 
                onChange={(e) => onGridConfigChange({ ...gridConfig, textBelow: e.target.value })}
                placeholder="Write something below..."
                className="h-8 text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                {gridConfig.tableName && (
                  <tr className="bg-slate-100">
                    <th colSpan={gridConfig.headers.length + 1} className="p-2 border-b text-center font-bold text-sm">
                      {gridConfig.tableName}
                    </th>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <th className="w-10 border-b"></th>
                  {gridConfig.headers.map((header, i) => (
                    <th key={i} className="p-2 border-b border-r min-w-[150px]">
                      <div className="flex gap-1 items-center">
                        <Input 
                          value={header}
                          onChange={(e) => updateHeader(i, e.target.value)}
                          className="h-7 text-xs font-bold bg-transparent border-none focus-visible:ring-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-slate-400 hover:text-red-500"
                          onClick={() => removeColumn(i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridConfig.rows.map((row, rIndex) => (
                  <tr key={row.id} className={row.isFooter ? "bg-slate-100 font-semibold" : ""}>
                    <td className="p-2 border-b border-r bg-slate-50 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-slate-400 hover:text-red-500"
                        onClick={() => removeRow(rIndex)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                    {row.cells.map((cell, cIndex) => (
                      <td 
                        key={cell.id} 
                        className="p-2 border-b border-r"
                        colSpan={cell.colspan || 1}
                        style={{ backgroundColor: cell.color }}
                      >
                        <div className="space-y-1">
                          <div className="flex gap-1 items-center">
                            <select 
                              value={cell.type}
                              onChange={(e) => updateCell(rIndex, cIndex, { type: e.target.value as "text" | "variable" })}
                              className="h-6 text-[10px] rounded border"
                            >
                              <option value="text">Txt</option>
                              <option value="variable">Var</option>
                            </select>
                            <Input 
                              type="color"
                              value={cell.color || "#ffffff"}
                              onChange={(e) => updateCell(rIndex, cIndex, { color: e.target.value })}
                              className="w-5 h-5 p-0 border-none bg-transparent"
                            />
                            <div className="flex items-center gap-1 border rounded px-1 h-6">
                              <span className="text-[9px] text-slate-400">Merge</span>
                              <input 
                                type="number" 
                                min="1" 
                                max={gridConfig.headers.length - cIndex}
                                value={cell.colspan || 1}
                                onChange={(e) => updateCell(rIndex, cIndex, { colspan: parseInt(e.target.value) || 1 })}
                                className="w-6 h-4 text-[10px] bg-transparent outline-none"
                              />
                            </div>
                          </div>
                          {cell.type === "variable" ? (
                            <select 
                              value={cell.value}
                              onChange={(e) => updateCell(rIndex, cIndex, { value: e.target.value })}
                              className="w-full h-7 text-xs rounded border"
                            >
                              <option value="">Select Field</option>
                              {fields.map(f => (
                                <option key={f.id} value={f.label}>{f.label}</option>
                              ))}
                            </select>
                          ) : (
                            <Input 
                              value={cell.value}
                              onChange={(e) => updateCell(rIndex, cIndex, { value: e.target.value })}
                              placeholder={row.isFooter ? "Footer text..." : "Text..."}
                              className="h-7 text-xs"
                            />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gridConfig.headers.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-slate-400 text-sm">
              Add columns and rows to build your custom output table.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
