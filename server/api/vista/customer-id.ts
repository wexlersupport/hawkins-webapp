import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiUrl = config.public.vistaApiUrl
    const vistaApiKey = config.public.vistaApiKey
    const vistaSubscriptionCode = config.public.vistaSubscriptionCode

    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const id = parseBody.id
    const group = parseBody.group

    try {
        const url = vistaApiUrl+vistaSubscriptionCode+'/vista/ar/2/data/customers/cache/natural/'+group+'/'+id
        const { data } = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'X-Application-Key': vistaApiKey
            }
        })

    return {
        response : data
    }   
    } catch (error: any) {
        return {
            error : error.response.data
        }
    }
})