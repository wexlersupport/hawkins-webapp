<script setup lang="ts">
    const { data } = await useFetch('/api/postgre', {
        query: { table: 'configuration' }
    });
    const scope_of_works = ref<any>()
    const toast = useToast()
    const state = reactive<{ [key: string]: boolean }>({
        scope_of_works: true,
    })

    onMounted(async () => {
      const config_all: any = data.value?.data
      scope_of_works.value = config_all?.find((item: any) => item.config_key === 'scope_of_works')
      state.scope_of_works = scope_of_works.value.config_value === 'true' ? true : false
    })

    const sections = [{
        title: 'System Configuration',
        description: 'Change any settings will apply immediately.',
        fields: [{
            name: 'scope_of_works',
            label: 'AI generate Scope of Works',
            description: 'System will generate scope of works. Default is enabled.'
        }]
    }]

    async function onChange() {
        // console.log(state)
        const updateItem = await handleApiResponse($fetch('/api/postgre/'+scope_of_works.value.id, {
            query: {
                table: 'configuration',
                dynamic_field: 'id',
                dynamic_value: scope_of_works.value.id
            },
            method: 'PUT',
            body: {
              updated_at: formatJsDateToDatetime(new Date()),
              config_value: state.scope_of_works?.toString()
            }
        }));
        // console.log('updateItem ', updateItem)

        toast.add({
          title: 'Success',
          description: `AI generate Scope of Works is now ${state.scope_of_works ? 'enabled' : 'disabled'}!`,
          color: 'success'
        })
    }
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="state[field.name]"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>
