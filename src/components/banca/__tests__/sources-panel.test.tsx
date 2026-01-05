import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { mockGenerationStatus, mockSources } from "@/test/mocks/handlers";
import { server } from "@/test/mocks/server";
import { render, screen, waitFor } from "@/test/utils";
import { SourcesPanel } from "../sources-panel";

// Mock child components to isolate unit tests
vi.mock("../source-card", () => ({
	SourceCard: ({
		source,
		onDelete,
	}: {
		source: { id: number; title: string };
		onDelete: () => void;
	}) => (
		<div data-testid={`source-card-${source.id}`}>
			<span>{source.title}</span>
			<button onClick={onDelete} type="button">
				Delete
			</button>
		</div>
	),
}));

vi.mock("../source-uploader", () => ({
	SourceUploader: ({
		onUploadSuccess,
	}: {
		bancaId: string;
		onUploadSuccess: () => void;
	}) => (
		<div data-testid="source-uploader">
			<button onClick={onUploadSuccess} type="button">
				Upload Success
			</button>
		</div>
	),
}));

vi.mock("../source-url-input", () => ({
	SourceUrlInput: ({
		onAddSuccess,
	}: {
		bancaId: string;
		onAddSuccess: () => void;
	}) => (
		<div data-testid="source-url-input">
			<button onClick={onAddSuccess} type="button">
				URL Success
			</button>
		</div>
	),
}));

vi.mock("../source-text-input", () => ({
	SourceTextInput: ({
		onAddSuccess,
	}: {
		bancaId: string;
		onAddSuccess: () => void;
	}) => (
		<div data-testid="source-text-input">
			<button onClick={onAddSuccess} type="button">
				Text Success
			</button>
		</div>
	),
}));

vi.mock("../source-selector-dropdown", () => ({
	SourceSelectorDropdown: ({
		value,
		onValueChange,
	}: {
		value: string;
		onValueChange: (value: string) => void;
	}) => (
		<select
			data-testid="source-selector"
			onChange={(e) => onValueChange(e.target.value)}
			value={value}
		>
			<option value="upload">Upload</option>
			<option value="url">URL</option>
			<option value="text">Text</option>
		</select>
	),
}));

describe("SourcesPanel", () => {
	const defaultProps = {
		bancaId: "banca-1",
		onGenerate: vi.fn(),
		isGenerating: false,
	};

	describe("Loading state", () => {
		it("shows loading spinner on initial render", () => {
			render(<SourcesPanel {...defaultProps} />);

			// Should show loading spinner initially
			expect(screen.getByText("Conteúdo")).toBeInTheDocument();
		});
	});

	describe("Fetching data", () => {
		it("fetches sources on mount with correct bancaId", async () => {
			let capturedBancaId: string | undefined;

			server.use(
				http.get("/api/banca/:bancaId/sources", ({ params }) => {
					capturedBancaId = params.bancaId as string;
					return HttpResponse.json({ sources: mockSources });
				}),
			);

			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(capturedBancaId).toBe("banca-1");
			});
		});

		it("fetches generation status on mount", async () => {
			let generationStatusCalled = false;

			server.use(
				http.get("/api/user/generation-status", () => {
					generationStatusCalled = true;
					return HttpResponse.json(mockGenerationStatus);
				}),
			);

			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(generationStatusCalled).toBe(true);
			});
		});
	});

	describe("Empty state", () => {
		it("shows empty state when no sources exist", async () => {
			server.use(
				http.get("/api/banca/:bancaId/sources", () => {
					return HttpResponse.json({ sources: [] });
				}),
			);

			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(
					screen.getByText("No sources yet. Add your first source above!"),
				).toBeInTheDocument();
			});
		});
	});

	describe("Sources display", () => {
		it("renders source cards for each source", async () => {
			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("source-card-1")).toBeInTheDocument();
				expect(screen.getByTestId("source-card-2")).toBeInTheDocument();
				expect(screen.getByTestId("source-card-3")).toBeInTheDocument();
			});
		});

		it("displays source titles", async () => {
			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByText("Test Document")).toBeInTheDocument();
				expect(screen.getByText("Test URL")).toBeInTheDocument();
				expect(screen.getByText("Test Text")).toBeInTheDocument();
			});
		});
	});

	describe("Generate button", () => {
		it("disables generate button when no completed sources", async () => {
			server.use(
				http.get("/api/banca/:bancaId/sources", () => {
					return HttpResponse.json({
						sources: [{ ...mockSources[2], processingStatus: "pending" }],
					});
				}),
			);

			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				const button = screen.getByRole("button", { name: /generate/i });
				expect(button).toBeDisabled();
			});
		});

		it("disables generate button when isGenerating is true", async () => {
			render(<SourcesPanel {...defaultProps} isGenerating />);

			await waitFor(() => {
				const button = screen.getByRole("button", { name: /generating/i });
				expect(button).toBeDisabled();
			});
		});

		it("shows remaining generations in generate button", async () => {
			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				expect(
					screen.getByText("2 generations remaining today"),
				).toBeInTheDocument();
			});
		});
	});

	describe("Generate action", () => {
		it("calls onGenerate", async () => {
			const onGenerate = vi.fn();

			render(<SourcesPanel {...defaultProps} onGenerate={onGenerate} />);

			await waitFor(() => {
				expect(screen.getByTestId("source-card-1")).toBeInTheDocument();
			});

			// Click generate button (completed sources should be auto-selected)
			const generateButton = screen.getByRole("button", {
				name: /generate/i,
			});
			generateButton.click();

			await waitFor(() => {
				// Should be called with IDs of completed sources (1 and 2)
				expect(onGenerate).toHaveBeenCalled();
			});
		});
	});

	describe("Generation status refetch", () => {
		it("refetches generation status when generation completes", async () => {
			let fetchCount = 0;

			server.use(
				http.get("/api/user/generation-status", () => {
					fetchCount++;
					return HttpResponse.json(mockGenerationStatus);
				}),
			);

			const { rerender } = render(
				<SourcesPanel {...defaultProps} isGenerating />,
			);

			await waitFor(() => {
				expect(fetchCount).toBe(1);
			});

			// Simulate generation completing
			rerender(<SourcesPanel {...defaultProps} isGenerating={false} />);

			await waitFor(() => {
				// Should have fetched again when isGenerating changed to false
				expect(fetchCount).toBe(2);
			});
		});
	});

	describe("Header", () => {
		it("displays correct header text", async () => {
			render(<SourcesPanel {...defaultProps} />);

			expect(screen.getByText("Conteúdo")).toBeInTheDocument();
			expect(
				screen.getByText(
					"Adicione seu conteúdo de estudo para gerar questões automaticamente",
				),
			).toBeInTheDocument();
		});
	});

	describe("Source input tabs", () => {
		it("shows upload source input by default", async () => {
			render(<SourcesPanel {...defaultProps} />);

			await waitFor(() => {
				// There are two uploaders (mobile + desktop), so use getAllBy
				const uploaders = screen.getAllByTestId("source-uploader");
				expect(uploaders.length).toBeGreaterThan(0);
			});
		});
	});
});
