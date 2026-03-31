import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const removeLocalFile = (localFilePath) => {
    try {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    } catch (error) {
        // Temporary file cleanup should never break the request lifecycle.
    }
};

const uploadOnCloudinary = async (
    localFilePath,
    {
        resourceType = "auto",
        useLargeUpload = false
    } = {}
) => {
    try {
        if (!localFilePath) return null;

        const shouldUseLargeUpload = useLargeUpload || resourceType === "video";
        const uploadOptions = {
            resource_type: resourceType,
            ...(shouldUseLargeUpload ? { chunk_size: 6_000_000 } : {})
        };

        const response = shouldUseLargeUpload
            ? await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(
                    localFilePath,
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(result);
                    },
                    uploadOptions
                );
            })
            : await cloudinary.uploader.upload(localFilePath, uploadOptions);

        return response;
    } catch (error) {
        const message =
            error?.message ||
            error?.error?.message ||
            error?.response?.error?.message ||
            `Cloudinary ${resourceType} upload failed`;

        throw new Error(
            message
        );
    } finally {
        removeLocalFile(localFilePath);
    }
};

const deleteOnCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) {
        return null;
    }

    return cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
    });
};

const buildDirectUploadSignature = ({
    folder = ""
} = {}) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
        timestamp
    };

    if (folder) {
        paramsToSign.folder = folder;
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        signature
    };
};

const extractPublicIdFromCloudinaryUrl = (fileUrl) => {
    if (!fileUrl) {
        return null;
    }

    const [urlWithoutQuery] = fileUrl.split("?");
    const uploadMarker = "/upload/";
    const uploadIndex = urlWithoutQuery.indexOf(uploadMarker);

    if (uploadIndex === -1) {
        return null;
    }

    const pathParts = urlWithoutQuery
        .slice(uploadIndex + uploadMarker.length)
        .split("/")
        .filter(Boolean);

    const versionIndex = pathParts.findIndex((part) => /^v\d+$/.test(part));
    const assetParts = versionIndex >= 0 ? pathParts.slice(versionIndex + 1) : pathParts;
    const filename = assetParts.pop();

    if (!filename) {
        return null;
    }

    const basename = filename.replace(/\.[^.]+$/, "");

    return [...assetParts, basename].join("/");
};

export {
    uploadOnCloudinary,
    deleteOnCloudinary,
    extractPublicIdFromCloudinaryUrl,
    buildDirectUploadSignature
}
