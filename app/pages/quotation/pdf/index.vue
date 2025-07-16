<script setup lang="ts">

</script>

<template>
    <UDashboardPanel id="quotation-details">
        <template #header>
            <UDashboardNavbar title="Quotation PDF Preview">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UiAppButtonBack />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <QuotationPdfView />
        </template>
    </UDashboardPanel>
</template>
