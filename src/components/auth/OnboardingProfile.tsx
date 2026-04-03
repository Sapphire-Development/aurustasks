import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function OnboardingProfile({ onComplete }: { onComplete: () => void }) {
	const [displayName, setDisplayName] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setAvatarFile(file);
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!displayName.trim()) {
			return toast.error("Por favor ingresa un nombre a mostrar.");
		}

		setLoading(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("No estás autenticado");

			let avatarUrl = "";

			if (avatarFile) {
				const fileExt = avatarFile.name.split(".").pop();
				const fileName = `${user.id}-${Math.random()}.${fileExt}`;
				const filePath = `${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("avatars")
					.upload(filePath, avatarFile);

				if (uploadError) {
					throw new Error("Error al subir el avatar: " + uploadError.message);
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from("avatars").getPublicUrl(filePath);

				avatarUrl = publicUrl;
			}

			const { error: updateError } = await supabase.auth.updateUser({
				data: {
					display_name: displayName,
					...(avatarUrl && { avatar_url: avatarUrl }),
				},
			});

			if (updateError)
				throw new Error("Error al actualizar perfil: " + updateError.message);

			toast.success("¡Perfil configurado con éxito!");

			onComplete();
		} catch (e: any) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md shadow-lg border-muted">
			<div className="absolute top-4 right-4 animate-bounce text-muted-foreground/30 hidden">
				Onboarding Wizard Active
			</div>
			<CardHeader>
				<CardTitle className="text-2xl text-center">
					Completa tu perfil
				</CardTitle>
				<CardDescription className="text-center">
					Antes de empezar, dinos cómo quieres que te llamen.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSave}>
				<CardContent className="space-y-6 mb-4 flex flex-col items-center">
					<div className="relative group cursor-pointer h-24 w-24 rounded-full">
						<Avatar className="h-full w-full ring-4 ring-muted shadow-sm transition-transform hover:scale-105">
							<AvatarImage src={avatarPreview || ""} className="object-cover" />
							<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase transition-all">
								{displayName ? (
									displayName.charAt(0)
								) : (
									<Camera className="h-8 w-8 text-muted-foreground" />
								)}
							</AvatarFallback>
						</Avatar>
						<label
							htmlFor="avatar-upload"
							className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer overflow-hidden z-10 backdrop-blur-sm"
						>
							<Camera className="w-8 h-8 transform group-hover:scale-110 transition-transform" />
						</label>
						<input
							id="avatar-upload"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleAvatarChange}
						/>
					</div>
					<p className="text-xs text-muted-foreground text-center w-full">
						Haz clic en la imagen para subir tu foto
					</p>

					<div className="space-y-2 w-full mt-2">
						<Label htmlFor="display_name" className="ml-1">
							Nombre para mostrar
						</Label>
						<Input
							id="display_name"
							placeholder="Ej. Juan Pérez"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							required
							className="font-medium text-lg leading-loose h-12 px-4 shadow-sm"
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Guardando..." : "Guardar Perfil y Continuar"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
