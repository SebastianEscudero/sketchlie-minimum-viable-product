"use client";

import { Canvas } from "@/components/canvas";
import { Loading } from "@/components/loading";
import { useEffect, useState } from "react";

const Board = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loading />
      </div>
    );
  }
  
  return (
    <Canvas />
  );
}

export default Board;