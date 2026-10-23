import Image from "next/image";
import wave from "../../../mascot/1.png";
import teach from "../../../mascot/3.png";
import search from "../../../mascot/4.png";
import laptop from "../../../mascot/5.png";
import wink from "../../../mascot/6.png";
import cheer from "../../../mascot/7.png";
import read from "../../../mascot/8.png";
import love from "../../../mascot/10.png";
import think from "../../../mascot/12.png";
import excited from "../../../mascot/13.png";
import ready from "../../../mascot/15.png";
import focus from "../../../mascot/16.png";
import flag from "../../../mascot/17.png";
import hello from "../../../mascot/18.png";
import sleep from "../../../mascot/19.png";
import tablet from "../../../mascot/20.png";
import notes from "../../../mascot/21.png";
import jump from "../../../mascot/22.png";
import star from "../../../mascot/23.png";
import peek from "../../../mascot/24.png";
import journey from "../../../mascot/25.png";

const poses = { wave, teach, search, laptop, wink, cheer, read, love, think, excited, ready, focus, flag, hello, sleep, tablet, notes, jump, star, peek, journey };

export type Pose = keyof typeof poses;

// The mascot PNGs have an opaque white background; multiply blends it into the light surfaces.
export function Mascot({ pose, size = 120, className = "", priority, alt = "" }: { pose: Pose; size?: number; className?: string; priority?: boolean; alt?: string }) {
  return <Image src={poses[pose]} alt={alt} width={size} height={size} priority={priority} className={`shrink-0 select-none mix-blend-multiply ${className}`} />;
}
