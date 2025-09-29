import confetti from "canvas-confetti";

/**
 * Interface for confetti animation options
 */
export interface ConfettiOptions {
  /** Number of confetti particles to create (default: 30) */
  particleCount?: number;
  /** Spread of the confetti in degrees (default: 35) */
  spread?: number;
}

/**
 * Creates a function that shows confetti animation from beneath a targeted HTML element
 * @param element - The HTML element to use as the origin point for the confetti
 * @param options - Configuration options for the confetti animation
 * @returns A function that when called will trigger the confetti animation
 */
export function createElementConfetti(
  element: HTMLElement,
  options: ConfettiOptions = {}
): () => Promise<undefined> | null {
  // Default values - kept minimal as requested
  const { particleCount = 30, spread = 35 } = options;

  return () => {
    // Get the element's position and dimensions at the time of execution
    const rect = element.getBoundingClientRect();

    // Calculate the origin point (center-bottom of the element)
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = rect.bottom / window.innerHeight;

    // Return the confetti call as a function
    return confetti({
      particleCount,
      spread,
      angle: 90,
      startVelocity: 30,
      origin: {
        x: originX,
        y: originY,
      },
      gravity: 1,
      drift: 0,
      scalar: 1,
    });
  };
}
