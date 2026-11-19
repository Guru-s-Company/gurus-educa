import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cliente S3/R2 configurado
 * Suporta AWS S3, Cloudflare R2, MinIO, etc.
 */
const s3Config: {
  region: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
  endpoint?: string;
} = {
  region: process.env.S3_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
};

if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
}

export const s3Client = new S3Client(s3Config);

const BUCKET = process.env.S3_BUCKET ?? "gurus-educa";

/**
 * Gera uma chave de armazenamento única e organizada
 * Formato: {prefix}/{userId}/{timestamp}-{random}.{ext}
 */
export function generateStorageKey(
  prefix: string,
  userId: number,
  originalName: string
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Gera URL pré-assinada para UPLOAD (PUT)
 * O cliente faz upload direto para o bucket
 */
export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600 // 1 hora
): Promise<{ uploadUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, key };
}

/**
 * Gera URL pré-assinada para DOWNLOAD (GET)
 * Útil para arquivos privados
 */
export async function generateDownloadPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Deleta um objeto do bucket
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Valida tipo MIME permitido
 */
export const ALLOWED_MIME_TYPES = {
  // Imagens
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "image/webp": true,
  // Documentos
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/vnd.ms-excel": true,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
  "application/vnd.ms-powerpoint": true,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
  // Texto/Código
  "text/plain": true,
  "text/markdown": true,
  "text/csv": true,
  // Arquivos compactados
  "application/zip": true,
  "application/x-rar-compressed": true,
  "application/x-7z-compressed": true,
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return mimeType in ALLOWED_MIME_TYPES;
}

/**
 * Valida tamanho do arquivo (padrão: 50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function isValidFileSize(size: number, maxSize = MAX_FILE_SIZE): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Prefixos de armazenamento por domínio
 */
export const STORAGE_PREFIXES = {
  CONTENT_ATTACHMENT: "content-attachments",
  SUBMISSION_ATTACHMENT: "submission-attachments",
  PROJECT_FILE: "project-files",
  CONTRIBUTION_ATTACHMENT: "contribution-attachments",
  CHANNEL_ATTACHMENT: "channel-attachments",
  DM_ATTACHMENT: "dm-attachments",
  AVATAR: "avatars",
} as const;

export type StoragePrefix = typeof STORAGE_PREFIXES[keyof typeof STORAGE_PREFIXES];