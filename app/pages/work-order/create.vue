<script setup lang="ts">
    import * as v from 'valibot'
    import type { FormSubmitEvent } from '@nuxt/ui'
    
    const toast = useToast()
    const scopeDetailsRef = ref<any>();
    const scopeDetails = ref<any>();
    const form: any = useTemplateRef('form')
    const forms: any = reactive({
        wostatus: 'todo',
        // Customer: null,
        // ServiceSite: null,
        // WorkOrderType: null,
        // ServiceCenter: null,
        // EnteredBy: null,
        // RequestedBy: null,
        // ContactName: null,
        // ContactPhone: null,
        // LeadTechnician: null,
        // PRState: null,
        // Description: null,
    })
    const statusItems = ref([
        {
            label: 'To Do',
            value: 'todo'
        },
        {
            label: 'Work In Progress ',
            value: 'wip'
        },
        {
            label: 'Compeleted',
            value: 'completed'
        }
    ])

    const schema = v.object({
        wostatus: v.pipe(v.string(), v.minLength(2, 'Must be at least 2 characters'))
    })
    type Schema = v.InferOutput<typeof schema>

    async function onSubmit(event: FormSubmitEvent<Schema>) {
        console.log('onSubmit', forms)
        console.log('onSubmit', {...forms})

        // const query = { table: 'work_orders' }
        // const created_at = formatJsDateToDatetime(new Date())
        // // CREATE Item
        // const createItem = await handleApiResponse($fetch('/api/mysql', {
        //     query,
        //     method: 'POST',
        //     body: { created_at, ...forms }
        // }));
        // console.log('createItem ', createItem)
        // const { insertId } = createItem
        // if (createItem?.insertId > -1) {
        //     const scope = {
        //         created_at,
        //         work_order_id: insertId,
        //         ...scopeDetails.value[0].content
        //     }
        //     console.log('scope ', scope)
        //     const createScope = await handleApiResponse($fetch('/api/mysql', {
        //         query: { table: 'scope_details' },
        //         method: 'POST',
        //         body: { ...scope }
        //     }));
        //     console.log('createScope ', createScope)
        //     if (createScope?.serverStatus) {
        //         toast.add({
        //             title: 'Success',
        //             description: `New Work Order successfully saved!`,
        //             color: 'success'
        //         })

        //         setTimeout(() => {
        //             navigateTo('/work-order')
        //         }, 2000);
        //     }
        // }

        // const { data, pending, error, refresh } = await useFetch('/api/mysql', {
        //     query
        // });
        // console.log('getAll ', data)

        // UPDATE Item
        // const updateItem = await handleApiResponse($fetch(`/api/mysql/2`, {
        //     query,
        //     method: 'PUT',
        //     body: { ...forms }
        // }));
        // console.log('updateItem ', updateItem)

        // DELETE Item
        // if (confirm('Are you sure you want to delete this item?')) {
        //     const deleteItem = await handleApiResponse($fetch(`/api/mysql/1`, {
        //         query,
        //         method: 'DELETE'
        //     }));
        //     console.log('DELETE ', deleteItem)
        // }
    }

    async function onSave() {
        const created_at = formatJsDateToDatetime(new Date())
        const query = { table: 'work_orders' }
        const { data, pending, error, refresh } = await useFetch('/api/postgre', {
            query
        });
        console.log('getAll ', data, pending, error )
        console.log('forms ', forms)

        // CREATE Item
        const createItem = await handleApiResponse($fetch('/api/postgre', {
            query,
            method: 'POST',
            body: { created_at, ...forms }
        }));
        console.log('createItem ', createItem)

        // DELETE Item
        // if (confirm('Are you sure you want to delete this item?')) {
        //     const deleteItem = await handleApiResponse($fetch(`/api/postgre/2`, {
        //         query,
        //         method: 'DELETE'
        //     }));
        //     console.log('DELETE ', deleteItem)
        // }

        // const getOne = await handleApiResponse($fetch(`/api/postgre/5`, {
        //     query,
        //     method: 'GET'
        // }));
        // console.log('getOne ', getOne)

        // UPDATE Item
        // const updateItem = await handleApiResponse($fetch(`/api/postgre/5`, {
        //     query,
        //     method: 'PUT',
        //     body: { created_at, ...forms }
        // }));
        // console.log('updateItem ', updateItem)
        

        return
        scopeDetailsRef.value.sendDataToParentNow();
        console.log('onSave', forms)
        form.value.submit()
    }

    // Function to handle API responses and errors
    const handleApiResponse = async (responsePromise: any) => {
        try {
            const response = await responsePromise;
            console.log('response', response)
            if (response) {
                // const data = await response.json();
                return response
            } else {
                // const errorData = await response.json();
                throw createError({
                    statusCode: 500,
                    statusMessage: `Error!`
                })
            }
        } catch (err) {
            console.error('API call error:', err);
        }
    };

    function handleChildData(data: any) {
        scopeDetails.value = data
        console.log("Received Data:", data);
    }
