<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-6">
    <div class="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-3xl mx-auto">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-white mb-2">📄 PDF OCR Extractor</h1>
      <p class="text-gray-400 mb-6">
        Upload a PDF file or provide a URL to extract the text using OCR.
      </p>

      <!-- File Input -->
      <div class="mb-4">
        <label
          class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Choose PDF
          <input type="file" @change="processFile" accept=".pdf" class="hidden" />
        </label>
      </div>

      <!-- URL Input -->
      <div class="mb-4">
        <input
          v-model="pdfUrl"
          type="text"
          placeholder="Enter PDF URL (https://example.com/file.pdf)"
          class="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400"
        />
        <button
          @click="processUrl"
          class="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Process PDF from URL
        </button>
      </div>

      <!-- Processing Message -->
      <p v-if="processingMessage" class="mt-4 text-gray-300">
        {{ processingMessage }}
      </p>

      <!-- Extracted Text -->
      <div
        v-if="extractedText.length"
        class="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-4 max-h-72 overflow-y-auto"
      >
        <h2 class="font-semibold text-gray-200 mb-2">Extracted Text</h2>
        <pre class="text-sm text-gray-300 whitespace-pre-wrap">
{{ JSON.stringify(extractedText, null, 2) }}
        </pre>
      </div>
    </div>

    <!-- Hidden Canvas -->
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
  import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
  import Tesseract from 'tesseract.js';

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  // State
  const extractedText = ref([]);
  const processingMessage = ref('');
  const canvasRef = ref(null);
  const pdfUrl = ref('');

  // Main PDF processing function (shared by both file + URL)
  async function handlePdfData(pdfData) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: pdfData,
        cMapUrl: '/cmaps/',
        cMapPacked: true,
      });
      const pdf = await loadingTask.promise;

      const pagesTextArray = [];
      const canvas = canvasRef.value;
      const canvasContext = canvas.getContext('2d');

      for (let i = 1; i <= pdf.numPages; i++) {
        processingMessage.value = `Processing page ${i} of ${pdf.numPages}...`;
        const page = await pdf.getPage(i);

        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        if (pageText.trim().length === 0) {
          processingMessage.value = `Running OCR on page ${i}...`;
          const viewport = page.getViewport({ scale: 2 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: canvasContext,
            viewport: viewport,
          }).promise;

          const { data: { text } } = await Tesseract.recognize(
            canvas,
            'eng',
            { logger: m => console.log(m) }
          );
          pagesTextArray.push(text);
        } else {
          pagesTextArray.push(pageText);
        }
      }

      processingMessage.value = '';
      extractedText.value = pagesTextArray;
    } catch (error) {
      console.error('Error processing PDF:', error);
      processingMessage.value = 'Failed to process PDF. Please try a different file or URL.';
    }
  }

  // Handle local file
  async function processFile(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      processingMessage.value = 'Please select a valid PDF file.';
      extractedText.value = [];
      return;
    }

    processingMessage.value = 'Processing PDF...';
    extractedText.value = [];

    const reader = new FileReader();
    reader.onload = async (e) => {
      await handlePdfData(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }

  async function processUrl() {
    if (!pdfUrl.value) {
      processingMessage.value = 'Please enter a PDF URL.';
      return;
    }
    processingMessage.value = 'Fetching PDF from server...';

    try {
      const response = await fetch('/api/fetch-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pdfUrl.value })
      });

      const arrayBuffer = await response.arrayBuffer();
      console.log('Fetched PDF ArrayBuffer:', arrayBuffer);
      await handlePdfData(arrayBuffer);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      processingMessage.value = 'Failed to fetch PDF. Please check the URL.';
    }
  }
</script>
