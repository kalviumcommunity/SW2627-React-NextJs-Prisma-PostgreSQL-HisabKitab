"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { deletePersonalNote } from "@/app/(dashboard)/dashboard/actions";
import { useRouter } from "next/navigation";

const fallbackNotes = [
  {
    id: 1,
    title: "Buy groceries",
    time: "2h ago",
    body: "Milk, eggs, bread, and some fresh vegetables for the week. Need to visit farmer's market.",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Trip to Paris",
    time: "Yesterday",
    body: "Book flight tickets and check for hotel reservations near Eiffel Tower. Budget max $2000.",
    color: "bg-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    id: 3,
    title: "Client Meeting",
    time: "2 days ago",
    body: "Discuss the new design mockups for the landing page. Prepare the Figma links.",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    id: 4,
    title: "Dentist Appt",
    time: "Last week",
    body: "Routine checkup and cleaning at 10 AM on Friday.",
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
  }
];

export default function StackedNotes({ notes = [] }) {
  const displayNotes = notes.length > 0 ? notes : fallbackNotes;
  const [cards, setCards] = useState(displayNotes);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (notes.length > 0) {
      setCards(notes);
    }
  }, [notes]);

  const handleDragEnd = (event, info) => {
    // If swiped far enough
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
      setCards((prev) => {
        const newCards = [...prev];
        const swipedCard = newCards.shift();
        newCards.push(swipedCard);
        return newCards;
      });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    // If it's a fallback note, just remove it from UI
    if (notes.length === 0) {
      setCards(prev => prev.filter(c => c.id !== id));
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deletePersonalNote(id);
      if (res.success) {
        setCards(prev => prev.filter(c => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative w-full h-[130px]">
      <AnimatePresence>
        {cards.map((note, index) => {
          const isTop = index === 0;
          // Top card tilts left, background cards shift right so right edges peek out
          const offsets = [
            { x: 0, y: 0, rotate: 0 },
            { x: 12, y: 2, rotate: -1 },
            { x: 22, y: 4, rotate: 2 },
            { x: 30, y: 6, rotate: 5 },
          ];
          const offset = offsets[index] || { x: index * 10, y: index * 2, rotate: index * 2 };

          return (
            <motion.div
              key={note.id}
              layout
              initial={{ scale: 0.95, x: 0, opacity: 0 }}
              animate={{
                scale: 1,
                x: offset.x,
                y: offset.y,
                rotate: offset.rotate,
                opacity: isTop ? 1 : 0.85,
                zIndex: cards.length - index,
              }}
              exit={{ opacity: 0, x: 250, rotate: 20, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                mass: 0.8,
              }}
              drag={isTop}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={isTop ? handleDragEnd : undefined}
              whileDrag={{ scale: 1.05, rotate: 0, cursor: "grabbing" }}
              className={`absolute left-0 top-0 w-[92%] h-[100px] rounded-2xl shadow-lg cursor-grab border border-gray-200/80 overflow-hidden ${note.bgColor}`}
              style={{ transformOrigin: "center center" }}
            >
              {isTop ? (
                <div className="flex items-start gap-4 p-5 relative">
                  <div className={`w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full ${note.color} shadow-sm`}></div>
                  <div className="flex-1 pointer-events-none pr-6">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-base font-bold text-gray-900">{note.title}</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{note.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 break-words">{note.body}</p>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors z-50 cursor-pointer"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  </button>
                </div>
              ) : (
                <div className="p-5 invisible">
                  <div className="h-4"></div>
                  <div className="h-4 mt-1"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
