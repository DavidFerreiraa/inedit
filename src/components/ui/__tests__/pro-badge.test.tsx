import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ProBadge } from "../pro-badge";

describe("ProBadge", () => {
	describe("rendering", () => {
		it("should display PRO text", () => {
			render(<ProBadge />);
			expect(screen.getByText("PRO")).toBeInTheDocument();
		});

		it("should display crown icon", () => {
			const { container } = render(<ProBadge />);
			// Crown icon is rendered as SVG
			const svg = container.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should have gradient background classes", () => {
			const { container } = render(<ProBadge />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("bg-gradient-to-r");
			expect(badge).toHaveClass("from-amber-500");
			expect(badge).toHaveClass("to-orange-500");
		});

		it("should have white text color", () => {
			const { container } = render(<ProBadge />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("text-white");
		});

		it("should have no border", () => {
			const { container } = render(<ProBadge />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("border-0");
		});
	});

	describe("size variants", () => {
		it("should render small size by default", () => {
			const { container } = render(<ProBadge />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("px-1.5");
			expect(badge).toHaveClass("py-0.5");
			expect(badge).toHaveClass("text-[10px]");
		});

		it("should render small size when explicitly set", () => {
			const { container } = render(<ProBadge size="sm" />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("px-1.5");
			expect(badge).toHaveClass("py-0.5");
			expect(badge).toHaveClass("text-[10px]");
		});

		it("should render medium size when specified", () => {
			const { container } = render(<ProBadge size="md" />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("px-2");
			expect(badge).toHaveClass("py-1");
			expect(badge).toHaveClass("text-xs");
		});

		it("should use correct icon size for small variant", () => {
			const { container } = render(<ProBadge size="sm" />);
			const svg = container.querySelector("svg");
			expect(svg).toHaveClass("h-3");
			expect(svg).toHaveClass("w-3");
			expect(svg).toHaveClass("mr-0.5");
		});

		it("should use correct icon size for medium variant", () => {
			const { container } = render(<ProBadge size="md" />);
			const svg = container.querySelector("svg");
			expect(svg).toHaveClass("h-4");
			expect(svg).toHaveClass("w-4");
			expect(svg).toHaveClass("mr-1");
		});
	});

	describe("custom className", () => {
		it("should merge custom className with default styles", () => {
			const { container } = render(<ProBadge className="custom-class" />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("custom-class");
			// Should still have default gradient classes
			expect(badge).toHaveClass("bg-gradient-to-r");
			expect(badge).toHaveClass("from-amber-500");
			expect(badge).toHaveClass("to-orange-500");
		});

		it("should allow overriding spacing with custom className", () => {
			const { container } = render(<ProBadge className="px-4 py-2" />);
			const badge = screen.getByText("PRO").closest("span");
			expect(badge).toHaveClass("px-4");
			expect(badge).toHaveClass("py-2");
		});
	});
});
