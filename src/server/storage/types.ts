export interface StoredFile { reference: string; size: number }
export interface DocumentStorage {
  put(input: { id: string; fileName: string; bytes: Uint8Array }): Promise<StoredFile>;
  get(reference: string): Promise<Uint8Array>;
}
