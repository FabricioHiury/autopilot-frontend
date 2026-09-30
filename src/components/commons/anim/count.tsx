import { useEffect, useState } from "react";

export default function Counter({ number }: { number: number }) {
  const [random, setRandom] = useState<number>(Math.random() * 100);

  useEffect(() => {
    // Create an interval to update the random number every 100ms
    const id = setInterval(() => {
      setRandom(Math.random() * 100);
    }, 10);

    // Clear the interval and set the random number to `number` after 1 second
    const timeoutId = setTimeout(() => {
      clearInterval(id);
      setRandom(number);
    }, 1000);

    // Cleanup the interval and timeout on component unmount or dependency change
    return () => {
      clearInterval(id);
      clearTimeout(timeoutId);
    };
  }, [number]);

  return <>{random.toFixed(0)}</>;
}
