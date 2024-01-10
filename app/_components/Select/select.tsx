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
      cursor: 'pointer',
      // borderColor: `var(--input-text)`,
      // color: `var(--input-text)`,
      // fontSize: '16px',
      // width: '100%',
      // minHeight: 'unset',
      // zIndex: `var(--zIndex-default)`,
      '@media (min-width: 800px)': {
        alignItems: 'flex-start',
        fontSize: '14px',
        lineHeight: '28px',
        minHeight: 'unset'
        // height: '30px'
      }
    }),
    input: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`,
      // height: '40px',
      // lineHeight: '40px',
      // margin: 0,
      // position: 'absolute',
      // top: 0,
      // left: '8px',
      // right: '8px',
      // bottom: 0,
      '@media (min-width: 800px)': {
        fontSize: '14px',
        lineHeight: '30px',
        margin: '0 2px',
        minHeight: 'unset',
        height: '30px',
        padding: '0 2px'
      }
    }),
    option: (provided: CSSProperties, state: OptionProps) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? '#7e5a6c'
        : state.isSelected
          ? '#a48996'
          : `var(--input-background)`,

      color:
        state.isFocused || state.isSelected ? 'white' : `var(--input-text)`,
      // borderRadius: '4px',
      // padding: '0 4px',
      cursor: 'pointer'
      // marginBottom: '4px'
    }),
    placeholder: (provided: CSSProperties) => ({
      ...provided,
      color: '#9299a6'
    }),
    clearIndicator: (provided: CSSProperties) => ({
      ...provided
      // height: 'calc(var(--input-element-h) - 2px)',
      // '@media (min-width: 800px)': {
      //   height: '30px',
      //   lineHeight: '28px'
      // }
    }),
    dropdownIndicator: (provided: CSSProperties) => ({
      ...provided
      // color: `var(--input-text)`,
      // height: 'calc(var(--input-element-h) - 2px)',
      // '@media (min-width: 800px)': {
      //   height: '30px',
      //   lineHeight: '28px'
      // }
    }),
    singleValue: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`,
      // height: '38px',
      // lineHeight: '38px',
      '@media (min-width: 800px)': {
        // position: 'relative',
        // top: 0,
        fontSize: '14px',
        lineHeight: '28px',
        minHeight: 'unset',
        height: '28px'
      }
    }),
    multiValue: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: 'var(--main-color)',
      '@media (min-width: 800px)': {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        fontSize: '14px',
        lineHeight: '20px',
        margin: '5px 2px 0 2px',
        minHeight: 'unset',
        height: '20px'
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
      // color: `var(--input-text)`,
      // columnGap: '4px',
      // display: 'flex',
      // flexDirection: 'row',
      // height: '40px',
      // padding: '0 8px',
      '@media (min-width: 800px)': {
        //   fontSize: '14px',
        alignItems: 'flex-start',
        minHeight: 'unset',
        // height: '30px',
        padding: '0 8px'
        //   position: 'absolute',
        //   lineHeight: '28px',
        //   right: '24px',
        //   left: 0,
        //   top: 0,
        //   bottom: 0
      }
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: `var(--input-background)`
      // color: `var(--input-text)`,
      // marginBottom: '16px',
      // zIndex: `var(--zIndex-overBase)`,
      // padding: '0 4px'
    }),
    indicatorsContainer: (provided: CSSProperties) => ({
      ...provided,
      //   position: 'absolute',
      //   right: '0px',
      //   height: '40px',
      //   lineHeight: '36px',
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
