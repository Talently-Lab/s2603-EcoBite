import { useEffect, useState } from "react";

export function AnimatedCo2Value({ value }: { value: number | string }) {
  const target = Number(value);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    let frameId = 0;
    let startTime: number | undefined;

    function animate(timestamp: number) {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      setAnimatedValue(target * easedProgress);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <>
      {animatedValue.toLocaleString("es-AR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })}{" "}
      kg
    </>
  );
}
