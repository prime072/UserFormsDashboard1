import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";

export type FieldType = "text" | "number" | "email" | "textarea" | "checkbox" | "select";

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
  lastUpdated: string; // ISO date string
  fields: FormField[];
}

type FormContextType = {
  forms: Form[];
  addForm: (title: string, fields: FormField[]) => void;
  updateForm: (id: string, title: string, fields: FormField[]) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => Form | undefined;
};

const FormContext = createContext<FormContextType | null>(null);

// Initial seed data
const INITIAL_FORMS: Form[] = [
  { 
    id: "1", 
    title: "Customer Feedback", 
    responses: 342, 
    status: "Active", 
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    fields: [] 
  },
  { 
    id: "2", 
    title: "Event Registration", 
    responses: 89, 
    status: "Active", 
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    fields: [] 
  },
  { 
    id: "3", 
    title: "Employee Satisfaction", 
    responses: 45, 
    status: "Draft", 
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    fields: [] 
  },
];

export function FormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    // Load from localStorage or use seed data
    const stored = localStorage.getItem("formflow_forms");
    if (stored) {
      setForms(JSON.parse(stored));
    } else {
      setForms(INITIAL_FORMS);
      localStorage.setItem("formflow_forms", JSON.stringify(INITIAL_FORMS));
    }
  }, []);

  const addForm = (title: string, fields: FormField[]) => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      status: "Active",
      responses: 0,
      lastUpdated: new Date().toISOString(),
      fields
    };
    
    const updatedForms = [newForm, ...forms];
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  const updateForm = (id: string, title: string, fields: FormField[]) => {
    const updatedForms = forms.map(f => 
      f.id === id 
        ? { ...f, title, fields, lastUpdated: new Date().toISOString() }
        : f
    );
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  const deleteForm = (id: string) => {
    const updatedForms = forms.filter(f => f.id !== id);
    setForms(updatedForms);
    localStorage.setItem("formflow_forms", JSON.stringify(updatedForms));
  };

  const getForm = (id: string) => {
    return forms.find(f => f.id === id);
  };

  return (
    <FormContext.Provider value={{ forms, addForm, updateForm, deleteForm, getForm }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForms() {
  const context = useContext(FormContext);
  if (!context) throw new Error("useForms must be used within FormProvider");
  return context;
}
