// This file adds missing type definitions for non-standard browser APIs

interface Navigator {
  /**
   * IE/Edge specific method to save a file.
   * @param blob The Blob object to save
   * @param defaultName The default file name to use
   * @returns A boolean indicating whether the save operation was successful
   */
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}
