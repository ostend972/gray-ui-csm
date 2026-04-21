import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type CustomerInitialAvatarSize = "sm" | "md" | "lg"

type CustomerInitialAvatarProps = {
  name: string
  size?: CustomerInitialAvatarSize
  className?: string
}

const avatarSizeClassName: Record<CustomerInitialAvatarSize, string> = {
  sm: "size-6",
  md: "size-10",
  lg: "size-12",
}

const fallbackTextClassName: Record<CustomerInitialAvatarSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CustomerInitialAvatar({
  name,
  size = "md",
  className,
}: CustomerInitialAvatarProps) {
  return (
    <Avatar
      className={cn(
        "bg-transparent after:hidden",
        avatarSizeClassName[size],
        className
      )}
    >
      <AvatarFallback
        aria-label={name}
        className={cn(
          "bg-primary/30 text-primary-foreground border border-primary",
          fallbackTextClassName[size],
          "flex items-center justify-center"
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
