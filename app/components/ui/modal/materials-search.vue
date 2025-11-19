<script setup lang="ts">
    import { getPaginationRowModel, type Row } from "@tanstack/table-core";
    import type {
        TableColumn,
        TableRow,
    } from "@nuxt/ui/runtime/components/Table.vue.js";

    const UButton = resolveComponent("UButton");
    const UDropdownMenu = resolveComponent("UDropdownMenu");
    const UCheckbox = resolveComponent("UCheckbox");
    const UInput = resolveComponent("UInput");
    const UTable = resolveComponent("UTable");

    const emits = defineEmits(['on-update-materials']);
    const open = ref<boolean>(false)
    const materialsAddModalRef = ref<any>(null);
    const materialData = ref<any>(null);
    const pagination = ref({
        pageIndex: 0,
        pageSize: 100,
    });
    const query = { table: "materials" };

    defineExpose({
        onModalOpen,
    })

    function onModalOpen() {
        open.value = true
    }

    const search = ref("");
    const search_advanced = ref("");
    const statusFilter = ref("all");
    const isLoading = ref<boolean>(true);
    const isSearching = ref<boolean>(false);

    const toast = useToast();
    const table = useTemplateRef("table");
    const columnVisibility = ref();
    const rowSelection = ref({});
    const total = ref(0);

    onMounted(async () => {
        const res = await $fetch("/api/postgre/material_pricing_chunk", {
            query: {
                ...query,
                search: search.value,
                isDesc: true,
                page: pagination.value.pageIndex + 1,
                limit: pagination.value.pageSize
            }
        });

        materialData.value = res.data?.map((item: any) => ({
            ...item,
            cost: item.cost ? `$${Number(item.cost).toFixed(2)}` : "0"
        })) ?? [];
        total.value = res.total ?? 0;
        // console.log("Fetched material data:", materialData.value, total.value);

        isLoading.value = false;
    });

    const filteredRows = computed(() => {
        // console.log('Filtered rows search:', search.value, isSearching.value)
        // console.log('Filtered materialData.value:', materialData.value)

        if (isSearching.value) {
            return materialData.value;
        }

        if (search.value === 'pagination_changed') {
            return materialData.value;
        }

        if (!search.value) {
            isLoading.value = true;
            setTimeout(() => {
                isLoading.value = false;
            }, 1000);

            return materialData.value;
        }
        // page.value = 1
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);

        const output = materialData.value.filter((d: any) => {
            return Object.values(d).some((value) => {
                return String(value).toLowerCase().includes(search.value.toLowerCase());
            });
        });
        console.log('Filtered rows output:', output)

        return output;
    });

    function getRowItems(row: Row<any>) {
        return [
            {
                type: "label",
                label: "Actions",
            },
            {
                type: "separator",
            },
            {
                label: "Copy Material Name",
                icon: "i-lucide-copy",
                onSelect() {
                    console.log("Copying Material Name:", row);
                    if (!navigator.clipboard) {
                        toast.add({
                            title: "Clipboard not supported",
                            description: "Your browser does not support clipboard operations.",
                        });
                        return;
                    }
                    if (!row.original || !row.original.name) {
                        toast.add({
                            title: "Error",
                            description: "No found for this row.",
                        });
                        return;
                    }
                    navigator.clipboard.writeText(row.original.name);

                    toast.add({
                        title: "Copied to clipboard",
                        description: "Material Name copied to clipboard",
                    });
                },
            },
            {
                label: "Edit Material details",
                icon: "i-lucide-edit",
                onSelect() {
                    // console.log('Viewing Material details:', row)
                    materialsAddModalRef.value.onModalOpen(row.original);
                },
            },
            {
                type: "separator",
            },
            {
                label: "Delete Material",
                icon: "i-lucide-trash-2",
                color: "error",
                onSelect: async () => {
                    if (confirm("Are you sure you want to remove this item?")) {
                        isLoading.value = true;

                        const deleteItem = await handleApiResponse(
                            $fetch(`/api/postgre/dynamic_field`, {
                            query: {
                                ...query,
                                dynamic_field: "id",
                                value: Number(row.original.id),
                            },
                            method: "DELETE",
                            })
                        );
                        materialData.value = materialData.value.filter(
                            (item: any) => item.id !== row.original.id
                        );

                        isLoading.value = false;
                        toast.add({
                            title: "Success",
                            description: "Material was successfully removed!",
                            icon: "i-lucide-check",
                            color: "success",
                        });
                    }
                },
            },
        ];
    }

    const columns: TableColumn<any>[] = [
    {
        id: "select",
        header: ({ table }) =>
            h(UCheckbox, {
                modelValue: table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : table.getIsAllPageRowsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                table.toggleAllPageRowsSelected(!!value),
                ariaLabel: "Select all",
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                modelValue: row.getIsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                row.toggleSelected(!!value),
                ariaLabel: "Select row",
            }),
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                color: "neutral",
                variant: "ghost",
                label: "Material Name",
                icon: isSorted
                ? isSorted === "asc"
                    ? "i-lucide-arrow-up-narrow-wide"
                    : "i-lucide-arrow-down-wide-narrow"
                : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            });
        },
        cell: ({ row }) => {
            return h(UButton, {
                color: "neutral",
                variant: "subtle",
                label: row.original.name,
                onClick: () => materialsAddModalRef.value.onModalOpen(row.original),
                class: "text-center cursor-pointer",
            });
        },
    },
    {
        accessorKey: "cost",
        header: "Cost",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const cost = parseFloat(row.original.cost?.replace(/[^0-9.]/g, "")) || 0;
            // reactive quantity and computed total
            const quantity = ref(row.original.quantity ?? 1);
            const totalCost = computed(() => quantity.value * cost);

            return h("div", { class: "flex justify-end items-center gap-2" }, [
                // Quantity input
                h(UInput, {
                    type: "number",
                    min: 1,
                    placeholder: "Qty",
                    class: "w-18",
                    modelValue: quantity.value,
                    "onUpdate:modelValue": (value: any) => {
                        const newVal = Math.max(1, Number(value) || 1);
                        quantity.value = newVal;
                        row.original.quantity = newVal;
                    },
                }),

                // ✅ Total cost text (this now renders properly)
                h(
                    "span",
                    { class: "text-sm text-primary-500 w-20" },
                    `$${totalCost.value.toFixed(2)}`
                ),

                // Add button
                h(UButton, {
                    class: "cursor-pointer",
                    icon: "i-heroicons-shopping-cart",
                    label: "Add to Material Costs",
                    color: "neutral",
                    variant: "solid",
                    onClick: () =>
                    addToMaterialCosts({
                        ...row.original,
                        quantity: quantity.value,
                        totalCost: totalCost.value,
                    }),
                }),

                // Dropdown menu
                h(
                    UDropdownMenu,
                    {
                        content: { align: "end" },
                        items: getRowItems(row),
                    },
                    () =>
                        h(UButton, {
                            icon: "i-lucide-ellipsis-vertical",
                            color: "neutral",
                            variant: "ghost",
                        })
                ),
            ]);
        },
    }
    ];

    watch(
        () => statusFilter.value,
        (newVal) => {
            console.log("Status filter changed:", newVal, filteredRows.value);
            search.value = "FilteredByStatus:" + newVal;
        }
    );

    watch(() => pagination.value.pageIndex, async (newIndex) => {
        //   isLoading.value = true;
        console.log("watch:", newIndex, search_advanced.value, pagination.value);
        const _search = isSearching.value ? search_advanced.value : '';
        try {
            const res = await $fetch("/api/postgre/material_pricing_chunk", {
                query: {
                    ...query,
                    search: _search,
                    page: newIndex + 1,
                    limit: pagination.value.pageSize,
                    isDesc: true
                }
            });

            console.log("watch data:", newIndex, res);
            materialData.value = res.data?.map((item: any) => ({
                ...item,
                cost: item.cost ? `$${Number(item.cost).toFixed(2)}` : "0"
            })) ?? [];
            total.value = res.total ?? 0;
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    });

    async function onAdvancedSearch() {
        pagination.value.pageIndex = 0;
        isSearching.value = true;
        isLoading.value = true;
        console.log("Advanced search triggered", search_advanced.value);

        const res = await $fetch("/api/postgre/material_pricing_chunk", {
            query: {
                ...query,
                search: search_advanced.value,
                isDesc: true,
                page: pagination.value.pageIndex + 1,
                limit: pagination.value.pageSize
            }
        });

        materialData.value = res.data?.map((item: any) => ({
            ...item,
            cost: item.cost ? `$${Number(item.cost).toFixed(2)}` : "0"
        })) ?? [];
        total.value = res.total ?? 0;
        console.log("onAdvancedSearch data:", materialData.value, total.value);
        isLoading.value = false;
    }

    async function onUpdatePagination(p: number) {
        pagination.value.pageIndex = p - 1;
        if (!isSearching.value) {
            search.value = 'pagination_changed';
        }
    }

    async function clearSearch() {
        isSearching.value = false
        search_advanced.value = ''
        pagination.value.pageIndex = 0

        // 🔑 Force API reload
        isLoading.value = true
        const res = await $fetch('/api/postgre/material_pricing_chunk', {
            query: {
                ...query,
                search: '',               // empty search
                isDesc: true,
                page: 1,                  // first page
                limit: pagination.value.pageSize
            }
        })

        materialData.value = res.data?.map((item: any) => ({
            ...item,
            cost: item.cost ? `$${Number(item.cost).toFixed(2)}` : '0'
        })) ?? []
        total.value = res.total ?? 0
        isLoading.value = false
    }

    async function addToMaterialCosts(product: any) {
        console.log('Adding to material costs:', product)
        emits('on-update-materials', product);
        open.value = false;
    }
</script>

<template>
    <UModal fullscreen v-model:open="open"
        title="Material List"
        description="Select materials to add to the quotation"
        :ui="{ footer: 'justify-end'}">
        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <div class="flex gap-2">
                    <UInput
                        v-model="search_advanced"
                        class="w-75"
                        placeholder="Input search term"
                        @keyup.enter="onAdvancedSearch"
                    />
                    <UButton
                        color="info"
                        icon="i-lucide-search"
                        class="max-w-sm cursor-pointer px-4"
                        label="Search"
                        @click="onAdvancedSearch"
                    />
                    <UButton
                        color="neutral"
                        icon="i-lucide-x"
                        class="max-w-sm cursor-pointer px-4"
                        label="Clear"
                        @click="clearSearch"
                        v-if="isSearching"
                    />
                    </div>

                    <div class="flex flex-wrap items-center gap-1.5">
                        <UButton
                        class="ml-2"
                        icon="i-heroicons-plus-circle"
                        label="Add New Material"
                        color="primary"
                        variant="solid"
                        @click="materialsAddModalRef.onModalOpen()"
                    />
                </div>
            </div>

            <UiAppLoading
                v-if="isLoading"
                class="border rounded-md p-6 my-4 border-neutral-800"
            />

            <UTable
                v-if="!isLoading"
                ref="table"
                v-model:column-visibility="columnVisibility"
                v-model:row-selection="rowSelection"
                class="shrink-0"
                :data="filteredRows"
                :columns="columns"
                :loading="isLoading"
                :ui="{
                    base: 'table-fixed border-separate border-spacing-0 py-2',
                    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                    tbody: '[&>tr]:last:[&>td]:border-b-0',
                    th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
                    td: 'border-b border-default',
                }"
            />

            <div
                class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
                v-if="!isLoading"
            >
                <div class="text-sm text-muted">
                    {{
                        table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0
                    }}
                    of
                    {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
                    selected.
                </div>

                <div class="flex items-center gap-1.5">
                    <UPagination
                        show-edges
                        :page="pagination.pageIndex + 1"
                        :items-per-page="pagination.pageSize"
                        :total="total"
                        @update:page="(p: number) => { 
                        onUpdatePagination(p);
                        }"
                    />
                </div>
            </div>
        </template>
    </UModal>

    <UiModalMaterialsAdd ref="materialsAddModalRef" @on-update-materials="clearSearch" />
</template>
