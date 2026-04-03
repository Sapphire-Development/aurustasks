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
import { toast } from "sonner";

export function RegisterForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			if (
				error.status === 429 ||
				error.message?.includes("rate limit") ||
				error.message?.includes("Too Many Requests")
			) {
				toast.error(
					"Por motivos de seguridad, has superado el límite de registros. Por favor, inténtalo de nuevo en unos minutos.",
				);
			} else {
				toast.error("Error al registrar: " + error.message);
			}
		} else {
			window.location.href = "/login";
		}

		setLoading(false);
	};

	return (
		<Card className="w-full max-w-sm mx-auto shadow-lg border-muted">
			<CardHeader>
				<CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
				<CardDescription className="text-center">
					Regístrate para gestionar tus tareas.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleRegister}>
				<CardContent className="space-y-4 mb-4">
					<div className="space-y-2">
						<Label htmlFor="email">Correo electrónico</Label>
						<Input
							id="email"
							type="email"
							placeholder="tu@correo.com"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Button type="submit" className="w-full font-bold" disabled={loading}>
						{loading ? "Registrando..." : "Registrarse gratis"}
					</Button>
					<p className="text-sm text-center text-muted-foreground w-full">
						¿Ya tienes cuenta?{" "}
						<a href="/login" className="text-primary hover:underline">
							Inicia sesión
						</a>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
