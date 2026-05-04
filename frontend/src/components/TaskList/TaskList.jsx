import { useState, useEffect } from "react";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from "../../services/tasksServices.js"
import { db, auth } from "../../firebase.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { TaskItem } from "../TaskItem/TaskItem.jsx";
import { TaskForm } from "../TaskForm/TaskForm.jsx";
import './TaskList.css'

export function TaskList(){
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState("all");

    const filteredTasks = tasks.filter(task => {
        switch (filter) {
            case "completed":
                return task.completed == 1;
            case "pending":
                return task.completed == 0;
            default:
                return true;
        }
    });

    useEffect(() => {
        // Escuchamos cuando el usuario "vuelve" después de recargar la página
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                cargarTareas();
            } else {
                setTasks([]);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const cargarTareas = async () => {
        try {
            const data = await getTasks();
            console.log("Tareas que pasaron el filtro:", data);
            setTasks(data);
        } catch (error) {
            console.error("Error al cargar:", error);
        }
    };

    const handleSubmit = async (task) => {
        try{
            if (editingTask) {
                await updateTask(editingTask.id, task);
                setEditingTask(null);
            } else { 
                await createTask(task);
            }
            setTimeout(() => {
                cargarTareas();
            }, 200);
        } catch (error) {
            console.error("Error al guardar: ", error)
        }
        
       
    }

    const handleEdit = (task) => {
        setEditingTask(task);
    };

    const handleDelete = async (id) => {
        await deleteTask(id);
        setTasks(prev => prev.filter(t => t.id !== id)); 
    };

    const handleToggle = async (task) => {
    await updateTask(task.id, {
        title: task.title,
        description: task.description,
        completed: task.completed ? 0 : 1
    });

    await cargarTareas();
};
    return (
            <div className="tasklist-card">
                <header className="tasklist-header">
                    <TaskForm 
                        onSubmit={handleSubmit} 
                        editingTask={editingTask}
                    />
                </header>
                <div className="tasklist-mytasks">
                    <h2 className="tasklist-title">Mis Tareas</h2>
                    <nav className="tasklist-filters-container">
                        <button 
                            className={filter === "all" ? "btn-primary active" : "btn-secondary"}
                            onClick={() => setFilter("all")}
                        >
                            Todas
                        </button>
                        <button 
                            className={filter === "pending" ? "btn-primary active" : "btn-secondary"}
                            onClick={() => setFilter("pending")}
                        >
                            Pendientes
                        </button>
                        <button 
                            className={filter === "completed" ? "btn-primary active" : "btn-secondary"}
                            onClick={() => setFilter("completed")}
                        >
                            Completadas
                        </button>
                    </nav>

                    <main className="tasks-list-container">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(t => (
                                <TaskItem 
                                    key={t.id}
                                    task={t}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    onToggle={handleToggle}
                                />
                            ))
                        ) : (
                            <p className="empty-message">No hay tareas para mostrar</p>
                        )}
                    </main>
                </div>   
            </div>
    );
}