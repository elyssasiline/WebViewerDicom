import { Table, TableHeader, TableColumn, TableCell, Button, TableBody, TableRow } from "@heroui/react"
import { TaskDetails } from "./TaskDetails"
import tasks from "./data/tasks"
import { useState } from "react"
export const App = () => {
    const [selectetTask, setSelectedTask] = useState(null)
    return <div className="h-screen flex flex-col w-screen p-10 bg-gradient-to-br from-zinc-50 to-zinc-100">
        <h1 className="pb-4
         text-2xl text-center font-bold text-zinc-800 tracking-wider">Tasks</h1>
         <TaskDetails isOpen={selectetTask != null} onClose={()=>{setSelectedTask(null)}} taskData={selectetTask} />
        <Table   aria-label="List of pending observations">
            <TableHeader>
                <TableColumn>WORKFLOW</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No task to show."} >
                {tasks.map((task, i) => {
                    return <TableRow key={i}>
                        <TableCell className="dark:text-zinc-200">{task["$created_on"]}</TableCell>
                        <TableCell className="dark:text-zinc-200">{task["date"]}</TableCell>
                        <TableCell className="dark:text-zinc-200">{task["email"]}</TableCell>
                        <TableCell className="dark:text-zinc-200 flex gap-2 ">
                            <Button onPress={() => setSelectedTask(task)} className="tracking-wider " variant="flat" color="primary" size="md">Manage</Button>
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    </div>
}