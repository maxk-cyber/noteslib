import { CrowdCanvas } from "@/components/crowd-canvas";
import { assetPath } from "@/lib/asset-path";

export function CrowdBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <CrowdCanvas
        src={assetPath("/images/peeps/all-peeps.png")}
        rows={15}
        cols={7}
        speedMin={0.4}
        speedMax={1.1}
        scale={0.9}
        directionBias={0.45}
        bounce={9}
        verticalSpread={220}
        opacity={0.86}
        heightClass="h-[85vh]"
        filter="saturate(0.9) hue-rotate(95deg) brightness(0.88)"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#060a08]/80 to-[#080808]/96" />
    </div>
  );
}
