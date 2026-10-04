import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
};

export default function DataLoadNotice({ message, onRetry, isRetrying }: Props) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-gray-700">
      <span>{message}</span>
      <Button type="button" variant="outline" size="sm" disabled={isRetrying} onClick={onRetry}>
        <RotateCcw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
}
