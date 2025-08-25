<script setup lang="ts">
    const toast = useToast()
    const route = useRoute()

    const quotation_id = Number(route.query.quotation_id as string)
    const work_order_id = Number(route.query.work_order_id as string)
    const isLoading = ref<boolean>(true)
    const pdfViewRef = ref<any>(null)
    const pdfBase64 = ref<any>(null)
    const sendEmailModalRef = ref<any>(null)
    const quotationDetails = ref<any>(null)
    const workOrderDetail = ref<any>(null)
    const customerDetail = ref<any>(null)
    const fsDetail = ref<any>(null)
    const isFsDetail = ref<boolean>(false)
    const { data: configData } = await useFetch('/api/postgre', {
        query: { table: 'configuration' }
    });
    const config_all = ref<any>(configData.value?.data)

    onMounted(async () => {
        isLoading.value = true
        quotationDetails.value = await fetchQuotationId()

        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response

        const { response: customer } = await fetchCustomerId()
        customerDetail.value = customer

        const { response: fs_data } = await fetchFieldService()
        fsDetail.value = fs_data?.find((item: any) => item.WorkOrder === Number(work_order_id))
        // console.log('Field Service Work Order: ', fsDetail.value)
        if (!fsDetail.value) {
            toast.add({ title: 'No Field Service Data!', description: `No Field Service data found for Work Order ID ${work_order_id}.`, color: 'error' })
        } else {
            isFsDetail.value = true
        }

        isLoading.value = false
    })

    const data = computed(() => {
        return {
            quotation_id,
            work_order_id,
            quotation_details: quotationDetails.value,
            work_order_details: workOrderDetail.value,
            customer_details: customerDetail.value,
            pdf_base64: pdfBase64.value,
            field_service: fsDetail.value,
        }
    })

    async function fetchFieldService() {
        const fs_x_xsrf_token = config_all.value?.find((item: any) => item.config_key === 'fs_x_xsrf_token')
        const fs_cookie = config_all.value?.find((item: any) => item.config_key === 'fs_cookie')

        const response = await fetch('/api/vista/field_service', {
            method: 'POST',
            body: JSON.stringify({
                fs_cookie: fs_cookie?.config_value,
                fs_x_xsrf_token: fs_x_xsrf_token?.config_value
            })
        })
        const res = await response.json()

        return res
    }

    async function fetchQuotationId() {
        const data = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
            query: {
                table: 'quotation_details',
                dynamic_field: 'quotation_id',
                value: quotation_id
            },
            method: 'GET'
        }));

        return data
    }

    async function fetchWorkOrderId() {
        const response = await fetch('/api/vista/work-order-id', {
            method: 'POST',
            body: JSON.stringify({ id: work_order_id })
        })
        const res = await response.json()
        return res
    }

    async function fetchCustomerId() {
        const response = await fetch('/api/vista/customer-id', {
            method: 'POST',
            body: JSON.stringify({ id: workOrderDetail.value.Customer, group: workOrderDetail.value.CustGroup })
        })
        const res = await response.json()
        return res
    }

    async function onComposeEmailModal() {
        sendEmailModalRef.value.onModalOpen()
    }

    const blobToBase64 = (blob: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result will be a data URL (e.g., "data:application/pdf;base64,JVBERi...")
                // We only need the base64 part, so we remove the "data:type/subtype;base64," prefix
                const base64String = reader?.result?.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    async function onUpdatePdf(blob: Blob) {
        // console.log('onUpdatePdf blob', blob);
        pdfBase64.value = await blobToBase64(blob);
    }
</script>

<template>
    <UDashboardPanel id="quotation-details" :ui="{ body: 'gap-1 sm:gap-1' }">
        <template #header>
            <UDashboardNavbar title="Quotation PDF Preview">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UiAppButtonBack />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <UiAppLoading
                v-if="isLoading"
                class="border rounded-md p-6 my-4 border-neutral-800"
            />
            <div v-if="!isLoading" class="flex gap-2 px-5">
                <UButton @click="pdfViewRef.downloadPdf()" class="cursor-pointer" size="xl" label="Download PDF" icon="i-lucide-download" color="neutral" />
                <UButton @click="onComposeEmailModal" class="cursor-pointer" size="xl" label="Compose Email" icon="i-lucide-mail" color="neutral" />
            </div>

            <div v-if="!isLoading && !isFsDetail" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-5 mt-4" role="alert">
                <p class="font-bold">Warning!</p>
                <p>No Field Service data found for Work Order ID <b>{{ work_order_id }}</b>.</p>
            </div>

            <QuotationPdfView ref="pdfViewRef" v-if="!isLoading" :data="data" @on-update-pdf="onUpdatePdf" />
            <UiModalSendEmail ref="sendEmailModalRef" @download="pdfViewRef.downloadPdf()" v-if="!isLoading" :data="data" />
        </template>
    </UDashboardPanel>
</template>
