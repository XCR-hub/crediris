import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
  delay?: number;
}

export function TestimonialCard({
  name,
  role,
  content,
  image,
  rating,
  delay = 0
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={image}
          alt={name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>

      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-600">{content}</p>
    </motion.div>
  );
}