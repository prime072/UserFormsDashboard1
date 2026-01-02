import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical, ChevronLeft, Save, X, Lock } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForms, FormField, FieldType, OutputFormat } from "@/lib/form-context";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import OutputSettings from "@/components/output-settings";

export default function FormBuilder() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/forms/:id/edit");
  const { toast } = useToast();
  const { addForm, getForm, updateForm } = useForms();
  const { isSuspended } = useAuth();
  
  const isEditing = match && params?.id;
  const formId = params?.id;

  const [title, setTitle] = useState("Untitled Form");
  const [fields, setFields] = useState<FormField[]>([
    { id: "1", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
    { id: "2", type: "email", label: "Email Address", placeholder: "john@example.com", required: true }
  ]);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>(["thank_you"]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [confirmationStyle, setConfirmationStyle] = useState<"table" | "paragraph">("table");
  const [confirmationText, setConfirmationText] = useState("");
  const [tableConfig, setTableConfig] = useState<TableVariable[]>([]);
  const [whatsappFormat, setWhatsappFormat] = useState("");

  useEffect(() => {
    if (isEditing && formId) {
      const existingForm = getForm(formId);
      if (existingForm) {
        setTitle(existingForm.title);
        setFields(existingForm.fields.length > 0 ? existingForm.fields : fields);
        setOutputFormats(existingForm.outputFormats || ["thank_you"]);
        setVisibility(existingForm.visibility || "public");
        setConfirmationStyle(existingForm.confirmationStyle || "table");
        setConfirmationText(existingForm.confirmationText || "");
        setTableConfig(existingForm.tableConfig || []);
        setWhatsappFormat(existingForm.whatsappFormat || "");
      }
    }
  }, [isEditing, formId, getForm]);

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      label: "New Field",
      required: false,
      options: []
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const addOption = (fieldId: string, optionText: string) => {
    if (!optionText.trim()) return;
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const currentOptions = field.options || [];
      updateField(fieldId, { options: [...currentOptions, optionText] });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions.splice(optionIndex, 1);
      updateField(fieldId, { options: newOptions });
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && formId) {
        await updateForm(formId, title, fields, outputFormats, visibility, confirmationStyle, confirmationText, tableConfig, whatsappFormat);
        toast({
          title: "Form Updated",
          description: "Your changes have been saved.",
        });
      } else {
        await addForm(title, fields, outputFormats, visibility, confirmationStyle, confirmationText, tableConfig, whatsappFormat);
        toast({
          title: "Form Created",
          description: "Your form has been created successfully.",
        });
      }
      
      setTimeout(() => setLocation("/forms"), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form.",
        variant: "destructive"
      });
    }
  };

  if (isSuspended) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <Lock className="w-16 h-16 text-red-600 mx-auto" />
          <h1 className="text-2xl font-display font-bold text-slate-900">Account Suspended</h1>
          <p className="text-slate-600">You cannot create or edit forms while your account is suspended.</p>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Builder Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 border-b -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:border-none md:py-0 md:static">
          <div className="flex items-center gap-4">
            <Link href="/forms">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-display font-bold bg-transparent border-none px-0 focus-visible:ring-0 h-auto w-[300px] md:w-[500px]" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation("/forms")}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? "Update Form" : "Save Form"}
            </Button>
          </div>
        </div>

        {/* Form Settings */}
        <div className="mb-8 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <Label className="text-sm font-semibold mb-3 block">Form Visibility</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="public" 
                  checked={visibility === "public"}
                  onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="private" 
                  checked={visibility === "private"}
                  onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Private</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <Label className="text-sm font-semibold mb-3 block">Confirmation Page Design</Label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="confirmationStyle" 
                    value="table" 
                    checked={confirmationStyle === "table"}
                    onChange={(e) => setConfirmationStyle(e.target.value as "table" | "paragraph")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Response Table</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="confirmationStyle" 
                    value="paragraph" 
                    checked={confirmationStyle === "paragraph"}
                    onChange={(e) => setConfirmationStyle(e.target.value as "table" | "paragraph")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Custom Paragraph</span>
                </label>
              </div>
              {confirmationStyle === "paragraph" && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Custom message to show after submission</Label>
                  <Textarea 
                    value={confirmationText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfirmationText(e.target.value)}
                    placeholder="Enter your custom message here..."
                    className="h-24"
                  />
                </div>
              )}
            </div>
          </div>

            <OutputSettings 
              selectedFormats={outputFormats}
              onChange={setOutputFormats}
              fields={fields}
              tableConfig={tableConfig}
              onTableConfigChange={setTableConfig}
              whatsappFormat={whatsappFormat}
              onWhatsappFormatChange={setWhatsappFormat}
            />
        </div>

        {/* Form Canvas */}
        <div className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="group relative border-slate-200 hover:border-primary/30 transition-colors overflow-visible">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-primary rounded-l-xl transition-colors" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Field Label</Label>
                        <Input 
                          value={field.label} 
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="font-medium"
                          data-testid={`input-label-${field.id}`}
                        />
                      </div>
                      <div className="w-full md:w-[200px]">
                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Type</Label>
                        <Select 
                          value={field.type} 
                          onValueChange={(value) => updateField(field.id, { type: value as FieldType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="textarea">Long Text</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="radio">Radio Group</SelectItem>
                            <SelectItem value="date">Date Picker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Placeholder for text and email fields */}
                    {(field.type === 'text' || field.type === 'email') && (
                      <div>
                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Placeholder</Label>
                        <Input 
                          value={field.placeholder || ''} 
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder={field.type === 'email' ? 'email@example.com' : 'Enter placeholder text'}
                          data-testid={`input-placeholder-${field.id}`}
                        />
                      </div>
                    )}
                    
                    {/* Options Editor for Select/Radio only */}
                    {(field.type === 'select' || field.type === 'radio') && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Options</Label>
                        <div className="space-y-2 mb-3">
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                              <span className="text-sm flex-1">{option}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                onClick={() => removeOption(field.id, optIndex)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Add an option..." 
                            className="h-8 text-sm bg-white" 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addOption(field.id, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addOption(field.id, input.value);
                              input.value = '';
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Preview Area */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 mt-4">
                      <Label className="mb-2 block text-sm text-slate-600">
                        {field.label} 
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === 'text' && <Input disabled placeholder={field.placeholder || "Short answer text"} />}
                      {field.type === 'email' && <Input disabled placeholder="email@example.com" />}
                      {field.type === 'number' && <Input disabled type="number" placeholder="0" />}
                      {field.type === 'date' && <Input disabled type="date" />}
                      {field.type === 'textarea' && <div className="h-20 w-full bg-white border rounded-md px-3 py-2 text-sm text-slate-400">Long answer text</div>}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border rounded bg-white" />
                          <span className="text-sm text-slate-500">{field.label}</span>
                        </div>
                      )}
                      {field.type === 'select' && (
                        <div className="h-10 w-full bg-white border rounded-md px-3 flex items-center text-slate-400 justify-between">
                          <span>Select an option</span>
                          <ChevronLeft className="w-4 h-4 -rotate-90" />
                        </div>
                      )}
                      {field.type === 'radio' && (
                        <div className="space-y-2">
                          {(field.options?.length ? field.options : ['Option 1', 'Option 2']).map((opt, i) => (
                            <div key={i} className="flex items-center space-x-2 opacity-50">
                              <div className="w-4 h-4 rounded-full border border-slate-400" />
                              <span className="text-sm">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={field.required} 
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label className="text-sm text-slate-600">Required</Label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Field
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            variant="outline" 
            className="w-full py-8 border-dashed border-2 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5"
            onClick={addField}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Field
          </Button>
        </div>
      </div>
    </Layout>
  );
}
