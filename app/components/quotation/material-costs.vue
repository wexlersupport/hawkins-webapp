<script setup lang="ts">
    const emits = defineEmits(['open-material-list']);
    const props = defineProps<{
        items: any
    }>()

    const isAddEdit = ref<boolean>(false)
    const editIndex = ref<number | undefined>(undefined)
    const mat_cost_pvs_input = ref<any>(10)
    const mat_cost_tax_input = ref<any>(6)
    const mat_cost_items = ref<any[]>([])
    const mat_cost_item_addedit = ref({ name: '', cost: 0 })

    defineExpose({
        mat_cost_items,
        mat_cost_pvs_input,
        mat_cost_tax_input
    })

    onMounted(async () => {
        if (props?.items?.length > 0) {
            mat_cost_items.value = onUpdateItems(props?.items, 'mat_cost')
            mat_cost_pvs_input.value = getItem(props?.items, 'mat_cost_pvs_input')
            mat_cost_tax_input.value = getItem(props?.items, 'mat_cost_tax_input')
        }
    })

    async function addEditMaterialCostItem(params: { isEdit: boolean; index?: number }) {
        if (params.isEdit && params.index !== undefined) {
            // Update existing item
            mat_cost_items.value[params.index] = { ...mat_cost_item_addedit.value }
        } else {
            // Add new item
            mat_cost_items.value.push({ ...mat_cost_item_addedit.value })
        }
        mat_cost_item_addedit.value = { name: '', cost: 0 }
        isAddEdit.value = false
    }

    async function removeMaterialCostItem(index: number) {
        if (confirm('Are you sure you want to remove this item?')) {
            mat_cost_items.value.splice(index, 1)
        }
    }

    watch(() => props.items, (newValue) => {
        mat_cost_items.value = onUpdateItems(newValue, 'mat_cost')
    });

    async function onAddItem() {
        // isAddEdit.value = true;
        editIndex.value = undefined;
        mat_cost_item_addedit.value = { name: '', cost: 0 }

        emits('open-material-list');
    }
</script>

<template>
    <div class="p-2">
        <UCard variant="subtle">
            <template #header>
                <div class="flex justify-between items-center">
                    <h2>Material Costs</h2>
                    <UTooltip arrow text="Add item">
                        <UButton @click="onAddItem" class="cursor-pointer" size="sm" icon="i-lucide-plus" />
                    </UTooltip>
                </div>
            </template>
            <template #default>
                <div class="pb-1" v-for="(item, index) in mat_cost_items" :key="index">
                    <div class="grid grid-cols-4 text-nowrap text-neutral-400">
                        <div class="flex flex-col col-span-2">
                            {{ item.name }}
                            <div class="text-xs text-neutral-600 italic" v-if="item.search_term">
                                {{ `search term: ${item.search_term}` }}
                            </div>
                        </div>
                        <div class="text-right">{{ item.cost.toFixed(2) }}</div>
                        <div class="text-right space-x-1">
                            <UTooltip arrow text="Edit item">
                                <UButton @click="isAddEdit = true; editIndex = index; mat_cost_item_addedit = { ...item }" class="cursor-pointer" size="sm" icon="i-lucide-pencil" variant="outline" color="info"/>
                            </UTooltip>
                            <UTooltip arrow text="Remove item">
                                <UButton @click="removeMaterialCostItem(index, item)" class="cursor-pointer" size="sm" icon="i-lucide-minus" variant="outline" color="error"/>
                            </UTooltip>
                        </div>
                    </div>
                </div>
                <div class="pb-1 pt-2" v-if="isAddEdit">
                    <div class="grid grid-cols-3 text-nowrap text-neutral-400">
                        <div class="">
                            <UInput
                                v-model="mat_cost_item_addedit.name"
                                size="sm"
                                class="w-full"
                                placeholder="Add new item"
                                autocomplete="off"
                            />
                        </div>
                        <div class="text-right">
                            <UInput
                                type="number"
                                v-model="mat_cost_item_addedit.cost"
                                size="sm"
                                placeholder="Add new item"
                                autocomplete="off"
                                @keypress.enter="addEditMaterialCostItem({ isEdit: isAddEdit, index: editIndex })"
                            />
                        </div>
                        <div class="text-right space-x-1">
                            <UTooltip arrow text="Submit item">
                                <UButton @click="addEditMaterialCostItem({ isEdit: isAddEdit, index: editIndex })" class="cursor-pointer" size="sm" icon="i-lucide-check" variant="solid" color="info"/>
                            </UTooltip>
                            <UTooltip arrow text="Remove item">
                                <UButton @click="isAddEdit = false" class="cursor-pointer" size="sm" icon="i-lucide-trash-2" variant="outline" color="error"/>
                            </UTooltip>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="grid grid-cols-3 text-nowrap text-neutral-300">
                        <div class="col-span-2 text-right">
                            <div class="grid grid-cols-4">
                                <div class="col-span-3 text-nowrap italic">TOTAL:</div>
                                <h2><strong>{{ (mat_cost_items.reduce((acc, item) => acc + item.cost, 0)).toFixed(2) }}</strong></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-4 mt-4 border-t border-neutral-800 text-neutral-400">
                    <div class="grid grid-cols-3 space-b-1">
                        <div class="text-nowrap italic">
                            <div>Pricing Volatility Surcharge:</div>
                            <div class="text-xs text-neutral-600">(total material * {{ mat_cost_pvs_input }}%)</div>
                        </div>
                        <div class="text-right">{{ (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100).toFixed(2) }}</div>
                        <div class="text-right">
                            <UInput
                                v-model="mat_cost_pvs_input"
                                type="number"
                                size="sm"
                                class="w-20"
                                autocomplete="off"
                                variant="subtle"
                                trailing-icon="i-material-symbols-percent"
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 space-b-1">
                        <div class="italic">
                            <div>SubTotal:</div>
                            <div class="text-xs text-neutral-600">(total material + pricing volatility surcharge)</div>
                        </div>
                        <div class="text-right">
                            <!-- {{ (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100).toFixed(2) }} -->
                            {{ 
                                (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                                (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100)).toFixed(2)
                            }}
                        </div>
                    </div>
                    <div class="grid grid-cols-3 space-b-1">
                        <div class="italic">
                            <div>Tax:</div>
                            <div class="text-xs text-neutral-600">(subtotal * {{ mat_cost_tax_input }}%)</div>
                        </div>
                        <div class="text-right">
                            {{ 
                                (
                                    (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                                    (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100)) *
                                    mat_cost_tax_input / 100
                                ).toFixed(2)
                            }}
                        </div>
                        <div class="text-right">
                            <UInput
                                v-model="mat_cost_tax_input"
                                type="number"
                                size="sm"
                                class="w-20"
                                autocomplete="off"
                                variant="subtle"
                                trailing-icon="i-material-symbols-percent"
                            />
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="grid grid-cols-3">
                    <div class="col-span-2 text-right">
                        <div class="grid grid-cols-4">
                            <div class="col-span-3 text-nowrap">
                                <div>TOTAL MATERIAL COST:</div>
                                <div class="text-xs text-neutral-600">(subtotal + tax)</div>
                            </div>
                            <h2>
                                <strong>{{
                                    (
                                        mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                                        (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100)
                                        +
                                        (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) +
                                        (mat_cost_items.reduce((acc, item) => acc + item.cost, 0) * mat_cost_pvs_input / 100)) *
                                        mat_cost_tax_input / 100
                                    ).toFixed(2)
                                }}</strong>
                            </h2>
                        </div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
