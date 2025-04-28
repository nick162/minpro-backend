import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config/env";

cloudinary.config({
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  cloud_name: CLOUDINARY_CLOUD_NAME,
});

const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const cloudinaryUpload = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const readableStream = bufferToStream(file.buffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      (err, result: UploadApiResponse) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    readableStream.pipe(uploadStream);
  });
};

const extractPublicIdFromUrl = (url: string) => {
  const urlParts = url.split("/");
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split(".")[0];
  return publicId;
};

export const cloudinaryRemove = async (secureUrl: string) => {
  const publicId = extractPublicIdFromUrl(secureUrl);
  return await cloudinary.uploader.destroy(publicId);
};
