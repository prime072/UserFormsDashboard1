import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';

export type FieldType = "text" | "number" | "email" | "textarea" | "checkbox" | "select" | "radio" | "date";
export type OutputFormat = "thank_you" | "whatsapp" | "excel" | "docx" | "pdf";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  status: "Active" | "Draft" | "Archived";
  responses: number;
  lastUpdated: string;
  fields: FormField[];
  outputFormats?: OutputFormat[];
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

type FormContextType = {
  forms: Form[];
  responses: FormResponse[];
  addForm: (title: string, fields: FormField[], outputFormats?: OutputFormat[]) => void;
  updateForm: (id: string, title: string, fields: FormField[], outputFormats?: OutputFormat[]) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => Form | undefined;
  submitResponse: (formId: string, data: any) => { submissionId: string };
  getFormResponses: (formId: string) => FormResponse[];
  updateResponse: (responseId: string, data: Record<string, any>) => void;
  deleteResponse: (responseId: string) => void;
};

const FormContext = createContext<FormContextType | null>(null);

const INITIAL_FORMS: Form[] = [
  { 
    id: "1", 
    title: "Customer Feedback", 
    responses: 0, 
    status: "Active", 
    lastUpdated: new Date().toISOString(),
    fields: [],
    outputFormats: ["thank_you", "excel", "docx"]
  },
  { 
    id: "2", 
    title: "Event Registration", 
    responses: 0, 
    status: "Active", 
    lastUpdated: new Date().toISOString(),
    fields: [],
    outputFormats: ["thank_you", "whatsapp"]
  },
];

export function FormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("formflow_forms");
    if (stored) {
      setForms(JSON.parse(stored));
    } else {
      setForms(INITIAL_FORMS);
      localStorage.setItem("formflow_forms", JSON.stringify(INITIAL_FORMS));
    }

    const storedResponses = localStorage.getItem("formflow_all_responses");
    if (storedResponses) {
      setResponses(JSON.parse(storedResponses));
    }
  }, []);

  const addForm = (title: string, fields: FormField[], outputFormats?: OutputFormat[]) => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      status: "Active",
      responses: 0,
      lastUpdated: new Date().toISOString(),
      fields,
      outputFormats: outputFormats || ["thank_you"]
    };
    
    const updatedForms = [newForm, ...forms];
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  const updateForm = (id: string, title: string, fields: FormField[], outputFormats?: OutputFormat[]) => {
    const updatedForms = forms.map(f => 
      f.id === id 
        ? { ...f, title, fields, lastUpdated: new Date().toISOString(), outputFormats: outputFormats || f.outputFormats }
        : f
    );
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  const deleteForm = (id: string) => {
    const updatedForms = forms.filter(f => f.id !== id);
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
    
    const updatedResponses = responses.filter(r => r.formId !== id);
    setResponses(updatedResponses);
    localStorage.setItem("formflow_all_responses", JSON.stringify(updatedResponses));
  };

  const getForm = (id: string) => {
    return forms.find(f => f.id === id);
  };

  const submitResponse = (formId: string, data: any) => {
    const submissionId = Math.random().toString(36).substr(2, 9);
    
    const updatedForms = forms.map(f => 
      f.id === formId 
        ? { ...f, responses: f.responses + 1, lastUpdated: new Date().toISOString() }
        : f
    );
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
    
    const newResponse: FormResponse = {
      id: submissionId,
      formId,
      data,
      submittedAt: new Date().toISOString()
    };
    
    const updatedResponses = [newResponse, ...responses];
    setResponses(updatedResponses);
    localStorage.setItem("formflow_all_responses", JSON.stringify(updatedResponses));
    localStorage.setItem(`formflow_submission_${submissionId}`, JSON.stringify({ formId, data: newResponse }));
    
    return { submissionId };
  };

  const getFormResponses = (formId: string) => {
    return responses.filter(r => r.formId === formId);
  };

  const updateResponse = (responseId: string, data: Record<string, any>) => {
    const updatedResponses = responses.map(r =>
      r.id === responseId 
        ? { ...r, data }
        : r
    );
    setResponses(updatedResponses);
    localStorage.setItem("formflow_all_responses", JSON.stringify(updatedResponses));
  };

  const deleteResponse = (responseId: string) => {
    const response = responses.find(r => r.id === responseId);
    if (!response) return;

    const updatedResponses = responses.filter(r => r.id !== responseId);
    setResponses(updatedResponses);
    localStorage.setItem("formflow_all_responses", JSON.stringify(updatedResponses));

    const updatedForms = forms.map(f =>
      f.id === response.formId
        ? { ...f, responses: Math.max(0, f.responses - 1) }
        : f
    );
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  return (
    <FormContext.Provider value={{ forms, responses, addForm, updateForm, deleteForm, getForm, submitResponse, getFormResponses, updateResponse, deleteResponse }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForms() {
  const context = useContext(FormContext);
  if (!context) throw new Error("useForms must be used within FormProvider");
  return context;
}

// Export generators
export async function generateExcel(formTitle: string, responseData: any) {
  const worksheet = XLSX.utils.json_to_sheet([responseData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Response');
  const filename = `${formTitle}-response-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export async function generateDocx(formTitle: string, responseData: any) {
  const filteredData = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt');

  const rows = filteredData.map(([key, value]) => {
    const label = String(key).charAt(0).toUpperCase() + String(key).slice(1);
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: label })],
        }),
        new TableCell({
          children: [new Paragraph({ text: String(value) })],
        }),
      ],
    });
  });

  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ text: "Field", bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Response", bold: true })] }),
    ],
  });

  const table = new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: formTitle, size: 28, bold: true }),
        new Paragraph({ text: `Generated: ${new Date().toLocaleString()}`, size: 20 }),
        table
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formTitle}-response-${new Date().toISOString().split('T')[0]}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generatePdf(formTitle: string, responseData: any) {
  const content = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(([key, value]) => `${String(key).charAt(0).toUpperCase() + String(key).slice(1)}: ${value}`)
    .join('\n');

  const pdfContent = `${formTitle}\nGenerated: ${new Date().toLocaleString()}\n\n${content}`;
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formTitle}-response-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateWhatsAppShareMessage(formTitle: string, responseData: any, formUrl: string): string {
  const summary = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(([key, value]) => `${String(key).charAt(0).toUpperCase() + String(key).slice(1)}: ${value}`)
    .join('\n');

  return `I just filled out the "${formTitle}" form:\n\n${summary}\n\nYou can fill it too: ${formUrl}`;
}
