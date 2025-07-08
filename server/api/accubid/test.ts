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
        const { data } = await axios.get('https://cloud.api.trimble.com/anywhere/database/v1/databases', {
            headers: {
                Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzUxNTA5NTc5LCJuYmYiOjE3NTE1MDU5NzksImlhdCI6MTc1MTUwNTk3OSwianRpIjoiODMxMTA4ZDhlZjJlNDQ3Mzg5YWZhODU1MjViYjhhYzQiLCJqd3RfdmVyIjoyLCJzdWIiOiI2MWYyMjg2NS03NGVlLTRmOGQtYWQ5NC1iYzdlNmRiNjcxYmIiLCJhcHBsaWNhdGlvbl9uYW1lIjoiaGF3a2lucy1lbGVjdHJpYy1zZXJ2aWNlLWluYy1hbnl3aGVyZS1hcGktY29uc3VtZXItYXBwIiwiaWRlbnRpdHlfdHlwZSI6ImFwcGxpY2F0aW9uIiwiYXV0aF90aW1lIjoxNzUxNTA1OTc5LCJhbXIiOlsiY2xpZW50X2NyZWRlbnRpYWxzIl0sImFjY291bnRfaWQiOiIyMTVjMzNiOC05NDBhLTU4ODAtYjU1OS03ZGFhNGE2YzYyZTMiLCJhdWQiOlsiNjFmMjI4NjUtNzRlZS00ZjhkLWFkOTQtYmM3ZTZkYjY3MWJiIl0sInNjb3BlIjoiaGF3a2lucy1lbGVjdHJpYy1zZXJ2aWNlLWluYy1hbnl3aGVyZS1hcGktY29uc3VtZXItYXBwIn0.SfgeR5IQ6qtFxb1FHv0V36jtb7kmNBTYc6zkoodBGju_K7q-A9iPvrg7fHExPkuE4kwQAuShRh-qJA_L7vUZskFAGb7ad0_YvCYLj1LzkzmKNxnbeFynbt240h47W93Li4wsLSyBlfIlI38d6I_-FTBXliu1FvGz7WGQk3cIEPedzbCRm68rt9bCVw4vrNHJ_MZNXN59PPEBeuwhfzgVKCYdrFh5xdi1_zY4XoufIRbz_Y1JSRBtBzL9-_IiG_GMrINNfDYZEkcj2m87e-WmVDdCY_Cp7ZYEZLzpIDvM-uTLC2AKZLBncFuNZPod0P0182dZFDZzE_D_zbKNjFzpKw`
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