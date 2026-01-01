"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch by only rendering after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button aria-label="Toggle theme" disabled size="icon-sm" variant="ghost">
				<Sun className="size-4" />
			</Button>
		);
	}

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<Button
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={toggleTheme}
			size="icon-sm"
			variant="ghost"
		>
			{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}
