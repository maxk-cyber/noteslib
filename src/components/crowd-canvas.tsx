"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

type CrowdCanvasProps = {
  src: string;
  rows?: number;
  cols?: number;
  speedMin?: number;
  speedMax?: number;
  scale?: number;
  directionBias?: number;
  bounce?: number;
  verticalSpread?: number;
  opacity?: number;
  heightClass?: string;
  filter?: string;
};

type Stage = {
  width: number;
  height: number;
};

type WalkProps = {
  startX: number;
  startY: number;
  endX: number;
};

type Peep = {
  image: HTMLImageElement;
  rect: number[];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
  setRect: (rect: number[]) => void;
  render: (ctx: CanvasRenderingContext2D, scale: number) => void;
};

type WalkFn = (args: { peep: Peep; props: WalkProps }) => gsap.core.Timeline;

export function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
  speedMin = 0.5,
  speedMax = 1.5,
  scale = 1,
  directionBias = 0.5,
  bounce = 10,
  verticalSpread = 250,
  opacity = 1,
  heightClass = "h-[90vh]",
  filter,
}: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const randomRange = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const randomIndex = <T,>(array: T[]) => randomRange(0, array.length) | 0;
    const removeFromArray = <T,>(array: T[], i: number) => array.splice(i, 1)[0];
    const removeItemFromArray = <T,>(array: T[], item: T) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = <T,>(array: T[]) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = <T,>(array: T[]) => array[randomIndex(array)];

    const resetPeep = ({ stage, peep }: { stage: Stage; peep: Peep }) => {
      const direction = Math.random() < directionBias ? 1 : -1;
      const offsetY = 100 - verticalSpread * gsap.parseEase("power2.in")(Math.random());
      const startY = stage.height - peep.height * scale + offsetY;
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width * scale;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width * scale;
        endX = 0;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return { startX, startY, endX };
    };

    const normalWalk: WalkFn = ({ peep, props }) => {
      const { startY, endX } = props;
      const xDuration = 10;
      const yDuration = 0.25;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(speedMin, speedMax));
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: xDuration / yDuration,
          yoyo: true,
          y: startY - bounce,
        },
        0,
      );

      return tl;
    };

    const walks: WalkFn[] = [normalWalk];

    const createPeep = ({
      image,
      rect,
    }: {
      image: HTMLImageElement;
      rect: number[];
    }): Peep => {
      const peep: Peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (nextRect: number[]) => {
          peep.rect = nextRect;
          peep.width = nextRect[2];
          peep.height = nextRect[3];
        },
        render: (context: CanvasRenderingContext2D, renderScale: number) => {
          context.save();
          context.translate(peep.x, peep.y);
          context.scale(peep.scaleX * renderScale, renderScale);
          context.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height,
          );
          context.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    const img = document.createElement("img");
    const stage: Stage = { width: 0, height: 0 };
    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const createPeeps = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % rows) * rectWidth,
              ((i / rows) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          }),
        );
      }
    };

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps);
      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({ peep, stage }),
      }).eventCallback("onComplete", () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return peep;
    };

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const initCrowd = () => {
      while (availablePeeps.length) {
        addPeepToCrowd().walk?.progress(Math.random());
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      crowd.forEach((peep) => peep.render(ctx, scale));
      ctx.restore();
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      crowd.forEach((peep) => peep.walk?.kill());

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    const init = () => {
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };

    img.onload = init;
    img.src = src;

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
    };
  }, [
    src,
    rows,
    cols,
    speedMin,
    speedMax,
    scale,
    directionBias,
    bounce,
    verticalSpread,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute bottom-0 w-full ${heightClass}`}
      style={{ opacity, filter }}
      aria-hidden
    />
  );
}
