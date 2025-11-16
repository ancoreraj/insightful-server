import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET || 'insightful-screenshots-prod';

export async function uploadScreenshotToS3(
  imageBuffer: Buffer,
  metadata: {
    organizationId: string;
    employeeId: string;
    timestamp: number;
    shiftId?: string;
  }
): Promise<string> {
  try {
    const { organizationId, employeeId, timestamp, shiftId } = metadata;
    
    const key = `screenshots/${organizationId}/${employeeId}/${timestamp}_${shiftId || 'manual'}.png`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      Metadata: {
        organizationId,
        employeeId,
        timestamp: timestamp.toString(),
        ...(shiftId && { shiftId }),
      },
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    return s3Url;

  } catch (error) {
    throw new Error('Failed to upload screenshot');
  }
}
