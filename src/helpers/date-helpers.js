export const dateToTick = () => {
  const now = new Date()

  // the number of .net ticks at the unix epoch
  const epochTicks = 621355968000000000

  // there are 10000 .net ticks per millisecond
  const ticksPerMillisecond = 10000

  return epochTicks + (now.getTime() * ticksPerMillisecond)
}

export default { 
  dateToTick
}
