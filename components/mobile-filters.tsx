'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Filter } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']
const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: 'Over $500', min: 500, max: Infinity },
]

interface MobileFiltersProps {
  category: string
  setCategory: (category: string) => void
  priceRange: string
  setPriceRange: (range: string) => void
  inStockOnly: boolean
  setInStockOnly: (value: boolean) => void
}

export function MobileFilters({
  category,
  setCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    setOpen(false)
  }

  const handleReset = () => {
    setCategory('all')
    setPriceRange('all')
    setInStockOnly(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Filter className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-80 md:w-96 overflow-y-auto pl-4">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Filters
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  checked={category === 'all'}
                  onCheckedChange={() => setCategory('all')}
                />
                <span className="text-base">All Categories</span>
              </label>
              {CATEGORIES.map(cat => (
                <label 
                  key={cat} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={category === cat.toLowerCase()}
                    onCheckedChange={() => setCategory(cat.toLowerCase())}
                  />
                  <span className="text-base">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Price Range</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  checked={priceRange === 'all'}
                  onCheckedChange={() => setPriceRange('all')}
                />
                <span className="text-base">All Prices</span>
              </label>
              {PRICE_RANGES.map(range => (
                <label 
                  key={range.label} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={priceRange === range.label.toLowerCase()}
                    onCheckedChange={() => setPriceRange(range.label.toLowerCase())}
                  />
                  <span className="text-base">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Availability</h3>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
              />
              <span className="text-base">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button 
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}