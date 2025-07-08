import sgMail from '@sendgrid/mail'
import fs from 'fs';
import { convertHtmlEmail } from '~/utils'

const config = useRuntimeConfig()
const sendgridApiKey = config.public.sendgridApiKey
sgMail.setApiKey(sendgridApiKey)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const parseBody = JSON.parse(body)
    // let upload_files_res = []
    // if (parseBody.upload_files_res) {
    //     upload_files_res = parseBody.upload_files_res
    // }
    try {
        const { from, to, subject, html } = parseBody.emailObj
        const sendContent: any = { from, to, subject, html }
        if (sendContent.html) {
            sendContent.html = convertHtmlEmail(html)
        }
        // const attachments: any = []
        // if (upload_files_res.length > 0) {
        //     upload_files_res.forEach((file: any) => {
        //         const filepath = "./public/uploaded-files/"+file; // Adjust the path to your file
        //         const content = fs.readFileSync(filepath).toString('base64');
        //         attachments.push({
        //             content,
        //             filename: upload_files_res[0] as string,
        //         })
        //     });
        //     sendContent.attachments = attachments
        // }
        
        /* send with attachment
        const filepath = "./public/uploaded-files/test.pdf"; // Adjust the path to your file
        const content = fs.readFileSync(filepath).toString('base64');
        const attachments = [
            {
                content,
                "filename": "test.pdf",
                "type": "text/html",
                "disposition": "attachment"
            }
        ]
        sendContent.attachments = attachments
        */
        const data = sgMail
            // .send({...sendContent, template_id: 'd-9ea9297503204eab95b081340ee70691'})
            .send(sendContent)
            .then((res: any) => {
                console.log('Email sent')
                return res
            })
            .catch((error: any) => {
                console.error(error)
                return error
            })

        return data;
    } catch (error) {
        return error;
    }
});