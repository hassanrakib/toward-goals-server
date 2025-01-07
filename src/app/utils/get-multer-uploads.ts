import { Request } from 'express';

export const getMulterUploadedFile = (req: Request) => {
  // get the multer uploaded file by accessing req.files
  let file: Express.Multer.File | undefined = undefined;

  if (req.files && Object.keys(req.files).includes('image')) {
    file = (req.files as Record<string, Express.Multer.File[]>).image[0];
  }

  return file;
};

export const getMulterUploadedFiles = (req: Request) => {
  // get the multer uploaded files by accessing req.files
  let files: Express.Multer.File[] | undefined = undefined;

  if (req.files && Object.keys(req.files).includes('images')) {
    files = (req.files as Record<string, Express.Multer.File[]>).images;
  }

  return files;
};
