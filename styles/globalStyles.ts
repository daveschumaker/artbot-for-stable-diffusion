import { createGlobalStyle } from 'styled-components'

interface DefaultTheme {
  body: string
  text: string
}

export const GlobalStyles = createGlobalStyle<{ theme: DefaultTheme }>`
  @font-face{
    font-family: "Roboto Slab"
    font-size: 16px
    line-height: 1.6;
  }

  @font-face{
    font-size: 16px
    line-height: 1.6
    letter-spacing: 0.1px
    word-spacing: -0.7px
    visibility: visible
    font-family: "Times New Roman";
  }

  body, html {
    background: #080B0C;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    padding: 0;
    font-family: 'Roboto Slab', "Times New Roman", serif;
    letter-spacing: 0.4px;
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

  .canvas-container {
    margin: 0 auto;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background-color: #080B0C;
    }
  }
  `
