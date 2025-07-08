<script setup lang="ts">
    import * as v from 'valibot'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const toast = useToast()
    const form: any = useTemplateRef('form')
    const open = ref<boolean>(false)
    const emailObj = reactive({
        from: 'francis.regala@strattonstudiogames.com',
        to: 'pantet008@gmail.com',
        subject: 'Test Subject',
        html: '<p>Hi,</p><p><br></p><p>See the attached quote and let me know how you would like to proceed.</p><p><br></p><p>Thank you.</p>'
    })

    defineExpose({
        onModalOpen,
    })
    function onModalOpen() {
        open.value = true
    }

    const schema = v.object({
        from: v.pipe(v.string(), v.email('Invalid email')),
        to: v.pipe(v.string(), v.email('Invalid email')),
        subject: v.pipe(v.string(), v.minLength(2, 'Must be at least 2 characters'))
    })
    type Schema = v.InferOutput<typeof schema>

    async function onSubmit(event: FormSubmitEvent<Schema>) {
        console.log('emailObj', emailObj, event)

        const response_send_quotation = await fetch('/api/sendgrid/send-quotation', {
            method: 'POST',
            body: JSON.stringify({emailObj})
        })
        const send_quotation_res = await response_send_quotation.json()
        console.log('send_quotation_res ', send_quotation_res)

        if (send_quotation_res?.data?.id || (send_quotation_res.length > 0 && send_quotation_res[0].statusCode)) {
            toast.add({
                title: 'Success',
                description: 'Your message was successfully sent!',
                icon: 'i-lucide-check',
                color: 'success'
            })
            open.value = false
        } else {
            toast.add({
                title: 'Opss! Something went wrong.',
                description: 'There was a problem with your request!',
            })
        }
    }

    function onSendEmail() {
        form.value.submit()
    }
</script>

<template>
    <UModal v-model:open="open"
        title="Compose Email"
        description="Fill-up required fields (*) before click the 'Send Email' button "
        :ui="{ footer: 'justify-end' }">
        
        <template #body>
            <div class="py-2">
                <UForm ref="form" :schema="schema" :state="emailObj" class="space-y-4" @submit="onSubmit">
                    <div>
                        <div class="grid grid-cols-4 gap-2">
                            <div class="text-right col-span-1 pt-1">* From:</div>
                            <div class="col-span-3">
                                <UFormField name="from">
                                    <UInput v-model="emailObj.from"
                                        placeholder="From (email address)"
                                        autocomplete="off"
                                        class="w-full"
                                        readonly
                                        disabled
                                    />
                                </UFormField>
                            </div>
                            <div class="text-right col-span-1 pt-1">* To:</div>
                            <div class="col-span-3">
                                <UFormField name="to">
                                    <UInput v-model="emailObj.to"
                                        placeholder="To (email address)"
                                        autocomplete="off"
                                        class="w-full"
                                    />
                                </UFormField>
                            </div>
                            <div class="text-right col-span-1 pt-1">* Subject:</div>
                            <div class="col-span-3">
                                <UFormField name="subject">
                                    <UInput v-model="emailObj.subject"
                                        placeholder="Subject"
                                        autocomplete="off"
                                        class="w-full"
                                    />
                                </UFormField>
                            </div>
                            <div class="py-4 col-span-4 h-[200px]">
                                <ClientOnly>
                                    <QuillEditor contentType="html" v-model:content="emailObj.html"
                                        theme="snow" placeholder="Write your message here..." />
                                </ClientOnly>
                            </div>
                        </div>
                    </div>
                </UForm>
            </div>
        </template>

        <template #footer="{ close }">
            <UButton @click="open = false" label="Cancel" color="neutral" variant="outline" />
            <UButton @click="onSendEmail" label="Send Email" icon="i-lucide-send" color="info" />
        </template>
    </UModal>
</template>
