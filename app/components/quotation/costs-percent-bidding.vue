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
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div>
                    <h2>COSTS PERCENT OF BIDDING:</h2>
                </div>
            </template>
            <template #default>
                <div class="pb-1">
                    <div class="grid grid-cols-2 text-nowrap gap-1 text-neutral-400">
                        <div>Material</div>
                        <div class="text-right">{{ ((props.costs.materialCosts / totalBidding) * 100).toFixed(2) || 0 }}%</div>
                        <div>Labor</div>
                        <div class="text-right">{{ ((props.costs.laborCosts.laborHours * props.costs.laborCosts.laborRate) / totalBidding * 100).toFixed(2) || 0 }}%</div>
                        <div>Miscellaneous</div>
                        <div class="text-right">{{ ((props.costs.miscellaneousCosts / totalBidding) * 100).toFixed(2) || 0 }}%</div>
                        <div>Subscontracts</div>
                        <div class="text-right">{{ ((props.costs.subscontractCosts / totalBidding) * 100).toFixed(2) || 0 }}%</div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
