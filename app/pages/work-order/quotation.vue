<script setup lang="ts">
    const route = useRoute()
    const workOrderId = route.query.id as string
    console.log('Quotation Page', workOrderId)
    const isLoading = ref<boolean>(true)
    const workOrderDetail = ref()
    const materialCostsRef = ref<any>(null)
    const miscellaneousCostsRef = ref<any>(null)
    const laborCostsRef = ref<any>(null)
    const subscontractCostsRef = ref<any>(null)
    const biddingPriceRef = ref<any>(null)
    const extraDeductMoney = ref<number>(0)

    onMounted(async () => {
        isLoading.value = true
        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response
        console.log('Quotation page:', workOrderDetail.value)
        
        isLoading.value = false

        setTimeout(() => {
            console.log('Material Costs Ref:', materialCostsRef.value)
            console.log('Miscellaneous Costs Ref:', miscellaneousCostsRef.value)
            console.log('Labor Costs Ref:', laborCostsRef.value)
            console.log('Subcontract Costs Ref:', subscontractCostsRef.value)
        }, 3000)
    })

    async function fetchWorkOrderId() {
        isLoading.value = true
        const response = await fetch('/api/vista/work-order-id', {
            method: 'POST',
            body: JSON.stringify({ id: workOrderId })
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
                    <div class="grid grid-cols-1 md:grid-cols-2 pl-2 pt-4">
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
                    </div>
                </template>
            </UCard>

            
        </template>
    </UDashboardPanel>
</template>
