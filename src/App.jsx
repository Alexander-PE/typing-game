import { useRef, useEffect } from 'react'
import './App.css'

function App() {
  const timeRef = useRef(null)
  const paragraphRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    startGame()
    startEvents()
  }, [])

  const initialTime = 30

  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'

  let words = []
  let currentTime = initialTime

  const startGame = () => {
    words = text.split(' ')
    currentTime = initialTime

    timeRef.current.textContent = currentTime

    paragraphRef.current.innerHTML = words.map((word, index) => {
      const letters = word.split('')

      return `<word>
        ${letters.map(letter => `<letter>${letter}</letter>`).join('')}
        </word>`
    }).join('')

    const intervalId = setInterval(() => {
      currentTime--
      timeRef.current.textContent = currentTime
      if (currentTime === 0) {
        clearInterval(intervalId)
        gameOver()
      }
    }, 1000)

  }
  const startEvents = () => { }
  const gameOver = () => { 
    alert('Game Over')
  }
  return (
    <main>
      <section id='game'>
        <time ref={timeRef}></time>
        <p ref={paragraphRef}></p>
        <input autoFocus ref={inputRef} />
      </section>
    </main>
  )
}

export default App
