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

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success("¡Bienvenido/a de vuelta!");
			window.location.href = "/dashboard";
		}

		setLoading(false);
	};

	return (
		<Card className="w-full max-w-sm mx-auto shadow-lg border-muted">
			<CardHeader>
				<CardTitle className="text-2xl text-center">Inicia sesión</CardTitle>
				<CardDescription className="text-center">
					Ingresa tus credenciales para continuar.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleLogin}>
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
						{loading ? "Cargando..." : "Entrar al Dashboard"}
					</Button>
					<p className="text-sm text-center text-muted-foreground w-full">
						¿No tienes cuenta?{" "}
						<a href="/register" className="text-primary hover:underline">
							Regístrate
						</a>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
