# Typing Game

A minimal browser typing test built with **React** and **Vite**. You type a shuffled passage against a fixed timer; when time runs out, you see **WPM** (words per minute) and **accuracy** based on how you performed.

---

## Features

- **30-second timed run** — countdown shown at the top of the game area.
- **50 random words** per round, drawn from a built-in word list and shuffled each start.
- **Live feedback** — each letter is colored as you type (correct / incorrect); the active word is highlighted; words with at least one mistake get a red underline when you move on.
- **Space** advances to the next word (current word is scored as fully correct or “marked” if any letter was wrong).
- **Backspace** edits the current word; with an **empty** input at the start of a word, backspace returns to the **previous** word so you can fix mistakes.
- **Hidden input + global key focus** — almost any key refocuses the typing field so play feels smooth.
- **Results screen** — WPM and accuracy after the timer hits zero; **reload** starts a new round with a fresh shuffle.

---

## Prerequisites

- **Node.js** 18+ (recommended; Vite 5 expects a current Node version)
- **npm** (or use `pnpm` / `yarn` if you prefer — adjust commands accordingly)

---

## How to Play

1. **Focus** — Click the page or press a key so the hidden input is focused (the game tries to focus it on keydown).
2. **Type** the highlighted word letter by letter. Green = correct, red = wrong character for that position.
3. Press **Space** to submit the current word and move to the next.  
   - If every typed letter in that word matched the target, the word counts as **correct** for WPM.  
   - If any letter was wrong or missing, the word is **marked** (visual underline); it does **not** count toward the “correct words” WPM tally.
4. Use **Backspace** to correct within the word. At the **beginning** of a word with **empty** input, backspace jumps back to the **previous** word and restores what you had typed there (wrong letters appear as `*` in the input while you edit).
5. When the timer reaches **0**, the game hides the passage and shows **WPM** and **Accuracy**. Use the reload button to play again.

**Note:** On the **last** word of the passage, **Space** does not advance (there is no next word); the timer keeps running until it finishes.

---

## Scoring (How Results Are Calculated)

### WPM (words per minute)

Only words that were submitted with **all letters correct** count:

```text
WPM = (number of correct words) ÷ (test duration in minutes)
```

The test duration is **30 seconds** (`0.5` minutes), so effectively:

```text
WPM = correct words × 2
```

(The implementation uses `correctWords / (initialTime / 60)` and displays one decimal place.)

### Accuracy

Accuracy uses **every letter** that was ever classified as correct or incorrect in the paragraph (typically letters you actually typed in the current or past words):

```text
Accuracy = (correct letters) ÷ (correct letters + incorrect letters) × 100%
```

If you have not typed anything that produced letter states, accuracy shows **0%**.
