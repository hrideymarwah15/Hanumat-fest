'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([
     { id: 1, name: 'IIT Delhi' },
     { id: 2, name: 'DTU' },
     { id: 3, name: 'NSUT' },
  ])
  const [newCollege, setNewCollege] = useState('')

  const handleAdd = () => {
     if (!newCollege.trim()) return
     const newItem = { id: Date.now(), name: newCollege }
     setColleges([...colleges, newItem])
     setNewCollege('')
     toast.success('College added')
  }

  const handleDelete = (id: number) => {
     setColleges(colleges.filter(c => c.id !== id))
     toast.success('College removed')
  }

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">Manage Colleges</h1>
         <p className="text-muted-foreground">Add or remove colleges available in registration.</p>
       </div>

       <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
             <CardHeader>
                 <CardTitle>Colleges List</CardTitle>
             </CardHeader>
             <CardContent>
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Name</TableHead>
                         <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {colleges.map((college) => (
                         <TableRow key={college.id}>
                            <TableCell>{college.name}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="sm" onClick={() => handleDelete(college.id)} className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </CardContent>
          </Card>

          <Card className="h-fit">
             <CardHeader>
                <CardTitle>Add College</CardTitle>
                <CardDescription>Enter college name to add to the list.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <Input 
                   placeholder="e.g. IIT Bombay" 
                   value={newCollege} 
                   onChange={(e) => setNewCollege(e.target.value)} 
                />
                <Button onClick={handleAdd} className="w-full">
                   <Plus className="mr-2 h-4 w-4" /> Add College
                </Button>
             </CardContent>
          </Card>
       </div>
    </div>
  )
}
