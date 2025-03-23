import pdfMake from "pdfmake/build/pdfmake"; 
import pdfFonts from "pdfmake/build/vfs_fonts";

// Make sure to link the fonts in the vfs system
pdfMake.vfs = pdfFonts.vfs;

export const generatePDF = (latex: string, title: string = "Research Paper") => {
  // The document definition structure
  const docDefinition = {
    content: [
      { text: title, style: "header" },
      { text: new Date().toLocaleDateString(), style: "date" },
      { text: "\n" },
      { text: latex, style: "content" },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
        alignment: "center" as const
      },
      date: {
        fontSize: 12,
        color: "#666666",
        margin: [0, 0, 0, 20] as [number, number, number, number],
        alignment: "center" as const
      },
      content: {
        fontSize: 12,
        lineHeight: 1.5,
        margin: [0, 0, 0, 10] as [number, number, number, number]
      }
    },
    defaultStyle: {
      font: "Helvetica"
    },
    pageSize: "A4" as const,
    pageMargins: [40, 40, 40, 40] as [number, number, number, number]
  };

  // Create and download the PDF
  pdfMake.createPdf(docDefinition).download(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};
