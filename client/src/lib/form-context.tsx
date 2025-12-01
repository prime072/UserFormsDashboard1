import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';

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
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, left: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, right: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" } }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(value) })],
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, left: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" }, right: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" } }
        }),
      ],
    });
  });

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: "Field", bold: true })],
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 1, color: "000000" } }
      }),
      new TableCell({
        children: [new Paragraph({ text: "Response", bold: true })],
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 1, color: "000000" } }
      }),
    ],
  });

  const table = new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: formTitle, size: 28, bold: true, spacing: { after: 100 } }),
        new Paragraph({ text: `Generated: ${new Date().toLocaleString()}`, size: 20, spacing: { after: 200 } }),
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

  const pdfContent = `
    ${formTitle}
    Generated: ${new Date().toLocaleString()}
    
    ${content}
  `;

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
