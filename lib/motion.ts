export const spring = (duration = 0.6, bounce = 0.2, delay = 0) =>
  ({ type: "spring" as const, duration, bounce, delay });

export const uiSpring = { type: "spring" as const, stiffness: 400, damping: 30, mass: 1 };

export const presets = {
  fadeUp20: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: spring(0.5, 0.1, 0.4),
    viewport: { once: true, amount: 0.5 },
  },
  fadeUp40: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: spring(0.6, 0.2, 0.2),
    viewport: { once: true, amount: 0 },
  },
  riseUp150: {
    initial: { opacity: 0, y: 150 },
    whileInView: { opacity: 1, y: 0 },
    transition: spring(1, 0.2, 0),
    viewport: { once: true, amount: 0 },
  },
  flipX: {
    initial: { rotateX: 90, y: 12, opacity: 1 },
    whileInView: { rotateX: 0, y: 0, opacity: 1 },
    transition: spring(0.6, 0.2, 0.2),
    viewport: { once: true, amount: 0.4 },
  },
};

export function stairs(index: number) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.44, 0, 0.11, 1] as const, delay: index * 0.1 },
    viewport: { once: true, amount: 0.4 },
  };
}

export const textFx = {
  charRise: { from: { opacity: 0.001, y: 10 }, transition: spring(0.4, 0), stagger: 0.075, startDelay: 0.1 },
  wordRise: { from: { opacity: 0.001, y: 10 }, transition: spring(0.4, 0), stagger: 0.075, startDelay: 0.3 },
  charRiseHero: { from: { opacity: 0.001, y: 50 }, transition: spring(0.4, 0.2), stagger: 0.075, startDelay: 0.1 },
};
