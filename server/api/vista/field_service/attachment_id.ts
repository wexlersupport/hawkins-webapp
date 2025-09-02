import axios from 'axios'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const vistaApiKey = config.public.vistaApiKey
    
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    const cookie = parseBody.fs_cookie
    const attachmentID = parseBody.attachmentID

    try {
        const url = 'https://hawkinselectricserviceinc-hff.viewpointforcloud.com/Document/GetVPAttachment?attachmentID=' + attachmentID
        const response = await fetch(url, {
            method: "GET",
            headers: { 
                Accept: 'application/json',
                'X-Application-Key': vistaApiKey,
                Cookie: cookie || ''
             },
        });

        const arrayBuffer = await response.arrayBuffer();
        // 🔹 Send raw PDF back to client
        event.node.res.setHeader("Content-Type", "application/pdf");
        event.node.res.setHeader("Content-Disposition", "inline"); // or "attachment"

        return Buffer.from(arrayBuffer);
    } catch (error: any) {
        return {
            error : error.response.data
        }
    }
})