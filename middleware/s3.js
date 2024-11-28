const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');


dotenv.config();

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS environment variables are not properly configured.");
}

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
console.log(s3, "jhg");

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        // acl: 'public-read',
        key: function (req, file, cb) {
            const folderName = file.fieldname;
            const uniqueName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, `${folderName}/${uniqueName}`);
        }
    })
});

const uploadFields = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'svg', maxCount: 1 },
    { name: 'projectBanner', maxCount: 1 },
    { name: 'skillImage', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 }
]);

module.exports = { uploadFields, s3 };