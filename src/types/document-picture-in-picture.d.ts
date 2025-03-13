interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
}

interface Window {
  documentPictureInPicture: DocumentPictureInPicture;
}

declare global {
  interface Window {
    documentPictureInPicture: DocumentPictureInPicture;
  }
}
