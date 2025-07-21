<script setup lang="ts">
    const props = defineProps<{
        costs: any,
        data: any[]
    }>()

    const gross_profit = ref<any>({
        material: 45,
        labor: 145.00,
        labor_ot: 217.50,
        miscellaneous: 45,
        subcontract: 30
    })

    defineExpose({
        gross_profit,
    })

    onMounted(async () => {
        if (props?.data?.length > 0) {
            gross_profit.value.material = getItem(props?.data, 'mat_gp', 'name')
            gross_profit.value.labor = getItem(props?.data, 'labor_gp', 'name')
            gross_profit.value.labor_ot = getItem(props?.data, 'labor_ot_gp', 'name')
            gross_profit.value.miscellaneous = getItem(props?.data, 'misc_gp', 'name')
            gross_profit.value.subcontract = getItem(props?.data, 'subcon_gp', 'name')
        }
    })
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div class="flex justify-between items-center">
                    <h2>BIDDING PRICE</h2>
                </div>
            </template>
            <template #default>
                <div class="pb-1">
                    <div class="grid grid-cols-3 text-nowrap gap-1 text-neutral-400">
                        <div class="col-span-2"></div>
                        <div class="">GP %</div>
                        <div>Material</div>
                        <div>
                            <div>{{ (props.costs.materialCosts / (1 - (gross_profit.material / 100))).toFixed(2) || 0 }}</div>
                            <div class="text-xs text-neutral-600">(total material cost / (1 - {{ gross_profit.material }} %))</div>
                        </div>
                        <div>
                            <UInput
                                v-model="gross_profit.material"
                                type="number"
                                size="sm"
                                placeholder="material cost"
                                trailing-icon="i-material-symbols-percent"
                                autocomplete="off"
                            />
                        </div>
                        <div>Labor</div>
                        <div>
                            <div>{{ (props.costs.laborCosts.laborHours * gross_profit.labor).toFixed(2) || 0 }}</div>
                            <div class="text-xs text-neutral-600">(labor hours * {{ gross_profit.labor }})</div>
                        </div>
                        <div>
                            <UInput
                                v-model="gross_profit.labor"
                                type="number"
                                size="sm"
                                placeholder="labor cost"
                                autocomplete="off"
                            >
                                <template #trailing>
                                    <div
                                        id="character-count"
                                        class="text-xs text-muted tabular-nums"
                                        aria-live="polite"
                                        role="status"
                                    >
                                        per hour
                                    </div>
                                </template>
                            </UInput>
                        </div>
                        <div>Labor OT</div>
                        <div>
                            <div>{{ (props.costs.laborCosts.overtimeHours * gross_profit.labor_ot).toFixed(2) || 0 }}</div>
                            <div class="text-xs text-neutral-600">(OT hours * {{ gross_profit.labor_ot }})</div>
                        </div>
                        <div>
                            <UInput
                                v-model="gross_profit.labor_ot"
                                type="number"
                                size="sm"
                                placeholder="labor ot cost"
                                autocomplete="off"
                            >
                                <template #trailing>
                                    <div
                                        id="character-count"
                                        class="text-xs text-muted tabular-nums"
                                        aria-live="polite"
                                        role="status"
                                    >
                                        per hour
                                    </div>
                                </template>
                            </UInput>
                        </div>
                        <div>Miscellaneous</div>
                        <div>
                            <div>{{ (props.costs.miscellaneousCosts / (1 - (gross_profit.miscellaneous / 100))).toFixed(2) || 0 }}</div>
                            <div class="text-xs text-neutral-600">(total miscellaneous cost / (1 - {{ gross_profit.miscellaneous }} %))</div>
                        </div>
                        <div>
                            <UInput
                                v-model="gross_profit.miscellaneous"
                                type="number"
                                size="sm"
                                placeholder="miscellaneous cost"
                                trailing-icon="i-material-symbols-percent"
                                autocomplete="off"
                            />
                        </div>
                        <div>Subcontract</div>
                        <div>
                            <div>{{ (props.costs.subscontractCosts / (1 - (gross_profit.subcontract / 100))).toFixed(2) || 0 }}</div>
                            <div class="text-xs text-neutral-600">(total subcontract cost / (1 - {{ gross_profit.subcontract }} %))</div>
                        </div>
                        <div>
                            <UInput
                                v-model="gross_profit.subcontract"
                                type="number"
                                size="sm"
                                placeholder="subcontract cost"
                                trailing-icon="i-material-symbols-percent"
                                autocomplete="off"
                            />
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="grid grid-cols-3">
                    <div class="text-right text-nowrap pr-4">
                        <div>TOTAL BIDDING PRICE:</div>
                    </div>
                    <div class="col-span-2">
                        <strong>
                            {{ ((props.costs.materialCosts / (1 - (gross_profit.material / 100))) +
                                (props.costs.laborCosts.laborHours * gross_profit.labor) +
                                (props.costs.laborCosts.overtimeHours * gross_profit.labor_ot) +
                                (props.costs.miscellaneousCosts / (1 - (gross_profit.miscellaneous / 100))) +
                                (props.costs.subscontractCosts / (1 - (gross_profit.subcontract / 100)))).toFixed(2) || 0
                            }}
                        </strong>
                        <div class="text-xs text-neutral-600">(material + labor + labor ot + miscellaneous + subcontract)</div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
