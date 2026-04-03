import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { taskService } from "@/services/tasks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_TAGS = ["Bug", "Feature", "Mejora", "Urgente", "Refactor"];

export function CreateTaskModal({
	onTaskCreated,
}: {
	onTaskCreated: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [customTag, setCustomTag] = useState("");
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		if (!user) return toast.error("No estás autenticado.");

		setLoading(true);

		try {
			await taskService.addTask(
				title,
				description,
				user.id,
				user.user_metadata?.display_name || user.email || "Usuario",
				selectedTags,
			);
			toast.success("Tarea creada exitosamente");
			setOpen(false);
			setTitle("");
			setDescription("");
			setSelectedTags([]);
			onTaskCreated();
		} catch (e: any) {
			toast.error("Hubo un error al crear la tarea.");
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Nueva Tarea
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Añadir nueva tarea</DialogTitle>
					<DialogDescription>
						Crea una nueva tarea para tu lista.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleCreate}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Título</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Ej: Revisar el servidor de Minecraft"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Descripción (opcional)</Label>
							<Input
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Más detalles de la tarea..."
							/>
						</div>
						<div className="grid gap-2">
							<Label>Etiquetas</Label>
							<div className="flex flex-wrap gap-2">
								{[...new Set([...AVAILABLE_TAGS, ...selectedTags])].map(
									(tag) => (
										<Badge
											key={tag}
											variant={
												selectedTags.includes(tag) ? "default" : "outline"
											}
											className="cursor-pointer"
											onClick={() => toggleTag(tag)}
										>
											{tag}
										</Badge>
									),
								)}
							</div>
							<div className="flex gap-2 mt-2">
								<Input
									value={customTag}
									onChange={(e) => setCustomTag(e.target.value)}
									placeholder="Nueva etiqueta..."
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
									onClick={addCustomTag}
								>
									Añadir
								</Button>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Guardando..." : "Guardar Tarea"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
