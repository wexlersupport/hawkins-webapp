<script setup lang="ts">
    const toast = useToast()
    const route = useRoute()
    const quotationId = route.params.id as string
    const work_order_id = ref<any>(null)
    const isLoading = ref<boolean>(true)
    const isLoadingSave = ref<boolean>(false)
    const materialCostsRef = ref<any>(null)
    const miscellaneousCostsRef = ref<any>(null)
    const laborCostsRef = ref<any>(null)
    const subscontractCostsRef = ref<any>(null)
    const biddingPriceRef = ref<any>(null)
    const materialsModalRef = ref<any>(null)

    const quotationDetails = ref<any>(null)
    const mat_cost = ref<any[]>([])
    const misc_cost = ref<any[]>([])
    const subcon_cost = ref<any[]>([])
    const labor_cost = ref<any[]>([])
    const extraDeductMoney = ref<any>(0)
    const toastDuration = ref<Number>(3000)
    const final_price = ref<number>(0)
    const updated_at = formatJsDateToDatetime(new Date())
    const created_at = formatJsDateToDatetime(new Date())
    const query = { table: 'quotation_details' }

    onMounted(async () => {
        isLoading.value = true
        quotationDetails.value = await fetchQuotationId()
        work_order_id.value = quotationDetails.value?.data[0].work_order_id ?? 0

        mat_cost.value = quotationDetails.value?.data.filter((d: any) => d.item.includes('mat_cost'))
        misc_cost.value = quotationDetails.value?.data.filter((d: any) => d.item.includes('misc_cost'))
        subcon_cost.value = quotationDetails.value?.data.filter((d: any) => d.item.includes('subcon_cost'))
        labor_cost.value = quotationDetails.value?.data.filter((d: any) => d.item.includes('labor_cost'))
        extraDeductMoney.value = getItem(quotationDetails.value?.data, 'extra_deduct', 'name')
        final_price.value = getFinalPrice(quotationDetails.value?.data)

        isLoading.value = false
    })

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

    async function fetchQuotationId() {
        const data = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
            query: {
                table: 'quotation_details',
                dynamic_field: 'quotation_id',
                value: quotationId
            },
            method: 'GET'
        }));

        return data
    }

    async function onDelete() {
        if (confirm('Are you sure you want to delete?')) {
            isLoadingSave.value = true
            const deleteItem = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
                query: {
                    table: 'quotation_details',
                    dynamic_field: 'quotation_id',
                    value: quotationId,
                },
                method: 'DELETE'
            }));
            console.log('DELETE ', deleteItem)

            toast.add({
                title: 'Deleted!',
                description: `Quotation successfully deleted!`,
                duration: toastDuration.value,
                color: 'error'
            })

            setTimeout(() => {
                isLoadingSave.value = false
                navigateTo('/quotation')
            }, Number(toastDuration.value));
        }
    }

    async function onDeleteQuotation(dynamic_field: string, value: Number) {
        return handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
            query: {
                table: 'quotation_details',
                dynamic_field,
                value
            },
            method: 'DELETE'
        }));
    }

    async function onRemovalItems() {
        const promiseDeletion: any[] = []

        const filteredItems = quotationDetails.value?.data.filter((d: any) => ['mat_cost', 'misc_cost', 'subcon_cost'].includes(d.item))
        filteredItems.forEach((quote: any) => {
            let result: any = true
            if (quote.item === 'mat_cost') {
                result = materialCostsRef.value?.mat_cost_items.some((d: any) => Number(d.id) === Number(quote.id))
            } else if (quote.item === 'misc_cost') {
                result = miscellaneousCostsRef.value?.misc_cost_items.some((d: any) => Number(d.id) === Number(quote.id))
            } else if (quote.item === 'subcon_cost') {
                result = subscontractCostsRef.value?.sub_cost_items.some((d: any) => Number(d.id) === Number(quote.id))
            }
            if (!result) {
                const promise = onDeleteQuotation('id', quote.id)
                promiseDeletion.push(promise)
            }
        });
        console.log('promiseDeletion ', promiseDeletion)

        return promiseDeletion
    }

    async function onSave() {
        isLoadingSave.value = true

        const mat_promises = await onMatCostSave()
        const misc_promises = await onMiscCostSave()
        const subcon_promises = await onSubconCostSave()
        const labor_promises = await onLaborCostSave()
        const bidprice_promises = await onBidPriceCostSave()
        const promiseDeletion = await onRemovalItems()

        const promisesAll = [...promiseDeletion, ...mat_promises, ...misc_promises, ...subcon_promises, ...labor_promises, ...bidprice_promises];
        // console.log('Promises to execute:', promisesAll);

        Promise.all(promisesAll).then((response) => {
            // console.log('All promises resolved:', response);
            toast.add({ title: 'Success', description: `Quotation successfully saved!`, color: 'success' })

            setTimeout(async () => {
                navigateTo('/quotation')
            }, 1000)
        }).catch(async (error) => {
            console.log("Promise.all caught an error:", error);
        })
        .finally(() => {
            isLoadingSave.value = false
            // console.log("Promise.all finished.");
        });

        isLoadingSave.value = false
    }

    async function onMatCostSave() {
        const item_promise = await onItemLoop(materialCostsRef.value?.mat_cost_items, 'mat_cost')
    
        const pvs_id = getDynamicItem(quotationDetails.value?.data, 'mat_cost_pvs_input', 'name', 'id')
        const tax_id = getDynamicItem(quotationDetails.value?.data, 'mat_cost_tax_input', 'name', 'id')
        return [
            sendPostgreRequestPUT('mat_cost_pvs_input', 'mat_cost_pvs_input', materialCostsRef.value.mat_cost_pvs_input, 'id', pvs_id),
            sendPostgreRequestPUT('mat_cost_tax_input', 'mat_cost_tax_input', materialCostsRef.value.mat_cost_tax_input, 'id', tax_id),
            ...item_promise
        ];
    }

    async function onMiscCostSave() {
        return await onItemLoop(miscellaneousCostsRef.value?.misc_cost_items, 'misc_cost')
    }

    async function onSubconCostSave() {
        return await onItemLoop(subscontractCostsRef.value?.sub_cost_items, 'subcon_cost')
    }

    async function onLaborCostSave() {
        const labor_hours_id = getDynamicItem(quotationDetails.value?.data, 'labor_hours', 'name', 'id')
        const labor_rate_id = getDynamicItem(quotationDetails.value?.data, 'labor_rate', 'name', 'id')
        const ot_hours_id = getDynamicItem(quotationDetails.value?.data, 'ot_hours', 'name', 'id')
        const ot_rate_id = getDynamicItem(quotationDetails.value?.data, 'ot_rate', 'name', 'id')

        return [
            sendPostgreRequestPUT('labor_cost', 'labor_hours', laborCostsRef.value.labor_cost_items.laborHours, 'id', labor_hours_id),
            sendPostgreRequestPUT('labor_cost', 'labor_rate', laborCostsRef.value.labor_cost_items.laborRate, 'id', labor_rate_id),
            sendPostgreRequestPUT('labor_cost', 'ot_hours', laborCostsRef.value.labor_cost_items.overtimeHours, 'id', ot_hours_id),
            sendPostgreRequestPUT('labor_cost', 'ot_rate', laborCostsRef.value.labor_cost_items.overtimeRate, 'id', ot_rate_id),
        ];
    }

    async function onBidPriceCostSave() {
        const mat_gp_id = getDynamicItem(quotationDetails.value?.data, 'mat_gp', 'name', 'id')
        const labor_gp_id = getDynamicItem(quotationDetails.value?.data, 'labor_gp', 'name', 'id')
        const labor_ot_gp_id = getDynamicItem(quotationDetails.value?.data, 'labor_ot_gp', 'name', 'id')
        const misc_gp_id = getDynamicItem(quotationDetails.value?.data, 'misc_gp', 'name', 'id')
        const subcon_gp_id = getDynamicItem(quotationDetails.value?.data, 'subcon_gp', 'name', 'id')
        const extra_deduct_id = getDynamicItem(quotationDetails.value?.data, 'extra_deduct', 'name', 'id')

        return [
            sendPostgreRequestPUT('bid_price', 'mat_gp', biddingPriceRef.value.gross_profit.material, 'id', mat_gp_id),
            sendPostgreRequestPUT('bid_price', 'labor_gp', biddingPriceRef.value.gross_profit.labor, 'id', labor_gp_id),
            sendPostgreRequestPUT('bid_price', 'labor_ot_gp', biddingPriceRef.value.gross_profit.labor_ot, 'id', labor_ot_gp_id),
            sendPostgreRequestPUT('bid_price', 'misc_gp', biddingPriceRef.value.gross_profit.miscellaneous, 'id', misc_gp_id),
            sendPostgreRequestPUT('bid_price', 'subcon_gp', biddingPriceRef.value.gross_profit.subcontract, 'id', subcon_gp_id),
            sendPostgreRequestPUT('bid_price', 'extra_deduct', extraDeductMoney.value, 'id', extra_deduct_id),
        ];
    }

    const sendPostgreRequestPUT = async (item: string, name: string, cost: number, dynamic_field: string, dynamic_value: number) => {
        return handleApiResponse(
            $fetch('/api/postgre/' + quotationId, {
                query: {
                    table: 'quotation_details',
                    dynamic_field,
                    dynamic_value
                },
                method: 'PUT',
                body: {
                    updated_at, item, name, cost
                },
            })
        );
    };

    const sendPostgreRequestPOST = async (item: string, name: string, cost: number, work_order_id: number) => {
        return handleApiResponse(
            $fetch('/api/postgre', {
                query,
                method: 'POST',
                body: {
                    quotation_id: quotationId,
                    created_at, work_order_id, item, name, cost
                },
            })
        );
    };

    async function onItemLoop(costs: any[], item_name: string) {
        const promises = []
        if (costs?.length > 0) {
            const item_promise = costs.map((item: any) => {
                if (item.id) {
                    return sendPostgreRequestPUT(item_name, item.name, item.cost, 'id', item.id)
                }
                return sendPostgreRequestPOST(item_name, item.name, item.cost, work_order_id.value)
            });
            promises.push(...item_promise);
        }

        return promises
    }

    async function gotoGeneratePdf() {
        navigateTo('/quotation/pdf?quotation_id=' + quotationId + '&work_order_id=' + work_order_id.value)
    }

    async function onUpdateMaterials(product: any) {
        materialCostsRef.value?.mat_cost_items.push({
            name: product.name,
            cost: Number(product.cost) * Number(product.quantity),
        })

        toast.add({
            title: 'Updated!',
            description: `Materials successfully updated!`,
            duration: toastDuration.value
        })
    }

