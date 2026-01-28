"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import "./Copy.css";
import copy from "@/public/assets/icons/copy.svg";
import copyActive from "@/public/assets/icons/copy-active.svg";

const Copy = () => {
    const [isActiveIcon, setIsActiveIcon] = useState(false);
    
  const handleCopyActive = () => {
    setIsActiveIcon(true);

    setTimeout(() => {
      setIsActiveIcon(false);
    }, 3000);
  };
  return (
<div className="box_buy absolute bottom-[3rem] xl:bottom-[2.3rem] flex justify-center items-center gap-[2rem] flex-col text-white z-[9999] px-[2rem] rounded-xl ">

    <div className="address text-[1.7rem] flex justify-center items-center gap-[1rem] ">
      <h3 className="addressText">
        {" "}
        0x184A0F63981d2E9bA0E09f6a87e1F1e7402153B5
      </h3>
      <button className="copy" onClick={handleCopyActive}>
        <span
          data-text-end={"Copied!"}
          data-text-initial="Copy to address"
          className="tooltip"
        ></span>
        <span>
          {isActiveIcon ? (
            <Image src={copyActive} alt="copy-active" />
          ) : (
            <Image src={copy} alt="copy" />
          )}
        </span>
      </button>
    </div>
  </div>
  )
}

export default Copy