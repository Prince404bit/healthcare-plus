"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteRecord, useSignedRecordUrl } from "@/hooks/use-medical-records";
import { formatDate } from "@/utils/helpers";
import { FileText, Image, Trash2, Eye, Download, ExternalLink } from "lucide-react";
import type { MedicalRecord } from "@prisma/client";

const TYPE_LABELS: Record<string, string> = {
  LAB_RESULT: "Lab Result", PRESCRIPTION: "Prescription", IMAGING: "Imaging",
  DISCHARGE_SUMMARY: "Discharge Summary", VACCINATION: "Vaccination", OTHER: "Other",
};

const TYPE_COLORS: Record<string, "default" | "info" | "success" | "warning" | "destructive"> = {
  LAB_RESULT: "info", PRESCRIPTION: "success", IMAGING: "warning",
  DISCHARGE_SUMMARY: "default", VACCINATION: "success", OTHER: "default",
};

type Props = { record: MedicalRecord & { doctor?: { user: { name: string | null } } | null } };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecordCard({ record }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const deleteMutation = useDeleteRecord();
  const { data: signedUrl, refetch } = useSignedRecordUrl(record.id, previewOpen);

  const isImage = record.mimeType?.startsWith("image/");
  const isPdf = record.mimeType === "application/pdf";

  function handlePreview() {
    setPreviewOpen(true);
    refetch();
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {isImage ? <Image className="h-5 w-5 text-muted-foreground" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{record.title}</p>
              <Badge variant={TYPE_COLORS[record.type]}>{TYPE_LABELS[record.type]}</Badge>
            </div>
            {record.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{record.description}</p>}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{formatDate(record.recordedAt)}</span>
              {record.doctor && <span>Dr. {record.doctor.user.name}</span>}
              {record.fileName && <span>{record.fileName}</span>}
              {record.fileSize && <span>{formatBytes(record.fileSize)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {record.fileUrl && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePreview} title="Preview">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Record</AlertDialogTitle>
                  <AlertDialogDescription>Delete &quot;{record.title}&quot;? This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(record.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              {record.title}
              {signedUrl && (
                <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" />Open</Button>
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] rounded-lg border bg-muted/30">
            {!signedUrl ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Loading preview...</div>
            ) : isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signedUrl} alt={record.title} className="w-full object-contain" />
            ) : isPdf ? (
              <iframe src={signedUrl} className="w-full h-[65vh]" title={record.title} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview not available</p>
                <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download</Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
