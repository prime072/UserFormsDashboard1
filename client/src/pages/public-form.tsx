import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForms, FormField } from "@/lib/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

export default function PublicForm() {
  const [match, params] = useRoute("/s/:id");
  const [, setLocation] = useLocation();
  const { getForm, submitResponse, responses } = useForms();
  const { toast } = useToast();
  
  const formId = params?.id;
  const form = getForm(formId!);
  
  const [formData, setData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (form && form.allowEditing === false) {
      const alreadySubmitted = responses.some(r => r.formId === formId);
      if (alreadySubmitted) {
        toast({ title: "Submission Restricted", description: "This form only allows one submission." });
        setLocation("/");
      }
    }
  }, [form, responses, formId]);

  if (!form) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { submissionId } = await submitResponse(form.id, formData);
      toast({ title: "Submitted", description: "Your response has been recorded." });
      setLocation(`/s/${form.id}/confirmation/${submissionId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit response.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl">{form.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm font-semibold">{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                {field.type === 'text' && <Input required={field.required} placeholder={field.placeholder} value={formData[field.label] || ''} onChange={e => setData({...formData, [field.label]: e.target.value})} />}
                {field.type === 'email' && <Input type="email" required={field.required} placeholder={field.placeholder} value={formData[field.label] || ''} onChange={e => setData({...formData, [field.label]: e.target.value})} />}
                {field.type === 'textarea' && <Textarea required={field.required} placeholder={field.placeholder} value={formData[field.label] || ''} onChange={e => setData({...formData, [field.label]: e.target.value})} />}
                {field.type === 'select' && (
                  <Select onValueChange={v => setData({...formData, [field.label]: v})}>
                    <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                    <SelectContent>{field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {field.type === 'radio' && (
                  <RadioGroup onValueChange={v => setData({...formData, [field.label]: v})}>
                    {field.options?.map(opt => <div key={opt} className="flex items-center gap-2"><RadioGroupItem value={opt} /><Label>{opt}</Label></div>)}
                  </RadioGroup>
                )}
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <Checkbox id={field.id} onCheckedChange={v => setData({...formData, [field.label]: !!v})} />
                    <Label htmlFor={field.id}>{field.label}</Label>
                  </div>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Submit Response</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
