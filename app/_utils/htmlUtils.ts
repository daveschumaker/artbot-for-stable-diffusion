/**
 * formatSentence
 * @description Take a string "Favorite models toggle" and converts to a string that can be used for attaching
 * to ids (specifically, for React-tooltip, which looks for an ID). -> `favorite_models_toggle`
 * @param sentence string
 * @returns string
 */
export const formatStringRemoveSpaces = (sentence: string): string => {
  // Convert to lower case
  sentence = sentence.toLowerCase()

  // Replace non-alpha-numeric characters and spaces with underscores
  sentence = sentence.replace(/[^a-z0-9]/g, '_')

  return sentence
}
