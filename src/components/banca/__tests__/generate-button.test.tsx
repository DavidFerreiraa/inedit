import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GenerateButton } from "../generate-button";

describe("GenerateButton", () => {
	describe("Rendering", () => {
		it("renders button with default text when no children provided", () => {
			render(<GenerateButton />);

			expect(screen.getByRole("button")).toBeInTheDocument();
			expect(screen.getByText("Generate with AI")).toBeInTheDocument();
		});

		it("renders button with custom children content", () => {
			render(<GenerateButton>Custom Text</GenerateButton>);

			expect(screen.getByText("Custom Text")).toBeInTheDocument();
		});

		it("renders Sparkles icon", () => {
			render(<GenerateButton />);

			// The Sparkles icon should be present
			const button = screen.getByRole("button");
			expect(button.querySelector("svg")).toBeInTheDocument();
		});
	});

	describe("Loading state", () => {
		it("shows loading spinner when isLoading is true", () => {
			render(<GenerateButton isLoading>Generate</GenerateButton>);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
			// Loading spinner is a div with animation classes
			expect(button.querySelectorAll("div").length).toBeGreaterThan(0);
		});

		it("disables button when isLoading is true", () => {
			render(<GenerateButton isLoading />);

			expect(screen.getByRole("button")).toBeDisabled();
		});
	});

	describe("Disabled state", () => {
		it("disables button when disabled prop is true", () => {
			render(<GenerateButton disabled />);

			expect(screen.getByRole("button")).toBeDisabled();
		});

		it("does not call onClick when disabled", async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<GenerateButton disabled onClick={handleClick} />);

			await user.click(screen.getByRole("button"));

			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe("Generation limit", () => {
		it("shows limit reached alert when remainingGenerations is 0", () => {
			const resetTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

			render(
				<GenerateButton remainingGenerations={0} resetsAt={resetTime}>
					Generate
				</GenerateButton>,
			);

			expect(screen.queryByRole("button")).not.toBeInTheDocument();
			expect(screen.getByText(/Daily limit reached/)).toBeInTheDocument();
		});

		it("formats reset time correctly in limit alert", () => {
			const resetDate = new Date();
			resetDate.setHours(14, 30, 0, 0);

			render(
				<GenerateButton
					remainingGenerations={0}
					resetsAt={resetDate.toISOString()}
				>
					Generate
				</GenerateButton>,
			);

			// Should show the formatted time
			expect(screen.getByText(/Resets at/)).toBeInTheDocument();
		});

		it("shows generation counter when remainingGenerations is greater than 0", () => {
			render(
				<GenerateButton remainingGenerations={2} resetsAt={null}>
					Generate
				</GenerateButton>,
			);

			expect(
				screen.getByText("2 generations remaining today"),
			).toBeInTheDocument();
		});

		it("pluralizes generation correctly for 1 remaining", () => {
			render(
				<GenerateButton remainingGenerations={1} resetsAt={null}>
					Generate
				</GenerateButton>,
			);

			expect(
				screen.getByText("1 generation remaining today"),
			).toBeInTheDocument();
		});

		it("does not show counter when remainingGenerations is undefined", () => {
			render(<GenerateButton>Generate</GenerateButton>);

			expect(screen.queryByText(/remaining today/)).not.toBeInTheDocument();
		});
	});

	describe("Click handler", () => {
		it("calls onClick handler when clicked", async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<GenerateButton onClick={handleClick}>Generate</GenerateButton>);

			await user.click(screen.getByRole("button"));

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it("does not call onClick when loading", async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(
				<GenerateButton isLoading onClick={handleClick}>
					Generate
				</GenerateButton>,
			);

			await user.click(screen.getByRole("button"));

			expect(handleClick).not.toHaveBeenCalled();
		});

		it("does not call onClick when limit is reached", async () => {
			const handleClick = vi.fn();
			const resetTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

			render(
				<GenerateButton
					onClick={handleClick}
					remainingGenerations={0}
					resetsAt={resetTime}
				>
					Generate
				</GenerateButton>,
			);

			// Button should not be present, so nothing to click
			expect(screen.queryByRole("button")).not.toBeInTheDocument();
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe("Combined states", () => {
		it("disables button when both disabled and isLoading are true", () => {
			render(<GenerateButton disabled isLoading />);

			expect(screen.getByRole("button")).toBeDisabled();
		});

		it("shows button with remaining generations when not at limit", () => {
			render(
				<GenerateButton remainingGenerations={1} resetsAt={null}>
					Generate Questions
				</GenerateButton>,
			);

			expect(screen.getByRole("button")).toBeInTheDocument();
			expect(screen.getByText("Generate Questions")).toBeInTheDocument();
			expect(
				screen.getByText("1 generation remaining today"),
			).toBeInTheDocument();
		});
	});
});
