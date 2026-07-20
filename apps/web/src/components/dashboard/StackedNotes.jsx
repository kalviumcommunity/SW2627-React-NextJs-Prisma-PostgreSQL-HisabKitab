"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <div className="relative w-full h-[100px] flex items-center justify-center ">
      <AnimatePresence>
        {cards.map((note, index) => {
          const isTop = index === 0;
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 15,
                opacity: 1 - index * 0.15,
                zIndex: cards.length - index,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 0.8,
              }}
              drag={isTop}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={isTop ? handleDragEnd : undefined}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              className={`absolute w-[95%] sm:w-full rounded-3xl p-5 shadow-xl cursor-grab flex items-start gap-4 border border-white/40 ${note.bgColor}`}
            >
              <div className={`w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full ${note.color} shadow-sm`}></div>
              <div className="flex-1 pointer-events-none">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-base font-bold text-gray-900">{note.title}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{note.time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{note.body}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
