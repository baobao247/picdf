/**
 * PicDF - PDF Generation Engine
 * Coordinates jsPDF page setup, orientation, margins, watermark, and page numbers
 */
const PdfBuilder = (function() {
  async function generate(imagesData, options = {}) {
    if (!imagesData || !imagesData.length) {
      throw new Error('Danh sách ảnh trống');
    }

    const { jsPDF } = window.jspdf;
    const pageFormat = options.pageFormat || 'a4';
    const orientationPref = options.orientation || 'auto';
    const margin = options.margin || 0;
    const quality = options.quality || 0.85;
    const filterType = options.filterType || 'original';
    const watermarkText = (options.watermark || '').trim();
    const addPageNumbers = options.addPageNumbers !== false;

    let pdf = null;
    const pxToMm = 0.264583;

    for (let i = 0; i < imagesData.length; i++) {
      const item = imagesData[i];
      const processed = await ImageProcessor.processImage(item, quality, filterType);

      let orientation = 'portrait';
      if (orientationPref === 'auto') {
        orientation = processed.width >= processed.height ? 'landscape' : 'portrait';
      } else {
        orientation = orientationPref;
      }

      if (i === 0) {
        if (pageFormat === 'fit') {
          pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [processed.width * pxToMm, processed.height * pxToMm]
          });
        } else {
          pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageFormat
          });
        }
      } else {
        if (pageFormat === 'fit') {
          pdf.addPage([processed.width * pxToMm, processed.height * pxToMm], orientation);
        } else {
          pdf.addPage(pageFormat, orientation);
        }
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const availW = pageWidth - (margin * 2);
      const availH = pageHeight - (margin * 2);

      const ratio = Math.min(availW / processed.width, availH / processed.height);
      const drawW = processed.width * ratio;
      const drawH = processed.height * ratio;

      const posX = margin + (availW - drawW) / 2;
      const posY = margin + (availH - drawH) / 2;

      pdf.addImage(processed.dataUrl, 'JPEG', posX, posY, drawW, drawH);

      // Watermark
      if (watermarkText) {
        try {
          if (pdf.saveGraphicsState && pdf.setGState && pdf.GState) {
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.22 }));
            pdf.setFontSize(36);
            pdf.setTextColor(140, 140, 140);
            pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
            pdf.restoreGraphicsState();
          } else {
            pdf.setFontSize(32);
            pdf.setTextColor(200, 200, 200);
            pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
          }
        } catch (e) {
          pdf.setFontSize(30);
          pdf.setTextColor(200, 200, 200);
          pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
        }
      }

      // Page numbers
      if (addPageNumbers) {
        pdf.setFontSize(9);
        pdf.setTextColor(110, 110, 110);
        pdf.text(`Trang ${i + 1} / ${imagesData.length}`, pageWidth / 2, pageHeight - 3.5, { align: 'center' });
      }
    }

    return pdf;
  }

  return {
    generate
  };
})();

if (typeof window !== 'undefined') window.PdfBuilder = PdfBuilder;
