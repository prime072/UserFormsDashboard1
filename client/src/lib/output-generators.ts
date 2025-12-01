import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';

export async function generateExcel(formTitle: string, responseData: any) {
  const worksheet = XLSX.utils.json_to_sheet([responseData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Response');
  const filename = `${formTitle}-response-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export async function generateDocx(formTitle: string, responseData: any) {
  const rows = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(
      ([key, value]) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(key).charAt(0).toUpperCase() + String(key).slice(1))] }),
            new TableCell({ children: [new Paragraph(String(value))] }),
          ],
          height: { value: 500, rule: 'auto' },
        })
    );

  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Field')] }),
          new TableCell({ children: [new Paragraph('Response')] }),
        ],
        height: { value: 500, rule: 'auto' },
      }),
      ...rows,
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({ 
    sections: [{ 
      children: [
        new Paragraph({ text: formTitle, style: 'Heading1' }),
        new Paragraph({ text: `Generated on ${new Date().toLocaleString()}`, style: 'Heading2' }),
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
  // Generate a simple PDF using HTML to Canvas approach
  const content = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(([key, value]) => `${String(key).charAt(0).toUpperCase() + String(key).slice(1)}: ${value}`)
    .join('\n');

  const pdfContent = `
    ${formTitle}
    Generated: ${new Date().toLocaleString()}
    
    ${content}
  `;

  const element = document.createElement('div');
  element.innerHTML = `<pre>${pdfContent}</pre>`;
  
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formTitle}-response-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export function generateWhatsAppShareMessage(formTitle: string, responseData: any, formUrl: string): string {
  const summary = Object.entries(responseData)
    .filter(([key]) => key !== 'id' && key !== 'submittedAt')
    .map(([key, value]) => `${String(key).charAt(0).toUpperCase() + String(key).slice(1)}: ${value}`)
    .join('\n');
  
  return `I just filled out the "${formTitle}" form:\n\n${summary}\n\nYou can fill it too: ${formUrl}`;
}
