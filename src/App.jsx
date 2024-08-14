import { useRef, useEffect } from 'react'
import { words as INITIAL_WORDS } from './constants/data'
import './App.css'

function App() {
  const $timeRef = useRef(null)
  const $paragraphRef = useRef(null)
  const $inputRef = useRef(null)
  const $resultsRef = useRef(null)
  const $wpmRef = useRef(null)
  const $accuracyRef = useRef(null)
  const $gameRef = useRef(null)

  useEffect(() => {
    startGame()
    startEvents()
  }, [])

  const initialTime = 30

  let words = []
  let currentTime = initialTime


  function startGame() {
    words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 50)
    currentTime = initialTime

    $timeRef.current.textContent = currentTime

    $paragraphRef.current.innerHTML = words.map((word, index) => {
      const letters = word.split('')

      return `<word>
      ${letters.map(letter => `<letter>${letter}</letter>`).join('')}
      </word>`
    }).join('')

    const $firstWord = $paragraphRef.current.querySelector('word')
    $firstWord.classList.add('active')
    $firstWord.querySelector('letter').classList.add('active')

    const intervalId = setInterval(() => {
      currentTime--
      $timeRef.current.textContent = currentTime
      if (currentTime === 0) {
        clearInterval(intervalId)
        gameOver()
      }
    }, 1000)
  }

  function startEvents() {
    window.addEventListener('keydown', () => { $inputRef.current.focus() })
    $inputRef.current.addEventListener('keydown', handleKeyDown)
    $inputRef.current.addEventListener('keyup', handleKeyUp)
  }

  function handleKeyDown(e) {
    const $currentWord = $paragraphRef.current.querySelector('word.active')
    const $currentLetter = $currentWord.querySelector('letter.active')

    const { key } = e
    if (key === ' ') {
      e.preventDefault()

      const $nextWord = $currentWord.nextElementSibling
      const $nextLetter = $nextWord.querySelector('letter')

      $currentWord.classList.remove('active', 'marked')
      $currentLetter.classList.remove('active')

      $nextWord.classList.add('active')
      $nextLetter.classList.add('active')

      $inputRef.current.value = ''

      const hasMissedLetter = $currentWord.querySelectorAll('letter:not(.correct)').length > 0

      const classToAdd = hasMissedLetter ? 'marked' : 'correct'
      $currentWord.classList.add(classToAdd)
    }

    if (key === 'Backspace') {
      const $prevWord = $currentWord.previousElementSibling
      const $prevLetter = $currentLetter.previousElementSibling

      if (!$prevWord && !$prevLetter) {
        e.preventDefault()
        return
      }

      const $wordMarked = $paragraphRef.current.querySelector('word.marked')
      if (!$prevLetter && $wordMarked) {
        e.preventDefault()
        $prevWord.classList.remove('marked')
        $prevWord.classList.add('active')

        const $letterToGo = $prevWord.querySelector('letter:last-child')

        $currentLetter.classList.remove('active')
        $letterToGo.classList.add('active')

        $inputRef.current.value = [
          ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
        ].map($el => {
          return $el.classList.contains('correct') ? $el.innerText : '*'
        }).join('')
      }
    }
  }
  function handleKeyUp() {
    const $currentWord = $paragraphRef.current.querySelector('word.active')
    const $currentLetter = $currentWord.querySelector('letter.active')

    const currentWord = $currentWord.innerText.trim()
    $inputRef.current.maxLength = currentWord.length

    const $allLetters = $currentWord.querySelectorAll('letter')

    $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))

    $inputRef.current.value.split('').forEach((char, index) => {
      const $letter = $allLetters[index]
      const letterToCheck = currentWord[index]

      const isCorrect = char === letterToCheck
      const letterClass = isCorrect ? 'correct' : 'incorrect'

      $letter.classList.add(letterClass)
    })

    $currentLetter.classList.remove('active')
    const inputLength = $inputRef.current.value.length
    const $nextActiveLetter = $allLetters[inputLength]

    if ($nextActiveLetter) {
      $nextActiveLetter.classList.add('active')
    } else {
      $currentLetter.classList.add('active', 'is-last')
      // TODO: game over si no hay otra palabra
    }
  }

  function gameOver() {
    $gameRef.current.style.display = 'none'
    $resultsRef.current.style.display = 'flex'

    const correctWords = $paragraphRef.current.querySelectorAll('word.correct').length
    const correctLetters = $paragraphRef.current.querySelectorAll('letter.correct').length
    const incorrectLetters = $paragraphRef.current.querySelectorAll('letter.incorrect').length

    const totalLetters = correctLetters + incorrectLetters
    const acuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0

    const wpm = correctWords * 60 / 10
    $wpmRef.current.textContent = wpm
    $accuracyRef.current.textContent = `${acuracy.toFixed(2)}%`
  }

  return (
    <main>
      <section id='game' ref={$gameRef}>
        <time ref={$timeRef}></time>
        <p ref={$paragraphRef}></p>
        <input autoFocus ref={$inputRef} />
      </section>
      <section id='results' ref={$resultsRef}>
        <h2>WPM:</h2>
        <h3 ref={$wpmRef}></h3>

        <h2>Accuracy:</h2>
        <h3 ref={$accuracyRef}></h3>
      </section>
    </main>
  )
}

export default App
