import {
	CheckSquare,
	LayoutDashboard,
	ListTodo,
	Settings,
	LogOut,
	Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

const items = [
	{
		title: "Tablero",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Mis Tareas",
		url: "/my-tasks",
		icon: ListTodo,
	},
	{
		title: "Ajustes",
		url: "/settings",
		icon: Settings,
	},
];

export function AppNavbar() {
	const { user } = useAuth();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = "/login";
	};

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			<Sheet>
				<SheetTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden shrink-0"
						/>
					}
				>
					<Menu className="h-6 w-6" />
					<span className="sr-only">Toggle navigation menu</span>
				</SheetTrigger>
				<SheetContent
					side="left"
					className="flex flex-col w-[250px] sm:w-[300px]"
				>
					<SheetHeader className="pb-4 border-b text-left">
						<SheetTitle className="flex items-center gap-2">
							<span className="font-bold">AurusTasks</span>
						</SheetTitle>
					</SheetHeader>
					<nav className="grid gap-2 text-lg font-medium mt-4">
						{items.map((item) => (
							<a
								key={item.title}
								href={item.url}
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
							>
								<item.icon className="h-5 w-5" />
								{item.title}
							</a>
						))}
					</nav>
				</SheetContent>
			</Sheet>

			<a
				href="/dashboard"
				className="hidden md:flex items-center gap-2 font-bold text-xl mr-6 tracking-tight transition-colors hover:opacity-80"
			>
				AurusTasks
			</a>

			<nav className="hidden md:flex gap-6 text-sm font-medium flex-1">
				{items.map((item) => (
					<a
						key={item.title}
						href={item.url}
						className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted px-3 py-2 rounded-md"
					>
						<item.icon className="h-4 w-4" />
						{item.title}
					</a>
				))}
			</nav>

			<div className="flex items-center gap-4 ml-auto md:gap-2 lg:gap-4 flex-1 justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full h-9 w-9 border ring-1 ring-border shadow-sm"
							/>
						}
					>
						<Avatar className="h-9 w-9">
							<AvatarImage
								src={user?.user_metadata?.avatar_url || ""}
								className="object-cover"
							/>
							<AvatarFallback className="bg-primary/10 text-primary font-medium">
								{user?.user_metadata?.display_name
									? user.user_metadata.display_name.charAt(0).toUpperCase()
									: (user?.email || "U").charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="sr-only">Toggle user menu</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 mt-2">
						<div className="px-2 py-1.5 font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">
									{user?.user_metadata?.display_name ||
										user?.email ||
										"Cargando..."}
								</p>
								<p className="text-xs text-muted-foreground">{user?.email}</p>
							</div>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="text-destructive cursor-pointer"
						>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Cerrar Sesión</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
