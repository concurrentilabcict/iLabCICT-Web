import type { JsonObject, JsonValue } from "@/types/auditLog";

type MetadataRendererProps = {
  metadata: JsonObject | null;
};

type MetadataValueProps = {
  value: JsonValue;
  depth?: number;
};

const ACRONYMS: Record<string, string> = {
  api: "API",
  id: "ID",
  ip: "IP",
  url: "URL",
  uuid: "UUID",
};

const isJsonObject = (value: JsonValue): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const formatMetadataKey = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[_\-\s]+/)
    .filter(Boolean);

  if (words.length === 0) {
    return key;
  }

  return words
    .map((word) => {
      const normalizedWord = word.toLowerCase();
      return ACRONYMS[normalizedWord] ??
        `${normalizedWord.charAt(0).toUpperCase()}${normalizedWord.slice(1)}`;
    })
    .join(" ");
};

const formatPrimitiveValue = (value: string | number | boolean | null) => {
  if (value === null) return "Null";
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
};

function MetadataEntry({
  label,
  value,
  depth,
}: {
  label: string;
  value: JsonValue;
  depth: number;
}) {
  const isComposite = Array.isArray(value) || isJsonObject(value);

  if (!isComposite) {
    const formattedValue = formatPrimitiveValue(value);
    const shouldStack =
      typeof value === "string" &&
      (value.length > 64 || value.includes("\n"));

    return (
      <div
        className={`min-w-0 py-2.5 ${
          shouldStack
            ? "grid grid-cols-1 gap-1"
            : "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        }`}
      >
        <dt className="text-xs font-semibold text-muted-foreground">
          {formatMetadataKey(label)}
        </dt>
        <dd
          className={`min-w-0 whitespace-pre-wrap break-words text-sm font-medium text-foreground [overflow-wrap:anywhere] ${
            shouldStack
              ? "mt-1 rounded-lg bg-muted/40 p-2.5 leading-6"
              : "sm:ml-auto sm:max-w-[65%] sm:text-right"
          }`}
        >
          {formattedValue}
        </dd>
      </div>
    );
  }

  return (
    <section className="py-2.5">
      <h4 className="text-xs font-semibold text-muted-foreground">
        {formatMetadataKey(label)}
      </h4>
      <div
        className={`mt-2 min-w-0 ${
          depth > 0 ? "border-l-2 border-zinc-200 pl-3" : ""
        }`}
      >
        <MetadataValue value={value} depth={depth + 1} />
      </div>
    </section>
  );
}

export function MetadataValue({ value, depth = 0 }: MetadataValueProps) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">No items</p>;
    }

    return (
      <div className="flex min-w-0 flex-col gap-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="flex min-w-0 items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-2.5"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-white text-[0.65rem] font-bold text-zinc-500">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <MetadataValue value={item} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isJsonObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">No values</p>;
    }

    return (
      <dl className="min-w-0 divide-y divide-zinc-100">
        {entries.map(([key, nestedValue]) => (
          <MetadataEntry
            key={key}
            label={key}
            value={nestedValue}
            depth={depth}
          />
        ))}
      </dl>
    );
  }

  return (
    <span className="whitespace-pre-wrap break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]">
      {formatPrimitiveValue(value)}
    </span>
  );
}

export default function MetadataRenderer({
  metadata,
}: MetadataRendererProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-3 py-4 text-center text-sm text-muted-foreground">
        No additional metadata
      </p>
    );
  }

  return (
    <div className="border-y border-zinc-200 px-3">
      <MetadataValue value={metadata} />
    </div>
  );
}
