# Image Text SAnswer Interaction

This interaction allows users to guess what an image shows or what place it represents. It displays an image card to the user with a text input for their guess and a hint button.

## Features

- **Image Display**: Shows the main image for the user to guess
- **Text Input**: Users can type their answer in a textbox
- **Hint System**: Connected to the game engine with a popup hint component (reuses the same hint system as fill-blank-text)
- **Guess Validation**: Compares user input with the correct answer
- **Responsive Design**: Works on all screen sizes
- **Intro Tutorial**: Shows a brief introduction before starting

## Props

- `stage`: The game stage data containing the image, question, answer, and optional hints
- `onAnswer`: Callback function called when the user submits an answer
- `disabled`: Whether the interaction is disabled
- `retryCount`: Used to reset the interaction state
- `showIntro`: Whether to show the introduction screen
- `onIntroComplete`: Callback when the intro is completed
- `hintsRemaining`: Number of hints available to the user
- `onUseHint`: Callback when a hint is used

## Hint System

The hint system is connected to the game engine and uses the same `FillBlankTextHintPopup` component as the fill-blank-text interaction. This ensures consistency across the game.

## Files Created

- `image-text-answer-interaction.tsx`: Main interaction component
- `readme.md`: This documentation

## Integration

This interaction is automatically integrated into the `InteractionRenderer` component and will be displayed when a stage with type `"image-text-answer"` is encountered.