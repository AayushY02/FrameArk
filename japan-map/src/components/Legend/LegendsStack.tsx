import clsx from "clsx";
// import OtherLegend... etc.

export default function LegendsStack({
  children,
  visible,
  width = "w-72", // 18rem; adjust as needed
}: { children: React.ReactNode; visible: boolean; width?: string }) {
  return (
    <div
      className={clsx(
        "fixed bottom-6 left-3 z-50 pointer-events-auto transition-opacity",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className={clsx(
          "flex flex-col gap-3 min-h-[64px] max-h-[55vh] overflow-y-auto pr-1",
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}


