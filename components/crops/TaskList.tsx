"use client"

import { useMemo, useState, useTransition } from "react"

import { completeTask, deleteTask, skipTask } from "@/app/(app)/crops/actions"
import { Button } from "@/components/ui/button"
import { TaskCheckbox } from "@/components/crops/TaskCheckbox"
import { Input } from "@/components/ui/input"
import type { CropCycleTasksRow } from "@/lib/types/database.types"

type Props = {
  tasks: CropCycleTasksRow[]
  cycleId: string
}

type FormState = {
  error?: string
}

export function TaskList({ tasks, cycleId }: Props) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().split("T")[0]

  const groups = useMemo(() => {
    const overdue: CropCycleTasksRow[] = []
    const thisWeek: CropCycleTasksRow[] = []
    const upcoming: CropCycleTasksRow[] = []
    const completed: CropCycleTasksRow[] = []
    const skipped: CropCycleTasksRow[] = []

    const oneWeekAhead = (() => {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      return d.toISOString().split("T")[0]
    })()

    tasks
      .slice()
      .sort((a, b) => {
        const da = a.scheduled_date ?? ""
        const db = b.scheduled_date ?? ""
        return da.localeCompare(db)
      })
      .forEach((t) => {
        if (t.status === "done") {
          completed.push(t)
        } else if (t.status === "skipped") {
          skipped.push(t)
        } else if (t.status === "pending") {
          if (t.scheduled_date && t.scheduled_date < today) {
            overdue.push(t)
          } else if (
            t.scheduled_date &&
            t.scheduled_date >= today &&
            t.scheduled_date <= oneWeekAhead
          ) {
            thisWeek.push(t)
          } else {
            upcoming.push(t)
          }
        }
      })

    return { overdue, thisWeek, upcoming, completed, skipped }
  }, [tasks, today])

  function handleComplete(taskId: string, cost?: number) {
    setFormState({})
    startTransition(async () => {
      const result = await completeTask(taskId, cycleId, cost)
      if (result?.error) setFormState({ error: result.error })
    })
  }

  function handleSkip(taskId: string) {
    setFormState({})
    startTransition(async () => {
      const result = await skipTask(taskId)
      if (result?.error) setFormState({ error: result.error })
    })
  }

  function handleDelete(taskId: string) {
    if (!window.confirm("Delete this task?")) return
    setFormState({})
    startTransition(async () => {
      const result = await deleteTask(taskId)
      if (result?.error) setFormState({ error: result.error })
    })
  }

  return (
    <div className="space-y-3">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}

      <TaskGroup
        title="Overdue"
        highlight="red"
        tasks={groups.overdue}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onDelete={handleDelete}
        disabled={isPending}
      />
      <TaskGroup
        title="This week"
        highlight="orange"
        tasks={groups.thisWeek}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onDelete={handleDelete}
        disabled={isPending}
      />
      <TaskGroup
        title="Upcoming"
        highlight="gray"
        tasks={groups.upcoming}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onDelete={handleDelete}
        disabled={isPending}
      />
      <TaskGroup
        title="Completed"
        highlight="green"
        tasks={groups.completed}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onDelete={handleDelete}
        disabled={isPending}
        collapsible
        defaultCollapsed
      />
      <TaskGroup
        title="Skipped"
        highlight="gray"
        tasks={groups.skipped}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onDelete={handleDelete}
        disabled={isPending}
        collapsible
        defaultCollapsed
      />
    </div>
  )
}

type TaskGroupProps = {
  title: string
  highlight: "red" | "orange" | "gray" | "green"
  tasks: CropCycleTasksRow[]
  onComplete: (taskId: string, cost?: number) => void
  onSkip: (taskId: string) => void
  onDelete: (taskId: string) => void
  disabled: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
}

function TaskGroup({
  title,
  highlight,
  tasks,
  onComplete,
  onSkip,
  onDelete,
  disabled,
  collapsible,
  defaultCollapsed,
}: TaskGroupProps) {
  const [collapsed, setCollapsed] = useState(
    collapsible ? defaultCollapsed ?? false : false,
  )

  if (tasks.length === 0) return null

  const borderColor =
    highlight === "red"
      ? "border-red-200"
      : highlight === "orange"
        ? "border-orange-200"
        : highlight === "green"
          ? "border-green-200"
          : "border-gray-200"

  return (
    <div
      className={`rounded-xl border bg-white p-3 text-xs shadow-sm ${borderColor}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2"
        onClick={() => collapsible && setCollapsed((v) => !v)}
      >
        <span className="font-semibold text-gray-800">
          {title} ({tasks.length})
        </span>
        {collapsible && (
          <span className="text-[11px] text-gray-500">
            {collapsed ? "Show" : "Hide"}
          </span>
        )}
      </button>
      {!collapsed && (
        <div className="mt-2 space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={onComplete}
              onSkip={onSkip}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type TaskRowProps = {
  task: CropCycleTasksRow
  onComplete: (taskId: string, cost?: number) => void
  onSkip: (taskId: string) => void
  onDelete: (taskId: string) => void
  disabled: boolean
}

function TaskRow({
  task,
  onComplete,
  onSkip,
  onDelete,
  disabled,
}: TaskRowProps) {
  const [costInput, setCostInput] = useState<string>("")

  const icon = getIconForType(task.task_type ?? "")

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 p-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-base">{icon}</span>
        <div className="flex flex-col">
          <TaskCheckbox
            taskId={task.id}
            title={task.title}
            initialCompleted={task.status === "done"}
            onComplete={() => {
              onComplete(task.id)
            }}
          />
          <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
            {task.scheduled_date || "No date"} · Cost: ₹{task.cost ?? 0}
          </p>
        </div>
      </div>
      <div className="mt-1 flex flex-col items-stretch gap-1 md:mt-0 md:flex-row md:items-center">
        {task.status === "pending" && (
          <>
            <Input
              type="number"
              min={0}
              step={10}
              placeholder="Actual cost ₹"
              value={costInput}
              onChange={(e) => setCostInput(e.target.value)}
              className="h-7 text-[11px] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
            <Button
              type="button"
              size="xs"
              className="h-7 bg-green-700 text-[11px] text-white hover:bg-green-800"
              disabled={disabled}
              onClick={() =>
                onComplete(
                  task.id,
                  costInput ? parseFloat(costInput) : undefined,
                )
              }
            >
              Mark done
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              className="h-7 border-orange-200 text-[11px] text-orange-700 hover:bg-orange-50"
              disabled={disabled}
              onClick={() => onSkip(task.id)}
            >
              Skip
            </Button>
          </>
        )}
        {task.status !== "pending" && (
          <span className="text-[11px] text-gray-500">
            {task.status === "done"
              ? `Done on ${task.completed_date ?? "—"}`
              : "Skipped"}
          </span>
        )}
        <Button
          type="button"
          size="xs"
          variant="outline"
          className="h-7 border-red-200 text-[11px] text-red-700 hover:bg-red-50"
          disabled={disabled}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

function getIconForType(type: string) {
  const t = type.toLowerCase()
  if (t === "irrigation") return "💧"
  if (t === "sowing") return "🌱"
  if (t === "spraying") return "💊"
  if (t === "fertilizing") return "⚗️"
  if (t === "harvesting") return "🌾"
  return "📋"
}