</script>

<template>
    <UDashboardPanel id="quotatiom-details" :ui="{ body: 'gap-2 sm:gap-2' }">
        <template #header>
            <UDashboardNavbar title="Quotation Details">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UiAppButtonBack />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="flex items-center justify-end">
                <UButton @click="gotoGeneratePdf" :loading="isLoadingSave" class="cursor-pointer" label="GENERATE PDF" icon="i-lucide-file-text" color="info" />
            </div>
            <UCard :ui="{ root: 'rounded-lg overflow-y-auto' }">
                <template #default>
                    <UiAppLoading
                        v-if="isLoading"
                        class="border rounded-md p-6 my-4 border-neutral-800"
                    />
                    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-y-2 pb-4 border-b-2 border-neutral-800">
                        <QuotationMaterialCosts ref="materialCostsRef" :items="mat_cost" @open-material-list="materialsModalRef.onModalOpen()" />
                        <QuotationMiscellaneousCosts ref="miscellaneousCostsRef" :items="misc_cost" />
                        <QuotationLaborCosts ref="laborCostsRef" :items="labor_cost" />
                        <QuotationSubscontractCosts ref="subscontractCostsRef" :items="subcon_cost" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-y-2 pt-4" v-if="!isLoading">
                        <QuotationBiddingPrice class="col-span-2" ref="biddingPriceRef" :costs="costs" :data="quotationDetails?.data" />
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
                            <UButton @click="onSave" :loading="isLoadingSave" class="cursor-pointer mr-4" label="SAVE DATA" icon="i-lucide-save" />
                            <UButton @click="onDelete" :loading="isLoadingSave" class="cursor-pointer" label="DELETE" icon="i-lucide-trash-2" color="error" />
                        </div>
                    </div>
                </template>
            </UCard>
        </template>

    </UDashboardPanel>
</template>
