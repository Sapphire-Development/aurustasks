import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const getSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (mounted) {
				if (error) {
					console.error("Error fetching session:", error);
				}
				setUser(session?.user ?? null);
				setLoading(false);
			}
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (mounted) {
				setUser(session?.user ?? null);
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	return { user, loading };
}
