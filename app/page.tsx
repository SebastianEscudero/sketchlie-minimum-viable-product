"use client";

import { Canvas } from "@/components/canvas";
import { Loading } from "@/components/loading";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Board = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

    
  useEffect(() => {
    toast("Bienvenido a Sketchlie!", {
      description: "🖱️ Apreta click derecho para moverte alrededor del canvas!",
      position: "top-center",
      closeButton: true
    });
  }, [])

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