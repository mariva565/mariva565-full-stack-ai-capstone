"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MilestoneTimeline, type Milestone } from "../../components/progress/milestone-timeline";
import { ProgressBar } from "../../components/progress/progress-bar";
import { AddMilestoneForm } from "../../components/progress/add-milestone-form";
import { IdeasBacklog } from "../../components/progress/ideas-backlog";
import { ConfirmModal } from "../../components/ui/confirm-modal";
import { Spinner } from "../../components/ui/spinner";
import { Toast, type ToastTone } from "../../components/ui/toast";

type ToastState = { tone: ToastTone; message: string };

export default function ProgressPage() {
  const router = useRouter();
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBusy, setAddBusy] = useState(false);
  const [ideaBusy, setIdeaBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const milestones = useMemo(
    () => allMilestones.filter((m) => m.status !== "idea"),
    [allMilestones]
  );
  const ideas = useMemo(
    () => allMilestones.filter((m) => m.status === "idea"),
    [allMilestones]
  );

  useEffect(() => {
    void loadMilestones();
  }, []);

  async function loadMilestones() {
    setLoading(true);
    const res = await fetch("/api/milestones");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = (await res.json()) as { milestones: Milestone[] };
      setAllMilestones(data.milestones);
    }
    setLoading(false);
  }

  async function handleAdd(data: { title: string; description: string; dueDate: string }) {
    setAddBusy(true);
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        dueDate: data.dueDate || null,
        orderIndex: milestones.length,
      }),
    });
    setAddBusy(false);

    if (res.ok) {
      await loadMilestones();
      setToast({ tone: "success", message: "Milestone added." });
    } else {
      setToast({ tone: "error", message: "Could not add milestone." });
    }
  }

  async function handleAddIdea(title: string, description: string) {
    setIdeaBusy(true);
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        status: "idea",
        orderIndex: allMilestones.length,
      }),
    });
    setIdeaBusy(false);

    if (res.ok) {
      await loadMilestones();
      setToast({ tone: "success", message: "Idea saved." });
    } else {
      setToast({ tone: "error", message: "Could not save idea." });
    }
  }

  async function handlePromoteIdea(id: number) {
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "not_started" }),
    });
    if (res.ok) {
      await loadMilestones();
      setToast({ tone: "success", message: "Moved to timeline." });
    }
  }

  async function handleStatusChange(id: number, status: Milestone["status"]) {
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadMilestones();
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/milestones/${deleteId}`, { method: "DELETE" });
    setDeleteBusy(false);

    if (res.ok) {
      setDeleteId(null);
      await loadMilestones();
      setToast({ tone: "success", message: "Deleted." });
    } else {
      setToast({ tone: "error", message: "Could not delete." });
    }
  }

  if (loading) {
    return <Spinner centered label="Loading milestones..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          &larr; Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">Capstone Progress</h1>
        <p className="text-sm text-slate-400 mb-6">
          Track your project milestones and deadlines
        </p>

        <div className="space-y-6">
          <ProgressBar milestones={milestones} />
          <AddMilestoneForm onAdd={handleAdd} busy={addBusy} />
          <MilestoneTimeline
            milestones={milestones}
            onStatusChange={handleStatusChange}
            onDelete={setDeleteId}
          />
          <IdeasBacklog
            ideas={ideas}
            onAdd={handleAddIdea}
            onPromote={handlePromoteIdea}
            onDelete={setDeleteId}
            addBusy={ideaBusy}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete this item?"
        description="This will permanently remove it."
        confirmLabel="Delete"
        busy={deleteBusy}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
