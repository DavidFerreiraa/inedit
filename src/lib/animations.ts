import type { Variants } from "framer-motion";

/**
 * Fade in from bottom animation
 */
export const fadeInUp: Variants = {
	initial: {
		opacity: 0,
		y: 20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

/**
 * Fade in from top animation
 */
export const fadeInDown: Variants = {
	initial: {
		opacity: 0,
		y: -20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		y: 20,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
	initial: {
		opacity: 0,
		scale: 0.9,
	},
	animate: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.2,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		transition: {
			duration: 0.15,
			ease: "easeIn",
		},
	},
};

/**
 * Slide in from left animation
 */
export const slideInLeft: Variants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		x: 20,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

/**
 * Slide in from right animation
 */
export const slideInRight: Variants = {
	initial: {
		opacity: 0,
		x: 20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

/**
 * Shake animation for incorrect answers
 */
export const shake: Variants = {
	animate: {
		x: [-10, 10, -10, 10, 0],
		transition: {
			duration: 0.4,
			ease: "easeInOut",
		},
	},
};

/**
 * Success bounce animation
 */
export const successBounce: Variants = {
	animate: {
		scale: [1, 1.1, 1],
		transition: {
			duration: 0.3,
			ease: "easeInOut",
		},
	},
};

/**
 * Stagger container for list animations
 */
export const staggerContainer: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

/**
 * Stagger item animation
 */
export const staggerItem: Variants = {
	initial: {
		opacity: 0,
		y: 10,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
};

/**
 * Panel slide animation
 */
export const panelSlide: Variants = {
	initial: {
		x: -300,
		opacity: 0,
	},
	animate: {
		x: 0,
		opacity: 1,
		transition: {
			duration: 0.4,
			ease: "easeOut",
		},
	},
	exit: {
		x: -300,
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: "easeIn",
		},
	},
};

/**
 * Button press animation
 */
export const buttonPress = {
	whileHover: { scale: 1.02 },
	whileTap: { scale: 0.98 },
};

/**
 * Card hover animation
 */
export const cardHover = {
	whileHover: {
		y: -4,
		transition: {
			duration: 0.2,
			ease: "easeOut",
		},
	},
};

/**
 * Pulse animation for loading states
 */
export const pulse: Variants = {
	animate: {
		opacity: [0.5, 1, 0.5],
		transition: {
			duration: 1.5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

/**
 * Confetti explosion animation
 */
export const confettiExplosion: Variants = {
	initial: {
		scale: 0,
		rotate: 0,
	},
	animate: {
		scale: [0, 1.2, 1],
		rotate: [0, 180, 360],
		transition: {
			duration: 0.6,
			ease: "easeOut",
		},
	},
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
	initial: {
		opacity: 0,
		scale: 0.98,
	},
	animate: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		scale: 0.98,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};
