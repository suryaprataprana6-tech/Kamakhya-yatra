import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadInvoicePDF(
  elementId: string = "kamakhya-booking-invoice",
  filename: string = "Kamakhya-Yatra-Invoice.pdf"
): Promise<boolean> {
  // Always query specifically for #kamakhya-booking-invoice
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById("kamakhya-booking-invoice");
  }

  if (!element) {
    console.error(`Invoice element '#${elementId}' or '#kamakhya-booking-invoice' not found.`);
    throw new Error("Invoice element not found");
  }

  try {
    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Wait for all images inside the invoice element to finish loading
    const images = Array.from(element.getElementsByTagName("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Render high-resolution canvas of ONLY the isolated invoice element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedInvoice = clonedDoc.getElementById("kamakhya-booking-invoice");
        if (clonedInvoice) {
          clonedInvoice.style.position = "static";
          clonedInvoice.style.transform = "none";
          clonedInvoice.style.left = "0";
          clonedInvoice.style.top = "0";

          // Sanitize any computed colors that might resolve to lab()/oklch() in modern browsers
          const allEls = clonedInvoice.getElementsByTagName("*");
          for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i] as HTMLElement;
            try {
              const compStyle = window.getComputedStyle(el);
              if (compStyle.color && (compStyle.color.includes("lab") || compStyle.color.includes("oklch"))) {
                el.style.color = "#0f172a";
              }
              if (compStyle.backgroundColor && (compStyle.backgroundColor.includes("lab") || compStyle.backgroundColor.includes("oklch"))) {
                el.style.backgroundColor = "#ffffff";
              }
              if (compStyle.borderColor && (compStyle.borderColor.includes("lab") || compStyle.borderColor.includes("oklch"))) {
                el.style.borderColor = "#cbd5e1";
              }
            } catch (e) {
              // Ignore computed style sanitization error
            }
          }
        }
      },
    });

    const imgData = canvas.toDataURL("image/png");

    // Create single A4 PDF page (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Exactly 1 page PDF placement (no multi-page splitting, no addPage)
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(filename);
    return true;
  } catch (err: any) {
    console.error("Detailed PDF generation error:", err);
    throw new Error("Unable to generate invoice PDF. Please try again.");
  }
}

export function printInvoice() {
  window.print();
}
