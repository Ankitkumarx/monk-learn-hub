
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionProps {
  question: {
    id: string;
    text: string;
    options: QuizOption[];
  };
  onAnswer: (questionId: string, selectedOptionId: string, isCorrect: boolean) => void;
  showResult?: boolean;
  selectedAnswer?: string;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  onAnswer, 
  showResult = false,
  selectedAnswer 
}) => {
  const [selected, setSelected] = useState<string | null>(selectedAnswer || null);

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    
    setSelected(optionId);
    const option = question.options.find(opt => opt.id === optionId);
    if (option) {
      onAnswer(question.id, optionId, option.isCorrect);
    }
  };

  const getOptionStyle = (option: QuizOption) => {
    if (!showResult) {
      return selected === option.id 
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
    }
    
    if (option.isCorrect) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    if (selected === option.id && !option.isCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    
    return "border-gray-200 dark:border-gray-700";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyle(option)}`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option.text}</span>
                {showResult && (
                  <div className="flex space-x-2">
                    {option.isCorrect && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Correct
                      </Badge>
                    )}
                    {selected === option.id && !option.isCorrect && (
                      <Badge variant="destructive">Selected</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
