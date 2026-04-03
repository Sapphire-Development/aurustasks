import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { TasksTable } from "../tasks/TasksTable";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { EditTaskModal } from "../tasks/EditTaskModal";
import { taskService, type Task } from "@/services/tasks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingProfile } from "../auth/OnboardingProfile";

export function DashboardContent({
	filter = "all",
}: {
	filter?: "all" | "me";
}) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
	const [loading, setLoading] = useState(true);
	const { user, loading: authLoading } = useAuth();

	const fetchTasks = useCallback(
		async (showSkeleton = false) => {
			if (showSkeleton) setLoading(true);
			try {
				const targetUserId = filter === "me" && user ? user.id : undefined;
				const data = await taskService.getTasks(targetUserId);
				setTasks(data);

				if (data) {
					setTaskToEdit((current) => {
						if (!current) return null;
						return data.find((t) => t.id === current.id) || null;
					});
				}
			} catch (e: any) {
				toast.error("Error al cargar las tareas.");
			} finally {
				setLoading(false);
			}
		},
		[filter, user],
	);

	const handleSilentRefresh = () => fetchTasks(false);

	useEffect(() => {
		if (!authLoading) {
			fetchTasks(true);
		}
	}, [authLoading, fetchTasks]);

	if (authLoading) return <div className="min-h-screen bg-muted/20" />;

	if (user && !user.user_metadata?.display_name) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
				<OnboardingProfile onComplete={() => window.location.reload()} />
			</div>
		);
	}

	return (
		<DashboardLayout>
			<div className="flex items-center justify-between space-y-2 mb-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						¡Bienvenido de vuelta!
					</h2>
					<p className="text-muted-foreground">
						{filter === "all"
							? "Aquí tienes la lista de tareas del equipo."
							: "Aquí tienes tu lista de tareas."}
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<CreateTaskModal onTaskCreated={handleSilentRefresh} />
				</div>
			</div>

			{loading ? (
				<div className="space-y-4">
					<div className="h-10 w-full animate-pulse bg-muted rounded"></div>
					<div className="h-10 w-full animate-pulse bg-muted rounded"></div>
					<div className="h-10 w-full animate-pulse bg-muted rounded"></div>
				</div>
			) : (
				<>
					<TasksTable
						tasks={tasks}
						onTaskUpdated={handleSilentRefresh}
						showAuthor={filter === "all"}
						onEditTask={setTaskToEdit}
					/>
					<EditTaskModal
						task={taskToEdit}
						open={!!taskToEdit}
						onOpenChange={(open) => !open && setTaskToEdit(null)}
						onTaskUpdated={handleSilentRefresh}
					/>
				</>
			)}
		</DashboardLayout>
	);
}
