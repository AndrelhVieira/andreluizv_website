'use client'

import { motion } from 'framer-motion'
import type { JSX } from 'react'
// eslint-disable-next-line no-duplicate-imports
import { useEffect, useState } from 'react'

const TechTitle = (): JSX.Element => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)
  const titleOptions = ['Frontend', 'React', 'Full Stack', 'Curious', 'Designer']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titleOptions.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.p
      className="font-jost text-4xl leading-snug font-extrabold uppercase sm:text-5xl md:text-7xl lg:text-9xl"
      key={currentTitleIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {titleOptions[currentTitleIndex]}
    </motion.p>
  )
}

export default TechTitle
