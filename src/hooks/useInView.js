import { useEffect, useState } from 'react'

/** True while the element is (near) the viewport — used to pause WebGL rendering. */
export default function useInView(ref, rootMargin = '200px') {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}
