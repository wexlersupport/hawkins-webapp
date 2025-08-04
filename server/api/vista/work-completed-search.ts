import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiUrl = config.public.vistaApiUrl
    const vistaApiKey = config.public.vistaApiKey
    const vistaSubscriptionCode = config.public.vistaSubscriptionCode

    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const filterObj = parseBody.filterObj
    // const modifiedUtcAfter = parseBody.modifiedUtcAfter
    // const modifiedUtcBefore = parseBody.modifiedUtcBefore

    try {
        const { data } = await axios.post(vistaApiUrl+vistaSubscriptionCode+'/vista/sm/2/data/wo_work_completeds/cache/search',
        {
            filters: [filterObj]
            // modifiedUtcAfter,
            // modifiedUtcBefore,
        },
        {
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