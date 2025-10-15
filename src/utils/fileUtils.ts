// fileUtils.ts
import type React from "react";
import type { Path, UseFormSetValue, FieldValues } from "react-hook-form";

export type UploadFnResult = any;

/**
 * Upload function shape:
 * - file: the File to upload
 * - onProgress?: optional progress callback (0-100)
 * - signal?: AbortSignal for cancellation
 *
 * Return whatever your API returns (string url, { url }, etc.)
 */
export type UploadFn = (
  file: File,
  onProgress?: (p: number) => void,
  signal?: AbortSignal
) => Promise<UploadFnResult>;

// NOTE: TFieldValues must extend FieldValues (react-hook-form requirement)
export type CreateFileHandlerOptions<TFieldValues extends FieldValues = FieldValues> = {
  uploadFn: UploadFn;
  setSelectedName: (n: string | null) => void;
  // Use react-hook-form's typed setValue if available
  setValue?: UseFormSetValue<TFieldValues>;
  setError?: (err: string | null) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  // Accept Path<TFieldValues> for type safety, but also allow string if caller prefers
  fieldName?: Path<TFieldValues> | string;
  allowedMime?: string[]; // e.g. ['application/pdf']
  allowedExt?: string[]; // e.g. ['.pdf', '.docx']
  maxSizeMB?: number;
  onUploadProgress?: (p: number) => void;
  onUploadStart?: () => void;
  onUploadSuccess?: (res: UploadFnResult) => void;
  onUploadError?: (err: unknown) => void;
};

const defaultExts = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"];

const getExtension = (name: string) => {
  const parts = name.split(".");
  if (parts.length <= 1) return "";
  return `.${parts.pop()?.toLowerCase() ?? ""}`;
};

/**
 * Simple file validator: size, mime (preferred), fallback to extension.
 * Returns null when valid, or an error message string when invalid.
 */
export function validateFile(
  file: File,
  allowedMime?: string[],
  allowedExt?: string[],
  maxSizeMB: number = 10
): string | null {
  if (!file) return "No file provided.";
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size too large. Please upload a file up to ${maxSizeMB} MB.`;
  }

  if (allowedMime && allowedMime.length > 0) {
    if (file.type && allowedMime.includes(file.type)) return null;
  }

  const ext = getExtension(file.name);
  const extsToCheck = (allowedExt && allowedExt.length > 0) ? allowedExt : defaultExts;
  if (ext && extsToCheck.includes(ext)) return null;

  return `Unsupported file type. Please upload a file in ${extsToCheck.join(", ").toUpperCase()}`;
}

/**
 * Generic, typed factory returning handlers that you can wire into your components.
 * Make sure to call as createFileHandlers<YourFormType>({ ... })
 */
export function createFileHandlers<TFieldValues extends FieldValues = FieldValues>(
  opts: CreateFileHandlerOptions<TFieldValues>
) {
  const {
    uploadFn,
    setSelectedName,
    setValue,
    setError,
    fileInputRef,
    fieldName,
    allowedMime,
    allowedExt,
    maxSizeMB = 10,
    onUploadProgress,
    onUploadStart,
    onUploadSuccess,
    onUploadError,
  } = opts;

  let controller: AbortController | null = null;
  let inProgress = false;

  const clearNativeInput = () => {
    if (fileInputRef && fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {
        // ignore (some browsers/refs are weird)
      }
    }
  };

  const removeFile = () => {
    if (controller) {
      controller.abort();
    }
    controller = null;
    inProgress = false;
    setSelectedName(null);
    // setValue expects a Path<TFieldValues>, so cast here
    if (setValue && fieldName) setValue(fieldName as Path<TFieldValues>, "" as any);
    if (setError) setError(null);
    clearNativeInput();
  };

  const handleFileObject = async (file: File | null) => {
    if (setError) setError(null);
    if (!file) return;

    const validationError = validateFile(file, allowedMime, allowedExt, maxSizeMB);
    if (validationError) {
      if (setError) setError(validationError);
      setSelectedName(null);
      clearNativeInput();
      return;
    }

    // valid — update UI state and start upload
    setSelectedName(file.name);
    if (setValue && fieldName) setValue(fieldName as Path<TFieldValues>, "" as any); // clear until upload succeeds
    onUploadStart?.();

    controller = new AbortController();
    inProgress = true;

    try {
      const progressCb = (p: number) => {
        onUploadProgress?.(p);
      };

      const res = await uploadFn(file, progressCb, controller.signal);

      inProgress = false;
      controller = null;

      // prefer res.url if present, otherwise store the whole response
      if (setValue && fieldName) {
        const valueToSet = (res && typeof res === "object" && "url" in res) ? (res as any).url : res;
        setValue(fieldName as Path<TFieldValues>, valueToSet as any);
      }

      onUploadSuccess?.(res);
      if (setError) setError(null);
      clearNativeInput();
      return res;
    } catch (err: any) {
      inProgress = false;
      controller = null;
      setSelectedName(null);
      clearNativeInput();

      if (err?.name === "AbortError") {
        if (setError) setError("Upload cancelled.");
      } else {
        const msg = err?.message ?? "Upload failed.";
        if (setError) setError(String(msg));
        onUploadError?.(err);
      }
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    // intentionally not awaited here
    void handleFileObject(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] ?? null;
    void handleFileObject(f);
  };

  return {
    handleInputChange,
    handleDrop,
    removeFile,
    isUploading: () => inProgress,
    abort: () => {
      if (controller) controller.abort();
    },
  };
}
