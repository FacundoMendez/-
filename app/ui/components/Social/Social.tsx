"use client";
import Image from "next/image";
import React, { useState } from "react";
import telegram from "@/public/assets/icons/telegram.svg";
import discord from "@/public/assets/icons/discord.svg";
import twitter from "@/public/assets/icons/twitter.svg";
import telegramHover from "@/public/assets/icons/telegram-hover.svg";
import discordHover from "@/public/assets/icons/discord-hover.svg";
import twitterHover from "@/public/assets/icons/twitter-hover.svg";

type SocialIconType = "discord" | "telegram" | "twitter";

interface SocialIconInfo {
  type: SocialIconType;
  normal: string;
  hover: string;
  size: number;
  className: string;
}

const socialIconsInfo: SocialIconInfo[] = [
  {
    type: "discord",
    normal: discord.src,
    hover: discordHover.src,
    size: 32,
    className: "h-8",
  },
  {
    type: "telegram",
    normal: telegram.src,
    hover: telegramHover.src,
    size: 32,
    className: "h-9",
  },
  {
    type: "twitter",
    normal: twitter.src,
    hover: twitterHover.src,
    size: 32,
    className: "h-8",
  },
];

const SocialIcon = ({
  type,
  normal,
  hover,
  size,
  className,
}: SocialIconInfo) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        className={`icon_social cursor-pointer ${className} ${
          isHovered ? "hovered" : ""
        }`}
        src={isHovered ? hover : normal}
        alt={type}
        width={size}
        height={size}
      />
    </div>
  );
};

const Social = () => {
  
  return (

    <div className="social absolute top-[1rem] right-[2rem]  md:right-[5rem] flex gap-[1rem] justify-center items-center z-[999999]">
    {socialIconsInfo.map((iconInfo) => (
      <SocialIcon key={iconInfo.type} {...iconInfo} />
    ))}
  </div>
    
  )
}

export default Social