import axios from 'axios'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const employee_no = parseBody.employee_no
    const password = parseBody.password

    try {
        const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/Account/Login'
        const response = await axios.post(url,
            {
                Employee: employee_no,
                Password: password,
                PRCo: 1,
                PMMode: false
            },
            { withCredentials: true })

        const cookies = response.headers['set-cookie']

    return {
        response : response.data,
        cookies
    }   
    } catch (error: any) {
        return {
            error : error.response.data
        }
    }
})