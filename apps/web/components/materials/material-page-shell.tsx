import { AiToolsPanel } from "./ai-tools-panel";
import { MaterialEditorForm } from "./material-editor-form";
import { MaterialPageHeader } from "./material-page-header";
import type { MaterialPageController } from "./material-page-controller";
import { MaterialViewPanel } from "./material-view-panel";
import { ShareModal } from "./share-modal";
import { ConfirmModal } from "../ui/confirm-modal";
import { LottieDecoration } from "../ui/lottie-decoration";
import { ScrollToTop } from "../ui/scroll-to-top";
import { Toast } from "../ui/toast";

type MaterialPageShellProps = {
  controller: MaterialPageController;
};

function MaterialAiToolsCard({ controller }: MaterialPageShellProps) {
  const shouldShow =
    !controller.isEditing &&
    controller.isOwner &&
    (controller.material.content || controller.savedAiOutputs.length > 0);

  if (!shouldShow) return null;

  return (
    <div className="mt-6 rounded-[2rem] border border-brand-200/40 bg-white/90 p-5 shadow-[0_24px_55px_rgba(15,23,42,0.06)] backdrop-blur dark:border-brand-400/10 dark:bg-slate-950/55">
      <AiToolsPanel
        content={controller.material.content ?? ""}
        materialId={controller.material.id}
        savedOutputs={controller.savedAiOutputs}
        onOutputSaved={controller.handleAiOutputSaved}
        onInsertIntoNote={controller.handleInsertAiOutput}
      />
    </div>
  );
}

function MaterialModeCard({ controller }: MaterialPageShellProps) {
  const { draft, setDraft } = controller;

  return (
    <div className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
      {controller.isEditing ? (
        <MaterialEditorForm
          title={draft.title}
          content={draft.content}
          materialType={draft.materialType}
          fileUrl={draft.fileUrl}
          tagsInput={draft.tagsInput}
          saving={controller.saving}
          onTitleChange={(title) => setDraft((current) => ({ ...current, title }))}
          onContentChange={(content) => setDraft((current) => ({ ...current, content }))}
          onMaterialTypeChange={(materialType) =>
            setDraft((current) => ({ ...current, materialType }))
          }
          onFileUrlChange={(fileUrl) => setDraft((current) => ({ ...current, fileUrl }))}
          onTagsInputChange={(tagsInput) =>
            setDraft((current) => ({ ...current, tagsInput }))
          }
          onSubmit={controller.handleSave}
          onCancel={controller.cancelEditing}
        />
      ) : (
        <MaterialViewPanel
          materialId={controller.material.id}
          title={controller.material.title}
          materialType={controller.material.materialType}
          tags={controller.normalizedTags}
          content={controller.material.content}
          fileUrl={controller.material.fileUrl}
          createdAt={controller.material.createdAt}
          isPinned={controller.isPinned}
          pinBusy={controller.pinBusy}
          isOwner={controller.isOwner}
          onTogglePin={controller.handleTogglePin}
          onEdit={controller.startEditing}
          onDelete={() => controller.setShowDeleteModal(true)}
          onShare={() => controller.setShowShareModal(true)}
        />
      )}
    </div>
  );
}

function MaterialPageModals({ controller }: MaterialPageShellProps) {
  return (
    <>
      <ConfirmModal
        isOpen={controller.showDeleteModal}
        title="Delete material?"
        description="This action cannot be undone."
        confirmLabel="Delete material"
        busy={controller.deleteBusy}
        onCancel={() => controller.setShowDeleteModal(false)}
        onConfirm={controller.handleDeleteMaterial}
      />

      {controller.showShareModal ? (
        <ShareModal
          materialId={controller.material.id}
          materialTitle={controller.material.title}
          onConfirm={controller.handleShare}
          onClose={() => controller.setShowShareModal(false)}
        />
      ) : null}
    </>
  );
}

export function MaterialPageShell({ controller }: MaterialPageShellProps) {
  return (
    <>
      <div className="relative overflow-hidden font-poppins">
        <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <MaterialPageHeader
            course={controller.course}
            moduleInfo={controller.moduleInfo}
            material={controller.material}
            pageTitle={controller.pageTitle}
            isEditing={controller.isEditing}
            isPinned={controller.isPinned}
          />
          <MaterialAiToolsCard controller={controller} />
          <MaterialModeCard controller={controller} />
        </div>
      </div>

      <ScrollToTop />
      <MaterialPageModals controller={controller} />
      {controller.toast ? (
        <Toast
          message={controller.toast.message}
          tone={controller.toast.tone}
          onClose={() => controller.setToast(null)}
        />
      ) : null}
      <LottieDecoration src="https://lottie.host/dacfb550-1576-4e41-a4af-b05f29dfc221/c2x2LftM8d.lottie" />
    </>
  );
}
