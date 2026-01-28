import React, { useContext } from "react";
import "./Button.css";
import { Context } from "@/utils/context/Context";

interface Props {
  text: string;
}

const Button = ({ text }: Props) => {
  const { setActiveMusic } = useContext(Context);

  const handleClickSong = () => {
    setActiveMusic(true);
  };

  return (
    <button className="button-49" role="button" onClick={handleClickSong}>
      {text}
    </button>
  );
};

export default Button;
