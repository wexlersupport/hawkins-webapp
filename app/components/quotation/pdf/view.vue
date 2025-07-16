<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";

// usePDFMake is provided by the nuxt-pdfmake module
const { $pdfMake } = useNuxtApp();

const pdfLink = ref<string | null>(null);
const pdfDoc = ref<any>();

const generatePdf = () => {
  // Define your PDF document structure using pdfmake's declarative syntax
  let content: any[] = [
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: "Service Quotes", style: "header" },
            { text: "123022 6/19", style: "subHeader" },
            { text: "Created By: Andjelko Vucelja", style: "bodyText" },
          ],
        },
        {
          width: 125,
          image:
"data:image/png;base64,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", // Base64 encoded image data
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 20], // Margin below the header
    },
    {
      columns: [
        {
          width: "35%",
          stack: [
            {
              text: "Service Provider",
              style: "sectionTitle",
              margin: [0, 0, 0, 0],
            },
            { text: "Commercial", style: "bodyText" },
          ],
        },
        {
          width: "40%",
          stack: [
            { text: "Customer", style: "sectionTitle" },
            { text: "Bozzuto - Property Management", style: "bodyText" },
            { text: "6406 Ivy Lane Suite 700", style: "bodyText" },
            { text: "Greenbelt, MD 20770", style: "bodyText" },
          ],
        },
        {
          width: "25%",
          stack: [
            { text: "Service Site", style: "sectionTitle" },
            { text: "Affinity On Georgia", style: "bodyText" },
            { text: "8021 Georgia Ave", style: "bodyText" },
            { text: "Silver Spring, MD 20910", style: "bodyText" },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 20],
    },

    // --- Customer Information Table ---
    {
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 0 : 0;
        },
        hLineColor: function (i, node) {
          return i === 0 || i === node.table.body.length
            ? "#000000"
            : "#CCCCCC";
        },
        vLineColor: function (i, node) {
          return "#000000";
        },
        paddingLeft: function (i, node) {
          return 5;
        },
        paddingRight: function (i, node) {
          return 5;
        },
        paddingTop: function (i, node) {
          return 8;
        },
        paddingBottom: function (i, node) {
          return 8;
        },
      },
      table: {
        widths: ["35%", "*"],
        body: [
          // Header Row
          [
            { text: "Customer Information", colSpan: 2, style: "tableHeader" },
            {},
          ],
          // Data Rows
          [
            { text: "Date", style: "tableKey" },
            { text: "06/19/2025", style: "tableValue" },
          ],
          [
            { text: "Work Order #", style: "tableKey" },
            { text: "123022", style: "tableValue" },
          ],
          [
            { text: "Site Name", style: "tableKey" },
            { text: "Affinity on gergia", style: "tableValue" },
          ],
          [
            { text: "Contact Name & Phone Number", style: "tableKey" },
            { text: "Darnell 202-873-5340", style: "tableValue" },
          ],
          [
            { text: "Email Address", style: "tableKey" },
            { text: "darnell.crockwell@buzzuto.com", style: "tableValue" },
          ],
        ],
      },
      margin: [0, 0, 0, 20],
    },

    // --- Scope Information Table ---
    {
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 0 : 0;
        },
        hLineColor: function (i, node) {
          return i === 0 || i === node.table.body.length
            ? "#000000"
            : "#CCCCCC";
        },
        vLineColor: function (i, node) {
          return "#000000";
        },
        paddingLeft: function (i, node) {
          return 5;
        },
        paddingRight: function (i, node) {
          return 5;
        },
        paddingTop: function (i, node) {
          return 8;
        },
        paddingBottom: function (i, node) {
          return 8;
        },
      },
      table: {
        widths: ["35%", "*"],
        body: [
          // Header Row
          [{ text: "Scope Information", colSpan: 2, style: "tableHeader" }, {}],
          // Data Row
          [
            { text: "Scope of quoted work", style: "tableKey" },
            {
              text: "Pull new cercuit for the grills by the pool under the wood boards we just need few removed It's about 80 feet to the electric room.",
              style: "tableValue",
            },
          ],
        ],
      },
      margin: [0, 0, 0, 20],
    },

    // --- Material Table ---
    {
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 0 : 0;
        },
        hLineColor: function (i, node) {
          return i === 0 || i === node.table.body.length
            ? "#000000"
            : "#CCCCCC";
        },
        vLineColor: function (i, node) {
          return "#000000";
        },
        paddingLeft: function (i, node) {
          return 5;
        },
        paddingRight: function (i, node) {
          return 5;
        },
        paddingTop: function (i, node) {
          return 8;
        },
        paddingBottom: function (i, node) {
          return 8;
        },
      },
      table: {
        widths: ["35%", "*"],
        body: [
          // Header Row
          [{ text: "Material", colSpan: 2, style: "tableHeader" }, {}],
          // Data Row
          [
            { text: "", style: "tableKey" }, // Empty cell for the left column
            {
              stack: [
                { text: "12/2 uf 100 feet", style: "tableValue" },
                {
                  text: "One stick of half inch met pipe",
                  style: "tableValue",
                },
                { text: "1/2 ent straps 4", style: "tableValue" },
                { text: "We box cover and 20 amp outlet", style: "tableValue" },
                { text: "20 amp squaere d breaker", style: "tableValue" },
              ],
            },
          ],
        ],
      },
      margin: [0, 0, 0, 20],
    },

    // --- Estimated Time & Number of Techs/Helpers Table ---
    {
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 0 : 0;
        },
        hLineColor: function (i, node) {
          return i === 0 || i === node.table.body.length
            ? "#000000"
            : "#CCCCCC";
        },
        vLineColor: function (i, node) {
          return "#000000";
        },
        paddingLeft: function (i, node) {
          return 5;
        },
        paddingRight: function (i, node) {
          return 5;
        },
        paddingTop: function (i, node) {
          return 8;
        },
        paddingBottom: function (i, node) {
          return 8;
        },
      },
      table: {
        widths: ["35%", "*"],
        body: [
          // Header Row
          [
            {
              text: "Estimated Time & Number of Techs/Helpers",
              colSpan: 2,
              style: "tableHeader",
            },
            {},
          ],
          // Data Rows
          [
            { text: "Number of Techs", style: "tableKey" },
            { text: "1", style: "tableValue" },
          ],
          [
            { text: "Number of Helpers", style: "tableKey" },
            { text: "1", style: "tableValue" },
          ],
          [
            { text: "Hours To Complete", style: "tableKey" },
            { text: "5", style: "tableValue" },
          ],
        ],
      },
      margin: [0, 0, 0, 20],
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    content,
    pageMargins: [40, 40, 40, 40],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: "#333333",
        margin: [0, 0, 0, 5],
      },
      subHeader: {
        fontSize: 14,
        bold: false,
        color: "#555555",
        margin: [0, 0, 0, 10],
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: "#000000",
        margin: [0, 0, 0, 5],
        decoration: "underline",
      },
      bodyText: {
        fontSize: 10,
        color: "#333333",
        margin: [0, 0, 0, 2],
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        fillColor: "#EEEEEE",
        alignment: "left",
        margin: [0, 0, 0, 0], // Reset margin for table cells
      },
      tableKey: {
        fontSize: 10,
        bold: true,
        color: "#333333",
      },
      tableValue: {
        fontSize: 10,
        color: "#333333",
      },
    },
    defaultStyle: {
      font: "Roboto", // Ensure Roboto is available or specify custom fonts in nuxt.config.ts
    },
  };

  // Generate the PDF
  pdfDoc.value = $pdfMake.createPdf(docDefinition);
  console.log('pdfDoc.value ', pdfDoc.value)

  // You can open, download, or get a data URL
  // To open in a new tab:
  // pdfDoc.open();

  // To download directly:
  // pdfDoc.download("sample-document.pdf");

  // To get a data URL for embedding (client-side only):
  pdfDoc.value.getDataUrl((dataUrl: string) => {
    pdfLink.value = dataUrl;
  });
};

