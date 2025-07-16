<script setup lang="ts">
    import { upperFirst } from 'scule'
    import { getPaginationRowModel, type Row } from '@tanstack/table-core'
    import type { TableColumn, TableRow } from '@nuxt/ui/runtime/components/Table.vue.js';

    const UButton = resolveComponent('UButton')
    const UBadge = resolveComponent('UBadge')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const UCheckbox = resolveComponent('UCheckbox')

    const quotationData = ref<any>(null)
    const query = { table: 'quotation_details' }
    const { data } = await useFetch('/api/postgre/quotation/group_quotation_id', {
        query
    });

    const search = ref('')
    const statusFilter = ref('all')
    const isLoading = ref<boolean>(true)
    
    const toast = useToast()
    const table = useTemplateRef('table')

    onMounted(async () => {
        quotationData.value = data.value?.data
        isLoading.value = false
        const _data = data.value?.data
        // console.log('_data ', _data)
        _data?.forEach(async (d: any) => {
            const response = await fetchQuotationId(d)
            const _index = quotationData.value.findIndex((item: any) => item?.quotation_id === d?.quotation_id)
            if (_index >= 0) {
                quotationData.value[_index].data = response?.data
                quotationData.value[_index].mat_cost_items = getTotalMaterialCosts(response?.data)
                quotationData.value[_index].misc_cost_items = getTotalCosts(response?.data, 'misc_cost')
                quotationData.value[_index].sub_cost_items = getTotalCosts(response?.data, 'subcon_cost')
                quotationData.value[_index].labor_cost_items = getLaborCosts(response?.data)
                quotationData.value[_index].bidding_price = getBiddingPrice(response?.data)
                quotationData.value[_index].final_price = getFinalPrice(response?.data)
            }
        })
        // console.log('quotationData ', quotationData.value)

    })
    
    const filteredRows = computed(() => {
        // console.log('Filtered rows search:', search.value)

        if (!search.value) {
            isLoading.value = true
            setTimeout(() => {
                isLoading.value = false
            }, 1000)

            return quotationData.value
        }
        // page.value = 1
        setTimeout(() => {
            isLoading.value = false
        }, 1000)

        if (search.value.startsWith('FilteredByStatus:')) {
            const status = search.value.split(':')[1]
            console.log('Filtering by status:', status)
            return status === 'all' ? quotationData.value :
                quotationData.value.filter((d: any) => d.WOStatus === Number(status))
        }
        return quotationData.value.filter((d: any) => {
            return Object.values(d).some((value) => {
                return String(value).toLowerCase().includes(search.value.toLowerCase())
            })
        })
    })

    const columnVisibility = ref()
    const rowSelection = ref({})

    function getRowItems(row: Row<any>) {
        return [
            {
                type: 'label',
                label: 'Actions'
            },
            {
                type: 'separator'
            },
            {
                label: 'Copy Quotation ID',
                icon: 'i-lucide-copy',
                onSelect() {
                    console.log('Copying Quotation ID:', row)
                    if (!navigator.clipboard) {
                        toast.add({
                            title: 'Clipboard not supported',
                            description: 'Your browser does not support clipboard operations.'
                        })
                        return
                    }
                    if (!row.original || !row.original.quotation_id) {
                        toast.add({
                            title: 'Error',
                            description: 'No found for this row.'
                        })
                        return
                    }
                    navigator.clipboard.writeText(row.original.quotation_id.toString())

                    toast.add({
                        title: 'Copied to clipboard',
                        description: 'Quotation ID copied to clipboard'
                    })
                }
            },
            {
                label: 'Copy Work Order ID',
                icon: 'i-lucide-copy',
                onSelect() {
                    console.log('Copying Work Order ID:', row)
                    if (!navigator.clipboard) {
                        toast.add({
                            title: 'Clipboard not supported',
                            description: 'Your browser does not support clipboard operations.'
                        })
                        return
                    }
                    if (!row.original || !row.original.work_order_id) {
                        toast.add({
                            title: 'Error',
                            description: 'No found for this row.'
                        })
                        return
                    }
                    navigator.clipboard.writeText(row.original.work_order_id.toString())

                    toast.add({
                        title: 'Copied to clipboard',
                        description: 'Work Order ID copied to clipboard'
                    })
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'View Quotation details',
                icon: 'i-lucide-list',
                onSelect() {
                    console.log('Viewing Quotation details:', row)
                    navigateTo('/quotation/' + row.original.quotation_id)
                }
            }
        ]
    }

    const columns: TableColumn<any>[] = [
    {
        id: 'select',
        header: ({ table }) =>
        h(UCheckbox, {
            'modelValue': table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
            'ariaLabel': 'Select all'
        }),
        cell: ({ row }) =>
        h(UCheckbox, {
            'modelValue': row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
            'ariaLabel': 'Select row'
        })
    },
    {
        accessorKey: 'quotation_id',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()

            return h(UButton, {
                color: 'neutral',
                variant: 'ghost',
                label: 'Quotation ID',
                icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
            },
        cell: ({ row }) => {
            return h(UButton, {
                color: 'neutral',
                variant: 'subtle',
                label: row.original.quotation_id,
                onClick: () => navigateTo('/quotation/' + row.original.quotation_id),
                class: 'text-center cursor-pointer',
            })
        }
    },
    {
        accessorKey: 'work_order_id',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()

            return h(UButton, {
                color: 'neutral',
                variant: 'ghost',
                label: 'Work Order ID',
                icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
            },
        cell: ({ row }) => {
            return h(UButton, {
                color: 'neutral',
                variant: 'subtle',
                label: row.original.work_order_id,
                onClick: () => navigateTo('/work-order/' + row.original.work_order_id),
                class: 'text-center cursor-pointer',
            })
        }
    },
    {
        accessorKey: 'final_price',
        header: 'Final Price',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'text-error' },
                row.original.final_price
            )
        }
    },
    {
        accessorKey: 'bidding_price',
        header: 'Bidding Price',
    },
    {
        accessorKey: 'mat_cost_items',
        header: 'Material Costs',
    },
    {
        accessorKey: 'labor_cost_items',
        header: 'Labor Costs',
    },
    {
        accessorKey: 'misc_cost_items',
        header: 'Miscellaneous',
    },
    {
        accessorKey: 'sub_cost_items',
        header: 'Subcontract',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
        return h(
            'div',
            { class: 'text-right' },
            h(
            UDropdownMenu,
            {
                content: {
                align: 'end'
                },
                items: getRowItems(row)
            },
            () =>
                h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto'
                })
            )
        )
        }
    }
    ]

    const pagination = ref({
        pageIndex: 0,
        pageSize: 10
    })

    watch(() => statusFilter.value, (newVal) => {
        console.log('Status filter changed:', newVal, filteredRows.value)
        search.value = 'FilteredByStatus:' + newVal
    })

    function select(row: TableRow<any>, e?: Event) {
        console.log('Row selected:', row)

        row.toggleSelected(!row.getIsSelected())
        console.log(e)
    }

    async function fetchQuotationId(quote: any) {
        const data = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
            query: {
                table: 'quotation_details',
                dynamic_field: 'quotation_id',
                value: quote?.quotation_id,
            },
            method: 'GET'
        }));
        return data
    }
