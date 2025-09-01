<script setup lang="ts">
    import { fetchFieldServiceAttachmentsList, processUrl, savePDF } from '@/utils/process_pdf_url'

    const toast = useToast()
    const route = useRoute()

    const work_order_id = route.query.id as string
    const isLoading = ref<boolean>(true)
    const isLoadingSave = ref<boolean>(false)
    const workOrderDetail = ref()
    const materialCostsRef = ref<any>(null)
    const miscellaneousCostsRef = ref<any>(null)
    const laborCostsRef = ref<any>(null)
    const subscontractCostsRef = ref<any>(null)
    const biddingPriceRef = ref<any>(null)
    const extraDeductMoney = ref<number>(0)
    // const sendEmailModal = ref<any>(null)
    const materialsModalRef = ref<any>(null)
    const material_items = ref<any[]>([])
    const labor_cost = ref<any[]>([])

    const created_at = formatJsDateToDatetime(new Date())
    const quotation_id = ref<any>(null)
    const material_list = ref<any>(null)
    const work_completed = ref<any>(null)
    const canvasRef = ref(null)
    const query = { table: 'quotation_details' }

    const { data } = await useFetch('/api/postgre', {
        query: { table: 'configuration' }
    });
    const config_all = ref<any>(data.value?.data)

    onMounted(async () => {
        isLoading.value = true
        const { response: isLogin } = await isLoginFieldService()
        if (!isLogin) {
            toast.add({ title: 'Unauthorized to Field Service!', description: `Please login in Field Service to access the data.`, color: 'error' })
        }

        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response
        material_list.value = await fetchMaterials()
        const { response: res } = await fetchWorkCompleted()
        work_completed.value = res?.data || []
        console.log('Work Completed: ', work_completed.value)

        const { response: fs_data } = await fetchFieldService()
        // console.log('Field Service Data: ', fs_data[0]?.WorkOrder)
        if (fs_data && fs_data[0]?.WorkOrder) {
            const fs_workorder = fs_data?.find((item: any) => item.WorkOrder === Number(work_order_id))
            // console.log('Field Service Work Order: ', fs_workorder)
            if (!fs_workorder) {
                toastMessage('No Field Service Data!', `No Field Service data found for Work Order ID ${work_order_id}.`, 'error')
            } else {
                const { response: fs_attachments_list } = await fetchFieldServiceAttachmentsList(fs_workorder, config_all.value)
                console.log('Field Service fs_attachments_list: ', fs_attachments_list)
                if (fs_attachments_list && fs_attachments_list.length > 0) {
                    const fs_attachment = fs_attachments_list?.find((item: any) => {
                        return item?.AttachmentFileName.includes('Service Quote') || item?.AttachmentFileName.includes('Service_Quote') || item?.Description.includes('Service Quote') || item?.Description.includes('Service_Quote')
                    })
                    console.log('Field Service fs_attachment: ', fs_attachment)
                    if (fs_attachment) {
                        const response = await savePDF(fs_attachment, config_all.value)
                        console.log('Field Service pdf_path: ', response)
                        const pdf_text = await processUrl(`http://localhost:3000${response.url}`, canvasRef.value)
                        console.log('Field Service pdf_text: ', pdf_text)

                        const number_tech_index = pdf_text?.findIndex((item: string) => item.includes('Number of Tech') && !item.includes('Estimate')) || 0
                        console.log('Field Service number_tech_index: ', number_tech_index)

                        const number_helper_index = pdf_text?.findIndex((item: string) => item.includes('Number of Helper') || item.includes('helper')) || 0
                        console.log('Field Service number_helper_index: ', number_helper_index)

                        const hours_to_complete_index = pdf_text?.findIndex((item: string) => item.includes('Hours To Complete') || item.includes('Hour To Complete')) || 0
                        console.log('Field Service hours_to_complete_index: ', hours_to_complete_index)

                        const page_number_index = pdf_text?.findIndex((item: string) => item.includes('1 of') || item.includes('Service Quote')) || 0
                        console.log('Field Service page_number_index: ', page_number_index)

                        const number_tech = pdf_text?.slice(number_tech_index + 1, number_helper_index - 1).join('') || ''
                        console.log('Field Service number_tech: ', number_tech)
                        let number_tech_lastdigit: any = number_tech.match(/\d+(?=\D*$)/) || [1];
                        number_tech_lastdigit = Number(number_tech_lastdigit[0])
                        console.log('Field Service lastDigit: ', number_tech_lastdigit)
                        
                        const number_helper = pdf_text?.slice(number_helper_index + 1, hours_to_complete_index - 1).join('') || ''
                        console.log('Field Service number_helper: ', number_helper)
                        let number_helper_lastdigit: any = number_helper.match(/\d+(?=\D*$)/) || [1];
                        number_helper_lastdigit = Number(number_helper_lastdigit[0])
                        console.log('Field Service number_helper_lastdigit: ', number_helper_lastdigit)

                        const hours_to_complete = pdf_text?.slice(hours_to_complete_index + 1, page_number_index - 1).join('') || ''
                        console.log('Field Service hours_to_complete: ', hours_to_complete)
                        let hours_to_complete_lastdigit: any = hours_to_complete.match(/\d+(?=\D*$)/) || [1];
                        hours_to_complete_lastdigit = Number(hours_to_complete_lastdigit[0])
                        console.log('Field Service hours_to_complete_lastdigit: ', hours_to_complete_lastdigit)
                        if (hours_to_complete.includes('DAY') || hours_to_complete.includes('Day') || hours_to_complete.includes('day')) {
                            hours_to_complete_lastdigit = hours_to_complete_lastdigit * 8
                        }
                        console.log('Field Service hours_to_complete_lastdigit: ', hours_to_complete_lastdigit)

                        const cost = hours_to_complete_lastdigit * (number_tech_lastdigit + number_helper_lastdigit)
                        labor_cost.value = [
                            {
                                item: 'labor_cost',
                                name: 'labor_hours',
                                cost
                            }
                        ]
                    } else {
                        const cost = fs_workorder.EstimatedDuration + (fs_workorder.ScopeData ? fs_workorder.ScopeData[0]?.SummaryLaborHours : 0)
                        labor_cost.value = [
                            {
                                item: 'labor_cost',
                                name: 'labor_hours',
                                cost
                            }
                        ]
                        toastMessage('No Attachment!', `No Field Service attachments found for Work Order ID ${work_order_id}.`, 'error')
                    }
                } else {
                    const cost = fs_workorder.EstimatedDuration + (fs_workorder.ScopeData ? fs_workorder.ScopeData[0]?.SummaryLaborHours : 0)
                    labor_cost.value = [
                        {
                            item: 'labor_cost',
                            name: 'labor_hours',
                            cost
                        }
                    ]
                    toastMessage('No Attachment!', `No Field Service attachments found for Work Order ID ${work_order_id}.`, 'error')
                }
            }
        }

        isLoading.value = false

        setTimeout(async() => {
            if (!work_completed.value || work_completed.value.length === 0) {
                console.log('No work completed data available.');
            } else {
                await onAutoGenerateMaterials()
                await onAutoGenerateMisc()
            }
        }, 1000)
    })

    function toastMessage(title: any, description: any, color: any) {
        toast.add({ title, description, color })
    }

    async function onAutoGenerateMaterials() {
        // Type = 4 is for materials
        const search_value: any[] = work_completed.value?.filter((item: any) => item.Type === 4).map((_item: any) => _item.Description) || [];
        console.log('Search Value:', search_value);
        if (!search_value || search_value.length === 0) {
            console.log('No search terms provided.');
            return;
        }

        const searchResultsAsObjects = combinedSingleObjectMatchSearch(search_value, material_list.value);
        console.log('Search Results:', searchResultsAsObjects);
        if (searchResultsAsObjects) {
            searchResultsAsObjects.forEach((term: any) => {
                if (term) {
                    // console.log(`Search result for "${term}":`, searchResult);
                    materialCostsRef.value?.mat_cost_items.push({
                        search_term: term.search_term,
                        name: term.name,
                        cost: Number(term.cost),
                    })
                }
            });
        }
    }

    async function onAutoGenerateMisc() {
        // Type = 2,3,5 is for miscellaneous
        const search_value: any[] = work_completed.value?.filter((item: any) => item.Type !== 4)
        // console.log('Misc Search Value:', search_value);
        search_value.forEach((item: any, index: number) => {
            miscellaneousCostsRef.value?.misc_cost_items.push({
                name: item.Description || 'Miscellaneous ' + (index + 1),
                cost: Number(item.PriceTotal) || Number(item.CostRate) || 0,
            })
        });
    }

    async function fetchWorkCompleted() {
        const response = await fetch('/api/vista/work-completed-search', {
            method: 'POST',
            body: JSON.stringify({
                filterObj: {value: +work_order_id, propertyName: 'WorkOrder', operator: 'Equal'},
            })
        })
        const res = await response.json()
        return res
    }

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

    async function fetchMaterials() {
        const { data } = await useFetch('/api/postgre', {
            query: { table: 'materials', isDesc: true },
        });

        return data.value?.data || [];
    }

    async function fetchWorkOrderId() {
        isLoading.value = true
        const response = await fetch('/api/vista/work-order-id', {
            method: 'POST',
            body: JSON.stringify({ id: work_order_id })
        })
        const res = await response.json()
        return res
    }

    const costs = computed(() => {
        let materialCosts = 0
        if (materialCostsRef.value?.mat_cost_items?.length > 0) {
            materialCosts = ((materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * materialCostsRef.value?.mat_cost_pvs_input / 100) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * materialCostsRef.value?.mat_cost_pvs_input / 100)) *
                materialCostsRef.value?.mat_cost_tax_input / 100) || 0)
        }
        return {
            materialCosts,
            miscellaneousCosts: miscellaneousCostsRef.value?.misc_cost_items.reduce((acc, item) => acc + item.cost, 0) || 0,
            subscontractCosts: subscontractCostsRef.value?.sub_cost_items.reduce((acc, item) => acc + item.cost, 0) || 0,
            laborCosts: laborCostsRef.value?.labor_cost_items || [],
            gross_profit: biddingPriceRef.value?.gross_profit || {}
        }
    })

    // async function onComposeEmailModal() {
    //     sendEmailModal.value.onModalOpen()

        // const formData = new FormData();
        // if (uploadedFile.value && uploadedFile.value.length > 0) {
        //     Array.from(uploadedFile.value).forEach((item: any, index: number) => {
        //         formData.append('quote_'+work_order_id+"_"+index, item);
        //     });
        //     console.log('Form data prepared with file:', formData);
        // } else {
        //     console.error('No file selected');
        // }

        // const response = await fetch('/api/sendgrid/upload-files', {
        //     method: 'POST',
        //     body: formData
        // })
        // const upload_files_res = await response.json()
        // console.log('upload_files_res ', upload_files_res)
    // }

    // const uploadedFile: any = ref([]);
    // async function handlefileChange(event: any) {
    //     uploadedFile.value = event.target.files;
    //     console.log('File selected:', uploadedFile.value);
    // }

    const sendPostgreRequest = async (item: string, name: string, cost: number) => {
        return handleApiResponse(
            $fetch('/api/postgre', {
                query,
                method: 'POST',
                body: {
                    quotation_id: quotation_id.value,
                    created_at, work_order_id, item, name, cost
                },
            })
        );
    };

    async function onSave() {
        isLoadingSave.value = true
        const { data }: any = await useFetch('/api/postgre/dynamic_max', {
            query: {
                table: 'quotation_details',
                dynamic_field: 'quotation_id'
            }
        });
        quotation_id.value = (Number(data.value) + 1) || 0

        const mat_promises = await onMatCostSave()
        const misc_promises = await onMiscCostSave()
        const subcon_promises = await onSubconCostSave()
        const labor_promises = await onLaborCostSave()
        const bidprice_promises = await onBidPriceCostSave()

        const promisesAll = [...mat_promises, ...misc_promises, ...subcon_promises, ...labor_promises, ...bidprice_promises];
        // console.log('Promises to execute:', promisesAll);

        Promise.all(promisesAll).then((response) => {
            console.log('All promises resolved:', response);
            toast.add({ title: 'Success', description: `Quotation successfully generated!`, color: 'success' })

            setTimeout(async () => {
                navigateTo('/quotation')
            }, 1000)
        }).catch(async (error) => {
            console.log("Promise.all caught an error:", error);
            toast.add({ title: 'Failed', description: `Quotation failed to generate!`, color: 'error' })

            setTimeout(async () => {
                const deleteItem = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
                    query: {
                        table: 'quotation_details',
                        dynamic_field: 'work_order_id',
                        value: work_order_id,
                    },
                    method: 'DELETE'
                }));
                console.log('DELETE ', deleteItem)
            }, 2000);
        })
        .finally(() => {
            isLoadingSave.value = false
            console.log("Promise.all finished.");
        });
    }

    async function onBidPriceCostSave() {
        return [
            sendPostgreRequest('bid_price', 'mat_gp', biddingPriceRef.value.gross_profit.material),
            sendPostgreRequest('bid_price', 'labor_gp', biddingPriceRef.value.gross_profit.labor),
            sendPostgreRequest('bid_price', 'labor_ot_gp', biddingPriceRef.value.gross_profit.labor_ot),
            sendPostgreRequest('bid_price', 'misc_gp', biddingPriceRef.value.gross_profit.miscellaneous),
            sendPostgreRequest('bid_price', 'subcon_gp', biddingPriceRef.value.gross_profit.subcontract),
            sendPostgreRequest('bid_price', 'extra_deduct', extraDeductMoney.value),
        ];
    }

    async function onLaborCostSave() {
        return [
            sendPostgreRequest('labor_cost', 'labor_hours', laborCostsRef.value.labor_cost_items.laborHours),
            sendPostgreRequest('labor_cost', 'labor_rate', laborCostsRef.value.labor_cost_items.laborRate),
            sendPostgreRequest('labor_cost', 'ot_hours', laborCostsRef.value.labor_cost_items.overtimeHours),
            sendPostgreRequest('labor_cost', 'ot_rate', laborCostsRef.value.labor_cost_items.overtimeRate),
        ];
    }

    async function onSubconCostSave() {
        return await onItemLoop(subscontractCostsRef.value?.sub_cost_items, 'subcon_cost')
    }

    async function onMiscCostSave() {
        return await onItemLoop(miscellaneousCostsRef.value?.misc_cost_items, 'misc_cost')
    }

    async function onMatCostSave() {
        const item_promise = await onItemLoop(materialCostsRef.value?.mat_cost_items, 'mat_cost')
    
        return [
            sendPostgreRequest('mat_cost_pvs_input', 'mat_cost_pvs_input', materialCostsRef.value.mat_cost_pvs_input),
            sendPostgreRequest('mat_cost_tax_input', 'mat_cost_tax_input', materialCostsRef.value.mat_cost_tax_input),
            ...item_promise
        ];
    }

    async function onItemLoop(costs: any[], item_name: string) {
        const promises = []
        if (costs?.length > 0) {
            const item_promise = costs.map((item: any) =>
                sendPostgreRequest(item_name, item.name, item.cost)
            );
            promises.push(...item_promise);
        }

        return promises
    }

    async function onUpdateMaterials(product: any) {
        materialCostsRef.value?.mat_cost_items.push({
            name: product.name,
            cost: Number(product.cost) * Number(product.quantity),
        })

        toast.add({
            title: 'Updated!',
            description: `Materials successfully updated!`,
            duration: 3000,
        })
    }

