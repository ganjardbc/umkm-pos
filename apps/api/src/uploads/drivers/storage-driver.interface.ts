export interface StorageDriver {
  upload(file: Express.Multer.File): Promise<{ key: string; url: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}
