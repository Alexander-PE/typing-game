import { useRef, useEffect } from 'react'
import { words as INITIAL_WORDS } from './constants/data'
import ReloadIcon from './Icons/ReloadIcon'

function App() {
  const $timeRef = useRef(null)
  const $paragraphRef = useRef(null)
  const $inputRef = useRef(null)
  const $resultsRef = useRef(null)
  const $wpmRef = useRef(null)
  const $accuracyRef = useRef(null)
  const $gameRef = useRef(null)
  const $buttonRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const currentTimeRef = useRef(30)

  useEffect(() => {
    startGame()
    startEvents()
    return () => {
      if (timerIntervalRef.current != null) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [])

  const initialTime = 30

  let words = []


  function startGame() {
    if (timerIntervalRef.current != null) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 50)
    currentTimeRef.current = initialTime

    $timeRef.current.textContent = currentTimeRef.current

    $paragraphRef.current.innerHTML = words.map((word, index) => {
      const letters = word.split('')

      return `<word>
      ${letters.map(letter => `<letter>${letter}</letter>`).join('')}
      </word>`
    }).join('')

    const $firstWord = $paragraphRef.current.querySelector('word')
    $firstWord.classList.add('active')
    $firstWord.querySelector('letter').classList.add('active')

    timerIntervalRef.current = setInterval(() => {
      currentTimeRef.current--
      $timeRef.current.textContent = currentTimeRef.current
      if (currentTimeRef.current <= 0) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
        gameOver()
      }
    }, 1000)
  }

  function startEvents() {
    window.addEventListener('keydown', () => { $inputRef.current.focus() })
    $inputRef.current.addEventListener('keydown', handleKeyDown)
    $inputRef.current.addEventListener('keyup', handleKeyUp)
    $buttonRef.current.addEventListener('click', () => {
      $gameRef.current.style.display = 'flex'
      $resultsRef.current.style.display = 'none'
      $inputRef.current.value = ''
      startGame()
    })
  }

  function handleKeyDown(e) {
    const $currentWord = $paragraphRef.current.querySelector('word.active')
    const $currentLetter = $currentWord.querySelector('letter.active')

    const { key } = e
    if (key === ' ') {
      e.preventDefault()

      const $nextWord = $currentWord.nextElementSibling
      if (!$nextWord) {
        return
      }

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

      const inputEmpty = $inputRef.current.value === ''
      if (!$prevLetter && $prevWord && inputEmpty) {
        e.preventDefault()
        $currentWord.classList.remove('active')

        $prevWord.classList.remove('marked', 'correct')
        $prevWord.classList.add('active')

        const $letterToGo = $prevWord.querySelector('letter:last-child')

        $currentLetter.classList.remove('active')
        $letterToGo.classList.add('active')

        $inputRef.current.value = [
          ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
        ].map($el => {
          return $el.classList.contains('correct') ? $el.textContent : '*'
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
    }
  }

  function gameOver() {
    if (timerIntervalRef.current != null) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    $gameRef.current.style.display = 'none'
    $resultsRef.current.style.display = 'flex'

    const correctWords = $paragraphRef.current.querySelectorAll('word.correct').length
    const correctLetters = $paragraphRef.current.querySelectorAll('letter.correct').length
    const incorrectLetters = $paragraphRef.current.querySelectorAll('letter.incorrect').length

    const totalLetters = correctLetters + incorrectLetters
    const acuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0

    const elapsedMinutes = initialTime / 60
    const wpm = elapsedMinutes > 0 ? correctWords / elapsedMinutes : 0
    $wpmRef.current.textContent = wpm.toFixed(1)
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

        <button ref={$buttonRef}>
          <ReloadIcon />
        </button>
      </section>
    </main>
  )
}

export default App
