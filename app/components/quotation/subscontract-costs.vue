<script setup lang="ts">
    const isAddEdit = ref<boolean>(false)
    const editIndex = ref<number | undefined>(undefined)
    const sub_cost_item_addedit = ref<{ name: string; cost: number }>({ name: '', cost: 0 })
    const sub_cost_items = ref<{ name: string; cost: number }[]>([{ name: 'Item 1', cost: 20 }])

    defineExpose({
        sub_cost_items: sub_cost_items.value,
    })

    async function removeSubCostItem(index: number) {
        if (confirm('Are you sure you want to remove this item?')) {
            sub_cost_items.value.splice(index, 1)
        }
    }

    async function addEditSubCostItem(params: { isEdit: boolean; index?: number }) {
        if (params.isEdit && params.index !== undefined) {
            // Update existing item
            sub_cost_items.value[params.index] = { ...sub_cost_item_addedit.value }
        } else {
            // Add new item
            sub_cost_items.value.push({ ...sub_cost_item_addedit.value })
        }
        sub_cost_item_addedit.value = { name: '', cost: 0 }
        isAddEdit.value = false
    }
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div class="flex justify-between items-center">
                    <h2>Subcontract Costs</h2>
                    <UTooltip arrow text="Add item">
                        <UButton @click="isAddEdit = true; editIndex = undefined; sub_cost_item_addedit = { name: '', cost: 0 }" class="cursor-pointer" size="sm" icon="i-lucide-plus" />
                    </UTooltip>
                </div>
            </template>
            <template #default>
                <div class="pb-1" v-for="(item, index) in sub_cost_items" :key="index">
                    <div class="grid grid-cols-3 text-nowrap text-neutral-400">
                        <div>{{ item.name }}</div>
                        <div class="text-right">{{ item.cost.toFixed(2) }}</div>
                        <div class="text-right space-x-1">
                            <UTooltip arrow text="Edit item">
                                <UButton @click="isAddEdit = true; editIndex = index; sub_cost_item_addedit = { ...item }" class="cursor-pointer" size="sm" icon="i-lucide-pencil" variant="outline" color="info"/>
                            </UTooltip>
                            <UTooltip arrow text="Remove item">
                                <UButton @click="removeSubCostItem(index)" class="cursor-pointer" size="sm" icon="i-lucide-minus" variant="outline" color="error"/>
                            </UTooltip>
                        </div>
                    </div>
                </div>
                <div class="pb-1 pt-2" v-if="isAddEdit">
                    <div class="grid grid-cols-3 text-nowrap text-neutral-400">
                        <div class="">
                            <UInput
                                v-model="sub_cost_item_addedit.name"
                                size="sm"
                                class="w-full"
                                placeholder="Add new item"
                                autocomplete="off"
                            />
                        </div>
                        <div class="text-right">
                            <UInput
                                type="number"
                                v-model="sub_cost_item_addedit.cost"
                                size="sm"
                                placeholder="Add new item"
                                autocomplete="off"
                                @keypress.enter="addEditSubCostItem({ isEdit: isAddEdit, index: editIndex })"
                            />
                        </div>
                        <div class="text-right space-x-1">
                            <UTooltip arrow text="Submit item">
                                <UButton @click="addEditSubCostItem({ isEdit: isAddEdit, index: editIndex })" class="cursor-pointer" size="sm" icon="i-lucide-check" variant="solid" color="info"/>
                            </UTooltip>
                            <UTooltip arrow text="Remove item">
                                <UButton @click="isAddEdit = false" class="cursor-pointer" size="sm" icon="i-lucide-trash" variant="outline" color="error"/>
                            </UTooltip>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="grid grid-cols-3">
                    <div class="col-span-2 text-right">
                        <div class="grid grid-cols-4">
                            <div class="col-span-3 text-nowrap">
                                <div>TOTAL SUBCONTRACT COST:</div>
                            </div>
                            <h2>
                                <strong>{{ sub_cost_items.reduce((acc, item) => acc + item.cost, 0).toFixed(2) }}</strong>
                            </h2>
                        </div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
