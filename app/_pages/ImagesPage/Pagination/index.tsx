import React from 'react'
import { usePagination, DOTS } from './usePagination'
import clsx from 'clsx'
import styles from './pagination.module.css'

interface PaginationProps {
  onPageChange: (page: number) => void
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
}

const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  })

  console.log(`currentPage`, currentPage)

  // If there are less than 2 times in pagination range, we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null
  }

  let lastPage = paginationRange[paginationRange.length - 1]

  const onNext = () => {
    if (currentPage >= lastPage) return
    onPageChange(currentPage + 1)
  }

  const onPrevious = () => {
    if (currentPage <= 1) return
    onPageChange(currentPage - 1)
  }

  return (
    <ul
      className={styles.PaginationWrapper}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        justifyContent: 'center'
      }}
    >
      {/* Left navigation arrow */}
      <li
        className={clsx(
          styles.PaginationPageButton,
          currentPage === 1 && styles.DisabledButton
        )}
        onClick={onPrevious}
      >
        {'< previous'}
      </li>
      <div className={styles.PageNumberWrapper}>
        {paginationRange.map((pageNumber, i) => {
          if (pageNumber === DOTS) {
            return (
              <li
                key={`pagination_dots_${i}`}
                className={styles.DisabledButton}
              >
                &#8230;
              </li>
            )
          }

          return (
            <li
              key={`pagination_${i}`}
              className={clsx(
                currentPage === pageNumber && styles.DisabledButton
              )}
              onClick={() => {
                if (currentPage === pageNumber) return
                onPageChange(pageNumber)
              }}
              style={{
                cursor: 'pointer'
              }}
            >
              {pageNumber}
            </li>
          )
        })}
      </div>

      <li
        className={clsx(
          styles.PaginationPageButton,
          currentPage === lastPage && styles.DisabledButton
        )}
        onClick={onNext}
      >
        {'next >'}
      </li>
    </ul>
  )
}

export default Pagination
