"use client";
import React from 'react';
import { books } from '../../data/books';
import { motion } from 'framer-motion';

export default function BooksPage(){
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-2xl font-semibold mb-2">Book Lounge</div>
      <div className="grid gap-3">
        <motion.a href="/books/google" whileHover={{ scale: 1.01 }} className="card p-4 block">
          <div className="font-semibold">Search Google Books</div>
          <div className="text-sub text-sm">Preview public/free texts where available</div>
        </motion.a>
        {books.map(b => (
          <motion.a key={b.id} href={`/books/${b.id}`} whileHover={{ scale: 1.01 }} className="card p-4 block">
            <div className="font-semibold">{b.title}</div>
            <div className="text-sub text-sm">{b.author}</div>
            <div className="text-sub text-sm mt-1">{b.tagline}</div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
