<script setup lang="ts">
    const toast = useToast()
    const router = useRouter()
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
    const sendEmailModal = ref<any>(null)

    const created_at = formatJsDateToDatetime(new Date())
    const query = { table: 'quotation_details' }

    onMounted(async () => {
        isLoading.value = true
        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response
        // console.log('Quotation page:', workOrderDetail.value)
        
        isLoading.value = false
    })

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
        return {
            materialCosts: ((materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * materialCostsRef.value?.mat_cost_pvs_input / 100) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                (materialCostsRef.value?.mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * materialCostsRef.value?.mat_cost_pvs_input / 100)) *
                materialCostsRef.value?.mat_cost_tax_input / 100) || 0),
            miscellaneousCosts: miscellaneousCostsRef.value?.misc_cost_items.reduce((acc, item) => acc + item.cost, 0) || 0,
            subscontractCosts: subscontractCostsRef.value?.sub_cost_items.reduce((acc, item) => acc + item.cost, 0) || 0,
            laborCosts: laborCostsRef.value?.labor_cost_items || [],
            gross_profit: biddingPriceRef.value?.gross_profit || {}
        }
    })

    async function onComposeEmailModal() {
        sendEmailModal.value.onModalOpen()

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
    }

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
                body: { created_at, work_order_id, item, name, cost },
            })
        );
    };

    async function onSave() {
        isLoadingSave.value = true

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
                router.back()
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
                    <UiAppLoading
                        v-if="isLoading"
                        class="border rounded-md p-6 my-4 border-neutral-800"
                    />
                    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-y-2 pb-4 border-b-2 border-neutral-800">
                        <QuotationMaterialCosts ref="materialCostsRef" />
                        <QuotationMiscellaneousCosts ref="miscellaneousCostsRef" />
                        <QuotationLaborCosts ref="laborCostsRef" />
                        <QuotationSubscontractCosts ref="subscontractCostsRef" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-y-2 pt-4" v-if="!isLoading">
                        <QuotationBiddingPrice class="col-span-2" ref="biddingPriceRef" :costs="costs" />
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
                            <UButton @click="onComposeEmailModal" :loading="isLoadingSave" class="cursor-pointer" label="COMPOSE EMAIL" icon="i-lucide-mail" color="neutral" />
                        </div>
                    </div>
                </template>
            </UCard>

            <UiModalSendEmail ref="sendEmailModal" />
        </template>
    </UDashboardPanel>
</template>
