import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, RefreshCw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { appToast } from "@/utils/appToast";
import { WEEKLY_REPORT_TEMPLATE_NAME } from "../weeklyReportUtils";

type ApiPrintableTemplate = {
  id: number;
  name: string;
  template_url: string;
  is_active: boolean;
  updated_at: string;
};

const TEMPLATE_QUERY_KEY = [
  "printable-template",
  WEEKLY_REPORT_TEMPLATE_NAME,
] as const;

const isPrintableTemplate = (value: unknown): value is ApiPrintableTemplate =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  "name" in value &&
  typeof value.name === "string" &&
  "template_url" in value &&
  typeof value.template_url === "string" &&
  "is_active" in value &&
  typeof value.is_active === "boolean" &&
  "updated_at" in value &&
  typeof value.updated_at === "string";

const getResponseMessage = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  if ("detail" in value && typeof value.detail === "string") {
    return value.detail;
  }

  if ("message" in value && typeof value.message === "string") {
    return value.message;
  }

  if ("file" in value && Array.isArray(value.file)) {
    const fileErrors = value.file.filter(
      (error): error is string => typeof error === "string"
    );

    return fileErrors.length > 0 ? fileErrors.join(" ") : null;
  }

  return null;
};

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function TemplateUploadDialog() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const templateQuery = useQuery<ApiPrintableTemplate | null>({
    queryKey: TEMPLATE_QUERY_KEY,
    enabled: open,
    retry: false,
    queryFn: async () => {
      const response = await privateFetch(
        buildApiUrl(
          `/api/templates/${encodeURIComponent(WEEKLY_REPORT_TEMPLATE_NAME)}/`
        )
      );
      const data: unknown = await response.json().catch(() => null);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to retrieve the current template."
        );
      }

      if (!isPrintableTemplate(data)) {
        throw new Error("The printable template response is invalid.");
      }

      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("name", WEEKLY_REPORT_TEMPLATE_NAME);
      formData.append("file", file);

      const response = await privateFetch(
        buildApiUrl("/api/templates/upload/"),
        {
          method: "POST",
          body: formData,
        }
      );
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to upload the printable template."
        );
      }

      if (!isPrintableTemplate(data)) {
        throw new Error("The uploaded template response is invalid.");
      }

      return data;
    },
    onSuccess: (template) => {
      queryClient.setQueryData(TEMPLATE_QUERY_KEY, template);
      appToast.success("Weekly Report template updated successfully.");
      setSelectedFile(null);
      setOpen(false);
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : "We couldn't update the Weekly Report template."
      );
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedFile(null);
      uploadMutation.reset();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      appToast.error("Only PDF files can be used as printable templates.");
      return;
    }

    setSelectedFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg">
          <RefreshCw />
          Change Template
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-lg bg-[#fff1ed] text-[#bf3419]">
            <FileText className="size-5" />
          </div>
          <DialogTitle>Weekly Report Template</DialogTitle>
          <DialogDescription>
            Replace the PDF letterhead used for Admin and Technician Weekly
            Report exports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Current template
            </p>
            {templateQuery.isLoading ? (
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Spinner className="size-4" />
                <span>Checking template...</span>
              </div>
            ) : templateQuery.isError ? (
              <p className="mt-2 text-sm text-red-600">
                Current template information could not be loaded.
              </p>
            ) : templateQuery.data ? (
              <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{templateQuery.data.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatUpdatedAt(templateQuery.data.updated_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    templateQuery.data.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {templateQuery.data.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No template has been uploaded yet.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#d9a69c] bg-[#fffaf8] px-4 py-7 text-center transition-colors hover:bg-[#fff1ed]"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#bf3419] shadow-sm">
              <Upload className="size-5" />
            </span>
            <span className="font-medium">
              {selectedFile ? "Choose a different PDF" : "Choose PDF template"}
            </span>
            <span className="max-w-full truncate text-xs text-muted-foreground">
              {selectedFile?.name ?? "PDF files only"}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={uploadMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner className="size-4" />
                Uploading...
              </>
            ) : (
              <>
                <Upload />
                Update Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
