import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { File, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = ".csv,.json,.xlsx",
  maxSize = 100 * 1024 * 1024,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const supportedTypes = accept
    .split(",")
    .map((item) => item.replace(".", "").toUpperCase())
    .join(" | ");

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError("");

      if (rejectedFiles.length > 0) {
        setError(rejectedFiles[0].errors[0].message);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect(null);
  };

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "rounded-[28px] border border-dashed px-6 py-10 text-center transition-all",
            isDragActive
              ? "border-blue-400 bg-blue-50/80 shadow-[0_18px_45px_-35px_rgba(37,99,235,0.55)]"
              : "border-slate-300 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,0.94)_100%)] hover:border-blue-300 hover:bg-blue-50/40",
          )}
        >
          <input {...getInputProps()} />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.55)]">
            <Upload className="h-7 w-7" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold tracking-tight text-slate-950">
              {isDragActive ? "Release to upload the dataset" : "Drop a dataset into the workspace"}
            </p>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">
              Drag and drop your file here or click to browse. The platform will profile schema quality,
              imbalance, and training readiness after upload.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Formats: {supportedTypes}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-[26px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.3)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-50 text-blue-600">
                <File className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-950">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
