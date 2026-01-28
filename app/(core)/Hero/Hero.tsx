"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import "./hero.css";
import Lights from "../../ui/components/Lights/Lights";
import AudioLoader from "../../ui/components/audioLoader/AudioLoader";

// Load Scene only on client side (no SSR) - required for Three.js/R3F
const Scene = dynamic(() => import("../../ui/components/scene/Scene"), {
  ssr: false,
});

const Hero = () => {
  const scene_hero = useRef(null);
  return (
    <div className="hero w-full min-h-[90vh] overflow-hidden relative flex justify-center items-center !rounded-[70px] p-[1rem]">
      <Lights />
      <AudioLoader/>
      <div ref={scene_hero} className="bg_hero"></div>
   {/*    <div className="boxTitle">
        <h2 className="text_hero">Alien Dance</h2>
        <span>Meme Coin</span>
      </div> */}
      <Scene scene_hero={scene_hero} />
    </div>
  );
};

export default Hero;
