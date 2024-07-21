"use client"

import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"
// import {GTNIcon} from "../icons/gtn-icon.svg"
// import {GTNSVG} from "@/components/icons/gtn-svg";

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    // <Link
    //   className="flex cursor-pointer flex-col items-center hover:opacity-50"
    //   href="https://www.chatbotui.com"
    //   target="_blank"
    //   rel="noopener noreferrer"
    // >
    <div className="flex flex-col items-center">
      <div className="mb-2">
        <img src="/gtn-icon.svg" alt="My Icon" width={100} height={100} />
        {/*<ChatbotUISVG theme={theme} scale={0.3}/>*/}
        {/*<GTNSVG scale={0.3}/>*/}
      </div>

      {/*<div className="text-4xl font-bold tracking-wide"> UI</div>*/}
    </div>
    // </Link>
  )
}
