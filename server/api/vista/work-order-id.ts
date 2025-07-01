import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiUrl = config.public.vistaApiUrl
    const vistaApiKey = config.public.vistaApiKey
    const vistaSubscriptionCode = config.public.vistaSubscriptionCode

    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const id = parseBody.id

    try {
        const { data } = await axios.get(vistaApiUrl+vistaSubscriptionCode+'/vista/sm/2/data/work_orders/cache/natural/1/'+id, {
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