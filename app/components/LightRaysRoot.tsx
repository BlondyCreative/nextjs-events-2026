"use client";
import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("./lightRays"), { ssr: false });

interface LightRaysProps {
  raysOrigin?: string;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

export default function LightRaysRoot(props: LightRaysProps) {
  return <LightRays {...props} />;
}
