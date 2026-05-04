import { ExternalLinkIcon } from "../ui/action-icons";

type MaterialFilePreviewProps = {
  href: string;
  title: string;
  isImage: boolean;
};

export function MaterialFilePreview({
  href,
  title,
  isImage,
}: MaterialFilePreviewProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.92)_100%)] shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.82)_0%,rgba(15,23,42,0.62)_100%)]">
      {isImage ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-slate-950/95"
        >
          <img
            src={href}
            alt={title}
            loading="lazy"
            className="mx-auto max-h-[28rem] w-full object-contain"
          />
        </a>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Attached file
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {isImage ? "Image preview" : "File attachment"}
          </p>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(99,102,241,0.28)]"
        >
          Open file
          <ExternalLinkIcon />
        </a>
      </div>
    </section>
  );
}