</script>

<template>
    <UDashboardPanel id="quotation-index">
        <template #header>
            <UDashboardNavbar title="Quotations">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput
                    v-model="search"
                    class="max-w-sm"
                    icon="i-lucide-search"
                    placeholder="Input search term"
                />

                <div class="flex flex-wrap items-center gap-1.5">
                    <!-- <USelect
                        v-model="statusFilter"
                        :items="[
                            { label: 'All', value: 'all' },
                            { label: 'Open', value: 0 },
                            { label: 'WIP', value: 1 },
                            { label: 'Completed', value: 2 }
                        ]"
                        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                        placeholder="Filter status"
                        class="min-w-28"
                    /> -->
                    <UDropdownMenu
                        :items="
                        table?.tableApi
                            ?.getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => ({
                                label: upperFirst(column.id),
                                type: 'checkbox' as const,
                                checked: column.getIsVisible(),
                                onUpdateChecked(checked: boolean) {
                                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                                },
                                onSelect(e?: Event) {
                                    e?.preventDefault()
                                }
                            }))
                        "
                        :content="{ align: 'end' }"
                    >
                        <UButton
                            label="Display"
                            color="neutral"
                            variant="outline"
                            trailing-icon="i-lucide-settings-2"
                        />
                    </UDropdownMenu>
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
                v-model:pagination="pagination"
                :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }"
                class="shrink-0"
                :data="filteredRows"
                :columns="columns"
                :loading="isLoading"
                @select="select"
                :ui="{
                    base: 'table-fixed border-separate border-spacing-0',
                    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                    tbody: '[&>tr]:last:[&>td]:border-b-0',
                    th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
                    td: 'border-b border-default'
                }"
            />

            <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
                v-if="!isLoading">
                <div class="text-sm text-muted">
                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
                    {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
                </div>

                <div class="flex items-center gap-1.5">
                <UPagination
                    :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                    :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                    :total="table?.tableApi?.getFilteredRowModel().rows.length"
                    @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
                />
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>
