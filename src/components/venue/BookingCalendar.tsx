/**
 * BookingCalendar Component
 * Monthly calendar view with booked/tentative events
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/mocks/venue-data'

interface BookingCalendarProps {
  events: CalendarEvent[]
}

export function BookingCalendar({ events }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)) // December 2024

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventForDate = (day: number): CalendarEvent | undefined => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.find((event) => event.date === dateStr)
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{formatMonthYear(currentDate)}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }).map((_, index) => {
            const day = index - firstDay + 1
            const isValidDay = day > 0 && day <= daysInMonth
            const event = isValidDay ? getEventForDate(day) : undefined
            const dayIsToday = isValidDay && isToday(day)

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[80px] rounded-lg border p-2 transition-colors',
                  isValidDay ? 'bg-background hover:bg-muted/50' : 'bg-transparent border-transparent',
                  dayIsToday && 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
                  event && 'bg-purple-50 dark:bg-purple-950/20'
                )}
              >
                {isValidDay && (
                  <>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        dayIsToday && 'text-purple-600 dark:text-purple-400'
                      )}
                    >
                      {day}
                    </span>
                    {event && (
                      <div className="mt-1">
                        <Badge
                          className={cn(
                            'mb-1 w-full justify-center text-[10px]',
                            event.status === 'booked' && 'bg-green-500 hover:bg-green-600',
                            event.status === 'tentative' && 'bg-yellow-500 hover:bg-yellow-600'
                          )}
                        >
                          {event.status}
                        </Badge>
                        <p className="truncate text-xs text-muted-foreground">
                          {event.artistName}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

