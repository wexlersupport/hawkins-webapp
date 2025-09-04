<script setup lang="ts">
    import { fetchFieldServiceAttachmentsList, processUrl } from '@/utils/process_pdf_url'

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
    const scope_work = ref<any>(null)
    const site_contact = ref<any>(null)
    const canvasRef = ref(null)

    onMounted(async () => {
        isLoading.value = true
        const { response: isLogin } = await isLoginFieldService()
        if (!isLogin) {
            toast.add({ title: 'Unauthorized to Field Service!', description: `Please login in Field Service to access the data.`, color: 'error' })
        }

        quotationDetails.value = await fetchQuotationId()

        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response

        const { response: customer } = await fetchCustomerId()
        customerDetail.value = customer

        const { response: fs_data } = await fetchFieldService()
        // console.log('Field Service Data: ', fs_data[0]?.WorkOrder)
        if (fs_data && fs_data[0]?.WorkOrder) {
            fsDetail.value = fs_data?.find((item: any) => item.WorkOrder === Number(work_order_id))
            // console.log('Field Service Work Order: ', fsDetail.value)
            if (!fsDetail.value) {
                toast.add({ title: 'No Field Service Data!', description: `No Field Service data found for Work Order ID ${work_order_id}.`, color: 'error' })
            } else {
                isFsDetail.value = true
                const { response: fs_attachments_list } = await fetchFieldServiceAttachmentsList(fsDetail.value, config_all.value)
                console.log('Field Service fs_attachments_list: ', fs_attachments_list)
                if (fs_attachments_list && fs_attachments_list.length > 0) {
                    const fs_attachment = fs_attachments_list?.find((item: any) => {
                        return item?.AttachmentFileName.includes('Service Quote') || item?.AttachmentFileName.includes('Service_Quote') || item?.Description.includes('Service Quote') || item?.Description.includes('Service_Quote')
                    })
                    console.log('Field Service fs_attachment: ', fs_attachment)
                    if (fs_attachment) {
                        const pdf_text = await processUrl(fs_attachment, canvasRef.value, config_all.value)
                        console.log('Field Service pdf_text: ', pdf_text)
                        const scope_of_info_index = pdf_text?.findIndex((item: string) => item.includes('Scope Information') || item.includes('Scope of quote')) || 0
                        // console.log('Field Service scope_of_info_index: ', scope_of_info_index)
                        const material_index = pdf_text?.findIndex((item: string) => item.includes('Material')) || 0
                        // console.log('Field Service material_index: ', material_index)
                        scope_work.value = pdf_text?.slice(scope_of_info_index + 1, material_index).filter((item: any) => item.trim() !== "") || ''
                        scope_work.value = scope_work.value.join(' ') || ''
                        if (scope_work.value?.includes('Scope of quoted work')) {
                            scope_work.value = scope_work.value?.replace('Scope of quoted work', '').trim()
                        }
                        // console.log('Field Service scope_work: ', scope_work.value)

                        const contact_name_index = pdf_text?.findIndex(
                            (item: string) => item.includes('Contact Name') || item.includes('Phone Number') || item.includes('Contact')
                        ) || 0
                        // console.log('Field Service contact_name_index: ', contact_name_index)
                        const email_address_index = pdf_text?.findIndex(
                            (item: string) => item.includes('Email Address') || item.includes('Scope Information')
                        ) || 0
                        // console.log('Field Service email_address_index: ', email_address_index)
                        if (contact_name_index >= 0 && email_address_index >= 0) {
                            site_contact.value = pdf_text?.slice(contact_name_index + 1, email_address_index - 1)?.join('')?.trim() || ''
                        }
                        // console.log('Field Service site_contact: ', site_contact.value)
                    }
                }
            }
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
            scope_work: scope_work.value,
            site_contact: site_contact.value
        }
    })

    async function isLoginFieldService() {
        const fs_cookie = config_all.value?.find((item: any) => item.config_key === 'fs_cookie')

        const response = await fetch('/api/vista/field_service/is_login', {
            method: 'POST',
            body: JSON.stringify({
                fs_cookie: fs_cookie?.config_value
            })
        })
        const res = await response.json()

        return res
    }

    async function fetchFieldService() {
        const fs_cookie = config_all.value?.find((item: any) => item.config_key === 'fs_cookie')

        const response = await fetch('/api/vista/field_service/work_order_trips', {
            method: 'POST',
            body: JSON.stringify({
                fs_cookie: fs_cookie?.config_value
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
            <canvas ref="canvasRef" class="hidden"></canvas>
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
