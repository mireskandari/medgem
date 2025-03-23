import pdfMake from "pdfmake/build/pdfmake"; 
import pdfFonts from "pdfmake/build/vfs_fonts";

// Make sure to link the fonts in the vfs system
pdfMake.vfs = pdfFonts.vfs;

export const generatePDF = (latex: string) => {
  // The document definition structure
  const docDefinition = {
    content: [
      { text: "Formatted LaTeX Output", style: "header" },
      // Add LaTeX-formatted text
      { text: latex, style: "latexText" },
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      latexText: { fontSize: 12, font: "Courier" },
    },
  };

  // Create and download the PDF
  pdfMake.createPdf(docDefinition).download("formatted-text.pdf");
};
