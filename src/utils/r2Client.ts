import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
console.log("process.env.R2_BUCKET_ENDPOINT", process.env.R2_BUCKET_ENDPOINT);
console.log("process.env.R2_ACCESS_KEY", process.env.R2_ACCESS_KEY);
console.log("process.env.R2_SECRET_KEY", process.env.R2_SECRET_KEY);
console.log("process.env.R2_BUCKET_URL", process.env.R2_BUCKET_URL);

const r2Client = new S3Client({
  region: "auto",
  endpoint: `${process.env.R2_BUCKET_ENDPOINT}/blogs`, // full bucket endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function uploadToR2(buffer: Buffer, filename: string): Promise<string> {
  const bucket = process.env.R2_BUCKET!;
  const uniqueName = `${Date.now()}-${filename}`;

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: uniqueName,
        Body: buffer,
        ContentType: "image/jpeg", // adjust dynamically if needed
      })
    );

    return `${process.env.R2_BUCKET_URL}/blogs/${uniqueName}`;
  } catch (error) {
    console.error("❌ R2 upload error:", error);
    throw new Error("Failed to upload file to R2");
  }
}

export async function deleteFromR2(fileUrl: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME!;
  const key = fileUrl.split("/").pop()!;

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    console.log(`✅ Deleted ${key} from R2`);
  } catch (error) {
    console.error("❌ R2 delete error:", error);
  }
}
