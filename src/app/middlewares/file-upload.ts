import path from 'path';
import multer from 'multer';
import { Request, Response } from 'express';
import catchAsync from '../utils/catch-async';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';

// The disk storage engine gives you full control on storing files to server disk
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
  // define field names in the form and max image allowed
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

// upload file with handling errors gracefully
const uploadWithErrorHandling = async (req: Request, res: Response) => {
  return new Promise<void>((resolve) => {
    void upload(req, res, (err) => {
      if (err) {
        // rejects the promise, equivalent to reject(err)
        throw err;
      }
      resolve();
    });
  });
};

const fileUpload = () => {
  return catchAsync(async (req, res, next) => {
    await uploadWithErrorHandling(req, res);
    // attach 'text' data from req.body.data (as it is coming from form data) to req.body
    // don't forget to convert to json
    // Safely parse the JSON string from req.body.data
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (req.body.data) {
        console.log(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const jsonString = JSON.parse(req.body.data as string) as string;
        req.body = JSON.parse(jsonString) as Record<string, unknown>;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid JSON in form data');
    }
    next();
  });
};

export default fileUpload;
