"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CSV_REQUIRED_COLUMNS } from "@/lib/constants";

interface BatchUploadProps {
  onUpload:  (file: File) => Promise<void>;
  isLoading: boolean;
}

export function BatchUpload({ onUpload, isLoading }: BatchUploadProps) {
  const [file, setFile]     = useState<File | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setError(null);
    if (rejected.length > 0) {
      setError("Only .csv files are accepted.");
      return;
    }
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleSubmit = async () => {
    if (!file) return;
    setError(null);
    try {
      await onUpload(file);
    } catch (e: any) {
      setError(e.message || "Upload failed. Check your file format.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary-400 bg-primary-50 dark:bg-primary-950/20"
            : "border-muted-foreground/25 hover:border-primary-400 hover:bg-muted/30",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop your CSV file here</p>
        ) : (
          <>
            <p className="font-medium text-sm">Drag & drop your CSV file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Maximum 10,000 rows · .csv only
        </p>
      </div>

      {/* Selected file */}
      {file && !isLoading && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Required columns info */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-health-500" />
          <p className="text-xs font-semibold">Required CSV columns (exact names):</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CSV_REQUIRED_COLUMNS.map((col) => (
            <code
              key={col}
              className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
            >
              {col}
            </code>
          ))}
        </div>
        <a
          href="/sample_batch.csv"
          download
          className="mt-3 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
        >
          Download sample CSV →
        </a>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full rounded-lg bg-primary-500 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
        ) : (
          <><Upload className="h-4 w-4" />Run Batch Prediction</>
        )}
      </button>
    </div>
  );
}
