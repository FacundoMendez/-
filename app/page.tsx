import Hero from "./(core)/Hero/Hero";
import Preload from "./ui/components/Preload/Preload";
import { Russo_One } from "next/font/google";

const fontHeading = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

export default async function Home() {
  return (
    <div className={`${fontHeading.className} w-full h-full `}>
      <Preload/>
      <Hero/>
    </div>
  );
}