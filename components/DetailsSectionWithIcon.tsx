import React from 'react'

type DetailsSectionWithIconPropsType = {
  icon: React.ReactElement
  title: string
  text: string
  filled?: boolean
  horizontal?: boolean
}

const DetailsSectionWithIcon = ({
  icon,
  text,
  title,
  filled = false,
  horizontal = false,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: DetailsSectionWithIconPropsType) => {
  return (
    <div
      className={`flex ${horizontal ? 'flex-row items-start gap-5' : 'flex-col items-center sm:items-start'}`}
    >
      <div
        className={`text-primary-500 ring-primary-500 rounded-md p-2 ring-2 ${filled ? 'bg-primary-500 text-white' : null}`}
      >
        {icon}
      </div>
      <div className={`${horizontal ? 'mt-0' : 'mt-4'}`}>
        <dt className="text-primary-500 font-semibold">{title}</dt>
        <dd
          className={`mt-2 leading-7 text-gray-600 sm:text-start dark:text-gray-400 ${horizontal ? 'text-start' : 'text-center'}`}
        >
          {text}
        </dd>
      </div>
    </div>
  )
}

export default DetailsSectionWithIcon
