export enum UploadingStatus {
  WAITING,
  UPLOADING,
  COMPLETED
}

export interface UploadingFile {
  name: string,
  status: UploadingStatus,
  progress: number
}

export interface DirRequest {
  hash: string,
  name: string,
  dirHash: string
}

export interface FileRequest {
  fileHash: string,
  fileName: string,
  fileType: string,
  dirHash: string,
  fileSize: number
}

export interface MyFile {
    hash: string,
    name: string
    type: string // dir, pdf, img, video...
    size: number
    createdAt: string
}
