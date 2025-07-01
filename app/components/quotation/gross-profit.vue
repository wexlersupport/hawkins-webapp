<script setup lang="ts">
    const props = defineProps<{
        costs: any,
        extraCost: number
    }>()

    const totalBidding: any = computed(() => {
        return ((props.costs.materialCosts / (1 - (props.costs.gross_profit.material / 100)) +
            (props.costs.laborCosts.laborHours * props.costs.gross_profit.labor) +
            (props.costs.laborCosts.overtimeHours * props.costs.gross_profit.labor_ot) +
            (props.costs.miscellaneousCosts / (1 - (props.costs.gross_profit.miscellaneous / 100))) +
            (props.costs.subscontractCosts / (1 - (props.costs.gross_profit.subcontract / 100)))) + props.extraCost).toFixed(2) || 0
    })

    const totalCost: any = computed(() => {
        return ((props.costs.materialCosts +
            (props.costs.laborCosts.laborHours * props.costs.laborCosts.laborRate) +
            (props.costs.laborCosts.overtimeHours * props.costs.laborCosts.overtimeRate) +
            props.costs.miscellaneousCosts +
            props.costs.subscontractCosts) || 0
        )
    })
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div>
                    <h2>GROSS PROFIT:</h2>
                </div>
            </template>
            <template #default>
                <div class="pb-1">
                    <div class="grid grid-cols-2 text-nowrap gap-1 text-neutral-400">
                        <div>
                            TOTAL BIDDING
                            <div class="text-xs text-neutral-600">(final sell price)</div>
                        </div>
                        <div class="text-right">{{ totalBidding }}</div>
                        <div>
                            TOTAL COST
                            <div class="text-xs text-neutral-600">(material + labor + ot + miscellaneous + subcon)</div>
                        </div>
                        <div class="text-right">{{ totalCost.toFixed(2) }}</div>
                        <div>
                            GROSS PROFIT $
                            <div class="text-xs text-neutral-600">(total bid - total cost)</div>
                        </div>
                        <div class="text-right">{{ (totalBidding - totalCost).toFixed(2) || 0 }}</div>
                        <div>
                            GROSS PROFIT %
                            <div class="text-xs text-neutral-600">(gross profit $ / total bid)</div>
                        </div>
                        <div class="text-right">{{ ((totalBidding - totalCost) / totalBidding * 100).toFixed(2) || 0 }}%</div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
