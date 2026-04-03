import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type Task, taskService, type TaskStatus } from "@/services/tasks";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	MoreHorizontal,
	Trash2,
	CheckCircle,
	Clock,
	Circle,
	Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

const getTagVariant = (tag: string) => {
	const lowerTag = tag.toLowerCase();
	if (lowerTag === "urgente") return "destructive";
	if (lowerTag === "bug") return "destructive";
	if (lowerTag === "feature") return "default";
	if (lowerTag === "mejora") return "secondary";
	return "outline";
};

interface TasksTableProps {
	tasks: Task[];
	onTaskUpdated: () => void;
	showAuthor?: boolean;
	onEditTask: (task: Task) => void;
}

const StatusIcon = ({ status }: { status: TaskStatus }) => {
	if (status === "done")
		return <CheckCircle className="w-4 h-4 text-green-500" />;
	if (status === "in_progress")
		return <Clock className="w-4 h-4 text-blue-500" />;
	return <Circle className="w-4 h-4 text-gray-400" />;
};

export function TasksTable({
	tasks,
	onTaskUpdated,
	showAuthor = false,
	onEditTask,
}: TasksTableProps) {
	const handleDelete = async (id: string) => {
		try {
			await taskService.deleteTask(id);
			toast.success("Tarea eliminada");
			onTaskUpdated();
		} catch (e: any) {
			toast.error("Error al eliminar la tarea");
		}
	};

	const handleUpdateStatus = async (id: string, newStatus: TaskStatus) => {
		try {
			await taskService.updateTaskStatus(id, newStatus);
			toast.success("Estado actualizado");
			onTaskUpdated();
		} catch (e: any) {
			toast.error("Error al actualizar la tarea");
		}
	};

	if (tasks.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border rounded-lg h-64">
				<CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium">No hay tareas</h3>
				<p className="text-sm text-muted-foreground mt-1">
					{showAuthor ? "El equipo está al día." : "Estás al día."} ¡Crea una
					nueva tarea para empezar!
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[300px]">Título</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead className="text-right">Fecha de Creación</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{tasks.map((task) => {
						const completedSubtasks =
							task.subtasks?.filter((s) => s.is_completed).length || 0;
						const totalSubtasks = task.subtasks?.length || 0;

						return (
							<TableRow
								key={task.id}
								className="cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => onEditTask(task)}
							>
								<TableCell className="font-medium">
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-2">
											<StatusIcon status={task.status} />
											<span
												className={
													task.status === "done"
														? "line-through text-muted-foreground"
														: ""
												}
											>
												{task.title}
											</span>
										</div>
										{showAuthor && task.author_name && (
											<span className="text-xs text-muted-foreground ml-6">
												Por: {task.author_name}
											</span>
										)}
										{task.tags && task.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 ml-6 mt-1">
												{task.tags.map((tag) => (
													<Badge
														key={tag}
														variant={getTagVariant(tag)}
														className="text-[10px] h-4 px-1"
													>
														{tag}
													</Badge>
												))}
											</div>
										)}
										{totalSubtasks > 0 && (
											<div className="flex items-center gap-2 ml-6 mt-2">
												<div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
													<div
														className="h-full bg-primary transition-all duration-500"
														style={{
															width: `${(completedSubtasks / totalSubtasks) * 100}%`,
														}}
													/>
												</div>
												<span className="text-[10px] text-muted-foreground font-medium">
													{completedSubtasks}/{totalSubtasks}
												</span>
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg w-max border border-border/50">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleUpdateStatus(task.id, "todo");
											}}
											className={cn(
												"px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
												task.status === "todo"
													? "bg-background shadow-sm text-foreground"
													: "text-muted-foreground hover:text-foreground hover:bg-background/50",
											)}
										>
											Pendiente
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleUpdateStatus(task.id, "in_progress");
											}}
											className={cn(
												"px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
												task.status === "in_progress"
													? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm"
													: "text-muted-foreground hover:text-foreground hover:bg-background/50",
											)}
										>
											En Curso
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleUpdateStatus(task.id, "done");
											}}
											className={cn(
												"px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
												task.status === "done"
													? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 shadow-sm"
													: "text-muted-foreground hover:text-foreground hover:bg-background/50",
											)}
										>
											Terminada
										</button>
									</div>
								</TableCell>
								<TableCell className="max-w-[300px] truncate text-muted-foreground">
									{task.description || "-"}
								</TableCell>
								<TableCell className="text-right text-muted-foreground text-sm">
									{format(new Date(task.created_at), "d MMM, yyyy", {
										locale: es,
									})}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0"
												onClick={(e) => e.stopPropagation()}
											>
												<span className="sr-only">Abrir menú</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onEditTask(task);
												}}
											>
												<Pencil className="mr-2 h-4 w-4" />
												Editar
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(task.id);
												}}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Eliminar
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
