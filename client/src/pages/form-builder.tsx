import { useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical, ChevronLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForms, FormField, FieldType } from "@/lib/form-context";

export default function FormBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addForm } = useForms();
  
  const [title, setTitle] = useState("Untitled Form");
  const [fields, setFields] = useState<FormField[]>([
    { id: "1", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
    { id: "2", type: "email", label: "Email Address", placeholder: "john@example.com", required: true }
  ]);

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      label: "New Field",
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    // Save to context/localStorage
    addForm(title, fields);

    toast({
      title: "Form Saved",
      description: "Your form has been saved successfully.",
    });
    
    setTimeout(() => setLocation("/dashboard"), 1000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Builder Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 border-b -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:border-none md:py-0 md:static">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
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
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Form
            </Button>
          </div>
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 mt-4">
                      <Label className="mb-2 block text-sm text-slate-600">
                        {field.label} 
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === 'text' && <Input disabled placeholder={field.placeholder || "Short answer text"} />}
                      {field.type === 'email' && <Input disabled placeholder="email@example.com" />}
                      {field.type === 'number' && <Input disabled type="number" placeholder="0" />}
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
