import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function processUrl(url: string, canvasRef: any) {
    try {
        const response = await fetch('/api/fetch-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const arrayBuffer = await response.arrayBuffer();
        const pdf_text: any = await handlePdfData(arrayBuffer, canvasRef);

        return pdf_text.split('\n');
    } catch (err) {
        console.error('Error fetching PDF:', err);
    }
}

export async function handlePdfData(pdfData: any, canvasRef: any) {
    try {
        const loadingTask = pdfjsLib.getDocument({
            data: pdfData,
            cMapUrl: '/cmaps/',
            cMapPacked: true,
        });
        const pdf = await loadingTask.promise;

        let pagesTextArray = '';
        const canvas: any = canvasRef;
        const canvasContext = canvas.getContext('2d');

        for (let i = 1; i <= pdf.numPages; i++) {
            // processingMessage.value = `Processing page ${i} of ${pdf.numPages}...`;
            const page = await pdf.getPage(i);

            const textContent = await page.getTextContent();
            // console.log('Page textContent:', textContent);

            const hasText = textContent.items.some(
                (item: any) => item.str && item.str.trim().length > 0
            );

            if (!hasText) {
                // processingMessage.value = `Running OCR on page ${i}...`;
                const viewport = page.getViewport({ scale: 2 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: canvasContext,
                    viewport: viewport,
                }).promise;

                const { data: { text }} = await Tesseract.recognize(canvas, 'eng', {
                    logger: (m) => console.log(m),
                });
                pagesTextArray += text + '\n';
            } else {
                pagesTextArray += textContent.items.map((item: any) => item.str).join('\n');
            }
        }

        // console.log('Extracted Text:', pagesTextArray);
        return pagesTextArray;
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

export async function fetchFieldServiceAttachmentsList(fs_workorder: any, config_all: any) {
    const fs_cookie = config_all?.find((item: any) => item.config_key === 'fs_cookie')

    const response = await fetch('/api/vista/field_service/attachment_list', {
        method: 'POST',
        body: JSON.stringify({
            fs_cookie: fs_cookie?.config_value,
            uniqueAttchID: fs_workorder?.UniqueAttchID
        })
    })
    const res = await response.json()

    return res
}

export async function savePDF(fs_attachment: any, config_all: any) {
    const fs_cookie = config_all?.find((item: any) => item.config_key === 'fs_cookie')

    const response = await fetch('/api/vista/field_service/save-pdf', {
        method: 'POST',
        body: JSON.stringify({
            fs_cookie: fs_cookie?.config_value,
            attachmentID: fs_attachment?.AttachmentID
        })
    })
    const res = await response.json()

    return res
}