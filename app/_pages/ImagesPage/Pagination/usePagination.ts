import { useMemo } from 'react'

interface PaginationProps {
  totalCount: number
  pageSize: number
  siblingCount: number
  currentPage: number
}

export const DOTS: number = -1 // Use a number to represent DOTS

const range = (start: number, end: number): number[] => {
  let length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage
}: PaginationProps): number[] => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize)
    const totalPageNumbers = siblingCount + 5

    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    )

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2

    const firstPageIndex = 1
    const lastPageIndex = totalPageCount

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount
      let leftRange = range(1, leftItemCount)

      return [...leftRange, DOTS, lastPageIndex]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      )
      return [firstPageIndex, DOTS, ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }

    // This is a fallback, return an empty array if none of the conditions match
    return []
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

export default usePagination
