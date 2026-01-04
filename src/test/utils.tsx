import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

// Create a new QueryClient for each test
function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

interface WrapperProps {
	children: ReactNode;
}

function createWrapper() {
	const testQueryClient = createTestQueryClient();

	return function Wrapper({ children }: WrapperProps) {
		return (
			<QueryClientProvider client={testQueryClient}>
				{children}
			</QueryClientProvider>
		);
	};
}

function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return render(ui, {
		wrapper: createWrapper(),
		...options,
	});
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { customRender as render };
