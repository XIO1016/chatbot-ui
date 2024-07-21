import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons-react"

interface Props {
  onClick: any
  side: "left" | "right"
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
    <>
      <button
        className={`fixed top-5 ${
          side === "right" ? "right-[270px]" : "left-[270px]"
        } sm: z-50 size-7 hover:text-gray-400 sm:top-0.5 dark:text-white dark:hover:text-gray-300${
          side === "right" ? "right-[270px]" : "left-[270px]"
        } sm:size-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {side === "right" ? <IconArrowBarRight /> : <IconArrowBarLeft />}
      </button>
      <div
        onClick={onClick}
        className="absolute left-0 top-0 z-10 size-full bg-black opacity-70 sm:hidden"
      ></div>
    </>
  )
}

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  return (
    <button
      className={`fixed top-2.5 ${
        side === "right" ? "right-2" : "left-2"
      } sm: z-50 size-7 text-white hover:text-gray-400 sm:top-0.5 dark:text-white dark:hover:text-gray-300${
        side === "right" ? "right-2" : "left-2"
      } sm:size-8 sm:text-neutral-700`}
      onClick={onClick}
    >
      {side === "right" ? <IconArrowBarLeft /> : <IconArrowBarRight />}
    </button>
  )
}
