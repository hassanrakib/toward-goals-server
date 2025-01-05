import { v2 as cloudinary } from 'cloudinary';
import config from '../config';
import { promises as fs } from 'fs';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
  //   secure_distribution: 'mydomain.com',
});

const saveImageToCloud = async (imageName: string, filePath: string) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(filePath, {
      public_id: imageName,
    });
    return secure_url;
  } catch (err: unknown) {
    throw new AppError(httpStatus.BAD_REQUEST, (err as Error).message);
  } finally {
    // delete the image from the server's disk storage
    await fs.unlink(filePath);
  }
};

export default saveImageToCloud;
