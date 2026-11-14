/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import InputSwitchV2 from '.'
it('names its native checkbox from the visible setting label', () => {
  const change = jest.fn()
  render(
    <InputSwitchV2
      label="Readable setting"
      checked={false}
      handleSwitchToggle={change}
    />
  )
  const checkbox = screen.getByRole('checkbox', { name: 'Readable setting' })
  fireEvent.click(checkbox)
  expect(change).toHaveBeenCalledTimes(1)
})
it('uses native disabled semantics and ignores activation when disabled', () => {
  const change = jest.fn()
  render(
    <InputSwitchV2
      label="Unavailable setting"
      checked={false}
      disabled
      handleSwitchToggle={change}
    />
  )
  const checkbox = screen.getByRole('checkbox', {
    name: 'Unavailable setting'
  }) as HTMLInputElement
  expect(checkbox.disabled).toBe(true)
  fireEvent.click(checkbox)
  expect(change).not.toHaveBeenCalled()
})