const downloadPdf = async () => {
  pdfDoc.value.download("sample-document.pdf");

  storePublicPdf()
}

const storePublicPdf = () => {
  // 1. Get the PDF as a Blob
  pdfDoc.value.getBlob(async (blob: Blob) => {
    console.log('PDF Blob generated:', blob);
    try {
      const formData = new FormData();
      formData.append('pdfFile', blob, 'uploaded_document.pdf');
      const response = await fetch('/api/sendgrid/upload-files', { // Assuming you have a Nuxt server API route
        method: 'POST',
        body: formData,
      });
      console.log('response ', response)

      if (response.ok) {
        console.log('PDF uploaded successfully!');
      } else {
        console.error('PDF upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  });
}

// Optional: You can load the PDF on mount if you want it ready immediately
onMounted(() => {
  generatePdf();
});
</script>

<template>
  <div class="container">
    <!-- <h1>Nuxt 3 PDF Generation with pdfmake</h1>
    <p>Click the button below to generate a sample PDF.</p> -->
    <!-- <button @click="downloadPdf">Download PDF</button> -->
     <UButton @click="downloadPdf" class="cursor-pointer mr-4" label="Download PDF" icon="i-lucide-download" />

    <div v-if="pdfLink" class="pdf-preview h-full pb-6">
      <h2 class="text-gray-900">PDF Preview</h2>
      <iframe :src="pdfLink" width="100%" class="h-full pb-6"></iframe>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  /* margin: 40px auto; */
  padding: 20px;
  font-family: sans-serif;
  text-align: center;
  height: 100%;
}

.pdf-preview {
  margin-top: 30px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f9f9f9;
}

iframe {
  border: none;
}
</style>
