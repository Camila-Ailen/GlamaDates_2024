"use client"

import {
  Scissors,
  Smile,
  Brush,
  SpadeIcon as Spa,
  type LucideIcon,
  Sparkles,
  User,
  Zap,
  Hand,
  Footprints,
  Eye,
  Minus,
  EyeOff,
  EyeIcon,
  ScanEye,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
  category: string
  size?: number
  className?: string
}

// Mapeo de categorías a iconos y colores
const categoryConfig: Record<
  string,
  {
    icon: LucideIcon
    gradient?: string
    iconColor?: string
  }
> = {
  manicura: {
    icon: Hand,
    iconColor: "text-pink-500",
  },
  pedicura: {
    icon: Footprints,
    iconColor: "text-pink-500",
  },
  facial: {
    icon: Smile,
    iconColor: "text-pink-500",
  },
  maquillaje: {
    icon: Brush,
    iconColor: "text-pink-500",
  },
  peluqueria: {
    icon: Scissors,
    iconColor: "text-pink-500",
  },
  depilacion: {
    icon: Zap,
    iconColor: "text-pink-500",
  },
  masajes: {
    icon: Spa,
    iconColor: "text-pink-500",
  },
  corporal: {
    icon: User,
    iconColor: "text-pink-500",
  },
  cejas: {
    icon: Minus,
    iconColor: "text-pink-500",
  },
  pestanas: {
    icon: EyeIcon,
    iconColor: "text-pink-500",
  },
  // Categoría por defecto
  default: {
    icon: Sparkles,
    gradient: "from-pink-100 to-purple-100",
    iconColor: "text-pink-500",
  },
}

export function CategoryIcon({ category, size = 16, className }: CategoryIconProps) {
  // Normalizar el nombre de la categoría (minúsculas y sin acentos)
  const normalizedCategory =
    category
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "default"

  // Buscar la categoría exacta o una que contenga la palabra clave
  let config = categoryConfig["default"]

  // Primero intentar encontrar una coincidencia exacta
  if (categoryConfig[normalizedCategory]) {
    config = categoryConfig[normalizedCategory]
  } else {
    // Si no hay coincidencia exacta, buscar una categoría que contenga la palabra
    for (const key of Object.keys(categoryConfig)) {
      if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
        config = categoryConfig[key]
        break
      }
    }
  }

  const Icon = config.icon

  return <Icon size={size} className={cn(config.iconColor, className)} />
}

export function getCategoryGradient(category: string): string {
  // Normalizar el nombre de la categoría
  const normalizedCategory =
    category
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "default"

  // Buscar la categoría exacta o una que contenga la palabra clave
  let gradient = categoryConfig["default"].gradient

  // Primero intentar encontrar una coincidencia exacta
  if (categoryConfig[normalizedCategory]) {
    gradient = categoryConfig[normalizedCategory].gradient
  } else {
    // Si no hay coincidencia exacta, buscar una categoría que contenga la palabra
    for (const key of Object.keys(categoryConfig)) {
      if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
        gradient = categoryConfig[key].gradient
        break
      }
    }
  }

  return gradient || "from-pink-100 to-purple-100" 
}

