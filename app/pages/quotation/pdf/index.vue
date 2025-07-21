<script setup lang="ts">
    const route = useRoute()

    const quotation_id = Number(route.query.quotation_id as string)
    console.log('quotation_id ' , quotation_id)
    const work_order_id = Number(route.query.work_order_id as string)
    console.log('work_order_id ' , work_order_id)
    const isLoading = ref<boolean>(true)
    const pdfViewRef = ref<any>(null)
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

            <QuotationPdfView ref="pdfViewRef" v-if="!isLoading" :data="data" />
            <UiModalSendEmail ref="sendEmailModalRef" @download="pdfViewRef.downloadPdf()" v-if="!isLoading" :data="data" />
        </template>
    </UDashboardPanel>
</template>
