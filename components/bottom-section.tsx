'use client'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Plus, FileText } from 'lucide-react'
import Image from "next/image"
import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export function BottomSection() {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])
  console.log('droppedFiles', droppedFiles)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setDroppedFiles(files)
    console.log('Dropped files:', files)
    // You can add your file handling logic here
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDroppedFiles(files);
    console.log('Selected files:', files);
    // You can add your file handling logic here
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">To-Do List</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="link" className="text-[#0357f8]">
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </motion.div>
        </div>

        <div className="space-y-4">
          {["To do list here", "To do list here", "To do list here", "To do list here"].map((todo, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <Checkbox id={`todo-${i}`} />
              <label htmlFor={`todo-${i}`} className={i === 2 ? "line-through text-gray-400" : ""}>
                {todo}
              </label>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-center text-[#667287]">
            You haven&apos;t contacted [Lead Name] in 7 days.
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="link" className="text-[#0357f8] block mx-auto">
                Follow up now?
              </Button>
            </motion.div>
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Integration</h2>
        <div className="space-y-4">
          {[
            { name: "Salesforce", logo: "/logo.png" },
            { name: "HubSpot", logo: "/logo.png" },
            { name: "Google Calendar", logo: "/logo.png" },
            { name: "Outlook", logo: "/logo.png" },
            { name: "Zillow", logo: "/logo.png" },
          ].map((integration, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.3 }}
              className="flex items-center justify-between"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={integration.logo}
                  alt={integration.name}
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span>{integration.name}</span>
              </div>
              <Switch />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Script Management</h2>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center transition-colors cursor-pointer"
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <FileText className="w-12 h-12 text-gray-300 mb-2" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-sm text-gray-500"
          >
            Drag and drop your script files here or click to upload
          </motion.p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <Button className="w-full mt-4 bg-[#171b1a] text-white hover:bg-[#171b1a]/90">
            Test Script
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
