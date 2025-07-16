<script setup lang="ts">
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { User } from '~/types'
import type { TableColumn, TableRow } from '@nuxt/ui/runtime/components/Table.vue.js';

// const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const isLoading = ref<boolean>(true)
const search = ref('')
const workOrderData = ref<any>()

onMounted(async () => {
  const { response } = await fetchWorkOrder()
  // console.log(response)
  workOrderData.value = response?.data
  isLoading.value = false
  // console.log(workOrderData.value)
  // console.log('table ', table.value?.tableApi?.getColumn('WorkOrder'))
  // const  WOStatus = workOrderData.value.map((item: User) => item.WOStatus)
  // console.log('WOStatus:', WOStatus)
  // const uniqueArray = [...new Set(WOStatus)]; 
  // console.log('Unique WOStatus:', uniqueArray)
})

async function fetchWorkOrder() {
  isLoading.value = true

  const today = new Date();
  const dateAfter = new Date(today);
  dateAfter.setDate(today.getDate() - 15);
  const response = await fetch('/api/vista/work-order-search', {
      method: 'POST',
      body: JSON.stringify({
        filterObj: {value: convertDate(dateAfter), propertyName: 'RequestedDate', operator: 'GreaterThan'}
      })
  })
  const res = await response.json()
  return res
}

const filteredRows = computed(() => {
  // console.log('Filtered rows search:', search.value)

  if (!search.value) {
    isLoading.value = true
    setTimeout(() => {
        isLoading.value = false
    }, 1000)

    return workOrderData.value
  }
  // page.value = 1
  setTimeout(() => {
      isLoading.value = false
  }, 1000)

  if (search.value.startsWith('FilteredByStatus:')) {
      const status = search.value.split(':')[1]
      console.log('Filtering by status:', status)
      return status === 'all' ? workOrderData.value :
        workOrderData.value.filter((d: User) => d.WOStatus === Number(status))
  }
  return workOrderData.value.filter((d: User) => {
      return Object.values(d).some((value) => {
          return String(value).toLowerCase().includes(search.value.toLowerCase())
      })
  })
})

// const columnFilters = ref([{
//   id: 'WorkOrder',
//   value: ''
// }])
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
        if (!row.original || !row.original.WorkOrder) {
          toast.add({
            title: 'Error',
            description: 'No Work Order found for this row.'
          })
          return
        }
        navigator.clipboard.writeText(row.original.WorkOrder.toString())
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
      label: 'View Work Order details',
      icon: 'i-lucide-list',
      onSelect() {
        console.log('Viewing Work Order details:', row)
        navigateTo('/work-order/' + row.original.WorkOrder)
      }
    },
    // {
    //   label: 'View customer payments',
    //   icon: 'i-lucide-wallet'
    // },
    // {
    //   type: 'separator'
    // },
    // {
    //   label: 'Delete customer',
    //   icon: 'i-lucide-trash',
    //   color: 'error',
    //   onSelect() {
    //     toast.add({
    //       title: 'Customer deleted',
    //       description: 'The customer has been deleted.'
    //     })
    //   }
    // }
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
    accessorKey: 'WorkOrder',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Work Order',
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
        label: row.original.WorkOrder,
        onClick: () => navigateTo('/work-order/' + row.original.WorkOrder),
        class: 'text-center cursor-pointer',
      })
    }
  },
  {
    accessorKey: 'ServiceSite',
    header: 'Site',
    // cell: ({ row }) => {
    //   return h('div', { class: 'flex items-center gap-3' }, [
    //     h(UAvatar, {
    //       ...row.original.avatar,
    //       size: 'lg'
    //     }),
    //     h('div', undefined, [
    //       h('p', { class: 'font-medium text-highlighted' }, row.original.name),
    //       h('p', { class: '' }, `@${row.original.name}`)
    //     ])
    //   ])
    // }
  },
  {
    accessorKey: 'LeadTechnician',
    header: 'Technician',
  },
  {
    accessorKey: 'EnteredBy',
    header: 'Entered By',
  },
  {
    accessorKey: 'WOStatus',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) => {
      const WOStatus = row.original.WOStatus === 0 ? 'Open' : (row.original.WOStatus === 1 ? 'WIP' : 'Completed')
      const color: any = {
        2: 'success' as const,
        1: 'warning' as const,
        0: 'info' as const
      }[row.original.WOStatus]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        WOStatus
      )
    }
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

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  console.log('Status filter changed:', newVal, filteredRows.value)
  search.value = 'FilteredByStatus:' + newVal
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

function select(row: TableRow<any>, e?: Event) {
  console.log('Row selected:', row)

  row.toggleSelected(!row.getIsSelected())
  console.log(e)
}


</script>

<template>
  <UDashboardPanel id="work-order">
    <template #header>
      <UDashboardNavbar title="Work Order">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- <template #right>
          <UButton icon="i-lucide-plus">
            <NuxtLink to="/work-order/create">Create Work Order</NuxtLink>
          </UButton>
        </template> -->
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
          <!-- <CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </CustomersDeleteModal> -->

          <USelect
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
          />
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
