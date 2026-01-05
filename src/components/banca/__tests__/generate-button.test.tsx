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

	describe("Credit limit", () => {
		it("shows out of credits alert when remainingCredits is 0", () => {
			render(
				<GenerateButton canUpgrade remainingCredits={0}>
					Generate
				</GenerateButton>,
			);

			expect(
				screen.queryByRole("button", { name: /Generate/ }),
			).not.toBeInTheDocument();
			expect(
				screen.getByText(/You've used all your credits/),
			).toBeInTheDocument();
		});

		it("shows upgrade prompt when canUpgrade is true and out of credits", () => {
			render(
				<GenerateButton canUpgrade remainingCredits={0}>
					Generate
				</GenerateButton>,
			);

			expect(
				screen.getByText(/Upgrade to Pro for more credits/),
			).toBeInTheDocument();
		});

		it("shows credit counter when remainingCredits is greater than 0", () => {
			render(<GenerateButton remainingCredits={2}>Generate</GenerateButton>);

			expect(screen.getByText("2 credits remaining")).toBeInTheDocument();
		});

		it("pluralizes credit correctly for 1 remaining", () => {
			render(<GenerateButton remainingCredits={1}>Generate</GenerateButton>);

			expect(screen.getByText("1 credit remaining")).toBeInTheDocument();
		});

		it("does not show counter when remainingCredits is undefined", () => {
			render(<GenerateButton>Generate</GenerateButton>);

			expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
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

		it("does not call onClick when out of credits", async () => {
			const handleClick = vi.fn();

			render(
				<GenerateButton canUpgrade onClick={handleClick} remainingCredits={0}>
					Generate
				</GenerateButton>,
			);

			// Generate button should not be present, so nothing to click
			expect(
				screen.queryByRole("button", { name: /Generate/ }),
			).not.toBeInTheDocument();
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe("Combined states", () => {
		it("disables button when both disabled and isLoading are true", () => {
			render(<GenerateButton disabled isLoading />);

			expect(screen.getByRole("button")).toBeDisabled();
		});

		it("shows button with remaining credits when not at limit", () => {
			render(
				<GenerateButton remainingCredits={1}>
					Generate Questions
				</GenerateButton>,
			);

			expect(screen.getByRole("button")).toBeInTheDocument();
			expect(screen.getByText("Generate Questions")).toBeInTheDocument();
			expect(screen.getByText("1 credit remaining")).toBeInTheDocument();
		});
	});
});
