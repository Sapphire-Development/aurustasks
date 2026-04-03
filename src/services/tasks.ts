import { supabase } from "../lib/supabase";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Subtask {
	id: string;
	task_id: string;
	title: string;
	is_completed: boolean;
	created_at: string;
}

export interface Task {
	id: string;
	created_at: string;
	title: string;
	description: string;
	status: TaskStatus;
	user_id: string;
	author_name: string;
	tags?: string[];
	subtasks?: Subtask[];
}

export const taskService = {
	async getTasks(userId?: string): Promise<Task[]> {
		let query = supabase
			.from("tasks")
			.select("*, subtasks(*)")
			.order("created_at", { ascending: false });

		if (userId) {
			query = query.eq("user_id", userId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching tasks:", error);
			throw error;
		}

		return data || [];
	},

	async addTask(
		title: string,
		description: string,
		userId: string,
		authorName: string,
		tags: string[] = [],
	): Promise<Task | null> {
		const { data, error } = await supabase
			.from("tasks")
			.insert([
				{
					title,
					description,
					status: "todo",
					user_id: userId,
					author_name: authorName,
					tags,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error adding task:", error);
			throw error;
		}

		return data;
	},

	async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
		const { data, error } = await supabase
			.from("tasks")
			.update({ status })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating task status:", error);
			throw error;
		}

		return data;
	},

	async updateTask(
		id: string,
		title: string,
		description: string,
		tags: string[],
	): Promise<Task | null> {
		const { data, error } = await supabase
			.from("tasks")
			.update({ title, description, tags })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating task:", error);
			throw error;
		}

		return data;
	},

	async deleteTask(id: string): Promise<void> {
		const { error } = await supabase.from("tasks").delete().eq("id", id);

		if (error) {
			console.error("Error deleting task:", error);
			throw error;
		}
	},

	async addSubtask(taskId: string, title: string): Promise<Subtask | null> {
		const { data, error } = await supabase
			.from("subtasks")
			.insert([{ task_id: taskId, title, is_completed: false }])
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async toggleSubtask(id: string, isCompleted: boolean): Promise<void> {
		const { error } = await supabase
			.from("subtasks")
			.update({ is_completed: isCompleted })
			.eq("id", id);

		if (error) throw error;
	},

	async updateSubtaskTitle(id: string, title: string): Promise<void> {
		const { error } = await supabase
			.from("subtasks")
			.update({ title })
			.eq("id", id);

		if (error) throw error;
	},

	async deleteSubtask(id: string): Promise<void> {
		const { error } = await supabase.from("subtasks").delete().eq("id", id);

		if (error) throw error;
	},
};
