<template>
  <div class="p-4 bg-elevated rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Upload Excel File</h2>

    <form :disabled="true" @submit.prevent="handleUpload" class="flex flex-col space-y-4">
      <select
        v-model="selectedOption"
        class="block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-blue-500 focus:ring focus:ring-blue-200 
              focus:ring-opacity-50 text-gray-900 text-sm p-2 bg-gray-50"
      >
        <option value="" disabled selected>Select a module</option>
        <option value="wire-cord-cable">wire-cord-cable</option>
        <option value="conduit-raceways">conduit-raceways</option>
        <option value="conduit-accesories">conduit-accesories</option>
        <option value="distribution-equipment">distribution-equipment</option>
        <option value="controls">controls</option>
        <option value="wiring-devices">wiring-devices</option>
        <option value="miscellaneous">miscellaneous</option>
        <option value="lightning">lightning</option>
        <option value="builders-products">builders-products</option>
        <option value="line-construction-material">line-construction-material</option>
      </select>
      <input 
        type="file" 
        multiple
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
        :disabled="isLoading"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full
               transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Uploading...</span>
        <span v-else>Upload and Save</span>
      </button>
    </form>

    <UiAppLoading
      v-if="isLoading"
      class="border rounded-md p-6 my-4 border-neutral-800"
    />
    
    <div v-if="message" class="mt-4 p-3 rounded-lg text-sm" :class="messageClass">
      {{ message }}
    </div>

    <div v-if="existingData.length" class="mt-6 text-sm">
      <table>
        <thead>
          <tr>
            <th>Existing Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in existingData" :key="index">
            <td>{{ row }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
  </div>
</template>

<script setup lang="ts">
  import * as XLSX from 'xlsx';
  import { ref } from 'vue';
  import { convertCurrencyToNumber } from '@/utils';
  // const { data, refresh } = await useFetch('/api/postgre', {
  //     query: { table: 'materials' }
  // });

  const isLoading = ref(false);
  const fileInput = ref(null);
  const selectedFiles = ref<any>(null);
  const selectedOption = ref();
  const isUploading = ref(false);
  const message = ref('');
  const messageClass = ref('');
  const importedData = ref<any[]>([]);
  const existingData = ref<any[]>([]);

  const onFileChange = (e) => {
    selectedFiles.value = e.target.files;
    console.log('Selected files:', selectedFiles.value);
    message.value = '';
  };

  const handleUpload = async (event) => {
    if (!selectedOption.value) {
      message.value = 'Please select a module first.';
      messageClass.value = 'bg-yellow-100 text-yellow-800';
      return;
    }

    if (!selectedFiles.value || selectedFiles.value.length === 0) {
      message.value = 'Please select at least one file.';
      messageClass.value = 'bg-yellow-100 text-yellow-800';
      return;
    }

    message.value = '';

    try {
      isLoading.value = true;
      existingData.value = [];
      importedData.value = [];

      let allPromises = [];

      for (let file of selectedFiles.value) {
        const reader = new FileReader();

        const filePromise = new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const data = e.target.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

              const rows = json_data.slice(1); // skip headers
              importedData.value.push(...rows);

              let rowPromises = rows.map((row: any) => {
                const formObj = {
                  image: row[0] || null,
                  allpriser_code: row[1] || null,
                  allpriser_group: row[2] || null,
                  allpriser_type: row[3] || null,
                  allpriser_description: row[4] || null,
                  name: row[5] || null,
                  sku: row[6] || null,
                  manufacturer: row[7] || null,
                  description: row[8] || null,
                  legacy_uom: row[9] || null,
                  uom: row[10] || null,
                  uom_qty: row[11] || null,
                  price_status: row[12] || null,
                  change_symbol: row[13] || null,
                  cost: convertCurrencyToNumber(row[14]) || 0,
                  col2: row[15] || null,
                  col1: row[16] || null,
                  list: row[17] || null,
                  amp: row[18] || null,
                  resale: row[19] || null,
                  category: selectedOption.value,
                };

                const created_at = formatJsDateToDatetime(new Date());
                return handleApiResponse($fetch('/api/postgre', {
                  query: { table: 'materials' },
                  method: 'POST',
                  body: { created_at, ...formObj }
                }));
              });

              resolve(Promise.all(rowPromises));
            } catch (err) {
              reject(err);
            }
          };

          reader.onerror = reject;
          reader.readAsBinaryString(file);
        });

        allPromises.push(filePromise);
      }

      Promise.all(allPromises)
        .then((responses) => {
          console.log("All files uploaded:", responses);
          const filename = selectedFiles.value[selectedFiles.value.length - 1].name;
          message.value = `Files uploaded successfully! (${filename})`;
          messageClass.value = 'bg-green-100 text-green-800';
        })
        .catch((error) => {
          console.error("Upload error:", error);
          message.value = 'An error occurred during upload. Please try again.';
          messageClass.value = 'bg-red-100 text-red-800';
        })
        .finally(() => {
          isLoading.value = false;
          isUploading.value = false;
          selectedFiles.value = [];
          if (fileInput.value) fileInput.value.value = '';
        });

    } catch (error) {
      message.value = 'An error occurred during upload. Please try again.';
      messageClass.value = 'bg-red-100 text-red-800';
      console.error('Upload error:', error);
    }
  };

  const handleUpload1 = async (event) => {
    if (!selectedOption.value) {
      message.value = 'Please select a module first.';
      messageClass.value = 'bg-yellow-100 text-yellow-800';
      return;
    }

    if (!selectedFiles.value) {
      message.value = 'Please select a file first.';
      messageClass.value = 'bg-yellow-100 text-yellow-800';
      return;
    }
    
    message.value = '';

    try {
        isLoading.value = true
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
        reader.readAsBinaryString(selectedFiles.value);
        // refresh(); // Refresh the data to get the latest materials
        existingData.value = [];

        setTimeout(async () => {
          console.log('importedData ', importedData.value);
          if (importedData.value.length > 0) {
            // const materials: any = data.value?.data
            // console.log('materials ', materials);

            let array_promises = []

            for (let index = 0; index < importedData.value.length; index++) {
              const row = importedData.value[index];
              // const existingMaterialName = materials.filter(item => item.name === row[5]);
              // const existingMaterialSku = materials.filter(item => item.sku === row[6]);
              // if (existingMaterialName.length > 0) {
              //   existingData.value.push(`Existing Name: ${row[5]}, Row: ${index+1}`);
              //   console.log('Name already exists, skipping row:', row[5]);
              //   if ((index + 1) >= importedData.value.length) {
              //     message.value = 'File uploaded successfully!: ' + selectedFiles.value?.name;
              //     messageClass.value = 'bg-green-100 text-green-800';
              //     isLoading.value = false
              //   }
              //   continue; // Skip this row if material already exists
              // }
              // if (existingMaterialSku.length > 0) {
              //   existingData.value.push(`Existing SKU: ${row[6]}, Row: ${index+1}`);
              //   console.log('SKU already exists, skipping row:', row[6]);
              //   if ((index + 1) >= importedData.value.length) {
              //     message.value = 'File uploaded successfully!: ' + selectedFiles.value?.name;
              //     messageClass.value = 'bg-green-100 text-green-800';
              //     isLoading.value = false
              //   }
              //   continue; // Skip this row if material already exists
              // }
              const formObj = {
                image: row[0] || null,
                allpriser_code: row[1] || null,
                allpriser_group: row[2] || null,
                allpriser_type: row[3] || null,
                allpriser_description: row[4] || null,
                name: row[5] || null,
                sku: row[6] || null,
                manufacturer: row[7] || null,
                description: row[8] || null,
                legacy_uom: row[9] || null,
                uom: row[10] || null,
                uom_qty: row[11] || null,
                price_status: row[12] || null,
                change_symbol: row[13] || null,
                cost: convertCurrencyToNumber(row[14]) || 0,
                col2: row[15] || null,
                col1: row[16] || null,
                list: row[17] || null,
                amp: row[18] || null,
                resale: row[19] || null,
                category: selectedOption.value,
              };
              // console.log('formObj ', formObj)
              const created_at = formatJsDateToDatetime(new Date());
              const createItem = handleApiResponse($fetch('/api/postgre', {
                query: { table: 'materials' },
                method: 'POST',
                body: { created_at, ...formObj }
              }));
              array_promises.push(createItem);
              // console.log('Created item:', createItem);
            };

            console.log('array_promises:', array_promises);
            Promise.all(array_promises).then(async (response) => {
                console.log('All promises resolved:', response);
                message.value = 'File uploaded successfully!: ' + selectedFiles.value?.name;
                messageClass.value = 'bg-green-100 text-green-800';
                isLoading.value = false
                selectedFiles.value = null;
            }).catch(async (error) => {
                console.log("Promise.all caught an error:", error);
            })
            .finally(() => {
                console.log("Promise.all finished.");
            });

            // refresh(); // Refresh the data to get the latest materials
          }
        }, 1000);
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
      // selectedFiles.value = null;
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