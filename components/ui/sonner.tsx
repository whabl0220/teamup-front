"use client"

import type { CSSProperties } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      visibleToasts={4}
      richColors
      expand={false}
      closeButton
      toastOptions={{
        duration: 2600,
        unstyled: false,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:px-4 group-[.toaster]:py-3",
          title: "text-sm font-semibold tracking-tight",
          description: "text-xs text-muted-foreground mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:h-8 group-[.toast]:px-3",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:rounded-md group-[.toast]:h-8 group-[.toast]:px-3",
          success:
            "group-[.toaster]:bg-emerald-500/10 group-[.toaster]:text-foreground group-[.toaster]:border-emerald-500/40",
          error:
            "group-[.toaster]:bg-rose-500/10 group-[.toaster]:text-foreground group-[.toaster]:border-rose-500/40",
          info:
            "group-[.toaster]:bg-sky-500/10 group-[.toaster]:text-foreground group-[.toaster]:border-sky-500/40",
          warning:
            "group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-foreground group-[.toaster]:border-amber-500/40",
          loading:
            "group-[.toaster]:bg-primary/8 group-[.toaster]:text-foreground group-[.toaster]:border-primary/30",
        },
      }}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
