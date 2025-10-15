import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T> {
  // Support top-level keys and nested path strings like "department.code"
  field: keyof T | string | null
  direction: SortDirection
}

export function useSortableData<T extends Record<string, any>>(
  items: T[],
  initialSortField: keyof T | string | null = null,
  initialDirection: SortDirection = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    field: initialSortField,
    direction: initialDirection,
  })

  const sortedItems = useMemo(() => {
    if (!sortConfig.field) return items

    const getValueByPath = (obj: any, field: keyof T | string | null): unknown => {
      if (!field) return undefined
      if (typeof field === 'string' && field.includes('.')) {
        return field.split('.').reduce((acc: any, key) => (acc == null ? undefined : acc[key]), obj)
      }
      return obj[field as keyof T]
    }

    const sorted = [...items].sort((a, b) => {
      // Resolve nested values when needed and cast to string | number for safe sorting
      const aRaw = getValueByPath(a, sortConfig.field)
      const bRaw = getValueByPath(b, sortConfig.field)

      let aValue: string | number = (aRaw as any) ?? ''
      let bValue: string | number = (bRaw as any) ?? ''

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      const aNumber = Number(aValue)
      const bNumber = Number(bValue)
      return sortConfig.direction === 'asc' ? aNumber - bNumber : bNumber - aNumber
    })

    return sorted
  }, [items, sortConfig])

  const requestSort = (field: keyof T | string) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  return { sortedItems, requestSort, sortConfig }
}
