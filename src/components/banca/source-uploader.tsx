"use client";

import { AlertCircle, File, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface SourceUploaderProps {
	bancaId: string;
	onUploadSuccess?: () => void;
}

export function SourceUploader({
	bancaId,
	onUploadSuccess,
}: SourceUploaderProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return;

			setIsUploading(true);
			setError(null);

			try {
				const file = acceptedFiles[0];
				if (!file) return;

				// Upload file
				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch(`/api/banca/${bancaId}/sources`, {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Upload failed");
				}

				// Success
				onUploadSuccess?.();
			} catch (err) {
				setError(err instanceof Error ? err.message : "Upload failed");
			} finally {
				setIsUploading(false);
			}
		},
		[bancaId, onUploadSuccess],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[".docx"],
			"text/plain": [".txt"],
		},
		maxFiles: 1,
		disabled: isUploading,
	});

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={cn(
					"relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors",
					isDragActive
						? "border-primary bg-primary/5"
						: "border-border hover:border-primary/50",
					isUploading && "pointer-events-none opacity-50",
				)}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center gap-3 text-center">
					{isUploading ? (
						<>
							<div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
							<p className="text-muted-foreground text-sm">Uploading...</p>
						</>
					) : isDragActive ? (
						<>
							<Upload className="size-12 text-primary" />
							<p className="font-medium text-sm">Drop your file here</p>
						</>
					) : (
						<>
							<File className="size-12 text-muted-foreground" />
							<div className="space-y-1">
								<p className="font-medium text-sm">
									Drag & drop a file here, or click to browse
								</p>
								<p className="text-muted-foreground text-xs">
									Supports PDF, DOCX, and TXT files
								</p>
							</div>
						</>
					)}
				</div>
			</div>

			{error && (
				<div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
					<AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
					<p className="text-destructive text-sm">{error}</p>
				</div>
			)}
		</div>
	);
}
