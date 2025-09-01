import { writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const vistaApiKey = config.public.vistaApiKey

  const body = await readBody(event)
  const parseBody = JSON.parse(body)
  const cookie = parseBody.fs_cookie
  const attachmentID = parseBody.attachmentID

  try {
    // Call the external API to fetch the PDF
    const res = await $fetch<ArrayBuffer>(
      `https://hawkinselectricserviceinc-hff.viewpointforcloud.com/Document/GetVPAttachment?attachmentID=${attachmentID}`,
      {
        method: "GET",
        responseType: "arrayBuffer",
        headers: {
            Accept: 'application/json',
            'X-Application-Key': vistaApiKey,
            Cookie: cookie || ''
        }
      }
    );
    console.log('res:', res)

    // Convert response to Buffer
    const buffer = Buffer.from(res);

    // Define file path inside Nuxt public folder
    const filePath = join(process.cwd(), 'public/uploaded-files', `${attachmentID}.pdf`);

    // Save file
    await writeFile(filePath, buffer);

    return { success: true, url: `/uploaded-files/${attachmentID}.pdf` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});
