import type { JSX } from 'react'
import { MAIN_TECHNOLOGIES } from './technologies'

const TechsMobileForHome = async (): Promise<JSX.Element> => {
  return (
    <div className="items-start space-y-2 pt-8 xl:hidden">
      <div className="flex flex-col gap-5">
        <div className="mb-10">
          <div className="flex flex-shrink-0 flex-wrap items-stretch justify-between gap-10">
            {MAIN_TECHNOLOGIES.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center gap-2">
                <tech.svg width={75} height={75} aria-hidden="true" />
                <p>{tech.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechsMobileForHome
