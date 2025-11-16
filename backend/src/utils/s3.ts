import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from './logger';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID?.trim();
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY?.trim();
const AWS_REGION = process.env.AWS_REGION?.trim() || 'us-east-1';
const BUCKET_NAME = process.env.S3_BUCKET?.trim() || 'insightful-screenshots-prod';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generate a presigned URL for an S3 object
 * @param s3Url - Full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL or original URL if generation fails
 */
export async function generatePresignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      logger.error('AWS credentials not configured. Returning original S3 URL.');
      return s3Url;
    }
    const urlParts = s3Url.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      logger.warn('Invalid S3 URL format:', s3Url);
      return s3Url;
    }

    const key = urlParts[1];
    
    logger.info('Generating presigned URL for key:', key);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    return s3Url;
  }
}

export async function generatePresignedUrls(s3Urls: string[], expiresIn: number = 3600): Promise<string[]> {
  return Promise.all(s3Urls.map(url => generatePresignedUrl(url, expiresIn)));
}
