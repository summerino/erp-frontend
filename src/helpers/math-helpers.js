export const randomNumber = (min, max, exclude = []) => {
  let random = null

  while (!random) {
    const temp = Math.floor(Math.random() * (max - min + 1)) + min
    if (exclude.indexOf(temp) === -1) random = temp
  }

  return random
}

export default { 
  randomNumber
}
