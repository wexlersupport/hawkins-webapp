import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiKey = config.public.vistaApiKey
    
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const cookie = parseBody.fs_cookie

    try {
        const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/Account/IsLoggedIn'
        const { data } = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'X-Application-Key': vistaApiKey,
                Cookie: cookie || ''
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