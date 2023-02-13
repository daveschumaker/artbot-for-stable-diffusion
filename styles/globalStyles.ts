import { createGlobalStyle } from 'styled-components'

interface DefaultTheme {
  body: string
  text: string
}

export const GlobalStyles = createGlobalStyle<{ theme: DefaultTheme }>`
  html {
    min-height: calc(100% + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }

  body, html {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    padding: 0;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    letter-spacing: 0.4px;
    margin: 0;
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

  .canvas-container {
    margin: 0 auto;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background-color: #222222;
    }
  }
  `
