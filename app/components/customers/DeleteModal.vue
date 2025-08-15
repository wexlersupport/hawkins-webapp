<script setup lang="ts">
const emits = defineEmits(['on-update-quotation']);
const props = withDefaults(defineProps<{
  rowSelection: any,
  count?: number,
  table?: any
}>(), {
  rowSelection: {},
  count: 0,
  table: {}
})

const open = ref(false)

async function onSubmit() {
  // console.log('Deleting customers:', props.table.tableApi.getRowModel(), props.rowSelection)
  const rows = props.table.tableApi.getRowModel().rows;
  const indexes = Object.keys(props.rowSelection);
  const quotationIds = filterStringsByIndex(indexes, rows)

  if (confirm('Are you sure you want to delete?')) {
    quotationIds.forEach(async (row: any) => {
      const deleteItem = await handleApiResponse($fetch(`/api/postgre/dynamic_field`, {
          query: {
              table: 'quotation_details',
              dynamic_field: 'quotation_id',
              value: row.original.quotation_id as Number,
          },
          method: 'DELETE'
      }));
      console.log('DELETE ', deleteItem)
    })
  }

  emits('on-update-quotation')
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Delete ${count} quotation${count > 1 ? 's' : ''}`"
    :description="`Are you sure, this action cannot be undone.`"
  >
    <slot />

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          @click="open = false"
        />
        <UButton
          label="Delete"
          color="error"
          variant="solid"
          loading-auto
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
