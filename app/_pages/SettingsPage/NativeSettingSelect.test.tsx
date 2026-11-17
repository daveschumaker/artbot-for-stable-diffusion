/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import NativeSettingSelect from './NativeSettingSelect'
it('keeps option text out of its accessible field name', () => {
  const change = jest.fn()
  render(
    <NativeSettingSelect
      label="Theme choice"
      value="light"
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
      ]}
      onChange={change}
    />
  )
  const select = screen.getByRole('combobox', {
    name: 'Theme choice'
  })
  fireEvent.change(select, { target: { value: 'dark' } })
  expect(change).toHaveBeenCalledWith('dark')
})
