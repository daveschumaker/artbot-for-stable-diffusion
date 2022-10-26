import { createGlobalStyle } from 'styled-components'

interface DefaultTheme {
  body: string
  text: string
}

export const GlobalStyles = createGlobalStyle<{ theme: DefaultTheme }>`
  body, html {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    margin: 0;
    transition: all 0.50s linear;
  }

  body {
    min-height: calc(100% + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
  `
