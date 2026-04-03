import { useEffect } from "react";
import { AppNavbar } from "./AppNavbar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const { user, loading } = useAuth();

	useEffect(() => {
		if (!loading && !user) {
			window.location.href = "/login";
		}
	}, [user, loading]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen w-full bg-background">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="flex min-h-screen w-full flex-col bg-muted/20">
			<AppNavbar />
			<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
				<div className="mx-auto w-full max-w-6xl">{children}</div>
			</main>
		</div>
	);
}
