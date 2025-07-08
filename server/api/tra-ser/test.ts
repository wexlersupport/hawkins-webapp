import axios from 'axios'

export default defineEventHandler(async (event) => {
    // const config = useRuntimeConfig()
    // const vistaApiUrl = config.public.vistaApiUrl
    // const vistaApiKey = config.public.vistaApiKey
    // const vistaSubscriptionCode = config.public.vistaSubscriptionCode

    // const body = await readBody(event)
    // const parseBody = JSON.parse(body)
    // const id = parseBody.id

    try {
        const { data } = await axios.get('https://api.xchange.trimble.com/connect/v1/direct/subscribers/12142/tra-ser/app/1/data/projects/cache', {
            headers: {
                Accept: 'application/json',
                'X-Application-Key': '41417d81-1852-40ba-8ccf-b46eca723e42'
            }
        })

        return {
            response : data
        }
    } catch (error: any) {
        return {
            error : error
        }
    }
})