import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { taskService, type Task, type Subtask } from "@/services/tasks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_TAGS = ["Bug", "Feature", "Mejora", "Urgente", "Refactor"];

interface EditTaskModalProps {
	task: Task | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onTaskUpdated: () => void;
}

export function EditTaskModal({
	task,
	open,
	onOpenChange,
	onTaskUpdated,
}: EditTaskModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [customTag, setCustomTag] = useState("");
	const [subtasks, setSubtasks] = useState<Subtask[]>([]);
	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDescription(task.description || "");
			setSelectedTags(task.tags || []);
			setSubtasks(task.subtasks || []);
		}
	}, [task]);

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!task) return;
		if (!title.trim()) return;

		setLoading(true);

		try {
			await taskService.updateTask(task.id, title, description, selectedTags);
			toast.success("Tarea actualizada exitosamente");
			onOpenChange(false);
			onTaskUpdated();
		} catch {
			toast.error("Hubo un error al actualizar la tarea.");
		} finally {
			setLoading(false);
		}
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const addCustomTag = () => {
		if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
			setSelectedTags((prev) => [...prev, customTag.trim()]);
			setCustomTag("");
		}
	};

	const handleAddSubtask = async () => {
		if (!task || !newSubtaskTitle.trim()) return;
		try {
			const newSubtask = await taskService.addSubtask(
				task.id,
				newSubtaskTitle.trim(),
			);
			if (newSubtask) {
				setSubtasks((prev) => [...prev, newSubtask]);
				setNewSubtaskTitle("");
				onTaskUpdated();
			}
		} catch {
			toast.error("Error al añadir subtarea");
		}
	};

	const handleToggleSubtask = async (subtask: Subtask) => {
		try {
			const newStatus = !subtask.is_completed;
			await taskService.toggleSubtask(subtask.id, newStatus);
			setSubtasks((prev) =>
				prev.map((s) =>
					s.id === subtask.id ? { ...s, is_completed: newStatus } : s,
				),
			);
			onTaskUpdated();
		} catch {
			toast.error("Error al actualizar subtarea");
		}
	};

	const handleDeleteSubtask = async (id: string) => {
		try {
			await taskService.deleteSubtask(id);
			setSubtasks((prev) => prev.filter((s) => s.id !== id));
			onTaskUpdated();
		} catch {
			toast.error("Error al eliminar subtarea");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[900px] gap-0 p-0 overflow-hidden">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle className="text-2xl">Gestión de Tarea</DialogTitle>
					<DialogDescription>
						Administra los detalles y subtareas de forma centralizada.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleUpdate} className="flex flex-col h-full">
					<div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x h-full max-h-[70vh] overflow-hidden">
						<div className="p-6 space-y-6 overflow-y-auto">
							<div className="space-y-4">
								<div className="grid gap-2">
									<Label htmlFor="edit-title" className="text-sm font-semibold">
										Título de la Tarea
									</Label>
									<Input
										id="edit-title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Ej: Revisar el servidor de Minecraft"
										className="bg-muted/30 focus-visible:ring-primary"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label
										htmlFor="edit-description"
										className="text-sm font-semibold"
									>
										Descripción
									</Label>
									<Input
										id="edit-description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Añade más detalles..."
										className="bg-muted/30 focus-visible:ring-primary"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label className="text-sm font-semibold">Etiquetas</Label>
								<div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-muted/20 border rounded-md">
									{[...new Set([...AVAILABLE_TAGS, ...selectedTags])].map(
										(tag) => (
											<Badge
												key={tag}
												variant={
													selectedTags.includes(tag) ? "default" : "outline"
												}
												className={cn(
													"cursor-pointer transition-all hover:scale-105 px-2 py-0.5 text-[11px]",
													selectedTags.includes(tag)
														? "shadow-sm"
														: "opacity-70 hover:opacity-100",
												)}
												onClick={() => toggleTag(tag)}
											>
												{tag}
												{selectedTags.includes(tag) && (
													<Check className="ml-1 h-3 w-3" />
												)}
											</Badge>
										),
									)}
								</div>
								<div className="flex gap-2">
									<Input
										value={customTag}
										onChange={(e) => setCustomTag(e.target.value)}
										placeholder="Nueva etiqueta..."
										className="h-8 text-xs bg-muted/30"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addCustomTag();
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-8 px-3 text-xs"
										onClick={addCustomTag}
									>
										Añadir
									</Button>
								</div>
							</div>
						</div>

						<div className="p-6 bg-muted/5 flex flex-col h-full overflow-hidden">
							<div className="flex items-center justify-between mb-4">
								<Label className="text-base font-bold flex items-center gap-2">
									Subtareas
									<Badge
										variant="secondary"
										className="rounded-full px-2 py-0 h-5"
									>
										{subtasks.filter((s) => s.is_completed).length}/
										{subtasks.length}
									</Badge>
								</Label>
							</div>

							<div className="flex gap-2 mb-4">
								<Input
									value={newSubtaskTitle}
									onChange={(e) => setNewSubtaskTitle(e.target.value)}
									placeholder="Tarea secundaria..."
									className="bg-background shadow-sm"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddSubtask();
										}
									}}
								/>
								<Button
									type="button"
									size="icon"
									variant="default"
									className="shrink-0 shadow-md"
									onClick={handleAddSubtask}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>

							<div className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
								{subtasks.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-background/50 mt-2">
										<Plus className="h-8 w-8 mb-2 opacity-20" />
										<p className="text-xs italic">No hay subtareas aún.</p>
									</div>
								) : (
									subtasks.map((subtask) => (
										<div
											key={subtask.id}
											className={cn(
												"flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group relative",
												subtask.is_completed
													? "bg-muted/30 border-transparent"
													: "bg-background border-border/50 shadow-sm hover:border-primary/30",
											)}
										>
											<Checkbox
												checked={subtask.is_completed}
												onCheckedChange={() => handleToggleSubtask(subtask)}
												className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
											/>
											<span
												className={cn(
													"flex-1 text-sm font-medium transition-all duration-200 truncate pr-8",
													subtask.is_completed
														? "line-through text-muted-foreground/60"
														: "text-foreground",
												)}
											>
												{subtask.title}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-7 w-7 absolute right-2 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
												onClick={() => handleDeleteSubtask(subtask.id)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									))
								)}
							</div>
						</div>
					</div>

					<div className="p-4 border-t bg-muted/10 flex justify-end">
						<Button
							type="submit"
							disabled={loading}
							className="w-full md:w-auto shadow-lg px-8"
						>
							{loading ? "Guardando..." : "Guardar Cambios"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
