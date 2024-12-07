"use client";

import * as React from "react";
import {useTheme} from "next-themes";

import {Button} from "@/components/ui/button";
import {SunMedium, SunMoon} from "lucide-react";

export function ModeToggle() {
    const {setTheme} = useTheme();
    const getTheme = () => {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem("theme");
        }
        return "system";
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(getTheme() === "dark" ? "light" : "dark")}
        >
            <SunMoon
                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                strokeWidth={1}
            />
            <SunMedium
                size={28}
                strokeWidth={1}
                className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
