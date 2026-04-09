import { useRef, useEffect, useState } from 'react'
import { words as INITIAL_WORDS } from './constants/data'
import ReloadIcon from './Icons/ReloadIcon'

const INITIAL_TIME = 30

function Word({ word, typedWord, isActive, isPast }) {
  const letters = word.split('')
  
  // Si la palabra ya pasó (isPast = true), revisamos si fue del todo correcta o tiene defectos
  const isPerfect = typedWord === word
  const isMarked = isPast && (!typedWord || !isPerfect)

  return (
    <word className={`${isActive ? 'active' : ''} ${isMarked ? 'marked' : ''} ${isPast && isPerfect ? 'correct' : ''}`}>
      {letters.map((letter, i) => {
        const typedChar = typedWord ? typedWord[i] : undefined
        const isCorrect = typedChar === letter
        const isIncorrect = typedChar !== undefined && typedChar !== letter
        
        let classNames = []
        if (isCorrect) classNames.push('correct')
        if (isIncorrect) classNames.push('incorrect')
        
        // Simular el cursor imperativo original
        let isActiveLetter = false
        let isLast = false
        
        if (isActive) {
          const typedLength = typedWord ? typedWord.length : 0
          if (i === typedLength) {
            isActiveLetter = true
          } else if (i === letters.length - 1 && typedLength >= letters.length) {
            isActiveLetter = true
            isLast = true
          }
        }
        
        if (isActiveLetter) classNames.push('active')
        if (isLast) classNames.push('is-last')
        
        return (
          <letter key={i} className={classNames.join(' ')}>
            {letter}
          </letter>
        )
      })}
    </word>
  )
}

function App() {
  const [words, setWords] = useState([])
  const [typedInputs, setTypedInputs] = useState([''])
  const [status, setStatus] = useState('idle') // 'idle', 'playing', 'finished'
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  
  const $inputRef = useRef(null)

  useEffect(() => {
    startGame()
  }, [])

  // Cronómetro puro y declarativo
  useEffect(() => {
    if (status === 'playing' && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timerId)
    } else if (timeLeft <= 0 && status === 'playing') {
      setStatus('finished')
    }
  }, [status, timeLeft])

  // Manejo de foco global. Siempre mandamos el cursor al input oculto.
  useEffect(() => {
    const focusInput = () => {
      if ($inputRef.current) $inputRef.current.focus()
    }
    window.addEventListener('keydown', focusInput)
    window.addEventListener('click', focusInput)
    return () => {
      window.removeEventListener('keydown', focusInput)
      window.removeEventListener('click', focusInput)
    }
  }, [])

  function startGame() {
    const shuffled = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 50)
    setWords(shuffled)
    setTypedInputs([''])
    setTimeLeft(INITIAL_TIME)
    setStatus('playing')
    if ($inputRef.current) $inputRef.current.focus()
  }

  function handleKeyDown(e) {
    if (status !== 'playing') return

    const { key } = e
    const currentWordIndex = typedInputs.length - 1
    const currentInput = typedInputs[currentWordIndex]

    if (key === ' ') {
      e.preventDefault()
      // Si damos espacio, avanzamos de palabra instanciando un array nuevo
      if (currentWordIndex < words.length - 1) {
        setTypedInputs(prev => [...prev, ''])
      }
    }

    if (key === 'Backspace') {
      // Si borramos y estamos al principio de la palabra, y no es la primera, volvemos a la anterior
      if (currentInput === '' && currentWordIndex > 0) {
        e.preventDefault()
        setTypedInputs(prev => prev.slice(0, -1))
      }
    }
  }

  function handleChange(e) {
    if (status !== 'playing') return
    const value = e.target.value
    
    // Evitamos escribir más allá del largo de la palabra original
    const currentWordIndex = typedInputs.length - 1
    const targetWord = words[currentWordIndex]
    
    if (targetWord && value.length > targetWord.length) return
    
    setTypedInputs(prev => {
      const newInputs = [...prev]
      newInputs[newInputs.length - 1] = value
      return newInputs
    })
  }

  // Las analíticas se derivan en el render de manera pura.
  let correctLettersCount = 0
  let incorrectLettersCount = 0
  let correctWordsCount = 0

  words.forEach((word, index) => {
    const typedWord = typedInputs[index]
    if (typedWord === undefined) return
    
    let isWordCorrect = true
    for (let i = 0; i < word.length; i++) {
        const expected = word[i]
        const typed = typedWord[i]
        
        if (typed !== undefined) {
             if (typed === expected) correctLettersCount++
             else {
                 incorrectLettersCount++
                 isWordCorrect = false
             }
        } else {
             isWordCorrect = false
        }
    }
    
    // Si escribió la palabra entera y no tuvo fallas, cuenta como WPM correcto.
    if (isWordCorrect && typedWord.length === word.length) {
        correctWordsCount++
    }
  })

  // Cálculos finales WPM/Precisión
  const elapsedMinutes = INITIAL_TIME / 60
  const wpm = (correctWordsCount / elapsedMinutes) || 0
  const totalLetters = correctLettersCount + incorrectLettersCount
  const accuracy = totalLetters > 0 ? (correctLettersCount / totalLetters) * 100 : 0

  return (
    <main>
      {status !== 'finished' ? (
        <section id='game'>
          <time>{timeLeft}</time>
          <p>
            {words.map((word, i) => {
              const isActive = i === typedInputs.length - 1
              const isPast = i < typedInputs.length - 1
              const typedWord = typedInputs[i]
              
              return (
                <Word 
                  key={i} 
                  word={word} 
                  typedWord={typedWord} 
                  isActive={isActive} 
                  isPast={isPast} 
                />
              )
            })}
          </p>
          <input 
            autoFocus 
            ref={$inputRef} 
            value={typedInputs[typedInputs.length - 1] || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </section>
      ) : (
        <section id='results' style={{ display: 'flex' }}>
          <h2>WPM:</h2>
          <h3>{wpm.toFixed(1)}</h3>

          <h2>Accuracy:</h2>
          <h3>{accuracy.toFixed(2)}%</h3>

          <button onClick={startGame}>
            <ReloadIcon />
          </button>
        </section>
      )}
    </main>
  )
}

export default App
