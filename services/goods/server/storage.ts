import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export function createStorage(config: NodeJS.ProcessEnv = process.env) {
  const bucket = config.S3_BUCKET;
  const dir = resolve(config.UPLOAD_DIR || "./var/uploads");
  if (
    config.NODE_ENV === "production" &&
    !bucket &&
    config.PERSISTENT_UPLOADS !== "true"
  )
    throw new Error(
      "Production photos require private S3 storage or an explicitly mounted persistent UPLOAD_DIR (PERSISTENT_UPLOADS=true).",
    );
  const s3 = bucket
    ? new S3Client({
        region: config.S3_REGION || "auto",
        endpoint: config.S3_ENDPOINT || undefined,
        forcePathStyle: config.S3_FORCE_PATH_STYLE === "true",
      })
    : null;
  const keyPath = (key: string) => {
    if (!/^[a-f0-9-]{36}\.webp$/.test(key))
      throw new Error("Invalid storage key.");
    return resolve(dir, key);
  };
  return {
    async put(key: string, buffer: Buffer) {
      if (s3 && bucket)
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: "image/webp",
            ServerSideEncryption:
              config.S3_ENCRYPTION === "AES256" ? "AES256" : undefined,
          }),
        );
      else {
        await mkdir(dir, { recursive: true, mode: 0o700 });
        await writeFile(keyPath(key), buffer, { mode: 0o600 });
      }
    },
    async get(key: string) {
      if (s3 && bucket) {
        const result = await s3.send(
          new GetObjectCommand({ Bucket: bucket, Key: key }),
        );
        if (!result.Body) throw new Error("Photo unavailable.");
        return Buffer.from(await result.Body.transformToByteArray());
      }
      return readFile(keyPath(key));
    },
    async remove(key: string) {
      if (s3 && bucket)
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      else await unlink(keyPath(key)).catch(() => {});
    },
    close() {
      s3?.destroy();
    },
  };
}
