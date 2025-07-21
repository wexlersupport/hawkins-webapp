<script setup lang="ts">
    const props = defineProps<{
        items: any
    }>()

    const laborCosts = ref<{ laborHours: Number; overtimeHours: Number; laborRate: Number; overtimeRate: Number }>({
        laborHours: 0,
        overtimeHours: 0,
        laborRate: 55,
        overtimeRate: 82.50
    });
    defineExpose({
        labor_cost_items: laborCosts.value,
    })

    onMounted(async () => {
        if (props?.items?.length > 0) {
            laborCosts.value.laborHours = getItem(props?.items, 'labor_hours', 'name')
            laborCosts.value.overtimeHours = getItem(props?.items, 'ot_hours', 'name')
            laborCosts.value.laborRate = getItem(props?.items, 'labor_rate', 'name')
            laborCosts.value.overtimeRate = getItem(props?.items, 'ot_rate', 'name')
        }
    })
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div class="flex justify-between items-center">
                    <h2>Labor Costs</h2>
                </div>
            </template>
            <template #default>
                <div class="pb-1">
                    <div class="grid grid-cols-3 text-nowrap">
                        <div></div>
                        <div>Labor</div>
                        <div>Overtime</div>
                        <div>Hours</div>
                        <div>
                            <UInput
                                v-model="laborCosts.laborHours"
                                type="number"
                                size="sm"
                                placeholder="labor"
                                autocomplete="off"
                            />
                        </div>
                        <div>
                            <UInput
                                v-model="laborCosts.overtimeHours"
                                type="number"
                                size="sm"
                                placeholder="overtime"
                                autocomplete="off"
                            />
                        </div>
                        <div class="pt-1">Rate</div>
                        <div class="pt-1">
                            <UInput
                                v-model="laborCosts.laborRate"
                                type="number"
                                size="sm"
                                placeholder="labor"
                                autocomplete="off"
                            />
                        </div>
                        <div class="pt-1">
                            <UInput
                                v-model="laborCosts.overtimeRate"
                                type="number"
                                size="sm"
                                placeholder="overtime"
                                autocomplete="off"
                            />
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="grid grid-cols-3">
                    <div class="text-right text-nowrap pr-4">
                        <div>TOTAL LABOR COST:</div>
                    </div>
                    <div>
                        <strong>{{ (laborCosts.laborHours * laborCosts.laborRate).toFixed(2) }}</strong>
                        <div class="text-xs text-neutral-600">(hours * labor rate)</div>
                    </div>
                    <div>
                        <strong>{{ (laborCosts.overtimeHours * laborCosts.overtimeRate).toFixed(2) }}</strong>
                        <div class="text-xs text-neutral-600">(overtime * overtime rate)</div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
