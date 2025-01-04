import path from 'path';
import multer from 'multer';
import { Request, Response } from 'express';
import catchAsync from '../utils/catch-async';

// The disk storage engine gives you full control on storing files to disk
const storage = multer.diskStorage({
  // define the upload directory
  destination: (req, file, cb) => {
    cb(null, process.cwd() + '/tmp');
  },
  // define the filename in the directory
  filename: (req, file, cb) => {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    cb(
      null,
      `${file.originalname}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// File filter to only allow certain type of files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    // null sent because no error, true means we are accepting such type of files
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed'));
  }
};

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter,
}).fields([
  { name: 'file', maxCount: 1 }, // Single file
  { name: 'files', maxCount: 10 }, // Multiple files
]);

// upload file with handling errors gracefully
const uploadWithErrorHandling = async (req: Request, res: Response) => {
  return new Promise(() => {
    void upload(req, res, (err) => {
      if (err) {
        // rejects the promise, equivalent to reject(err)
        throw err;
      }
    });
  });
};

const fileUpload = () => {
  return catchAsync(async (req, res, next) => {
    await uploadWithErrorHandling(req, res);
    next();
  });
};

export default fileUpload;
