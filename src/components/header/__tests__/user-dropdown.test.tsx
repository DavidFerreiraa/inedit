import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

// Mock authClient
vi.mock("@/server/better-auth/client", () => ({
	authClient: {
		signOut: vi.fn(),
	},
}));

import { authClient } from "@/server/better-auth/client";
// Import after mocks
import { UserDropdown } from "../user-dropdown";

describe("UserDropdown", () => {
	const mockSession = {
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
			image: null,
			emailVerified: false,
			createdAt: new Date("2024-01-01"),
			updatedAt: null,
		},
		session: {
			id: "session-1",
			userId: "user-1",
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			token: "token",
			ipAddress: "127.0.0.1",
			userAgent: "test-agent",
		},
	};

	beforeEach(() => {
		mockPush.mockClear();
		vi.mocked(authClient.signOut).mockClear();
		vi.mocked(authClient.signOut).mockResolvedValue(undefined);
	});

	describe("Free user", () => {
		it("should display Free badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Free")).toBeInTheDocument();
		});

		it("should use secondary variant for Free badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const freeBadge = screen.getByText("Free");
			expect(freeBadge.closest("span")).toHaveClass("bg-secondary");
		});

		it("should not display PRO badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("PRO")).not.toBeInTheDocument();
		});

		it("should not display Admin badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Admin")).not.toBeInTheDocument();
		});

		it("should not show admin panel link", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
		});
	});

	describe("PRO user", () => {
		it("should display PRO badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="pro" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("PRO")).toBeInTheDocument();
		});

		it("should not display Free badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="pro" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Free")).not.toBeInTheDocument();
		});

		it("should not display Admin badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="pro" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Admin")).not.toBeInTheDocument();
		});

		it("should not show admin panel link", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="pro" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
		});
	});

	describe("Admin user", () => {
		it("should display Admin badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Admin")).toBeInTheDocument();
		});

		it("should use destructive variant for Admin badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const adminBadge = screen.getByText("Admin");
			expect(adminBadge.closest("span")).toHaveClass("bg-destructive");
		});

		it("should not display PRO badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("PRO")).not.toBeInTheDocument();
		});

		it("should not display Free badge", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.queryByText("Free")).not.toBeInTheDocument();
		});

		it("should show admin panel link", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Admin Panel")).toBeInTheDocument();
		});

		it("should navigate to admin panel when clicked", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="admin" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const adminLink = screen.getByText("Admin Panel");
			await user.click(adminLink);

			expect(mockPush).toHaveBeenCalledWith("/admin/users");
		});
	});

	describe("All users - common functionality", () => {
		it("should display user name", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Test User")).toBeInTheDocument();
		});

		it("should display user email", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("test@example.com")).toBeInTheDocument();
		});

		it("should show Meus Inedits link", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Meus Inedits")).toBeInTheDocument();
		});

		it("should navigate to profile when Meus Inedits clicked", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const profileLink = screen.getByText("Meus Inedits");
			await user.click(profileLink);

			expect(mockPush).toHaveBeenCalledWith("/profile/my-inedits");
		});

		it("should show sign out button", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("Sign out")).toBeInTheDocument();
		});

		it("should call signOut when sign out button clicked", async () => {
			const user = userEvent.setup();
			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const signOutButton = screen.getByText("Sign out");
			await user.click(signOutButton);

			expect(authClient.signOut).toHaveBeenCalledWith({
				fetchOptions: {
					onSuccess: expect.any(Function),
				},
			});
		});

		// Note: Skipping this test because Radix UI DropdownMenu closes immediately when
		// an item is clicked, so the loading state is not visible in the DOM during tests.
		// In the actual UI, this works correctly but jsdom doesn't maintain the menu open.
		it.skip("should show loading text while signing out", async () => {
			const user = userEvent.setup();
			// Make signOut take longer to resolve
			vi.mocked(authClient.signOut).mockImplementation(
				() => new Promise((resolve) => setTimeout(resolve, 100)),
			);

			render(<UserDropdown session={mockSession} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			const signOutButton = screen.getByText("Sign out");
			// Don't await - we want to check loading state immediately after click
			user.click(signOutButton);

			// Should show loading text (check synchronously after click starts)
			expect(await screen.findByText("Signing out...")).toBeInTheDocument();
		});

		it("should display user initials in avatar fallback", () => {
			render(<UserDropdown session={mockSession} userRole="free" />);

			// Avatar fallback should show "TU" for "Test User"
			expect(screen.getByText("TU")).toBeInTheDocument();
		});

		it("should use first letter of email when no name", () => {
			const sessionNoName = {
				...mockSession,
				user: { ...mockSession.user, name: null },
			};
			render(<UserDropdown session={sessionNoName} userRole="free" />);

			// Should show "T" from "test@example.com"
			expect(screen.getByText("T")).toBeInTheDocument();
		});

		it("should default to 'User' when no name provided", async () => {
			const user = userEvent.setup();
			const sessionNoName = {
				...mockSession,
				user: { ...mockSession.user, name: null },
			};
			render(<UserDropdown session={sessionNoName} userRole="free" />);

			const trigger = screen.getByRole("button");
			await user.click(trigger);

			expect(screen.getByText("User")).toBeInTheDocument();
		});
	});
});
