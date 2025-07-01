<script setup lang="ts">
    const route = useRoute()
    const workOrderId = route.params.id as string
    const isLoading = ref<boolean>(true)
    const workOrderDetail = ref()
    const scopeDetails = ref([])

    onMounted(async () => {
        isLoading.value = true
        const { response } = await fetchWorkOrderId()
        workOrderDetail.value = response
        console.log('Work Order ID:', workOrderDetail.value)
        if(workOrderDetail.value?.ScopeDetails.length) {
            scopeDetails.value = workOrderDetail.value.ScopeDetails.map((detail: any, index: number) => ({
                id: index + 1,
                icon: 'i-lucide-box',
                label: `Scope ${index + 1}`,
                content: detail || {}
            }))
        }
        console.log('Scope Details:', scopeDetails.value)
        isLoading.value = false
    });

    async function fetchWorkOrderId() {
        isLoading.value = true
        const response = await fetch('/api/vista/work-order-id', {
            method: 'POST',
            body: JSON.stringify({ id: workOrderId })
        })
        const res = await response.json()
        return res
    }

    async function onQuotation() {
        await navigateTo({
            path: '/work-order/quotation',
            query: { id: workOrderId }
        })
    }

</script>

<template>
    <UDashboardPanel id="work-order-details">
        <template #header>
            <UDashboardNavbar title="Work Order Details">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UiAppButtonBack />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>

            <UCard variant="subtle">
                <template #header>
                    <div>
                        <h2 class="text-lg">Work Order ID: <span class="font-extrabold">{{ workOrderId }}</span></h2>
                        <h6 v-if="!isLoading" class="text-sm text-neutral-500">{{ convertDateTimeFormat({date: workOrderDetail?.RequestedDate, time: workOrderDetail?.RequestedTime}) }}</h6>
                    </div>
                </template>

                <template #default>
                    <UiAppLoading
                        v-if="isLoading"
                        class="border rounded-md p-6 my-4 border-neutral-800"
                    />
                    <div v-if="!isLoading">
                        <UCard>
                            <template #default>
                                <UForm
                                    id="settings"
                                    :schema="workOrderDetail"
                                >
                                    <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-2 divide-y divide-neutral-800 mb-4">
                                        <div class="pb-4">
                                            <UFormField
                                                name="Customer"
                                                label="Customer:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.Customer"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="ServiceSite"
                                                label="Service Site:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.ServiceSite"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="WorkOrderType"
                                                label="Work Order Type:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.WorkOrderType"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="ServiceCenter"
                                                label="Service Center:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.ServiceCenter"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="EnteredBy"
                                                label="Entered By:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.EnteredBy"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="RequestedBy"
                                                label="Requested By:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.RequestedBy"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="ContactName"
                                                label="Contact Name:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.ContactName"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="ContactPhone"
                                                label="Contact Phone:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.ContactPhone"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="WOStatus"
                                                label="Status:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.WOStatus"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="LeadTechnician"
                                                label="Lead Technician:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.LeadTechnician"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4">
                                            <UFormField
                                                name="PRState"
                                                label="PR State:"
                                                class="text-lg"
                                            >
                                                <UInput
                                                v-model="workOrderDetail.PRState"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                />
                                            </UFormField>
                                        </div>
                                        <div class="pb-4"></div>
                                        <div class="pb-4 col-span-2 w-full">
                                            <UFormField
                                                name="Description"
                                                label="Description:"
                                                class="text-lg w-full"
                                            >
                                                <UTextarea
                                                v-model="workOrderDetail.Description"
                                                autocomplete="off"
                                                variant="subtle"
                                                size="xl"
                                                readonly
                                                class="w-full"
                                                />
                                            </UFormField>
                                        </div>
                                        
                                    </div>

                                    <UCard v-if="!isLoading">
                                        <template #header>
                                            <div>
                                                <h2 class="text-lg">Scope Details</h2>
                                            </div>
                                        </template>
                                        <template #default v-if="scopeDetails.length">
                                            <WorkOrderScopeDetails :scope-details="scopeDetails" />
                                        </template>
                                    </UCard>
                                </UForm>
                            </template>
                        </UCard>
                    </div>
                </template>

                <template #footer v-if="!isLoading">
                    <div class="flex items-center justify-end">
                        <UButton @click="onQuotation" class="cursor-pointer" size="xl" label="Create Quotation" icon="i-lucide-plus" />
                    </div>
                </template>
            </UCard>
        </template>
    </UDashboardPanel>
</template>