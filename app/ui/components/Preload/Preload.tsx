'use client';

import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import Button from "../Button/Button";
import "./Preload.css";
import { Context } from '@/utils/context/Context';
import gsap from "gsap";

const Preload = () => {
  const [loading, setLoading] = useState(true);
  const { activeMusic } = useContext(Context);
 
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  
  useEffect(() => {

    if(activeMusic){
      gsap.to(".preload", {
        duration: 1.2,
        opacity: 0,
        zIndex: -1,
        display:'none',
        ease: "power2.inOut"
      })
    }

    
  }, [activeMusic])

  return (
    <div className="preload w-full min-h-[100vh] bg-black fixed top-0 left-0 flex justify-center items-center z-[9999999] flex-col gap-6">
      <Image
        src="/assets/images/favicon.png"
        alt="Alien Dance"
        className=""
        width={210}
        height={210}
        quality={100}
      />
      {loading ? (
   /*      <span className="text-[#ffffff] text-[2rem]">Loading</span> */
        <span className="loader2">Loading</span>
      ) : (
        <Button text={"Enter"} />
      )}
    </div>
  );
};

export default Preload;
