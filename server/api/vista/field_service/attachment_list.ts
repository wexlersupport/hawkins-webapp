import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiKey = config.public.vistaApiKey
    
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const cookie = parseBody.fs_cookie
    const uniqueAttchID = parseBody.uniqueAttchID

    try {
        const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/Document/GetVPAttachmentList?uniqueAttchID='+uniqueAttchID
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