</script>

<template>
    <UDashboardPanel id="work-order">
        <template #header>
            <UDashboardNavbar title="Create Work Order">
            <template #leading>
                <UDashboardSidebarCollapse />
            </template>

            <template #right>
                <UiAppButtonBack />
            </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UCard variant="subtle" :ui="{ root: 'rounded-lg overflow-y-auto' }">
                <template #default>
                    <UForm ref="form" :schema="schema" :state="forms" class="space-y-4" @submit="onSubmit">
                        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2 divide-y divide-neutral-800 mb-4">
                            <div class="pb-4">
                                <UFormField
                                    name="Customer"
                                    label="Customer:"
                                >
                                    <UInput
                                    v-model="forms.Customer"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="ServiceSite"
                                    label="Service Site:"
                                >
                                    <UInput
                                    v-model="forms.ServiceSite"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="WorkOrderType"
                                    label="Work Order Type:"
                                >
                                    <UInput
                                    v-model="forms.WorkOrderType"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="ServiceCenter"
                                    label="Service Center:"
                                >
                                    <UInput
                                    v-model="forms.ServiceCenter"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="EnteredBy"
                                    label="Entered By:"
                                >
                                    <UInput
                                    v-model="forms.EnteredBy"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="RequestedBy"
                                    label="Requested By:"
                                >
                                    <UInput
                                    v-model="forms.RequestedBy"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="ContactName"
                                    label="Contact Name:"
                                >
                                    <UInput
                                    v-model="forms.ContactName"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="ContactPhone"
                                    label="Contact Phone:"
                                >
                                    <UInput
                                    v-model="forms.ContactPhone"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="wostatus"
                                    label="Status:"
                                >
                                    <!-- <UInput
                                    v-model="forms.wostatus"
                                    autocomplete="off"
                                    variant="subtle"
                                    /> -->
                                    <USelect v-model="forms.wostatus" :items="statusItems" variant="subtle" class="w-[190px]" />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="LeadTechnician"
                                    label="Lead Technician:"
                                >
                                    <UInput
                                    v-model="forms.LeadTechnician"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4">
                                <UFormField
                                    name="PRState"
                                    label="PR State:"
                                >
                                    <UInput
                                    v-model="forms.PRState"
                                    autocomplete="off"
                                    variant="subtle"
                                    />
                                </UFormField>
                            </div>
                            <div class="pb-4"></div>
                            <div class="pb-4 col-span-2 w-full">
                                <UFormField
                                    name="Description"
                                    label="Description:"
                                    class="w-full"
                                >
                                    <UTextarea
                                    v-model="forms.Description"
                                    autocomplete="off"
                                    variant="subtle"
                                    class="w-full"
                                    />
                                </UFormField>
                            </div>
                            
                        </div>
                    </UForm>
                    <WorkOrderScopeDetailsCreate ref="scopeDetailsRef"
                        @dataReady="handleChildData"/>
                </template>
                <template #footer>
                    <div class="flex items-center justify-end gap-x-2">
                        <UButton color="neutral">
                            <NuxtLink to="/work-order">Cancel</NuxtLink>
                        </UButton>
                        <UButton @click="onSave" class="cursor-pointer" label="Save Work Order" icon="i-lucide-save" />
                    </div>
                </template>
            </UCard>
        </template>
    </UDashboardPanel>
</template>
