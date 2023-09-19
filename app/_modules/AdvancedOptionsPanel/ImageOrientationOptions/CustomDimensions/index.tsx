import {
  IconCheck,
  IconEdit,
  IconPlayerPlay,
  IconTrash
} from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import NumberInput from 'app/_components/NumberInput'
import DropdownOptions from 'app/_modules/DropdownOptions'
import { Button } from 'app/_components/Button'
import Input from 'app/_components/Input'
import React, { useCallback, useEffect, useState } from 'react'
import { SetInput } from '_types/artbot'
import { nearestWholeMultiple } from 'app/_utils/imageUtils'
import styles from './component.module.css'

const key = 'CustomDimensions'

interface Props {
  handleClose: () => any
  setInput: SetInput
}

export default function CustomDimensions({ handleClose, setInput }: Props) {
  const [customValues, setCustomValues] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)

  const [idx, setIdx] = useState<number>(0)
  const [name, setName] = useState('')
  const [height, setHeight] = useState(512)
  const [width, setWidth] = useState(512)

  const loadValues = () => {
    try {
      const jsonString = localStorage.getItem(key)
      if (!jsonString) return

      const arrayOfArrays = JSON.parse(jsonString)
      setCustomValues(arrayOfArrays)
    } catch (e) {}
  }

  const saveValues = useCallback(() => {
    const copyArray = [...customValues]
    copyArray[idx] = [name, width, height]
    setCustomValues(copyArray)

    const jsonString = JSON.stringify(copyArray)
    localStorage.setItem(key, jsonString)
  }, [customValues, height, idx, name, width])

  const deleteValue = useCallback(
    (idx: number) => {
      const copyArray = [...customValues]
      copyArray.splice(idx, 1)
      setCustomValues(copyArray)

      const jsonString = JSON.stringify(copyArray)
      localStorage.setItem(key, jsonString)
    },
    [customValues]
  )

  useEffect(() => {
    loadValues()
  }, [])

  return (
    <DropdownOptions
      handleClose={handleClose}
      title="Custom dimensions"
      top="46px"
    >
      <div className={styles.ContentWrapper}>
        {editMode && (
          <>
            <div style={{ paddingBottom: '4px' }}>
              Name:
              <Input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                value={name}
              />
            </div>
            <div style={{ paddingBottom: '4px' }}>
              Width:
              <NumberInput
                min={64}
                max={2048}
                onInputChange={(e) => {
                  setWidth(Number(e.target.value))
                }}
                onMinusClick={() => {
                  const num = nearestWholeMultiple(Number(width) - 64)
                  setWidth(num)
                }}
                onPlusClick={() => {
                  const num = nearestWholeMultiple(Number(width) + 64)
                  setWidth(num)
                }}
                onBlur={() => {
                  setWidth(nearestWholeMultiple(width))
                }}
                value={width}
                width="100%"
              />
            </div>
            <div style={{ paddingBottom: '8px' }}>
              Height:
              <NumberInput
                min={64}
                max={2048}
                onInputChange={(e) => {
                  setHeight(e.target.value)
                }}
                onMinusClick={() => {
                  const num = nearestWholeMultiple(Number(height) - 64)
                  setHeight(num)
                }}
                onPlusClick={() => {
                  const num = nearestWholeMultiple(Number(height) + 64)
                  setHeight(num)
                }}
                onBlur={() => {
                  setHeight(nearestWholeMultiple(height))
                }}
                value={height}
                width="100%"
              />
            </div>
            <FlexRow gap={8} style={{ justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  deleteValue(idx)
                  setEditMode(false)
                }}
                theme="secondary"
              >
                <IconTrash stroke={1.5} />
              </Button>
              <Button
                onClick={() => {
                  saveValues()
                  setEditMode(false)
                }}
              >
                <IconCheck stroke={1.5} />
              </Button>
            </FlexRow>
          </>
        )}

        {!editMode &&
          customValues.length > 0 &&
          customValues.map((arr, i) => {
            return (
              <div className={styles.CustomDimension} key={'dimension_' + i}>
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <FlexRow gap={4}>
                    <div
                      onClick={() => {
                        setInput({
                          height: arr[2],
                          width: arr[1],
                          orientationType: 'custom'
                        })
                        handleClose()
                      }}
                      style={{ color: 'var(--main-color)', cursor: 'pointer' }}
                    >
                      <IconPlayerPlay stroke={1.5} />
                    </div>
                    {arr[0]}
                  </FlexRow>
                  <div
                    className={styles.EditIcon}
                    onClick={() => {
                      setIdx(i)
                      setName(arr[0])
                      setWidth(arr[1])
                      setHeight(arr[2])
                      setEditMode(true)
                    }}
                  >
                    <IconEdit stroke={1.5} />
                  </div>
                </FlexRow>
                <FlexRow style={{ fontSize: '12px', paddingLeft: '2px' }}>
                  {arr[1]} w x {arr[2]} h
                </FlexRow>
              </div>
            )
          })}

        {!editMode && customValues.length > 0 && (
          <div>
            <div
              onClick={() => {
                setIdx(customValues.length)
                setName('')
                setWidth(512)
                setHeight(512)
                setEditMode(true)
              }}
              style={{ color: 'var(--main-color)', cursor: 'pointer' }}
            >
              Create a new dimension?
            </div>
          </div>
        )}

        {!editMode && customValues.length === 0 && (
          <>
            <div>You have no custom dimensions set.</div>
            <div
              onClick={() => {
                setIdx(0)
                setName('')
                setWidth(512)
                setHeight(512)
                setEditMode(true)
              }}
              style={{ color: 'var(--main-color)', cursor: 'pointer' }}
            >
              Create a new dimension?
            </div>
          </>
        )}
      </div>
    </DropdownOptions>
  )
}
