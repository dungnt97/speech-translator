# Speech Translator

A real-time speech translation application that converts English speech to Vietnamese text. Built with Next.js 15, React, and OpenAI's APIs.

## Features

- 🎤 Real-time speech recognition
- 🔄 Instant English to Vietnamese translation
- 🔊 System audio capture support
- 🎯 Multiple audio input source selection
- 🌓 Smart theme system with:
  - Automatic dark/light mode based on system preferences
  - Manual theme toggle
  - Persistent theme selection
- 📱 Responsive design for all devices
- 🎨 Modern UI with smooth transitions

## Prerequisites

- Node.js 18+
- npm or yarn
- Chrome/Edge browser (for Speech Recognition API support)
- OpenAI API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/speech-translator.git
cd speech-translator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

1. Select your audio input source (microphone or system audio)
2. Click "Start Recording" to begin speech recognition
3. Speak in English - your speech will be transcribed in real-time
4. The Vietnamese translation will appear automatically
5. Click "Stop Recording" to end the session
6. Use "Clear All" to reset both input and output

## Tech Stack

- Next.js 15.1.5
- React 18
- TypeScript
- Tailwind CSS
- OpenAI API
- Web Speech API
- MediaRecorder API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Dung Ngo (dungngo97@gmail.com)

## Theme System

The application includes a sophisticated theme system powered by `next-themes`:

- **System Default**: Automatically matches your system's theme preference
- **Manual Control**: Toggle between light and dark modes with a single click
- **Persistence**: Your theme preference is saved and persists across sessions
- **Smooth Transitions**: Elegant transitions between themes
- **Accessibility**: High contrast ratios in both light and dark modes

To toggle the theme:

1. Click the theme toggle button in the top-right corner
2. Choose between light, dark, or system default
3. The app will remember your preference for future visits
