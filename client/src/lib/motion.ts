import type { Transition } from "framer-motion";

/** Underdamped spring so cards visibly settle rather than snapping. */
export const cardSpring: Transition = {
    type: "spring",
    stiffness: 140,
    damping: 18,
};

/** Slightly heavier spring for whole-page transitions. */
export const pageSpring: Transition = {
    type: "spring",
    stiffness: 120,
    damping: 20,
};

const STAGGER_STEP_SECONDS = 0.07;
const STAGGER_LIMIT = 8;

/**
 * Entrance for card surfaces. Pairs with the `card-surface` class, which owns
 * the hover lift. Keep the two out of each other's way: `card-surface` uses the
 * standalone `scale` property, never `transform`, so this spring stays snappy.
 */
export const cardMotion = (index = 0) => ({
    initial: { opacity: 0, y: 28, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
        ...cardSpring,
        delay: Math.min(index, STAGGER_LIMIT) * STAGGER_STEP_SECONDS,
    },
});

export const pageMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: pageSpring,
};

/** Hover lift + 300ms easing. Defined in `styles/system.css`. */
export const CARD_SURFACE = "card-surface";
