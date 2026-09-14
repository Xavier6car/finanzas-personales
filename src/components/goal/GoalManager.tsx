"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { GoalForm, type GoalFormValues } from "@/components/goal/GoalForm";
import { ContributionForm } from "@/components/goal/ContributionForm";
import { deleteGoal, deleteContribution } from "@/actions/goal";
import { formatDate, formatDateInput, formatMoney, formatPercent } from "@/lib/format";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

interface Contribution {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  note: string | null;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: Date | null;
  icon: string;
  contributions: Contribution[];
}

export function GoalManager({
  users,
  currentUserId,
  goals,
}: {
  users: UserOption[];
  currentUserId: string;
  goals: Goal[];
}) {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalFormValues | undefined>();
  const [contributingTo, setContributingTo] = useState<string | null>(null);

  function userOf(id: string) {
    return users.find((u) => u.id === id);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Metas de ahorro</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingGoal(undefined);
            setGoalModalOpen(true);
          }}
        >
          + Nueva meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-6 text-center text-sm text-[var(--text-secondary)]">
          Aún no han creado metas de ahorro. ¡Empiecen con el fondo de emergencia! 🧯
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const accumulated = goal.contributions.reduce((a, c) => a + c.amount, 0);
            const percent = goal.targetAmount > 0 ? Math.min(100, (accumulated / goal.targetAmount) * 100) : 0;
            const remaining = Math.max(0, goal.targetAmount - accumulated);
            const perPerson = users.map((u) => ({
              user: u,
              total: goal.contributions.filter((c) => c.userId === u.id).reduce((a, c) => a + c.amount, 0),
            }));

            return (
              <div key={goal.id} className="card p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{goal.name}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-[var(--text-muted)]">Meta: {formatDate(goal.targetDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      className="btn btn-ghost !px-2 !py-1 text-xs"
                      onClick={() => {
                        setEditingGoal({
                          id: goal.id,
                          name: goal.name,
                          targetAmount: goal.targetAmount,
                          targetDate: goal.targetDate ? formatDateInput(goal.targetDate) : "",
                          icon: goal.icon,
                        });
                        setGoalModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <ConfirmButton onConfirm={() => deleteGoal(goal.id)} />
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {formatMoney(accumulated)} <span className="font-normal text-[var(--text-muted)]">de {formatMoney(goal.targetAmount)}</span>
                  </span>
                  <span className="font-semibold text-brand">{formatPercent(percent)}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {remaining > 0 ? `Faltan ${formatMoney(remaining)} para alcanzarla.` : "¡Meta alcanzada! 🎉"}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {perPerson.map(({ user, total }) => (
                    <span key={user.id} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: user.color }} />
                      {user.name}: <span className="font-semibold">{formatMoney(total)}</span>
                    </span>
                  ))}
                </div>

                <button
                  className="btn btn-secondary mt-3 w-full"
                  onClick={() => setContributingTo(goal.id)}
                >
                  + Registrar aporte
                </button>

                {goal.contributions.length > 0 && (
                  <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto scrollbar-thin text-xs">
                    {[...goal.contributions]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2 text-[var(--text-secondary)]">
                          <span className="truncate">
                            {formatDate(c.date)} · {userOf(c.userId)?.name} {c.note ? `· ${c.note}` : ""}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="font-medium">{formatMoney(c.amount)}</span>
                            <ConfirmButton onConfirm={() => deleteContribution(c.id)} label="✕" />
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={editingGoal ? "Editar meta" : "Nueva meta de ahorro"}>
        <GoalForm initial={editingGoal} onSaved={() => setGoalModalOpen(false)} />
      </Modal>

      <Modal open={!!contributingTo} onClose={() => setContributingTo(null)} title="Registrar aporte">
        {contributingTo && (
          <ContributionForm
            goalId={contributingTo}
            users={users}
            currentUserId={currentUserId}
            onSaved={() => setContributingTo(null)}
          />
        )}
      </Modal>
    </div>
  );
}
