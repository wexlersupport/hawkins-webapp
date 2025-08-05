<template>
  <div class="p-4 bg-elevated rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Upload Excel File</h2>
    
    <form @submit.prevent="handleUpload" class="flex flex-col space-y-4">
      <input 
        type="file" 
        @change="onFileChange" 
        ref="fileInput" 
        accept=".xlsx, .xls, .csv"
        class="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
      />
      
      <button 
        type="submit" 
        :disabled="isUploading"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full
               transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <span v-if="isUploading">Uploading...</span>
        <span v-else>Upload and Save</span>
      </button>
    </form>
    
    <div v-if="message" class="mt-4 p-3 rounded-lg text-sm" :class="messageClass">
      {{ message }}
    </div>
  </div>
   <!-- <div>
    <input type="file" @change="handleFileChange" accept=".xlsx, .xls" />
    <div v-if="importedData.length">
      <h3>Imported Data:</h3>
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in importedData" :key="index">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div> -->
</template>

<script setup>
  import * as XLSX from 'xlsx';
  import { ref } from 'vue';
  import { convertCurrencyToNumber } from '@/utils';

  const fileInput = ref(null);
  const selectedFile = ref(null);
  const isUploading = ref(false);
  const message = ref('');
  const messageClass = ref('');
  const importedData = ref([]);

  const onFileChange = (e) => {
    selectedFile.value = e.target.files[0];
    message.value = '';
  };

  const handleUpload = async (event) => {
    if (!selectedFile.value) {
      message.value = 'Please select a file first.';
      messageClass.value = 'bg-yellow-100 text-yellow-800';
      return;
    }
    
    isUploading.value = true;
    message.value = '';

    try {
        const reader = new FileReader();

        reader.onload = (e) => {
          // Get the binary string from the file reader
          const data = e.target.result;
          
          // Parse the data using the xlsx package
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first sheet name
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert the worksheet to a JSON array
          const json_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log('json_data ',json_data);
          
          // The first row is usually the headers
          // headers.value = json_data[0];
          
          // The rest of the rows are the data
          importedData.value = json_data.slice(1);
        };
        reader.readAsBinaryString(selectedFile.value);

        setTimeout(async () => {
          console.log('importedData ', importedData.value);
          if (importedData.value.length > 0) {
            importedData.value.forEach(async (row) => {
              const formObj = {
                sku: row[6],
                name: row[5],
                cost: convertCurrencyToNumber(row[19]) || 0,
                description: row[8] || '',
              };
              const created_at = formatJsDateToDatetime(new Date());
              const createItem = await handleApiResponse($fetch('/api/postgre', {
                query: { table: 'materials' },
                method: 'POST',
                body: { created_at, ...formObj }
              }));
              console.log('Created item:', createItem);
            });
          }
        }, 1000);
      
      message.value = 'File uploaded successfully!';
      messageClass.value = 'bg-green-100 text-green-800';
    } catch (error) {
      message.value = 'An error occurred during upload. Please try again.';
      messageClass.value = 'bg-red-100 text-red-800';
      console.error('Upload error:', error);
    } finally {
      isUploading.value = false;
      // Reset file input
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      selectedFile.value = null;
    }
  };


  // import { ref } from 'vue';

  // const importedData = ref([]);
  // const headers = ref([]);

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (!file) {
  //     return;
  //   }

  //   const reader = new FileReader();

  //   reader.onload = (e) => {
  //     // Get the binary string from the file reader
  //     const data = e.target.result;
      
  //     // Parse the data using the xlsx package
  //     const workbook = XLSX.read(data, { type: 'binary' });
      
  //     // Get the first sheet name
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];
      
  //     // Convert the worksheet to a JSON array
  //     const json_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
  //     // The first row is usually the headers
  //     headers.value = json_data[0];
      
  //     // The rest of the rows are the data
  //     importedData.value = json_data.slice(1);
  //   };

  //   reader.readAsBinaryString(file);
  // };
</script>