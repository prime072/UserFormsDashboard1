import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';
import jsPDF from 'jspdf';
import { useAuth } from "./auth-context";

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
  addForm: (title: string, fields: FormField[], outputFormats?: OutputFormat[]) => Promise<void>;
  updateForm: (id: string, title: string, fields: FormField[], outputFormats?: OutputFormat[]) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
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
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch("/api/forms", {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const addForm = async (title: string, fields: FormField[], outputFormats?: OutputFormat[]) => {
    if (!user?.id) return;
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          title,
          fields,
          outputFormats: outputFormats || ["thank_you"],
        }),
      });
      if (response.ok) {
        const newForm = await response.json();
        setForms([newForm, ...forms]);
      }
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };

  const updateForm = async (id: string, title: string, fields: FormField[], outputFormats?: OutputFormat[]) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          title,
          fields,
          outputFormats: outputFormats || ["thank_you"],
        }),
      });
      if (response.ok) {
        const updatedForm = await response.json();
        setForms(forms.map(f => f.id === id ? updatedForm : f));
      }
    } catch (error) {
      console.error("Error updating form:", error);
    }
  };

  const deleteForm = async (id: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const updatedForms = forms.filter(f => f.id !== id);
        setForms(updatedForms);
        
        const updatedResponses = responses.filter(r => r.formId !== id);
        setResponses(updatedResponses);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    }
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
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(key)],
        }),
        new TableCell({
          children: [new Paragraph(String(value || ''))],
        }),
      ],
    });
  });

  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph("Field")] }),
      new TableCell({ children: [new Paragraph("Response")] }),
    ],
  });

  const table = new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph(formTitle),
        new Paragraph(`Generated: ${new Date().toLocaleString()}`),
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
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(formTitle, 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
  
  let yPosition = 45;
  doc.setFontSize(12);
  
  Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .forEach(([key, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${key}:`, 20, yPosition);
      yPosition += 7;
      const valueText = String(value || '');
      const wrappedText = doc.splitTextToSize(valueText, 170);
      doc.setFontSize(11);
      doc.text(wrappedText, 30, yPosition);
      yPosition += wrappedText.length * 7 + 5;
      doc.setFontSize(12);
    });
  
  doc.save(`${formTitle}-response-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateWhatsAppShareMessage(formTitle: string, responseData: any, formUrl: string): string {
  const summary = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(([key, value]) => `${String(key).charAt(0).toUpperCase() + String(key).slice(1)}: ${value}`)
    .join('\n');

  return `I just filled out the "${formTitle}" form:\n\n${summary}\n\nYou can fill it too: ${formUrl}`;
}
