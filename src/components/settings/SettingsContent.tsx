import { useState, useEffect } from "react";
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Lock, User as UserIcon } from "lucide-react";

export function SettingsContent() {
	const { user, loading: authLoading } = useAuth();

	const [displayName, setDisplayName] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [savingProfile, setSavingProfile] = useState(false);

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);

	useEffect(() => {
		if (user && user.user_metadata) {
			setDisplayName(user.user_metadata.display_name || "");
			if (user.user_metadata.avatar_url) {
				setAvatarPreview(user.user_metadata.avatar_url);
			}
		}
	}, [user]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setAvatarFile(file);
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	const handleSaveProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!displayName.trim())
			return toast.error("El nombre no puede estar vacío.");
		if (!user) return toast.error("No estás autenticado.");

		setSavingProfile(true);

		try {
			let avatarUrl = user.user_metadata?.avatar_url || "";

			if (avatarFile) {
				const fileExt = avatarFile.name.split(".").pop();
				const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
				const filePath = `${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("avatars")
					.upload(filePath, avatarFile);

				if (uploadError)
					throw new Error("Error al subir imagen: " + uploadError.message);

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

			if (updateError) throw new Error("Error: " + updateError.message);

			toast.success("Perfil actualizado con éxito.");
			setAvatarFile(null);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setSavingProfile(false);
		}
	};

	const handleSavePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			return toast.error("Las contraseñas no coinciden.");
		}
		if (newPassword.length < 6) {
			return toast.error("La contraseña debe tener al menos 6 caracteres.");
		}

		setSavingPassword(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error)
				throw new Error("Error al cambiar contraseña: " + error.message);

			toast.success("Contraseña actualizada con éxito.");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setSavingPassword(false);
		}
	};

	if (authLoading) {
		return (
			<DashboardLayout>
				<div className="flex h-64 items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="mb-8">
				<h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
				<p className="text-muted-foreground mt-2">
					Gestiona tu cuenta, actualiza tu perfil y cambia tu contraseña.
				</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				<Card className="shadow-sm border-muted">
					<CardHeader>
						<div className="flex items-center gap-2">
							<UserIcon className="h-5 w-5 text-primary" />
							<CardTitle>Tu Perfil</CardTitle>
						</div>
						<CardDescription>
							Actualiza tu foto y como te ven los demás.
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSaveProfile}>
						<CardContent className="space-y-6 mb-4">
							<div className="flex flex-col items-center">
								<div className="relative group cursor-pointer h-24 w-24 rounded-full">
									<Avatar className="h-full w-full ring-4 ring-muted shadow-sm transition-transform hover:scale-105">
										<AvatarImage
											src={avatarPreview || ""}
											className="object-cover"
										/>
										<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase transition-all">
											{displayName ? (
												displayName.charAt(0)
											) : (
												<Camera className="h-8 w-8 text-muted-foreground" />
											)}
										</AvatarFallback>
									</Avatar>
									<label
										htmlFor="settings-avatar-upload"
										className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer overflow-hidden z-10 backdrop-blur-sm"
									>
										<Camera className="w-8 h-8 transform group-hover:scale-110 transition-transform" />
									</label>
									<input
										id="settings-avatar-upload"
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleAvatarChange}
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-3">
									Haz clic en la foto para cambiarla
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="displayName">Nombre a mostrar</Label>
								<Input
									id="displayName"
									value={displayName}
									onChange={(e) => setDisplayName(e.target.value)}
									placeholder="Ej. Juan Pérez"
									required
								/>
							</div>
						</CardContent>
						<CardFooter>
							<Button type="submit" disabled={savingProfile} className="w-full">
								{savingProfile ? "Guardando cambios..." : "Guardar Perfil"}
							</Button>
						</CardFooter>
					</form>
				</Card>

				<Card className="shadow-sm border-muted h-fit">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Lock className="h-5 w-5 text-primary" />
							<CardTitle>Seguridad</CardTitle>
						</div>
						<CardDescription>
							Cambia tu contraseña para mantener tu cuenta segura.
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSavePassword}>
						<CardContent className="space-y-4 mb-4">
							<div className="space-y-2">
								<Label htmlFor="newPassword">Nueva contraseña</Label>
								<Input
									id="newPassword"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Mínimo 6 caracteres"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									Confirmar nueva contraseña
								</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Vuelve a escribir la contraseña"
									required
								/>
							</div>
						</CardContent>
						<CardFooter mt-4>
							<Button
								type="submit"
								disabled={savingPassword}
								variant="secondary"
								className="w-full"
							>
								{savingPassword
									? "Actualizando seguridad..."
									: "Actualizar Contraseña"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</DashboardLayout>
	);
}
