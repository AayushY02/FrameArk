import { useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LegendsStack({
  children,
  visible,
  width = "w-72", // fixed width of the whole stack
}: { children: React.ReactNode; visible: boolean; width?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "fixed bottom-8 left-3 z-50 pointer-events-auto rounded-2xl space-y-2",
        width, // 👈 fixed width applied here to the whole stack
        !visible && "pointer-events-none"
      )}
    >
      {/* Header / Toggle */}
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between bg-white/70 backdrop-blur-sm px-3 py-2 rounded-2xl cursor-pointer border border-black/10"
      >
        <span className="text-xs font-bold text-black">凡例</span>
        <motion.span
          aria-hidden
          initial={false}
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-gray-600"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Content with animation */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="legend-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="flex flex-col gap-3 overflow-y-auto bg-white/50 backdrop-blur-sm py-4 px-4 border border-black/10  rounded-2xl"
              style={{ minHeight: "100px", maxHeight: "75vh" }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
