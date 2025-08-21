<script setup lang="ts">
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

    onMounted(async () => {
        isLoading.value = true
        quotationDetails.value = await fetchQuotationId()

        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response

        const { response: customer } = await fetchCustomerId()
        customerDetail.value = customer

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
        }
    })

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
            <div v-if="!isLoading" class="flex gap-x-2 px-5">
                <UButton @click="pdfViewRef.downloadPdf()" class="cursor-pointer" size="xl" label="Download PDF" icon="i-lucide-download" color="neutral" />
                <UButton @click="onComposeEmailModal" class="cursor-pointer" size="xl" label="Compose Email" icon="i-lucide-mail" color="neutral" />
            </div>

            <QuotationPdfView ref="pdfViewRef" v-if="!isLoading" :data="data" @on-update-pdf="onUpdatePdf" />
            <UiModalSendEmail ref="sendEmailModalRef" @download="pdfViewRef.downloadPdf()" v-if="!isLoading" :data="data" />
        </template>
    </UDashboardPanel>
</template>