</script>

<template>
    <UDashboardPanel id="quotation-details">
        <template #header>
            <UDashboardNavbar title="Quotation">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UiAppButtonBack />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UCard :ui="{ root: 'rounded-lg overflow-y-auto' }">
                <template #header>
                    <div>
                        <h2 class="text-lg">Quotation Details</h2>
                    </div>
                </template>

                <template #default>
                    <canvas ref="canvasRef" class="hidden"></canvas>
                    <UiAppLoading
                        v-if="isLoading"
                        class="border rounded-md p-6 my-4 border-neutral-800"
                    />
                    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-y-2 pb-4 border-b-2 border-neutral-800">
                        <QuotationMaterialCosts ref="materialCostsRef" :items="material_items" @open-material-list="materialsModalRef.onModalOpen()" />
                        <QuotationMiscellaneousCosts ref="miscellaneousCostsRef" :items="[]" />
                        <QuotationLaborCosts ref="laborCostsRef" :items="labor_cost" />
                        <QuotationSubscontractCosts ref="subscontractCostsRef" :items="[]" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-y-2 pt-4" v-if="!isLoading">
                        <QuotationBiddingPrice :costs="costs" class="col-span-2" ref="biddingPriceRef" :data="[]" />
                        <QuotationGrossProfit :costs="costs" :extra-cost="extraDeductMoney" />
                        <QuotationCostsPercentBidding :costs="costs" :extra-cost="extraDeductMoney" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 pl-2 pt-4" v-if="!isLoading">
                         <div class="grid grid-cols-3 text-neutral-400">
                            <div class="text-right text-nowrap pr-3 italic">
                                <div>Extra Deduct Money:</div>
                            </div>
                            <div class="col-span-2">
                                <UInput
                                    v-model="extraDeductMoney"
                                    type="number"
                                    size="sm"
                                    placeholder="Extra Deduct Money"
                                    autocomplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <UiModalMaterials ref="materialsModalRef" v-if="!isLoading"
                        @on-update-materials="onUpdateMaterials" />
                </template>

                <template #footer v-if="!isLoading">
                    <div class="grid grid-cols-2 pl-2">
                        <div class="grid grid-cols-3">
                            <div class="text-right text-nowrap pr-4 text-lg font-extrabold">
                                <div>FINAL SELL PRICE:</div>
                            </div>
                            <div class="col-span-2">
                                <strong class="text-xl font-extrabold text-error">
                                    $ {{ (
                                        ((costs.materialCosts / (1 - (costs.gross_profit.material / 100))) +
                                        (costs.laborCosts.laborHours * costs.gross_profit.labor) +
                                        (costs.laborCosts.overtimeHours * costs.gross_profit.labor_ot) +
                                        (costs.miscellaneousCosts / (1 - (costs.gross_profit.miscellaneous / 100))) +
                                        (costs.subscontractCosts / (1 - (costs.gross_profit.subcontract / 100)))) +
                                        extraDeductMoney).toFixed(2) || 0
                                    }}
                                </strong>
                                <div class="text-xs text-neutral-600">(total bidding price + extra deduct money)</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-end">
                            <!-- <input type="file" multiple @change="handlefileChange" /> -->
                            <UButton @click="onSave" :loading="isLoadingSave" class="cursor-pointer mr-4" label="SAVE DATA" icon="i-lucide-save" />
                        </div>
                    </div>
                </template>
            </UCard>
        </template>
    </UDashboardPanel>
</template>
