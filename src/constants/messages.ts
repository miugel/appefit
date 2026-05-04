// Error messages
export const ERROR_MESSAGES = {
  CONNECTION: "Something went wrong. Check your connection and try again.",
  CAMERA: "We had trouble opening your camera.",
  PERMISSION_CAMERA: "Camera access is needed to take an ingredient photo.",
  NO_INGREDIENTS: "Add a photo or type ingredients before generating recipes.",
  NO_FIX_TEXT: "Add the issue first, then regenerate.",
  PHOTOS_TOO_LARGE: "Those photos are too large to send. Remove one photo or retake a smaller set.",
};

// Timing constants (milliseconds)
export const TIMING = {
  MESSAGE_ROTATION_INTERVAL: 4500,
  FADE_OUT_DURATION: 300,
  FADE_IN_DURATION: 400,
};

// UI constants
export const UI = {
  CONFIDENCE_THRESHOLD: 0.45,
  MAX_REFRESHES_PER_SESSION: 3,
  CORRECTION_CONTEXT_MAX_LENGTH: 500,
};
