import { useRoute, useLocation } from "wouter";
import { useForms } from "@/lib/form-context";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function PublicFormPage() {
  const [match, params] = useRoute("/s/:id");
  const { getForm, submitResponse } = useForms();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const formId = params?.id;
  const form = formId ? getForm(formId) : undefined;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Form Not Found</h1>
            <p className="text-slate-500">The form you are looking for does not exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    try {
      // Convert field IDs to field labels for better readability
      const formattedData: Record<string, any> = {};
      form.fields.forEach(field => {
        if (data[field.id] !== undefined) {
          formattedData[field.label] = data[field.id];
        }
      });
      
      // Submit response to MongoDB via API
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          data: formattedData,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to submit response");
      
      const result = await response.json();
      toast({
        title: "Response Submitted",
        description: "Thank you for filling out this form!",
      });
      setTimeout(() => setLocation(`/s/${form.id}/confirmation/${result.id}`), 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 border-b bg-white/50 pb-8">
          <CardTitle className="text-3xl font-display font-bold text-slate-900">{form.title}</CardTitle>
          <CardDescription>Please fill out the form below</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-base font-medium text-slate-900">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {field.type === 'text' && (
                  <Input 
                    placeholder={field.placeholder} 
                    {...register(field.id, { required: field.required })} 
                  />
                )}

                {field.type === 'email' && (
                  <Input 
                    type="email" 
                    placeholder={field.placeholder} 
                    {...register(field.id, { required: field.required })} 
                  />
                )}

                {field.type === 'number' && (
                  <Input 
                    type="number" 
                    placeholder={field.placeholder} 
                    {...register(field.id, { required: field.required })} 
                  />
                )}
                
                {field.type === 'date' && (
                  <Input 
                    type="date" 
                    {...register(field.id, { required: field.required })} 
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea 
                    placeholder={field.placeholder} 
                    {...register(field.id, { required: field.required })} 
                  />
                )}

                {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={field.id} 
                      onCheckedChange={(checked) => setValue(field.id, checked)}
                    />
                    <label htmlFor={field.id} className="text-sm text-slate-600 cursor-pointer select-none">
                      {field.label}
                    </label>
                  </div>
                )}

                {field.type === 'select' && (
                  <Select onValueChange={(val) => setValue(field.id, val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt, idx) => (
                        <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'radio' && (
                  <RadioGroup onValueChange={(val) => setValue(field.id, val)}>
                    {field.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${field.id}-${idx}`} />
                        <Label htmlFor={`${field.id}-${idx}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {errors[field.id] && (
                  <span className="text-sm text-red-500">This field is required</span>
                )}
              </div>
            ))}

            <div className="pt-6">
              <Button type="submit" className="w-full md:w-auto md:px-8" size="lg">
                Submit Response
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
