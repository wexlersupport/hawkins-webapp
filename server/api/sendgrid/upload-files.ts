import path from 'path';
import fs from 'fs';

export default defineEventHandler(async (event) => {
  const files: any = await readMultipartFormData(event);
  if (!files) {
    return createError({statusCode: 400, data: 'File is invalid'})
  }
  const uploadedFilename: string[] = []

  try {
    const data: any = {}
    files.forEach((file: any) => {
      const filename = file.name +'.'+ file.filename.split('.').pop();
      const filePath = path.join(process.cwd(), './public/uploaded-files', filename as string);
      data.filePath = filePath;
      data.isDirectoryExists = fs.existsSync(path.join(process.cwd(), './public/uploaded-files'));
      console.log('data ', data)

      fs.writeFileSync(filePath, file.data);
      uploadedFilename.push(filename)
    });

    return { data, uploadedFilename };
  } catch (error) {
    return { error };
  }
});