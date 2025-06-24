
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion } from './QuizQuestion';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuizOption[];
}

interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

interface QuizProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    questions: Question[];
  };
  onComplete: (score: number, answers: QuizAnswer[]) => void;
}

export const Quiz: React.FC<QuizProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const score = answers.filter(answer => answer.isCorrect).length;

  const handleAnswer = (questionId: string, selectedOptionId: string, isCorrect: boolean) => {
    const newAnswer: QuizAnswer = { questionId, selectedOptionId, isCorrect };
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? newAnswer : a);
      }
      return [...prev, newAnswer];
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      setShowResults(true);
      onComplete(score, answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const canProceed = currentAnswer !== undefined;

  if (isCompleted && showResults) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {score}/{quiz.questions.length}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Score: {Math.round((score / quiz.questions.length) * 100)}%
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Answers</h3>
            {quiz.questions.map((question, index) => {
              const answer = answers.find(a => a.questionId === question.id);
              return (
                <QuizQuestion
                  key={question.id}
                  question={question}
                  onAnswer={() => {}}
                  showResult={true}
                  selectedAnswer={answer?.selectedOptionId}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      <QuizQuestion
        question={currentQuestion}
        onAnswer={handleAnswer}
        selectedAnswer={currentAnswer?.selectedOptionId}
      />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Complete Quiz' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
