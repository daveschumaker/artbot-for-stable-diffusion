import { CSSProperties, useId } from 'react'
import Select, { OptionProps } from 'react-select'

import { SelectComponentProps } from '_types/artbot'

const SelectComponent = (props: SelectComponentProps) => {
  // Fixes a bunch of weird SSR related issues with react-select
  // See: https://github.com/JedWatson/react-select/issues/3590
  const id = useId()

  const { ...rest } = props

  const customStyles = {
    container: (provided: CSSProperties) => ({
      ...provided,
      width: '100%'
    }),
    control: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: props.isDisabled ? '#adadad' : `var(--input-background)`,
      borderColor: `var(--input-text)`,
      color: `var(--input-text)`,
      fontSize: '16px',
      width: '100%',
      minHeight: 'unset',
      zIndex: `var(--zIndex-default)`,
      height: '40px',
      '@media (min-width: 800px)': {
        fontSize: '14px',
        height: '30px',
        lineHeight: '28px'
      }
    }),
    input: () => ({
      color: `var(--input-text)`,
      height: '40px',
      lineHeight: '40px',
      margin: 0,
      position: 'absolute',
      top: 0,
      left: '8px',
      right: '8px',
      bottom: 0,
      '@media (min-width: 800px)': {
        fontSize: '14px',
        height: '28px',
        lineHeight: '28px'
      }
    }),
    option: (provided: CSSProperties, state: OptionProps) => ({
      backgroundColor: state.isFocused ? '#7e5a6c' : `var(--input-background)`,
      color: `var(--input-text)`,
      borderRadius: '4px',
      padding: '0 4px',
      cursor: 'pointer',
      marginBottom: '4px'
    }),
    placeholder: () => ({
      color: '#9299a6'
    }),
    clearIndicator: () => ({
      height: 'calc(var(--input-element-h) - 2px)',
      '@media (min-width: 800px)': {
        height: '30px',
        lineHeight: '28px'
      }
    }),
    dropdownIndicator: () => ({
      color: `var(--input-text)`,
      height: 'calc(var(--input-element-h) - 2px)',
      '@media (min-width: 800px)': {
        height: '30px',
        lineHeight: '28px'
      }
    }),
    singleValue: () => ({
      color: `var(--input-text)`,
      height: '38px',
      lineHeight: '38px',
      '@media (min-width: 800px)': {
        fontSize: '14px',
        height: '28px',
        lineHeight: '28px'
      }
    }),
    // multiValueContainer: () => ({
    //   backgroundColor: 'red',
    //   color: `var(--input-text)`,
    //   height: '38px',
    //   lineHeight: '38px',
    //   '@media (min-width: 800px)': {
    //     fontSize: '14px',
    //     height: '28px',
    //     lineHeight: '28px'
    //   }
    // }),
    valueContainer: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`,
      columnGap: '4px',
      display: 'flex',
      flexDirection: 'row',
      height: '40px',
      padding: '0 8px',
      '@media (min-width: 800px)': {
        fontSize: '14px',
        height: '28px',
        position: 'absolute',
        lineHeight: '28px',
        right: '24px',
        left: 0,
        top: 0,
        bottom: 0
      }
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: `var(--input-background)`,
      color: `var(--input-text)`,
      marginBottom: '16px',
      zIndex: `var(--zIndex-overBase)`,
      padding: '0 4px'
    }),
    indicatorsContainer: () => ({
      position: 'absolute',
      right: '0px',
      height: '40px',
      lineHeight: '36px',
      '@media (min-width: 800px)': {
        height: '30px',
        lineHeight: '28px'
      }
    })
  }

  return (
    <Select
      id={id}
      instanceId={id}
      classNamePrefix="select"
      closeMenuOnSelect={props.isMulti ? false : true}
      {...rest}
      //@ts-ignore
      styles={customStyles}
      placeholder="Select..."
    />
  )
}

export default SelectComponent
