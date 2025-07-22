import path from 'path';
import fs from 'fs';

export default defineEventHandler(async (event) => {
  const files: any = await readMultipartFormData(event);
  if (!files) {
    return createError({statusCode: 400, data: 'File is invalid'})
  }
  const uploadedFilename: string[] = []

  try {
    files.forEach((file: any) => {
      const filename = file.name +'.'+ file.filename.split('.').pop();
      const filePath = path.join(process.cwd(), './public/uploaded-files', filename as string);
      fs.writeFileSync(filePath, file.data);
      uploadedFilename.push(filename)
    });

    return uploadedFilename;
  } catch (error) {
    return { error };
  }
});