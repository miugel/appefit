export function appendTranscript(currentValue: string, transcript: string) {
  if (!currentValue.trim()) {
    return transcript.trim();
  }

  return `${currentValue.trim()}, ${transcript.trim()}`;
}
