import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";

// Mock Next.js Link
vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

// Mock auth server utilities
vi.mock("@/server/better-auth/server", () => ({
	getSession: vi.fn(),
}));

// Mock database
vi.mock("@/server/db", () => ({
	db: {
		select: vi.fn(),
	},
}));

// Mock child components
vi.mock("../search-trigger", () => ({
	SearchTrigger: () => <div data-testid="search-trigger">Search</div>,
}));

vi.mock("../theme-toggle", () => ({
	ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock("../user-dropdown", () => ({
	UserDropdown: ({
		session,
		userRole,
	}: {
		session: unknown;
		userRole: string;
	}) => (
		<div data-role={userRole} data-testid="user-dropdown">
			User
		</div>
	),
}));

// Import after mocks
import { getSession } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { AppHeader } from "../app-header";

describe("AppHeader", () => {
	const mockSession = {
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
		},
		session: {
			id: "session-1",
			userId: "user-1",
			expiresAt: new Date(),
			token: "token",
		},
	};

	beforeEach(() => {
		vi.mocked(getSession).mockClear();
		vi.mocked(db.select).mockClear();
	});

	describe("Free user", () => {
		it("should display Free badge in header", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "free" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.getByText("Free")).toBeInTheDocument();
		});

		it("should use free variant for Free badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "free" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			const freeBadge = screen.getByText("Free").closest("span");
			expect(freeBadge).toHaveClass("bg-gray-100");
		});

		it("should not display PRO badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "free" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText("PRO")).not.toBeInTheDocument();
		});

		it("should not display Admin badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "free" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText(/Admin/)).not.toBeInTheDocument();
		});
	});

	describe("PRO user", () => {
		it("should display PRO badge in header", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "pro" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.getByText("PRO")).toBeInTheDocument();
		});

		it("should not display Free badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "pro" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText("Free")).not.toBeInTheDocument();
		});

		it("should not display Admin badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "pro" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText(/Admin/)).not.toBeInTheDocument();
		});
	});

	describe("Admin user", () => {
		it("should display Admin badge with star icon in header", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "admin" }]),
				}),
			} as never);

			const component = await AppHeader();
			const { container } = render(component);

			expect(screen.getByText(/Admin/)).toBeInTheDocument();
			// Star icon should be present (Stars component from lucide-react)
			const svgs = container.querySelectorAll("svg");
			const hasStarIcon = Array.from(svgs).some((svg) =>
				svg.classList.toString().includes("text-yellow-400"),
			);
			expect(hasStarIcon).toBe(true);
		});

		it("should use admin variant for Admin badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "admin" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			const adminBadge = screen.getByText(/Admin/).closest("span");
			expect(adminBadge).toHaveClass("bg-yellow-100");
		});

		it("should not display PRO badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "admin" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText("PRO")).not.toBeInTheDocument();
		});

		it("should not display Free badge", async () => {
			vi.mocked(getSession).mockResolvedValue(mockSession);
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ role: "admin" }]),
				}),
			} as never);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText("Free")).not.toBeInTheDocument();
		});
	});

	describe("No session", () => {
		it("should not display any role badges when no session", async () => {
			vi.mocked(getSession).mockResolvedValue(null);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByText("Free")).not.toBeInTheDocument();
			expect(screen.queryByText("PRO")).not.toBeInTheDocument();
			expect(screen.queryByText(/Admin/)).not.toBeInTheDocument();
		});

		it("should not display user dropdown when no session", async () => {
			vi.mocked(getSession).mockResolvedValue(null);

			const component = await AppHeader();
			render(component);

			expect(screen.queryByTestId("user-dropdown")).not.toBeInTheDocument();
		});
	});

	describe("Common elements", () => {
		it("should display Inedit logo link", async () => {
			vi.mocked(getSession).mockResolvedValue(null);

			const component = await AppHeader();
			render(component);

			const logo = screen.getByText("Inedit");
			expect(logo).toBeInTheDocument();
			expect(logo.closest("a")).toHaveAttribute("href", "/");
		});

		it("should display search trigger", async () => {
			vi.mocked(getSession).mockResolvedValue(null);

			const component = await AppHeader();
			render(component);

			expect(screen.getByTestId("search-trigger")).toBeInTheDocument();
		});

		it("should display theme toggle", async () => {
			vi.mocked(getSession).mockResolvedValue(null);

			const component = await AppHeader();
			render(component);

			expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
		});
	});
});
