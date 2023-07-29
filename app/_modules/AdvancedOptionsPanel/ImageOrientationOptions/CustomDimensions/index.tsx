import { IconCheck, IconEdit, IconTrash } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import NumberInput from 'app/_components/NumberInput'
import DropdownOptions from 'app/_modules/DropdownOptions'
import { Button } from 'components/UI/Button'
import Input from 'components/UI/Input'
import { useEffect, useState } from 'react'
import styles from './component.module.css'

interface Props {
  handleClose: () => any
}

export default function CustomDimensions({ handleClose }: Props) {
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {}, [])

  return (
    <DropdownOptions
      handleClose={handleClose}
      title="Custom dimensions"
      top="46px"
    >
      {editMode && (
        <>
          <div>
            Name:
            <Input onChange={() => {}} value="" />
          </div>
          <div>
            Width:
            <NumberInput
              min={64}
              max={2048}
              onInputChange={(e) => {}}
              onMinusClick={() => {}}
              onPlusClick={() => {}}
              value={0}
              width="100%"
            />
          </div>
          <div>
            Height:
            <NumberInput
              min={64}
              max={2048}
              onInputChange={(e) => {}}
              onMinusClick={() => {}}
              onPlusClick={() => {}}
              value={0}
              width="100%"
            />
          </div>
          <FlexRow gap={8} style={{ justifyContent: 'flex-end' }}>
            <Button>
              <IconTrash />
            </Button>
            <Button>
              <IconCheck />
            </Button>
          </FlexRow>
        </>
      )}

      {!editMode && (
        <>
          <div className={styles.CustomDimension}>
            <FlexRow style={{ justifyContent: 'space-between' }}>
              Test
              <div
                className={styles.EditIcon}
                onClick={() => setEditMode(true)}
              >
                <IconEdit stroke={1.5} />
              </div>
            </FlexRow>
            <FlexRow style={{ fontSize: '12px', paddingLeft: '2px' }}>
              512 w x 512 h
            </FlexRow>
          </div>
          <div className={styles.CustomDimension}>Test</div>
          <div className={styles.CustomDimension}>Test</div>
          <div className={styles.CustomDimension}>Test</div>
        </>
      )}
    </DropdownOptions>
  )
}
