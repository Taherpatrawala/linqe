import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    clickable?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto",
    elg: "w-24"
};

const sizeValues = {
    sm: { width: 72, height: 24 },
    md: { width: 96, height: 32 },
    lg: { width: 120, height: 40 },
    elg: "w-24"
};

export function Logo({ size = "md", clickable = false, className = "" }: LogoProps) {
    const logoElement = (
        <Image
            src="/logo.png"
            alt="Linqe Logo"
            width={sizeValues[size].width}
            height={sizeValues[size].height}
            className={`${sizeClasses[size]} ${className}`}
            priority
        />
    );

    if (clickable) {
        return (
            <Link href="/" className="flex items-center">
                {logoElement}
            </Link>
        );
    }

    return logoElement;
}