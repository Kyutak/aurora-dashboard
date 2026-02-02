import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface EmergencyButtonProps {
  onEmergency: () => void
}

export function EmergencyButton({ onEmergency }: EmergencyButtonProps) {
  const [confirmed, setConfirmed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const HANDLE_WIDTH = 90
  const ACTIVATION_THRESHOLD = 0.6 // 70% do percurso

  return (
    <div
      ref={containerRef}
      className="relative w-full h-24 rounded-3xl overflow-hidden"
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        onDragEnd={(_, info) => {
          const containerWidth =
            containerRef.current?.offsetWidth ?? 0
          const maxDrag = containerWidth - HANDLE_WIDTH
          const currentPosition = info.point.x - (containerRef.current?.getBoundingClientRect().left ?? 0)
          const draggedRatio = currentPosition / maxDrag

          if (draggedRatio >= ACTIVATION_THRESHOLD) {
            setConfirmed(true)
            onEmergency()
            setTimeout(() => setConfirmed(false), 3000)
          }
        }}
        className={cn(
          "absolute top-0 left-0 h-full mx-0 w-[120px]",
          "flex items-center justify-center",
          "bg-red-600 text-white rounded-3xl",
          "cursor-grab active:cursor-grabbing z-10 shadow-2xl",
        )}
        animate={{ x: [0, 0, 6, 0] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <AlertCircle className="w-10 h-10" />
      </motion.div>

      <Button
        disabled={confirmed}
        className={cn(
          "w-full h-full rounded-3xl pl-[90px]",
          "text-red-600 font-bold text-2xl",
          "bg-red-100 hover:bg-red-200",
          "dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400",
          confirmed && "opacity-50 cursor-not-allowed",
          "shadow-lg",
        )}
      >
        {confirmed ? "Emergência Enviada!" : " Emergência →"}
      </Button>
    </div>
  )
}
