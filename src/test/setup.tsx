import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
	cleanup();
	server.resetHandlers();
});
afterAll(() => server.close());

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
	motion: {
		div: ({
			children,
			...props
		}: React.PropsWithChildren<Record<string, unknown>>) => {
			const { initial, animate, whileHover, whileTap, transition, ...rest } =
				props;
			return <div {...rest}>{children}</div>;
		},
		button: ({
			children,
			...props
		}: React.PropsWithChildren<Record<string, unknown>>) => {
			const { initial, animate, whileHover, whileTap, transition, ...rest } =
				props;
			return <button {...rest}>{children}</button>;
		},
	},
	AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
