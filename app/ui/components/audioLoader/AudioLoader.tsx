import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import ReactGA from "react-ga";
import "./audioLoader.css";
import { Context } from '@/utils/context/Context';

const AudioLoader: React.FC = () => {
 
  const [soundOff, setSoundOff] = useState<boolean>(true);
  const audioAmbiente = useRef<HTMLAudioElement>(null);
  const { activeMusic, setActiveMusic } = useContext(Context);

  const handlerActiveSound = () => {
    setActiveMusic(!activeMusic);
    if (!activeMusic) {
      ReactGA.event({
        category: "Interaccion",
        action: "Musica Encendida",
        label: "Un usuario encendio la musica",
        nonInteraction: false,
      });
    } else {
      ReactGA.event({
        category: "Interaccion",
        action: "Musica Apagada",
        label: "Un usuario apago la musica",
        nonInteraction: false,
      });
    }
  };

  const playAudio = useCallback(() => {
    if (audioAmbiente.current) {
      if (activeMusic) {
        audioAmbiente.current.play();
        audioAmbiente.current.volume = 0.5;
      } else {
        audioAmbiente.current.pause();
      }
    }
  }, [activeMusic]);

  useEffect(() => {
    playAudio();
  }, [playAudio]);

  useEffect(() => {
    if(activeMusic){
      playAudio();
    }
  }, []);

  const handlerSound = () => {
    setSoundOff(!soundOff);
  };

  return (
    <div
      className="loader"
      onClick={() => {
        handlerActiveSound();
        handlerSound();
      }}
    >
      <audio
        ref={audioAmbiente}
        src={"/assets/audio/alien.mp3"}
        autoPlay
        loop
      ></audio>
      {activeMusic ? (
        <svg
          id="wave"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 38.05"
        >
          <path
            id="Line_1"
            data-name="Line 1"
            d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"
          />
          <path
            id="Line_2"
            data-name="Line 2"
            d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"
          />
          <path
            id="Line_3"
            data-name="Line 3"
            d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"
          />
          <path
            id="Line_4"
            data-name="Line 4"
            d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"
          />
          <path
            id="Line_5"
            data-name="Line 5"
            d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"
          />
          <path
            id="Line_6"
            data-name="Line 6"
            d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"
          />
          <path
            id="Line_7"
            data-name="Line 7"
            d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"
          />
          <path
            id="Line_8"
            data-name="Line 8"
            d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"
          />
          <path
            id="Line_9"
            data-name="Line 9"
            d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" id="visual" version="1.1">
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M0 28L400 28L400 31L0 31Z"
            fill="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </div>
  );
};

export default AudioLoader;
