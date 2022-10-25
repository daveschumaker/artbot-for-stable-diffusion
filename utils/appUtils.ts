export const isInstalledPwa = () => {
  // @ts-ignore
  if (window?.navigator?.standalone) {
    // Installed on iOS
    return true
  } else if (window?.matchMedia('(display-mode: standalone)')?.matches) {
    // Installed on Android
    return true
  }

  return false
}

// Simple UUID generator for ArtBot's own purposes (tracking groups of images generated at once)
// Since this will only be used for lookup's on a user's own device, it's safe to use.
// Do not seriously use it in any sort of mission critical production environment.
// https://stackoverflow.com/a/2117523
export function uuidv4() {
  //@ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
