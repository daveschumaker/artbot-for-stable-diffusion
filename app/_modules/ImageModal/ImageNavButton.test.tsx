/** @jest-environment jsdom */
import { fireEvent, render } from '@testing-library/react'
import ImageNavButton from './ImageNavButton'

it.each(['NEXT', 'PREV'])(
  'keeps %s navigation styling props off the DOM',
  (action) => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const handleOnClick = jest.fn()
      const { container } = render(
        <ImageNavButton action={action} handleOnClick={handleOnClick} />
      )
      expect(error.mock.calls.flat().join(' ')).not.toContain(
        'You can only pass the action prop'
      )
      const navigation = container.firstElementChild!
      expect(navigation.hasAttribute('action')).toBe(false)
      fireEvent.click(navigation)
      expect(handleOnClick).toHaveBeenCalledTimes(1)
    } finally {
      error.mockRestore()
    }
  }
)
