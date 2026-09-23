import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID, createHash, createHmac } from 'crypto';
import * as http from 'http';

/**
 * Lightweight S3/MinIO PUT/GET using Signature V4 — no minio npm dependency.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private enabled = false;
  private bucket: string;
  private endPoint: string;
  private port: number;
  private accessKey = '';
  private secretKey = '';
  private region = 'us-east-1';

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || 'erp-files';
    this.endPoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
    this.port = parseInt(process.env.MINIO_PORT || '9000', 10);
  }

  async onModuleInit() {
    const candidates: Array<[string, string]> = [
      [
        process.env.MINIO_ACCESS_KEY ||
          process.env.MINIO_ROOT_USER ||
          'minioadmin',
        process.env.MINIO_SECRET_KEY ||
          process.env.MINIO_ROOT_PASSWORD ||
          'minioadmin123',
      ],
      ['minioadmin', 'minioadmin123'],
    ];

    for (const [ak, sk] of candidates) {
      this.accessKey = ak;
      this.secretKey = sk;
      try {
        await this.ensureBucket();
        this.enabled = true;
        this.logger.log(
          `MinIO listo @ ${this.endPoint}:${this.port}/${this.bucket}`,
        );
        return;
      } catch (err: any) {
        this.logger.warn(`MinIO probe falló (${ak}): ${err?.message || err}`);
      }
    }
    this.enabled = false;
    this.logger.warn('MinIO no disponible. Uploads usarán path local simulado.');
  }

  private async ensureBucket() {
    const head = await this.s3Request('HEAD', `/${this.bucket}`);
    if (head.statusCode === 200) return;
    if (head.statusCode === 404) {
      const put = await this.s3Request('PUT', `/${this.bucket}`);
      if (put.statusCode !== 200 && put.statusCode !== 409) {
        throw new Error(
          `makeBucket HTTP ${put.statusCode}: ${put.body.toString('utf8')}`,
        );
      }
      return;
    }
    throw new Error(
      `HEAD bucket HTTP ${head.statusCode}: ${head.body.toString('utf8')}`,
    );
  }

  async upload(
    folder: string,
    filename: string,
    buffer: Buffer,
    contentType?: string,
  ): Promise<string> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectName = `${folder}/${randomUUID()}-${safeName}`;

    if (this.enabled) {
      const path = `/${this.bucket}/${objectName}`;
      const res = await this.s3Request(
        'PUT',
        path,
        buffer,
        contentType || 'application/octet-stream',
      );
      if (res.statusCode !== 200) {
        throw new Error(
          `Upload MinIO HTTP ${res.statusCode}: ${res.body.toString('utf8')}`,
        );
      }
      return `s3://${this.bucket}/${objectName}`;
    }

    return `/uploads/${objectName}`;
  }

  /** Download object by s3://bucket/key */
  async download(archivoUrl: string): Promise<Buffer | null> {
    if (!archivoUrl?.startsWith('s3://') || !this.enabled) return null;
    const without = archivoUrl.slice('s3://'.length);
    const slash = without.indexOf('/');
    if (slash < 0) return null;
    const bucket = without.slice(0, slash);
    const key = without.slice(slash + 1);
    const res = await this.s3Request('GET', `/${bucket}/${key}`);
    if (res.statusCode !== 200) {
      this.logger.warn(`download ${archivoUrl} → HTTP ${res.statusCode}`);
      return null;
    }
    return res.body;
  }

  async getPresignedUrl(
    _archivoUrl: string,
    _expirySec = 3600,
  ): Promise<string | null> {
    return null;
  }

  private async s3Request(
    method: string,
    canonicalUri: string,
    body?: Buffer,
    contentType?: string,
  ): Promise<{ statusCode: number; body: Buffer }> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = createHash('sha256')
      .update(body || '')
      .digest('hex');

    const host = `${this.endPoint}:${this.port}`;
    const headers: Record<string, string> = {
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    };
    if (contentType) headers['content-type'] = contentType;
    if (body) headers['content-length'] = String(body.length);

    const signedHeaderKeys = Object.keys(headers)
      .map((k) => k.toLowerCase())
      .sort();
    const signedHeaders = signedHeaderKeys.join(';');
    const canonicalHeaders = signedHeaderKeys
      .map((k) => `${k}:${headers[k]}\n`)
      .join('');

    const canonicalRequest = [
      method,
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const kDate = createHmac('sha256', 'AWS4' + this.secretKey)
      .update(dateStamp)
      .digest();
    const kRegion = createHmac('sha256', kDate).update(this.region).digest();
    const kService = createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = createHmac('sha256', kService)
      .update('aws4_request')
      .digest();
    const signature = createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');

    headers['authorization'] =
      `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: this.endPoint,
          port: this.port,
          path: canonicalUri,
          method,
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode || 0,
              body: Buffer.concat(chunks),
            });
          });
        },
      );
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }
}
