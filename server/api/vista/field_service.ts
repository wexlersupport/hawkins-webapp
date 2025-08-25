import axios from 'axios'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const cookie = parseBody.fs_cookie
    const token = parseBody.fs_x_xsrf_token

    try {
        const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/SM/GetWorkOrderTrips?fromTripDateStr=2025-07-01&toTripDateStr=2025-08-23&isWorkOrderHistory=false&includeUnscheduled=true'
        // const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/SM/GetSignerContacts'
        const { data } = await axios.get(url, {
            headers: {
                Accept: 'application/json, text/plain, */*',
                Cookie: cookie,
                X_Srf_Token: token
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