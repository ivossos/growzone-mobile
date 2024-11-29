import React, { useEffect, useState } from "react";
import { Text } from "react-native";

const Countdown = React.memo(({ start, onFinish }: { start: number, onFinish: () => void }) => {
  const [counter, setCounter] = useState(start);

  useEffect(() => {
    if (counter <= 0) {
      onFinish();
      return;
    }
    
    const timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);

    return () => clearTimeout(timer);
  }, [counter, onFinish]);

  return (
    <Text className="text-4xl text-white font-bold">
      {counter}
    </Text>
  );
});

export default Countdown