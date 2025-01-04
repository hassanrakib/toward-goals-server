import { v2 as cloudinary } from 'cloudinary';
import config from '../config';
import { promises as fs } from 'fs';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
  //   secure_distribution: 'mydomain.com',
});

const saveImageToCloud = async (imageName: string, filePath: string) => {
  const { secure_url } = await cloudinary.uploader.upload(filePath, {
    public_id: imageName,
  });

  //   delete the image from the server's disk storage
  await fs.unlink(filePath);

  return secure_url;
};

export default saveImageToCloud;
