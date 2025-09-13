"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AlignmentTest() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Alignment Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-left-force ltr-force">
          <CardHeader>
            <CardTitle className="text-left">Left Aligned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-left">This content should be aligned to the left side of the card.</p>
            <ul className="list-disc list-inside mt-2">
              <li>First item</li>
              <li>Second item</li>
              <li>Third item</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="text-center-force">
          <CardHeader>
            <CardTitle className="text-center">Center Aligned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">This content should be centered in the card.</p>
            <div className="mt-2">
              <div>Centered content</div>
              <div>More centered text</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-right-force">
          <CardHeader>
            <CardTitle className="text-right">Right Aligned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-right">This content should be aligned to the right side of the card.</p>
            <div className="mt-2 text-right">
              <div>Right aligned content</div>
              <div>More right aligned text</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Default Alignment Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This paragraph should use the default left alignment without any specific alignment classes.</p>
            <div className="mt-4">
              <h3 className="font-bold mb-2">Navigation items test:</h3>
              <nav className="flex space-x-4">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
                <span>Dashboard</span>
              </nav>
            </div>
            <div className="mt-4">
              <h3 className="font-bold mb-2">Form elements test:</h3>
              <form className="space-y-2">
                <label className="block">
                  Name: <input type="text" className="border border-gray-300 px-2 py-1 rounded" />
                </label>
                <label className="block">
                  Email: <input type="email" className="border border-gray-300 px-2 py-1 rounded" />
                </label>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Submit
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
